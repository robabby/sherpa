---
appetite: 4 sessions
shaped: 2026-03-14
---

# Shape: Studio Agent Missions

## Appetite

**4 sessions.** Evolutionary risk with one infrastructure addition: real-time SSE streaming. The split-pane pattern exists (`ProcessWorkspace`), the data layer exists (`getTaskBoard`/`getTaskDetail`), and the NDJSON parser exists (`readAllEvents`). But making the mission control *live* — events streaming into the timeline as agents work — requires a new SSE route and file watcher. That's the fourth session.

**Session budget:**
- Session 1: Full-viewport layout, split-pane, task card list replacing table
- Session 2: Detail pane with agent metadata, dynamic filter bar, event timeline (static)
- Session 3: SSE streaming — API route with `fs.watch` on NDJSON files, `EventSource` client, live timeline updates
- Session 4: Polish — visual verification, edge cases, replace 5s polling in dispatch-content with SSE

## Shaped Solution

### Fat-Marker Sketch

The Tasks page becomes a full-viewport split-pane mission control. Left pane: scrollable list of task cards with agent metadata (status dot, title, model badges, duration, tokens, cost, verdict). Right pane: mission detail with metadata header, structured content tabs, and event timeline. When a mission is in flight, events stream into the timeline in real time.

**Three layers:**

1. **Mission list (left pane)** — Card per task. Each card shows enough to triage: status, title, two-badge model pattern (`[Groq]` `[llama-3.3-70b]`), CLI/API badge, duration, humanized token count, cost, verdict. Filter bar at top with backend toggles derived from `BACKEND_META`, initiative dropdown, status filter.

2. **Mission detail (right pane)** — Metadata header (full provider/model/duration/tokens/cost breakdown). Below: tabbed content — Objective + Acceptance Criteria, Report/Output, Verdict, Events timeline. Replaces navigating to `/tasks/[slug]`.

3. **Event timeline (tab in detail pane)** — Vertical timeline rendering NDJSON events. Each event gets a type-appropriate icon, label, and relative timestamp. Uses shadcn-timeline pattern (copy component, not install dependency). For active dispatches, new events stream in via SSE.

**Real-time streaming architecture:**

- **SSE API route** at `/api/stream/tasks/[taskId]/route.ts` — opens a `ReadableStream`, reads existing NDJSON events, then uses `fs.watch` on the event file to push new lines as they're appended. Closes when the client disconnects or the task completes.
- **Client consumer** — `EventSource` in the detail pane component. Connects when viewing a dispatched task, appends events to timeline state, auto-closes on task completion.
- **Replaces polling** — the existing 5-second `setInterval` + `router.refresh()` in dispatch-content can be replaced with the same SSE pattern. The list pane subscribes to a lightweight SSE endpoint that pushes task status transitions.
- **No WebSocket, no MCP extension** — SSE is unidirectional (server→client) which is exactly what monitoring needs. `fs.watch` on NDJSON files is the push trigger.

**Key architectural choices:**

- **Reuse `ResizeHandle` from `/process`** — proven, persists width to localStorage. Same min/max/default pattern.
- **Extend `TaskBoardEntry` with optional agent metrics** — `durationSeconds`, `tokensInput`, `tokensOutput`, `costUsd` as `number | null`. Populated from NDJSON events where available, null for CLI backends that don't report.
- **Cost display is read-only** — show `costUsd` from NDJSON events or API responses. Per-generation cost tracking is coming via the `ai-gateway-dispatch` initiative; this UI will consume that data when it arrives. For now, display what's available, show "—" when null.
- **Filter bar uses `BACKEND_META`** — dynamic, no hardcoded backend list. Group by CLI/API type.
- **`/tasks/[slug]` stays** as a direct-link route. Renders the same detail component, just full-width instead of in right pane. Enables sharing links.
- **Layout becomes edge-to-edge** — remove `max-w-6xl` wrapper, match `/process` height calc.

## Rabbit Holes

1. **Token extraction from CLI backend logs.** Claude Code, Codex, and other CLI backends don't emit structured token usage. Parsing it from `.log` files is fragile and backend-specific. **Avoidance:** Token/cost fields are `null` for CLI backends. Show "—" in the UI. Only API backends (which return structured `usage` objects) populate these fields. Don't parse logs.

2. **Resizable split-pane responsive behavior.** Mobile/narrow viewports with split panes get complicated (collapse to single pane, drawer, etc.). **Avoidance:** The Studio is a desktop tool. Set a minimum viewport width for split-pane. On narrow screens, stack panes vertically or hide detail until selected. Don't build a full responsive system.

3. **shadcn-timeline as a dependency.** The library is small but adding it as a package dep introduces maintenance surface. **Avoidance:** Copy the timeline component files into `studio-ui` (matches shadcn/ui's copy-paste philosophy). Adapt to our palette. Don't `pnpm add` it.

4. **Cost calculation engine.** Provider pricing changes frequently. Building a price-per-token calculator is `ai-gateway-dispatch` scope, not ours. **Avoidance:** Display `costUsd` as reported by NDJSON events or API responses. Don't calculate costs. When `ai-gateway-dispatch` lands per-generation cost data, the UI columns are already there to consume it.

5. **SSE connection management at scale.** If many tasks are dispatched simultaneously, naive per-task SSE connections could pile up. **Avoidance:** Only open SSE for the currently-viewed task in the detail pane. The list pane uses a single lightweight SSE connection (or keeps the existing polling pattern) for status-level changes. Don't build a multiplexed event bus.

6. **fs.watch cross-platform reliability.** `fs.watch` has known quirks (double-fires on macOS, missing events on Linux). **Avoidance:** Use `fs.watch` with debounce (100ms). If an event is missed, the client can always do a full re-read on tab focus or manual refresh. Don't add chokidar — it's a heavy dependency for watching one file at a time.

## No-Gos

- **No CLI token parsing** — don't parse `.log` files for token counts. Accept null.
- **No cost calculator** — display what events/API report. Pricing tables are `ai-gateway-dispatch` scope.
- **No drag-and-drop reordering** — this is a monitoring view, not a project board.
- **No task creation/editing from this page** — dispatch happens in `/dispatch`. This page monitors.
- **No global activity feed** — timeline is per-task only. Cross-task feed is a separate initiative.
- **No flamegraph/waterfall visualization** — vertical timeline only. Advanced trace viz is future work.
- **No WebSocket or MCP streaming extension** — SSE via Next.js API route only. Unidirectional is sufficient.

## Kill Criteria

1. **If the split-pane layout takes more than 1 session**, stop. The pattern is proven in ProcessWorkspace — if it's fighting us here, the component abstraction is wrong and needs extraction first.
2. **If TaskBoardEntry extension breaks existing consumers**, stop and assess. The type is used across task board, detail view, summary widget, and MCP. Adding optional fields should be safe, but if it cascades, reshape.
3. **If NDJSON event files are inconsistent enough that the timeline is mostly empty**, reconsider. Check at least 3 completed tasks' event files before building the timeline component. If <50% have usable events, the timeline feature should be deferred.
4. **If SSE streaming can't reliably detect new NDJSON lines via `fs.watch`**, fall back to 2-second polling within the SSE route (server-side poll, client still gets clean SSE stream). Don't let fs.watch quirks block the feature — the abstraction boundary is the SSE response, not the file-watching mechanism.
5. **If session 3 isn't complete by end of session 3**, ship without live streaming. Static timeline + manual refresh is the fallback. Streaming becomes a fast follow-on.
