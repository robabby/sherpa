# Minimal MCP Tool Surface for Five MMO-Derived Coordination Patterns

**Date:** 2026-03-12
**Research type:** Cross-system comparative analysis + MCP tool surface optimization
**Question:** What is the minimal MCP tool surface that implements all five MMO-derived coordination patterns? Can the 6 proposed authority tools be reduced?

---

## Key Discoveries

### 1. The Universal Lease Primitive is 3 Operations, Not 5 or 6

Every production coordination system converges on a core of **3 lease operations**:

| System | Acquire | Renew | Release | Transfer | Break | Check |
|--------|---------|-------|---------|----------|-------|-------|
| **etcd** | LeaseGrant | LeaseKeepAlive | LeaseRevoke | — | — | LeaseTimeToLive |
| **Azure Blob** | Acquire | Renew | Release | Change | Break | (via headers) |
| **Consul** | Create | Renew | Destroy | — | — | Info/Read |
| **ZooKeeper** | create() | — (ephemeral) | delete() | — | — | getChildren() |
| **Vault** | (implicit) | Renew | Revoke | — | — | Lookup |
| **Kubernetes** | Create | Update renewTime | Delete | — | — | Get |
| **SyncGuard** | acquire() | extend() | release() | — | — | lookup() |
| **Dapr (proposed)** | TryLock | — (phase 2) | Unlock | — | — | — |

