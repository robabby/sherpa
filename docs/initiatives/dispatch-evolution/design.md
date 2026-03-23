---
designed: 2026-03-19
type: both
components-new: 4
components-modified: 4
files-planned: 14
---

# Dispatch Evolution — Design

Evolve the dispatch page from three-panel/four-step to two-panel/two-step. Add a Settings page for backend configuration. Replace mode selector with autonomy levels.

## Architecture

### Data Models

**New type: `AutonomyLevel`** (replaces `DispatchMode`)

```typescript
// packages/studio-core/src/dispatch.ts
export type AutonomyLevel = 'supervised' | 'autonomous'

// Replaces:
// export type DispatchMode = 'interactive' | 'supervised' | 'overnight'
```

The `DispatchConfig.overnight` field becomes `DispatchConfig.autonomous`:

```typescript
export interface DispatchConfig {
  routes: Partial<Record<TaskType, BackendRoute>>
  fallback: BackendRoute
  offlineFallback: BackendRoute
  autonomous: {            // was: overnight
    blocked: TaskType[]
  }
}
```

**New type: `SherpaSettings`** — persisted project settings

```typescript
// packages/studio-core/src/settings.ts
export interface SherpaSettings {
  activeBackend: 'openclaw' | 'claude'
}

export const DEFAULT_SETTINGS: SherpaSettings = {
  activeBackend: 'openclaw'
}
```

### Settings Persistence

**Decision: `.sherpa/settings.json` in project root.**

Why not `sherpa.config.ts`: config is static, checked into git, defines structure. Settings are runtime state that changes per-environment (your local machine has `claude`, the VPS has `openclaw`). Different concerns, different files.

Why not localStorage: the dispatch API route runs server-side. It needs the active backend without a client roundtrip.

Why not a database: overkill for one field. A JSON file is readable, editable, git-ignorable.

```json
// .sherpa/settings.json
{
  "activeBackend": "openclaw"
}
```

Read/write functions:

```typescript
// packages/studio-core/src/settings.ts
export function getSettings(projectRoot: string): SherpaSettings
export function updateSettings(projectRoot: string, patch: Partial<SherpaSettings>): SherpaSettings
```

### Component Tree

```
DispatchContent (dispatch-content.tsx — rewrite)
├── Toolbar
│   ├── AutonomySelector          // segmented control: supervised | autonomous
│   └── Stats                     // active count, failed count, completed today
├── GuardRailBanner               // reworded for autonomous mode
├── TwoPanelGrid (grid-cols-12)
│   ├── BacklogPanel (col-span-5) // task groups with checkboxes
│   │   └── DispatchBar           // appears when tasks selected (sticky bottom)
│   │       ├── TaskCountBadge
│   │       ├── AgentDropdown     // defaults to "no role", optional selection
│   │       └── DispatchButton    // enabled immediately (no agent required)
│   └── AssignmentsPanel (col-span-7)
│       ├── ActiveSection         // dispatched tasks with richer cards
│       ├── FailedSection         // failed tasks with reset
│       └── CompletedTodaySection // completed in last 24h

SettingsContent (settings-content.tsx — new)
├── ActiveBackendSection
│   ├── BackendToggle             // openclaw ←→ claude radio/toggle
│   └── ActiveIndicator           // shows which is active + health dot
└── BackendHealthSection
    ├── BackendHealthCard (openclaw)
    │   ├── ConnectionStatus
    │   ├── AvailableModels
    │   └── LastChecked
    └── BackendHealthCard (claude)
        ├── ConnectionStatus
        ├── AvailableModels
        └── LastChecked
```

### Data Flow

**Dispatch page load:**
```
page.tsx (server component)
  ├── getTaskBoard(projectRoot)        // reads docs/tasks/*.md
  ├── getAgentRoles()                  // reads docs/agents/roles/
  ├── getSettings(projectRoot)         // reads .sherpa/settings.json
  └── getBackendHealth(projectRoot)    // only for active backend (not all 9)
        ↓
  DispatchContent receives: tasks, roles, activeBackend, backendHealth
```

