---
started: 2026-03-11
worktree: null
---

## Activity Log

- 2026-03-11: Initiative created. Spawned from conversation about sqlite.ai, SQLite-Sync CRDTs, and using SQLite as authoritative backing store for agentic state.
- 2026-03-11: Iteration 1 complete. 5-vector research: cr-sqlite/CRDTs, local-first ecosystem (8 frameworks), production SQLite patterns (8 apps), optimistic concurrency, MCP integration. Core conclusion: CRDTs are overkill — plain WAL + optimistic locking + filesystem-database duality (Fossil pattern). Proposal written. 2 branch seeds created (filesystem-database-duality, event-sourced-state).
- 2026-03-16: Circular dependency with mcp-coordination-layer resolved (Path C — fixed direction). sqlite-agentic-state has no hard deps; mcp-coordination-layer depends on it. sherpa-meta.db scope absorbed by semantic-knowledge-engine.
- 2026-03-16: Approved. Staked (Thesis A — lean foundation with better-sqlite3 + raw SQL, 2 sessions). Pre-mortem: 7 failure modes, top risk is "foundation without consumers." Stress-test: 8/10 confirmed, pnpm native addon config required (A11 refuted, fixed). Shaped: 2-session appetite, migrate existing tools not add new ones.
- 2026-03-16: Session 1 complete. 7 tasks, 7 commits. Connection factory with WAL mode, coordination.db schema (agent_sessions, task_claims), events.db schema (append-only with ULID), barrel exports at @sherpa/studio-core/db. Drizzle composability validated (kill criterion #5). 141 tests passing. mcp-coordination-layer unblocked.
- 2026-03-16: Session 2 (MCP task tool migration) cancelled — SEK already built the read path via knowledge.db, and task tools work fine at current scale (50-100 tasks, 12ms filesystem scan). Pre-mortem #4 validated: "database for a grep-scale workload." Initiative marked integrated.

## Seeds

1. **Task tool migration to SQLite** — Originally Session 2 scope. Cancelled because knowledge.db covers the read path and filesystem tools work at scale. Revisit when concurrent write conflicts actually manifest. *(scoped out: pre-mortem #4, shape kill criterion #2)*

2. **sherpa sync bidirectional reconciliation** — The Fossil pattern's write-back direction (SQLite → markdown) was a no-go for this initiative. One-way sync (filesystem → SQLite) exists via SEK's `syncFromFilesystem()`. Bidirectional reconciliation with conflict detection is a separate initiative. *(scoped out: shape no-go, rabbit hole #3)*

3. **Driver pivot to libsql** — Stress-test identified libsql as the preferred pivot target if better-sqlite3 becomes untenable (desktop packaging, node:sqlite stabilization). Same API, Drizzle adapter, WASM option, no native compilation. *(from: stress-test A12, pre-mortem context failure C2/C5)*

4. **events.db structured event sourcing** — Research surfaced LiveStore's event-sourced SQLite pattern. Current events.db is append-only audit trail (INSERT only). Could evolve into event-sourced state derivation. *(from: research iteration-1 open question #3, shape rabbit hole #5)*

5. **Checkpoint management for WAL growth** — Pre-mortem identified WAL checkpoint starvation under long-lived MCP connections. Not a problem at current scale but needs monitoring as agent concurrency increases. *(from: pre-mortem T3, research iteration-1 open question #5)*
