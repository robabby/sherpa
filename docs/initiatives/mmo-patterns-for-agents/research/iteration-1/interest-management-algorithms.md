# Interest Management Algorithms: Games to Agent Context Scoping

**Research iteration:** 1
**Date:** 2026-03-11
**Focus:** How do MMOs decide what state to replicate to which client? How does this translate to "which files/state does an agent need for its task"?

---

## Key Discoveries

### 1. The Taxonomy: Five Classes of Interest Management Algorithm

The field has converged on a well-defined taxonomy, best documented in the Boulanger thesis (McGill, 2006) and the Liu & Theodoropoulos survey (ACM Computing Surveys, 2014). The five classes are:

**Aura-based (distance/radius):** Each entity has a circular or spherical "aura" -- a fixed radius around it. When two entities' auras overlap, they become mutually aware and exchange state. Simplest to implement, but sends many unnecessary messages because it ignores obstacles and context.

- Unreal Engine implements this as `NetCullDistanceSquared` -- a squared distance threshold per actor class. Default is 225,000,000 (150m squared then converted to centimeters). Actors beyond this distance are "not relevant" and receive zero updates.
- Source: [Cedric Neukirchen - Actor Relevancy and Priority](https://cedric-neukirchen.net/docs/multiplayer-compendium/actor-relevancy-and-priority/)

**Zone/grid-based:** The world is divided into a fixed grid of cells. Entities subscribe to their current cell plus adjacent cells (the "nine-grid" pattern). Messages only flow within subscribed cells. Cheaper than aura calculations for large worlds.

- The AOI algorithm in Zinx framework implements a grid where `cell_id = idy * nx + idx`, with entities receiving updates from their cell plus all 8 neighbors (corners get 4, edges get 6, interior get 9).
- Source: [DEV Community - MMO AOI Algorithm](https://dev.to/aceld/11-mmo-online-game-aoi-algorithm-l7d)
- Implementation: [Zinx MMO demo on GitHub](https://github.com/aceld/zinx/tree/master/zinx_app_demo/mmo_game)

**Visibility-based:** Uses line-of-sight calculations accounting for obstacles. Most accurate (fewest false positives) but most computationally expensive.

- Boulanger's key finding: tile-based algorithms can approximate ideal visibility-based interest management at very low cost -- reducing update messages by up to 6x compared to naive aura-based, while costing a fraction of true visibility computation.
- Source: [Boulanger Thesis (McGill)](https://www.cs.mcgill.ca/~jboula2/thesis.pdf)

**Pub/sub-based:** Entities publish events to topics; other entities subscribe to topics they care about. Can be topic-based (subscribe to "zone-42") or content-based (subscribe to "position within 100m of X"). This is the most general model and subsumes the others.

- HLA (High Level Architecture) for military simulations uses Data Distribution Management (DDM) with "update regions" and "subscription regions" in multi-dimensional spaces. Filtering happens on dimensions like latitude, longitude, and discrete attributes (e.g., vehicle type). When update and subscription regions overlap, data flows.
- Source: [CMU HLA DDM Documentation](https://www.cs.cmu.edu/afs/cs/academic/class/15413-s99/www/hla/doc/rti_synopsis/10-Data_Distribution_Management/Data_Distribution_Management.html)
- Source: [ResearchGate - DDM Multidimensional Regions](https://www.researchgate.net/publication/2267798_Data_distribution_management_in_the_hla_Multidimensional_regions_and_physically_correct_filtering)

**Hybrid/adaptive:** Combines multiple approaches. The most production-relevant category.

- Photon Fusion uses grid-based AOI (bounding box on X/Z axes, Y ignored) combined with explicit interest groups. Properties are tagged with named groups (`[Networked(group: "GroupName")]`), and players subscribe to groups per-object. AOI handles spatial proximity; groups handle semantic relationships (party members, guild chat, etc.).
- Source: [Photon Fusion Interest Management](https://doc.photonengine.com/fusion/v1/manual/interest-management)

### 2. SpatialOS Query-Based Interest: The Most Sophisticated Production Model

SpatialOS (Improbable) developed the most expressive interest management system found in this research. Instead of fixed radii, workers declare **queries** specifying what entity data they need:

- An `improbable.Interest` component is attached to entities, mapping component IDs to lists of queries
- **Constraint types** include: `SphereConstraint`, `CylinderConstraint`, `BoxConstraint`, `RelativeSphereConstraint`, `RelativeCylinderConstraint`, `RelativeBoxConstraint`, `CheckoutRadiusConstraint`, `ActorClassConstraint`, `ComponentClassConstraint`
- Constraints compose with `AndConstraint` and `OrConstraint` for expressive filtering
- **Result types** specify which component updates the worker receives for matched entities
- Workers only receive data they need to do their specific job -- a physics worker gets position/velocity but not inventory, a combat worker gets health/damage but not chat

**Critical distinction: Authority vs. Interest.** Authority = write access (one writer per component). Interest = read access (many readers). A worker can have interest in entities it doesn't have authority over. This maps directly to: an agent can read files it doesn't own/lock.

- The `AlwaysInterested` specifier marks properties that should always be visible to a client regardless of distance -- analogous to "always load this file into context."
- Source: [SpatialOS UnrealGDK PR #1201 - Interest Management Docs](https://github.com/spatialos/UnrealGDK/pull/1201/files/e3461e210281a62a27327b81b38feb4f06919af5)
- Source: [SpatialOS Overview - Query-Based Interest](https://documentation.improbable.io/spatialos-overview/docs/query-based-interest)

### 3. Unreal Engine's Priority System: Bandwidth-Aware Interest with Starvation Prevention

Unreal doesn't just decide relevant/not-relevant -- it continuously prioritizes how much bandwidth each actor gets:

- `NetPriority` is a float (default 1.0). An actor with priority 2.0 updates at twice the frequency of priority 1.0
- Priority is multiplied by **time since last replication** to prevent starvation -- even low-priority actors eventually get updated
- Distance and viewing angle affect priority: actors in front of the viewer get 2x priority; actors beyond `NEARSIGHTTHRESHOLD` get 0.4x
- Relevancy cascade: `bAlwaysRelevant` > owner/pawn check > `bOnlyRelevantToOwner` > skeletal attachment > hidden actor check > distance cull

**Key insight for agent context:** This isn't binary (in/out). It's a continuous priority function that allocates a finite budget (bandwidth) across competing demands (actors). Context windows have the same constraint -- finite token budget, competing files.

- Source: [Unreal Engine Actor Relevancy](https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-relevancy-in-unreal-engine)
- Source: [Cedric Neukirchen - Actor Relevancy and Priority](https://cedric-neukirchen.net/docs/multiplayer-compendium/actor-relevancy-and-priority/)

### 4. The Benford-Fahlen Spatial Model: Aura, Focus, Nimbus

The foundational theoretical model (1993) introduces three spatial concepts that map remarkably well to agent context:

- **Aura:** The region bounding an entity's "presence" -- determines where it can potentially interact. An entity without aura is invisible.
- **Focus:** The subspace where an entity directs its attention -- what it's actively looking at/interested in.
- **Nimbus:** The subspace where an entity projects its presence -- how visible/accessible it makes itself to others.
- **Awareness** between two entities is a function of the overlap between one's focus and the other's nimbus.
- **Adapters** can amplify, attenuate, or redirect aura/focus/nimbus -- like a telescope extends focus or a wall blocks nimbus.

This was implemented in the MASSIVE system and directly influenced SpatialOS's design.

**Key mapping to agents:** An agent's "focus" is its task scope (what files/state it needs). A file's "nimbus" is its discoverability (exports, naming conventions, documentation). An agent becomes "aware" of a file when the agent's task focus overlaps with the file's nimbus (e.g., the agent is working on auth and the file exports `AuthProvider`).

- Source: [Benford & Fahlen 1993 Paper (PDF)](https://www.lri.fr/~mbl/ENS/CSCW/2013/papers/Benford_CSCW1993.pdf)
- Source: [Springer - Spatial Model of Interaction](https://link.springer.com/chapter/10.1007/978-94-011-2094-4_8)

### 5. Eclipse Mylyn's Degree of Interest: The Existing Bridge Between Worlds

Eclipse Mylyn (originally "Mylar") is the most direct prior art for applying interest management to code. Developed by Mik Kersten and Gail Murphy (UBC, 2005-2006), it applies a degree-of-interest model to filter IDE views based on task context:

**The DOI formula:** `DOI(e) = A*(e.selections) + B*(e.edits) - C*(e.decay)`

Default coefficients: A=1 (selection weight), B=0.2 (edit weight), C=0.1 (decay rate)

- Each selection of a code element adds +1 to its interest
- Each keystroke while editing adds +0.1
- Each selection of ANY element decays all OTHER elements by -0.1 (interaction-based decay, not time-based)
- Elements below an interest threshold are filtered from Package Explorer, Outline, Problem views
- Three threshold levels: interesting, very interesting, purge
- Context is saved per-task and restored on task switch -- enabling instant multitasking

**Evaluation results:** 15% average improvement in keystroke-to-selection ratio; one developer showed 49% improvement. All participants reported Mylyn accurately represented task context.

**Key insight:** Mylyn proves that the interest management metaphor works for code. But it was designed for a single human developer. The multi-agent extension is: each agent gets its own DOI model, seeded by task definition rather than interaction history.

- Source: [Kersten & Murphy - Using Task Context to Improve Programmer Productivity (FSE 2006)](https://dl.acm.org/doi/10.1145/1181775.1181777)
- Source: [Mylar: A Degree-of-Interest Model for IDEs (AOSD 2005)](https://dl.acm.org/doi/10.1145/1052898.1052912)
- Source: [Mylyn User Guide - Task-Focused Interface](https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/User_Guide/Task-Focused-Interface.html)
- Source: [SlideTo Doc - Mylar presentation](https://slidetodoc.com/mylar-a-degreeofinterest-model-for-ides-mik-kersten/)

### 6. Edge Cases: How Games Handle the Hard Problems

**Border effect:** Two players on opposite sides of a zone boundary can see each other but don't receive each other's updates. Solution: subscribe to current zone + all adjacent zones. In code: an agent working on `auth.ts` should also see files one import-hop away.

- Source: [Dynetis - Interest Management for MOGs](https://www.dynetisgames.com/2017/04/05/interest-management-mog/)

**Teleportation/discontinuous movement:** When a player teleports, they instantly need a full state dump of the destination zone (no gradual discovery). Solution: the "fetch one" pattern -- on zone transition, do a bulk fetch of the new zone's state. In code: when an agent switches tasks entirely, it needs a fresh context load, not incremental discovery.

- Source: [Dynetis - Interest Management for MOGs](https://www.dynetisgames.com/2017/04/05/interest-management-mog/)

**Long-range effects / Always Interested:** Party members need to see each other regardless of distance. SpatialOS solves this with `AlwaysInterested` properties; Photon uses explicit interest groups. In code: CLAUDE.md files, shared types, and project configuration should be "always interested" -- loaded regardless of task distance.

- Source: [Photon Fusion Interest Management](https://doc.photonengine.com/fusion/v1/manual/interest-management)

**Global broadcasts (server-wide announcements):** Bypass interest management entirely -- every client gets the message. In code: when `package.json` changes or a CI pipeline fails, every active agent should be notified.

**Combat State-Aware Interest Management (CSAIM):** Dynamically adjusts update rates based on game context. During combat, nearby entities get higher-frequency updates; during peaceful exploration, updates are less frequent. In code: when an agent is actively editing a file, it needs high-frequency updates about that file's dependents; when it's just reading, lower frequency suffices.

- Source: [ResearchGate - Combat State-Aware Interest Management](https://www.researchgate.net/publication/323701106_Combat_State-Aware_Interest_Management_for_Massively_Multiplayer_Online_Games)

### 7. Network LOD: Graduated State Fidelity Based on Distance

Coherence (game networking framework) implements network-level LOD where entities at different distances receive different levels of detail:

- LOD 0 (closest): All components enabled, full precision
- LOD 1+ (farther): Components disabled, fields use fewer bits (reduced precision)
- Applies to numeric field encoding: Vector3 at 24 bits per component at LOD 0, reduced at LOD 1+

Combined with dead reckoning (extrapolating entity positions between updates), this means distant entities get infrequent, low-precision updates while nearby entities get frequent, high-precision updates.

**Key mapping to agents:** An agent doing a bug fix needs full-precision state (exact line numbers, full file contents, complete test output) for the affected files. For files 2-3 imports away, it needs medium-precision (function signatures, types). For the broader codebase, it needs low-precision (file existence, module names). This is exactly network LOD applied to code context.

- Source: [Coherence LOD Documentation](https://docs.coherence.io/manual/optimization/level-of-detail-lod)
- Source: [ResearchGate - Dead Reckoning + Interest Management Hybrid](https://www.researchgate.net/publication/311754335_Combining_Interest_Management_and_Dead_Reckoning_A_Hybrid_Approach_for_Efficient_Data_Distribution_in_Multiplayer_Online_Games)

### 8. Production Context Engineering Already Uses These Patterns (Implicitly)

Several production multi-agent systems implement interest management patterns without using the terminology:

**Anthropic's context engineering guidance** prescribes finding "the smallest set of high-signal tokens that maximize the likelihood of some desired outcome" -- this IS interest management. Their recommended approach: agents maintain "lightweight identifiers (file paths, stored queries, web links)" and dynamically load information using tools -- this is the "just-in-time" pattern, equivalent to lazy loading in game networking.

- Source: [Anthropic - Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

**Google ADK** implements "Scope by Default: Every model call and sub-agent sees the minimum context required, with agents reaching for more information explicitly via tools." Sub-agents receive only "the latest user query and one artifact" while suppressing ancestral history.

- Source: [Google Developers Blog - Context-Aware Multi-Agent Framework](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)

**Spotify's Honk** discovered that manual file selection (equivalent to static zone assignment) is brittle: "Picking a too-broad search pattern could easily overwhelm the context window. Conversely, picking a too-limited pattern would not allow the agent to solve the problem."

- Source: [Spotify Engineering - Context Engineering (Honk Part 2)](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2)

**Martin Fowler's framework** describes rules scoped to file globs (e.g., `*.ts`) -- this is literally zone-based interest management where zones are defined by file patterns instead of spatial coordinates.

- Source: [Martin Fowler - Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)

### 9. The MMO Source-of-Truth Pattern Maps to Filesystem State

MMO architecture maintains the source of truth in memory (not the database), with the database serving as a persistence layer. Star Citizen's EntityGraph stores all entity state in a graph database. EVE Online generates 60 million database calls per day but the live state lives in server RAM.

**Key mapping:** In Sherpa, the filesystem IS the world state -- the equivalent of the game world. Git is the persistence/recovery layer (like the MMO database). Agent context windows are the per-client replicas. The interest management question is: which subset of filesystem state gets replicated into each agent's context window?

- Source: [PRDeving - MMO Architecture](https://prdeving.wordpress.com/2023/09/29/mmo-architecture-source-of-truth-dataflows-i-o-bottlenecks-and-how-to-solve-them/)
- Source: [High Scalability - EVE Online Architecture](https://highscalability.com/eve-online-architecture/)

---

## The Mapping: MMO Interest Management to Agent Context Scoping

| MMO Concept | Agent Context Equivalent |
|-------------|--------------------------|
| Game world (all entity state) | Filesystem (all files in repo) |
| Client's relevant set | Agent's context window contents |
| Aura/radius | File "distance" (import depth, directory proximity) |
| Grid cells / zones | Directories, packages, modules |
| Pub/sub topics | File globs (*.ts), tags, labels |
| Entity components | File sections (types, functions, imports) |
| NetPriority (bandwidth allocation) | Token budget allocation across files |
| Network LOD | Full content vs. signatures vs. file names |
| Dead reckoning (prediction) | Cached/stale context (last-known file state) |
| AlwaysInterested | CLAUDE.md, shared types, project config |
| Combat state-aware AOI | Task-type-dependent context scoping |
| Authority (write access) | File locks, assigned ownership in task board |
| Interest (read access) | Files loaded in context for reference |
| Teleportation | Task switching (full context reload) |
| Global broadcast | CI failure, breaking change notification |
| Border effect | Files at module boundaries (re-exported types) |
| Aura (Benford) | Agent's general capability scope |
| Focus (Benford) | Agent's active task requirements |
| Nimbus (Benford) | File's discoverability (exports, naming, docs) |
| DOI decay (Mylyn) | Staleness of cached file content |
| Entity queries (SpatialOS) | Dependency graph traversal queries |
| Update regions / subscription regions (HLA DDM) | Changed files / agent watch patterns |

---

## Implications for Sherpa's Agent Context Scoping

### 1. Interest Should Be Declarative, Not Imperative

SpatialOS's query-based interest is the gold standard. Agents should declare their interest as queries ("I need all files matching `src/auth/**/*.ts` plus any file that imports from them") rather than receiving a manually curated file list. The framework resolves the query against the filesystem and delivers the result.

### 2. A DOI Model for Files

Extending Mylyn's formula to multi-agent:

```
DOI(file, agent) = TaskRelevance(file, agent.task)
                 + DependencyProximity(file, agent.focus_files)
                 - Staleness(file.last_read)
```

Where:
- `TaskRelevance` = how directly the file relates to the task description (semantic match)
- `DependencyProximity` = import distance from files the agent is actively editing
- `Staleness` = how long since the agent last read this file (decay)

Files above threshold get full content. Files at medium DOI get signatures/types. Files below threshold get only file paths (for tool-based lazy loading).

### 3. Three LOD Tiers for File Content

Borrowing from network LOD:
- **LOD 0 (full):** Complete file contents. Used for files the agent is actively editing or that are direct dependencies of edited files. (0-1 import hops)
- **LOD 1 (signatures):** Type definitions, function signatures, exported interfaces. Used for files 2-3 hops away. Costs ~10-20% of full content tokens.
- **LOD 2 (index):** File path + one-line description. Used for the broader module/package. Costs ~1% of full content tokens. Enables the agent to request LOD 0/1 on demand via tools.

### 4. Task-Type-Dependent Interest Profiles

Like combat-state-aware interest management, different task types need different interest shapes:

| Task Type | Interest Shape | LOD 0 Files | LOD 1 Files | LOD 2 Files |
|-----------|---------------|-------------|-------------|-------------|
| Bug fix | Narrow + deep | Affected file + test file | Direct imports, recent git changes | Whole module |
| Feature | Medium + medium | New files + modified files | Related module, types, hooks | Adjacent modules |
| Architecture review | Broad + shallow | None (or CLAUDE.md) | All module entry points, config | Entire repo |
| Refactor | Wide + medium | All renamed/moved files | All importers of changed exports | Whole repo |

### 5. "Always Interested" Files

Certain files should bypass interest management and always be in context, regardless of task:
- `CLAUDE.md` / project configuration (the game's HUD -- always visible)
- Shared type definitions that cross module boundaries
- Active task description / plan
- Recent CI results if task involves testing

### 6. The Border Effect is Real in Code

The zone-border problem in MMOs has a direct analogue: when an agent works on a file at a module boundary (re-exports types, bridges between packages), it needs context from both sides. The "nine-grid" solution (subscribe to adjacent zones) maps to: always include files from adjacent modules when working near a module boundary.

---

## Open Questions

1. **How to compute "distance" in a codebase?** MMOs have Euclidean distance. Code has import graphs, directory trees, semantic similarity, and git co-change frequency. Which metric(s) should define "proximity" for interest management? Likely a weighted combination.

2. **Dynamic vs. static interest?** Should interest be computed once at task start (static zones) or continuously updated as the agent explores (dynamic AOI)? Mylyn's interaction-based decay suggests dynamic is better, but it requires monitoring agent tool calls.

3. **Can we pre-compute interest maps?** Like game servers pre-computing visibility/PVS (Potentially Visible Sets), could we pre-compute a "dependency graph LOD map" for common task types and cache it?

4. **Multi-agent conflict zones.** When two agents' interest areas overlap on the same file, how do we handle concurrent reads/writes? MMOs solve this with single-writer authority per component. We have git locks and the task board, but the mapping needs formalization.

5. **What's the right decay function?** Mylyn uses interaction-count-based decay (not wall-clock). For agents, should a file's DOI decay each time the agent reads a different file? Each time a new tool call is made? Each LLM inference turn?

6. **Interest propagation through the dependency graph.** If file A imports file B which imports file C, and the agent edits A, how much interest should propagate to C? SpatialOS allows you to define this per-query. What's the right default?

7. **Can dead reckoning work for code?** In games, you predict where an entity will be based on velocity. For files, you could predict what state they'll be in based on the last known state + the current agent's intent. Is this useful or is the cost of stale context too high?

---

## Sources

### Academic Papers and Theses
- [Boulanger - Interest Management for Massively Multiplayer Games (McGill Thesis, 2006)](https://www.cs.mcgill.ca/~jboula2/thesis.pdf) -- Taxonomy and comparison of IM algorithms; key finding that tile-based approximates visibility at low cost
- [Boulanger & Kienzle - Comparing Interest Management Algorithms (NetGames 2006)](https://dl.acm.org/doi/10.1145/1230040.1230069) -- Conference paper version of the thesis findings
- [Liu & Theodoropoulos - Interest Management for DVEs: A Survey (ACM Computing Surveys, 2014)](https://dl.acm.org/doi/10.1145/2535417) -- The definitive survey of the field
- [Kersten & Murphy - Using Task Context to Improve Programmer Productivity (FSE 2006)](https://dl.acm.org/doi/10.1145/1181775.1181777) -- The paper that introduced DOI for code; 405+ citations
- [Kersten & Murphy - Mylar: A Degree-of-Interest Model for IDEs (AOSD 2005)](https://dl.acm.org/doi/10.1145/1052898.1052912) -- Original Mylar/Mylyn paper with DOI formula
- [Benford & Fahlen - A Spatial Model of Interaction (ECSCW 1993)](https://www.lri.fr/~mbl/ENS/CSCW/2013/papers/Benford_CSCW1993.pdf) -- Aura/Focus/Nimbus model; foundational theory
- [Furnas - Generalized Fisheye Views (CHI 1986)](https://dl.acm.org/doi/10.1145/22627.22342) -- DOI(x) = API(x) - D(., x); the formula behind Mylyn
- [Combat State-Aware Interest Management for MMOGs](https://www.researchgate.net/publication/323701106_Combat_State-Aware_Interest_Management_for_Massively_Multiplayer_Online_Games) -- Dynamic AOI adjustment based on game context
- [Publish/Subscribe Network Designs for Multiplayer Games](https://www.researchgate.net/publication/267623192_PublishSubscribe_Network_Designs_for_Multiplayer_Games) -- Pub/sub as interest management backbone
- [Evolving Pub/Sub Subscriptions for Multiplayer Online Games (DEBS 2016)](https://dl.acm.org/doi/10.1145/2933267.2933297) -- Content-based subscriptions with evolving patterns
- [Content-Based Pub/Sub Systems (Shen)](https://www.cs.virginia.edu/~hs6ms/publishedPaper/bookChapter/2009/sub-pub-Shen.pdf) -- Comprehensive survey of content-based filtering
- [Combining Interest Management and Dead Reckoning (Hybrid Approach)](https://www.researchgate.net/publication/311754335_Combining_Interest_Management_and_Dead_Reckoning_A_Hybrid_Approach_for_Efficient_Data_Distribution_in_Multiplayer_Online_Games) -- Combining spatial filtering with prediction

### Game Engine and Platform Documentation
- [Photon Fusion - Interest Management](https://doc.photonengine.com/fusion/v1/manual/interest-management) -- AOI + explicit interest groups; production API
- [Photon Fusion 2 - AOI & Multi-Peer](https://doc.photonengine.com/fusion/current/technical-samples/fusion-multi-peer-area-of-interest) -- Updated Fusion 2 AOI sample
- [Photon PUN 2 - Interest Groups](https://doc.photonengine.com/pun/current/gameplay/interestgroups) -- Legacy Photon interest groups
- [SpatialOS - Query-Based Interest](https://documentation.improbable.io/spatialos-overview/docs/query-based-interest) -- Official QBI documentation (may be offline)
- [SpatialOS UnrealGDK PR #1201 - Interest Management Docs](https://github.com/spatialos/UnrealGDK/pull/1201/files/e3461e210281a62a27327b81b38feb4f06919af5) -- Most detailed QBI documentation found; constraint types listed
- [SpatialOS - Designing Workers](https://docs.improbable.io/reference/13.8/shared/design/design-workers) -- How workers declare data needs
- [SpatialOS - Understanding Access/Authority](https://docs.improbable.io/reference/13.6/shared/design/understanding-access) -- Authority vs. interest model
- [Unreal Engine - Actor Relevancy](https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-relevancy-in-unreal-engine) -- Official relevancy docs
- [Unreal Engine - Actor Priority](https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-priority-in-unreal-engine) -- Priority/bandwidth allocation
- [Coherence - Network LOD](https://docs.coherence.io/manual/optimization/level-of-detail-lod) -- Distance-based data precision reduction
- [Godot - Interest Management Proposal (#3904)](https://github.com/godotengine/godot-proposals/issues/3904) -- Open proposal for IM in Godot

### Game Architecture
- [PRDeving - MMO Architecture: Source of Truth](https://prdeving.wordpress.com/2023/09/29/mmo-architecture-source-of-truth-dataflows-i-o-bottlenecks-and-how-to-solve-them/) -- In-memory state as source of truth; Redis pub/sub sync
- [High Scalability - EVE Online Architecture](https://highscalability.com/eve-online-architecture/) -- Single-shard architecture overview
- [Engadget - EVE Online Single-Shard Architecture](https://www.engadget.com/2010-08-10-a-look-into-the-nuts-and-bolts-of-eve-onlines-single-shard-arch.html) -- SOL servers, proxy blades, Infiniband
- [Engadget - EVE Evolved: Server Model](https://www.engadget.com/2008-09-28-eve-evolved-eve-onlines-server-model.html) -- Original server model writeup
- [Star Citizen Wiki - Server Meshing](https://starcitizen.tools/Server_meshing) -- Dynamic server meshing overview
- [Star Citizen - Server Meshing Q&A](https://robertsspaceindustries.com/en/comm-link/transmission/18397-Server-Meshing-And-Persistent-Streaming-Q-A) -- Official Q&A on replication layer
- [Unofficial Road to Dynamic Server Meshing](https://sc-server-meshing.info/) -- Comprehensive community documentation
- [WoW - Sharding (Wowpedia)](https://wowpedia.fandom.com/wiki/Sharding_(term)) -- WoW's zone-based player distribution
- [PC Gamer - WoW Sharding/Layering](https://www.pcgamer.com/the-server-tech-that-saved-wow-10-years-ago-is-causing-problems-for-classics-season-of-discovery-dev-reveals-a-layer-is-actually-just-sharding-with-a-lot-of-sticky-tape/) -- "A layer is just sharding with a lot of sticky tape"

### AI Agent Context Engineering
- [Anthropic - Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) -- "Smallest set of high-signal tokens"; just-in-time loading
- [Anthropic - How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) -- Orchestrator-worker pattern; memory persistence
- [Google Developers Blog - Context-Aware Multi-Agent Framework](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/) -- Tiered storage; scope by default; ADK architecture
- [Martin Fowler - Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) -- Rules, skills, glob-scoped context; pre-loaded vs. on-demand
- [Spotify Engineering - Honk Part 2: Context Engineering](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) -- Manual file selection pitfalls; too broad/too narrow
- [Spotify Engineering - Honk Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) -- 1,500+ PRs background agent
- [Spotify Engineering - Honk Part 3: Feedback Loops](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) -- Predictable results through feedback
- [Vellum - Multi Agent AI Systems with Context Engineering](https://www.vellum.ai/blog/multi-agent-systems-building-with-context-engineering) -- Shared state patterns
- [FlowHunt - Advanced AI Agents with File Access](https://www.flowhunt.io/blog/advanced-ai-agents-with-file-access-mastering-context-offloading-and-state-management/) -- Context offloading to filesystem
- [Microsoft Azure - AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) -- Agent design patterns overview

### HLA / Military Simulation
- [DIS Tutorial - DoD Modeling Standards](https://github.com/open-dis/dis-tutorial/blob/master/DoDModelingAndSimulationStandards.md) -- DIS/HLA/TENA history
- [Wikipedia - Distributed Interactive Simulation](https://en.wikipedia.org/wiki/Distributed_Interactive_Simulation) -- DIS overview
- [Wikipedia - High Level Architecture](https://en.wikipedia.org/wiki/High_Level_Architecture) -- HLA pub/sub and DDM
- [CMU - HLA DDM Documentation](https://www.cs.cmu.edu/afs/cs/academic/class/15413-s99/www/hla/doc/rti_synopsis/10-Data_Distribution_Management/Data_Distribution_Management.html) -- Technical DDM reference
- [ACM - Sort-Based DDM Matching Algorithm](https://dl.acm.org/doi/abs/10.1145/1044322.1044324) -- Efficient region overlap computation
- [ACM - Dynamic Sort-Based DDM](https://dl.acm.org/doi/abs/10.1145/1921598.1921601) -- Improved DDM matching
- [ACM - Topic-Based DDM for Large-Scale Simulations](https://dl.acm.org/doi/10.1145/3716823) -- Topic-based approach to DDM

### Eclipse Mylyn / Task-Focused Interfaces
- [Eclipse Mylyn - Task-Focused Interface FAQ](https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html) -- Interest decay, filtering
- [Eclipse Mylyn - User Guide](https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/User_Guide/Task-Focused-Interface.html) -- Full user guide
- [Vogella - Mylyn Tutorial](https://www.vogella.com/tutorials/Mylyn/article.html) -- Practical tutorial
- [Eclipse Foundation - Mylyn Project](https://www.eclipse.org/mylyn/) -- Project home

### Implementation Examples
- [Zinx MMO demo (GitHub)](https://github.com/aceld/zinx/tree/master/zinx_app_demo/mmo_game) -- Go implementation of grid-based AOI
- [Phaser Quest (GitHub)](https://github.com/Jerenaux/phaserquest) -- JavaScript AOI implementation with zone-based updates
- [AppWarp S2 - MMO Interest Management](https://appwarps2.shephertz.com/dev-center/mmo-interest-management/) -- Grid-based IM with interest area subscriptions
- [Dynetis - Interest Management for MOGs](https://www.dynetisgames.com/2017/04/05/interest-management-mog/) -- Practical guide with border effect solutions

---

## Raw Links

Every URL encountered during research, including those not fully explored:

```
https://www.researchgate.net/publication/221391497_Comparing_interest_management_algorithms_for_massively_multiplayer_games
https://www.cs.mcgill.ca/~jboula2/thesis.pdf
https://dev.to/aceld/11-mmo-online-game-aoi-algorithm-l7d
https://www.researchgate.net/publication/323701106_Combat_State-Aware_Interest_Management_for_Massively_Multiplayer_Online_Games
https://www.researchgate.net/publication/267623192_PublishSubscribe_Network_Designs_for_Multiplayer_Games
https://www.researchgate.net/publication/261960704_Interest_Management_for_Distributed_Virtual_Environments_A_Survey
https://www.researchgate.net/publication/316513495_Simulation_of_Area_of_Interest_Management_for_Massively_Multiplayer_Online_Games_Using_OPNET
https://www.academia.edu/86249942/Load_Balancing_of_Peer_to_Peer_MMORPG_Systems_with_Hierarchical_Area_of_Interest_Management
https://www.semanticscholar.org/paper/A-distributed-architecture-for-MMORPG-Assiotis-Tzanov/95c3742846d9abf76f6e63e29ff806e009037141
https://www.researchgate.net/publication/220791986_Interest_management_middleware_for_networked_games
https://documentation.improbable.io/spatialos-overview/docs/query-based-interest
https://ims.improbable.io/insights/the-new-runtime-is-here-with-a-new-feature-for-managing-areas-of-interest/
https://www.improbable.io/blog/thinking-spatially-using-dynamic-interest-management-to-create-revolutionary-game-designs/
https://docs.improbable.io/reference/13.6/shared/schema/standard-schema-library
https://documentation.improbable.io/sdks-and-data/docs/the-standard-schema-library
https://docs.improbable.io/reference/14.4/shared/design/commands
https://docs.improbable.io/reference/13.6/shared/design/object-interaction
https://docs.improbable.io/reference/12.1/unitysdk/reference/component-interest
https://medium.com/improbable-engineering/thinking-spatially-using-dynamic-interest-management-to-create-revolutionary-game-designs-80ed0fe7693
https://documentation.improbable.io/sdks-and-data/docs/csharp-bindings-send-data-to-spatialos
https://dl.acm.org/doi/10.1145/2535417
https://www.researchgate.net/publication/275482633_Space-Time_Matching_Algorithms_for_Interest_Management_in_Distributed_Virtual_Environments
https://www.researchgate.net/publication/257924214_AOI-cast_in_distributed_virtual_environments_an_approach_based_on_delay_tolerant_reverse_compass_routing_AOI-CAST_IN_DISTRIBUTED_VIRTUAL_ENVIRONMENTS
https://www.researchgate.net/publication/369853857_Area_of_Interest_Management_in_Massively_Multiplayer_Online_Games
https://link.springer.com/chapter/10.1007/978-3-642-54420-0_36
https://dl.acm.org/doi/10.1145/571878.571904
https://www.researchgate.net/publication/226485003_Zoning_Issues_and_Area_of_Interest_Management_in_Massively_Multiplayer_Online_Games
http://homepages.cs.ncl.ac.uk/graham.morgan/dve.htm
https://www.researchgate.net/publication/224263919_A_Parallel_Interest_Matching_Algorithm_for_Distributed-Memory_Systems
https://cloud.google.com/discover/what-is-event-driven-architecture
https://www.hivemq.com/blog/a-guide-event-driven-architecture-edge-to-cloud-connectivity/
https://dzone.com/articles/event-driven-architecture-real-world-iot
https://solace.com/what-is-event-driven-architecture/
https://www.ibm.com/think/topics/event-driven-architecture
https://www.confluent.io/learn/event-driven-architecture/
https://www.researchgate.net/publication/281943061_Load_Balancing_of_Peer-to-Peer_MMORPG_Systems_with_Hierarchical_Area-of-Interest_Management
http://gram.cs.mcgill.ca/theses/boulanger-06-interest.pdf
https://prdeving.wordpress.com/2023/09/29/mmo-architecture-source-of-truth-dataflows-i-o-bottlenecks-and-how-to-solve-them/
https://appwarps2.shephertz.com/dev-center/mmo-interest-management/
https://www.dynetisgames.com/2017/04/05/interest-management-mog/
https://www.researchgate.net/figure/MMO-Game-State-Model_fig3_323701106
https://dl.acm.org/doi/10.1145/2933267.2933297
https://link.springer.com/10.1007/978-3-319-08234-9_239-1
https://www.cs.virginia.edu/~hs6ms/publishedPaper/bookChapter/2009/sub-pub-Shen.pdf
https://dl.acm.org/doi/10.1145/966618.966625
https://journals.riverpublishers.com/index.php/JWE/article/view/19445
https://dl.acm.org/doi/10.1145/3652212.3652216
https://www.sciencedirect.com/science/article/abs/pii/S0167739X22000577
https://link.springer.com/chapter/10.1007/978-3-642-35170-9_16
https://www.academia.edu/7766553/Distributed_Event_Aggregation_for_Content_based_Publish_Subscribe_Systems
https://github.com/godotengine/godot-proposals/issues/3904
https://networking.docs.improbable.io/welcome/spatialos-concepts/authority-and-interest/
https://github.com/spatialos/UnrealGDK/pull/1201/files/e3461e210281a62a27327b81b38feb4f06919af5
https://docs.improbable.io/reference/13.8/shared/design/design-workers
https://documentation.improbable.io/spatialos-overview/docs/handing-over-write-access-authority
https://docs.improbable.io/reference/13.6/shared/design/understanding-access
https://github.com/spatialos/sdk-for-unity/blob/master/docs/tutorials/recipes/player-movement.md
https://github.com/spatialos/sdk-for-unity/blob/master/docs/tutorials/recipes/runtime-entity-creation.md
https://www.flowhunt.io/blog/advanced-ai-agents-with-file-access-mastering-context-offloading-and-state-management/
https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html
https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
https://www.vellum.ai/blog/multi-agent-systems-building-with-context-engineering
https://www.anthropic.com/engineering/multi-agent-research-system
https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent
https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
https://www.sitepoint.com/multi-agent-ai-development-architecture/
https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2
https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1
https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3
https://en.wikipedia.org/wiki/Entity_component_system
https://github.com/SanderMertens/ecs-faq
https://github.com/Dvergar/OSIS
https://www.omg.org/news/whitepapers/Simulation-Whitepaper-v2.0.pdf
https://github.com/open-dis/dis-tutorial/blob/master/DoDModelingAndSimulationStandards.md
https://en.wikipedia.org/wiki/Distributed_Interactive_Simulation
https://en.wikipedia.org/wiki/High_Level_Architecture
https://dl.acm.org/doi/pdf/10.1145/256562.256601
http://open-dis.org/
https://apps.dtic.mil/sti/tr/pdf/ADA426113.pdf
https://www.cs.cmu.edu/afs/cs/academic/class/15413-s99/www/hla/doc/rti_synopsis/10-Data_Distribution_Management/Data_Distribution_Management.html
https://www.researchgate.net/publication/2267798_Data_distribution_management_in_the_hla_Multidimensional_regions_and_physically_correct_filtering
https://dl.acm.org/doi/abs/10.1145/1044322.1044324
https://dl.acm.org/doi/abs/10.1145/1921598.1921601
https://dl.acm.org/doi/10.1145/3716823
https://www.sciencedirect.com/science/article/abs/pii/S0167819106000688
https://godotengine.org/article/multiplayer-changes-godot-4-0-report-4/
https://github.com/godotengine/godot/pull/55950
https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-relevancy-in-unreal-engine
https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-priority-in-unreal-engine
https://cedric-neukirchen.net/docs/multiplayer-compendium/actor-relevancy-and-priority/
https://www.mattgibson.dev/blog/unreal-replication-settings
https://wowpedia.fandom.com/wiki/Sharding_(term)
https://www.pcgamer.com/the-server-tech-that-saved-wow-10-years-ago-is-causing-problems-for-classics-season-of-discovery-dev-reveals-a-layer-is-actually-just-sharding-with-a-lot-of-sticky-tape/
https://blizzardwatch.com/2019/05/14/say-goodbye-sharding-wow-classic-will-use-new-layering-system-manage-server-population/
https://www.engadget.com/2010-08-10-a-look-into-the-nuts-and-bolts-of-eve-onlines-single-shard-arch.html
https://highscalability.com/eve-online-architecture/
https://www.gamedeveloper.com/design/infinite-space-an-argument-for-single-sharded-architecture-in-mmos
https://www.engadget.com/2008-09-28-eve-evolved-eve-onlines-server-model.html
https://www.eveonline.com/news/view/a-history-of-eve-database-server-hardware
https://starcitizen.tools/Server_meshing
https://sc-server-meshing.info/
https://starcitizen.tools/Object_Container_Streaming
https://robertsspaceindustries.com/en/comm-link/transmission/18397-Server-Meshing-And-Persistent-Streaming-Q-A
https://docs.coherence.io/manual/optimization/level-of-detail-lod
https://www.researchgate.net/publication/311754335_Combining_Interest_Management_and_Dead_Reckoning_A_Hybrid_Approach_for_Efficient_Data_Distribution_in_Multiplayer_Online_Games
https://www.gamedeveloper.com/programming/dead-reckoning-latency-hiding-for-networked-games
https://ece.uwaterloo.ca/~sl2smith/papers/2023TOG-Predictive_Dead_Reckoning.pdf
https://www.sciencedirect.com/science/article/abs/pii/S1875952119300552
https://doc.photonengine.com/fusion/v1/manual/interest-management
https://doc.photonengine.com/fusion/current/technical-samples/fusion-multi-peer-area-of-interest
https://doc.photonengine.com/pun/current/gameplay/interestgroups
https://doc.photonengine.com/fusion/current/game-samples/br200/performance-optimizations
https://ieeexplore.ieee.org/document/4700100/
https://researchgate.net/publication/321458963_Combat_state-aware_interest_management_for_online_games_demo
https://www.lri.fr/~mbl/ENS/CSCW/2013/papers/Benford_CSCW1993.pdf
https://link.springer.com/chapter/10.1007/978-94-011-2094-4_8
https://www.semanticscholar.org/paper/Awareness,-Focus,-and-Aura:-A-Spatial-Model-of-in-Benford-Fahl%C3%A9n/d27417e07fc96fd7741f632d1f13e8d986f4bbcc
https://dl.acm.org/doi/10.1145/22627.22342
https://idl.cs.washington.edu/files/2003-InterestEstimation-CHI.pdf
https://perer.org/papers/adamPerer-DOIGraphs-InfoVis2009.pdf
https://dl.acm.org/doi/10.1145/1181775.1181777
https://dl.acm.org/doi/10.1145/1052898.1052912
https://www.researchgate.net/publication/200085969_Using_task_context_to_improve_programmer_productivity
https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html
https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/User_Guide/Task-Focused-Interface.html
https://www.vogella.com/tutorials/Mylyn/article.html
https://en.wikipedia.org/wiki/Task-focused_interface
https://wiki.eclipse.org/Mylyn/Integrator_Reference
https://www.eclipse.org/mylyn/
https://www.cs.ubc.ca/~murphy/papers/mylar/mylar-aosd20056.pdf
http://gram.cs.mcgill.ca/papers/boulanger-06-comparing.pdf
https://www.cs.mcgill.ca/~jboula2/
https://dl.acm.org/doi/10.1145/571878.571901
https://dl.acm.org/doi/10.1145/293701.293717
https://dl.acm.org/doi/book/10.5555/316724
https://link.springer.com/chapter/10.1007/978-3-540-30585-9_16
https://www.researchgate.net/publication/283093313_NSense_Decentralized_interest_management_in_higher_dimensions_through_mutual_notification
https://www.dline.info/fpaper/jdim/v8i3/6.pdf
https://link.springer.com/chapter/10.1007/978-3-540-73107-8_74
https://github.com/aceld/zinx/tree/master/zinx_app_demo/mmo_game
https://github.com/Jerenaux/phaserquest
https://appwarps2.shephertz.com/dev-center/mmo-interest-management/
https://appwarps2.shephertz.com/dev-center/mmo-interest-management-source-code/
https://blogs.shephertz.com/?p=6098
https://www.prweb.com/releases/shephertz_launches_mmo_interest_management_kit/prweb11811339.htm
https://simonwillison.net/2025/Jun/14/multi-agent-research-system/
https://agenticspace.dev/multi-agent-or-not-context-first-insights-from-anthropic-and-cognition/
https://www.morphllm.com/context-engineering
https://within-scope.com/
https://rlancemartin.github.io/2025/06/23/context_engineering/
https://www.elastic.co/search-labs/blog/context-engineering-relevance-ai-agents-elasticsearch
https://www.anthropic.com/research/building-effective-agents
https://www.anthropic.com/engineering/writing-tools-for-agents
https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
https://platform.claude.com/cookbook/tool-use-memory-cookbook
https://www.anthropic.com/news/context-management
https://modelcontextprotocol.io/docs/getting-started/intro
https://www.thoughtworks.com/radar/techniques/ai-friendly-code-design
https://agents.md/
https://code.claude.com/docs/en/memory#modular-rules-with-claude/rules/
```
