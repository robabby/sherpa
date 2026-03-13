# Authority State Machine: Game Authority Transfer Protocols to MCP Tool Call Sequences

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** Designing the complete state machine that connects Sherpa's six MCP authority tools — mapping every state, every transition trigger, and every edge case using sourced evidence from game networking, distributed locks, and task orchestration systems.

---

## Key Discoveries

### 1. The Improbable Patent Defines a Three-State Machine with Bounded Timeout

The patent (US10878146B2) defines three primary authority states with an optional fourth:

- **AUTHORITATIVE** (state 1210) — Worker holds write authority
- **AUTHORITY_LOSS_IMMINENT** (state 1215) — Grace period after notification
- **NOT_AUTHORITATIVE** (state 1205) — Authority has been revoked
- **GAINING_AUTHORITY** (optional) — For the incoming worker during physics simulations

**State transitions (sourced from patent Fig 12-13):**

```
AUTHORITATIVE
  ├── [Runtime determines handover needed] → AUTHORITY_LOSS_IMMINENT
  │     Timer starts (configurable: 32ms-1000ms, default ~100ms)
  │     Worker MAY: save final state, buffer commands, signal readiness
  │     Worker MAY NOT: new writes after signaling readiness
  │
  ├── [Timer expires OR worker signals readiness] → NOT_AUTHORITATIVE
  │     Runtime collects final state updates (step 1318)
  │     Runtime sends accumulated state to new worker
  │     New worker enters AUTHORITATIVE state
  │
  └── [Worker crashes / stops responding] → NOT_AUTHORITATIVE
        Runtime forces transfer after timeout ("constant-bounded time")
```

**Critical design choices from the patent:**
- Authority operates at **component level, not entity level**. Multiple components within one entity can have different authoritative workers. Quote: "Component 510 may have at most one writer assigned to it at any one time."
- Authority is tracked via a map: `SetComponentAuthority(eid, cid, authority)` where authority is an enumerated three-state type.
- The timeout is **wall-clock based**, not tick-based. Quote: "amount of time between the runtime notifying the worker that it is losing authority to the runtime notifying the worker that it has lost authority."
- The timeout of zero disables soft handover entirely — authority transfers immediately.
- Workers should "save their state periodically because a message from the runtime indicating that the worker is about to lose authority might not arrive."

**The runtime (not workers) decides who receives authority next**, using a load-balancing algorithm based on spatial position and processing load ("load density center" and "tensile energy" calculations).

**Concurrent requests:** The patent does not explicitly describe conflict resolution for simultaneous requests. It assumes the runtime makes sequential decisions. The runtime is the single point of coordination.

