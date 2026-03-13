# Heartbeat, Orphan Detection, and Adoption Protocol Design

**Research iteration:** 3
**Date:** 2026-03-12
**Scope:** Concrete protocol design for AI agent heartbeat, orphan detection, and task adoption in Sherpa's MCP coordination server.

---

## 1. Heartbeat Protocols in Production Systems

### 1.1 Google Chubby — KeepAlive + Grace Period + Jeopardy

**Source:** Burrows, "The Chubby lock service for loosely-coupled distributed systems," OSDI 2006, Section 2.8.
**Paper URL:** https://static.usenix.org/event/osdi06/tech/full_papers/burrows/burrows.pdf

Chubby's protocol is the gold standard for understanding session-based liveness:

- **Default lease extension:** 12 seconds. The master may increase this under load to reduce KeepAlive RPC volume.
- **KeepAlive is a blocking long-poll RPC.** The master holds the client's KeepAlive request without responding until the client's previous lease is close to expiring, then replies with the new lease timeout. The client immediately sends a new KeepAlive, so "there is almost always a KeepAlive call blocked at the master."
- **Events piggyback on KeepAlive replies.** Cache invalidations, lock events, and session events are delivered by releasing the blocked KeepAlive early. This means all Chubby RPCs flow client-to-master (important for firewalls).
- **Client maintains a conservative local lease timer.** It accounts for clock drift and KeepAlive RTT. When this local timer expires, the client is *unsure* whether the master has also expired the session.
- **Jeopardy state:** When the local lease timer expires, the client empties and disables its cache and emits a `jeopardy` event to the application. The application should quiesce (stop issuing operations) during jeopardy.
- **Grace period:** 45 seconds by default. The client waits this additional period, attempting to reconnect. If a successful KeepAlive exchange occurs, a `safe` event is emitted and the application resumes. If the grace period expires without reconnection, an `expired` event is emitted and the session is terminated.
- **Master failover:** The authoritative lease timer runs at the master. When the master dies, the timer stops — equivalent to extending all client leases. Clients enter jeopardy and wait. When a new master is elected, it uses conservative lease approximations. The grace period bridges the gap between the old master's last lease and the new master's first KeepAlive response.

**Key insight for Sherpa:** The three-state model (active → jeopardy → expired) with a grace period is directly applicable. An agent whose heartbeat lapses enters "jeopardy" — its authority is frozen but not yet revoked. This gives the agent time to recover from a transient issue (GC pause, network blip, slow tool call) without losing work.

### 1.2 ZooKeeper — Session Timeout Negotiation + Ephemeral Nodes

**Sources:**
- https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html
- https://zookeeper.apache.org/doc/current/zookeeperAdmin.html

- **tickTime:** Base time unit. Default example: 2000ms (2 seconds).
- **Session timeout bounds:** `minSessionTimeout = 2 * tickTime` (4s default), `maxSessionTimeout = 20 * tickTime` (40s default). Client requests a timeout; server clamps it to these bounds.
- **Client heartbeat:** The ZooKeeper client sends PING requests at `sessionTimeout / 3` interval to maintain the session. This is the canonical 1/3 ratio.
- **Server-side expiry:** "Expirations happen when the cluster does not hear from the client within the specified session timeout period."
- **Ephemeral nodes:** Automatically deleted when their owning session expires. This is the mechanism for presence detection — if an agent's ephemeral node disappears, it's gone.
- **Session states:** CONNECTING → CONNECTED → CLOSED (terminal). Session expiration appears as connected → disconnected → expired on reconnection.

**Key insight for Sherpa:** The negotiated timeout model is useful — agents could request different TTLs based on their role (interactive sessions need longer, background workers shorter). The 1/3 heartbeat ratio is a well-tested default.

### 1.3 etcd — Bidirectional Streaming Lease KeepAlive

**Sources:**
- https://etcd.io/docs/v3.5/learning/api/
- https://pkg.go.dev/go.etcd.io/etcd/client/v3
- https://etcd.io/docs/v3.5/dev-guide/interacting_v3/

