---
status: pending
initiative: studio-collaboration-platform/morning-review-mvp
created: 2026-03-09
updated: 2026-03-09
type: new-plan
risk: additive
targets:
  - apps/studio/src/app/morning/
  - packages/studio-ui/src/
  - packages/studio-core/src/
  - apps/web/src/components/sidebar/sidebar-nav-data.ts
dependencies:
  - studio-collaboration-platform
spawned-from: studio-collaboration-platform
---

# Morning Review MVP

## Summary

Build `/app/studio/morning` — a keyboard-driven review page where the solo operator processes overnight AI agent work. The page surfaces task completions, initiative attention items, and session activity, then enables approve/reject/iterate decisions without leaving the page. Ships in 4 tiers, with Tier 0 buildable today using existing data infrastructure.

## State Snapshot

**What exists:**
- `getTaskBoard()` at `@/lib/studio/tasks` — parses `docs/tasks/*.md` frontmatter, detects log/verdict/blocker files
- `getSessions()`, `getWorkstreams()`, `getInitiatives()` at `@/lib/studio` — full data access layer
- `buildAttentionNeeded()`, `detectLifecycle()`, `computeSessionStats()` — reusable from Studio hub page
- `useKeyboardShortcuts` hook at `src/hooks/use-keyboard-shortcuts.ts` — input-aware keyboard handling
- Sonner toast at `src/components/ui/sonner.tsx` — themed toast notifications
- `/morning` CLI skill — review protocol for terminal sessions
- HubStagger/HubPanel infrastructure — animation and layout primitives

**What doesn't exist:**
- `/app/studio/morning` route
- Keyboard-driven review queue component
- Server actions for task verdict mutations (approve/reject/iterate/undo)
- `readTaskLog()` utility for worker output
- `detectMorningTier()` data availability detection
- Morning page sidebar nav entry

## Proposed Changes

### Target: `apps/studio/src/app/morning/page.tsx`

New server component page. Three-section layout using HubStagger:

1. **Status cards** (full-width) — aggregate overnight outcomes: completed, failed, blocked tasks + stale initiatives + overnight tokens
2. **Queue + Detail** (5/7 column grid) — filterable task/initiative list (left) with side-panel detail (right). Client components for keyboard navigation and selection state.
3. **Activity timeline** (full-width) — chronological feed of overnight sessions, task completions, workstream updates

Data flow: fetch `getTaskBoard()`, `getSessions()`, `getInitiatives()`, `getWorkstreams()` in parallel → filter to overnight (24h lookback) → transform into `MorningQueueItem[]` + `MorningActivity[]` → pass to panels.

URL-as-state: `?selected=<id>`, `?sort=priority|age`, `?mode=triage|detailed`.

### Target: `apps/studio/src/app/morning/actions.ts`

Server actions for verdict mutations:

```typescript
approveTask(slug)     // → status: reviewed, verdict: approved, optional PR creation
requestChanges(slug, feedback)  // → verdict: needs-changes, create iteration task
rejectTask(slug, reason?)       // → verdict: rejected, archive, cleanup worktree
undoVerdict(slug, previousState) // → restore frontmatter
```

### Target: `packages/studio-ui/src/`

New components:
- `morning-status-panel.tsx` — 4-up aggregate status cards (server component)
- `morning-queue-panel.tsx` — keyboard-driven filterable queue (client component)
- `morning-detail-panel.tsx` — selected item detail with verdict actions (client component)
- `morning-activity-panel.tsx` — chronological overnight timeline (server component)

### Target: `packages/studio-core/src/`

New utilities:
- `morning.ts` — `detectMorningTier()`, `buildMorningQueue()`, `buildMorningActivities()`
- Extend `tasks.ts` with `readTaskLog(slug, type)` for worker output content

### Target: `apps/web/src/components/sidebar/sidebar-nav-data.ts`

Add "Morning" entry to Studio sidebar section, linking to `/app/studio/morning`.

## Keyboard Interaction Design

Based on Linear Triage + Superhuman patterns:

| Key | Action | Effect |
|-----|--------|--------|
| `J`/`↓` | Next item | Highlight moves, detail updates |
| `K`/`↑` | Previous item | Highlight moves, detail updates |
| `Enter` | Open detail | Side panel slides in |
| `A` | Approve | Set verdict, auto-advance, toast with undo (5s) |
| `R` | Request changes | Inline comment → iteration task, auto-advance |
| `D` | Reject | Confirm required (`D`+`Enter`), archive, toast (8s undo) |
| `S` | Skip/snooze | Move to end of queue |
| `X` | Toggle select | Multi-select for batch operations |
| `Shift+A` | Batch approve | Apply to all selected |
| `Escape` | Back up one level | Close detail → clear selection → deselect |
| `?` | Shortcut help | Modal overlay |

Auto-advance after every verdict. "All caught up" empty state when queue is empty.

## Progressive Enhancement (4 Tiers)

| Tier | Trigger | Panels Active | Effort |
|------|---------|--------------|--------|
| 0 | Always (sessions + initiatives exist) | Session recap, attention queue, active workstreams, pipeline health, educational empty states for tasks | 1 session |
| 1 | `getTaskBoard().length > 0` | + Task board, dispatch hints, pipeline status columns | 1 session |
| 2 | `tasks.some(t => t.hasReport)` | + Worker output viewer, judge verdict panel, morning review table, blocker report | 1-2 sessions |
| 3 | 10+ completed tasks with verdicts | + Cost dashboard, pipeline analytics, confidence scoring, overnight planner | Deferred |

**Effort:** 3-4 sessions (Tiers 0-2), Tier 3 deferred.

## Rationale

Research across 4 vectors (60+ sources from parent iteration 1 + this iteration) established:

1. **The morning review is Studio's primary interaction model** — every research vector from the parent initiative converged on this independently
2. **Exception-first design** — show what needs attention, not everything that ran (PagerDuty, BrightGauge, PatternFly patterns)
3. **Queue + detail, not board** — PagerDuty side-panel, Linear Triage, Superhuman Split Inbox all converge on filterable list + detail panel
4. **Keyboard-driven for speed** — Linear Triage saves ~134 hours/year vs mouse-driven review (Superhuman data)
5. **Progressive enhancement via data availability** — Temporal/GitHub Actions pattern: show chrome always, swap content by data state
6. **Server actions close the loop** — approve/reject/iterate without leaving the page, filesystem mutations are acceptable for internal tooling

## Dependencies

- `studio-collaboration-platform` — parent initiative, provides design direction and research context
- Planner/Worker/Judge pipeline — Tiers 1-3 depend on task files and worker outputs existing

## Review Notes

- Tier 0 has zero dependencies on the task pipeline — ships immediately using existing data
- The keyboard interaction spec is ambitious for an MVP. Consider shipping Tier 0-1 without keyboard shortcuts, then adding them at Tier 2 when there's actual queue content to process.
- Server actions for filesystem writes are dev-mode only. If Studio ever deploys to Vercel, these need to become API routes backed by a database.
- The `detectMorningTier()` function is the architectural keystone — it cleanly separates "what to render" from "what data exists."
