# Iteration 1 — 2026-03-11

## Research Vectors

### Vector 1: Actor Model for AI Agents
**Question:** How do actor model concepts (Erlang/OTP, Akka, Orleans) map to AI agent coordination?
**Full report:** [iteration-2/actor-model-for-agent-coordination.md](iteration-2/actor-model-for-agent-coordination.md)

**Key discoveries:**
- AutoGen v0.4 explicitly implements the actor model — async message passing, typed messages, direct + pub-sub patterns ([Microsoft Research](https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/))
- Akka pivoted entirely to "Agentic AI" with actor-based agents (July 2025). Each agent = actor with private state, supervision trees, bounded mailboxes ([Akka blog](https://akka.io/blog/agentic-ai-frameworks))
- Dapr Agents builds on virtual actors with durable workflows — uses Raft internally but hides it from developers ([GitHub](https://github.com/dapr/dapr-agents))
- Jido (Elixir) runs 10k agents at 25KB each on GenServer — key insight: "agents must be architecturally correct WITHOUT LLMs before they can be correct WITH LLMs"
- Sherpa is a **blackboard system** (shared filesystem workspace, agents read/write, human as control component) with actor-like isolation via worktrees

**Implications:**
- The actor model is validated as the right abstraction for AI agents by industry leaders
- But Sherpa's filesystem-as-truth is a different substrate — blackboard + actor hybrid

### Vector 2: Optimistic Concurrency for Agents
**Question:** How can ETags, version vectors, and CAS operations work for file-based agent workflows?
**Full report:** [iteration-2/optimistic-concurrency-for-file-based-agents.md](iteration-2/optimistic-concurrency-for-file-based-agents.md)

**Key discoveries:**
- SHA-256 content hash serves as an ETag; read-work-write with hash comparison gives agents conflict detection ([AWS S3 conditional writes](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-conditional-writes/))
- Git IS optimistic concurrency — three-way merge (base, ours, theirs) is exactly the OCC validate phase. DoltHub explicitly identifies Git branches as MVCC
- No existing multi-agent framework implements true optimistic concurrency for file-based state — this is an open design space
- Version vectors in YAML frontmatter (`_agents: {planner: 3, worker-1: 1}`) would detect concurrent writes without content hashing
- `rename()` on same filesystem is atomic — write-then-rename gives a filesystem-level CAS operation

**Implications:**
- Three concurrency levels needed: (1) file-level ETags, (2) structured field-level YAML merge, (3) git branch-per-agent for deferred merge

### Vector 3: Consensus Protocols for AI Agents
**Question:** Are Raft/Paxos the right model, or are simpler patterns sufficient for 3-20 agents?
**Full report:** [iteration-3/consensus-vs-coordination-deep-dive.md](iteration-3/consensus-vs-coordination-deep-dive.md)

**Key discoveries:**
- **Consensus is overkill.** Raft/Paxos solve replicated state across unreliable networks. Sherpa has a single filesystem — nothing to replicate
- **Leader election via filesystem atomics** is the one useful sub-pattern: `mkdir` (EEXIST on collision), `rename` (atomic), `O_CREAT|O_EXCL` ([rcrowley.org](https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html))
- **Aegean protocol (Dec 2025)** — first consensus protocol designed for LLM agents, uses "stability horizons" requiring agreement across β consecutive rounds ([arXiv](https://arxiv.org/abs/2511.10400))
- **Stigmergy** (indirect coordination through environment modification) is precisely what Sherpa already does — filesystem conventions as stigmergic signals
- **Blackboard architecture (1970s)** is almost exactly Sherpa's model. Modern LLM adaptations published in 2025 outperform other multi-agent patterns by 13-57%

**Implications:**
- Sherpa needs coordination primitives (locks, fencing tokens), not consensus protocols
- POSIX atomic ops (`mkdir`, `rename`, `O_CREAT|O_EXCL`) are the foundation — zero dependencies

### Vector 4: Multi-Agent Framework Analysis
**Question:** What coordination patterns work, what doesn't, and what are the failure modes?
**Full report:** [iteration-3/multi-agent-framework-coordination-patterns.md](iteration-3/multi-agent-framework-coordination-patterns.md)

**Key discoveries:**
- **The coordination primitive set has converged:** sequential pipeline, parallel fan-out/fan-in, orchestrator-worker, handoff, iterative refinement — every framework uses some combination
- **Failure rates are 41-87%** across 150+ tasks in 5 frameworks. 14 distinct failure modes in 3 categories: specification (42%), coordination (37%), verification (21%) ([arXiv:2503.13657](https://arxiv.org/html/2503.13657v1))
- **"Bag of agents" produces 17x more errors** than structured systems — topology matters more than agent count
- **State management is the central unsolved problem.** LangGraph has reducer duplication bugs, ADK has no conflict resolution, AutoGen is sequential-only, OpenAI is stateless, CrewAI's hierarchical process is broken
- **MagenticOne's dual ledger** (task ledger + progress ledger) is the closest existing pattern to Sherpa's proposal/activity model

**Implications:**
- Sherpa's behavioral constraints address the #1 failure category (specification issues)
- Filesystem-as-truth sidesteps state synchronization problems that plague in-memory frameworks
- The 17x error trap validates Sherpa's structured governance over ad-hoc multi-agent coordination

### Vector 5: Event Sourcing for Agent Workflows
**Question:** Is event sourcing (append-only logs) better than mutable files for multi-agent coordination?
**Full report:** [iteration-3/event-sourcing-deep-dive.md](iteration-3/event-sourcing-deep-dive.md)

**Key discoveries:**
- **Temporal and Restate** are production durable execution engines implementing event sourcing for agent coordination. Temporal has explicit integrations with OpenAI Agents SDK and PydanticAI (2025-2026)
- **Restate's thesis — "Every System is a Log"** — a single upstream log eliminates most coordination complexity. Execution journals + conditional appends + embedded state services
- **POSIX O_APPEND atomicity** works across Linux/BSD/macOS/Windows. Concurrent JSONL appends under 512 bytes are safe without locking
- **Git already provides 80% of event sourcing's benefits** (immutability, history, branching). JSONL events add the missing 20% (typed events, agent attribution, sub-second ordering)
- **Schema evolution is the #1 operational problem** in event-sourced systems — and Sherpa's event vocabulary is still being discovered
- **Confluent published four formal patterns** for event-driven multi-agent systems: orchestrator-worker, hierarchical, blackboard, market-based. Sherpa maps to blackboard + orchestrator-worker hybrid

**Implications:**
- Start with structured JSONL audit logs, not full event sourcing. Discover the event vocabulary first.
- Sherpa's `activity.md` files are proto-event-sourcing — formalize them incrementally

## Synthesis

Five vectors converged on a single architectural insight: **Sherpa is already a blackboard system with stigmergic coordination, and this is the right foundation.**

### The Blackboard-Stigmergy Model

The most striking cross-vector finding is that three independent research traditions — blackboard architectures (AI, 1970s), stigmergy (biology/swarm intelligence), and event sourcing (distributed systems, 2010s) — all describe what Sherpa already does: agents modifying a shared environment to coordinate without direct communication. Every initiative proposal, activity log entry, and task file is a stigmergic signal. The filesystem IS the blackboard.

This isn't accidental convergence. Sherpa was built this way because filesystem-based coordination is what works when your agents are ephemeral Claude instances that can't hold persistent connections. The research validates this was the right instinct.

### Consensus Is Wrong; Coordination Primitives Are Right

All five vectors confirm: consensus protocols (Raft, Paxos) solve replicated state across unreliable networks. Sherpa has a single filesystem — there's nothing to replicate. What Sherpa needs is:

1. **Conflict detection** — know when two agents touched the same file (content hashing / ETags)
2. **Conflict resolution** — merge or reject concurrent changes (three-way merge, version vectors)
3. **Coordination** — assign work, prevent duplication, sequence dependent tasks (leader election, fencing tokens)

These are all achievable with POSIX atomic filesystem operations (`mkdir`, `rename`, `O_CREAT|O_EXCL`) — zero external dependencies.

### The Incremental Path

The research reveals a clear layering strategy:

| Layer | What | How | Priority |
|-------|------|-----|----------|
| 0. Atomic writes | Prevent corruption | `write-tmp → rename` pattern | Now |
| 1. Conflict detection | Know when conflicts happen | SHA-256 content hash as ETag in frontmatter | Next |
| 2. Agent attribution | Know who changed what | Version vectors in YAML frontmatter | Next |
| 3. Structured audit | Typed event log | JSONL append-only file per initiative | Soon |
| 4. Coordination locks | Prevent duplicate work | `mkdir`-based advisory locks with TTL | Soon |
| 5. Automated merge | Resolve non-conflicting changes | Section-level three-way merge | Later |

### The 17x Validation

The multi-agent framework analysis found that unstructured multi-agent systems produce 17x more errors than structured ones. Sherpa's governance model — behavioral constraints, proposals requiring review, structured initiative lifecycle — is exactly the kind of structure that prevents this. The research validates the governance-first approach over the tool-first approach.

### What We Got Wrong (or Didn't Know)

- **MagenticOne's dual ledger** is remarkably close to Sherpa's proposal + activity log model. This wasn't a known prior — it's independent convergence on the same pattern.
- **Failure rates of 41-87%** in existing frameworks are higher than expected. The specification failure category (42%) maps directly to what Sherpa's behavioral engineering addresses.
- **Jido's principle** — "agents must be architecturally correct WITHOUT LLMs before they can be correct WITH LLMs" — is a design constraint Sherpa should adopt explicitly.

## All Sources

### Actor Model & AI Agents
- [Microsoft Research — AutoGen v0.4](https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/) — AutoGen Core actor model
- [Akka Agentic Platform](https://akka.io/blog/agentic-ai-frameworks) — Akka's pivot to AI agents
- [Dapr Agents GitHub](https://github.com/dapr/dapr-agents) — Virtual actors for AI agents
- [Jido Framework](https://jido.run/docs/getting-started) — Elixir GenServer-based AI agents

### Consensus & Coordination
- [Raft paper](https://raft.github.io/raft.pdf) — Original Raft consensus algorithm
- [Aegean Protocol (arXiv)](https://arxiv.org/abs/2511.10400) — BFT consensus for LLM agents
- [Google Cloud Storage leader election](https://cloud.google.com/blog/topics/developers-practitioners/implementing-leader-election-google-cloud-storage) — Storage-based leader election
- [Martin Kleppmann — Distributed Locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — Fencing tokens pattern
- [POSIX atomic operations](https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html) — mkdir, rename, link atomicity

### Optimistic Concurrency
- [AWS S3 Conditional Writes](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-conditional-writes/) — ETag-based conditional writes
- [DoltHub — Git as MVCC](https://www.dolthub.com/) — Git branches as version control

### Multi-Agent Frameworks
- [Cemri et al. — "Why Do Multi-Agent LLM Systems Fail?"](https://arxiv.org/html/2503.13657v1) — 14 failure modes across 5 frameworks
- [17x Error Trap (TDS)](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/) — Topology matters more than agent count
- [MagenticOne (arXiv)](https://arxiv.org/abs/2411.04468) — Dual-ledger orchestration pattern
- [Google ADK multi-agent patterns](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/) — Coordination topology taxonomy

### Event Sourcing
- [Martin Fowler — Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) — Canonical definition
- [Temporal — Multi-Agent Architectures](https://temporal.io/blog/using-multi-agent-architectures-with-temporal) — Durable execution for AI agents
- [Restate — Every System is a Log](https://www.restate.dev/blog/every-system-is-a-log-avoiding-coordination-in-distributed-applications) — Execution journals + conditional appends
- [Jay Kreps — The Log](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) — Append-only log as unifying abstraction
- [Pat Helland — Immutability Changes Everything](https://www.cidrdb.org/cidr2015/Papers/CIDR15_Paper16.pdf) — Academic foundation

## Proposals Generated

- `proposal.md` — Sherpa Consistency Layer: blackboard-coordinator architecture with POSIX atomic primitives and incremental concurrency controls

## Open Questions for Next Iteration

1. **How does JSONL event logging interact with git worktree isolation?** — Events written in a worktree branch need to merge cleanly into main. Does append-only JSONL merge trivially in git, or do we need a merge strategy?
2. **What's the right granularity for section-level prose sync?** — The three-way merge for markdown needs to understand document structure. Where is the boundary between "section" and "paragraph"? What do Figma/Google Docs teach us about operational granularity?
3. **How should supervision policies be formalized?** — Erlang's one-for-one / one-for-all / rest-for-one have direct agent analogs. Should these be in `sherpa.config.ts`? What triggers a "restart"?
4. **What's the MCP server's role in coordination?** — The MCP coordination layer initiative overlaps. Should the MCP server be the coordinator (mediating all writes) or a participant (one more agent on the blackboard)?
5. **Can Sherpa's coordination primitives be tested without LLMs?** — Jido's principle: correct without LLMs before correct with them. Can we build a test harness using mock agents that exercises the concurrency layer?