Source: [US Patent 10,878,146 (Google Patents)](https://patents.google.com/patent/US10878146B2/en)

### 2. coherence's Three Transfer Modes Map to Different Agent Interactions

coherence defines three transfer modes with distinct handshake protocols:

**Request mode (two-step handshake):**
1. Requester calls `RequestAuthorityAsync(AuthorityType.Full)`
2. Current holder receives `OnAuthorityRequest` callback with `AuthorityRequest` object
3. Holder calls `request.Respond(bool)` to approve or deny
4. Requester receives success/failure result asynchronously
5. **10-second timeout** as fail-safe if holder never responds
6. If denied: request fails with "Request Rejected Error"

**Steal mode (immediate takeover):**
- Authority transfers on first-come-first-served basis without holder approval
- No negotiation step
- Analogous to Azure Blob's `Break` operation

**NotTransferable mode (permanent ownership):**
- Authority cannot be transferred at all
- Blocks even owner-initiated transfers

**Eleven failure result types defined:**
- Canceled, Entity Not Synchronized With Network, Entity Orphaned Error, Entity Not Transferable Error, Request Rejected Error, Already Has Authority Error, Invalid Authority Type Error, Entity Is Client Connection Error, Timeout Error

**Split authority model:**
- **State Authority** — authorized to change synced properties. Changes without State Authority are "immediately reverted by the system."
- **Input Authority** — permitted to send commands to the State Authority holder, who processes inputs and distributes new state
- **Full Authority** — both State and Input authority (typical default)

This split maps directly to Sherpa: Worker has State Authority (can write files), Planner has Input Authority (can send task definitions/directives to the Worker).

Sources:
- [coherence Authority Transfer](https://docs.coherence.io/manual/authority/authority-transfer)
- [coherence Authority Overview](https://docs.coherence.io/manual/authority)

### 3. Orphaned Entities Are a First-Class State

coherence formalizes the orphan state:

- **Trigger:** Entity abandoned by owner (`AbandonAuthority()`) or owner disconnects
- **Behavior:** "Orphaned entities are not simulated, so the values of their synced properties don't change" — state freezes
- **Detection:** The Replication Server detects disconnection and marks entities as orphaned
- **Adoption:** Two paths:
  - **Auto-adopt** — if entity has `Auto-Adopt Orphan` enabled, the Replication Server assigns it to a Client "as soon as possible"
  - **Manual adoption** — other clients call `CoherenceSync.Adopt()` to claim orphaned entities
- **Non-persistent entities** are deleted when abandoned; **persistent entities** remain as orphans
- **Remote entities** (no local authority) can still receive network commands and authority transfer requests

Source: [coherence Authority Overview](https://docs.coherence.io/manual/authority)

### 4. Azure Blob Lease Has the Most Complete Production State Machine

Azure Blob Storage defines **five lease states** with a full transition matrix:

**States:**
| State | Locked? | Renewable? | Description |
|-------|---------|------------|-------------|
| **Available** | No | N/A | No active lease, can be acquired |
| **Leased** | Yes | Yes | Active lease with holder |
| **Expired** | No | Yes | Duration elapsed, holder can still renew if blob unmodified |
| **Breaking** | Yes | No | Lease broken but break period not yet elapsed |
| **Broken** | No | No | Break period elapsed, ready for new acquisition |

**Key operations and their effects by state:**

| Operation | Available | Leased(A) | Breaking(A) | Broken(A) | Expired(A) |
|-----------|-----------|-----------|-------------|-----------|------------|
| Acquire(new) | Leased(X) | Fails(409) | Fails(409) | Leased(X) | Leased(X) |
| Acquire(A) | Leased(A) | Leased(A), new duration | Fails(409) | Leased(A) | Leased(A) |
| Break(period>0) | Fails(409) | Breaking(A) | Breaking(A) | Broken(A) | Broken(A) |
| Break(period=0) | Fails(409) | Broken(A) | Broken(A) | Broken(A) | Broken(A) |
| Renew(A) | Fails(409) | Leased(A), clock reset | Fails(409) | Fails(409) | Leased(A) if unmodified |
| Release(A) | Fails(409) | Available | Available | Available | Available |
| Change(A→B) | Fails(409) | Leased(B) | Fails(409) | Fails(409) | Fails(409) |
| Duration expires | Available | Expired(A) | Broken(A) | Broken(A) | Expired(A) |

**Critical insight — the Breaking state:**
- After `Break` is called, the lease enters **Breaking** state where it's still locked (existing holder retains write access with their lease ID) but no new lease can be acquired
- A configurable break period (0-60 seconds) elapses before the lease becomes Broken/Available
- During Breaking: only `release` and `break` operations are permitted
- This is the **exact analog of AUTHORITY_LOSS_IMMINENT** — a grace period where the current holder can finalize but no new holder can take over yet

**Write operations during lease states:**
- **Leased(A):** Write with lease A succeeds; write without lease fails (412 Precondition Failed); write with wrong lease fails (409 Conflict)
- **Breaking(A):** Write with lease A still succeeds (holder can flush); all other writes fail
- **Available/Broken/Expired:** Write without lease succeeds; write with any lease ID fails (412)

Source: [Azure Lease Blob REST API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob)

### 5. Raft's Term Number Is the Canonical Fencing Token Pattern

Raft consensus uses **term numbers** as logical clocks that implement exactly the fencing token pattern:

**Three states:** Follower, Candidate, Leader

**Term numbers serve as epoch counters:**
- Increment when a new election begins
- Each term has at most one leader
- Any node receiving an RPC with a higher term immediately reverts to Follower
- "Ensures that a given term has a single leader"

**State transitions:**
```
FOLLOWER
  ├── [election timeout expires] → CANDIDATE (increment term)
  │     ├── [receives majority votes] → LEADER
  │     ├── [election timeout expires again] → CANDIDATE (increment term)
  │     └── [receives RPC with higher term] → FOLLOWER
  │
  └── [receives RPC with higher term] → FOLLOWER

LEADER
  └── [receives RPC with higher term] → FOLLOWER
```

**Key property for Sherpa:** The term number is a monotonically increasing integer that uniquely identifies each authority epoch. When any node sees a higher term, it immediately defers. This is the same mechanism as fencing tokens — the MCP server increments a counter on each authority grant, and rejects operations carrying stale tokens.

Sources:
- [Implementing Raft Part 1: Elections (Eli Bendersky)](https://eli.thegreenplace.net/2020/implementing-raft-part-1-elections/)
- [Raft website](https://raft.github.io/)

### 6. Kleppmann's Process Pause Problem Is the Core Threat Model for Agent Authority

Martin Kleppmann identifies the fundamental safety problem for any TTL-based authority system:

1. Agent A acquires authority (lease with TTL)
2. Agent A experiences a "pause" (for AI agents: context window exhaustion, `/compact`, OS-level freeze, network partition)
3. TTL expires while Agent A is paused
4. Agent B acquires authority with a new, higher fencing token
5. Agent A resumes, believing it still holds authority, and writes stale data

**Kleppmann's solution hierarchy:**
- **For efficiency locks** (preventing redundant work): single-node Redis with TTL is sufficient. Failure means duplicate work, not corruption.
- **For correctness locks** (preventing data corruption): fencing tokens are mandatory. The storage layer must reject writes with tokens lower than the highest it has seen.
- **Redlock critique:** Generates random UUIDs rather than monotonic tokens, so cannot serve as fencing tokens. Also assumes bounded clock drift, which real systems violate.
- **His recommendation:** Use proper consensus (ZooKeeper, etcd) for correctness, or accept approximate safety for efficiency.

**For Sherpa's architecture, this resolves favorably:** The MCP server is both the lock manager AND the resource layer (all file mutations flow through it). This means the fencing token check happens at the point of mutation, which is the architecturally ideal position per Kleppmann's analysis.

Source: [How to do distributed locking (Kleppmann, 2016)](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)

### 7. Temporal's Heartbeat Payload Pattern Solves Progress Preservation During Authority Loss

Temporal's activity heartbeat mechanism provides the pattern for what a Worker should DO during AUTHORITY_LOSS_IMMINENT:

**Heartbeat with progress data:**
```go
activity.RecordHeartbeat(ctx, progressData)
```

**Key properties:**
- Heartbeat payloads carry serializable progress data
- If activity fails (timeout, crash), the next retry accesses the last heartbeat:
  ```go
  if activity.HasHeartbeatDetails(ctx) {
      var finishedIndex int
      activity.GetHeartbeatDetails(ctx, &finishedIndex)
      startIdx = finishedIndex + 1  // Resume from here
  }
  ```
- Cancellation signals are delivered through heartbeats — "Activities that don't Heartbeat can't receive a Cancellation"
- Heartbeats may be throttled by the Worker, so payloads should be minimal
- The `WaitForCancellation: true` option provides a cleanup window

**Mapping to Sherpa's AUTHORITY_LOSS_IMMINENT:**
When a Worker receives notification that authority is being revoked:
1. Worker should heartbeat its current progress (files modified, tests run, current state)
2. Worker should commit any WIP to a branch (the "flush to replication layer" analog)
3. Worker signals readiness to release authority
4. The next Worker retrieves the progress payload from the heartbeat data

Sources:
- [Temporal Go SDK Failure Detection](https://docs.temporal.io/develop/go/failure-detection)
- [Temporal Detecting Activity Failures](https://docs.temporal.io/encyclopedia/detecting-activity-failures)
- [Temporal Activity Cancellation](https://docs.temporal.io/develop/go/cancellation)

### 8. BullMQ's Stalled Job Detection Maps to Agent Crash Detection

BullMQ detects worker crashes via a stalled job mechanism:

- Workers must continuously update the queue to signal liveness
- Default stalled check interval: **30 seconds**
- When a job is detected as stalled, it's moved back to the waiting list (retry) or to the failed set
- `maxStalledCount` (default: 1) prevents infinite retry loops — "stalled jobs should be a rare occurrence"
- "There is not a 'stalled' state, only a 'stalled' event" — it's a transient detection, not a persistent state
- If CPU-intensive work exceeds 30 seconds, use sandboxed processors (separate Node.js processes)

**Key insight for Sherpa:** "stalled" is not a separate state in the state machine. It's an event that triggers a transition from AUTHORITATIVE back to UNASSIGNED (or ORPHANED). The heartbeat_authority tool serves as the liveness signal.

Sources:
- [BullMQ Stalled Jobs](https://docs.bullmq.io/guide/jobs/stalled)
- [BullMQ Worker Options](https://api.docs.bullmq.io/interfaces/v5.WorkerOptions.html)

### 9. Kubernetes Pod Termination Provides the Grace Period Behavioral Model

Kubernetes pod termination defines the canonical pattern for "what to do when you're told you're losing authority":

**The sequence:**
1. Deletion requested → Pod enters **Terminating** state
2. **preStop hook** executes (custom cleanup logic)
3. **SIGTERM** sent to all containers
4. Grace period countdown (default: 30 seconds, configurable via `terminationGracePeriodSeconds`)
5. During grace period, pod CAN: handle ongoing connections, drain requests, save state, close DB connections
6. After grace period: **SIGKILL** sent — forced termination, no further operations

**The endpoint removal happens BEFORE SIGTERM in most cases** — the load balancer stops sending new traffic while the pod finishes existing work. This maps to: the MCP server stops routing new tasks to the Worker before telling it to wind down.

**preStop hook pattern for Sherpa's AUTHORITY_LOSS_IMMINENT:**
```yaml
# Kubernetes analog → Sherpa mapping
preStop:
  - Deregister from service discovery  → Stop accepting new subtasks
  - Drain connections                  → Complete in-flight file writes
  - Flush buffers                      → Commit WIP to branch
  - Close DB connections               → Release subordinate authority
  - Sleep for confirmation             → Signal readiness via heartbeat
```

Sources:
- [Kubernetes Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Kubernetes Pod Termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)

### 10. ZooKeeper's Ephemeral Nodes Provide Natural Authority Cleanup

ZooKeeper's distributed lock recipe uses ephemeral sequential nodes:

1. Client creates `/locknode/guid-lock-000000N` with EPHEMERAL + SEQUENCE flags
2. Client with lowest sequence number holds the lock
3. Each waiter watches only the next-highest node (prevents thundering herd)
4. Lock release: simply delete the node
5. **Crash recovery:** Ephemeral nodes automatically vanish when sessions end

**Key insight:** The "natural cleanup" property — if a lock holder crashes, the session eventually expires and the lock is automatically released. No reaper needed. This is cleaner than TTL-based leases that require active garbage collection.

**For Sherpa:** The MCP server could use a similar model — authority records that automatically expire when the agent's MCP session disconnects. This provides crash recovery without a separate reaper process.

Source: [ZooKeeper Recipes and Solutions](https://zookeeper.apache.org/doc/current/recipes.html)

### 11. etcd's Lease Model Is the Simplest Correct Coordination Primitive

etcd leases provide the minimal correct model:

- `LeaseGrant(TTL)` → creates lease, returns lease ID
- Keys are attached to leases; when lease expires, all attached keys are auto-deleted
- `LeaseKeepAlive` is a bidirectional stream: client sends keepalive requests, server responds with updated TTL
- `LeaseRevoke` explicitly terminates a lease and deletes all attached keys
- "Each expired key generates a delete event in the event history"

**Lifecycle:** Created → Active (keepalive renewing) → Expired/Revoked → Keys deleted

Source: [etcd API Learning: Lease](https://etcd.io/docs/v3.5/learning/api/#lease-api)

### 12. Redlock's Fencing Token Absence Is a Cautionary Tale

The Redlock algorithm for distributed locks across N Redis instances:

1. Try `SET key unique_value EX timeout NX` on N instances
2. If majority (>N/2) acquired and elapsed time < timeout: lock acquired
3. Release via Lua script: verify unique_value before deleting

**The fundamental problem (Kleppmann):** Redlock generates random UUIDs, not monotonically increasing tokens. A storage system receiving writes from two clients cannot determine which is the legitimate holder based solely on a random UUID. Fencing tokens solve this because the storage rejects writes with tokens lower than the highest seen.

**For Sherpa:** The MCP server's authority_fencing_token must be a monotonically increasing integer (SQLite autoincrement or sequence), never a UUID.

Sources:
- [Redis Distributed Locks](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/)
- [Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)

### 13. Google SRE's Lease Mandate

The Google SRE book mandates: "it is essential to use renewable leases with timeouts instead of indefinite locks, because doing so prevents locks from being held indefinitely by processes that crash."

Additionally: Paxos uses "sequence numbers, which imposes a strict ordering on all of the operations in the system." Leadership changes are marked with a "term or view number" — the same fencing token pattern.

Source: [Google SRE Book: Managing Critical State](https://sre.google/sre-book/managing-critical-state/)

---

## The Complete Sherpa Authority State Machine

### States

Based on synthesis of all sources, Sherpa needs **six authority states**:

| State | Locked? | Who Can Write? | Analog |
|-------|---------|---------------|--------|
| **UNASSIGNED** | No | Anyone (via proposals) | Azure: Available |
| **AUTHORITATIVE** | Yes | Holder only (with fencing token) | Azure: Leased, Raft: Leader |
| **AUTHORITY_LOSS_IMMINENT** | Yes (draining) | Holder only (flush operations) | Azure: Breaking, K8s: Terminating, Improbable: state 1215 |
| **TRANSITIONING** | Yes (blocked) | No one | Improbable: gap between states, DLM: freeze period |
| **ORPHANED** | No | No one (frozen) | coherence: orphan, BullMQ: stalled |
| **EXPIRED** | No | Anyone via acquire | Azure: Expired |

### Complete State Transition Diagram

```
                    ┌─────────────┐
                    │  UNASSIGNED  │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    acquire_authority  dispatch_task   auto_adopt (from ORPHANED)
    (explicit)        (implicit)
          │                │                │
          ▼                ▼                ▼
    ┌──────────────────────────────────────────┐
    │            AUTHORITATIVE                  │
    │  Holder: agent_id                         │
    │  Token: fence_token (monotonic int)       │
    │  TTL: expires_at                          │
    │  Renewed by: heartbeat_authority          │
    │              or any mutation with token    │
    └──────┬───────┬───────┬───────┬───────────┘
           │       │       │       │
   transfer_  release_  TTL      override_
   authority  authority expires  authority
   (initiated)(voluntary)(crash) (human)
           │       │       │       │
           ▼       │       │       │
    ┌──────────────┐       │       │
    │ AUTHORITY_   │       │       │
    │ LOSS_        │       │       │
    │ IMMINENT     │       │       │
    │              │       │       │
    │ Grace period │       │       │
    │ Holder CAN:  │       │       │
    │  - flush WIP │       │       │
    │  - heartbeat │       │       │
    │    progress  │       │       │
    │  - signal    │       │       │
    │    readiness │       │       │
    │ Holder       │       │       │
    │ CANNOT:      │       │       │
    │  - start new │       │       │
    │    work      │       │       │
    └──────┬───────┘       │       │
           │               │       │
    ┌──────┴───────┐       │       │
    │ [readiness   │       │       │
    │  signal OR   │       │       │
    │  grace timer │       │       │
    │  expires]    │       │       │
    └──────┬───────┘       │       │
           │               │       │
           ▼               │       │
    ┌──────────────┐       │       │
    │ TRANSITIONING│       │       │
    │              │       │       │
    │ No writes    │       │       │
    │ State being  │       │       │
    │ transferred  │       │       │
    │ to new holder│       │       │
    └──────┬───────┘       │       │
           │               │       │
           ▼               ▼       ▼
    ┌──────────────────────────────────┐
    │  UNASSIGNED / AUTHORITATIVE      │
    │  (new holder)                     │
    └──────────────────────────────────┘

           TTL expires (no heartbeat):
    AUTHORITATIVE → ORPHANED
    ┌──────────────┐
    │  ORPHANED    │
    │              │
    │ Frozen state │
    │ No writes    │
    │ Progress     │
    │ preserved    │
    │ from last    │
    │ heartbeat    │
    └──────┬───────┘
           │
    ┌──────┴───────────────────┐
    │                          │
    auto_adopt              acquire_authority
    (if configured)         (Planner reassigns)
    │                          │
    ▼                          ▼
    AUTHORITATIVE (new holder)
```

### State Transitions Mapped to MCP Tool Calls

| # | From State | To State | Trigger | MCP Tool Call | Fencing Token |
|---|-----------|----------|---------|---------------|---------------|
| T1 | UNASSIGNED | AUTHORITATIVE | Agent requests authority | `acquire_authority(scope, agent_id, ttl)` | New token issued (N+1) |
| T2 | UNASSIGNED | AUTHORITATIVE | Task dispatched to worker | `dispatch_task()` → implicit `acquire_authority` | New token issued (N+1) |
| T3 | AUTHORITATIVE | AUTHORITATIVE | Lease renewed | `heartbeat_authority(scope, agent_id, token, progress?)` | Same token, TTL reset |
| T4 | AUTHORITATIVE | AUTHORITATIVE | Any mutation with valid token | `write_file(scope, token, ...)` (implicit renewal) | Same token, TTL reset |
| T5 | AUTHORITATIVE | UNASSIGNED | Voluntary release | `release_authority(scope, agent_id, token)` | Token invalidated |
| T6 | AUTHORITATIVE | AUTHORITY_LOSS_IMMINENT | Transfer initiated | `transfer_authority(scope, from_agent, token, to_agent)` | Old token still valid during grace |
| T7 | AUTHORITATIVE | AUTHORITY_LOSS_IMMINENT | Human override with grace | `override_authority(scope, reason, grace_seconds>0)` | Old token valid during grace |
| T8 | AUTHORITATIVE | ORPHANED | TTL expires without heartbeat | Timeout event (no tool call — server-side reaper) | Token expired, preserved in orphan record |
| T9 | AUTHORITATIVE | UNASSIGNED | Human override (immediate) | `override_authority(scope, reason, grace_seconds=0)` | Token immediately invalidated |
| T10 | AUTHORITY_LOSS_IMMINENT | TRANSITIONING | Holder signals readiness | `release_authority(scope, agent_id, token)` during grace | Token invalidated |
| T11 | AUTHORITY_LOSS_IMMINENT | TRANSITIONING | Grace timer expires | Timeout event (server-side) | Token force-invalidated |
| T12 | TRANSITIONING | AUTHORITATIVE | New holder activated | Server-side: issue new token to recipient | New token issued (N+2) |
| T13 | TRANSITIONING | UNASSIGNED | No recipient specified | Server-side: scope becomes available | No active token |
| T14 | ORPHANED | AUTHORITATIVE | Planner reassigns | `acquire_authority(scope, agent_id, ttl)` | New token issued (N+1), progress data accessible |
| T15 | ORPHANED | AUTHORITATIVE | Auto-adopt triggered | Server-side: assign to available worker | New token issued (N+1) |
| T16 | EXPIRED | AUTHORITATIVE | Original holder re-acquires | `acquire_authority(scope, agent_id, ttl)` (if scope unmodified) | New token issued |
| T17 | EXPIRED | AUTHORITATIVE | New agent acquires | `acquire_authority(scope, agent_id, ttl)` | New token issued |

### What an Agent CAN and CANNOT Do in Each State

**UNASSIGNED:**
- CAN: Read any file/resource in scope
- CAN: Call `acquire_authority` to claim the scope
- CAN: Submit proposals (file creation in proposals directory — no authority needed)
- CANNOT: Modify files within the scope (rejected with "no authority" error)

**AUTHORITATIVE:**
- CAN: Read and write files within scope (must include fencing token)
- CAN: Heartbeat to renew lease (with optional progress payload)
- CAN: Voluntarily release authority
- CAN: Initiate transfer to another agent
- CAN: Create sub-authority on nested scopes
- CANNOT: Write outside scope boundaries
- CANNOT: Write with an expired or wrong fencing token (rejected with 412 Precondition Failed)

**AUTHORITY_LOSS_IMMINENT:**
- CAN: Complete in-flight writes (fencing token still valid during grace)
- CAN: Heartbeat with progress data (final state preservation)
- CAN: Signal readiness (early release before grace expires)
- CAN: Read any file
- CANNOT: Start new work items
- CANNOT: Acquire authority on new scopes
- CANNOT: Transfer authority to a third party (already mid-transfer)
- SHOULD: Commit WIP to branch, flush partial results, save progress in heartbeat

**TRANSITIONING:**
- CAN: Read any file (all parties)
- CANNOT: Write any file in scope (no valid token exists)
- Duration: Minimal (server-side atomic operation, typically <100ms)

**ORPHANED:**
- CAN: Read any file (state is frozen/preserved)
- CAN: Planner can call `acquire_authority` to claim the orphan
- CAN: Auto-adopt can trigger if configured
- CANNOT: Write any file (no valid token exists)
- State: Last heartbeat progress data is preserved for resumption

**EXPIRED:**
- Same as UNASSIGNED except: the previous holder's identity and last-modified info are retained
- Original holder can re-acquire if the scope hasn't been modified since expiration (like Azure Blob's expired lease renewal)

### Edge Cases and Their Resolution

**Edge Case 1: Concurrent transfer requests**
Two agents simultaneously call `transfer_authority` targeting the same scope. Resolution: SQLite's `BEGIN IMMEDIATE` transaction serializes the requests. First request wins; second gets "authority not held" error (the first transfer already changed the holder). This matches the patent's assumption that "the runtime makes sequential decisions."

**Edge Case 2: Transfer during heartbeat**
Agent A sends `heartbeat_authority` at the same time the Planner calls `transfer_authority` to move authority from A to B. Resolution: Both operations are serialized via SQLite transaction. If heartbeat arrives first, it renews the TTL, then the transfer initiates AUTHORITY_LOSS_IMMINENT. If transfer arrives first, the heartbeat fails with "authority state changed" error.

**Edge Case 3: Crash during AUTHORITY_LOSS_IMMINENT**
Agent A is in AUTHORITY_LOSS_IMMINENT grace period and crashes. Resolution: The grace timer continues on the server side. When it expires, the transition proceeds regardless (T11). The new holder receives whatever state was last heartbeated. This is exactly the Improbable patent's design: "Even if the incumbent worker never acknowledges, authority transfers after timeout."

**Edge Case 4: Crash during TRANSITIONING**
The new holder (Agent B) crashes before accepting authority. Resolution: The TRANSITIONING state has its own short timeout (e.g., 5 seconds). If B doesn't acknowledge, the scope reverts to UNASSIGNED (or ORPHANED if there was pre-existing state). The Planner can then reassign.

**Edge Case 5: Stale write after authority expires**
Agent A's authority expired (ORPHANED), Agent B acquired the scope. Agent A resumes and tries to write with old fencing token. Resolution: MCP server rejects the write because token N < current token N+1. This is Kleppmann's fencing token pattern. The server checks: `if (request.token < scope.current_token) reject("stale authority")`.

**Edge Case 6: Human override during active transfer**
A transfer from A to B is in AUTHORITY_LOSS_IMMINENT state when a human calls `override_authority`. Resolution: Override takes precedence. The grace period ends immediately, the transfer is cancelled, and the scope becomes UNASSIGNED. Both A and B receive notifications. This matches Azure Blob's `Break` semantics.

**Edge Case 7: Multiple orphans needing adoption**
Three tasks become orphaned simultaneously when a Worker process crashes. Resolution: The Planner (or auto-adopt mechanism) processes them sequentially. Each adoption is an independent `acquire_authority` call. Priority can be determined by task urgency, staleness, or round-robin.

---

## What a Worker Should DO During AUTHORITY_LOSS_IMMINENT

Synthesizing from Kubernetes preStop hooks, Temporal heartbeat payloads, and the Improbable patent's "save final state" directive:

### The Worker's Grace Period Checklist

```
AUTHORITY_LOSS_IMMINENT received
│
├── 1. STOP accepting new sub-tasks or new work items
│      (K8s analog: endpoint removed from Service before SIGTERM)
│
├── 2. COMPLETE any in-flight file write
│      (K8s analog: drain connections, finish in-flight requests)
│      (Improbable: "worker may buffer or otherwise store the commands")
│
├── 3. COMMIT WIP to a branch
│      git add . && git commit -m "WIP: [task-id] authority transfer in progress"
│      (Improbable: "save and/or update final component states")
│      (Star Citizen: "state flows through the replication layer")
│
├── 4. HEARTBEAT progress data
│      heartbeat_authority(scope, agent_id, token, {
│        progress: {
│          files_modified: ["src/foo.ts", "src/bar.ts"],
│          tests_passing: true,
│          completion_estimate: 0.7,
│          wip_branch: "worktree/task-42-wip",
│          last_action: "implemented core logic, tests pending"
│        }
│      })
│      (Temporal: heartbeat payload survives for next retry)
│      (BullMQ: progress data preserved across stalled job retries)
│
├── 5. RELEASE subordinate authority on nested scopes
│      release_authority(nested_scope, agent_id, nested_token)
│
└── 6. SIGNAL readiness (early completion before grace expires)
       release_authority(scope, agent_id, token)
       (Improbable: "Worker can signal readiness early, completing
        transfer before timeout")
```

### Grace Period Duration Recommendations

| Context | Duration | Rationale |
|---------|----------|-----------|
| Interactive Worker (human-supervised) | 60 seconds | Time to commit WIP, push branch |
| Background Worker (automated) | 30 seconds | Faster cycle, less complex state |
| Judge review | 10 seconds | Judges are read-heavy, little state to flush |
| Human override | 0-60 seconds | Configurable per-override, 0 for emergencies |
| Planner (rare — Planner rarely loses authority) | 120 seconds | Planner may have complex multi-scope state |

---

## Permission Levels Mapped to Sherpa Artifact Types

Synthesizing Unity Netcode's five levels with Sherpa's artifact hierarchy:

| Artifact Type | Permission Level | Transfer Mode | Authority Behavior |
|--------------|-----------------|---------------|-------------------|
| **Task definitions** (`docs/tasks/*.md`) | SessionOwner | NotTransferable | Only Planner can create/modify. Workers read-only. |
| **Implementation files** (`src/**`) | Transferable | Steal (via dispatch) | Worker writes during task, Judge reviews after. Authority auto-transfers on task state change. |
| **Shared config** (`CLAUDE.md`, `sherpa.config.ts`) | RequestRequired | Request (two-step) | Must explicitly request before editing. Current holder can deny. Locked during modification. |
| **Activity log** (`activity.md`) | Distributable | Auto-assign | Auto-assigned to current Worker. Transfers with task authority. Append-only (no conflict risk). |
| **Roadmap / guidelines** (`docs/roadmap.md`) | None | N/A | Cannot be directly modified by any Worker. Changes only via proposals. |
| **Proposals** (`docs/initiatives/*/proposal.md`) | Transferable | Steal (for reviewer) | Creator writes initially, then transfers to reviewer (Judge/human). |
| **Research artifacts** (`research/**`) | Transferable | Steal | Current researcher writes. New researcher can take over. |

### How Permission Levels Integrate with the State Machine

The permission level determines **which state transitions are valid** for a given scope:

- **None:** Only UNASSIGNED state exists. No acquire/release/transfer transitions. All writes rejected.
- **SessionOwner:** Only one agent (the session creator — typically Planner) can ever hold AUTHORITATIVE. Transfer transitions (T6) are disabled. Override (T9) still works for human escape hatch.
- **Distributable:** Automatic T2 (dispatch_task) transitions. No explicit acquire needed. Authority follows task assignment.
- **Transferable:** Full state machine. All transitions enabled. Steal mode: `acquire_authority` succeeds even if currently held (old holder gets AUTHORITY_LOSS_IMMINENT).
- **RequestRequired:** T1 (acquire) requires approval from current holder (two-step). T6 (transfer) requires explicit consent. T9 (override) bypasses consent for human admins.

---

## Comparison: Game Authority vs. Distributed Lock vs. Sherpa

| Feature | Improbable Patent | Azure Blob Lease | Raft | Sherpa MCP |
|---------|------------------|-----------------|------|-----------|
| States | 3 (+ optional 4th) | 5 | 3 | 6 |
| Grace period | Configurable (32-1000ms) | Break period (0-60s) | None (immediate term change) | Configurable (0-120s) |
| Fencing token | Implicit (authority enum) | Lease ID (GUID, non-monotonic) | Term number (monotonic int) | Fence token (monotonic int) |
| Crash recovery | Runtime forces timeout | Lease expires → Available | Election timeout → new leader | TTL expires → ORPHANED |
| Progress preservation | "Save final state" | None | Log replication | Heartbeat payload |
| Permission levels | Component-level granularity | Binary (leased/not) | Binary (leader/follower) | Five levels per artifact type |
| Human override | N/A (runtime decides) | Break (any auth request) | N/A | override_authority tool |
| Orphan concept | Not explicit | Expired state | Follower without leader | ORPHANED (frozen, adoptable) |
| Split authority | Per-component | N/A | N/A | State Authority + Input Authority |
| Concurrent request resolution | Runtime serializes | First-come (409 for others) | Election + majority | SQLite serialization |

---

## Sources

### Primary Patent and Framework Documentation
- [US Patent 10,878,146 (Improbable)](https://patents.google.com/patent/US10878146B2/en) — Authority handover in distributed simulation systems
- [coherence Authority Transfer](https://docs.coherence.io/manual/authority/authority-transfer) — Request/Steal/NotTransferable modes, two-step handshake
- [coherence Authority Overview](https://docs.coherence.io/manual/authority) — State Authority vs Input Authority, orphan handling
- [Azure Blob Lease REST API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob) — Five-state lease machine, Breaking state, write permissions per state

### Distributed Systems Theory
- [Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — Fencing tokens, process pause problem, efficiency vs correctness locks
- [Google SRE Book: Managing Critical State](https://sre.google/sre-book/managing-critical-state/) — Renewable leases mandate, Paxos sequence numbers
- [ZooKeeper Recipes](https://zookeeper.apache.org/doc/current/recipes.html) — Ephemeral sequential nodes for distributed locks
- [etcd Lease API](https://etcd.io/docs/v3.5/learning/api/#lease-api) — LeaseGrant, KeepAlive, Revoke primitives
- [Redis Distributed Locks](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/) — Redlock algorithm
- [Raft Elections (Eli Bendersky)](https://eli.thegreenplace.net/2020/implementing-raft-part-1-elections/) — Term numbers as logical clocks
- [Raft website](https://raft.github.io/) — Consensus algorithm overview

### Task Orchestration Systems
- [Temporal Go SDK: Failure Detection](https://docs.temporal.io/develop/go/failure-detection) — Heartbeat API, progress payloads
- [Temporal: Detecting Activity Failures](https://docs.temporal.io/encyclopedia/detecting-activity-failures) — Heartbeat timeout, Start-To-Close, Schedule-To-Close
- [Temporal: Activity Cancellation](https://docs.temporal.io/develop/go/cancellation) — DisconnectedContext, WaitForCancellation, cleanup window
- [BullMQ Stalled Jobs](https://docs.bullmq.io/guide/jobs/stalled) — Stalled detection, maxStalledCount, 30s default interval

### Infrastructure Patterns
- [Kubernetes Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) — terminationGracePeriodSeconds, SIGTERM/SIGKILL, preStop hooks

### Prior Sherpa Research
- [Authority Transfer Protocols (iteration 1)](../../research/iteration-1/authority-transfer-protocols.md) — Improbable, Star Citizen, coherence, Unity, Photon analysis
- [Authority Tracking as MCP Tools (iteration 1)](../../../mcp-coordination-layer/research/iteration-1/vector-3-authority-tracking-tools.md) — Six MCP tool schemas, fencing token design, implicit authority via dispatch
- [Authority Schema Design (seed)](../../../mcp-coordination-layer/branches/authority-schema-design.md) — SQLite schema questions for authority leases

---

## Raw Links

Every URL encountered during this research:

```
https://patents.google.com/patent/US10878146B2/en
https://docs.coherence.io/manual/authority/authority-transfer
https://docs.coherence.io/manual/authority
https://docs.coherence.io/manual/authority/server-authoritative-setup
https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob
https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
https://sre.google/sre-book/managing-critical-state/
https://zookeeper.apache.org/doc/current/recipes.html
https://etcd.io/docs/v3.5/learning/api/
https://redis.io/docs/latest/develop/use/patterns/distributed-locks/
https://eli.thegreenplace.net/2020/implementing-raft-part-1-elections/
https://eli.thegreenplace.net/2020/implementing-raft-part-0-introduction/
https://raft.github.io/
https://raft.github.io/raft.pdf
https://docs.temporal.io/develop/go/failure-detection
https://docs.temporal.io/develop/go/cancellation
https://docs.temporal.io/encyclopedia/detecting-activity-failures
https://docs.bullmq.io/guide/jobs/stalled
https://api.docs.bullmq.io/interfaces/v5.WorkerOptions.html
https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.1/manual/ownership.html
https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.1/manual/basics/distributed-authority.html
https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.10/manual/terms-concepts/ownership.html
https://unity.com/products/distributed-authority
https://github.com/Unity-Technologies/com.unity.netcode.gameobjects/issues/2897
https://doc.photonengine.com/pun/current/gameplay/ownershipandcontrol
https://doc.photonengine.com/pun/current/gameplay/hostmigration
https://starcitizen.tools/Replication_layer
https://sc-server-meshing.info/
https://ashesofcreation.wiki/Server_meshing
https://www.the-paper-trail.org/post/2014-08-09-distributed-systems-theory-for-the-distributed-systems-engineer/
https://static.googleusercontent.com/media/research.google.com/en//archive/chubby-osdi06.pdf
https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-2005-33.pdf
https://en.wikipedia.org/wiki/Chubby_(service)
https://antirez.com/news/101
https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/
https://kriasoft.com/syncguard/fencing
https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/distributed-lock-api-overview/
https://mwhittaker.github.io/papers/html/gray1976granularity.html
https://blog.acolyer.org/2016/01/05/granularity-of-locks/
https://en.wikipedia.org/wiki/Distributed_lock_manager
https://mikemason.ca/writing/ai-coding-agents-jan-2026/
https://fideloper.com/etags-and-optimistic-concurrency-control
https://codeopinion.com/optimistic-concurrency-in-an-http-api-with-etags-hypermedia/
https://modelcontextprotocol.io/specification/draft/server/tools
https://modelcontextprotocol.io/specification/2025-06-18/server/tools
https://modelcontextprotocol.io/specification/2025-06-18/server/resources
https://docs.temporal.io/task-routing
https://temporal.io/blog/distributed-privilege-access-with-temporal
https://docs.bullmq.io/bull/important-notes
https://jepsen.io/analyses/etcd-3.4.3
https://brooker.co.za/blog/2023/10/18/optimism.html
https://hazelcast.com/blog/long-live-distributed-locks/
https://github.com/modelcontextprotocol/modelcontextprotocol
https://github.com/Dicklesworthstone/mcp_agent_mail
https://en.wikipedia.org/wiki/Two-phase_commit_protocol
https://en.wikipedia.org/wiki/Three-phase_commit_protocol
https://martinfowler.com/articles/patterns-of-distributed-systems/two-phase-commit.html
https://wiki.vmssoftware.com/Distributed_Lock_Manager
https://etcd.io/docs/v3.6/dev-guide/api_concurrency_reference_v3/
https://etcd.io/docs/v3.5/tutorials/how-to-create-lease/
https://zookeeper.apache.org/doc/r3.1.2/recipes.html
https://zookeeper.apache.org/doc/r3.4.13/zookeeperOver.html
https://docs.celeryq.dev/en/stable/tutorials/task-cookbook.html
https://docs.temporal.io/task-queue
https://docs.temporal.io/workers
https://docs.temporal.io/sticky-execution
https://link.springer.com/chapter/10.1007/978-3-319-96983-1_39
https://en.wikipedia.org/wiki/Optimistic_concurrency_control
https://event-driven.io/en/how_to_use_etag_header_for_optimistic_concurrency/
https://learn.microsoft.com/en-us/azure/storage/blobs/concurrency-manage
```

---

## Implications for Sherpa's Authority State Machine Design

1. **Six states, not three.** The Improbable patent's three-state model is insufficient. Sherpa needs UNASSIGNED, AUTHORITATIVE, AUTHORITY_LOSS_IMMINENT, TRANSITIONING, ORPHANED, and EXPIRED to handle the full lifecycle including crash recovery and human override.

2. **Azure Blob's Breaking state is the best model for AUTHORITY_LOSS_IMMINENT.** The current holder retains write access with their lease/token during the grace period. No new holder can acquire until the break period elapses. The holder can flush final state.

3. **Fencing tokens must be monotonic integers, not UUIDs.** SQLite's autoincrement provides a natural implementation. Every `acquire_authority` or transfer increments the global counter. The server rejects any mutation where `request.token < scope.current_token`.

4. **Heartbeat payloads are essential for progress preservation.** Following Temporal's pattern, `heartbeat_authority` should accept a progress payload. When authority expires (ORPHANED), the last heartbeat's progress data is preserved. The next holder can retrieve it to resume work rather than starting over.

5. **The MCP server's position as both lock manager and resource layer is architecturally ideal.** Per Kleppmann, the safest fencing token enforcement happens at the resource layer. Since all file mutations flow through MCP tools, the server can reject stale tokens at the point of mutation.

6. **Permission levels per artifact type constrain which state transitions are valid.** SessionOwner artifacts cannot be transferred. RequestRequired artifacts need two-step consent. None artifacts can never enter AUTHORITATIVE state. This prevents misuse without requiring per-operation authorization checks.

7. **The grace period checklist (stop, complete, commit, heartbeat, release subordinates, signal) gives Workers concrete guidance.** Rather than leaving "what to do during AUTHORITY_LOSS_IMMINENT" vague, the Kubernetes preStop + Temporal cleanup + Improbable "save final state" synthesis produces an actionable sequence.

8. **ORPHANED is distinct from UNASSIGNED.** An orphaned scope has frozen state and preserved progress data that the next holder should examine. An unassigned scope is clean and ready for fresh work. Collapsing these loses the progress preservation benefit.

9. **Transfer_authority should be a two-phase operation internally.** Phase 1: move to AUTHORITY_LOSS_IMMINENT (notify holder). Phase 2: after grace period, move to TRANSITIONING then AUTHORITATIVE (new holder). This matches the patent's "soft handover" pattern and gives the current holder time to flush.

10. **The state machine should be implemented as a SQLite state column with CHECK constraints.** Each transition validates the current state before proceeding. Invalid transitions (e.g., ORPHANED → AUTHORITY_LOSS_IMMINENT) are rejected at the database level.

---

## Open Questions

1. **Should AUTHORITY_LOSS_IMMINENT writes be flagged?** If a Worker writes during the grace period, should those writes be marked as "grace period writes" in the version history? This would let the new holder distinguish between normal work and last-minute flushes.

2. **What happens to sub-scopes when a parent scope transitions?** If authority over `initiative:vedic-research` moves to AUTHORITY_LOSS_IMMINENT, do all file-level authorities within that initiative also transition? The DLM's intention lock model suggests yes, but this adds complexity.

3. **Should the grace period be negotiable?** The Improbable patent allows per-component timeout configuration. Should the Worker be able to request more time during AUTHORITY_LOSS_IMMINENT (e.g., "I need 30 more seconds to finish this commit"), or is the grace period fixed?

4. **How does auto-adopt decide priority?** When multiple Workers are available to adopt an orphaned task, who gets it? Options: round-robin, least-loaded, Planner-assigned, first-come. The Improbable patent uses a "load density center" algorithm; coherence uses first-available.

5. **Is EXPIRED truly needed as a separate state?** Azure Blob distinguishes Expired from Available (original holder can renew if blob is unmodified). For Sherpa, the question is: can a crashed Worker reclaim authority over a scope it previously held, without Planner intervention? If yes, EXPIRED is useful. If authority always goes through the Planner, EXPIRED can collapse into UNASSIGNED.

6. **How does the coherence-inspired Input Authority split apply?** Could the Planner hold "Input Authority" (send task definitions, directives) while the Worker holds "State Authority" (write implementation files)? This would allow the Planner to modify task instructions without revoking the Worker's write access, which is a common workflow pattern.

7. **Should fencing token comparison be per-scope or global?** A global monotonic counter (simpler) means tokens are unique across all scopes. A per-scope counter means tokens are only comparable within the same scope. Global is simpler to implement but leaks information about system activity.
