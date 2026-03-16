---
decision: "Lean foundation with better-sqlite3 and raw SQL — ship DB module in 2 sessions"
date: 2026-03-16
skill: /stake
alternatives-rejected:
  - "Thesis B (Drizzle ORM) — 3 tables don't justify ORM overhead; Drizzle can layer on top later"
  - "Thesis C (Dissolve into consumers) — coordination.db and events.db are shared infrastructure needing an owner"
confidence: high
kill-criteria: "better-sqlite3 native compilation fails on macOS ARM in pnpm monorepo"
---

## Context

sqlite-agentic-state is the foundation layer that unblocks mcp-coordination-layer (approved, Phase 0 done) and semantic-knowledge-engine (approved, parallel session). 5-vector research converged on WAL + optimistic locking. Three approaches evaluated.

## Decision

Build minimal foundation: better-sqlite3 driver, raw SQL schemas (~30 lines each), connection factory with WAL pragmas, 2 DB files (coordination.db, events.db). Downstream initiatives (mcp-coordination-layer, semantic-knowledge-engine) layer their own schemas and optional Drizzle ORM on top of the shared connection factory.

## Rationale

- better-sqlite3: 5M+ weekly downloads, synchronous API (ideal for MCP tool handlers), known Node 24 / macOS ARM compatibility
- Raw SQL over Drizzle: 3 tables total, schema fits on one screen, ORM adds 2 dependencies for no proportional gain at this scale
- Foundation as separate initiative: shared DB infrastructure (WAL config, connection pooling, event audit) is cross-cutting, not feature-specific
