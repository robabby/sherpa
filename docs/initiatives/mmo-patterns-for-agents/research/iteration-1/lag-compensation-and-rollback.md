# Lag Compensation and Rollback in Multiplayer Games — Patterns for Stale-State Agent Work

**Research iteration:** 1
**Date:** 2026-03-11
**Scope:** When an agent does work based on stale state, what's the equivalent of rollback netcode? How do games and distributed systems detect, compensate for, or prevent conflicts from stale-state work?

---

## Key Discoveries

### 1. GGPO Rollback Netcode — The Gold Standard

- **GGPO (Good Game, Peace Out)** was created by Tony Cannon, EVO co-founder, in late 2006. Open-sourced under MIT license on October 9, 2019. It is the standard for fighting game netcode. (https://www.ggpo.net/) (https://github.com/pond3r/ggpo)
- **Core mechanism**: The game runs locally without waiting for remote inputs. It *predicts* what remote players will do (using "sticky inputs" — assume they keep doing what they were doing last frame). When actual inputs arrive and differ from predictions, the game *rolls back* to the last confirmed state and *re-simulates forward* with correct inputs. (https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/)
- **Three requirements for rollback**: (1) deterministic simulation — same inputs + same state = same output, always; (2) state serialization — the ability to save and load complete game state snapshots; (3) fast re-simulation — the ability to re-simulate multiple frames within a single render frame. (https://words.infil.net/w02-netcode-p5.html)
- **Performance constraint**: At 60fps with 300ms latency support and 3 frames of input delay, the system must re-simulate up to 15 frames in 16.66ms, giving only ~1.1ms CPU budget per re-simulated frame. If re-simulation exceeds the frame budget, a "spiral of death" feedback loop occurs where performance degrades exponentially. (https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/)
- **Mortal Kombat X's investment**: NetherRealm Studios spent "2 man-years" just optimizing state serialization for rollback in MKX. This underscores that rollback is not free — the infrastructure cost is real. (https://words.infil.net/w02-netcode-p5.html)
- **The prediction horizon is limited**: Predictions beyond 100-150ms become unplayable due to excessive visual corrections. One mitigation is "input decay" — apply 100% of predicted movement initially, then reduce to 2/3, 1/3, and 0 across successive prediction frames. (https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/)

**Agent parallel**: An agent's context window is its "local simulation." It reads state, works for minutes, then writes output. If another agent modified the same state during that time, the first agent's work is based on stale state — analogous to a misprediction that needs rollback and re-simulation. The key difference: game rollback takes milliseconds; agent "rollback" (re-doing work) takes minutes.

### 2. Rollback vs. Delay-Based Netcode — The Fundamental Tradeoff

- **Delay-based netcode** waits for remote inputs before advancing. No mispredictions, but input lag scales with network latency. For fighting games (timing-sensitive, rhythm-based), even 3-4 frames of added delay destroys the experience. (https://compete.playstation.com/en-us/all/articles/why-is-rollback-netcode-better-for-fighting-games)
- **Rollback netcode** lets the game run at full speed locally. The tradeoff is visual corrections — a character might teleport or an action might appear then disappear. For fighting games with discrete input states (left, right, punch, kick), predictions are usually correct because inputs don't change between most frames. (https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/)
- **Hybrid approach (SnapNet's recommendation)**: Apply up to 50ms of input delay first (barely perceptible), then up to 100ms of rollback/prediction, then additional delay for extreme latency scenarios. This minimizes visual corrections while keeping input responsive. (https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/)
- **Why rollback works especially well for fighting games**: Players have limited movement options (left/right/up/down + buttons), so predictions are usually right. In 3D games with 360-degree movement, mispredictions are far more frequent and visually jarring. (https://antsstyle.medium.com/netcode-in-games-an-explanation-and-why-rollback-is-overrated-b76ee54ac2bb)

**Agent parallel**: The "delay vs. rollback" tradeoff maps to "lock and wait" vs. "work optimistically and reconcile." Delay-based = pessimistic locking (agent waits for exclusive access before working). Rollback = optimistic concurrency (agent works immediately, reconciles conflicts later). The right choice depends on conflict frequency — if agents rarely touch the same files, optimistic wins. If they frequently collide, some "delay" (coordination/locking) prevents wasted work.

### 3. Valve Source Engine Lag Compensation — Server-Side Rewind

- **Core mechanism**: The server stores a 1-second history of all player positions. When a client fires a shot, the server rewinds other players' positions to where they were at the exact moment the client fired (accounting for network latency + interpolation), performs the hit test, then restores current positions. (https://developer.valvesoftware.com/wiki/Lag_Compensation)
- **The algorithm**: (1) Client sends fire command with timestamp; (2) Server calls `StartLagCompensation()`; (3) Server moves all entities back in time to match what the client saw; (4) Server executes `FireBullets()` against rewound state; (5) Server calls `FinishLagCompensation()` to restore current state; (6) If hit detected in rewound state, damage is applied in current state. (https://developer.valvesoftware.com/wiki/Lag_Compensation)
- **The entity history buffer**: Server stores entity positions/states at every tick for the last second. When rewinding, it interpolates between stored states to reconstruct the exact world state the client saw. (https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking)
- **The visible artifact**: Being "killed around a corner" — the target moved behind cover on their screen, but the shooter's shot was valid when fired. The server agrees with the shooter's perspective. (https://developer.valvesoftware.com/wiki/Lag_Compensation)

**Agent parallel**: Server-side rewind is like evaluating an agent's work against the state *it saw when it started working*, not the current state. If Agent A started editing a file 10 minutes ago and Agent B modified it 5 minutes ago, we could evaluate A's work against the 10-minute-old state (the "rewound" state A was working from) rather than rejecting it outright against current state.

### 4. Overwatch "Favor the Shooter" — A Policy Decision About Whose Reality Wins

- **The policy**: When the shooter's client and the target's client disagree about whether a shot landed, the server "tends to agree with whatever was sent to it by the shooter's client as opposed to what was sent by the person being shot." This is a deliberate design choice, not a technical necessity. (https://us.forums.blizzard.com/en/overwatch/t/design-discussion-networking-and-favor-the-shooter/227798)
- **Defensive ability exceptions**: Certain abilities (Reaper's Wraith Form, Tracer's Blink) override "favor the shooter" — they always take priority even if the shooter's client showed a hit. This is a per-ability policy decision. (https://us.forums.blizzard.com/en/overwatch/t/design-discussion-networking-and-favor-the-shooter/227798)
- **Why favor the shooter?** Making offensive actions feel responsive makes the game feel good to play. The alternative — favoring the defender — means shots that looked perfect on your screen miss, which feels terrible. The tradeoff is occasionally dying behind walls, which feels bad but is less frequent. (https://us.forums.blizzard.com/en/overwatch/t/favor-the-shooter-is-favor-the-high-ping-remove-it/604456)
- **The latency window compounds multiple sources**: Network latency (60-100ms), client update rate (varies with FPS), server tickrate (60Hz standard, 144Hz in competitive), and simulation lag. Higher shooter FPS and lower shooter latency amplify the advantage. Server tickrate was upgraded from ~21Hz to 60Hz specifically because favor-the-shooter effects were too severe at lower tickrates. (https://us.forums.blizzard.com/en/overwatch/t/design-discussion-networking-and-favor-the-shooter/227798)
- **The GDC 2017 talk** by Timothy Ford explains Overwatch's ECS architecture and how deterministic simulation enables both client prediction and server authority. (https://www.gdcvault.com/play/1024001/-Overwatch-Gameplay-Architecture-and)

**Agent parallel**: "Favor the shooter" = "favor the writer." When Agent A produces work based on stale state, do we accept A's output (favor the agent that did the work) or reject it (favor the current state)? The game industry's answer: favor the active agent when the staleness window is small, but establish exceptions for certain "defensive" operations (e.g., structural changes to the codebase that must be respected).

### 5. Client-Side Prediction and Server Reconciliation — The General Pattern

- **Gabriel Gambetta's canonical explanation**: The client predicts the result of its own actions immediately (responsive UI), while the server remains authoritative. When server state arrives, the client: (1) replaces its state with the server's authoritative state, (2) discards acknowledged inputs, (3) replays all unacknowledged inputs on top of the new state. (https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html)
- **The "replay unacknowledged inputs" technique is the key insight**: The client doesn't simply snap to server state — it takes the authoritative state and re-applies its own pending actions. This preserves local responsiveness while respecting server authority. (https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html)
- **Sequence numbers for tracking**: Each client input carries a sequence number. The server's response includes the last processed sequence number. The client knows which of its inputs have been acknowledged and which are still pending. (https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html)
- **Replicache brought this pattern to web apps**: Replicache uses game-style server reconciliation for offline-first web collaboration. It forks the cache, sends pending mutations to the server, fetches canonical state, computes a delta from the fork point, and replays still-pending mutations atop the new canonical state. Replicache explicitly cites multiplayer game netcode as its inspiration. (https://doc.replicache.dev/concepts/how-it-works) (https://rocicorp.dev/blog/ready-player-two)
- **Matthew Weidner's key insight**: "In the centralized model, CRDTs and OT are merely *optimizations* over server reconciliation." Server reconciliation is the general pattern; CRDTs and OT are specialized algorithms for specific data structures (text, lists) where generic reconciliation is too expensive. (https://mattweidner.com/2024/06/04/server-architectures.html)

**Agent parallel**: This is the most directly applicable pattern. An agent works on its "local prediction" (its branch/worktree). When it's ready to commit, it fetches the authoritative state (main branch), discards any of its changes that are now irrelevant, and replays its still-valid changes on top of the new state. This is literally `git rebase`.

### 6. Optimistic Concurrency Control (OCC) — The Database Equivalent

- **OCC assumes conflicts are rare** and lets transactions proceed without locking. Before committing, each transaction checks whether the data it read has been modified. If yes, the transaction rolls back and retries. (https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
- **The three phases**: (1) Read — read data, perform work tentatively; (2) Validate — check if anyone else modified the data since we read it; (3) Commit/Retry — if validation passes, commit; if not, discard and retry with fresh data. (https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
- **Version-based detection**: Each record has a version number or timestamp. At commit time, compare current version with the version you read. If they differ, someone else wrote in between — conflict detected. (https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/optimistic-concurrency)
- **Retry strategy**: For most use cases, retry the transaction immediately. For high-contention scenarios, use exponential backoff with jitter. (https://enterprisecraftsmanship.com/posts/optimistic-locking-automatic-retry/)
- **MVCC (Multi-Version Concurrency Control)**: Databases like PostgreSQL keep multiple versions of each row. Readers see a consistent snapshot from when their transaction started — they never see partial writes. Writers create new versions rather than overwriting. "Readers never block writers, and writers never block readers." (https://en.wikipedia.org/wiki/Multiversion_concurrency_control) (https://www.postgresql.org/docs/current/mvcc-intro.html)

**Agent parallel**: OCC maps almost perfectly to agent work. Agent reads file state (Read phase), works for 10 minutes (implicit Work phase), then tries to write back (Validate + Commit). If the file changed since the read, the write is rejected and the agent must re-read and redo. Git's push model is exactly this — push fails if remote has diverged, forcing fetch + rebase + push.

### 7. CRDTs — Data Structures That Merge Without Coordination

- **CRDTs guarantee convergence**: Any two replicas can be merged automatically, regardless of what operations each applied independently. No coordination needed, no conflicts possible — by mathematical construction. (https://crdt.tech/) (https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
- **Key CRDT types**: G-Counter (grow-only counter), LWW-Register (last-writer-wins for single values), OR-Set (add/remove sets), Sequence CRDTs (for text — Yjs, Automerge, RGA, LSEQ). (https://crdt.tech/)
- **Automerge**: JSON-like CRDT data structure. Supports nested maps, arrays, text, and counters. Created by Martin Kleppmann. When concurrent edits overlap, Automerge preserves both changes — no data loss, but the merge may not match user intent. (https://automerge.org/) (https://github.com/automerge/automerge)
- **Yjs**: High-performance CRDT for collaborative editing. Used in production by multiple code editors. (https://yjs.dev/)
- **Tonsky's critique**: "Not everything can be made into a CRDT." State-based CRDTs require specific data structure properties. For arbitrary file formats, CRDT merging may not produce meaningful results. (https://tonsky.me/blog/crdt-filesync/)
- **Peritext**: A CRDT specifically for rich text, handling formatting intent preservation across concurrent edits. (https://www.inkandswitch.com/peritext/)
- **Eg-walker (Gentle & Kleppmann)**: A newer algorithm that combines CRDT-like merge with OT-like efficiency. Consumes "an order of magnitude less memory" than existing CRDTs and merges long-running branches "orders of magnitude faster" than OT. The event graph stays on disk; only current document state is in memory. (https://arxiv.org/html/2409.14252v1) (https://martin.kleppmann.com/2025/03/30/eg-walker-collaborative-text.html)

**Agent parallel**: CRDTs work when agent outputs can be modeled as commutative/convergent operations (e.g., adding items to a list, incrementing counters, appending log entries). They break down for prose — two agents writing different paragraphs at the same location might produce a character-interleaved mess. For file-based agent work, CRDTs are most useful at the *metadata* level (task board, status tracking) not at the *content* level (documents, code).

### 8. Operational Transformation (OT) — Google Docs' Approach

- **Core idea**: Transform concurrent operations so they can be applied in any order and produce the same result. If User A inserts at position 5 and User B inserts at position 3, A's operation must be transformed to account for B's insertion shifting the text. (https://en.wikipedia.org/wiki/Operational_transformation)
- **Requires a central server** for ordering in practice. The server defines a total order of operations, and each client transforms its pending operations against newly arrived ones. (https://medium.com/coinmonks/operational-transformations-as-an-algorithm-for-automatic-conflict-resolution-3bf8920ea447)
- **Google Docs implementation**: Documents are stored as a sequence of operations applied in order. Each operation carries a revision number. Out-of-order operations are transformed against all concurrent operations. Operations within 50ms from the same cursor are batched as a "typing burst." (https://programmingappliedai.substack.com/p/how-google-docs-handles-real-time)
- **Complexity explosion**: "OT is very complicated and hard to implement correctly" — Figma's CTO Evan Wallace. The number of transformation rules grows combinatorially with operation types. Google's Jupiter OT system took years to stabilize. (https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/)
- **OT vs. CRDTs**: OT requires a central server but is more efficient for real-time text editing. CRDTs work peer-to-peer but consume more memory. In practice, hybrid approaches are emerging (Notion uses CRDTs for structure, OT for text within blocks). (https://hackernoon.com/crdts-vs-operational-transformation-a-practical-guide-to-real-time-collaboration)

**Agent parallel**: OT is designed for real-time character-by-character collaboration. Agent work is coarse-grained (write a whole section, modify a function). OT's transformation machinery is overkill. But the *concept* — transforming one operation against another to make them compatible — is relevant. If Agent A's edit assumes line 47 contains X, but Agent B's prior edit shifted that content to line 52, A's edit needs "transformation" to target the right location.

### 9. Figma's Pragmatic Middle Ground — Last-Writer-Wins at Property Granularity

- **Figma rejected both OT and CRDTs** as overkill. OT is too complex and CRDT's peer-to-peer guarantees are unnecessary when you have a central server. (https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/)
- **Their model**: `Map<ObjectID, Map<Property, Value>>`. The server tracks the latest value for each property on each object. Two clients changing different properties on the same object = no conflict. Two clients changing the same property on the same object = last writer wins, server determines order by arrival time. (https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/)
- **Optimistic local application**: Changes are applied immediately on the client. Incoming server updates that conflict with unacknowledged local changes are *discarded* by the client — the client's pending change takes precedence until the server confirms or overrides it. (https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/)
- **Tree structure safety**: Parent-child relationships are atomic. The server rejects updates that would create cycles in the tree. Clients temporarily hide cyclic objects until corrections arrive. (https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/)
- **Why this works for Figma**: Design documents are collections of independent objects with independent properties. Two designers moving different rectangles never conflict. Two designers changing the color of the same rectangle = last writer wins, which is acceptable because the "losing" designer can just re-apply their change. (https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/)

**Agent parallel**: This is highly relevant. Sherpa's filesystem has natural property-level granularity — different files, different sections within files, different metadata fields. If we model agent outputs at section/file granularity rather than character-level, Figma's approach works: two agents editing different sections of the same doc = no conflict. Two agents editing the same section = last writer wins (or human arbitration).

### 10. Git's Merge Model — Lag Compensation Already Built In

- **Git branches ARE optimistic concurrency**: Each developer works on their own branch (stale state relative to main), then merges (reconciles). The merge either auto-resolves (non-overlapping changes) or produces conflicts (overlapping changes requiring human resolution). (https://git-scm.com/docs/git-merge)
- **Three-way merge**: Uses the common ancestor + two divergent tips. By knowing what the original state was, Git can determine which side changed what. Non-overlapping changes merge automatically. Overlapping changes = conflict. (https://blog.git-init.com/the-magic-of-3-way-merge/)
- **Merge strategies**: `recursive` (default, handles renames and criss-cross merges), `ours` (keep our version of conflicts), `theirs` (keep their version), `patience` (better for avoiding mismerges on unimportant matching lines). (https://git-scm.com/docs/merge-strategies)
- **Rebase = server reconciliation**: `git rebase` replays your commits on top of the updated base. This is exactly the game networking pattern — take the authoritative state, replay your unacknowledged inputs (commits) on top. If a replayed commit conflicts with the new base, it's a "misprediction" that requires manual resolution. (https://git-scm.com/docs/git-merge)

**Agent parallel**: Git is already the lag compensation system for agent work. Agents work in worktrees (isolated simulation). When done, they rebase onto main (server reconciliation). If conflicts arise, the Judge role resolves them (human arbitration / "favor the authority"). The framework doesn't need to reinvent this — it needs to *accelerate* and *automate* the existing git merge flow.

### 11. Saga Pattern and Compensating Transactions — Forward-Only Rollback

- **Sagas break a distributed operation into a sequence of local transactions**, each with a compensating transaction that reverses its effects. If step 3 fails, run compensations for steps 2 and 1 (in reverse or parallel). (https://microservices.io/patterns/data/saga.html)
- **Compensating transactions are NOT database rollbacks**: They're new forward transactions that semantically undo prior work. Canceling a flight booking isn't DELETE FROM bookings — it's INSERT INTO cancellations with business logic (fees, capacity release). (https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction)
- **Compensating transactions must be idempotent and retryable**: Because the compensation itself can fail, it must be safe to repeat. (https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction)
- **Key insight from Azure docs**: "A compensating transaction can't always replace the current state with the state at the start of the operation, because it might overwrite changes that other concurrent instances have made. Instead, a compensating transaction must be an intelligent process that takes into account any work that concurrent instances do." (https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction)
- **Two implementation styles**: Choreography (decentralized, event-driven) and Orchestration (centralized controller manages the flow). (https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)
- **Manual intervention as fallback**: "In some cases, manual intervention might be the only way to recover from a step that has failed." The system should raise an alert with as much context as possible. (https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction)

**Agent parallel**: If Agent A writes to three files and then we discover a conflict, the "compensation" isn't reverting those files — it's running a new agent session that intelligently undoes A's changes while preserving B's concurrent work. This is expensive (another full agent session), so preventing the conflict in the first place (via coordination) is almost always better than compensating after the fact.

### 12. Delta Rollback — Optimizing What Gets Saved and Restored

- **Standard rollback saves entire game state every frame**. For complex games, serializing the full state can take longer than simulating the frame itself. (https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/)
- **Delta rollback saves only what changed**: For objects that rarely change state, delta approaches record only state changes. Objects that haven't changed take zero time to save and load. This dramatically improves performance for games with large state but small per-frame changes. (https://gitlab.com/BimDav/delta-rollback) (https://easel.games/docs/learn/multiplayer/rollback-netcode)
- **Available as a Godot Engine plugin** demonstrating the concept in practice. (https://godotengine.org/asset-library/asset/3107)

**Agent parallel**: When detecting conflicts, we don't need to compare entire file trees. We need to compare only what changed — git diff already does this. Delta-style conflict detection means checking only the files/sections an agent touched against changes in those same files/sections since the agent started working.

### 13. Multi-Agent MCP Coordination — Existing Approaches

- **Agent-MCP**: Framework for multi-agent systems via MCP. Uses a shared knowledge graph for coordination and task dependency tracking. Relies on domain-based separation (frontend agent handles UI, backend agent handles APIs) rather than explicit file locking. (https://github.com/rinadelph/Agent-MCP)
- **MCP Agent Mail**: Uses advisory file reservations ("leases") where agents signal intent before editing. Leases include glob patterns, TTL values, and exclusivity flags. Conflicts return `FILE_RESERVATION_CONFLICT` errors. Backed by Git + SQLite for persistence and FTS5 for conflict detection. Includes optional pre-commit hooks that prevent commits violating active exclusive reservations. (https://github.com/Dicklesworthstone/mcp_agent_mail)
- **Multi-Agent Coordination MCP**: Provides automatic file locking to prevent multiple agents from editing the same files. (https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp)

**Agent parallel**: The MCP Agent Mail approach (advisory leases with TTL + glob patterns) is the most sophisticated existing implementation. It's essentially pessimistic locking with soft enforcement — agents are *told* about conflicts but not hard-blocked. This matches the "delay-based" side of the netcode spectrum.

### 14. Vector Clocks and Causality Detection

- **Vector clocks detect concurrent modifications** by maintaining a vector of counters (one per node). If vector A is neither >= nor <= vector B (they "interleave"), the events are concurrent. (https://en.wikipedia.org/wiki/Vector_clock)
- **Practical use**: Amazon DynamoDB uses version vectors to detect write-write conflicts. When both a user and their colleague make independent changes, vector comparison reveals concurrency. (https://sookocheff.com/post/time/vector-clocks/)
- **For agent coordination**: Each agent could maintain a version counter for each file it touches. Before writing, compare your read-version with current-version. If they differ and neither dominates, a concurrent modification occurred. Git commit hashes serve a similar purpose — your branch's base commit vs. the current HEAD of main.

### 15. Optimistic Replication — The Overarching Framework

- **Optimistic replication allows replicas to diverge temporarily**, with guaranteed eventual convergence. The fundamental assumption: conflicts are rare enough that the cost of occasional reconciliation is lower than the cost of constant coordination. (https://en.wikipedia.org/wiki/Optimistic_replication) (https://pages.cs.wisc.edu/~remzi/Classes/739/Fall2015/Papers/saito-optimistic-05.pdf)
- **The Saito & Shapiro survey (2005)** is the definitive reference on optimistic replication. It covers: operation logging, state transfer, conflict detection (syntactic via versions, semantic via application logic), and conflict resolution (automatic merge, last-writer-wins, manual intervention). (https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-2003-60.pdf)
- **Stale access definition**: "An access to a particular replica is stale if some other replica has been updated prior to that access, as measured by a global clock, and that update has not yet propagated to the replica being accessed." (https://www.cs.hmc.edu/~geoff/replqos.html)

---

## The Four Options for Stale-State Conflict Resolution

When Agent A's work conflicts with Agent B's concurrent changes:

### Option 1: Detect and Reject (Optimistic Locking)

**Pattern**: OCC, git push, Figma's server rejects cycles
**Mechanism**: Agent reads state + version, does work, tries to write back. If version changed, reject and retry.
**Game equivalent**: None directly — games prefer to reconcile, not reject. But ProseMirror's collaboration uses serialization (reject and recompute). (https://mattweidner.com/2024/06/04/server-architectures.html)
**Best for agents when**: Conflicts are rare, agent work is fast to redo, or correctness is critical (structural changes, schema migrations).
**Cost**: Wasted agent work on rejection. At minutes-per-session agent timescales, this is expensive.

### Option 2: Auto-Merge (CRDTs, OT, Three-Way Merge)

**Pattern**: CRDTs for convergent data, OT for text, git's three-way merge for files
**Mechanism**: Both agents' changes are preserved through mathematical merge operations.
**Game equivalent**: Not applicable — games don't merge player inputs. But Figma's property-level last-writer-wins is a simple auto-merge. (https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/)
**Best for agents when**: Changes are in non-overlapping regions (different files, different sections), or the data structure supports meaningful merge (counters, sets, independent properties).
**Cost**: Risk of semantically invalid merge (two agents add contradictory sections that individually make sense but together are incoherent).

### Option 3: Rollback and Retry (Server Reconciliation)

**Pattern**: GGPO rollback, Valve lag compensation, Replicache server reconciliation, git rebase
**Mechanism**: Accept authoritative state, replay agent's "inputs" (decisions/changes) against updated state, check if they still make sense.
**Game equivalent**: Exactly GGPO/Source engine. Rewind to authoritative state, replay actions forward. (https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html)
**Best for agents when**: Agent work can be decomposed into a series of discrete decisions/edits that can be individually replayed. A second agent session can take the previous session's plan and re-execute against updated state.
**Cost**: Requires the ability to separate an agent's *decisions* from its *execution*. If the plan is "refactor the authentication module," that plan might still be valid even if specific file paths changed. But re-execution is a full session.

### Option 4: Human Arbitration (Conflict Escalation)

**Pattern**: Git merge conflicts requiring manual resolution, Overwatch's defensive ability exceptions, saga pattern's manual intervention fallback
**Mechanism**: System detects the conflict, presents both versions to a human, human decides.
**Game equivalent**: Overwatch's exception list (certain abilities always override "favor the shooter"). The game designers pre-decide which conflicts get auto-resolved and which get special handling. (https://us.forums.blizzard.com/en/overwatch/t/design-discussion-networking-and-favor-the-shooter/227798)
**Best for agents when**: The conflict involves semantic decisions (not just textual overlap), the stakes are high, or both agents' outputs are valuable and a human should choose.
**Cost**: Blocks progress until human intervenes. But this is exactly what Sherpa's Judge role is for.

---

## Implications for Sherpa's Stale-State Agent Work

### The Spectrum: Prevention --> Detection --> Compensation

**Prevention (Delay-Based):**
- File/section reservation via MCP (advisory leases with TTL)
- Task board assigns non-overlapping work to agents
- Worktree isolation (agents work on different branches/files)
- Coordinator agent pre-partitions work to avoid overlap

**Detection (Optimistic):**
- Git-based: push fails if remote diverged, forcing rebase
- Version vectors on files: agent records file hashes at read time, checks at write time
- MCP server tracks file modification timestamps and alerts agents if their read-state is stale

**Compensation (Rollback):**
- Git rebase = replay commits on updated base (server reconciliation)
- Three-way merge for auto-resolvable conflicts
- New agent session that re-executes the previous session's plan against current state
- Human arbitration (Judge role) for semantic conflicts

### Key Architectural Recommendations

1. **Git IS the rollback engine.** Don't build a new one. Worktrees provide isolation (each agent's "local simulation"). Rebase provides server reconciliation. Three-way merge provides auto-merge. Conflicts provide detection. This is already how the framework works — the insight is that this IS the game networking pattern.

2. **Invest in conflict prevention, not compensation.** Re-running an agent session costs minutes. Preventing the conflict (via task partitioning, file reservations, or section-level locking) is almost always cheaper. The game analogy: fighting games invest heavily in input prediction accuracy (reducing the need for rollback) because rollback is expensive.

3. **Section-level granularity matters.** Figma's insight — property-level granularity eliminates most conflicts because users touch different properties. For agents editing documents, section-level granularity (not character-level, not file-level) is the sweet spot. Two agents editing different sections of the same file should auto-merge without conflict.

4. **"Favor the writer" as default policy.** Like Overwatch's "favor the shooter," the default should be: if an agent completed work and the conflict is minor, accept the agent's output and let the other agent adjust. Wasted agent work is the most expensive outcome. Exception list: structural changes (file renames, schema changes, dependency updates) should "favor the authority" (main branch / coordinator decision).

5. **Separate decisions from execution.** The GGPO insight — rollback requires the ability to save state, restore state, and re-simulate. For agents, this means preserving the *plan* (what the agent decided to do and why) separately from the *execution* (the specific file edits). If state changes, you can re-execute the plan against new state without re-deriving the plan. This is the plan.md / activity.md split in the initiative convention.

6. **Delta detection, not full comparison.** Like delta rollback, only compare what the agent touched against what changed in those same files. Git diff already provides this. Don't compare entire worktree state — compare only the intersection of "files agent modified" and "files that changed on main since agent started."

---

## Sources (with descriptions)

### Game Networking

| URL | Description |
|-----|-------------|
| https://www.ggpo.net/ | GGPO official site. Rollback networking SDK for peer-to-peer games. |
| https://github.com/pond3r/ggpo | GGPO source code on GitHub. MIT licensed since 2019. |
| https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/ | SnapNet deep dive on rollback architecture. Best technical explanation found. |
| https://words.infil.net/w02-netcode-p5.html | Infil's fighting game netcode explainer. Covers GGPO history, Tony Cannon, implementation challenges. |
| https://www.gamedeveloper.com/game-platforms/online-multiplayer-the-hard-way | Game Developer article on building rollback netcode from scratch. |
| https://developer.valvesoftware.com/wiki/Lag_Compensation | Valve Developer Wiki on lag compensation. Server-side rewind mechanism. |
| https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking | Valve Developer Wiki on Source engine multiplayer networking architecture. |
| https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization | Yahn Bernier's foundational paper on latency compensation in Half-Life/TF. |
| https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html | Gabriel Gambetta's canonical explanation of client prediction + server reconciliation. Seminal reference. |
| https://www.gdcvault.com/play/1024001/-Overwatch-Gameplay-Architecture-and | Overwatch GDC 2017 talk by Timothy Ford. ECS architecture and netcode. |
| https://us.forums.blizzard.com/en/overwatch/t/design-discussion-networking-and-favor-the-shooter/227798 | Overwatch forums: detailed community discussion of favor-the-shooter policy with dev responses. |
| https://compete.playstation.com/en-us/all/articles/why-is-rollback-netcode-better-for-fighting-games | PlayStation article explaining rollback vs. delay-based for fighting games. |
| https://en.wikipedia.org/wiki/GGPO | Wikipedia on GGPO. History, open-sourcing, adoption. |
| https://www.snapnet.dev/blog/netcode-architectures-part-3-snapshot-interpolation/ | SnapNet on snapshot interpolation architecture. Server-authoritative with entity interpolation. |

### Distributed Systems & Databases

| URL | Description |
|-----|-------------|
| https://en.wikipedia.org/wiki/Optimistic_concurrency_control | Wikipedia on OCC. Read-validate-commit cycle. |
| https://en.wikipedia.org/wiki/Multiversion_concurrency_control | Wikipedia on MVCC. Snapshot isolation, version-based reads. |
| https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction | Azure docs on compensating transaction pattern. Detailed with travel booking example. |
| https://microservices.io/patterns/data/saga.html | Microservices.io on the Saga pattern. Choreography vs. orchestration. |
| https://learn.microsoft.com/en-us/azure/architecture/patterns/saga | Azure docs on Saga design pattern. |
| https://temporal.io/blog/compensating-actions-part-of-a-complete-breakfast-with-sagas | Temporal blog on saga compensating transactions. |
| https://en.wikipedia.org/wiki/Optimistic_replication | Wikipedia on optimistic replication. Eventual consistency framework. |
| https://pages.cs.wisc.edu/~remzi/Classes/739/Fall2015/Papers/saito-optimistic-05.pdf | Saito & Shapiro survey on optimistic replication (2005). Definitive reference. |
| https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-2003-60.pdf | Microsoft Research technical report on optimistic replication. |
| https://en.wikipedia.org/wiki/Vector_clock | Wikipedia on vector clocks. Causality detection in distributed systems. |
| https://en.wikipedia.org/wiki/Lamport_timestamp | Wikipedia on Lamport timestamps. Logical ordering of events. |
| https://www.postgresql.org/docs/current/mvcc-intro.html | PostgreSQL MVCC documentation. |
| https://enterprisecraftsmanship.com/posts/optimistic-locking-automatic-retry/ | Practical guide to optimistic locking with automatic retry. |

### CRDTs & Collaborative Editing

| URL | Description |
|-----|-------------|
| https://crdt.tech/ | CRDT community hub. Definitions, implementations, papers. |
| https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type | Wikipedia on CRDTs. |
| https://automerge.org/ | Automerge CRDT library. JSON-like collaborative data structures. |
| https://github.com/automerge/automerge | Automerge source code. |
| https://yjs.dev/ | Yjs CRDT framework for collaborative editing. |
| https://www.inkandswitch.com/peritext/ | Peritext: CRDT for rich text collaboration. |
| https://arxiv.org/html/2409.14252v1 | Eg-walker paper: "Collaborative Text Editing with Eg-walker: Better, Faster, Smaller." |
| https://martin.kleppmann.com/2025/03/30/eg-walker-collaborative-text.html | Kleppmann's page for the Eg-walker paper. |
| https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html | Kleppmann talk: "CRDTs: The Hard Parts." |
| https://martin.kleppmann.com/2016/11/15/goto-berlin.html | Kleppmann talk: "Conflict resolution for eventual consistency." |
| https://www.inkandswitch.com/essay/local-first/ | Ink & Switch: "Local-first software: You own your data." Foundational essay. |
| https://tonsky.me/blog/crdt-filesync/ | Tonsky: "Local, first, forever." Critique of CRDTs for file sync — not everything can be a CRDT. |
| https://en.wikipedia.org/wiki/Operational_transformation | Wikipedia on Operational Transformation. |
| https://mattweidner.com/2024/06/04/server-architectures.html | Weidner: "Architectures for Central Server Collaboration." Key insight: CRDTs/OT are optimizations over server reconciliation. |
| https://mattweidner.com/2025/05/21/text-without-crdts.html | Weidner: "Collaborative Text Editing without CRDTs or OT." |

### Real-World Collaboration Systems

| URL | Description |
|-----|-------------|
| https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/ | Evan Wallace: How Figma's multiplayer works. Property-level LWW, rejected OT/CRDTs. |
| https://www.figma.com/blog/making-multiplayer-more-reliable/ | Figma blog on multiplayer reliability improvements. |
| https://rocicorp.dev/blog/ready-player-two | Replicache/Reflect: "Ready Player Two." Game-style server reconciliation for web apps. |
| https://doc.replicache.dev/concepts/how-it-works | Replicache docs: how server reconciliation sync works. |
| https://replicache.dev/ | Replicache homepage. Now open-source and in maintenance mode. |

### Multi-Agent Coordination

| URL | Description |
|-----|-------------|
| https://github.com/rinadelph/Agent-MCP | Agent-MCP: multi-agent framework via MCP. Knowledge graph + task coordination. |
| https://github.com/Dicklesworthstone/mcp_agent_mail | MCP Agent Mail: advisory file leases, structured messaging, Git-backed persistence. |
| https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp | Multi-Agent Coordination MCP: automatic file locking for agents. |

### Git & Version Control

| URL | Description |
|-----|-------------|
| https://git-scm.com/docs/git-merge | Git merge documentation. |
| https://git-scm.com/docs/merge-strategies | Git merge strategies (recursive, ours, theirs, patience). |
| https://blog.git-init.com/the-magic-of-3-way-merge/ | Explainer: how three-way merge works and why it's better than two-way. |
| https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging | Git book: advanced merging techniques. |

### Delta Rollback

| URL | Description |
|-----|-------------|
| https://gitlab.com/BimDav/delta-rollback | Delta Rollback implementation for Godot Engine. |
| https://godotengine.org/asset-library/asset/3107 | Delta Rollback Godot plugin. |
| https://easel.games/docs/learn/multiplayer/rollback-netcode | Easel Games rollback netcode explainer. |

---

## Raw Link List

Every URL encountered during this research, including tangential ones for future mining:

```
https://www.ggpo.net/
https://github.com/pond3r/ggpo
https://www.snapnet.dev/blog/netcode-architectures-part-2-rollback/
https://words.infil.net/w02-netcode-p5.html
https://www.gamedeveloper.com/game-platforms/online-multiplayer-the-hard-way
https://developer.valvesoftware.com/wiki/Lag_Compensation
https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization
https://developer.valvesoftware.com/wiki/NPC_Lag_Compensation
https://developer.valvesoftware.com/wiki/Interpolation
https://developer.valvesoftware.com/wiki/Category:Networking
https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html
https://www.gdcvault.com/play/1024001/-Overwatch-Gameplay-Architecture-and
https://us.forums.blizzard.com/en/overwatch/t/design-discussion-networking-and-favor-the-shooter/227798
https://us.forums.blizzard.com/en/overwatch/t/favor-the-shooter-is-favor-the-high-ping-remove-it/604456
https://us.forums.blizzard.com/en/overwatch/t/favor-the-shooter-can-be-very-frustrating/878128
https://us.forums.blizzard.com/en/overwatch/t/favor-the-shooter-favors-those-with-higher-ping-or-lower/245659
https://us.forums.blizzard.com/en/overwatch/t/could-we-please-do-something-about-fts-and-lag-compensation-already/155891
https://us.forums.blizzard.com/en/overwatch/t/why-does-overwatch-seem-to-have-such-awful-netcode/297542
https://us.forums.blizzard.com/en/overwatch/t/tim-ford-2019-intimately-details-ow-enginenetcode/612832
https://us.forums.blizzard.com/en/overwatch/t/game-architecture-and-netcode-gdc/301462
https://compete.playstation.com/en-us/all/articles/why-is-rollback-netcode-better-for-fighting-games
https://en.wikipedia.org/wiki/GGPO
https://en.wikipedia.org/wiki/Client-side_prediction
https://en.wikipedia.org/wiki/Optimistic_concurrency_control
https://en.wikipedia.org/wiki/Multiversion_concurrency_control
https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
https://en.wikipedia.org/wiki/Operational_transformation
https://en.wikipedia.org/wiki/Vector_clock
https://en.wikipedia.org/wiki/Lamport_timestamp
https://en.wikipedia.org/wiki/Optimistic_replication
https://en.wikipedia.org/wiki/Eventual_consistency
https://en.wikipedia.org/wiki/Compensating_transaction
https://en.wikipedia.org/wiki/Consistency_model
https://en.wikipedia.org/wiki/State_machine_replication
https://www.snapnet.dev/blog/netcode-architectures-part-3-snapshot-interpolation/
https://snapnet.dev/docs/unreal-engine-sdk/manual/server-rewind/
https://www.teamfortress.tv/post/1021311/netcode-source-vs-ggpo-style-rollback
https://outof.pizza/posts/rollback/
https://docs.coherence.io/manual/advanced-topics/competitive-games/determinism-prediction-rollback
https://medium.com/@david.dehaene/delta-rollback-new-optimizations-for-rollback-netcode-7d283d56e54b
https://forums.supercombo.gg/d/28-rollback-netcode-what-it-is-how-to-use-it
https://antsstyle.medium.com/netcode-in-games-an-explanation-and-why-rollback-is-overrated-b76ee54ac2bb
https://www.resetera.com/threads/how-rollback-and-delay-based-netcode-works-in-fighting-games.148478/
https://www.superjumpmagazine.com/rollback-netcode/
https://www.gameshub.com/news/features/rollback-netcode-for-fighting-games-what-is-it-26176/
http://mikezsez.blogspot.com/2019/11/lets-talk-about-rollbacks.html
https://medium.com/@PanoVerse/implementation-of-server-side-rewind-in-unreal-engine-a-deep-dive-into-lag-compensation-ae565ec4af36
https://systemdr.substack.com/p/udp-vs-tcp-in-multiplayer-gaming
https://github.com/marcohenning/ue5-server-side-rewind
https://outscal.com/blog/lag-compensation-in-fps-games-the-hidden-systems-making-your-shots-count
https://www.gamedeveloper.com/design/video-how-i-overwatch-s-i-gameplay-architecture-creates-variety
https://www.gamedev.net/forums/topic/701388-overwatch-predicted-rockets-analysis/
https://yahnd.com/theater/r/youtube/W3aieHjyNvw/
https://news.ycombinator.com/item?id=19915910
https://news.ycombinator.com/item?id=21378858
https://www.huangwm.com/wp/archives/2610
https://www.mo4tech.com/overwatchs-architecture-is-designed-to-synchronize-with-the-web.html
https://github.com/ThusWroteNomad/GameNetworkingResources/blob/master/README.md
https://github.com/MongkonEiadon/Awesome-Game-Networking
https://github.com/ErnWong/crystalorb
https://www.gamedev.net/forums/topic/705066-combining-server-reconciliation-and-client-side-prediction/
https://www.gamedev.net/forums/topic/697159-client-side-prediction-and-server-reconciliation/
https://www.gamedev.net/forums/topic/713182-is-it-possible-to-have-client-prediction-without-resimulation/
https://ruoyusun.com/2019/09/21/game-networking-5.html
https://docs.unity3d.com/Packages/com.unity.netcode@1.4/manual/intro-to-prediction.html
https://www.gamedeveloper.com/programming/unet-unity-5-networking-tutorial-part-2-of-3---client-side-prediction-and-server-reconciliation
https://docs.coherence.io/manual/authority/server-authoritative-setup
https://www.maintanksoftware.com/article/rollback1.html
https://gitlab.com/BimDav/delta-rollback
https://godotengine.org/asset-library/asset/3107
https://easel.games/docs/learn/multiplayer/rollback-netcode
https://crdt.tech/
https://crdt.tech/implementations
https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
https://automerge.org/
https://automerge.org/blog/automerge-2/
https://automerge.github.io/
https://github.com/automerge/automerge
https://yjs.dev/
https://www.inkandswitch.com/peritext/
https://www.inkandswitch.com/peritext/static/cscw-publication.pdf
https://www.inkandswitch.com/essay/local-first/
https://www.inkandswitch.com/newsletter/dispatch-011/
https://tonsky.me/blog/crdt-filesync/
https://arxiv.org/html/2409.14252v1
https://arxiv.org/abs/2409.14252
https://martin.kleppmann.com/2025/03/30/eg-walker-collaborative-text.html
https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html
https://martin.kleppmann.com/2016/11/15/goto-berlin.html
https://martin.kleppmann.com/2016/11/03/code-mesh.html
https://martin.kleppmann.com/2022/03/28/rainbowfs-workshop.html
https://martin.kleppmann.com/papers/move-op.pdf
https://martin.kleppmann.com/papers/local-first.pdf
https://www.localfirst.fm/4/transcript
https://www.localfirst.fm/14
https://www.localfirstnews.com/2024-09-05/
https://nurkiewicz.com/2022/04/crdt.html
https://learning.acm.org/techtalks/softwareautomerge
https://blog.acolyer.org/2019/11/20/local-first-software/
https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/
https://inria.hal.science/hal-00932836/document
https://redis.io/blog/diving-into-crdts/
https://pasksoftware.com/crdts/
https://dl.acm.org/doi/10.1145/3695249
https://dev.to/adityasajoo/understanding-conflict-free-replicated-data-types-57jc
https://ably.com/blog/crdts-distributed-data-consistency-challenges
https://zed.dev/blog/crdts
https://www.hivemq.com/blog/decentralized-collaborative-text-editor-using-mqtt-crdts/
https://dspace.mit.edu/bitstream/handle/1721.1/147641/3555644.pdf
https://www.mdpi.com/2220-9964/14/12/468
https://loro.dev/blog/loro-richtext
https://mattweidner.com/2024/06/04/server-architectures.html
https://mattweidner.com/2025/05/21/text-without-crdts.html
https://mattweidner.com/2023/09/26/crdt-survey-4.html
https://mattweidner.com/2023/09/26/crdt-survey-1.html
https://mattweidner.com/
https://en.wikipedia.org/wiki/Operational_transformation
https://medium.com/coinmonks/operational-transformations-as-an-algorithm-for-automatic-conflict-resolution-3bf8920ea447
https://www.loremine.com/blogs/operational-transformation-algorithm-behind-google-docs
https://programmingappliedai.substack.com/p/how-google-docs-handles-real-time
https://simranchawla.com/operational-transformation-algorithm/
https://systemdr.substack.com/p/crdts-vs-operational-transformation
https://dev.to/puritanic/building-collaborative-interfaces-operational-transforms-vs-crdts-2obo
https://hackernoon.com/crdts-vs-operational-transformation-a-practical-guide-to-real-time-collaboration
https://medium.com/@raphlinus/towards-a-unified-theory-of-operational-transformation-and-crdt-70485876f72f
https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/
https://dl.acm.org/doi/10.1145/3375186
https://arxiv.org/pdf/1905.01517
https://dl.acm.org/doi/10.1145/3392825
https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/
https://www.figma.com/blog/how-figmas-multiplayer-technology-works/
https://www.figma.com/blog/making-multiplayer-more-reliable/
https://www.figma.com/blog/building-figmas-code-layers/
https://liveblocks.io/blog/understanding-sync-engines-how-figma-linear-and-google-docs-work
https://nerookwa.substack.com/p/47-figma-why-multiplayer-is-hard
https://hex.tech/blog/a-pragmatic-approach-to-live-collaboration/
https://rocicorp.dev/blog/ready-player-two
https://doc.replicache.dev/concepts/how-it-works
https://replicache.dev/
https://tushar.ai/posts/replicache/
https://stack.convex.dev/object-sync-engine
https://stack.convex.dev/sync
https://docs.pierre.co/changelog/local-first
https://microservices.io/patterns/data/saga.html
https://learn.microsoft.com/en-us/azure/architecture/patterns/saga
https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction
https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/saga/saga
https://temporal.io/blog/compensating-actions-part-of-a-complete-breakfast-with-sagas
https://temporal.io/blog/mastering-saga-patterns-for-distributed-transactions-in-microservices
https://www.baeldung.com/cs/saga-pattern-microservices
https://www.geeksforgeeks.org/system-design/saga-design-pattern/
https://orkes.io/blog/compensation-transaction-patterns/
https://vasters.com/archive/Sagas.html
https://blog.jonathanoliver.com/idempotency-patterns
https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/optimistic-concurrency
https://learn.microsoft.com/en-us/ef/core/saving/concurrency
https://aws.amazon.com/blogs/database/concurrency-control-in-amazon-aurora-dsql/
https://people.eecs.berkeley.edu/~fox/summaries/database/optimistic_concurrency.html
https://enterprisecraftsmanship.com/posts/optimistic-locking-automatic-retry/
https://docs.oracle.com/en/database/oracle/oracle-database/26/jsnvu/using-optimistic-concurrency-control-duality-views.html
https://celerdata.com/glossary/multiversion-concurrency-control
https://www.postgresql.org/docs/current/mvcc-intro.html
https://www.postgresql.org/docs/7.1/mvcc.html
https://sookocheff.com/post/time/vector-clocks/
https://medium.com/@sanjana.kansal13/mastering-consistency-in-distributed-systems-lamport-clocks-vector-clocks-and-real-world-8afc3b0cef26
https://www.geeksforgeeks.org/computer-networks/vector-clocks-in-distributed-systems/
https://aeron.io/docs/distributed-systems-basics/logical-clocks/
https://amturing.acm.org/p558-lamport.pdf
https://pages.cs.wisc.edu/~remzi/Classes/739/Fall2015/Papers/saito-optimistic-05.pdf
https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-2003-60.pdf
https://www.cs.hmc.edu/~geoff/replqos.html
https://www.mydistributed.systems/2022/02/eventual-consistency-part-1.html
https://academy.realm.io/posts/conflict-resolution-for-eventual-consistency-goto/
https://people.eecs.berkeley.edu/~brewer/cs262b/update-conflicts.pdf
https://davewentzel.com/content/handling-conflicts-with-eventual-consistency-and-distributed-systems/
https://ersantana.com/system-design/martin-kleppmann-distributed-systems-lecture/8_1_collaboration_software
https://git-scm.com/docs/git-merge
https://git-scm.com/docs/merge-strategies
https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
https://blog.git-init.com/the-magic-of-3-way-merge/
https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts
https://www.atlassian.com/git/tutorials/using-branches/git-merge
https://www.atlassian.com/git/tutorials/using-branches/merge-strategy
https://github.com/rinadelph/Agent-MCP
https://github.com/Dicklesworthstone/mcp_agent_mail
https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp
https://github.com/LNS2905/mcp-beads-village
https://github.com/agent0ai/agent-zero/issues/912
https://github.com/lastmile-ai/mcp-agent
https://arxiv.org/html/2501.06322v1
https://www.arxiv.org/pdf/2602.07072
https://www.ibm.com/think/topics/multi-agent-collaboration
https://kodexolabs.com/multi-agent-systems-solving-complex-problems/
https://www.kubiya.ai/blog/multi-agent-collaboration
https://aclanthology.org/2025.acl-long.421.pdf
https://www.salesforce.com/agentforce/ai-agents/multi-agent-collaboration/
https://www.arionresearch.com/blog/ai-agent-collaboration-models-how-different-specialized-agents-can-work-together
https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/
https://blogs.oracle.com/developers/comparing-file-systems-and-databases-for-effective-ai-agent-memory-management
https://xzos.net/en/blog/optimistic-fallible-queue-in-ai-era/
https://towardsai.net/p/machine-learning/safer-filesystem-tools-for-ai-agents-using-mcp-and-s3
https://medium.com/data-science/delta-lake-optimistic-concurrency-control-to-lock-or-not-to-lock-9b6458821a52
https://ris.utwente.nl/ws/files/6145230/mullender85distributed.pdf
https://medium.com/@armironenko/distributed-systems-logical-time-explained-5f97949f180f
https://www.educative.io/courses/distributed-systems-practitioners/vector-clocks
https://link.springer.com/content/pdf/10.1007/bfb0026751.pdf
https://medium.com/@muthoni-wanyoike/resilience-and-fault-tolerance-building-multi-agent-systems-that-endure-aac92caed5f4
https://decentralizedthoughts.github.io/2019-10-25-flavours-of-state-machine-replication/
http://www.gamesurge.com/pc/interviews/netcode.shtml
https://github.com/Glitshy/Lag-Compensation
https://github.com/OttoX/Fomalhaut
https://docs.unity3d.com/Packages/com.unity.netcode@1.4/changelog/CHANGELOG.html
https://docs.unity3d.com/Packages/com.unity.netcode@1.3/manual/ghost-snapshots.html
https://medium.com/@geretti/netcode-series-part-2-data-channels-c12e9a238800
```

---

## Open Questions

1. **What's the right granularity for conflict detection in agent-edited files?** Character-level (CRDT territory), line-level (git diff), section-level (Figma's property-level analogue), or file-level? The answer probably varies by file type — code might need line-level, prose documents section-level, config files key-level.

2. **Can agent "plans" be replayed against updated state?** The GGPO insight requires deterministic re-simulation. If an agent's plan was "add error handling to the auth module," that plan might survive a state change. But if the auth module was restructured, the plan itself is invalidated. How do we detect plan-level staleness vs. just execution-level staleness?

3. **What's the practical conflict rate for multi-agent work?** If agents rarely touch the same files (like Figma users rarely touch the same objects), simple last-writer-wins or file-level locking is sufficient. If they frequently collide, we need the heavier machinery. The answer determines which point on the delay-vs-rollback spectrum is optimal.

4. **Should Sherpa implement advisory file reservations (like MCP Agent Mail)?** The lease-with-TTL pattern is lightweight and prevents most conflicts without blocking agents. But it requires agents to check reservations before starting work, which adds latency. Is the conflict rate high enough to justify it?

5. **How does "favor the writer" interact with the Judge role?** In the current Planner/Worker/Judge model, the Judge gates merges. If we "favor the writer" by default, the Judge only needs to intervene for true semantic conflicts. What's the threshold for escalation vs. auto-merge?

6. **Can three-way merge work for prose documents?** Git's three-way merge works well for code (line-oriented, structurally independent). Prose has semantic dependencies across paragraphs. Two agents adding adjacent paragraphs might produce text that reads incoherently even though the merge has no textual conflicts. Is there a "semantic three-way merge" concept?

7. **What would a "staleness budget" look like?** Games limit the rollback window (100-150ms). What's the equivalent for agents? "If the file you're editing hasn't been modified in the last N minutes, you're safe to proceed without checking." What's N? It probably depends on how many other agents are active and what they're working on.

8. **How does the delta rollback optimization apply to agent state snapshots?** Instead of saving full file state at "session start," agents could track only the files they read and their hashes. At commit time, check only those specific file hashes. Git already does this implicitly during rebase — it only flags conflicts in files that both branches touched.
