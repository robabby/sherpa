# MCP Coordination Layer — Research

## Iterations

### Iteration 1 (2026-03-11)
First research cycle. Surveyed MCP protocol primitives, existing MCP servers with coordination patterns, authority tracking design, SQLite concurrency architecture, and file projection sync strategies. Produced initial proposal.

**Key finding:** Single-process Streamable HTTP + SQLite (WAL, better-sqlite3) + implicit authority via task dispatch + write-through file projection is the architecture. MCP has no coordination primitives — all coordination is application-level tool logic.

**Vector reports:** `iteration-1/vector-{1-5}-*.md` (243KB of raw research)

### Iteration 2 (2026-03-12)
Deep-dive tool API analysis of all known MCP coordination servers. Read actual source code from four servers: MCP Agent Mail, mcp-beads-village, multi-agent-coordination-mcp, and dead-drop-teams. Also analyzed SEP-1708 (client-brokered filesystem access).

**Key finding:** No existing server implements fencing tokens, heartbeat-based liveness, or mandatory server-side enforcement. All use advisory locking with TTL-based expiry. MCP Agent Mail is the most sophisticated (advisory reservations + pre-commit guard + dual Git/SQLite persistence). The gap Sherpa fills is clear: verifiable authority credentials, state machine lifecycle, and mandatory enforcement.

**Reports:**
- `iteration-2/mcp-coordination-server-tool-api-analysis.md` (comprehensive, ~400 lines)
- `iteration-2/stateful-vs-stateless-mcp-coordination-server.md` — Stateful vs stateless architecture analysis. Benchmarked SQLite indexed reads (3-7μs) against in-memory Map (~500ns). Surveyed 5 MCP coordination servers: none use in-memory authority caching. Conclusion: SQLite-as-truth with no application cache. SQLite's page cache IS the cache.
- `iteration-2/claude-code-native-capabilities-vs-mcp-coordination.md`
- `iteration-2/dolt-vs-sqlite-authority-backing-store.md` — Deep comparison of Dolt vs SQLite for authority state. Dolt architecture (Prolly trees, cell-level merge), Sysbench/TPC-C benchmarks, Node.js story (Go-only embedded), Beads/Gas Town production migration, Turso/libSQL middle ground. Confirms Iteration 4 findings with 200+ sourced URLs and detailed benchmark tables. (~800 lines)

### Iteration 3 (2026-03-12)
Heartbeat, orphan detection, and adoption protocol design. Surveyed 8 production systems (Chubby, ZooKeeper, etcd, Kafka, Temporal, BullMQ, Kubernetes probes, Redis Redlock). Read the original Chubby paper (Burrows, OSDI 2006) for the KeepAlive/jeopardy/grace-period protocol. Analyzed Kleppmann's fencing token argument and Jepsen's etcd lock failures. Examined MCP's built-in ping spec.

**Key findings:**
- **Three-state model** (active → jeopardy → orphaned) from Chubby is the right pattern. Chubby defaults: 12s KeepAlive cycle, 45s grace period.
- **1/3 heartbeat ratio** is canonical (ZooKeeper, Kafka). Heartbeat interval = TTL/3.
- **Temporal's 80% throttle** — SDK sends heartbeats at 80% of timeout, with 30s default and 60s max throttle.
- **BullMQ defaults** — 30s lockDuration, 15s lockRenewTime, 30s stalledInterval, maxStalledCount=1.
- **Fence tokens are the real safety mechanism**, not leases. Jepsen proved etcd locks fail mutual exclusion with short TTLs. Kleppmann showed 90-second network delays in production (GitHub).
- **Heartbeat-with-progress** (Temporal pattern) enables task resumption — new worker reads last heartbeat payload to resume.
- **AI agents need different intervals** — 5min interactive TTL, 2min background TTL, 30min waiting-for-human TTL, with 1min jeopardy grace.
- **MCP has a ping mechanism** but it's transport-level only. Application-level heartbeat (via tool calls) is needed.
- **Git branch isolation** is Sherpa's unique defense against zombie agents — even if fencing fails, damage is contained to a branch.

**Report:** `iteration-3/heartbeat-orphan-adoption-protocol.md` (~600 lines, 33 sources, 90+ URLs)

### Iteration 4 (2026-03-12)
Persistence layer deep dive. Compared SQLite, Dolt, Git-only, and hybrid approaches with sourced benchmarks, real-world case studies (Beads, MCP Agent Mail, Cord, Temporal, SkyPilot, BugSink), and operational complexity analysis.

**Key finding:** SQLite (WAL, better-sqlite3) remains correct. Dolt reached MySQL parity on sysbench but requires a separate server process (~100MB Go binary) — fatal for an npm-installable framework. Beads' migration to Dolt-only is instructive but their operational overhead (auto-start, port conflicts, circuit breakers) validates avoiding it. libSQL is the confirmed upgrade path (drop-in better-sqlite3 replacement, embedded replicas, eventual MVCC). cr-sqlite is irrelevant for single-process. Temporal validates SQLite-for-dev/RDBMS-for-prod as industry pattern.

**Report:** `iteration-4/persistence-layer-comparison.md` (comprehensive, ~450 lines, 100+ sourced links)

## Open Questions

1. **Authority × git worktrees** — Does worktree isolation make file-level authority unnecessary for most operations?
2. **Schema design for authority records** — Tables, indexes, hot-path optimization for authority checks on every mutation.
3. **MCP Tasks as authority state machines** — Can authority acquisition be modeled as Tasks (working → granted/denied)?
4. **Partial state on agent crash** — Does write-through + atomic file writes + SQLite rollback handle all crash scenarios?
5. **Multi-MCP-server topology** — How do multiple MCP servers share SQLite without reintroducing contention?

## Related Research

- `../sqlite-agentic-state/` — SQLite as backing store for agent state
- `../distributed-agent-consistency/` — Consistency models for multi-agent collaboration
- `../mmo-patterns-for-agents/` — MMO server meshing patterns applied to agents
- `../section-level-prose-sync/` — Three-way merge at section granularity
