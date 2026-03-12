# MMO Authority & State Replication Patterns

**Research iteration:** 1
**Date:** 2026-03-11
**Focus:** How MMO architectures solve entity authority + state replication, and what patterns emerge across implementations

---

## Key Discoveries

### 1. The Single-Writer Principle is Universal

Every system examined enforces one rule above all others: **for any given entity (or component), exactly one node has write authority at any moment.** This is the foundational invariant.

- **Star Citizen**: "To avoid two server nodes trying to simulate the same entity, only one server node can have authority over any given entity, and only that server is allowed to write entity state back to the replication layer." ([Star Citizen Wiki - Server Meshing Q&A](https://star-citizen.wiki/Comm-Link:18397/en))
- **SpatialOS**: "For each component on a SpatialOS entity, there can be no more than one worker with write access to it." ([SpatialOS SDK Docs](https://docs.improbable.io/reference/13.6/shared/design/understanding-access))
- **EVE Online**: "All players in a single solar system are isolated to a single thread within a single stackless python process." ([High Scalability](https://highscalability.com/eve-online-architecture/))
- **Photon Fusion**: "There is exactly one machine which has State Authority for any given object." ([Photon Fusion Network Object Docs](https://doc.photonengine.com/fusion/current/manual/network-object))
- **Mirror Networking**: "The server has authority over an object by default." ([Mirror Authority Docs](https://mirror-networking.gitbook.io/docs/manual/guides/authority))
- **coherence**: "Only one Client or Simulator able to have authority over an entity at any given time." ([coherence Authority Docs](https://docs.coherence.io/manual/authority))

**Implication for agents:** The filesystem already enforces this naturally via file locking, but the concept extends: any shared state element needs a clear single writer at any moment.

---

### 2. Component-Level Authority (SpatialOS's Key Innovation)

SpatialOS introduced the most granular authority model: **different workers can own different components of the same entity.** A physics worker owns the `Position` component while an AI worker owns the `Behavior` component of the same NPC.

- Authority is managed per-component via an Access Control List (ACL) on each entity ([SpatialOS Understanding Access](https://docs.improbable.io/reference/13.6/shared/design/understanding-access))
- Worker types are defined by "layers" -- e.g., a `PhysicsWorker` layer, an `AIWorker` layer -- and ACLs reference these layers to determine who can write to which component
- Authority transitions follow a strict state machine: `NotAuthoritative -> Authoritative -> AuthorityLossImminent -> NotAuthoritative`
- The Runtime dynamically reassigns authority based on load, entity position, and ACL rules

**Implication for agents:** This maps directly to multi-agent collaboration. Agent A could have write authority over `plan.md` while Agent B has write authority over `implementation/` -- both working on the same "entity" (initiative) simultaneously without conflict.

---

### 3. Three Fundamentally Different Scaling Strategies

| Strategy | Example | How it works | Trade-off |
|----------|---------|-------------|-----------|
| **Time Dilation** | EVE Online | Slow the simulation so one server can keep up | Preserves consistency, sacrifices real-time |
| **Spatial Partitioning** | Star Citizen, Dual Universe, Ashes of Creation | Split the world into zones, each owned by a server | Enables scale, creates boundary problems |
| **Interest Management** | Photon, most MMOs | Only send updates about entities a client cares about | Reduces bandwidth, doesn't reduce server compute |

EVE Online's Time Dilation is the most philosophically interesting: rather than partitioning the problem, it changes the relationship between game-time and wall-clock time. When the server can't keep up, it slows the simulation to 10% speed, turning 1 second into 10 seconds. ([CCP Veritas - Introducing TiDi](https://www.eveonline.com/news/view/introducing-time-dilation-tidi))

Key technical details of TiDi:
- Uses a round-robin cooperatively-multitasking scheduler managing tasklets
- Dilation is applied in "very fine increments" -- not a sudden jump
- Some mechanics MUST dilate (shield recharge, module cycles) while others MUST NOT (reinforcement timers, real-world-clock events)
- The fundamental bottleneck is O(n^2): "n people do things that n people need to see" ([Jim Purbrick - Beyond Time Dilation](http://jimpurbrick.com/2014/01/29/beyond-time-dilation/))

**Implication for agents:** Time dilation = backpressure. When the system is overloaded, slow the rate of agent actions rather than dropping them or creating inconsistency. This is a profound insight for multi-agent coordination.

---

### 4. The Replication Layer Pattern (Star Citizen)

Star Citizen's architecture introduced a **dedicated replication layer** between game servers and clients -- a separate service tier that handles all state synchronization:

- **Replicant nodes**: Handle networked entity streaming and state replication. Minimal codebase -- "no animation, no physics, just network code"
- **Gateway layer**: Routes packets between clients and Replicants. Stateless design enables recovery in seconds
- **Atlas, Scribe**: Additional microservices for specific coordination tasks
- **EntityGraph database**: Graph database storing the state of every network-replicated entity. Serves as both persistence and crash recovery
- The layer is **event-driven, not tick-based** -- processes packets immediately for minimal latency
- Data center colocation keeps inter-service latency to "less than a millisecond"
- Entity authority transfer: as an entity crosses a server boundary, "authority to decide the entity's fate swaps, and the original server becomes the receiver of updates"

([Star Citizen Wiki - Server Meshing Q&A](https://star-citizen.wiki/Comm-Link:18397/en))

**Implication for agents:** The replication layer is analogous to a coordination service (like Sherpa's MCP server). Separating "who does the work" from "who manages the state" is a powerful architectural pattern. The EntityGraph maps to the filesystem as the source of truth.

---

### 5. Dynamic Spatial Partitioning with Octrees (Dual Universe, Hadean/Aether Engine)

Dual Universe's CSSC (Continuous Single-Shard Cluster) technology dynamically sections the world into server "cubes":

- Each server instance manages a cube-shaped region of space
- When more players enter a region, the cube subdivides into smaller cubes -- each a separate server communicating with adjacent servers
- Players on opposite sides of a street could be on different servers, but real-time communication makes this invisible
- Built on the C++ Actor Framework (CAF), which provides network transparency -- actors communicate identically whether in-process or across the datacenter
- "Throw more hardware and increase the processing power linearly" ([CAF Spotlight: Dual Universe](https://www.actor-framework.org/blog/2014-12/spotlight-dual-universe/))

Hadean's Aether Engine uses an **octree data structure** for the same purpose:
- Subdivides 3D space across CPU cores dynamically
- Each processor core manages a "chunk" of data; chunks communicate with each other
- Demonstrated 10,412 concurrent combatants in EVE: Aether Wars, sustained 30Hz tick rate
- Dynamic resource allocation within ~50 milliseconds on Azure
- ([Microsoft - Hadean Helps CCP](https://developer.microsoft.com/en-us/games/articles/2020/08/hadean-helps-ccp-games-realize-its-vision-with-azure/))

**Implication for agents:** The filesystem can be partitioned like an octree. Top-level directories are coarse partitions; subdirectories are finer partitions. As work intensifies in a directory, more agents can be assigned to sub-partitions.

---

### 6. Boundary Co-Simulation (SpatialOS's Physics Solution)

When distributing physics across workers, SpatialOS solved the boundary problem by having **workers co-simulate overlapping regions**:

- Physics workers co-simulate small regions at their boundaries for seamless handover
- SpatialOS "transparently combines the output of each worker into the canonical state" and synchronizes to the other worker
- Worker allocation is "extremely dynamic and fluid -- regions can be fully overlapping and authority can switch randomly several times per second"
- Off-the-shelf physics engines "aren't designed to be aware that other physics engines exist" -- SpatialOS wraps them
- Complex hierarchical objects (like ships in Worlds Adrift) were particularly problematic for migration between workers
- ([Improbable - Dynamically Distributing Physics](https://www.improbable.io/blog/dynamically-distributing-a-simulation-over-hundreds-of-physics-engines/))

**Implication for agents:** When two agents work on overlapping concerns, you need a co-simulation zone: a shared read region where both can observe, but only one has write authority. The canonical state lives in a coordination layer, not in either worker.

---

### 7. Authority + Ownership: Two Distinct Concepts (Gaffer on Games)

Glenn Fiedler's networked physics VR research (sponsored by Oculus) identified a critical distinction between **authority** (who simulates) and **ownership** (who controls):

- Two separate sequence numbers per entity: authority sequence and ownership sequence
- Authority transfers when a player interacts with an object (e.g., throwing something at it)
- Ownership transfers when a player grabs an object -- and ownership is "stronger" than authority
- "An increase in ownership sequence wins over an increase in authority sequence number"
- The host acts as arbiter, using sequence numbers to determine acceptance
- Thrown cubes could recursively take authority over everything they touched
- ([Gaffer on Games - Networked Physics in VR](https://gafferongames.com/post/networked_physics_in_virtual_reality/))

**Implication for agents:** Map this to agent work: "authority" = who is currently executing on a task; "ownership" = who is responsible for the outcome. An agent might delegate authority (execution) to a sub-agent while retaining ownership (responsibility). Ownership should always win conflicts.

---

### 8. Ashes of Creation's Worker Splitting with Degradation

Ashes of Creation (IntrepidNET) implements server meshing with an interesting degradation model:

- Server workers can be as large as 5x10km or as small as 500x500m when split
- Under heavy load, workers reduce replication distance from 150m to 60m before splitting
- Each server has its own multi-threaded replicator for inter-server replication
- Dynamic gridding: "when a worker gets overloaded it will split, until performance goes back up"
- Alpha-2 testing: 300 players + ~2,500 NPCs per worker at ~30 ticks/second
- ([Ashes of Creation Wiki - Server Meshing](https://ashesofcreation.wiki/Server_meshing))

**Implication for agents:** Graceful degradation before scaling: reduce the "resolution" of coordination (fewer updates, less detail) before spawning new agent processes. This is cheaper than immediately spinning up new workers.

---

### 9. coherence's Authority Transfer Protocol

coherence.io provides the cleanest formal model for authority transfer:

- Three transfer modes: **Request** (can be rejected), **Steal** (first-come-first-serve), **Not Transferable**
- Separates **State Authority** (can change property values) from **Input Authority** (can provide input)
- Commands sent during authority transitions are **dropped** to prevent inconsistency
- Orphaned entities (no authority holder) are "not simulated" -- auto-adopt feature can reassign them
- Transfer timeout: 10 seconds, after which the request fails
- ([coherence Authority Transfer Docs](https://docs.coherence.io/manual/authority/authority-transfer))

**Implication for agents:** This protocol maps directly to file ownership: Request mode = ask the current agent if you can take over; Steal mode = file-level mutex (first to lock wins); Orphaned entities = tasks with no assigned agent that need auto-reassignment.

---

### 10. EVE's Single-Database Architecture

While most distributed games use distributed databases, EVE Online uses a **single database** as the binding layer:

- All data read/written to one database that binds the whole world together
- Avoids complexity of distributed database replication
- Stackless Python provides cooperative multitasking via tasklets and channels
- 90-100 SOL blades (server nodes), each running 2 nodes, with 30 "standard" and 6 "enhanced" servers
- Proxy blades handle player connections; SOL blades run game logic; database cluster stores state
- Individual solar systems can be remapped to different nodes ("Live Node Remap"), though players disconnect during moves
- "Supernodes" with exceptional hardware are pre-deployed for anticipated large battles
- ([High Scalability - EVE Architecture](https://highscalability.com/eve-online-architecture/), [High Scalability - 7 Ways EVE Scales](https://highscalability.com/7-sensible-and-1-really-surprising-way-eve-online-scales-to/))

**Implication for agents:** The filesystem IS the single database. This is EVE's architecture mapped perfectly: a single source of truth (filesystem), with multiple worker processes (agents) reading and writing to it. The simplicity of a single data store is underrated.

---

### 11. WorldsAdrift Failure Modes (Cautionary Tales)

WorldsAdrift, the most prominent SpatialOS game, shut down in 2019. Key failure modes:

- SpatialOS made a breaking architectural change that required rewriting >40% of the game's codebase
- Running costs were "incompatible with the number of players playing"
- Tight coupling to proprietary infrastructure meant no escape hatch
- Complex hierarchical physics objects (player-built ships) caused glitches during worker migration
- The game could not run or be hosted outside SpatialOS infrastructure
- Improbable later sold its gaming division for $97M and pivoted to metaverse/enterprise
- ([GameDev.net - Whatever Happened With SpatialOS](https://www.gamedev.net/forums/topic/703568-whatever-happened-with-spatial-os/), [CNBC - Improbable Sells Gaming Unit](https://www.cnbc.com/2023/12/18/metaverse-firm-improbable-sells-gaming-unit-for-97-million.html))

**Implication for agents:** Tight coupling to a coordination platform is dangerous. The coordination layer should be swappable. Filesystem-based coordination has the advantage of being the simplest possible substrate -- no vendor lock-in.

---

### 12. CRDTs as an Alternative to Authority

Recent research applies Conflict-Free Replicated Data Types (CRDTs) to game state, eliminating the need for a single authority:

- CRDTs "ensure eventual consistency through independent updates and conflict resolution without centralized coordination"
- A 2025 paper (Dantas & Baquero, PaPoC '25/EuroSys) tested CRDT-based game state sync in peer-to-peer VR
- Used a custom "MV-Transformer" CRDT encapsulating position, rotation, scale, and manipulation ownership
- Achieved 50ms average latency P2P vs 220ms with remote servers (75% reduction)
- Critical unsolved problem: "Global Rules" -- state changes not authored by any specific user (gravity, physics) have no natural owner in a CRDT model
- Rotation operations are non-commutative, making operation-based CRDTs problematic -- state-based CRDTs worked better
- ([arXiv:2503.17826 - CRDT-Based Game State Sync](https://arxiv.org/html/2503.17826v1))

**Implication for agents:** CRDTs could handle certain types of shared agent state (e.g., activity logs where agents append independently). But for resources with semantic constraints (plans, code), single-authority with handoff is likely safer.

---

## Cross-Cutting Patterns

| Pattern | Who Uses It | Description |
|---------|------------|-------------|
| **Single-Writer Invariant** | All | Exactly one node writes to any entity/component at a time |
| **Component-Level Authority** | SpatialOS, coherence | Split entity into components with independent authority |
| **Spatial Partitioning** | Star Citizen, Dual Universe, Ashes of Creation, Hadean | Divide world into zones; each zone has a server |
| **Dynamic Subdivision** | Dual Universe, Ashes of Creation, Hadean | Zones split/merge based on load |
| **Boundary Co-Simulation** | SpatialOS | Overlap zones at borders so entities transfer seamlessly |
| **Replication Layer** | Star Citizen, SpatialOS | Separate service tier that manages all state sync |
| **Time Dilation / Backpressure** | EVE Online | Slow simulation instead of dropping actions or losing consistency |
| **Interest Management** | Photon, SpatialOS, Ashes of Creation | Only send updates that a client needs to know about |
| **Authority + Ownership Distinction** | Gaffer on Games, coherence | Separate "who simulates" from "who controls/is responsible" |
| **Graceful Degradation** | Ashes of Creation, EVE Online | Reduce fidelity before splitting/failing |
| **Sequence Number Arbitration** | Gaffer on Games | Monotonic sequence numbers resolve authority conflicts |
| **Orphan Detection & Auto-Adoption** | coherence | Entities without owners are detected and reassigned |

---

## Consistency Models by System

| System | Consistency Model | Notes |
|--------|------------------|-------|
| EVE Online | **Strong (within solar system)** | Single-threaded per system; TiDi preserves consistency |
| Star Citizen | **Strong (within shard), eventual (cross-shard)** | EntityGraph provides crash recovery; cross-shard replication is gradual |
| SpatialOS | **Strong (per component), eventual (cross-worker views)** | One writer per component; read replicas lag behind |
| Photon Fusion (Host Mode) | **Strong** | Server is sole authority; tick-based snapshots |
| Photon Fusion (Shared Mode) | **Eventual** | Distributed authority; clients may see different states temporarily |
| Mirror / FishNet | **Strong** | Server-authoritative; SyncVars push from server |
| Dual Universe | **Eventual** | Adjacent server cubes communicate in real-time but with latency |
| coherence | **Strong (per-entity)** | Single authority per entity; commands dropped during transfer |
| CRDT-based (experimental) | **Strong Eventual (SEC)** | Convergence guaranteed; intermediate states may diverge |

---

## Mapping to Multi-Agent AI Coordination

| MMO Concept | Agent Framework Equivalent |
|-------------|--------------------------|
| Entity | Task, file, or directory |
| Component | Section of a file, specific file within a directory |
| Server/Worker | AI agent instance |
| Authority | Write lock / assigned writer |
| Ownership | Responsible agent (may delegate authority) |
| Replication Layer | MCP server / coordination service |
| EntityGraph | Filesystem (source of truth) |
| Spatial Partition | Directory tree partitioning |
| Interest Management | Agent subscription to relevant state changes |
| Time Dilation | Backpressure / rate limiting agent actions |
| Boundary Co-Simulation | Shared read access with single write authority |
| Authority Transfer | Task reassignment protocol |
| Orphan Detection | Stale task detection and reassignment |
| Tick Rate | Agent polling/update interval |
| Dynamic Subdivision | Spawning sub-agents for intensive sub-tasks |

---

## Open Questions

1. **Authority granularity:** SpatialOS proved component-level authority works. How granular should agent authority be? Per-file? Per-section? Per-line?

2. **Transfer protocol:** coherence's Request/Steal/NotTransferable modes are clean. Should Sherpa implement all three, or is a simpler model sufficient?

3. **Backpressure vs. scaling:** EVE chose to slow down; Star Citizen chose to add servers. Which is the right default for agents? (Probably: backpressure first, then scale.)

4. **CRDTs for append-only state:** Activity logs, research notes, and other append-only artifacts could use CRDTs for conflict-free multi-agent writing. Worth prototyping?

5. **The O(n^2) problem:** As agents increase, the cost of keeping everyone informed grows quadratically. Interest management (only notify agents about changes they care about) is essential -- but what defines an agent's "area of interest"?

6. **Orphan detection timing:** coherence auto-adopts orphaned entities. How quickly should unowned tasks be reassigned? Too fast risks reassigning work in progress; too slow leaves tasks stuck.

7. **Cross-shard state:** Star Citizen uses stow/unstow for cross-shard items. What's the equivalent for multi-workspace agent coordination? Git branches?

8. **Hierarchical entity migration:** WorldsAdrift's ships (hierarchical physics objects) were hard to migrate between workers. Complex, deeply nested file structures may have similar issues during authority transfer.

---

## Sources

### Primary Technical Sources

- [Star Citizen Wiki - Server Meshing & Persistent Streaming Q&A](https://star-citizen.wiki/Comm-Link:18397/en) - Deepest technical source on replication layer, EntityGraph, authority transfer, shard architecture
- [CCP Veritas - Introducing Time Dilation](https://www.eveonline.com/news/view/introducing-time-dilation-tidi) - Original TiDi dev blog with scheduler details
- [High Scalability - EVE Online Architecture](https://highscalability.com/eve-online-architecture/) - SOL blades, proxy architecture, Stackless Python
- [High Scalability - 7 Ways EVE Scales](https://highscalability.com/7-sensible-and-1-really-surprising-way-eve-online-scales-to/) - Node remap, supernodes, session throttling
- [SpatialOS SDK - Understanding Access/Authority](https://docs.improbable.io/reference/13.6/shared/design/understanding-access) - Component-level ACLs, worker attributes
- [SpatialOS SDK - Designing Workers](https://docs.improbable.io/reference/13.8/shared/design/design-workers) - Worker types and allocation
- [Gaffer on Games - State Synchronization](https://gafferongames.com/post/state_synchronization/) - Priority accumulators, delta compression, authority model
- [Gaffer on Games - Networked Physics in VR](https://gafferongames.com/post/networked_physics_in_virtual_reality/) - Authority/ownership sequence numbers
- [coherence - Authority Transfer Docs](https://docs.coherence.io/manual/authority/authority-transfer) - Request/Steal/NotTransferable modes, orphan detection
- [coherence - Authority Overview](https://docs.coherence.io/manual/authority) - State vs Input authority separation
- [Photon Fusion - Network Simulation Loop](https://doc.photonengine.com/fusion/current/concepts-and-patterns/network-simulation-loop) - Tick-based snapshots, reconciliation
- [Photon Fusion - Network Topologies](https://doc.photonengine.com/fusion/current/manual/network-topologies) - Host vs Shared mode authority
- [Ashes of Creation Wiki - Server Meshing](https://ashesofcreation.wiki/Server_meshing) - Worker splitting, dynamic gridding
- [Ashes of Creation Wiki - IntrepidNET](https://www.ashesofcreation.wiki/Intrepid_Net) - Custom network layer details
- [CAF Spotlight: Dual Universe](https://www.actor-framework.org/blog/2014-12/spotlight-dual-universe/) - Actor framework for distributed game state
- [arXiv:2503.17826 - CRDT-Based Game State Sync in P2P VR](https://arxiv.org/html/2503.17826v1) - MV-Transformer CRDT, latency measurements

### Architecture Overviews & Analysis

- [Game Developer - Entity-Component-Worker Architecture](https://www.gamedeveloper.com/programming/the-entity-component-worker-architecture-and-its-use-on-massive-online-games) - ECW pattern for massive online games
- [Game Developer - Infinite Space: Argument for Single-Sharded Architecture](https://www.gamedeveloper.com/design/infinite-space-an-argument-for-single-sharded-architecture-in-mmos) - CCP's philosophical case for single-shard
- [Game Developer - Designing a Single Server MMORPG](https://www.gamedeveloper.com/game-platforms/opinion-designing-a-single-server-mmorpg) - Design considerations
- [Jim Purbrick - Beyond Time Dilation](http://jimpurbrick.com/2014/01/29/beyond-time-dilation/) - O(n^2) problem analysis, server-side filtering proposal
- [Microsoft - Hadean Helps CCP Games](https://developer.microsoft.com/en-us/games/articles/2020/08/hadean-helps-ccp-games-realize-its-vision-with-azure/) - Aether Engine on Azure, 30Hz tick rate at 10K users
- [PC Gamer - EVE 10,000 Player Battle](https://www.pcgamer.com/how-eve-onlines-experimental-10000-player-battle-could-radically-change-its-future/) - Aether Wars results
- [Confluent - Four Design Patterns for Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/) - Orchestrator-worker, hierarchical, blackboard, market-based patterns
- [Medium - Multi-Agent System Patterns](https://medium.com/@mjgmario/multi-agent-system-patterns-a-unified-guide-to-designing-agentic-architectures-04bb31ab9c41) - Unified guide to agentic architectures

### Documentation & Reference

- [Mirror Networking - Authority](https://mirror-networking.gitbook.io/docs/manual/guides/authority) - Server authority, client authority, isOwned
- [FishNet Documentation](https://fish-networking.gitbook.io/docs) - Server-authoritative Unity networking
- [Photon Engine - Interest Groups](https://doc.photonengine.com/realtime/current/gameplay/interestgroups) - Sub-channel architecture, network culling
- [Photon Bolt - Authoritative Server FAQ](https://doc.photonengine.com/bolt/current/troubleshooting/authoritative-server-faq) - Authority model comparison
- [Star Citizen Wiki - Server Meshing](https://starcitizen.tools/Server_meshing) - Overview with deployment milestones
- [Star Citizen Wiki - Persistent Entity Streaming](https://starcitizen.tools/Persistent_Entity_Streaming) - OCS details
- [Ashes of Creation Wiki - Dynamic Gridding](https://ashesofcreation.wiki/Dynamic_gridding) - Worker splitting details
- [Dual Universe Wiki - Single-shard](https://dualuniverse.fandom.com/wiki/Single-shard) - CSSC technology overview

### Academic Papers

- [ACM Computing Surveys - Interest Management for DVEs: A Survey](https://dl.acm.org/doi/10.1145/2535417) - Comprehensive survey of interest management
- [Springer - Delayed State Consistency in DVEs](https://link.springer.com/chapter/10.1007/978-3-540-30207-0_93) - Consistency models
- [Springer - Consistency and Fairness in Real-Time DVEs](https://link.springer.com/article/10.1057/s41273-016-0035-8) - Consistency paradigms
- [ScienceDirect - Update Schedules for Improving Consistency in Multi-Server DVEs](https://www.sciencedirect.com/science/article/abs/pii/S1084804514000083) - Update scheduling
- [arXiv - Consistency Models in Distributed Systems](https://arxiv.org/pdf/1902.03305) - Survey of consistency models
- [McGill Thesis - Interest Management for Massively Multiplayer Games](https://www.cs.mcgill.ca/~jboula2/thesis.pdf) - Comprehensive thesis
- [IEEE - Distributed Interest Management for MMVEs](https://ieeexplore.ieee.org/document/4592763/) - Area of interest schemes
- [ResearchGate - Area of Interest Management in MMOGs](https://www.researchgate.net/publication/369853857_Area_of_Interest_Management_in_Massively_Multiplayer_Online_Games) - Recent survey
- [Springer - Distributed Coordination of Massively Multi-Agent Systems](https://link.springer.com/chapter/10.1007/978-3-540-85449-4_2) - Multi-agent coordination theory
- [arXiv - Taxonomy of Hierarchical Multi-Agent Systems](https://arxiv.org/html/2508.12683) - Design patterns and coordination mechanisms

### Postmortems & Industry Analysis

- [GameDev.net - Whatever Happened with SpatialOS](https://www.gamedev.net/forums/topic/703568-whatever-happened-with-spatial-os/) - Community analysis of SpatialOS failure
- [TechCrunch - Bossa Studios Launches Worlds Adrift](https://techcrunch.com/2018/05/17/worlds-adrift/) - Launch context
- [PC Games Insider - Worlds Adrift Shutting Down](https://www.pcgamesinsider.biz/news/69078/bossas-ambitious-spatialos-powered-worlds-adrift-is-shutting-down-in-july/) - Shutdown announcement
- [CNBC - Improbable Sells Gaming Unit](https://www.cnbc.com/2023/12/18/metaverse-firm-improbable-sells-gaming-unit-for-97-million.html) - Improbable pivot
- [Imperium News - Hadean's Aether Engine Analysis](https://imperium.news/hadeans-jumping-the-shark/) - Critical analysis
- [Screen Rant - CCP Plans for EVE Online Future](https://screenrant.com/eve-online-future-servers-code-ccp-games/) - Future technology plans

### Networking Foundations

- [Gaffer on Games - Introduction to Networked Physics](https://gafferongames.com/post/introduction_to_networked_physics/) - Three approaches: lockstep, snapshot, state sync
- [Gaffer on Games - Networked Physics (2004)](https://gafferongames.com/post/networked_physics_2004/) - Historical context
- [Gabriel Gambetta - Client-Server Game Architecture](https://www.gabrielgambetta.com/client-server-game-architecture.html) - Fundamentals
- [Multiplayer Networking Resources](https://multiplayernetworking.com/) - Curated resource list
- [Dynetis - Interest Management for Multiplayer Games](https://www.dynetisgames.com/2017/04/05/interest-management-mog/) - Practical guide
- [Edgegap - Host Migration in P2P Games](https://edgegap.com/blog/host-migration-in-peer-to-peer-or-relay-based-multiplayer-games) - Migration patterns
- [Oculus Blog - Networked Physics in VR](https://developers.meta.com/horizon/blog/networked-physics-in-virtual-reality-networking-a-stack-of-cubes-with-unity-and-physx/) - Meta's implementation
- [GitHub - Oculus Networked Physics Sample](https://github.com/OculusVR/oculus-networked-physics-sample) - BSD-licensed reference implementation

### Tools & Platforms

- [Hadean - Aether Engine](https://hadean.com/aether-engine/) - Distributed spatial simulation
- [Hadean - Aether Engine Datasheet](https://hadean.com/resources/aether-engine-datasheet/) - Technical specifications
- [Improbable - SpatialOS GDK for Unreal](https://improbable.io/blog/spatialos-gdk-for-unreal-launch) - Unreal Engine integration
- [coherence - Features](https://coherence.io/features) - Unity multiplayer networking
- [Photon Engine - PUN2](https://www.photonengine.com/pun) - Unity networking
- [GitHub - Mirror Networking](https://github.com/MirrorNetworking/Mirror) - Open source Unity networking
- [GitHub - FishNet](https://github.com/FirstGearGames/FishNet) - Open source Unity networking
- [GitHub - SpatialOS Docs](https://github.com/SpatialOS-Platform/spatial-os-docs) - Archived documentation

---

## Raw Links (All URLs Encountered)

```
https://www.eveonline.com/news/view/introducing-time-dilation-tidi
https://wiki.eveuniversity.org/Time_dilation
https://www.eveonline.com/news/view/time-dilation-hows-that-going
https://forums.eveonline.com/t/time-dilation/424645
https://imperium.news/the-complexity-paradox/
https://www.pcgamer.com/eve-onlines-mad-time-dilation-tech-beats-lag/
http://jimpurbrick.com/2014/01/29/beyond-time-dilation/
https://www.pcgamer.com/how-eve-onlines-experimental-10000-player-battle-could-radically-change-its-future/
https://www.wckg.net/PVP/big-fights
https://highscalability.com/7-sensible-and-1-really-surprising-way-eve-online-scales-to/
https://networking.docs.improbable.io/welcome/spatialos-concepts/authority-and-interest/
https://networking.docs.improbable.io/welcome/spatialos-concepts/deployments-and-the-runtime/
https://www.improbable.io/blog/dynamically-distributing-a-simulation-over-hundreds-of-physics-engines/
https://documentation.improbable.io/spatialos-overview/docs/what-is-spatialos
https://docs.improbable.io/unreal/alpha/content/glossary
https://improbable.io/blog/new-spatialos-runtime-v2
https://docs.improbable.io/reference/12.0/shared/design/object-interaction
https://docs.improbable.io/reference/13.6/shared/design/understanding-access
https://improbable.io/blog/spatialos-gdk-for-unreal-launch
https://ims.improbable.io/insights/how-spatialos-works-with-game-engines/
https://doc.photonengine.com/realtime/current/gameplay/interestgroups
https://doc.photonengine.com/pun/current/gameplay/interestgroups
https://doc.photonengine.com/bolt/current/troubleshooting/authoritative-server-faq
https://www.gamespress.com/Photon-Fusion-launches-a-new-era-of-high-end-multiplayer-game-developm
https://doc.photonengine.com/pun/v2/gameplay/interestgroups
https://doc.photonengine.com/pun/v1/gameplay/interestgroups
https://forum.photonengine.com/discussion/19351/multiplayer-explanation
https://doc.photonengine.com/server/current/reference/faq
https://mirror-networking.gitbook.io/docs/manual/guides/authority
https://github.com/StinkySteak/unity-netcode-benchmark
https://discussions.unity.com/t/fish-net-vs-other-networking-solutions/913142
https://mirror-networking.gitbook.io/docs/manual/general
https://mirror-networking.gitbook.io/docs/manual/components/networkbehaviour
https://github.com/MirrorNetworking/Mirror
https://appwill.co/multiplayer-in-unity-best-networking-solutions-2025/
https://discussions.unity.com/t/fishnet-vs-netcode-for-game-objects/928418
https://discussions.unity.com/t/so-what-is-the-difference-between-netcode-for-gameobjects-mirror-and-fishnet-which-one-is-better-for-fast-co-op/1678432
https://medium.com/my-games-company/unity-realtime-multiplayer-part-8-exploring-ready-made-networking-solutions-10f3b6f76cf9
https://www.mmorpg.com/interviews/how-the-games-single-shard-server-works-2000105638
https://dualuniverse.fandom.com/wiki/Single-shard
https://en.wikipedia.org/wiki/Dual_Universe
https://www.linkedin.com/pulse/dual-universe-dive-fully-editable-continuous-why-matters-baillie
https://www.actor-framework.org/blog/2014-12/spotlight-dual-universe/
https://www.prweb.com/releases/new_server_technology_video_demonstrates_dual_universe_s_continuous_single_shard_emergent_gameplay_breakthrough/prweb13614549.htm
https://grokipedia.com/page/Dual_Universe
https://worthplaying.com/article/2016/9/21/news/100752-dual-universe-introduces-its-voxel-technology-screens-trailer/
https://www.gamedeveloper.com/design/infinite-space-an-argument-for-single-sharded-architecture-in-mmos
https://mmos.com/news/dual-universe-demonstrates-voxel-technology-new-dev-diary-video
https://www.gamedev.net/forums/topic/703568-whatever-happened-with-spatial-os/
https://steamcommunity.com/app/322780/discussions/0/1839063537785355020
https://steamcommunity.com/app/1931180/discussions/0/591763911730034672/
https://improbable.io/blog/on-the-new-worlds-in-worlds-adrift
https://www.pcgamesinsider.biz/news/69078/bossas-ambitious-spatialos-powered-worlds-adrift-is-shutting-down-in-july/
https://steamcommunity.com/app/322780/discussions/0/1644290549110489043/
https://techcrunch.com/2018/05/17/worlds-adrift/
https://steamcommunity.com/app/322780/discussions/0/1644290458825499424/
https://steamcommunity.com/app/322780/discussions/0/3658515990041891365/?l=latam
https://www.sciencedirect.com/science/article/abs/pii/S1084804514000083
https://en.wikipedia.org/wiki/State_machine_replication
https://www.sciencedirect.com/science/article/pii/S0022000099916392
https://link.springer.com/chapter/10.1007/978-3-540-30207-0_93
https://en.wikipedia.org/wiki/Replication_(computing)
https://link.springer.com/article/10.1057/s41273-016-0035-8
https://arxiv.org/pdf/1902.03305
https://www.cs.utexas.edu/~lorenzo/corsi/cs380d/papers/statemachines.pdf
https://jisajournal.springeropen.com/articles/10.1186/s13174-020-0122-y
https://www.emergentmind.com/topics/state-machine-replication-smr
https://prezi.com/p/xk5ilzstjrhy/star-citizen-unofficial-road-to-dynamic-server-meshing/
https://testsquadron.com/threads/server-meshing.21319/
https://hangarbase.org/news/star-citizen-the-expanded-server-mesh-the-future-of-the-verse-revealed-at-citizencon-2025
https://starcitizen.tools/Server_meshing
https://robertsspaceindustries.com/en/comm-link/transmission/18397-Server-Meshing-And-Persistent-Streaming-Q-A
https://sc-server-meshing.info/
https://robertsspaceindustries.com/spectrum/community/SC/forum/3/thread/road-to-dynamic-server-meshing-tech-overview-with-
https://massivelyop.com/2023/02/17/star-citizen-plots-its-next-steps-for-server-meshing-by-way-of-a-multi-day-in-house-dev-summit/
https://scfocus.org/release-dates/
https://starcitizen.tools/Persistent_Entity_Streaming
https://star-citizen.wiki/Comm-Link:18397/en
https://forum.level1techs.com/t/star-citizen-persistent-entity-streaming-and-the-replication-layer/202872
https://forums.frontier.co.uk/threads/star-citizen-discussion-thread-v12.548510/page-1735
https://forums.ashesofcreation.com/discussion/59653/feedback-request-alpha-two-server-meshing-technology-preview-shown-in-june-livestream/p4
https://highscalability.com/eve-online-architecture/
https://www.slideshare.net/Arbow/stackless-python-in-eve
https://slidetodoc.com/the-server-technology-of-eve-online-how-to/
https://forums-archive.eveonline.com/message/5973179/
https://games.slashdot.org/story/08/10/02/2137251/server-structure-in-eve-online
https://talkpython.fm/episodes/show/52/eve-online-mmo-game-powered-by-python
https://slideplayer.com/slide/8123277/
https://wiki.python.org/moin/StacklessPython
https://uu.diva-portal.org/smash/get/diva2:408940/FULLTEXT01.pdf
https://wccftech.com/dual-universe-gets-pre-alpha-stage-mmo/
https://gamefabrique.com/games/dual-universe/
https://blog.actor-framework.org/2014-12/spotlight-dual-universe/
https://mmos.com/news/novaquark-explains-how-dual-universes-server-works
https://www.mmorpg.com/dual-universe/news/a-continuous-single-shard-universe-1000039885
https://improbable.io/blog/distributed-physics-without-server-boundaries
https://ims.improbable.io/insights/distributed-physics-without-server-boundaries/
https://ims.improbable.io/insights/dynamically-distributing-a-simulation-over-hundreds-of-physics-engines/
https://gamedev.net/forums/topic/689484-spatialos-single-shard-mmo/5346355/?page=2
https://news.ycombinator.com/item?id=10554359
https://github.com/SpatialOS-Platform/spatial-os-docs
https://developer.microsoft.com/en-us/games/articles/2020/08/hadean-helps-ccp-games-realize-its-vision-with-azure/
https://www.ccpgames.com/news/2019/ccp-games-partners-with-hadean-for-10-000-player-deathmatch-in-eve-aether
https://venturebeat.com/2019/03/25/why-ccp-games-crammed-14274-spaceships-into-an-eve-online-battle/
https://imperium.news/hadeans-jumping-the-shark/
https://www.ccpgames.com/news/2019/ccp-games-and-hadean-go-for-world-record-with-eve-aether-wars-phase-iii-at
https://hadean.com/resources/aether-engine-datasheet/
https://www.pcgamesinsider.biz/interviews-and-opinion/68767/how-cloud-games-tech-firm-hadean-attracted-the-attention-of-microsoft-and-eve-online-firm-ccp/
https://www.pcgamer.com/minecraft-is-using-a-spatial-simulation-engine-to-make-larger-and-more-immersive-experiences/
https://www.ccpgames.com/news/2019/ccp-games-and-hadean-to-showcase-the-next-eve-aether-wars-in-november
https://www.ccpgames.com/news/2019/eve-aether-wars-successfully-achieves-groundbreaking-14-000-ship-battle
https://www.eveonline.com/news/view/my-node-was-equipped-with-the-following...
https://www.engadget.com/2012-02-09-eve-onlines-time-dilation-keeping-game-in-sync.html
https://screenrant.com/eve-online-future-servers-code-ccp-games/
https://www.tentonhammer.com/news/eve-online-dev-blog-details-new-time-dilation-feature
https://ieeexplore.ieee.org/xpl/articleDetails.jsp?reload=true&arnumber=840515
https://kevinhoffman.medium.com/distributed-entity-component-system-architecture-in-the-cloud-326a94394e84
https://www.gamedeveloper.com/programming/the-entity-component-worker-architecture-and-its-use-on-massive-online-games
https://github.com/Dvergar/OSIS
https://metaterasology.github.io/docs/developing/networkMultiplayer/networkEntity.html
https://unity.com/ecs
https://www.richardlord.net/blog/ecs/why-use-an-entity-framework.html
https://en.wikipedia.org/wiki/Entity_component_system
https://www.gamedev.net/forums/topic/654619-entity-component-system-and-networking/
https://www.gamedeveloper.com/design/the-entity-component-system---an-awesome-game-design-pattern-in-c-part-1-
https://forum.unity.com/threads/ecs-and-networking.528134/
https://ably.com/blog/crdts-distributed-data-consistency-challenges
https://mwhittaker.github.io/consistency_in_distributed_systems/3_crdt.html
https://arxiv.org/html/2503.17826v1
https://arxiv.org/abs/2503.17826
https://loro.dev/docs/concepts/crdt
https://www.nitinkumargove.com/blog/conflict-resolution-using-ot-crdt
https://academy.realm.io/posts/conflict-resolution-for-eventual-consistency-goto/
https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/
https://inria.hal.science/hal-00932836/document
https://gowthamkalla.substack.com/p/crdts
https://dev.to/adityasajoo/understanding-conflict-free-replicated-data-types-57jc
https://dl.acm.org/doi/10.1145/2535417
https://www.researchgate.net/publication/261960704_Interest_Management_for_Distributed_Virtual_Environments_A_Survey
https://link.springer.com/chapter/10.1007/978-3-642-54420-0_36
https://www.researchgate.net/publication/257924144_Toward_Community-Driven_Interest_Management_for_Distributed_Virtual_Environment
https://www.researchgate.net/publication/369853857_Area_of_Interest_Management_in_Massively_Multiplayer_Online_Games
https://www.ripublication.com/ijaer17/ijaerv12n19_24.pdf
https://www.cs.mcgill.ca/~jboula2/thesis.pdf
https://www.dynetisgames.com/2017/04/05/interest-management-mog/
https://www.academia.edu/86249942/Load_Balancing_of_Peer_to_Peer_MMORPG_Systems_with_Hierarchical_Area_of_Interest_Management
https://www.academia.edu/6162442/A_Dynamic_Area_of_Interest_Management_and_Collaboration_Model_for_P2P_MMOGs
https://www.researchgate.net/publication/221391409_A_distributed_architecture_for_MMORPG
https://ashesofcreation.wiki/Server_meshing
https://www.mmorpg.com/news/ashes-of-creation-stream-breaks-down-new-server-meshing-network-technology-2000132119
https://forums.mmorpg.com/discussion/505672/ashes-of-creation-stream-breaks-down-new-server-meshing-network-technology-mmorpg-com
https://ashesofcreation.wiki/Template:Server_meshing
https://ashesofcreation.wiki/Server_channels
https://ashesofcreation.wiki/Servers
https://www.ashesofcreation.wiki/Intrepid_Net
https://forums.ashesofcreation.com/discussion/59653/feedback-request-alpha-two-server-meshing-technology-preview-shown-in-june-livestream/p3
https://ashesofcreation.com/news/2024-07-05-development-update-with-server-meshing-technology-preview
https://ashesofcreation.wiki/Dynamic_gridding
https://docs.improbable.io/reference/13.8/shared/design/design-workers
https://github.com/spatialos/CppBlankProject
https://documentation.improbable.io/spatialos-overview/docs/handing-over-write-access-authority
https://github.com/spatialos/CExampleProject
https://github.com/spatialos/sdk-for-unity/blob/master/docs/tutorials/recipes/runtime-entity-creation.md
https://github.com/spatialos/database-sync-worker
https://doc.photonengine.com/fusion/current/concepts-and-patterns/network-simulation-loop
https://doc.photonengine.com/fusion/v1/fusion-intro
https://doc.photonengine.com/fusion/current/manual/network-behaviour
https://doc.photonengine.com/fusion/v1/manual/state-transfer
https://doc.photonengine.com/fusion/current/tutorials/host-mode-basics/3-prediction
https://doc.photonengine.com/fusion/current/concepts-and-patterns/networked-controller-code
https://doc-test.photonengine.com/fusion/current/getting-started/fusion-intro
https://discussions.unity.com/t/photon-fusion/877311
https://doc.photonengine.com/fusion/v1/manual/network-object/network-object
https://doc.photonengine.com/fusion/current/tutorials/host-mode-basics/5-property-changes
https://doc.photonengine.com/fusion/current/manual/network-topologies
https://doc.photonengine.com/fusion/current/manual/network-object
https://doc.photonengine.com/fusion/current/manual/shared-mode-master-client
https://doc.photonengine.com/fusion/current/manual/input/shared-mode-input
https://www.linkedin.com/pulse/navigating-through-photon-fusions-concepts-shri-chakravadhanula
https://noblesteedgames.com/blog/photon-fusion-101/
https://doc.photonengine.com/fusion/current/getting-started/fusion-intro
https://mirror-networking.gitbook.io/docs/manual/components/networkbehaviour
https://storage.googleapis.com/mirror-api-docs/html/d3/d88/class_mirror_1_1_network_identity.html
https://github.com/neon-izm/NobleConnectMirrorSample/blob/master/Assets/Mirror/Runtime/NetworkIdentity.cs
https://github.com/MirrorNetworking/Mirror/issues/1032
https://github.com/vis2k/Mirror/issues/959
https://docs.unity3d.com/2020.1/Documentation/Manual/UNetAuthority.html
https://mirror-networking.gitbook.io/docs/manual/components/network-identity
https://discussions.unity.com/t/mirror-solved-changing-client-authority-for-object-with-networktransform/1638324
https://mirror-networking.gitbook.io/docs/manual/general/deprecations
https://fish-networking.gitbook.io/docs
https://github.com/FirstGearGames/FishNet
https://deepwiki.com/FirstGearGames/FishNet
https://assetstore.unity.com/packages/tools/network/fishnet-networking-evolved-207815
https://github.com/edgegap/netcode-sample-unity-fishnet
https://edgegap.com/integration/fish-networking-plugin-automated-game-server-hosting-unity-tutorial
https://github.com/FirstGearGames/FishNet-Documentation
https://docs.edgegap.com/docs/sample-projects/unity-netcodes/fishnet-on-edgegap
https://discussions.unity.com/t/fish-networking-unity-networking-evolved-free/885382
https://fish-networking.gitbook.io/docs/fishnet-building-blocks/transports/fishyunitytransport
https://gafferongames.com/post/networked_physics_in_virtual_reality/
https://gafferongames.com/categories/networked-physics/
https://gafferongames.com/post/state_synchronization/
https://gafferongames.com/post/networked_physics_2004/
https://gafferongames.com/post/introduction_to_networked_physics/
https://www.gamedev.net/forums/topic/700869-confirmation-on-gaffers-state-synchronization-method/
https://gafferongames.com/tags/networking/
https://github.com/gafferongames/gafferongames/blob/master/content/post/state_synchronization.md
https://gafferongames.com/categories/game-networking/
https://multiplayernetworking.com/
https://developers.meta.com/horizon/blog/networked-physics-in-virtual-reality-networking-a-stack-of-cubes-with-unity-and-physx/
https://github.com/OculusVR/oculus-networked-physics-sample
https://docs.coherence.io/manual/authority
https://docs.coherence.io/1.3/manual/authority
https://docs.coherence.io/manual/authority/authority-transfer
https://docs.coherence.io/manual/authority/server-authoritative-setup
https://coherence.io/features
https://docs.coherence.io/overview
https://docs.coherence.io/v/1.0/coherence-sdk-for-unity/authority-overview
https://docs.coherence.io/getting-started/samples-and-tutorials/beginners-guide-to-networking
https://docs.coherence.io/1.0/learning-coherence/beginners-guide-to-networking-games
https://docs.coherence.io/hosting
https://docs.coherence.io/manual/client-connections
https://en.wikipedia.org/wiki/Improbable_(company)
https://mcvuk.com/development-news/unity-blocks-improbables-spatial-os-all-live-and-in-development-games-affected/
https://gamefromscratch.com/unity-responds-to-improbables-shutdown-post/
https://www.cnbc.com/2023/12/18/metaverse-firm-improbable-sells-gaming-unit-for-97-million.html
https://gamesbeat.com/unity-game-engine-blocks-spatialos-online-gaming-tools/
https://wccftech.com/spatialos-improbable-lost-money-2019-very-different-now/
https://github.com/spatialos
https://massivelyop.com/2018/03/29/gdc-2018-exploring-spatialos-with-improbable-cco-bill-roper/
https://hadean.com/aether-engine/
https://www.gamesradar.com/eve-aether-wars-preview-e3-2019/
https://www.eveonline.com/news/view/introducing-a-new-tech-demo-eve-aether-wars
https://aetherengine.io/aetherwars/
https://www.pcgamer.com/you-can-help-eve-onlines-developer-test-a-10000-player-battle-in-an-experimental-engine/
https://www.dsogaming.com/news/eve-aether-wars-phase-two-playtest-will-see-10000-players-fight-in-a-single-battle/
https://mmohuts.com/news/ccp-games-partners-hadean-10000-player-deathmatch-eve-aether-wars
https://www.ccpgames.com/news/2019/ccp-games-and-hadean-reveal-eve-aether-wars-phase-two
https://worthplaying.com/article/2019/11/21/news/117064-eve-aether-wars-phase-iii-aims-to-go-for-10000-player-world-record/
https://docs.hadean.com/v1.1/Guide/Technical-documentation/Introduction/
https://www.techradar.com/news/taking-the-middleware-out-of-high-performance-computing
https://wccftech.com/biggest-battle-royale-pvp-aether-engine/
https://hadean.com/simulating-covid-19-with-the-francis-crick-institute/
https://hadean.com/blog/addressing-silos-in-defence/
https://github.com/hadeaninc
https://hadean.com/blog/creating-massive-scale-simulations-of-covid-19-with-the-francis-crick-institute/
https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RE36ANl
https://hadean.atlassian.net/wiki/spaces/AESW/overview
https://www.researchgate.net/figure/Overlapping-zones-for-a-seamless-migration-of-an-entity-between-two-zones_fig17_26523305
https://edgegap.com/blog/host-migration-in-peer-to-peer-or-relay-based-multiplayer-games
https://docs.coherence.io/manual/authority/server-authoritative-setup
https://arxiv.org/html/2512.10979v1
https://www.gabrielgambetta.com/client-server-game-architecture.html
https://www.researchgate.net/publication/316513495_Simulation_of_Area_of_Interest_Management_for_Massively_Multiplayer_Online_Games_Using_OPNET
https://www.gamedev.net/forums/topic/687829-space-partitioning-for-top-down-mmo-game-on-the-server/5338957/
https://medium.com/@mjgmario/multi-agent-system-patterns-a-unified-guide-to-designing-agentic-architectures-04bb31ab9c41
https://www.confluent.io/blog/event-driven-multi-agent-systems/
https://www.infoworld.com/article/3808083/a-distributed-state-of-mind-event-driven-multi-agent-systems.html
https://www.confluent.io/blog/building-real-time-multi-agent-ai/
https://www.kai-waehner.de/blog/2025/05/26/agentic-ai-with-the-agent2agent-protocol-a2a-and-mcp-using-apache-kafka-as-event-broker/
https://www.confluent.io/blog/real-time-agentic-ai-google-cloud/
https://www.confluent.io/blog/the-future-of-ai-agents-is-event-driven/
https://www.confluent.io/blog/ai-meal-planner/
https://www.confluent.io/blog/google-agent2agent-protocol-needs-kafka/
https://seanfalconer.medium.com/how-to-build-a-multi-agent-orchestrator-using-flink-and-kafka-4ee079351161
https://www.confluent.io/blog/multi-agent-orchestrator-using-flink-and-kafka/
https://www.gamedeveloper.com/game-platforms/feature-ccp-outlines-single-shard-mmo-development
https://medium.com/nguyen/a-single-shard-continuous-universe-one-world-no-boundaries-f9fee0c7d7f0
https://www.gamedeveloper.com/game-platforms/opinion-designing-a-single-server-mmorpg
https://www.gamedeveloper.com/design/algorithms-for-an-infinite-universe
https://nwn.blogs.com/nwn/2019/03/spatial-os-mmo-seed-mavericks-single-shard.html
https://www.researchgate.net/publication/390142196_CRDT-Based_Game_State_Synchronization_in_Peer-to-Peer_VR
https://www.semanticscholar.org/paper/CRDT-Based-Game-State-Synchronization-in-VR-Dantas-Baquero/732f3cb2d9f72570bc7207934c3a56b07a0f2de9
https://www.researchgate.net/publication/390437681_CRDT-Based_Game_State_Synchronization_in_Peer-to-Peer_VR
https://dl.acm.org/doi/10.1145/3721473.3722144
https://www.themoonlight.io/en/review/crdt-based-game-state-synchronization-in-peer-to-peer-vr
https://dl.acm.org/doi/10.1145/3749533
https://www.arxiv.org/pdf/2503.17826
https://www.prweb.com/releases/2016/05/prweb13415044.htm
https://www.geeksforgeeks.org/system-design/cap-theorem-in-system-design/
https://www.gamedev.net/forums/topic/657588-mmos-and-modern-scaling-techniques/
https://en.wikipedia.org/wiki/CAP_theorem
https://link.springer.com/chapter/10.1007/978-3-540-85449-4_2
https://arxiv.org/html/2508.12683
https://www.arxiv.org/pdf/2601.04583
https://www.media.mit.edu/articles/what-is-a-multi-agent-system/
https://www.kore.ai/blog/choosing-the-right-orchestration-pattern-for-multi-agent-systems
https://www.ibm.com/think/topics/multiagent-system
https://tetrate.io/learn/ai/multi-agent-systems
https://penny-arcade.com/report/editorial-article/planning-for-war-how-the-eve-online-servers-deal-with-a-3000-person-battle
https://uu.diva-portal.org/smash/get/diva2:408940/FULLTEXT01.pdf
https://www.eveonline.com/news/view/my-node-was-equipped-with-the-following...
```
