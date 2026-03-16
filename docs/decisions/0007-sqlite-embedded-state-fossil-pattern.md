---
doc-type: decision
decision: 0007
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - sqlite-agentic-state
status: accepted
---

> **AI-extracted** from sqlite-agentic-state · Awaiting human review

## Context

Sherpa stores all state in markdown files. This works for governance and git versioning but provides no queryable index, no transactional updates, and no coordination primitives for concurrent agents. Five initiatives (mcp-coordination-layer, semantic-knowledge-engine, distributed-agent-consistency, section-level-prose-sync, mmo-patterns) all depended on a resolved storage decision. Research (5 vectors, 100+ sources) evaluated CRDTs, sync frameworks, Postgres, and embedded SQLite.

## Decision

**SQLite in WAL mode as embedded state store, following the Fossil SCM pattern:** markdown files remain the canonical source of truth; SQLite provides derived, queryable indexes that can be rebuilt from the filesystem.

Specifics:
- **Driver:** `better-sqlite3` (synchronous, in-process, 5M+ weekly downloads). Pivot target: `libsql` (same API, Drizzle adapter, WASM option, no native compilation).
- **Convention-based paths:** `.sherpa/*.db` — no user-facing configuration. `resolveDbPaths(projectRoot)` returns paths for all databases.
- **Connection factory:** `openDb(path)` at `@sherpa/studio-core/db` — sets WAL pragmas, pools by path, returns raw `better-sqlite3.Database` (Drizzle-wrappable).
- **Concurrency:** WAL mode, `BEGIN IMMEDIATE` for writes, version columns for CAS, ULID primary keys.
- **Multiple DB files per concern:** coordination.db (ephemeral agent state), events.db (audit trail), knowledge.db (derived knowledge index — owned by semantic-knowledge-engine).
- **Driver abstraction boundary:** all `better-sqlite3` imports confined to `packages/studio-core/src/db/`. If the driver swaps, only files in this directory change.
- **pnpm config:** `onlyBuiltDependencies: ["better-sqlite3"]` in root `package.json` required for native addon compilation.

Rejected:
- **CRDTs** (cr-sqlite, SQLite-Sync) — overkill for same-machine agents, dormant/license-restricted
- **Postgres** — external dependency violates zero-infrastructure principle
- **Sync frameworks** (Electric, PowerSync, Triplit, Zero) — all assume Postgres backend
- **node:sqlite** — lacks `.transaction()` and Drizzle adapter on Node 24
- **Drizzle in foundation** — 3 tables don't justify ORM overhead; downstream consumers add their own

## Consequences

- All downstream SQLite work (mcp-coordination-layer authority tables, SEK knowledge index) builds on the shared connection factory
- Native addon compilation requires build tools (node-gyp) — constrains desktop app packaging (identified in pre-mortem, mitigated by libsql pivot path)
- Convention-based paths mean adopters don't configure database locations — reduces flexibility but eliminates configuration surface
- Drizzle composability validated — consumers can wrap the raw connection with ORM without conflict
