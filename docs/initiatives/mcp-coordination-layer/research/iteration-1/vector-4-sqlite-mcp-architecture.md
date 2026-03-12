# SQLite Concurrency & MCP Server Architecture

**Research question:** How to architect an MCP server backed by SQLite that serves multiple concurrent AI agent clients? What are the ACID, concurrency, and connection management considerations?

**Date:** 2026-03-11
**Iteration:** 3

---

## Key Discoveries

### 1. SQLite WAL Mode: The Concurrency Foundation

- **WAL (Write-Ahead Logging) inverts the traditional rollback journal.** Instead of copying old pages before modification, WAL appends new page versions to a separate WAL file and leaves the original database file untouched. This means readers access the original database while writers append to the WAL, eliminating blocking conflicts. ([SQLite WAL docs](https://sqlite.org/wal.html))

- **Exact concurrency guarantee: N concurrent readers + 1 writer.** Readers never block writers. Writers never block readers. But only one writer at a time -- the second writer must wait until the first commits or rolls back. ([SQLite WAL docs](https://sqlite.org/wal.html))

- **Reader snapshot isolation via "end marks."** When a read transaction begins, it records its position in the WAL (the "end mark"). The reader sees a consistent snapshot of the database as of that point. Later writes appended to the WAL are invisible to existing readers. This provides snapshot isolation without locks. ([Fly.io SQLite Internals](https://fly.io/blog/sqlite-internals-wal/))

- **Checkpointing transfers WAL content back to the main database.** Auto-checkpoint triggers at ~1000 pages (~4MB). A checkpoint cannot advance past the end mark of any active reader, so long-running read transactions prevent WAL cleanup and cause WAL file growth. ([SQLite WAL docs](https://sqlite.org/wal.html))

- **WAL has hard limits.** Transactions larger than ~100MB may be slower than rollback mode. Transactions exceeding ~1GB may fail entirely (improved in SQLite 3.11.0). All processes must be on the same host -- WAL does not work over network filesystems because it requires shared memory via the `-shm` file. ([SQLite WAL docs](https://sqlite.org/wal.html))

- **The WAL index (`-shm` file) uses a hash-based structure.** Each 32KB block contains 4,096 page number entries and an 8,192-slot hash map for O(1) page lookups. The hash function is `(pgno * 383) % 8192`. ([Fly.io SQLite Internals](https://fly.io/blog/sqlite-internals-wal/))

### 2. SQLITE_BUSY: The Critical Failure Mode

- **`busy_timeout` only helps for lock contention, not deadlocks.** Setting `PRAGMA busy_timeout=5000` makes SQLite retry for up to 5 seconds when it encounters a lock. But deadlock scenarios bypass the timeout entirely and return SQLITE_BUSY immediately. ([Bert Hubert](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/))

- **The deadly pattern: DEFERRED transactions that upgrade from read to write.** If transaction A starts with a SELECT (read lock), then tries to INSERT (needs write lock), while transaction B already holds a write lock, SQLite detects an unavoidable deadlock and returns SQLITE_BUSY *instantly* -- no timeout, no retry. This is because allowing the upgrade would violate serializable isolation. ([Bert Hubert](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/), [Ten Thousand Meters](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/))

- **The fix: `BEGIN IMMEDIATE` for all write transactions.** This acquires the write lock at transaction start. If the lock is unavailable, the `busy_timeout` handler kicks in and retries. No deadlock possible because there's no read-to-write upgrade. ([Bert Hubert](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/), [Jason Gorman](https://jasongorman.uk/writing/sqlite-background-job-system/))

- **SQLite's busy handler uses hardcoded sleep intervals: `{1, 2, 5, 10, 15, 20, 25, 25, 25, 50, 50, 100}` milliseconds.** There are no condition variables -- lock acquisition is non-deterministic. A process waiting for 2 seconds can lose the lock to a newcomer. ([SkyPilot Blog](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))

- **SkyPilot production data at 1000x concurrent writers:** p50 write latency of 2.3 seconds with 60-second busy_timeout. Only 0.13% of operations exceeded the timeout. Every 5.6 seconds of timeout increase halves the timeout probability. ([SkyPilot Blog](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))

- **Rails 8 defaults to IMMEDIATE transactions for SQLite.** Stephen Margheim's work on the Rails SQLite adapter includes a Ruby-based `busy_handler` that releases the GVL (Global VM Lock) while waiting, enabling other Ruby threads to run during lock waits. ([FractaledMind](https://fractaledmind.com/2023/12/11/sqlite-on-rails-improving-concurrency/))

### 3. Multi-Process vs Multi-Thread Access

- **Multiple processes can access the same SQLite database file simultaneously.** Each process opens its own connection. Coordination happens through file-level locking (POSIX advisory locks on Unix). WAL mode's shared memory (`-shm` file) provides the index for concurrent readers. ([SQLite Threading docs](https://sqlite.org/threadsafe.html))

- **Within a single process, each thread should have its own connection.** SQLite supports three threading modes: single-thread (no mutexes), multi-thread (separate connections per thread), and serialized (any thread, any connection). For best concurrency, use multi-thread mode with one connection per thread. ([SQLite Threading docs](https://sqlite.org/threadsafe.html))

- **Application-level mutex outperforms SQLite's file locking for high concurrency.** Benchmarks show that wrapping writes in an in-memory mutex maintains ~60k ops/sec stability even at 256 concurrent threads, eliminating lock conflicts entirely. SQLite's POSIX advisory file locking is designed for inter-process coordination and has higher overhead. ([Ten Thousand Meters](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/))

- **Single-process architecture is the winning pattern.** If you can funnel all writes through one process (like an MCP server), you eliminate cross-process lock contention entirely. The MCP server serializes writes internally using its own event loop or mutex, while SQLite handles the storage. ([Ten Thousand Meters](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/))

### 4. better-sqlite3: The Right Driver for MCP

- **better-sqlite3 is synchronous by design -- and this is its strength.** The SQLite C API serializes all operations within a single process anyway. An async wrapper (like node-sqlite3) adds overhead to manage queues and intermediate data conversions for operations that are already serialized. better-sqlite3 eliminates this overhead. ([better-sqlite3 Issue #32](https://github.com/JoshuaWise/better-sqlite3/issues/32))

- **Performance:** better-sqlite3 achieves 1,223,260 ops/sec for point queries (getUserById). It outperforms node:sqlite by 1.14x-1.67x across most operations. It is roughly 100x faster than Turso's async client for certain aggregation queries. ([SQG Benchmark](https://sqg.dev/blog/sqlite-driver-benchmark))

- **The synchronous API blocks Node.js's event loop.** For an MCP tool handler (which is async), a synchronous DB call completes before returning to the event loop. This is fine when queries are fast (sub-millisecond to low-millisecond range). For slow queries, worker threads are the escape hatch. ([better-sqlite3 Issue #32](https://github.com/JoshuaWise/better-sqlite3/issues/32), [DEV Community](https://dev.to/lovestaco/scaling-sqlite-with-node-worker-threads-and-better-sqlite3-4189))

- **Transaction API with immediate mode built in:**
  ```javascript
  const transfer = db.transaction((from, to, amount) => {
    db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, from);
    db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, to);
  });
  transfer.immediate('alice', 'bob', 100); // BEGIN IMMEDIATE
  ```
  The `.immediate()` method on transaction functions uses `BEGIN IMMEDIATE` automatically. ([better-sqlite3 API docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md), [DEV Community](https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8))

- **Worker threads rule: never share a Database instance across threads.** Each worker opens its own better-sqlite3 connection. The main thread distributes work via `postMessage()`. Match worker count to CPU cores -- excess workers increase contention without improving throughput. ([better-sqlite3 threads docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/threads.md), [DEV Community](https://dev.to/lovestaco/scaling-sqlite-with-node-worker-threads-and-better-sqlite3-4189))

- **better-sqlite3 + async MCP tool handlers: no fundamental conflict.** The MCP SDK's `server.tool()` registers async handlers. Inside the handler, synchronous better-sqlite3 calls complete immediately (blocking the event loop only for the duration of the query). The handler then returns its result. Since MCP tool calls from a single client are sequential (the agent waits for each tool result), there's no concurrent-request pressure within a single session. The concern arises only if the MCP server handles multiple sessions simultaneously over Streamable HTTP. ([MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk))

### 5. Drizzle ORM as the Schema Layer

- **Drizzle supports SQLite with better-sqlite3 driver natively.** Setup: `import { drizzle } from 'drizzle-orm/better-sqlite3'`. Provides type-safe schema definitions and query building with full TypeScript inference. ([Drizzle ORM docs](https://orm.drizzle.team/docs/get-started-sqlite))

- **Transaction behavior options mirror SQLite's:**
  ```typescript
  await db.transaction(async (tx) => {
    // operations
  }, { behavior: 'immediate' }); // or 'deferred' or 'exclusive'
  ```
  ([Drizzle Transactions docs](https://orm.drizzle.team/docs/transactions))

- **Nested transactions use savepoints automatically.** Drizzle wraps inner `tx.transaction()` calls with `SAVEPOINT`/`RELEASE`, enabling partial rollback within a larger transaction. ([Drizzle Transactions docs](https://orm.drizzle.team/docs/transactions))

- **Lightweight:** ~7.4KB gzipped, zero dependencies beyond the driver itself. Does not impose connection pooling or async overhead. ([Drizzle docs](https://orm.drizzle.team/))

### 6. Alternative Drivers and Libraries

- **node:sqlite (Node.js built-in, v22+):** Synchronous API similar to better-sqlite3. Still experimental/release-candidate as of v25.8.0. Performance is 1.14x-1.67x slower than better-sqlite3 in benchmarks. No native binary dependency, which simplifies deployment. May be the future default but not production-ready yet. ([Node.js docs](https://nodejs.org/api/sqlite.html), [SQG Benchmark](https://sqg.dev/blog/sqlite-driver-benchmark))

- **sql.js (WebAssembly):** Compiles SQLite to WASM. In-memory only -- no direct file access. Primarily useful for browser environments. Not suitable for an MCP server backing store. ([sql.js GitHub](https://github.com/sql-js/sql.js/))

- **@libsql/client (libSQL/Turso):** Async API. Supports both local embedded mode and remote Turso servers. Provides `BEGIN CONCURRENT` with row-level MVCC. Significantly slower than better-sqlite3 for synchronous workloads (up to 100x for some queries). The async API adds overhead for local-only use. The MVCC concurrent writes feature is compelling but still in beta. ([libsql-js GitHub](https://github.com/tursodatabase/libsql-js), [SQG Benchmark](https://sqg.dev/blog/sqlite-driver-benchmark))

- **Turso (libSQL rewrite in Rust):** Eliminates the single-writer bottleneck via MVCC with row-level conflict detection. Achieves 4x faster write throughput than SQLite under 8-thread contention with 1ms compute per transaction. But: entire-row copies in memory, read-write lock contention on the version vector, no CREATE INDEX support yet in MVCC mode. ([Turso Blog](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes))

- **DuckDB:** OLAP-optimized, columnar storage. Supports multi-writer with optimistic concurrency. 10-100x faster for analytical queries on large datasets. But wrong tool for OLTP workloads like task coordination -- SQLite wins on point queries and transactional inserts. ([MotherDuck](https://motherduck.com/learn-more/duckdb-vs-sqlite-databases/), [Better Stack](https://betterstack.com/community/guides/scaling-python/duckdb-vs-sqlite/))

### 7. Connection Management: Pooling Is Different with SQLite

- **Traditional connection pooling (as used with PostgreSQL/MySQL) is unnecessary for SQLite.** SQLite connections are lightweight -- opening a database is just opening a file and reading headers. The bottleneck is write lock contention, not connection creation. ([SQLite docs](https://sqlite.org/threadsafe.html))

- **The recommended pattern: separate reader and writer connections.**
  - One write connection used exclusively for mutations (with IMMEDIATE transactions)
  - One or more read connections for queries (can run concurrently with the writer in WAL mode)
  - This avoids the DEFERRED transaction deadlock problem entirely
  ([dev.yorhel.nl](https://dev.yorhel.nl/doc/sqlaccess), [drmhse.com](https://www.drmhse.com/posts/battling-with-sqlite-in-a-concurrent-environment/))

- **For a single-process MCP server, one connection is sufficient.** Node.js is single-threaded. With better-sqlite3's synchronous API, each tool handler call runs to completion before the next one starts (barring worker threads). No connection pool needed. ([better-sqlite3 Issue #32](https://github.com/JoshuaWise/better-sqlite3/issues/32))

- **For multi-process (multiple STDIO MCP servers), WAL mode + busy_timeout is the coordination mechanism.** Each process opens its own connection, sets `PRAGMA journal_mode=WAL` and `PRAGMA busy_timeout=5000`, and uses `BEGIN IMMEDIATE` for writes. SQLite handles the rest via file locking. ([SkyPilot Blog](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))

### 8. MCP Architecture: STDIO vs Streamable HTTP

- **STDIO transport: each client gets its own MCP server process.** Claude Desktop spawns a new server subprocess per MCP server configuration. If 3 agents connect, that's 3 separate processes, each with its own SQLite connection. They share the database file via file-system locking. ([MCP Transports](https://dev.to/jefe_cool/mcp-transports-explained-stdio-vs-streamable-http-and-when-to-use-each-3lco))

- **Streamable HTTP transport: one MCP server process handles multiple clients.** An HTTP server manages sessions via `Mcp-Session-Id` headers. All tool calls funnel through one process. This is the architecture that benefits most from SQLite's single-process model -- all writes are serialized through Node.js's event loop, no file-level lock contention. ([MCPcat guide](https://mcpcat.io/guides/configuring-mcp-servers-multiple-simultaneous-connections/))

- **Scaling formula for Streamable HTTP: ~10-15 connections per CPU core.** A 4-core server handles 40-60 concurrent MCP sessions comfortably. Beyond that, multiple server instances behind a load balancer with shared external session storage (Redis). ([MCPcat guide](https://mcpcat.io/guides/configuring-mcp-servers-multiple-simultaneous-connections/))

- **MCP tool calls are async (JSON-RPC over the transport), but sequential per client.** An agent sends a tool call, waits for the result, then sends the next. Multiple clients can have tool calls in flight simultaneously (on Streamable HTTP), but within a single session, calls are sequential. ([MCP Specification](https://modelcontextprotocol.io/specification/2025-06-18/architecture))

- **Session isolation is critical.** Each session gets its own context. Different users should not see each other's data or tool results. The MCP server must track which session owns which operations. ([MCPcat guide](https://mcpcat.io/guides/configuring-mcp-servers-multiple-simultaneous-connections/))

### 9. Tool Call to Transaction Mapping

- **One tool call = one transaction is the natural mapping.** Each MCP tool call performs a discrete operation (create initiative, claim task, update status). Wrapping each in a `BEGIN IMMEDIATE ... COMMIT` gives ACID guarantees per operation. ([Jason Gorman](https://jasongorman.uk/writing/sqlite-background-job-system/))

- **The job claim pattern is the canonical example:**
  ```sql
  BEGIN IMMEDIATE;
  SELECT * FROM tasks WHERE status = 'pending' AND type = ? ORDER BY created_at LIMIT 1;
  UPDATE tasks SET status = 'processing', claimed_by = ?, claimed_at = ? WHERE id = ? AND status = 'pending';
  COMMIT;
  ```
  `BEGIN IMMEDIATE` is essential here -- a DEFERRED transaction would deadlock when upgrading from the SELECT's read lock to the UPDATE's write lock. ([Jason Gorman](https://jasongorman.uk/writing/sqlite-background-job-system/))

- **Optimistic locking with version columns avoids explicit transactions for simple updates:**
  ```sql
  UPDATE tasks SET status = 'claimed', claimed_by = ?, version = version + 1
  WHERE id = ? AND version = ? AND status = 'pending';
  ```
  If `changes()` returns 0, another agent claimed it first. No transaction needed -- single-statement auto-commit is atomic. ([DEV Community](https://dev.to/hexshift/build-a-shared-nothing-distributed-queue-with-sqlite-and-python-3p1))

- **Read-only tool calls (list initiatives, get task status) need no transaction.** A simple SELECT in WAL mode gets snapshot isolation automatically. No need for BEGIN/COMMIT overhead. ([SQLite WAL docs](https://sqlite.org/wal.html))

### 10. Production PRAGMA Configuration

The recommended configuration for an MCP+SQLite coordination server:

```sql
-- Set once when opening any connection:
PRAGMA journal_mode = WAL;          -- Enable concurrent reads with single writer
PRAGMA busy_timeout = 5000;         -- Retry for 5s on lock contention (per-connection, not persistent)
PRAGMA synchronous = NORMAL;        -- Sync at checkpoints only, not per-commit (safe in WAL mode)
PRAGMA cache_size = -64000;         -- 64MB page cache (negative = KiB)
PRAGMA foreign_keys = ON;           -- Enforce referential integrity
PRAGMA temp_store = MEMORY;         -- RAM for temp tables/indices
PRAGMA mmap_size = 268435456;       -- 256MB memory-mapped I/O

-- Run periodically or when closing connections:
PRAGMA optimize;                    -- Let SQLite update statistics if beneficial
```

Sources: [phiresky blog](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/), [Forward Email](https://forwardemail.net/en/blog/docs/sqlite-performance-optimization-pragma-chacha20-production-guide), [High Performance SQLite](https://highperformancesqlite.com/articles/sqlite-recommended-pragmas), [SQLite Pragma Cheatsheet](https://cj.rs/blog/sqlite-pragma-cheatsheet-for-performance-and-consistency/)

Key notes:
- `journal_mode=WAL` is persistent (survives connection close/reopen)
- `busy_timeout` is per-connection and must be set each time
- `synchronous=NORMAL` in WAL mode is corruption-safe; only checkpoints sync to disk
- `cache_size` reverts to default when connection closes; set it each time
- `PRAGMA optimize` should run on connection close after queries have been executed

### 11. Distributed SQLite Alternatives (For Future Scale)

- **Turso / libSQL:** Fork of SQLite with MVCC concurrent writes, eliminating SQLITE_BUSY entirely. Row-level conflict detection (vs SQLite's experimental page-level BEGIN CONCURRENT). 4x write throughput under contention. Still beta for concurrent writes. Rust rewrite underway. ([Turso Blog](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes), [Turso 0.5.0](https://turso.tech/blog/turso-0.5.0))

- **LiteFS (Fly.io):** FUSE-based distributed file system that transparently replicates SQLite. One primary node, multiple read replicas. Failover via Consul leases. Best for geo-distributed read-heavy workloads. ([Fly.io LiteFS docs](https://fly.io/docs/litefs/), [Fly.io Blog](https://fly.io/blog/introducing-litefs/))

- **Litestream:** Streaming backup of SQLite to S3/Azure/GCS. Not real-time replication -- disaster recovery only. No failover. Simpler than LiteFS. ([Litestream.io](https://litestream.io/))

- **SQLite Sync (sqlite.ai):** CRDT-based sync extension for SQLite. Conflict-free multi-device writes. Integrated with SQLite Cloud for managed hosting. Row-level security. ([SQLite Sync](https://www.sqlite.ai/sqlite-sync))

- **PowerSync:** Postgres-to-SQLite sync layer. Not relevant for SQLite-as-source architecture. ([PowerSync](https://www.powersync.com/))

- **SQLite BEGIN CONCURRENT (experimental):** Official SQLite experimental branch with page-level optimistic locking. Not merged to mainline. False conflicts when different rows share a page. ([SQLite docs](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md))

### 12. Schema Patterns for Agentic State

Based on the job queue and task coordination patterns found in multiple implementations:

**Core tables for a coordination server:**
- `initiatives` -- slug, status (pending/approved/in-progress/integrated), metadata JSON, created_at, updated_at
- `tasks` -- id, initiative_slug (FK), title, status (pending/claimed/running/done/failed), claimed_by, claimed_at, version (for optimistic locking), priority, created_at
- `authority_records` -- artifact_path, owning_initiative, lock_type (exclusive/shared), acquired_at, expires_at
- `activity_log` -- id, entity_type, entity_id, action, agent_id, timestamp, details JSON

**Indexing strategy:**
- Composite index on tasks: `(status, priority, created_at)` for efficient worker queries
- Index on authority_records: `(artifact_path, lock_type)` for conflict detection
- Index on activity_log: `(entity_type, entity_id, timestamp)` for timeline queries

Sources: [Jason Gorman](https://jasongorman.uk/writing/sqlite-background-job-system/), [litequeue](https://github.com/litements/litequeue), [plainjob](https://github.com/justplainstuff/plainjob), [CockroachDB blog](https://www.cockroachlabs.com/blog/agentic-ai-database-architecture/)

---

## Architecture Recommendation for Sherpa MCP Server

### Primary Architecture: Single-Process Streamable HTTP

```
+------------------+     +------------------+     +------------------+
| Claude Code      |     | Background       |     | Claude Code      |
| Session 1        |     | Worker           |     | Session 2        |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |   Streamable HTTP      |    Streamable HTTP     |
         +----------+-------------+-------------+----------+
                    |                           |
              +-----+---------------------------+-----+
              |      MCP Coordination Server          |
              |      (single Node.js process)         |
              |                                       |
              |  +--------+  +-----+  +-----------+   |
              |  | Session |  | Tool|  | Write     |   |
              |  | Manager |  | Hdlr|  | Serializer|   |
              |  +--------+  +-----+  +-----+-----+   |
              |                              |         |
              |                     +--------+-------+ |
              |                     | better-sqlite3 | |
              |                     | (single conn)  | |
              |                     +--------+-------+ |
              +------------------------------+---------+
                                             |
                                      +------+------+
                                      | SQLite DB   |
                                      | (WAL mode)  |
                                      +-------------+
```

**Why this architecture:**

1. **Single process eliminates write contention.** Node.js's event loop serializes all tool handler calls. No SQLITE_BUSY errors. No file-level lock contention. No deadlocks.

2. **Streamable HTTP enables multi-client.** Multiple agents connect via HTTP. Session isolation via `Mcp-Session-Id`. Each gets its own context but shares the same database.

3. **better-sqlite3's synchronous API is an advantage here.** Each tool handler runs synchronously against SQLite, completes in microseconds-to-milliseconds, and returns control to the event loop. No async queue overhead.

4. **Write serialization is natural, not forced.** Node.js processes one tool call at a time (per event loop tick). Reads can happen concurrently only if using worker threads, but for the coordination workload (metadata, not analytics), single-threaded reads are fast enough.

### Fallback: Multi-Process STDIO with WAL

If STDIO transport is required (e.g., Claude Desktop integration), multiple MCP server processes share the same SQLite file:

- Each process: `PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;`
- All write transactions: `BEGIN IMMEDIATE`
- Expected agent count: 2-5 concurrent processes (well within SQLite's comfort zone)
- At this scale, SQLITE_BUSY is rare and retries succeed quickly

### Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| SQLite driver | better-sqlite3 | Fastest, synchronous (natural for single-process), mature |
| ORM/schema | Drizzle ORM | Type-safe, lightweight (7.4KB), supports immediate transactions |
| MCP SDK | @modelcontextprotocol/sdk | Official TypeScript SDK, Streamable HTTP support |
| Transport | Streamable HTTP (primary), STDIO (fallback) | Single process for HTTP, multi-process for STDIO |

---

## Sources

### SQLite Core Documentation
- [SQLite WAL Mode](https://sqlite.org/wal.html) -- Official write-ahead logging documentation with concurrency guarantees
- [SQLite File Locking v3](https://sqlite.org/lockingv3.html) -- File locking and concurrency model
- [SQLite Threading](https://sqlite.org/threadsafe.html) -- Multi-threaded application configuration
- [SQLite Transactions](https://www.sqlite.org/lang_transaction.html) -- BEGIN DEFERRED/IMMEDIATE/EXCLUSIVE semantics
- [SQLite busy_timeout](https://sqlite.org/c3ref/busy_timeout.html) -- Busy handler API reference
- [SQLite PRAGMA reference](https://sqlite.org/pragma.html) -- Complete PRAGMA documentation
- [SQLite BEGIN CONCURRENT](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md) -- Experimental concurrent write extension

### Concurrency Deep Dives
- [Ten Thousand Meters: SQLite concurrent writes](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/) -- Thorough analysis of SQLITE_BUSY, transaction types, mutex benchmarks
- [Bert Hubert: SQLITE_BUSY despite timeout](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/) -- The DEFERRED deadlock explained with SQL examples
- [SkyPilot: Abusing SQLite for concurrency](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) -- Production data at 1000x concurrent writers, timeout analysis
- [Fly.io: SQLite WAL internals](https://fly.io/blog/sqlite-internals-wal/) -- WAL file structure, SHM hash maps, checkpoint mechanics
- [FractaledMind: SQLite on Rails concurrency](https://fractaledmind.com/2023/12/11/sqlite-on-rails-improving-concurrency/) -- IMMEDIATE transactions, Ruby busy handler releasing GVL
- [Oldmoe: Concurrent write transactions](https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/) -- Write transaction analysis
- [ActiveSphere: Understanding SQLITE_BUSY](http://activesphere.com/blog/2018/12/24/understanding-sqlite-busy) -- SQLITE_BUSY error analysis
- [SQLite Forum: Multiple Writers](https://sqlite.org/forum/info/b4e8b29ae409cd198652c6b7e70b53b702f269e67e1d2573d627feeba37bbf85) -- Community discussion on multi-writer scenarios
- [SQLite Forum: Multiple processes write at same instant](https://sqlite.org/forum/info/6ed6824176b9c773) -- Thread/process concurrency Q&A
- [Multi-threaded SQLite Access](https://dev.yorhel.nl/doc/sqlaccess) -- Connection-per-thread architecture patterns
- [Battling SQLite in concurrent environments](https://www.drmhse.com/posts/battling-with-sqlite-in-a-concurrent-environment/) -- Separate reader/writer pool pattern

### better-sqlite3
- [better-sqlite3 GitHub](https://github.com/WiseLibs/better-sqlite3) -- Main repository
- [better-sqlite3 API docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md) -- Transaction API, pragma, checkpoint
- [better-sqlite3 threads docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/threads.md) -- Worker thread rules
- [better-sqlite3 Issue #32: Synchronicity](https://github.com/JoshuaWise/better-sqlite3/issues/32) -- Why sync is better, author's explanation
- [better-sqlite3 Issue #89: Async API](https://github.com/JoshuaWise/better-sqlite3/issues/89) -- Why async was rejected
- [better-sqlite3 Issue #237: Worker threads](https://github.com/JoshuaWise/better-sqlite3/issues/237) -- Usage patterns
- [better-sqlite3 mirror docs](https://wchargin.com/better-sqlite3/api.html) -- Alternative API documentation
- [DEV: Understanding better-sqlite3](https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8) -- Comprehensive tutorial with code examples
- [DEV: Scaling SQLite with worker threads](https://dev.to/lovestaco/scaling-sqlite-with-node-worker-threads-and-better-sqlite3-4189) -- Worker pool architecture and benchmarks
- [DEV: SQLite queries in workers](https://dev.to/mashraf_aiman/give-your-sqlite-queries-their-own-workers-a-practical-guide-for-nodejs-developers-3d74) -- Practical worker guide
- [Hacker News: better-sqlite3](https://news.ycombinator.com/item?id=16616374) -- Community discussion

### Drizzle ORM
- [Drizzle ORM: Get started with SQLite](https://orm.drizzle.team/docs/get-started-sqlite) -- Setup guide with better-sqlite3
- [Drizzle ORM: Transactions](https://orm.drizzle.team/docs/transactions) -- Transaction API with behavior options
- [Drizzle ORM: Batch API](https://orm.drizzle.team/docs/batch-api) -- Batch operations
- [Drizzle ORM Guide 2026](https://devtoolbox-blue.vercel.app/en/blog/drizzle-orm-guide/) -- Comprehensive guide

### Alternative Drivers
- [SQG: SQLite driver benchmark](https://sqg.dev/blog/sqlite-driver-benchmark) -- Comparing better-sqlite3, node:sqlite, libSQL, Turso
- [Node.js SQLite docs](https://nodejs.org/api/sqlite.html) -- Built-in node:sqlite module
- [libsql-js GitHub](https://github.com/tursodatabase/libsql-js) -- libSQL Node.js bindings
- [sql.js GitHub](https://github.com/sql-js/sql.js/) -- WebAssembly SQLite
- [Kysely Issue #1385](https://github.com/kysely-org/kysely/issues/1385) -- better-sqlite3 event loop blocking discussion
- [DEV: SQLite async in Node.js](https://www.w3tutorials.net/blog/sqlite-async-nodejs/) -- Async SQLite patterns

### MCP Protocol & SDK
- [MCP Architecture Specification](https://modelcontextprotocol.io/specification/2025-06-18/architecture) -- Client-host-server model
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) -- Official SDK repository
- [MCP TypeScript SDK server docs](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md) -- Server implementation guide
- [MCP Example Servers](https://modelcontextprotocol.io/examples) -- Reference implementations
- [MCP 2026 Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) -- Future direction
- [MCP Specification Nov 2025](https://modelcontextprotocol.io/specification/2025-11-25) -- Latest stable spec
- [MCPcat: Multiple connections guide](https://mcpcat.io/guides/configuring-mcp-servers-multiple-simultaneous-connections/) -- Scaling formula, session isolation
- [MCP Transports explained](https://dev.to/jefe_cool/mcp-transports-explained-stdio-vs-streamable-http-and-when-to-use-each-3lco) -- STDIO vs HTTP comparison
- [MCP Transports: STDIO, Streamable HTTP & SSE](https://docs.roocode.com/features/mcp/server-transports) -- Transport overview
- [MCP Streamable HTTP](https://thenewstack.io/how-mcp-uses-streamable-http-for-real-time-ai-tool-interaction/) -- Technical details
- [FastMCP: Running servers](https://gofastmcp.com/deployment/running-server) -- Deployment patterns
- [Cloudflare: Streamable HTTP MCP](https://blog.cloudflare.com/streamable-http-mcp-servers-python/) -- Edge deployment
- [MCP HTTP Stream Transport](https://mcp-framework.com/docs/Transports/http-stream-transport/) -- Framework transport docs
- [One MCP Server, Two Transports](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/one-mcp-server-two-transports-stdio-and-http/4443915) -- Dual transport pattern
- [Stateful MCP Server Sessions](https://codesignal.com/learn/courses/developing-and-integrating-an-mcp-server-in-typescript/lessons/stateful-mcp-server-sessions) -- Session management tutorial
- [MCP Server development guide](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md) -- Community guide
- [MCP Servers Issue #1215: Multi-client support](https://github.com/modelcontextprotocol/servers/issues/1215) -- Discussion on multi-client patterns
- [FastMCP Issue #2790: StreamableHTTP sessions](https://github.com/PrefectHQ/fastmcp/issues/2790) -- Session handling issue

### Existing MCP+SQLite Implementations
- [Official SQLite MCP Server](https://glama.ai/mcp/servers/@modelcontextprotocol/sqlite) -- Anthropic's reference implementation
- [jparkerweb/mcp-sqlite](https://github.com/jparkerweb/mcp-sqlite) -- Comprehensive SQLite MCP server
- [sqlite-explorer-fastmcp](https://github.com/hannesrudolph/sqlite-explorer-fastmcp-mcp-server) -- Read-only FastMCP implementation
- [santos-404/mcp-server.sqlite](https://github.com/santos-404/mcp-server.sqlite) -- TypeScript implementation
- [sqlitecloud-mcp-server](https://github.com/sqlitecloud/sqlitecloud-mcp-server) -- SQLite Cloud MCP server
- [prayanks/mcp-sqlite-server](https://github.com/prayanks/mcp-sqlite-server) -- STDIO and SSE implementations
- [sqlite.ai blog: MCP](https://blog.sqlite.ai/connect-your-database-to-ai-models-with-the-model-context-protocol-mcp-server) -- MCP + SQLite integration guide

### Distributed SQLite
- [Turso: Concurrent writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) -- MVCC implementation details and benchmarks
- [Turso: v0.5.0 release](https://turso.tech/blog/turso-0.5.0) -- Concurrent writes beta
- [Turso GitHub](https://github.com/tursodatabase/turso) -- Rust rewrite repository
- [libSQL GitHub](https://github.com/tursodatabase/libsql) -- Fork of SQLite
- [Turso: BEGIN CONCURRENT issue](https://github.com/tursodatabase/turso/issues/86) -- MVCC discussion
- [Better Stack: Turso explained](https://betterstack.com/community/guides/databases/turso-explained/) -- Turso architecture overview
- [DEV: Distributed SQLite 2026](https://dev.to/dataformathub/distributed-sqlite-why-libsql-and-turso-are-the-new-standard-in-2026-58fk) -- libSQL ecosystem
- [LiteFS docs](https://fly.io/docs/litefs/) -- Distributed SQLite file system
- [LiteFS: How it works](https://fly.io/docs/litefs/faq/) -- FAQ
- [Fly.io: Introducing LiteFS](https://fly.io/blog/introducing-litefs/) -- Architecture overview
- [Litestream](https://litestream.io/) -- Streaming replication
- [Litestream: How it works](https://litestream.io/how-it-works/) -- WAL page copying
- [LiteFS vs Litestream comparison](https://onidel.com/blog/sqlite-replication-vps-2025) -- Feature comparison
- [High Performance SQLite: Distributed](https://highperformancesqlite.com/watch/litestream-and-litefs) -- Video course
- [Kent C. Dodds: Postgres to LiteFS](https://kentcdodds.com/blog/i-migrated-from-a-postgres-cluster-to-distributed-sqlite-with-litefs) -- Migration story
- [SQLite Sync](https://www.sqlite.ai/sqlite-sync) -- CRDT-based sync extension
- [SQLite Sync GitHub](https://github.com/sqliteai/sqlite-sync) -- Source repository
- [SQLite Cloud sync intro](https://docs.sqlitecloud.io/docs/sqlite-sync-introduction) -- Cloud sync documentation
- [LiteSync](https://litesync.io/en/) -- Commercial replication
- [PowerSync](https://www.powersync.com/) -- Postgres-to-SQLite sync

### Schema & Queue Patterns
- [Jason Gorman: SQLite background job system](https://jasongorman.uk/writing/sqlite-background-job-system/) -- Complete schema with claim pattern
- [litequeue](https://github.com/litements/litequeue) -- Queue built on SQLite
- [plainjob](https://github.com/justplainstuff/plainjob) -- Job queue processing 15k jobs/s
- [effectum](https://github.com/dimfeld/effectum) -- Rust job queue on SQLite
- [goqite](https://github.com/maragudk/goqite) -- Go queue inspired by SQS
- [DEV: Distributed queue with SQLite](https://dev.to/hexshift/build-a-shared-nothing-distributed-queue-with-sqlite-and-python-3p1) -- Optimistic locking pattern
- [SQLite Forum: Building a queue](https://sqlite.org/forum/info/b047f5ef5b76edff) -- Queue patterns discussion
- [Hacker News: SQL queue](https://news.ycombinator.com/item?id=27482402) -- Community patterns
- [node-persistent-queue](https://github.com/damoclark/node-persistent-queue) -- Node.js SQLite queue
- [aide_de_camp_sqlite (Rust)](https://docs.rs/aide-de-camp-sqlite) -- Rust job queue on SQLite
- [CockroachDB: Agentic AI database](https://www.cockroachlabs.com/blog/agentic-ai-database-architecture/) -- Why agents need ACID

### DuckDB vs SQLite
- [MotherDuck: DuckDB vs SQLite](https://motherduck.com/learn-more/duckdb-vs-sqlite-databases/) -- Comprehensive comparison
- [Better Stack: DuckDB vs SQLite](https://betterstack.com/community/guides/scaling-python/duckdb-vs-sqlite/) -- Use case analysis
- [DataCamp: DuckDB vs SQLite](https://www.datacamp.com/blog/duckdb-vs-sqlite-complete-database-comparison) -- Complete comparison
- [Analytics Vidhya: DuckDB vs SQLite](https://www.analyticsvidhya.com/blog/2026/01/duckdb-vs-sqlite/) -- Developer comparison

### Performance Tuning
- [phiresky: SQLite performance tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/) -- 100k SELECTs/sec, PRAGMA recommendations
- [Forward Email: SQLite optimization](https://forwardemail.net/en/blog/docs/sqlite-performance-optimization-pragma-chacha20-production-guide) -- Production PRAGMA guide
- [High Performance SQLite: Pragmas](https://highperformancesqlite.com/watch/suggested-pragmas) -- Recommended settings
- [SQLite Pragma Cheatsheet](https://cj.rs/blog/sqlite-pragma-cheatsheet-for-performance-and-consistency/) -- Quick reference
- [DEV: SQLite PRAGMA with better-sqlite3](https://dev.to/lovestaco/understanding-sqlite-pragma-and-how-better-sqlite3-makes-it-nicer-1ap0) -- PRAGMA in Node.js
- [SQLite production setup 2026](https://oneuptime.com/blog/post/2026-02-02-sqlite-production-setup/view) -- Production guide
- [SQLite production benchmark](https://shivekkhurana.com/blog/sqlite-in-production/) -- Real-world benchmark
- [SQLite connection pool pitfalls](https://www.jtti.cc/supports/3154.html) -- Common mistakes
- [iomoath/sqlite-pooling](https://github.com/iomoath/sqlite-pooling) -- Connection pooling with stress tests

### Rails & SQLite (Reference Architecture)
- [FractaledMind: SQLite on Rails concurrency](https://fractaledmind.com/2023/12/11/sqlite-on-rails-improving-concurrency/) -- IMMEDIATE transactions, busy handler
- [Joy of Rails: SQLite](https://joyofrails.com/articles/what-you-need-to-know-about-sqlite) -- What you need to know
- [RubyEvents: SQLite in production](https://www.rubyevents.org/talks/how-and-why-to-run-sqlite-in-production-wroclove-rb-2024) -- Stephen Margheim talk
- [RubyEvents: 50k concurrent users](https://www.rubyevents.org/talks/workshop-sqlite-on-rails-from-rails-new-to-50k-concurrent-users-and-everything-in-between-euruko-2024) -- Scaling workshop
- [Simon Willison: Rails 8 SQLite](https://simonwillison.net/2024/Oct/7/whats-new-in-ruby-on-rails-8/) -- Rails 8 SQLite improvements
- [Speaker Deck: SQLite in production](https://speakerdeck.com/fractaledmind/balkan-ruby-2024-how-and-why-to-run-sqlite-on-rails-in-production) -- Slides

### Agentic AI & Databases
- [sqlite-agent](https://github.com/sqliteai/sqlite-agent) -- SQLite extension for autonomous AI agents
- [Turso: Databases for agents](https://turso.tech/) -- Agent-per-database architecture
- [n8n: SQLite with LangChain agent](https://n8n.io/workflows/2292-talk-to-your-sqlite-database-with-a-langchain-ai-agent/) -- Agent workflow template
- [SQLite Web Persistence 2025](https://www.powersync.com/blog/sqlite-persistence-on-the-web) -- Browser SQLite state of the art

---

## Raw Links

Every URL encountered during research, including those not fully explored:

```
https://sqlite.org/wal.html
https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/
https://sqlite.org/lockingv3.html
https://mohit-bhalla.medium.com/understanding-wal-mode-in-sqlite-boosting-performance-in-sql-crud-operations-for-ios-5a8bd8be93d2
https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/
https://sqlite.org/forum/info/b4e8b29ae409cd198652c6b7e70b53b702f269e67e1d2573d627feeba37bbf85
https://blog.sqlite.ai/journal-modes-in-sqlite
https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/
https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes
https://fly.io/blog/sqlite-internals-wal/
https://www.npmjs.com/package/better-sqlite3
https://github.com/WiseLibs/better-sqlite3
https://github.com/litesync/better-sqlite3
https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8
https://oneuptime.com/blog/post/2026-02-02-sqlite-nodejs/view
https://github.com/JoshuaWise/better-sqlite3/issues/32
https://sourceforge.net/projects/better-sqlite3.mirror/
https://github.com/syonkr/better-sqlite3
https://groups.google.com/g/nodejs/c/Iqlm8FvHJ6g
https://news.ycombinator.com/item?id=16616374
https://sqlite.org/forum/info/6ed6824176b9c773
https://rsqlite.r-dbi.org/reference/sqliteSetBusyHandler.html
https://blog.r-hub.io/2021/03/13/rsqlite-parallel/
https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/
https://sqlite.org/c3ref/busy_timeout.html
http://activesphere.com/blog/2018/12/24/understanding-sqlite-busy
https://fractaledmind.com/2023/12/11/sqlite-on-rails-improving-concurrency/
https://learn.microsoft.com/en-us/dotnet/standard/data/sqlite/database-errors
https://sqlite.org/forum/forumpost/4d93f49a04
https://glama.ai/mcp/servers/@modelcontextprotocol/sqlite
https://www.pulsemcp.com/servers/modelcontextprotocol-sqlite
https://github.com/jparkerweb/mcp-sqlite
https://github.com/hannesrudolph/sqlite-explorer-fastmcp-mcp-server
https://github.com/santos-404/mcp-server.sqlite
https://github.com/sqlitecloud/sqlitecloud-mcp-server
https://lobehub.com/mcp/simonholm-sqlite-mcp-server
https://www.npmjs.com/package/@berthojoris/mcp-sqlite-server
https://modelcontextprotocol.io/examples
https://blog.sqlite.ai/connect-your-database-to-ai-models-with-the-model-context-protocol-mcp-server
https://turso.tech/
https://docs.turso.tech/libsql
https://github.com/tursodatabase/turso
https://betterstack.com/community/guides/databases/turso-explained/
https://github.com/tursodatabase
https://medium.com/lets-code-future/turso-the-sqlite-that-hit-the-gym-and-moved-to-the-cloud-2c946cd48158
https://dev.to/dataformathub/distributed-sqlite-why-libsql-and-turso-are-the-new-standard-in-2026-58fk
https://www.webpronews.com/turso-enables-concurrent-writes-in-libsql-for-scalable-edge-databases/
https://github.com/tursodatabase/libsql
https://orm.drizzle.team/docs/get-started-sqlite
https://fullstacksveltekit.com/blog/sveltekit-sqlite-drizzle
https://betterstack.com/community/guides/scaling-nodejs/drizzle-orm/
https://www.w3resource.com/sqlite/snippets/simplify-sqlite-with-drizzle-orm.php
https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/sqlite-core/README.md
https://devtoolbox-blue.vercel.app/en/blog/drizzle-orm-guide/
https://www.npmjs.com/package/drizzle-orm-sqlite
https://www.w3resource.com/sqlite/snippets/drizzle-orm-sqlite.php
https://dev.to/aaronksaunders/drizzle-orm-sqlite-and-nuxt-js-getting-started-374m
https://waddler.drizzle.team/docs/sqlite/connect-sqlite
https://sqlite.org/threadsafe.html
https://dev.yorhel.nl/doc/sqlaccess
https://www.jtti.cc/supports/3154.html
https://github.com/iomoath/sqlite-pooling
https://sqlite.org/forum/info/760f6e655e84af72
https://docs.sqlalchemy.org/en/20/core/pooling.html
https://colinchsql.github.io/2023-10-13/10-17-25-480023-sqlite-database-connection-pooling-strategies/
https://www.drmhse.com/posts/battling-with-sqlite-in-a-concurrent-environment/
https://sqlite.work/optimizing-sqlite3-column-access-performance-in-multi-threaded-environments-with-shared-connections/
https://sqlpey.com/sqlite/android-sqlite-concurrency-strategies/
https://kentcdodds.com/blog/i-migrated-from-a-postgres-cluster-to-distributed-sqlite-with-litefs
https://litestream.io/
https://highperformancesqlite.com/watch/litestream-and-litefs
https://fly.io/blog/introducing-litefs/
https://news.ycombinator.com/item?id=32240230
https://fly.io/docs/litefs/faq/
https://litestream.io/how-it-works/
https://onidel.com/blog/sqlite-replication-vps-2025
https://blog.dragansr.com/2023/01/litestream-litefs-distributed-sqlite-by.html
https://fly.io/docs/litefs/
https://jasongorman.uk/writing/sqlite-background-job-system/
https://github.com/litements/litequeue
https://github.com/justplainstuff/plainjob
https://docs.rs/aide-de-camp-sqlite
https://github.com/damoclark/node-persistent-queue
https://dev.to/hexshift/build-a-shared-nothing-distributed-queue-with-sqlite-and-python-3p1
https://sqlite.org/forum/info/b047f5ef5b76edff
https://github.com/maragudk/goqite
https://github.com/dimfeld/effectum
https://news.ycombinator.com/item?id=27482402
https://motherduck.com/learn-more/duckdb-vs-sqlite-databases/
https://betterstack.com/community/guides/scaling-python/duckdb-vs-sqlite/
https://www.datacamp.com/blog/duckdb-vs-sqlite-complete-database-comparison
https://stackshare.io/stackups/duckdb-vs-sqlite
https://github.com/marvelousmlops/database_comparison
https://www.w3resource.com/sqlite/snippets/duckdb-vs-sqlite3.php
https://www.analyticsvidhya.com/blog/2026/01/duckdb-vs-sqlite/
https://www.hakunamatatatech.com/our-resources/blog/sqlite
https://en.wikipedia.org/wiki/DuckDB
https://psychtimespublication.com/sqlite-vs-duckdb/
https://github.com/modelcontextprotocol/typescript-sdk
https://modelcontextprotocol.io/specification/2025-06-18/architecture
https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/
https://atlan.com/know/mcp-server-implementation-guide/
https://gist.github.com/ruvnet/2a8d3c38e8469287fb2c53f512cf5c62
https://github.com/modelcontextprotocol/servers/issues/1215
https://medium.com/@nimritakoul01/the-model-context-protocol-mcp-a-complete-tutorial-a3abe8a7f4ef
https://medium.com/@jageenshukla/building-a-typescript-mcp-server-a-guide-for-integrating-existing-services-5bde3fc13b23
https://hackteam.io/blog/build-your-first-mcp-server-with-typescript-in-under-10-minutes/
https://codesignal.com/learn/courses/developing-and-integrating-an-mcp-server-in-typescript/lessons/stateful-mcp-server-sessions
https://modelcontextprotocol.io/specification/2025-11-25
https://github.com/modelcontextprotocol
https://en.wikipedia.org/wiki/Model_Context_Protocol
https://dasroot.net/posts/2026/03/model-context-protocol-mcp-explained/
https://www.ibm.com/think/topics/model-context-protocol
http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
https://dysnix.com/blog/model-context-protocol
https://www.elastic.co/search-labs/blog/mcp-current-state
http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/
https://guptadeepak.com/the-complete-guide-to-model-context-protocol-mcp-enterprise-adoption-market-trends-and-implementation-strategies/
https://orm.drizzle.team/docs/transactions
https://orm.drizzle.team/
https://github.com/drizzle-team/drizzle-orm
https://orm.drizzle.team/docs/batch-api
https://orm.drizzle.team/docs/connect-expo-sqlite
https://docs.expo.dev/versions/latest/sdk/sqlite/
https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md
https://sqlite.org/src/doc/begin-concurrent-report/doc/begin_concurrent_report.md
https://sqlite.org/hctree/doc/begin-concurrent/doc/begin_concurrent.md
https://sqlite.org/forum/info/860a58914f804027d33b4071c2dca6d77c8f04d070dc2e374de0128bfe487c6b
https://github.com/sqlite/sqlite/blob/9077e4652fd0691f45463e9a5c46560856e9be36/doc/begin_concurrent.md
https://docs.sqlitecloud.io/docs/sqlite/lang_transaction
https://news.ycombinator.com/item?id=36893193
https://biggo.com/news/202510151324_Turso-MVCC-Concurrent-Writes-SQLite
https://github.com/tursodatabase/turso/issues/86
https://github.com/tursodatabase/turso/discussions/2043
https://turso.tech/blog/turso-0.5.0
https://joyofrails.com/articles/what-you-need-to-know-about-sqlite
https://www.rubyevents.org/talks/how-and-why-to-run-sqlite-in-production-wroclove-rb-2024
https://www.rubyevents.org/talks/workshop-sqlite-on-rails-from-rails-new-to-50k-concurrent-users-and-everything-in-between-euruko-2024
https://www.classcentral.com/course/youtube-railsconf-2024-sqlite-on-rails-from-rails-new-to-50k-concurrent-by-stephen-margheim-335592
https://shivekkhurana.com/blog/sqlite-in-production/
https://speakerdeck.com/fractaledmind/balkan-ruby-2024-how-and-why-to-run-sqlite-on-rails-in-production
https://simonwillison.net/2024/Oct/7/whats-new-in-ruby-on-rails-8/
https://rubyonrails.org/world/2024/day-2/stephen-margheim
https://www.therubyonrailspodcast.com/507
https://www.npmjs.com/package/@modelcontextprotocol/sdk
https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md
https://www.speakeasy.com/blog/release-model-context-protocol
https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md
https://modelcontextprotocol.info/docs/concepts/tools/
https://dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28
https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools
https://hackteam.io/blog/build-test-mcp-server-typescript-mcp-inspector/
https://medium.com/@dogukanakkaya/writing-an-mcp-server-with-typescript-b1caf1b2caf1
https://www.sqlite.ai/sqlite-sync
https://github.com/sqliteai/sqlite-sync
https://litesync.io/en/
https://github.com/sqlite-sync/SQLite-sync.com
https://docs.sqlitecloud.io/docs/sqlite-sync-introduction
https://www.powersync.com/blog/introducing-powersync-v1-0-postgres-sqlite-sync-layer
https://www.sqlite.ai/
https://www.sqlite.ai/cloud
https://sqlite.org/cloudsqlite/help?cmd=sync
https://www.sqlitetutorial.net/sqlite-nodejs/statements-control-flow/
https://developer.apple.com/forums/thread/667833
https://sqlite.org/forum/info/d6a1432453feffde09db4f59f14f5c37ab69ac2fa2dbe623b8e0f2f8a1383666
https://github.com/TryGhost/node-sqlite3/issues/760
https://sqlite.org/src/doc/754ad35c/README-server-edition.html
https://forums.raspberrypi.com/viewtopic.php?t=256322
https://sqlite.org/forum/forumpost/7c90893579
https://github.com/davidlacho/agents
https://github.com/sqliteai/sqlite-agent
https://www.veeam.com/blog/multi-agent-ai-sql-databases-business-insights.html
https://n8n.io/workflows/2292-talk-to-your-sqlite-database-with-a-langchain-ai-agent/
https://blogs.oracle.com/machinelearning/build-your-agentic-solution-using-oracle-adb-select-ai-agent
https://medium.com/@venugopal.adep/building-an-ai-agent-with-agno-using-natural-language-to-query-sqlite-databases-fcd4e64cba72
https://dev.to/sreeni5018/developing-multi-agent-applications-a-deep-dive-into-ai-agent-frameworks-2ec1
https://towardsdatascience.com/a-multi-agent-sql-assistant-you-can-trust-with-human-in-loop-checkpoint-llm-cost-control/
https://www.cockroachlabs.com/blog/agentic-ai-database-architecture/
https://github.com/ph4r05/laravel-queue-database-ph4
https://ph4r05.deadcode.me/blog/2017/12/23/laravel-queues-optimization.html
https://medium.com/@roshanlamichhane/sqlite-worker-supercharge-your-sqlite-performance-in-multi-threaded-python-applications-01e2e43cc406
https://phabricator.wikimedia.org/T160978
https://www.sqlite.org/lang_transaction.html
https://github.com/JoshuaWise/better-sqlite3/issues/49
https://www.w3resource.com/sqlite/snippets/better-sqlite3.php
https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/
https://www.skoumal.com/en/parallel-read-and-write-in-sqlite/
https://ducklet.app/blog/2024/01/17/the-power-of-transactions-in-sqlite/
https://github.com/tursodatabase/libsql-js
https://npm-compare.com/@libsql/client,mssql,mysql,pg,sqlite3
https://sqg.dev/blog/sqlite-driver-benchmark
https://www.npmjs.com/package/sqlite
https://github.com/kriasoft/node-sqlite
https://github.com/WiseLibs/better-sqlite3/issues/262
https://www.npmjs.com/package/@hebilicious/libsql-client
https://nodejs.org/api/sqlite.html
https://betterstack.com/community/guides/scaling-nodejs/nodejs-sqlite/
https://blog.logrocket.com/using-built-in-sqlite-module-node-js/
https://www.npmjs.com/package/sqlite3
https://github.com/TryGhost/node-sqlite3
https://dev.to/logrocket/using-the-built-in-sqlite-module-in-nodejs-2e1j
https://www.powersync.com/blog/sqlite-persistence-on-the-web
https://github.com/sql-js/sql.js/
https://sql.js.org/
https://flyers-web.blogspot.com/2019/12/embedded-browser-sqlite-sqljs.html
https://www.sqliteforum.com/p/sqlite-in-webassembly-running-databases
https://sqlite.org/wasm/doc/trunk/persistence.md
https://sqlite.org/wasm/doc/trunk/demo-123.md
https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system
https://sqlite.org/wasm
https://sqlite.work/using-sqlite-in-web-browsers-wasm-integration-and-use-cases/
https://docs.roocode.com/features/mcp/server-transports
https://dev.to/jefe_cool/mcp-transports-explained-stdio-vs-streamable-http-and-when-to-use-each-3lco
https://dev.to/zrcic/understanding-mcp-server-transports-stdio-sse-and-http-streamable-5b1p
https://levelup.gitconnected.com/mcp-server-and-client-with-sse-the-new-streamable-http-d860850d9d9d
https://thenewstack.io/how-mcp-uses-streamable-http-for-real-time-ai-tool-interaction/
https://techcommunity.microsoft.com/blog/azuredevcommunityblog/one-mcp-server-two-transports-stdio-and-http/4443915
https://mcpcat.io/guides/configuring-mcp-servers-multiple-simultaneous-connections/
https://dev.to/apisix/from-stdio-to-http-sse-host-your-mcp-server-with-apisix-api-gateway-26i2
https://spring.io/blog/2025/09/16/spring-ai-mcp-intro-blog/
https://gofastmcp.com/deployment/running-server
https://agentfactory.panaversity.org/docs/Building-Custom-Agents/custom-mcp-servers/streamable-http-transport
https://www.aubergine.co/insights/a-guide-to-building-streamable-mcp-servers-with-fastapi-and-sse
https://blog.cloudflare.com/streamable-http-mcp-servers-python/
https://mcp-framework.com/docs/Transports/http-stream-transport/
https://deepwiki.com/punkpeye/fastmcp/4.2-sse-transport
https://github.com/PrefectHQ/fastmcp/issues/2790
https://felix-pappe.medium.com/breaking-isolation-a-practical-guide-to-building-an-mcp-server-with-sqlite-68c800a25d42
https://skywork.ai/skypage/en/A-Deep-Dive-into-MCP-Server-for-SQLite-The-Ultimate-Guide-for-AI-Engineers/1971012059378610176
https://itecsonline.com/post/how-to-claude-sqlite
https://skywork.ai/skypage/en/unlocking-local-data-sqlite-explorer/1978663309412704256
https://java2ai.com/en/docs/1.0.0.2/practices/mcp/spring-ai-mcp-sqlite/
https://k33g.hashnode.dev/understanding-the-model-context-protocol-mcp
https://sqlite.org/c3ref/wal_autocheckpoint.html
https://forwardemail.net/en/blog/docs/sqlite-performance-optimization-pragma-chacha20-production-guide
https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
https://gist.github.com/phiresky/978d8e204f77feaa0ab5cca08d2d5b27
https://sqlite.org/pragma.html
https://www.theunterminatedstring.com/sqlite-vacuuming/
https://www.tutorialspoint.com/sqlite/sqlite_pragma.htm
https://www.rubydoc.info/gems/sqlite3/SQLite3/Pragmas
https://highperformancesqlite.com/articles/sqlite-recommended-pragmas
https://highperformancesqlite.com/watch/suggested-pragmas
https://highperformancesqlite.com/watch/pragmas
https://cj.rs/blog/sqlite-pragma-cheatsheet-for-performance-and-consistency/
https://dev.to/lovestaco/understanding-sqlite-pragma-and-how-better-sqlite3-makes-it-nicer-1ap0
https://sqlite.org/forum/info/d7b2a32bfd4ff9ba
https://sqlite.org/pgszchng2016.html
https://www.sqlite.org/draft/matrix/pragma.html
https://system.data.sqlite.org/home/doc/dc206da59f/Doc/Extra/pragma.html
https://www.sqlmaestro.com/products/sqlite/maestro/help/sqlite_references_pragma
https://awjunaid.com/sqlite/the-cache_size-pragma-in-sqlite/
https://github.com/launchbadge/sqlx/issues/2111
https://sqlite.org/forum/info/631e8968e70b35bc
https://www.oreilly.com/library/view/using-sqlite/9781449394592/re184.html
https://labex.io/tutorials/sqlite-sqlite-pragma-tuning-552554
https://blog.niklasottosson.com/databases/sqlite-check-integrity-and-fix-common-problems/
https://www.zetetic.net/sqlcipher/sqlcipher-api/
https://github.com/fnc12/sqlite_orm/wiki/pragma_t::integrity_check
https://sqlite.org/forum/forumpost/c4dbf6ca17
https://forum.xojo.com/t/sqlite-with-wal-multiuser-mode-behavior-that-disappoints-me/29211
https://deepwiki.com/jayminwest/overstory/6.5-concurrency-and-wal-mode
https://wchargin.com/better-sqlite3/performance.html
https://www3.sqlite.org/cgi/forum/info/f116e2e40067cae58a79fd36d4df73c91b707d29bb9455bfa865bb1dd0085999
https://github.com/WiseLibs/better-sqlite3/issues/914
https://github.com/TryGhost/node-sqlite3/issues/1392
https://github.com/TryGhost/node-sqlite3/issues/408
https://dev.to/patarapolw/comment/opgj
https://github.com/kysely-org/kysely/issues/1385
https://github.com/JoshuaWise/better-sqlite3/issues/89
https://github.com/ag2ai/ag2/issues/2144
https://sqlite.org/asyncvfs.html
https://snyk.io/advisor/npm-package/better-sqlite3/example
https://code.djangoproject.com/ticket/24018
https://til.simonwillison.net/sqlite/enabling-wal-mode
https://prayanks/mcp-sqlite-server
https://www.powersync.com/
```

---

## Implications for Sherpa MCP Coordination Server

1. **SQLite is fully viable for Sherpa's coordination workload.** The expected concurrency (2-5 simultaneous agents, low-frequency writes for task claims and status updates) is well within SQLite's comfort zone. No need for PostgreSQL or a distributed database.

2. **Streamable HTTP is the preferred transport.** It centralizes all writes through a single Node.js process, eliminating SQLITE_BUSY entirely. STDIO can be supported as a fallback for Claude Desktop integration, relying on WAL mode and busy_timeout for cross-process coordination.

3. **`BEGIN IMMEDIATE` is non-negotiable for write transactions.** The DEFERRED transaction deadlock is the #1 source of unexpected SQLITE_BUSY errors. Every MCP tool that writes must use IMMEDIATE transactions. Drizzle's `{ behavior: 'immediate' }` and better-sqlite3's `.immediate()` both support this.

4. **The write-through projection pattern (from iteration-2 research) is reinforced.** Single-process architecture means the MCP server can atomically update SQLite + regenerate markdown files in the same tool handler call, with no cross-process coordination needed.

5. **Turso/libSQL is a natural upgrade path.** If Sherpa outgrows SQLite's single-writer model, libSQL's MVCC concurrent writes provide a drop-in upgrade with row-level conflict detection. The `@libsql/client` driver is API-compatible with better-sqlite3 in embedded mode.

6. **Worker threads are unnecessary for the initial implementation.** Coordination queries (task lookup, initiative status, authority checks) are fast -- sub-millisecond point queries on small tables. Worker threads add complexity without benefit until query latency exceeds ~50ms.

7. **The schema should use optimistic locking for task claims.** A `version` column on the tasks table enables single-statement atomic claims without explicit transactions: `UPDATE tasks SET claimed_by=?, version=version+1 WHERE id=? AND version=? AND status='pending'`.

---

## Open Questions

1. **MCP session-to-agent identity mapping.** How does the MCP server know which agent is making a tool call? The session ID tracks the connection, but the agent's identity (for `claimed_by`, authority records) needs to come from somewhere. Is it a tool parameter? A session attribute negotiated during initialization?

2. **Checkpoint strategy under continuous agent load.** If multiple agents hold long-running read transactions (e.g., streaming tool results), WAL checkpointing stalls and the WAL file grows. Should the MCP server force periodic checkpoint gaps? Or is the coordination workload light enough that this is a non-issue?

3. **Schema migration strategy.** How do we evolve the SQLite schema as Sherpa's framework grows? Drizzle has migration support, but SQLite's ALTER TABLE is limited (no DROP COLUMN before 3.35.0, no RENAME COLUMN before 3.25.0). What migration approach fits the framework's convention system?

4. **Backup strategy during active agent sessions.** Litestream provides continuous backup, but how does backup interact with active write transactions? Is `.backup()` (the SQLite Online Backup API, exposed by better-sqlite3) sufficient, or is Litestream needed?

5. **Authority record granularity.** The iteration-1 research defined authority tracking. But what granularity works in practice? File-level locks? Directory-level? Initiative-level? The schema needs to support the chosen granularity efficiently.

6. **Multi-transport operation.** Can the MCP server run both STDIO (for Claude Desktop) and Streamable HTTP (for background workers) simultaneously? The TypeScript SDK supports this, but does it create separate SQLite connections per transport, or share one?

7. **Read replica strategy for Studio UI.** If the Studio web UI needs to query the SQLite database for visualization, should it connect directly (read-only connection in WAL mode) or go through the MCP server's tool API? Direct connection is simpler but couples the UI to the schema.