- **LeaseKeepAlive** is a bidirectional gRPC streaming RPC. Client sends keepalive requests; server responds with refreshed TTL values.
- **Lease grant:** Client requests a TTL (in seconds); server may adjust and responds with actual TTL.
- **Automatic keepalive:** The Go client's `KeepAlive()` method runs a background loop, continuously renewing the lease. It returns a channel of `LeaseKeepAliveResponse` with the remaining TTL.
- **Expired lease:** Returns TTL of `-1`. All attached keys are automatically deleted.
- **Manual alternative:** `KeepAliveOnce()` for single renewal without the continuous loop.
- The Go client implementation likely sends keepalives at `TTL/3` intervals (consistent with ZooKeeper's pattern), though the documentation does not state this explicitly. The source code defines the interval internally.
- **Channel backpressure:** If keepalive responses aren't consumed, the client continues sending keepalives but drops responses — preventing channel blocking from causing lease expiry.

**Key insight for Sherpa:** The "attached keys expire with the lease" pattern maps directly to Sherpa's authority records. An agent's authority records could be attached to its lease — when the lease expires, all authority is automatically revoked.

### 1.4 Apache Kafka — Consumer Group Heartbeat

**Source:** https://docs.confluent.io/platform/current/installation/configuration/consumer-configs.html

- **session.timeout.ms:** 45000 (45 seconds) default. If the group coordinator receives no heartbeat within this interval, the consumer is considered dead and a rebalance is triggered.
- **heartbeat.interval.ms:** 3000 (3 seconds) default.
- **Canonical ratio:** "heartbeat.interval.ms should be set no higher than 1/3 of session.timeout.ms." This is the explicit 1/3 rule from Kafka's official documentation.
- Lower heartbeat interval = faster dead consumer detection at the cost of more network traffic.

**Key insight for Sherpa:** The 1/3 ratio is consistent across ZooKeeper and Kafka. For Sherpa's 30-minute interactive TTL, this suggests a heartbeat every 10 minutes — far too infrequent. The TTL for heartbeat purposes should be separate from (and shorter than) the authority TTL.

### 1.5 Temporal — Activity Heartbeat with Progress Payload

**Sources:**
- https://docs.temporal.io/encyclopedia/detecting-activity-failures
- https://docs.temporal.io/develop/go/failure-detection
- Temporal Go SDK source: `internal/internal_task_handlers.go`

- **Heartbeat Timeout:** Maximum interval between heartbeats. No default — must be explicitly set for each activity. Recommended for any long-running activity.
- **Heartbeat throttle (SDK-side):** The Temporal SDK does NOT send every `RecordHeartbeat()` call to the server. Instead:
  1. If heartbeat timeout is set: actual send interval = **80% of heartbeat timeout**
  2. If heartbeat timeout not set: default throttle interval = **30 seconds**
  3. Max throttle interval cap: **60 seconds**
  4. Within the throttle window, heartbeat calls only update local state. The last details are batched and sent when the timer fires.
- **Progress payload:** `RecordHeartbeat(ctx, details)` carries arbitrary progress data. On activity timeout/retry, the new worker reads `GetHeartbeatDetails()` to resume from where the previous worker left off.
- **Start-to-Close Timeout:** Maximum duration for a single activity execution attempt. "The Temporal Server doesn't detect failures when a Worker loses communication with the Server or crashes. Therefore, the Temporal Server relies on the Start-to-Close Timeout to force Activity retries."
- **Retry with progress:** When an activity times out via missed heartbeat, the last `details` value is available in the `TimeoutError`. A new worker can pick up at that point.

**Key insight for Sherpa:** The heartbeat-with-progress pattern is exactly what Sherpa needs. Agents should include structured progress data in heartbeats (current file, last commit SHA, completion percentage). When a new agent adopts an orphaned task, it receives this progress data.

### 1.6 BullMQ — Stalled Job Detection

**Sources:**
- https://docs.bullmq.io/guide/workers/stalled-jobs
- https://raw.githubusercontent.com/taskforcesh/bullmq/master/src/interfaces/worker-options.ts

- **lockDuration:** 30000ms (30 seconds) default. How long a job's lock is held.
- **lockRenewTime:** Half of lockDuration (~15000ms). The worker auto-renews the lock at this interval.
- **stalledInterval:** 30000ms (30 seconds). How often the stalled job checker runs.
- **maxStalledCount:** 1 (default). Number of times a job can be recovered from stalled state before being moved to `failed`.
- **How it works:** Worker acquires a lock on the job. If the worker doesn't renew the lock (because CPU-intensive work blocked the event loop, or the process crashed), the stalled checker moves the job back to `waiting` or to `failed` if maxStalledCount is exceeded.
- **Lock renewal is automatic** — the worker's event loop renews the lock every `lockRenewTime` ms. If the event loop is blocked (heavy computation), the lock expires.

**Key insight for Sherpa:** The lock → auto-renew → stalled-check pattern is simple and effective. The separation of `lockDuration` (how long the lock is valid) from `stalledInterval` (how often to check) allows tuning detection speed independently from lock lifetime.

### 1.7 Kubernetes — Liveness/Readiness/Startup Probes

**Source:** https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `initialDelaySeconds` | 0 | Delay before first probe |
| `periodSeconds` | 10 | Interval between probes |
| `timeoutSeconds` | 1 | Timeout for probe response |
| `failureThreshold` | 3 | Consecutive failures to declare unhealthy |
| `successThreshold` | 1 | Consecutive successes to declare healthy |

- **Liveness probe failure:** Container is killed and restarted. This is the nuclear option — equivalent to revoking authority and restarting the agent.
- **Readiness probe failure:** Container is removed from service endpoints but NOT restarted. Equivalent to pausing task dispatch to an agent without revoking its current work.
- **Startup probe:** Delays liveness/readiness checks during initialization. Relevant for agents that need time to load context before being considered healthy.
- **Probe types:** HTTP GET, TCP socket, exec command, gRPC. Multiple detection mechanisms.
- **Three consecutive failures** before declaring unhealthy — avoids false positives from transient issues.

**Key insight for Sherpa:** The failureThreshold concept (3 consecutive missed heartbeats before action) is important for AI agents. A single missed heartbeat could just mean the agent is thinking hard. Three missed heartbeats means it's probably gone.

### 1.8 Redis Redlock — Distributed Lock TTL

**Source:** https://redis.io/docs/latest/develop/use/patterns/distributed-locks/

- Lock TTL typically 10-30 seconds.
- Clock drift safety margin: ~2ms per second of TTL.
- Lock acquired on majority (N/2 + 1) of instances.
- Remaining validity = initial TTL - acquisition time. If negative, lock acquisition failed.
- **Auto-release:** Redis TTL ensures locks expire even on client crash.
- **Unique lock ID:** Prevents accidental release of another client's lock.

---

## 2. The Zombie Problem and Fencing Tokens

### 2.1 Kleppmann's Analysis

**Source:** Martin Kleppmann, "How to do distributed locking," 2016.
**URL:** https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html

The fundamental problem with all lease-based systems: **a client can believe it holds authority when it doesn't.**

**Failure scenario 1 — GC/Process pause:**
1. Client 1 acquires lease with token 33
2. Client 1 enters a long pause (GC, CPU saturation, context switch)
3. Lease expires while client is paused
4. Client 2 acquires lease with token 34
5. Client 1 resumes, believing it still holds the lease
6. Both clients write, causing corruption

**Failure scenario 2 — Network delay:**
A client sends a write request that gets delayed in the network. The lease expires before the request reaches the storage server. GitHub documented a real incident with ~90 seconds of packet delay.

**Solution — Fencing tokens:**
A monotonically increasing number assigned with each lease grant. Every write operation includes the fencing token. The storage server rejects writes with tokens lower than the highest it has seen.

- Client 1 gets token 33, pauses, lease expires
- Client 2 gets token 34, writes with token 34 (accepted)
- Client 1 resumes, writes with token 33 (rejected — server has seen 34)

**Key insight for Sherpa:** This is why the prior research established fence tokens as mandatory. Sherpa's authority system already includes fence tokens. Every mutation tool call must include the fence token; the MCP server rejects stale tokens. This protects against the zombie agent problem even when heartbeat detection fails.

### 2.2 Jepsen Findings on etcd Locks

**Source:** https://jepsen.io/analyses/etcd-3.4.3

- **etcd locks fundamentally fail to provide mutual exclusion**, even in healthy clusters. "Multiple clients may hold the same etcd lock simultaneously."
- Short-lived leases (1-3 second TTLs) "generally failed to provide mutual exclusion after only a few minutes of testing."
- With 2-second lease TTLs and 5 concurrent processes: "the loss of ~18% of acknowledged updates."
- Root cause: lock services "must sacrifice correctness in order to preserve liveness in asynchronous systems."

**Key insight for Sherpa:** Leases alone are not sufficient for correctness. The fence token is the safety net. Sherpa's architecture of lease TTL + fence token + server-side enforcement is the correct layered approach.

---

## 3. MCP Protocol's Built-in Ping Mechanism

**Source:** https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/ping

MCP includes an optional ping mechanism:

```json
{"jsonrpc": "2.0", "id": "123", "method": "ping"}
// Response:
{"jsonrpc": "2.0", "id": "123", "result": {}}
```

- Either client or server can initiate pings.
- Receiver MUST respond promptly.
- If no response within "a reasonable timeout," sender MAY consider connection stale, terminate, or attempt reconnection.
- Implementations SHOULD periodically issue pings with configurable frequency.
- Multiple failed pings MAY trigger connection reset.

**Key insight for Sherpa:** The MCP ping is transport-level only — it detects connection failure but not application-level liveness. An agent could respond to pings but be stuck in an infinite loop. Sherpa needs application-level heartbeat (via `heartbeat_authority` tool calls) in addition to transport-level ping.

**MCP Session Management (Streamable HTTP):**
**Source:** https://modelcontextprotocol.io/specification/2025-03-26/basic/transports

- Server assigns `Mcp-Session-Id` at initialization.
- Server MAY terminate session at any time, responding with HTTP 404 to subsequent requests.
- Client MUST start new session on receiving 404.
- Client SHOULD send HTTP DELETE to explicitly terminate session.

---

## 4. Heartbeat Interval Design for AI Agents

### 4.1 Why AI Agents Are Different from Microservices

Traditional heartbeat assumptions don't hold for AI agents:

| Factor | Microservice | AI Agent |
|--------|-------------|----------|
| Think time between actions | ~milliseconds | 10-60 seconds |
| Waiting for external input | Rare | Common (human approval) |
| Context loss without warning | Never | `/compact`, `/clear`, context exhaustion |
| Operation duration | Predictable | Highly variable (research vs. file write) |
| Self-awareness of health | Limited | Can detect context pressure |
| Process crash likelihood | Low (supervised) | Medium (session timeout, OOM) |

### 4.2 Implicit vs. Explicit Heartbeat

**Implicit heartbeat:** Any MCP tool call with a valid fence token counts as a heartbeat. The agent doesn't need a separate heartbeat call — using `write_file`, `read_file`, `update_task` etc. all renew the authority lease.

**Explicit heartbeat:** A dedicated `heartbeat_authority` tool call, used when the agent is:
- Thinking (long reasoning before acting)
- Waiting for human input
- Reading/analyzing without mutations
- Between task steps

**Recommended hybrid approach:**

```
// Any tool call with a valid fence_token resets the heartbeat timer:
write_file({ path: "...", content: "...", fence_token: "abc123" })
// → implicit heartbeat, authority TTL renewed

// When no mutations for a while, explicit heartbeat:
heartbeat_authority({ task_id: "T-42", fence_token: "abc123", progress: { ... } })
// → explicit heartbeat with progress data
```

### 4.3 Recommended Intervals

Based on the production system survey:

| System | Heartbeat Interval | Detection Time | Ratio |
|--------|-------------------|----------------|-------|
| ZooKeeper | sessionTimeout/3 | sessionTimeout | 1:3 |
| Kafka | 3s heartbeat, 45s session | 45s | 1:15 |
| K8s liveness | 10s period, 3 failures | 30s | — |
| BullMQ | 15s lock renew, 30s stall check | 30-60s | — |
| Temporal | 80% of heartbeat timeout | heartbeat timeout | 4:5 |
| Chubby | ~12s KeepAlive cycle | 12s + 45s grace | — |

**Recommended for Sherpa:**

- **Heartbeat TTL (authority liveness):** 5 minutes for interactive agents, 2 minutes for background workers.
- **Implicit heartbeat:** Any tool call with valid fence token resets the TTL.
- **Explicit heartbeat recommendation:** Every 60-90 seconds of inactivity (roughly 1/3 to 1/2 of the shortest TTL).
- **Detection time:** TTL expiry + jeopardy grace (1 minute) = 3-6 minutes for interactive, 2-3 minutes for background.
- **Why these numbers:** AI agents commonly go 10-60 seconds between tool calls during normal operation. A 5-minute TTL gives comfortable headroom. The 1-minute jeopardy grace period handles transient issues.

### 4.4 Adaptive Intervals

The heartbeat TTL could adapt based on agent state:

| Agent State | Heartbeat TTL | Rationale |
|-------------|---------------|-----------|
| Active mutation | 5 min | Tool calls serve as implicit heartbeat |
| Reading/analyzing | 5 min | Agent will eventually call a tool |
| Waiting for human | 30 min | Known pause, don't orphan prematurely |
| Background worker | 2 min | Should be steadily producing output |
| Explicitly paused | Suspended | Agent called `pause_authority`; no expiry |

An agent could request TTL adjustment: `heartbeat_authority({ ..., requested_ttl: 1800 })` when entering a long wait state.

---

## 5. Orphan Detection Protocol

### 5.1 Three-State Model (inspired by Chubby)

```
ACTIVE ──(TTL expires)──→ JEOPARDY ──(grace expires)──→ ORPHANED
   ↑                          │                              │
   └──(heartbeat received)────┘                              │
                                                             ↓
                                                         AVAILABLE
                                                       (for adoption)
```

**ACTIVE:** Authority is valid. Agent is producing heartbeats (implicit or explicit). Fence token is valid for mutations.

**JEOPARDY:** Authority TTL has expired, but the grace period is running. The fence token is still valid for reads but mutations are blocked (or logged with warnings). The MCP server emits a `jeopardy` notification if the transport supports it (Streamable HTTP SSE). If the agent sends a heartbeat during jeopardy, it returns to ACTIVE.

**ORPHANED:** Grace period has expired without heartbeat. Authority is revoked. Fence token is invalidated. Task status transitions to `orphaned`. All subsequent tool calls with the old fence token are rejected.

**AVAILABLE:** After cleanup (see below), the task is available for adoption by a new agent.

### 5.2 What Happens at Each Transition

**ACTIVE → JEOPARDY:**
- Authority record's `status` changes to `jeopardy`
- `jeopardy_at` timestamp recorded
- Mutations with this fence token start returning warnings (but are still accepted for a short window)
- Server attempts to notify agent via MCP ping or SSE
- Reaper begins watching this authority

**JEOPARDY → ACTIVE (recovery):**
- Heartbeat received with valid fence token
- Authority status returns to `active`
- `jeopardy_at` cleared
- Normal operations resume
- `recovery_count` incremented (for monitoring)

**JEOPARDY → ORPHANED:**
- Grace period expires
- Fence token invalidated in the fence token table
- Authority record status = `orphaned`, `orphaned_at` timestamp
- Task status transitions to `orphaned`
- Last heartbeat progress data preserved in `orphan_context`
- Reaper logs the event for observability

**ORPHANED → AVAILABLE:**
- Orphan context is assembled (see Section 5.3)
- Task status transitions to `available_for_adoption`
- Planner is notified (or auto-adoption kicks in, depending on policy)

### 5.3 Preserving Progress at Orphan Time

When a task is orphaned, the following context is preserved:

```typescript
interface OrphanContext {
  // From last heartbeat
  last_heartbeat_at: string;          // ISO timestamp
  progress_data: {                     // Structured progress from heartbeat payload
    current_step: string;              // e.g. "implementing-auth-middleware"
    files_modified: string[];          // Files touched during this authority window
    completion_estimate: number;       // 0.0-1.0 if the agent reported it
    last_action: string;               // e.g. "wrote src/auth/middleware.ts"
    custom: Record<string, unknown>;   // Agent-defined progress data
  };

  // From git state
  worktree_path: string | null;        // Path to active worktree
  branch_name: string;                 // Current branch
  last_commit_sha: string | null;      // Last commit on the branch
  uncommitted_changes: boolean;        // Whether worktree has uncommitted changes
  unpushed_commits: number;            // Commits ahead of remote

  // From authority record
  task_id: string;
  fence_token: string;                 // The now-invalidated token
  authority_granted_at: string;
  total_heartbeats: number;            // How many heartbeats were recorded
  jeopardy_count: number;              // How many times jeopardy was entered
}
```

### 5.4 Reaper Design

A periodic reaper process runs inside the MCP server:

```
Reaper interval: 30 seconds (configurable)

Every tick:
  1. SELECT authorities WHERE status = 'active'
     AND last_heartbeat_at < NOW() - heartbeat_ttl
     → Transition to JEOPARDY

  2. SELECT authorities WHERE status = 'jeopardy'
     AND jeopardy_at < NOW() - grace_period
     → Transition to ORPHANED

  3. SELECT authorities WHERE status = 'orphaned'
     AND orphaned_at < NOW() - cleanup_delay
     → Assemble OrphanContext, transition to AVAILABLE
```

The reaper runs on a single timer in the MCP server process. No distributed coordination needed because the MCP server is single-process + SQLite.

---

## 6. Adoption Protocol

### 6.1 Adoption Strategies

Based on survey of production systems:

| Strategy | How | When |
|----------|-----|------|
| **Auto-adopt (round-robin)** | Next available worker gets the task | Background workers, non-critical tasks |
| **Planner-reassign** | Planner agent explicitly decides who gets the task | Complex tasks requiring context about agent capabilities |
| **Priority-based auto-adopt** | Critical tasks auto-adopted, others wait for Planner | Mixed workloads |
| **Self-adopt** | Same agent (new session) reclaims its own task | Context loss via /compact or /clear |

**Recommended for Sherpa:** Planner-reassign as default, with auto-adopt as an option for background workers. The Planner has context about agent capabilities and workload that a round-robin algorithm lacks.

### 6.2 Adoption Handoff Protocol

```
1. DETECT: Reaper transitions task to AVAILABLE

2. NOTIFY: Planner receives orphan notification
   {
     event: "task_orphaned",
     task_id: "T-42",
     orphan_context: { ... },
     adoption_policy: "planner-reassign" | "auto-adopt"
   }

3. ASSIGN: Planner (or auto-adopter) calls:
   adopt_task({
     task_id: "T-42",
     agent_id: "worker-3",
     strategy: "resume" | "restart"
   })

4. GRANT: MCP server:
   - Creates new authority record for adopting agent
   - Issues new fence token
   - Passes OrphanContext to adopting agent
   - Task status → "in_progress"

5. RESUME/RESTART: Adopting agent receives:
   {
     task: { ... },
     fence_token: "new-token-xyz",
     orphan_context: { ... },      // Progress from previous agent
     recommended_action: "resume_from_branch" | "start_fresh"
   }
```

### 6.3 Resume vs. Restart Decision

The adopting agent (or Planner) must decide whether to resume or restart:

**Resume (from branch state):**
- Orphan context shows significant progress (completion > 0.3)
- Branch has commits (work is persisted in git)
- No uncommitted changes (clean state)
- Task definition hasn't changed since orphaning

**Restart (from scratch):**
- Orphan context shows minimal progress
- Uncommitted changes that may be inconsistent
- Task definition was updated while orphaned
- Previous agent entered jeopardy multiple times (unstable work)

### 6.4 What the Adopting Agent Receives

```typescript
// The adopting agent's first tool response includes:
interface AdoptionBriefing {
  task: TaskDefinition;              // Full task spec
  fence_token: string;               // New, valid fence token
  worktree_path: string;             // Existing worktree to work in
  branch_name: string;               // Branch with prior work
  orphan_context: OrphanContext;     // Full context from Section 5.3
  adoption_notes: string;            // Planner's instructions for the adopter
  recommended_action: "resume" | "restart";
}
```

---

## 7. Multi-Agent Failure Modes

### 7.1 Failure Mode Taxonomy

| Failure Mode | Detection Method | Speed | Graceful? |
|-------------|-----------------|-------|-----------|
| Context window exhaustion | Agent self-reports via heartbeat | Predictable | Yes |
| `/compact` or `/clear` | Agent self-reports before command | Instant | Yes |
| Session timeout | MCP transport disconnection | Transport-dependent | No |
| Process crash | Heartbeat TTL expiry | TTL + grace | No |
| Network partition | Heartbeat TTL expiry | TTL + grace | No |
| Agent hang/infinite loop | Heartbeat TTL expiry | TTL + grace | No |
| Slow degradation | Heartbeat TTL still OK but no progress | Not detected by heartbeat | No |

### 7.2 Handling Each Failure Mode

**Context window exhaustion (graceful):**
Agent can detect context pressure and self-report:
```
heartbeat_authority({
  task_id: "T-42",
  fence_token: "abc123",
  progress: { ..., context_pressure: 0.85 },
  signal: "context_pressure"
})
```
The MCP server can proactively trigger adoption before the agent loses context. The agent's final action should be a detailed progress dump.

**`/compact` or `/clear` (graceful):**
The agent knows it's about to lose context. Before executing the command, it should:
1. Call `heartbeat_authority` with full progress data
2. Commit any uncommitted changes
3. Call `release_authority` or `suspend_authority`

After context reset, the same agent (new session) can call `reclaim_task` with its agent ID to self-adopt.

**Session timeout / Process crash (ungraceful):**
No opportunity for graceful handoff. The heartbeat TTL + jeopardy + grace period handle detection. The OrphanContext is assembled from the last heartbeat data + git state inspection.

**Network partition (ambiguous):**
The agent is alive but can't reach the MCP server. This is the hardest case:
- Agent's local work continues (it's editing files)
- MCP server sees no heartbeats → jeopardy → orphaned
- Another agent may be assigned the same task
- When the original agent reconnects, its fence token is invalid
- **Resolution:** The original agent's tool calls fail with "fence token invalid." It must stop work and call `reclaim_task` or report to the Planner.

