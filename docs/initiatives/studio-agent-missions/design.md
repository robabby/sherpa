---
designed: 2026-03-14
type: both
components-new: 7
components-modified: 5
files-planned: 16
---

# Design: Studio Agent Missions

Shape: [shape.md](shape.md) | Proposal: [proposal.md](proposal.md)

## Overview

Redesign the Tasks page from a traditional task board into a full-viewport AI agent mission control. Three-zone split-pane layout (filter + list + detail), real-time SSE streaming of NDJSON events, rich task cards with agent metadata, and an event timeline in the detail pane.

## Architecture

### Data Models

**Extend `TaskBoardEntry` with optional agent metrics:**

```typescript
// packages/studio-core/src/tasks.ts — additions to TaskBoardEntry
interface TaskBoardEntry {
  // ... existing fields unchanged ...

  // Agent metrics — populated from NDJSON events when available, null for CLI backends
  durationSeconds: number | null;
  tokensInput: number | null;
  tokensOutput: number | null;
  costUsd: number | null;
}
```

Fields populated by `getTaskBoard()` at read time — scan the NDJSON event file for `status_changed` events with `durationSeconds`, and `worker_completed` events with token/cost data. All nullable. CLI backends produce null for tokens/cost.

**New event types for task-events module:**

```typescript
// packages/studio-core/src/task-events.ts
interface TaskEvent {
  timestamp: string;
  event: string;
  taskSlug: string;
  data: Record<string, unknown>;
}

// Reads events for a single task (not all tasks like readAllEvents)
function getTaskEvents(taskId: string, opts?: TaskBoardOptions): TaskEvent[];
```

This is a focused reader for a single task's NDJSON file — extracted from `readAllEvents()` which reads all files. The SSE route needs single-task reads.

### Component Tree

```
MissionWorkspace (client, split-pane container)
├── MissionFilterBar (search + backend toggles + status + initiative + role)
├── MissionList (scrollable card list, left pane)
│   └── MissionCard[] (individual task cards with agent metadata)
├── ResizeHandle (reused from /process)
└── MissionDetailPane (right pane)
    ├── Metadata header (provider, model, CLI/API, duration, tokens, cost)
    ├── Tabs
    │   ├── Overview (objective + acceptance criteria)
    │   ├── Report (worker output via DocRenderer)
    │   ├── Verdict (judge verdict via DocRenderer)
    │   └── Events (MissionTimeline)
    └── MissionTimeline (vertical event timeline, SSE-connected for active tasks)
```

**Shared module:** `task-styles.ts` extracts the duplicated `STATUS_STYLES`, `VERDICT_STYLES`, `PRIORITY_COLORS` maps from tasks-content and task-detail-content into one shared source.

### Data Flow

**Initial page load (server → client):**

```
tasks/page.tsx (server component)
  → getTaskBoard() — reads task .md files + scans NDJSON for metrics
  → getTaskEvents(selectedId) — reads events for URL-selected task
  → passes { tasks, initialEvents } to MissionWorkspace (client)
```

**Task selection (client-side):**

```
User clicks MissionCard
  → MissionWorkspace updates selectedId in state + URL (?node=<id>)
  → MissionDetailPane renders with task data from props
  → useMissionEvents(taskId) hook:
      - If task.status === "dispatched": opens EventSource to /api/stream/tasks/[taskId]
      - If task.status !== "dispatched": uses static events from server data
      - Returns { events: TaskEvent[], isStreaming: boolean }
```

**SSE streaming (server → client for active tasks):**

```
GET /api/stream/tasks/[taskId]
  → Read existing NDJSON lines, send each as SSE data event
  → Send "caught-up" event (client knows it has all existing events)
  → fs.watch on NDJSON file:
      - On change: read new lines since last position
      - Send new events as SSE data
      - If task status → completed/failed/reviewed: send "done" event + close
  → On client disconnect: cleanup fs.watch, close stream
```

**SSE connection lifecycle:**

```
useMissionEvents(taskId)
  → Opens EventSource when taskId changes + status is "dispatched"
  → Accumulates events in useState
  → On "done" event: closes EventSource, marks isStreaming = false
  → On taskId change: closes previous EventSource, opens new one
  → Cleanup on unmount
```

### Integration Points

