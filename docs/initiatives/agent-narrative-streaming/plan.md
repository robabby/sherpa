# Agent Narrative Streaming — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stream backend agent output (Claude, Codex, Gemini) into the NDJSON event file in real-time and surface it in a new Log tab in the mission detail pane.

**Architecture:** A sidecar shell script tails the `.log` file during dispatch, strips ANSI codes, batches lines every 2s, and appends `agent_output` events to the existing `-events.ndjson` file. The SSE endpoint and EventSource hook already watch NDJSON — no changes needed to the streaming pipeline. A new `MissionLogViewer` component renders the output as a terminal-style monospace feed. The Claude backend switches to `--output-format stream-json` for incremental output.

**Tech Stack:** Bash (sidecar), TypeScript/React (UI), Next.js App Router (existing SSE), Tailwind v4 + shadcn/ui patterns, `ScrollArea` for log viewer.

---

## Session 1: Streaming Infrastructure

### Task 1: Claude backend stream-json migration

**Files:**
- Modify: `scripts/backends/claude.sh:41-45`

**Step 1: Add `--output-format stream-json` to headless ARGS**

In `scripts/backends/claude.sh`, the current ARGS block:

```bash
ARGS=(
  --print
  --model "$_model"
  --permission-mode acceptEdits
)
```

Change to:

```bash
ARGS=(
  --print
  --output-format stream-json
  --model "$_model"
  --permission-mode acceptEdits
)
```

This switches Claude from buffered text output (written at end) to incremental JSONL (written as Claude works). The `.log` file grows line-by-line during execution instead of all at once.

**Step 2: Verify compatibility**

Run a quick test dispatch to confirm `--output-format stream-json` works with `--permission-mode acceptEdits`:

```bash
echo "Say hello" | claude --print --output-format stream-json --model claude-sonnet-4-6 --permission-mode acceptEdits
```

