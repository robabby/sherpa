# The Chubby/ZooKeeper Lineage: Production Lock Service API Design Patterns

**Research iteration:** 3
**Date:** 2026-03-12
**Scope:** Google Chubby (2006), Apache ZooKeeper (2010), etcd v3, HashiCorp Consul — API design, production lessons, relevance to Sherpa MCP authority design

---

## Key Discoveries

### 1. Google Chubby (2006) — The Origin

**Source:** Burrows, "The Chubby lock service for loosely-coupled distributed systems," OSDI 2006
([PDF](https://research.google.com/archive/chubby-osdi06.pdf) | [Google Research](https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/) | [USENIX](https://www.usenix.org/conference/osdi-06/chubby-lock-service-loosely-coupled-distributed-systems))

#### Why a Lock Service, Not a Paxos Library

Four reasons drove the choice ([source](https://omkarprabhu-98.github.io/2021/01/chubby.html)):

- **Program structure preservation**: Most projects don't start needing high availability; a lock service lets you keep existing program structure rather than refactoring around a consensus library
- **Primary advertisement**: Services need to advertise election results; Chubby provides a natural place to store "who is the master?" with consistency guarantees
- **Developer familiarity**: A lock-based interface is more common to developers than Paxos quorum semantics
- **Minority progress**: A lock client can make progress even if most other clients are down, as long as the lock service is reachable — unlike a Paxos library where a majority of application nodes must be up

#### Complete API

| Method | Purpose |
|--------|---------|
| `Open()` | Open a node (file/directory), returns a handle. Like Unix `open()` with a file pathname |
| `Close()` | Release a handle |
| `Poison()` | Invalidate a handle without closing — causes outstanding/future operations on the handle to fail |
| `GetContentsAndStat()` | Read file contents + metadata atomically |
| `GetStat()` | Read metadata only |
| `ReadDir()` | List directory children |
| `SetContents()` | Write file contents (supports compare-and-swap via generation number) |
| `SetACL()` | Set access control list |
| `Delete()` | Remove a node |
| `Acquire()` | Acquire a lock (blocks until acquired) |
| `TryAcquire()` | Attempt lock acquisition (returns immediately) |
| `Release()` | Release a held lock |
| `GetSequencer()` | Get an opaque byte-string describing the lock state at acquisition |
| `SetSequencer()` | Associate a sequencer with a handle |
| `CheckSequencer()` | Verify a sequencer is still valid |

([API source](https://www.anantjain.dev/posts/chubby), [annotated paper](https://mwhittaker.github.io/papers/html/burrows2006chubby.html))

#### Why Coarse-Grained Locks

**The decisive insight**: Coarse-grained locks (held for minutes to hours) impose far less load on the lock server because the lock-acquisition rate is only weakly related to the transaction rate of client applications. With fine-grained locks held for milliseconds, the lock server load would be proportional to client transaction rates — scaling the lock server with every client's throughput. With coarse-grained locks, you decouple these rates entirely.

Consequences ([source](https://blog.acolyer.org/2015/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems/)):
- A modest number of servers with moderate availability can serve many clients
- Clients are not significantly delayed by temporary unavailability of the lock server (since they already hold their lock)
- Lock transfers after failure are expensive (operations may need to be drained), but this cost is acceptable when transfers are rare
- Fine-grained locks CAN be implemented on top of Chubby, but the reverse is not true

#### Lock-Delay Mechanism

When a lock holder fails or becomes inaccessible, Chubby does NOT immediately release the lock. Instead, it prevents other clients from claiming the lock for a configurable **lock-delay** period (default: up to **one minute**). ([source](https://keikonakata.github.io/distr/2021-04-24-Chubby.html), [source](https://www.sobyte.net/post/2022-08/distributed-lock/))

Purpose:
1. **Drain in-flight operations**: Gives the previous holder's pending RPCs time to complete or be rejected
2. **Prevent thundering herd**: Without lock-delay, all waiting clients would race simultaneously
3. **Imperfect but practical**: "While imperfect, the lock-delay protects unmodified servers and clients from everyday problems caused by message delays and restarts"

If the client releases the lock normally (not by failure), it becomes available immediately.

#### Sequencer (Fencing Token)

Structure: An opaque byte-string containing:
- Lock name
- Lock mode (shared or exclusive)
- Lock generation number (incremented on every transition from free to held)

Flow ([source](https://omkarprabhu-98.github.io/2021/01/chubby.html)):
1. Client acquires lock via `Acquire()`
2. Client calls `GetSequencer()` to get the sequencer
3. Client passes sequencer to downstream services (e.g., a file server) along with its operation
4. Downstream service calls `CheckSequencer()` or compares the generation number against the latest observed sequencer
5. If the generation number is lower than what the server has seen, the operation is **rejected**

This is exactly the fencing token pattern — the generation number is monotonically increasing and prevents stale lock holders from performing operations after a new holder has taken over.

#### Session Semantics

**KeepAlive RPC flow** ([source](https://keikonakata.github.io/distr/2021-04-24-Chubby.html), [source](https://omkarprabhu-98.github.io/2021/01/chubby.html)):
- Client sends periodic KeepAlive RPCs to the master
- Master blocks the KeepAlive response until the client's lease is close to expiring, then responds (extending the lease)
- This ensures the master can piggyback **cache invalidation messages and events** on the KeepAlive reply
- Default lease timeout: **12 seconds**
- Master may increase lease time to ~60s under heavy load (fewer KeepAlive RPCs to process)
- Sessions auto-terminate if idle for **1 minute** (no open handles, no calls)
- KeepAlives switched from TCP to **UDP** because TCP's congestion backoff conflicted with application-level timeouts

**Jeopardy phase**:
- Client maintains a local (conservative) approximation of the master's lease timeout
- When the local estimate expires, the client becomes **unsure** if the master's lease has also expired
- Client disables its cache and sends a **"jeopardy" event** to the application
- Application should slow down operations during jeopardy

**Grace period** (~45 seconds):
- Client waits for this interval, attempting to renew its KeepAlive
- If successful: re-enables cache, sends **"safe" event** to application
- If unsuccessful: discards cache, sends **"expired" event** to application

#### Events System

Clients subscribe to events on nodes. Events are delivered **after** the corresponding change ([source](https://www.anantjain.dev/posts/chubby), [source](https://souptikji.github.io/blog/2018/03/Chubby)):

| Event | Frequency |
|-------|-----------|
| File contents modified | Common |
| Child node added/removed/modified | Common |
| Chubby master failover | Common |
| Handle/lock became invalid | Occasional |
| Lock acquired | Rarely used |
| Conflicting lock request | Rarely used |

**Ordering guarantee**: "If a client is informed that file contents have changed, it is guaranteed to see the new data if it subsequently reads the file."

Events piggybacked on KeepAlive replies — no separate event channel needed.

#### Caching Design

- Client-side **consistent, write-through cache** held in memory
- Cache maintained by lease mechanism (must refresh within lease interval)
- **Invalidation protocol**: When the master receives any write, it blocks the modification until ALL clients that have cached that data acknowledge the invalidation (or their lease expires)
- Invalidation chosen over update-only protocols because updates "can be arbitrarily inefficient" — invalidation is strictly simpler
- Cache invalidation messages piggyback on KeepAlive replies

#### Advisory Locks (Not Mandatory)

Chubby deliberately chose advisory locks over mandatory locks ([source](https://www.anantjain.dev/posts/chubby)):
- "Holding a lock called F neither is necessary to access the file F nor prevents others from doing so"
- Reason: locks protect resources in **other** services, not just the associated Chubby file. Mandatory locks blocking file access would prevent debugging and administrative operations
- All coordination systems in this lineage use advisory locks

#### Post-Deployment Surprises

1. **#1 Surprise: Chubby became a name service**, not primarily a lock service. Google's workload (thousands of processes each communicating with thousands of others) created quadratic DNS lookups. Chubby's explicit invalidation caching proved superior to DNS's TTL-based caching. ([source](https://blog.acolyer.org/2015/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems/))

2. **Developers rarely consider availability**: Teams built systems with hundreds of machines that initiated tens-of-minutes recovery procedures whenever Chubby elected a new master — "magnifying the consequences of a single failure by a factor of a hundred." ([source](https://blog.acolyer.org/2015/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems/))

3. **Developers write abusive retry loops**: "Despite attempts at education, our developers regularly write loops that retry indefinitely when a file is not present, or poll a file by opening it and closing it repeatedly." Response: made repeated Open() calls cheap rather than trying to enforce discipline through delays. ([source](http://muratbuffalo.blogspot.com/2010/10/chubby-lock-service-for-loosely-coupled.html))

4. **Lack of storage quotas**: Applications started storing arbitrarily large data. A **256KB file size limit** was imposed post-deployment. ([source](https://omkarprabhu-98.github.io/2021/01/chubby.html))

5. **Failover code was the richest source of bugs**: "The fail-over code, which is exercised far less often than other parts of the system, has been a rich source of interesting bugs." ([source](http://muratbuffalo.blogspot.com/2010/10/chubby-lock-service-for-loosely-coupled.html))

6. **Programmers misuse locks**: "Many programmers have come across locks before, and think they know to use them. Ironically, such programmers are usually wrong, especially when they use locks in a distributed system." ([source](https://blog.acolyer.org/2015/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems/))

7. **Proxy should have been built sooner**: Protocol-conversion servers for DNS lookups were added late; full proxies would have reduced master load earlier. ([source](https://blog.acolyer.org/2015/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems/))

**Reliability numbers** (at time of paper): 90,000 simultaneous connections, 61 total outages, 52 resolved within 30 seconds, 6 data loss incidents (4 software bugs, 2 operator errors). 5 replicas per cell. ([source](https://mosharaf.com/blog/2011/09/22/the-chubby-lock-service-for-loosely-coupled-distributed-systems/))

---

### 2. Apache ZooKeeper (2010) — The Coordination Kernel

**Source:** Hunt, Konar, Junqueira, Reed, "ZooKeeper: Wait-free coordination for Internet-scale systems," USENIX ATC 2010
([PDF](https://www.usenix.org/legacy/event/atc10/tech/full_papers/Hunt.pdf) | [USENIX](https://www.usenix.org/conference/usenix-atc-10/zookeeper-wait-free-coordination-internet-scale-systems))

#### Key Design Divergence from Chubby

"We moved away from implementing specific primitives on the server side, and instead we opted for exposing an API that enables application developers to implement their own primitives." ([source](https://blog.acolyer.org/2015/01/27/zookeeper-wait-free-coordination-for-internet-scale-systems/))

"ZooKeeper is not a lock service. It can be used by clients to implement locks, but there are no lock operations in its API." ([source](https://blog.acolyer.org/2015/01/27/zookeeper-wait-free-coordination-for-internet-scale-systems/))

This is a more general primitive — Chubby gives you locks + files; ZooKeeper gives you a hierarchical key-value store with ephemeral/sequential semantics, from which you BUILD locks.

#### Complete API

| Method | Purpose |
|--------|---------|
| `create(path, data, flags)` | Create a znode. Flags: EPHEMERAL, SEQUENTIAL, or both |
| `delete(path)` | Remove a znode |
| `exists(path, watch)` | Check if znode exists, optionally set a watch |
| `getData(path, watch)` | Read znode data, optionally set a watch |
| `setData(path, data)` | Write data to a znode |
| `getChildren(path, watch)` | List children, optionally set a watch |
| `sync()` | Ensure client sees latest committed state (forces read to go through leader) |

([source](https://zookeeper.apache.org/doc/current/zookeeperOver.html), [source](https://blog.acolyer.org/2015/01/27/zookeeper-wait-free-coordination-for-internet-scale-systems/))

#### Ephemeral Nodes — The Heartbeat/Orphan-Detection Mechanism

- Created with EPHEMERAL flag
- **Automatically deleted when the creating session terminates** (whether by explicit close, timeout, or crash)
- Cannot have children
- This IS the liveness detection mechanism — no separate heartbeat API is needed
- When a session expires, ZooKeeper deletes all ephemeral nodes owned by that session and immediately notifies all watchers

([source](https://zookeeper.apache.org/doc/current/zookeeperOver.html), [source](https://www.geeksforgeeks.org/devops/sessions-and-lifecycle-in-zookeeper/))

#### Sequential Nodes — The Fencing Token

- Created with SEQUENTIAL flag
- ZooKeeper appends a **monotonically increasing 10-digit counter** to the node name
- Counter increments across all sequential creations under a parent
- Guarantees ordering and uniqueness
- This IS the fencing token — the `zxid` or the znode version number serves as the monotonic sequence
- Per Kleppmann: "If you are using ZooKeeper as lock service, you can use the `zxid` or the znode version number as fencing token, and you're in good shape." ([source](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html))

#### Distributed Lock Recipe (The Canonical Algorithm)

From official ZooKeeper recipes ([source](https://zookeeper.apache.org/doc/r3.8.5/recipes.html)):

1. Call `create()` with path `_locknode_/guid-lock-` using SEQUENCE and EPHEMERAL flags
2. Call `getChildren()` on the lock node **without setting a watch** (critical: avoids herd effect)
3. If the created pathname has the lowest sequence number, the client has the lock. Done.
4. Call `exists()` with watch flag on the path with the **next lowest** sequence number
5. If `exists()` returns null, go to step 2. Otherwise, wait for the watch notification, then go to step 2.
6. To unlock: simply delete the node created in step 1.

**Herd effect optimization**: Each node watches only the single node ahead of it in the queue. "The removal of a node will only cause one client to wake up since each node is watched by exactly one client."

**Read/Write lock variant**: Read locks watch only the next-lower "write-" node. Write locks watch any next-lower node. Multiple readers can hold simultaneously.

**Error handling**: A GUID is prepended to handle the case where `create()` succeeds on the server but the response is lost — on reconnect, the client checks for its GUID in the children list.

#### Watches — One-Shot Event Notifications

- **One-shot by default**: A watch fires once, then is removed. Client must re-register.
- **Ordering guarantee**: "When a client has a watch on a node, it will never be able to read a changed value on that node until after it has received a change notification."
- **Limitation**: Between receiving a watch event and setting a new watch, the znode may change multiple times — the client will miss intermediate changes
- **Persistent recursive watches** (added in ZK 3.6.0): Not removed when triggered; fire for changes on the registered znode AND any children recursively
- ZooKeeper also considered a subscribe API (ZOOKEEPER-153) that would stream all changes in order, but this was separate from the core watch mechanism

([source](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html), [source](https://www.waitingforcode.com/apache-zookeeper/watches-in-apache-zookeeper/read))

**Comparison to MCP resource subscriptions**: MCP uses `notifications/resources/list_changed` — a server-push notification mechanism. ZooKeeper watches are client-initiated (you set a watch on a specific node). MCP notifications are more like ZK's persistent watches: they notify about changes to the list of available resources, not one specific resource. MCP's model is simpler because there's no one-shot vs persistent distinction — all notifications are persistent until the connection drops.

#### Session Semantics

Session states ([source](https://www.geeksforgeeks.org/devops/sessions-and-lifecycle-in-zookeeper/)):

| State | Meaning |
|-------|---------|
| CONNECTING | Attempting to establish connection |
| CONNECTED | Active session, operations permitted |
| RECONNECTING | Connection lost, attempting to reconnect within timeout |
| EXPIRED | Failed to reconnect within timeout; all ephemeral nodes deleted |
| AUTH_FAILED | Authentication failure |

Session events: `SyncConnected`, `Disconnected`, `Expired`, `AuthFailed`

- Timeout negotiated at session creation (typical: few seconds to one minute)
- Heartbeat: periodic client pings + any read/write operation counts as heartbeat
- Session state distributed across ZooKeeper ensemble — client can reconnect to a different server and resume
- On expiration: all ephemeral nodes owned by session are **immediately** deleted and watchers notified
- Key: session expiration is managed by the ZooKeeper **cluster**, not the client

#### Consistency Guarantees

| Property | Guarantee |
|----------|-----------|
| Sequential Consistency | Updates applied in order sent by client |
| Atomicity | Updates succeed or fail completely |
| Single System Image | Client sees same view regardless of which server it connects to |
| Reliability | Once an update is applied, it persists until overwritten |
| Timeliness | Client view is current within a bounded time |

**Writes are linearizable** (coordinated through ZAB atomic broadcast). **Reads are NOT linearizable** — can return stale data because reads are served from the local replica. Use `sync()` before a read to force linearizable read semantics.

#### ZAB Protocol (ZooKeeper Atomic Broadcast)

- All writes forwarded to a single **leader**
- Leader proposes writes to followers via atomic broadcast
- Requires majority agreement
- Provides **total ordering** of all write proposals via `zxid` (transaction ID)
- Leader election takes < 200ms ([source](https://zookeeper.apache.org/doc/current/zookeeperOver.html))
- Reads served locally from any server (no coordination) — this is why reads can be stale

([source](https://zookeeper.apache.org/doc/current/zookeeperInternals.html), [ZAB paper](https://www.datadoghq.com/pdf/zab.totally-ordered-broadcast-protocol.2008.pdf))

---

### 3. etcd v3 — The Modern Successor

**Sources:** [etcd docs](https://etcd.io/docs/v3.5/learning/why/), [Jepsen analysis](https://jepsen.io/analyses/etcd-3.4.3), [etcd API](https://etcd.io/docs/v3.4/learning/api/)

#### Lease API

| Operation | Purpose |
|-----------|---------|
| `LeaseGrant(TTL, ID)` | Create a lease with time-to-live |
| `LeaseKeepAlive(ID)` | Refresh a lease (bi-directional stream) |
| `LeaseRevoke(ID)` | Revoke a lease; all attached keys are deleted |

- Each key can be attached to at most one lease
- When a lease expires or is revoked, ALL keys attached to that lease are atomically deleted
- This replaces ZooKeeper's ephemeral nodes with a more explicit primitive
- Leases **decouple connections from sessions** — a key improvement over ZooKeeper

([source](https://etcd.io/docs/v3.5/learning/why/), [source](https://etcd.io/docs/v3.4/learning/api/))

**Critical limitation**: "The most important aspect of the lease mechanism is that TTL is defined as a physical time interval...It allows a situation that the server revokes the lease but the client still claims it owns the lease." Leases alone do NOT guarantee mutual exclusion. ([source](https://etcd.io/docs/v3.5/learning/why/))

#### Lock / Mutex Implementation

The etcd concurrency package (`clientv3/concurrency/mutex.go`) implements distributed locks using:
1. Create a session (which creates a lease)
2. Create a key under a prefix with the lease attached
3. Use the **creation revision** of the key as a fencing token
4. If no other key under the prefix exists with a lower revision, the lock is held
5. Otherwise, watch for deletion of keys with lower revisions
6. Unlock = delete the key (or let the lease expire)

([source](https://github.com/etcd-io/etcd/blob/main/client/v3/concurrency/mutex.go))

#### Compare-And-Swap (CAS)

etcd provides atomic conditional updates via transactions (`Txn`):
- Specify conditions (key exists, key version equals X, key value equals Y)
- If conditions met: execute "then" operations
- If not: execute "else" operations
- This is more general than ZooKeeper's version-based conditional writes

#### Jepsen Findings (etcd 3.4.3)

From the [Jepsen analysis](https://jepsen.io/analyses/etcd-3.4.3):

- **Key-value operations are strict-serializable**: "We observed nothing but strict-serializable consistency for reads, writes, and even multi-key transactions, during process pauses, crashes, clock skew, network partitions, and membership changes."
- **Locks are fundamentally unsafe**: "Multiple processes can hold an etcd lock concurrently, even in healthy clusters with perfectly synchronized clocks." This is inherent to all distributed locks in asynchronous systems.
- **Short TTL leases break quickly**: With 2-second lease TTLs and 5 concurrent processes, Jepsen "could reliably induce the loss of ~18% of acknowledged updates."
- **Recommendation**: Use lock revision as a fencing token. "Users can use the revision of their lock key as a globally ordered fencing token." The downstream resource must validate the token.
- **Bug found**: Locks returned after blocking without checking ownership (issue #11456)
- **Watches are reliable**: "Every update to a key in order" is delivered, provided compaction doesn't destroy history

#### Design Improvements Over ZooKeeper

([source](https://etcd.io/docs/v3.5/learning/why/))

| Feature | ZooKeeper | etcd |
|---------|-----------|------|
| Reads | Sequentially consistent (stale OK) | Linearizable |
| Watches | One-shot (can miss events) | Reliable streaming (never silently drops) |
| Data model | Hierarchical znodes | Flat key-value with MVCC |
| Session model | Connection-bound | Lease-based (decoupled from connection) |
| Membership | Static config changes | Dynamic reconfiguration |
| Protocol | Custom Jute RPC | gRPC (broad language support) |
| Consensus | ZAB | Raft |

etcd's position: **CP** (Consistency + Partition tolerance) — "will never tolerate split-brain operation and are willing to sacrifice availability."

---

### 4. HashiCorp Consul — The Service-Discovery Lock

**Source:** [Consul Sessions Documentation](https://developer.hashicorp.com/consul/docs/automate/session)

Consul sessions are "heavily inspired by The Chubby Lock Service" — the documentation cites the Chubby paper directly.

#### Session Creation

When creating a session, you specify:
- Node name
- List of health checks
- Behavior (release or delete)
- TTL (10s to 86400s)
- Lock-delay (0 to 60s, default 15s)

#### Lock Mechanism

Locks operate through the KV store's `acquire` and `release` operations:
- `acquire`: Like Check-And-Set — succeeds only if no existing lock holder. On success, increments `LockIndex` and sets the `Session` value
- `release`: Clears the Session but leaves `LockIndex` unmodified

#### Sequencer

The tuple **(Key, LockIndex, Session)** acts as a unique sequencer:
- `LockIndex` increments on each acquire
- Even if the same session re-acquires a lock, the LockIndex changes
- If session is invalidated, Session field becomes blank
- Downstream services can verify this tuple to detect stale operations

([source](https://developer.hashicorp.com/consul/docs/automate/session))

#### Lock-Delay (Directly from Chubby)

"Inspired by Google's Chubby" — when a session is invalidated, Consul prevents previously held locks from being re-acquired for the lock-delay interval. Purpose: "allowing the potentially still live leader to detect the invalidation and stop processing requests that may lead to inconsistent state." Default: **15 seconds**. ([source](https://developer.hashicorp.com/consul/docs/automate/session))

#### Release vs Delete Behavior

| Behavior | On Session Invalidation |
|----------|------------------------|
| Release (default) | Locks released, `ModifyIndex` incremented, key remains |
| Delete | Key deleted entirely — creates ephemeral entries (ZooKeeper-like) |

#### Health Check Integration

Consul's unique contribution: **gossip-based failure detection** instead of centralized heartbeat.
- Client agents on every node participate in a gossip pool
- Failure detection scales to any cluster size without concentrating work on servers
- Default health check: `serfHealth` (gossip-based)
- Trade-off: gossip provides **liveness** but can have false positives (sacrificing some safety)
- Sessions with no health checks trade liveness for guaranteed safety

#### Advisory Nature

"This locking system is purely advisory. There is no enforcement that clients must acquire a lock to perform any operation." — Same as Chubby, ZooKeeper, and etcd.

---

### 5. Cross-System Design Principles

#### Why Coarse-Grained Locks Win in Production

| System | Lock Granularity | Rationale |
|--------|-----------------|-----------|
| Chubby | Minutes to hours | Decouples lock-acquisition rate from transaction rate |
| ZooKeeper | Application-defined (typically coarse) | Lock recipe uses ephemeral sequential nodes — not designed for millisecond holding |
| etcd | Application-defined | Lease TTL is the lower bound; short TTLs (< 5s) proven unsafe by Jepsen |
| Consul | Application-defined (typically coarse) | Lock-delay defaults to 15s; designed for leader election, not fine-grained sync |

The core argument: with coarse-grained locks, a brief unavailability of the lock server doesn't stall clients (they already hold their lock). With fine-grained locks, every server hiccup cascades into client stalls proportional to throughput.

#### Why Session-Based Liveness Detection Beats Timeout-Only

Every system implements sessions with liveness detection:
- **Chubby**: KeepAlive RPCs + local lease approximation + jeopardy/grace period
- **ZooKeeper**: Session heartbeats (pings + operations) + server-side expiry + ephemeral node cleanup
- **etcd**: Lease KeepAlive streams + lease revocation + key deletion
- **Consul**: Gossip-based failure detection + session invalidation + lock-delay

Pure timeout approaches (like Redis EXPIRE) have a fundamental race: the client may believe it holds the lock after the server has expired it. Session-based approaches add an explicit "am I still connected?" signal.

#### Why Fencing Tokens / Sequencers Are Essential

From Kleppmann's analysis ([source](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)):

**The problem**: A client may experience arbitrary pauses (GC, page faults, network delays) while holding a lock. The lock expires, another client acquires it, but the first client resumes and performs its operation — thinking it still holds the lock.

**The solution**: Every lock acquisition returns a monotonically increasing token. Downstream resources track the highest token seen and reject operations with lower tokens.

| System | Fencing Token |
|--------|---------------|
| Chubby | Sequencer (lock name + mode + generation number) |
| ZooKeeper | zxid or znode version number |
| etcd | Key creation revision |
| Consul | (Key, LockIndex, Session) tuple |

**Critical insight from Jepsen**: Even with fencing tokens, distributed locks are "a fundamentally unsafe concept in asynchronous systems" for protecting external resources that don't participate in the validation. The downstream resource MUST check the token. ([source](https://jepsen.io/analyses/etcd-3.4.3))

#### How They Handle Split-Brain

All four systems are CP (consistency over availability):
- **Chubby**: 5 Paxos replicas, need majority (3) for master election
- **ZooKeeper**: ZAB requires majority for write commits
- **etcd**: Raft requires majority; "will never tolerate split-brain"
- **Consul**: Raft for server consensus; gossip for health checking (gossip can be AP-ish)

In a network partition, the minority partition cannot make progress — clients connected to it will time out. This is a deliberate choice: **correctness over availability**.

Additional protection: fencing tokens / sequencers prevent stale operations from a partition that was temporarily isolated.

#### CAP Trade-offs

| System | Consistency | Availability | Notes |
|--------|-------------|--------------|-------|
| Chubby | Strong (linearizable reads/writes through master) | Moderate (master failover ~seconds) | All ops through master |
| ZooKeeper | Writes linearizable, reads sequential | High for reads (local replica) | Stale reads possible |
| etcd | Linearizable reads and writes | Moderate | Raft-based, no split-brain |
| Consul | Linearizable KV ops | Moderate (Raft) + High (gossip health) | Hybrid consistency model |

---

### 6. Relevance to Sherpa's MCP Authority Design

#### Chubby's Coarse-Grained Model Maps to Initiative-Level Authority

Sherpa's authority is naturally coarse-grained:
- An agent holds authority over an initiative (minutes to hours of session time)
- Authority acquisition rate is decoupled from the agent's operation rate (many file writes per authority grant)
- Brief MCP server unavailability doesn't stall agents who already hold authority
- This is exactly Chubby's design rationale applied to agentic collaboration

#### ZooKeeper's Ephemeral Nodes Map to Agent Session Lifecycle

In Sherpa's MCP server:
- When an agent's session ends (context window closes, /compact, crash), its authority should be automatically released
- ZooKeeper achieves this with ephemeral nodes; Sherpa achieves it with session-linked authority records
- The pattern is identical: tie resource ownership to session liveness

#### Sequencers Map to Sherpa's fence_token

The fence_token in Sherpa's authority system serves the same purpose as:
- Chubby's sequencer (lock name + generation number)
- ZooKeeper's zxid
- etcd's creation revision
- Consul's (Key, LockIndex, Session) tuple

The downstream resource (file system, database) must validate the fence_token before accepting mutations. Without this, stale authority holders can corrupt state.

#### Single-Process MCP Server Eliminates Distributed Consensus

This is the crucial simplification. Chubby, ZooKeeper, etcd, and Consul all solve distributed consensus (Paxos, ZAB, Raft) because the lock service itself is distributed across multiple nodes. Sherpa's MCP server is a **single process**.

Implications:
- **No consensus protocol needed**: Authority decisions are made by one process; no quorum, no leader election, no split-brain
- **Locks are trivially correct**: A single-process lock is just an in-memory data structure (backed by SQLite for persistence)
- **Session detection still needed**: Even in a single process, you need to detect agent disconnection (MCP transport disconnection, session timeout). This maps to ZooKeeper's ephemeral node pattern.
- **Fencing tokens still needed**: Even in a single process, a slow agent may have its authority expire, a new agent may acquire it, and the old agent may submit stale operations. The fence_token prevents this.
- **Lock-delay still valuable**: When authority transfers (session death), a brief delay before re-granting prevents thundering herd and gives in-flight operations time to drain. Chubby's default of 1 minute and Consul's default of 15 seconds are reference points.

#### MCP Notifications Map to ZooKeeper Watches

MCP's notification system (`notifications/resources/list_changed`, `notifications/tools/list_changed`) is a simplified version of ZooKeeper watches:
- MCP notifications are **persistent** (no one-shot problem)
- MCP has no per-node watches — only list-level change notifications
- For Sherpa: authority state changes (granted, released, expired) should generate MCP notifications so connected agents can react
- MCP's Streamable HTTP transport with SSE is the event delivery channel

---

## Open Questions

1. **Lock-delay value for Sherpa**: Chubby uses 1 minute, Consul uses 15 seconds. What's appropriate for agent authority transfers? Agent sessions are longer than service sessions — maybe 30 seconds?

2. **Advisory vs enforcement**: All four systems use advisory locks. Sherpa's iteration-2 research found no existing MCP server implements mandatory enforcement. Should Sherpa be the first to enforce authority server-side? The Chubby argument against mandatory locks (prevents debugging/admin) applies — but agents are less predictable than Google engineers.

3. **Fencing token validation scope**: In Chubby, downstream file servers validate sequencers. In Sherpa, who validates fence_tokens? The MCP server itself (on every tool call)? Or the file system layer? Server-side validation is simpler but adds latency to every operation.

4. **Ephemeral authority with multi-MCP topology**: If Sherpa eventually supports multiple MCP servers, ephemeral authority records need the full distributed consensus treatment. For now, single-process is the correct starting point.

5. **Watch granularity for authority events**: Should Sherpa emit per-authority-record change events (like ZK per-node watches) or only list-level changes (like MCP's current model)? Per-record is more useful for agents watching specific initiatives.

6. **Session timeout calibration**: ZooKeeper negotiates timeout at session creation. Chubby defaults to 12 seconds. Agent sessions are much longer — but the timeout needs to be short enough to detect disconnected agents promptly. What's the right value?

---

## Sources

### Papers and Official Documentation

- [Burrows 2006 — "The Chubby lock service for loosely-coupled distributed systems" (PDF)](https://research.google.com/archive/chubby-osdi06.pdf)
- [Google Research — Chubby publication page](https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/)
- [USENIX OSDI '06 — Chubby paper](https://www.usenix.org/conference/osdi-06/chubby-lock-service-loosely-coupled-distributed-systems)
- [Hunt et al. 2010 — "ZooKeeper: Wait-free coordination for Internet-scale systems" (PDF)](https://www.usenix.org/legacy/event/atc10/tech/full_papers/Hunt.pdf)
- [USENIX ATC '10 — ZooKeeper paper](https://www.usenix.org/conference/usenix-atc-10/zookeeper-wait-free-coordination-internet-scale-systems)
- [ZAB Paper — "A simple totally ordered broadcast protocol" (PDF)](https://www.datadoghq.com/pdf/zab.totally-ordered-broadcast-protocol.2008.pdf)
- [ZooKeeper Overview — Official docs](https://zookeeper.apache.org/doc/current/zookeeperOver.html)
- [ZooKeeper Programmer's Guide](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ZooKeeper Recipes — Official](https://zookeeper.apache.org/doc/r3.8.5/recipes.html)
- [ZooKeeper Internals — Consistency Guarantees](https://zookeeper.apache.org/doc/current/zookeeperInternals.html)
- [etcd — "Why etcd" comparison document](https://etcd.io/docs/v3.5/learning/why/)
- [etcd v3 API documentation](https://etcd.io/docs/v3.4/learning/api/)
- [etcd API guarantees](https://etcd.io/docs/v3.5/learning/api_guarantees/)
- [etcd concurrency mutex source (Go)](https://github.com/etcd-io/etcd/blob/main/client/v3/concurrency/mutex.go)
- [Consul Sessions and Distributed Locks](https://developer.hashicorp.com/consul/docs/automate/session)
- [Consul KV HTTP API](https://developer.hashicorp.com/consul/api-docs/kv)
- [Consul Session HTTP API](https://developer.hashicorp.com/consul/api-docs/session)
- [MCP Architecture Overview](https://modelcontextprotocol.io/docs/learn/architecture)
- [Google SRE Book — Managing Critical State](https://sre.google/sre-book/managing-critical-state/)

### Analysis and Commentary

- [Kleppmann — "How to do distributed locking" (the definitive fencing token analysis)](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
- [Jepsen — etcd 3.4.3 analysis](https://jepsen.io/analyses/etcd-3.4.3)
- [Adrian Colyer — "The Chubby lock service" (The Morning Paper)](https://blog.acolyer.org/2015/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems/)
- [Adrian Colyer — "ZooKeeper: Wait-free coordination" (The Morning Paper)](https://blog.acolyer.org/2015/01/27/zookeeper-wait-free-coordination-for-internet-scale-systems/)
- [Surfing Complexity — "Locks, leases, fencing tokens, FizzBee!"](https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/)
- [Murat Demirbas — Chubby review](http://muratbuffalo.blogspot.com/2010/10/chubby-lock-service-for-loosely-coupled.html)
- [Fencing Tokens: Preventing Split Brain Operations (System Overflow)](https://www.systemoverflow.com/learn/distributed-primitives/distributed-locks/fencing-tokens-preventing-split-brain-operations)
- [Preventing Split Brain: Quorums, Fencing, and Epochs (System Overflow)](https://www.systemoverflow.com/learn/distributed-primitives/leader-election/preventing-split-brain-quorums-fencing-and-epochs)

### Summaries and Notes

- [Anant Jain — Chubby summary](https://www.anantjain.dev/posts/chubby)
- [Omkar Prabhu — Chubby notes](https://omkarprabhu-98.github.io/2021/01/chubby.html)
- [Keiko Nakata — Chubby notes](https://keikonakata.github.io/distr/2021-04-24-Chubby.html)
- [Mosharaf Chowdhury — Chubby review](https://mosharaf.com/blog/2011/09/22/the-chubby-lock-service-for-loosely-coupled-distributed-systems/)
- [Michael Whittaker — Annotated Chubby paper](https://mwhittaker.github.io/papers/html/burrows2006chubby.html)
- [jguamie — Chubby system design notes](https://github.com/jguamie/system-design/blob/master/notes/chubby-lock-service.md)
- [GeeksforGeeks — ZooKeeper Sessions and Lifecycle](https://www.geeksforgeeks.org/devops/sessions-and-lifecycle-in-zookeeper/)
- [waitingforcode — ZooKeeper Watches](https://www.waitingforcode.com/apache-zookeeper/watches-in-apache-zookeeper/read)
- [ZOOKEEPER-153 — Subscribe API proposal](https://issues.apache.org/jira/browse/ZOOKEEPER-153)
- [ZOOKEEPER-1416 — Persistent Recursive Watch](https://issues.apache.org/jira/browse/ZOOKEEPER-1416)
- [ZooKeeper vs Chubby consistency comparison](https://xudifsd.org/blog/2016/06/chubby-zookeeper-different-consistency-level/)
- [ZooKeeper vs Chubby design philosophy (Medium)](https://medium.com/@hrjeet0987/list-the-points-of-difference-in-the-design-philosophy-of-chubby-and-zookeeper-39832e49bb8f)

### Distributed Locking Practice

- [Architecture Weekly — "Distributed Locking: A Practical Guide"](https://www.architecture-weekly.com/p/distributed-locking-a-practical-guide)
- [Scale with Chintan — "Distributed Locking Best Practices: Redis, Zookeeper, Etcd"](https://scalewithchintan.com/blog/distributed-locking-best-practices-redis-zookeeper-etcd)
- [Hazelcast — "Distributed Locks are Dead; Long Live Distributed Locks!"](https://hazelcast.com/blog/long-live-distributed-locks/)
- [SoByte — "Talking about distributed lock implementation"](https://www.sobyte.net/post/2022-08/distributed-lock/)
- [MIT 6.824 — ZooKeeper FAQ](https://pdos.csail.mit.edu/6.824/papers/zookeeper-faq.txt)
- [etcd lease tutorial](https://etcd.io/docs/v3.5/tutorials/how-to-create-lease/)

---

## Raw Links (All URLs Encountered)

```
https://research.google/pubs/pub27897/
https://research.google.com/archive/chubby-osdi06.pdf
https://research.google.com/archive/chubby.html
https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/
https://www.usenix.org/conference/osdi-06/chubby-lock-service-loosely-coupled-distributed-systems
https://mwhittaker.github.io/papers/html/burrows2006chubby.html
https://github.com/jguamie/system-design/blob/master/notes/chubby-lock-service.md
https://www.semanticscholar.org/paper/The-Chubby-lock-service-for-loosely-coupled-systems-Fleisch/f470be358519a8b3ed3bb837d20602362ba892f4
https://www.andrew.cmu.edu/course/14-848/applications/ln/Chubby.pdf
https://osdi2006.blogspot.com/2006/10/paper-chubby-lock-service-for-loosely.html
https://mosharaf.com/blog/2011/09/22/the-chubby-lock-service-for-loosely-coupled-distributed-systems/
https://blog.acolyer.org/2015/02/13/the-chubby-lock-service-for-loosely-coupled-distributed-systems/
https://dl.acm.org/doi/10.5555/1298455.1298487
https://medium.com/princeton-systems-course/implementing-chubby-a-distributed-lock-service-8cf3c026c672
https://amplab.github.io/cs262a-fall2016/notes/22-Chubby.pdf
https://medium.com/coinmonks/chubby-a-centralized-lock-service-for-distributed-applications-390571273052
http://muratbuffalo.blogspot.com/2010/10/chubby-lock-service-for-loosely-coupled.html
https://www.cs.cornell.edu/courses/cs6464/2009sp/lectures/16-chubby.pdf
https://slideplayer.com/slide/6095162/
https://souptikji.github.io/blog/2018/03/Chubby
https://keikonakata.github.io/distr/2021-04-24-Chubby.html
https://www.anantjain.dev/posts/chubby
https://www.slideserve.com/duscha/the-chubby-lock-service-for-loosely-coupled-distributed-systems
https://cse.buffalo.edu/~mpetropo/CSE736-SP10/slides/seminar100409b2.pdf
https://www.slideserve.com/kalb/chubby-powerpoint-ppt-presentation
http://pages.cs.wisc.edu/~swift/classes/cs739-sp12/blog/2012/02/the_chubby_lock_service_for_lo.html
https://dirtysalt.github.io/html/chubby.html
https://omkarprabhu-98.github.io/2021/01/chubby.html
https://zookeeper.apache.org/doc/current/zookeeperOver.html
https://zookeeper.apache.org/doc/r3.4.9/zookeeperOver.html
https://zookeeper.apache.org/doc/r3.4.13/zookeeperOver.html
https://zookeeper.apache.org/doc/r3.5.1-alpha/zookeeperOver.html
https://zookeeper.apache.org/doc/r3.5.4-beta/zookeeperOver.html
https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html
https://zookeeper.apache.org/doc/r3.3.6/zookeeperProgrammers.html
https://zookeeper.apache.org/doc/r3.9.3/zookeeperProgrammers.html
https://zookeeper.apache.org/doc/r3.4.13/zookeeperProgrammers.html
https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html
https://zookeeper.apache.org/doc/r3.1.2/recipes.html
https://zookeeper.apache.org/doc/r3.8.5/recipes.html
https://zookeeper.apache.org/doc/current/zookeeperInternals.html
https://zookeeper.apache.org/doc/r3.4.13/zookeeperInternals.html
https://zookeeper.apache.org/doc/r3.6.2/zookeeperInternals.html
https://zookeeper.apache.org/doc/r3.5.9/zookeeperProgrammers.html
https://zookeeper.apache.org/doc/r3.1.2/javaExample.html
https://www.usenix.org/legacy/event/atc10/tech/full_papers/Hunt.pdf
https://www.usenix.org/conference/usenix-atc-10/zookeeper-wait-free-coordination-internet-scale-systems
https://www.semanticscholar.org/paper/ZooKeeper:-Wait-free-Coordination-for-Systems-Hunt-Konar/e0398bac8adf7a3847a92b1a16b41bfb76cb7265
https://pdfs.semanticscholar.org/ec98/0f049e3e2e0c0010eb4bf6cb4e269e9ea08d.pdf
https://dl.acm.org/doi/10.5555/1855840.1855851
https://cs.brown.edu/courses/cs138/s16/lectures/24ZooKeeper-notes.pdf
https://www.researchgate.net/publication/228366039_ZooKeeper_Wait-free_Coordination_for_Internet-scale_Systems
https://dblp.org/rec/conf/usenix/HuntKJR10.html
https://blog.acolyer.org/2015/01/27/zookeeper-wait-free-coordination-for-internet-scale-systems/
https://www.eecg.utoronto.ca/~ashvin/courses/ece1724/2024f/lectures/2-zookeeper-slides.pdf
https://www.datadoghq.com/pdf/zab.totally-ordered-broadcast-protocol.2008.pdf
https://oneuptime.com/blog/post/2026-01-25-zookeeper-distributed-locking/view
https://nofluffjuststuff.com/blog/scott_leberknight/2013/07/distributed_coordination_with_zookeeper_part_5_building_a_distributed_lock
https://dzone.com/articles/distributed-lock-using
https://medium.com/@m.hassan.def/distributed-locking-using-zookeeper-e6ec7d84feb3
https://medium.com/@aroragarima/zookeeper-internals-and-distributed-locking-158a6450691b
https://www.designgurus.io/blog/apache-zookeeper-architecture-system-design
https://thelinuxcode.com/distributed-coordination-services-with-zookeeper-system-design-patterns-that-dont-fall-apart-under-failure/
https://bikas-katwal.medium.com/zookeeper-introduction-designing-a-distributed-system-using-zookeeper-and-java-7f1b108e236e
https://www.tutorialspoint.com/zookeeper/zookeeper_quick_guide.htm
https://www.waitingforcode.com/apache-zookeeper/watches-in-apache-zookeeper/read
https://issues.apache.org/jira/browse/ZOOKEEPER-153
https://issues.apache.org/jira/browse/ZOOKEEPER-1416
https://ssudan16.medium.com/apache-zookeeper-internals-7b063f9d74ac
https://data-flair.training/blogs/zookeeper-watches/
https://pdos.csail.mit.edu/6.824/papers/zookeeper-faq.txt
https://www.geeksforgeeks.org/devops/sessions-and-lifecycle-in-zookeeper/
https://cwiki.apache.org/confluence/display/HADOOP2/ZooKeeper+FAQ
https://cwiki.apache.org/confluence/display/ZOOKEEPER/FAQ
https://kb.altinity.com/altinity-kb-setup-and-maintenance/zookeeper-session-expired/
https://lists.ubuntu.com/archives/juju/2011-October/000873.html
https://www.waitingforcode.com/apache-zookeeper/session-in-apache-zookeeper/read
https://medium.com/@jitenderkmr/understanding-the-zab-protocol-the-foundation-of-apache-zookeeper-d335dbae3ec9
https://www.geeksforgeeks.org/system-design/zab-algorithm-in-distributed-systems/
https://timilearning.com/posts/mit-6.824/lecture-8-zookeeper/
https://medium.com/@adityashete009/the-zab-algorithm-502781c54498
http://gkavya.in/apache-zookeeper/
https://www.sobyte.net/post/2022-08/zookeeper-zab/
https://xudifsd.org/blog/2016/06/chubby-zookeeper-different-consistency-level/
https://medium.com/@hrjeet0987/list-the-points-of-difference-in-the-design-philosophy-of-chubby-and-zookeeper-39832e49bb8f
https://etcd.io/docs/v3.5/learning/why/
https://etcd.io/docs/v3.4/learning/api/
https://etcd.io/docs/v3.6/learning/api/
https://etcd.io/docs/v3.5/learning/api_guarantees/
https://etcd.io/docs/v3.5/tutorials/how-to-create-lease/
https://etcd.io/docs/v3.2/dev-guide/api_concurrency_reference_v3/
https://etcd.io/docs/v3.3/dev-guide/interacting_v3/
https://github.com/etcd-io/etcd/blob/main/client/v3/concurrency/mutex.go
https://github.com/etcd-io/etcd/blob/v3.4.9/clientv3/concurrency/mutex.go
https://github.com/etcd-io/etcd/blob/v3.2.21/clientv3/lease.go
https://github.com/etcd-io/etcd/blob/main/client/v3/lease.go
https://etcd3-py.readthedocs.io/en/latest/etcd3.stateful.html
https://microsoft.github.io/etcd3/classes/lease.html
https://python-etcd3.readthedocs.io/en/latest/usage.html
https://pkg.go.dev/go.etcd.io/etcd/clientv3/concurrency
https://pkg.go.dev/go.etcd.io/etcd/client/v3/concurrency
https://pkg.go.dev/github.com/coreos/etcd/clientv3/concurrency
https://jepsen.io/analyses/etcd-3.4.3
https://developer.hashicorp.com/consul/docs/automate/session
https://developer.hashicorp.com/consul/api-docs/session
https://developer.hashicorp.com/consul/api-docs/kv
https://developer.hashicorp.com/consul/commands/lock
https://developer.hashicorp.com/consul/docs/automate/application-leader-election
https://developer.hashicorp.com/consul/commands/kv/put
https://developer.hashicorp.com/consul/docs/automate/kv
https://github.com/hashicorp/consul/blob/main/website/content/api-docs/session.mdx
https://github.com/hashicorp/consul/blob/main/api/session.go
https://github.com/hashicorp/consul/issues/840
https://consulate.readthedocs.io/en/stable/session.html
https://consulate.readthedocs.io/en/stable/lock.html
https://github.com/mantl/consul-cli/wiki/Session
https://python-consul.readthedocs.io/en/latest/
https://pkg.go.dev/github.com/hashicorp/consul/api
https://github.com/kurtome/python-consul-lock
https://maciejwinnicki.com/distributed-locks-with-consul-and-golang/
https://groups.google.com/g/consul-tool/c/sHAC9LVnePs
https://www.wallarm.com/cloud-native-products-101/consul-vs-zookeeper-service-discovery
https://medium.com/@karim.albakry/in-depth-comparison-of-distributed-coordination-tools-consul-etcd-zookeeper-and-nacos-a6f8e5d612a6
https://gist.github.com/yurishkuro/10cb2dc42f42a007a8ce0e055ed0d171
https://sourceforge.net/software/compare/Apache-ZooKeeper-vs-HashiCorp-Consul/
https://sourceforge.net/software/compare/Apache-ZooKeeper-vs-HashiCorp-Consul-vs-etcd/
https://stackshare.io/stackups/consul-vs-etcd-vs-zookeeper
https://stackshare.io/stackups/etcd-vs-zookeeper
https://bizety.com/2019/01/17/service-discovery-consul-vs-zookeeper-vs-etcd/
https://www.slideshare.net/ImeshaSudasingha/comparison-between-zookeeper-etcd-3-and-other-distributed-coordination-systems
https://designgurus.substack.com/p/system-design-essentials-zookeeper
https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/
https://medium.com/towardsdev/implementing-distributed-locks-correctly-5a35179422a6
https://medium.com/@lalitadithya/everything-ive-learnt-about-distributed-locking-so-far-1f1569e6df5
https://hazelcast.com/blog/long-live-distributed-locks/
https://dzone.com/articles/distributed-locks-are-dead-long-live-distributed-l
https://www.architecture-weekly.com/p/distributed-locking-a-practical-guide
https://asrathore08.medium.com/system-design-distributed-lock-821da42054db
https://www.alibabacloud.com/blog/implementation-principles-and-best-practices-of-distributed-lock_600811
https://sumofbytes.com/blog/distributed-locks-uses-and-implemetation/
https://scalewithchintan.com/blog/distributed-locking-best-practices-redis-zookeeper-etcd
https://www.sobyte.net/post/2022-08/distributed-lock/
https://shreemaan-abhishek.hashnode.dev/distributed-locking-using-etcd
https://sre.google/sre-book/managing-critical-state/
https://sre.google/resources/book-update/distributed-consensus/
https://sre.google/sre-book/bibliography/
https://medium.com/@razkevich8/distributed-consensus-explained-from-paxos-theory-to-real-world-systems-2836a578eefc
https://cse.buffalo.edu/tech-reports/2016-02.pdf
https://www.the-paper-trail.org/post/2009-02-03-consensus-protocols-paxos/
https://en.wikipedia.org/wiki/Paxos_(computer_science)
https://www.numberanalytics.com/blog/avoiding-brain-split-distributed-system-best-practices
https://www.designgurus.io/answers/detail/what-is-a-split-brain-scenario-in-a-distributed-cluster-and-how-can-systems-prevent-or-resolve-it
https://www.systemoverflow.com/learn/distributed-primitives/leader-election/preventing-split-brain-quorums-fencing-and-epochs
https://www.systemoverflow.com/learn/distributed-primitives/distributed-locks/fencing-tokens-preventing-split-brain-operations
https://backendbeyond.com/split-brain-in-distributed-systems/
https://www.anantacloud.com/post/understanding-the-split-brain-scenario-in-etcd-for-devops-engineers
https://modelcontextprotocol.io/docs/learn/architecture
https://medium.com/@nimritakoul01/the-model-context-protocol-mcp-a-complete-tutorial-a3abe8a7f4ef
https://modelcontextprotocol.info/docs/concepts/resources/
https://www.descope.com/learn/post/mcp
https://www.ibm.com/think/topics/model-context-protocol
https://medium.com/@aserdargun/model-context-protocol-mcp-e453b47cf254
https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md
https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-client-development-guide.md
https://xite.ai/blogs/model-context-protocol-mcp-a-new-standard-for-ai-integration/
https://composio.dev/blog/what-is-model-context-protocol-mcp-explained
https://algomaster.io/learn/concurrency-interview/coarse-vs-fine-grained-locking
https://www.quora.com/What-do-coarse-grained-locks-mean-in-distributed-systems
https://read.seas.harvard.edu/~kohler/class/cs111-s05/notes/notes8.html
https://www.sciencedirect.com/topics/computer-science/coarse-granularity
https://dl.acm.org/doi/abs/10.1145/3395363.3404368
https://martinfowler.com/eaaCatalog/coarseGrainedLock.html
https://pdfs.semanticscholar.org/a25e/ee836dbd2a5ae680f835309a484c9f39ae4e.pdf
https://queue.acm.org/detail.cfm?id=2655736
https://github.com/blog/1364-downtime-last-saturday
http://shop.oreilly.com/product/0636920028901.do
https://en.wikipedia.org/wiki/Distributed_lock_manager
https://lwn.net/Articles/667210/
https://medium.com/inspiredbrilliance/a-practical-guide-to-using-advisory-locks-in-your-application-7f0e7908d7e9
https://rclayton.silvrback.com/distributed-locking-with-postgres-advisory-locks
https://www.igvita.com/2010/04/30/distributed-coordination-with-zookeeper/
https://www.evanlin.com/til-2016-07-25/
http://debugger.wiki/article/html/156692076696584
https://omkarprabhu-98.github.io/2021/05/zookeeper.html
https://cnitarot.github.io/courses/ds_Fall_2016/505_chubby_zook.pdf
https://topic.alibabacloud.com/a/paxos-font-classtopic-s-color00c1dechubbyfont-vs-zab-zookeeper_8_8_31559354.html
https://9.7.cs.jmu.edu/kirkpams/OpenCSF/Books/csf/html/DistConsensus.html
https://medium.com/@ramteke.rakesh/distributed-lock-in-microservices-40efd53a604c
https://www.milanjovanovic.tech/blog/distributed-locking-in-dotnet-coordinating-work-across-multiple-instances
https://www.alibabacloud.com/blog/the-technical-practice-of-distributed-locks-in-a-storage-system_597141
```
