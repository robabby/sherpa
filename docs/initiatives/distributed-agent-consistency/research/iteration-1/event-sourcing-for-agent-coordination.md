# Event Sourcing for AI Agent Coordination

**Research iteration:** 1
**Date:** 2026-03-11
**Focus:** Can event sourcing (append-only event logs) replace mutable shared state for multi-agent coordination in Sherpa?

---

## Key Discoveries

### 1. Event Sourcing Fundamentals

- **Core idea:** Instead of storing current state in a mutable store, record every state change as an immutable, append-only event. Current state is derived by replaying the event log. (Greg Young, "CQRS Documents", 2010; Martin Fowler, "Event Sourcing" pattern)
- **The event store is the system of record.** Events are immutable facts about what happened. The "current state" is a derived, disposable projection -- it can always be reconstructed from the log. (https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
- **CQRS (Command Query Responsibility Segregation)** is the natural companion: commands write events to the log, queries read from materialized projections. Write path and read path are completely separated. (Greg Young, "CQRS Documents", https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf)
- **Core guarantees:** (1) Events are immutable -- never updated, only appended. (2) Append-only operations avoid write conflicts and locking. (3) Full audit trail is inherent. (4) Any past state can be reconstructed by replaying events up to that point.
- **Event ordering** is critical. Within a single aggregate/entity stream, events must be strictly ordered. Across aggregates, eventual consistency is acceptable. Multi-threaded writers need either timestamps, sequence numbers, or optimistic concurrency (reject if sequence number already exists). (https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
- **Compensating events** replace updates/deletes. You never modify or remove an event -- you append a new event that reverses the effect (e.g., "ProposalDeclined" compensates "ProposalSubmitted").
- **Microsoft's caution is important:** "Event sourcing is a complex pattern that permeates through the entire architecture... There is a high cost to migrate to or from an event sourcing system." This is a serious consideration for Sherpa -- adopting event sourcing is a one-way door. (https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)

### 2. Event Sourcing for Collaboration

- **Google Docs / Operational Transformation (OT):** Google Docs uses an operation log internally. Every keystroke/edit is an operation appended to a log. The server maintains a canonical operation sequence and transforms concurrent operations to resolve conflicts. This IS event sourcing -- the document state is derived from replaying the operation log. The key difference from "pure" event sourcing: OT requires a central server to impose total ordering on operations. (Google, "Realtime API" documentation; Sun et al., "Operational Transformation" papers)
- **Figma:** Uses a CRDT-inspired approach with operation logs. Every design action is captured as an operation, broadcast to peers, and the current canvas state is derived from replaying all operations. Figma's CTO Evan Wallace described their approach as a custom CRDT that handles Figma's specific domain objects. (Evan Wallace, "How Figma's multiplayer technology works", https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Key pattern for Sherpa:** All major collaborative editing systems use append-only operation/event logs as their source of truth. Mutable state is always a derived projection. The debate is about conflict resolution strategy (OT vs CRDT vs last-writer-wins), not about whether to use event logs.

### 3. Git as Event Sourcing

- **Git commits ARE an append-only event log.** Each commit is an immutable event recording a state transition. The working directory is a materialized projection of the latest commit. Any historical state can be reconstructed by checking out a past commit. The reflog is a meta-event-log tracking where HEAD has been.
- **Git's model maps cleanly to event sourcing concepts:**
  - Event store = `.git/objects` (immutable content-addressable store)
  - Event stream = branch history (linked list of commits)
  - Projection = working directory (materialized current state)
  - Snapshot = each commit IS a snapshot (git stores full tree snapshots, not diffs, despite common misconception)
  - Compensating event = revert commit
- **Where git diverges from event sourcing:** Git uses content-addressable storage (SHA hashing), not sequential event IDs. Git supports branching (multiple concurrent event streams that can be merged). Git stores snapshots, not deltas -- it is optimized for reconstructing any state in O(1) rather than replaying O(n) events. Packfiles compress historical data using deltas, but this is an optimization, not the model.
- **Merge = conflict resolution policy.** Git's three-way merge is one conflict resolution strategy. Rebasing is another (replay my events on top of yours). Both are relevant to multi-agent coordination -- when Agent A and Agent B both write events concurrently, what is the resolution strategy?
- **Critical insight for Sherpa:** Sherpa already uses git. The question is whether to add ANOTHER event log layer on top of git, or to formalize git commits themselves as the event stream. The overhead of a second event log must justify itself -- git already provides immutability, full history, branching, and conflict resolution.

### 4. Event Sourcing in AI/Agent Systems

- **LangGraph checkpointing:** LangGraph (by LangChain) uses state checkpointing for multi-step agent workflows. Each node execution produces a checkpoint -- a snapshot of the full graph state. This is closer to snapshot-based persistence than event sourcing. Checkpoints can be replayed to resume from any point. LangGraph stores checkpoints in a persistence backend (SQLite, Postgres). (https://langchain-ai.github.io/langgraph/concepts/persistence/)
- **LangGraph's state model:** State is a mutable TypedDict/Pydantic model that gets overwritten at each step. Channel "reducers" can accumulate values (e.g., append to a message list), which is event-sourcing-adjacent -- the message list IS an append-only log of agent interactions. But the overall model is snapshot-based, not event-sourced. (https://langchain-ai.github.io/langgraph/concepts/low_level/)
- **CrewAI:** Uses a task-based model where agents are assigned tasks with explicit inputs/outputs. State is passed between agents as task results. No event sourcing -- state is mutable and passed forward. (https://docs.crewai.com/)
- **AutoGen (Microsoft):** Multi-agent conversation framework where agents communicate via messages. The message history IS an append-only event log -- agents make decisions based on the full conversation history. This is implicit event sourcing -- the conversation log is the source of truth, and each agent's "state" is derived from reading the log. (https://microsoft.github.io/autogen/)
- **Semantic Kernel (Microsoft):** Has an explicit "process framework" that supports event-driven orchestration. Processes emit events that trigger steps. This is event-driven architecture, not quite event sourcing (events trigger actions but aren't necessarily the system of record). (https://learn.microsoft.com/en-us/semantic-kernel/frameworks/process/process-framework)
- **Key finding:** No major AI agent framework uses formal event sourcing as its coordination primitive. LangGraph uses snapshots. AutoGen uses implicit event logs (conversation history). CrewAI uses mutable task results. This is an open design space -- Sherpa could be the first framework to make event sourcing the explicit coordination model.

### 5. Append-Only Logs on a Filesystem

- **Single append-only file (JSONL):** Each event is a JSON line appended to a `.jsonl` file. Simple, human-readable, git-friendly (append-only changes produce clean diffs). Concurrency risk: two processes appending simultaneously can corrupt the file. Mitigation: file locking (`flock` on Unix), or one-writer-many-readers pattern.
  ```
  {"ts":"2026-03-11T10:00:00Z","type":"proposal.submitted","agent":"planner","data":{"slug":"event-sourcing"}}
  {"ts":"2026-03-11T10:05:00Z","type":"proposal.approved","agent":"reviewer","data":{"slug":"event-sourcing"}}
  {"ts":"2026-03-11T10:10:00Z","type":"task.started","agent":"worker","data":{"slug":"event-sourcing","task":"research"}}
  ```
- **One file per event:** Each event is a separate file, named with a sortable identifier (e.g., `001-proposal-submitted.json`, or timestamp-based `20260311T100000Z-proposal-submitted.json`). Eliminates append concurrency issues -- file creation is atomic on most filesystems. Downside: directory bloat with many events, slower to replay (must read/sort many files).
- **Hybrid: one file per aggregate stream:** Each initiative/entity gets its own JSONL file (e.g., `events/event-sourcing.jsonl`). Limits concurrency to same-aggregate writes. This maps naturally to Sherpa's initiative-per-directory structure.
- **Filesystem concurrency realities:** `O_APPEND` flag on POSIX systems guarantees atomic appends for writes under `PIPE_BUF` (typically 4096 bytes on Linux, 512 bytes guaranteed by POSIX). A single JSONL event line under 512 bytes IS atomically appendable without locking on POSIX systems. This is a critical practical fact -- it means concurrent agent appends to the same log file are safe if events are small enough. (POSIX.1-2017, https://pubs.opengroup.org/onlinepubs/9699919799/functions/write.html)
- **Practical recommendation for Sherpa:** JSONL files per initiative stream, with events kept under 512 bytes, leveraging POSIX atomic append guarantees. This gives concurrent-safe event sourcing with zero infrastructure beyond the filesystem.

### 6. Event Sourcing vs CRDTs

- **CRDTs (Conflict-free Replicated Data Types):** Data structures that can be independently modified on different replicas and always converge to the same state when merged, without coordination. Two types: state-based (merge state snapshots) and operation-based (merge operation logs). (Shapiro et al., "Conflict-free Replicated Data Types", 2011, https://hal.inria.fr/inria-00609399/document)
- **Operation-based CRDTs ARE event sourcing.** An op-based CRDT maintains a log of operations (events) that are broadcast to all replicas. Each replica applies operations in causal order. The data structure guarantees convergence regardless of operation ordering (within causal constraints). This is exactly event sourcing with a specific conflict resolution guarantee.
- **Key difference:** Event sourcing typically assumes a single authoritative event stream with total ordering. CRDTs explicitly handle concurrent, unordered events across multiple writers. For multi-agent systems where agents write concurrently, CRDTs provide stronger guarantees.
- **When to choose event sourcing:** Single-writer or serializable writes. Need for total ordering. Complex business logic where conflict resolution depends on domain semantics. Audit trail is primary goal.
- **When to choose CRDTs:** Multiple concurrent writers. Network partitions or offline operation. Convergence is more important than ordering. Simple data types (counters, sets, registers, sequences).
- **Complementary, not competing:** The best design may be event sourcing for the coordination log (what happened) with CRDT-like merge semantics for the state projections (what is the current state when agents disagree). Sherpa could use append-only event logs as the source of truth, and CRDT merge rules for resolving the inevitable concurrency conflicts.
- **SQLite + CRDTs:** The `sqlite-agentic-state` sibling initiative is exploring SQLite-backed state with cr-sqlite (https://vlcn.io/docs/cr-sqlite/intro) providing CRDT semantics. This pairs naturally with event sourcing: cr-sqlite handles the merge semantics, and the event log provides the audit trail and replayability.

### 7. Practical Concerns

- **Event log compaction:** Over time, event logs grow unboundedly. Compaction strategies: (1) Snapshotting -- periodically write the current projected state, allowing old events to be archived. (2) Tombstoning -- mark events as superseded but keep them. (3) Log segmentation -- rotate log files by time period.
- **Snapshotting for performance:** Replay cost is O(n) where n = number of events. Snapshots reduce this to O(1) for the snapshot + O(m) for events since the snapshot. For Sherpa initiatives, event counts will likely stay small (tens to hundreds per initiative), making snapshotting unnecessary in the near term.
- **Replay performance:** For filesystem-based JSONL, reading a few hundred lines is trivially fast. Performance only becomes a concern at thousands+ of events per stream, which is unlikely for Sherpa's initiative-based model.
- **Failure modes of event sourcing:**
  - **Schema evolution:** Events are immutable, but event schemas change over time. Old events must remain readable. Mitigation: version field in every event, upcasting old events to new schema on read.
  - **Projection bugs:** If the projection logic has a bug, the projected state is wrong -- but the event log is correct. Fixing the bug and replaying fixes the state. This is a major advantage over mutable state (where bugs corrupt the source of truth).
  - **Event ordering violations:** If events arrive out of order, projections can be inconsistent. Mitigation: sequence numbers or vector clocks.
  - **Unbounded growth:** Without compaction, logs grow forever. For Sherpa's scale, this is not an immediate concern.
  - **Eventual consistency confusion:** Agents reading stale projections may make decisions based on outdated state. This is the fundamental trade-off: event sourcing trades strong consistency for auditability and conflict-freedom.

### 8. Activity Logs as Proto-Event-Sourcing

- **Sherpa's current `activity.md` files** are already proto-event-sourcing. Each line records something that happened with a date. The structure is: `- YYYY-MM-DD: <description of what happened>`.
- **What's missing to make them formal event logs:**
  1. **Structured event types:** Current entries are free-text prose. Formal events need a type field (`initiative.created`, `proposal.submitted`, `task.completed`).
  2. **Machine-readable format:** Markdown prose can't be reliably parsed. Events need structured format (JSONL, YAML, or at minimum a parseable markdown convention).
  3. **Agent attribution:** Current entries don't record which agent wrote them. Multi-agent coordination requires knowing who did what.
  4. **Timestamps with precision:** Date-level granularity (`2026-03-11`) is insufficient for ordering events within a session. Need ISO 8601 with time (`2026-03-11T10:05:00Z`).
  5. **Separation of log and projection:** Current activity.md conflates the event log (what happened) with the narrative (why it matters). Formal event sourcing separates these -- the log is machine-readable events, the narrative is a derived projection.
- **Migration path:** Keep `activity.md` as a human-readable projection. Add a machine-readable event log alongside it (e.g., `events.jsonl` per initiative). The activity.md becomes a "materialized view" generated from the event log, or maintained separately as a human-authored narrative layer.

---

## Implications for Sherpa

### The Core Insight

Sherpa's current model (mutable markdown files + YAML frontmatter) is a CRUD model -- agents read current state, modify it, write it back. This creates classic distributed systems problems: lost updates, stale reads, merge conflicts. Event sourcing solves these at the primitive level by making writes append-only (no conflicts) and state derived (always reconstructable).

### What Event Sourcing Would Look Like in Sherpa

1. **Initiative event streams:** Each initiative gets an `events.jsonl` file. All state changes are recorded as events:
   ```jsonl
   {"seq":1,"ts":"2026-03-11T10:00:00Z","type":"initiative.created","agent":"planner","data":{"slug":"event-sourcing","spawned_from":"distributed-agent-consistency"}}
   {"seq":2,"ts":"2026-03-11T10:05:00Z","type":"proposal.drafted","agent":"planner","data":{"targets":["docs/initiatives/event-sourcing/proposal.md"]}}
   {"seq":3,"ts":"2026-03-11T10:30:00Z","type":"proposal.submitted","agent":"planner","data":{"status":"pending"}}
   {"seq":4,"ts":"2026-03-11T11:00:00Z","type":"proposal.approved","agent":"reviewer","data":{"status":"approved"}}
   {"seq":5,"ts":"2026-03-11T11:05:00Z","type":"task.created","agent":"planner","data":{"task_id":"research-es","title":"Research event sourcing"}}
   ```

2. **Derived state files:** `proposal.md` frontmatter (status, dates) would be generated by projecting the event stream, not edited directly. The YAML frontmatter becomes a materialized view.

3. **Agent coordination via events:** Instead of agents reading/writing mutable files, agents append events to streams. A coordination layer reads events and updates projections. Agents that need current state read the projections (or replay the events).

4. **Git integration:** Events are committed to git normally. Git provides the durable storage, branching (for initiative worktrees), and history. The JSONL event files are git-friendly (append-only changes produce minimal, clean diffs).

### Why This Might Be Right for Sherpa

- **Multi-agent concurrency is the core problem.** When multiple Claude instances (via worktrees, MCP, or parallel sessions) coordinate on initiatives, mutable state creates race conditions. Append-only events eliminate write conflicts.
- **Audit trail is a feature, not overhead.** Sherpa's governance model (proposals, approvals, reviews) naturally wants a complete history of what happened and who decided what.
- **Filesystem-native implementation is feasible.** JSONL files with POSIX atomic appends require no database, no server, no infrastructure beyond what Sherpa already has.
- **Git already provides the hard parts.** Immutable storage, branching, history, conflict resolution for merges -- git does all of this. Event sourcing on the filesystem layers semantic event types on top of git's structural model.

### Why This Might Be Wrong for Sherpa

- **Complexity budget.** Event sourcing is a pervasive architectural decision. It adds conceptual overhead for every agent interaction. Sherpa's current simplicity (read file, edit file) is a strength.
- **Event schema evolution.** Defining and evolving event types is ongoing work. Mutable markdown files are schema-free and flexible.
- **Projection maintenance.** Someone has to build and maintain the code that turns events into readable state. With mutable files, the file IS the state -- no projection layer needed.
- **Small scale doesn't justify the complexity.** Microsoft explicitly warns that event sourcing is for systems needing "hyper-scale or performance." Sherpa's initiative volumes are small.
- **Two sources of truth risk.** If agents can edit both the event log AND the projected files, consistency is worse, not better. The system must enforce write-through-events-only discipline.

### Recommended Approach: Incremental Event Sourcing

Rather than going full event sourcing, adopt it incrementally:

1. **Phase 1: Structured activity logs.** Formalize `activity.md` into structured events with types, timestamps, and agent attribution. Keep it human-readable (markdown table or structured markdown) but machine-parseable. This tests the pattern without architectural commitment.

2. **Phase 2: Event-sourced initiative state.** Add `events.jsonl` per initiative. Derive `proposal.md` frontmatter (status, dates) from events. Keep `proposal.md` body as human-authored content (not event-sourced). This proves the event-sourcing model for the governance workflow.

3. **Phase 3: Agent coordination protocol.** Define the event vocabulary for multi-agent coordination: task claims, completions, reviews, approvals. Build the projection layer that turns events into actionable state for agents. This is the full commitment point.

4. **Phase 4 (if needed): CRDT merge semantics.** If concurrent agent writes cause ordering issues, add CRDT-like merge rules for the event streams. This is where the `sqlite-agentic-state` and `distributed-agent-consistency` initiatives converge.

---

## Sources

### Primary Sources (with content verified)

- **Microsoft Azure Architecture Center: Event Sourcing Pattern** -- Comprehensive explanation of event sourcing pattern, when to use it, issues and considerations, with examples.
  https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing

### Canonical References (not fetched this session, high confidence in content from prior knowledge)

- **Martin Fowler: Event Sourcing** -- Foundational pattern description, defines the pattern in the enterprise application architecture context.
  https://martinfowler.com/eaaDev/EventSourcing.html

- **Greg Young: CQRS Documents (2010)** -- The original CQRS + Event Sourcing paper. Defines event stores, projections, snapshots, aggregate event streams.
  https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf

- **Martin Fowler: CQRS** -- Pattern description for Command Query Responsibility Segregation, the natural companion to event sourcing.
  https://martinfowler.com/bliki/CQRS.html

- **EventStoreDB: Event Sourcing Basics** -- Event sourcing explained by the team that built a purpose-built event store database.
  https://www.eventstore.com/event-sourcing

- **Greg Young: "Event Sourcing" talk (2014)** -- Influential conference talk explaining event sourcing with practical examples.
  https://www.youtube.com/watch?v=8JKjvY4etTY

### AI/Agent Framework References

- **LangGraph Persistence / Checkpointing** -- How LangGraph handles state persistence via checkpoints (snapshot model, not event sourcing).
  https://langchain-ai.github.io/langgraph/concepts/persistence/

- **LangGraph Low-Level Concepts** -- State channels, reducers, message accumulation -- the event-sourcing-adjacent parts.
  https://langchain-ai.github.io/langgraph/concepts/low_level/

- **LangGraph Multi-Agent Workflows** -- Coordination patterns for multi-agent systems in LangGraph.
  https://blog.langchain.dev/langgraph-multi-agent-workflows/

- **Microsoft AutoGen** -- Multi-agent conversation framework where the conversation log serves as implicit event source.
  https://microsoft.github.io/autogen/

- **Microsoft Semantic Kernel Process Framework** -- Event-driven orchestration for AI workflows.
  https://learn.microsoft.com/en-us/semantic-kernel/frameworks/process/process-framework

- **CrewAI Documentation** -- Task-based multi-agent framework (mutable state passing, no event sourcing).
  https://docs.crewai.com/

### Collaborative Editing / CRDTs

- **Figma: "How Figma's multiplayer technology works"** -- Evan Wallace on operation-based collaboration, CRDT-inspired approach.
  https://www.figma.com/blog/how-figmas-multiplayer-technology-works/

- **Shapiro et al.: "Conflict-free Replicated Data Types" (2011)** -- The foundational CRDT paper. Defines state-based and operation-based CRDTs.
  https://hal.inria.fr/inria-00609399/document

- **cr-sqlite (Vulcan Labs)** -- CRDTs for SQLite, enabling multi-writer merge-friendly databases. Relevant to the sqlite-agentic-state sibling initiative.
  https://vlcn.io/docs/cr-sqlite/intro

- **Kleppmann et al.: "Making CRDTs Byzantine Fault Tolerant" (2022)** -- Extends CRDTs for adversarial environments, relevant to trust in multi-agent systems.
  https://martin.kleppmann.com/papers/bft-crdt-papoc22.pdf

- **Martin Kleppmann: "Designing Data-Intensive Applications"** -- Chapter 5 (Replication), Chapter 11 (Stream Processing) directly relevant to event sourcing and CRDTs.
  https://dataintensive.net/

### Git as Event Sourcing

- **Git Internals: The Git Object Model** -- How git stores objects (content-addressable, immutable), relevant to understanding git as an event store.
  https://git-scm.com/book/en/v2/Git-Internals-Git-Objects

- **Git Internals: Packfiles** -- How git compresses historical data, relevant to event log compaction.
  https://git-scm.com/book/en/v2/Git-Internals-Packfiles

### POSIX / Filesystem

- **POSIX.1-2017: write()** -- Atomic append guarantees for O_APPEND, relevant to concurrent JSONL writes.
  https://pubs.opengroup.org/onlinepubs/9699919799/functions/write.html

### Additional Links for Future Research

- **Versioning in Event Sourced Systems (Greg Young)** -- Handling schema evolution in event sourcing.
  https://leanpub.com/esversioning

- **Event Modeling** -- A method for designing event-sourced systems visually.
  https://eventmodeling.org/

- **Marten (Event Sourcing for .NET)** -- Practical event sourcing library, good for implementation patterns.
  https://martendb.io/

- **Axon Framework** -- Java framework for CQRS + Event Sourcing, good for pattern reference.
  https://developer.axoniq.io/axon-framework

- **Apache Kafka** -- Distributed append-only log, the infrastructure-scale version of JSONL event files.
  https://kafka.apache.org/

- **Pat Helland: "Immutability Changes Everything" (2015)** -- Foundational paper on why append-only/immutable data models are superior for distributed systems.
  https://queue.acm.org/detail.cfm?id=2745385

- **NATS JetStream** -- Lightweight distributed event streaming, potential infrastructure alternative.
  https://docs.nats.io/nats-concepts/jetstream

- **Datomic** -- Immutable database that implements event-sourcing-like semantics (Rich Hickey).
  https://www.datomic.com/

- **SQLite WAL Mode** -- Write-Ahead Logging in SQLite, relevant to append-only patterns in SQLite-based state.
  https://www.sqlite.org/wal.html

- **Yjs** -- CRDT library for collaborative editing, relevant to real-time agent collaboration.
  https://yjs.dev/

- **Automerge** -- CRDT library with JSON document model, directly relevant to CRDT-based agent state.
  https://automerge.org/

- **Electric SQL** -- Active-active sync for Postgres/SQLite using CRDTs.
  https://electric-sql.com/

---

## Open Questions

1. **Should git commits BE the events, or should events be a layer on top of git?** Git already provides immutability, history, and branching. Adding JSONL event files inside git is "event sourcing inside event sourcing." Is the semantic layer (typed events with agent attribution) worth the duplication? Or should we just formalize git commit messages as structured events?

2. **What is the right event granularity for agent coordination?** Too fine-grained (every file read, every LLM call) creates noise. Too coarse-grained (only initiative state transitions) misses coordination signals. Where is the sweet spot?

3. **How does the MCP coordination layer relate to event sourcing?** The `mcp-coordination-layer` sibling initiative is exploring MCP as a replication layer. An MCP server could serve as the event store, accepting event writes from agents and serving projections. This would unify the MCP and event sourcing initiatives.

4. **What is the event vocabulary for Sherpa?** Defining the taxonomy of events (initiative.created, proposal.submitted, task.claimed, task.completed, review.requested, review.completed, etc.) is a design task that will shape the entire framework. This vocabulary IS the coordination protocol.

5. **How do we handle "narrative" state that isn't event-sourced?** Proposal bodies, research documents, and code are human-authored content that doesn't fit the event model. Event sourcing works for structured state transitions (status, assignments, approvals) but not for prose content. The system needs a clear boundary between event-sourced state and file-sourced content.

6. **Can we get the audit benefits without the full event sourcing commitment?** Structured activity logs (Phase 1 in the recommended approach) might provide 80% of the value at 20% of the complexity. The question is whether the remaining 20% (derived state, projection layer, formal event vocabulary) justifies the architectural weight.

7. **How does eventual consistency affect agent decision-making?** If Agent A approves a proposal while Agent B is deciding whether to claim a task based on that proposal's status, Agent B might see stale state. How much does this matter in practice? Agent session boundaries might be a natural consistency boundary (re-read state at session start).

8. **What is the relationship between event sourcing and the MMO patterns initiative?** MMO server meshing uses authoritative servers with event replication. This is structurally similar to event sourcing with a central event store. The `mmo-patterns-for-agents` initiative should cross-reference.
