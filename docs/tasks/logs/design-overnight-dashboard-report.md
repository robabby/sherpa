# Task Report: design-overnight-dashboard

**Task:** Design overnight run summary view for morning review
**Initiative:** dispatch-center
**Date:** 2026-03-14

## What Was Done

Designed a new `/dispatch/morning` page — a read-first morning triage view for reviewing overnight dispatch results. Produced two artifacts:

### 1. `overnight-summary-design.md`

Full design document covering:

- **Data model** — `OvernightRun` type with `completed`, `failed`, `inFlight`, `awaiting` arrays; `getOvernightRun(tasks, windowHours)` function that derives the run from existing `TaskBoardEntry` data filtered to `mode === 'overnight'`
- **Component tree** — `OvernightSummaryContent` → `RunHeader` + `RunTaskList` → `TaskSection` + `OvernightTaskCard`; all in one file matching existing component patterns
- **Data flow** — server component calls `getOvernightRun()`, passes result to client component; no polling (run is done); re-queue reuses existing `/api/dispatch/reset`; judge action uses new `/api/dispatch/judge` route
- **UI layout** — single-column document layout (not three-panel); headline stat grid (completed / failed / avg duration); per-task actions (review link, judge button, re-queue button); bulk actions in bottom bar and section headers; link from Dispatch Center header when overnight tasks exist
- **6-file plan** — 4 create, 2 modify

### 2. `overnight-summary-prototype.html`

Interactive HTML prototype with:
- Full visual fidelity matching existing dispatch-content.tsx color system (copper/emerald/rose accents, dark card theme)
- 7 task cards (6 completed, 1 failed) with type badges, backend badges, elapsed time, verdict indicators
- Working click interactions: per-task judge, per-task re-queue, bulk judge, bulk re-queue
- Three view states: normal run (primary), empty state (no overnight run), in-progress state (run still dispatched)

## Files Changed

| Action | File |
|--------|------|
| Created | `docs/initiatives/dispatch-center/overnight-summary-design.md` |
| Created | `docs/initiatives/dispatch-center/overnight-summary-prototype.html` |
| Modified | `docs/initiatives/dispatch-center/activity.md` |

## Key Design Decisions

1. **Single-column layout** — morning review is a reading task, not an operational control task. Document layout over three-panel.
2. **Time window over run-id** — no frontmatter changes needed; 24h window filters overnight tasks. Simpler.
3. **No polling** — the run is complete. User refreshes manually. `inFlight` guard shows a note if any tasks are still dispatched.
4. **Reuses existing API** — re-queue calls `/api/dispatch/reset` (already exists). Only new endpoint is `/api/dispatch/judge`.
5. **Contextual link from Dispatch Center** — not a sidebar item. Appears in Dispatch Center header only when overnight tasks exist.

## Notes

- Duration computation requires both `dispatchedAt` and `completedAt` to be reliably set; verify in `worker.sh` lifecycle before implementing `getOvernightRun()`.
- `auto-judge.sh` needs verification that it supports headless invocation from the web API route.
- Consider `?date=` query param for historical overnight run review (multi-day lookback).
