# Dolt vs SQLite as Authority Backing Store

**Research vector:** Should Sherpa's MCP coordination server use Dolt instead of (or alongside) SQLite for authority state tracking?

**Date:** 2026-03-12
**Iteration:** 2
**Verdict:** SQLite (better-sqlite3, WAL mode) remains the correct choice for Sherpa's single-process authority backing store. Dolt solves a different problem — multi-writer version-controlled data — that does not match Sherpa's architecture. Turso/libSQL is the natural upgrade path if write concurrency becomes a bottleneck.

---

## 1. Dolt Architecture

### Storage Engine: Prolly Trees

Dolt stores all data in **Prolly Trees** (Probabilistic B-Trees), a novel data structure closely related to B-Trees but with content-addressable nodes. Each node is labeled with an immutable hash derived from its contents.
([Storage Engine docs](https://docs.dolthub.com/architecture/storage-engine), [Prolly Tree docs](https://docs.dolthub.com/architecture/storage-engine/prolly-tree))

- Table data = Prolly Tree mapping primary keys to column values
- Table schema = smaller Prolly Tree of column definitions
- Database = hash of all table roots
- Commit graph = Merkle DAG of database roots (Git-style)

**Key property: structural sharing.** Sections of the tree that share the same root hash share storage between versions. This means storing the full history of a database is space-efficient — only diffs are stored.
([Storage engine blog post](https://www.dolthub.com/blog/2024-02-29-storage-engine/))

**Asymptotic performance:**

| Operation | B-Trees | Prolly Trees |
|-----------|---------|--------------|
| Random Read | log_k(n) | log_k(n) |
| Random Write | log_k(n) | (1+k/w) * log_k(n) |
| Calculate diff | n | d (diff size) |
| Structural sharing | No | Yes |

Dolt uses Snappy compression for all chunks, prioritizing speed over size.
([Block Store docs](https://docs.dolthub.com/architecture/storage-engine/block-store))

### Cell-Level Three-Way Merge

Dolt implements merge via a three-way algorithm operating on three commits: `into`, `from`, and their nearest common `ancestor`. Conflicts are detected at the **cell level** (row + column), not the line level.
([Three-way merge blog](https://www.dolthub.com/blog/2020-07-15-three-way-merge/), [Merge docs](https://docs.dolthub.com/concepts/dolt/git/merge), [Updated merge blog](https://www.dolthub.com/blog/2024-06-19-threeway-merge/))

- If two branches modify **different columns of the same row** → automatic merge, no conflict
- If two branches modify **the same cell** to different values → conflict requiring resolution
- Conflict resolution supports `ours` or `theirs` strategies automatically
- Conflicts are stored in a separate Prolly Tree alongside table data
([Conflicts docs](https://docs.dolthub.com/concepts/dolt/git/conflicts))

**Fast merge optimization (v1.56+):** Non-overlapping key ranges merge in ~0.01s vs ~9s (1000x speedup). Scales with new tree nodes created, not total changed rows.
([Fast merge announcement](https://www.dolthub.com/blog/2025-07-16-announcing-fast-merge/))

### Branching Model

Dolt branches are lightweight (pointer to a commit hash). Full Git semantics: branch, checkout, merge, clone, push, pull. Exposed in SQL via system tables (`dolt_branches`, `dolt_log`, `dolt_diff_<table>`) and stored procedures (`DOLT_COMMIT`, `DOLT_MERGE`, `DOLT_PUSH`).

---

## 2. Dolt vs SQLite Performance

### Sysbench Benchmarks (Dolt v1.83.4, late 2025)

Dolt claims parity with MySQL on Sysbench after 5 years of optimization.
([Blog: Dolt as fast as MySQL](https://www.dolthub.com/blog/2025-12-04-dolt-is-as-fast-as-mysql/), [How Dolt got fast](https://www.dolthub.com/blog/2025-12-12-how-dolt-got-as-fast-as-mysql/), [Latency docs](https://docs.dolthub.com/sql-reference/benchmarks/latency))

**Read operations (Dolt vs MySQL):**

| Test | MySQL (ms) | Dolt (ms) | Multiplier |
|------|-----------|----------|------------|
| covering_index_scan | 1.89 | 0.55 | 0.29x |
| index_scan | 34.33 | 22.28 | 0.65x |
| table_scan | 34.95 | 22.28 | 0.64x |
| oltp_point_select | 0.20 | 0.27 | 1.35x |
| oltp_read_only | 3.82 | 5.28 | 1.38x |
| select_random_points | 0.35 | 0.53 | 1.51x |
| **reads_mean_multiplier** | | | **1.0x** |

**Write operations (Dolt vs MySQL):**

| Test | MySQL (ms) | Dolt (ms) | Multiplier |
|------|-----------|----------|------------|
| oltp_insert | 4.18 | 3.13 | 0.75x |
| oltp_update_index | 4.18 | 3.19 | 0.76x |
| oltp_read_write | 9.22 | 11.45 | 1.24x |
| oltp_write_only | 5.28 | 6.09 | 1.15x |
| **writes_mean_multiplier** | | | **0.88x** |

**TPC-C (transactional):**

| Test | MySQL (TPS) | Dolt (TPS) | Multiplier |
|------|------------|-----------|------------|
| tpcc-scale-factor-1 | 93.23 | 37.49 | 2.49x slower |

TPC-C is the critical benchmark for authority state operations. **Dolt achieves ~40% of MySQL's transactional throughput** — about 37 TPS vs 93 TPS.
([TPC-C blog](https://www.dolthub.com/blog/2024-07-22-tpcc-3x/), [Benchmarking blog](https://www.dolthub.com/blog/2023-12-15-benchmarking-postgres-mysql-dolt/))

### SQLite In-Process Performance

- better-sqlite3 with WAL mode: **sub-microsecond reads** for prepared statements (~190 nanoseconds per SELECT)
([Turso blog: microsecond latency](https://turso.tech/blog/microsecond-level-sql-query-latency-with-libsql-local-replicas-5e4ae19b628b))
- WAL mode enables concurrent reads during writes — **70,000 reads/sec and 3,600 writes/sec** in benchmarks
([SQLite performance tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/))
- Per-transaction overhead with WAL + NORMAL synchronous: **< 1ms**
([PowerSync optimizations](https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance))
- SQLite "can execute millions of individual statements per second"
([SQLite speed](https://sqlite.org/speed.html))

### The In-Process vs Client-Server Gap

This is the decisive factor. SQLite runs **in-process** — zero network overhead, no serialization/deserialization, no connection pooling, no TCP round-trips. Dolt runs as a **separate MySQL-compatible server** requiring loopback network communication.

- MySQL loopback query latency: **~50 microseconds** at low concurrency, growing to 300us at 512 clients
([Packet-Foo blog](https://blog.packet-foo.com/2014/09/how-millisecond-delays-may-kill-database-performance/))
- ProxySQL adds ~25 microseconds per hop
([Percona: ProxySQL overhead](https://www.percona.com/blog/proxysql-overhead-explained-and-measured/))
- SQLite in-process: **~190 nanoseconds** for prepared statement execution (CPU cache hits)
- That is a **~250x latency gap** on the hot path (190ns vs 50,000ns)

For Sherpa's authority check pattern (verify fencing token on every mutation), this gap is architecturally significant. The hot path runs on every tool call.

---

## 3. Dolt's Node.js Story

**Dolt has no embedded mode for Node.js.** Embedded mode exists only for Go applications via `github.com/dolthub/driver`.
([Embedded Dolt blog](https://www.dolthub.com/blog/2022-07-25-embedded/), ["When NOT to use Dolt"](https://www.dolthub.com/blog/2025-12-30-why-not-dolt/))

For Node.js/TypeScript, you must:
1. Run `dolt sql-server` as a separate process
2. Connect via **mysql2** (MySQL wire protocol) over loopback
3. Use standard Node.js MySQL tooling (Prisma, Knex.js, Drizzle)
([Dolt + Prisma](https://www.dolthub.com/blog/2024-06-28-dolt-and-prisma/), [Dolt + Knex.js](https://www.dolthub.com/blog/2023-09-27-dolt-and-knexjs/))

**Comparison to better-sqlite3:**

| Property | better-sqlite3 | mysql2 → Dolt |
|----------|----------------|---------------|
| Architecture | In-process, synchronous | Client-server, async |
| Network overhead | Zero | Loopback TCP (~50us) |
| Connection pooling | Not needed | Required |
| Driver API | Synchronous (blocks event loop briefly) | Promise-based async |
| Latency floor | ~190ns (CPU cache) | ~50,000ns (network) |
| Setup | `npm install` | Install Dolt binary + start server |
| Binary size | N/A (native addon ~2MB) | Dolt binary ~103MB |

---

## 4. Dolt's Merge Semantics vs Sherpa's Authority State

### What Dolt's Cell-Level Merge Solves

Cell-level merge shines when:
- Multiple writers modify **different columns** of the same row concurrently
- Long-lived branches need reconciliation (hours/days of divergent work)
- Data requires an audit trail with queryable diffs
- Conflict resolution needs human review via SQL queries

### Why Sherpa's Authority State Does Not Benefit

Authority records (leases, fencing tokens, version counters) are:

1. **Ephemeral, not long-lived.** Leases expire in 10-30 minutes. Fencing tokens are monotonic counters. There is no "branch and merge later" pattern — authority is checked and updated in real-time on every mutation.

2. **Single-writer by design.** The entire point of Sherpa's architecture is single-process authority enforcement. One Node.js process writes all authority state. There are no concurrent writers to merge.

3. **Not auditable via diffs.** The interesting audit trail is "which agent held authority when and what did they do with it" — this is better captured as an append-only event log than version-controlled row state.

4. **High-frequency, low-latency.** Authority checks happen on every tool call. The hot path is `SELECT ... WHERE scope = ? AND expires_at > ?` — a microsecond operation in SQLite, a ~50us operation through Dolt.

5. **No branching semantics.** Authority is global state — there is no meaningful concept of "branch the lease table." A fencing token is valid or it isn't.

**Beads needed Dolt because** Beads coordinates multiple concurrent agents each running their own `bd` process, writing to the same issue database. That is a fundamentally different architecture: distributed writers with long-lived task state that benefits from branch-and-merge.

**Sherpa's MCP server funnels all writes through a single process.** This eliminates the problem Dolt was built to solve.

---

## 5. Single-Process vs Client-Server Architecture

### Sherpa's Single-Process Design

```
Claude Code ──HTTP──→ MCP Server (Node.js) ──in-process──→ SQLite
                      ↑ authority check
                      ↑ fencing token validation
                      ↑ version increment
                      ↑ file projection
```

All coordination happens inside the Node.js process. SQLite's single-writer model is not a limitation — it IS the architecture. `BEGIN IMMEDIATE` transactions provide serializable isolation with zero contention (only one writer exists).

### What Dolt Would Require

```
Claude Code ──HTTP──→ MCP Server (Node.js) ──TCP/loopback──→ Dolt sql-server (Go)
                      ↑ authority check
                      ↑ (network round-trip)
                      ↑ fencing token validation
                      ↑ (network round-trip)
                      ↑ version increment
                      ↑ (network round-trip)
```

This adds:
- A second process to manage (Go binary, ~103MB)
- TCP overhead on every authority check (~50us minimum per query)
- Connection pool management (mysql2 pool)
- Async/await everywhere instead of synchronous transaction blocks
- Process lifecycle management (startup, shutdown, health checks, crash recovery)
- Memory overhead: **2GB minimum RAM** for Dolt server, recommended 4-8GB
([Sizing blog](https://www.dolthub.com/blog/2023-12-06-sizing-your-dolt-instance/))
- Dolt loads commit graph into memory on startup — deep history = more RAM

### Impact on Hot Path

For authority check on every mutation:

| Metric | SQLite (in-process) | Dolt (client-server) |
|--------|-------------------|---------------------|
| Authority check latency | ~1-10 us | ~100-200 us |
| Transaction overhead | ~50 us (BEGIN IMMEDIATE) | ~500 us (MySQL transaction) |
| Total hot path addition | ~50-100 us | ~500-1000 us |
| Process count | 1 | 2 |
| Failure modes | Process crash | Process crash + server crash + connection failure |

---

## 6. Dolt Operational Complexity

### Running Dolt in Production

- **Binary:** Single ~103MB Go binary
([Dolt GitHub](https://github.com/dolthub/dolt))
- **Memory:** Minimum 2GB RAM, recommended 4-8GB for production. Rule of thumb: provision 10-20% of database disk size as RAM
([Sizing blog](https://www.dolthub.com/blog/2023-12-06-sizing-your-dolt-instance/))
- **Startup:** Loads commit graph into memory. No specific startup time benchmarks found, but server timeout default is 300 seconds
([Docker docs](https://docs.dolthub.com/introduction/installation/docker))
- **Backup:** Built-in via `dolt backup` or `dolt_backup()` procedure. Remotes for committed changes, backups for uncommitted. Efficient — stores diffs, not full copies
([Backup docs](https://docs.dolthub.com/concepts/dolt/rdbms/backups))
- **Docker:** Available as `dolthub/dolt-sql-server`, linux/amd64 and linux/arm64
([Docker Hub](https://hub.docker.com/r/dolthub/dolt-sql-server))

### Beads/Gas Town Production Experience

Beads v0.56+ migrated to Dolt-only. The migration was non-trivial:
([GasTown issue #1302](https://github.com/steveyegge/gastown/issues/1302))

- Stale Git hooks from old architecture persisted and caused silent failures
- Deprecated CLI flags broke ~45 production files
- Database migration function hardcoded wrong subdirectory names, causing near-empty databases
- Migration requires 6 sequential steps — skipping any leaves workspace in broken state
- Post-migration: Dolt compacted storage dramatically (391MB → 5.3MB via `.darc` archives)

The Beads community discussion revealed friction:
([Beads discussion #1836](https://github.com/steveyegge/beads/discussions/1836))

- Users valued SQLite's simplicity and zero-config nature
- Forced Dolt migration created operational pain
- Community created alternative forks (Beads Rust, Beadbox) to maintain SQLite support
- Maintainers argued that dual-backend maintenance multiplied bugs

### For a Developer Tool Like Sherpa

Dolt's operational profile is appropriate for a **data platform** or **multi-writer coordination system**, not for a single-process developer tool where the database is an implementation detail. Adding Dolt means:

- Users must install a separate binary (`brew install dolt` or Docker)
- A background server must run alongside the MCP server
- Health monitoring, port management, crash recovery
- 2-8GB additional RAM

SQLite requires: nothing. It is compiled into better-sqlite3.

---

## 7. When Dolt Wins

Dolt is the right choice when you need:

1. **Multi-writer across processes/machines.** Multiple `bd` processes writing to the same database. SQLite's single-writer model fails here.
2. **Audit trail with queryable diffs.** `SELECT * FROM dolt_diff_issues WHERE committer = 'agent-7'`. Native version history.
3. **Branching state for experiments.** Agents work on branches, reviewed via SQL diffs, merged to main. The "YOLO to FAFO" pattern.
([Agentic workflows blog](https://www.dolthub.com/blog/2025-03-17-dolt-agentic-workflows/))
4. **Distributed sync.** `dolt push`/`dolt pull` for sharing data across machines.
5. **Cell-level merge.** When concurrent modifications to different columns of the same row must auto-merge without conflict.

**Sherpa might need Dolt someday** if:
- Multiple MCP servers need to share authority state (multi-server topology)
- Authority audit trail needs queryable version history beyond append-only logs
- Agents branch authority state for speculative execution (experimental authority)
- The system scales beyond a single process

None of these are current requirements. The proposal explicitly states: "The current design assumes one coordination server."

---

## 8. When SQLite Wins

SQLite is the right choice when you need:

1. **Single-process embedded database.** Zero-config, zero-network, zero-management.
2. **Sub-millisecond latency on hot paths.** In-process access at ~190ns per prepared statement.
3. **Proven reliability.** Over 1 trillion active databases. Most tested database engine in history.
([SQLite most deployed](https://www.sqlite.org/mostdeployed.html))
4. **Zero operational overhead.** No server to start, no ports to manage, no memory to provision.
5. **Simple concurrency model.** WAL mode enables concurrent readers + single writer. `BEGIN IMMEDIATE` provides serializable isolation.
6. **Minimal dependency footprint.** `npm install better-sqlite3` — done.

**Sherpa's architecture was designed around SQLite's strengths.** Single-process MCP server + SQLite WAL + `BEGIN IMMEDIATE` = zero contention, sub-millisecond authority checks, no distributed coordination needed.

---

## 9. Turso/libSQL as Middle Ground

### What Is libSQL/Turso?

libSQL is a fork of SQLite that adds:
- **MVCC with BEGIN CONCURRENT** — row-level conflict detection instead of SQLite's database-level locking
- **4x write throughput** with multiple threads (150k → ~200k rows/sec at 8 threads)
- **Embedded replicas** — local SQLite copy that syncs with a remote Turso server
- **better-sqlite3-compatible API** via `libsql` npm package
([Turso concurrent writes blog](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes), [libsql-js](https://github.com/tursodatabase/libsql-js))

### Production Readiness (March 2026)

- **libSQL (the fork):** Production ready. Used by Turso cloud service.
([libSQL docs](https://docs.turso.tech/libsql))
- **Turso Database (Rust rewrite):** Alpha/experimental. Not recommended for production.
([Turso launch blog](https://turso.tech/blog/turso-the-next-evolution-of-sqlite))
- **BEGIN CONCURRENT (MVCC):** Experimental. Known limitations.
([Turso concurrent writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes))
- **Embedded replicas:** GA with periodic sync, read-your-writes, encryption at rest.
([Embedded replicas GA](https://turso.tech/blog/embedded-replicas-go-ga-with-production-friendly-upgrades))

### Relevance to Sherpa

Turso/libSQL is the **natural upgrade path** if Sherpa ever outgrows SQLite's single-writer model:

| Property | better-sqlite3 | libsql (embedded) | Dolt |
|----------|----------------|-------------------|------|
| API compatibility | N/A (baseline) | better-sqlite3 compatible | MySQL wire protocol |
| Architecture | In-process | In-process | Client-server |
| Write concurrency | Single writer | MVCC (experimental) | MySQL transactions |
| Latency | ~190ns | ~190ns (same engine) | ~50,000ns |
| Setup | `npm install` | `npm install` | Install binary + start server |
| Memory overhead | Minimal | Minimal | 2-8GB |
| Version control | No | No | Full Git-like |

**The migration path:** better-sqlite3 → libsql → Turso cloud is smooth and API-compatible. better-sqlite3 → Dolt is a complete rewrite (different driver, async API, connection pooling, process management).

---

## 10. Implications for Sherpa's Authority Backing Store

### Recommendation: Stay with SQLite (better-sqlite3, WAL mode)

The current proposal is correct. The reasons:

1. **Architecture match.** Sherpa's single-process MCP server eliminates the multi-writer problem that Dolt exists to solve. Adding Dolt introduces complexity for a problem that doesn't exist.

2. **Hot-path performance.** Authority checks run on every mutation. The ~250x latency gap between in-process SQLite and client-server Dolt is real and meaningful for the hot path, even if both are "fast enough" in absolute terms.

3. **Operational simplicity.** Sherpa is a developer tool, not a data platform. Users should not need to install, configure, and manage a Go database server to run an MCP coordination layer.

4. **Upgrade path exists.** If single-writer SQLite becomes a bottleneck (unlikely for Sherpa's write frequency), libSQL/Turso provides a drop-in upgrade with MVCC and 4x write throughput. The proposal already notes this in "Review Notes."

5. **Beads chose Dolt for different reasons.** Beads has multiple concurrent `bd` processes, long-lived issue state with audit requirements, and Git-like sync across machines. Sherpa has one MCP server, ephemeral authority leases, and local-first operation.

### When to Revisit This Decision

- Multi-MCP-server topology (authority state shared across processes)
- Requirement for queryable authority audit trail beyond append-only logs
- Agent branching of authority state (speculative execution)
- Community request for distributed Sherpa deployments with sync

---

## Open Questions

1. **Could Dolt serve as the backing store for initiative state** (not authority state)? Initiative proposals, plans, and task boards are long-lived, branched, and merged — a much better fit for Dolt's strengths. Authority state and initiative state could use different stores.

2. **How does Beads' circuit breaker pattern apply to Sherpa?** Beads implemented connection circuit breakers for Dolt server failures. SQLite can't fail to connect (it's in-process), but the pattern might apply to file projection or external API calls.

3. **What is Dolt's actual startup time?** No benchmarks found. The default server timeout is 300 seconds, which suggests startup can be slow for large databases. This matters for developer experience.

4. **Would Dolt's audit trail (`dolt_diff_*`) be valuable for debugging authority disputes?** If two agents disagree about who holds authority, queryable version history could help diagnose the issue. But this could also be achieved with an append-only SQLite event table.

5. **Turso's BEGIN CONCURRENT — when will it be production-ready?** This is the only scenario where the SQLite decision would need revisiting: if Sherpa moves to multi-writer and libSQL's MVCC isn't ready.

---

## Sources (Annotated)

### Dolt Architecture & Storage
- [Dolt Storage Engine docs](https://docs.dolthub.com/architecture/storage-engine) — Official storage engine overview
- [Prolly Tree docs](https://docs.dolthub.com/architecture/storage-engine/prolly-tree) — Core data structure specification
- [Block Store docs](https://docs.dolthub.com/architecture/storage-engine/block-store) — Chunk storage and compression
- [Dolt Architecture Overview](https://docs.dolthub.com/architecture/architecture) — High-level architecture
- [Dolt's Storage Engine blog](https://www.dolthub.com/blog/2024-02-29-storage-engine/) — Detailed blog post on storage internals
- [New Format Alpha blog](https://www.dolthub.com/blog/2022-05-20-new-format-alpha/) — New storage format introduction
- [New Format Default blog](https://www.dolthub.com/blog/2022-09-30-new-format-default/) — New format becoming default
- [Challenges with Prolly Trees and Columnar Storage](https://www.dolthub.com/blog/2025-09-10-challenges-with-prolly-trees-and-columnar-storage/) — Known limitations
- [DeepWiki: dolthub/dolt](https://deepwiki.com/dolthub/dolt) — Community-generated deep analysis

### Dolt Performance Benchmarks
- [Dolt Latency Benchmarks](https://docs.dolthub.com/sql-reference/benchmarks/latency) — Official Sysbench results
- [Dolt is as Fast as MySQL (Dec 2025)](https://www.dolthub.com/blog/2025-12-04-dolt-is-as-fast-as-mysql/) — Parity announcement with numbers
- [How Dolt Got as Fast as MySQL](https://www.dolthub.com/blog/2025-12-12-how-dolt-got-as-fast-as-mysql/) — Technical deep-dive on optimizations
- [Benchmarking Postgres MySQL Dolt](https://www.dolthub.com/blog/2023-12-15-benchmarking-postgres-mysql-dolt/) — Three-way comparison
- [Postgres vs MySQL Sysbench Latency](https://www.dolthub.com/blog/2024-07-16-mysql-postgres-sysbench-latency/) — Baseline comparison
- [JSON Showdown: Dolt vs SQLite](https://www.dolthub.com/blog/2024-11-18-json-sqlite-vs-dolt/) — Direct Dolt vs SQLite comparison
- [10% Slower Than MySQL (2024 summary)](https://www.dolthub.com/blog/2024-12-23-2024-perf-summary/) — Year-end performance summary
- [Dolt TPC-C Improvements](https://www.dolthub.com/blog/2024-07-22-tpcc-3x/) — TPC-C benchmark progress
- [Benchmarking Dolt with TPC-C](https://www.dolthub.com/blog/2022-09-16-tpcc-update/) — Earlier TPC-C results
- [Dolt vs MySQL: How it Started](https://dolthub.awsdev.ld-corp.com/blog/2021-02-03-dolt-vs-mysql/) — Historical performance evolution
- [Dolt performance comparison issue #6536](https://github.com/dolthub/dolt/issues/6536) — Community discussion

### Dolt Merge & Version Control
- [Cell-level Three-way Merge (2020)](https://www.dolthub.com/blog/2020-07-15-three-way-merge/) — Original merge algorithm blog
- [Three-way Merge in SQL Database (2024)](https://www.dolthub.com/blog/2024-06-19-threeway-merge/) — Updated merge documentation
- [Merge docs](https://docs.dolthub.com/concepts/dolt/git/merge) — Official merge documentation
- [Merges SQL Reference](https://docs.dolthub.com/sql-reference/version-control/merges) — SQL-level merge operations
- [Conflicts docs](https://docs.dolthub.com/concepts/dolt/git/conflicts) — Conflict detection and resolution
- [Previewing Merge Conflicts](https://www.dolthub.com/blog/2025-06-25-preview-merge-conflicts/) — Conflict preview feature
- [Resolving Conflicts on Web](https://www.dolthub.com/blog/2025-09-02-resolving-conflicts-on-the-web/) — Web-based resolution
- [Fast Merge Announcement](https://www.dolthub.com/blog/2025-07-16-announcing-fast-merge/) — 1000x merge speedup
- [Schema Conflicts](https://www.dolthub.com/blog/2024-07-23-schema-conflicts/) — Schema-level conflict handling

### Dolt Operations & Sizing
- [Sizing Your Dolt Instance](https://www.dolthub.com/blog/2023-12-06-sizing-your-dolt-instance/) — Memory, disk, CPU recommendations
- [Storage Layer Memory Optimizations](https://www.dolthub.com/blog/2022-02-28-dolt-storage-layer-memory-optimizations/) — Memory optimization history
- [Dolt Troubleshooting](https://docs.dolthub.com/sql-reference/server/troubleshooting) — Production troubleshooting guide
- [Dolt First Impressions (Vettabase)](https://vettabase.com/dolt-database-first-impressions/) — Third-party evaluation
- [Dolt Docker docs](https://docs.dolthub.com/introduction/installation/docker) — Docker deployment guide
- [Dolt Docker Tutorial](https://www.dolthub.com/blog/2022-01-11-docker-tutorial/) — Docker setup walkthrough
- [dolthub/dolt-sql-server Docker Hub](https://hub.docker.com/r/dolthub/dolt-sql-server) — Docker image
- [Backups docs](https://docs.dolthub.com/concepts/dolt/rdbms/backups) — Backup and restore
- [How to Restore a Dropped Database](https://www.dolthub.com/blog/2024-10-01-dolt_undrop-in-the-wild/) — Recovery capabilities
- [When NOT to Use Dolt](https://www.dolthub.com/blog/2025-12-30-why-not-dolt/) — Official anti-patterns

### Dolt Embedded & Node.js
- [Embedding Dolt in Go](https://www.dolthub.com/blog/2022-07-25-embedded/) — Go-only embedded mode
- [Embedding Go in C](https://www.dolthub.com/blog/2023-02-01-embedding-go-in-c/) — Cross-language embedding attempt
- [Dolt Go Driver](https://github.com/dolthub/driver) — database/sql driver for Go
- [Writing a Go SQL Driver](https://www.dolthub.com/blog/2026-01-23-golang-sql-drivers/) — Driver implementation details
- [Dolt + Prisma](https://www.dolthub.com/blog/2024-06-28-dolt-and-prisma/) — Node.js ORM integration
- [Dolt + Knex.js](https://www.dolthub.com/blog/2023-09-27-dolt-and-knexjs/) — Node.js query builder integration
- [dolthub/dolt-knexjs-example](https://github.com/dolthub/dolt-knexjs-example) — Example repository
- [dolthub/dolt-prisma-example](https://github.com/dolthub/dolt-prisma-example) — Example repository

### Dolt Agentic AI
- [Dolt for Agentic Workflows](https://www.dolthub.com/blog/2025-03-17-dolt-agentic-workflows/) — Branching pattern for agents
- [So You Want an AI Database](https://www.dolthub.com/blog/2025-12-09-ai-database/) — Version control for AI
- [Three Pillars of Agentic AI](https://www.dolthub.com/blog/2025-09-08-agentic-ai-three-pillars/) — DoltHub's agentic thesis
- [Agentic Systems Need Version Control](https://www.dolthub.com/blog/2025-10-31-agentic-systems-need-version-control/) — Example-based argument
- [Agentic Data Collection](https://www.dolthub.com/blog/2025-08-11-agentic-data-collection/) — Data collection use case
- [The Agentic Software Engineer](https://www.dolthub.com/blog/2025-07-02-the-agentic-software-engineer/) — Software engineering use case
- [Agentic Memory](https://www.dolthub.com/blog/2026-01-22-agentic-memory/) — Memory systems for agents
- [Hosted Dolt MCP](https://www.dolthub.com/blog/2026-02-03-hosted-dolt-mcp/) — MCP integration

### Beads / Gas Town (Steve Yegge)
- [Beads GitHub](https://github.com/steveyegge/beads) — Main repository
- [Beads DOLT-BACKEND.md](https://github.com/steveyegge/beads/blob/main/docs/DOLT-BACKEND.md) — Dolt backend documentation
- [Beads CHANGELOG.md](https://github.com/steveyegge/beads/blob/main/CHANGELOG.md) — Migration history
- [Beads ARCHITECTURE.md](https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md) — System architecture
- [Beads FAQ.md](https://github.com/steveyegge/beads/blob/main/docs/FAQ.md) — Frequently asked questions
- [Beads QUICKSTART.md](https://github.com/steveyegge/beads/blob/main/docs/QUICKSTART.md) — Setup guide
- [Beads Releases](https://github.com/steveyegge/beads/releases) — Version history
- [Beads Discussion #1836: Keep SQLite?](https://github.com/steveyegge/beads/discussions/1836) — Community debate on Dolt-only
- [Claude Code skill for Beads SQLite→Dolt migration](https://gist.github.com/jtsternberg/9bf7de05b421180a475063f7e90a4f5f) — Migration automation
- [DeepWiki: steveyegge/beads](https://deepwiki.com/steveyegge/beads) — Deep analysis of Beads architecture
- [Gas Town GitHub](https://github.com/steveyegge/gastown) — Multi-agent workspace manager
- [Gas Town Issue #1302: Dolt upgrade experience](https://github.com/steveyegge/gastown/issues/1302) — Production migration field report
- [Long-running Agentic Work with Beads (DoltHub)](https://www.dolthub.com/blog/2026-01-27-long-running-agentic-work-with-beads/) — DoltHub perspective on Beads
- [A Day in Gas Town (DoltHub)](https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/) — Gas Town architecture discussion

### SQLite Performance & Architecture
- [SQLite Most Deployed](https://www.sqlite.org/mostdeployed.html) — Deployment statistics
- [SQLite About](https://sqlite.org/about.html) — Overview and design philosophy
- [SQLite Speed Comparison](https://sqlite.org/speed.html) — Official benchmarks
- [SQLite Famous Users](https://www.sqlite.org/famous.html) — Notable deployments
- [SQLite Transactions](https://www.sqlite.org/lang_transaction.html) — Transaction semantics
- [SQLite Performance Tuning (phiresky)](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/) — Comprehensive tuning guide
- [SQLite Optimizations for Ultra High Performance (PowerSync)](https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance) — Optimization techniques
- [WAL vs Journal Benchmarks (High Performance SQLite)](https://highperformancesqlite.com/watch/wal-vs-journal-benchmarks) — WAL mode analysis
- [SQLite Edge Production Ready? (2026)](https://www.sitepoint.com/sqlite-edge-production-readiness-2026/) — 2026 assessment

### better-sqlite3
- [better-sqlite3 GitHub](https://github.com/WiseLibs/better-sqlite3) — Repository
- [better-sqlite3 performance.md](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md) — Performance documentation
- [better-sqlite3 vs others (npm-compare)](https://npm-compare.com/better-sqlite3,sequelize,sqlite,sqlite3) — Package comparison
- [Understanding better-sqlite3 (DEV)](https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8) — Tutorial
- [Node.js built-in SQLite module (LogRocket)](https://blog.logrocket.com/using-built-in-sqlite-module-node-js/) — Native alternative
- [Bun SQLite vs better-sqlite3 discussion](https://github.com/WiseLibs/better-sqlite3/discussions/1057) — Cross-runtime comparison
- [node:sqlite benchmarking issue #1266](https://github.com/WiseLibs/better-sqlite3/issues/1266) — Node native SQLite comparison

### Turso / libSQL
- [Turso main site](https://turso.tech/) — Product page
- [libSQL docs](https://docs.turso.tech/libsql) — libSQL documentation
- [Turso concurrent writes blog](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) — MVCC implementation details
- [How Turso Eliminates Single-Writer Bottleneck (Better Stack)](https://betterstack.com/community/guides/databases/turso-explained/) — Third-party explanation
- [Turso: Next Evolution of SQLite](https://turso.tech/blog/turso-the-next-evolution-of-sqlite) — Rust rewrite announcement
- [Turso GitHub](https://github.com/tursodatabase/turso) — Rust rewrite repository
- [libSQL GitHub](https://github.com/tursodatabase/libsql) — Fork repository
- [libsql-js GitHub](https://github.com/tursodatabase/libsql-js) — better-sqlite3 compatible Node.js binding
- [libsql-client-ts GitHub](https://github.com/tursodatabase/libsql-client-ts) — TypeScript client
- [@libsql/client npm](https://www.npmjs.com/package/@libsql/client) — npm package
- [libsql npm](https://www.npmjs.com/package/libsql) — Native binding package
- [Embedded Replicas GA](https://turso.tech/blog/embedded-replicas-go-ga-with-production-friendly-upgrades) — GA announcement
- [Embedded Replicas Introduction](https://docs.turso.tech/features/embedded-replicas/introduction) — Feature documentation
- [DIY Database CDN with Embedded Replicas](https://turso.tech/blog/do-it-yourself-database-cdn-with-embedded-replicas) — Architecture pattern
- [Microsecond Latency with libSQL Replicas](https://turso.tech/blog/microsecond-level-sql-query-latency-with-libsql-local-replicas-5e4ae19b628b) — Performance measurements
- [Building better-sqlite3 compatible package with Rust](https://turso.tech/blog/building-a-better-sqlite3-compatible-javascript-package-with-rust-a388cee9) — Implementation approach
- [Distributed SQLite: libSQL and Turso in 2026 (DEV)](https://dev.to/dataformathub/distributed-sqlite-why-libsql-and-turso-are-the-new-standard-in-2026-58fk) — Ecosystem overview
- [Turso concurrent writes discussion #2043](https://github.com/tursodatabase/turso/discussions/2043) — Community discussion
- [BEGIN CONCURRENT issue #86](https://github.com/tursodatabase/turso/issues/86) — Feature tracking
- [Turso Hacker News discussion](https://news.ycombinator.com/item?id=46810950) — Community analysis
- [Geeky Gadgets: SQLite multi-writer](https://www.geeky-gadgets.com/sqlite-multi-writer/) — Press coverage

### Fencing Tokens & Distributed Locking
- [Martin Kleppmann: How to do Distributed Locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — Canonical reference
- [Fencing Tokens and Distributed Locking (rakan.de)](https://rakan.de/fencing-tokens-and-distributed-locking/) — Practical guide
- [Faultline: Crash-safe distributed job processing](https://github.com/kritibehl/faultline) — Implementation example
- [Locks, Leases, Fencing Tokens, FizzBee](https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/) — Formal modeling
- [Distributed Systems Shibboleths](https://jolynch.github.io/posts/distsys_shibboleths/) — Patterns overview
- [How Distributed Systems Avoid Race Conditions](https://newsletter.scalablethread.com/p/how-distributed-systems-avoid-race) — Pessimistic locking patterns

### MySQL / Network Overhead
- [mysql2 npm](https://www.npmjs.com/package/mysql2) — Node.js MySQL driver
- [node-mysql2 GitHub](https://github.com/sidorares/node-mysql2) — Driver repository
- [MySQL Connection Handling and Scaling](https://dev.mysql.com/blog-archive/mysql-connection-handling-and-scaling/) — MySQL internals
- [ProxySQL Overhead Measured (Percona)](https://www.percona.com/blog/proxysql-overhead-explained-and-measured/) — Network overhead quantification
- [How Millisecond Delays Kill Database Performance (Packet-Foo)](https://blog.packet-foo.com/2014/09/how-millisecond-delays-may-kill-database-performance/) — Latency impact analysis
- [Cloudflare: SQLite in Durable Objects](https://blog.cloudflare.com/sqlite-in-durable-objects/) — SQLite at edge scale

### Database Comparisons
- [Dolt vs SQLite (StackShare)](https://stackshare.io/stackups/dolt-vs-sqlite) — Community comparison
- [Dolt vs SQLite Properties (db-engines)](https://db-engines.com/en/system/Dolt;SQLite) — Systematic comparison
- [Dolt Diff vs SQLite Diff](https://www.dolthub.com/blog/2022-06-03-dolt-diff-vs-sqlite-diff/) — Diff capability comparison
- [Dolt Diff vs SQLite Diff Benchmark (Gist)](https://gist.github.com/andy-wm-arthur/1169c05a17be79e96df5fea2ffc80509) — Benchmark code

---

## Raw Links

Every URL encountered during this research, including tangential ones:

```
https://docs.dolthub.com/architecture/storage-engine
https://www.dolthub.com/blog/2022-05-20-new-format-alpha/
https://www.dolthub.com/blog/2024-02-29-storage-engine/
https://docs.dolthub.com/architecture/storage-engine/prolly-tree
https://docs.dolthub.com/architecture/architecture
https://deepwiki.com/dolthub/dolt
https://www.dolthub.com/blog/2025-09-10-challenges-with-prolly-trees-and-columnar-storage/
https://www.linkedin.com/posts/dolthubinc_dolts-storage-engine-activity-7169390820146548736-LgKz
https://docs.dolthub.com/architecture/storage-engine/block-store
https://www.dolthub.com/blog/2022-09-30-new-format-default/
https://docs.dolthub.com/sql-reference/benchmarks/latency
https://www.dolthub.com/blog/2025-12-04-dolt-is-as-fast-as-mysql/
https://www.dolthub.com/blog/2025-12-12-how-dolt-got-as-fast-as-mysql/
https://www.dolthub.com/blog/2023-12-15-benchmarking-postgres-mysql-dolt/
https://www.dolthub.com/blog/2024-07-16-mysql-postgres-sysbench-latency/
https://www.dolthub.com/blog/2024-11-18-json-sqlite-vs-dolt/
https://www.dolthub.com/blog/2024-12-23-2024-perf-summary/
https://dolthub.awsdev.ld-corp.com/blog/2021-02-03-dolt-vs-mysql/
https://sqlite.org/speed.html
https://github.com/dolthub/dolt/issues/6536
https://npm-compare.com/mysql,mysql2
https://developers-heaven.net/blog/mysql-with-node-js-the-mysql2-driver-and-promise-based-queries/
https://github.com/WiseLibs/better-sqlite3/discussions/1057
https://npm-compare.com/better-sqlite3,sequelize,sqlite,sqlite3
https://npm-compare.com/better-sqlite3,sqlite,sqlite3
https://github.com/WiseLibs/better-sqlite3/issues/1266
https://blog.logrocket.com/using-built-in-sqlite-module-node-js/
https://github.com/WiseLibs/better-sqlite3
https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8
https://www.dolthub.com/blog/2020-07-15-three-way-merge/
https://github.com/dolthub/dolt
https://news.knowledia.com/US/en/articles/cell-level-three-way-merge-in-dolt-6723f2cdf2069546c83a6641914e9f33db81a3ed
https://dbdb.io/db/dolt
https://www.dolthub.com/blog/2024-06-19-threeway-merge/
https://docs.dolthub.com/concepts/dolt/git/merge
https://www.dolthub.com/blog/2024-12-02-workbench-better-with-version-control/
https://docs.doltgres.com/reference/version-control/dolt-sql-functions
https://docs.dolthub.com/sql-reference/version-control/merges
https://docs.dolthub.com/sql-reference/version-control/dolt-sql-functions
https://github.com/steveyegge/beads/blob/main/CHANGELOG.md
https://github.com/steveyegge/beads/releases
https://gist.github.com/jtsternberg/9bf7de05b421180a475063f7e90a4f5f
https://github.com/steveyegge/beads/blob/main/docs/DOLT-BACKEND.md
https://www.dolthub.com/blog/2026-01-27-long-running-agentic-work-with-beads/
https://github.com/steveyegge/beads/blob/main/docs/FAQ.md
https://deepwiki.com/steveyegge/beads
https://github.com/steveyegge/beads/blob/main/docs/QUICKSTART.md
https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/
https://github.com/steveyegge/beads
https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes
https://github.com/tursodatabase/turso
https://betterstack.com/community/guides/databases/turso-explained/
https://turso.tech/
https://github.com/tursodatabase/turso/discussions/2043
https://dev.to/dataformathub/distributed-sqlite-why-libsql-and-turso-are-the-new-standard-in-2026-58fk
https://www.geeky-gadgets.com/sqlite-multi-writer/
https://www.webpronews.com/turso-enables-concurrent-writes-in-libsql-for-scalable-edge-databases/
https://docs.turso.tech/libsql
https://medium.com/lets-code-future/turso-the-sqlite-that-hit-the-gym-and-moved-to-the-cloud-2c946cd48158
https://www.dolthub.com/
https://docs.dolthub.com/
https://www.dolthub.com/blog/2022-02-28-dolt-storage-layer-memory-optimizations/
https://vettabase.com/dolt-database-first-impressions/
https://docs.dolthub.com/introduction/getting-started/database
https://www.linkedin.com/company/dolthubinc
https://medium.com/@adai_9636/dolt-a-version-controlled-sql-database-tool-2ea49d73a0b8
https://www.dolthub.com/blog/2022-07-25-embedded/
https://github.com/dolthub/driver
https://www.dolthub.com/blog/2026-01-23-golang-sql-drivers/
https://pkg.go.dev/github.com/dolthub/dolt
https://www.dolthub.com/blog/2025-01-24-go-sql-with-dolt/
https://pkg.go.dev/github.com/dolthub/go-mysql-server/sql
https://pkg.go.dev/github.com/dolthub/go-mysql-server
https://www.dolthub.com/blog/2023-06-12-cli-to-sql/
https://github.com/dolthub/go-mysql-server/blob/main/README.md
https://www.dolthub.com/blog/2025-12-30-why-not-dolt/
https://golang.testcontainers.org/modules/dolt/
https://www.dolthub.com/blog/2024-06-28-dolt-and-prisma/
https://www.dolthub.com/blog/2023-09-27-dolt-and-knexjs/
https://github.com/dolthub/dolt-knexjs-example
https://www.dolthub.com/blog/2023-08-02-workbench-architecture-and-rgd-stack/
https://github.com/dolthub/dolt-prisma-example
https://www.linkedin.com/posts/dolthubinc_getting-started-with-dolt-and-prisma-activity-7212509103938547712-5Ows
https://mohit-bhalla.medium.com/understanding-wal-mode-in-sqlite-boosting-performance-in-sql-crud-operations-for-ios-5a8bd8be93d2
https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance
https://news.ycombinator.com/item?id=35547819
https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
https://highperformancesqlite.com/watch/wal-vs-journal-benchmarks
https://sqlite.org/forum/info/117c91891cf7ac15
https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
https://javascript.plainenglish.io/stop-the-sqlite-performance-wars-your-database-can-be-10x-faster-and-its-not-magic-156022addc75
https://developer.android.com/topic/performance/sqlite-performance-best-practices
https://ericdraken.com/sqlite-performance-testing/
https://docs.dolthub.com/concepts/dolt/rdbms/backups
https://www.dolthub.com/blog/2024-10-01-dolt_undrop-in-the-wild/
https://dolthub.awsdev.ld-corp.com/blog/2023-01-30-dolt-for-mysql-backups/
https://www.trickster.dev/post/getting-the-data-under-version-control-with-dolt/
https://computingforgeeks.com/install-and-use-dolt-git-for-sql-database/
https://hub.docker.com/r/dolthub/dolt-sql-server
https://hub.docker.com/r/dolthub/dolt
https://hub.docker.com/r/dolthub/dolt-workbench
https://github.com/dolthub/dolt/issues/6508
https://hub.docker.com/r/klakegg/dolt
https://www.dolthub.com/blog/2022-01-11-docker-tutorial/
https://github.com/dolthub/dolt/issues/4843
https://docs.doltlab.com/administrator-guides/basic
https://docs.dolthub.com/introduction/installation/docker
https://www.dolthub.com/blog/2023-10-25-dolt-docker/
https://turso.tech/blog/microsecond-level-sql-query-latency-with-libsql-local-replicas-5e4ae19b628b
https://blog.packet-foo.com/2014/09/how-millisecond-delays-may-kill-database-performance/
https://groups.drupal.org/node/27166
https://releem.com/docs/mysql-latency
https://dev.mysql.com/blog-archive/mysql-connection-handling-and-scaling/
https://medium.com/@eremeykin/network-or-database-identifying-the-cause-of-slow-queries-1c366e7d2ec8
https://www.linode.com/community/questions/7703/mysql-huge-latency-times
https://hackmysql.com/commit-latency-aurora-vs-rds-mysql-8.0/
https://www.percona.com/blog/proxysql-overhead-explained-and-measured/
https://docs.dolthub.com/concepts/dolt/git/conflicts
https://github.com/dolthub/dolt/issues/3336
https://dolt.gitbook.io/dolt-dev/concepts/dolt/git/conflicts
https://www.dolthub.com/blog/2025-06-25-preview-merge-conflicts/
https://www.dolthub.com/blog/2025-09-02-resolving-conflicts-on-the-web/
https://www.dolthub.com/blog/2025-07-16-announcing-fast-merge/
https://www.dolthub.com/blog/2024-07-23-schema-conflicts/
https://docs.turso.tech/features/embedded-replicas/introduction
https://github.com/tursodatabase/libsql-client-ts
https://turso.tech/blog/embedded-replicas-go-ga-with-production-friendly-upgrades
https://turso.tech/blog/do-it-yourself-database-cdn-with-embedded-replicas
https://turso.tech/blog/introducing-embedded-replicas-deploy-turso-anywhere-2085aa0dc242
https://github.com/tursodatabase/libsql
https://github.com/tursodatabase/embedded-replica-examples
https://www.sitepoint.com/sqlite-edge-production-readiness-2026/
https://www.npmjs.com/package/@libsql/client
https://github.com/tursodatabase/libsql-js
https://www.npmjs.com/package/libsql
https://www.npmjs.com/package/@libsql/sqlite3
https://turso.tech/blog/building-a-better-sqlite3-compatible-javascript-package-with-rust-a388cee9
https://blog.logrocket.com/libsql-next-gen-fork-sqlite/
https://www.npmjs.com/package/@hebilicious/libsql-client
https://docs.turso.tech/sdk/ts/reference
https://turso.tech/blog/turso-the-next-evolution-of-sqlite
https://github.com/tursodatabase/turso/issues/86
https://news.ycombinator.com/item?id=46810950
https://www.dolthub.com/blog/2023-12-06-sizing-your-dolt-instance/
https://docs.dolthub.com/sql-reference/server/troubleshooting
https://github.com/liquidata-inc/dolt/issues/852
https://docs.doltlab.com/older-versions/pre-installer-administrator-guide
https://news.ycombinator.com/item?id=26370572
https://db-engines.com/en/system/Dolt
https://dolthub.awsdev.ld-corp.com/blog/2024-10-28-dolt-anatomy/
https://www.dolthub.com/blog/2022-09-16-tpcc-update/
https://www.dolthub.com/blog/2024-07-22-tpcc-3x/
https://www.tpc.org/information/benchmarks5.asp
https://www.tpc.org/tpcc/
https://wganesh.medium.com/database-benchmarks-transaction-processing-performance-d2ed14d78dea
https://en.wikipedia.org/wiki/TPC-C
https://jimgray.azurewebsites.net/BenchmarkHandbook/chapter12.pdf
https://dl.acm.org/doi/10.1145/170036.170042
https://www.sqlite.org/mostdeployed.html
https://sqlite.org/about.html
https://medium.com/@reliabledataengineering/how-sqlite-became-the-most-deployed-database-in-the-world-the-untold-story-of-a-database-that-f3e150abf497
https://dev.to/shayy/everyone-is-wrong-about-sqlite-4gjf
https://blog.cloudflare.com/sqlite-in-durable-objects/
https://www.sqlite.org/famous.html
https://canonical.com/dqlite
https://reintech.io/blog/java-embedded-databases-sqlite-h2-lightweight-storage
https://www.sqlite.org/lang_transaction.html
https://sqlite.org/forum/forumpost/04ed1d235b
https://system.data.sqlite.org/home/raw/419906d4a0043afe2290c2be186556295c25c724
https://reorchestrate.com/posts/sqlite-transactions/
https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/
https://ducklet.app/blog/2024/01/17/the-power-of-transactions-in-sqlite/
https://www.hwaci.com/sw/sqlite/lang_transaction.html
https://github.com/expo/expo/issues/13552
https://www.sqlitetutorial.net/sqlite-transaction/
https://www.drupal.org/node/3305282
https://github.com/kritibehl/faultline
https://jolynch.github.io/posts/distsys_shibboleths/
https://rakan.de/fencing-tokens-and-distributed-locking/
https://pages.cs.wisc.edu/~remzi/Classes/739/Spring2003/Papers/leases-redis-problem.pdf
https://newsletter.scalablethread.com/p/how-distributed-systems-avoid-race
https://ebrary.net/64834/computer_science/fencing_tokens
https://etcd.io/docs/v3.5/learning/why/
https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/
https://medium.com/@lalitadithya/everything-ive-learnt-about-distributed-locking-so-far-1f1569e6df5
https://sidorares.github.io/node-mysql2/docs
https://oneuptime.com/blog/post/2026-01-06-nodejs-connection-pooling-postgresql-mysql/view
https://medium.com/@havus.it/understanding-connection-pooling-for-mysql-28be6c9e2dc0
https://www.npmjs.com/package/mysql2/v/3.2.4
https://github.com/mysqljs/mysql
https://www.alxolr.com/articles/overloaded-connection-pool-with-bad-mysql-driver-implementation
https://github.com/mysqljs/mysql/issues/1460
https://github.com/sidorares/node-mysql2
https://github.com/mysqljs/mysql/issues/2433
https://github.com/sidorares/node-mysql2/issues/2362
https://www.dolthub.com/blog/2025-12-09-ai-database/
https://www.dolthub.com/blog/
https://www.dolthub.com/blog/2026-02-03-hosted-dolt-mcp/
https://www.dolthub.com/blog/2025-09-08-agentic-ai-three-pillars/
https://www.dolthub.com/blog/2025-10-31-agentic-systems-need-version-control/
https://www.dolthub.com/blog/2025-08-11-agentic-data-collection/
https://www.dolthub.com/blog/2025-03-17-dolt-agentic-workflows/
https://www.dolthub.com/blog/2025-07-02-the-agentic-software-engineer/
https://www.dolthub.com/blog/2026-01-22-agentic-memory/
https://github.com/steveyegge/gastown
https://github.com/steveyegge/gastown/issues/1302
https://github.com/steveyegge/beads/blob/main/docs/CONFIG.md
https://github.com/steveyegge/beads/blob/main/docs/TROUBLESHOOTING.md
https://github.com/steveyegge/gastown/blob/main/docs/INSTALLING.md
https://www.decisioncrafters.com/beads-ai-agent-memory-system/
https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md
https://github.com/steveyegge/beads/discussions/1836
https://stackshare.io/stackups/dolt-vs-sqlite
https://www.dolthub.com/blog/2022-06-03-dolt-diff-vs-sqlite-diff/
https://gist.github.com/andy-wm-arthur/1169c05a17be79e96df5fea2ffc80509
https://db-engines.com/en/system/Dolt;SQLite
https://db-engines.com/en/system/Dolt;SQLite;STSdb
https://db-engines.com/en/system/Dolt;RRDtool;SQLite
https://www.geeksforgeeks.org/node-js/how-to-connect-to-a-mysql-database-using-the-mysql2-package-in-node-js/
https://www.singlestore.com/developers/build/nodejs/mysql2/
https://www.w3schools.com/nodejs/nodejs_mysql.asp
https://blog.rheinwerk-computing.com/connecting-node-js-to-a-mysql-database
https://stackabuse.com/integrating-mysql-with-nodejs-applications/
https://medium.com/@sahni_hargun/getting-started-with-node-js-and-mysql2-519407a8e7de
https://www.w3tutorials.net/blog/nodejs-mysql-driver/
https://tfetimes.com/improve-insert-per-second-performance-of-sqlite/
https://sqlite.org/src4/doc/trunk/www/lsmperf.wiki
https://medium.com/@JasonWyatt/squeezing-performance-from-sqlite-insertions-971aff98eef2
https://www.pdq.com/blog/improving-bulk-insert-speed-in-sqlite-a-comparison-of-transactions/
https://voidstar.tech/sqlite_insert_speed/
https://sqlite.org/forum/forumpost/e140d84e71?t=h
https://www.agentmail.to
https://docs.agentmail.to/welcome
https://www.ycombinator.com/companies/agentmail
https://www.agentmail.to/blog/agentmail-intro
https://techcrunch.com/2026/03/10/agentmail-raises-6m-to-build-an-email-service-for-ai-agents/
https://github.com/agentmail-to
https://github.com/Dicklesworthstone/mcp_agent_mail
https://www.agentmail.to/blog/agentmail-seed-launch
https://thenextweb.com/news/agentmail-raises-6m-seed-ai-agent-email-inboxes
https://news.ycombinator.com/item?id=46812608
https://modelcontextprotocol.info/docs/best-practices/
https://auth0.com/blog/an-introduction-to-mcp-and-authorization/
https://www.cerbos.dev/blog/mcp-authorization
https://curity.io/resources/learn/design-mcp-authorization-apis/
https://stytch.com/blog/MCP-authentication-and-authorization-guide/
https://simplescraper.io/blog/how-to-mcp
https://modelcontextprotocol.io/docs/tutorials/security/authorization
https://www.descope.com/learn/post/mcp
https://dev.to/zenstack/turning-your-database-into-an-mcp-server-with-auth-32mp
https://www.descope.com/blog/post/mcp-auth-spec
https://news.ycombinator.com/item?id=39983490
```
