---
designed: 2026-03-13
type: both
components-new: 6
components-modified: 2
files-planned: 28
---

# Dispatch Center — Design

Shape: [shape.md](shape.md) | Proposal: [proposal.md](proposal.md)

## Overview

Three deliverables: (1) multi-backend dispatch scripts, (2) task-type routing config, (3) Dispatch Center UI at `/dispatch`. This design covers the architecture, data models, component tree, and integration points for all three.

## Architecture

### Data Models

**New types in `packages/studio-core/src/dispatch.ts`:**

```ts
export type Backend = 'claude' | 'opencode' | 'codex' | 'gemini' | 'lm-studio'
export type DispatchMode = 'interactive' | 'supervised' | 'overnight'
export type TaskType =
  | 'code-implementation' | 'code-review' | 'architect'
  | 'research' | 'content-generation' | 'audit'
  | 'embeddings' | 'general'

export interface BackendRoute {
  backend: Backend
  model?: string
}

export interface DispatchConfig {
  routes: Partial<Record<TaskType, BackendRoute>>
  fallback: BackendRoute
  offlineFallback: BackendRoute
  overnight: { blocked: TaskType[] }
}

export interface BackendHealth {
  backend: Backend
  available: boolean
  models?: string[]
  error?: string
  checkedAt: string
}

export interface WorkforceAgent {
  slug: string
  displayName: string
  category: string
  taskType: TaskType
  eligibleTaskTypes: TaskType[]
  modelTier: string
}

export interface DispatchAssignment {
  taskId: string
  taskTitle: string
  taskType: TaskType
  backend: Backend
  model: string
  mode: DispatchMode
  status: string
  dispatchedAt: string | null
  elapsedMs: number
}

export interface DispatchState {
  backlog: TaskBoardEntry[]      // status: pending
  assignments: DispatchAssignment[] // status: dispatched
  completed: TaskBoardEntry[]    // completed today
  workforce: WorkforceAgent[]
  health: BackendHealth[]
  mode: DispatchMode
}
```

**Task frontmatter additions (to `TaskBoardEntry`):**

```ts
// Extend existing TaskBoardEntry
taskType: TaskType    // resolved from task or role
mode: DispatchMode    // interactive | supervised | overnight
```

**Role frontmatter additions (to `AgentRole`):**

```ts
// Extend existing AgentRole
taskType: TaskType
eligibleTaskTypes: TaskType[]
```

**Config addition (to `SherpaUserConfig`):**

```ts
dispatch?: DispatchConfig
```

### Component Tree

```
apps/studio/src/app/dispatch/
  page.tsx                          ← Server component, calls studio-core
  └── DispatchContent               ← Client component (studio-ui)
        ├── DispatchHeader           ← Mode selector + summary stats
        ├── DispatchPanels           ← Three-panel layout wrapper
        │   ├── BacklogPanel         ← Left: pending tasks grouped by task-type
        │   │   ├── TaskTypeGroup    ← Collapsible group with count badge
        │   │   └── BacklogTask      ← Selectable task row
        │   ├── AssignmentsPanel     ← Center: active dispatches
        │   │   └── AssignmentCard   ← Task + backend + elapsed time
        │   └── WorkforcePanel       ← Right: backends + agents
        │       ├── BackendCard      ← Health dot + models + load
        │       └── AgentCard        ← Role + eligible types + assign button
        └── QueueControls            ← Bottom bar: dispatch/auto-dispatch buttons
```

### Data Flow

**Server component (page.tsx):**

```ts
// Same pattern as /tasks and /workforce pages
const tasks = getTaskBoard()
const roles = getAgentRoles()
const health = getBackendHealth()     // new — shell out to health checks
const config = getResolvedConfig()    // new — read sherpa.config.ts dispatch section

return <DispatchContent tasks={tasks} roles={roles} health={health} config={config} />
```

**Client component state:**
- `mode` — controlled by radio group in header (default: `supervised`)
- `selectedTasks` — set of task IDs selected in backlog panel
- URL search params for persistent filters (task-type, backend)

**Dispatch action:**
- POST to `/api/dispatch/run` with `{ taskIds, mode }`
- API route shells out to `scripts/worker.sh` as detached process
- Returns immediately, UI polls task status on 5s interval

