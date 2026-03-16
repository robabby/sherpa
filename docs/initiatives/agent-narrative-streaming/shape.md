---
appetite: 3 sessions
shaped: 2026-03-16
---

# Shape: Agent Narrative Streaming

## Appetite

**3 sessions.** Evolutionary risk — extends proven SSE + NDJSON infrastructure. The sidecar mechanism is simple shell scripting (tail + append), the SSE endpoint already watches NDJSON files, and the Log tab follows the same pattern as existing detail pane tabs. The main complexity is handling backend output format differences, but we solve that by letting the sidecar handle the universal case (raw text) and giving Claude a native path (stream-json).

**Session budget:**
- Session 1: Sidecar script, worker.sh integration, Claude backend stream-json migration, verify events appear in NDJSON during live dispatch
- Session 2: Log tab component (terminal-style monospace viewer), ANSI stripping, auto-scroll, compact timeline rendering for agent_output events
- Session 3: Polish — flush-on-exit, batch tuning, volume handling, cross-backend testing (Claude + Codex + Gemini minimum)

## Evidence & Success

**Customer evidence:** Based on builder judgment — Rob observed the 38-second black box between `dispatch_spawned` and `status_changed → completed` during the first Codex dispatch and immediately identified the gap. The Codex log file (`fix-mcp-server-log-levels.log`) shows rich agent narrative (reasoning, tool calls, command output, decisions) that is invisible in the mission timeline.

**Success metrics:**
1. During a dispatched task, the Log tab shows agent output within 2 seconds of the agent producing it
2. After task completion, the Log tab contains the full agent narrative — no data loss vs the `.log` file
3. The mission timeline's gap indicators (30s+ pauses) are replaced by agent activity indicators showing the agent was working

**Personas served:** `engineer` — the person dispatching and monitoring agent work.

## Shaped Solution

### Two streaming paths, one event schema

**Path 1: Claude backend — native structured streaming.** Claude Code supports `--output-format stream-json` which produces realtime JSONL events (tool calls, assistant messages, system events) as the agent works. Switch the Claude backend from `--print` (buffers everything, writes at end) to `--print --output-format stream-json`. This produces incremental structured JSONL in the `.log` file. The sidecar tails this file and emits `agent_output` events to the NDJSON events file.

**Path 2: All other CLI backends — raw text tailing.** Codex, Gemini, and OpenCode write progressive text output to the `.log` file as they work. A sidecar process (`agent-log-streamer.sh`) tails the `.log` file and emits batched `agent_output` events to the NDJSON events file every 2 seconds (or when a batch of 20+ lines accumulates). The sidecar is backend-agnostic — if the backend writes to a file, the sidecar can tail it.

**Shared event schema:** One new event type: `agent_output`. Data: `{ lines: string[], batch: number, byteOffset: number }`. The `byteOffset` field enables the Log tab to reconstruct continuous text from batches without duplication. The existing SSE endpoint picks up these events automatically — no changes to the streaming route.

**Worker.sh integration:** Start the sidecar before backend delegation (line 171). Capture its PID. After backend exits (line 177), send SIGTERM to the sidecar, then flush any remaining unread lines as a final `agent_output` event. The sidecar is a child process of worker.sh — it dies when the worker dies.

