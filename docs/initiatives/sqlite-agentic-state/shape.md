---
appetite: 2 sessions
shaped: 2026-03-16
---

# Shape: SQLite Agentic State

## Appetite

**2 sessions.** This is a foundation layer — its value is measured by what it unblocks, not what it does on its own. The pre-mortem's #1 failure mode is "foundation without consumers." A tight budget forces us to ship something consumers can actually stand on, fast.

- **Session 1:** DB module — connection factory, schemas, exports, Drizzle composability proof. After this, mcp-coordination-layer is unblocked.
- **Session 2:** Migrate existing MCP task tools from filesystem to SQLite-backed. After this, the foundation has its first real consumer.

If session 1 doesn't produce a working DB module with all leading indicators passing, stop. If session 2 can't migrate the existing tools without breaking dispatch scripts, stop.

## Evidence & Success

**Customer evidence:** Builder judgment. No external user has asked for SQLite. The motivation is internal: 2-6 concurrent agents stepping on each other's markdown files, no queryable index, no transactional task claiming. The existing `task_update` MCP tool does `fs.writeFileSync` with no conflict detection — two agents can silently overwrite each other.

**Success metrics:**
1. mcp-coordination-layer can import `@sherpa/studio-core/db`, open coordination.db, and add its authority_leases table alongside the foundation schema — verified by the Drizzle composability test
2. The existing 7 MCP task tools work against SQLite with the same input/output contracts — no agent-facing API change
3. `pnpm check` passes across the monorepo with the new dependency

**Personas:** `engineer` — this is infrastructure. No UI, no PM-facing surfaces.

## Shaped Solution

**Two SQLite databases** in `.sherpa/`, convention-based paths (no user config):

- `coordination.db` — agent_sessions, task_claims, schema_version tables. Ephemeral. Extended by mcp-coordination-layer with authority tables.
- `events.db` — append-only event audit trail. Replaces the NDJSON event logs in `docs/tasks/logs/`.

**Connection factory** at `packages/studio-core/src/db/` — the only place in the monorepo that imports `better-sqlite3`. Opens a cached connection per path, sets WAL pragmas. Returns the raw `better-sqlite3.Database` instance (Drizzle can wrap it; raw SQL consumers use it directly).

**pnpm config** — `onlyBuiltDependencies: ["better-sqlite3"]` in root `package.json` (stress-test finding: pnpm 10.x blocks native addon builds by default).

**MCP tool migration** (session 2) — the existing 7 tools in `studio-mcp/src/server.ts` switch from filesystem reads/writes to SQLite queries. Same tool names, same parameter schemas, same output shapes. The `scanTasks()` and `findAndUpdateTask()` functions become SQLite queries. The markdown task files still exist — `sherpa sync` writes them for human governance.

## Rabbit Holes

1. **Schema design for future features.** The coordination schema is 3 tables (schema_version, agent_sessions, task_claims). Resist adding tables for features that don't exist yet (priority queues, dependency graphs, workflow state machines). mcp-coordination-layer will add its own tables. Avoidance: if you're designing a table that no current code will query, stop.

2. **MCP tool surface expansion.** The proposal listed 9 new tools. The pre-mortem flagged this as a migration tarpit — you can't deprecate the old tools, so new tools go unused. Avoidance: migrate the existing 7 tools, don't add new ones. New tool surface belongs to mcp-coordination-layer.

3. **Bidirectional sherpa sync.** The Fossil pattern (filesystem ↔ SQLite) is architecturally compelling but bidirectional sync is a multi-session rabbit hole (conflict detection, merge semantics, stale write detection). Avoidance: session 2 implements one-way sync only — filesystem → SQLite on startup, SQLite → markdown on write-through. Full bidirectional reconciliation is a separate initiative.

4. **Driver abstraction interface.** The pre-mortem recommended a `SherpaDb` interface for driver swappability. This is premature — the directory boundary (`src/db/` is the only place that imports better-sqlite3) is sufficient. Avoidance: don't build an interface type. If we pivot drivers, we change files in `src/db/` only.

5. **Event sourcing for events.db.** The research surfaced LiveStore's event-sourced SQLite pattern. events.db is an append-only audit trail, not an event-sourced state store. Avoidance: INSERT only, no derived state from events, no replay mechanism.

6. **better-sqlite3 version pinning for SQLite 3.52.0.** The proposal flags a WAL-reset corruption bug fixed in SQLite 3.52.0. Stress-test found better-sqlite3 bundles 3.51.3 — close but below the fix. The bug is a rare edge case (WAL reset during concurrent checkpoint). Avoidance: don't chase the 3.52.0 fix. Monitor better-sqlite3 releases; upgrade when it ships with 3.52+.

## No-Gos

- **No sherpa-meta.db.** Absorbed by semantic-knowledge-engine. Don't create an initiative/task metadata index here.
- **No Drizzle in production code.** devDependency for composability test only. Downstream consumers add their own ORM.
- **No user-facing DbConfig.** Convention-based paths (`.sherpa/*.db`). No `db:` section in `sherpa.config.ts`.
- **No new MCP tools.** Migrate existing 7 tools. New tools (describe_state, get_next_task) belong to downstream initiatives.
- **No authority/lease system.** That's mcp-coordination-layer's scope.
- **No bidirectional sync reconciliation.** One-way write-through only. `sherpa sync reconcile` is a future initiative.
- **No custom driver abstraction type.** Directory boundary is the abstraction. No `SherpaDb` interface.

## Kill Criteria

From stake + pre-mortem (6 existing) plus session-budget gates:

1. **Session 1 doesn't pass all leading indicators.** If better-sqlite3 doesn't compile, WAL doesn't activate, CAS doesn't work, or Drizzle can't wrap the connection — stop. Evaluate pivot to libsql.
2. **Session 2 can't migrate existing tools without breaking dispatch.** If the 7 existing MCP tools can't switch to SQLite-backed while preserving their input/output contracts — stop. The migration path is wrong; the existing tools work fine.
3. **Drizzle composability fails.** If mcp-coordination-layer can't add tables to coordination.db via Drizzle alongside raw-SQL tables — stop. Foundation is incompatible with its primary consumer.
4. **Single-session usage for 4+ weeks.** If coordination.db only ever has 1 active agent_session — the coordination layer is premature. Archive coordination.db; keep events.db.
5. **pnpm native addon causes CI failures** that can't be resolved with `onlyBuiltDependencies` config.
6. **Claude Code ships built-in coordination.** Watch for "agent state" or "session coordination" in Claude Code releases.
