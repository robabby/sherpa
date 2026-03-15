---
designed: 2026-03-14
type: ui
components-new: 3
components-modified: 1
files-planned: 6
spawned-from: dispatch-center
---

# Overnight Run Summary — Design

Shape context: [shape.md](shape.md) | Parent initiative: [dispatch-center](proposal.md)

## Overview

When Rob runs overnight dispatches and wakes up in the morning, there is no dedicated view for reviewing results. The Dispatch Center's Assignments panel shows "completed today" in a small section, but it was designed for real-time monitoring, not morning triage. This design adds `/dispatch/morning` — a read-first summary view optimized for batch review.

**Primary use case:** Wake up, open `/dispatch/morning`, see at a glance what ran, what succeeded, what needs attention, take actions (re-queue failures, send to judge, review outputs).

**Not the Dispatch Center.** The Dispatch Center is for launching and monitoring active dispatches. The morning summary is for reviewing completed work and deciding next steps.

## Architecture

### Data Models

**New type in `packages/studio-core/src/overnight.ts`:**

```ts
export interface OvernightRun {
  date: string              // "2026-03-14"
  startedAt: string | null  // earliest dispatchedAt among overnight tasks
  endedAt: string | null    // latest completedAt among overnight tasks
  completed: TaskBoardEntry[]
  failed: TaskBoardEntry[]
  inFlight: TaskBoardEntry[] // still dispatched (uncommon at morning review time)
  awaiting: TaskBoardEntry[] // pending but associated with this run (queued but not started)
  totalCount: number
  successRate: number       // 0–1
}
```

**Data function:**

```ts
/**
 * Derives the most recent overnight run from the task board.
 * "Overnight" = tasks where mode === 'overnight'.
 * The window is the 24h period ending at the current time.
 */
export function getOvernightRun(
  tasks: TaskBoardEntry[],
  windowHours: number = 24
): OvernightRun
```

**Resolution logic:**
1. Filter tasks where `task.mode === 'overnight'`
2. Filter to tasks with `dispatchedAt` within the last `windowHours` (default 24h)
3. Group into `completed`, `failed`, `inFlight`, `awaiting` by status
4. `startedAt` = `min(dispatchedAt)` over the window
5. `endedAt` = `max(completedAt)` over the window
6. `successRate` = `completed.length / (completed.length + failed.length)` (or 0 if none)

**Why not a "run ID" concept?**
The current system has no formal batch identifier. Tasks are individually dispatched via `dispatch-queue.sh`. Adding a run ID would require changes to the queue script and task frontmatter. Instead, we use the overnight time window as the implicit run boundary. This is simpler and works correctly for the common case where Rob runs one overnight queue per day.

**Kill criterion for run ID:** If Rob routinely runs multiple overnight batches per day and the window-based grouping produces confusing results, add a `run-id` field to task frontmatter in a follow-on initiative.

### Component Tree

```
apps/studio/src/app/dispatch/morning/
  page.tsx                          ← Server component
  └── OvernightSummaryContent       ← Client component (studio-ui)
        ├── RunHeader                ← Date, duration, headline counts
        ├── RunTaskList              ← Two sections: completed + failed
        │   ├── TaskSection          ← Section header (completed / failed) + task list
        │   └── OvernightTaskCard   ← Task row with backend, duration, quick actions
        └── RunActionsBar           ← "Re-queue failed" + "Send all to judge" buttons
```

All sub-components are defined in one file (`overnight-summary-content.tsx`), matching the pattern of `dispatch-content.tsx` and `tasks-content.tsx`.

### Data Flow

**Server component (page.tsx):**

```ts
const tasks = getTaskBoard({ projectRoot: PROJECT_ROOT })
const run = getOvernightRun(tasks)          // new — from overnight.ts
return <OvernightSummaryContent run={run} />
```

**Client component state:**
- No selection state (read-first view)
- `requeuing: Set<string>` — task IDs currently being re-queued (optimistic UI)
- `judging: Set<string>` — task IDs being sent to judge