**The irreducible minimum is: Acquire, Renew, Release.** ([etcd lease API](https://etcd.io/docs/v3.4/learning/api/), [Azure Blob Lease](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob), [Consul Session API](https://developer.hashicorp.com/consul/api-docs/session), [Vault Lease](https://developer.hashicorp.com/vault/docs/concepts/lease), [SyncGuard Fencing](https://kriasoft.com/syncguard/fencing))

- **Transfer is NOT a universal operation.** Only Azure Blob has `Change`, and it exists specifically because release+acquire has a race window where another client could steal the lease. In Sherpa's single-process SQLite architecture, a transaction-wrapped release+acquire is atomic — no race window exists. Transfer can be implemented as a server-side transaction within `acquire_authority` (passing `transfer_from` parameter) rather than a separate tool.

- **Check/Query is read-only.** It's an observation operation, not a coordination primitive. Every system provides it, but it can be a resource (MCP `authority://` resource with subscriptions) rather than a tool. Resources are cheaper in MCP context budgets than tools.

- **Break (override) is an admin operation**, not part of the agent coordination surface. Azure Blob's Break requires no lease ID — any authorized request can break any lease. In Sherpa, this maps to a human-only action in Studio UI or CLI, not an MCP tool that agents invoke.

### 2. Heartbeat Can Be Implicit — Tool Calls Renew Leases

- **Dapr's distributed lock proposal** explicitly defers heartbeat to phase 2, noting it's "potentially controversial." The simpler alternative: set a TTL and rely on client-side renewal. ([Dapr Lock API proposal](https://github.com/dapr/dapr/issues/3549))

- **BullMQ** auto-renews job locks at `lockRenewTime` (half of `lockDuration`). Workers don't call a separate heartbeat — the queue framework handles it. ([BullMQ rate limiting](https://docs.bullmq.io/guide/rate-limiting))

- **Temporal** uses `Start-To-Close Timeout` with worker-initiated heartbeats that carry progress payloads. The heartbeat is a side-effect of useful work, not a standalone operation. ([Temporal worker performance](https://docs.temporal.io/develop/worker-performance))

- **Implication for Sherpa:** Every MCP tool call from an agent that includes a valid `fence_token` implicitly renews the authority lease. A separate `heartbeat_authority` tool is unnecessary if mutations serve as heartbeats. For long-read-only periods (agent reasoning without tool calls), the TTL should be generous enough (30 min interactive, 10 min background) that explicit heartbeats are rarely needed. If needed, `authority_renew` already serves this purpose.

### 3. Backpressure is Server-Side Policy, Not a Client Tool

No production system exposes backpressure as a client-callable tool:

- **EVE Online's Time Dilation** is entirely server-controlled. The server monitors its tasklet queue depth and dynamically adjusts the game clock speed from 100% down to 10%. Clients perceive it implicitly through slowed animations. No client API exists to request or adjust dilation. ([EVE Online TiDi](https://www.eveonline.com/news/view/introducing-time-dilation-tidi))

- **BullMQ** implements backpressure via server-side rate limiting on the queue. Workers receive rate-limited jobs from the queue; they don't call a backpressure API. When a worker encounters a 429 response from a downstream service, it calls `worker.rateLimit(duration)` — but this is an internal framework method, not exposed to job authors. ([BullMQ rate limiting](https://docs.bullmq.io/guide/rate-limiting))

- **Temporal** manages backpressure through slot suppliers on workers. The server controls task dispatch rate; workers control their concurrency via slot strategies. Neither exposes a "slow down" API to workflow authors. ([Temporal worker performance](https://docs.temporal.io/develop/worker-performance))

- **LLM API providers** (OpenAI, Anthropic) use HTTP 429 + `RateLimit-*` headers + exponential backoff. Backpressure is communicated through standard HTTP response codes, not custom tools. ([Rate Limiting and Backpressure for LLM APIs](https://dasroot.net/posts/2026/02/rate-limiting-backpressure-llm-apis/))

- **For Sherpa:** Backpressure should be implemented as server-side behavior in the MCP coordination server:
  1. **Response-level signaling**: Include `retry_after_ms` in tool responses when the server is overloaded
  2. **Queue depth monitoring**: Track pending authority requests; when queue exceeds threshold, increase TTLs (slow down authority cycling) and delay task dispatch
  3. **HTTP 429 on the Streamable HTTP endpoint**: Standard backpressure for the transport layer
  4. **No dedicated backpressure tool**

### 4. The Prevention→Compensation Spectrum is Implicit Architecture, Not Explicit Tools

The spectrum is not something agents interact with — it's how the server is designed:

- **Prevention layer** = Task dispatch with scope isolation + advisory file leases. Agents don't call a "prevent conflict" tool; they call `acquire_authority` or receive implicit authority via task dispatch. The prevention is the architecture itself.

- **Detection layer** = Optimistic concurrency via `expectedVersion` on mutations. The MCP server rejects stale writes with `{error: "VERSION_CONFLICT", hint: "Re-read the resource and retry with current version"}`. This is built into every write tool, not a separate tool.

- **Compensation layer** = Judge arbitration + git rebase. When a conflict is detected post-hoc (e.g., at PR merge time), the Judge role decides how to resolve it. This is a workflow convention, not an MCP tool.

- **Multi-Agent Coordination MCP** (AndrewDavidRivers) implements this implicitly: `get_next_todo_item` prevents conflicts by checking file locks before assignment (prevention); `update_todo_status` auto-locks/unlocks files (enforcement); the audit trail enables post-hoc analysis (detection). No explicit spectrum tools exist. ([Multi-Agent Coordination MCP](https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp))

- **tick-md** similarly has `tick_claim` (prevention via claiming), `tick_done` with auto-unblocking (enforcement), and git-backed history (detection). No spectrum tools. ([tick-md](https://purplehorizons.io/blog/tick-md-multi-agent-coordination-markdown))

### 5. Existing MCP Coordination Servers Validate 3-4 Tool Minimums for Locking

From the iteration-2 tool API analysis, the locking primitives across all known MCP coordination servers:

| Server | Reserve/Acquire | Renew | Release | Check | Total Lock Tools |
|--------|----------------|-------|---------|-------|-----------------|
| MCP Agent Mail | `file_reservation_paths` | `renew_file_reservations` | `release_file_reservations` | (via query) | **3** |
| Beads Village | `reserve` | — (TTL only) | `release` | `reservations` | **3** |
| Multi-Agent Coord | `lock_files` | — (no TTL) | `unlock_files` | `check_file_locks` | **3** |

Every server arrives at 3 tools for the locking concern. The check/query operation is sometimes a separate tool, sometimes folded into a resource or status endpoint.

### 6. Tool Count Directly Impacts Agent Performance

- **GitHub Copilot** reduced from 40 to 13 core tools, measuring a 2-5 percentage point improvement in resolution rate and 400ms reduction in response latency. ([GitHub Blog: Smarter with Fewer Tools](https://github.blog/ai-and-ml/github-copilot/how-were-making-github-copilot-smarter-with-fewer-tools/))

- **Block (Square)** evolved their Linear MCP server from 30+ endpoint-mirroring tools down to consolidated query tools, following the principle "Design top-down from workflows, not bottom-up from API endpoints." ([Block's MCP Playbook](https://engineering.block.xyz/blog/blocks-playbook-for-designing-mcp-servers))

- **Docker's MCP best practices** recommend treating tools as "macros" — single tools that chain multiple internal operations. ([Docker MCP Best Practices](https://www.docker.com/blog/mcp-server-best-practices/))

- **Klavis AI's "Less is More" patterns** identify workflow-based design (single tools for complete workflows) and progressive discovery (staged tool exposure) as key strategies. Tool definitions consume 5.9% of Claude Code's context window. ([Klavis AI MCP Patterns](https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents))

- **Implication:** Sherpa's coordination server should expose the absolute minimum tool surface. Every additional tool costs context tokens and degrades agent decision-making accuracy.

### 7. Fencing Tokens Must Be Integral to Acquire, Not a Separate Concern

- **Kleppmann's core argument**: A lock service without fencing tokens provides no correctness guarantee. The fencing token must be a monotonically increasing number returned by the lock service on every successful acquisition. The protected resource must reject writes carrying stale tokens. ([Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html))

- **SyncGuard** returns the fence token directly from `acquire()`: `{ok: true, fence: "000000000000001", lockId: "..."}`. No separate "get fencing token" operation. ([SyncGuard Fencing](https://kriasoft.com/syncguard/fencing))

- **Sherpa implication**: `acquire_authority` returns the fence token. Every subsequent mutation tool accepts `fence_token` as a parameter. The MCP server validates it atomically within the SQLite transaction. No separate fencing tool needed.

### 8. Azure Blob's "Change" Operation Exists Only Because of Multi-Process Race Conditions

Azure Blob's `Change` operation atomically swaps the lease ID without releasing the lease. This exists because release+acquire as two separate HTTP requests would create a window where another client could steal the lease.

In Sherpa's single-process SQLite architecture with `BEGIN IMMEDIATE` transactions, transfer_authority can be implemented as:
```sql
BEGIN IMMEDIATE;
-- Verify current holder
-- Release old lease
-- Acquire new lease with incremented fence_token
-- All in one transaction — no race window
COMMIT;
```

A separate `transfer_authority` tool is unnecessary. Instead, `acquire_authority` can accept an optional `transfer_from_token` parameter that atomically validates the current holder's token, releases their lease, and grants a new one — all within a single tool call and a single SQLite transaction.

---

## Proposed Minimal Tool Surface: 4 Tools

Based on all evidence, the 6 proposed authority tools can be reduced to **4 MCP tools** covering all 5 MMO patterns:

### The 4 Tools

| Tool | Purpose | MMO Pattern(s) Served |
|------|---------|----------------------|
| `authority_acquire` | Request/transfer authority over a scope. Returns fence token. Optionally transfers from another holder atomically. | Pattern 1 (Single-Writer), Pattern 4 (Bounded Transfer + Fencing) |
| `authority_release` | Explicitly release authority. Returns released scope. | Pattern 1 (Single-Writer) |
| `authority_renew` | Extend lease TTL. Also serves as explicit heartbeat when implicit renewal via mutations isn't sufficient. | Pattern 1 (Single-Writer) |
| `authority_status` | Query authority state for one or more scopes. Who holds what, fence tokens, expiry times. | Pattern 2 (Replication Layer — observability) |

### What Was Eliminated

| Original Tool | Disposition | Rationale |
|--------------|------------|-----------|
| `transfer_authority` | **Merged into `authority_acquire`** | Transfer = release + acquire in one transaction. `authority_acquire` accepts optional `transfer_from` parameter. Single-process SQLite makes this atomic without a separate operation. |
| `heartbeat_authority` | **Merged into `authority_renew` + implicit renewal** | Every mutation tool call that includes a valid fence token implicitly renews the lease. `authority_renew` serves as explicit heartbeat when needed. No separate heartbeat concept required. |
| `override_authority` | **Moved to server-side admin action** | Human-only break operation. Exposed via Studio UI and `sherpa` CLI, not as an MCP tool. Agents should never break each other's leases. Azure Blob's `Break` is similarly an admin operation. |
| `check_authority` | **Renamed to `authority_status` and optionally moved to MCP Resource** | Read-only observation. Can be implemented as MCP resource `authority://{scope}` with subscription support, reducing the tool count to 3. Keeping as tool for now since MCP resource subscriptions aren't universally supported by clients. |

### How Each MMO Pattern Maps

**Pattern 1 — Single-Writer Authority:**
- `authority_acquire` enforces exactly-one-writer via exclusive lease grants
- `authority_release` frees scope for next writer
- `authority_renew` (explicit) + mutation-based implicit renewal maintains leases
- `authority_status` provides observability

**Pattern 2 — Replication Layer:**
- ALL mutations route through the MCP server (by design — it's the only writer)
- Every mutation validates fence tokens server-side
- `authority_status` enables agents to observe the coordination state
- MCP resource subscriptions (`authority://{scope}`) push state changes to connected agents

**Pattern 3 — Prevention→Detection→Compensation:**
- **Prevention**: Task dispatch auto-acquires authority (implicit `authority_acquire`). Agents call `authority_status` before editing shared artifacts.
- **Detection**: `expectedVersion` parameter on all write tools. Server rejects stale writes with version conflict error.
- **Compensation**: Judge role + git rebase. Not a tool — a workflow convention.
- No dedicated tools needed. The spectrum is embedded in the architecture.

**Pattern 4 — Bounded Authority Transfer with Fencing Tokens:**
- `authority_acquire` returns monotonic fence token on every grant
- Fence token is a required parameter on all write tools
- Server rejects mutations with stale tokens (token < current max for scope)
- Transfer: `authority_acquire(scope, transfer_from: old_token)` atomically validates + releases + grants with new token

**Pattern 5 — Backpressure (Time Dilation):**
- Server-side policy, not a tool. Implemented as:
  - `retry_after_ms` field in tool responses when server is overloaded
  - HTTP 429 on the Streamable HTTP transport endpoint
  - Automatic TTL extension during overload (slowing authority cycling)
  - Task dispatch rate throttling (server delays `task_dispatch` responses)

### Implicit Authority via Task Dispatch (No Additional Tools)

When the Planner dispatches a task, the MCP server auto-acquires authority over the task's target files for the assigned worker. This is a server-side behavior within the task dispatch tool, not a separate authority tool call. The worker receives the fence token in the dispatch response:

```
task_dispatch(task_id, agent_id) → {
  task: {...},
  authority: {
    fence_token: "000000000000042",
    scopes: ["file:docs/initiatives/vedic-research/plan.md"],
    expires_at: "2026-03-12T15:30:00Z"
  }
}
```

---

## Comparison with Prior Art

### How Sherpa's 4 Tools Compare to Coordination Systems

| System | Locking Tools | Sherpa Equivalent |
|--------|--------------|-------------------|
| etcd | 3 (Grant, KeepAlive, Revoke) + query | 4 (acquire, renew, release, status) |
| Azure Blob | 5 (Acquire, Renew, Change, Release, Break) | 4 (Change merged into acquire; Break is admin-only) |
| Consul | 3 (Create, Renew, Destroy) + query | 4 (identical mapping) |
| Vault | 3 (Renew, Revoke, Lookup) | 4 (acquire is implicit in Vault) |
| SyncGuard | 3 (acquire, release, extend) + lookup | 4 (identical mapping) |
| MCP Agent Mail | 3 (reserve, renew, release) | 4 (+ status tool) |
| Beads Village | 3 (reserve, release, reservations) | 4 (+ renew tool) |

Sherpa's 4-tool surface is within the 3-5 range established by every production system examined. The slight premium over etcd's 3 is justified by the `authority_status` tool, which serves the Replication Layer observability requirement (Pattern 2) — etcd achieves this through its watch API, which maps to MCP resource subscriptions.

### Potential Further Reduction to 3 Tools

If `authority_status` is implemented purely as an MCP resource (`authority://{scope}`) with subscription support via `resources/subscribe` and `notifications/resources/updated`, the tool surface drops to **3 tools**: acquire, renew, release. This matches etcd's irreducible minimum.

**Trade-off**: MCP resource subscriptions are not uniformly supported by all clients (noted in [MCP Client Capabilities Gap](https://www.pulsemcp.com/posts/mcp-client-capabilities-gap)). Keeping `authority_status` as a tool ensures all clients can query authority state. The resource version can be added alongside as a progressive enhancement.

---

## Sources (Full URLs with One-Line Descriptions)

### Coordination System APIs
- https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob — Azure Blob Lease REST API: 5 operations (Acquire, Renew, Change, Release, Break) with full state machine
- https://etcd.io/docs/v3.4/learning/api/ — etcd v3 API: LeaseGrant, LeaseKeepAlive, LeaseRevoke, LeaseTimeToLive
- https://developer.hashicorp.com/consul/api-docs/session — Consul Session API: Create, Destroy, Renew + Info/List
- https://developer.hashicorp.com/vault/docs/concepts/lease — Vault Lease operations: Renew, Revoke, Lookup
- https://kubernetes.io/docs/concepts/architecture/leases/ — Kubernetes Lease coordination API for leader election and heartbeats
- https://zookeeper.apache.org/doc/r3.8.5/recipes.html — ZooKeeper distributed lock recipes using ephemeral sequential nodes
- https://kriasoft.com/syncguard/fencing — SyncGuard TypeScript distributed locks with built-in fencing token support
- https://github.com/dapr/dapr/issues/3549 — Dapr distributed lock API proposal: TryLock + Unlock (heartbeat deferred to phase 2)

### Fencing Tokens
- https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html — Kleppmann's seminal analysis: why fencing tokens are essential for correctness
- https://levelup.gitconnected.com/beyond-the-lock-why-fencing-tokens-are-essential-5be0857d5a6a — SyncGuard author on fencing token design
- https://woodruff.dev/fencing-tokens-and-generation-clock-in-net-stop-zombie-leaders-from-writing/ — Fencing tokens and generation clocks in .NET
- https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/ — Formal verification of locks, leases, and fencing tokens
- https://www.systemoverflow.com/learn/distributed-primitives/distributed-locks/fencing-tokens-preventing-split-brain-operations — Fencing tokens preventing split-brain operations

### Backpressure Patterns
- https://www.eveonline.com/news/view/introducing-time-dilation-tidi — EVE Online Time Dilation: server-controlled clock slowdown as backpressure
- https://docs.bullmq.io/guide/rate-limiting — BullMQ rate limiting: server-side queue-level throttling, not client API
- https://docs.temporal.io/develop/worker-performance — Temporal worker slot suppliers: server-controlled concurrency management
- https://dasroot.net/posts/2026/02/rate-limiting-backpressure-llm-apis/ — Rate limiting and backpressure patterns for LLM APIs (2026)
- https://dasroot.net/posts/2026/02/managing-backpressure-async-ai-services/ — Backpressure management in async AI services (2026)
- https://medium.com/expedia-group-tech/traffic-shedding-rate-limiting-backpressure-oh-my-21f95c403b29 — Expedia: traffic shedding vs rate limiting vs backpressure

### MCP Tool Design Patterns
- https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents — 4 MCP design patterns: semantic search, workflow-based, code mode, progressive discovery
- https://engineering.block.xyz/blog/blocks-playbook-for-designing-mcp-servers — Block's MCP playbook: design from workflows, consolidate tools, category parameters
- https://www.docker.com/blog/mcp-server-best-practices/ — Docker MCP best practices: manage tool budget, design for agents, test interactions
- https://github.blog/ai-and-ml/github-copilot/how-were-making-github-copilot-smarter-with-fewer-tools/ — GitHub Copilot: 40→13 tools improved resolution rate 2-5% and reduced latency 400ms
- https://mattrickard.com/keep-api-surface-small — API surface area principles: all observable behaviors become dependencies
- https://2014.jsconf.eu/speakers/sebastian-markbage-minimal-api-surface-area-learning-patterns-instead-of-frameworks.html — Sebastian Markbage (React): minimal API surface area philosophy

### MCP Protocol & Roadmap
- https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/ — 2026 MCP Roadmap: transport evolution, Tasks primitive, no multi-agent coordination primitives planned
- https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle — MCP lifecycle specification
- https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/ — Why MCP deprecated SSE for Streamable HTTP
- https://www.pulsemcp.com/posts/mcp-client-capabilities-gap — MCP client capabilities gap: not all clients support all features

### Existing MCP Coordination Servers
- https://github.com/rinadelph/Agent-MCP — Agent-MCP: admin+worker agent framework with shared knowledge graph
- https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp — Multi-Agent Coordination MCP: project/task/todo with auto file locking (14 tools)
- https://purplehorizons.io/blog/tick-md-multi-agent-coordination-markdown — tick-md: Git-backed markdown task coordination with claim/done/release
- https://github.com/Dicklesworthstone/mcp_agent_mail — MCP Agent Mail: advisory file reservations with pre-commit enforcement
- https://github.com/LNS2905/mcp-beads-village — Beads Village: atomic file locking with O_CREAT|O_EXCL and 27 tools
- https://github.com/ai-janitor/dead-drop-teams — Dead-Drop Teams: messaging-based coordination with inbox-first discipline

### Minimal API Design
- https://adidas.gitbook.io/api-guidelines/general-guidelines/minimal-api-surface — Adidas API Guidelines: every API design MUST aim for minimal surface
- https://github.com/anthropics/claude-code/issues/13717 — Claude Code issue: MCP tools consume 50% of context tokens

### Distributed Locking General
- https://www.architecture-weekly.com/p/distributed-locking-a-practical-guide — Oskar Dudycz: practical guide to distributed locking
- https://oneuptime.com/blog/post/2026-02-16-how-to-implement-lease-management-for-blob-concurrency-control-in-azure-storage/view — Implementing Azure Blob lease management (2026)
- https://aws.amazon.com/blogs/database/building-distributed-locks-with-the-dynamodb-lock-client/ — DynamoDB lock client: automatic heartbeat renewal via UpdateItem

---

## Raw Links (Every URL Encountered)

```
https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob
https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-lease
https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-container-lease
https://learn.microsoft.com/en-us/azure/storage/blobs/concurrency-manage
https://etcd.io/docs/v3.4/learning/api/
https://etcd.io/docs/v3.5/learning/api_guarantees/
https://microsoft.github.io/etcd3/classes/lease.html
https://github.com/etcd-io/etcd/blob/main/client/v3/lease.go
https://developer.hashicorp.com/consul/api-docs/session
https://www.consul.io/api-docs/session
https://developer.hashicorp.com/vault/docs/concepts/lease
https://kubernetes.io/docs/concepts/architecture/leases/
https://zookeeper.apache.org/doc/r3.1.2/recipes.html
https://zookeeper.apache.org/doc/r3.8.5/recipes.html
https://zookeeper.apache.org/doc/r3.4.13/zookeeperOver.html
https://kriasoft.com/syncguard/fencing
https://levelup.gitconnected.com/beyond-the-lock-why-fencing-tokens-are-essential-5be0857d5a6a
https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/
https://woodruff.dev/fencing-tokens-and-generation-clock-in-net-stop-zombie-leaders-from-writing/
https://www.systemoverflow.com/learn/distributed-primitives/distributed-locks/fencing-tokens-preventing-split-brain-operations
https://blog.suje.sh/posts/distributed-locks-and-fencing-tokens-handling-concurrency-safely-in-microservices/
https://medium.com/towardsdev/implementing-distributed-locks-correctly-5a35179422a6
https://www.eveonline.com/news/view/introducing-time-dilation-tidi
https://wiki.eveuniversity.org/Time_dilation
https://www.pcgamer.com/eve-onlines-mad-time-dilation-tech-beats-lag/
https://www.eveonline.com/news/view/time-dilation-hows-that-going
https://www.datacenterknowledge.com/servers/experiencing-heavy-server-load-just-slow-down-time
https://docs.bullmq.io/guide/rate-limiting
https://blog.taskforce.sh/rate-limit-recipes-in-nodejs-using-bullmq/
https://docs.temporal.io/develop/worker-performance
https://docs.temporal.io/cloud/limits
https://docs.temporal.io/workflows
https://github.com/temporalio/temporal/issues/8356
https://dasroot.net/posts/2026/02/rate-limiting-backpressure-llm-apis/
https://dasroot.net/posts/2026/02/managing-backpressure-async-ai-services/
https://medium.com/expedia-group-tech/traffic-shedding-rate-limiting-backpressure-oh-my-21f95c403b29
https://dev.to/wallacefreitas/applying-back-pressure-when-overloaded-managing-system-stability-pgc
https://www.geeksforgeeks.org/computer-networks/back-pressure-in-distributed-systems/
https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents
https://dev.to/klavisai/less-is-more-4-design-patterns-for-building-better-mcp-servers-3gpf
https://engineering.block.xyz/blog/blocks-playbook-for-designing-mcp-servers
https://www.docker.com/blog/mcp-server-best-practices/
https://github.blog/ai-and-ml/github-copilot/how-were-making-github-copilot-smarter-with-fewer-tools/
https://mattrickard.com/keep-api-surface-small
https://2014.jsconf.eu/speakers/sebastian-markbage-minimal-api-surface-area-learning-patterns-instead-of-frameworks.html
https://adidas.gitbook.io/api-guidelines/general-guidelines/minimal-api-surface
https://github.com/adidas/api-guidelines/blob/master/general-guidelines/minimal-api-surface.md
https://github.com/anthropics/claude-code/issues/13717
https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle
https://modelcontextprotocol.io/docs/learn/architecture
https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/
https://blog.fka.dev/blog/2025-06-11-diving-into-mcp-advanced-server-capabilities/
https://www.pulsemcp.com/posts/mcp-client-capabilities-gap
https://auth0.com/blog/mcp-streamable-http/
https://modelcontextprotocol.io/development/roadmap
https://www.elastic.co/search-labs/blog/mcp-current-state
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1192
https://github.com/rinadelph/Agent-MCP
https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp
https://glama.ai/mcp/servers/@AndrewDavidRivers/multi-agent-coordination-mcp
https://purplehorizons.io/blog/tick-md-multi-agent-coordination-markdown
https://www.tick.md/
https://github.com/Dicklesworthstone/mcp_agent_mail
https://github.com/LNS2905/mcp-beads-village
https://github.com/ai-janitor/dead-drop-teams
https://github.com/lastmile-ai/mcp-agent
https://github.com/modelcontextprotocol/servers
https://github.com/modelcontextprotocol/python-sdk
https://github.com/dapr/dapr/issues/3549
https://aws.amazon.com/blogs/database/building-distributed-locks-with-the-dynamodb-lock-client/
https://oneuptime.com/blog/post/2026-02-16-how-to-implement-lease-management-for-blob-concurrency-control-in-azure-storage/view
https://medium.com/@connect.hashblock/7-queue-backpressure-designs-with-bullmq-and-kafka-for-node-358e2b17d1af
https://onereach.ai/blog/mcp-multi-agent-ai-collaborative-intelligence/
https://www.ruh.ai/blogs/ai-agent-protocols-2026-complete-guide
https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li
https://onereach.ai/blog/guide-choosing-mcp-vs-a2a-protocols/
https://medium.com/@dave-patten/mcps-next-phase-inside-the-november-2025-specification-49f298502b03
https://www.getknit.dev/blog/the-future-of-mcp-roadmap-enhancements-and-whats-next
https://www.pento.ai/blog/a-year-of-mcp-2025-review
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://www.architecture-weekly.com/p/distributed-locking-a-practical-guide
https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/
https://community.temporal.io/t/rate-limit-configuration-and-best-practices/5498
https://community.temporal.io/t/rate-limit-per-activity/9956
https://community.temporal.io/t/dynamic-rate-limiting/3073
https://community.temporal.io/t/advice-for-handling-rate-limits-for-bulk-processes/9326
https://github.com/modelcontextprotocol/specification/issues/1708
https://atlan.com/know/mcp-server-implementation-guide/
https://www.stainless.com/mcp/api-mcp-server-architecture-guide
https://www.anthropic.com/news/model-context-protocol
https://www.builder.io/blog/best-mcp-servers-2026
```

---

## Implications for Sherpa's MCP Coordination Server

### 1. Reduce Authority Tools from 6 to 4

The proposal's 6 tools (`acquire_authority`, `release_authority`, `check_authority`, `transfer_authority`, `heartbeat_authority`, `override_authority`) should be reduced to 4 (`authority_acquire`, `authority_release`, `authority_renew`, `authority_status`). This aligns with every production coordination system studied (3-5 operations) and reduces context window overhead.

### 2. Embed Fencing Tokens in Acquire, Not Separate

Fencing tokens are not a separate concern — they are the return value of `authority_acquire`. Every mutation tool must accept `fence_token` as a required parameter. The server validates atomically in the same SQLite transaction as the mutation.

### 3. Use MCP Resources for Authority Observation

`authority://{scope}` as an MCP resource with subscription support (`resources/subscribe`, `notifications/resources/updated`) is the correct MCP-native way to expose authority state. Keep `authority_status` as a tool fallback for clients that don't support subscriptions.

### 4. Make Backpressure a Server Behavior, Not a Tool

Implement time dilation as: (a) `retry_after_ms` in responses, (b) HTTP 429 on the transport, (c) automatic TTL extension during overload, (d) task dispatch rate throttling. No backpressure tool.

### 5. Encode Prevention→Compensation in Architecture, Not Tools

- Prevention: task dispatch + `authority_acquire`
- Detection: `expectedVersion` on mutations + version conflict errors
- Compensation: Judge workflow + git rebase
No dedicated tools needed for the spectrum.

### 6. Implicit Authority via Task Dispatch Reduces Tool Calls

Workers don't call `authority_acquire` for task-scoped work. The task dispatch response includes the fence token and authority grant. This eliminates one round-trip per task and follows the BullMQ/Temporal pattern of implicit authority via assignment.

### 7. Implicit Lease Renewal via Mutations Eliminates Heartbeat Chatter

Every tool call with a valid fence token resets the lease TTL. Only agents in long idle periods (reading, reasoning without tool calls) need explicit `authority_renew`. This matches the BullMQ pattern where job locks auto-renew on worker activity.

---

## Open Questions

1. **Should `authority_status` be a tool or purely an MCP resource?** If resource-only, the tool surface drops to 3 (matching etcd's minimum). But resource subscription support is inconsistent across MCP clients.

2. **What happens when transfer fails mid-transaction?** If `authority_acquire(transfer_from: old_token)` finds the old token already expired, should it grant fresh authority or reject? This is the "stale transfer" edge case.

3. **How should authority interact with git worktrees?** If each agent operates in a separate worktree, file-level authority may only matter at merge time. Worktree isolation provides natural prevention. Does this reduce the coordination layer to merge-time conflict detection only?

4. **What is the right TTL for implicit renewal?** If mutations renew leases, a 30-minute TTL means an agent that goes idle for 30 minutes loses authority. Is this too aggressive? Too permissive? Should interactive vs background agents have different TTLs?

5. **Should `authority_acquire` support shared (read) and exclusive (write) modes?** Azure Blob is always exclusive. Consul supports session lock-delay. Multiple agents reading the same initiative concurrently is safe — only writes need exclusivity. A `mode: "shared" | "exclusive"` parameter could enable read-many-write-one without requiring leases for reads.

6. **Can the 4 authority tools be further consolidated into 2?** A single `authority(action: "acquire"|"release"|"renew"|"status", ...)` tool would reduce the tool surface to 1, following Block's parameter-based consolidation pattern. Trade-off: less discoverable, harder for agents to select the right action. GitHub's research suggests 13 tools is fine; the question is whether 4 coordination tools within a larger server toolset tips the balance.

7. **How does the 2026 MCP roadmap affect this design?** The roadmap prioritizes stateless transport and the Tasks primitive (SEP-1686), but explicitly excludes multi-agent coordination primitives. Sherpa must build coordination at the application level. Does the Tasks primitive overlap with or complement Sherpa's task dispatch?
