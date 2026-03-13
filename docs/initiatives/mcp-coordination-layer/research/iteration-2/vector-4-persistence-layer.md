# Iteration 3 — Persistence Layer Comparison

**Date:** 2026-03-12
**Question:** What is the right persistence layer for an MCP coordination server — Git-only, SQLite, Dolt, or a hybrid?

---

## Key Discoveries

### 1. Dolt Has Reached MySQL Parity — But Requires a Server Process

- Dolt's overall sysbench read/write multiplier vs MySQL is now **0.99** (parity) as of December 2025. Individual tests range from 0.3x (covering_index_scan, faster than MySQL) to 1.66x (select_random_points, slower). ([DoltHub Blog: Dolt is as Fast as MySQL](https://www.dolthub.com/blog/2025-12-04-dolt-is-as-fast-as-mysql/))
- On **TPC-C** (high-concurrency transactional benchmark), MySQL still does **~2.5x more transactions/sec** than Dolt. Dolt gets ~40 TPS vs MySQL's ~100 TPS. ([Dolt Latency Benchmarks](https://docs.dolthub.com/sql-reference/benchmarks/latency))
- Dolt is written in **Go** and can only be embedded in Go applications. For Node.js/TypeScript, it **requires a separate server process** communicating over MySQL wire protocol (port 3306, connect via `mysql2` npm package). ([DoltHub Blog: When NOT to Use Dolt](https://www.dolthub.com/blog/2025-12-30-why-not-dolt/))
- Dolt binary is ~100MB. Installation: `brew install dolt` or download. Not an npm dependency — it's a system-level binary. ([Dolt Installation Docs](https://docs.dolthub.com/introduction/installation))

### 2. Beads Went All-In on Dolt — And It's Instructive

- Beads (Yegge, 18.8k stars) **removed SQLite entirely** in v0.51.0 and now uses Dolt exclusively. The legacy SQLite backend, daemon subsystem, and JSONL sync pipeline were all removed. ([Beads DeepWiki](https://deepwiki.com/steveyegge/beads))
- Beads v0.56.1 **intentionally removed embedded Dolt mode** — server mode is now mandatory. Each project auto-starts a `dolt sql-server` process. ([Beads DOLT-BACKEND.md](https://github.com/steveyegge/beads/blob/main/docs/DOLT-BACKEND.md))
- **Cell-level merge** is the killer feature: concurrent updates to different columns of the same row merge automatically. One agent updating title while another updates priority = no collision. ([Beads DeepWiki](https://deepwiki.com/steveyegge/beads))
- Hash-based IDs (`bd-a1b2`) ensure uniqueness across branches, preventing collisions when multiple agents create issues concurrently. This is a design pattern, not a Dolt feature.
- Beads includes a **circuit breaker** (5 failures in 60 seconds = fail fast) to prevent agents wasting tokens on unresponsive Dolt servers.
- Port conflicts between multiple projects' Dolt servers are a real operational issue. Beads added shared server mode to address this.

### 3. Git-Only Coordination Has Real Failure Modes

- **MCP Agent Mail** (Dicklesworth, most sophisticated git-based coordination) uses Git as canonical audit trail + SQLite as query cache. Git stores agent profiles, mailboxes, messages (markdown with frontmatter), and file reservation declarations. ([GitHub: mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail))
- **No ACID guarantees across Git + SQLite.** The system explicitly acknowledges potential race conditions between Git writes and SQLite index updates. It is an "advisory coordination layer, not a transaction manager."
- **Git's lock file model is pessimistic and fragile.** Git creates `*.lock` files in `.git/` during operations — concurrent operations queue or fail. Background `git-maintenance` can escape locking and cause race conditions. ([GitHub Blog: Git Concurrency in Desktop](https://github.blog/2015-10-20-git-concurrency-in-github-desktop/), [ArgoCD git index.lock issue](https://perrotta.dev/2025/08/argocd-git-index.lock-issue/))
- **File leases in Agent Mail are advisory only.** TTL-based expiration, glob pattern matching, optional pre-commit guard. Agents are expected to cooperate — enforcement is opt-in, not structural.
- **Claude Code itself hits git lock issues** — stale `.git/index.lock` files from background operations block user commands. ([GitHub Issue #11005](https://github.com/anthropics/claude-code/issues/11005))

### 4. SQLite Single-Writer Is a Feature, Not a Bug

- **BugSink pattern:** Separate ingestion (queue events) from digestion (serialize writes). Single-writer "removes the mental overhead of coordinating concurrent modifications." All writes use `BEGIN IMMEDIATE`. ([BugSink Blog](https://www.bugsink.com/blog/database-transactions/))
- **SkyPilot stress test:** At 1000 concurrent writers to one SQLite DB, median write latency = 2.3 seconds, 0.13% exceed 60-second timeout. SQLite's lock acquisition uses hardcoded sleep intervals without FIFO guarantees — "a constant bloodbath." ([SkyPilot Blog](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))
- **For Sherpa's use case (3-20 agents, single-process MCP server):** The Node.js event loop serializes all writes naturally. `SQLITE_BUSY` is structurally impossible in single-process. This was the Iteration 1 key finding and it holds up.
- better-sqlite3: **11.7x faster** than `sqlite3` package for single-row selects, **15.6x faster** for batch inserts in transactions. Synchronous API avoids callback overhead. ([GitHub: better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
- **Cord** (June Kim) validates the pattern: a 500-line Python MCP coordination system using shared SQLite for multi-agent task trees. Five primitives: spawn, fork, ask, complete, read_tree. Dependency resolution and authority scoping enforced by MCP server. ([June Kim: Cord](https://www.june.kim/cord))

### 5. libSQL/Turso Is the Real Upgrade Path — But Not Yet

- **libsql npm package**: Drop-in replacement for better-sqlite3 with opt-in async/promise API. Supports Node, Bun, Deno. 302,201 weekly downloads. ([npm: libsql](https://www.npmjs.com/package/libsql), [GitHub: libsql-js](https://github.com/tursodatabase/libsql-js))
- Four connection modes: in-memory, local file, remote server, **local replica with remote sync**. The embedded replica mode is unique and valuable for Sherpa's eventual multi-machine topology.
- **Turso's MVCC rewrite** (Rust-based SQLite rewrite): claims **4x write throughput** (~200K writes/sec) with concurrent writers. But it's **experimental with known limitations** around DELETE operations and memory efficiency. Available as technical preview with experimental flags only. ([BigGo News: Turso MVCC](https://biggo.com/news/202510151324_Turso-MVCC-Concurrent-Writes-SQLite))
- **BEGIN CONCURRENT** (SQLite's own multi-writer proposal): defers locking to COMMIT time, allowing concurrent write transactions. Not yet in mainline SQLite. ([SQLite: begin_concurrent](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md))
- **Migration path confirmed:** Start with better-sqlite3 → swap to `libsql` npm package (same API) → gain embedded replicas and eventually MVCC when Turso stabilizes.

### 6. cr-sqlite Is Not Relevant for Single-Process

- cr-sqlite adds CRDT-based multi-writer replication to SQLite. Designed for **offline-first, distributed scenarios** where independent parties work disconnected and merge later. ([GitHub: cr-sqlite](https://github.com/vlcn-io/cr-sqlite))
- Inserts into CRDT-enabled tables are **2.5x slower** than regular SQLite tables due to metadata overhead.
- **Matt Wonlaw** (creator) joined Rocicorp to work on their new product. Project maintenance status is unclear — last substantial activity appears to be from 2024.
- **Not relevant for Sherpa's single-process MCP server.** CRDTs solve multi-writer conflict resolution; Sherpa's single-process architecture eliminates multi-writer contention structurally. Would only become relevant in a multi-server topology, and libSQL embedded replicas would be the better path there.

### 7. Temporal's Architecture Validates SQLite for Dev, RDBMS for Prod

- Temporal supports **Cassandra, PostgreSQL, MySQL, and SQLite**. SQLite is dev/test only; production requires Postgres or MySQL. ([Temporal Persistence Docs](https://docs.temporal.io/temporal-service/persistence))
- **Temporalite** (now part of Temporal CLI): single binary, zero runtime dependencies, SQLite persistence. Proves SQLite is sufficient for single-process workflow engines. ([Temporal Blog: Temporalite](https://temporal.io/blog/temporalite-the-foundation-of-the-new-temporal-cli-experience))
- Temporal uses **shard-based single-writer pattern**: each workflow history belongs to one shard, each shard managed by one History pod. Shard lock must be acquired before any history create/update. p95 lock latency target: <5ms, ideally ~1ms. ([Temporal Scaling Guide](https://dev.to/temporalio/scaling-temporal-the-basics-31l5))
- **The SQLite→Postgres upgrade path is established in the industry.** Temporal, Rails, Django all use SQLite for dev and Postgres for production. Sherpa's SQLite→libSQL path is the same pattern.
- Temporal's production limitation for SQLite: "SQLite can be used from a single process only. Temporal service is scaled out by adding processes that share a single DB." This limitation does not apply to Sherpa's single-process MCP server design. ([Temporal Community Forum](https://community.temporal.io/t/what-are-the-shortcomings-of-running-temporal-with-sqlite-in-production-for-small-scale-use-cases/18257))

### 8. Operational Complexity Is the Deciding Factor for npm-Installable Framework

- **SQLite:** Zero config. Ships as a native addon in better-sqlite3. `npm install` and done. No server process, no ports, no auth, no connection strings. File is the database.
- **Dolt:** Requires system-level binary installation (~100MB Go binary). Separate server process management (start/stop, port allocation, health checking). mysql2 client connection. Beads had to build auto-start, port conflict resolution, shared server mode, and circuit breakers — all operational overhead that has nothing to do with the framework's value proposition.
- **For `npm install sherpa`**: Adding "also install Dolt" to the getting-started guide is a significant adoption barrier. Beads can absorb this because it targets power users managing agent workflows. Sherpa targets developers building with the framework.

---

## Comparison Matrix

| Criterion | SQLite (better-sqlite3) | Dolt (via mysql2) | Git-only | Hybrid (SQLite + Git) |
|---|---|---|---|---|
| **ACID transactions** | Yes (IMMEDIATE) | Yes (MySQL wire) | No | Partial (SQLite only) |
| **Zero-config install** | Yes (`npm install`) | No (system binary) | Yes (git required anyway) | Partial |
| **In-process** | Yes | No (IPC overhead) | N/A | Partial |
| **Version control** | No (add via triggers) | Native (branch/merge/diff) | Native | Git for files only |
| **Cell-level merge** | No | Yes | No (line-level) | No |
| **Write throughput** | ~80K inserts/sec (WAL) | ~40 TPS (TPC-C) | N/A | SQLite speed |
| **Read throughput** | 100K+ selects/sec | MySQL-parity | N/A | SQLite speed |
| **Multi-agent concurrent reads** | Unlimited (WAL) | Unlimited (MySQL) | N/A | Unlimited |
| **Dependency footprint** | ~2MB native addon | ~100MB binary + server | 0 | ~2MB |
| **Upgrade path** | libSQL → Turso | Hosted Dolt | None | libSQL + git |
| **Failure modes** | Single-writer (non-issue in-process) | Server crash, port conflicts, connection drops | Lock files, race conditions | Split-brain between stores |
| **Human auditability** | Requires projection to files | SQL queries, Dolt diff | Native (files are state) | Git layer auditable |

---

## Implications for Sherpa's Persistence Layer

### Iteration 1's Decision Holds: SQLite (WAL, better-sqlite3) Is Correct

The research reinforces rather than challenges the Iteration 1 architecture. Here's why:

1. **Sherpa's MCP server is single-process.** This eliminates SQLite's only real limitation (single writer) structurally. Dolt's concurrent-writer capabilities are solving a problem Sherpa doesn't have.

2. **Dolt's killer feature (cell-level merge) is for data collaboration, not authority state.** Authority records don't need merge — they need ACID. When two agents contest the same resource, you want a transaction to pick one winner, not a merge that keeps both.

3. **Operational complexity kills adoption.** A framework installed via `npm install` cannot require users to install a 100MB Go binary, manage a server process, handle port allocation, and build circuit breakers. Beads' experience (auto-start, port conflicts, shared server mode, circuit breakers) is a cautionary tale of how much infrastructure Dolt requires.

4. **The upgrade path is clear and non-disruptive.** better-sqlite3 → libsql (drop-in, same API) → embedded replicas → Turso MVCC when it stabilizes. This path handles Sherpa's scaling trajectory without requiring users to change their setup.

5. **Git remains the document layer, not the authority layer.** MCP Agent Mail validates the "Git for audit, SQLite for operations" split. Sherpa's write-through projection already implements this: SQLite is truth, markdown files are projection, git tracks the projections.

### What Dolt Teaches Us (Without Adopting It)

- **Hash-based IDs** for conflict-free entity creation across agents (Beads pattern). Adopt in our schema design.
- **Cell-level merge semantics** inform our conflict resolution model — even though we use ACID transactions instead of merge, understanding which fields can be independently updated is valuable for optimistic concurrency design.
- **Circuit breaker pattern** for agent-facing services. If the MCP server is unhealthy, agents should fail fast rather than burn tokens retrying.

### What Git-Only Teaches Us (Without Adopting It)

- **Advisory coordination is sufficient** when agents are cooperative. Hard locks create more problems than they solve in agent systems where crashes and context resets are normal.
- **Human auditability through git** is valuable — our write-through projection to markdown files + git tracking already provides this.
- **TTL-based lease expiry** is essential. Agent Mail's model of auto-expiring reservations is correct and should be in our authority system.

---

## Open Questions That Emerged

1. **Dolt as optional plugin?** Could Sherpa support Dolt as an optional backend for teams that want branch/merge/diff on their authority state? A `sherpa.config.ts` option like `persistence: 'dolt'` that swaps the storage adapter. Cost: maintaining two backends.

2. **libSQL timeline.** When does Turso's MVCC move from experimental to production? This determines when the single-writer limitation could become relevant (multi-server topology). Monitor the [libSQL GitHub](https://github.com/tursodatabase/libsql) and [Turso blog](https://turso.tech/blog).

3. **Schema design for authority with version tracking.** SQLite doesn't have native version control, but we can add it with triggers (insert into history table on every mutation). Is this sufficient, or does authority state need something more sophisticated?

4. **Cord's SQLite-backed MCP coordination at scale.** Cord validated the pattern at small scale (behavioral tests). Has anyone stress-tested SQLite-backed MCP coordination at 20+ concurrent agent sessions? The SkyPilot data suggests problems at 1000 writers, but our single-process architecture avoids that.

5. **Temporal's shard model for future scaling.** If Sherpa ever needs multiple MCP server processes, Temporal's shard-based single-writer pattern (each shard owned by one process, shard lock before mutations) is the proven scaling approach. Should we design the schema to be shard-aware from the start?

---

## Sources

### Dolt Database
- [DoltHub Blog: Dolt is as Fast as MySQL on Sysbench](https://www.dolthub.com/blog/2025-12-04-dolt-is-as-fast-as-mysql/) — December 2025 sysbench parity announcement, 0.99 overall multiplier
- [DoltHub Blog: How Dolt Got as Fast as MySQL](https://www.dolthub.com/blog/2025-12-12-how-dolt-got-as-fast-as-mysql/) — Technical details on optimization journey
- [DoltHub Blog: More Read Performance Wins](https://www.dolthub.com/blog/2026-01-06-more-read-performance-wins/) — January 2026 read improvements
- [Dolt Latency Benchmarks](https://docs.dolthub.com/sql-reference/benchmarks/latency) — Official benchmark page with MySQL comparison, TPC-C data
- [DoltHub Blog: When NOT to Use Dolt](https://www.dolthub.com/blog/2025-12-30-why-not-dolt/) — Honest assessment: no embedded for non-Go, server required, operational complexity
- [Dolt Installation Docs](https://docs.dolthub.com/introduction/installation) — ~100MB binary, system-level install
- [DoltHub Blog: Hosted Dolt MCP](https://www.dolthub.com/blog/2026-02-03-hosted-dolt-mcp/) — MCP server for Dolt, agent branch workflows
- [Dolt Merges Documentation](https://docs.dolthub.com/sql-reference/version-control/merges) — Cell-level merge, schema conflict handling
- [DoltHub Blog: Agents Need Branches (UC Berkeley)](https://www.dolthub.com/blog/2025-09-24-berkeley-cs-agents-need-branches/) — Academic case for version-controlled agent state
- [DoltHub Blog: Dolt for Beginners: Branches](https://www.dolthub.com/blog/2025-03-10-dolt-basics-branches/) — Branch semantics, commit graph model
- [DoltHub Blog: Embedding Dolt in Go](https://www.dolthub.com/blog/2022-07-25-embedded/) — Go-only embedded mode
- [GitHub: dolthub/dolt](https://github.com/dolthub/dolt) — Main repository
- [DoltHub Blog: Everybody Rebase](https://www.dolthub.com/blog/2026-01-28-everybody-rebase/) — Rebase support for agent workflows

### Beads Ecosystem
- [GitHub: steveyegge/beads](https://github.com/steveyegge/beads) — Main repository, 18.8k stars
- [Beads DeepWiki](https://deepwiki.com/steveyegge/beads) — Architecture deep dive: dual-table design, cell-level merge, circuit breaker
- [Beads DOLT-BACKEND.md](https://github.com/steveyegge/beads/blob/main/docs/DOLT-BACKEND.md) — Dolt setup, server mode mandatory, shared server configuration
- [Beads INSTALLING.md](https://github.com/steveyegge/beads/blob/main/docs/INSTALLING.md) — Installation requirements including Dolt
- [Claude Code Skill for Beads SQLite→Dolt Migration](https://gist.github.com/jtsternberg/9bf7de05b421180a475063f7e90a4f5f) — Migration process details
- [Beads Best Practices (Medium)](https://steve-yegge.medium.com/beads-best-practices-2db636b9760c) — Yegge's operational guidance
- [The Beads Revolution (Medium)](https://steve-yegge.medium.com/the-beads-revolution-how-i-built-the-todo-system-that-ai-agents-actually-want-to-use-228a5f9be2a9) — Origin story and design rationale
- [GitHub: LNS2905/mcp-beads-village](https://github.com/LNS2905/mcp-beads-village) — MCP wrapper combining Beads + Agent Mail

### MCP Agent Mail (Git-Based Coordination)
- [GitHub: Dicklesworthstone/mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail) — Main repo: advisory leases, Git+SQLite dual persistence, pre-commit guard
- [GitHub: Dicklesworthstone/mcp_agent_mail_rust](https://github.com/Dicklesworthstone/mcp_agent_mail_rust) — Rust rewrite: 34 tools, Git-backed archive, SQLite indexing
- [MCP Agent Mail Website](https://mcpagentmail.com/) — Project homepage
- [Jeffrey Emanuel: MCP Agent Mail](https://www.jeffreyemanuel.com/projects/mcp-agent-mail) — Author's project page

### SQLite Architecture & Benchmarks
- [SQLite WAL Documentation](https://sqlite.org/wal.html) — N readers + 1 writer, snapshot isolation
- [SQLite: 35% Faster Than Filesystem](https://sqlite.org/fasterthanfs.html) — Embedded performance characteristics
- [SQLite: BEGIN CONCURRENT](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md) — Multi-writer proposal, deferred locking
- [SkyPilot: Abusing SQLite for Concurrency](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) — 1000 concurrent writers, lock contention data
- [BugSink: Single-Writer Database Architecture](https://www.bugsink.com/blog/database-transactions/) — BEGIN IMMEDIATE pattern, ingestion/digestion separation
- [GitHub: WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — 11.7x faster for selects, 15.6x faster for batch inserts
- [PowerSync: SQLite Optimizations for Ultra High Performance](https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance) — 80K inserts/sec with WAL + pragmas
- [phiresky: SQLite Performance Tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/) — 100K selects/sec, multi-GB databases
- [SQLite Isolation](https://sqlite.org/isolation.html) — Snapshot isolation semantics

### libSQL / Turso
- [GitHub: tursodatabase/libsql](https://github.com/tursodatabase/libsql) — libSQL fork of SQLite
- [GitHub: tursodatabase/libsql-js](https://github.com/tursodatabase/libsql-js) — better-sqlite3 compatible API
- [npm: libsql](https://www.npmjs.com/package/libsql) — Drop-in replacement package
- [npm: @libsql/client](https://www.npmjs.com/package/@libsql/client) — 302K weekly downloads
- [Turso: Embedded Replicas](https://docs.turso.tech/features/embedded-replicas/introduction) — Local replica with remote sync
- [Turso: Beyond Single-Writer](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) — MVCC concurrent writes
- [BigGo News: Turso MVCC](https://biggo.com/news/202510151324_Turso-MVCC-Concurrent-Writes-SQLite) — Technical preview, experimental status
- [Geeky Gadgets: Turso SQLite Rust Rewrite](https://www.geeky-gadgets.com/sqlite-multi-writer/) — 4x write improvement, 200K writes/sec
- [DEV: Distributed SQLite — libSQL and Turso in 2026](https://dev.to/dataformathub/distributed-sqlite-why-libsql-and-turso-are-the-new-standard-in-2026-58fk) — Ecosystem overview
- [DeepWiki: tursodatabase/libsql-js](https://deepwiki.com/tursodatabase/libsql-js) — API comparison with better-sqlite3

### cr-sqlite
- [GitHub: vlcn-io/cr-sqlite](https://github.com/vlcn-io/cr-sqlite) — CRDT-based multi-writer SQLite
- [vlcn.io: cr-sqlite Intro](https://www.vlcn.io/docs/cr-sqlite/intro) — Architecture and use cases
- [localfirst.fm #10: Matt Wonlaw](https://www.localfirst.fm/10) — Creator interview, design rationale
- [Corrosion CRDTs](https://superfly.github.io/corrosion/crdts.html) — Fly.io's CRDT-SQLite implementation

### Temporal (Workflow Persistence Reference)
- [Temporal Persistence Docs](https://docs.temporal.io/temporal-service/persistence) — Supported backends: Cassandra, Postgres, MySQL, SQLite
- [Temporal Blog: Temporalite](https://temporal.io/blog/temporalite-the-foundation-of-the-new-temporal-cli-experience) — Single binary, SQLite, zero dependencies
- [Temporal: Configuring SQLite Binary](https://learn.temporal.io/tutorials/infrastructure/configuring-sqlite-binary/) — SQLite setup tutorial
- [Temporal Community: SQLite in Production](https://community.temporal.io/t/what-are-the-shortcomings-of-running-temporal-with-sqlite-in-production-for-small-scale-use-cases/18257) — Single-process limitation discussion
- [Temporal: Scaling the Basics](https://dev.to/temporalio/scaling-temporal-the-basics-31l5) — Shard locking, p95 <5ms, single-writer per shard
- [PlanetScale: Temporal Sharding in Production](https://planetscale.com/blog/temporal-workflows-at-scale-sharding-in-production) — Shard ownership and lock contention
- [Temporal: Embedded Server Docs](https://docs.temporal.io/self-hosted-guide/embedded-server) — Go library embedding
- [Temporal: Replaces State Machines](https://temporal.io/blog/temporal-replaces-state-machines-for-distributed-applications) — Event sourcing architecture

### Git Concurrency
- [GitHub Blog: Git Concurrency in Desktop](https://github.blog/2015-10-20-git-concurrency-in-github-desktop/) — Lock file model, operation queuing
- [ArgoCD: git index.lock Issue](https://perrotta.dev/2025/08/argocd-git-index.lock-issue/) — Production git lock problems
- [Claude Code Issue #11005](https://github.com/anthropics/claude-code/issues/11005) — Stale .git/index.lock from background operations

### Multi-Agent Coordination Systems
- [June Kim: Cord](https://www.june.kim/cord) — SQLite-backed MCP coordination, 500 lines Python, 5 primitives
- [Beads Village MCP (LobeHub)](https://lobehub.com/mcp/lns2905-mcp-beads-village) — Multi-agent coordination via Beads + Agent Mail

---

## Raw Links

```
https://www.dolthub.com/blog/2025-12-04-dolt-is-as-fast-as-mysql/
https://www.dolthub.com/blog/2025-12-12-how-dolt-got-as-fast-as-mysql/
https://www.dolthub.com/blog/2026-01-06-more-read-performance-wins/
https://docs.dolthub.com/sql-reference/benchmarks/latency
https://www.dolthub.com/blog/2025-12-30-why-not-dolt/
https://docs.dolthub.com/introduction/installation
https://www.dolthub.com/blog/2026-02-03-hosted-dolt-mcp/
https://docs.dolthub.com/sql-reference/version-control/merges
https://www.dolthub.com/blog/2025-09-24-berkeley-cs-agents-need-branches/
https://www.dolthub.com/blog/2025-03-10-dolt-basics-branches/
https://www.dolthub.com/blog/2022-07-25-embedded/
https://github.com/dolthub/dolt
https://www.dolthub.com/blog/2026-01-28-everybody-rebase/
https://dbdb.io/db/dolt
https://deepwiki.com/dolthub/dolt
https://github.com/dolthub/driver
https://www.dolthub.com/blog/2024-11-18-json-sqlite-vs-dolt/
https://www.dolthub.com/blog/2023-12-15-benchmarking-postgres-mysql-dolt/
https://github.com/steveyegge/beads
https://deepwiki.com/steveyegge/beads
https://github.com/steveyegge/beads/blob/main/docs/DOLT-BACKEND.md
https://github.com/steveyegge/beads/blob/main/docs/INSTALLING.md
https://github.com/steveyegge/beads/blob/main/docs/TROUBLESHOOTING.md
https://github.com/steveyegge/beads/blob/main/docs/CONFIG.md
https://github.com/steveyegge/beads/blob/main/CHANGELOG.md
https://github.com/steveyegge/beads/blob/main/docs/QUICKSTART.md
https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md
https://github.com/steveyegge/beads/blob/main/docs/FAQ.md
https://github.com/steveyegge/beads/blob/main/FEDERATION-SETUP.md
https://gist.github.com/jtsternberg/9bf7de05b421180a475063f7e90a4f5f
https://steve-yegge.medium.com/beads-best-practices-2db636b9760c
https://steve-yegge.medium.com/the-beads-revolution-how-i-built-the-todo-system-that-ai-agents-actually-want-to-use-228a5f9be2a9
https://github.com/LNS2905/mcp-beads-village
https://lobehub.com/mcp/lns2905-mcp-beads-village
https://playbooks.com/mcp/steveyegge-beads
https://www.pulsemcp.com/servers/steveyegge-beads
https://github.com/steveyegge/gastown/issues/1302
https://github.com/Dicklesworthstone/mcp_agent_mail
https://github.com/Dicklesworthstone/mcp_agent_mail_rust
https://mcpagentmail.com/
https://www.jeffreyemanuel.com/projects/mcp-agent-mail
https://github.com/steveyegge/mcp_agent_mail
https://mcpmarket.com/server/agent-mail
https://pypi.org/project/mcp-agent-mail/
https://sqlite.org/wal.html
https://sqlite.org/fasterthanfs.html
https://sqlite.org/isolation.html
https://sqlite.org/speed.html
https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md
https://sqlite.org/lang_transaction.html
https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/
https://www.bugsink.com/blog/database-transactions/
https://github.com/WiseLibs/better-sqlite3
https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance
https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/
https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/
https://marending.dev/notes/sqlite-benchmarks/
https://ericdraken.com/sqlite-performance-testing/
https://github.com/tursodatabase/libsql
https://github.com/tursodatabase/libsql-js
https://www.npmjs.com/package/libsql
https://www.npmjs.com/package/@libsql/client
https://docs.turso.tech/features/embedded-replicas/introduction
https://docs.turso.tech/libsql
https://turso.tech/
https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes
https://biggo.com/news/202510151324_Turso-MVCC-Concurrent-Writes-SQLite
https://www.geeky-gadgets.com/sqlite-multi-writer/
https://dev.to/dataformathub/distributed-sqlite-why-libsql-and-turso-are-the-new-standard-in-2026-58fk
https://deepwiki.com/tursodatabase/libsql-js
https://turso.tech/blog/building-a-better-sqlite3-compatible-javascript-package-with-rust
https://github.com/tursodatabase/libsql-client-ts
https://betterstack.com/community/guides/databases/turso-explained/
https://github.com/vlcn-io/cr-sqlite
https://www.vlcn.io/docs/cr-sqlite/intro
https://www.localfirst.fm/10
https://superfly.github.io/corrosion/crdts.html
https://github.com/vlcn-io/cr-sqlite/releases
https://github.com/vlcn-io/cr-sqlite/discussions/347
https://vlcn.io/
https://docs.temporal.io/temporal-service/persistence
https://temporal.io/blog/temporalite-the-foundation-of-the-new-temporal-cli-experience
https://learn.temporal.io/tutorials/infrastructure/configuring-sqlite-binary/
https://community.temporal.io/t/what-are-the-shortcomings-of-running-temporal-with-sqlite-in-production-for-small-scale-use-cases/18257
https://dev.to/temporalio/scaling-temporal-the-basics-31l5
https://planetscale.com/blog/temporal-workflows-at-scale-sharding-in-production
https://docs.temporal.io/self-hosted-guide/embedded-server
https://temporal.io/blog/temporal-replaces-state-machines-for-distributed-applications
https://learn.temporal.io/tutorials/infrastructure/nginx-sqlite-binary/
https://learn.temporal.io/tutorials/infrastructure/envoy-sqlite-binary/
https://github.com/temporalio/temporalite-archived
https://github.com/temporalio/helm-charts
https://github.blog/2015-10-20-git-concurrency-in-github-desktop/
https://perrotta.dev/2025/08/argocd-git-index.lock-issue/
https://github.com/anthropics/claude-code/issues/11005
https://www.june.kim/cord
https://podcasts.apple.com/us/podcast/branches-diffs-and-sql-how-dolt-powers-agentic-workflows/id1193040557?i=1000747617346
https://github.com/dolthub/dolt
https://www.dolthub.com/blog/2024-05-01-cgo-tradeoffs/
https://www.dolthub.com/blog/2025-09-30-multi-stage-dockerfiles/
https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/
https://inria.hal.science/hal-04969158v3/document
```
