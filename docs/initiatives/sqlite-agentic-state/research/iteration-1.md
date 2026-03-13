# Iteration 1 — 2026-03-11

## Research Vectors

### Vector 1: cr-sqlite & SQLite-Sync CRDT Mechanisms
**Question:** What do cr-sqlite and SQLite-Sync actually provide? CRDT mechanisms, conflict resolution semantics, maturity for production?
**Full report:** [iteration-1/crdt-sqlite-landscape.md](iteration-1/crdt-sqlite-landscape.md)

**Key discoveries:**
- cr-sqlite provides column-level LWW CRDTs via SQLite extension — but is **effectively dormant** (sole maintainer at Rocicorp, no substantive commits since Jan 2024). [GitHub #444](https://github.com/vlcn-io/cr-sqlite/issues/444)
- Fly.io maintains the only production fork (`superfly/cr-sqlite`, last commit Feb 2026), running 7.5M rows at 300K ops/sec. [fly.io/blog/corrosion/](https://fly.io/blog/corrosion/)
- SQLite-Sync (sqlite.ai) is actively maintained with similar CRDTs but licensed **Elastic 2.0** — requires commercial license for production. [License](https://github.com/sqliteai/sqlite-sync/blob/main/LICENSE.md)
- Both break foreign keys (column-by-column merge) and have 2.5x write overhead.
- The Actual Budget pattern (~300 lines, HLC-based message table on plain SQLite) achieves CRDT semantics without a C extension. [jlongster](https://archive.jlongster.com/using-crdts-in-the-wild)

**Implications:**
- CRDTs solve globally-distributed multi-writer. For same-machine agents, this is likely overkill.

### Vector 2: Local-First Ecosystem Survey
**Question:** Which sync frameworks could serve as Sherpa's sync layer?
**Full report:** [iteration-1/sync-ecosystem-survey.md](iteration-1/sync-ecosystem-survey.md)

**Key discoveries:**
- **Every production sync framework assumes client-server with Postgres as source of truth** — the opposite of Sherpa's topology.
- ElectricSQL pivoted away from SQLite entirely (now Postgres-to-PGlite). [electric-sql.com](https://electric-sql.com/)
- Triplit acquired by Supabase, AGPL-3.0 license. PowerSync requires backend Postgres. Zero requires Postgres.
- Evolu (MIT, SQLite-native, LWW CRDTs) is the closest match but requires a relay server.
- **LiveStore** (event-sourcing on SQLite) is an architecturally interesting alternative to CRDT-based sync. [livestore.dev](https://livestore.dev/)

**Implications:**
- No off-the-shelf sync layer fits. Sherpa's viable paths are: plain WAL + write queue, cr-sqlite (Fly fork), custom event-sourced, or Evolu's reconciliation protocol.

### Vector 3: SQLite as Application State Store
**Question:** What patterns and pitfalls emerge from production SQLite-backed applications?
**Full report:** [iteration-1/production-patterns-survey.md](iteration-1/production-patterns-survey.md)

**Key discoveries:**
- **Fossil SCM's canonical-data-plus-derived-cache pattern** is the strongest architectural model — blob table as source of truth, all other tables rebuildable. [fossil-scm.org](https://fossil-scm.org/)
- **Litestack's separate-DB-per-concern** (app data, job queue, cache, pub/sub) isolates write locks and dramatically improves throughput. [litestack.io](https://litestack.io/)
- **Logseq's filesystem-to-SQLite migration** stalled development 18+ months, broke plugins, lost users. Design the right storage from day one.
- **SkyPilot benchmarks:** 1000 concurrent writers, p50 write latency 2.3s. At Sherpa's 2-6 agents, contention is negligible.
- Production consensus: WAL + busy_timeout(5000) + BEGIN IMMEDIATE + short transactions + application-level write serialization.

**Implications:**
- Sherpa should keep Markdown files as canonical source (Fossil pattern), with SQLite as derived queryable index. Separate DB files per concern.

### Vector 4: Optimistic Concurrency for Agent Writers
**Question:** How do multiple concurrent agent processes safely read/write the same SQLite database?
**Full report:** [iteration-1/vector-4-optimistic-concurrency.md](iteration-1/vector-4-optimistic-concurrency.md)

**Key discoveries:**
- WAL mode: concurrent readers, **serialized writers** (one at a time). No concurrent writes in standard SQLite.
- BEGIN CONCURRENT (experimental) and WAL2 are not production-viable. Not in mainline, not in Node.js drivers.
- **Version columns with RETURNING** are the idiomatic SQLite optimistic locking pattern: `UPDATE ... WHERE version = ? RETURNING *`. Zero rows = conflict.
- **Critical gotcha:** `BEGIN IMMEDIATE` is mandatory for write transactions — deferred transactions bypass busy_timeout on lock upgrade.
- **node:sqlite** (RC in Node 25.7) has built-in Session Extension (`createSession`/`applyChangeset`) for change tracking.
- **Overstory** validates the architecture: production multi-agent AI orchestrator, SQLite WAL, ~1-5ms per query.

**Implications:**
- 5-layer concurrency architecture: PRAGMA config → BEGIN IMMEDIATE → version columns → ULID keys → escalation path (single-writer queue).

### Vector 5: SQLite + MCP Integration Patterns
**Question:** How to expose SQLite through MCP tools with ACID guarantees?
**Full report:** [iteration-1/vector-5-sqlite-mcp-integration.md](iteration-1/vector-5-sqlite-mcp-integration.md)

**Key discoveries:**
- Anthropic's official SQLite MCP server is a pedagogical demo (no WAL, no concurrency, SQL injection vuln). Do not model on it.
- **Microsoft's Data API Builder** is the gold standard: 6 typed CRUD tools, entity abstraction, RBAC, per-tool toggles.
- MCP has **no transaction primitives** — ACID must live inside individual tool handlers via `BEGIN IMMEDIATE ... COMMIT`.
- **Do NOT expose transaction tools** — a stuck `BEGIN` blocks all agents. Keep transactions internal.
- **task-orchestrator** (Kotlin/SQLite, 13 tools) is the closest reference: hierarchical work items, dependency tracking, `get_next_task` pull-based queue.
- Tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`) are cheap safety wins.

**Implications:**
- 9-tool surface: 5 read, 3 write, 1 coordination. ACID per tool handler. `describe_state` for LLM self-discovery.

## Synthesis

Five vectors, one convergent conclusion: **Sherpa doesn't need CRDTs or an external sync framework. Plain SQLite in WAL mode with optimistic locking is the right architecture for 2-6 agents on one machine.**

The research surfaced four cross-cutting patterns that no single vector produced alone:

### 1. The Fossil/Obsidian Pattern: Files Are Canonical, SQLite Is Derived

Fossil SCM, Obsidian, and Sherpa's existing initiative system all share the same insight: structured documents (Markdown, blobs) are the source of truth, and the queryable index is derived and rebuildable. Sherpa's `docs/initiatives/*/proposal.md` files should remain canonical. SQLite provides the queryable overlay — initiative status, task queues, agent coordination. If the database is lost, it can be rebuilt from the filesystem. This resolves the tension between "Markdown as governance" (human-readable, git-versioned) and "database as coordination" (queryable, transactional).

### 2. Separate DB Files Per Concern

Litestack, Fossil, and concurrency research all converge: **one SQLite file per concern** isolates write locks. Sherpa should have:
- `sherpa-meta.db` — initiative/task metadata (derived from filesystem, rebuildable)
- `sherpa-coordination.db` — agent state, heartbeats, locks (ephemeral, not backed by files)
- `sherpa-events.db` — activity log, audit trail (append-only)

This means three independent write locks. Three agents writing to three different concerns never contend.

### 3. The 5-Layer Concurrency Stack

Vector 4 produced this explicitly, but all five vectors informed it:
1. **PRAGMA config** — WAL, NORMAL sync, 5000ms busy_timeout
2. **Transaction discipline** — BEGIN IMMEDIATE for writes, deferred for reads
3. **Optimistic locking** — version columns with RETURNING
4. **Key design** — ULIDs, not auto-increment
5. **Escalation** — single-writer queue if contention emerges (it won't at 2-6 agents)

### 4. MCP as the Access Layer, Not the Coordination Layer

The MCP-coordination-layer sibling initiative assumes MCP mediates all state mutations. This research suggests a refinement: MCP is the **access layer** (how agents read/write state), but coordination logic (dependency resolution, state machine transitions, optimistic locking) lives in the SQLite access layer beneath MCP. MCP tools are thin wrappers around transactional SQLite operations. The MCP server is stateless; the state lives in SQLite.

### Most Important Insight

**Sherpa's real innovation isn't the database — it's the filesystem-database duality.** Every competing framework (ElectricSQL, Triplit, PowerSync) replaces the filesystem with a database. Sherpa keeps both: Markdown files for human governance and git versioning, SQLite for machine coordination and querying. The `sherpa sync` CLI bridges them — parsing Markdown into SQLite on read, applying SQLite state changes back to Markdown on write. This is the Fossil pattern applied to agentic workflows.

## All Sources

### CRDT & Sync
- [cr-sqlite GitHub](https://github.com/vlcn-io/cr-sqlite) — MIT, dormant, 3.6K stars
- [Fly.io cr-sqlite fork](https://github.com/superfly/cr-sqlite) — Active production fork
- [Fly.io Corrosion blog](https://fly.io/blog/corrosion/) — Production CRDT at scale
- [Fly.io Nov 2024 outage](https://fly.io/infra-log/2024-11-30/) — Schema change incident
- [SQLite-Sync](https://github.com/sqliteai/sqlite-sync) — Elastic 2.0 license
- [Actual Budget CRDTs](https://archive.jlongster.com/using-crdts-in-the-wild) — Custom HLC approach
- [ElectricSQL](https://electric-sql.com/) — Pivoted to Postgres sync
- [LiveStore](https://livestore.dev/) — Event-sourcing on SQLite
- [Evolu](https://www.evolu.dev/) — MIT, SQLite-native CRDTs

### SQLite Concurrency
- [SQLite WAL docs](https://sqlite.org/wal.html) — Official WAL documentation
- [SQLite locking](https://sqlite.org/lockingv3.html) — 5 lock states, process coordination
- [SkyPilot concurrency](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) — 1000+ processes benchmarks
- [Bugsink single-writer](https://www.bugsink.com/blog/database-transactions/) — Write queue pattern
- [Overstory](https://github.com/jayminwest/overstory) — Multi-agent SQLite coordination
- [SQLite 3.52.0](https://www.sqlite.org/releaselog/3_52_0.html) — WAL-reset corruption fix

### Production Patterns
- [Fossil SCM](https://fossil-scm.org/) — Canonical blobs + derived tables
- [Litestack](https://litestack.io/) — Separate DB per concern (Rails)
- [Logseq SQLite migration](https://discuss.logseq.com/) — 18-month cautionary tale
- [SQLite PRAGMA tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/) — Comprehensive guide

### MCP Integration
- [MCP Spec 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18) — Current specification
- [Microsoft DAB SQL MCP](https://learn.microsoft.com/en-us/azure/data-api-builder/mcp/) — Gold-standard CRUD pattern
- [task-orchestrator](https://github.com/jpicklyk/task-orchestrator) — SQLite-backed MCP task management
- [mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail) — SQLite+Git coordination
- [Workato tool design](https://docs.workato.com/en/mcp/mcp-server-tool-design.html) — 5-8 tools per server
- [node:sqlite API](https://nodejs.org/api/sqlite.html) — Built-in Session Extension

## Proposals Generated

- `proposal.md` — SQLite as Sherpa's agentic state backing store with filesystem-database duality

## Open Questions for Next Iteration

1. **Schema design for filesystem-database duality** — What's the exact SQLite schema for `sherpa-meta.db`? How does `sherpa sync` parse `proposal.md` frontmatter into rows? What's the rebuild-from-filesystem algorithm?

2. **node:sqlite Session Extension for agent sync** — Can `createSession()`/`applyChangeset()` replace version columns for conflict detection? What's the performance overhead? Does it work cross-process?

3. **Event sourcing vs state snapshots** — LiveStore's event-sourced SQLite pattern vs. direct state mutation. For Sherpa's audit trail needs (activity.md), should `sherpa-events.db` be an append-only event log that derives current state?

4. **MCP tool implementation with @sherpa/studio-mcp** — How does the 9-tool surface integrate with the existing MCP server package? What's the migration path from filesystem-only to filesystem+SQLite?

5. **Checkpoint management for long-running agents** — When an agent holds a read snapshot during a multi-minute AI model call, WAL growth is unbounded. Should Sherpa monitor WAL size and manage checkpoints explicitly?
