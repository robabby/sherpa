# Optimistic Concurrency Patterns for Multi-Agent SQLite Access

**Research iteration:** 2
**Date:** 2026-03-12
**Focus:** Concrete concurrency patterns for 2-6 AI agent processes sharing a single SQLite database on one machine

---

## Key Discoveries

### 1. WAL Mode Mechanics

- WAL (Write-Ahead Logging) is the foundational enabler. Changes append to a separate WAL file instead of modifying the database directly. Readers see consistent snapshots by checking the WAL first, then the main DB file. ([sqlite.org/wal.html](https://sqlite.org/wal.html))
- **Readers never block writers. Writers never block readers.** But there can only be **one writer at a time** — writes are still serialized. ([sqlite.org/wal.html](https://sqlite.org/wal.html))
- The wal-index (shared memory file, `<db>-shm`) is a hash table that helps readers locate pages in the WAL quickly. Implemented via mmapped files, rarely exceeds 32 KiB, never synced to disk. **All readers must be on the same machine** — WAL does not work over network filesystems. ([sqlite.org/wal.html](https://sqlite.org/wal.html), [fly.io/blog/sqlite-internals-wal/](https://fly.io/blog/sqlite-internals-wal/))
- Checkpointing transfers WAL content back to the main DB file. Auto-checkpoint triggers at ~1000 pages (~4MB). A checkpoint cannot complete if any reader holds a snapshot past that point, causing **unbounded WAL growth** if long-running readers exist. ([sqlite.org/wal.html](https://sqlite.org/wal.html))
- **Critical WAL bug fixed March 2026**: A data race in WAL-reset could cause corruption when two connections write or checkpoint simultaneously. Present in all versions 3.7.0-3.51.2, fixed in 3.52.0 (2026-03-06). The bug required extremely tight timing and was never reproduced organically. ([sqlite.org/releaselog/3_52_0.html](https://www.sqlite.org/releaselog/3_52_0.html))

### 2. WAL2 Mode (Experimental)

- WAL2 uses **two WAL files** (`<db>-wal` and `<db>-wal2`) that rotate. When one fills up, writers switch to the other while the first is checkpointed. This prevents unbounded WAL growth. ([sqlite.org WAL2 branch docs](https://sqlite.org/src/doc/wal2/doc/wal2.md))
- **Does NOT add concurrent writers.** WAL2 is about bounded WAL file size, not multi-writer support. Still one writer at a time. ([sqlite.org WAL2 branch docs](https://sqlite.org/src/doc/wal2/doc/wal2.md))
- Only available from a specific development branch. Databases in WAL2 mode return `SQLITE_NOTADB` from standard SQLite builds. **Not merged to mainline.** ([sqlite.org WAL2 branch docs](https://sqlite.org/src/doc/wal2/doc/wal2.md))
- **Implication for Sherpa:** WAL2 is irrelevant for our use case. Standard WAL is sufficient for 2-6 agents, and WAL growth is manageable with periodic checkpointing.

### 3. BEGIN CONCURRENT (Experimental, Not Production-Ready)

- **SQLite's experimental branch** (`begin-concurrent`): Defers locking until COMMIT. Multiple transactions execute concurrently, but COMMITs are serialized one at a time. ([sqlite.org begin-concurrent docs](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md))
- **Conflict detection is page-level, not row-level.** At COMMIT, the system checks if any pages the transaction read were modified since `BEGIN CONCURRENT` opened. If so, returns `SQLITE_BUSY_SNAPSHOT` and the entire transaction must ROLLBACK. ([sqlite.org begin-concurrent docs](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md))
- **Auto-increment PRIMARY KEYs destroy concurrency.** Monotonically increasing values concentrate inserts on the same page. Use random/distributed keys (ULIDs, random integers) instead. Same problem with timestamp indexes. ([sqlite.org begin-concurrent docs](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md))
- Transactions touching **different tables never conflict**. Same-table transactions only conflict if keys are "fairly close together" (same B-tree page). ([sqlite.org begin-concurrent docs](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md))
- **Status: NOT in mainline SQLite.** Lives on a separate branch (`begin-concurrent-pnu-wal2`). No release timeline. Largely undocumented. ([SQLite forum](https://sqlite.org/forum/info/84fe63b7b3))

- **Turso/libSQL's alternative**: Implements BEGIN CONCURRENT with **MVCC and row-level conflict detection** instead of page-level. Eliminates false conflicts from page sharing. Achieves 4x write throughput at 8 threads with 1ms compute per transaction. **Explicitly labeled "early technology preview, not for production use."** Has known limitations: full row copies in memory, read-write lock bottleneck, no async I/O, no CREATE INDEX support. ([turso.tech blog](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes))

- **Implication for Sherpa:** BEGIN CONCURRENT is not viable for Sherpa today. It's experimental, not in mainline SQLite, and not available in Node.js drivers. For 2-6 agents, standard WAL with application-level patterns is the right approach.

### 4. Version Columns / Optimistic Locking (The Pattern We Should Use)

- **The core pattern**: Add a `version INTEGER DEFAULT 1` column. On update: `UPDATE t SET col = ?, version = version + 1 WHERE id = ? AND version = ?`. Check affected row count. If 0 rows affected, another process modified the row. ([charlesleifer.com/blog/optimistic-locking-in-peewee-orm/](https://charlesleifer.com/blog/optimistic-locking-in-peewee-orm/))
- **RETURNING clause** (SQLite 3.35+) makes this a single round-trip: `UPDATE t SET col = ?, version = version + 1 WHERE id = ? AND version = ? RETURNING version`. If no rows returned, conflict detected. If rows returned, you get the new version atomically. ([sqlite.org/lang_returning.html](https://sqlite.org/lang_returning.html))
- **SQLite lacks `SELECT ... FOR UPDATE`**, so pessimistic locking requires `BEGIN IMMEDIATE` or `BEGIN EXCLUSIVE`. Optimistic locking with version columns is the idiomatic SQLite approach. ([charlesleifer.com](https://charlesleifer.com/blog/optimistic-locking-in-peewee-orm/), [bricelam.net](https://www.bricelam.net/2020/08/07/sqlite-and-efcore-concurrency-tokens.html))
- **Conflict handling is application-defined**: retry with fresh data, merge changes, escalate to user, or last-writer-wins. The pattern only detects conflicts — resolution is up to the application. ([charlesleifer.com](https://charlesleifer.com/blog/optimistic-locking-in-peewee-orm/))

### 5. busy_timeout vs busy_handler

- **`PRAGMA busy_timeout = N`** sets a simple retry mechanism: when the DB is locked, SQLite sleeps and retries until N milliseconds have elapsed, then returns `SQLITE_BUSY`. Must be set **per connection, every time you open one**. Default is 0 (fail immediately). ([sqlite.org/c3ref/busy_timeout.html](https://sqlite.org/c3ref/busy_timeout.html))
- **Production values**: 5000ms is the most commonly recommended minimum. SkyPilot uses 60,000ms for 1000+ concurrent processes. Django recommends 5000ms. For 2-6 agents, 5000ms should be more than sufficient. ([blog.skypilot.co](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/), [tenthousandmeters.com](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/))
- **Critical gotcha: Transaction upgrade failures bypass busy_timeout.** If you `BEGIN` (deferred), do a SELECT, then try to INSERT — and another connection has modified the DB — SQLite returns `SQLITE_BUSY` **immediately** without honoring the timeout. The fix: use `BEGIN IMMEDIATE` for transactions that will write. ([berthub.eu](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/), [tenthousandmeters.com](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/))
- **`sqlite3_busy_handler()`** is the lower-level API. busy_timeout is implemented on top of it. Custom busy handlers can implement exponential backoff, jitter, or priority-based waiting. For most uses, the PRAGMA is sufficient. ([sqlite.org/c3ref/busy_handler.html](https://www.sqlite.org/c3ref/busy_handler.html))
- **No FIFO guarantee.** SQLite's built-in retry uses hardcoded sleep intervals (1ms, 2ms, 5ms... up to 100ms). A process waiting 2 seconds can be preempted by one that just arrived. At very high concurrency this causes starvation; at 2-6 agents this is unlikely to matter. ([blog.skypilot.co](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))

### 6. Recommended PRAGMA Configuration for Multi-Process Access

The consensus across multiple production guides:

```sql
-- Set per-connection, every time you open a database:
PRAGMA journal_mode = WAL;          -- Concurrent readers + single writer
PRAGMA synchronous = NORMAL;        -- Safe in WAL mode, major perf boost
PRAGMA busy_timeout = 5000;         -- Wait up to 5s for locks
PRAGMA foreign_keys = ON;           -- Not on by default!
PRAGMA cache_size = -64000;         -- 64MB page cache (negative = KB)
PRAGMA mmap_size = 268435456;       -- 256MB memory-mapped I/O
PRAGMA temp_store = MEMORY;         -- Temp tables/indices in RAM

-- Set once (persistent across connections):
PRAGMA auto_vacuum = INCREMENTAL;   -- Prevent unbounded DB file growth
PRAGMA page_size = 4096;            -- Default, but explicit is better
```

Sources: [phiresky.github.io](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/), [oneuptime.com](https://oneuptime.com/blog/post/2026-02-02-sqlite-production-setup/view), [gluer.org](https://gluer.org/blog/sqlite-production-configuration/), [simonwillison.net](https://til.simonwillison.net/sqlite/enabling-wal-mode)

**Key notes:**
- `journal_mode = WAL` is persistent (survives connection close). All other PRAGMAs above must be set per-connection.
- `synchronous = NORMAL` in WAL mode is corruption-safe. Only checkpoints do fsync, not every transaction. `synchronous = FULL` (default) waits for fsync on every commit.
- `wal_autocheckpoint` defaults to 1000 pages. Consider setting to 0 and managing checkpoints manually if you want deterministic checkpoint timing across agents.

### 7. Write Serialization Patterns

- **SQLite already serializes writes via file-level locks.** The question is whether to additionally serialize at the application level. ([sqlite.org/lockingv3.html](https://sqlite.org/lockingv3.html))
- **Single-writer architecture (Bugsink pattern)**: Separate ingestion (queues writes) from digestion (single process writes to DB). Enables optimizations impossible with concurrent writers: simple counters, denormalization without races, trivial cache invalidation. Uses `BEGIN IMMEDIATE` for all writes, standard `BEGIN` for reads. ([bugsink.com/blog/database-transactions/](https://www.bugsink.com/blog/database-transactions/))
- **When single-writer wins**: When write operations are complex (read-modify-write cycles), when denormalized data needs consistent updates, or when you want to eliminate all contention at the cost of throughput.
- **When optimistic concurrency wins**: When writes are independent (different agents writing different records), when contention is rare, and when you want simplicity (no IPC infrastructure for a write queue).
- **For Sherpa's 2-6 agents**: Optimistic concurrency with version columns is likely sufficient. If contention becomes a problem, a write queue via IPC (Unix domain socket, named pipe, or even a separate SQLite table used as a queue) is the escalation path.

### 8. better-sqlite3 vs node:sqlite

**better-sqlite3:**
- Fully synchronous API. Executes SQL on the calling thread. Blocks Node.js event loop during queries.
- Fastest SQLite driver for Node.js. Outperforms async node-sqlite3 in benchmarks. ([github.com/WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
- WAL mode: `db.pragma('journal_mode = WAL')`. Checkpoint starvation prevention: `db.checkpoint()` manually when WAL grows. ([better-sqlite3 performance docs](https://wchargin.com/better-sqlite3/performance.html))
- Compiles `SQLITE_DEFAULT_WAL_SYNCHRONOUS=1`, so WAL mode defaults to `synchronous = NORMAL` automatically.
- Multi-process: Each process opens its own connection. No shared connection objects. SQLite's file-level locking handles coordination. ([github issue #250](https://github.com/JoshuaWise/better-sqlite3/issues/250))
- Concern: Blocking event loop. For Sherpa agents, this is likely fine — each agent is a dedicated process, not a web server handling many concurrent requests.

**node:sqlite (built-in, Node.js 22.5+):**
- Also fully synchronous (`DatabaseSync` class). Same blocking characteristics as better-sqlite3.
- **Stability: Release Candidate** as of Node.js v25.7.0 (no longer requires `--experimental-sqlite` flag since v23.4.0). ([nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html))
- Constructor accepts `timeout` option (busy_timeout in ms, default 0). ([nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html))
- **Unique advantage: Session Extension support.** `db.createSession()` and `db.applyChangeset()` enable change-tracking and conflict-aware synchronization natively. Conflict handler receives typed conflicts (`CHANGESET_DATA`, `CHANGESET_NOTFOUND`, `CHANGESET_CONFLICT`) and can return `CHANGESET_OMIT` or `CHANGESET_REPLACE`. ([nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html))
- Lacks community ecosystem maturity of better-sqlite3, but avoids native addon compilation.

**Implication for Sherpa:** `node:sqlite` is the better choice for Sherpa. The built-in session extension provides change-tracking and conflict resolution primitives that align directly with optimistic concurrency needs. Being built into Node.js eliminates a native dependency. Release Candidate stability is sufficient for our use case.

### 9. Process-Level Locking

- **SQLite uses POSIX `fcntl()` advisory locks** on Unix. Five lock states: UNLOCKED, SHARED (read), RESERVED (intent-to-write), PENDING (draining readers), EXCLUSIVE (writing). ([sqlite.org/lockingv3.html](https://sqlite.org/lockingv3.html))
- **RESERVED lock prevents writer starvation**: Only one connection can hold RESERVED at a time. Once a writer acquires RESERVED, it can still coexist with existing readers but no new writers can start. PENDING then blocks new readers while existing ones finish. ([sqlite.org/lockingv3.html](https://sqlite.org/lockingv3.html))
- **fcntl lock quirk**: Locks belong to a `(pid, inode)` pair, not a file descriptor. Closing *any* fd to the same inode releases *all* locks on that inode. SQLite uses global variables internally to track lock state and work around this. ([apenwarr.ca/log/20101213](https://apenwarr.ca/log/20101213))
- **In WAL mode**: Reader-writer coordination uses the shared-memory wal-index instead of file locks for reads. File locks are still used for write serialization. ([sqlite.org/wal.html](https://sqlite.org/wal.html))
- **`unix-excl` VFS**: If all connections are in the same OS process, using the `unix-excl` VFS avoids inter-process locking overhead. Not applicable for Sherpa (separate processes). ([sqlite.org begin-concurrent docs](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md))

### 10. Real-World Multi-Agent SQLite Coordination (Overstory)

- Overstory is a multi-agent orchestration system for AI coding agents that uses **SQLite as a mail system** for inter-agent messaging. WAL mode, ~1-5ms per query. ([github.com/jayminwest/overstory](https://github.com/jayminwest/overstory))
- Architecture: Agents operate in isolated git worktrees, share a SQLite DB for typed protocol messages (`worker_done`, `merge_ready`, `dispatch`, `escalation`). Supports broadcast (`@all`, `@builders`). ([github.com/jayminwest/overstory](https://github.com/jayminwest/overstory))
- Separate FIFO merge queue (also SQLite-backed) handles git integration with 4-tier conflict resolution.
- **Directly relevant to Sherpa's architecture**: Multiple AI agents, same machine, SQLite for coordination, WAL mode, low latency.

---

## Recommended Concurrency Architecture for Sherpa

Based on all findings, the recommended approach for 2-6 concurrent agent processes:

### Layer 1: SQLite Configuration
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
```

### Layer 2: Transaction Discipline
- **All write transactions use `BEGIN IMMEDIATE`** — never rely on deferred transaction upgrade. This ensures busy_timeout is respected and prevents instant SQLITE_BUSY failures.
- **Keep write transactions short** — single statement if possible. Read data, release, compute, then open a new IMMEDIATE transaction to write.
- **Read transactions use standard `BEGIN`** (deferred) for maximum concurrency.

### Layer 3: Optimistic Locking
- **Version column on mutable tables**: `version INTEGER NOT NULL DEFAULT 1`
- **Atomic CAS updates**: `UPDATE t SET ..., version = version + 1 WHERE id = ? AND version = ? RETURNING *`
- **On conflict (0 rows returned)**: Re-read, re-compute, retry. For Sherpa's 2-6 agents, a simple retry loop (2-3 attempts) should suffice.

### Layer 4: Schema Design for Low Contention
- **Use ULIDs or random IDs**, not auto-increment, for primary keys on tables with concurrent inserts.
- **Partition state by agent** where possible (each agent has its own rows) to minimize page-level contention.
- **Avoid timestamp indexes** on tables with high concurrent insert rates.

### Layer 5: Escalation Path
- If contention becomes measurable, consider a **single-writer process** that owns all DB writes, with agents submitting write requests via IPC (Unix domain socket or a SQLite-backed message queue table, as Overstory demonstrates).

---

## Sources

| Source | Description |
|--------|-------------|
| [sqlite.org/wal.html](https://sqlite.org/wal.html) | Official WAL mode documentation — mechanics, checkpointing, limitations |
| [sqlite.org/lockingv3.html](https://sqlite.org/lockingv3.html) | SQLite file locking — five lock states, cross-process coordination |
| [sqlite.org/isolation.html](https://sqlite.org/isolation.html) | Transaction isolation semantics in SQLite |
| [sqlite.org/lang_returning.html](https://sqlite.org/lang_returning.html) | RETURNING clause documentation |
| [sqlite.org/c3ref/busy_timeout.html](https://sqlite.org/c3ref/busy_timeout.html) | busy_timeout API reference |
| [sqlite.org/c3ref/busy_handler.html](https://www.sqlite.org/c3ref/busy_handler.html) | busy_handler API reference |
| [sqlite.org/sessionintro.html](https://sqlite.org/sessionintro.html) | Session extension overview — changesets, conflict resolution |
| [sqlite.org/session.html](https://sqlite.org/session.html) | Session extension C/C++ API reference |
| [sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md) | BEGIN CONCURRENT experimental documentation |
| [sqlite.org/src/doc/wal2/doc/wal2.md](https://sqlite.org/src/doc/wal2/doc/wal2.md) | WAL2 mode experimental documentation |
| [sqlite.org/releaselog/3_52_0.html](https://www.sqlite.org/releaselog/3_52_0.html) | SQLite 3.52.0 release notes (WAL reset bug fix) |
| [sqlite.org/lang_transaction.html](https://www.sqlite.org/lang_transaction.html) | BEGIN DEFERRED vs IMMEDIATE vs EXCLUSIVE |
| [sqlite.org/atomiccommit.html](https://sqlite.org/atomiccommit.html) | Atomic commit internals |
| [fly.io/blog/sqlite-internals-wal/](https://fly.io/blog/sqlite-internals-wal/) | Deep dive on WAL internals, wal-index hash mechanics |
| [turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) | Turso's MVCC-based BEGIN CONCURRENT implementation |
| [blog.skypilot.co/abusing-sqlite-to-handle-concurrency/](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) | SkyPilot: 1000+ processes on one SQLite DB, busy_timeout tuning |
| [bugsink.com/blog/database-transactions/](https://www.bugsink.com/blog/database-transactions/) | Single-writer architecture with write queue |
| [oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/](https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/) | Concurrent write transaction benchmarks, 4x throughput improvement |
| [phiresky.github.io/blog/2020/sqlite-performance-tuning/](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/) | Comprehensive PRAGMA tuning guide |
| [tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/) | Diagnosing and fixing SQLITE_BUSY errors |
| [berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/) | Why busy_timeout fails on transaction upgrades |
| [charlesleifer.com/blog/optimistic-locking-in-peewee-orm/](https://charlesleifer.com/blog/optimistic-locking-in-peewee-orm/) | Version column optimistic locking implementation |
| [bricelam.net/2020/08/07/sqlite-and-efcore-concurrency-tokens.html](https://www.bricelam.net/2020/08/07/sqlite-and-efcore-concurrency-tokens.html) | SQLite concurrency tokens with EF Core |
| [nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html) | Node.js built-in SQLite module API (Release Candidate) |
| [github.com/WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | better-sqlite3 — fastest Node.js SQLite driver |
| [wchargin.com/better-sqlite3/performance.html](https://wchargin.com/better-sqlite3/performance.html) | better-sqlite3 concurrency and WAL mode guide |
| [github.com/jayminwest/overstory](https://github.com/jayminwest/overstory) | Multi-agent orchestration using SQLite mail system |
| [apenwarr.ca/log/20101213](https://apenwarr.ca/log/20101213) | Deep dive on Unix file locking (fcntl, flock) quirks |
| [oneuptime.com/blog/post/2026-02-02-sqlite-production-setup/view](https://oneuptime.com/blog/post/2026-02-02-sqlite-production-setup/view) | Production SQLite setup guide (Feb 2026) |
| [gluer.org/blog/sqlite-production-configuration/](https://gluer.org/blog/sqlite-production-configuration/) | SQLite production configuration pragmas |
| [simonwillison.net/tags/sqlite-busy/](https://simonwillison.net/tags/sqlite-busy/) | Simon Willison on SQLite busy errors |
| [til.simonwillison.net/sqlite/enabling-wal-mode](https://til.simonwillison.net/sqlite/enabling-wal-mode) | Enabling WAL mode guide |

---

## Raw Links (All URLs Encountered)

```
https://sqlite.org/wal.html
https://sqlite.org/isolation.html
https://sqlite.org/lockingv3.html
https://sqlite.org/atomiccommit.html
https://sqlite.org/lang_returning.html
https://sqlite.org/lang_transaction.html
https://sqlite.org/c3ref/busy_timeout.html
https://www.sqlite.org/c3ref/busy_handler.html
https://www.sqlite.org/pragma.html
https://sqlite.org/sessionintro.html
https://sqlite.org/session.html
https://sqlite.org/session/c_changeset_abort.html
https://www.sqlite.org/session/c_changeset_conflict.html
https://sqlite.org/session/rebaser.html
https://sqlite.org/rescode.html
https://sqlite.org/changes.html
https://www.sqlite.org/releaselog/3_52_0.html
https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md
https://sqlite.org/src/doc/wal2/doc/wal2.md
https://sqlite.org/forum/forumpost/c4dbf6ca17
https://sqlite.org/forum/info/84fe63b7b3
https://sqlite.org/forum/info/d963382520ad96424b4a156dacac0a0ff0758457bd2840f76dcc84c791970688
https://www3.sqlite.org/cgi/forum/info/ee77502013a6bb7a052a1df03c9f39513ca8659f473d3245662227afd4207071
https://sqlite.org/forum/info/6ed6824176b9c773
https://sqlite.org/forum/info/7e456bf5544ab128
https://sqlite.org/forum/forumpost/04ed1b235b
https://sqlite.org/forum/forumpost/c4a3f396f6
https://sqlite.org/forum/info/58a377adbed21a4126b58d49ce4d3b1655fb637e8b1aa82fe94144490e1cc53a
https://sqlite.org/forum/info/40cd965ddb76f146
https://sqlite.org/forum/info/a66cc23b9e7405c02a35e367c9d35be3356c8546c1c0793d37f03fbbb81b65a7
https://sqlite.org/forum/info/d33843ff0dfdf9fd
https://sqlite.org/forum/info/aac25a34db0cceffd072584718f2c364610c1b3e4a240f8089adfaa4e413411c
https://sqlite.org/forum/info/47107ab818977549
https://sqlite.org/forum/info/9b1f72ccb45bef6249b2e40c6162b83099cc84054a9347f17ccc8d7c86f4abd6
https://sqlite.org/forum/info/6f595f12db2e993d90b5faea9ec46bdbc6770373f8c587aa72836181a63039ba
https://sqlite.org/forum/info/502f39a15f99ba87fe2aa8c21badfe1aea0e6406780ec19fd8b807c74da0a129
https://sqlite.org/forum/info/9038ab7da7c7596bd04f34ea863f906bc8a6accf52017ca79afe6e800083604e
https://sqlite.org/forum/info/d1a6bc7c4cd2baca
https://sqlite.org/forum/info/ec171a77a3
https://sqlite.org/src/doc/trunk/src/os_unix.c
https://github.com/sqlite/sqlite/blob/master/src/os_unix.c
https://fly.io/blog/sqlite-internals-wal/
https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes
https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/
https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/
https://bugsink.com/blog/database-transactions/
https://www.bugsink.com/blog/database-transactions/
https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/
https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/
https://charlesleifer.com/blog/optimistic-locking-in-peewee-orm/
https://www.bricelam.net/2020/08/07/sqlite-and-efcore-concurrency-tokens.html
https://elanderson.net/2018/12/entity-framework-core-sqlite-concurrency-checks/
https://blog.pecar.me/sqlite-wal/
https://blog.sqlite.ai/journal-modes-in-sqlite
https://nodejs.org/api/sqlite.html
https://nodejs.org/docs/latest-v22.x/api/sqlite.html
https://github.com/WiseLibs/better-sqlite3
https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
https://wchargin.com/better-sqlite3/performance.html
https://github.com/JoshuaWise/better-sqlite3/issues/237
https://github.com/JoshuaWise/better-sqlite3/issues/250
https://github.com/nodejs/node/issues/57597
https://github.com/nodejs/node/issues/56210
https://github.com/nodejs/node/pull/54181
https://github.com/nodejs/node/commit/3462263e8b
https://github.com/jayminwest/overstory
https://github.com/tursodatabase/libsql/blob/main/libsql-sqlite3/doc/libsql_extensions.md
https://github.com/sqliteai/sqlite-agent
https://github.com/sqliteai/sqlite-sync
https://github.com/gerdemb/SQLiteChangesetSync
https://github.com/damoclark/node-persistent-queue
https://github.com/sinkhaha/node-sqlite-queue
https://github.com/TryGhost/node-sqlite3/issues/408
https://github.com/TryGhost/node-sqlite3/issues/616
https://github.com/TryGhost/node-sqlite3/issues/1761
https://github.com/aiidateam/aiida-core/issues/6532
https://github.com/pocketbase/pocketbase/discussions/5524
https://github.com/microsoft/coyote/issues/297
https://apenwarr.ca/log/20101213
https://chris.improbable.org/2010/12/16/everything-you-never-wanted-to-know-about-file-locking/
https://oneuptime.com/blog/post/2026-02-02-sqlite-production-setup/view
https://oneuptime.com/blog/post/2026-02-02-sqlite-nodejs/view
https://gluer.org/blog/sqlite-production-configuration/
https://cj.rs/blog/sqlite-pragma-cheatsheet-for-performance-and-consistency/
https://simonwillison.net/tags/sqlite-busy/
https://til.simonwillison.net/sqlite/enabling-wal-mode
https://linuxiac.com/sqlite-3-52-released-with-wal-corruption-fix-and-cli-improvements/
https://medium.com/@gwendal.roue/four-different-ways-to-handle-sqlite-concurrency-db3bcc74d00e
https://medium.com/@sumit-s/optimistic-locking-concurrency-control-with-a-version-column-2e3db2a8120d
https://mohit-bhalla.medium.com/understanding-wal-mode-in-sqlite-boosting-performance-in-sql-crud-operations-for-ios-5a8bd8be93d2
https://docs.servicestack.net/ormlite/optimistic-concurrency
https://learn.microsoft.com/en-us/ef/core/saving/concurrency
https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8
https://dev.to/lovestaco/scaling-sqlite-with-node-worker-threads-and-better-sqlite3-4189
https://dev.to/lovestaco/understanding-sqlite-pragma-and-how-better-sqlite3-makes-it-nicer-1ap0
https://dev.to/mashraf_aiman_b9a968e5c1d/give-your-sqlite-queries-their-own-workers-a-practical-guide-for-nodejs-developers-3d74
https://dev.to/pineapplegrits/sqlite-built-in-a-game-changer-for-nodejs-development-1c7h
https://dev.to/dataformathub/distributed-sqlite-why-libsql-and-turso-are-the-new-standard-in-2026-58fk
https://dev.to/otumianempire/introduction-to-sql-using-sqlite-node-sqlite-24gm
https://dev.to/logrocket/using-the-built-in-sqlite-module-in-nodejs-2e1j
https://www.infoworld.com/article/3537050/intro-to-nodes-built-in-sqlite-module.html
https://blog.logrocket.com/using-built-in-sqlite-module-node-js/
https://bhdouglass.com/blog/nodejs-built-in-sqlite-support/
https://bun.com/reference/node/sqlite/DatabaseSync
https://docs.deno.com/api/node/sqlite/~/DatabaseSync
https://betterstack.com/community/guides/databases/turso-explained/
https://betterstack.com/community/guides/scaling-nodejs/nodejs-sqlite/
https://www.powersync.com/blog/sqlite-persistence-on-the-web
https://www.sqlite.ai/sqlite-sync
https://www.cockroachlabs.com/blog/agentic-ai-database-architecture/
https://deepwiki.com/jayminwest/overstory/6.5-concurrency-and-wal-mode
https://shivekkhurana.com/blog/sqlite-in-production/
https://vadosware.io/post/sqlite-is-threadsafe-and-concurrent-access-safe-but/
https://www.skoumal.com/en/parallel-read-and-write-in-sqlite/
https://steemit.com/blog/@justyy/improve-multithreading-performance-of-sqlite-database-by-wal-write-ahead-logging
https://gist.github.com/cessor/f8bf530212fbe75263c79564f5fc15ad
https://www.researchgate.net/publication/319487624_Research_and_Improvement_of_SQLite's_Concurrency_Control_Mechanism
https://news.ycombinator.com/item?id=45781519
https://news.ycombinator.com/item?id=22152591
https://news.ycombinator.com/item?id=16616374
https://kindatechnical.com/sql/optimistic-vs-pessimistic-locking-patterns.html
https://usavps.com/blog/database-locking-explained-when-to-use-optimistic-vs-pessimistic-concurrency/
https://www.enterprisedb.com/blog/postgresql-anti-patterns-read-modify-write-cycles
https://convincedcoder.com/2018/09/01/Optimistic-pessimistic-locking-sql/
https://learning-notes.mistermicheels.com/data/sql/optimistic-pessimistic-locking-sql/
https://mehdihadeli.com/blog/optimistic-vs-pessimistic-concurrency
https://entgo.io/blog/2021/07/22/database-locking-techniques-with-ent/
https://duckdb.org/docs/stable/connect/concurrency
https://docs.sqlitecloud.io/docs/sqlite/lang_transaction
https://reorchestrate.com/posts/sqlite-transactions/
https://runebook.dev/en/articles/sqlite/sharedcache
https://www.scylladb.com/tech-talk/libsql/
https://www.linuxcompatible.org/story/released-new-api-docs-sqlite-limits-security-fixes/
https://npm-compare.com/better-sqlite3,sqlite,sqlite3
https://npm-compare.com/better-sqlite3,sequelize,sqlite,sqlite3
```

---

## Implications for Sherpa's Concurrency Model

1. **Standard WAL mode is sufficient.** With 2-6 agents on one machine, we are well within SQLite's comfort zone. No need for experimental features (BEGIN CONCURRENT, WAL2, libSQL). WAL provides concurrent reads with serialized writes, which is the right model.

2. **Optimistic locking with version columns is the primary pattern.** Each mutable state row gets a `version` column. Agents read state, compute, then `UPDATE ... WHERE version = ? RETURNING *`. On conflict, retry with fresh data. At 2-6 agents with short write transactions, conflicts will be rare.

3. **BEGIN IMMEDIATE is mandatory for write transactions.** This is the single most important implementation detail. Deferred transactions that read-then-write will get instant `SQLITE_BUSY` errors that bypass `busy_timeout`. Every agent write transaction must use `BEGIN IMMEDIATE`.

4. **`node:sqlite` is the recommended driver.** Its built-in Session Extension (createSession/applyChangeset with typed conflict handlers) provides infrastructure for change tracking and conflict resolution that would otherwise need manual implementation. The synchronous API is not a problem for dedicated agent processes.

5. **Use ULIDs, not auto-increment.** Auto-increment concentrates inserts on the same B-tree page, creating contention at the page level. Random/sorted-random IDs (ULIDs) distribute inserts across pages, reducing even the theoretical contention from BEGIN CONCURRENT-style approaches if we ever adopt them.

6. **Schema design should partition by agent.** Where possible, give each agent its own rows (e.g., agent-specific state tables, or an `agent_id` column). This minimizes page-level overlap even further.

7. **5000ms busy_timeout is the floor.** Set it per connection. For 2-6 agents this should rarely be hit, but it provides a safety net.

8. **Overstory validates the architecture.** A production multi-agent AI system uses exactly this pattern: SQLite in WAL mode as inter-agent messaging, ~1-5ms per query, multiple concurrent agent processes. This is not theoretical — it works.

---

## Open Questions

1. **Checkpoint management**: With multiple agents holding read transactions open during long-running AI model calls, checkpoint starvation could occur. Should we designate one agent as the checkpoint manager, or have each agent checkpoint after its own writes?

2. **Session Extension for agent state sync**: `node:sqlite`'s `createSession()`/`applyChangeset()` could track which rows each agent has modified and provide conflict-aware merging. Is this worth the complexity over simple version-column CAS?

3. **Write queue threshold**: At what point (number of agents? write frequency?) should Sherpa switch from optimistic concurrency to a single-writer queue? Is there a monitoring signal we should watch?

4. **Transaction duration**: If an agent holds `BEGIN IMMEDIATE` while waiting for an AI model response (potentially seconds), it blocks all other writers. Should we enforce a maximum transaction hold time? Should the architecture separate "thinking" from "writing" explicitly?

5. **Recovery from SQLITE_BUSY**: After retrying optimistic locking failures, when should an agent give up? Should there be a circuit-breaker pattern? How do we surface contention to the human operator?

6. **WAL file growth monitoring**: Should Sherpa monitor WAL file size and trigger manual checkpoints? What's the right threshold? The default 1000-page auto-checkpoint may not fire if readers prevent it.

7. **SQLite 3.52.0 requirement**: The WAL-reset corruption bug (fixed March 2026) affects all prior versions. Should Sherpa enforce a minimum SQLite version? What version does Node.js 22/25 bundle?
