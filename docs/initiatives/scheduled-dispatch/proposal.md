---
status: pending
initiative: scheduled-dispatch
created: 2026-03-14
updated: 2026-03-14
type: new-plan
risk: additive
targets:
  - scripts/scheduler.mjs
  - scripts/dispatch-queue.sh
  - packages/studio-core/src/dispatch.ts
  - packages/studio-core/src/tasks.ts
  - packages/studio-ui/src/dispatch-content.tsx
  - apps/studio/src/app/api/dispatch/schedule/route.ts
dependencies:
  - dispatch-center
spawned-from: dispatch-center
---

# Scheduled Dispatch

## Summary

Add time-based scheduling to the Dispatch Center. Tasks can be scheduled to dispatch at a specific time, batches can be queued for a future window, and recurring tasks auto-create instances on a cron schedule. A standalone scheduler script polls every 30 seconds and dispatches due tasks.

## State Snapshot

The Dispatch Center is `integrated` with 5 backends, three-step dispatch flow, failed task visibility, and Claude-only constraint. Dispatch is currently immediate-only — you click Dispatch and it runs now. Overnight work requires manually triggering `dispatch-queue.sh` at the right time.

## Proposed Changes

### Data Model — `docs/tasks/*.md` frontmatter

Two new fields:

```yaml
scheduled-for: 2026-03-14T02:00:00    # ISO datetime, local timezone
schedule: "0 2 * * MON"               # Cron expression (recurring templates only)
```

One field on generated instances linking back to their template:

```yaml
template: audit-claude-md-token-budget  # Points to template task slug
```

Template tasks use `status: template` and are never dispatched directly. The scheduler creates dated instances (`{slug}-{YYYY-MM-DD}.md`) with `scheduled-for` set to the next cron occurrence.

### Scheduler — `scripts/scheduler.mjs`

Long-running Node process with a 30-second poll loop. Each tick:

1. **Dispatch due tasks** — scan `status: pending` where `scheduled-for <= now`. Spawn `worker.sh` detached (same as API route). Log `scheduler_dispatched` NDJSON event.
2. **Spawn recurring instances** — scan `status: template` with `schedule` set. If no pending/dispatched instance exists with matching `template` field, create one from the template with `scheduled-for` set to next cron occurrence.
3. **Stale check** — flag tasks `dispatched` longer than 2 hours. Write `scheduler_stale_warning` event. No auto-action.

Flags: `--dry-run` (show what would happen), `--once` (single tick, then exit). Logs to stdout, one summary line per tick.

Dependency: `cron-parser` npm package for cron expression parsing.

### Queue Enhancement — `scripts/dispatch-queue.sh`

New `--at` flag: `dispatch-queue.sh --pending --at "2026-03-14T02:00"` stamps `scheduled-for` on all matched tasks instead of dispatching immediately.

### UI Changes — Dispatch Center

1. **Schedule button** in QueueControls alongside Dispatch. Opens a datetime picker popover. Writes `scheduled-for` via `POST /api/dispatch/schedule`. Pipeline badges show the scheduled time.
2. **Scheduled section** at top of BacklogPanel. Tasks with future `scheduled-for` shown with relative countdown, sorted by time. Checkboxes allow canceling (clears `scheduled-for`).
3. **Recurring group** at bottom of BacklogPanel (collapsed). Shows templates with human-readable cron description and badge for next instance.

### API — `POST /api/dispatch/schedule`

Takes `taskId`, `scheduledFor`, optional `agent`, `backend`. Writes `scheduled-for`, `backend`, agent selection to frontmatter. Status stays `pending`.

### Type Changes — `packages/studio-core`

`TaskBoardEntry` gets: `scheduledFor: string | null`, `schedule: string | null`, `template: string | null`.

`dispatch.ts` gets: no changes to routing — scheduling is orthogonal to backend resolution.

## Rationale

Overnight dispatch currently requires manual timing. Scheduled dispatch lets Rob queue work before bed and have it execute at optimal times (e.g., after rate limits reset, or staggered to avoid concurrent backend load). Recurring tasks eliminate the repetitive setup for periodic audits and health checks.

## Dependencies

- dispatch-center (integrated)

## Review Notes

- **Timezone**: `scheduled-for` is local timezone. No UTC conversion needed for a local-only tool.
- **Scheduler lifecycle**: No auto-restart, no process manager. `node scripts/scheduler.mjs` in a terminal tab. Kill when done.
- **Template naming**: Instance files use `{template-slug}-{YYYY-MM-DD}.md`. If two instances would share a date, append `-2`, `-3`.
- **No UI for creating templates**: Templates are created by hand or via `task-board.sh`. The UI only displays them.
- **cron-parser is the only new dependency**. ~30KB, well-maintained, no transitive deps.

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: Data model (frontmatter + types), scheduler script, queue `--at` flag
- Session 2: UI changes (schedule button, datetime picker, scheduled/recurring sections), schedule API route
