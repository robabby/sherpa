---
started: 2026-03-16
worktree: null
---

# agent-narrative-streaming — Activity Log

## 2026-03-16
- Proposal created, approved, shaped, designed, planned, and implemented in a single session
- Spawned from studio-agent-missions seed #1 (the 38-second black box)
- Session 1: Claude stream-json migration, sidecar script, worker.sh integration
- Session 2: MissionLogViewer component, Log tab in detail pane, timeline agent-activity collapse
- Session 3: Batch tuning (fast 500ms initial, then 2s), cross-backend testing
- Tested with Claude (5 batches, 14 lines) and Codex (7 batches, 267 lines) — both working
- Codex backend fix: `model: codex` alias resolved to default, `sandbox: read-only` noted as separate config issue
- Marked integrated

## Seeds

1. **Dispatch-to-tasks navigation** — After dispatching from `/dispatch`, auto-navigate to `/tasks?node=<taskId>&tab=log` so the user lands on the live streaming view. Currently requires manual navigation. Scoped out as UX polish.

2. **Structured event parsing** — Parse Claude's stream-json output into distinct event types (`agent_tool_call`, `agent_file_edit`, `agent_reasoning`) instead of treating all output as raw text lines. Would make the timeline richer. Deferred per shape no-go.

3. **API backend streaming** — API backends (LM Studio, Groq, Google AI) write output at the end. Use AI SDK's `streamText()` to emit incremental events. Deferred to ai-sdk-dispatch initiative.
