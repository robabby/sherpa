---
status: integrated
initiative: sqlite-agentic-state
created: 2026-03-11
updated: 2026-03-16
type: research-synthesis
risk: structural
targets:
  - packages/studio-core/src/db/
  - packages/studio-mcp/src/tools/
dependencies: []
informs:
  - mcp-coordination-layer
  - semantic-knowledge-engine
spawned-from: null
---

# SQLite as Sherpa's Agentic State Store

## Summary

Use SQLite in WAL mode as Sherpa's backing store for initiative metadata, task coordination, and agent state — with Markdown files remaining the canonical source of truth. The architecture follows the Fossil SCM pattern: files are authoritative, SQLite provides the queryable derived index. Multiple DB files per concern isolate write locks for concurrent agent access.

## State Snapshot

Sherpa currently stores all state in Markdown files under `docs/initiatives/`. This works for human governance and git versioning but provides no queryable index, no transactional updates, and no coordination primitives for concurrent agents. The `@sherpa/studio-mcp` package exists but has no persistent state layer. Five sibling initiatives (mmo-patterns, distributed-consistency, mcp-coordination, section-level-sync) all depend on a resolved state storage question.

## Proposed Changes

### Target: `packages/studio-core/src/db/`

New module providing the SQLite access layer:

**Architecture — 2 SQLite files** (the metadata/knowledge index is owned by `semantic-knowledge-engine`):
- `sherpa-coordination.db` — Agent state, heartbeats, task claims (ephemeral). Schema extended by `mcp-coordination-layer` with authority_leases and state_versions tables.
- `sherpa-events.db` — Activity log, audit trail (append-only)

**Concurrency stack:**
1. PRAGMA: `journal_mode=WAL`, `synchronous=NORMAL`, `busy_timeout=5000`, `foreign_keys=ON`
2. All write transactions use `BEGIN IMMEDIATE`
3. Version columns on mutable rows, CAS via `UPDATE ... WHERE version = ? RETURNING *`
4. ULID primary keys (not auto-increment)
5. Escalation: single-writer queue if contention emerges (unlikely at 2-6 agents)

**Driver:** `node:sqlite` (built-in, RC in Node 25.7) — provides Session Extension for change tracking without native addon compilation.

**Filesystem-database duality:** `sherpa sync` parses Markdown frontmatter into SQLite rows on read, applies state changes back to Markdown on write. If the database is lost, it rebuilds from the filesystem.

### Target: `packages/studio-mcp/src/tools/`

9-tool MCP surface exposing SQLite state:

**Read (readOnlyHint: true):**
- `describe_state` — Available entities, fields, allowed operations
- `list_initiatives` — Filter by status, paginated
- `list_tasks` — Filter by initiative/status/agent/priority
- `get_initiative` — Single initiative by slug
- `get_task` — Single task with dependencies

**Write:**
- `update_initiative_status` — Status transition with version check
- `claim_task` — Atomic agent assignment (CAS)
- `update_task_status` — Status transition with dependency validation

**Coordination:**
- `get_next_task` — Priority-ranked next actionable task for an agent

ACID per tool handler. No exposed transaction tools.

## Rationale

**Research basis:** 5-vector research (iteration 1) surveying cr-sqlite/SQLite-Sync CRDTs, local-first sync ecosystem, production SQLite patterns, optimistic concurrency, and MCP integration.

**Key findings driving this proposal:**
1. CRDTs (cr-sqlite, SQLite-Sync) are overkill for same-machine agents and carry maintenance/licensing risks
2. Every production sync framework (Electric, PowerSync, Zero, Triplit) assumes Postgres — none fit Sherpa's local-first topology
3. Standard WAL mode handles 1000+ concurrent processes (SkyPilot); 2-6 agents is trivial
4. Fossil SCM's canonical-data-plus-derived-cache pattern maps directly to Sherpa's Markdown+SQLite duality
5. Overstory validates the architecture: production multi-agent AI, SQLite WAL, ~1-5ms queries
6. The 9-tool MCP surface follows Microsoft DAB and task-orchestrator patterns

**Why not Postgres?** Adds an external dependency to a framework that should run with zero infrastructure. SQLite is embedded, zero-config, and sufficient for Sherpa's scale.

**Why not CRDTs?** cr-sqlite is dormant. SQLite-Sync has Elastic License restrictions. Both break foreign keys. For 2-6 agents on one machine, serialized writes + optimistic locking is simpler and sufficient.

**Why filesystem-database duality?** Sherpa's governance model requires human-readable, git-versioned initiative files. Replacing them with a database would break the governance workflow. The Fossil pattern preserves both — files for governance, SQLite for coordination.

## Dependencies

None. This is the foundation layer — it provides the SQLite infrastructure, concurrency stack, and filesystem-database duality that downstream initiatives build on.

**Informs:**
- `mcp-coordination-layer` — Provides the DB module, WAL configuration, and `sherpa-coordination.db` schema that the coordination layer extends with authority leases and enforcement
- `semantic-knowledge-engine` — Provides the shared DB infrastructure pattern (WAL config, connection factory, migration runner) that the knowledge index reuses for its own `.sherpa/knowledge.db`

**Scope boundary with `semantic-knowledge-engine`:** The original `sherpa-meta.db` (initiative/task metadata index) is absorbed by the semantic-knowledge-engine, which extends it with embeddings, summaries, and clustering. This initiative retains `sherpa-coordination.db` (ephemeral agent state) and `sherpa-events.db` (audit trail).

## Review Notes

- **node:sqlite is Release Candidate** — not yet stable. If Node.js delays stabilization, better-sqlite3 is the fallback (lacks Session Extension but is battle-tested).
- **Schema design needs iteration 2** — The exact table schemas, migration strategy, and `sherpa sync` algorithm are open questions for the next research cycle.
- **SQLite 3.52.0 minimum** — A WAL-reset corruption bug was fixed in March 2026. Sherpa should enforce this minimum version.
- **This is a structural change** — introducing a persistent state layer affects all downstream features (Studio UI queries, MCP tools, CLI commands). Get the architecture right before implementation.