**Settings page load:**
```
settings/page.tsx (server component)
  ├── getSettings(projectRoot)
  └── getBackendHealth(projectRoot)    // health for openclaw + claude only
        ↓
  SettingsContent receives: settings, health
```

**Dispatch action:**
```
User selects tasks → DispatchBar appears
User picks agent from dropdown → Dispatch button enables
User clicks Dispatch
  → POST /api/dispatch/run { taskId, autonomyLevel, agent }
  → API reads activeBackend from .sherpa/settings.json
  → Spawns worker with that backend
```

**Settings change:**
```
User clicks backend toggle on Settings page
  → POST /api/settings { activeBackend: 'claude' }
  → Writes .sherpa/settings.json
  → Returns updated settings
  → UI refreshes health check for new active backend
```

### Integration Points

| Existing code | Change |
|---------------|--------|
| `dispatch.ts` `DispatchMode` type | Replaced by `AutonomyLevel` |
| `dispatch.ts` `isTaskTypeAllowed()` | Parameter changes from `mode` to `autonomyLevel` |
| `dispatch.ts` `resolveRoute()` | `_mode` parameter removed (backend comes from settings, not dispatch-time choice) |
| `dispatch.ts` `matchTasksToAgents()` | `mode` → `autonomyLevel` |
| `dispatch.ts` `getBackendHealth()` | Add optional filter param to check only specific backends |
| `dispatch-meta.ts` | Unchanged — full backend registry stays (settings page may expand later) |
| `api/dispatch/run/route.ts` | Reads `activeBackend` from settings instead of request body |
| `api/dispatch/reset/route.ts` | Unchanged |
| `dispatch/page.tsx` | Loads settings, passes to DispatchContent, drops `initialMode` |
| `studio-sidebar.tsx` | Adds Settings entry to System group |

## UI Design

### Dispatch Page Layout

**Two-panel grid** — backlog gets more space (5 cols vs current 3), assignments expand (7 cols vs current 5).

**Toolbar** — simplified to two zones:
- Left: `AutonomySelector` segmented control (two options, not three)
- Right: stats counters (same as now minus the pipeline visualization)

**Backlog panel** — structurally identical to current. The key change is the `DispatchBar` that appears at the bottom when tasks are selected.

**Assignments panel** — same three sections. Cards gain width for:
- Backend + model badges (already there, more room)
- Token count + cost (new, when available from AI Gateway)
- Elapsed time (already there)

### Dispatch Bar

Sticky to the bottom of the backlog panel. Always visible — the Dispatch button disables when no tasks are selected. No show/hide animation.

**Layout:** horizontal bar with three elements:
```
[ 3 tasks selected  ·  code-impl  research ]  [ Agent ▾ ]  [ Dispatch 3 ]
```

- **Left:** task count + task-type badges (colored, same style as current)
- **Center:** agent dropdown — `<Select>` from shadcn. Defaults to "Default (no role)" — tasks dispatch without behavioral constraints. Optionally select an agent to apply a behavioral role overlay. When an agent is selected, shows agent name + primary task-type badge.
- **Right:** dispatch button. Copper accent, enabled immediately on task selection (no agent required). Shows "Backend offline" warning state if active backend is down.

### Autonomy Selector

Same visual pattern as current `ModeSelector` — segmented control with radio dots:

```
[ · supervised ]  [ · autonomous ]
```

When "autonomous" is active, copper highlight. Guard rail banner appears below toolbar:

```
Autonomous mode: code-implementation and architect tasks require supervised mode
```

Same rose-500 styling as current overnight banner, same behavior (dims and blocks selection of those task types).

### Settings Page

Single-column layout, max-width container, consistent with other Studio pages.

**Active Backend** section:
- Two large radio cards side by side (openclaw, claude)
- Active card has copper border + filled radio dot
- Each card shows: name, health dot (green/red), status text
- Clicking switches immediately (optimistic UI + API call)

**Backend Health** section:
- Card per backend with: connection status line, model list (if available), last health check timestamp
- "Check Health" button per card — triggers re-probe, shows spinner during check

### Settings Sidebar Entry

Added to the System group in `studio-sidebar.tsx`:

