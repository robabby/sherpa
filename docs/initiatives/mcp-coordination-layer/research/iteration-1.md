# Iteration 1 — 2026-03-11

## Research Vectors

### Vector 1: MCP Protocol Primitives & Push Capabilities
**Question:** What are MCP's core primitives and which map to coordination concerns?
**Full report:** [iteration-1/vector-1-mcp-protocol-primitives.md](iteration-1/vector-1-mcp-protocol-primitives.md)

**Key discoveries:**
- MCP spec 2025-11-25 defines 7 primitives: Resources (read-only + subscriptions), Tools (mutation path + structured output), Prompts (templates), Sampling (server→client LLM), Elicitation (user input), Roots (directory boundaries), Tasks (experimental async state machines)
- **No built-in coordination primitives** — no ETags, version vectors, CAS operations, authority tracking, or conflict resolution at the protocol level
- `_meta` extension point on all messages allows custom coordination metadata without violating the spec
- Streamable HTTP transport supports SSE-based server-push, session management via `Mcp-Session-Id`, and resumability
- Tasks primitive (experimental) has durable state machines with polling, cancellation, and status notifications — the most coordination-relevant primitive

**Implications:**
- All coordination must be implemented as MCP tool logic — the protocol is a transport, not a coordination framework
- Resource subscriptions (`notifications/resources/updated`) can notify agents of state changes
- The `_meta` extension point could carry version/ETag metadata without custom protocol extensions

### Vector 2: Existing MCP Servers with Coordination Semantics
**Question:** Do real-world MCP servers implement authority, versioning, or conflict detection?
**Full report:** [iteration-1/vector-2-existing-mcp-servers.md](iteration-1/vector-2-existing-mcp-servers.md)