**No WebSockets/SSE.** Assignments panel polls `getTaskBoard()` every 5 seconds via a `setInterval` + `router.refresh()`. Shape says no real-time (rabbit hole #2).

### Integration Points

**studio-core:**
- `tasks.ts` — extend `TaskBoardEntry` with `taskType` and `mode` fields, update `parseFrontmatter`
- `dispatch.ts` — new module: types, `resolveRoute()`, `getBackendHealth()`, `getWorkforce()`, `matchTasksToAgents()`
- `config/types.ts` — add `dispatch?: DispatchConfig` to `SherpaUserConfig` and `SherpaConfig`
- `config/defaults.ts` — add `DEFAULT_DISPATCH` with the routing table from the proposal
- `index.ts` — export new `dispatch` module

**studio-mcp:**
- `server.ts` — expand `task_dispatch` to support all backends, add `backend_status` tool

**studio-ui:**
- New: `dispatch-content.tsx` — the full Dispatch Center client component
- Reuse: `EASE_STANDARD`, `cn()`, badge style maps from existing components

**apps/studio:**
- New page: `src/app/dispatch/page.tsx`
- New API route: `src/app/api/dispatch/run/route.ts`
- Modify: sidebar/nav to add Dispatch link

**Scripts:**
- All new files in `scripts/` and `scripts/backends/`
- `scripts/resolve-route.mjs` — reads config, outputs JSON for shell scripts

## UI Design

### Layout

Three-panel horizontal layout at desktop, stacked vertically on mobile. The center panel (Assignments) is widest — it's the heartbeat.

```
┌─────────────────────────────────────────────────────────────┐
│ [Mode: ○ interactive  ● supervised  ○ overnight]    Stats   │
├───────────┬───────────────────────────┬─────────────────────┤
│  BACKLOG  │      ASSIGNMENTS          │     WORKFORCE       │
│           │                           │                     │
│ ┌───────┐ │ ┌───────────────────────┐ │ ┌─────────────────┐ │
│ │ code  │ │ │ task-name             │ │ │ Claude    [●]   │ │
│ │ review│ │ │ codex · gpt-4.1 · 3m │ │ │ OpenCode  [●]   │ │
│ │  (3)  │ │ └───────────────────────┘ │ │ Codex     [●]   │ │
│ ├───────┤ │ ┌───────────────────────┐ │ │ Gemini    [●]   │ │
│ │researc│ │ │ task-name             │ │ │ LM Studio [○]   │ │
│ │  (5)  │ │ │ opencode · mini · 12m│ │ ├─────────────────┤ │
│ ├───────┤ │ └───────────────────────┘ │ │ Agents          │ │
│ │ audit │ │                           │ │ ┌─────────────┐ │ │
│ │  (2)  │ │                           │ │ │ engineer    │ │ │
│ └───────┘ │                           │ │ │ researcher  │ │ │
│           │                           │ │ └─────────────┘ │ │
├───────────┴───────────────────────────┴─────────────────────┤
│ [Dispatch Selected (3)]  [Auto-Dispatch]     2 active / 5 today │
└─────────────────────────────────────────────────────────────┘
```

Grid: `lg:grid-cols-12` — Backlog gets 3 cols, Assignments gets 5, Workforce gets 4.

### Component Selection

| Component | shadcn/ui base | Notes |
|-----------|---------------|-------|
| Mode selector | RadioGroup | Three options, horizontal |
| Backlog groups | Collapsible (Accordion) | Task-type as trigger, count badge |
| Backlog tasks | Checkbox + label | Selectable rows |
| Assignment cards | Card | Status badge, elapsed timer, backend mono badge |
| Backend health | Custom (dot + label) | Green/red/amber dot, model list |
| Agent cards | Card (compact) | Name, task-type badge, "Assign" dropdown |
| Queue controls | Sticky bottom bar | Buttons + summary text |
| Guard rail banner | Alert (destructive variant) | Shows when overnight blocks selection |

### Interaction Patterns

**Selecting tasks:** Checkbox in backlog. Shift+click for range select. "Select all in group" via group header checkbox.

**Assigning:** Click "Dispatch Selected" → resolves backend from config for each task → dispatches sequentially. Or click "Assign" on an agent card → dropdown shows eligible pending tasks → pick one.

**Mode switching:** Radio group changes the mode. When switching to `overnight`, any selected tasks with blocked task-types get deselected and a guard rail banner appears.

**Polling:** Assignments panel refreshes every 5 seconds. When a task transitions to `completed` or `failed`, it slides from Assignments to the completed counter in the header. Animation via `motion/react` `AnimatePresence`.

**Auto-dispatch:** Runs `matchTasksToAgents()` → shows preview ("Will dispatch 5 tasks to 3 backends") → confirm → sequential dispatch.

## File Plan

### `packages/studio-core/`

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/dispatch.ts` | Types, `resolveRoute()`, `getBackendHealth()`, `getWorkforce()`, `matchTasksToAgents()` |
| Modify | `src/tasks.ts` | Add `taskType` and `mode` to `TaskBoardEntry`, update frontmatter parser |
| Modify | `src/config/types.ts` | Add `dispatch?: DispatchConfig` to user and resolved config |
| Modify | `src/config/defaults.ts` | Add `DEFAULT_DISPATCH` routing table |
| Modify | `src/index.ts` | Export dispatch module |

### `packages/studio-ui/`

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/dispatch-content.tsx` | Full Dispatch Center client component (all sub-components inline) |

### `apps/studio/`

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/app/dispatch/page.tsx` | Server component — calls studio-core, renders DispatchContent |
| Create | `src/app/api/dispatch/run/route.ts` | POST — triggers `worker.sh` as detached process |
| Create | `src/components/studio/dispatch-content.tsx` | Re-export from studio-ui |
| Modify | Sidebar/nav component | Add Dispatch link |

### `packages/studio-mcp/`

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/server.ts` | Expand `task_dispatch` for all backends, add `backend_status` tool |

### `scripts/`

| Action | File | Purpose |
|--------|------|---------|
| Create | `scripts/dispatch.sh` | Interactive CLI launcher — role → backend routing |
| Create | `scripts/worker.sh` | Unified headless worker — task lifecycle + backend delegation |
| Create | `scripts/auto-judge.sh` | Verdict system — reviews completed tasks |
| Create | `scripts/task-board.sh` | CLI CRUD for task files |
| Create | `scripts/task-scanner.mjs` | Task file scanner with filters + updates |
| Create | `scripts/dispatch-queue.sh` | Batch/overnight queue runner |
| Create | `scripts/resolve-route.mjs` | Config bridge — reads sherpa.config.ts, outputs JSON |
| Create | `scripts/backends/claude.sh` | Claude Code backend module |
| Create | `scripts/backends/opencode.sh` | OpenCode Zen backend module |
| Create | `scripts/backends/codex.sh` | Codex backend module |
| Create | `scripts/backends/gemini.sh` | Gemini CLI backend module |
| Create | `scripts/backends/lm-studio.mjs` | LM Studio HTTP API backend module |

### `docs/`

| Action | File | Purpose |
|--------|------|---------|
| Modify | `docs/tasks/README.md` | Add task-type, mode fields to schema |
| Modify | `docs/agents/roles/*.md` | Add task-type and eligible-task-types to frontmatter |

**Total: 17 create, 11 modify = 28 files**

## Decisions

### 1. Single dispatch-content.tsx, not separate component files

All sub-components (BacklogPanel, AssignmentsPanel, WorkforcePanel, etc.) live in one file, matching the pattern of `tasks-content.tsx` (530 lines) and `workforce-content.tsx` (550 lines). The Dispatch Center will be ~600-800 lines. This avoids premature file splitting and keeps the component tree co-located.

**Rejected:** Separate files per panel. Not warranted at this size, and breaks the existing pattern.

### 2. Polling, not WebSockets

Assignment status updates via `router.refresh()` on 5s interval. The shape explicitly calls this out as rabbit hole #2. Server components re-run on refresh, giving us fresh `getTaskBoard()` data for free.

**Rejected:** WebSocket/SSE for real-time updates. Adds infrastructure for marginal UX gain at this stage.

### 3. Shell-out for dispatch, not in-process

The API route `POST /api/dispatch/run` shells out to `scripts/worker.sh` as a detached child process. It doesn't import or call backend logic directly. This keeps the Studio app stateless and lets the same scripts work from CLI and MCP.

**Rejected:** In-process dispatch via studio-core. Would couple the web app to shell execution and break the CLI-first design.

### 4. Click-to-assign, not drag-and-drop

Shape no-go. Assignment is a dropdown action on agent cards, not a spatial metaphor. Simpler to build, simpler to use on mobile.

### 5. resolve-route.mjs as config bridge

Shell scripts can't read TypeScript config directly. A small Node script reads `sherpa.config.ts`, runs `resolveRoute(taskType, mode)`, and prints JSON to stdout. Shell scripts call it and parse with `node -e`. This adds one `node` invocation per dispatch (~50ms) but keeps config as single source of truth.

**Kill criterion:** If this adds >200ms latency (shape #5), inline the routing table in shell scripts.

## Open Questions

1. **AgentRole type extension** — `taskType` and `eligibleTaskTypes` need to be added to the AgentRole type in studio-core. Need to check where the type is defined and how roles are parsed from frontmatter.
2. **Sidebar component location** — Need to find the sidebar/nav component to add the Dispatch link. Not yet located in this design pass.
3. **Config loading in server components** — How does the Studio app currently load `sherpa.config.ts`? Need to verify the config loading pattern before designing the dispatch config integration.
