# Iteration 1 — 2026-03-12

## What We Already Knew

Iteration 1 of the parent initiative (`mmo-patterns-for-agents`) established the structural isomorphism between game server architecture and multi-agent coordination, identified seven patterns (single-writer authority, replication layer, prevention>detection>compensation, bounded authority transfer with fencing tokens, time dilation as backpressure, interest management, authority/ownership distinction), and confirmed that no current AI agent framework implements enforced authority over shared state. The sibling `mcp-coordination-layer` initiative designed six MCP tool schemas (`acquire_authority`, `release_authority`, `check_authority`, `transfer_authority`, `heartbeat_authority`, `override_authority`), established the single-process Streamable HTTP + SQLite architecture, and identified implicit authority via task dispatch as the central simplification. The Beads ecosystem addendum confirmed advisory-only coordination across Agent Mail, Beads Village, and Gas Town.

## Research Vectors

### Vector 1: Dolt vs SQLite as Authority Backing Store
**Question:** Should Sherpa use Dolt (Beads' choice) instead of SQLite for the authority state database?
**Full report:** [iteration-1/vector-1-dolt-vs-sqlite.md](iteration-1/vector-1-dolt-vs-sqlite.md)

**Key discoveries:**
- Dolt's Prolly tree architecture enables cell-level three-way merge and structural sharing across versions, but adds ~250x latency overhead on the hot path (in-process SQLite ~190ns vs Dolt-over-loopback ~50,000ns per prepared statement) ([DoltHub benchmarks](https://docs.dolthub.com/sql-reference/benchmarks/latency))
- Dolt has no Node.js embedded mode — requires a separate `dolt sql-server` process (~103MB Go binary, 2-4GB RAM), eliminating the single-process architecture advantage ([DoltHub docs](https://docs.dolthub.com/sql-reference/server/configuration))
- Beads chose Dolt for multi-writer concurrent access across `bd` processes + git-like sync across machines — neither applies to Sherpa's single-process design
- Turso/libSQL provides `BEGIN CONCURRENT` with 4x write throughput at 8 threads, API-compatible with better-sqlite3 — the natural upgrade path ([Turso blog](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes))

**Implications:**
- SQLite (WAL, better-sqlite3, BEGIN IMMEDIATE) remains correct. The hot path — authority check on every mutation — demands sub-millisecond latency.

### Vector 2: Existing MCP Coordination Server Tool APIs
**Question:** What exact tool APIs do existing MCP coordination servers expose? What patterns to adopt or avoid?
**Full report:** [iteration-1/vector-2-mcp-coordination-server-apis.md](iteration-1/vector-2-mcp-coordination-server-apis.md)

**Key discoveries:**
- **MCP Agent Mail** (~30+ tools): advisory file reservations with glob patterns, 3600s default TTL, symmetric glob matching, dual Git+SQLite persistence, pre-commit guard as only enforcement point. No heartbeat, no fencing tokens. ([GitHub](https://github.com/Dicklesworthstone/mcp_agent_mail))
- **mcp-beads-village** (27 tools): atomic `O_CREAT|O_EXCL` file locking, 600s TTL, exact paths only, all-exclusive reservations, `done()` auto-releases. No glob, no heartbeat, no orphan recovery. ([GitHub](https://github.com/LNS2905/mcp-beads-village))
- **multi-agent-coordination-mcp** (14 tools): file locking automatic via task status transitions (`in_progress` auto-locks, `completed` auto-unlocks), assignment algorithm skips conflicting files. No TTL — locks persist until manual change. ([GitHub](https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp))
- **SEP-1708** was about client-brokered filesystem access for remote servers, not multi-agent coordination; closed without merge
- **No existing server implements:** fencing tokens, heartbeat-based liveness, mandatory server-side authority enforcement, hierarchical authority, or a formal authority state machine

**Implications:**
- The gap Sherpa fills is specific and validated: enforced authority with fencing tokens at the mutation point. Agent Mail's advisory model is the right default; Beads Village's auto-release-on-done is a good UX pattern; multi-agent-coordination-mcp's implicit locking via task status is the closest precedent for Sherpa's implicit authority via task dispatch.

### Vector 3: The Chubby/ZooKeeper Lineage
**Question:** What API design patterns did 20 years of production distributed coordination services teach?
**Full report:** [iteration-1/vector-3-chubby-zookeeper-lineage.md](iteration-1/vector-3-chubby-zookeeper-lineage.md)

**Key discoveries:**
- **Chubby deliberately chose coarse-grained locks** because lock-acquisition rate is "only weakly related to the transaction rate of client applications" — decouples lock server load from client throughput ([Burrows, OSDI 2006](https://research.google.com/archive/chubby-osdi06.pdf))
- **Lock-delay** (default 1 minute): after holder failure, Chubby prevents acquisition for a configurable period — drains in-flight operations and prevents thundering herd
- **Sequencer** = Chubby's fencing token: (lock name + mode + generation number). Downstream servers call `CheckSequencer()` to reject stale operations
- **ZooKeeper's ephemeral nodes** auto-delete on session death — IS the heartbeat/orphan-detection mechanism. Sequential nodes with monotonic counters = fencing tokens
- **Jepsen proved etcd locks fail mutual exclusion** even in healthy clusters with short TTLs — fencing tokens are mandatory, not optional ([Jepsen](https://jepsen.io/analyses/etcd-3.4.3))
- **Consul lock-delay** default 15 seconds, directly citing the Chubby paper. Gossip-based failure detection scales without concentrating work
- **Advisory locks are the norm** across all four systems — Chubby chose advisory specifically because mandatory locks prevent debugging/admin access

**Implications:**
- Sherpa's single-process architecture eliminates distributed consensus entirely. Coarse-grained initiative/task-level authority (not file-level) maps to Chubby's design rationale. Lock-delay (15-30s) should be added to prevent thundering herd on authority release.

### Vector 4: Authority State Machine as MCP Tool Call Sequences
**Question:** What's the complete state machine connecting the six MCP authority tools?
**Full report:** [iteration-1/vector-4-authority-state-machine.md](iteration-1/vector-4-authority-state-machine.md)

**Key discoveries:**
- **Six states, not three:** UNASSIGNED, AUTHORITATIVE, AUTHORITY_LOSS_IMMINENT, TRANSITIONING, ORPHANED, EXPIRED. Azure Blob's 5-state model (Available, Leased, Expired, Breaking, Broken) was the closest production analog. ORPHANED (from coherence) is distinct from UNASSIGNED because it preserves progress data. ([Azure Lease API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob))
- **Azure Blob's Breaking state is AUTHORITY_LOSS_IMMINENT:** current holder retains write access during break period, no new holder can acquire, configurable 0-60s duration
- **17 state transitions mapped to MCP tool calls,** with 7 edge cases analyzed (concurrent transfers, crash during grace, stale writes, human override during active transfer)
- **Worker AUTHORITY_LOSS_IMMINENT checklist** (from K8s preStop + Temporal + Improbable): (1) stop accepting new work, (2) complete in-flight writes, (3) commit WIP to branch, (4) heartbeat progress data, (5) release subordinate authorities, (6) signal readiness
- **coherence's split authority** (State Authority + Input Authority) maps to Worker (can write) + Planner (can send directives)
- **Five permission levels mapped to artifact types:** SessionOwner (task defs), Transferable (implementation), RequestRequired (shared config), Distributable (activity log), None (roadmap — proposals only)

**Implications:**
- The state machine is the missing connective tissue between the MCP tool schemas and the coordination protocol. It defines not just what tools exist but the legal sequences of calls and what agents can do in each state.

### Vector 5: Heartbeat, Orphan Detection, and Adoption Protocol
**Question:** How to detect crashed agents, manage orphans, and adopt tasks?
**Full report:** [iteration-1/vector-5-heartbeat-orphan-adoption.md](iteration-1/vector-5-heartbeat-orphan-adoption.md)

**Key discoveries:**
- **Chubby's three-state model** (active → jeopardy → expired) with 45s grace period is directly applicable. Agent enters jeopardy when heartbeat TTL lapses; authority frozen but not revoked; grace period for recovery ([Burrows, OSDI 2006](https://research.google.com/archive/chubby-osdi06.pdf))
- **The 1/3 ratio** (heartbeat interval = 1/3 of session timeout) is canonical across ZooKeeper, Kafka, and etcd
- **Temporal's heartbeat-with-progress** payload survives worker failure — next worker calls `GetHeartbeatDetails()` to resume. This is the agent equivalent of "flush state to replication layer" ([Temporal docs](https://docs.temporal.io/encyclopedia/detecting-activity-failures))
- **Kubernetes failureThreshold=3** — three consecutive missed probes before declaring unhealthy. Critical for AI agents where a single missed heartbeat may just mean thinking
- **Implicit + explicit heartbeat hybrid:** any MCP tool call with valid fence token = implicit heartbeat. Dedicated `heartbeat_authority` for idle periods with progress payload
- **Recommended TTLs:** 5 min interactive, 2 min background, 30 min waiting-for-human, 1 min jeopardy grace
- **MCP ping is transport-level only** — detects connection failure but not application stalls. Application-level heartbeat via tool calls is required

**Implications:**
- Three-tier liveness: heartbeat TTL (early warning) + jeopardy grace (recovery window) + fencing tokens (safety net even when detection fails). The layered defense compensates for each mechanism's weaknesses.

## Synthesis

Five vectors converge on a protocol design that's more rigorous than any individual vector produced. The cross-cutting insights:

### 1. The Authority Gap Is Real, Specific, and Validated

Every existing MCP coordination server uses the same model: advisory intent signaling + TTL-based expiry + hope that agents cooperate. None implements server-side enforcement. None has fencing tokens. None has a formal state machine. The Jepsen proof that etcd locks (with short TTLs) fail mutual exclusion within minutes confirms that TTL + hope is not just incomplete — it's provably unsafe for correctness.

Sherpa's architecture resolves this uniquely: the MCP server is both lock manager AND resource layer. Since all mutations flow through it, fencing token validation happens at the point of mutation — the architecturally ideal position per Kleppmann. This is what distinguishes Sherpa from advisory systems. Advisory intent signaling (Agent Mail's philosophy) remains the default UX. Fencing token enforcement is the safety net underneath.

### 2. Coarse-Grained Authority Is Correct (Chubby Validates)

Google learned that coarse-grained locks (held for minutes to hours) work better than fine-grained locks (held for milliseconds) because they decouple lock server load from client transaction rate. For Sherpa:

- Authority is granted at **task scope** (coarse), not per-file-write (fine)
- Authority check is per-mutation but the check is cheap (SQLite index lookup, ~190ns)
- Authority acquisition/release is infrequent (once per task dispatch, not once per file write)
- This means the authority system's load is proportional to task count, not agent operation count

This validates the existing design of implicit authority via task dispatch. The authority system handles dozens of tasks, not thousands of file operations.

### 3. The Complete Protocol: 6 States, 17 Transitions, 3-Tier Liveness

The state machine emerging from all five vectors:

```
UNASSIGNED ──[dispatch_task / acquire_authority]──→ AUTHORITATIVE
     ↑                                                    │
     │                                                    ├──[transfer / timeout trigger]──→ AUTHORITY_LOSS_IMMINENT
     │                                                    │                                        │
     │                                                    ├──[release_authority]──────────→ (lock-delay) → UNASSIGNED
     │                                                    │                                        │
     │                                                    └──[heartbeat TTL expires]──→ JEOPARDY   │
     │                                                                                    │        │
     │                                                                                    │  ┌─────┘
     │                                                                                    ↓  ↓
     │                        ┌──────────── ORPHANED ←──[grace period expires / crash]─────┘
     │                        │               │
     │                        │               ├──[Planner reassigns / auto-adopt]──→ AUTHORITATIVE (new holder)
     │                        │               └──[reclaim (self-adopt)]──→ AUTHORITATIVE (same holder, new token)
     │                        │
     └────────────────────────┘ [cleanup / TTL expiry]
```

The three-tier liveness model (from Chubby + Kleppmann):
1. **Heartbeat TTL** — early warning. Implicit (any tool call) or explicit (dedicated heartbeat with progress).
2. **Jeopardy/grace period** — recovery window. Authority frozen, agent may recover. 1 minute default (from Chubby's 45s + margin for AI agents).
3. **Fencing tokens** — safety net. Even if tiers 1 and 2 fail, stale writes are rejected. The MCP server validates monotonic tokens on every mutation.

### 4. SQLite Is Correct; Dolt Solves a Different Problem

The 250x latency gap between in-process SQLite and Dolt-over-loopback is decisive for the hot path. But more fundamentally, Dolt and SQLite solve different problems:

| Dimension | SQLite (Sherpa) | Dolt (Beads) |
|-----------|----------------|--------------|
| Writers | 1 (single-process) | N (multi-process, multi-machine) |
| State lifetime | Ephemeral leases (minutes) | Persistent issues (weeks) |
| Merge need | None (single-writer) | Cell-level merge across branches |
| Audit trail | Append-only activity log | Full SQL diff history |
| Distribution | Local-first, npm-installable | Server-grade, operator-managed |

Sherpa should adopt Dolt's *ideas* (hash-based IDs, cell-level merge for structured data) without adopting Dolt itself. Turso/libSQL is the upgrade path if write concurrency ever matters.

### 5. Lock-Delay Is the Missing Mechanism

Chubby's lock-delay — a configurable pause between authority loss and new acquisition — was independently not present in any existing MCP coordination server. It solves two problems:

1. **In-flight operation draining:** A crashed agent may have MCP tool calls in transit. Lock-delay gives those calls time to arrive and be rejected (via fencing token), rather than allowing a new holder to start while stale calls are still in the network.
2. **Thundering herd prevention:** Without lock-delay, all waiting agents would race to acquire authority the instant it's released.

Recommended: 15-30 seconds lock-delay after unclean authority loss (crash, timeout). Zero delay after clean release.

### 6. The Worker Grace Period Checklist Is a Protocol, Not a Suggestion

Synthesizing K8s preStop hooks, Temporal heartbeat payloads, and the Improbable patent's AUTHORITY_LOSS_IMMINENT, the Worker grace period is a concrete 6-step protocol:

1. **Stop accepting new work** — deregister from task dispatch
2. **Complete in-flight writes** — finish the current file write, don't start new ones
3. **Commit WIP to branch** — `git add . && git commit -m "WIP: authority loss"` in the worktree
4. **Heartbeat progress data** — structured payload: `{files_modified: [...], last_commit_sha: "...", completion_estimate: 0.7, resume_point: "..."}`
5. **Release subordinate authorities** — if holding authority over sub-tasks, release them
6. **Signal readiness** — call `release_authority` or let the timeout complete the transfer

The progress data is the critical innovation from Temporal. It's what enables the next Worker to *resume* rather than *restart* — potentially saving an entire session of work.

### 7. Implicit Authority via Task Dispatch + Explicit Authority for Shared Artifacts

The two-track model, now with concrete details from all vectors:

**Implicit (common case):** `dispatch_task` → MCP server auto-acquires authority over `task.targets[]` → Worker receives `fence_token` in dispatch response → all mutations include `fence_token` → authority auto-renews on each tool call → `done()` auto-releases (Beads Village pattern)

**Explicit (shared artifacts):** Planner calls `acquire_authority("initiative:vedic-research")` → receives `fence_token` → holds for duration of planning work → calls `release_authority` when done. `RequestRequired` permission level (Unity pattern) means the current holder must consent before transfer.

This two-track model means most agents never directly interact with the authority API. Authority is infrastructure, not UX — like how most web developers never call `malloc`.

## All Sources

### Distributed Coordination Services
- [Burrows: The Chubby Lock Service (OSDI 2006)](https://research.google.com/archive/chubby-osdi06.pdf) — Google's coarse-grained lock service, sequencers, lock-delay
- [ZooKeeper Programmer's Guide](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html) — Ephemeral nodes, sequential nodes, watches, session management
- [ZooKeeper Recipes](https://zookeeper.apache.org/doc/r3.1.2/recipes.html) — Distributed lock recipe with ephemeral sequential nodes
- [etcd Concurrency API](https://etcd.io/docs/v3.6/dev-guide/api_concurrency_reference_v3/) — Lease-based locks, keepalive streaming
- [Jepsen: etcd 3.4.3](https://jepsen.io/analyses/etcd-3.4.3) — Proof that etcd locks fail mutual exclusion with short TTLs
- [Consul Lock API](https://developer.hashicorp.com/consul/docs/dynamic-app-config/sessions) — Chubby-inspired lock-delay, gossip failure detection

### Fencing Tokens & Correctness
- [Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — Fencing tokens, process pause problem, Redlock critique
- [Azure Blob Lease API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob) — 5-state lease model, Breaking state, Change operation
- [SyncGuard Fencing](https://kriasoft.com/syncguard/fencing) — 15-digit zero-padded fencing token implementation
- [FizzBee Formal Verification](https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/) — Fencing tokens insufficient without resource-layer enforcement

### Dolt & SQLite
- [DoltHub Storage Engine](https://docs.dolthub.com/architecture/storage-engine) — Prolly trees, content-addressable storage
- [DoltHub Benchmarks](https://docs.dolthub.com/sql-reference/benchmarks/latency) — Sysbench comparison with MySQL
- [DoltHub: How Dolt Got Fast](https://www.dolthub.com/blog/2025-12-12-how-dolt-got-as-fast-as-mysql/) — Optimization history
- [Turso Concurrent Writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) — libSQL BEGIN CONCURRENT, MVCC
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — Synchronous in-process SQLite, 1.2M ops/sec

### MCP Coordination Servers
- [MCP Agent Mail](https://github.com/Dicklesworthstone/mcp_agent_mail) — Advisory file leases, glob patterns, dual persistence
- [mcp-beads-village](https://github.com/LNS2905/mcp-beads-village) — Atomic locking, auto-release on done, 27 tools
- [multi-agent-coordination-mcp](https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp) — Implicit locking via task status transitions
- [dead-drop-teams](https://github.com/ai-janitor/dead-drop-teams) — Server-enforced inbox discipline, code ownership zones

### Authority Transfer Protocols
- [Improbable Patent US10878146](https://patents.google.com/patent/US10878146B2/en) — Four-state authority transfer, bounded timeout
- [coherence Authority Transfer](https://docs.coherence.io/manual/authority/authority-transfer) — Request/Steal/NotTransferable modes, orphan detection
- [Unity Netcode Ownership](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.10/manual/terms-concepts/ownership.html) — Five permission levels, ownership lock

### Task Orchestration
- [Temporal Failure Detection](https://docs.temporal.io/encyclopedia/detecting-activity-failures) — Heartbeat with progress payload
- [BullMQ Stalled Jobs](https://docs.bullmq.io/guide/workers/stalled-jobs) — Lock duration, stalled interval, maxStalledCount
- [Kubernetes Pod Termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination) — preStop hooks, grace period, SIGTERM→SIGKILL

### MCP Specification
- [MCP Spec Ping](https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/ping) — Transport-level liveness, not application-level
- [MCP Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) — Streamable HTTP, session management

## Proposals Generated

- `proposal.md` — "Game Authority as MCP Protocol: Concrete Tool API with State Machine, Heartbeat, and Fencing" — the complete coordination protocol design for Sherpa's MCP server

## Open Questions for Next Iteration

1. **Authority × git worktrees interaction** — If agents work in isolated worktrees (branches), does worktree isolation make file-level authority unnecessary for most operations? Authority may only matter at the merge point. Cross-ref `mcp-coordination-layer` open question #1.

2. **Schema design for the six-state machine** — SQLite tables that model UNASSIGNED/AUTHORITATIVE/AUTHORITY_LOSS_IMMINENT/JEOPARDY/ORPHANED/EXPIRED with efficient transition queries. Partial indexes for active-only leases. Cross-ref `authority-schema-design` branch seed.

3. **Progress data schema** — What structured data should `heartbeat_authority` carry? Minimum viable: `{files_modified, last_commit_sha, completion_estimate, resume_point}`. But how does the adopting Worker actually USE this data to resume?

4. **Conflict between lock-delay and fast reassignment** — Lock-delay (15-30s) conflicts with the desire for fast orphan adoption. Should lock-delay be zero when the Planner explicitly triggers reassignment (clean transfer) vs. positive only on crash detection (unclean)?

5. **MCP notification mechanism for authority state changes** — Resource subscriptions (`authority://{scope}`) can push updates, but few MCP clients implement subscriptions. Is polling `check_authority` sufficient in practice? Or does the MCP server need to inject authority notifications into the agent's tool call responses?
