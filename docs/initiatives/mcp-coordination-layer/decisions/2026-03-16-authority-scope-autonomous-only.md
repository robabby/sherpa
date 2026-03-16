---
decision: "Authority enforcement applies only to dispatched autonomous agents, never to Human+AI collaborative sessions"
date: 2026-03-16
context: Phase 1 implementation complete, scoping Phase 2 hooks
alternatives-rejected:
  - "Enforce on all sessions — would obstruct Human+AI collaborative work where the human IS the authority"
confidence: high
impacts:
  - "Phase 2 hooks must detect session type (collaborative vs autonomous)"
  - "Proposal 'Enforcement via Claude Code Hooks' section needs scoping revision before Phase 2"
---

## Context

After shipping Phase 1 (authority state layer), the question arose: should Phase 2 enforcement hooks apply to all sessions or only autonomous ones?

The current workflow is Human+AI lock-step collaboration. The human and Claude work together as a single entity. In this mode, the human's judgment IS the coordination mechanism — they decide what to edit, when, and why. Authority leases add friction with no safety benefit.

The authority system becomes essential when multiple autonomous agents are dispatched (via `/dispatch` or task board) and operate without human supervision. Those agents can't coordinate by convention alone — they need leases, fence tokens, and enforcement.

## Decision

Two distinct authority models based on session type:

| Session type | Authority model | Enforcement |
|-------------|----------------|-------------|
| Human+AI collaborative | Implicit — the human is sovereign | None. No hooks. |
| Dispatched autonomous agent | Explicit — leases via task dispatch | Full. PreToolUse hooks block unauthorized edits. |

## Implications

1. **Phase 1 (done)** — No changes. The state layer is mode-agnostic infrastructure.
2. **Phase 2 (future)** — Hooks must identify session type before enforcing. Collaborative sessions bypass authority checks entirely.
3. **`get_dashboard`** — Serves different purposes: observability for the human ("what are my workers doing?") vs operating orders for autonomous agents.
4. **Phase 2 remains gated** on kill criterion #5 (demand signal) — defer until autonomous dispatch is routine with 4+ concurrent agents.

## Connection

This aligns with the "two planning modes" design: "Plan together" (human+AI) vs "Dispatch tasks" (autonomous agents). The authority system is infrastructure for the dispatch side of that split.