**Key discoveries:**
- **MCP Agent Mail** is the most sophisticated: advisory file leases with glob patterns, TTL-based expiry, optional pre-commit guard, dual Git+SQLite persistence ([GitHub](https://github.com/Dicklesworthstone/mcp_agent_mail))
- Only 3 servers implement any locking: Agent Mail (advisory leases), Beads Village (task queue + file reservations), Atomic Writer (journaled mutex)
- GitHub MCP's SHA-based OCC is inherited from the GitHub API, not added by MCP
- Confluence MCP's "conflict fix" is actually last-writer-wins — auto-fetches latest version before writing
- SEP-1708 proposes client-brokered file locking with `lockId` and `FILE_LOCKED` errors, but not yet merged
- Database MCP servers delegate all concurrency to the underlying database engine

**Implications:**
- The coordination gap is real — we're not missing something obvious
- Agent Mail's advisory-over-mandatory philosophy is validated by real-world usage
- Our approach of building coordination into tool logic aligns with what the ecosystem is converging toward

### Vector 3: Authority Tracking as MCP Tools
**Question:** How would acquire/release/check/transfer authority work as MCP tools?
**Full report:** [iteration-1/vector-3-authority-tracking-tools.md](iteration-1/vector-3-authority-tracking-tools.md)

**Key discoveries:**
- Fencing tokens are essential for correctness (Kleppmann) — and the MCP server being both lock manager AND resource layer is the ideal enforcement point
- **Cursor's 20-agent experiment:** pessimistic locking crushed throughput to 2-3 agents; optimistic concurrency made agents risk-averse. Planner/Worker/Judge with scope isolation was the solution ([Mike Mason blog](https://mikemason.ca/writing/ai-coding-agents-jan-2026/))
- Six MCP tool schemas designed: `acquire_authority`, `release_authority`, `check_authority`, `transfer_authority`, `heartbeat_authority`, `override_authority`
- Task dispatch should grant **implicit authority** — when a task is dispatched, the MCP server auto-acquires authority over target files
- Azure Blob's `Break` operation models human override: any authorized request can break any lease, no lease ID required
- Authority TTL: 30 min for interactive sessions, 10 min for background workers, with periodic reaper

**Implications:**
- Hybrid model: optimistic concurrency (version checks) by default, pessimistic leases for high-contention resources
- Implicit authority via task dispatch is the key simplification — most agents never call acquire_authority directly
- Human override is a first-class operation, not an afterthought

### Vector 4: MCP + SQLite Concurrent Architecture
**Question:** How to serve multiple concurrent agent clients from SQLite via MCP?
**Full report:** [iteration-1/vector-4-sqlite-mcp-architecture.md](iteration-1/vector-4-sqlite-mcp-architecture.md)

**Key discoveries:**
- SQLite WAL mode: N concurrent readers + 1 writer with snapshot isolation. All processes must be on same host.
- **Critical gotcha:** `BEGIN IMMEDIATE` is mandatory for write transactions — DEFERRED transactions that upgrade from read to write bypass `busy_timeout` and deadlock instantly
- **better-sqlite3** is the right driver: synchronous API (1.2M ops/sec), `.immediate()` transaction method, no connection pooling needed
- **Streamable HTTP is the ideal MCP transport** — single Node.js process eliminates SQLITE_BUSY entirely, writes serialized by event loop
- Scaling: ~10-15 concurrent sessions per CPU core with Streamable HTTP
- Drizzle ORM provides type-safe schema with `{ behavior: 'immediate' }` transaction support
- Turso/libSQL is the upgrade path if single-writer becomes a bottleneck (MVCC, 4x write throughput)

**Implications:**
- Single-process architecture is the keystone design decision — it eliminates an entire class of concurrency bugs
- One tool call = one IMMEDIATE transaction is the natural mapping
- No connection pooling, no distributed locking infrastructure — SQLite + better-sqlite3 + event loop serialization

### Vector 5: File Projection from Authoritative Store
**Question:** If SQLite is truth and markdown is projection, how to keep them in sync?
**Full report:** [iteration-1/vector-5-file-projection-sync.md](iteration-1/vector-5-file-projection-sync.md)

**Key discoveries:**
- **Write-through projection is the right starting point** — every MCP mutation regenerates affected markdown files synchronously. At Sherpa's write frequency, latency is negligible.
- Logseq tried DB-authority with bidirectional sync and abandoned it — signals that editable surface area in projected files should be deliberately limited
- Conflict resolution: SQLite wins for structured fields (frontmatter); human edits win for prose content
- Detection via content hashing in frontmatter: `_projection_hash`, `_projected_at`, `_source_version`
- `sherpa sync` CLI as escape hatch: `project` (rebuild all files), `ingest` (pull human edits back), `reconcile` (bidirectional)
- Atomic file writes via temp+rename pattern prevent partial-write corruption
- Cold-start from markdown: clone repo → `sherpa sync ingest` → builds database from files

**Implications:**
- Projected files are specialized cache, not source — this framing is critical for the mental model
- Limit what's editable in projected files to reduce conflict surface
- Frontmatter-based sync metadata is a natural fit for the existing initiative convention

## Synthesis

Five vectors converge on an architecture with surprising clarity. The cross-cutting insights:

**1. The single-process Streamable HTTP server is the keystone.** It eliminates SQLITE_BUSY contention, makes the MCP server both lock manager and resource layer (enabling fencing token enforcement at the mutation point), and consolidates file projection into the same process that writes to SQLite. This single architectural choice eliminates distributed locking infrastructure, connection pooling, cross-process coordination, and an entire class of race conditions.

**2. Coordination is entirely application-level, and that's good.** MCP provides transport and tool semantics but zero coordination primitives. No ETags, no version vectors, no authority tracking. This means we design exactly what Sherpa needs without fighting the spec. The `_meta` extension point and structured `outputSchema` give us clean hooks for coordination metadata.

**3. Task dispatch as implicit authority is the central simplification.** The Cursor 20-agent experiment showed that both pure pessimistic locking (throughput collapse) and pure optimistic concurrency (agent risk-aversion) fail. The Planner/Worker/Judge pattern with scope isolation works. In Sherpa's terms: dispatching a task implicitly grants authority over its targets. Explicit `acquire_authority` exists only for planners working on shared artifacts. Most agents never touch the authority API directly.

**4. MCP Agent Mail validates the advisory model but inverts the storage architecture.** Agent Mail uses Git as storage + SQLite as query layer. Sherpa inverts this: SQLite as truth + files as projection. But Agent Mail's advisory-over-mandatory philosophy — surfacing intent rather than hard locking — is the right approach for a system where agents can crash, lose context, or be interrupted.

**5. Write-through projection with limited editability solves the hardest problem.** The bidirectional sync challenge (human edits to projected files) is genuinely hard — Logseq tried and retreated. Sherpa's answer: project from SQLite on every write, detect human edits via content hashing, and deliberately limit which parts of projected files are editable (prose yes, structured metadata no). The `sherpa sync` CLI handles the escape hatches.

**The architecture in one paragraph:** A single-process MCP server (Streamable HTTP) backed by SQLite (WAL mode, better-sqlite3, IMMEDIATE transactions) mediates all agent state mutations. Authority is implicit through task dispatch and explicit through lease-based tools for shared resources. Every mutation write-through projects to markdown files. Human edits are detected via content hashing and ingested back through `sherpa sync`. The MCP server enforces fencing tokens at the mutation point, making it both the lock manager and the resource layer — the ideal architecture for correctness per Kleppmann's analysis.

## All Sources

### MCP Specification
- [MCP Spec 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25) — Current spec version
- [Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources) — Read-only resources with subscriptions
- [Tools spec](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) — Mutation path with structured output
- [Tasks spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks) — Experimental async state machines
- [Transports spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) — stdio + Streamable HTTP
- [SEP-1708](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1708) — Client-brokered file locking proposal

### Coordination & Concurrency Theory
- [Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — Fencing tokens, critique of Redlock
- [Mike Mason: AI Coding Agents](https://mikemason.ca/writing/ai-coding-agents-jan-2026/) — Cursor's 20-agent experiment with pessimistic/optimistic/Planner-Worker-Judge
- [Gray 1976: Granularity of Locks](https://mwhittaker.github.io/papers/html/gray1976granularity.html) — Intention locks, hierarchical resources
- [SyncGuard fencing](https://kriasoft.com/syncguard/fencing) — Fencing token implementation patterns

### MCP Servers with Coordination
- [MCP Agent Mail](https://github.com/Dicklesworthstone/mcp_agent_mail) — Advisory leases, dual Git+SQLite persistence
- [Beads Village](https://github.com/LNS2905/mcp-beads-village) — Task queue + file reservations
- [Atomic Writer MCP](https://github.com/vanzan01/atomic-writer-mcp) — Journaled mutex locks
- [GitHub MCP Server](https://github.com/github/github-mcp-server) — SHA-based OCC (inherited from API)

### SQLite Architecture
- [SQLite WAL docs](https://sqlite.org/wal.html) — WAL mode concurrency guarantees
- [SkyPilot: Abusing SQLite for concurrency](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) — Production data at 1000x concurrent writers
- [Fly.io: SQLite Internals](https://fly.io/blog/sqlite-internals-wal/) — WAL index hash structure
- [Bert Hubert: DEFERRED deadlock](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/) — Why BEGIN IMMEDIATE is mandatory
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — Synchronous driver, 1.2M ops/sec
- [Drizzle ORM](https://orm.drizzle.team/docs/get-started-sqlite) — Type-safe SQLite schema
- [Turso concurrent writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) — libSQL MVCC as upgrade path

### Projection & Sync Patterns
- [Marten Projections](https://martendb.io/events/projections/) — Inline/async/live projection lifecycles
- [Microsoft: Materialized View Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view) — Projections as specialized cache
- [chokidar](https://github.com/paulmillr/chokidar) — File watching for human edit detection
- [Simon Willison: sqlite-history](https://simonwillison.net/2023/Apr/15/sqlite-history/) — Change tracking in SQLite

### Distributed Lock Systems
- [etcd Lease API](https://etcd.io/docs/v3.6/dev-guide/api_concurrency_reference_v3/) — TTL-based leases with keepalive
- [Azure Blob Lease API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob) — 5-operation lease model with Break
- [Dapr Lock API](https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/distributed-lock-api-overview/) — Clean REST model for lock operations
- [BullMQ stalled jobs](https://docs.bullmq.io/guide/workers/stalled-jobs) — Task dispatch with implicit locking

## Proposals Generated
- `proposal.md` — MCP Coordination Layer: single-process Streamable HTTP + SQLite + authority tools + write-through projection

## Open Questions for Next Iteration
1. **Authority × git worktrees** — If agents work in isolated worktrees (branches), does file-level authority become unnecessary? Worktree isolation may naturally prevent conflicts without locks.
2. **Schema design for authority records** — What SQLite tables model authority leases, fencing tokens, and version tracking? What indexes optimize the hot paths (check authority on every mutation)?
3. **MCP Tasks integration** — The experimental Tasks primitive has state machines and polling. Can authority acquisition be modeled as a Task (working → granted/denied) rather than a synchronous tool call?
4. **Partial state on agent crash** — If an agent crashes mid-transaction, SQLite rolls back the DB write. But what about the projected file? Does write-through + atomic file writes make this a non-issue?
5. **Multi-MCP-server topology** — If Sherpa needs multiple MCP servers (e.g., one for coordination, one for LM Studio integration), how do they share the SQLite database? Does the single-process advantage break?
