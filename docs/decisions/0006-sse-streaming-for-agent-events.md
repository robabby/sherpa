---
doc-type: decision
decision: 0006
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - agent-narrative-streaming
status: accepted
---

> **AI-extracted** from agent-narrative-streaming · Awaiting human review

## Context

Agent missions produce events over time — tool calls, file edits, reasoning steps, completions. The initial implementation required page refresh to see updates. Users needed real-time visibility into what agents are doing, especially for long-running overnight tasks.

## Decision

Use Server-Sent Events (SSE) for real-time agent event streaming from NDJSON log files. The server watches agent log files and streams parsed events to the client. Events are typed (tool_use, text, completion, error) with timestamps, allowing the client to render a live timeline. The `useMissionEvents` hook manages the SSE connection lifecycle in React components.

## Consequences

- Real-time agent visibility without polling — events appear as they happen
- NDJSON format is appendable and parseable line-by-line (no need to re-read entire files)
- SSE is simpler than WebSockets for this one-directional data flow
- Backend log parsing is decoupled from the streaming transport — new log formats can be added without changing the SSE infrastructure
- Seeds identified: live terminal feed, backend-specific log parsers (not yet implemented)
