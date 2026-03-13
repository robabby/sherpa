# Stateful vs Stateless MCP Coordination Server

**Research question:** Should Sherpa's MCP coordination server be stateful (in-memory state, long-running process) or stateless (reads from SQLite/git on every call)?

**Date:** 2026-03-12
**Iteration:** 2

---

## Key Discoveries

### 1. How Existing MCP Servers Handle State

- **MCP Agent Mail (Python/Rust):** No in-memory state persistence. Git + SQLite are the authoritative stores. SQLite provides fast indexing and FTS5; Git provides human-auditable artifacts. The server reads from disk on every operation. Advisory file reservations use TTL-based expiry stored in Git as JSON files. "SQLite is the fast index, not the authority." ([GitHub - mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail))

- **MCP Agent Mail Rust rewrite:** Solved the Python version's three failure modes (Git lock contention, SQLite pool exhaustion, cascading failures) via a commit coalescer (9.1x batching ratio), WAL mode with 60s busy_timeout, and structured concurrency. Stress tests: 60 threads against 15-connection pool with 0 timeouts, 0 DB errors. ~49 RPS sustained, p99=2.6s. ([GitHub - mcp_agent_mail_rust](https://github.com/Dicklesworthstone/mcp_agent_mail_rust))

- **Beads Village:** Entirely filesystem-based. Tasks in `.beads/`, locks in `.reservations/`, messages in `.mail/`. File locks use atomic `O_CREAT|O_EXCL` filesystem operations. Stateless between restarts — re-scans directories on init. Git-synchronized. No database at all. ([GitHub - mcp-beads-village](https://github.com/LNS2905/mcp-beads-village))

- **Engram:** Single Go binary, single SQLite file with FTS5. "No Node.js, no Python, no Bun, no Docker, no ChromaDB, no vector database, no worker processes." Exposed via CLI, HTTP API, and MCP server. Agent decides what to persist; server just stores and searches. ([GitHub - engram](https://github.com/Gentleman-Programming/engram))

- **Agent-MCP:** Persistent knowledge graph for coordination state. Task assignment, status tracking, inter-agent messaging. Architecture details sparse — documentation indicates complexity "not fully documented in the README." ([GitHub - Agent-MCP](https://github.com/rinadelph/Agent-MCP))

**Pattern:** Every production MCP coordination server reads from persistent storage (filesystem or SQLite) on every call. None maintain in-memory authority state. The closest to caching is SQLite's own page cache (which is automatic in WAL mode).

### 2. SQLite Read Performance for the Authority Hot Path

A typical authority check: `SELECT * FROM authority_leases WHERE scope = ? AND expires_at > ? LIMIT 1`

**Concrete numbers (with covering index, WAL mode, better-sqlite3):**

- **Indexed reads on M1 Mac:** 440,917 queries/sec, p90 latency 3-7 microseconds ([marending.dev - SQLite benchmarks](https://marending.dev/notes/sqlite-benchmarks/))
- **Mixed workload (80% read, 20% write) with indices on M1:** 197,012 queries/sec, p90 latency 15-24 microseconds ([marending.dev - SQLite benchmarks](https://marending.dev/notes/sqlite-benchmarks/))
- **better-sqlite3 vs node-sqlite3:** better-sqlite3 is 11.7x faster for single-row SELECT, 2.9x faster for 100-row SELECT ([GitHub - better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
- **Real-world complex queries:** "Upward of 2,000 queries per second with 5-way-joins in a 60 GB database" ([GitHub - better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
- **WAL mode vs rollback:** WAL achieves 70,000 reads/sec vs dramatically lower in rollback mode ([phiresky - SQLite performance tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/))
- **Transaction overhead in WAL:** Reduced from 30ms+ to <1ms per transaction ([PowerSync - SQLite optimizations](https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance))

**For comparison — JavaScript Map.get():**

- Map read: ~475-513 nanoseconds per operation (1M string keys, Node v12) ([GitHub Gist - Map vs Object benchmark](https://gist.github.com/Chunlin-Li/2606bd813df88eaeee2d))

**The math for Sherpa's hot path:**

- Authority check via SQLite indexed read: ~3-7 microseconds (3,000-7,000 ns)
- Authority check via Map.get(): ~475-513 nanoseconds
- **Difference: ~6-14x slower for SQLite vs in-memory Map**
- **But:** 3-7 microseconds is 0.003-0.007 milliseconds. At 3-20 agents making mutations every few seconds, the server handles ~20 authority checks/second. SQLite can do 440,000/second. **We are at 0.005% of SQLite's capacity.**

**Conclusion:** In-memory caching of authority state is unnecessary for performance. SQLite indexed reads on the hot path are fast enough by multiple orders of magnitude.

### 3. MCP Server Process Lifecycle

- **Streamable HTTP servers are long-running processes** — like web servers, not spawned per-connection like stdio transport. The MCP spec's Streamable HTTP transport assumes a persistent HTTP endpoint. ([MCP Specification - Transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports))

- **Critical Node.js bug (now known):** The streamable-http implementation in the TypeScript SDK had a bug where `res.on("close")` called `server.close()`, which killed the global MCP Server instance and caused the Node.js process to exit. The fix: never call `server.close()` on connection close — only manage transport instances. ([GitHub Issue #219 - mcp-server-kubernetes](https://github.com/Flux159/mcp-server-kubernetes/issues/219))

- **Session state is in-memory by default.** The MCP SDK stores `StreamableHTTPServerTransport` instances in a Map keyed by session ID. These are lost on restart. ([MCP Specification - Session Management](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports))

- **Restart recovery per spec:** When a client receives HTTP 404 for a request carrying an `Mcp-Session-Id`, it MUST start a new session by sending a new `InitializeRequest` without a session ID. In practice, many clients don't implement this correctly yet. ([LibreChat Issue #11868](https://github.com/danny-avila/LibreChat/issues/11868))

- **The protocol team's future direction:** "Agentic applications are stateful, but the protocol itself doesn't need to be." The roadmap moves sessions to the data model layer (cookie-like mechanism) and aims for stateless transport. ([MCP Blog - Transport Future](https://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/))

- **AWS reference architectures exist for both:** Stateful on ECS with sticky sessions, stateless on Lambda. The MCP SDKs do not support external session persistence (Redis, DynamoDB) out of the box. ([AWS Samples - Serverless MCP Servers](https://github.com/aws-samples/sample-serverless-mcp-servers), [DeepWiki - Stateful vs Stateless](https://deepwiki.com/aws-samples/sample-serverless-mcp-servers/1.1-stateful-vs.-stateless-architecture))

### 4. In-Memory Cache + SQLite Hybrid Patterns

- **Write-through pattern:** Write to cache AND database on every mutation; read from cache. Single-process Node.js makes this trivial since there are no thread-safety concerns. Cache invalidation is automatic because the writing process owns the cache. ([LogRocket - Caching in Node.js](https://blog.logrocket.com/caching-node-js-optimize-app-performance/))

- **Cloudflare Durable Objects:** The most sophisticated production example. SQLite runs as a library in the same thread as the application. "Storage lives in the same thread as the application, requiring not even a context switch to access." Database content is cached in memory automatically. Synchronous queries complete in microseconds when data is cached. Writes use "Output Gates" — responses held until durability confirmation completes. ([Cloudflare Blog - SQLite in Durable Objects](https://blog.cloudflare.com/sqlite-in-durable-objects/))

- **SQLite's own page cache:** With `mmap_size` set and WAL mode, SQLite already caches hot pages in memory. For a small authority table (3-20 rows), the entire B-tree fits in a single page and will remain in SQLite's cache after the first read. This is effectively an in-memory lookup with disk as the persistence layer. ([SQLite - WAL Documentation](https://sqlite.org/wal.html))

- **Node.js LRU cache libraries:** `lru-cache` (npm) is the standard. But for our use case — a small, fixed-size authority table where the entire dataset fits in memory — a simple `Map` with write-through to SQLite would be simpler than an LRU. ([npm - lru-cache](https://www.npmjs.com/package/lru-cache))

**The Durable Objects insight is critical:** When SQLite runs in-process (as with better-sqlite3), the distinction between "in-memory" and "SQLite read" collapses. SQLite's page cache means hot data IS in memory. The "database read" is really a B-tree traversal of cached pages — not disk I/O.

### 5. Cold Start and Warm-Up

- **SQLite cold start:** Opening a SQLite database and running an indexed query takes single-digit milliseconds. With WAL mode + mmap, the first query loads pages into the OS page cache; subsequent queries hit memory. For a small authority table, the entire warm-up is one query. ([PowerSync - SQLite optimizations](https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance))

- **In-memory only (state lost on restart):** Authority leases would need to be reconstructed from... what? If there's no persistent store, they're simply gone. Agents would need to re-acquire authority, which could cause conflicts if two agents believe they have authority during the restart window.

- **SQLite as ground truth (our design):** On restart, authority state is immediately available. First query loads the authority table. No reconstruction needed. Expired leases are naturally pruned. The server can accept mutations within milliseconds of startup.

- **MCP Agent Mail's approach:** "Restarting the server automatically reconnects to existing projects and agent identities. All message history remains accessible. File reservations persist if their TTL hasn't expired. No data loss; state fully recovers from disk." ([GitHub - mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail))

- **Engram's approach:** After context compaction/reset, agents call `mem_context` to recover session state from SQLite. The server itself has no warm-up — it just opens the database file. ([GitHub - engram](https://github.com/Gentleman-Programming/engram))

### 6. Game Server Analogy

- **Game servers keep world state in memory** because they process physics/AI at 30-60 Hz and need sub-millisecond state access. They persist to database periodically (every 10-30 seconds) as a crash recovery mechanism. ([Redwood MMO - Persistence](https://redwoodmmo.com/blog/persistence-for-ephemeral-game-servers))

- **Sherpa operates at a fundamentally different timescale.** Agent mutations happen every few seconds to minutes, not 30-60 per second. Even the "slow" SQLite path (3-7 microseconds) is thousands of times faster than our update frequency.

- **The game server pattern IS relevant for one thing:** crash recovery. Games use a sidecar pattern where an intermediary process manages lifecycle, persists final state on crash, and invalidates incomplete data. This maps to our "SQLite as ground truth, in-memory as cache" model — but we don't even need the cache layer because our access frequency is so low. ([Redwood MMO - Persistence](https://redwoodmmo.com/blog/persistence-for-ephemeral-game-servers))

- **Durable Objects are the modern answer:** Single-threaded process, SQLite in the same thread, state cached in memory with durable persistence. "Each Durable Object instance can be seen as an Actor instance, receiving messages, executing logic in its own single-threaded context using its attached durable storage." This IS Sherpa's architecture, minus the global distribution. ([Cloudflare - Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/))

---

## Implications for Sherpa's MCP Coordination Server

### Recommendation: SQLite as Single Source of Truth, No Application-Level Cache

**The answer is neither pure stateful nor pure stateless — it's "SQLite-stateful."**

1. **SQLite handles the authority hot path directly.** At 3-7 microseconds per indexed read and <20 checks/second, there is no performance justification for an in-memory cache. The complexity cost of cache invalidation exceeds the performance benefit.

2. **SQLite's page cache IS our in-memory cache.** With WAL mode, mmap, and better-sqlite3's synchronous in-process execution, hot authority rows stay in SQLite's page cache. We get in-memory performance without managing a separate cache.

3. **Cold start is a non-issue.** Opening SQLite + first indexed query takes single-digit milliseconds. Authority state is immediately available. No reconstruction, no warm-up phase.

4. **Process restarts are clean.** When the server crashes or restarts:
   - Authority leases survive in SQLite (with TTL-based expiry for stale ones)
   - Clients detect session loss via HTTP 404, reinitialize per MCP spec
   - No authority state is lost — only transport-level sessions (which are ephemeral by design)

5. **This matches every production MCP coordination server.** MCP Agent Mail, Beads Village, and Engram all read from persistent storage on every call. None cache authority state in memory.

6. **If we ever need horizontal scaling,** the MCP protocol is moving toward stateless transport anyway. SQLite-as-truth means our authority layer works with any number of server instances (via SQLite replication: LiteFS, Turso, or shared-filesystem).

### What SHOULD Be In-Memory

- **MCP transport sessions** (`StreamableHTTPServerTransport` instances) — these are inherently ephemeral and in-memory per the SDK design
- **Prepared statements** — better-sqlite3 caches these automatically
- **Nothing else** — resist the temptation to add a Map cache "for performance"

### Design Validation

The Cloudflare Durable Objects architecture validates our approach:
- Single-threaded process (Node.js) ✓
- SQLite as embedded library in same thread (better-sqlite3) ✓
- Synchronous queries (no async overhead) ✓
- Automatic page caching (WAL mode + mmap) ✓
- Strong consistency within the process (single-threaded) ✓

The only Durable Objects feature we lack is geographic distribution with replicated persistence — which we don't need at 3-20 agents.

---

## Sources

### MCP Protocol and Architecture
- [MCP Discussion #102: State and long-lived connections](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/102) — Core debate on stateful vs stateless MCP design
- [MCP Blog: Transport Future (Dec 2025)](https://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/) — Protocol team's roadmap toward stateless transport
- [MCP Specification: Transports (2025-03-26)](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports) — Streamable HTTP session management spec
- [AWS Serverless MCP Servers](https://github.com/aws-samples/sample-serverless-mcp-servers) — Reference implementations for stateful/stateless on AWS
- [DeepWiki: Stateful vs Stateless MCP Architecture](https://deepwiki.com/aws-samples/sample-serverless-mcp-servers/1.1-stateful-vs.-stateless-architecture) — Comprehensive comparison table
- [StatelessMCP (experimental)](https://github.com/azizamari/StatelessMCP) — Proof-of-concept for fully stateless MCP

### MCP Server Implementations
- [MCP Agent Mail (Python)](https://github.com/Dicklesworthstone/mcp_agent_mail) — Advisory leases, dual Git/SQLite persistence, no in-memory state
- [MCP Agent Mail (Rust)](https://github.com/Dicklesworthstone/mcp_agent_mail_rust) — Commit coalescer, WAL + busy_timeout, stress-tested concurrent access
- [Beads Village](https://github.com/LNS2905/mcp-beads-village) — Filesystem-only coordination, atomic locks, stateless between restarts
- [Agent-MCP](https://github.com/rinadelph/Agent-MCP) — Persistent knowledge graph for multi-agent coordination
- [Engram](https://github.com/Gentleman-Programming/engram) — Single Go binary, SQLite + FTS5, agent memory system

### SQLite Performance
- [SQLite benchmarks (marending.dev)](https://marending.dev/notes/sqlite-benchmarks/) — Concrete latency numbers: 3-7μs indexed reads, 440K reads/sec on M1
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — 11.7x faster than node-sqlite3 for single-row SELECT
- [SQLite performance tuning (phiresky)](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/) — WAL mode, 100K+ SELECTs/sec
- [PowerSync: SQLite optimizations](https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance) — WAL reduces transaction overhead from 30ms to <1ms
- [SQLite: 35% faster than filesystem](https://sqlite.org/fasterthanfs.html) — In-process architecture advantage
- [SQLite WAL documentation](https://sqlite.org/wal.html) — Concurrent readers, page cache behavior

### Cloudflare Durable Objects (Architecture Analog)
- [Cloudflare Blog: Zero-latency SQLite in Durable Objects](https://blog.cloudflare.com/sqlite-in-durable-objects/) — SQLite in same thread, page cache, Output Gates
- [Durable Objects: Rules](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/) — Single-threaded actor model, no state sharing

### MCP Process Lifecycle / Crash Recovery
- [Kubernetes MCP Server Issue #219](https://github.com/Flux159/mcp-server-kubernetes/issues/219) — Streamable HTTP process exit bug and fix
- [LibreChat Issue #11868](https://github.com/danny-avila/LibreChat/issues/11868) — Session loss detection failure after server restart
- [Agno Issue #3724](https://github.com/agno-agi/agno/issues/3724) — Agent fails to recover MCP tools after server restart

### Caching Patterns
- [LogRocket: Caching in Node.js](https://blog.logrocket.com/caching-node-js-optimize-app-performance/) — Write-through pattern, in-process caching
- [SQLite Forum: Cache strategies](https://www.sqliteforum.com/p/implementing-cache-strategies-for) — In-memory, file-based, TTL-based caching for SQLite
- [npm: lru-cache](https://www.npmjs.com/package/lru-cache) — Standard LRU cache library for Node.js

### Game Server Architecture
- [Redwood MMO: Persistence for Ephemeral Game Servers](https://redwoodmmo.com/blog/persistence-for-ephemeral-game-servers) — Sidecar pattern, crash recovery, external persistence
- [GameDev.net: Turn-based game state architecture](https://www.gamedev.net/forums/topic/697655-turn-based-game-state-storage-architecture/) — In-memory state with periodic persistence

### JavaScript Performance
- [Map vs Object benchmark (GitHub Gist)](https://gist.github.com/Chunlin-Li/2606bd813df88eaeee2d) — Map.get() ~475-513ns per op with string keys

---

## Raw Links

```
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/102
https://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/
https://modelcontextprotocol.io/specification/2025-03-26/basic/transports
https://github.com/aws-samples/sample-serverless-mcp-servers
https://deepwiki.com/aws-samples/sample-serverless-mcp-servers/1.1-stateful-vs.-stateless-architecture
https://github.com/azizamari/StatelessMCP
https://github.com/Dicklesworthstone/mcp_agent_mail
https://github.com/Dicklesworthstone/mcp_agent_mail_rust
https://github.com/LNS2905/mcp-beads-village
https://github.com/rinadelph/Agent-MCP
https://github.com/Gentleman-Programming/engram
https://marending.dev/notes/sqlite-benchmarks/
https://github.com/WiseLibs/better-sqlite3
https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance
https://sqlite.org/fasterthanfs.html
https://sqlite.org/wal.html
https://blog.cloudflare.com/sqlite-in-durable-objects/
https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/
https://github.com/Flux159/mcp-server-kubernetes/issues/219
https://github.com/danny-avila/LibreChat/issues/11868
https://github.com/agno-agi/agno/issues/3724
https://blog.logrocket.com/caching-node-js-optimize-app-performance/
https://www.sqliteforum.com/p/implementing-cache-strategies-for
https://www.npmjs.com/package/lru-cache
https://redwoodmmo.com/blog/persistence-for-ephemeral-game-servers
https://www.gamedev.net/forums/topic/697655-turn-based-game-state-storage-architecture/
https://gist.github.com/Chunlin-Li/2606bd813df88eaeee2d
https://github.com/modelcontextprotocol/typescript-sdk
https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md
https://github.com/github/github-mcp-server
https://github.com/modelcontextprotocol/servers
https://mcpagentmail.com/
https://thenewstack.io/15-best-practices-for-building-mcp-servers-in-production/
https://dev.to/stacklok/performance-testing-mcp-servers-in-kubernetes-transport-choice-is-the-make-or-break-decision-for-1ffb
https://sqlite.org/speed.html
https://sqlite.org/inmemorydb.html
https://dsvynarenko.hashnode.dev/nodejs-performance-2-object-vs-map
https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8
https://github.com/WiseLibs/better-sqlite3/issues/1266
https://ericdraken.com/sqlite-performance-testing/
https://news.ycombinator.com/item?id=35547819
https://flaredup.substack.com/p/the-ultimate-guide-to-cloudflares
https://forum.openmw.org/viewtopic.php?t=7193&start=10
https://sqlite.org/forum/info/dec8c0c6cb72daba
https://sqlite.org/forum/info/21bdb930ed56e250
```

---

## Open Questions

1. **SQLite page cache behavior with concurrent MCP tool calls.** When multiple agents call tools near-simultaneously via Streamable HTTP, does Node.js's single-threaded nature guarantee sequential access to better-sqlite3? (Likely yes — better-sqlite3 is synchronous and Node.js is single-threaded, so tool calls serialize naturally.)

2. **Authority lease expiry cleanup.** Should expired leases be cleaned up lazily (check + skip on read) or eagerly (periodic cleanup query)? Lazy is simpler but leaves dead rows; eager adds a timer but keeps the table clean.

3. **Prepared statement lifecycle with better-sqlite3.** Does preparing `SELECT * FROM authority_leases WHERE scope = ? AND expires_at > ? LIMIT 1` once at startup and reusing it give measurably different performance than re-preparing per call? (Likely yes — preparing once avoids SQLite's query planner on each call.)

4. **What happens if SQLite's WAL file grows unbounded?** With WAL mode, checkpointing normally happens automatically. But if the server is under sustained write load from many agents, does the WAL file growth become an issue? (Unlikely at our scale — automatic checkpointing handles this.)

5. **MCP protocol evolution impact.** The protocol team plans stateless transport for 2026 H1. If sessions move to the data model layer with a cookie-like mechanism, does that change our architecture? (Probably not — our authority state is already in SQLite, independent of transport sessions.)

6. **Multi-process SQLite access.** If we ever run multiple Sherpa coordination servers against the same SQLite file (e.g., for high availability), WAL mode supports concurrent readers but only one writer. Would we need to move to a client-server database, or would a write-serialization layer suffice?