Expected: JSONL lines printed to stdout (each line is a JSON object with a `type` field). If this fails or produces no output, revert to `--print` without `--output-format` (kill criterion #2 from shape).

**Step 3: Commit**

```bash
git add scripts/backends/claude.sh
git commit -m "feat(dispatch): switch Claude backend to stream-json for incremental output"
```

---

### Task 2: Create the sidecar log streamer

**Files:**
- Create: `scripts/agent-log-streamer.sh`

**Step 1: Write the sidecar script**

```bash
#!/usr/bin/env bash
# scripts/agent-log-streamer.sh — Sidecar that tails a .log file and emits
# agent_output events to an NDJSON events file.
#
# Usage: agent-log-streamer.sh <log-file> <events-file> <task-slug>
#
# Lifecycle:
#   1. Wait for <log-file> to exist (poll 500ms, timeout 60s)
#   2. Every 2s, read new bytes since last offset
#   3. Strip ANSI escape sequences
#   4. Emit agent_output event to <events-file>
#   5. On SIGTERM: flush remaining bytes, exit

set -uo pipefail

LOG_FILE="$1"
EVENTS_FILE="$2"
TASK_SLUG="$3"

BATCH=0
LAST_SIZE=0

# ── ANSI stripping ──────────────────────────────────────────────────
strip_ansi() {
  # Strip CSI sequences (colors, bold, italic, reset) and OSC sequences
  sed $'s/\x1b\\[[0-9;]*[a-zA-Z]//g' | sed $'s/\x1b\\][^\x07]*\x07//g'
}

# ── Emit one agent_output event ─────────────────────────────────────
emit_batch() {
  local raw_text="$1"
  [[ -z "$raw_text" ]] && return

  BATCH=$((BATCH + 1))
  local ts
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Build lines JSON array: split on newlines, escape for JSON
  local lines_json
  lines_json=$(printf '%s' "$raw_text" | strip_ansi | node -e "
    let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
      const lines = d.split('\n').filter(l => l.length > 0);
      console.log(JSON.stringify(lines));
    });
  ")

  local line_count
  line_count=$(printf '%s' "$raw_text" | grep -c '' || echo 0)

  echo "{\"timestamp\":\"$ts\",\"event\":\"agent_output\",\"source\":\"log-streamer\",\"taskSlug\":\"$TASK_SLUG\",\"batch\":$BATCH,\"byteOffset\":$LAST_SIZE,\"lineCount\":$line_count,\"lines\":$lines_json}" >> "$EVENTS_FILE"
}

# ── Read new bytes from log file ────────────────────────────────────
read_new_bytes() {
  [[ ! -f "$LOG_FILE" ]] && return
  local current_size
  current_size=$(wc -c < "$LOG_FILE" 2>/dev/null | tr -d ' ')
  [[ -z "$current_size" ]] && return
  [[ "$current_size" -le "$LAST_SIZE" ]] && return

  local new_bytes
  new_bytes=$(dd if="$LOG_FILE" bs=1 skip="$LAST_SIZE" count=$((current_size - LAST_SIZE)) 2>/dev/null)
  LAST_SIZE=$current_size

  emit_batch "$new_bytes"
}

# ── SIGTERM handler: flush and exit ─────────────────────────────────
flush_and_exit() {
  read_new_bytes
  exit 0
}
trap flush_and_exit SIGTERM SIGINT

# ── Wait for log file to exist ──────────────────────────────────────
WAIT_COUNT=0
while [[ ! -f "$LOG_FILE" ]]; do
  sleep 0.5
  WAIT_COUNT=$((WAIT_COUNT + 1))
  if [[ $WAIT_COUNT -ge 120 ]]; then
    # 60 seconds — give up
    exit 0
  fi
done

# ── Main loop: read new bytes every 2s ──────────────────────────────
while true; do
  read_new_bytes
  sleep 2
done
```

**Step 2: Make it executable**

```bash
chmod +x scripts/agent-log-streamer.sh
```

**Step 3: Test the sidecar manually**

In one terminal, create a test log file and append to it:

```bash
mkdir -p /tmp/streamer-test
echo '{"type":"text","text":"Hello from agent"}' > /tmp/streamer-test/test.log
```

In another terminal, start the sidecar:

```bash
bash scripts/agent-log-streamer.sh /tmp/streamer-test/test.log /tmp/streamer-test/events.ndjson test-task
```

In the first terminal, append more lines:

```bash
echo "Agent is reading files..." >> /tmp/streamer-test/test.log
sleep 3
echo "Agent is editing code..." >> /tmp/streamer-test/test.log
```

After a few seconds, check the events file:

```bash
cat /tmp/streamer-test/events.ndjson
```

Expected: `agent_output` events with `lines` arrays containing the text, ANSI-stripped. Kill the sidecar with Ctrl+C — it should flush remaining bytes.

Clean up:

```bash
rm -rf /tmp/streamer-test
```

**Step 4: Commit**

```bash
git add scripts/agent-log-streamer.sh
git commit -m "feat(dispatch): add agent-log-streamer sidecar for tailing backend output"
```

---

### Task 3: Integrate sidecar into worker.sh

**Files:**
- Modify: `scripts/worker.sh:169-177`

**Step 1: Start the sidecar before backend delegation**

After line 169 (`log_event "backend_delegating" ...`), before line 172 (`EXIT_CODE=0`), add:

```bash
# ── Start log streamer sidecar ────────────────────────────────────────
STREAMER_PID=""
if [[ -n "${SHERPA_LOG_FILE:-}" ]]; then
  bash "$SCRIPT_DIR/agent-log-streamer.sh" \
    "$SHERPA_LOG_FILE" "$EVENTS_FILE" "$TASK_SLUG" &
  STREAMER_PID=$!
fi
```

**Step 2: Stop the sidecar after backend exits**

After the backend delegation block (after line 177 `fi`), before line 179 (`COMPLETED_AT=...`), add:

```bash
# ── Stop log streamer sidecar ─────────────────────────────────────────
if [[ -n "$STREAMER_PID" ]]; then
  kill "$STREAMER_PID" 2>/dev/null || true
  wait "$STREAMER_PID" 2>/dev/null || true
fi
```

**Step 3: Verify with a real dispatch**

Create a minimal test task and dispatch it:

```bash
# Create a quick test task
cat > docs/tasks/test-streamer.md << 'EOF'
---
id: test-streamer
status: pending
role: engineer
priority: low
initiative: null
backend: claude
model: claude-sonnet-4-6
task-type: code-implementation
mode: supervised
budget-usd: 0.10
worktree: null
branch: null
created: 2026-03-16
---

# Test streamer

## Objective
Say "Hello, the streamer works!" and nothing else.
EOF

# Dispatch
bash scripts/worker.sh test-streamer
```

After completion, check:

```bash
cat docs/tasks/logs/test-streamer-events.ndjson | grep agent_output | head -3
```

Expected: `agent_output` events with batched lines from Claude's stream-json output. The events should have incrementing `batch` numbers and `byteOffset` values.

Clean up the test task:

```bash
rm docs/tasks/test-streamer.md docs/tasks/logs/test-streamer*
```

**Step 4: Commit**

```bash
git add scripts/worker.sh
git commit -m "feat(dispatch): integrate log-streamer sidecar into worker.sh lifecycle"
```

---

### Task 4: Document agent_output event type

**Files:**
- Modify: `packages/studio-core/src/task-events.ts:1-16`

**Step 1: Add JSDoc for agent_output to the TaskEvent interface**

Above the `TaskEvent` interface (line 4), add a doc comment describing all event types including the new one:

```typescript
/**
 * A single event from a task's NDJSON event log.
 *
 * Event types:
 * - `dispatch_requested` — Task dispatch initiated from Studio UI
 * - `task_updated` — Task frontmatter field changed
 * - `worker_started` — Worker.sh began processing
 * - `status_changed` — Task status transition (pending→dispatched→completed/failed)
 * - `backend_delegating` — Worker delegating to backend script
 * - `dispatch_spawned` — Backend process started (PID assigned)
 * - `dispatch_failed` — Backend process failed to start
 * - `agent_output` — Batched text lines from agent's runtime output.
 *   Data: { lines: string[], batch: number, byteOffset: number, lineCount: number }
 */
```

This is documentation only — no interface change needed since `data: Record<string, unknown>` already accommodates the fields.

**Step 2: Run typecheck**

```bash
pnpm check
```

Expected: All packages pass with no errors.

**Step 3: Commit**

```bash
git add packages/studio-core/src/task-events.ts
git commit -m "docs(studio-core): document agent_output event type in TaskEvent JSDoc"
```

---

### Session 1 Review Checkpoint

At this point, verify:
- [ ] Claude backend uses `--output-format stream-json`
- [ ] Sidecar tails `.log` and emits `agent_output` events to NDJSON
- [ ] Worker.sh starts sidecar before backend, kills it after backend exits
- [ ] A real dispatch produces `agent_output` events in the NDJSON file
- [ ] `pnpm check` passes

---

## Session 2: Log Tab UI

### Task 5: Create MissionLogViewer component

**Files:**
- Create: `packages/studio-ui/src/mission-log-viewer.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaskEvent } from "@sherpa/studio-core/task-events";

// ---------------------------------------------------------------------------
// ANSI fallback stripper (in case sidecar missed some)
// ---------------------------------------------------------------------------

const ANSI_RE = /\x1b\[[0-9;]*[a-zA-Z]/g;
function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, "");
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_LINES = 1000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MissionLogViewerProps {
  events: TaskEvent[];
  isStreaming: boolean;
}

export function MissionLogViewer({ events, isStreaming }: MissionLogViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Extract lines from agent_output events
  const agentEvents = events.filter((e) => e.event === "agent_output");
  const allLines: string[] = [];
  for (const ev of agentEvents) {
    const lines = ev.data.lines;
    if (Array.isArray(lines)) {
      for (const line of lines) {
        allLines.push(stripAnsi(String(line)));
      }
    }
  }

  const totalLines = allLines.length;
  const truncated = totalLines > MAX_LINES;
  const displayLines = truncated ? allLines.slice(-MAX_LINES) : allLines;
  const displayText = displayLines.join("\n");

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayText, autoScroll]);

  // Track user scroll position to disable auto-scroll when scrolled up
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      setAutoScroll(atBottom);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Empty state
  if (agentEvents.length === 0 && !isStreaming) {
    return (
      <div className="rounded-lg border border-muted-foreground/10 bg-card/10 px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground/40">No agent output</p>
        <p className="mt-1 text-xs text-muted-foreground/25">
          Output appears when the agent starts working
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-dark-bronze)] bg-[var(--color-obsidian)] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-[var(--color-dark-bronze)]/60 px-4 py-2">
        <span
          className={`h-2 w-2 rounded-full ${
            isStreaming && agentEvents.length > 0
              ? "bg-[var(--color-copper)]"
              : "bg-emerald-500"
          }`}
          style={
            isStreaming && agentEvents.length > 0
              ? { animation: "pulse 2s ease-in-out infinite" }
              : undefined
          }
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-dim)]">
          Agent Log
        </span>
        <div className="flex-1" />
        {totalLines > 0 && (
          <span className="font-mono text-[10px] tabular-nums text-[var(--color-dim)]">
            {totalLines} lines
          </span>
        )}
      </div>

      {/* Log body */}
      <div ref={scrollRef} className="overflow-y-auto overflow-x-auto" style={{ maxHeight: 520 }}>
        {truncated && (
          <div className="border-b border-[var(--color-dark-bronze)]/30 bg-[var(--color-warm-charcoal)]/30 px-4 py-1.5">
            <span className="font-mono text-[10px] text-[var(--color-dim)]">
              Showing last {MAX_LINES.toLocaleString()} of {totalLines.toLocaleString()} lines
            </span>
          </div>
        )}
        <pre className="px-4 py-3 font-mono text-xs leading-[1.7] text-zinc-400 whitespace-pre-wrap [tab-size:2]">
          {displayText}
        </pre>

        {/* Streaming tail */}
        {isStreaming && (
          <div className="flex items-center gap-2 px-4 pb-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-copper)]/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-copper)]/60" />
            </span>
            <span className="font-mono text-[10px] text-[var(--color-copper)]/50">
              Streaming...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
```

Key design decisions:
- Uses `"use client"` directive — has `useState`, `useEffect`, `useRef` (per React best practices `rerender-*` rules)
- Filters events client-side rather than server — `agent_output` events flow through the same SSE path as all other events
- ANSI fallback stripper — the sidecar strips most ANSI but this catches any leakage
- `MAX_LINES = 1000` with truncation bar — avoids rendering performance issues (per `rendering-content-visibility` guideline)
- Auto-scroll with user-scroll-up detection via scroll position check (not `IntersectionObserver` — simpler for a pre element)
- Uses app's CSS custom properties (`--color-obsidian`, `--color-dark-bronze`, etc.) — matches the atmospheric depth pattern from `MissionDetailPane`
- Empty state matches existing tab empty state pattern from `mission-detail-pane.tsx:413-421`

**Step 2: Run typecheck**

```bash
pnpm check
```

Expected: Pass. The component uses the same `TaskEvent` import pattern as `MissionTimeline`.

**Step 3: Commit**

```bash
git add packages/studio-ui/src/mission-log-viewer.tsx
git commit -m "feat(studio-ui): add MissionLogViewer terminal-style component"
```

---

### Task 6: Export MissionLogViewer from studio-ui

**Files:**
- Modify: `packages/studio-ui/src/index.ts`

**Step 1: Add export**

Find the existing mission component exports (near `MissionTimeline`, `MissionDetailPane`, etc.) and add:

```typescript
export { MissionLogViewer } from "./mission-log-viewer";
```

**Step 2: Add re-export in Studio app**

Check if the Studio app has re-export files for mission components (like `apps/studio/src/components/studio/mission-timeline.tsx`). If so, create a matching re-export:

```typescript
// apps/studio/src/components/studio/mission-log-viewer.tsx
export { MissionLogViewer } from "@sherpa/studio-ui";
```

**Step 3: Run typecheck**

```bash
pnpm check
```

**Step 4: Commit**

```bash
git add packages/studio-ui/src/index.ts
# Include the re-export file if created
git commit -m "feat(studio-ui): export MissionLogViewer"
```

---

### Task 7: Add Log tab to MissionDetailPane

**Files:**
- Modify: `packages/studio-ui/src/mission-detail-pane.tsx:1-11,350-462`

**Step 1: Add import**

At the top of `mission-detail-pane.tsx`, add the import alongside the existing `MissionTimeline` import (line 10):

```typescript
import { MissionLogViewer } from "./mission-log-viewer";
```

**Step 2: Add Log tab trigger**

In the `TabsList` (between the Report trigger at line 358 and the Verdict trigger at line 359), add:

```tsx
          <TabsTrigger value="log" className={cn(TAB_TRIGGER_CLASS, "relative")}>
            Log
            {isStreaming && events.some((e) => e.event === "agent_output") && (
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[var(--color-copper)] animate-[pulse_2s_ease-in-out_infinite]" />
            )}
          </TabsTrigger>
```

The pulsing dot only shows when streaming AND agent_output events exist. This matches the Events tab pattern at line 362-367.

**Step 3: Add Log tab content**

After the Report `TabsContent` (after line 422) and before the Verdict `TabsContent` (line 425), add:

```tsx
        {/* Log tab */}
        <TabsContent value="log" className="overflow-hidden">
          <MissionLogViewer events={events} isStreaming={isStreaming} />
        </TabsContent>
```

**Step 4: Run typecheck**

```bash
pnpm check
```

**Step 5: Run the dev server and verify visually**

```bash
pnpm dev
```

Navigate to `/tasks`, select a completed task that has `agent_output` events. The Log tab should appear between Report and Verdict. Click it — the terminal viewer should render the agent's output.

**Step 6: Commit**

```bash
git add packages/studio-ui/src/mission-detail-pane.tsx
git commit -m "feat(studio-ui): add Log tab to mission detail pane"
```

---

### Task 8: Add compact agent_output indicators to MissionTimeline

**Files:**
- Modify: `packages/studio-ui/src/mission-timeline.tsx:252-270`

**Step 1: Add agent-activity item type and collapse logic**

In the `TimelineItem` type union (around line 253), add a third variant:

```typescript
  type TimelineItem =
    | { type: "event"; event: TaskEvent }
    | { type: "gap"; durationMs: number }
    | { type: "agent-activity"; lineCount: number; startTime: string; endTime: string };
```

**Step 2: Replace the items builder loop**

Replace the items builder (lines 257-269) with logic that collapses consecutive `agent_output` events:

```typescript
  const items: TimelineItem[] = [];
  let agentBlock: { lineCount: number; startTime: string; endTime: string } | null = null;

  const flushAgentBlock = () => {
    if (agentBlock) {
      items.push({ type: "agent-activity", ...agentBlock });
      agentBlock = null;
    }
  };

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!;

    if (ev.event === "agent_output") {
      const lc = typeof ev.data.lineCount === "number" ? ev.data.lineCount : 0;
      if (!agentBlock) {
        agentBlock = { lineCount: lc, startTime: ev.timestamp, endTime: ev.timestamp };
      } else {
        agentBlock.lineCount += lc;
        agentBlock.endTime = ev.timestamp;
      }
      continue;
    }

    // Non-agent event — flush any accumulated agent block
    flushAgentBlock();
    items.push({ type: "event", event: ev });

    // Insert gap indicator if >30s between this and next non-agent event
    if (i < events.length - 1) {
      // Find next non-agent event
      let nextIdx = i + 1;
      while (nextIdx < events.length && events[nextIdx]!.event === "agent_output") {
        nextIdx++;
      }
      if (nextIdx < events.length) {
        const gap = getTimestampMs(events[nextIdx]!.timestamp) - getTimestampMs(ev.timestamp);
        // Only show gap if there's no agent activity filling it
        const hasAgentBetween = events.slice(i + 1, nextIdx).some(e => e.event === "agent_output");
        if (gap > 30_000 && !hasAgentBetween) {
          items.push({ type: "gap", durationMs: gap });
        }
      }
    }
  }
  // Flush any trailing agent block
  flushAgentBlock();
```

**Step 3: Add rendering for agent-activity items**

In the `items.map` callback (around line 318), add a case for `agent-activity` before the existing `event` case:

```tsx
          if (item.type === "agent-activity") {
            return (
              <div key={`agent-${i}`} className="relative flex gap-4 pb-6">
                <div className="relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full border border-zinc-600/40 bg-zinc-700/30" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-600">agent output</span>
                    <div className="mx-1 h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800/50">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "100%",
                          background:
                            "repeating-linear-gradient(90deg, rgba(196,154,108,0.12) 0px, rgba(196,154,108,0.06) 4px, transparent 8px, transparent 12px)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-zinc-600">
                      {formatTime(item.startTime)}
                      {item.startTime !== item.endTime && `–${formatTime(item.endTime)}`}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-700">
                    {item.lineCount} lines · View in Log tab
                  </p>
                </div>
              </div>
            );
          }
```

**Step 4: Run typecheck**

```bash
pnpm check
```

**Step 5: Verify visually**

With `pnpm dev` running, navigate to a task with `agent_output` events. The Events tab should show a collapsed agent activity indicator between `dispatch_spawned` and `status_changed`, replacing the old gap indicator.

**Step 6: Commit**

```bash
git add packages/studio-ui/src/mission-timeline.tsx
git commit -m "feat(studio-ui): collapse agent_output events into activity indicators in timeline"
```

---

### Session 2 Review Checkpoint

At this point, verify:
- [ ] `MissionLogViewer` renders agent output as terminal-style text
- [ ] Log tab appears in mission detail pane between Report and Verdict
- [ ] Log tab has pulsing indicator during streaming with agent_output events
- [ ] Timeline collapses consecutive agent_output events into a single activity indicator
- [ ] Gap indicators don't appear when agent activity fills the gap
- [ ] Auto-scroll works during streaming, stops when user scrolls up
- [ ] Empty state shows when no agent_output events exist
- [ ] `pnpm check` passes
- [ ] `pnpm build` succeeds

---

## Session 3: Polish & Cross-Backend Testing

### Task 9: Sidecar batch tuning and flush reliability

**Files:**
- Modify: `scripts/agent-log-streamer.sh`

**Step 1: Add initial fast-batch period**

For the first 10 seconds of streaming, use 500ms batch intervals instead of 2s. This ensures fast-completing tasks (< 5s) still get at least a few batches. After 10 seconds, switch to the normal 2s interval.

Replace the main loop at the bottom:

```bash
# ── Main loop: fast batch initially, then normal interval ───────────
LOOP_COUNT=0
while true; do
  read_new_bytes
  if [[ $LOOP_COUNT -lt 20 ]]; then
    # First 10 seconds: 500ms interval (20 iterations × 0.5s)
    sleep 0.5
  else
    sleep 2
  fi
  LOOP_COUNT=$((LOOP_COUNT + 1))
done
```

**Step 2: Verify flush-on-exit works with fast tasks**

```bash
# Quick test: start sidecar, write immediately, kill after 1s
echo "test line 1" > /tmp/test.log
bash scripts/agent-log-streamer.sh /tmp/test.log /tmp/test-events.ndjson test &
PID=$!
sleep 1
echo "test line 2" >> /tmp/test.log
sleep 0.5
kill $PID
wait $PID 2>/dev/null
cat /tmp/test-events.ndjson
rm /tmp/test.log /tmp/test-events.ndjson
```

Expected: At least one `agent_output` event containing both lines.

**Step 3: Commit**

```bash
git add scripts/agent-log-streamer.sh
git commit -m "fix(dispatch): use fast batch interval for first 10s of log streaming"
```

---

### Task 10: Cross-backend dispatch testing

**Step 1: Test with Claude backend**

Create and dispatch a minimal Claude task:

```bash
cat > docs/tasks/test-narrative-claude.md << 'EOF'
---
id: test-narrative-claude
status: pending
role: engineer
priority: low
initiative: null
backend: claude
model: claude-sonnet-4-6
task-type: code-implementation
mode: supervised
budget-usd: 0.10
---

# Test narrative streaming (Claude)

## Objective
List the files in packages/studio-core/src/ and describe what each does in one sentence.
EOF

bash scripts/worker.sh test-narrative-claude
```

After completion, verify:

```bash
# Check agent_output events exist
grep -c agent_output docs/tasks/logs/test-narrative-claude-events.ndjson
# Should be > 0

# Check lines are ANSI-clean
grep agent_output docs/tasks/logs/test-narrative-claude-events.ndjson | head -1 | node -e "
  let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
    const ev=JSON.parse(d);
    const hasAnsi=ev.lines.some(l=>/\x1b\[/.test(l));
    console.log('ANSI found:', hasAnsi);
    console.log('Lines:', ev.lines.length);
  });
"
# Should show ANSI found: false
```

**Step 2: Test with Codex backend (if available)**

```bash
cat > docs/tasks/test-narrative-codex.md << 'EOF'
---
id: test-narrative-codex
status: pending
role: engineer
priority: low
initiative: null
backend: codex
model: null
task-type: code-implementation
mode: supervised
budget-usd: 1.00
---

# Test narrative streaming (Codex)

## Objective
List the files in packages/studio-core/src/ and describe what each does in one sentence.
EOF

bash scripts/worker.sh test-narrative-codex
```

Verify same checks as Claude. Codex output has heavy ANSI — verify it's stripped.

**Step 3: Visual verification in Studio**

With `pnpm dev` running:
1. Navigate to `/tasks`
2. Select `test-narrative-claude`
3. Click Log tab — verify agent output renders as clean monospace text
4. Click Events tab — verify agent activity indicator shows line count and time range
5. If Codex test ran, repeat for `test-narrative-codex`

**Step 4: Clean up test tasks**

```bash
rm docs/tasks/test-narrative-claude.md docs/tasks/logs/test-narrative-claude*
rm docs/tasks/test-narrative-codex.md docs/tasks/logs/test-narrative-codex* 2>/dev/null
```

**Step 5: Commit any fixes found during testing**

```bash
# Only if fixes were needed
git add -A
git commit -m "fix(dispatch): address issues found during cross-backend narrative testing"
```

---

### Task 11: Final typecheck and build verification

**Step 1: Full typecheck**

```bash
pnpm check
```

Expected: All 8 workspace packages pass.

**Step 2: Production build**

```bash
pnpm build
```

Expected: Studio app builds successfully.

**Step 3: Final commit (if any pending changes)**

```bash
git status
# Stage and commit any remaining changes
```

---

### Session 3 Review Checkpoint

At this point, verify:
- [ ] Sidecar uses fast 500ms batch for first 10s, then 2s
- [ ] Flush-on-exit captures remaining lines for fast tasks
- [ ] Claude backend produces `agent_output` events via stream-json
- [ ] Codex backend produces `agent_output` events (ANSI stripped)
- [ ] Log tab renders clean text for both backends
- [ ] Timeline shows collapsed activity indicators
- [ ] `pnpm check` passes
- [ ] `pnpm build` succeeds
- [ ] No test tasks or log files left behind

---

## Summary

| Session | Tasks | What gets done |
|---------|-------|----------------|
| 1 | 1-4 | Claude stream-json, sidecar script, worker.sh integration, event docs |
| 2 | 5-8 | MissionLogViewer component, Log tab, timeline agent-activity indicators |
| 3 | 9-11 | Batch tuning, cross-backend testing (Claude + Codex), build verification |

**8 files touched, ~280 lines of new/changed code.** Fits within the 3-session appetite.
