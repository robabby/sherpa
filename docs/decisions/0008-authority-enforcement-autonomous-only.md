---
doc-type: decision
decision: 0008
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - mcp-coordination-layer
status: accepted
---

> **AI-extracted** from mcp-coordination-layer · Awaiting human review

## Context

The MCP coordination layer shipped authority leases (Phase 1) — agents can acquire/release/renew exclusive authority over file scopes with fencing tokens. The next phase (Phase 2) would add Claude Code hooks that enforce authority before every Edit/Write operation.

During Phase 1 review, a key distinction surfaced: Sherpa's current workflow is Human+AI collaborative (lock-step), not autonomous. The human and Claude work together as a single entity where the human's judgment IS the coordination mechanism. Authority enforcement hooks would add friction to collaborative sessions with no safety benefit.

The authority system becomes essential only when multiple autonomous agents are dispatched and operate without human supervision.

## Decision

Authority enforcement applies only to dispatched autonomous agents, never to Human+AI collaborative sessions.

| Session type | Authority model | Enforcement |
|-------------|----------------|-------------|
| Human+AI collaborative | Implicit — the human is sovereign | None |
| Dispatched autonomous agent | Explicit — leases via task dispatch | Full hook enforcement |

Phase 2 (hook enforcement) is deferred until autonomous dispatch is routine with 4+ concurrent agents or the first file collision occurs in dispatch history.

## Consequences

- Phase 1 (authority state layer) ships as-is — it's mode-agnostic infrastructure that works for both session types
- Phase 2 hooks must detect session type before enforcing, adding implementation complexity when the time comes
- The `get_dashboard` tool serves dual purposes: observability for the human ("what are my workers doing?") vs operating orders for autonomous agents
- Aligns with the "two planning modes" design: collaborative sessions use "plan together," autonomous agents use "dispatch tasks"
- Prevents premature enforcement complexity — the system gains authority infrastructure without paying the UX cost until scale demands it