| Existing Module | Touch | Nature |
|----------------|-------|--------|
| `studio-core/tasks.ts` | Modify | Add 4 optional fields to TaskBoardEntry, populate from NDJSON |
| `studio-core/mcp-dashboard.ts` | Read only | Reference `readAllEvents` pattern for NDJSON parsing |
| `studio-core/dispatch-meta.ts` | Import | BACKEND_META for dynamic filter bar + badges |
| `studio-ui/resize-handle.tsx` | Import | Reuse as-is for split-pane |
| `studio-ui/doc-renderer.tsx` | Import | Reuse for report/verdict content |
| `studio-ui/lib/animation-constants.ts` | Import | EASE_STANDARD for motion |
| `apps/studio/api/dispatch/run/route.ts` | Read only | Reference for NDJSON write pattern |

### SSE Route Design

```typescript
// apps/studio/src/app/api/stream/tasks/[taskId]/route.ts

export async function GET(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const eventsFile = path.join(PROJECT_ROOT, `docs/tasks/logs/${taskId}-events.ndjson`);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // 1. Send existing events
      if (fs.existsSync(eventsFile)) {
        const content = fs.readFileSync(eventsFile, "utf-8");
        const lines = content.split("\n").filter(Boolean);
        for (const line of lines) {
          try { send("event", JSON.parse(line)); } catch { /* skip malformed */ }
        }
      }
      send("control", { type: "caught-up" });

      // 2. Watch for new events
      let lastSize = fs.existsSync(eventsFile) ? fs.statSync(eventsFile).size : 0;
      const watcher = fs.watch(eventsFile, { persistent: false }, () => {
        // Debounced read of new content
        // Read from lastSize, parse new lines, send via SSE
        // If status_changed to completed/failed/reviewed → send done + close
      });

      // 3. Cleanup
      request.signal.addEventListener("abort", () => {
        watcher.close();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

Key: the stream sends named events (`event:` field) so the client can distinguish `event` (task event data) from `control` (caught-up, done) messages.

## UI Design

### Typography & Palette

Must match the existing Studio design system:
- **Body:** DM Sans (variable, 300-700)
- **Display/Heading:** Fraunces (variable optical size, 300-900)
- **Mono:** JetBrains Mono (400, 500, 600)
- **Section labels:** `font-mono text-[9px] uppercase tracking-widest text-dim` (matches home page pattern)
- **Palette:** obsidian (#08080a) base, warm-charcoal, dark-bronze, copper/gold/bronze metallics, session indigo for API badges

### Layout

Full-viewport, edge-to-edge, matching `/process`:

```
┌──────────────────────────────────────────────────────────┐
│ Studio Nav (53px)                                        │
├────────────────────┬─┬───────────────────────────────────┤
│ Filter bar (2 row) │ │ Metric chips row                  │
│ Stats bar          │R│ ────────────────────────────────  │
│ ─────────────────  │e│ Tabs: Overview | Report | Events  │
│ MissionCard        │s│ ────────────────────────────────  │
│ MissionCard (sel)  │i│ Tab content                       │
│ MissionCard        │z│                                   │
│ MissionCard        │e│                                   │
│                    │ │                                   │
│                    │ │                                   │
└────────────────────┴─┴───────────────────────────────────┘
```

- Container: `h-[calc(100vh-53px)] border-t border-[var(--color-dark-bronze)]`
- Left pane: 360px default (wider than ProcessWorkspace's 300px — cards need more room), 200-500px range, width persisted to localStorage key `"mission-list-width"`
- Right pane: flex-1, scrollable, subtle radial gradient + noise overlay for depth
- Left pane: `bg-obsidian` (darker than right pane for depth separation)

### MissionCard Design

Each card in the list pane:

```
┌─────────────────────────────────────┐
│ ● Task Title                  6m 13s│
│   initiative-slug                   │
│   [CLI] [claude] [sonnet-4-6]       │
│   12.4K tok · $0.03                 │
└─────────────────────────────────────┘
```

- Leading: status dot (copper dispatched, emerald completed, gold reviewed, zinc pending, rose failed)
- Dispatched dots get `animate-pulse-dot` (scale + opacity)
- Primary: task title in 13px DM Sans medium, truncated
- Duration: right-aligned in title row, mono tabular-nums
- Secondary: initiative slug in `text-dim`
- Badges row: CLI/API badge + backend badge + model badge. Verdict badge right-aligned when present.
- Metrics row: tokens humanized (`12.4K tok`) + cost, both mono tabular-nums
- CLI backends without token/cost data: omit metrics row entirely (don't show "—" in list)

**Selected state:** `border-l-2 border-l-copper bg-copper/6`, title color elevates to `gold-bright`. Hover state: `bg-copper/3`.

### MissionDetailPane Design

**Metadata header — metric chips pattern:**

Instead of stacked text lines, agent metadata renders as a flex row of discrete chips. Each chip has a tiny uppercase label and a mono value. This creates clear visual hierarchy and makes the metrics scannable.

```
┌──────────────────────────────────────────────────────┐
│ ● dispatched    pending verdict                      │
│                                                      │
│ Design Overnight Dashboard          (Fraunces, 20px) │
│                                                      │
│ ┌────────┐ ┌──────────────┐ ┌────────┐ ┌─────────┐  │
│ │Backend │ │Model         │ │Duration│ │Tokens   │  │
│ │CLI cla…│ │sonnet-4-6    │ │6m 13s  │ │12,384/… │  │
│ └────────┘ └──────────────┘ └────────┘ └─────────┘  │
│ ┌──────┐ ┌────────┐                                  │
│ │Cost  │ │Mode    │                                  │
│ │$0.03 │ │superv…│                                   │
│ └──────┘ └────────┘                                  │
│                                                      │
│ dispatch-center · medium priority · 2h ago · architect│
└──────────────────────────────────────────────────────┘
```

Chip styling: `bg-dark-bronze/50 border border-dark-bronze/80 rounded-md px-2.5 py-1.5`. Label: `text-[9px] uppercase tracking-[0.08em] text-dim`. Value: `text-[13px] font-mono font-medium`.

Duration chip: copper text when dispatched (matches the active feel).
Cost chip: gold text (money = gold).
Tokens detail: full breakdown `12,384 in / 3,201 out` (progressive disclosure from list's `12.4K`).

**Tabs:**

| Tab | Content |
|-----|---------|
| Overview | Objective section + Acceptance Criteria (checkbox rendering) |
| Report | Worker output (report.md or output.md or .log) via DocRenderer |
| Verdict | Judge verdict + reasoning via DocRenderer |
| Events | MissionTimeline component |

Active tab: `border-b-2 border-copper text-copper text-shadow: 0 0 20px copper/30` (subtle glow). Events tab gets a pulsing copper dot badge when streaming.

Default tab: Overview if no report yet, Report if report exists.

**Empty state:** When no task is selected, detail pane shows centered icon + "Select a mission" with keyboard hint (`j/k`). Uses Fraunces display font for the message. Icon: 64x64 rounded container with warm-charcoal bg + tarnished stroke.

### MissionTimeline Design

Vertical timeline adapted from shadcn-timeline patterns:

```
  ◉ dispatch_requested                    14:11:17
    Dispatched to claude (supervised)

  ◉ worker_started                        14:11:17
    claude-sonnet-4-6 · supervised

  ○ backend_delegating                    14:11:17
    scripts/backends/claude.sh

  ⏱ 6m 12s elapsed                       (time gap)

  ◉ status_changed → completed            14:17:30
    Exit code 0 · 6m 13s