**Agent hang / infinite loop:**
Indistinguishable from network partition from the server's perspective. Detected only by heartbeat TTL expiry. No progress despite tool calls might indicate a loop, but this requires progress-aware monitoring beyond simple heartbeat.

**Slow degradation:**
The hardest to detect. Agent is alive, heartbeating, but making no meaningful progress. This requires semantic monitoring:
- Track `progress.completion_estimate` over time
- If no change across multiple heartbeats, flag for Planner review
- This is a monitoring concern, not a heartbeat concern

### 7.3 The Zombie Agent Problem in Sherpa

A "zombie" is an agent that thinks it has authority but doesn't. This can happen when:
1. Agent pauses (thinking, waiting for API response)
2. Heartbeat TTL expires during the pause
3. Authority revoked, task adopted by another agent
4. Original agent resumes and tries to write

**Sherpa's defense (layered):**

| Layer | Mechanism | Source |
|-------|-----------|--------|
| 1. Heartbeat TTL | Early warning that authority may expire | All systems |
| 2. Jeopardy state | Grace period before revocation | Chubby |
| 3. Fence token validation | Server rejects writes with stale tokens | Kleppmann |
| 4. Monotonic fence tokens | Higher token always wins | Kleppmann |
| 5. Git branch isolation | Even if a zombie writes, it's on its own branch | Sherpa-specific |

