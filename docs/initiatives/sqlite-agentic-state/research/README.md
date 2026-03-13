# sqlite-agentic-state Research

## Iteration 1 (2026-03-11)

5-vector survey covering the full landscape: CRDT mechanisms (cr-sqlite, SQLite-Sync), local-first sync ecosystem (8 frameworks), production SQLite patterns (8 applications), optimistic concurrency (WAL, locking, drivers), and MCP integration (6 reference servers).

**Core conclusion:** CRDTs and external sync frameworks are overkill. Plain SQLite WAL mode + optimistic locking + filesystem-database duality (Fossil pattern) is the right architecture.

**Key insight:** Sherpa's innovation is the filesystem-database duality — Markdown files for human governance, SQLite for machine coordination. No competing framework does this.

## Open Questions

1. **Schema design for filesystem-database duality** — Exact SQLite schema, `sherpa sync` parse/rebuild algorithm, migration strategy
2. **node:sqlite Session Extension** — Can `createSession()`/`applyChangeset()` replace version columns? Cross-process compatibility?
3. **Event sourcing vs state snapshots** — Should `sherpa-events.db` be an append-only event log deriving current state (LiveStore pattern)?
4. **MCP tool implementation** — Integration with existing `@sherpa/studio-mcp`, migration path from filesystem-only
5. **Checkpoint management** — WAL growth during long-running agent read snapshots, explicit checkpoint strategy
