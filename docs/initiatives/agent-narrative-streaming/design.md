---
designed: 2026-03-16
type: both
components-new: 2
components-modified: 3
files-planned: 8
---

# Design: Agent Narrative Streaming

Fills the black box between `dispatch_spawned` and `status_changed`. Architecture for streaming agent output into NDJSON events, plus a Log tab in the mission detail pane.

## Architecture

### Data Flow

```
Backend process → .log file → sidecar (tail) → -events.ndjson → SSE route → EventSource → UI
                  (grows incrementally)         (agent_output events)       (already works)
```

The sidecar is the only new infrastructure. Everything downstream — the NDJSON file format, the SSE endpoint's fs.watch, the EventSource client, the event dispatch to components — already works. The sidecar's job is to bridge the `.log` file into the NDJSON event stream.

### Event Schema

One new event type added to the existing 7:

```typescript
// Emitted by agent-log-streamer.sh, appended to -events.ndjson
{
  "timestamp": "2026-03-16T04:35:15Z",
  "event": "agent_output",
  "source": "log-streamer",
  "taskSlug": "fix-mcp-server-log-levels",
  "batch": 3,
  "byteOffset": 4096,
  "lineCount": 12,
  "lines": [
    "I found the exact console.error() sites in http-server.ts.",
    "Next I'm reading the surrounding code to confirm which calls are informational..."
  ]
}
```

Fields:
- `batch` — incrementing counter, 1-indexed. Enables ordering and gap detection.
- `byteOffset` — byte position in the .log file where this batch starts. Enables deduplication if the sidecar emits overlapping reads.
- `lineCount` — number of lines in this batch. Enables the timeline's compact indicator without parsing `lines`.
- `lines` — array of text lines, ANSI-stripped. The Log tab concatenates these across batches.

No changes to `TaskEvent` interface — its `data: Record<string, unknown>` already accommodates arbitrary fields. The `agent_output` event type is just a new value of the `event` string discriminator.

### Sidecar: `agent-log-streamer.sh`

```
scripts/agent-log-streamer.sh <log-file> <events-file> <task-slug>
```

Lifecycle:
1. Wait for `<log-file>` to exist (poll every 500ms, timeout after 30s)
2. Track byte offset in the file
3. Every 2 seconds, read new bytes since last offset
4. Strip ANSI escape sequences from new content
5. Split into lines, emit as `agent_output` event to `<events-file>`
6. On SIGTERM (from worker.sh): read remaining bytes, emit final batch, exit

Implementation: pure bash + `tail`/`dd` for byte-offset reads. No Node dependency — the sidecar must be lightweight.

ANSI stripping in bash:
```bash
# Strip ANSI escape sequences — covers color, bold, italic, reset
strip_ansi() {
  sed 's/\x1b\[[0-9;]*[a-zA-Z]//g' | sed 's/\x1b\[[0-9;]*m//g'
}
```

### Worker.sh Integration

Changes to `scripts/worker.sh` around the backend delegation block (lines 171-177):

**Before delegation (after line 169):**
```bash
# Start log streamer sidecar
STREAMER_PID=""
if [[ -n "$SHERPA_LOG_FILE" ]]; then
  bash "$SCRIPT_DIR/agent-log-streamer.sh" \
    "$SHERPA_LOG_FILE" "$EVENTS_FILE" "$TASK_SLUG" &
  STREAMER_PID=$!
fi
```

**After backend exits (after line 177, before line 179):**
```bash
# Stop log streamer — send SIGTERM so it flushes remaining lines
if [[ -n "$STREAMER_PID" ]]; then
  kill "$STREAMER_PID" 2>/dev/null || true
  wait "$STREAMER_PID" 2>/dev/null || true
fi
```

The sidecar runs as a background child process. Worker.sh owns its lifecycle.

### Claude Backend: stream-json Migration

Change `scripts/backends/claude.sh` headless mode to use `--output-format stream-json`:

```bash
ARGS=(
  --print
  --output-format stream-json
  --model "$_model"
  --permission-mode acceptEdits
)
```

This changes the `.log` file from a single markdown blob (written at end) to incremental JSONL written as Claude works. Each line is a JSON object with `type` (e.g., `"assistant"`, `"tool_use"`, `"result"`). The sidecar treats these as text lines — it doesn't parse the JSON structure.

