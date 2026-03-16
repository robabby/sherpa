---
status: integrated
initiative: studio-agent-missions
created: 2026-03-14
updated: '2026-03-16'
type: new-plan
risk: evolutionary
targets:
  - apps/studio/src/app/tasks/layout.tsx
  - apps/studio/src/app/tasks/page.tsx
  - apps/studio/src/app/tasks/[slug]/page.tsx
  - packages/studio-ui/src/tasks-content.tsx
  - packages/studio-ui/src/task-detail-content.tsx
  - packages/studio-ui/src/task-summary-widget.tsx
dependencies: []
spawned-from: null
---

# Studio Agent Missions

## Summary

Reimagine the Tasks page as a full-viewport AI agent mission control. The current implementation is a traditional task board — table rows, pipeline counters, status badges — designed for human-managed work items. But these aren't checkbox todos. They're autonomous and semi-autonomous AI agent missions with providers, models, streaming output, token usage, and judge verdicts. The page should communicate that reality and match the edge-to-edge patterns established by `/process` and `/dispatch`.

## State Snapshot

The Tasks system spans 3 UI components (1,062 lines total) and 3 route files:

**`tasks-content.tsx` (549 lines)** — The main task board. Has:
- `PipelineCards`: Four status counters (Pending/Dispatched/Completed/Reviewed) as clickable filter cards
- `FilterBar`: Backend toggle (hardcoded "All/Claude/LM Studio"), initiative dropdown, role dropdown
- `TaskTable`: Six-column table (priority, task name+initiative, role, backend, status, verdict, age)
- Uses `SectionHeader` ("PIPELINE / Task Board") and `StudioBreadcrumb` — both removed from `/dispatch` in the current session

**`task-detail-content.tsx` (376 lines)** — Individual task view. Has:
- Header with priority dot, status badge, verdict badge
- Task metadata: initiative link, backend (monospace), model, age, worktree/branch
- Body sections: Objective, Acceptance Criteria (checkbox rendering)
- Artifact tabs: Report, Verdict, Blockers via `DocRenderer`

**`task-summary-widget.tsx` (137 lines)** — Compact widget for dashboard embedding.

**Layout:** `apps/studio/src/app/tasks/layout.tsx` wraps content in `max-w-6xl px-6 py-6` — padded, centered, not edge-to-edge. Compare with `/dispatch` which now uses no wrapper, and `/process` which uses `h-[calc(100vh-53px)]` full-viewport.

**Filter bar limitations:** Backend filter is hardcoded to "All/Claude/LM Studio" — doesn't include the new API backends (Groq, Google AI, LM Studio API). The pipeline counters are static cards, not integrated into the viewport-filling layout.

**What's missing from the agent mission perspective:**
- No provider/model info visible in the list view (just backend name)
- No token usage, duration, or cost indicators
- No distinction between CLI agent missions and API agent missions
- The table layout treats every task as equal — a 2-second Groq API call and a 45-minute Claude Code session look the same
- No visual indication of autonomous vs supervised vs interactive mode
- Task detail shows worker output as raw markdown in a tab — no structured view of agent metadata (provider, tokens, duration)

## Proposed Changes

### Layout: Full-viewport edge-to-edge

Remove the `max-w-6xl` wrapper. Match `/process` and `/dispatch` patterns — `h-[calc(100vh-53px)]` with border-top, no padding wrapper. The task list and task detail become panes in a resizable split view (like `/process` has list + detail).

### List + Detail split

Replace the table-only view with a two-pane layout:
- **Left pane:** Scrollable task list with rich task cards (not table rows)
- **Right pane:** Task detail (currently a separate route at `/tasks/[slug]`) rendered inline as a detail pane

Clicking a task in the list shows its detail in the right pane without navigating away. This matches the `/process` pattern exactly.

### Task cards (replacing table rows)

Each task renders as a card showing:
- Task name and initiative
- Agent role + CLI/API badge + backend + model
- Status with visual treatment (pulse for dispatched, glow for completed)
- Duration and token usage (when completed)
- Mode indicator (interactive/supervised/overnight)

### Filter bar: Dynamic backends

Replace hardcoded "All/Claude/LM Studio" with backends derived from `BACKEND_META` — all CLI and API backends appear as filter options.

### Task detail pane: Agent mission view

The right pane shows the full mission context:
- Agent metadata header: provider, model, duration, token usage, cost estimate
- Structured output view (not just raw markdown tab)
- Acceptance criteria with completion state
- Judge verdict with reasoning
- Event timeline from NDJSON logs (dispatched → running → completed)

### Remove legacy patterns

- Remove `SectionHeader` and `StudioBreadcrumb` (matches dispatch cleanup)
- Remove `PipelineCards` counters — replace with inline stats in top bar
- Remove hardcoded backend filter — derive from `BACKEND_META`

## Rationale

The current Tasks page was built when tasks were simple work items dispatched to one or two backends. Now with 8 backends (5 CLI + 3 API), multiple providers, and autonomous agent dispatch, the page needs to communicate what's actually happening: AI agents executing missions with real resource usage, provider diversity, and structured outcomes.

The split-pane pattern is proven — `/process` uses it successfully for initiatives. Bringing task detail inline avoids the context switch of navigating to `/tasks/[slug]` and makes the task board feel like a mission control dashboard rather than a database table.

Matching the edge-to-edge viewport pattern across Process, Dispatch, and Tasks creates visual consistency and maximizes screen real estate for the dense information these pages show.

## Dependencies

None. This builds on the `ai-sdk-dispatch` work (now integrated) which added CLI/API badges and `BACKEND_META`.

Soft coordination with `dispatch-center` (integrated) — the Dispatch Center dispatches tasks, this page monitors and reviews them. They share `TaskBoardEntry` types and status conventions.

## Review Notes

**Key trade-off:** The split-pane pattern means `/tasks/[slug]` as a standalone route may become redundant. We could keep it for direct linking (shared URLs) or redirect to `/tasks?node=<slug>`. Decision deferred to `/shape`.

**Open questions:**
- Should the task list use the same `ResizeHandle` component as `/process`?
- How much agent metadata should be visible in the list card vs only in the detail pane?
- Should the NDJSON event timeline be a visual component or just structured text?
- Token usage and cost: derive from log file metadata or track separately?

**Effort:** 3 sessions
**Session breakdown:**
- Session 1: Full-viewport layout, split-pane with list + detail, task cards replacing table rows
- Session 2: Dynamic filter bar, agent metadata in detail pane, CLI/API badges, mode indicators
- Session 3: Event timeline, structured output view, polish and visual verification