Layer 5 is unique to Sherpa. Because agents work in isolated git worktrees, a zombie agent's writes are confined to its branch. Even if fence token validation somehow fails, the damage is limited to an orphaned branch that can be reviewed and merged or discarded.

---

## 8. Production War Stories and Lessons

### 8.1 Jepsen on etcd: Locks Don't Lock
**Source:** https://jepsen.io/analyses/etcd-3.4.3

Short-lived leases (1-3s TTL) caused lock violations within minutes. With 5 concurrent processes and 2-second TTLs, 18% of acknowledged updates were lost. Root cause: in asynchronous systems, you cannot guarantee mutual exclusion with leases alone. Fence tokens are the safety net.

**Lesson for Sherpa:** Never rely solely on lease TTL for safety. The fence token is the true guard. The heartbeat/lease is for *liveness detection*, not *safety*.

### 8.2 Kleppmann on GitHub: 90-Second Network Delays
**Source:** https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html

GitHub experienced approximately 90 seconds of packet delay in a real incident. Any lease shorter than 90 seconds would have expired, creating zombie clients.

**Lesson for Sherpa:** Network delays can exceed any reasonable heartbeat TTL. Fence tokens protect against this. The jeopardy grace period should be generous (1+ minutes).

### 8.3 Amazon on Health Checks: The Correlated Failure Trap
**Source:** https://aws.amazon.com/builders-library/implementing-health-checks/

