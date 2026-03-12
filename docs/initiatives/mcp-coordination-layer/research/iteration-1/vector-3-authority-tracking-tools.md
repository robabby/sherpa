# Authority Tracking as MCP Tool Definitions

**Research iteration:** 1
**Date:** 2026-03-11
**Question:** How would authority tracking work as MCP tool definitions? What would acquire_authority, release_authority, check_authority, transfer_authority look like? Can task dispatch imply implicit authority?

---

## Key Discoveries

### 1. Distributed Lock Primitives Map Cleanly to MCP Tools

- **etcd** uses a lease-based model: `LeaseGrant` (with TTL) creates a lease, `LeaseKeepAlive` renews it via bidirectional streaming, and `LeaseRevoke` kills it. Keys attached to a lease are auto-deleted on expiry. The lock API builds on this: acquire creates a sequential key under a lock prefix with a lease attached; the lowest-sequence holder wins. ([etcd concurrency API](https://etcd.io/docs/v3.6/dev-guide/api_concurrency_reference_v3/), [etcd lease tutorial](https://etcd.io/docs/v3.5/tutorials/how-to-create-lease/))

- **ZooKeeper** uses ephemeral sequential znodes: clients create `/lock/lock-000000N` nodes; lowest sequence wins. When a session dies, the ephemeral node auto-deletes, releasing the lock. Watchers on the next-lowest node prevent thundering herd. ([ZooKeeper Recipes](https://zookeeper.apache.org/doc/r3.1.2/recipes.html), [ZooKeeper Overview](https://zookeeper.apache.org/doc/r3.4.13/zookeeperOver.html))

- **Redis SETNX** (`SET key value NX EX ttl`) is the simplest pattern: atomic set-if-not-exists with expiration. Single-node Redis suffices for efficiency locks but not correctness locks. **Redlock** extends across N nodes (acquire on majority) but lacks fencing tokens, which Kleppmann argues makes it unsafe for correctness. ([Redis distributed locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/), [Kleppmann's analysis](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html))

- **Azure Blob Storage** has the richest lease API with 5 operations: **Acquire** (15-60s or infinite TTL), **Renew**, **Change** (swap lease ID), **Release**, and **Break** (admin override). Break is the key innovation: any authorized request can break a lease *without the lease ID*, and there's a configurable break period (0-60s) before a new lease can be acquired. This directly models human override. ([Azure Lease Blob API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob))

- **Dapr** provides a clean REST API for distributed locks: `POST /v1.0-alpha1/lock/{store}` with `{resourceId, lockOwner, expiryInSeconds}` and `POST /v1.0-alpha1/unlock/{store}` with `{resourceId, lockOwner}`. Simple, flat, good model for MCP tool design. ([Dapr lock API](https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/distributed-lock-api-overview/), [Dapr how-to](https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/howto-use-distributed-lock/))

### 2. Fencing Tokens Are Essential for Correctness

- Kleppmann's core argument: locks with TTLs are *never* safe alone because process pauses (GC, context switches), clock drift, and network delays can cause a client to believe it still holds a lock after expiry. **Fencing tokens** (monotonically increasing numbers issued with each lock acquisition) are the fix: the storage layer rejects writes with stale tokens. ([Kleppmann blog](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html))

- **SyncGuard** implements fencing tokens as 15-digit zero-padded strings for lexicographic comparison. Check-and-write pattern: `if (fence <= doc.fence) throw "Stale lock"`. ([SyncGuard fencing](https://kriasoft.com/syncguard/fencing))

- However, formal verification (FizzBee) reveals fencing tokens are *also* incomplete: "two processes can both believe they hold the lock, and the lower token reaches the shared resource before the higher token." Full safety requires the resource layer itself to enforce ordering. ([Surfing Complexity blog](https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/))

- **Implication for Sherpa:** The MCP server *is* the resource layer. Since all mutations flow through it, it can enforce fencing token ordering at the point of mutation, which is the ideal architecture for correctness.

### 3. Pessimistic vs Optimistic Concurrency: Use Both

- **Pessimistic locking** (acquire before edit): prevents conflicts but causes contention. In Cursor's experiment with 20 AI agents, agents held locks too long, reducing throughput to 2-3 concurrent agents. ([Mike Mason blog](https://mikemason.ca/writing/ai-coding-agents-jan-2026/))

- **Optimistic concurrency** (check version on write): allows parallel reads, rejects stale writes. Uses ETags/If-Match headers in HTTP. Client reads resource + version, submits write with expected version, server rejects if version changed. ([ETag OCC pattern](https://fideloper.com/etags-and-optimistic-concurrency-control), [CodeOpinion](https://codeopinion.com/optimistic-concurrency-in-an-http-api-with-etags-hypermedia/))

- In Cursor's experiment, optimistic concurrency made agents *risk-averse* — they avoided difficult tasks to minimize conflict probability. ([Mike Mason blog](https://mikemason.ca/writing/ai-coding-agents-jan-2026/))

- **Best approach for Sherpa:** Hybrid. Use **optimistic concurrency** (version checks) for most file mutations — agents read, modify, submit with version. Use **pessimistic authority** (explicit leases) for high-contention resources like initiative status transitions or shared artifacts. The MCP server enforces both.

### 4. Authority Scope Should Be Hierarchical (Multi-Granularity)

- Gray et al.'s 1976 paper on granularity of locks defines **intention locks** (IS, IX, S, SIX, X) for hierarchical resources. Key insight: when you lock a directory, you implicitly lock all files within it. Intention locks at higher levels signal that finer-grained locks exist below. ([Gray 1976 summary](https://mwhittaker.github.io/papers/html/gray1976granularity.html), [Adrian Colyer review](https://blog.acolyer.org/2016/01/05/granularity-of-locks/))

- The **DLM (Distributed Lock Manager)** from VMS uses "a generalized concept of a resource" with hierarchical resource trees. Lock modes: NL (null), CR (concurrent read), CW (concurrent write), PR (protected read), PW (protected write), EX (exclusive). ([Wikipedia DLM](https://en.wikipedia.org/wiki/Distributed_lock_manager))

- **For Sherpa's filesystem-based state**, the natural hierarchy is:
  - `docs/initiatives/` (root scope)
  - `docs/initiatives/{slug}/` (initiative scope)
  - `docs/initiatives/{slug}/proposal.md` (file scope)
  - Section within a file (section scope — e.g., "Activity Log" section of activity.md)

- **Recommendation:** Support three granularities: **initiative-level** (authority over entire initiative directory), **file-level** (authority over a specific file), and **task-level** (authority over files targeted by a task). Skip section-level — too complex for markdown, and file-level with optimistic concurrency handles concurrent activity.md appends fine.

### 5. Task Dispatch Systems Grant Implicit Authority

- **BullMQ**: When a worker picks up a job, BullMQ places a lock with configurable `lockDuration` (default 30s). Lock auto-renews at `lockRenewTime` (half of lockDuration). If renewal fails (worker crash, CPU saturation), the job becomes "stalled" and returns to the queue. ([BullMQ stalled jobs](https://docs.bullmq.io/guide/workers/stalled-jobs), [BullMQ important notes](https://docs.bullmq.io/bull/important-notes))

- **Celery**: No built-in exclusive lock. Uses external cache (`cache.add()` with memcached) for distributed task locking. The `celery_once` package prevents duplicate execution. ([Celery task cookbook](https://docs.celeryq.dev/en/stable/tutorials/task-cookbook.html))

- **Temporal**: Workers don't get exclusive resource access by default — any worker can pick from a task queue. Exclusive access comes from **Worker Sessions** (routing related activities to the same worker) and **dedicated task queues** (only specific workers listen). Heartbeat Timeout detects worker crashes; `Start-To-Close Timeout` forces retries. Activities can heartbeat progress data that survives retries. ([Temporal task routing](https://docs.temporal.io/task-routing), [Temporal failure detection](https://docs.temporal.io/encyclopedia/detecting-activity-failures))

- **Cursor's Planner/Worker/Judge**: Workers execute independently without mutual coordination. They push changes when done. The *Judge* validates results. No explicit locking between workers — conflict resolution happens at merge time. ([Mike Mason blog](https://mikemason.ca/writing/ai-coding-agents-jan-2026/))

- **Implication for Sherpa:** Task dispatch *should* grant implicit authority over the task's target files. When `plan-tasks` creates a task targeting `docs/initiatives/vedic-research/plan.md`, dispatching that task to a worker implicitly grants file-level authority. The MCP server records `{agent_id, task_id, targets[], fence_token, expires_at}`. No separate `acquire_authority` call needed for task-scoped work.

### 6. MCP Tool Annotations Cannot Enforce Authority

- MCP tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) are explicitly **untrusted hints**: "Clients must treat these annotations purely as untrusted hints unless the server is explicitly trusted." Servers "should not rely on clients strictly adhering to these hints for enforcing security or correctness." ([MCP tools spec](https://modelcontextprotocol.io/specification/draft/server/tools), [MCP legacy tools](https://modelcontextprotocol.io/legacy/concepts/tools))

- The annotations are useful for *UX* — marking `acquire_authority` as `{readOnlyHint: false, destructiveHint: false, idempotentHint: true}` tells Studio UI it's a safe-to-retry state mutation. But authority enforcement must happen server-side, not via annotations.

- **MCP outputSchema** (added in spec 2025-06-18) is more relevant: authority tools can declare typed structured responses, enabling clients to programmatically handle authority grants/denials. ([MCP spec 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/server/tools))

- **MCP resource subscriptions** could notify agents when authority state changes: `resources/subscribe` on `authority://initiative/vedic-research` would push updates when another agent acquires or releases authority. ([MCP resources spec](https://modelcontextprotocol.io/specification/2025-06-18/server/resources))

### 7. Heartbeat/Expiration Must Handle Agent Context Loss

- AI agents lose context in ways human developers don't: `/compact` commands, context window exhaustion, session crashes, manual `/clear`. The agent has no opportunity to call `release_authority`.

- **etcd pattern**: Lease TTL + keepalive stream. If keepalive stops, lease expires, keys deleted. ([etcd lease API](https://etcd.io/docs/v3.4/learning/api/))

- **BullMQ pattern**: Lock with `lockDuration`, auto-renewed at intervals. Stalled job checker runs periodically and reclaims jobs whose locks expired. Max stalled count prevents infinite retry loops. ([BullMQ stalled jobs](https://docs.bullmq.io/guide/workers/stalled-jobs))

- **Temporal pattern**: `Heartbeat Timeout` + `Start-To-Close Timeout`. Workers throttle heartbeats to 80% of timeout interval. Heartbeat payloads carry progress data for resumption. ([Temporal failure detection](https://docs.temporal.io/encyclopedia/detecting-activity-failures))

- **For Sherpa:** Authority leases should have a TTL (default: 30 minutes for interactive sessions, 10 minutes for background workers). The MCP server runs a periodic reaper. Agents can renew via `heartbeat_authority` tool call or implicitly via any mutation that includes the authority token. If an agent's session dies, authority expires and the task returns to "available" status.

### 8. Human Override Is a First-Class Operation

- Azure Blob's `Break` operation is the gold standard: any authorized request can break any lease, no lease ID required. Optional break period (0-60s grace) before new lease can be acquired. ([Azure Lease Blob API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob))

- **For Sherpa:** `override_authority` tool, callable only with human-level authorization. Immediately breaks the authority lease, optionally notifies the holding agent (if still alive) via MCP notification. The override gets logged in the initiative's `activity.md`. No grace period needed for filesystem operations — the MCP server is the single writer, so there's no risk of in-flight partial writes.

---

## Proposed MCP Tool Schemas

### acquire_authority

```json
{
  "name": "acquire_authority",
  "description": "Request authority (lease) over a scope. Returns a fence token on success. Authority expires after TTL unless renewed.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "scope": {
        "type": "string",
        "description": "Resource scope. Examples: 'initiative:vedic-research', 'file:docs/initiatives/vedic-research/plan.md', 'task:vedic-research-001'"
      },
      "agent_id": {
        "type": "string",
        "description": "Unique identifier for the requesting agent session"
      },
      "ttl_seconds": {
        "type": "integer",
        "description": "Requested lease duration in seconds. Server may cap this.",
        "default": 1800
      },
      "reason": {
        "type": "string",
        "description": "Why authority is needed. Logged in activity trail."
      }
    },
    "required": ["scope", "agent_id"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "granted": { "type": "boolean" },
      "fence_token": {
        "type": "string",
        "description": "Monotonically increasing token. Include in all mutations. 15-digit zero-padded."
      },
      "expires_at": {
        "type": "string",
        "format": "date-time"
      },
      "current_holder": {
        "type": "object",
        "description": "Present when granted=false. Shows who holds authority.",
        "properties": {
          "agent_id": { "type": "string" },
          "acquired_at": { "type": "string", "format": "date-time" },
          "reason": { "type": "string" }
        }
      }
    },
    "required": ["granted"]
  },
  "annotations": {
    "title": "Acquire Authority",
    "readOnlyHint": false,
    "destructiveHint": false,
    "idempotentHint": true,
    "openWorldHint": false
  }
}
```

### release_authority

```json
{
  "name": "release_authority",
  "description": "Release authority over a scope. Agent must provide the fence token received at acquisition.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "scope": { "type": "string" },
      "agent_id": { "type": "string" },
      "fence_token": {
        "type": "string",
        "description": "Must match the token from acquire_authority"
      }
    },
    "required": ["scope", "agent_id", "fence_token"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "released": { "type": "boolean" },
      "error": { "type": "string" }
    },
    "required": ["released"]
  },
  "annotations": {
    "title": "Release Authority",
    "readOnlyHint": false,
    "destructiveHint": false,
    "idempotentHint": true,
    "openWorldHint": false
  }
}
```

### check_authority

```json
{
  "name": "check_authority",
  "description": "Check who holds authority over a scope without acquiring it. Read-only.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "scope": { "type": "string" }
    },
    "required": ["scope"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "held": { "type": "boolean" },
      "holder": {
        "type": "object",
        "properties": {
          "agent_id": { "type": "string" },
          "fence_token": { "type": "string" },
          "acquired_at": { "type": "string", "format": "date-time" },
          "expires_at": { "type": "string", "format": "date-time" },
          "reason": { "type": "string" },
          "task_id": { "type": "string" }
        }
      },
      "scope_hierarchy": {
        "type": "array",
        "description": "Parent scopes that also grant implicit authority over this scope",
        "items": {
          "type": "object",
          "properties": {
            "scope": { "type": "string" },
            "holder_agent_id": { "type": "string" }
          }
        }
      }
    },
    "required": ["held"]
  },
  "annotations": {
    "title": "Check Authority",
    "readOnlyHint": true,
    "openWorldHint": false
  }
}
```

### transfer_authority

```json
{
  "name": "transfer_authority",
  "description": "Transfer authority to another agent. Atomic release-and-acquire. New fence token is issued to recipient.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "scope": { "type": "string" },
      "from_agent_id": { "type": "string" },
      "from_fence_token": { "type": "string" },
      "to_agent_id": { "type": "string" },
      "ttl_seconds": { "type": "integer", "default": 1800 }
    },
    "required": ["scope", "from_agent_id", "from_fence_token", "to_agent_id"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "transferred": { "type": "boolean" },
      "new_fence_token": { "type": "string" },
      "expires_at": { "type": "string", "format": "date-time" },
      "error": { "type": "string" }
    },
    "required": ["transferred"]
  },
  "annotations": {
    "title": "Transfer Authority",
    "readOnlyHint": false,
    "destructiveHint": false,
    "idempotentHint": false,
    "openWorldHint": false
  }
}
```

### heartbeat_authority

```json
{
  "name": "heartbeat_authority",
  "description": "Renew authority lease. Resets TTL. Can optionally include progress data.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "scope": { "type": "string" },
      "agent_id": { "type": "string" },
      "fence_token": { "type": "string" },
      "progress": {
        "type": "object",
        "description": "Optional progress data (like Temporal heartbeat payloads). Preserved for task resumption if authority expires.",
        "additionalProperties": true
      }
    },
    "required": ["scope", "agent_id", "fence_token"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "renewed": { "type": "boolean" },
      "expires_at": { "type": "string", "format": "date-time" },
      "error": { "type": "string" }
    },
    "required": ["renewed"]
  },
  "annotations": {
    "title": "Heartbeat Authority",
    "readOnlyHint": false,
    "destructiveHint": false,
    "idempotentHint": true,
    "openWorldHint": false
  }
}
```

### override_authority (human-only)

```json
{
  "name": "override_authority",
  "description": "Break an authority lease. Requires human-level authorization. Immediately releases authority regardless of holder. Modeled after Azure Blob Break Lease.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "scope": { "type": "string" },
      "reason": {
        "type": "string",
        "description": "Required explanation for the override. Logged in activity trail."
      },
      "notify_holder": {
        "type": "boolean",
        "description": "Whether to send MCP notification to current holder",
        "default": true
      }
    },
    "required": ["scope", "reason"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "broken": { "type": "boolean" },
      "previous_holder": {
        "type": "object",
        "properties": {
          "agent_id": { "type": "string" },
          "fence_token": { "type": "string" },
          "held_since": { "type": "string", "format": "date-time" }
        }
      }
    },
    "required": ["broken"]
  },
  "annotations": {
    "title": "Override Authority (Admin)",
    "readOnlyHint": false,
    "destructiveHint": true,
    "idempotentHint": true,
    "openWorldHint": false
  }
}
```

---

## Implicit Authority via Task Dispatch

When a task is dispatched to an agent, the MCP server should **implicitly grant authority** over the task's target files:

```
dispatch_task("vedic-research-001", agent_id="worker-3")
  --> internally calls acquire_authority("task:vedic-research-001", "worker-3")
  --> grants file-level authority over all files in task.targets[]
  --> returns fence_token in dispatch response
```

The agent includes the fence_token in subsequent file mutations. The MCP server validates:
1. The fence_token matches the current authority holder
2. The file being modified is within the task's declared targets
3. The authority hasn't expired

This eliminates the need for workers to explicitly manage authority in the common case. Explicit `acquire_authority` is reserved for:
- Planners working outside task scope
- Agents needing authority over shared artifacts
- Interactive sessions doing exploratory work

---

## Implications for Sherpa MCP Server Design

1. **The MCP server is both lock manager and resource layer.** Since all file mutations flow through MCP tools (write_file, update_proposal_status, etc.), the server can enforce fencing tokens at the mutation point. This is architecturally ideal per Kleppmann's analysis — the resource layer itself validates tokens.

2. **Hybrid concurrency model.** Optimistic concurrency (version/ETag on every file read/write) handles the common case. Pessimistic authority (explicit leases) handles high-contention resources and long-running work.

3. **Authority state is ephemeral, not persisted in markdown.** Authority leases live in the MCP server's memory (or a lightweight store like SQLite). They don't clutter the initiative filesystem. Only override events get logged to `activity.md`.

4. **MCP resource subscriptions for authority state.** Expose `authority://{scope}` as an MCP resource. Agents can subscribe to authority changes on scopes they care about. This enables cooperative behavior without polling.

5. **The Planner/Worker/Judge pattern reduces authority needs.** Workers operate on isolated task scopes. Planners have broad read access but narrow write access. Judges only read. Most authority conflicts disappear when roles are well-separated.

6. **Heartbeat via mutation.** Any MCP tool call that includes a valid fence_token implicitly renews the authority lease. Agents don't need a separate heartbeat call unless they're idle but want to hold authority.

---

## Open Questions

1. **What happens when two tasks target overlapping files?** The Planner should prevent this, but the MCP server needs a policy: reject the second dispatch? Queue it? Allow concurrent optimistic writes?

2. **Should expired authority auto-revert file changes?** If a worker crashes mid-edit, should the MCP server roll back uncommitted changes? Or leave partial state for the next worker?

3. **How does authority interact with git worktrees?** If agents work in separate worktrees, file-level authority may be unnecessary — git handles isolation. Authority may only matter for the main branch merge point.

4. **Authority for read operations?** Current design only gates writes. Should intensive read patterns (e.g., a Planner scanning all initiatives) require a read-authority lease to prevent interference?

5. **Fence token generation without consensus.** A single MCP server can use a monotonic counter. But if we ever need multiple MCP server instances, fence tokens require consensus (etcd/ZooKeeper). Is single-server a permanent architectural constraint?

6. **What's the right default TTL?** BullMQ uses 30s (for fast jobs). Temporal has no default (uses explicit timeouts). For AI agent sessions that might think for minutes, 30 minutes seems reasonable, but needs real-world calibration.

7. **Should `check_authority` reveal the holding agent's identity?** Privacy/security concern: should agents see *who* holds authority, or just *whether* it's held?

---

## Sources

### Primary References
- [etcd concurrency API reference](https://etcd.io/docs/v3.6/dev-guide/api_concurrency_reference_v3/) — Lock and lease RPCs in etcd v3
- [etcd lease tutorial](https://etcd.io/docs/v3.5/tutorials/how-to-create-lease/) — How to create and manage leases
- [etcd v3.4 API learning doc](https://etcd.io/docs/v3.4/learning/api/) — Lease keepalive and TTL renewal
- [ZooKeeper Recipes and Solutions](https://zookeeper.apache.org/doc/r3.1.2/recipes.html) — Distributed lock recipe with ephemeral sequential nodes
- [ZooKeeper Overview (ephemeral nodes)](https://zookeeper.apache.org/doc/r3.4.13/zookeeperOver.html) — Ephemeral node semantics
- [Redis distributed locks documentation](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) — SETNX, Redlock algorithm, safety properties
- [Martin Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — Definitive analysis of fencing tokens, lock safety
- [Antirez (Salvatore Sanfilippo): Is Redlock safe?](https://antirez.com/news/101) — Redis creator's response to Kleppmann
- [Azure Lease Blob REST API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob) — Five lease operations, break semantics, state machine
- [Azure Blob lease management (.NET)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-lease) — SDK-level lease patterns
- [Dapr distributed lock overview](https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/distributed-lock-api-overview/) — Lease-based lock building block
- [Dapr distributed lock how-to](https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/howto-use-distributed-lock/) — TryLock/Unlock REST API with resourceId/lockOwner

### MCP Specification
- [MCP Tools spec (current draft)](https://modelcontextprotocol.io/specification/draft/server/tools) — Tool definition structure, annotations, outputSchema
- [MCP Tools spec (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) — Structured content, outputSchema additions
- [MCP Tools (legacy concepts)](https://modelcontextprotocol.io/legacy/concepts/tools) — Tool annotations table, implementation examples
- [MCP Resources spec (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) — Resource subscriptions, notifications
- [MCP GitHub repo](https://github.com/modelcontextprotocol/modelcontextprotocol) — Specification source
- [MCP server development guide](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md) — Community implementation guide
- [MCP tool annotations blog](https://blog.marcnuri.com/mcp-tool-annotations-introduction) — Annotations introduction
- [MCP filesystem server annotations issue](https://github.com/modelcontextprotocol/servers/issues/3402) — Adding idempotentHint/openWorldHint
- [MCP state management discussion](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/102) — State and long-lived connections
- [MCP server state management article](https://zeo.org/resources/blog/mcp-server-architecture-state-management-security-tool-orchestration) — Architecture patterns
- [MCP notifications discussion](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1192) — Handling server notifications
- [MCP observer server](https://github.com/hesreallyhim/mcp-observer-server) — File change notifications via MCP

### Task Dispatch Systems
- [Temporal task queues](https://docs.temporal.io/task-queue) — Task queue semantics
- [Temporal workers](https://docs.temporal.io/workers) — Worker registration and polling
- [Temporal task routing / worker sessions](https://docs.temporal.io/task-routing) — Exclusive resource access via sessions
- [Temporal sticky execution](https://docs.temporal.io/sticky-execution) — Sticky queues for workflow affinity
- [Temporal detecting activity failures](https://docs.temporal.io/encyclopedia/detecting-activity-failures) — Heartbeat, Start-To-Close, Schedule-To-Close timeouts
- [Temporal distributed privilege access](https://temporal.io/blog/distributed-privilege-access-with-temporal) — Authority patterns in Temporal
- [BullMQ stalled jobs](https://docs.bullmq.io/guide/workers/stalled-jobs) — Lock expiration and job recovery
- [BullMQ important notes](https://docs.bullmq.io/bull/important-notes) — Job lock mechanism details
- [BullMQ WorkerOptions](https://api.docs.bullmq.io/interfaces/v4.WorkerOptions.html) — lockDuration, stalledInterval configuration
- [Celery task cookbook](https://docs.celeryq.dev/en/stable/tutorials/task-cookbook.html) — Distributed lock via cache.add()
- [celery_once package](https://pypi.org/project/celery_once/) — Preventing duplicate task execution

### Concurrency Theory
- [Gray 1976: Granularity of Locks](https://mwhittaker.github.io/papers/html/gray1976granularity.html) — Multi-granularity locking, intention locks, hierarchy
- [Adrian Colyer: Granularity of Locks review](https://blog.acolyer.org/2016/01/05/granularity-of-locks/) — Morning paper review of Gray's work
- [Wikipedia: Distributed lock manager](https://en.wikipedia.org/wiki/Distributed_lock_manager) — DLM concepts, lock modes, VMS history
- [Multi-granularity locking in hierarchies (Springer)](https://link.springer.com/chapter/10.1007/978-3-319-96983-1_39) — Modern treatment
- [Optimistic concurrency control (Wikipedia)](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) — OCC theory
- [Marc Brooker: Optimism vs Pessimism in Distributed Systems](https://brooker.co.za/blog/2023/10/18/optimism.html) — AWS perspective
- [Fencing tokens (SyncGuard)](https://kriasoft.com/syncguard/fencing) — Implementation with zero-padded tokens
- [Surfing Complexity: Locks, leases, fencing tokens, FizzBee](https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/) — Formal verification showing fencing token limitations
- [Hazelcast: Distributed Locks are Dead, Long Live Distributed Locks](https://hazelcast.com/blog/long-live-distributed-locks/) — Fencing token with FencedLock
- [Jepsen: etcd 3.4.3](https://jepsen.io/analyses/etcd-3.4.3) — Formal safety analysis of etcd

### Multi-Agent AI Coordination
- [Mike Mason: AI Coding Agents in 2026](https://mikemason.ca/writing/ai-coding-agents-jan-2026/) — Cursor's 20-agent experiment, Planner/Worker/Judge, locking vs OCC results
- [Multi-Agent Frameworks Explained (Adopt AI)](https://www.adopt.ai/blog/multi-agent-frameworks) — Enterprise multi-agent patterns 2026
- [MCP & Multi-Agent AI (OneReach)](https://onereach.ai/blog/mcp-multi-agent-ai-collaborative-intelligence/) — MCP for multi-agent collaboration
- [Multi-Agent Coordination Survey (arXiv)](https://arxiv.org/html/2502.14743v2) — Academic survey of coordination strategies
- [Orchestration of Multi-Agent Systems (arXiv)](https://arxiv.org/html/2601.13671v1) — Architectures and protocols

### ETag / Optimistic Concurrency in HTTP
- [ETags and Optimistic Concurrency Control](https://fideloper.com/etags-and-optimistic-concurrency-control) — Pattern explanation
- [CodeOpinion: OCC in HTTP API with ETags](https://codeopinion.com/optimistic-concurrency-in-an-http-api-with-etags-hypermedia/) — Implementation guide
- [Event-Driven.io: How to use ETag header](https://event-driven.io/en/how_to_use_etag_header_for_optimistic_concurrency/) — Practical guide
- [Azure: Manage concurrency in Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/concurrency-manage) — Optimistic + pessimistic patterns

---

## Raw Links

Every URL encountered during research, including those not fully explored:

```
https://etcd.io/docs/v3.5/learning/why/
https://etcd.io/docs/v3.2/dev-guide/api_concurrency_reference_v3/
https://etcd.io/docs/v3.6/dev-guide/api_concurrency_reference_v3/
https://etcd.io/docs/v3.4/learning/api/
https://etcd.io/docs/v3.5/learning/api_guarantees/
https://microsoft.github.io/etcd3/classes/lock.html
https://jepsen.io/analyses/etcd-3.4.3
https://reintech.io/blog/building-distributed-lock-system-go-etcd
https://shreemaan-abhishek.hashnode.dev/distributed-locking-using-etcd
https://python-etcd3.readthedocs.io/en/latest/_modules/etcd3/locks.html
https://oneuptime.com/blog/post/2026-01-25-zookeeper-distributed-locking/view
https://medium.com/@m.hassan.def/distributed-locking-using-zookeeper-e6ec7d84feb3
https://zookeeper.apache.org/doc/r3.1.2/recipes.html
https://dzone.com/articles/distributed-lock-using
https://medium.com/@aroragarima/zookeeper-internals-and-distributed-locking-158a6450691b
https://www.linkedin.com/pulse/how-implement-zookeeper-locking-mechanism-minal-bagade
https://nofluffjuststuff.com/blog/scott_leberknight/2013/07/distributed_coordination_with_zookeeper_part_5_building_a_distributed_lock
https://zookeeper.apache.org/doc/r3.4.13/zookeeperOver.html
https://www.architecture-weekly.com/p/distributed-locking-a-practical-guide
https://data-flair.training/blogs/zookeeper-locks/
https://redis.io/glossary/redis-lock/
https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/
https://leapcell.io/blog/implementing-distributed-locks-with-redis-delving-into-setnx-redlock-and-their-controversies
https://leapcell.medium.com/10-hidden-pitfalls-of-using-redis-distributed-locks-b5234ddd6349
https://www.alibabacloud.com/blog/implementation-principles-and-best-practices-of-distributed-lock_600811
https://codedamn.com/news/backend/distributed-locks-with-redis
https://oneuptime.com/blog/post/2026-01-25-distributed-locks-redis-redlock-go/view
https://medium.com/@ayushnandanwar003/achieving-distributed-locking-in-node-js-with-redis-and-redlock-0574f5ac333d
https://dev.to/lazypro/explain-redlock-in-depth-31jj
https://thinhdanggroup.github.io/10-redis-locks/
https://modelcontextprotocol.io/legacy/concepts/tools
https://modelcontextprotocol.io/specification/draft/server/tools
https://modelcontextprotocol.io/specification/2025-06-18/server/tools
https://modelcontextprotocol.io/specification/2025-06-18/server/resources
https://github.com/modelcontextprotocol/modelcontextprotocol
https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md
https://github.com/spring-ai-community/mcp-annotations
https://blog.marcnuri.com/mcp-tool-annotations-introduction
https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html
https://github.com/modelcontextprotocol/servers/issues/3402
https://github.com/modelcontextprotocol/servers/issues/2988
https://github.com/awslabs/mcp/issues/671
https://github.com/alibaba/higress/issues/2500
https://blogs.cisco.com/developer/whats-new-in-mcp-elicitation-structured-content-and-oauth-enhancements
https://www.byteplus.com/en/topic/542256
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/834
https://devblogs.microsoft.com/dotnet/mcp-csharp-sdk-2025-06-18-update/
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/102
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1192
https://github.com/orgs/modelcontextprotocol/discussions/337
https://github.com/hesreallyhim/mcp-observer-server
https://zeo.org/resources/blog/mcp-server-architecture-state-management-security-tool-orchestration
https://glama.ai/blog/2025-08-15-can-mcp-tools-remember-things-between-calls
https://deepwiki.com/jlowin/fastmcp/11.3-state-management-and-caching-strategies
https://medium.com/@parichay2406/mcp-memory-and-state-management-8738dd920e16
https://codesignal.com/learn/courses/developing-and-integrating-an-mcp-server-in-typescript/lessons/stateful-mcp-server-sessions
https://docs.temporal.io/task-queue
https://docs.temporal.io/workers
https://docs.temporal.io/task-routing
https://docs.temporal.io/workflow-execution
https://docs.temporal.io/sticky-execution
https://docs.temporal.io/encyclopedia/detecting-activity-failures
https://docs.temporal.io/develop/worker-performance
https://docs.temporal.io/cli/task-queue
https://temporal.io/blog/distributed-privilege-access-with-temporal
https://docs.temporal.io/develop/typescript/failure-detection
https://docs.temporal.io/develop/go/failure-detection
https://docs.temporal.io/develop/python/failure-detection
https://docs.temporal.io/develop/dotnet/failure-detection
https://github.com/temporalio/sdk-core/blob/master/arch_docs/sticky_queues.md
https://github.com/temporalio/temporal/issues/8356
https://community.temporal.io/t/what-is-the-underlying-reason-why-all-workers-listening-to-the-same-task-queue-must-be-registered-to-handle-the-same-workflow-types-and-activity-types/2648
https://community.temporal.io/t/clarity-on-task-queue-and-worker-segregation-patterns/4429
https://community.temporal.io/t/understanding-activities-and-queues/13437
https://community.temporal.io/t/taskqueues-in-workflow/6839
https://community.temporal.io/t/activity-not-recovered-after-worker-restarted/7214
https://community.temporal.io/t/workflow-and-activity-timeout/4745
https://community.temporal.io/t/workflow-not-recovered-after-crash/1770
https://community.temporal.io/t/activity-recovery-worker-behaviour-in-case-of-crash/8301
https://raphaelbeamonte.com/posts/good-practices-for-writing-temporal-workflows-and-activities/
https://docs.bullmq.io/guide/workers/stalled-jobs
https://docs.bullmq.io/bull/important-notes
https://docs.bullmq.io/patterns/manually-fetching-jobs
https://docs.bullmq.io/guide/troubleshooting
https://docs.bullmq.io/patterns/process-step-jobs
https://docs.bullmq.io/bull/patterns/manually-fetching-jobs
https://api.docs.bullmq.io/interfaces/v4.WorkerOptions.html
https://github.com/taskforcesh/bullmq/issues/374
https://hexdocs.pm/bullmq/BullMQ.Worker.html
https://hexdocs.pm/bullmq/manual_processing.html
https://docs.celeryq.dev/en/stable/tutorials/task-cookbook.html
https://pypi.org/project/celery_once/
https://github.com/celery/celery/discussions/7137
https://github.com/celery/celery/issues/6386
https://github.com/celery/celery/issues/7277
http://loose-bits.com/2010/10/distributed-task-locking-in-celery.html
https://gplhegde.hashnode.dev/distributed-locks-for-django-celery-tasks
https://gist.github.com/Skyross/2f4c95f5df2446b71f74f4f9d9771125
https://satyendrakjaiswal.medium.com/pessimistic-vs-optimistic-locking-a-complete-guide-to-concurrency-control-in-distributed-systems-c702344de92b
https://medium.com/@abhirup.acharya009/managing-concurrent-access-optimistic-locking-vs-pessimistic-locking-0f6a64294db7
https://en.wikipedia.org/wiki/Optimistic_concurrency_control
https://brooker.co.za/blog/2023/10/18/optimism.html
https://binaryigor.com/optimistic-vs-pessimistic-locking.html
https://blogs.oracle.com/maa/from-chaos-to-order-the-importance-of-concurrency-control-within-the-database-2-of-6
https://inery.io/blog/article/optimistic-vs-pessimistic-locking-difference-and-best-use-cases/
https://support.unicomsi.com/manuals/soliddb/7/SQL_Guide/5_ManagingTransactions.06.4.html
https://www.freecodecamp.org/news/how-databases-guarantee-isolation/
https://www.moderntreasury.com/learn/pessimistic-locking-vs-optimistic-locking
https://link.springer.com/chapter/10.1007/978-3-319-96983-1_39
https://en.wikipedia.org/wiki/Distributed_lock_manager
https://dl.acm.org/doi/10.1145/320071.320078
https://www.alibabacloud.com/blog/the-technical-practice-of-distributed-locks-in-a-storage-system_597141
https://blog.acolyer.org/2016/01/05/granularity-of-locks/
https://mwhittaker.github.io/papers/html/gray1976granularity.html
https://www.geeksforgeeks.org/dbms/multiple-granularity-locking-in-dbms/
http://people.eecs.berkeley.edu/~fox/summaries/database/locks.html
https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
https://pages.cs.wisc.edu/~remzi/Classes/739/Spring2003/Papers/leases-redis-problem.pdf
https://woodruff.dev/lease-pattern-in-net-a-lock-with-an-expiration-date-that-saves-your-data/
https://d1.awsstatic.com/builderslibrary/pdfs/leader-election-in-distributed-systems.pdf
https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/distributed-lock-api-overview/
https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/howto-use-distributed-lock/
https://learn.microsoft.com/en-us/samples/azure-samples/cosmos-db-design-patterns/distributed-lock/
https://medium.com/nerd-for-tech/leases-fences-distributed-design-patterns-c1983eccc9b1
https://oneuptime.com/blog/post/2026-02-16-how-to-implement-lease-management-for-blob-concurrency-control-in-azure-storage/view
https://github.com/DistributedComponents/disel/wiki/Lease-based-Lock-Protocol
https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob
https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-lease
https://learn.microsoft.com/en-us/dotnet/api/azure.storage.blobs.specialized.blobleaseclient.break
https://learn.microsoft.com/en-us/cli/azure/storage/blob/lease
https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-container-lease
https://github.com/Azure-Samples/storage-blobs-powershell-break-locked-lease
https://techcommunity.microsoft.com/blog/azurepaasblog/lease-management-in-azure-storage--common-troubleshooting-scenarios/4402002
https://www.redeploy.com/post/break-remove-lease-azure-blob
https://docs.azure.cn/en-us/storage/blobs/blob-containers-portal
https://learn.microsoft.com/en-us/azure/storage/blobs/concurrency-manage
https://fideloper.com/etags-and-optimistic-concurrency-control
https://codeopinion.com/optimistic-concurrency-in-an-http-api-with-etags-hypermedia/
https://medium.com/bestmile/optimistic-concurrency-control-in-http-services-c1bd911b89ad
https://zeitbach.com/blog/2024/01/26/optimistic-concurrency-control-with-etags
https://scriptin.github.io/2014-08-30/restful-http-concurrency-optimistic-locking.html
https://event-driven.io/en/how_to_use_etag_header_for_optimistic_concurrency/
https://docs.ed-fi.org/reference/data-exchange/api-guidelines/design-and-implementation-guidelines/api-implementation-guidelines/handling-optimistic-concurrency-with-etags/
https://learn.microsoft.com/en-us/azure/cosmos-db/database-transactions-optimistic-concurrency
https://blog.peterritchie.com/posts/etags-in-aspdotnet-core
https://kriasoft.com/syncguard/fencing
https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/
https://medium.com/@qingedaig/distributed-systems-consistency-patterns-3d2fa986fa3b
https://hazelcast.com/blog/long-live-distributed-locks/
https://levelup.gitconnected.com/beyond-the-lock-why-fencing-tokens-are-essential-5be0857d5a6a
https://dzone.com/articles/distributed-locks-are-dead-long-live-distributed-l
https://blog.suje.sh/posts/distributed-locks-and-fencing-tokens-handling-concurrency-safely-in-microservices/
https://medium.com/towardsdev/implementing-distributed-locks-correctly-5a35179422a6
https://news.ycombinator.com/item?id=41315621
https://newsletter.scalablethread.com/p/how-distributed-systems-avoid-race
https://medium.com/@polyglot_factotum/modelling-distributed-locking-in-tla-8a75dc441c5a
https://github.com/etcd-io/etcd/issues/13536
https://microsoft.github.io/etcd3/classes/lease.html
https://github.com/google/trillian/issues/2654
https://github.com/etcd-io/etcd/issues/13573
https://github.com/etcd-io/etcd/blob/main/client/v3/lease.go
https://github.com/microsoft/etcd3/blob/4b92eed/src/lease.ts
https://github.com/etcd-io/etcd/issues/7357
https://etcd.io/docs/v3.5/tutorials/how-to-create-lease/
https://mikemason.ca/writing/ai-coding-agents-jan-2026/
https://www.adopt.ai/blog/multi-agent-frameworks
https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://kanerika.com/blogs/ai-agent-orchestration/
https://onereach.ai/blog/mcp-multi-agent-ai-collaborative-intelligence/
https://grokipedia.com/page/Multi-agent_system
https://arxiv.org/html/2502.14743v2
https://arxiv.org/html/2601.13671v1
https://onereach.ai/blog/power-of-multi-agent-ai-open-protocols/
https://simplescraper.io/blog/how-to-mcp
https://modelcontextprotocol.io/docs/learn/architecture
https://repost.aws/questions/QU-YbedQP2Qj6QwqR5EnuELQ
https://developers.openai.com/apps-sdk/build/state-management/
https://posthog.com/docs/model-context-protocol
https://apxml.com/courses/getting-started-model-context-protocol/chapter-3-implementing-tools-and-logic/tool-definition-schema
https://developers.openai.com/apps-sdk/concepts/mcp-server/
https://materializedview.io/p/mcp-server-could-have-been-json-file
https://machinelearningmastery.com/the-complete-guide-to-model-context-protocol/
https://obot.ai/resources/learning-center/mcp-tools/
https://articles.mergify.com/resolve-git-merge-conflicts/
https://www.gitkraken.com/features/merge-conflict-resolution-tool
https://www.flosum.com/blog/how-to-resolve-merge-conflicts-in-git
https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line
https://www.arcadsoftware.com/discover/resources/blog/resolve-git-merge-conflicts-faster-with-artificial-intelligence-ai/
https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts
https://modelcontextprotocol.info/docs/concepts/resources/
https://modelcontextprotocol.info/docs/concepts/tools/
https://medium.com/@nimritakoul01/the-model-context-protocol-mcp-a-complete-tutorial-a3abe8a7f4ef
https://blog.fka.dev/blog/2025-06-11-diving-into-mcp-advanced-server-capabilities/
https://portkey.ai/blog/mcp-message-types-complete-json-rpc-reference-guide/
https://dev.to/portkey/mcp-message-types-complete-mcp-json-rpc-reference-guide-3gja
https://www.jetbrains.com/help/youtrack/devportal/custom-ai-tools.html
https://github.com/yonaka15/mcp-schema
https://openliberty.io/blog/2025/10/23/mcp-standalone-blog.html
https://mcpcat.io/guides/adding-custom-tools-mcp-server-python/
https://github.com/anthropics/skills/blob/main/skills/mcp-builder/reference/node_mcp_server.md
https://apify.com/jaroslavhejlek/validate-dataset-with-json-schema/api/mcp
https://dev.to/nickytonline/quick-fix-my-mcp-tools-were-showing-as-write-tools-in-chatgpt-dev-mode-3id9
https://graphite.com/guides/how-to-resolve-merge-conflicts-in-git
https://lobehub.com/skills/oocx-tfplan2md-merge-conflict-resolution
```
