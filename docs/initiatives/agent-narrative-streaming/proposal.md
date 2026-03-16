---
status: approved
initiative: agent-narrative-streaming
created: 2026-03-16
updated: '2026-03-16'
type: new-plan
risk: evolutionary
targets:
  - scripts/worker.sh
  - scripts/agent-log-streamer.sh                    # (new file)
  - packages/studio-core/src/task-events.ts
  - packages/studio-ui/src/mission-timeline.tsx
  - packages/studio-ui/src/mission-detail-pane.tsx
  - packages/studio-ui/src/mission-log-viewer.tsx     # (new file)
  - apps/studio/src/app/api/stream/tasks/[taskId]/route.ts
dependencies: []
informs:
  - ai-sdk-dispatch
  - mcp-coordination-layer
personas:
  - engineer
spawned-from: studio-agent-missions
---

# Agent Narrative Streaming

## Summary

Fill the black box between `dispatch_spawned` and `status_changed → completed`. Today the mission timeline shows dispatch-level events — the envelope — but nothing about what the agent actually did during execution. Backend scripts already capture full agent output to `.log` files. This initiative streams that output into the NDJSON event file in real-time and surfaces it in the mission detail pane, giving full visibility into agent behavior as it happens.

## State Snapshot

Two-file logging per task, set up by `scripts/worker.sh`:
- `{slug}.log` — Raw agent output. All backends write here via `> "${SHERPA_LOG_FILE}" 2>&1`. Unstructured, format varies by backend.
- `{slug}-events.ndjson` — Structured dispatch events. 7 event types, all dispatch-level (`dispatch_requested`, `worker_started`, `status_changed`, `backend_delegating`, `dispatch_spawned`, `task_updated`, `dispatch_failed`).

The SSE endpoint at `/api/stream/tasks/[taskId]/route.ts` watches only the NDJSON file via `fs.watch` with 100ms debounce. It has no awareness of the `.log` file.

The mission timeline (`mission-timeline.tsx`, 422 lines) renders all 7 event types with distinct visuals. Gap indicators show elapsed time for 30s+ pauses — which is exactly the black box this initiative fills.

The detail pane (`mission-detail-pane.tsx`, 466 lines) has 4 tabs: Overview, Report, Verdict, Events. No tab shows raw agent output during or after execution.

Backend output formats differ significantly:
- **Claude** (`--print`): Clean markdown, no metadata wrapper
- **Codex** (`exec`): ANSI color codes, session metadata header, echoed prompt, then agent reasoning
- **Gemini** (`-p`): YOLO mode banners, tool execution logs, then response
- **OpenCode** (`run`): CLI wrapper + reasoning
- **API backends** (LM Studio, Groq, Google AI): Structured markdown with metadata header

## Proposed Changes

### Layer 1: Log streaming infrastructure (`scripts/`)

A sidecar process (`agent-log-streamer.sh`) that tails the `.log` file and emits `agent_output` events to the NDJSON file as lines arrive. Worker.sh starts this sidecar alongside the backend process and kills it on completion.

This avoids modifying every backend script. The sidecar watches `SHERPA_LOG_FILE`, batches lines (every 1-2 seconds or every N lines), and appends `agent_output` events to the NDJSON events file. The existing SSE endpoint picks them up automatically.

Worker.sh changes: start sidecar before backend delegation, capture its PID, kill on backend exit.

### Layer 2: Event schema (`packages/studio-core/`)

New event types in `task-events.ts`:
- `agent_output` — Batched raw text lines from the agent. Data: `{ lines: string[], source: "stdout" | "stderr", batch: number }`.

Keep it simple — one event type for raw output. Structured parsing (tool calls, file edits) is a future layer that can be built on top of `agent_output` events without changing the transport.

### Layer 3: UI — Log tab (`packages/studio-ui/`)

New `mission-log-viewer.tsx` component: terminal-style monospace viewer that renders `agent_output` events as continuous text. Auto-scrolls during streaming, supports scroll-back. ANSI color code stripping (Codex and Gemini output contains them).

Add a **Log** tab to `mission-detail-pane.tsx` between Report and Events. Shows the raw agent narrative — what the agent read, decided, and wrote. Gets a pulsing indicator during streaming (same pattern as Events tab).

### Layer 4: Timeline enrichment (`packages/studio-ui/`)

The mission timeline already shows gap indicators for 30s+ pauses. With `agent_output` events flowing, these gaps disappear naturally. Add a compact rendering for `agent_output` events in the timeline — collapsed by default, showing line count and a one-line preview. Expandable to show full text.

## Rationale

**Why a sidecar, not per-backend modification?** Five CLI backends and four API backends. Modifying each to emit structured events is high effort and fragile — each has different output formats and execution patterns. The sidecar approach works universally: if the backend writes to a file, the sidecar can tail it. Per-backend structured parsing can be layered on later.

**Why batch lines, not stream character-by-character?** NDJSON events should be meaningful units, not individual characters. Batching every 1-2 seconds keeps the event file readable and the SSE stream efficient. The UI reconstitutes continuous text from batches.

**Why a Log tab, not inline in the timeline?** The timeline is for structured events with semantic meaning. Raw agent output is high-volume unstructured text that would overwhelm the timeline. The Log tab gives it a proper home. The timeline gets a compact collapsed indicator that the agent was active.

**Alternative considered: SSE endpoint watches both files.** This would require the SSE route to handle two different file formats (NDJSON and raw text) and multiplex them. Keeping everything in NDJSON via the sidecar is cleaner — one file format, one watch, one SSE protocol.

## Dependencies

- **studio-agent-missions** (integrated) — Provides the mission timeline, SSE infrastructure, and detail pane that this extends. `spawned-from` relationship.
- **dispatch-center** (integrated) — Seeded "Real-time worker streaming" as Rabbit Hole #2. This initiative picks up that seed.

Informs:
- **ai-sdk-dispatch** — API backends using `streamText()` could emit richer structured events than CLI log tailing. This initiative establishes the event schema and UI that ai-sdk-dispatch can target.
- **mcp-coordination-layer** — Resource subscriptions (Phase 1-3) could eventually replace fs.watch-based SSE. This initiative's event types become the payload schema.

## Review Notes

**Edge cases:**
- Backend that produces no output (empty `.log` file) — sidecar emits nothing, no visual change
- Very fast tasks (< 2s) — sidecar may not emit any batches before backend exits. Worker.sh should flush remaining lines as a final `agent_output` event.
- Very verbose tasks — `agent_output` events could dominate the NDJSON file. Consider a cap (e.g., last 500 lines in the Log tab, with "show all" option).
- Binary/garbage output — ANSI stripping handles color codes; other non-UTF8 should be filtered.

**Trade-offs:**
- The sidecar adds a background process per dispatch. Lightweight (shell tail + append), but it's a new moving part.
- Raw output is noisy for some backends (Codex echoes the full task prompt, Gemini repeats YOLO banners). Filtering is backend-specific and deferred to a future structured parsing layer.

**Effort:** 3 sessions
**Session breakdown:**
- Session 1: Sidecar script, worker.sh integration, `agent_output` event type in task-events.ts. Verify events appear in NDJSON during dispatch.
- Session 2: `mission-log-viewer.tsx` component, Log tab in detail pane, ANSI stripping, auto-scroll. Timeline compact `agent_output` rendering.
- Session 3: Polish — batch tuning, flush-on-exit, volume caps, visual refinement, edge case handling. Test across Claude/Codex/Gemini backends.
