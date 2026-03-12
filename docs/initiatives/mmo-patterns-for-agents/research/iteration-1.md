# Iteration 1 — 2026-03-11

## Research Vectors

### Vector 1: MMO Architectures Beyond Star Citizen
**Question:** What patterns emerge across EVE Online, SpatialOS, Photon, Mirror/Fishnet, Dual Universe, and WorldsAdrift for entity authority and state replication?
**Full report:** [iteration-1/mmo-authority-and-state-replication.md](iteration-1/mmo-authority-and-state-replication.md)

**Key discoveries:**
- The **single-writer invariant** is universal across every system studied — exactly one node has write authority per entity/component at any moment ([Star Citizen Wiki](https://star-citizen.wiki/Comm-Link:18397/en), [SpatialOS Docs](https://docs.improbable.io/reference/13.6/shared/design/understanding-access), [Photon Docs](https://doc.photonengine.com/fusion/current/manual/network-object))
- SpatialOS's **component-level authority** allows different workers to own different components of the same entity — different agents can write to different files within the same initiative ([SpatialOS Understanding Access](https://docs.improbable.io/reference/13.6/shared/design/understanding-access))
- Three fundamentally different scaling strategies: **Time Dilation** (EVE — slow the simulation), **Spatial Partitioning** (Star Citizen — split the world), **Interest Management** (Photon — filter what clients see)
- Star Citizen's **Replication Layer** — a dedicated microservice tier separating "who does the work" from "who manages state sync" — is the architectural pattern Sherpa needs ([Star Citizen Replication Layer](https://starcitizen.tools/Replication_layer))

**Implications:**
- The filesystem already enforces single-writer at the OS level, but the framework needs to enforce it at the *section/component* level
- The MCP server IS the replication layer — this confirms the `mcp-coordination-layer` sibling initiative

### Vector 2: Interest Management Algorithms
**Question:** How do MMOs decide what state to replicate to which client? How does this translate to agent context scoping?
**Full report:** [iteration-1/interest-management-algorithms.md](iteration-1/interest-management-algorithms.md)

**Key discoveries:**
- Five-class taxonomy: aura-based, zone/grid-based, visibility-based, pub/sub-based, hybrid/adaptive ([Boulanger Thesis, McGill 2006](https://www.cs.mcgill.ca/~jboula2/thesis.pdf))
- **Eclipse Mylyn's DOI (Degree of Interest) model** is the single most important prior art — it already applies interest management to code: `DOI(e) = A*(selections) + B*(edits) - C*(decay)`. Proven 15% productivity improvement ([Kersten & Murphy, FSE 2006](https://dl.acm.org/doi/10.1145/1181775.1181777))
- SpatialOS's **query-based interest** (declarative constraints with AND/OR logic) is the most sophisticated production model — agents should declare interest as queries, not receive curated file lists
- **Network LOD** (Level of Detail) maps to three tiers of file content: full content (LOD 0), signatures/types (LOD 1), file paths only (LOD 2) — each costing ~10x less tokens than the tier above

**Implications:**
- Context engineering IS interest management — the terminology is different but the problem is identical
- A DOI model for files, seeded by task definition rather than interaction history, is the right abstraction for agent context scoping

### Vector 3: Authority Transfer Protocols
**Question:** How do games handle ownership transfer between servers? How does this map to Planner→Worker→Judge handoff?
**Full report:** [iteration-1/authority-transfer-protocols.md](iteration-1/authority-transfer-protocols.md)

**Key discoveries:**
- Improbable's **US Patent 10,878,146** describes the most formalized authority transfer protocol: four states (AUTHORITATIVE → AUTHORITY_LOSS_IMMINENT → NOT_AUTHORITATIVE), bounded timeouts, crashed workers can't block the system ([Google Patents](https://patents.google.com/patent/US10878146B2/en))
- Ashes of Creation's **proxy actor pattern** pre-stages lightweight replicas on the receiving server before authority transfers — eliminates cold-start ([Ashes of Creation Wiki](https://ashesofcreation.wiki/Server_meshing))
- **Fencing tokens** (Kleppmann) prevent stale writes from expired authority holders via monotonically increasing integers — essential for preventing "zombie Worker" writes ([Kleppmann](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html))
- **No current AI agent framework implements authority over shared state** — they all transfer conversational context, not write access to artifacts. This is the gap Sherpa fills.

**Implications:**
- Seven concrete patterns for Planner/Worker/Judge: replication layer as task board, proxy pre-staging, fencing tokens, bounded timeout with early completion, orphan detection, per-artifact permission levels, avoid transfer when possible (TiDi)

### Vector 4: Tick Rate and Reconciliation
**Question:** What's the agentic equivalent of a game loop tick? How often should agents check for stale state?
**Full report:** [iteration-1/tick-rate-and-reconciliation.md](iteration-1/tick-rate-and-reconciliation.md)

**Key discoveries:**
- Tick rate is a **resource allocation decision**, not a purity contest — every game picks the lowest rate that doesn't compromise its core interaction pattern (Valorant: 128 Hz, Fortnite: 30 Hz, EVE: 1 Hz)
- **Client-side prediction + server reconciliation** is the foundational pattern: client runs ahead optimistically, server corrects when wrong. This IS the agent working in a worktree then rebasing ([Gambetta](https://www.gabrielgambetta.com/client-server-game-architecture.html))
- **Differential synchronization** (Neil Fraser) uses adaptive timing between 1-10 seconds, backing off when idle, speeding up during activity — the closest direct analog for agent coordination rhythm
- Valorant's switch from **polling to event-driven** (RPCs) yielded 100x-10,000x improvement — agents should use filesystem events + debounced tick, not pure polling

**Implications:**
- The right agent tick rate is 0.2-1 Hz (every 1-5 seconds), not game-speed — we're closer to document collaboration than FPS
- Hybrid model: filesystem events trigger awareness, fixed tick debounces and batch-processes changes

### Vector 5: Lag Compensation and Rollback
**Question:** When an agent does work based on stale state, what's the equivalent of rollback netcode?
**Full report:** [iteration-1/lag-compensation-and-rollback.md](iteration-1/lag-compensation-and-rollback.md)

**Key discoveries:**
- **Git rebase IS server reconciliation** — the game networking pattern (take authoritative state, replay unacknowledged inputs) maps exactly to `git rebase`. Sherpa already has this. ([Gambetta](https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html))
- **"Favor the shooter" maps to "favor the writer"** — when an agent completed work based on slightly stale state, default to accepting the work, because re-running an agent session is expensive ([Overwatch Forums](https://us.forums.blizzard.com/en/overwatch/t/design-discussion-networking-and-favor-the-shooter/227798))
- **Figma's property-level last-writer-wins** maps to section-level granularity — two agents editing different sections = no conflict, auto-merge ([Figma Engineering](https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/))
- **Prevention beats compensation** — just as fighting games invest in prediction accuracy to minimize rollback, Sherpa should invest in task partitioning and file reservations to minimize conflicts

**Implications:**
- The framework operates on a spectrum: **Prevention** (task partitioning, advisory file leases) → **Detection** (git-based version checking) → **Compensation** (rebase, three-way merge, Judge arbitration)
- Don't build rollback infrastructure — accelerate and automate the existing git merge flow

## Synthesis

Seven cross-cutting patterns emerged that no single vector produced alone:

### 1. The Fundamental Equation: Filesystem = Game World

Every vector converges on the same structural mapping:

| Game Layer | Sherpa Equivalent |
|------------|-------------------|
| World state (all entities) | Filesystem (all files) |
| Per-client replica | Agent's context window |
| Game server / worker | Agent instance |
| Replication layer | MCP coordination server |
| EntityGraph / database | Git repository |
| Tick / game loop | Agent sync rhythm |
| Authority | Write lock / task assignment |
| Interest management | Context engineering |

This isn't a metaphor — it's an isomorphism. The problems are structurally identical. The solutions should be too.

### 2. Git IS Already the Netcode

The most surprising finding: **Sherpa doesn't need to build rollback or reconciliation infrastructure.** Git already provides every mechanism the game networking literature describes:

| Game Pattern | Git Equivalent |
|--------------|---------------|
| Client-side prediction | Working in a branch/worktree |
| Server reconciliation | `git rebase` |
| State snapshots | Commits |
| Delta compression | Git's diff algorithm |
| Rollback + replay | `git rebase --onto` |
| Conflict detection | Merge conflicts |
| Human arbitration | Manual conflict resolution |
| Optimistic concurrency | Push fails if remote diverged |

The framework's job isn't to replace git — it's to **accelerate the git workflow** and add the layers git doesn't provide: authority tracking, interest management, and a coordination service.

### 3. The Missing Middle: The Coordination Layer

Star Citizen's replication layer pattern is the key architectural insight. In games, no server talks to another server directly — all state flows through a dedicated coordination tier. Current AI agent frameworks lack this:

- OpenAI Swarm: no shared state
- Semantic Kernel: conversational handoff only
- MCP Agent Mail: advisory leases (closest to what's needed)

**Sherpa's MCP server IS the replication layer.** It should mediate all agent state mutations with authority tracking and optimistic concurrency. This confirms the `mcp-coordination-layer` sibling initiative as architecturally critical.

### 4. Interest Management = Context Engineering (With Better Theory)

The game industry solved the "what state does this client need" problem 30 years ago. The AI industry is now solving the same problem under the name "context engineering." But the game literature has:

- **Formal taxonomies** (Boulanger 2006: 5 algorithm classes)
- **Production implementations** (SpatialOS query-based interest, Photon's hybrid model)
- **A theoretical framework** (Benford & Fahlen 1993: aura/focus/nimbus)
- **Prior art in code** (Eclipse Mylyn's DOI model, 2005)

Sherpa should use these, not reinvent them. Specifically: **a DOI model for files, with three LOD tiers, query-based interest declarations per task, and "always interested" files for project config.**

### 5. Prevention > Detection > Compensation

The cost hierarchy for multi-agent conflicts:

| Strategy | Cost | When to Use |
|----------|------|-------------|
| **Prevention** (task partitioning, file leases) | Cheap | Always — default |
| **Detection** (git version checking, push failure) | Medium | When prevention misses |
| **Compensation** (rebase, retry, Judge arbitration) | Expensive | Last resort |

Fighting games invest massively in prediction accuracy to minimize rollback because rollback is expensive. Sherpa should invest in task partitioning (interest management) to minimize agent conflicts because re-running an agent session costs minutes.

### 6. Time Dilation as Backpressure

EVE Online's TiDi is a profound design principle: **when overloaded, slow down rather than drop or fail.** For agents:

- When too many agents target the same files, reduce their update frequency rather than spawning more agents
- When conflicts occur, let the current writer finish slowly rather than hot-migrating the task
- Accept graceful degradation (reduced parallelism, slower progress) over catastrophic failure (lost work, inconsistent state)

This is the opposite of the typical scaling instinct ("add more workers!") and often more effective.

### 7. The Authority/Ownership Distinction

Gaffer on Games identified that games track two separate things: **authority** (who simulates) and **ownership** (who controls/is responsible). Ownership always wins. For agents:

- **Authority** = who is currently executing (which agent is doing the work)
- **Ownership** = who is responsible for the outcome (Planner owns the plan, Judge owns the approval)

An agent can delegate authority (execution) to a sub-agent while retaining ownership (responsibility). When conflicts arise, ownership should always take precedence over authority.

## All Sources

### MMO Architecture
- [Star Citizen Wiki - Server Meshing Q&A](https://star-citizen.wiki/Comm-Link:18397/en) — Replication layer, EntityGraph, authority model
- [High Scalability - EVE Online Architecture](https://highscalability.com/eve-online-architecture/) — Single-shard, TiDi, SOL blades
- [SpatialOS SDK - Understanding Access](https://docs.improbable.io/reference/13.6/shared/design/understanding-access) — Component-level authority, ACLs
- [Ashes of Creation Wiki - Server Meshing](https://ashesofcreation.wiki/Server_meshing) — Proxy actors, dynamic gridding
- [coherence - Authority Transfer Docs](https://docs.coherence.io/manual/authority/authority-transfer) — Request/Steal/NotTransferable, orphan detection

### Game Networking
- [Gabriel Gambetta - Client-Server Architecture](https://www.gabrielgambetta.com/client-server-game-architecture.html) — Prediction, reconciliation, interpolation
- [Gaffer on Games - State Synchronization](https://gafferongames.com/post/state_synchronization/) — Authority, delta compression, priority accumulators
- [Riot - Valorant 128-Tick Servers](https://technology.riotgames.com/news/valorants-128-tick-servers) — Tick rate engineering
- [GGPO](https://www.ggpo.net/) — Rollback netcode for fighting games
- [Valve - Source Multiplayer Networking](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking) — Lag compensation, entity interpolation

### Interest Management
- [Boulanger Thesis (McGill 2006)](https://www.cs.mcgill.ca/~jboula2/thesis.pdf) — Taxonomy of IM algorithms
- [Kersten & Murphy (FSE 2006)](https://dl.acm.org/doi/10.1145/1181775.1181777) — DOI model for code (Eclipse Mylyn)
- [Benford & Fahlen 1993](https://www.lri.fr/~mbl/ENS/CSCW/2013/papers/Benford_CSCW1993.pdf) — Aura/Focus/Nimbus spatial model
- [Liu & Theodoropoulos (ACM 2014)](https://dl.acm.org/doi/10.1145/2535417) — DVE interest management survey

### Distributed Systems
- [Kleppmann - Distributed Locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — Fencing tokens
- [Improbable Patent US10878146](https://patents.google.com/patent/US10878146B2/en) — Authority transfer protocol
- [Figma Engineering](https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/) — Property-level LWW
- [Replicache](https://doc.replicache.dev/concepts/how-it-works) — Game-style server reconciliation for web apps

### Context Engineering
- [Anthropic - Context Engineering for Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — "Smallest set of high-signal tokens"
- [Spotify - Honk Context Engineering](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) — Manual file selection pitfalls
- [Google ADK - Context-Aware Multi-Agent](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/) — Scope by default

## Proposals Generated

- `proposal.md` — "Game Server Architecture Patterns for Multi-Agent Coordination" — proposes the architectural vocabulary, five design patterns, and implementation roadmap for applying MMO patterns to Sherpa's agent coordination layer.

## Addendum: Beads Ecosystem (2026-03-12)

The Beads ecosystem (Yegge, 18.8k stars) is the closest existing tooling to what this research describes. It layers Beads (task DAG) + Agent Mail (advisory file leases) + Gas Town (multi-agent orchestrator with worktrees) + Dolt (version-controlled SQL with cell-level merge). It solves persistent agent memory and task sequencing well. But it does NOT implement enforced authority (advisory only), interest management, authority transfer protocols, reconciliation rhythm, or backpressure. The gap identified in this research — enforced authority over shared state with fencing tokens and formal transfer protocols — remains unfilled.

Full analysis: [iteration-1/addendum-beads-ecosystem.md](iteration-1/addendum-beads-ecosystem.md)

## Open Questions for Next Iteration

1. **How should the DOI model be implemented for agent context?** Mylyn uses interaction-based decay. Agents have task definitions, dependency graphs, and git co-change frequency. What formula, what coefficients, what decay function? Need to prototype and test.

2. **What does the MCP coordination server actually look like?** Star Citizen's replication layer has Replicant, Gateway, Atlas, Scribe, and EntityGraph. Which of these map to MCP tools? What's the API surface? (Cross-reference with `mcp-coordination-layer` initiative.)

3. **Can section-level granularity be reliably automated?** Figma's property-level and games' component-level authority both require clean boundaries. Markdown has sections (headers). Code has functions/classes. But what about files that lack clear section boundaries? How does the `section-level-prose-sync` initiative solve this?

4. **What's the actual conflict rate for multi-agent filesystem work?** This determines everything — if conflicts are rare, simple file-level locking suffices. If frequent, we need the full interest management + reservation + rollback stack. Need empirical data.

5. **How do fencing tokens work in a git-based system?** Kleppmann's fencing tokens are monotonically increasing integers. Git commit SHAs aren't monotonic. Branch protection can reject stale pushes, but what about the task board layer? (Cross-reference with `sqlite-agentic-state` initiative.)