Amazon warns that thorough health checks create a new failure mode: if the health check itself depends on a shared dependency, all instances fail the check simultaneously. "The automation surrounding health checks should stop directing traffic to a single bad server but keep allowing traffic if the entire fleet appears to be having trouble."

Also: a server rendering blank error pages "lost the ability to report its health into monitoring systems, so it was not taken out of service automatically." The health check itself failed silently.

**Lesson for Sherpa:** If the MCP server itself goes down, all agents lose their heartbeat channel simultaneously. The system must handle "all agents appear dead" differently from "one agent appears dead." If all agents lose heartbeat at the same time, don't orphan everything — wait for the MCP server to recover.

### 8.4 Amazon on Timeouts: Retries Are Selfish
**Source:** https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/

"Retries are selfish" — they increase backend load during failures. After detecting an orphan, the adoption protocol should use exponential backoff with jitter before reassigning, to avoid thundering herd effects when multiple tasks orphan simultaneously (e.g., after MCP server restart).

---

## 9. Implications for Sherpa's Design

### 9.1 Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│ MCP Coordination Server (single process)         │
│                                                   │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ Heartbeat    │  │ Authority    │              │
│  │ Tracker      │  │ Manager      │              │
│  │              │  │              │              │
│  │ - TTL per    │  │ - Fence      │              │
│  │   authority  │  │   tokens     │              │
│  │ - Last HB    │  │ - Grant/     │              │
│  │   timestamp  │  │   revoke     │              │
│  │ - Progress   │  │ - Validate   │              │
│  │   payload    │  │              │              │
│  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                      │
│  ┌──────▼──────────────────▼───────┐             │
│  │         SQLite (WAL mode)        │             │
│  │                                   │             │
│  │  authorities:                     │             │
│  │    id, task_id, agent_id,        │             │
│  │    fence_token, status,          │             │
│  │    heartbeat_ttl, last_hb_at,    │             │
│  │    jeopardy_at, orphaned_at,     │             │
│  │    progress_json, recovery_count │             │
│  │                                   │             │
│  │  fence_tokens:                    │             │
│  │    token, authority_id,          │             │
│  │    issued_at, invalidated_at,    │             │
│  │    sequence_number (monotonic)   │             │
│  │                                   │             │
│  │  orphan_contexts:                 │             │
│  │    task_id, context_json,        │             │
│  │    assembled_at                  │             │
│  └───────────────────────────────────┘             │
│                                                   │
│  ┌──────────────┐                                │
│  │ Reaper       │ (30s interval timer)           │
│  │ - Check TTLs │                                │
│  │ - Jeopardy   │                                │
│  │ - Orphan     │                                │
│  │ - Cleanup    │                                │
│  └──────────────┘                                │
└─────────────────────────────────────────────────┘
```

### 9.2 Tool API Summary

| Tool | Purpose | Heartbeat Effect |
|------|---------|-----------------|
| `acquire_authority` | Claim authority over a task | Starts heartbeat clock |
| `release_authority` | Gracefully release authority | Stops heartbeat clock |
| `heartbeat_authority` | Explicit heartbeat with progress | Resets TTL |
| `suspend_authority` | Pause authority (long wait) | Suspends TTL |
| `adopt_task` | Adopt an orphaned task | Starts new heartbeat clock |
| `reclaim_task` | Self-adopt after context loss | Starts new heartbeat clock |
| Any mutation tool | Implicit heartbeat via fence token | Resets TTL |

### 9.3 Configuration Defaults

```typescript
const defaults = {
  heartbeat: {
    interactive_ttl: 300_000,      // 5 minutes
    background_ttl: 120_000,       // 2 minutes
    waiting_ttl: 1_800_000,        // 30 minutes (human approval wait)
    jeopardy_grace: 60_000,        // 1 minute
    reaper_interval: 30_000,       // 30 seconds
    max_jeopardy_count: 3,         // orphan after 3 jeopardy entries
  },
  adoption: {
    default_policy: "planner-reassign",
    auto_adopt_delay: 5_000,       // 5 seconds after AVAILABLE
    backoff_base: 1_000,           // 1 second exponential backoff base
    backoff_max: 30_000,           // 30 second max backoff
    resume_threshold: 0.3,         // Resume if > 30% complete
  },
  fence: {
    token_length: 16,              // 16-byte random token
    sequence_monotonic: true,      // Monotonically increasing sequence numbers
  },
};
```

---

## 10. Open Questions

1. **Should jeopardy block mutations or just warn?** Chubby blocks all operations during jeopardy. For Sherpa, blocking mutations but allowing reads might be better — the agent can still analyze but can't corrupt state.

2. **How to handle simultaneous mass orphaning?** If the MCP server restarts, all agents appear to orphan simultaneously. Need a "global jeopardy" mode that extends all grace periods.

3. **Can the agent self-detect context pressure and proactively hand off?** Claude Code doesn't expose token usage to the agent. The agent would need to estimate based on conversation length.

4. **What progress data format is most useful for adoption?** Temporal uses opaque bytes. Sherpa could define a structured schema or use free-form JSON. Structured is more useful for automated resume decisions.

5. **Should `reclaim_task` require Planner approval or be automatic?** If an agent /compacts and comes back, should it automatically get its old task back, or should the Planner decide? Auto-reclaim is faster; Planner approval is safer.

6. **Heartbeat TTL vs. authority TTL — should these be separate concepts?** Currently authority has a TTL (30 min interactive, 10 min background from prior research). Heartbeat TTL (5 min / 2 min) is shorter. The authority TTL could be the outer bound, with heartbeat TTL as the liveness check within it.

7. **How does the reaper handle SQLite contention?** The reaper reads and writes authority records every 30 seconds. With WAL mode and the single-process server, this should be fine, but needs benchmarking under load (50+ active authorities).

---

## Sources

### Primary References (papers, specifications, official docs)

| # | Source | URL | Description |
|---|--------|-----|-------------|
| 1 | Chubby paper (Burrows, OSDI 2006) | https://static.usenix.org/event/osdi06/tech/full_papers/burrows/burrows.pdf | Original Chubby paper — KeepAlive, jeopardy, grace period |
| 2 | ZooKeeper Programmer's Guide | https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html | Session management, ephemeral nodes, heartbeat |
| 3 | ZooKeeper Admin Guide | https://zookeeper.apache.org/doc/current/zookeeperAdmin.html | tickTime, session timeout bounds |
| 4 | etcd Learning API | https://etcd.io/docs/v3.5/learning/api/ | Lease service, bidirectional streaming KeepAlive |
| 5 | etcd Go client API | https://pkg.go.dev/go.etcd.io/etcd/client/v3 | KeepAlive method, channel semantics |
| 6 | etcd Interacting v3 | https://etcd.io/docs/v3.5/dev-guide/interacting_v3/ | Lease grant + keepalive CLI examples |
| 7 | Temporal failure detection (Go) | https://docs.temporal.io/develop/go/failure-detection | Heartbeat API, timeout types |
| 8 | Temporal failure detection (Java) | https://docs.temporal.io/develop/java/failure-detection | Heartbeat throttle, progress details |
| 9 | Temporal failure detection encyclopedia | https://docs.temporal.io/encyclopedia/detecting-activity-failures | Three timeout types, heartbeat best practices |
| 10 | BullMQ stalled jobs | https://docs.bullmq.io/guide/workers/stalled-jobs | Stalled job detection mechanism |
| 11 | BullMQ worker options | https://raw.githubusercontent.com/taskforcesh/bullmq/master/src/interfaces/worker-options.ts | Default values: lockDuration, stalledInterval, maxStalledCount |
| 12 | BullMQ workers guide | https://docs.bullmq.io/guide/workers | Worker lock management |
| 13 | Kubernetes probes | https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ | Liveness/readiness/startup probe configuration |
| 14 | Kafka consumer configs | https://docs.confluent.io/platform/current/installation/configuration/consumer-configs.html | session.timeout.ms, heartbeat.interval.ms, 1/3 ratio |
| 15 | MCP Ping specification | https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/ping | MCP ping/pong mechanism |
| 16 | MCP Transports specification | https://modelcontextprotocol.io/specification/2025-03-26/basic/transports | MCP session management, Streamable HTTP |
| 17 | Redis distributed locks | https://redis.io/docs/latest/develop/use/patterns/distributed-locks/ | Redlock algorithm, TTL, clock drift |

### Analysis and War Stories

| # | Source | URL | Description |
|---|--------|-----|-------------|
| 18 | Kleppmann on distributed locking | https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html | Zombie problem, fencing tokens, GitHub 90s delay |
| 19 | Jepsen etcd 3.4.3 analysis | https://jepsen.io/analyses/etcd-3.4.3 | etcd lock mutual exclusion failures, 18% update loss |
| 20 | Jepsen analyses index | https://jepsen.io/analyses | Index of distributed systems testing |
| 21 | Amazon health checks | https://aws.amazon.com/builders-library/implementing-health-checks/ | Correlated failure trap, fleet-wide false positives |
| 22 | Amazon timeouts/retries | https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/ | Exponential backoff, jitter, "retries are selfish" |
| 23 | Azure health endpoint monitoring | https://learn.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring | Health endpoint monitoring pattern |
| 24 | Azure leader election | https://learn.microsoft.com/en-us/azure/architecture/patterns/leader-election | Lease-based leader election, blob leases |
| 25 | Azure Service Fabric lifecycle | https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-reliable-services-lifecycle | Stateful service lifecycle, primary swap |
| 26 | Uber reliable reprocessing | https://www.uber.com/blog/reliable-reprocessing/ | Dead letter queues, retry cascading |
| 27 | GitHub monorepo performance | https://github.blog/2021-01-28-improving-large-monorepo-performance-on-github/ | Lock contention, timeout war stories |
| 28 | Temporal Go SDK source (heartbeat throttle) | https://github.com/temporalio/sdk-go/blob/master/internal/internal_task_handlers.go | 80% throttle formula, 30s default, 60s max |
| 29 | etcd API reference | https://etcd.io/docs/v3.5/dev-guide/api_reference_v3/ | Lease service RPC definitions |
| 30 | Google Cloud distributed locking | https://cloud.google.com/blog/products/gcp/practical-guide-to-distributed-locking | Distributed lock best practices |
| 31 | Chubby paper (alternate mirror) | https://www.cs.cmu.edu/~15712/papers/chubby.pdf | Alternate PDF location |
| 32 | Chubby paper (Cornell mirror) | https://www.cs.cornell.edu/courses/cs6452/2012sp/papers/chubby-osdi06.pdf | Alternate PDF location |
| 33 | Google SRE Book Ch26 | https://sre.google/sre-book/managing-critical-state/ | Chubby mentions in context of consensus |

### Raw Links (every URL encountered during research)

```
https://etcd.io/docs/v3.5/dev-guide/interacting_v3/
https://etcd.io/docs/v3.5/learning/api/
https://etcd.io/docs/v3.5/dev-guide/api_reference_v3/
https://etcd.io/docs/v3.5/faq/
https://pkg.go.dev/go.etcd.io/etcd/client/v3
https://pkg.go.dev/go.etcd.io/etcd/client/v3#Lease
https://github.com/etcd-io/etcd/blob/main/client/v3/lease.go
https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html
https://zookeeper.apache.org/doc/current/zookeeperAdmin.html
https://docs.temporal.io/develop/go/failure-detection
https://docs.temporal.io/develop/java/failure-detection
https://docs.temporal.io/develop/typescript/failure-detection
https://docs.temporal.io/encyclopedia/detecting-activity-failures
https://docs.temporal.io/encyclopedia/activity-heartbeats
https://docs.temporal.io/references/configuration
https://docs.temporal.io/develop/activity-failures
https://docs.temporal.io/develop/go/heartbeat-an-activity
https://legacy-documentation-sdks.temporal.io/typescript/activities
https://community.temporal.io/t/heartbeat-timeout-and-heartbeat-interval/4006
https://community.temporal.io/t/what-is-the-recommended-heartbeat-interval/1728
https://github.com/temporalio/sdk-go/blob/master/internal/internal_task_handlers.go
https://github.com/temporalio/sdk-go/blob/master/internal/activity.go
https://github.com/temporalio/sdk-go/search?q=heartbeatThrottle
https://github.com/temporalio/sdk-go/blob/c32b04729cc5b2e51c22e66eff3db1a0aa8488c1/internal/activity.go
https://raw.githubusercontent.com/temporalio/sdk-go/refs/heads/master/workflow/activity_options.go
https://raw.githubusercontent.com/temporalio/sdk-go/refs/heads/master/internal/activity.go
https://github.com/temporalio/sdk-core/blob/main/core/src/worker/activities.rs
https://github.com/temporalio/sdk-python/blob/main/temporalio/worker/_activity.py
https://github.com/temporalio/features/issues/23
https://pkg.go.dev/go.temporal.io/sdk/internal#pkg-constants
https://pkg.go.dev/go.temporal.io/sdk/workflow#ActivityOptions
https://temporal.io/blog/activity-heartbeats-in-temporal
https://docs.bullmq.io/guide/workers/stalled-jobs
https://docs.bullmq.io/guide/workers
https://docs.bullmq.io/guide/workers/auto-run
https://api.bullmq.io/interfaces/v4.WorkerOptions.html
https://raw.githubusercontent.com/taskforcesh/bullmq/master/src/interfaces/worker-options.ts
https://github.com/taskforcesh/bullmq/blob/master/src/classes/worker.ts
https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
https://docs.confluent.io/platform/current/installation/configuration/consumer-configs.html
https://kafka.apache.org/documentation/#consumerconfigs_session.timeout.ms
https://redis.io/docs/latest/develop/use/patterns/distributed-locks/
https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
https://jepsen.io/analyses
https://jepsen.io/analyses/etcd-3.4.3
https://static.usenix.org/event/osdi06/tech/full_papers/burrows/burrows.pdf
https://www.cs.cmu.edu/~15712/papers/chubby.pdf
https://www.cs.cornell.edu/courses/cs6452/2012sp/papers/chubby-osdi06.pdf
https://storage.googleapis.com/pub-tools-public-publication-data/pdf/26740.pdf
https://web.stanford.edu/class/cs244b/papers/chubby.pdf
https://sre.google/sre-book/managing-critical-state/
https://cloud.google.com/blog/products/gcp/practical-guide-to-distributed-locking
https://aws.amazon.com/builders-library/implementing-health-checks/
https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
https://learn.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring
https://learn.microsoft.com/en-us/azure/architecture/patterns/leader-election
https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-reliable-services-lifecycle
https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/ping
https://modelcontextprotocol.io/specification/2025-03-26/basic/transports
https://modelcontextprotocol.io/specification/2025-03-26/server/utilities/heartbeats
https://www.uber.com/blog/reliable-reprocessing/
https://github.blog/2021-01-28-improving-large-monorepo-performance-on-github/
https://docs.celeryq.dev/en/stable/userguide/workers.html
https://www.confluent.io/blog/cooperative-rebalancing-in-kafka-streams-consumer-ksqldb/
https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips
https://www.anthropic.com/news/claude-code-best-practices
https://medium.com/the-internals-of-google-chubby/the-internals-of-google-chubby-8cf9a28be3b8
https://www.micahlerner.com/2021/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems.html
https://medium.com/@jaydeep.addweb/distributed-locking-chubby-google-7abed0e37e74
https://people.cs.rutgers.edu/~pxk/417/notes/chubby.html
https://en.wikipedia.org/wiki/Chubby_(service)
https://medium.com/coinmonks/chubby-a-centralized-lock-service-for-distributed-applications-390571273052
https://www.turing.com/kb/chubby-lock-service
https://www.the-paper-trail.org/post/2014-07-01-the-chubby-lock-service-for-loosely-coupled-distributed-systems/
https://blog.acolyer.org/2015/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems/
https://www.educative.io/courses/grokking-adv-system-design-intvw/chubby-sessions-and-events
https://www.designgurus.io/course-play/grokking-the-advanced-system-design-interview/doc/638d2ff8ae0fd94f76f058e6
https://systemdesign.one/chubby-lock-service-google/
https://www.baeldung.com/cs/chubby-lock-service
https://medium.com/@_amanarora/the-chubby-lock-service-for-loosely-coupled-distributed-systems-9b91e29a7e77
https://distributed-computing-musings.com/2022/02/paper-notes-the-chubby-lock-service-for-loosely-coupled-distributed-systems/
https://medium.com/@minhaz217/how-google-chubby-lock-service-keeps-distributed-systems-in-line-5b9ffa5f1e5f
https://hackernoon.com/chubby-a-google-lock-service-for-distributed-systems-part-1
https://priyankvex.wordpress.com/2019/10/06/the-chubby-lock-service-for-loosely-coupled-distributed-systems-paper-summary/
https://levelup.gitconnected.com/the-chubby-lock-service-for-loosely-coupled-distributed-systems-f2ef40c9310b
https://www.cs.yale.edu/homes/aspnes/pinewiki/Chubby.html
https://www.cs.virginia.edu/~cr4bd/6324/S2021/chubby.html
https://courses.cs.washington.edu/courses/cse452/22wi/slides/chubby.pdf
https://www.cs.cornell.edu/courses/cs6452/2012sp/slides/chubby.pdf
https://www.cs.princeton.edu/courses/archive/fall18/cos518/docs/L8-chubby.pdf
https://medium.com/@felipedutratine/leader-election-with-etcd-20d70f8e4df4
https://www.morling.dev/blog/locking-and-leader-election-with-etcd/
https://making.pusher.com/ephemeral-consistent-discovery-using-etcd/
https://pusher.com/blog/ephemeral-consistent-discovery-using-etcd/
https://sookocheff.com/post/time/how-does-the-zookeeper-session-timer-work/
https://www.ibm.com/docs/en/mq/9.3?topic=problems-heartbeat-interval
https://www.ibm.com/docs/en/was-liberty/base?topic=overview-heartbeat-failure-detection
https://docs.oracle.com/en/middleware/standalone/coherence/14.1.2/develop-applications/using-coherence-tcp-ring-member-death-detection.html
https://docs.coherence.community/docs/core/04_cdi/090_extractors.html
https://serverlessland.com/event-driven-architecture/visuals/heartbeat-pattern
https://philcalcado.com/2017/08/03/pattern_service_mesh.html
https://www.scattered-thoughts.net/writing/distributing-trust/
https://www.joyfulbikeshedding.com/blog/2021-03-02-the-difficulty-of-distributed-systems.html
https://blog.cloudflare.com/a-byzantine-failure-in-the-real-world/
https://www.igvita.com/2010/04/30/distributed-locks-with-chubby/
https://www.linkedin.com/pulse/deep-dive-googles-chubby-distributed-lock-service-shivam-srivastava/
```
