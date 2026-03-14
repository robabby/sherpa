---
decision: "Single-process Streamable HTTP MCP server backed by SQLite with authority leases, fencing tokens, and hook-based enforcement"
date: 2026-03-13
skill: /stake
alternatives-rejected:
  - "Thesis B (transport only, defer coordination) — false economy; gap is documented, not hypothetical; would require server rebuild later"
  - "Thesis C (POSIX filesystem primitives) — fragile locks, no fencing tokens, no automatic recovery from crashed agents"
confidence: high
kill-criteria: "PreToolUse hook HTTP round-trips exceed 100ms p95, causing UX degradation during file edits"
---

## Context

Two research iterations (10 vectors, 243KB+) converged on a single architecture. Three viable directions were evaluated. The coordination gap in Claude Code's native tooling is documented, not speculative — their own docs warn about concurrent file edits.

## Decision

Commit to the full coordination layer: Streamable HTTP transport + SQLite (WAL, better-sqlite3) + 4 authority tools + 1 resource + Claude Code hook enforcement. Phased delivery starting with transport (Phase 0), then SQLite + authority (Phase 1), then hooks (Phase 2), then bootstrap (Phase 3).

## Consequences

- 4-6 sessions committed to MVP
- SQLite becomes a runtime dependency (better-sqlite3, well-maintained, 1.2M ops/sec)
- MCP server becomes a pre-started process (not auto-spawned by Claude Code)
- Review at Session 3 — if kill criteria are not triggered, commit remaining sessions
