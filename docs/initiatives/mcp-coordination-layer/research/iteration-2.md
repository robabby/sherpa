# Iteration 2 — 2026-03-12

## What We Already Knew

Iteration 1 established the core architecture: single-process Streamable HTTP MCP server + SQLite (WAL, better-sqlite3) + 6 authority tools + implicit authority via task dispatch + write-through file projection. MCP has no coordination primitives — all coordination is application-level tool logic. Open questions centered on worktree interaction, schema design, stateful/stateless trade-offs, persistence choice, and bootstrap.

## Research Vectors

### Vector 1: Minimal Tool Surface for Five Patterns
**Question:** Can the 6 authority tools be reduced? What's the smallest set that enables all five MMO patterns?
**Full report:** [iteration-2/vector-1-minimal-tool-surface.md](iteration-2/vector-1-minimal-tool-surface.md)

**Key discoveries:**
- Every production lease system (etcd, Consul, Azure Blob, Vault, ZooKeeper, Kubernetes, SyncGuard, Dapr) converges on **3 core operations: Acquire, Renew, Release** ([etcd lease API](https://etcd.io/docs/v3.4/learning/api/), [Azure Blob Lease](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob))
- `transfer_authority` merges into `acquire_authority` with a `transfer_from` parameter — single-process SQLite makes release+acquire atomic in one IMMEDIATE transaction, eliminating the race window that justifies Azure Blob's separate `Change` operation
- `heartbeat_authority` merges into implicit renewal — every mutation with a valid fence token resets the TTL (BullMQ/Temporal pattern). Explicit `authority_renew` covers edge cases
- `override_authority` moves to Studio UI/CLI as an admin action, not an agent-facing MCP tool (Azure Blob's Break model)
- `check_authority` can be an MCP resource (`authority://{scope}`) rather than a tool, reducing tool count further
- Backpressure (Pattern 5) is **server-side policy**, not a tool — EVE TiDi, BullMQ rate limiting, HTTP 429 are all server-controlled
- Prevention→Compensation (Pattern 3) is **implicit architecture**, not explicit tools — prevention = task dispatch, detection = `expectedVersion`, compensation = Judge + rebase
- GitHub Copilot measured 2-5% resolution improvement when reducing from 40 to 13 tools; every tool costs context tokens and degrades decisions ([GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-were-making-github-copilot-smarter-with-fewer-tools/))
- All 3 existing MCP coordination servers (Agent Mail, Beads Village, Multi-Agent Coord) use exactly 3 locking tools each

**Implications:**
- The 6-tool authority surface reduces to **3 tools + 1 resource**: `authority_acquire`, `authority_renew`, `authority_release` + `authority://{scope}` resource
- Two of five MMO patterns (backpressure, prevention→compensation) require zero dedicated tools — they're server behavior and architectural choices
- Tool minimalism is a first-class design principle, not just aesthetics

### Vector 2: Stateful vs Stateless Architecture
**Question:** In-memory state (fast, lost on restart) vs SQLite on every call (slower, durable)?
**Full report:** [iteration-2/vector-2-stateful-vs-stateless.md](iteration-2/vector-2-stateful-vs-stateless.md)

**Key discoveries:**
- Every production MCP coordination server (Agent Mail, Beads Village, Engram) reads from persistent storage on every call — none cache authority state in memory
- SQLite indexed reads with better-sqlite3: **3-7 microseconds**, 440K reads/sec on M1. Sherpa needs ~20 checks/sec. We'd use 0.005% of SQLite's capacity
- JavaScript `Map.get()` is ~500ns — only 6-14x faster than SQLite. Both are microsecond-scale and irrelevant at our throughput
- **SQLite's page cache IS the in-memory cache.** WAL mode + mmap keeps hot rows in memory automatically. Cloudflare Durable Objects uses the same architecture: "storage lives in the same thread as the application" ([Cloudflare Blog](https://blog.cloudflare.com/sqlite-in-durable-objects/))
- Cold start: SQLite opens and serves first indexed query in single-digit ms. Authority state survives restarts
- MCP protocol is moving toward stateless transport (cookie-like sessions) — our design aligns

**Implications:**
- **No application-level cache.** SQLite-as-truth with no in-memory caching layer. The complexity of cache invalidation exceeds the zero performance benefit
- The Durable Objects analogy is precise: single-threaded process, SQLite in-process, page cache handles hot data, writes are durable

### Vector 3: Claude Code Native Features
**Question:** What coordination does Claude Code already provide? What must the MCP server add?
**Full report:** [iteration-2/vector-3-claude-code-native-features.md](iteration-2/vector-3-claude-code-native-features.md)

**Key discoveries:**
- **Worktrees**: First-class support (`--worktree`, `EnterWorktree`, `isolation: worktree` for subagents). Provides physical file isolation but **zero cross-agent awareness**
- **Task tools** (TaskCreate/Update/List/Get): DAG dependencies, file-locking for claiming, but no file-level authority, no fencing tokens, no cross-session persistence
- **Hooks**: 18 lifecycle events, 4 types including **HTTP hooks** — the enforcement mechanism. `PreToolUse (Edit|Write)` → HTTP POST to MCP → check authority → allow/deny. Deterministic, not advisory
- **Agent Teams**: Filesystem-based (JSON files), file locking for task claiming. Docs explicitly warn: "Two teammates editing the same file leads to overwrites"
- **MCP transport**: stdio spawns per-connection (no shared state). **Streamable HTTP is mandatory** for shared coordination state
- **`session-collab-mcp`** exists on GitHub as a third-party MCP solving exactly this problem — confirms the gap is real
- **SessionStart hook fires on compact** — critical for re-injecting coordination context after context compression

**Implications:**
- Three-layer architecture: **MCP server provides state** (authority, versions, initiatives) + **Claude Code hooks provide enforcement** (PreToolUse checks authority) + **CLAUDE.md provides conventions** (static behavioral rules)
- The MCP server must provide: authority/lease management, cross-session shared state, fencing tokens, file-to-agent mapping, write-through projection, initiative governance
- Hooks are the bridge — they turn advisory coordination into deterministic enforcement without relying on the LLM following instructions

### Vector 4: Persistence Layer (SQLite vs Dolt vs Git-only vs Hybrid)
**Question:** Is SQLite still the right choice given Beads' adoption of Dolt?
**Full report:** [iteration-2/vector-4-persistence-layer.md](iteration-2/vector-4-persistence-layer.md)

**Key discoveries:**
- Dolt reached MySQL sysbench parity (0.99x) but requires a ~100MB Go server binary — no embedded mode for Node.js ([DoltHub Blog](https://www.dolthub.com/blog/2025-12-04-dolt-is-as-fast-as-mysql/))
- Beads removed SQLite entirely for Dolt. The operational overhead they built is a cautionary tale: auto-start, port conflicts, shared server mode, circuit breakers
- Git-only (Agent Mail model) has **no ACID guarantees** between git writes and SQLite index. Claude Code itself hits stale `.git/index.lock` issues
- **libSQL is the confirmed upgrade path**: drop-in better-sqlite3 replacement (302K weekly npm downloads), embedded replicas, eventual MVCC when Turso stabilizes
- cr-sqlite is irrelevant for single-process (solves multi-writer; we have no multi-writer contention)
- Temporal validates the pattern: SQLite for dev/single-process, Postgres for production scale
- **Cord** (June Kim) independently validates SQLite-backed MCP coordination for multi-agent task trees in ~500 lines ([june.kim/cord](https://www.june.kim/cord))
- Operational complexity is the deciding factor: `npm install` cannot require a 100MB Go binary

**Implications:**
- SQLite (WAL, better-sqlite3) is confirmed. Dolt's killer feature (cell-level merge) solves data collaboration, not authority state — authority records need ACID, not merge
- Upgrade path: better-sqlite3 → libsql (same API) → embedded replicas → Turso MVCC
- Adopt Dolt lessons without adopting Dolt: hash-based IDs for conflict-free creation, circuit breaker pattern for agent-facing services

### Vector 5: The Bootstrap Problem
**Question:** How does the first agent discover system state? The MMO "late join" equivalent.
**Full report:** [iteration-2/vector-5-bootstrap-problem.md](iteration-2/vector-5-bootstrap-problem.md)

**Key discoveries:**
- Game servers use the **zero-baseline snapshot**: delta-encode current state against all-zeros, effectively a full dump on first connect. One-time cost, then deltas ([Gaffer on Games](https://gafferongames.com/post/snapshot_compression/))
- Interest management scopes the payload: a Worker needs ~200 tokens (task + authority + blockers), a Planner needs ~500 tokens (all tasks + authority map)
- MCP `instructions` field in initialize response is static, not dynamic — good for "call get_dashboard" instruction, not for the state itself
- **SessionStart hook fires on compact too** — fires on: startup, resume, clear, compact. Only command hooks supported. stdout is injected as context
- Handoff protocol pattern: "save what was in progress, what was decided, what needs attention next — not everything"
- CA-MCP paper proposes Shared Context Store as "centralized blackboard" — SQLite MCP server IS this blackboard
- Lease expiration handles stale authority automatically — crashed agents' leases expire via reaper

**Implications:**
- **Three-layer bootstrap**: (1) SessionStart hook reads cached `.sherpa/state/dashboard.json` — fast, possibly stale; (2) Agent calls `get_dashboard` MCP tool — fresh, role-scoped; (3) Resource subscriptions for ongoing deltas
- The bootstrap tool replaces the zero-baseline snapshot. Subsequent updates use MCP resource subscriptions (the delta channel)
- Agent role determines bootstrap payload size via DOI model from MMO patterns research

## Synthesis

Five vectors converge on a significantly sharper architecture than iteration 1. The cross-cutting insights:

### 1. The Tool Surface is 4 Tools + 1 Resource, Not 6 Tools + 5 Pattern-Specific Tools

The most important finding: the five MMO patterns do NOT require five categories of tools. Two patterns (backpressure, prevention→compensation) are server-side behavior with zero tool surface. One pattern (replication layer) is the architectural decision that all mutations flow through the MCP server. Only two patterns (single-writer authority, bounded authority transfer with fencing) require dedicated tools — and those collapse into 3 tools + 1 resource:

| Tool/Resource | Implements | MMO Pattern |
|---------------|-----------|-------------|
| `authority_acquire` | Lease acquisition, transfer (via `transfer_from`), fencing token generation | Single-Writer + Bounded Transfer |
| `authority_renew` | Explicit TTL extension (rare — mutations implicitly renew) | Single-Writer |
| `authority_release` | Explicit lease release | Single-Writer |
| `authority://{scope}` resource | Authority state observation, subscriptions | Replication Layer |
| `get_dashboard` | Role-scoped system state for bootstrap | Bootstrap |
| Server-side: backpressure | HTTP 429, `retry_after_ms`, TTL extension under load | Time Dilation |
| Server-side: `expectedVersion` | Optimistic concurrency on all mutations | Prevention→Compensation |

That's **4 tools total** (3 authority + 1 dashboard) plus 1 resource and server-side policies. Versus the 6 authority tools + unknown pattern tools from iteration 1. Fewer tools = better agent performance (GitHub Copilot data: 2-5% resolution improvement from tool reduction).

### 2. The Three-Layer Architecture: State / Enforcement / Convention

The clearest new insight is the separation of concerns between three systems:

| Layer | System | What It Provides | How It Works |
|-------|--------|-----------------|--------------|
| **State** | MCP coordination server | Authority registry, version tracking, initiative metadata, task state | SQLite-backed, role-scoped queries |
| **Enforcement** | Claude Code hooks | Deterministic authority checks on every file edit | PreToolUse HTTP hook → MCP server → allow/deny |
| **Convention** | CLAUDE.md + rules | Behavioral constraints, workflow patterns, naming conventions | Auto-loaded into agent context |

This matters because hooks solve the enforcement problem that iteration 1 left implicit. In iteration 1, the MCP server was both the state store AND the enforcement point — but enforcement only worked if agents called the authority tools before editing. With hooks, enforcement is **deterministic and non-bypassable**: the PreToolUse hook fires on every Edit/Write tool use, POSTs to the MCP server, and blocks unauthorized edits via exit code 2 / `permissionDecision: deny`. The agent never gets a chance to write to a file it doesn't have authority over.

This eliminates the "what if the agent forgets to check authority?" failure mode entirely.

### 3. SQLite-as-Truth is Confirmed from Every Angle

Vector 2 proved in-memory caching is unnecessary (3-7μs reads, 0.005% of capacity used). Vector 4 proved alternatives are worse (Dolt requires server process, git-only lacks ACID, cr-sqlite solves a non-problem). The Cloudflare Durable Objects model is the precise analogy: single-threaded, SQLite in-process, page cache handles hot data, writes are durable. No application cache needed.

The upgrade path is concrete: better-sqlite3 → libsql (same API, 302K weekly downloads) → embedded replicas → Turso MVCC when stable. No breaking changes at any step.

### 4. Bootstrap is a Solved Problem with a Clean Three-Layer Protocol

The bootstrap problem has a precise solution:

1. **SessionStart hook** (fires on startup, resume, clear, compact): Shell command reads `.sherpa/state/dashboard.json`, a file regenerated by the MCP server on every mutation. Fast, possibly stale. Injected as context via stdout.
2. **`get_dashboard` tool** (agent's first action): Returns fresh, role-scoped state — tasks, authority, blockers, activity.
3. **Resource subscriptions** (ongoing): Subscribe to `authority://`, `tasks://`, `activity://` for push-based deltas.

This maps directly to game networking: zero-baseline snapshot (dashboard) → delta encoding (subscriptions). The DOI model scopes the payload: Workers get ~200 tokens, Planners get ~500.

### 5. Implicit Authority via Task Dispatch + Hooks = Most Agents Never Touch Authority Tools

The picture that emerges: most Workers never call `authority_acquire` directly. Here's the flow:

1. Planner dispatches task with target files → MCP server auto-acquires authority for those files → Worker receives task
2. Worker calls `Edit` on a file → PreToolUse hook fires → HTTP POST to MCP server → server checks authority table → `permissionDecision: allow`
3. Worker completes task → authority auto-released (or explicitly via `authority_release`)

The Worker never interacts with authority tools. Authority is infrastructure, not workflow. Only Planners working on shared artifacts need explicit `authority_acquire`.

## All Sources

### MCP & Coordination Servers
- [MCP Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18) — Current spec
- [MCP Lifecycle](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle) — Initialize handshake, instructions field
- [MCP Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) — Subscriptions, annotations
- [MCP Transport Future](https://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/) — Stateless transport direction
- [Auth0: MCP Streamable HTTP](https://auth0.com/blog/mcp-streamable-http/) — SSE deprecated, Streamable HTTP rationale
- [MCP Agent Mail](https://github.com/Dicklesworthstone/mcp_agent_mail) — Advisory leases, Git+SQLite
- [MCP Agent Mail Rust](https://github.com/Dicklesworthstone/mcp_agent_mail_rust) — Commit coalescer, stress tests
- [Multi-Agent Coordination MCP](https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp) — Task + file lock coordination
- [session-collab-mcp](https://github.com/) — Third-party WIP file registry (confirms gap)
- [Cord (June Kim)](https://www.june.kim/cord) — SQLite MCP coordination in ~500 lines
- [Ruflo/Claude Flow](https://github.com/ruvnet/ruflo) — SQLite blackboard pattern
- [CA-MCP paper](https://arxiv.org/html/2601.11595v2) — Shared Context Store as coordination blackboard

### Claude Code
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) — 18 events, 4 types, exit code semantics
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide) — HTTP hooks, PreToolUse authority checks
- [Claude Code Common Workflows](https://code.claude.com/docs/en/common-workflows) — Worktree support
- [Claude Code Sub-agents](https://code.claude.com/docs/en/sub-agents) — Worktree isolation, MCP scoping
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams) — Task claiming, file locking
- [VentureBeat: Tasks Update](https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across) — TaskCreate/Update
- [alexop.dev: Agent Teams](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/) — JSON file architecture

### Lease/Coordination Systems
- [etcd Lease API](https://etcd.io/docs/v3.4/learning/api/) — Grant/KeepAlive/Revoke
- [Azure Blob Lease](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob) — 5-operation model
- [Consul Session API](https://developer.hashicorp.com/consul/api-docs/session) — Create/Renew/Destroy
- [Vault Lease](https://developer.hashicorp.com/vault/docs/concepts/lease) — TTL-based lifecycle
- [SyncGuard Fencing](https://kriasoft.com/syncguard/fencing) — Fence token implementation
- [Dapr Lock Proposal](https://github.com/dapr/dapr/issues/3549) — Minimal lock API
- [BullMQ Rate Limiting](https://docs.bullmq.io/guide/rate-limiting) — Implicit heartbeat via work

### Tool Design
- [GitHub: Smarter with Fewer Tools](https://github.blog/ai-and-ml/github-copilot/how-were-making-github-copilot-smarter-with-fewer-tools/) — Tool reduction → better resolution
- [Block MCP Playbook](https://engineering.block.xyz/blog/blocks-playbook-for-designing-mcp-servers) — Workflow-based design
- [Docker MCP Best Practices](https://www.docker.com/blog/mcp-server-best-practices/) — Tools as macros
- [Klavis AI MCP Patterns](https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents) — Less is more

### SQLite & Persistence
- [Cloudflare: SQLite in Durable Objects](https://blog.cloudflare.com/sqlite-in-durable-objects/) — In-process SQLite architecture
- [marending.dev: SQLite benchmarks](https://marending.dev/notes/sqlite-benchmarks/) — 440K reads/sec on M1
- [DoltHub: Dolt Performance](https://www.dolthub.com/blog/2025-12-04-dolt-is-as-fast-as-mysql/) — MySQL parity but server required
- [Beads DeepWiki](https://deepwiki.com/steveyegge/beads) — Dolt adoption, operational overhead
- [libsql npm](https://www.npmjs.com/package/libsql) — Drop-in better-sqlite3 replacement
- [Temporal Persistence](https://docs.temporal.io/temporal-service/persistence) — SQLite for dev, Postgres for prod
- [BugSink: Single-Writer](https://www.bugsink.com/blog/database-transactions/) — Ingestion/digestion separation

### Game Networking & Bootstrap
- [Gaffer on Games: Snapshot Compression](https://gafferongames.com/post/snapshot_compression/) — Zero-baseline snapshot
- [Quake 3 Network Model](https://fabiensanglard.net/quake3/network.php) — Delta encoding against zeros
- [Gaffer on Games: State Synchronization](https://gafferongames.com/post/state_synchronization/) — Priority accumulator
- [Dynetis: Interest Management](https://www.dynetisgames.com/2017/04/05/interest-management-mog/) — Zone-based AOI
- [Redwood MMO: Persistence](https://redwoodmmo.com/blog/persistence-for-ephemeral-game-servers) — Crash recovery patterns

### Agent Recovery
- [DEV: Persistence Patterns for AI Agents](https://dev.to/aureus_c_b3ba7f87cc34d74d49/persistence-patterns-for-ai-agents-that-survive-restarts-59ck) — Three-layer persistence
- [Beads Recovery](https://startaitools.com/posts/building-post-compaction-recovery-for-ai-agent-workflows-with-beads/) — Git-as-persistence
- [Redis: AI Agent Memory](https://redis.io/blog/ai-agent-memory-stateful-systems/) — External memory
- [Koog: Agent Persistence](https://docs.koog.ai/agent-persistence/) — Checkpoint/rollback

## Proposals Generated

- Updated `proposal.md` — Revised tool surface (6 → 4 tools + 1 resource), added three-layer architecture (state/enforcement/convention), added bootstrap protocol, confirmed SQLite, added Claude Code hook integration

## Open Questions for Next Iteration

1. **Hook configuration bootstrapping** — How does the coordination MCP server install/configure the PreToolUse HTTP hook in Claude Code's settings? Can it be automated via `sherpa init`, or must users configure it manually? This is the adoption friction question.

2. **Agent identity across sessions** — How does the MCP server identify which agent is which? Claude Code sessions don't have stable IDs. Does the server assign UUIDs? Does the SessionStart hook pass an identity? How does authority map to agents that restart?

3. **`get_dashboard` schema design** — What exactly does the role-scoped dashboard return? Concrete JSON schema for Worker vs Planner vs Judge bootstrap payloads. What's the token budget for each?

4. **Mutation tools beyond authority** — Iteration 2 focused on authority tools. But the MCP server also needs tools for task management, initiative lifecycle, and state mutations. What's the full tool surface when you add those? Can we stay under 10 total tools?

5. **Hook latency and offline resilience** — If the MCP server is down, the PreToolUse HTTP hook will fail. Should hooks fail-open (allow edits, log) or fail-closed (block all edits)? What's the acceptable latency budget for a synchronous authority check on every file edit?