**Re-queue action:**
- POST to existing `/api/dispatch/reset` — resets task to `pending`
- On success, router.refresh() repopulates from server

**Send to judge:**
- POST to `/api/dispatch/judge` (new route) — calls `auto-judge.sh <task-slug>` as detached process
- Returns immediately; dispatch center polling will show progress

**No polling on morning view.** Unlike the Dispatch Center, the morning view is static (the run is done). No `setInterval`. The user can manually refresh if needed.

### Integration Points

**studio-core:**
- `overnight.ts` — new module: `OvernightRun` type + `getOvernightRun()` function
- `index.ts` — export `overnight` module

**studio-ui:**
- `overnight-summary-content.tsx` — new: full morning summary UI component

**apps/studio:**
- `src/app/dispatch/morning/page.tsx` — new: server component
- `src/app/api/dispatch/judge/route.ts` — new: POST triggers `auto-judge.sh`
- `src/app/dispatch/page.tsx` — modify: add "Morning Review" link when overnight tasks exist

## UI Design

### Layout

Single-column layout, not a multi-panel layout. The Dispatch Center uses panels for operational control; this view uses a document-like layout for read-first review.

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Dispatch Center]                                            │
│                                                                 │
│  Overnight Run                                             date │
│  March 14, 2026 · 12:04 AM → 6:47 AM                           │
│                                                                 │
│  ╔═══════════╤══════════╤════════════╗                          │
│  ║     6     │    1     │    42m     ║                          │
│  ║ completed │  failed  │  avg time  ║                          │
│  ╚═══════════╧══════════╧════════════╝                          │
│                                                                 │
│  ─── COMPLETED (6) ────────────────── [Send all to judge ▶]    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ● research-gemini-content-quality     [research]         │   │
│  │   opencode · minimax-m2.5 · 41m          [review] [judge]│  │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ● audit-claude-md-token-budget        [audit]            │   │
│  │   gemini · 2h 15m                        [review] [judge]│  │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ● research-opencode-rate-limits       [research]         │   │
│  │   opencode · 38m           ✓ verdict     [review] [judge]│  │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─── FAILED (1) ─────────────────────── [Re-queue all ↺]      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✗ embeddings-wavepoint-docs           [embeddings]       │   │
│  │   opencode · exit 1 · 12m                 [re-queue ↺]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Re-queue all failed (1)]   [Send all to judge (6)]           │
└─────────────────────────────────────────────────────────────────┘
```

**Empty state (no overnight run):**
```
┌─────────────────────────────────────────────────────────────────┐
│  No overnight run in the last 24 hours                          │
│  [← Go to Dispatch Center to queue tasks]                       │
└─────────────────────────────────────────────────────────────────┘
```

### Component Selection

| Component | shadcn/ui base | Notes |
|-----------|---------------|-------|
| Run header stats | Custom stat grid | 3 numbers: completed, failed, avg duration |
| Task sections | Custom divider + list | Section header with count + bulk action |
| Task card | Custom row | Task name, backend badge, type badge, duration, actions |
| Re-queue button | Button (outline) | Per-task; also "Re-queue all failed" in footer |
| Judge button | Button (outline) | Per-task if no verdict yet; "Send all to judge" bulk |
| Review link | Link | Goes to `/tasks/<slug>` |
| "Back" link | Link | Goes to `/dispatch` |

### Interaction Patterns

**Per-task actions:**
- **Review** — link to `/tasks/<slug>` (task detail page)
- **Re-queue** — resets task to `pending`, removes from failed list optimistically
- **Send to judge** — triggers `auto-judge.sh` for this task, shows "judging..." state

**Bulk actions:**
- **Re-queue all failed** — re-queues all failed tasks sequentially
- **Send all to judge** — sends all completed-without-verdict tasks to judge

**No polling.** Static page. User refreshes manually. The overnight run is done.

**Navigation back:** Prominent "← Dispatch Center" link at top left. Not a tab. Not a sidebar item. A contextual link from within the dispatch section.

### Color + Visual Design

- **Run header** — muted, factual. No accent color. Timestamp in `text-muted-foreground/60`.
- **Headline counts** — completed in `text-foreground`, failed in `text-rose-400`, avg duration in `text-muted-foreground`.
- **Completed tasks** — `border-emerald-500/12 bg-emerald-500/5` — calm success.
- **Failed tasks** — `border-rose-500/15 bg-rose-500/6` — visible but not alarming.
- **Task type badges** — same `TASK_TYPE_STYLES` map from `dispatch-content.tsx`.
- **Backend badges** — mono font, muted, same style as Assignments panel.
- **Actions** — copper accent for primary actions (`[var(--color-copper)]`).

### Linking from Dispatch Center

Add a subtle "morning review" link to the Dispatch Center header when overnight tasks exist:

```tsx
{completedOvernightCount > 0 && (
  <Link href="/dispatch/morning" className="text-[10px] text-muted-foreground/50 hover:text-[var(--color-copper)]">
    {completedOvernightCount} overnight results →
  </Link>
)}
```

This appears only when there's something to review, keeping the Dispatch Center uncluttered otherwise.

## File Plan

| Action | File | Purpose |
|--------|------|---------|
| Create | `packages/studio-core/src/overnight.ts` | `OvernightRun` type + `getOvernightRun()` |
| Modify | `packages/studio-core/src/index.ts` | Export `overnight` module |
| Create | `packages/studio-ui/src/overnight-summary-content.tsx` | Full morning review UI component |
| Create | `apps/studio/src/app/dispatch/morning/page.tsx` | Server component for morning view |
| Create | `apps/studio/src/app/api/dispatch/judge/route.ts` | POST — triggers `auto-judge.sh` as detached process |
| Modify | `packages/studio-ui/src/dispatch-content.tsx` | Add "overnight results →" link to header |

**Total: 4 create, 2 modify = 6 files**

## Decisions

### 1. Single-column document layout, not three-panel

The Dispatch Center's three-panel layout is for operational dispatch (backlog → agent → backend → launch). The morning view is for reading and triage. A single-column document layout matches the cognitive mode: scan, decide, act on a few items.

**Rejected:** Adding a "Morning" tab to the Dispatch Center. Different layouts for different tasks; same container would force layout compromises on both.

### 2. Time window over run ID

Tasks are grouped by the overnight time window (last 24h, mode=overnight) rather than a formal run identifier. Simpler data model, no frontmatter changes needed, works for Rob's current workflow of one overnight run per day.

**Rejected:** Adding `run-id` to task frontmatter. Adds complexity to the queue script and task files. Worth revisiting if multi-run-per-day becomes common.

### 3. No polling on the morning view

The overnight run is complete when you review it in the morning. The Assignments panel in the Dispatch Center handles in-flight monitoring. The morning view is static — server data fetched on page load, no `setInterval`.

**Exception:** If `inFlight.length > 0` (tasks still dispatched when user visits), show a note that the run is still in progress and a manual refresh button.

### 4. Judge route as new API endpoint

`/api/dispatch/judge` is a new route, not reuse of `/api/dispatch/run`. Judging and running are different commands (`auto-judge.sh` vs `worker.sh`). Separate routes are clearer and follow the existing pattern.

### 5. Re-queue reuses existing reset endpoint

`POST /api/dispatch/reset` already exists and resets a task to `pending`. The morning view's "re-queue" action calls this same endpoint. No new API needed.

## Open Questions

1. **Duration computation** — The `OvernightRun` shows "avg time". Task duration is `completedAt - dispatchedAt`. Both fields exist on `TaskBoardEntry`. Need to verify both are reliably set after completion (check `worker.sh` lifecycle).

2. **Judge API route** — `auto-judge.sh <task-slug>` needs to be callable from the web. The pattern from `/api/dispatch/run` is to spawn a detached process. Verify `auto-judge.sh` supports headless/silent mode or can be adapted.

3. **Multi-day runs** — The 24h window default works for daily overnight runs. If Rob skips a night and reviews in the afternoon two days later, the window may miss some tasks. Consider exposing a `?date=2026-03-13` query param for historical review.
