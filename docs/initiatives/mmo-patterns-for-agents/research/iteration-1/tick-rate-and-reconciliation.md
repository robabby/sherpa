# Tick Rate and Reconciliation in Multiplayer Games

**Research question:** What's the agentic equivalent of a game loop tick? How often should agents check for stale state? What's the reconciliation model when they discover divergence?

**Date:** 2026-03-11

---

## Key Discoveries

### 1. The Game Server Tick: What Actually Happens

Every multiplayer game server runs a **fixed-rate simulation loop**. Each tick follows the same three-phase pattern:

1. **Collect** — Read all buffered player inputs since last tick
2. **Simulate** — Advance world state by one fixed timestep (physics, game rules, hit detection)
3. **Broadcast** — Snapshot the new world state, delta-compress against each client's last-acknowledged snapshot, send updates

This is the heartbeat of every multiplayer game. The tick rate determines how granular the simulation is.

Sources:
- [Source Multiplayer Networking (gist mirror)](https://gist.github.com/CoolOppo/fe0586836de3fb2f90f9) — "During each tick, the server processes incoming user commands, runs a physical simulation step, checks the game rules, and updates all object states."
- [Gaffer on Games: State Synchronization](https://gafferongames.com/post/state_synchronization/) — Recommends "running the simulation at the same framerate on both sides (for example 60HZ)" with sequence numbers doubling as frame numbers.

### 2. Tick Rates Across Major Games

| Game | Tick Rate | Notes |
|------|-----------|-------|
| Valorant | 128 Hz (7.8ms) | Riot spent enormous engineering effort to hit this. Cost: 2.34ms frame budget per game instance after OS overhead. |
| CS:GO | 64 Hz (official), 128 Hz (FACEIT/ESEA) | Valve argued 64 tick was sufficient for most players. |
| CS2 | 64 Hz + sub-tick | Sub-tick system timestamps inputs between ticks to millisecond precision, claiming "128-tick equivalent" at 64-tick cost. |
| Overwatch | ~63 Hz (16ms command frames) | Client runs *ahead* of server by ~half RTT + 1 command frame. Deterministic ECS architecture. |
| Source Engine (default) | 66.67 Hz (15ms) | Mods can override. Left 4 Dead dropped to 30 Hz. |
| Fortnite | 30 Hz | Battle royale with 100 players. Epic optimized Unreal Engine replication to limit updates to 50 players per server frame. |
| Minecraft | 20 Hz (50ms) | If a tick takes >50ms (MSPT > 50), server drops ticks. TPS < 20 = visible lag. |
| EVE Online | 1 Hz (1000ms) | Space MMO. All timings rounded up to whole seconds. "A 1.2-second locking time = 2 ticks = 2 seconds." |

Key insight: **tick rate is a resource allocation decision, not a purity contest.** Higher tick = more responsive + more expensive. Every game picks the lowest rate that doesn't compromise its core interaction pattern.

Sources:
- [Riot Games: Valorant's 128-Tick Servers](https://technology.riotgames.com/news/valorants-128-tick-servers) — Frame budget details, NUMA optimization, 20x performance improvement journey from 50ms to 2.34ms.
- [Riot Games: Peeking into Valorant's Netcode](https://technology.riotgames.com/news/peeking-valorants-netcode) — Peeker's advantage formula: ReactionTime(Holder) = ReactionTime(Peeker) - RTT - Buffering(Server) - Buffering(Client). 10ms differences in peeker's advantage create measurable skill outcome swings.
- [CS2 Sub-tick Explained (DMarket)](https://dmarket.com/blog/cs2-tick-rate/) — Sub-tick system logs inputs with exact ms timestamps between ticks.
- [EVE University: Server Tick](https://wiki.eveuniversity.org/Server_tick) — 1 Hz tick, rounding behavior.
- [Diamond Lobby: Server Tick Rates Compared](https://diamondlobby.com/server-tick-rates/)
- [win.gg: Tick Rate Explained](https://win.gg/news/heres-what-tick-rate-means-and-which-games-have-the-highest/)

### 3. Client-Side Prediction and Server Reconciliation

The foundational pattern across all fast-paced multiplayer games:

1. **Client predicts locally** — When a player presses a key, the client immediately simulates the result without waiting for the server. This eliminates perceived input lag.
2. **Client sends input + sequence number to server** — Not the predicted result, just the raw input.
3. **Server simulates authoritatively** — Server processes the input using the same simulation code.
4. **Server broadcasts authoritative state + last-processed input sequence number**
5. **Client reconciles** — On receiving server state:
   - Accept server position as ground truth
   - Discard all predicted inputs with sequence numbers <= server's last-processed
   - **Re-simulate** all remaining unacknowledged inputs on top of server state
   - If prediction was correct, no visible change. If wrong, the player snaps to corrected position.

This is the **optimistic execution + authoritative correction** model. The client runs ahead, assumes its predictions are right, and gets corrected only when wrong.

Sources:
- [Gabriel Gambetta: Client-Server Game Architecture](https://www.gabrielgambetta.com/client-server-game-architecture.html) — Four-part series. "Client-Side Prediction and Server Reconciliation are very powerful techniques to make multiplayer games feel responsive even under extremely bad network conditions."
- [Gabriel Gambetta: Client-Side Prediction Live Demo](https://www.gabrielgambetta.com/client-side-prediction-live-demo.html) — Interactive demo with code. Reconciliation algorithm: remove confirmed inputs, reapply unconfirmed on top of server state.
- [Gabriel Gambetta: Entity Interpolation](https://www.gabrielgambetta.com/entity-interpolation.html)
- [Gabriel Gambetta: Lag Compensation](https://www.gabrielgambetta.com/lag-compensation.html)
- [Source Multiplayer Networking (gist)](https://gist.github.com/CoolOppo/fe0586836de3fb2f90f9) — Prediction uses "exactly the same code and rules the server will use." Default interpolation delay: 100ms. Server maintains 1-second history of player positions for lag compensation.

### 4. The Quake 3 Snapshot Model (Carmack's Architecture)

John Carmack's networking model for Quake 3 (1999) established patterns still used today:

- **UDP only** — No TCP anywhere. "Reliable transmission introduced intolerable latency."
- **Server sends full snapshots, delta-compressed** — Each packet = "snapshot N, encoded relative to the last snapshot you acknowledged receiving."
- **32-snapshot cycling buffer per client** — Server keeps history of 32 recent gamestate snapshots per connected client. Binary mask trick for cycling.
- **Lost packets handled automatically** — If snapshot 5 was lost, server compresses snapshot 8 against snapshot 4 (last acknowledged). Delta grows larger but the system self-heals.
- **Huffman compression on top of delta** — Per-packet Huffman compression on application-level deltas.
- **Memory cost:** ~8MB for 4 players (32 snapshots each).
- **Fragment at 1400 bytes** — Below 1500-byte MTU to avoid router fragmentation.

The key Quake 3 insight: **favor simplicity and self-healing over complex acknowledgment protocols.** If a packet is lost, don't resend it — just make the next packet contain everything needed.

Sources:
- [Fabien Sanglard: Quake 3 Network Model](https://fabiensanglard.net/quake3/network.php) — Detailed code-level review. 32-snapshot buffer, delta encoding bit markers, 1400-byte fragment size.
- [Fabien Sanglard: The Quake3 Networking Model (bookofhook)](https://fabiensanglard.net/quake3/The%20Quake3%20Networking%20Mode.html) — "Q3 does per-packet Huffman compression in addition to application level delta compression."
- [Quake 3 Networking Primer](https://www.ra.is/unlagged/network.html)
- [Fabien Sanglard: Quake 3 Architecture](https://fabiensanglard.net/quake3/)
- [Fabien Sanglard: Quake Source Prediction](https://fabiensanglard.net/quakeSource/quakeSourcePrediction.php)
- [The DOOM III Network Architecture (PDF)](https://mrelusive.com/publications/papers/The-DOOM-III-Network-Architecture.pdf)

### 5. Delta Compression = Sending Diffs, Not Full State

Games never send full world state every tick. They send **deltas** — the difference between the current state and a known baseline.

- **Baseline tracking:** Server tracks which snapshot each client last acknowledged receiving. That becomes the baseline for the next delta.
- **Changed-bit encoding:** Each field gets a 1-bit flag ("changed" vs "unchanged"). Unchanged fields cost 1 bit. Changed fields cost 1 bit + value.
- **Compression ratios:** Gaffer on Games reports reducing cube state to ~1/4 original size through delta compression alone, with further gains from quantization.
- **At 60 Hz, linear velocity can be eliminated entirely** — position changes between frames are small enough to interpolate, so velocity doesn't need transmission.

This maps directly to **git's model**: commits are snapshots, but git computes and stores diffs for efficiency. "The diff is dynamically generated from the snapshot data by comparing the root trees of the commit and its parent." ([GitHub Blog: Commits are snapshots, not diffs](https://github.blog/open-source/git/commits-are-snapshots-not-diffs/))

Sources:
- [Gaffer on Games: Snapshot Compression](https://gafferongames.com/post/snapshot_compression/) — Detailed walkthrough from 17.38 Mbit/s down to target bandwidth through progressive optimization. 60 snapshots/sec eliminates need for velocity data.
- [GitHub Blog: Commits Are Snapshots, Not Diffs](https://github.blog/open-source/git/commits-are-snapshots-not-diffs/)
- [Julia Evans: Do we think of git commits as diffs, snapshots, or histories?](https://jvns.ca/blog/2024/01/05/do-we-think-of-git-commits-as-diffs--snapshots--or-histories/)

### 6. Adaptive Tick Rates: EVE Online's Time Dilation

EVE Online's TiDi is the canonical example of an **adaptive tick rate** system:

- Normal operation: 1 Hz (1 tick/second)
- Under load: server detects it can't complete a tick in 1 second
- Response: **slow down the game clock itself** rather than dropping ticks
- Minimum: 10% speed (1 tick per 10 real seconds, i.e., 0.1 Hz)
- Recovery: "When the load clears, raise time back up to normal... done dynamically and in very fine increments." System gradually returns through 30%, 60%, back to 100%.
- Granularity: "There's no reason we can't run at 98% time if we're just slightly overloaded."

TiDi's insight: **it's better to process everything slowly than to drop information.** The alternative (what EVE had before TiDi) was module commands and shots simply disappearing because the server couldn't process them in time.

Other adaptive approaches:
- **Unreal Engine's Adaptive Net Update Frequency** — `NetUpdateFrequency` is treated as max; `MinNetUpdateFrequency` as floor. System dynamically adjusts based on how often replicated properties actually change.
- **Proximity-based update rates** — Some games give closer/more-important objects higher update frequencies and distant objects lower rates.

Sources:
- [EVE Online: Introducing Time Dilation](https://www.eveonline.com/news/view/introducing-time-dilation-tidi) — Original design proposal. "Dynamically and in very fine increments."
- [EVE University: Time Dilation](https://wiki.eveuniversity.org/Time_dilation) — Maximum dilation 10%, requires thousands of pilots.
- [EVE Online: Time Dilation — How's That Going?](https://www.eveonline.com/news/view/time-dilation-hows-that-going) — Post-implementation report.
- [PC Gamer: EVE Online's Mad Time Dilation Tech](https://www.pcgamer.com/eve-onlines-mad-time-dilation-tech-beats-lag/)
- [Jim Purbrick: Beyond Time Dilation](http://jimpurbrick.com/2014/01/29/beyond-time-dilation/)
- [Unreal Engine: Actor Priority Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-priority-in-unreal-engine)
- [Matt Gibson: Unreal Replication Settings](https://www.mattgibson.dev/blog/unreal-replication-settings) — Adaptive Net Update Frequency explanation.

### 7. Interest Management: Not Everything Needs Every Update

Games don't send every entity to every client. They use **interest management** (also called relevancy/scoping) to decide what each client needs to know:

- **TRIBES model:** Server determines which objects are "in scope" for each client based on visibility from the client's position. In-scope objects then self-prioritize based on distance, velocity, and gameplay importance. ([The TRIBES Engine Networking Model](https://www.gamedevs.org/uploads/tribes-networking-model.pdf))
- **Unreal Engine:** `IsNetRelevantFor()` function per actor. Priority is a floating-point ratio — `NetPriority == 2.0` gets 2x bandwidth of `NetPriority == 1.0`. When connection is saturated, priority determines who gets bandwidth.
- **Valorant:** Riot switched from polled property replication to event-driven RPCs, achieving "100x-10,000x improvements" in replication cost.

Sources:
- [The TRIBES Engine Networking Model (PDF)](https://www.gamedevs.org/uploads/tribes-networking-model.pdf)
- [SnapNet: Netcode Architectures Part 4 — Tribes](https://www.snapnet.dev/blog/netcode-architectures-part-4-tribes/)
- [Cedric Neukirchen: Actor Relevancy and Priority](https://cedric-neukirchen.net/docs/multiplayer-compendium/actor-relevancy-and-priority/)
- [Unreal Engine: Performance and Bandwidth Tips](https://docs.unrealengine.com/4.27/en-US/InteractiveExperiences/Networking/Actors/ReplicationPerformance/)
- [Dynetis: Interest Management for MOGs](https://www.dynetisgames.com/2017/04/05/interest-management-mog/)
- [UCL: Spatial Interest Management](https://www.ee.ucl.ac.uk/lcs/previous/LCS2011/LCS1121.pdf)

### 8. Overwatch's "Client in the Future" Model

Overwatch uses a unique variant where the **client runs ahead of the server**:

- Both client and server use 16ms command frames (~63 Hz)
- The client is ahead by approximately `(RTT / 2) + 1 command frame`
- Client sends input tagged with the future command frame number
- Server receives the input approximately when it reaches that frame
- This means the server processes commands at the "right" time without buffering delay

The client dynamically adjusts its simulation speed (slightly faster or slower) to maintain the correct offset — "speed up and slow down its FixedTimeStep to send more or less input frames."

Sources:
- [GDC Vault: Overwatch Gameplay Architecture and Netcode](https://www.gdcvault.com/play/1024001/-Overwatch-Gameplay-Architecture-and)
- [GDC Vault: Networking Scripted Weapons and Abilities in Overwatch](https://gdcvault.com/play/1024653/Networking-Scripted-Weapons-and-Abilities)
- [Gamedeveloper: Overwatch's Gameplay Architecture](https://www.gamedeveloper.com/design/video-how-i-overwatch-s-i-gameplay-architecture-creates-variety)
- [GameDev.net: Overwatch Client Input Buffer + Dynamic FixedTimeStep](https://gamedev.net/forums/topic/701605-overwatch-client-input-buffer-dynamic-fixedtimestep/)

### 9. Rollback Netcode: GGPO's Rewind-and-Replay Model

Fighting games use **rollback netcode** (GGPO), a pattern worth studying for agent reconciliation:

1. **Predict** — Assume the remote player repeats their last input
2. **Simulate forward** — Run the game locally using predicted inputs
3. **Receive actual inputs** — Compare predictions to reality
4. **If wrong: rewind to divergence point, replay with correct inputs** — The game "rolls back" to the frame where prediction diverged, then fast-forwards to the present

Each frame, the entire game state is saved to a buffer. Rollback loads a saved state and re-simulates. This is computationally expensive but gives the illusion of zero-latency play.

Sources:
- [GGPO.net](https://www.ggpo.net/) — "Rather than waiting for input to be received from other players before simulating the next frame, GGPO predicts the inputs they will send."
- [GGPO Wikipedia](https://en.wikipedia.org/wiki/GGPO)
- [SnapNet: Netcode Architectures Part 2 — Rollback](https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/)
- [GitHub: GGPO SDK](https://github.com/pond3r/ggpo)
- [Delta Rollback: New Optimizations](https://medium.com/@david.dehaene/delta-rollback-new-optimizations-for-rollback-netcode-7d283d56e54b)

### 10. Differential Synchronization: The Document Analog

Neil Fraser's differential synchronization (used internally at Google) is the closest analog to agent filesystem collaboration:

- **Three copies**: Client Text, Server Text, Shadow copies
- **Continuous diff-patch cycle**: Client diffs against shadow -> sends patch -> server applies patch + diffs against its shadow -> sends patch back
- **Adaptive timing**: "Hard-coded upper and lower limits (e.g. 1 second and 10 seconds). Activity decreases interval; idle periods increase interval." System "gradually backs off when activity is low, and quickly reengages when activity is high."
- **Self-healing**: Failed patches "automatically show up negatively in the following diff and will be patched out"
- **O(n^2) on change size** — but O(1) when syncing frequently enough to catch individual edits
- **Key advantage over OT**: "Any failure during edit passing [in OT] results in a fork... one lost edit may cause subsequent edits to be applied incorrectly." DS self-corrects through repeated cycles.

Sources:
- [Neil Fraser: Differential Synchronization](https://neil.fraser.name/writing/sync/) — Full algorithm description including adaptive timing, shadow copies, guaranteed delivery method.
- [Google Research: Differential Synchronization (PDF)](https://research.google.com/pubs/archive/35605.pdf)
- [ACM: Differential Synchronization](https://dl.acm.org/doi/10.1145/1600193.1600198)

### 11. Polling vs Event-Driven for Agent Coordination

The software architecture community has strong opinions on this:

**Polling (tick-based):**
- Simple to implement, easy to reason about
- Predictable resource usage
- Wastes CPU when nothing has changed
- Can miss events between polls
- "Polling can be highly inefficient for fetching updates since there is a lag between new data becoming available and synchronization with downstream services" ([Software Pragmatism](https://www.softwarepragmatism.com/polling-event-driven))

**Event-driven (push-based):**
- Zero wasted work when idle
- Immediate response to changes
- More complex to implement (need event infrastructure)
- Can overwhelm consumers during bursts
- "Only one process is active — the one that's actually doing work" ([Software Pragmatism](https://www.softwarepragmatism.com/polling-event-driven))

**Filesystem-level events:**
- Linux: inotify (kernel 2.6.13+). Can overflow if events generated faster than read. Scales well with number of watched items.
- macOS: FSEvents
- Cross-platform: chokidar (Node.js, used in ~30M repos), fswatch
- Polling fallback: "Performance degrades linearly with number of files watched" ([fswatch docs](https://emcrisostomo.github.io/fswatch/doc/1.5.0/html/fswatch/Monitors.html))
- Key limitation of polling: "May miss events between one scan and another" — can only infer a 'change' occurred.

**Hybrid (what games actually do):**
Most games use event-driven input collection + tick-based processing. Inputs arrive asynchronously and buffer. The tick processes the buffer at a fixed rate. This gives the predictability of tick-based processing with the responsiveness of event-driven input.

Sources:
- [Confluent: Four Design Patterns for Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
- [InfoWorld: Event-Driven Multi-Agent Systems](https://www.infoworld.com/article/3808083/a-distributed-state-of-mind-event-driven-multi-agent-systems.html)
- [StreamNative: The Event-Driven Agent Era](https://streamnative.io/blog/the-event-driven-agent-era-why-streams-matter-now)
- [Design Gurus: Event-Driven vs Polling](https://www.designgurus.io/course-play/grokking-system-design-fundamentals/doc/eventdriven-vs-polling-architecture)
- [GitHub: fswatch](https://github.com/emcrisostomo/fswatch)
- [GitHub: chokidar](https://github.com/paulmillr/chokidar)

### 12. Optimistic Concurrency Control: The Database Parallel

OCC from distributed databases mirrors game client-side prediction:

1. **Begin** — Record timestamp/version
2. **Work optimistically** — Read and modify data without locks
3. **Validate** — Before committing, check if anyone else modified the data since your read
4. **Commit or rollback** — If clean, commit. If conflict, abort and retry (or merge).

CRDTs take this further: make the data structure itself handle conflicts. "Instead of transforming operations, CRDTs embed enough metadata in the data to make all replicas converge automatically." But CRDTs have garbage collection challenges — "CRDTs achieve convergence by monotonically accumulating information, but production systems can't grow unbounded forever."

Sources:
- [Wikipedia: Optimistic Concurrency Control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
- [Marc Brooker: Optimism vs Pessimism in Distributed Systems](https://brooker.co.za/blog/2023/10/18/optimism.html)
- [Wikipedia: CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
- [Ian Duncan: The CRDT Dictionary](https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/)

---

## Implications for Agent State Synchronization

### The Agent Tick Spectrum

Games give us a clear spectrum of tick rates mapped to interaction patterns:

| Interaction Pattern | Game Analog | Tick Rate | Agent Equivalent |
|---|---|---|---|
| Twitch reflexes (ms matter) | Valorant, CS2 | 64-128 Hz | N/A for filesystem agents |
| Real-time tactical | Overwatch, Fortnite | 30-63 Hz | N/A for filesystem agents |
| Turn-based / strategic | Minecraft, EVE | 1-20 Hz | **Starting to be relevant** |
| Document collaboration | Google Docs | Adaptive 0.1-1 Hz | **Direct analog** |
| Async collaboration | Git (human) | Per-commit (~hours) | **Current model** |

**For AI agents working on filesystem state, the relevant range is 0.1 Hz to 1 Hz (every 1-10 seconds), with adaptive adjustment.**

### Proposed Agent Reconciliation Model

Drawing from the game networking patterns above:

**1. Hybrid event-driven + tick model (like games)**
- Use filesystem events (inotify/FSEvents via chokidar) for immediate notification of changes
- Process changes on a **fixed tick** (e.g., every 2-5 seconds) rather than reacting to every individual file event
- The tick debounces rapid file changes (like a game tick buffers multiple inputs)

**2. Optimistic execution with authoritative reconciliation (like client-side prediction)**
- Agent works optimistically on its local view of files
- On each tick, agent checks for external changes (analogous to receiving a server snapshot)
- If files changed externally, agent must reconcile — re-evaluate its work against the new state
- If no conflict, continue. If conflict, the authoritative source (git/filesystem truth) wins.

**3. Delta-based change detection (like delta compression)**
- Don't re-read entire file trees each tick. Track what changed since last check.
- Git's content-addressable storage makes this natural — `git status` / `git diff` are fast delta operations
- Filesystem watchers provide the event stream; ticks batch-process the accumulated deltas

**4. Interest management / relevancy (like TRIBES/Unreal)**
- An agent working on `src/components/Button.tsx` doesn't need to watch `docs/README.md`
- Scope the watch set to files relevant to the current task
- Priority-weight changes: a modified file the agent is actively editing > a modified file in the same directory > a modified file elsewhere

**5. Adaptive tick rate (like EVE's TiDi / Fraser's Differential Sync)**
- When the agent detects high activity on shared files: increase check frequency (shorter tick interval)
- When files are stable / agent is doing deep work: decrease check frequency (longer tick interval)
- Hard limits: minimum 1 second, maximum 30 seconds between checks
- Fraser's heuristic: "Activity decreases interval; idle periods increase interval"

**6. Snapshot + rollback capability (like GGPO)**
- Before beginning a multi-file operation, take a snapshot (git stash / commit)
- If reconciliation reveals a conflict mid-operation, ability to rollback to snapshot and re-approach
- This is git's natural model — commits are snapshots, branches are cheap

### Key Design Parameters

| Parameter | Game Equivalent | Suggested Agent Value | Rationale |
|---|---|---|---|
| Base tick rate | Server tick rate | 5 seconds (0.2 Hz) | Filesystem changes are slow relative to game events |
| Active tick rate | High-action tick | 1-2 seconds | When multiple agents are actively editing shared files |
| Idle tick rate | Low-action tick | 10-30 seconds | When no recent external changes detected |
| Reconciliation window | Lag compensation history | Last 10 checks | How far back to look when resolving conflicts |
| Interest scope | Area of interest | Files in current task + dependencies | Don't watch everything |
| Snapshot frequency | Game state saves | Per logical operation | Git commits at natural boundaries |

### The Stale State Question

From Valorant's netcode research: **players always view other players slightly behind their actual position.** The world is always slightly stale at the client. The game compensates by:
1. Making the staleness small enough to not matter (high tick rate)
2. Rewinding time when validating actions (lag compensation)
3. Giving the acting player the benefit of the doubt (favor-the-shooter)

For agents: **some staleness is acceptable and inevitable.** The question is not "how do we eliminate staleness?" but "how much staleness can we tolerate before the agent's work becomes invalid?" The answer depends on the operation:
- Reading a config file that rarely changes: staleness of minutes is fine
- Editing a function another agent is also editing: staleness of seconds matters
- Appending to a log/activity file: staleness barely matters (append-only is naturally conflict-free)

---

## Open Questions

1. **What's the CRDT for code?** CRDTs work for text documents. But code has semantic structure — merging two syntactically valid changes can produce semantically broken code. Is there a "semantic CRDT" for source files?

2. **Should agents declare intent?** Games use input (intent) not state. If Agent A declares "I'm about to modify auth.ts," can other agents route around that — analogous to how game clients send movement commands, not positions?

3. **What's the agent equivalent of interpolation?** Games render between ticks by interpolating. For agents, when filesystem state is between checks, what does the agent assume? Does it interpolate (assume linear progress) or freeze (work only on last-known state)?

4. **Lock-free or lock-based?** Games are overwhelmingly lock-free (optimistic). Is that right for agents? File locks exist but are widely considered harmful. Git's branch model is optimistic. The game networking precedent strongly favors optimistic approaches.

5. **Who is the "server"?** In games, the server is the authoritative source. For agent collaboration, what's authoritative? Options: the filesystem itself, the git HEAD, a designated "coordinator" agent, or the last commit on main.

6. **What's the cost function for staleness?** Games measure in milliseconds of peeker's advantage. For agents, what's the measurable cost of working on stale state? Wasted computation? Merge conflicts? Incorrect outputs?

7. **CS2's sub-tick model for agents?** CS2 timestamps inputs between ticks. Could agents timestamp their operations at sub-tick precision to enable finer-grained reconciliation without increasing actual check frequency?

8. **Rollback depth:** GGPO stores full state per frame in a buffer. For agents, how many "undo points" should be maintained? Git makes this cheap, but the question is when to create them.

---

## Sources

### Foundational Game Networking

- [Gabriel Gambetta: Client-Server Game Architecture (4-part series)](https://www.gabrielgambetta.com/client-server-game-architecture.html) — The most accessible explanation of client prediction + server reconciliation. Includes interactive demos.
- [Gabriel Gambetta: Entity Interpolation](https://www.gabrielgambetta.com/entity-interpolation.html)
- [Gabriel Gambetta: Lag Compensation](https://www.gabrielgambetta.com/lag-compensation.html)
- [Gabriel Gambetta: Client-Side Prediction Live Demo](https://www.gabrielgambetta.com/client-side-prediction-live-demo.html)
- [Gaffer on Games: Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/) — Why fixed timesteps matter for deterministic simulation.
- [Gaffer on Games: Deterministic Lockstep](https://gafferongames.com/post/deterministic_lockstep/) — Send inputs only, not state.
- [Gaffer on Games: Snapshot Compression](https://gafferongames.com/post/snapshot_compression/) — Delta encoding deep dive with specific compression ratios.
- [Gaffer on Games: State Synchronization](https://gafferongames.com/post/state_synchronization/) — Priority accumulators, bandwidth management, jitter buffers.
- [Gaffer on Games: Networked Physics in VR](https://gafferongames.com/post/networked_physics_in_virtual_reality/)
- [Valve: Latency Compensating Methods (Yahn Bernier)](https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization) — The Valve paper on lag compensation.
- [Valve: Source Multiplayer Networking](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking)
- [Valve: Lag Compensation](https://developer.valvesoftware.com/wiki/Lag_Compensation)
- [Valve: Interpolation](https://developer.valvesoftware.com/wiki/Interpolation)
- [Source Multiplayer Networking (full text gist)](https://gist.github.com/CoolOppo/fe0586836de3fb2f90f9) — Mirror of Valve docs with all technical details preserved.

### Quake / id Software

- [Fabien Sanglard: Quake 3 Network Model](https://fabiensanglard.net/quake3/network.php) — Code-level review of snapshot buffer, delta encoding, fragmentation.
- [Fabien Sanglard: Quake 3 Architecture](https://fabiensanglard.net/quake3/) — Full source code review.
- [Fabien Sanglard: The Quake3 Networking Model (bookofhook)](https://fabiensanglard.net/quake3/The%20Quake3%20Networking%20Mode.html)
- [Quake 3 Networking Primer](https://www.ra.is/unlagged/network.html)
- [Fabien Sanglard: Quake Source Prediction](https://fabiensanglard.net/quakeSource/quakeSourcePrediction.php)
- [QuakeWorld by John Carmack (1996 log)](https://fabiensanglard.net/quakeSource/johnc-log.aug.htm)
- [The DOOM III Network Architecture (PDF)](https://mrelusive.com/publications/papers/The-DOOM-III-Network-Architecture.pdf)
- [Quake 3 Network Protocol](https://www.jfedor.org/quake3/)

### Specific Game Architectures

- [Riot Games: Valorant's 128-Tick Servers](https://technology.riotgames.com/news/valorants-128-tick-servers) — The engineering journey from 50ms to 2.34ms per frame. NUMA optimization, RPC vs polling replication.
- [Riot Games: Peeking into Valorant's Netcode](https://technology.riotgames.com/news/peeking-valorants-netcode) — Peeker's advantage formula, move queue system, hit registration.
- [GDC Vault: Overwatch Gameplay Architecture and Netcode](https://www.gdcvault.com/play/1024001/-Overwatch-Gameplay-Architecture-and)
- [GDC Vault: Networking Scripted Weapons and Abilities in Overwatch](https://gdcvault.com/play/1024653/Networking-Scripted-Weapons-and-Abilities)
- [EVE Online: Introducing Time Dilation](https://www.eveonline.com/news/view/introducing-time-dilation-tidi)
- [EVE Online: Time Dilation — How's That Going?](https://www.eveonline.com/news/view/time-dilation-hows-that-going)
- [EVE University: Server Tick](https://wiki.eveuniversity.org/Server_tick)
- [EVE University: Time Dilation](https://wiki.eveuniversity.org/Time_dilation)
- [DMarket: CS2 Tick Rate Explained](https://dmarket.com/blog/cs2-tick-rate/)
- [Turboboost: CS2 Subtick Explained](https://turboboost.gg/article/cs2-tickrate-subtick-and-commands-explained)
- [Unreal Engine: Fortnite Battle Royale Improvements](https://www.unrealengine.com/en-US/tech-blog/unreal-engine-improvements-for-fortnite-battle-royale)
- [The TRIBES Engine Networking Model (PDF)](https://www.gamedevs.org/uploads/tribes-networking-model.pdf)

### Unreal Engine Networking

- [Unreal Engine: Networking Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine)
- [Unreal Engine: Actor Priority](https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-priority-in-unreal-engine)
- [Unreal Engine: Actor Relevancy](https://docs.unrealengine.com/4.27/en-US/InteractiveExperiences/Networking/Actors/Relevancy)
- [Unreal Engine: Performance and Bandwidth Tips](https://docs.unrealengine.com/4.27/en-US/InteractiveExperiences/Networking/Actors/ReplicationPerformance/)
- [Unity: Tick and Update Rates (Netcode for GameObjects)](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/learn/ticks-and-update-rates.html)
- [Matt Gibson: Unreal Replication Settings](https://www.mattgibson.dev/blog/unreal-replication-settings)
- [Cedric Neukirchen: Actor Relevancy and Priority](https://cedric-neukirchen.net/docs/multiplayer-compendium/actor-relevancy-and-priority/)

### Rollback / GGPO

- [GGPO.net](https://www.ggpo.net/)
- [GGPO Wikipedia](https://en.wikipedia.org/wiki/GGPO)
- [GitHub: GGPO SDK](https://github.com/pond3r/ggpo)
- [SnapNet: Netcode Architectures Part 2 — Rollback](https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/)
- [Delta Rollback: New Optimizations](https://medium.com/@david.dehaene/delta-rollback-new-optimizations-for-rollback-netcode-7d283d56e54b)
- [Rollback Networking Part 1 (maintanksoftware)](https://www.maintanksoftware.com/article/rollback1.html)

### Collaborative Editing / Synchronization

- [Neil Fraser: Differential Synchronization](https://neil.fraser.name/writing/sync/) — Adaptive timing (1-10 second bounds), shadow copies, self-healing patches. The closest analog to agent filesystem sync.
- [Google Research: Differential Synchronization (PDF)](https://research.google.com/pubs/archive/35605.pdf)
- [Wikipedia: CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
- [Wikipedia: Optimistic Concurrency Control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
- [Wikipedia: Client-Side Prediction](https://en.wikipedia.org/wiki/Client-side_prediction)
- [Ian Duncan: The CRDT Dictionary](https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/)
- [tiny.cloud: OT vs CRDT](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/)
- [Marc Brooker: Optimism vs Pessimism in Distributed Systems](https://brooker.co.za/blog/2023/10/18/optimism.html)

### Multi-Agent Systems

- [Confluent: Four Design Patterns for Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
- [InfoWorld: Event-Driven Multi-Agent Systems](https://www.infoworld.com/article/3808083/a-distributed-state-of-mind-event-driven-multi-agent-systems.html)
- [StreamNative: The Event-Driven Agent Era](https://streamnative.io/blog/the-event-driven-agent-era-why-streams-matter-now)
- [Confluent: Designing Event-Driven Multi-Agent AI with Kafka and Flink](https://www.confluent.io/blog/ai-meal-planner/)
- [Confluent: Multi-Agent Orchestrator with Flink and Kafka](https://www.confluent.io/blog/multi-agent-orchestrator-using-flink-and-kafka/)
- [Confluent: The Future of AI Agents Is Event-Driven](https://www.confluent.io/blog/the-future-of-ai-agents-is-event-driven/)
- [Confluent: Guide to Event-Driven Agents (ebook)](https://www.confluent.io/resources/ebook/guide-to-event-driven-agents/)
- [Kai Waehner: Agentic AI with A2A and MCP using Kafka](https://www.kai-waehner.de/blog/2025/05/26/agentic-ai-with-the-agent2agent-protocol-a2a-and-mcp-using-apache-kafka-as-event-broker/)
- [Codebridge: Multi-Agent Orchestration Guide 2026](https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier)

### Distributed Systems Fundamentals

- [Design Gurus: Event-Driven vs Polling Architecture](https://www.designgurus.io/course-play/grokking-system-design-fundamentals/doc/eventdriven-vs-polling-architecture)
- [Software Pragmatism: Polling vs Event-Driven](https://www.softwarepragmatism.com/polling-event-driven)
- [GitHub: Multiplayer Networking Resources](https://github.com/ThusSpokeNomad/GameNetworkingResources)
- [GitHub: Awesome Game Networking](https://github.com/rumaniel/Awesome-Game-Networking)
- [Netcode Wikipedia](https://en.wikipedia.org/wiki/Netcode)
- [ResearchGate: Consistency Model for Multiplayer Online Games](https://www.researchgate.net/publication/220696786_A_Consistency_Model_for_Highly_Interactive_Multi-player_Online_Games)
- [ResearchGate: Update Schedules for Multi-server DVEs](https://www.researchgate.net/publication/259992430_Update_Schedules_for_Improving_Consistency_in_Multi-server_Distributed_Virtual_Environments)
- [ResearchGate: Elastic Consistency in Decentralized DVEs](https://www.researchgate.net/publication/224353440_Elastic_Consistency_in_Decentralized_Distributed_Virtual_Environments)
- [IEEE: Consistency Model for Evaluating DVEs](https://ieeexplore.ieee.org/document/1253439)
- [NCL: Introduction to Distributed Virtual Environments](http://homepages.cs.ncl.ac.uk/graham.morgan/dve.htm)

### File Watching

- [GitHub: fswatch](https://github.com/emcrisostomo/fswatch) — Cross-platform file change monitor with multiple backends.
- [GitHub: chokidar](https://github.com/paulmillr/chokidar) — Node.js file watching, ~30M repos.
- [GitHub: nodemon](https://github.com/remy/nodemon)
- [fswatch Monitors Documentation](http://emcrisostomo.github.io/fswatch/doc/1.5.0/html/fswatch/Monitors.html) — Comparison of polling vs native monitors.
- [Helpful: File Polling vs Event Notification](https://helpful.knobs-dials.com/index.php/File_polling,_event_notification,_and_asynchronous_IO)

### Git Internals

- [GitHub Blog: Commits Are Snapshots, Not Diffs](https://github.blog/open-source/git/commits-are-snapshots-not-diffs/)
- [Julia Evans: Git Commits as Diffs, Snapshots, or Histories](https://jvns.ca/blog/2024/01/05/do-we-think-of-git-commits-as-diffs--snapshots--or-histories/)

### Tick Rate Comparisons and General

- [Diamond Lobby: Server Tick Rates Compared](https://diamondlobby.com/server-tick-rates/)
- [win.gg: Tick Rate Explained](https://win.gg/news/heres-what-tick-rate-means-and-which-games-have-the-highest/)
- [win.gg: 64 vs 128 Tick](https://win.gg/news/explaining-tick-rates-in-fps-games-difference-between-64-and-128-tick/)
- [Pinnacle: Comparing 128 and 64 Tick Servers](https://www.pinnacle.com/en/esports-hub/betting-articles/cs-go/comparing-128-64-tick-servers/gxx2dyuylyrl9m5f)
- [Iceline Hosting: CS2 64 vs 128 Ticks](https://iceline-hosting.com/blog/counter-strike-2-servers-the-impact-of-64-vs-128-ticks/)
- [Gamereplays: Understanding Netcode (Overwatch)](https://www.gamereplays.org/overwatch/portals.php?show=page&name=overwatch-a-guide-to-understanding-netcode)
- [Edgegap: Authoritative Servers vs Relays vs P2P](https://edgegap.com/blog/explainer-series-authoritative-servers-relays-peer-to-peer-understanding-networking-types-and-their-benefits-for-each-game-types)
- [Edgegap: Valorant Backend Deep Dive](https://edgegap.com/blog/game-backend-deep-dive-valorant-riot-games)
- [OneUpTime: Monitor Tick Rate with OpenTelemetry](https://oneuptime.com/blog/post/2026-02-06-monitor-game-server-tick-rate-opentelemetry/view)
- [PC Gamer: EVE Online Time Dilation](https://www.pcgamer.com/eve-onlines-mad-time-dilation-tech-beats-lag/)
- [Engadget: EVE Online Time Dilation (2012)](https://www.engadget.com/2012-02-09-eve-onlines-time-dilation-keeping-game-in-sync.html)
- [Software Engineering Daily: Engineering Fast-Paced Multiplayer with Gambetta](https://softwareengineeringdaily.com/2024/06/11/engineering-fast-paced-multiplayer-games-with-gabriel-gambetta/)
- [Hacker News: QuakeWorld by Carmack](https://news.ycombinator.com/item?id=19915698)
- [Hacker News: Valve Latency Compensation](https://news.ycombinator.com/item?id=19926934)
- [Hacker News: Fix Your Timestep](https://news.ycombinator.com/item?id=23649406)
- [Hacker News: Game Server Network Tick Rates](https://news.ycombinator.com/item?id=16342973)
- [ioquake Forum: Client Prediction and Server Reconciliation](https://discourse.ioquake.org/t/client-prediction-and-server-reconciliation-cpsr-in-the-engine/1975)
- [Steam Community: Technical Guide on Rate/Interp/Tickrate](https://steamcommunity.com/sharedfiles/filedetails/?id=501119397)
- [Steam Community: CS2 Needs 128 Tickrate Discussion](https://steamcommunity.com/app/730/discussions/0/7221028806368212583/)
- [Minecraft Wiki: Tick](https://minecraft.fandom.com/wiki/Tick)
- [spark docs: The Tick Loop](https://spark.lucko.me/docs/guides/The-tick-loop)
- [MDN: Anatomy of a Video Game](https://developer.mozilla.org/en-US/docs/Games/Anatomy)
- [Gamedeveloper: Fixing Your Timestep the Easy Way](https://www.gamedeveloper.com/programming/fixing-your-time-step-the-easy-way-with-the-golden-4-8537-ms-)

---

## Raw Link Dump

Every URL encountered during research, including tangentially relevant ones not fully explored:

```
https://en.wikipedia.org/wiki/Netcode
https://news.ycombinator.com/item?id=16342973
https://win.gg/news/heres-what-tick-rate-means-and-which-games-have-the-highest/
https://diamondlobby.com/server-tick-rates/
https://steamcommunity.com/app/730/discussions/0/7221028806368212583/
https://win.gg/news/explaining-tick-rates-in-fps-games-difference-between-64-and-128-tick/
https://turboboost.gg/article/cs2-tickrate-subtick-and-commands-explained
https://www.pinnacle.com/en/esports-hub/betting-articles/cs-go/comparing-128-64-tick-servers/gxx2dyuylyrl9m5f
https://iceline-hosting.com/blog/counter-strike-2-servers-the-impact-of-64-vs-128-ticks/
https://www.gamereplays.org/overwatch/portals.php?show=page&name=overwatch-a-guide-to-understanding-netcode
https://en.wikipedia.org/wiki/Client-side_prediction
https://news.ycombinator.com/item?id=19915698
https://discourse.ioquake.org/t/client-prediction-and-server-reconciliation-cpsr-in-the-engine/1975
https://fabiensanglard.net/quakeSource/johnc-log.aug.htm
https://quake.fandom.com/wiki/John_Carmack
https://fabiensanglard.net/quakeSource/quakeSourcePrediction.php
https://fabiensanglard.net/quake3/
https://www.ra.is/unlagged/network.html
https://fabiensanglard.net/quake3/The%20Quake3%20Networking%20Mode.html
https://fabiensanglard.net/quake3/network.php
https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
https://developer.valvesoftware.com/wiki/Lag_Compensation
https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization
https://developer.valvesoftware.com/wiki/Interpolation
https://gist.github.com/ribasco/046c333024db9e75b2e4f314baa11799
https://developer.valvesoftware.com/wiki/NPC_Lag_Compensation
https://steamcommunity.com/sharedfiles/filedetails/?id=501119397
https://developer.valvesoftware.com/wiki/Category:Networking
https://gist.github.com/CoolOppo/fe0586836de3fb2f90f9
https://developer.valvesoftware.com/wiki/Talk:Source_Multiplayer_Networking
https://wiki.eveuniversity.org/Time_dilation
https://www.eveonline.com/news/view/introducing-time-dilation-tidi
https://forums.eveonline.com/t/time-dilation/424645
https://www.eveonline.com/news/view/time-dilation-hows-that-going
https://www.pcgamer.com/eve-onlines-mad-time-dilation-tech-beats-lag/
https://wiki.eveuniversity.org/Server_tick
https://imperium.news/the-complexity-paradox/
https://www.eveonline.com/news/view/paint-your-ship-red-and-make-it-faster
http://jimpurbrick.com/2014/01/29/beyond-time-dilation/
https://www.engadget.com/2012-02-09-eve-onlines-time-dilation-keeping-game-in-sync.html
https://www.gamedev.net/forums/topic/717013-how-best-to-handle-snapshot-deltas-and-serialization/
https://gafferongames.com/post/snapshot_compression/
https://gafferongames.com/post/state_synchronization/
https://www.gamedev.net/forums/topic/696321-delta-compression/
https://www.gamedev.net/forums/topic/687434-state-snapshot-delta-compression-and-slippy-floats/
https://www.gamedev.net/forums/topic/676447-delta-encoding-snapshots-scopepriority/
https://gamedev.net/forums/topic/696321-delta-compression/5376766/
https://github.com/topics/delta-compression?o=desc
https://github.com/ashoulson/RailgunNet
https://gafferongames.com/post/networked_physics_in_virtual_reality/
https://www.researchgate.net/publication/220696786_A_Consistency_Model_for_Highly_Interactive_Multi-player_Online_Games
https://www.researchgate.net/publication/259992430_Update_Schedules_for_Improving_Consistency_in_Multi-server_Distributed_Virtual_Environments
https://www.researchgate.net/publication/224353440_Elastic_Consistency_in_Decentralized_Distributed_Virtual_Environments
https://www.sciencedirect.com/science/article/abs/pii/S1084804514000083
https://www.academia.edu/6432000/Enhancing_Neighborship_Consistency_for_Peer_to_Peer_Distributed_Virtual_Environments
https://ieeexplore.ieee.org/document/1253439
http://homepages.cs.ncl.ac.uk/graham.morgan/dve.htm
https://ieeexplore.ieee.org/document/1504062/
https://www.researchgate.net/publication/331034155_Consistency_models_in_distributed_systems_A_survey_on_definitions_disciplines_challenges_and_applications
https://www.worldscientific.com/doi/abs/10.1142/S0218001421590503
https://www.gabrielgambetta.com/client-server-game-architecture.html
https://gabrielgambetta.com/
https://www.gabrielgambetta.com/client-side-prediction-live-demo.html
https://softwareengineeringdaily.com/2024/06/11/engineering-fast-paced-multiplayer-games-with-gabriel-gambetta/
https://www.gabrielgambetta.com/entity-interpolation.html
https://www.proofbyexample.com/multiplayer-game-architecture.html
https://github.com/RamiAhmed/Gambetta_NetworkedDemo
https://www.gabrielgambetta.com/lag-compensation.html
https://github.com/rumaniel/Awesome-Game-Networking
https://news.ycombinator.com/item?id=29003727
https://www.confluent.io/blog/event-driven-multi-agent-systems/
https://www.softwarepragmatism.com/polling-event-driven
https://www.infoworld.com/article/3808083/a-distributed-state-of-mind-event-driven-multi-agent-systems.html
https://google.github.io/adk-docs/agents/multi-agents/
https://www.designgurus.io/course-play/grokking-system-design-fundamentals/doc/eventdriven-vs-polling-architecture
https://streamnative.io/blog/the-event-driven-agent-era-why-streams-matter-now
https://docs.aws.amazon.com/lambda/latest/operatorguide/event-driven-benefits.html
https://www.marktechpost.com/2024/11/16/asynchronous-ai-agent-framework-enhancing-real-time-interaction-and-multitasking-with-event-driven-fsm-architecture/
https://www.sinelabore.de/doku.php/wiki/toolbox/event-based_versus_polling
https://www.quora.com/What-are-the-advantages-of-a-polling-based-architecture-over-an-event-driven-architecture
https://github.com/emcrisostomo/fswatch
https://helpful.knobs-dials.com/index.php/File_polling,_event_notification,_and_asynchronous_IO
https://itsfoss.gitlab.io/post/how-to-monitor-file-changes-using-fswatch-in-linux/
http://emcrisostomo.github.io/fswatch/doc/1.5.0/html/fswatch/Monitors.html
https://emcrisostomo.github.io/fswatch/
https://manpages.debian.org/testing/fswatch/fswatch.7.en.html
http://emcrisostomo.github.io/fswatch/doc/1.5.1/html/fswatch/Monitors.html
https://emcrisostomo.github.io/fswatch/doc/1.14.0/fswatch.html/Monitors.html
https://github.com/fxcebx/fswatch
https://manpages.ubuntu.com/manpages/plucky/man7/fswatch.7.html
https://github.blog/open-source/git/commits-are-snapshots-not-diffs/
https://jvns.ca/blog/2024/01/05/do-we-think-of-git-commits-as-diffs--snapshots--or-histories/
https://www.codigodelsur.com/blog/git-snapshots-not-diffs
https://lobste.rs/s/ciw1be/do_we_think_git_commits_as_diffs_snapshots
https://dev.to/bolontiku_eb2e9933657c822/the-git-mental-model-snapshots-not-diffs-3450
https://news.ycombinator.com/item?id=26741829
https://willi.am/blog/2014/10/14/for-the-last-time-git-stores-snapshots-not-diffs/
https://medium.com/@kumar.ankit.ak169/understanding-git-snapshots-the-three-musketeers-of-version-control-3b70256fa8ec
https://news.ycombinator.com/item?id=13644260
https://dev.to/shiva/git-does-not-store-diffs-3dbn
https://generalistprogrammer.com/tutorials/game-networking-complete-multiplayer-guide-2025
https://medium.com/javascript-multiplayer-gamedev/chronicles-of-the-development-of-a-multiplayer-game-part-2-loops-and-leaks-10b453e843e0
https://medium.com/@qingweilim/how-do-multiplayer-game-sync-their-state-part-2-d746fa303950
https://www.gamedev.net/forums/topic/580277-basic-server-framework-game-loop/
https://www.gamedev.net/forums/topic/651665-game-server-main-loop/5120053/
https://www.gamedev.net/forums/topic/717360-problem-with-processing-inputs-on-the-server/
https://learn.microsoft.com/en-us/archive/msdn-magazine/2017/october/game-development-multiplayer-networked-physics-for-web-game-development
https://www.evanjones.ca/network-game-simulation.html
https://en.wikipedia.org/wiki/Optimistic_concurrency_control
https://medium.com/@roopa.kushtagi/concurrency-control-mechanisms-in-distributed-systems-4c7e510b2427
https://www.researchgate.net/publication/262219246_Optimistic_and_efficient_concurrency_control_for_asynchronous_collaborative_systems
https://brooker.co.za/blog/2023/10/18/optimism.html
https://www.slideshare.net/slideshow/optimistic-concurrency-control-in-distributed-systems/83576368
https://ieeexplore.ieee.org/document/1348996
https://link.springer.com/chapter/10.1007/11568421_41
https://itnext.io/the-power-of-optimistic-concurrency-control-in-distributed-systems-8914d7087f69
https://www.designgurus.io/answers/detail/contextualizing-concurrency-controls-in-distributed-environment
https://www.geeksforgeeks.org/operating-systems/concurrency-control-in-distributed-transactions/
https://www.gdcvault.com/play/1024001/-Overwatch-Gameplay-Architecture-and
https://www.gamedev.net/forums/topic/696756-command-frames-and-tick-synchronization/
https://yahnd.com/theater/r/youtube/W3aieHjyNvw/
https://gamedev.net/forums/topic/701605-overwatch-client-input-buffer-dynamic-fixedtimestep/
https://www.maintanksoftware.com/article/rollback1.html
https://us.forums.blizzard.com/en/overwatch/t/game-architecture-and-netcode-gdc/301462
https://www.gamedeveloper.com/design/video-how-i-overwatch-s-i-gameplay-architecture-creates-variety
https://github.com/ThusWroteNomad/GameNetworkingResources/blob/master/README.md
https://www.huangwm.com/wp/archives/2610
https://www.are.na/block/3822736
https://dmarket.com/blog/cs2-tick-rate/
https://community.skin.club/en/articles/what-is-subtick-and-how-does-it-work
https://profilerr.net/cs2-sub-tick-explained-how-does-it-work-and-is-it-better-than-128/
https://blog.cs2.ad/cs2-tick-rate/
https://www.dexerto.com/counter-strike-2/counter-strike-2-sub-tick-updates-explained-2094004/
https://steamcommunity.com/app/730/discussions/0/4352242432190127224/
https://estnn.com/valves-cs2-sub-tick-game-changer-or-marketing-gimmick/
https://cs.money/blog/news/what-is-subtick-and-how-it-works-explained/
http://trac.bookofhook.com/bookofhook/trac.cgi/wiki/Quake3Networking
https://www.jfedor.org/quake3/
https://derekzeng.me/articles/zt-bookofhook-the-quake3-networking-model
https://gamedev.net/forums/topic/291287-the-quake3-networking-model-question/2849547/
https://www.gamedev.net/forums/topic/654235-quake-3s-state-based-delta-compression/
https://hub.jmonkeyengine.org/t/quakemonkey-an-implementation-of-the-quake-3-snapshot-model-on-top-of-the-existing-network-code/23198
https://mrelusive.com/publications/papers/The-DOOM-III-Network-Architecture.pdf
https://technology.riotgames.com/news/valorants-128-tick-servers
https://technology.riotgames.com/news/peeking-valorants-netcode
https://edgegap.com/blog/explainer-series-authoritative-servers-relays-peer-to-peer-understanding-networking-types-and-their-benefits-for-each-game-types
https://edgegap.com/blog/game-backend-deep-dive-valorant-riot-games
https://github.com/ThusWroteNomad/GameNetworkingResources
https://whatisesports.xyz/server-tick-rates/
https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/learn/ticks-and-update-rates.html
https://www.simcentric.com/hong-kong-dedicated-server/what-is-the-impact-of-server-tick-rate-on-gaming-experience/
https://www.gamedev.net/forums/topic/713315-accurate-tick-rate-for-game-servers-without-locking-a-thread/
https://developer.valvesoftware.com/wiki/Tickrate
https://oneuptime.com/blog/post/2026-02-06-monitor-game-server-tick-rate-opentelemetry/view
https://www.researchgate.net/figure/nfluence-of-client-framerate-and-server-tickrate-on-the-median-E2E-lag-in-the-online-game_fig4_307168361
https://forums.ea.com/discussions/battlefield-2042-general-discussion-en/server-tickrate/7001040/replies/7001068
https://www.spigotmc.org/resources/tickspeed.90558/
https://cmogaming.com/threads/a-closer-look-server-ticks-or-server-tick-rates.31/
https://gafferongames.com/post/fix_your_timestep/
http://vodacek.zvb.cz/archiv/681.html
https://www.gamedeveloper.com/programming/fixing-your-time-step-the-easy-way-with-the-golden-4-8537-ms-
https://gafferongames.com/post/deterministic_lockstep/
https://github.com/mas-bandwidth/gafferongames/blob/master/content/post/fix_your_timestep.md
https://jakubtomsu.github.io/posts/input_in_fixed_timestep/
https://games.ead.faveni.edu.br/en/gaffer-on-games-fix-your-timestep.html
https://www.gamedev.net/forums/topic/684244-fix-your-time-step-need-help/
https://news.ycombinator.com/item?id=23649406
https://gamedev.net/forums/topic/685960-the-perfect-game-loop-fix-your-time-step-by-step/
https://multiplayernetworking.com/
https://github.com/ThusSpokeNomad/GameNetworkingResources
https://github.com/rumaniel/Awesome-Game-Networking
https://github.com/miwarnec/Game-Networking-Resources
https://github.com/Chris528/Awesome-Game-Networking
https://github.com/marcobelmonte/Awesome-Game-Networking
https://www.wiley.com/en-us/Networking+and+Online+Games:+Understanding+and+Engineering+Multiplayer+Internet+Games-p-9780470018576
https://www.researchgate.net/publication/2490350_A_Review_on_Networking_and_Multiplayer_Computer_Games
https://github.com/QXSoftware/Game-Networking-Resources
https://www.amazon.com/Networking-Online-Games-Understanding-Engineering/dp/0470018577
https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/
https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
https://kanerika.com/blogs/ai-agent-orchestration/
https://www.adopt.ai/blog/multi-agent-frameworks
https://www.blueprism.com/resources/blog/future-ai-agents-trends/
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://www.intuz.com/blog/top-5-ai-agent-frameworks-2025
https://www.multimodal.dev/post/best-multi-agent-ai-frameworks
https://ioni.ai/post/multi-ai-agents-in-2025-key-insights-examples-and-challenges
https://www.ai-agentsplus.com/blog/multi-agent-orchestration-patterns-2026
https://www.semanticscholar.org/paper/Latency-Compensating-Methods-in-Client-Server-and-Bernier/330071040ca858ca710a24a03915366fcd46f021
https://www.gamedevs.org/uploads/latency-compensation-in-client-server-protocols.pdf
https://news.ycombinator.com/item?id=19926934
https://web.cs.wpi.edu/~claypool/papers/lag-taxonomy/LatencyCompensation.html
https://typeset.io/papers/latency-compensating-methods-in-client-server-in-game-19g23d0fxu
https://www.slideserve.com/wylie-durham/latency-compensating-methods-in-client-server-in-game-protocol-design-and-optimization
https://www.unrealengine.com/en-US/tech-blog/unreal-engine-improvements-for-fortnite-battle-royale
https://forums.unrealengine.com/t/max-server-and-client-tick-rate-in-defaultengine-ini-cant-be-more-than-30/1228138
https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine
https://forums.unrealengine.com/t/tick-rate-client-and-server/459278
https://forums.unrealengine.com/t/what-networking-architecture-fortnite-will-use/28249
https://hone.gg/blog/why-is-fortnite-so-laggy/
https://x.com/ModernWarzone/status/1433424110495825926
https://forums.unrealengine.com/t/fortnite-server-networking-solution/104572
https://www.neogaf.com/threads/epic-details-unreal-engine-4-upgrades-made-for-fortnite-battle-royale.1443233/
https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/
https://codersblock.org/multiplayer-fps/part2/
https://thewayofcode.wordpress.com/tag/server-side-update-loops/
https://developer.mozilla.org/en-US/docs/Games/Anatomy
https://www.gamedevs.org/uploads/tribes-networking-model.pdf
https://www.informit.com/articles/article.aspx?p=2461064&seqNum=2
https://archive.org/details/tribes-networking-model
https://archive.org/stream/tribes-networking-model/tribes-networking-model_djvu.txt
https://www.scribd.com/document/278495122/Tribes-Networking-Model
https://www.snapnet.dev/blog/netcode-architectures-part-4-tribes/
https://news.ycombinator.com/item?id=12050503
https://isetta.io/compendium/Networking/
https://news.ycombinator.com/item?id=31540622
https://minecraft.fandom.com/wiki/Tick
https://spark.lucko.me/docs/guides/The-tick-loop
https://www.mamboserver.com/gaming-servers/how-to-optimize-minecraft-server/
https://wabbanode.com/blog/minecraft/minecraft-server-tps-explained
https://minestrator.com/en/blog/article/minecraft-server-ticks-tps-main-thread-lag-2026
https://guide.chillzone.cc/readme/lag-rules
https://wiki.btwce.com/w/index.php?title=Ticks&mobileaction=toggle_view_desktop
https://support.aternos.org/hc/en-us/articles/12608558942493-Identify-server-performance-issues-using-spark-Minecraft-Java-Edition
https://support.witherhosting.com/en/article/how-to-optimize-your-minecraft-server-and-read-timings-17tlsu3/
https://apexminecrafthosting.com/what-is-minecraft-tps/
https://systemdr.substack.com/p/crdts-vs-operational-transformation
https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
https://gaurav789.hashnode.dev/mastering-distributed-collaboration-the-crdt-and-ot-handbook
https://shambhavishandilya.medium.com/understanding-real-time-collaboration-with-crdts-e764eb65024e
https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/
https://dev.to/puritanic/building-collaborative-interfaces-operational-transforms-vs-crdts-2obo
https://medium.com/@sohail_saifi/building-collaborative-editing-the-battle-between-operational-transform-and-crdts-fdceb63c54ac
https://dev.to/arghya_majumder/operational-transformation-ot-and-crdts-real-time-collaboration-systems-kdd
https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/
https://www.mdpi.com/2220-9964/14/12/468
https://github.com/remy/nodemon
https://github.com/paulmillr/chokidar
https://npm-compare.com/chokidar,fsevents,gaze,node-watch,watch
https://npm-compare.com/chokidar,gaze,node-watch,nodemon,watch
https://www.npmjs.com/package/@bscotch/debounce-watch
https://www.npmjs.com/package/chokidar
https://github.com/paulmillr/chokidar/issues/237
https://medium.com/@muhammadtaifkhan/watch-file-system-using-nodejs-7d4f9f16ce02
https://www.npmjs.com/package/nodemon/v/1.6.1
https://davidwalsh.name/node-watch-file
https://www.loremine.com/blogs/operational-transformation-algorithm-behind-google-docs
https://dev.to/dhanush___b/how-google-docs-uses-operational-transformation-for-real-time-collaboration-119
https://www.linkedin.com/pulse/design-google-docs-crdt-operational-transformation
https://neil.fraser.name/writing/sync/
https://svn.apache.org/repos/asf/incubator/wave/whitepapers/operational-transform/operational-transform.html
https://research.google.com/pubs/archive/35605.pdf
https://www.maxsyncup.com/how_to/setup_google_drive.html
https://www.productmanagementexercises.com/4994/would-implement-feature-google-drive-google-would-design-drive
https://news.ycombinator.com/item?id=23806285
https://news.ycombinator.com/item?id=1354427
https://www.researchgate.net/publication/221391503_A_peer-to-peer_architecture_for_massive_multiplayer_online_games
https://www.cs.mcgill.ca/~jboula2/thesis.pdf
https://www.ee.ucl.ac.uk/lcs/previous/LCS2011/LCS1121.pdf
https://www.dynetisgames.com/2017/04/05/interest-management-mog/
https://www.gamedev.net/forums/topic/687829-space-partitioning-for-top-down-mmo-game-on-the-server/5338957/
https://gamedev.net/forums/topic/609123-interest-management-in-an-mmo/4854774
https://www.researchgate.net/publication/221391453_Performance_analysis_of_game_world_partitioning_methods_for_multiplayer_mobile_gaming
https://www.ripublication.com/ijaer17/ijaerv12n19_24.pdf
https://mirror-networking.gitbook.io/docs/interest-management
https://toolkit.spatial.io/docs/multiplayer/overview
https://research.google.com/pubs/archive/35605.pdf
https://dl.acm.org/doi/10.1145/1600193.1600198
https://www.researchgate.net/publication/221353119_Differential_synchronization
https://neil.fraser.name/writing/sync/eng047-fraser.pdf
https://neil.fraser.name/news/2009/01/11/
https://github.com/kestasjk/DiffSync.NET
https://www.semanticscholar.org/paper/Differential-synchronization-Fraser/2f0a232b8be9fba2ee34dc583d34a849784cfddf
https://en.wikipedia.org/wiki/GGPO
https://www.ggpo.net/
https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/
https://www.teamfortress.tv/post/1021311/netcode-source-vs-ggpo-style-rollback
https://docs.coherence.io/manual/advanced-topics/competitive-games/determinism-prediction-rollback
https://github.com/pond3r/ggpo
https://news.ycombinator.com/item?id=26289933
https://medium.com/@david.dehaene/delta-rollback-new-optimizations-for-rollback-netcode-7d283d56e54b
https://devforum.roblox.com/t/rollback-netcode/2620135
https://www.diva-portal.org/smash/get/diva2:1560069/FULLTEXT01.pdf
https://www.mattgibson.dev/blog/unreal-replication-settings
https://cedric-neukirchen.net/docs/multiplayer-compendium/actor-relevancy-and-priority/
https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-priority-in-unreal-engine
https://docs.unrealengine.com/en-US/Gameplay/Networking/Actors/Relevancy/index.html
https://docs.unrealengine.com/4.27/en-US/InteractiveExperiences/Networking/Actors/Relevancy
https://docs.unrealengine.com/4.26/en-US/InteractiveExperiences/Networking/Actors/ReplicationPerformance
https://docs.unrealengine.com/4.27/en-US/InteractiveExperiences/Networking/Actors/ReplicationPerformance/
https://docs.unrealengine.com/5.3/de/detailed-actor-replication-flow-in-unreal-engine/
https://docs.unrealengine.com/5.3/en-US/actor-priority-in-unreal-engine/
https://docs.unrealengine.com/en-US/Gameplay/Networking/Actors/ReplicationPerformance
https://www.hellointerview.com/learn/system-design/core-concepts/cap-theorem
https://medium.com/@techWithAditya/a-deep-dive-into-the-trade-offs-of-the-cap-theorem-and-their-practical-implications-for-distributed-6021694ad258
https://hazelcast.com/blog/navigating-consistency-in-distributed-systems-choosing-the-right-trade-offs/
https://www.bmc.com/blogs/cap-theorem/
https://dev.to/lovestaco/understanding-the-cap-theorem-choosing-your-battles-in-distributed-systems-26cl
https://www.ijsat.org/papers/2023/3/1408.pdf
https://technori.com/2026/03/24744-understanding-cap-theorem-tradeoffs-in-system-design/ava/
https://en.wikipedia.org/wiki/CAP_theorem
https://www.ben-morris.com/eventual-consistency-and-the-trade-offs-required-by-distributed-development/
https://dl.acm.org/doi/10.1145/2997654
https://www.confluent.io/blog/ai-meal-planner/
https://www.confluent.io/blog/multi-agent-orchestrator-using-flink-and-kafka/
https://www.kai-waehner.de/blog/2025/05/26/agentic-ai-with-the-agent2agent-protocol-a2a-and-mcp-using-apache-kafka-as-event-broker/
https://www.confluent.io/blog/event-driven-flink-agents-enterprise-ai/
https://www.confluent.io/blog/the-future-of-ai-agents-is-event-driven/
https://www.confluent.io/resources/ebook/guide-to-event-driven-agents/
https://seanfalconer.medium.com/how-to-build-a-multi-agent-orchestrator-using-flink-and-kafka-4ee079351161
https://daposto.medium.com/game-networking-9-bonus-overwatch-model-4faba078cf05
https://topic.alibabacloud.com/a/on-the-ecs-architecture-in-the-overwatch_8_8_31063753.html
https://news.ycombinator.com/item?id=26285927
https://www.bilibili.com/video/BV1VE411b7tV/
https://gdcvault.com/play/1024653/Networking-Scripted-Weapons-and-Abilities
https://www.gamedev.net/forums/topic/683580-server-client-ticks-lag-compensation-game-state-etc/
https://www.gamedev.net/forums/topic/696756-command-frames-and-tick-synchronization/
```