```typescript
{
  title: "System",
  items: [
    { label: "Workforce", href: "/workforce", icon: Users },
    { label: "Sessions", href: "/sessions", icon: Clock },
    { label: "MCP", href: "/mcp", icon: Plug },
    { label: "Settings", href: "/settings", icon: Settings },  // new
  ],
}
```

Uses `Settings` icon from lucide-react (gear icon).

## File Plan

### New Files

| File | Purpose |
|------|---------|
| `packages/studio-core/src/settings.ts` | `getSettings()`, `updateSettings()`, `SherpaSettings` type, reads/writes `.sherpa/settings.json` |
| `packages/studio-ui/src/dispatch-bar.tsx` | `DispatchBar` component — agent dropdown, dispatch button, task count display |
| `packages/studio-ui/src/settings-content.tsx` | `SettingsContent` client component — backend toggle, health cards |
| `apps/studio/src/app/(studio)/settings/page.tsx` | Settings page server component — loads settings + health |
| `apps/studio/src/app/(studio)/settings/layout.tsx` | Passthrough layout (matches dispatch pattern) |
| `apps/studio/src/app/(studio)/settings/loading.tsx` | Loading skeleton |
| `apps/studio/src/app/(studio)/api/settings/route.ts` | `POST` handler to update `.sherpa/settings.json` |

### Modified Files

| File | Change |
|------|--------|
| `packages/studio-core/src/dispatch.ts` | `AutonomyLevel` type, update `isTaskTypeAllowed`, `resolveRoute`, `matchTasksToAgents`. Add `getBackendHealth` filter param. |
| `packages/studio-core/src/index.ts` | Export new settings module |
| `packages/studio-ui/src/dispatch-content.tsx` | Rewrite: two-panel layout, remove WorkforcePanel and QueueControls, integrate DispatchBar, replace ModeSelector with AutonomySelector |
| `packages/studio-ui/src/studio-sidebar.tsx` | Add Settings to System nav group |
| `apps/studio/src/app/(studio)/dispatch/page.tsx` | Load settings, pass activeBackend + filtered health to DispatchContent |
| `apps/studio/src/app/(studio)/dispatch/loading.tsx` | Update skeleton for two-panel layout |
| `apps/studio/src/app/(studio)/api/dispatch/run/route.ts` | Read activeBackend from settings instead of request body |

## Decisions

### Backend persistence: `.sherpa/settings.json`

Chosen over `sherpa.config.ts` (static, git-tracked), localStorage (server-inaccessible), and database (overkill). Settings are runtime state that varies per environment. The file is git-ignored.

### Health checks scoped to active backend

Currently `getBackendHealth()` probes all 9 backends on every page load (~45s worst case with timeouts). The dispatch page only needs health for the active backend. The settings page checks health for the two primary backends (openclaw, claude). Full health checking remains available for the Workforce page.

### DispatchBar in backlog panel, not as page footer

The bar belongs to the backlog context — it appears when you select tasks and disappears when you deselect. Placing it as a page-level footer would feel disconnected from the selection. It also avoids z-index conflicts with the sidebar.

### Agent selection is optional, default is "no role"

The agent dropdown defaults to "Default (no role)" — tasks dispatch without behavioral constraints. Well-written tasks should be self-sufficient for any frontier model. Agent roles are an optional behavioral overlay for when you want specific constraints (disposition, fail triggers, quality bar).

An org-level config flag `requireAgentSelection: true` in `sherpa.config.ts` can enforce agent selection for client deployments where behavioral accountability is a governance requirement. Default: `false`.

This means dispatch is a one-click action after task selection — select tasks, click Dispatch. Agent selection is there if you want it, but never blocking.

## Open Questions

1. **Should the dispatch bar show a backend indicator?** A small chip showing "via openclaw" or "via claude" would confirm which backend will be used without requiring the user to visit settings. Leaning yes — it's read-only, not a selector.

2. **Settings page URL structure.** `/settings` is simple. If we anticipate tabs later (backend, routing, agents), we could do `/settings/backend` from the start. Leaning `/settings` — add segments when needed.

3. **Auto-dispatch.** The current UI has a placeholder Auto-Dispatch button. Should it survive in the new design? It's not functional yet and adds clutter. Leaning: drop it from the dispatch bar, add it back when the feature is built.