**Fallback:** If `stream-json` causes issues with `acceptEdits` (kill criterion #2 from shape), revert to `--print` text mode. Claude tasks would then get post-hoc log viewing only.

### SSE Route: No Changes

The SSE endpoint at `apps/studio/src/app/api/stream/tasks/[taskId]/route.ts` already:
- Watches the NDJSON file via fs.watch with 100ms debounce
- Reads new bytes past `lastSize`
- Parses new NDJSON lines and sends as `task-event` SSE messages
- Handles terminal status detection

`agent_output` events in the NDJSON file are picked up automatically. No changes needed.

### useMissionEvents Hook: No Changes

The hook at `packages/studio-ui/src/hooks/use-mission-events.ts` already:
- Opens EventSource for dispatched tasks
- Parses `task-event` messages into `MissionEvent` objects
- Appends to events array via `setEvents(prev => [...prev, event])`

`agent_output` events flow through the same path. The hook doesn't need to know about event types — it passes them to consuming components.

## UI Design

### Log Tab — `MissionLogViewer`

Terminal-style monospace viewer. Dark background, JetBrains Mono font, auto-scrolling.

**Data flow:**
```
events.filter(e => e.event === "agent_output")
  → flatMap(e => e.data.lines)
  → join("\n")
  → render as <pre> text
```

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ ● Agent Log                    142 lines · 3.2k │  ← header bar
├─────────────────────────────────────────────────┤
│ OpenAI Codex v0.114.0 (research preview)        │
│ ──────                                          │
│ workdir: /Users/rob/Workbench/sherpa             │
│ model: gpt-5.4                                  │
│ provider: openai                                │
│ ...                                             │
│                                                 │
│ I found the exact console.error() sites in      │
│ http-server.ts. Next I'm reading the surround-  │
│ ing code to confirm which calls are informat-   │
│ ional versus actual error handling.              │
│                                                 │  ← scrollable area
│ > rg -n "console\.error" http-server.ts         │
│ 76: console.error(...)                          │
│ 95: console.error(...)                          │
│ ...                                             │
│                                                 │
│ ● Streaming...                                  │  ← streaming tail (when active)
└─────────────────────────────────────────────────┘
```

**Header bar:** "Agent Log" label with copper dot (pulsing when streaming). Right side: line count + character count. Monospace, dim text.

**Body:** `<pre>` element inside a `ScrollArea` with `max-h-[600px]`. Background: `bg-[var(--color-obsidian)]` matching the app's dark theme. Text: `text-zinc-400`, 12px JetBrains Mono. Line height: 1.6 for readability.

**Auto-scroll:** When streaming, scroll to bottom on each new batch. Track a `userScrolledUp` flag — if the user scrolls up, disable auto-scroll until they scroll back to bottom. Use an `IntersectionObserver` on a sentinel div at the bottom.

**Streaming indicator:** At the bottom of the log text, when streaming: a pulsing copper dot + "Streaming..." in dim copper text. Same visual language as the Events tab.

**Empty state:** "No agent output" with subtitle "Output appears when the agent starts working." Same pattern as other tab empty states.

**Line cap:** Render last 1,000 lines. If more exist, show a muted bar at top: "Showing last 1,000 of N lines" — no "load more" button needed (full output is in the .log file).

### Tab Integration

Add "Log" tab to `MissionDetailPane` between "Report" and "Events":

```tsx
<TabsTrigger value="log" className={cn(TAB_TRIGGER_CLASS, "relative")}>
  Log
  {isStreaming && hasAgentOutput && (
    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full
      bg-[var(--color-copper)] animate-[pulse_2s_ease-in-out_infinite]" />
  )}
</TabsTrigger>
```

The pulsing dot on the Log tab only appears when:
1. The task is streaming (`isStreaming === true`)
2. There are `agent_output` events in the event stream

This avoids the dot appearing during the brief dispatch phase before the agent starts producing output.

**Tab content:**
```tsx
<TabsContent value="log" className="overflow-hidden">
  <MissionLogViewer events={events} isStreaming={isStreaming} />
</TabsContent>
```

### Timeline: Compact `agent_output` Indicators

In `MissionTimeline`, add a rendering case for `agent_output` events. But don't render each batch individually — that would flood the timeline. Instead, collapse consecutive `agent_output` events into a single indicator:

```
    ● dispatch_spawned                          21:35:01
      PID 35096 · claude · engineer · supervised

    ◦ ░░░░░░░░ 142 lines of agent output ░░░░░ 21:35:01–21:35:38
      View in Log tab

    ● status_changed  [completed]               21:35:39
      dispatched → completed · Exit code 0
```

**Implementation:** In the `items` array builder, collapse consecutive `agent_output` events into a single `{ type: "agent-activity", lineCount: N, startTime: string, endTime: string }` item. This replaces the gap indicator that would otherwise show "38s elapsed."

**Visual:** Small zinc dot (h-2.5 w-2.5), dimmed. A subtle repeating gradient bar (like the streaming timeline line effect but horizontal, static). Line count + time range. "View in Log tab" as detail text — not clickable (user switches tabs manually).

## File Plan

### New Files (2)

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `scripts/agent-log-streamer.sh` | Sidecar: tails .log file, emits agent_output events to NDJSON | ~80 |
| `packages/studio-ui/src/mission-log-viewer.tsx` | Terminal-style log viewer component | ~120 |

### Modified Files (6)

| File | Change | Lines changed (est.) |
|------|--------|---------------------|
| `scripts/worker.sh` | Start/stop sidecar around backend delegation | +15 |
| `scripts/backends/claude.sh` | Add `--output-format stream-json` to ARGS | +1 |
| `packages/studio-core/src/task-events.ts` | Document `agent_output` event type (JSDoc only — no interface change needed) | +8 |
| `packages/studio-ui/src/mission-detail-pane.tsx` | Add Log tab trigger + content | +15 |
| `packages/studio-ui/src/mission-timeline.tsx` | Collapse agent_output events into activity indicators | +40 |
| `packages/studio-ui/src/index.ts` | Export MissionLogViewer | +1 |

**Total: 8 files, ~280 lines of new/changed code.**

## Decisions

**Sidecar byte-offset tracking over line-count tracking.**
The sidecar tracks byte position, not line number, in the .log file. Byte offsets are cheaper to compute (`wc -c` vs `wc -l`) and work correctly with partial lines (a backend might flush mid-line). The `byteOffset` field in events enables deduplication at the UI layer if needed.
- Alternative rejected: Line-count tracking — fragile with partial line flushes, requires the sidecar to handle incomplete final lines.
- Confidence: high.

**Consecutive agent_output collapse in timeline over per-batch rendering.**
The timeline shows one collapsed indicator per continuous block of agent activity, not one entry per 2-second batch. A 60-second task with 30 batches would otherwise add 30 timeline entries — overwhelming the dispatch events that actually matter.
- Alternative rejected: Show every batch — floods timeline, buries dispatch events.
- Alternative rejected: Hide agent_output from timeline entirely — loses the "agent was active here" signal that replaces gap indicators.
- Confidence: high.

**ANSI stripping in sidecar over stripping in UI.**
The sidecar strips ANSI before writing to NDJSON. This keeps event data clean and avoids shipping ANSI codes to the browser. The `.log` file retains original ANSI (it's the canonical source for raw output).
- Alternative rejected: Strip in UI — sends unnecessary bytes over SSE, requires a browser-side ANSI library.
- Confidence: high.

**No changes to SSE route.**
The existing fs.watch + debounce + partial-read mechanism handles `agent_output` events identically to any other NDJSON event. Adding event-type awareness to the SSE route would be unnecessary coupling.
- Confidence: high.

## Open Questions

1. **Claude stream-json + acceptEdits compatibility.** Must verify in Session 1. The `--output-format stream-json` flag has only been confirmed to work with `--print` — unclear if `--permission-mode acceptEdits` changes behavior. Kill criterion #2 from shape covers the fallback.

2. **Sidecar performance with very fast backends.** If a backend completes in < 2 seconds (the sidecar's batch interval), the sidecar may not emit any batches before receiving SIGTERM. The flush-on-exit handler covers this, but the timing is tight. May need to reduce the initial batch interval to 500ms for the first few seconds.

3. **NDJSON file size growth.** A verbose task (e.g., Codex with 200+ lines of output) will add `agent_output` events that roughly double the NDJSON file size. The SSE route reads the full file on connect — this should remain fast for files under 1MB, but should be monitored. Kill criterion #4 from shape (5MB cap) provides the guardrail.
