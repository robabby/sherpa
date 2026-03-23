---
status: approved
initiative: dispatch-evolution
created: 2026-03-19
updated: '2026-03-19'
type: new-plan
risk: evolutionary
targets:
  - packages/studio-ui/src/dispatch-content.tsx
  - packages/studio-ui/src/studio-sidebar.tsx
  - packages/studio-core/src/dispatch.ts
  - packages/studio-core/src/dispatch-meta.ts
  - apps/studio/src/app/(studio)/dispatch/page.tsx
  - apps/studio/src/app/(studio)/dispatch/loading.tsx
  - apps/studio/src/app/(studio)/settings/page.tsx          # (new file)
  - apps/studio/src/app/(studio)/settings/layout.tsx         # (new file)
  - apps/studio/src/app/(studio)/settings/loading.tsx        # (new file)
  - packages/studio-ui/src/dispatch-bar.tsx                  # (new file)
  - packages/studio-ui/src/settings-content.tsx              # (new file)
dependencies: []
informs:
  - ai-gateway-dispatch
personas:
  - engineer
spawned-from: null
---

# Dispatch Page Evolution

## Summary

Simplify the dispatch page from a three-panel layout with per-task backend selection to a two-panel layout where backend is a system-level setting on a new Settings page. Replace the "interactive/supervised/overnight" mode selector with a clearer "supervised/autonomous" autonomy level concept. Inline agent selection into a dispatch bar that appears on task selection, eliminating the workforce panel.

## State Snapshot

The current dispatch page (`dispatch-content.tsx`, 1196 lines) was built in the `dispatch-center` initiative (integrated). It works well but over-exposes backend configuration:

- **Three-panel layout:** Backlog (col-span-3) | Assignments (col-span-5) | Workforce (col-span-4). The Workforce panel is split between a backends list (9 backends with health indicators) and an agent roster with assign buttons.
- **Dispatch pipeline:** Toolbar shows a sequential flow — mode → task count → agent → backend → Dispatch button. All four must be set before dispatching. Backend selection is a per-dispatch decision equal in weight to agent selection.
- **Mode selector:** Three modes (interactive, supervised, overnight). "Interactive" is not really a dispatch mode — it's just using Claude Code locally. "Overnight" blocks code-impl and architect tasks via a guard rail banner.
- **Backend roster:** `dispatch-meta.ts` (38 lines) defines 9 backends across CLI and API types. `dispatch.ts` (271 lines) routes all task types to `openclaw` by default. In practice, the active backend rarely changes — it's openclaw or claude.
- **No settings page:** No `/settings` route exists. Backend config lives in `sherpa.config.ts` and is not editable from the UI.
- **Sidebar:** `studio-sidebar.tsx` (165 lines) has four groups (Operations, Knowledge, System, Activity) with no Settings entry.

## Proposed Changes

### Two-panel layout (`dispatch-content.tsx`)

Replace the three-panel grid with a two-panel layout:

- **Left panel (~5 cols): Backlog** — task list with checkboxes, grouped by task type. Same core interaction as today.
- **Right panel (~7 cols): Assignments** — active, failed, and completed-today sections. Cards gain extra width for richer metadata: elapsed time, token count, cost, model used.

The Workforce panel is removed entirely. Agent selection moves into the dispatch bar.

### Dispatch bar (`dispatch-bar.tsx`, new)

A bottom bar that appears when tasks are selected in the backlog. Contains:

- Task count with task-type badges
- Agent dropdown filtered to eligible agents (by `taskType` and `eligibleTaskTypes` match). Pre-selects the best match when all selected tasks share a type.
- "Dispatch" button — enabled when an agent is selected. Sends tasks using the active backend from settings.
- If the active backend is offline, the button shows a warning state.

### Autonomy level (`dispatch.ts`)

Replace `DispatchMode = 'interactive' | 'supervised' | 'overnight'` with `AutonomyLevel = 'supervised' | 'autonomous'`.

- **Supervised** — agent works, human reviews before merge. Default. All task types allowed.
- **Autonomous** — agent completes end-to-end. Code-implementation and architect tasks are blocked (same guardrail as current overnight mode, reframed).

Segmented control in the toolbar, left-aligned. Guard rail banner appears when autonomous is selected.

### Settings page (`settings/page.tsx`, new)

New route at `/settings`. Minimal scope:

- **Active Backend** section — toggle between openclaw and claude. This is the system-level default consumed by the dispatch page.
- **Backend Health** section — card per backend showing connection status, available models, last health check, and a manual "Check Health" button.

Persists the active backend selection to a local config file read by the dispatch page at render time.

### Sidebar update (`studio-sidebar.tsx`)

Add "Settings" to the System navigation group (alongside Workforce, Sessions, MCP).

### Toolbar simplification (`dispatch-content.tsx`)

The toolbar loses the pipeline visualization (task → agent → backend chain). Keeps:

- Left: autonomy level selector (segmented control)
- Right: stats — active count, failed count, completed today

## Rationale

The current dispatch page treats backend selection as a per-dispatch decision, but in practice the backend almost never changes. Sherpa standardizes on openclaw and claude as the two harnesses. Vercel AI Gateway handles model routing within those harnesses — the human doesn't need to pick models at dispatch time.

Moving backend to a settings page reduces the dispatch flow from four decisions (mode, tasks, agent, backend) to two (tasks, agent). The two-panel layout reclaims space from the now-unnecessary workforce panel and gives assignment cards room to show operational data.

Reframing "interactive/supervised/overnight" as "supervised/autonomous" removes a mode that isn't a dispatch action (interactive) and names the actual decision: how much latitude does the agent get?

## Dependencies

- **`dispatch-center`** (integrated) — the foundation this iterates on. All target files were created or shaped by that initiative.
- **Informs `ai-gateway-dispatch`** (pending) — the new Settings page is the natural home for AI Gateway configuration when that initiative lands. This initiative doesn't implement gateway config, but the page structure should accommodate it.

## Review Notes

**Backend persistence:** The active backend selection needs a persistence mechanism readable by the server component. Options include a `.sherpa/settings.json` file in the project root, a field in `sherpa.config.ts`, or browser localStorage with a server-side default. The design session should decide.

**Backend health on settings vs dispatch:** Health checks currently run server-side when the dispatch page loads. With backend config on the settings page, decide whether health is checked on both pages or only on settings (with cached status on dispatch).

**dispatch-content.tsx is 1196 lines.** This rewrite is a good opportunity to decompose it into smaller components (backlog panel, assignments panel, dispatch bar), but the initiative scope is the UX change, not a refactoring exercise. Component extraction happens naturally as part of the two-panel rebuild.

**Effort:** 4 sessions
**Session breakdown:**
- Session 1: Settings page — route scaffolding, active backend selector, backend health cards, sidebar link
- Session 2: Dispatch bar component — task selection interaction, agent dropdown with eligibility filtering, dispatch action wiring
- Session 3: Two-panel layout — rebuild dispatch-content.tsx with backlog + assignments panels, remove workforce panel, integrate dispatch bar
- Session 4: Autonomy level — replace mode types, update guard rails, toolbar simplification, end-to-end testing
