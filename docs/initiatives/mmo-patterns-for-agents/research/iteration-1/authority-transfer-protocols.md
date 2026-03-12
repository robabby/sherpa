# Authority Transfer Protocols: Games to Multi-Agent Systems

**Research iteration:** 1
**Date:** 2026-03-11
**Focus:** How games handle entity ownership transfer between servers, and how this maps to Planner/Worker/Judge handoff in multi-agent AI systems.

---

## Key Discoveries

### 1. The Improbable Patent: Most Detailed Authority Transfer Protocol Found

Improbable's US Patent 10,878,146 ("Handover techniques for simulation systems and methods") describes the most formalized authority transfer protocol discovered in this research. The protocol has four states and a bounded-time guarantee:

- **AUTHORITATIVE** -- the worker currently owns the component
- **AUTHORITY_LOSS_IMMINENT** -- the worker is notified it will lose authority after a configurable timeout
- **NOT_AUTHORITATIVE** -- authority has transferred to the new worker
- The timeout is configurable per-worker, per-component (32ms for physics, up to 1000ms for database-heavy systems)
- Even if the incumbent worker never acknowledges, authority transfers after timeout expiration -- crashed workers cannot block the system indefinitely
- Workers can signal readiness early ("soft handover"), completing transfer before timeout

**Critical design choice:** Single-writer enforcement at the component level. A component may have at most one writer at any time. This is the foundational constraint that prevents split-brain.