```

- Each event: icon (filled/hollow by significance) + event label + timestamp
- Detail line below each label with key data points
- Status-changing events get colored icons with `box-shadow` glow
- Significant events (dispatch_requested, status_changed): larger dot (14px), 2px border, inner bg glow
- Minor events (backend_delegating, task_updated): smaller dot (10px), 1px border, no glow

**Timeline vertical line:**
- Static (completed tasks): `w-px bg-dark-bronze`
- Active (streaming): animated gradient that travels downward — repeating copper→transparent→copper with `background-position` animation. Creates a "data flowing" effect.

**Streaming state:**
- Banner at top: `border-copper/15 bg-copper/4` with ping-animated copper dot + "Streaming live events" + 3 pulsing dots as ellipsis
- Bottom of timeline: ping-animated copper dot + "Waiting for events..."
- New events animate in with `stream-in` (fade-up, 0.35s cubic-bezier spring)

**Time gap indicators:** Small clock SVG icon + mono italic text "6m 12s elapsed". More informative than a dash.

Event type → visual mapping:

| Event | Size | Border | Color | Glow |
|-------|------|--------|-------|------|
| `dispatch_requested` | 14px | 2px | copper | yes |
| `worker_started` | 14px | 2px | bronze | no |
| `status_changed` | 14px | 2px | emerald/rose | yes |
| `backend_delegating` | 10px | 1px | zinc-600 | no |
| `task_updated` | 12px | 1.5px | gold/40 | no |
| `dispatch_spawned` | 14px | 2px | copper | no |
| `dispatch_failed` | 14px | 2px | rose | yes |

### Filter Bar

Compact bar at top of left pane. Two rows with clear visual grouping:

**Row 1:** Search input (with border, focus ring) + Status dropdown (bordered button) + Sort toggle group (bordered pill group: Recent | A-Z | Status)

**Row 2:** Backend toggles with type labels. "All" gets active ring. CLI and API groups separated by `|` divider with tiny mono labels:

```
[All]  |  CLI  Claude  Gemini  |  API  Groq  Google
```

### Stats Bar

Below filter rows, single line: `2 dispatched · 5 completed · 1 reviewed` with status-colored count numbers (mono font, tabular-nums). Right-aligned: total cost across all tasks (`$0.06 total` in tarnished).

## File Plan

### New Files (10)

**packages/studio-core/src/task-events.ts**
Single-task NDJSON event reader. Exports `getTaskEvents(taskId, opts)` and `TaskEvent` type. Extracts agent metrics (duration, tokens, cost) from events.

**packages/studio-ui/src/mission-workspace.tsx**
Top-level client component. Split-pane with ResizeHandle. Manages selection state, URL sync, keyboard navigation. ~250 lines. Mirrors ProcessWorkspace structure.

**packages/studio-ui/src/mission-list.tsx**
Scrollable list of MissionCards. Receives filtered tasks array. Handles focus index for keyboard nav. ~80 lines.

**packages/studio-ui/src/mission-card.tsx**
Individual task card. Status dot, title, initiative, backend/model badges, duration, tokens, cost, verdict. Selected state. ~120 lines.

**packages/studio-ui/src/mission-detail-pane.tsx**
Right pane. Metadata header, tabbed content (Overview/Report/Verdict/Events). Reuses DocRenderer and AcceptanceCriteria. ~200 lines.

**packages/studio-ui/src/mission-timeline.tsx**
Vertical event timeline. Renders TaskEvent[] with type-specific icons and relative timestamps. Handles streaming indicator for active tasks. ~150 lines.

**packages/studio-ui/src/mission-filter-bar.tsx**
Search + backend toggles + status/sort. Backends from BACKEND_META. Two-row compact layout. ~100 lines.

**packages/studio-ui/src/lib/task-styles.ts**
Shared `STATUS_STYLES`, `VERDICT_STYLES`, `PRIORITY_COLORS`, `formatAge()`, `formatDuration()`, `formatTokens()`. Deduplicates from tasks-content and task-detail-content. ~60 lines.

**packages/studio-ui/src/hooks/use-mission-events.ts**
`useMissionEvents(taskId, status)` hook. Opens EventSource for dispatched tasks, accumulates events, cleans up on unmount/change. ~60 lines.

**apps/studio/src/app/api/stream/tasks/[taskId]/route.ts**
SSE endpoint. Reads existing NDJSON, watches for new lines, streams to client. Debounced fs.watch. ~80 lines.

### Modified Files (6)

**packages/studio-core/src/tasks.ts**
Add `durationSeconds`, `tokensInput`, `tokensOutput`, `costUsd` (all `number | null`) to `TaskBoardEntry`. Populate from NDJSON in `getTaskBoard()` and `getTaskDetail()`.

**apps/studio/src/app/tasks/layout.tsx**
Remove `max-w-6xl px-6 py-6` wrapper. Become passthrough `<>{children}</>` matching Process/Dispatch.

**apps/studio/src/app/tasks/page.tsx**
Import MissionWorkspace instead of TasksContent. Pass tasks + initial events.

**apps/studio/src/app/tasks/[slug]/page.tsx**
Import MissionDetailPane standalone (full-width, no split-pane). Load task + events server-side.

**packages/studio-ui/src/task-summary-widget.tsx**
Import shared `STATUS_STYLES`, `PRIORITY_COLORS` from `lib/task-styles.ts` instead of defining locally.

**packages/studio-core/src/index.ts** (or barrel)
Export new `task-events` module.

### Files Replaced

**packages/studio-ui/src/tasks-content.tsx** — Superseded by mission-workspace + mission-list + mission-card + mission-filter-bar. Delete after migration verified.

**packages/studio-ui/src/task-detail-content.tsx** — Superseded by mission-detail-pane + mission-timeline. Delete after migration verified.

## Decisions

### 1. Split-pane reuses ResizeHandle, mirrors ProcessWorkspace

**Chosen:** Copy the ProcessWorkspace structural pattern (listWidth state, localStorage persistence, ResizeHandle import, same min/max constants).

**Rejected:** Fixed proportions (CSS grid 1fr 2fr) — less flexible, can't persist user preference.

**Rejected:** New resizable panel library (react-resizable-panels) — unnecessary dependency for a pattern we've already built.

**Confidence:** high. ProcessWorkspace is proven and the code pattern is well understood.

### 2. SSE via Next.js API route with fs.watch

**Chosen:** Standard Web API `ReadableStream` in a Next.js route handler. `fs.watch` triggers reads of new NDJSON lines. Named SSE events for control flow.

**Rejected:** WebSocket — bidirectional not needed, SSE is simpler and HTTP-native.

**Rejected:** MCP streaming extension — over-engineered for single-task event watching.

**Rejected:** Server-side polling in SSE route — fs.watch is simpler and more responsive. Fall back to 2s polling only if fs.watch proves unreliable (kill criterion from shape).

**Confidence:** high. SSE + fs.watch is standard Node.js, Next.js supports streaming responses natively.

### 3. Agent metrics as optional fields on TaskBoardEntry

**Chosen:** Add 4 nullable fields directly to TaskBoardEntry. Populate at read time by scanning the task's NDJSON event file.

**Rejected:** Separate AgentMetrics type — adds indirection for 4 fields. The data belongs on the task entry.

**Rejected:** Compute metrics client-side from events — wastes bandwidth sending all events for the list view. Server computes once at read time.

**Confidence:** high. Optional fields are backwards-compatible. Existing consumers ignore fields they don't use.

### 4. /tasks/[slug] stays as standalone route

**Chosen:** Keep the route. Render MissionDetailPane full-width (no split-pane). Enables direct linking and URL sharing.

**Rejected:** Redirect to /tasks?node=slug — breaks bookmarks, adds complexity for no benefit.

**Confidence:** high. Same component, two layouts. Minimal additional code.

### 5. Badge styles extracted to shared module

**Chosen:** `lib/task-styles.ts` with `STATUS_STYLES`, `VERDICT_STYLES`, `PRIORITY_COLORS`, plus formatting utilities.

**Rejected:** Leave duplicated in each component — 3 copies today, would be 5 after this initiative.

**Confidence:** high. Pure data maps, no behavioral complexity.

### 6. Cost display is read-only placeholder

**Chosen:** Display `costUsd` from NDJSON events when available, "—" when null. No calculation logic.

**Rationale:** `ai-gateway-dispatch` initiative will add per-generation cost tracking. The UI column exists and is ready; the data pipeline is their scope.

**Confidence:** high. Forward-compatible by design.

### 7. Metric chips pattern in detail header

**Chosen:** Flex row of discrete `metric-chip` containers (label + value) instead of inline text with middot separators. Each metric gets its own bordered card with a tiny uppercase label.

**Rejected:** Inline text with middots (original v1 design) — harder to scan, metrics blur together, no clear visual hierarchy.

**Rejected:** Full-width stat bar (like pipeline cards in old design) — takes too much vertical space for 6 values.

**Confidence:** high. Validated in prototype v2. The chip pattern creates clear scannable metrics without consuming excessive vertical space.

### 8. Detail pane atmospheric depth

**Chosen:** Subtle radial gradients (copper at top-left, session at bottom-right) + CSS noise overlay at 1.5% opacity on the detail pane background. Left pane uses flat `bg-obsidian` for contrast.

**Rejected:** Flat background matching left pane — loses depth, both panes feel like one surface.

**Confidence:** medium. Looks good in prototype but may need tuning against real content density.

### 9. List pane default width 360px (wider than ProcessWorkspace's 300px)

**Chosen:** 360px default. Mission cards show more information per card than process items (badges row, metrics row). The extra 60px prevents truncation of backend+model badge pairs.

**Confidence:** high. ProcessWorkspace items are simpler (title + status). Mission cards need the room.

## Open Questions

1. **fs.watch debounce timing** — 100ms should be sufficient but needs testing with rapid NDJSON writes during dispatch. May need adjustment.

2. **TaskBoardEntry metric population performance** — `getTaskBoard()` currently reads N markdown files. Adding NDJSON reads doubles the I/O. For small task counts (<50) this is fine. If task count grows, consider caching or lazy loading metrics.

3. **AcceptanceCriteria component reuse** — currently defined inside task-detail-content.tsx. Should it move to its own file or stay inlined in mission-detail-pane? Decision deferred to implementation — extract if it grows, inline if it stays compact.