**UI — Log tab:** New `mission-log-viewer.tsx` component. Terminal-style monospace viewer (JetBrains Mono, dark background matching the detail pane's atmospheric depth). Concatenates `agent_output` event lines into continuous text. ANSI color code stripping (regex, not a dependency). Auto-scrolls to bottom during streaming, allows scroll-back. Pulsing indicator while streaming (same pattern as Events tab). Added as a 5th tab between Report and Events.

**UI — Timeline enrichment:** The timeline renders `agent_output` events as collapsed indicators: a small dot with "[N lines of agent output]" as detail text. Not expandable in the timeline — click through to the Log tab. This replaces the gap indicators for intervals where the agent was actively producing output.

### API backends (LM Studio, Groq, Google AI)

No changes. API backends complete quickly (typically < 30s) and write structured output at the end. The sidecar will capture this as a single batch. Real-time streaming for API backends is ai-sdk-dispatch scope (using `streamText()`), not this initiative.

## Rabbit Holes

1. **Claude stream-json format parsing.** Claude's stream-json produces rich structured events (tool_use, text_delta, result, etc.). It's tempting to parse these into distinct event types (agent_tool_call, agent_reasoning). **Avoidance:** Treat stream-json output as text lines, same as any other backend. The sidecar doesn't need to understand Claude's format — it just reads lines and batches them. Structured parsing is a future layer.

2. **ANSI stripping edge cases.** Codex output has heavy ANSI (color codes, bold, italic). Gemini has lighter ANSI. A regex stripper handles 95% of cases. **Avoidance:** Use the standard ANSI escape regex (`/\x1b\[[0-9;]*[a-zA-Z]/g`). Don't handle OSC sequences, cursor movement, or terminal-specific codes. If output looks garbled for a specific backend, that's a follow-up fix, not a blocker.

3. **Virtual scrolling for large logs.** Verbose tasks (research, multi-file changes) can produce thousands of lines. Building a virtual scroller is attractive but complex. **Avoidance:** Cap the Log tab at the last 1,000 lines with a "Show earlier output" button that loads more. No windowed/virtual rendering. If performance is an issue with 1,000 pre-rendered lines, address it then.

4. **Sidecar race conditions.** The `.log` file might not exist when the sidecar starts (backend hasn't begun writing). The backend might exit before the sidecar reads the last lines. **Avoidance:** The sidecar polls for file existence (1s interval) before starting to tail. Worker.sh's flush-on-exit reads any remaining bytes after the sidecar is killed. Two simple guards, not a state machine.

5. **Claude --print + stream-json compatibility.** The `--output-format stream-json` flag requires `--print`. Need to verify that `--permission-mode acceptEdits` still works with stream-json, and that the exit code is still reliable. **Avoidance:** Test this combination in Session 1 before building the UI. If it doesn't work, fall back to `--print` (text) and accept that Claude tasks get post-hoc logs only. Kill criterion #2 covers this.

6. **Codex read-only sandbox.** The Codex log revealed that `codex exec` ran in `sandbox: read-only` mode and couldn't write files. This is a Codex configuration issue (separate from streaming), but it means the Codex log we have is from a failed task. **Avoidance:** This is a dispatch configuration issue, not a streaming issue. The sidecar works regardless of whether the backend succeeds or fails — it tails the output either way.

## No-Gos

- **No structured event parsing per backend** — `agent_output` contains raw text lines. No `agent_tool_call`, `agent_file_edit`, or `agent_reasoning` event types. That's a future initiative.
- **No AI SDK streaming changes** — API backends write at the end. Real-time streaming for API backends is `ai-sdk-dispatch` scope.
- **No log file format normalization** — each backend's output looks different in the Log tab. No attempt to unify formatting.
- **No virtual scrolling** — line cap with load-more, not windowed rendering.
- **No log persistence beyond the .log file** — `agent_output` events in NDJSON are the streaming transport, but the `.log` file remains the canonical source. Don't duplicate storage.
- **No search within logs** — Cmd+F in the browser is sufficient. No built-in search UI.
- **No syntax highlighting of code blocks in agent output** — monospace text rendering only.

## Kill Criteria

1. **If the sidecar can't reliably tail output for at least 2 of 3 CLI backends (Claude, Codex, Gemini) by end of Session 1**, stop and reassess. The approach might need per-backend hooks instead of a universal sidecar.
2. **If Claude's `--print --output-format stream-json --permission-mode acceptEdits` combination doesn't work** (breaks permissions, loses exit code, or produces no output), fall back to `--print` (text) for Claude and accept post-hoc log viewing. Don't burn a session debugging Claude CLI internals.
3. **If the Log tab component takes more than 1 session** (Session 2 scope), ship without it. The `agent_output` events still flow into the NDJSON file and are visible in the Events tab timeline as collapsed indicators. The Log tab becomes a fast follow-on.
4. **If NDJSON event files grow beyond 5MB for a single task due to agent_output volume**, add line-count caps to the sidecar (emit only last N lines per batch, or stop emitting after a total line count). Don't let the streaming mechanism bloat the event store.