Source: [US Patent 10,878,146 (Google Patents)](https://patents.google.com/patent/US10878146B2/en)

### 2. Star Citizen's Replication Layer: Centralized Authority Broker

Star Citizen's server meshing architecture uses a **replication layer** as a centralized intermediary between all server nodes (DGS). Key properties:

- The replication layer is a suite of microservices (Replicant, Gateway, Atlas, Scribe, EntityGraph) that sits between clients and game servers
- Only one server node can have authority over any given entity; only that server writes state back to the replication layer
- Authority is allocated first-come-first-served and can migrate between servers based on entity location or load balancing needs
- The EntityGraph persists all entity state to a **graph database**, enabling crash recovery (replacement node restores state from EntityGraph)
- The replication layer is **event-driven** (not tick-based): packets are processed immediately upon arrival, minimizing latency
- Gateway holds no game state itself -- it is a pure packet router, enabling fast recovery (seconds) if a gateway crashes
- Replicant crash recovery targets sub-60 seconds: freeze, spin up replacement, restore from EntityGraph, reconnect

**Key insight for multi-agent:** The replication layer is analogous to a task board or shared state store that brokers authority. No server talks directly to another server. All state flows through the intermediary.

Sources:
- [Server Meshing Q&A (Star Citizen Wiki mirror)](https://star-citizen.wiki/Comm-Link:18397/en)
- [Replication Layer (Star Citizen Wiki)](https://starcitizen.tools/Replication_layer)
- [Unofficial Road to Dynamic Server Meshing](https://sc-server-meshing.info/)
- [Level1Techs Forum Discussion](https://forum.level1techs.com/t/star-citizen-persistent-entity-streaming-and-the-replication-layer/202872)
- [StarZen - Software Engineer Reacts](https://www.starzen.space/t/a-software-engineer-reacts-to-star-citizen-server-meshing-replication-layer-citizencon-2953/16687)

### 3. Ashes of Creation's Proxy Actor Pattern: Pre-stage Before Transfer

Ashes of Creation implements a **proxy actor** system for authority transfer at server boundaries:

- As an entity approaches a server boundary, the current server negotiates with the neighbor to spawn a **proxy** -- a lightweight replica containing only data needed for basic interactions
- The entity remains under authority of the original server while within its borders
- When the entity crosses the boundary, **promotion** occurs: the proxy becomes a full actor, authority transfers to the new server, and the process reverses (original becomes proxy until out of range, then is cleaned up)
- This is a **pre-staging** pattern: the receiving server already has a warm copy of the entity before authority transfers

**Key insight for multi-agent:** Pre-staging state on the receiving end before formal authority transfer eliminates cold-start problems. A Worker could receive a read-only "proxy" of the task context before formally receiving write authority.

Sources:
- [Server Meshing (Ashes of Creation Wiki)](https://ashesofcreation.wiki/Server_meshing)
- [Technical Exploration (GamingDeputy)](https://www.gamingdeputy.com/ashes-of-creation-technical-exploration-of-ashes-of-creations-server-meshing/)
- [MMORPG.com Coverage](https://www.mmorpg.com/news/ashes-of-creation-stream-breaks-down-new-server-meshing-network-technology-2000132119)
- [IntrepidNET Wiki](https://www.ashesofcreation.wiki/Intrepid_Net)

### 4. EVE Online: Avoids Runtime Authority Transfer Entirely

EVE Online's architecture deliberately avoids live node migration:

- Each solar system runs as a separate process (SOL server) on the cluster
- Players connect through proxy servers that route to the correct SOL server
- **Live node remap is NOT supported** -- users are disconnected during a node move
- Load balancing happens at daily downtime via the Static Cluster Premapper, which assigns systems to nodes based on estimated load fingerprints
- For anticipated large battles, CCP uses **node reinforcement**: moving a system to a dedicated "supernode" with double cores and RAM at downtime (requires advance notice via Fleet Fight Notification tool)
- When live overload occurs, they use **Time Dilation (TiDi)** -- slowing in-game time to 10% to keep the simulation consistent rather than transferring authority

**Key insight for multi-agent:** Sometimes the right answer is to avoid authority transfer altogether. EVE chose to slow time rather than migrate state. For Sherpa, this maps to: if a Worker is overloaded, it may be better to let it complete slowly than to hot-migrate the task to another Worker.

Sources:
- [EVE Evolved: Server Model (Engadget)](https://www.engadget.com/2008-09-28-eve-evolved-eve-onlines-server-model.html)
- [EVE Online Architecture (High Scalability)](https://highscalability.com/eve-online-architecture/)
- [7 Ways EVE Scales (High Scalability)](https://highscalability.com/7-sensible-and-1-really-surprising-way-eve-online-scales-to/)
- [Introducing TiDi (EVE Online)](https://www.eveonline.com/news/view/introducing-time-dilation-tidi)
- [Time Dilation Update (EVE Online)](https://www.eveonline.com/news/view/time-dilation-hows-that-going)
- [Fleet Fight Notification Tool (EVE Online)](https://www.eveonline.com/news/view/fleet-fight-notification-tool)
- [The Eve Cluster (EVE Online)](https://www.eveonline.com/news/view/the-eve-cluster)
- [Tranquility Tech III (EVE Online)](https://www.eveonline.com/news/view/tranquility-tech-3)
- [Tranquility Tech IV (EVE Online)](https://www.eveonline.com/news/view/tranquility-tech-iv)
- [Data Center Knowledge: TiDi](https://www.datacenterknowledge.com/archives/2013/01/31/experiencing-heavy-server-load-just-slow-down-time)
- [Time Dilation (EVE University Wiki)](https://wiki.eveuniversity.org/Time_dilation)

### 5. Photon Engine: Three Ownership Transfer Modes

Photon PUN 2 implements three distinct ownership transfer modes, each with different authority semantics:

- **Fixed**: Ownership never changes. Creator permanently owns player objects.
- **Request**: Two-step handshake. Requester calls `RequestOwnership()`, current owner receives callback, must explicitly accept via `TransferOwnership()`. Consent-based transfer.
- **Takeover**: Any actor can directly claim ownership without consent. No negotiation.

Master client migration (when the host disconnects):
- New master is the active actor with lowest actor number (deterministic selection)
- **Photon does NOT transfer room state** to the new master. No player properties, no cached events, no resent messages.
- State preservation is entirely the developer's responsibility
- Recommended mitigation: replicate critical game state across ALL players rather than storing it only on the master

**Key insight for multi-agent:** The "Request" mode maps directly to Planner/Worker handoff where the Worker must accept the task. The critical lesson is Photon's admission that state does NOT automatically transfer during master migration -- developers must design for this explicitly. In Sherpa, task context must be explicitly packaged and passed, not assumed to transfer.

Sources:
- [PUN 2 Ownership & Control](https://doc.photonengine.com/pun/current/gameplay/ownershipandcontrol)
- [PUN 2 Master Client Migration](https://doc.photonengine.com/pun/current/gameplay/hostmigration)
- [PUN 1 Ownership Transfer Demo](https://doc.photonengine.com/pun/v1/demos-and-tutorials/package-demos/ownership-transfer)
- [Fusion 2 Shared Mode Master Client](https://doc.photonengine.com/fusion/current/manual/shared-mode-master-client)
- [Forum: How to Switch Master Client](https://forum.photonengine.com/discussion/8904/how-to-switch-master-client)

### 6. coherence: Orphaned Entities as a First-Class Concept

coherence networking framework introduces the concept of **orphaned entities** -- entities that no one has authority over:

- Orphaned entities are not simulated; their synced properties freeze
- Entities become orphans when the authority-holding client disconnects or explicitly calls `AbandonAuthority()`
- Adoption can be automatic (Auto-Adopt Orphan setting) or manual via `Adopt()`
- Authority is split into **State Authority** (can change entity properties) and **Input Authority** (can send inputs to the state authority holder)
- Only the State Authority holder can transfer Input Authority

**Key insight for multi-agent:** The orphan concept is directly applicable. When a Worker crashes mid-task, the task becomes "orphaned" -- frozen, not being simulated. The framework needs explicit adoption mechanics: does the Judge auto-adopt orphaned tasks? Does the Planner reassign? coherence's split between State Authority and Input Authority maps to read vs. write access on shared artifacts.

Sources:
- [Authority (coherence Docs)](https://docs.coherence.io/manual/authority)
- [Server-Authoritative Setup (coherence Docs)](https://docs.coherence.io/manual/authority/server-authoritative-setup)

### 7. Unity Distributed Authority: Ownership Lock and Permission Levels

Unity Netcode for GameObjects (v2.10+) introduces a distributed authority topology with five ownership permission levels:

- **None**: Static, cannot be redistributed
- **Distributable**: Auto-redistributed when clients join/leave (load balancing)
- **Transferable**: Immediate transfer, no consent needed, unless locked or request pending
- **RequestRequired**: Must request before transfer, always locked after transfer
- **SessionOwner**: Cannot be transferred at all

The **ownership lock** (`SetOwnershipLock`) prevents changes during critical operations. Known issue: race conditions occur when claiming ownership of moving objects during the transfer window (GitHub issue #2897).

**Key insight for multi-agent:** Different tasks need different ownership modes. A roadmap document (SessionOwner = Planner only) vs. implementation files (Transferable from Worker to Judge) vs. shared config (RequestRequired with lock during modification). The lock mechanism prevents mid-edit authority changes.

Sources:
- [Ownership (Unity Netcode 2.10)](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.10/manual/terms-concepts/ownership.html)
- [Distributed Authority Topologies](https://unity.com/products/distributed-authority)
- [GitHub Issue #2897: Transfer Race Condition](https://github.com/Unity-Technologies/com.unity.netcode.gameobjects/issues/2897)
- [Understanding Ownership (Netcode 2.5)](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.5/manual/basics/ownership.html)

### 8. Fencing Tokens: The Distributed Systems Solution to Stale Authority

Martin Kleppmann's analysis of distributed locking introduces **fencing tokens** as the mechanism to prevent stale writes after authority expires:

- A fencing token is a monotonically increasing integer assigned each time a lock changes hands
- The storage system remembers the highest token it has seen and rejects writes with lower tokens
- This prevents a process with an expired lease from writing stale data after a new authority holder has taken over
- The token acts as a **proof of current authority** that the storage layer can verify independently

**Key insight for multi-agent:** Every authority transfer in Sherpa should include a monotonically increasing token. When Worker A completes and Worker B gets reassigned, the task board should reject late writes from Worker A. This is the mechanism that prevents the "ghost write" problem where a slow/crashed Worker writes results after the Judge has already moved on.

Sources:
- [How to do distributed locking (Kleppmann)](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
- [Fencing Tokens (Designing Data-Intensive Applications)](https://ebrary.net/64834/computer_science/fencing_tokens)
- [Locks, Leases, Fencing Tokens (Surfing Complexity)](https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/)
- [Distributed Locking Learnings (Medium)](https://medium.com/@lalitadithya/everything-ive-learnt-about-distributed-locking-so-far-1f1569e6df5)
- [Distributed Locks with Redis](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)

### 9. DLM Lock Remastering: Authority Migration When Topology Changes

The VMS Distributed Lock Manager (1984) handles authority migration when cluster membership changes:

- Lock remastering moves lock mastership to another node, including all lock information for the entire resource tree
- Triggered when a node leaves the cluster or dynamically to minimize off-node messaging overhead
- Controlled by willingness parameters (LOCKRMWT: 0-10 scale of willingness to master locks)
- During cluster membership change: (1) new lock requests disabled, (2) database scanned, non-local data removed, (3) nodes re-acquire their own locks, (4) waiting locks re-ordered by original sequence numbers, (5) new masters chosen through re-acquisition, (6) locking re-enabled
- The re-acquisition preserves ordering via sequence numbers assigned at original queue time

**Key insight for multi-agent:** The DLM's lock remastering during topology changes maps to what happens when a Worker crashes or a new Judge instance spins up. The "freeze, re-acquire, re-order, resume" pattern is directly applicable to task board recovery.

Sources:
- [Distributed Lock Manager (VMS Wiki)](https://wiki.vmssoftware.com/Distributed_Lock_Manager)
- [DLM (Wikipedia)](https://en.wikipedia.org/wiki/Distributed_lock_manager)
- [Oracle DLM Reference](https://docs.oracle.com/cd/A57673_01/DOC/server/doc/SPS73/chap8.htm)

### 10. AI Agent Handoff Patterns: Current State of the Art

The AI agent ecosystem has converged on several handoff patterns, none of which have the sophistication of game authority transfer:

**OpenAI Swarm (educational framework):**
- Handoff is implemented as tool call: agent returns an `Agent` object instead of a string, and the orchestration loop switches the active agent
- Conversation history carries forward; only the system prompt changes
- No persistent state between calls -- every handoff must include all context
- No fencing, no authority verification, no orphan handling

**Microsoft Semantic Kernel / Agent Framework (production):**
- Handoff orchestration: agents transfer control based on context
- `OrchestrationHandoffs` defines directed graph of who can hand off to whom
- Supports human-in-the-loop via `InteractiveCallback`
- Runtime manages agent lifecycle; `InProcessRuntime` handles execution
- Still conversational (chat-based), not artifact/file-authority-based

**Common AI patterns across frameworks:**
- Centralized orchestration (supervisor dispatches to workers)
- Handoff (synchronous transfer with wait-for-completion)
- Assign (asynchronous spawning for parallel execution)
- Send Message (direct communication with existing agents)

**Key gap:** None of the current AI agent frameworks implement authority transfer over shared state/artifacts. They transfer conversational context, not write access to files or databases. Sherpa's Planner/Worker/Judge model needs authority over filesystem artifacts, which is fundamentally closer to game entity authority than to chatbot routing.

Sources:
- [OpenAI Swarm (GitHub)](https://github.com/openai/swarm)
- [Orchestrating Agents (OpenAI Cookbook)](https://developers.openai.com/cookbook/examples/orchestrating_agents/)
- [Handoff Agent Orchestration (Microsoft Learn)](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/handoff)
- [AI Agent Orchestration Patterns (Azure Architecture)](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Multi-Agent Orchestration (Semantic Kernel blog)](https://devblogs.microsoft.com/semantic-kernel/semantic-kernel-multi-agent-orchestration/)
- [Agentic AI: Multi-Agent Systems (Tamas Piros)](https://tpiros.dev/blog/multi-agent-systems-and-task-handoff/)
- [Planner-Worker Separation Pattern](https://github.com/nibzard/awesome-agentic-patterns/blob/main/patterns/planner-worker-separation-for-long-running-agents.md)
- [Multi-Agent Patterns in LlamaIndex](https://developers.llamaindex.ai/python/framework/understanding/agent/multi_agent/)
- [Google ADK Multi-Agent Patterns](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [AWS Strands Multi-Agent Patterns](https://aws.amazon.com/blogs/machine-learning/multi-agent-collaboration-patterns-with-strands-agents-and-amazon-nova/)
- [OpenAI Agents SDK Handoffs](https://openai.github.io/openai-agents-python/handoffs/)

---

## The Authority Gap Problem

The "authority gap" is the window during transfer when authority is in flight -- the old holder has released it but the new holder hasn't fully acquired it. Every system studied handles this differently:

| System | Authority Gap Strategy |
|--------|----------------------|
| SpatialOS/Improbable | Bounded timeout with AUTHORITY_LOSS_IMMINENT state; old worker retains write until timeout or soft handover signal |
| Star Citizen | Replication layer as intermediary holds canonical state; both servers are "clients" of the replication layer |
| Ashes of Creation | Proxy pre-staging eliminates cold start; promotion is atomic from the entity's perspective |
| EVE Online | Avoids the problem entirely -- no live transfer, uses time dilation instead |
| Photon | Lowest-actor-number deterministic selection; state NOT transferred (gap is real and visible) |
| coherence | Orphan state: entity freezes, awaits adoption |
| Unity Netcode | Ownership lock prevents changes during critical windows; pending requests queue |
| DLM | Freeze all operations, re-acquire, re-order by sequence number, resume |
| Fencing tokens | Old authority's writes rejected by storage layer via monotonic token comparison |

---

## Is Game Authority Transfer a Form of 2PC?

The Improbable patent's protocol resembles a simplified two-phase commit:

| 2PC Phase | Game Authority Analog |
|-----------|----------------------|
| Phase 1: Coordinator asks "can you commit?" | Runtime sends AUTHORITY_LOSS_IMMINENT to incumbent |
| Phase 1: Participant votes YES/NO | Worker sends final state updates or signals readiness |
| Phase 2: Coordinator says "commit" | Runtime assigns authority to new worker, notifies both |

**Key difference:** Game authority transfer is not truly a 2PC because the "vote" phase is time-bounded and non-blocking. If the incumbent doesn't respond, authority transfers anyway after timeout. This is closer to a **lease expiration** model than a consensus protocol. Games optimize for availability over consistency (the game must keep running), while 2PC optimizes for consistency over availability.

Three-phase commit (3PC) adds a PreCommit phase where all participants learn the decision before any commit occurs. The Improbable AUTHORITY_LOSS_IMMINENT state is analogous -- it's a "pre-commit" notification that gives the incumbent time to finalize before the actual transfer.

Sources:
- [Two-Phase Commit (Wikipedia)](https://en.wikipedia.org/wiki/Two-phase_commit_protocol)
- [Two-Phase Commit (Martin Fowler)](https://martinfowler.com/articles/patterns-of-distributed-systems/two-phase-commit.html)
- [Three-Phase Commit (Wikipedia)](https://en.wikipedia.org/wiki/Three-phase_commit_protocol)
- [Three-Phase vs Two-Phase Comparison (Medium)](https://daminibansal.medium.com/understanding-two-phase-and-three-phase-commit-protocols-key-differences-use-cases-and-practical-975e7c663c67)
- [2PC Princeton Lecture](https://www.cs.princeton.edu/courses/archive/fall16/cos418/docs/L6-2pc.pdf)

---

## Implications for Planner/Worker/Judge Authority Handoff

### Pattern 1: Replication Layer = Task Board (from Star Citizen)

The replication layer pattern maps directly to Sherpa's architecture:

- **Task board** is the replication layer -- the canonical source of truth for all task state
- **Planner, Worker, Judge** are all "server nodes" that connect to the task board
- No agent talks to another agent directly about task state -- all reads and writes go through the task board
- The task board is event-driven: state changes propagate immediately
- If a Worker crashes, the task board still holds the canonical state and can assign a replacement

### Pattern 2: Pre-staging with Proxy Actors (from Ashes of Creation)

Before formal authority transfer from Planner to Worker:

1. Planner creates the task definition (full actor on Planner's side)
2. Worker receives a **read-only proxy** of the task: it can see the requirements, explore the codebase, understand context -- but cannot yet write implementation files
3. At the formal handoff moment, the proxy is **promoted**: Worker gains write authority over the implementation files
4. Worker's changes are visible as "proxy" to the Judge (read-only observation)
5. When Worker completes, Judge is **promoted** to authority over the review

### Pattern 3: Fencing Tokens for Stale Write Prevention

Every task assignment should carry a monotonically increasing **authority token**:

- When Planner assigns Task #42 to Worker A, it issues token T=7
- If Worker A is replaced by Worker B, Worker B gets token T=8
- The task board rejects any writes from token T=7 after T=8 has been issued
- This prevents the "zombie Worker" problem where a slow/crashed Worker submits results after reassignment

### Pattern 4: Bounded Timeout with Early Completion (from Improbable Patent)

Authority transfers should have a maximum timeout:

1. Worker receives notification that it's losing authority (AUTHORITY_LOSS_IMMINENT equivalent)
2. Worker has a configurable window to finalize state (save work, commit partial results)
3. Worker can signal early readiness ("I'm done, transfer now")
4. If Worker doesn't respond within the timeout, authority transfers anyway
5. Judge inherits whatever state exists at that point

### Pattern 5: Orphan Detection and Adoption (from coherence)

Tasks need an orphan protocol:

- If a Worker disconnects without completing, the task enters **orphan state** (frozen, not being worked on)
- Orphan detection should be automatic (heartbeat timeout)
- Adoption can be automatic (round-robin to next available Worker) or manual (Planner reassigns)
- Orphaned task state is preserved -- the new Worker picks up where the old one left off, not from scratch

### Pattern 6: Ownership Permission Levels (from Unity Netcode)

Different artifacts need different ownership rules:

| Artifact | Permission | Analog |
|----------|-----------|--------|
| Task definition | SessionOwner (Planner only) | Only Planner can modify task requirements |
| Implementation files | Transferable | Worker writes, then Judge reviews |
| Shared config / CLAUDE.md | RequestRequired + Lock | Must request before editing; locked during modification |
| Activity log | Distributable | Auto-assigned to whoever is currently working |
| Roadmap / guidelines | None (proposals only) | Cannot be directly modified by any Worker |

### Pattern 7: Avoid Transfer When Possible (from EVE Online)

Not every bottleneck needs authority transfer:

- If a Worker is slow but making progress, let it finish (TiDi equivalent: accept slower execution)
- Reserve authority transfer for actual failures, not performance optimization
- Pre-allocate "reinforced nodes" for known high-complexity tasks (dedicated Worker with more context/resources)

---

## Open Questions

1. **Should the Judge have write authority over implementation files, or only over the approval/rejection decision?** In game terms: does the Judge "take ownership of the entity" or only "observe and flag"?

2. **What is the right timeout for Worker authority?** Improbable uses 32ms-1000ms. For AI agents working on code tasks, the equivalent might be session-length bounded (one context window). How do we detect a "stuck" Worker vs. one that's legitimately taking longer?

3. **How do we handle partial authority transfer?** SpatialOS allows component-level authority (different workers own different components of the same entity). Should a Worker be able to have write authority over `src/` but only read authority over `docs/`?

4. **Is the task board a single point of failure?** Star Citizen's replication layer has crash recovery via EntityGraph. What's Sherpa's equivalent? Git itself (the repo is the graph database)?

5. **How do we implement fencing tokens in a filesystem-based system?** Git commit SHAs are not monotonically increasing. Branch protection rules? A sequence number in the task file frontmatter?

6. **Should authority transfer be pull-based (Worker requests authority) or push-based (Planner assigns authority)?** Photon's "Request" mode is pull; Photon's "Takeover" is push. Different tasks may need different modes.

7. **What's the equivalent of the "proxy actor" for code tasks?** Is it a git worktree with read-only access? A branch that can be inspected but not pushed to?

8. **How does the Planner/Worker/Judge model handle recursive authority?** If a Worker spawns sub-tasks (sub-Workers), does it delegate its authority or retain it? SpatialOS's component-level authority suggests delegation is possible.

---

## Raw Links

Every URL encountered during this research, including tangentially relevant ones:

### Star Citizen / Server Meshing
- https://robertsspaceindustries.com/en/comm-link/transmission/18397-Server-Meshing-And-Persistent-Streaming-Q-A
- https://star-citizen.wiki/Comm-Link:18397/en
- https://starcitizen.tools/Server_meshing
- https://starcitizen.tools/Replication_layer
- https://starcitizen.tools/Persistent_Entity_Streaming
- https://starcitizen.tools/Object_Container_Streaming
- https://sc-server-meshing.info/
- https://prezi.com/p/xk5ilzstjrhy/star-citizen-unofficial-road-to-dynamic-server-meshing/
- https://forum.level1techs.com/t/star-citizen-persistent-entity-streaming-and-the-replication-layer/202872
- https://testsquadron.com/threads/server-meshing.21319/
- https://testsquadron.com/threads/server-meshing-discussion.18423/
- https://robertsspaceindustries.com/spectrum/community/SC/forum/50259/thread/has-some-of-the-pre-server-meshing-tech-like-entit
- https://www.starzen.space/t/replication-layer-server-meshing-the-road-to-star-citizen-4-0-what-you-need-to-know/14447
- https://www.starzen.space/t/a-software-engineer-reacts-to-star-citizen-server-meshing-replication-layer-citizencon-2953/16687
- https://cddn.fr/server-meshing-star-citizen/
- https://news.ycombinator.com/item?id=37307253

### EVE Online
- https://www.eveonline.com/news/view/the-eve-cluster
- https://www.eveonline.com/news/view/tranquility-tech-iv
- https://www.eveonline.com/news/view/tranquility-tech-3
- https://www.eveonline.com/news/view/tranquility-tech-iii-an-update
- https://www.eveonline.com/news/view/my-node-was-equipped-with-the-following...
- https://www.eveonline.com/news/view/building-a-balanced-universe
- https://www.eveonline.com/news/view/introducing-time-dilation-tidi
- https://www.eveonline.com/news/view/time-dilation-hows-that-going
- https://www.eveonline.com/news/view/fleet-fight-notification-tool
- https://www.engadget.com/2008-09-28-eve-evolved-eve-onlines-server-model.html
- https://highscalability.com/eve-online-architecture/
- https://highscalability.com/7-sensible-and-1-really-surprising-way-eve-online-scales-to/
- https://wiki.eveuniversity.org/Time_dilation
- https://www.datacenterknowledge.com/archives/2013/01/31/experiencing-heavy-server-load-just-slow-down-time
- https://imperium.news/the-complexity-paradox/
- https://forums.eveonline.com/t/time-dilation/424645
- https://steamcommunity.com/app/8500/discussions/0/4027969202134136653/

### SpatialOS / Improbable
- https://documentation.improbable.io/spatialos-overview/docs/handing-over-write-access-authority
- https://networking.docs.improbable.io/welcome/spatialos-concepts/authority-and-interest/
- https://documentation.improbable.io/gdk-for-unreal/v0.10.0/docs/actor-handover
- https://docs.improbable.io/reference/13.6/shared/design/understanding-access
- https://docs.improbable.io/reference/13.0/csharpsdk/using
- https://docs.improbable.io/reference/11.0/workers/java/using
- https://docs.improbable.io/reference/13.8/shared/design/design-workers
- https://docs.improbable.io/reference/14.4/shared/design/commands
- https://documentation.improbable.io/sdks-and-data/docs/csharp-bindings-send-data-to-spatialos
- https://patents.google.com/patent/US10878146B2/en
- https://patents.justia.com/patent/10878146
- https://www.improbable.io/blog/create-a-custom-flocking-worker/
- https://www.improbable.io/blog/dynamically-distributing-a-simulation-over-hundreds-of-physics-engines/
- https://ims.improbable.io/insights/dynamically-distributing-a-simulation-over-hundreds-of-physics-engines/
- https://improbable.io/blog/spatialos-unreal-gdk-pre-alpha
- https://improbable.io/blog/spatialos-gdk-for-unreal-launch
- https://github.com/spatialos/CppBlankProject/blob/master/README.md
- https://github.com/spatialos/UnrealSDK/blob/master/Game/Source/SpatialOS/Public/WorkerSdk/include/improbable/worker.h
- https://github.com/spatialos/CExampleProject
- https://github.com/spatialos/UnrealGDK
- https://github.com/spatialos/UnrealGDK/pull/1201/files/e3461e210281a62a27327b81b38feb4f06919af5
- https://github.com/spatialos/UnrealGDK/blob/release/CHANGELOG.md
- https://github.com/spatialos/UnrealGDKTestGyms/blob/master/USER_MANUAL.md
- https://documentation.improbable.io/gdk-for-unreal/docs/snapshots-actor-and-entity-synchronization-considerations
- https://www.cbinsights.com/company/improbable-patents

### Ashes of Creation
- https://ashesofcreation.wiki/Server_meshing
- https://www.ashesofcreation.wiki/Intrepid_Net
- https://ashesofcreation.wiki/Server_channels
- https://ashesofcreation.wiki/Servers
- https://ashesofcreation.wiki/Template:Server_meshing
- https://www.mmorpg.com/news/ashes-of-creation-stream-breaks-down-new-server-meshing-network-technology-2000132119
- https://forums.mmorpg.com/discussion/505672/ashes-of-creation-stream-breaks-down-new-server-meshing-network-technology-mmorpg-com
- https://www.gamingdeputy.com/ashes-of-creation-technical-exploration-of-ashes-of-creations-server-meshing/
- https://en.nephi-labs.com/2024/07/12/technical-exploration-of-ashes-of-creations-server-meshing/
- https://forums.ashesofcreation.com/discussion/59653/feedback-request-alpha-two-server-meshing-technology-preview-shown-in-june-livestream/p2
- https://forums.ashesofcreation.com/discussion/59653/feedback-request-alpha-two-server-meshing-technology-preview-shown-in-june-livestream/p3
- https://forums.ashesofcreation.com/discussion/59653/feedback-request-alpha-two-server-meshing-technology-preview-shown-in-june-livestream/p4
- https://nosygamer.blogspot.com/2024/07/the-server-meshing-wars-have-begun.html
- https://www.aeanet.org/what-is-server-meshing/

### Mirror / Photon / coherence / Unity Networking
- https://mirror-networking.gitbook.io/docs/manual/guides/authority
- https://mirror-networking.gitbook.io/docs/guides/authority
- https://mirror-networking.gitbook.io/docs/manual/general
- https://doc.photonengine.com/pun/current/gameplay/ownershipandcontrol
- https://doc.photonengine.com/pun/current/gameplay/hostmigration
- https://doc.photonengine.com/pun/v1/gameplay/hostmigration
- https://doc.photonengine.com/pun/v1/demos-and-tutorials/package-demos/ownership-transfer
- https://doc.photonengine.com/fusion/current/getting-started/migration/coming-from-pun2
- https://doc.photonengine.com/fusion/current/manual/shared-mode-master-client
- https://doc.photonengine.com/realtime/current/gameplay/hostmigration
- https://forum.photonengine.com/discussion/8904/how-to-switch-master-client
- https://forum.photonengine.com/discussion/17934/master-client-change
- https://docs.coherence.io/manual/authority
- https://docs.coherence.io/manual/authority/server-authoritative-setup
- https://docs.coherence.io/1.3/manual/authority
- https://docs.unity3d.com/2020.1/Documentation/Manual/UNetAuthority.html
- https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.10/manual/terms-concepts/ownership.html
- https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.7/manual/terms-concepts/ownership.html
- https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.6/manual/terms-concepts/ownership.html
- https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.5/manual/basics/ownership.html
- https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/basics/ownership.html
- https://unity.com/products/distributed-authority
- https://docs-multiplayer.unity3d.com/netcode/current/basics/ownership/
- https://mp-docs.dl.it.unity3d.com/netcode/current/terms-concepts/distributed-authority/
- https://github.com/Unity-Technologies/com.unity.netcode.gameobjects/issues/2897
- https://github.com/Unity-Technologies/com.unity.netcode.gameobjects/issues/2904
- https://github.com/Unity-Technologies/com.unity.netcode.gameobjects/releases
- https://github.com/Unity-Technologies/com.unity.multiplayer.docs/blob/main/docs/basics/ownership.md
- https://discussions.unity.com/t/mirror-solved-changing-client-authority-for-object-with-networktransform/1638324
- https://discussions.unity.com/t/unity-mirror-server-and-client-controlling-a-gameobject/329548
- https://discussions.unity.com/t/mirror-networkserver-replaceplayerforconnection-replaces-player-but-client-has-no-authority/824897
- https://discussions.unity.com/t/need-help-understanding-the-unet-client-authority-player/807206
- https://discussions.unity.com/t/distributed-authority-requestownership-explanations/1707773

### Distributed Systems / Locking / Consensus
- https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
- https://pages.cs.wisc.edu/~remzi/Classes/739/Spring2003/Papers/leases-redis-problem.pdf
- https://wiki.vmssoftware.com/Distributed_Lock_Manager
- https://en.wikipedia.org/wiki/Distributed_lock_manager
- https://en.wikipedia.org/wiki/Two-phase_commit_protocol
- https://en.wikipedia.org/wiki/Three-phase_commit_protocol
- https://docs.oracle.com/cd/A57673_01/DOC/server/doc/SPS73/chap8.htm
- https://docs.oracle.com/cd/A58617_01/server.804/a58238/ch8_lm.htm
- https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/high_availability_add-on_overview/ch-dlm
- https://documentation.suse.com/sle-ha/15-SP6/html/SLE-HA-all/cha-ha-storage-dlm.html
- https://documentation.suse.com/sle-ha/15-SP5/html/SLE-HA-all/cha-ha-storage-dlm.html
- https://documentation.suse.com/sle-ha/12-SP5/html/SLE-HA-all/cha-ha-storage-dlm.html
- https://documentation.suse.com/sle-ha/15-SP1/html/SLE-HA-all/cha-ha-storage-dlm.html
- https://www.dremio.com/wiki/distributed-lock-manager/
- https://metacpan.org/pod/DLM::Client
- https://martinfowler.com/articles/patterns-of-distributed-systems/two-phase-commit.html
- https://ebrary.net/64834/computer_science/fencing_tokens
- https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/
- https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/
- https://antirez.com/news/101
- https://medium.com/@lalitadithya/everything-ive-learnt-about-distributed-locking-so-far-1f1569e6df5
- https://medium.com/@qingedaig/distributed-systems-consistency-patterns-3d2fa986fa3b
- https://medium.com/nerd-for-tech/split-brain-in-distributed-systems-252b0d4d122e
- https://medium.com/geekculture/distributed-transactions-two-phase-commit-c82752d69324
- https://medium.com/@hongilkwon/when-to-use-two-phase-commit-in-distributed-transaction-f1296b8c23fd
- https://daminibansal.medium.com/understanding-two-phase-and-three-phase-commit-protocols-key-differences-use-cases-and-practical-975e7c663c67
- https://www.designgurus.io/answers/detail/how-do-distributed-transactions-work-and-what-is-two-phase-commit-2pc
- https://www.designgurus.io/answers/detail/what-is-a-split-brain-scenario-in-a-distributed-cluster-and-how-can-systems-prevent-or-resolve-it
- https://www.geeksforgeeks.org/dbms/two-phase-commit-protocol-distributed-transaction-management/
- https://www.cs.princeton.edu/courses/archive/fall16/cos418/docs/L6-2pc.pdf
- https://endgrate.com/blog/two-phase-commit-protocol-explained
- https://dev.to/ovichowdhury/demystifying-two-phase-commit-2pc-for-distributed-transaction-in-microservices-5ca7
- https://dzone.com/articles/split-brain-in-distributed-systems
- https://www.linkedin.com/pulse/split-brain-distributed-system-ami-bhushan-xah1c
- https://docs.us.sios.com/spslinux/9.5.2/en/topic/what-is-quot-split-brain-quot-and-how-to-avoid-it
- https://www.javacodegeeks.com/2023/10/the-split-brain-phenomenon-a-distributed-systems-dilemma.html
- https://www.veritas.com/support/en_US/article.100015354
- https://etcd.io/docs/v3.5/learning/why/
- https://sklar.rocks/kubernetes-leader-election/
- https://dingyu.dev/en/posts/distributed-locking/
- https://newsletter.scalablethread.com/p/how-distributed-systems-avoid-race
- https://medium.com/towardsdev/implementing-distributed-locks-correctly-5a35179422a6
- https://jaytaylor.com/notes/node/1559754112000.html
- https://news.ycombinator.com/item?id=41315621
- https://people.cs.rutgers.edu/~pxk/417/notes/transactions.html
- https://www.tutorialspoint.com/distributed_dbms/distributed_dbms_commit_protocols.htm
- https://www.karanpratapsingh.com/courses/system-design/distributed-transactions
- https://www.linkedin.com/pulse/main-difference-between-2pc-3pc-protocols-thiensi-le
- https://milvus.io/ai-quick-reference/what-is-the-threephase-commit-protocol
- https://system-design.muthu.co/posts/distributed-systems/three-phase-commit-protocol/index.html
- https://www.exploredatabase.com/2018/03/three-phase-commit-3pc-protocol-in-distributed-database-transactions.html
- https://www.dremio.com/wiki/three-phase-commit/

### AI Agent Orchestration / Multi-Agent
- https://github.com/openai/swarm
- https://developers.openai.com/cookbook/examples/orchestrating_agents/
- https://openai.github.io/openai-agents-python/handoffs/
- https://openai.github.io/openai-agents-python/multi_agent/
- https://community.openai.com/t/openai-swarm-for-agents-and-agent-handoffs/976579
- https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/
- https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/handoff
- https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/advanced-topics
- https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/orchestrations/handoff
- https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
- https://devblogs.microsoft.com/semantic-kernel/semantic-kernel-multi-agent-orchestration/
- https://devblogs.microsoft.com/semantic-kernel/migrate-your-semantic-kernel-and-autogen-projects-to-microsoft-agent-framework-release-candidate/
- https://visualstudiomagazine.com/articles/2025/10/01/semantic-kernel-autogen--open-source-microsoft-agent-framework.aspx
- https://cloudsummit.eu/blog/microsoft-agent-framework-production-ready-convergence-autogen-semantic-kernel
- https://github.com/microsoft/semantic-kernel/blob/main/python/samples/getting_started_with_agents/multi_agent_orchestration/step4_handoff.py
- https://tpiros.dev/blog/multi-agent-systems-and-task-handoff/
- https://galileo.ai/blog/openai-swarm-framework-multi-agents
- https://www.ai-bites.net/swarm-from-openai-routines-handoffs-and-agents-explained-with-code/
- https://lablab.ai/blog/understanding-openai-swarm-a-framework-for-multi-agent-systems
- https://www.botdojo.com/blog/open-ai-swarm-in-botdojo
- https://developer.mamezou-tech.com/en/blogs/2024/12/04/openai-swarm-multi-agent-intro/
- https://github.com/nibzard/awesome-agentic-patterns/blob/main/patterns/planner-worker-separation-for-long-running-agents.md
- https://developers.llamaindex.ai/python/framework/understanding/agent/multi_agent/
- https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/
- https://aws.amazon.com/blogs/machine-learning/multi-agent-collaboration-patterns-with-strands-agents-and-amazon-nova/
- https://skywork.ai/blog/ai-agent-orchestration-best-practices-handoffs/
- https://fast.io/resources/ai-agent-supervisor-pattern/
- https://www.philschmid.de/agentic-pattern
- https://medium.com/@kanerika/multi-agent-workflows-a-practical-guide-to-design-tools-and-deployment-3b0a2c46e389
- https://medium.com/@byanalytixlabs/how-to-master-multi-agent-ai-systems-strategies-for-coordination-and-task-delegation-60ea687bb535
- https://www.talkdesk.com/blog/multi-agent-orchestration/
- https://www.dailydoseofds.com/ai-agents-crash-course-part-12-with-implementation/
- https://atalupadhyay.wordpress.com/2025/11/27/multi-agent-orchestration-using-semantic-kernel/
- https://dev.to/bspann/migrating-from-semantic-kernel-to-microsoft-agent-framework-a-c-developers-guide-3ad5
- https://aws.amazon.com/blogs/opensource/introducing-cli-agent-orchestrator-transforming-developer-cli-tools-into-a-multi-agent-powerhouse/

### Game Networking General
- https://www.gabrielgambetta.com/client-server-game-architecture.html
- https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization
- https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
- https://ruoyusun.com/2019/03/28/game-networking-1.html
- https://medium.com/@massiverealm/the-foundation-of-realtime-multiplayer-part-2-data-transmission-protocols-33eb8e91242b
- https://medium.com/@lemapp09/beginning-game-development-client-server-architecture-1b7676d80dea
- https://www.gamedev.net/forums/topic/690798-server-state-synchronization-and-input-handling/
- https://www.sciencedirect.com/science/article/pii/S1389128620313177
- https://www.researchgate.net/publication/336344591_Inter-Server_Game_State_Synchronization_using_Named_Data_Networking
- https://www.researchgate.net/publication/261195803_The_Design_and_Analysis_of_High_Performance_Online_Game_Server_Concurrent_Architecture
- https://www.sciencedirect.com/science/article/abs/pii/S1389128621002000
- https://forums.frontier.co.uk/threads/star-citizen-discussion-thread-v12.548510/page-1735
- https://forums.frontier.co.uk/threads/star-citizen-discussion-thread-v12.548510/page-1736
- https://forums.frontier.co.uk/threads/star-citizen-discussion-thread-v12.548510/page-1737

### Graceful Degradation
- https://www.getunleash.io/blog/graceful-degradation-featureops-resilience
- https://medium.com/@satyendra.jaiswal/graceful-degradation-handling-errors-without-disrupting-user-experience-fd4947a24011
- https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_graceful_degradation.html
- https://dev.to/teclearn/web-theory-part-8-graceful-degradation-soft-failure-and-fault-tolerance-explained-7n0
- https://www.techtarget.com/searchnetworking/definition/graceful-degradation
- https://www.codereliant.io/p/failing-with-dignity
- https://dev.to/lovestaco/graceful-degradation-keeping-your-app-functional-when-things-go-south-jgj
- https://newrelic.com/blog/best-practices/design-software-for-graceful-degradation
- https://systemdr.substack.com/p/graceful-service-degradation-patterns
- https://www.geeksforgeeks.org/system-design/graceful-degradation-in-distributed-systems/
