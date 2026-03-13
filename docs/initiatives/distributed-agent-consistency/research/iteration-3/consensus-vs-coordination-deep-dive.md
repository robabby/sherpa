# Consensus vs. Coordination Patterns: Deep Dive with Live Sources

**Research iteration:** 3
**Date:** 2026-03-12
**Scope:** Are consensus protocols (Raft, Paxos, PBFT) the right model for AI agent coordination, or are simpler patterns sufficient for 3-20 agents?
**Methodology:** WebSearch and WebFetch used extensively. All claims include source URLs verified via live fetching. Builds on iteration-1's training-knowledge foundation with real-world confirmation, new papers (2025-2026), and deeper mechanism analysis.

---

## Key Discoveries

### 1. Raft Consensus -- What It Actually Solves and Why It's Overkill

**Confirmed from iteration-1:** Raft solves replicated state machine consensus -- ensuring N servers agree on the same sequence of log entries. It decomposes into leader election, log replication, and safety. The original paper is Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm." (https://raft.github.io/raft.pdf)

**New findings:**

- Raft was explicitly designed as a reaction to Paxos's complexity: "Raft is equivalent to Paxos in fault-tolerance and performance" but "decomposed into relatively independent subproblems." (https://raft.github.io/)
- **Simplest implementations are still substantial.** MiniRaft (https://github.com/jackyzha0/miniraft) is advertised as "<1kloc" but omits production necessities. Raft Lite uses an event-loop approach to make the algorithm more intuitive (https://liangrunda.com/posts/raft-lite/). A Go implementation walkthrough confirms that "the original paper includes many correctness details often brushed over in toy implementations" -- production Raft requires handling membership changes, log compaction, and snapshotting. (https://notes.eatonphil.com/2023-05-25-raft.html)
- **HashiCorp's Consul uses Raft internally** for maintaining cluster state. Their talk "You Must Build A Raft" confirms Raft's role is consensus on a replicated log, not general coordination. (https://www.hashicorp.com/en/resources/raft-consul-consensus-protocol-explained)
- **The critical distinction**: Raft is for replicating state across unreliable networks. Sherpa has a single filesystem as the source of truth -- there is nothing to replicate. Raft solves a problem Sherpa does not have.

### 2. Paxos -- Confirmed Complex, Simplified Versions Converge on Raft

- Raft and Paxos solve the same fundamental problem. A 2020 ACM paper ("Paxos vs Raft: have we reached consensus on distributed consensus?") argues that "much of Raft's purported understandability comes from its clear presentation rather than fundamental differences in the underlying algorithm." (https://dl.acm.org/doi/10.1145/3380787.3393681)
- Multi-Paxos with a stable leader converges toward Raft's design. ZAB (ZooKeeper Atomic Broadcast) is a related protocol designed specifically for atomic broadcast with total order delivery. (https://en.wikipedia.org/wiki/Paxos_(computer_science))
- Martin Fowler's patterns page confirms Paxos is used "where durability is required (for example, to replicate a file or a database)." (https://martinfowler.com/articles/patterns-of-distributed-systems/paxos.html)
- **For Sherpa:** Even more overkill than Raft. Paxos solves agreement without a central coordinator -- but Sherpa HAS a central coordinator (the filesystem, and optionally a coordinator agent).

### 3. PBFT -- Newly Relevant for AI Safety, Still Overkill for Sherpa

**Iteration-1 dismissed PBFT as irrelevant. New 2025 research partially challenges this:**

- **"A Byzantine Fault Tolerance Approach towards AI Safety" (April 2025)** proposes BFT-inspired architectures where "ensembles of AI artifacts or modules check and balance each other" to prevent any single errant component from steering the system into unsafe states. (https://arxiv.org/abs/2504.14668)
- **"Rethinking the Reliability of Multi-agent System: A Perspective from Byzantine Fault Tolerance" (November 2025)** introduces CP-WBFT, a confidence-probe-based weighted BFT consensus mechanism. Achieves "superior performance across diverse network topologies under extreme Byzantine conditions (85.7% fault rate)" for mathematical reasoning and safety assessment. (https://arxiv.org/abs/2511.10400)
- **However**: These papers address adversarial/safety scenarios where agents might hallucinate, be compromised, or produce unreliable outputs. For Sherpa's cooperative agents under single-operator control, the simpler Judge pattern (human reviews agent output) provides equivalent safety without BFT's communication overhead. PBFT requires 3f+1 nodes for f faults -- for even 1 faulty agent you need 4 total.
- **Communication overhead is real**: "PBFT is perceived to be a communication-heavy protocol due to replication, which results in scalability limitations" and "sparks communication bottlenecks when the number of consensus nodes increases sharply." (https://dl.acm.org/doi/abs/10.1109/TC.2024.3377921)

### 4. Leader Election -- The Practically Useful Piece, Now With Storage-Based Patterns

**Confirmed: leader election is the one consensus sub-problem that maps well to multi-agent coordination.**

**New findings on storage-based leader election:**

- **Google Cloud Storage leader election pattern**: Instead of implementing consensus, "take advantage of a strongly consistent storage system that provides the same guarantees through a single key or record." Nodes race to write their ID to a file/record; the storage system's atomicity guarantees only one wins. The leader renews via heartbeat writes. (https://cloud.google.com/blog/topics/developers-practitioners/implementing-leader-election-google-cloud-storage)
- **Robust distributed locking via object storage**: A detailed algorithm uses Cloud Storage precondition headers for atomicity. Lock acquisition uses `x-goog-if-generation-match: 0` (only succeeds if object doesn't exist). Stale lock detection via TTL (recommended: 5 minutes). "Cloud Storage makes a single, final decision" via atomic conditional writes, preventing split-brain. Latency is tens to hundreds of milliseconds -- perfectly acceptable for agent coordination. (https://www.joyfulbikeshedding.com/blog/2021-05-19-robust-distributed-locking-algorithm-based-on-google-cloud-storage.html)
- **AWS recommendation**: "First choice: Use workflow services or idempotent APIs to avoid leader election entirely. When needed: Prefer battle-tested clients (DynamoDB Lock Client, ZooKeeper) over custom implementations." AWS implements leader election via leases, avoiding wall-clock time dependencies, using local elapsed time instead. (https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/)
- **AWS identifies key tradeoffs of leaders**: Single point of failure, scaling bottleneck, high blast radius from bad leaders, deployment challenges. Mitigation: sharding -- "giving each data item a leader while distributing leaders across the system." (https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/)
- **For Sherpa**: The GCS pattern maps directly to filesystem-based coordination. An agent "claims" the coordinator role by atomically creating a lock file (using `O_CREAT|O_EXCL` or `mkdir`). The coordinator renews via timestamp writes. Other agents check the timestamp for staleness. This is exactly what Sherpa needs -- zero dependencies, pure filesystem, battle-tested pattern.

### 5. Token-Passing and Mutex -- Confirmed Viable, New Survey

- **A comprehensive 2025 survey on token-based distributed mutual exclusion** catalogs the landscape: token ring (simplest), Raymond's tree algorithm (fewer messages), and hierarchical approaches for scaling. (https://arxiv.org/html/2502.04708v1)
- **Key insight on efficiency**: "Token ring is very efficient under high contention, but very inefficient under low contention." Under high contention, as low as one message per request. Under low contention, "messages will occur for no reason." (https://www.cs.uic.edu/~ajayk/Chapter9.pdf)
- **Failure modes confirmed**: "Failure of the process with the token is a problem, and generation of the initial token is a problem." If a process dies with the token, timeout-based regeneration is needed, but risks multiple tokens. (https://www.cs.colostate.edu/~cs551/CourseNotes/Synchronization/TokenPassing.html)
- **Martin Kleppmann's analysis of distributed locking** identifies two purposes: efficiency (preventing duplicate work -- failure is minor) and correctness (ensuring data integrity -- failure is serious). For correctness-critical locks, he recommends ZooKeeper with fencing tokens, not Redis/Redlock. The "fencing token" pattern: include a monotonically increasing number with every write; storage rejects older tokens. (https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
- **For Sherpa**: Token-passing serializes all work, which is acceptable only if work is inherently sequential. For 3-20 agents with independent tasks, this wastes capacity. A fencing-token approach (monotonic version numbers on state files) is valuable for preventing stale-write corruption.

### 6. Atomic Filesystem Operations as Coordination Primitives

**New detailed findings on POSIX atomic operations:**

- **`mkdir(dirname)` fails with EEXIST if the directory exists.** This is the same atomic check-and-create as `open(O_CREAT|O_EXCL)`. The NamedAtomicLock Python library uses mkdir as its locking primitive specifically because "POSIX defines mkdir to be an atomic operation." (https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html) (https://github.com/kata198/NamedAtomicLock)
- **`rename(oldpath, newpath)` is atomic** on the same filesystem. This enables the safe write pattern: write to temp, rename to final. (https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html)
- **`link()` and `symlink()` fail with EEXIST**, providing visible filesystem locks that `ls` can see. (https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html)
- **`flock()` does NOT work over NFS.** "Whether and how flock locks work on network filesystems is implementation dependent." On BSD systems, flock on NFS-mounted files are "successful no-ops." (https://man7.org/linux/man-pages/man2/flock.2.html)
- **`fcntl()` locking** (F_SETLK, F_SETLKW) is the POSIX-standard mechanism for file region locking, and does work across NFS on Linux 2.6.12+. (https://gavv.net/articles/file-locks/)
- **For Sherpa**: Since agents share a local filesystem (not NFS), `mkdir`-based locks and `rename`-based atomic writes are the simplest, most reliable coordination primitives. No external dependencies required.

### 7. What AutoGen, CrewAI, LangGraph, MetaGPT, and Google ADK Actually Use

**Iteration-1 found none use consensus. Iteration-3 confirms and deepens with live sources:**

**AutoGen (Microsoft):**
- Group chat uses speaker selection policies: round-robin, random, LLM-decided (model picks next speaker from conversation context), or manual (human input). (https://microsoft.github.io/autogen/0.2/docs/tutorial/conversation-patterns/)
- v0.4 provides `RoundRobinGroupChat` (fixed cycling) and `SelectorGroupChat` (function-selected next speaker). The `RoundRobinGroupChatManager` class is the implementation. (https://microsoft.github.io/autogen/stable/_modules/autogen_agentchat/teams/_group_chat/_round_robin_group_chat.html)
- Customizable speaker selection via functions that take `(last_speaker, groupchat)` and return an Agent or selection method string. (https://microsoft.github.io/autogen/0.2/docs/notebooks/agentchat_groupchat_customized/)
- **Coordination mechanism: sequential message-passing in a shared conversation.** No consensus protocol.

**CrewAI:**
- Sequential process: tasks execute in defined order, each agent executes before the next begins. "Task outputs flow as context to downstream tasks." (https://docs.crewai.com/en/learn/sequential-process)
- Hierarchical process: automatically creates a "manager" agent for task planning, delegation, and validation. "Tasks are not pre-assigned; the manager allocates tasks to agents as needed." (https://docs.crewai.com/how-to/hierarchical-process)
- Known bug (2026): "Hierarchical process delegation fails -- manager agents cannot delegate to worker agents" even with `allow_delegation=True`. (https://github.com/crewAIInc/crewAI/issues/4783)
- Flows added for event-driven pipeline control, combining "autonomous decision-making in Crews with the precision of structured orchestration." (https://docs.crewai.com/en/learn/sequential-process)
- **Coordination mechanism: sequential pipeline or manager-worker delegation.** No consensus protocol.

**LangGraph (LangChain):**
- State is a "single shared memory object that flows through every step." Each node reads/writes state; reducers merge concurrent updates. (https://medium.com/@bharatraj1918/langgraph-state-management-part-1-how-langgraph-manages-state-for-multi-agent-workflows-da64d352c43b)
- Reducers are essential for concurrent fan-out: "If both nodes update the same state key...reducers become essential to merge their updates properly." (https://medium.com/@mor.hananovitz/agents-101-reducers-demonstrated-f2c480162641)
- Reached v1.0 in late 2025 and became "the default runtime for all LangChain agents." (https://dev.to/synsun/autogen-vs-langgraph-vs-crewai-which-agent-framework-actually-holds-up-in-2026-3fl8)
- Immutable state is enforced: mutable approaches "bypass LangGraph's tracking mechanism" and create race conditions. (https://medium.com/@bharatraj1918/langgraph-state-management-part-1-how-langgraph-manages-state-for-multi-agent-workflows-da64d352c43b)
- **Coordination mechanism: graph-based state machine with reducer-merged concurrent updates.** The most sophisticated pattern in production, but still not consensus -- it is map-reduce with conflict resolution.

**MetaGPT:**
- Encodes Standard Operating Procedures (SOPs) into prompt sequences. "SOPs play a critical role in supporting task decomposition and effective coordination." (https://arxiv.org/html/2308.00352v6)
- Uses a **shared message pool** with subscription mechanism: agents publish structured messages and subscribe based on profiles. "Subscription mechanism filters out irrelevant contexts." (https://arxiv.org/html/2308.00352v6)
- Assembly-line paradigm: each role produces structured outputs that prompt the next role. (https://www.ibm.com/think/topics/metagpt)
- **Coordination mechanism: publish-subscribe message pool with sequential SOP pipeline.** No consensus protocol. Documents serve as the coordination medium -- very similar to Sherpa's filesystem approach.

**Google Agent Development Kit (ADK):**
- Agents organized in hierarchies with a single-parent rule. Parent agents delegate via LLM-driven routing ("analyzing the incoming request and using its reasoning capabilities to decide which sub-agent is best suited"). (https://google.github.io/adk-docs/agents/multi-agents/)
- Shared Session State acts as "a shared digital whiteboard" for inter-agent data passing. (https://google.github.io/adk-docs/agents/multi-agents/)
- Workflow agents: SequentialAgent, ParallelAgent, LoopAgent manage execution flow. (https://google.github.io/adk-docs/agents/multi-agents/)
- A2A (Agent-to-Agent) protocol enables cross-framework agent discovery via `.well-known/agent.json`. (https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/)
- **Coordination mechanism: hierarchical delegation with shared state.** No consensus protocol.

**Summary finding (confirmed with 2026 sources):** No major multi-agent AI framework uses distributed consensus protocols. They all rely on simpler patterns: sequential pipelines, round-robin, manager/worker hierarchy, state-machine graphs with reducers, or LLM-decided routing.

### 8. Gossip Protocols -- Two Major 2025 Papers for Agent Systems

**New findings not available in iteration-1:**

- **"Revisiting Gossip Protocols: A Vision for Emergent Coordination in Agentic Multi-Agent Systems" (2025)**: Proposes gossip as a "foundational layer for emergent coordination in autonomous agent networks" complementing structured protocols like MCP and A2A. Information propagates logarithmically -- reaching 25,000 agents in approximately 15 rounds with modest fan-out. Explicitly excludes scenarios requiring strict event ordering or linearizability. Proposes hybrid architectures: "gossip provides ambient awareness while structured protocols handle deterministic actions." (https://arxiv.org/html/2508.01531v1)

- **"A Gossip-Enhanced Communication Substrate for Agentic AI" (GEACL, December 2025)**: Proposes a five-component gossip substrate: Epidemic Dissemination Engine, Peer Sampling Service, Semantic State Store, Anti-Entropy Reconciler, Priority/Relevance Filter. Uses push-pull exchanges and CRDT-style conflict resolution. Communication cost scales near-linearly with population. At 200 agents, "sensitivity sharing is 3% of runtime, with rest dominated by LLM inference (38%) and wait time (59%)." Limitations: temporal staleness, semantic dilution during propagation, malicious agent vulnerability. (https://arxiv.org/html/2512.03285)

- **For Sherpa**: For 3-20 agents on a shared filesystem, the filesystem IS the gossip medium. Each agent reading state files is equivalent to gossip pull. The GEACL paper validates this intuition -- CRDTs for conflict resolution and eventual consistency are the right primitives. Gossip protocols become relevant only at scale (100+ agents) where polling overhead matters.

### 9. Blackboard Architecture -- The Historical Precedent for Sherpa's Model

**Entirely new finding:**

- The **blackboard architecture** (Carnegie Mellon, 1970s, HEARSAY-II system) is almost exactly Sherpa's coordination model: "multiple independent agents collaborate by reading from and writing to a shared workspace." Three components: shared knowledge repository, knowledge sources (specialized agents), and a control component (orchestrator selecting which agent acts next). (https://notes.muthu.co/2025/10/collaborative-problem-solving-in-multi-agent-systems-with-the-blackboard-architecture/)

- **Control strategies**: priority-based (confidence scores), focus-based (concentrate on specific regions), opportunistic (highest-confidence contribution), goal-directed (advance toward known subgoals). (https://notes.muthu.co/2025/10/collaborative-problem-solving-in-multi-agent-systems-with-the-blackboard-architecture/)

- **Modern LLM adaptations**: "Exploring Advanced LLM Multi-Agent Systems Based on Blackboard Architecture" (2025) shows blackboard-based systems improve performance via "shared memory pool enabling comprehensive information exchange among agents" and "dynamically selecting agents from the agent group based on current blackboard." (https://arxiv.org/html/2507.01701v1)

- Google Research published "Blackboard Multi-Agent Systems for Information Discovery in Data Science" confirming the pattern's relevance for modern AI. (https://research.google/pubs/blackboard-multi-agent-systems-for-information-discovery-in-data-science/)

- **GitHub implementation**: agent-blackboard provides "multi-agent coordination system for software engineering with 9 specialized AI agents." (https://github.com/claudioed/agent-blackboard)

- **For Sherpa**: The blackboard pattern is Sherpa's filesystem model with a name. The filesystem IS the blackboard. Initiative directories, task files, and activity logs are the shared knowledge repository. Agent roles are knowledge sources. The Planner/Worker/Judge dispatch is the control component. This is not coincidence -- it validates Sherpa's approach from a 50-year lineage of AI architecture research.

### 10. Stigmergy -- Indirect Coordination Through Environment Modification

**New finding:**

- **Stigmergy** is "indirect coordination through the environment" -- agents interact by observing and modifying shared state rather than messaging each other directly. Wikipedia is an example: "users interact only by modifying local parts of their shared virtual environment." (https://en.wikipedia.org/wiki/Stigmergy)

- **"Why Multi-Agent Systems Don't Need Managers: Lessons from Ant Colonies"** argues traditional frameworks (AutoGen, MetaGPT, CrewAI) import human hierarchies, creating serialization bottlenecks. The alternative: treat work artifacts as environments with measurable "pressure" signals. Agents observe local conditions and act to reduce pressure, creating emergent coordination without orchestration. Three principles: constraint over orchestration, locality as feature, stability through continuous pressure. Critical limitation: "High interdependencies cause thrashing; such problems require explicit planning instead." (https://www.rodriguez.today/articles/emergent-coordination-without-managers)

- **For Sherpa**: Sherpa's filesystem conventions (initiative directories, activity.md files, task status files) already function as stigmergic signals. An agent seeing an unclaimed task file with status "ready" is like an ant finding a pheromone trail. The framework doesn't need to implement stigmergy -- it already IS stigmergy, mediated by a filesystem rather than chemical trails.

### 11. Aegean -- First True Consensus Protocol Designed for LLM Agents (December 2025)

**Entirely new finding (not available in iteration-1):**

- **Aegean** is a consensus protocol specifically designed for stochastic reasoning agents. Unlike traditional consensus (Raft/Paxos assume deterministic state machines), Aegean handles agents that "actively revise and refine their solutions based on new context from other agents' reasoning." (https://arxiv.org/html/2512.20184v1)

- **Protocol flow**: Leader election (Raft-like) -> task distribution -> solution collection from quorum -> refinement loop (distribute solutions, agents refine based on peers, repeat until stable). (https://arxiv.org/html/2512.20184v1)

- **Key innovation -- Stability Horizons**: Rather than committing on first quorum agreement, solutions must "appear in beta consecutive rounds of the refinement sets" to ensure stability isn't transient. This prevents premature consensus on answers that would dissolve in the next round. (https://arxiv.org/html/2512.20184v1)

- **Agreement Monitor**: Tracks agent responses incrementally as they stream in. When alpha agents agree and meet stability criteria (beta rounds of persistence), "signals the coordinator to update the candidate" and issues "cancellation directives for in-progress agents whose answers can no longer affect the round outcome." (https://arxiv.org/html/2512.20184v1)

- **Results**: 1.2-20x latency reduction, 1.1-4.4x token savings, accuracy within 2.5% of non-consensus systems. Validated on four mathematical reasoning benchmarks. (https://arxiv.org/abs/2512.20184)

- **For Sherpa**: Aegean solves a different problem than Sherpa faces. It coordinates multiple agents reasoning about the SAME problem (ensemble consensus on answers). Sherpa's agents work on DIFFERENT tasks in parallel. However, Aegean's stability horizon concept is valuable -- when multiple agents review the same proposal (Judge pattern), requiring agreement across beta rounds before accepting could improve review quality.

### 12. CONSENSAGENT -- Sycophancy as a Consensus Problem (ACL 2025)

- **CONSENSAGENT** identifies sycophancy as a critical multi-agent consensus problem: "agents reinforce each other's responses instead of critically engaging with the debate, which inflates computational costs by requiring additional debate rounds." Proposes dynamic prompt refinement to mitigate sycophancy. "Significantly outperforms both single-agent and multi-agent baselines across all benchmark datasets." (https://aclanthology.org/2025.findings-acl.1141/)

- **For Sherpa**: The sycophancy problem is real for Sherpa's Judge pattern. If reviewer agents default to approval (sycophantic behavior), the integration review quality degrades. CONSENSAGENT's approach of dynamically adjusting prompts based on interaction patterns could inform Sherpa's behavioral agent system.

### 13. Ripple Effect Protocol -- MIT's Sensitivity-Based Coordination (October 2025)

**Entirely new finding:**

- **REP (Ripple Effect Protocol)** from MIT Media Lab extends agent communication beyond decisions to include "lightweight sensitivities -- signals expressing how choices would change if key environmental variables shifted." These propagate through local networks, enabling faster alignment. (https://arxiv.org/html/2510.16572v1)

- **Four-step protocol per round**: (1) receive neighbor messages with decisions + sensitivities, (2) generate local decision + sensitivity signal, (3) aggregate neighbors' sensitivities to update coordination state, (4) optionally compute global coordination via coordinate-wise median. (https://arxiv.org/html/2510.16572v1)

- **Key property -- modality agnostic**: Sensitivity signals can be numerical (weighted averaging) or textual (LLM-based synthesis of natural language reasoning into structured updates). This dual-mode handles both structured and unstructured agent outputs. (https://arxiv.org/html/2510.16572v1)

- **Results**: 41-100% improvement over A2A protocol across supply chain, preference aggregation, and resource allocation benchmarks. Convergence in 3-4 rounds vs 10+ for baselines. Communication cost is 3% of runtime at 200 agents. (https://arxiv.org/html/2510.16572v1)

- **MIT's Levels of Agentic Coordination taxonomy**: Level 1 = tools (MCP), Level 2 = direct agent communication (A2A), Level 3 = universal communication (UAP), Level 4 = indirect network signaling (REP). The future is "crowd-smart agents that understand how to work with millions of other smart agents." (https://www.media.mit.edu/articles/levels-of-agentic-coordination/)

- **For Sherpa**: REP's sensitivity sharing maps to Sherpa's proposal system. When an agent writes a proposal, it is sharing not just a decision but a signal about how the system should change. Other agents reading proposals and activity logs are consuming sensitivity signals. REP validates the value of rich, contextual state sharing over bare decision broadcasting. For 3-20 agents, the overhead is negligible.

### 14. Google Research -- When Multi-Agent Coordination Helps vs. Hurts

**Critical new finding:**

- **"Towards a Science of Scaling Agent Systems"** (Google Research, 2025-2026) provides empirical evidence on coordination patterns. (https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)

- **Parallelizable tasks**: Multi-agent coordination shows up to 80.9% performance boost with centralized coordination (financial reasoning benchmarks).

- **Sequential tasks**: "Every multi-agent variant tested degraded performance by 39-70%" on planning tasks. "The overhead of communication fragmented the reasoning process."

- **Error amplification**: Independent multi-agent systems amplified errors by **17.2x** without mutual checking. Centralized systems contained amplification to **4.4x** via orchestrator validation.

- **Five architectures tested**: Single-agent, Independent (parallel + end aggregation), Centralized (hub-and-spoke), Decentralized (peer-to-peer mesh), Hybrid (hierarchical + peer). Predictive model (R-squared = 0.513) identifies optimal architecture for 87% of unseen tasks using measurable properties like tool count and decomposability.

- **Key recommendation**: "Architecture selection should depend on task properties -- specifically sequential dependencies and tool density -- rather than defaulting to more agents."

- **For Sherpa**: This is the strongest evidence that Sherpa should NOT use a one-size-fits-all coordination pattern. The Planner should classify tasks by decomposability and select coordination accordingly: centralized (coordinator agent) for coupled tasks, independent (parallel workers with end aggregation) for decomposable tasks. The 4.4x error containment from centralized orchestration argues strongly for the coordinator + Judge pattern.

### 15. Event-Driven Patterns -- Confluent's Four Patterns

- **Four event-driven multi-agent patterns** identified: (1) Orchestrator-Worker (central assignment via message partitions), (2) Hierarchical Agent (layered delegation), (3) Blackboard (shared workspace), (4) Market-Based (bid/ask matching via event streams). All can be implemented on event streaming infrastructure. (https://www.confluent.io/blog/event-driven-multi-agent-systems/)

- **For Sherpa**: The orchestrator-worker and blackboard patterns are the most relevant. The market-based pattern is interesting for task allocation -- agents "bid" on tasks by writing capability assessments, and the coordinator "awards" based on best match. This is the Contract Net Protocol (1980) implemented on modern infrastructure.

### 16. Contract Net Protocol -- Classic Task Allocation

- **Contract Net Protocol (CNP, Smith 1980)**: Manager announces task, contractors bid, manager awards to best bidder. "Dynamic allocation and natural load balancing." Communication-intensive but effective for heterogeneous agents with different capabilities. (https://en.wikipedia.org/wiki/Contract_Net_Protocol)

- **For Sherpa**: If agents develop different specializations (some better at code review, some at research, some at writing), CNP provides a principled way to match tasks to agents. The coordinator announces a task, agents assess their fit, coordinator assigns. This is more sophisticated than round-robin but simpler than consensus.

### 17. Protocol Choice Matters More Than Expected

- **"Which LLM Multi-Agent Protocol to Choose?" (ICLR 2026 submission)**: Protocol choice "can impact task completion time by up to 36%, communication overhead by 3.5 seconds." Introduces ProtocolBench and ProtocolRouter (learnable protocol routing based on runtime conditions). (https://openreview.net/forum?id=lqNqKUG2dn)

- **For Sherpa**: This validates that coordination mechanism selection should be a first-class concern, not an afterthought. The framework should support multiple coordination patterns and let the Planner or human select the appropriate one per task.

### 18. Google SRE's Definitive Guidance

- **Google SRE Book, Chapter on Managing Critical State**: "Whenever you see leader election, critical shared state, or distributed locking, think about distributed consensus: any lesser approach is a ticking bomb waiting to explode in your systems." BUT also: for systems where "stale data results in extra work being performed but not incorrect results," eventual consistency and read-from-replica patterns work fine. Match the coordination mechanism to criticality. (https://sre.google/sre-book/managing-critical-state/)

- **For Sherpa**: Most agent coordination falls in the "extra work, not incorrect results" category. If two agents claim the same task, the waste is duplicate effort, not data corruption. This means eventual consistency (filesystem polling + optimistic concurrency) is sufficient for task assignment. The exception is shared document editing, where concurrent writes can cause data loss -- this requires either locking or CRDTs.

---

## Implications for Sherpa's Filesystem-Based Multi-Agent Coordination

### What Sherpa Does NOT Need (Confirmed)

1. **Raft, Paxos, or Multi-Paxos**: These replicate state across unreliable networks. Sherpa's filesystem is the single source of truth -- nothing to replicate.
2. **PBFT/Byzantine fault tolerance**: All agents are Claude instances under operator control. The Judge pattern provides quality control without BFT overhead.
3. **Sub-millisecond coordination**: Agent sessions last minutes to hours. Lock contention in seconds is acceptable.
4. **Gossip protocols for state propagation**: With 3-20 agents, filesystem polling IS gossip. Gossip infrastructure becomes valuable only at 100+ agents.

### What Sherpa DOES Need (Refined)

1. **Atomic file operations for mutual exclusion**: `mkdir`-based locks (POSIX atomic, visible to `ls`), `rename`-based atomic writes, `O_CREAT|O_EXCL` for task claiming. No external dependencies.
2. **Fencing tokens for stale-write prevention**: Monotonic version numbers on state files. Agents include the version they read; writes rejected if version has advanced. (Kleppmann pattern.)
3. **Task-property-based coordination selection**: Centralized coordinator for coupled tasks (4.4x error containment), independent parallel workers for decomposable tasks (80.9% performance boost). Google's research proves one-size-fits-all fails.
4. **Blackboard pattern as first-class architecture**: Sherpa's filesystem IS a blackboard. Name it, formalize the control component (Planner selects which agent acts on which region of the blackboard), and make it explicit.
5. **Conflict detection via optimistic concurrency**: Git-style branching for document edits. Work in isolation, detect conflicts at merge. CRDTs for structured data (task boards, counters).
6. **Sycophancy mitigation in Judge patterns**: CONSENSAGENT's finding that agents reinforce rather than critically engage is directly relevant to Sherpa's integration review process.

### Recommended Architecture (Refined from Iteration-1)

**The Blackboard-Coordinator Pattern:**

1. **Blackboard** = filesystem (initiative directories, task files, activity logs, state files)
2. **Coordinator** = statically assigned or human-designated agent, claims role via `mkdir`-based lock with TTL heartbeat
3. **Workers** = claim assigned tasks via atomic `mkdir` (e.g., creating `.claimed-by-agent-id/` directory)
4. **Fencing** = monotonic version in state file header, workers include version in commits, rejected on mismatch
5. **Control strategy** = coordinator classifies tasks (decomposable vs coupled) and selects pattern:
   - Decomposable -> fan-out to parallel workers, aggregate results
   - Coupled/sequential -> pipeline with explicit handoff
   - Review/judgment -> multi-agent review with stability horizon (Aegean-inspired: require agreement across beta rounds)
6. **Human-in-the-loop** = Judge role for conflict resolution, proposal approval, quality gates

This is the blackboard architecture with 50 years of validation, implemented on POSIX filesystem primitives, with insights from 2025-2026 multi-agent AI research.

---

## Sources

### Papers and Academic Research

| URL | Description |
|-----|-------------|
| https://raft.github.io/raft.pdf | Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm" -- the original Raft paper |
| https://dl.acm.org/doi/10.1145/3380787.3393681 | "Paxos vs Raft: have we reached consensus on distributed consensus?" -- ACM 2020 comparison |
| https://arxiv.org/abs/2512.20184 | "Reaching Agreement Among Reasoning LLM Agents" -- Aegean consensus protocol for stochastic agents |
| https://arxiv.org/html/2512.20184v1 | Aegean paper full HTML -- detailed protocol flow, stability horizons, agreement monitor |
| https://arxiv.org/html/2508.01531v1 | "Revisiting Gossip Protocols: A Vision for Emergent Coordination in Agentic Multi-Agent Systems" |
| https://arxiv.org/html/2512.03285 | "A Gossip-Enhanced Communication Substrate for Agentic AI" (GEACL) -- five-component gossip architecture |
| https://arxiv.org/html/2510.16572v1 | "Ripple Effect Protocol: Coordinating Agent Populations" -- MIT sensitivity-based coordination |
| https://arxiv.org/abs/2510.16572 | Ripple Effect Protocol abstract page |
| https://arxiv.org/html/2501.06322v1 | "Multi-Agent Collaboration Mechanisms: A Survey of LLMs" -- taxonomy of cooperation/competition/coopetition |
| https://aclanthology.org/2025.findings-acl.1141/ | CONSENSAGENT -- sycophancy mitigation in multi-agent LLM consensus |
| https://people.cs.vt.edu/naren/papers/CONSENSAGENT.pdf | CONSENSAGENT paper PDF |
| https://arxiv.org/abs/2504.14668 | "A Byzantine Fault Tolerance Approach towards AI Safety" |
| https://arxiv.org/abs/2511.10400 | "Rethinking the Reliability of Multi-agent System: BFT Perspective" -- CP-WBFT mechanism |
| https://arxiv.org/html/2511.10400v2 | CP-WBFT paper full HTML |
| https://arxiv.org/html/2308.00352v6 | MetaGPT paper -- SOPs, message pool, subscription mechanism |
| https://arxiv.org/abs/2308.00352 | MetaGPT abstract page |
| https://arxiv.org/html/2507.01701v1 | "Exploring Advanced LLM Multi-Agent Systems Based on Blackboard Architecture" |
| https://arxiv.org/html/2512.17913 | "Byzantine Fault-Tolerant Multi-Agent System for Healthcare: Gossip Protocol Approach" |
| https://arxiv.org/html/2502.04708v1 | Survey on Token-Based Distributed Mutual Exclusion Algorithms (2025) |
| https://openreview.net/forum?id=lqNqKUG2dn | "Which LLM Multi-Agent Protocol to Choose?" -- ProtocolBench and ProtocolRouter |
| https://arxiv.org/pdf/2510.17149 | "Which LLM Multi-Agent Protocol to Choose?" PDF |
| https://aclanthology.org/2025.findings-naacl.448/ | LLM-Coordination: evaluating multi-agent coordination abilities |
| https://github.com/eric-ai-lab/llm_coordination | LLM-Coordination code repository |
| https://arxiv.org/abs/2411.16189 | "Enhancing Multi-Agent Consensus through Third-Party LLM Integration" |
| https://arxiv.org/abs/2310.20151 | "Multi-Agent Consensus Seeking via Large Language Models" |
| https://dl.acm.org/doi/10.1145/3712003 | "LLM-Based Multi-Agent Systems for Software Engineering" survey |
| https://aclanthology.org/2025.findings-acl.259.pdf | MegaAgent: large-scale autonomous LLM-based multi-agent system |
| https://www.tandfonline.com/doi/full/10.1080/00207543.2025.2604311 | "Agentic LLMs in the supply chain: autonomous multi-agent consensus-seeking" |
| https://arxiv.org/html/2509.23537v1 | "Beyond the Strongest LLM: Multi-Turn Multi-Agent Orchestration vs. Single LLMs" |
| https://iceberg.mit.edu/protocol.pdf | Ripple Effect Protocol PDF (MIT Project Iceberg) |
| https://dl.acm.org/doi/abs/10.1109/TC.2024.3377921 | Dynamic Adaptive Framework for PBFT in IoT |
| https://www.scs.stanford.edu/20sp-cs244b/projects/Multi-Agent%20Consensus%20for%20Decision%20Making.pdf | Stanford: Distributed Multi-Agent Consensus for Fault Tolerant Decision Making |
| https://multiagents.org/2025_artifacts/reliable_decision_making_for_multi_agent_llm_systems.pdf | Reliable Decision-Making for Multi-Agent LLM Systems |

### Industry Documentation and Blog Posts

| URL | Description |
|-----|-------------|
| https://sre.google/sre-book/managing-critical-state/ | Google SRE Book -- when to use distributed consensus vs simpler patterns |
| https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/ | Google Research -- empirical study of multi-agent scaling, 5 architectures, error amplification |
| https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/ | AWS Builders' Library -- leader election via leases, tradeoffs, recommendations |
| https://cloud.google.com/blog/topics/developers-practitioners/implementing-leader-election-google-cloud-storage | Google Cloud -- storage-based leader election pattern |
| https://www.joyfulbikeshedding.com/blog/2021-05-19-robust-distributed-locking-algorithm-based-on-google-cloud-storage.html | Robust distributed locking via object storage with precondition headers |
| https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html | Kleppmann -- efficiency vs correctness locks, fencing tokens, why Redlock fails |
| https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns | Microsoft Azure -- AI agent orchestration patterns (sequential, concurrent, group chat, handoff, magentic) |
| https://www.media.mit.edu/articles/levels-of-agentic-coordination/ | MIT Media Lab -- Levels of Agentic Coordination (tools -> crowds taxonomy) |
| https://www.confluent.io/blog/event-driven-multi-agent-systems/ | Confluent -- four event-driven multi-agent patterns (orchestrator, hierarchical, blackboard, market) |
| https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html | POSIX atomic operations -- mkdir, rename, O_EXCL, link, symlink as coordination primitives |
| https://notes.muthu.co/2025/10/collaborative-problem-solving-in-multi-agent-systems-with-the-blackboard-architecture/ | Blackboard architecture deep dive -- components, control strategies, comparison to alternatives |
| https://www.rodriguez.today/articles/emergent-coordination-without-managers | Stigmergy for multi-agent AI -- managerless coordination via environmental signals |
| https://www.alphanome.ai/post/stigmergy-in-antetic-ai-building-intelligence-from-indirect-communication | Stigmergy in AI systems -- indirect coordination patterns |

### Framework Documentation

| URL | Description |
|-----|-------------|
| https://raft.github.io/ | Official Raft consensus algorithm site |
| https://microsoft.github.io/autogen/stable/_modules/autogen_agentchat/teams/_group_chat/_round_robin_group_chat.html | AutoGen RoundRobinGroupChat source |
| https://microsoft.github.io/autogen/0.2/docs/tutorial/conversation-patterns/ | AutoGen conversation patterns documentation |
| https://microsoft.github.io/autogen/0.2/docs/notebooks/agentchat_groupchat_customized/ | AutoGen customized speaker selection |
| https://microsoft.github.io/autogen/0.2/docs/reference/agentchat/groupchat/ | AutoGen GroupChat API reference |
| https://microsoft.github.io/autogen/stable//user-guide/core-user-guide/design-patterns/group-chat.html | AutoGen group chat design patterns |
| https://docs.crewai.com/en/learn/sequential-process | CrewAI sequential process documentation |
| https://docs.crewai.com/how-to/hierarchical-process | CrewAI hierarchical process documentation |
| https://github.com/crewAIInc/crewAI/issues/4783 | CrewAI bug: hierarchical delegation failure |
| https://github.com/crewAIInc/crewAI | CrewAI GitHub repository |
| https://google.github.io/adk-docs/agents/multi-agents/ | Google ADK multi-agent documentation |
| https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/ | Google ADK blog announcement |
| https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/ | Google ADK multi-agent patterns guide |
| https://docs.langchain.com/oss/python/langgraph/graph-api | LangGraph Graph API overview |
| https://www.langchain.com/langgraph | LangGraph official page |
| https://github.com/jackyzha0/miniraft | MiniRaft -- <1kloc Raft implementation |
| https://liangrunda.com/posts/raft-lite/ | Raft Lite -- event-loop based educational implementation |
| https://notes.eatonphil.com/2023-05-25-raft.html | Implementing Raft in Go walkthrough |
| https://github.com/tuannh982/sraft | Simple Raft implementation in Java (educational) |
| https://github.com/kata198/NamedAtomicLock | Python mkdir-based atomic lock library |
| https://github.com/claudioed/agent-blackboard | Multi-agent blackboard coordination for software engineering |
| https://github.com/madelson/DistributedLock/blob/master/docs/DistributedLock.FileSystem.md | Filesystem-based distributed lock documentation |

### Comparison and Analysis Articles

| URL | Description |
|-----|-------------|
| https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen | DataCamp comparison of CrewAI vs LangGraph vs AutoGen |
| https://dev.to/synsun/autogen-vs-langgraph-vs-crewai-which-agent-framework-actually-holds-up-in-2026-3fl8 | 2026 framework comparison -- LangGraph v1.0, framework convergence |
| https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared | OpenAgents 2026 framework comparison |
| https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026 | Top 10 agent frameworks 2026 analysis |
| https://galileo.ai/blog/multi-agent-coordination-strategies | 10 strategies for fixing multi-agent coordination |
| https://www.ai-agentsplus.com/blog/multi-agent-orchestration-patterns-2026 | Multi-agent orchestration patterns overview 2026 |
| https://zylos.ai/research/2026-03-08-ai-agent-delegation-team-coordination-patterns | Agent delegation and team coordination patterns research |
| https://www.adopt.ai/blog/multi-agent-frameworks | Multi-agent frameworks for enterprise AI |

### Reference Material

| URL | Description |
|-----|-------------|
| https://en.wikipedia.org/wiki/Raft_(algorithm) | Raft algorithm Wikipedia |
| https://en.wikipedia.org/wiki/Paxos_(computer_science) | Paxos Wikipedia |
| https://en.wikipedia.org/wiki/File_locking | File locking Wikipedia |
| https://en.wikipedia.org/wiki/Stigmergy | Stigmergy Wikipedia |
| https://en.wikipedia.org/wiki/Gossip_protocol | Gossip protocol Wikipedia |
| https://en.wikipedia.org/wiki/Blackboard_system | Blackboard system Wikipedia |
| https://en.wikipedia.org/wiki/Contract_Net_Protocol | Contract Net Protocol Wikipedia |
| https://en.wikipedia.org/wiki/Consensus_(computer_science) | Consensus in computer science Wikipedia |
| https://en.wikipedia.org/wiki/Byzantine_fault | Byzantine fault Wikipedia |
| https://en.wikipedia.org/wiki/Readers%E2%80%93writer_lock | Readers-writer lock Wikipedia |
| https://crdt.tech/ | CRDT official resource |
| https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type | CRDT Wikipedia |
| https://man7.org/linux/man-pages/man2/flock.2.html | flock(2) Linux manual |
| https://gavv.net/articles/file-locks/ | Comprehensive Linux file locking guide |
| https://martinfowler.com/articles/patterns-of-distributed-systems/paxos.html | Martin Fowler -- Paxos pattern |
| https://etcd.io/docs/v3.5/learning/why/ | etcd vs other key-value stores |

### Additional Links Encountered

| URL | Description |
|-----|-------------|
| https://www.geeksforgeeks.org/system-design/raft-consensus-algorithm/ | GeeksforGeeks Raft explainer |
| https://www.yugabyte.com/key-concepts/raft-consensus-algorithm/ | YugaByte Raft concepts |
| https://blog.container-solutions.com/raft-explained-part-1-the-consenus-problem | Raft explained series |
| https://news.ycombinator.com/item?id=37369826 | Hacker News discussion on Raft (2015) |
| https://www.the-paper-trail.org/post/2009-02-03-consensus-protocols-paxos/ | Paper Trail -- Paxos explained |
| https://www.scylladb.com/glossary/paxos-consensus-algorithm/ | ScyllaDB Paxos glossary |
| https://medium.com/@razkevich8/distributed-consensus-explained-from-paxos-theory-to-real-world-systems-2836a578eefc | Distributed consensus Paxos to real-world |
| https://decentralizedthoughts.github.io/2021-09-30-distributed-consensus-made-simple-for-real-this-time/ | Distributed consensus made simple |
| https://medium.com/@palanikalyan27/leader-election-in-distributed-systems-a-comprehensive-guide-e7d4056b83a9 | Leader election comprehensive guide |
| https://codefarm0.medium.com/leader-election-fencing-in-real-systems-zookeeper-kubernetes-etcd-245075c53455 | Leader election and fencing in real systems |
| https://www.designgurus.io/blog/5-best-leader-election-algorithms | 5 best leader election algorithms |
| https://javachallengers.com/leader-election-systems-design/ | Leader election in systems design |
| https://github.com/gabihodoroaga/leaderelection | Go leader election implementation |
| https://www.resilio.com/platform/features/file-locking/ | Resilio distributed file locking |
| https://apenwarr.ca/log/20101213 | Everything about file locking (deep dive) |
| https://www.baeldung.com/linux/file-locking | Baeldung Linux file locking tutorial |
| https://mywiki.wooledge.org/BashFAQ/045 | Bash FAQ on file locking |
| https://gist.github.com/pwillis-els/b01b22f1b967a228c31db3cf2789ee13 | Simple atomic file locking in Linux |
| https://medium.com/@dp2580/building-intelligent-multi-agent-systems-with-mcps-and-the-blackboard-pattern-to-build-systems-a454705d5672 | Blackboard pattern with MCPs (access denied) |
| https://research.google/pubs/blackboard-multi-agent-systems-for-information-discovery-in-data-science/ | Google Research blackboard multi-agent paper |
| https://arxiv.org/html/2510.01285v1 | LLM-based Multi-Agent Blackboard System for Data Science |
| https://aws.amazon.com/blogs/machine-learning/multi-agent-collaboration-patterns-with-strands-agents-and-amazon-nova/ | AWS Strands multi-agent patterns |
| https://aws.amazon.com/blogs/devops/multi-agent-collaboration-with-strands/ | AWS Strands DevOps multi-agent collaboration |
| https://oneuptime.com/blog/post/2026-01-30-agent-coordination/view | How to create agent coordination |
| https://www.v7labs.com/blog/multi-agent-ai | Multi-agent AI systems overview |
| https://botpress.com/blog/multi-agent-framework | Building AI workflows with multi-agent frameworks |
| https://medium.com/@o39joey/a-comprehensive-guide-to-langgraph-managing-agent-state-with-tools-ae932206c7d7 | LangGraph state management guide |
| https://medium.com/@omeryalcin48/langgraph-notes-state-management-62ea5b5a5cdd | LangGraph state management notes |
| https://dev.to/sreeni5018/the-architecture-of-agent-memory-how-langgraph-really-works-59ne | Architecture of LangGraph agent memory |
| https://aankitroy.com/blog/langgraph-state-management-memory-guide | LangGraph state and memory guide |
| https://aipractitioner.substack.com/p/scaling-langgraph-agents-parallelization | Scaling LangGraph agents |
| https://deepwiki.com/langchain-ai/langchain-academy/5-state-management | LangChain Academy state management |
| https://medium.com/@bharatraj1918/langgraph-state-management-part-1-how-langgraph-manages-state-for-multi-agent-workflows-da64d352c43b | LangGraph state management Part 1 |
| https://medium.com/@mor.hananovitz/agents-101-reducers-demonstrated-f2c480162641 | LangGraph reducers demonstrated |
| https://deepwiki.com/crewAIInc/crewAI/2.1-crew-configuration-and-orchestration | CrewAI configuration and orchestration |
| https://www.ibm.com/think/topics/metagpt | IBM -- What is MetaGPT |
| https://www.ibm.com/think/tutorials/multi-agent-prd-ai-automation-metagpt-ollama-deepseek | MetaGPT PRD automation tutorial |
| https://github.com/geekan/MetaGPT-docs/blob/main/src/en/guide/tutorials/multi_agent_101.md | MetaGPT multi-agent tutorial |
| https://www.learnprompt.pro/docs/llm-agents/metagpt/ | MetaGPT overview |
| https://proceedings.iclr.cc/paper_files/paper/2024/file/6507b115562bb0a305f1958ccc87355a-Paper-Conference.pdf | MetaGPT ICLR 2024 paper |
| https://codelabs.developers.google.com/codelabs/create-multi-agents-adk-a2a | Google ADK + A2A codelab |
| https://cloud.google.com/blog/topics/developers-practitioners/building-collaborative-ai-a-developers-guide-to-multi-agent-systems-with-adk | Google Cloud ADK multi-agent guide |
| https://www.firecrawl.dev/blog/google-adk-multi-agent-tutorial | Google ADK comprehensive tutorial |
| https://www.datacamp.com/tutorial/agent-development-kit-adk | DataCamp ADK tutorial |
| https://github.com/google/adk-python | Google ADK Python repository |
| https://www.sitepoint.com/agent-communication-protocols-comparing-mcp--cord--and-smolagents/ | Comparing MCP, Cord, Smolagents protocols |
| https://www.kai-waehner.de/blog/2025/05/26/agentic-ai-with-the-agent2agent-protocol-a2a-and-mcp-using-apache-kafka-as-event-broker/ | A2A and MCP with Kafka |
| https://www.confluent.io/resources/ebook/guide-to-event-driven-agents/ | Confluent guide to event-driven agents |
| https://www.confluent.io/blog/multi-agent-orchestrator-using-flink-and-kafka/ | Multi-agent orchestrator with Flink and Kafka |
| https://www.confluent.io/blog/the-future-of-ai-agents-is-event-driven/ | Confluent -- the future of AI agents is event-driven |
| https://medium.com/@seanfalconer/a-distributed-state-of-mind-event-driven-multi-agent-systems-226785b479e6 | Event-driven multi-agent systems analysis |
| https://www.infoworld.com/article/3808083/a-distributed-state-of-mind-event-driven-multi-agent-systems.html | InfoWorld event-driven multi-agent systems |
| https://highscalability.com/gossip-protocol-explained/ | High Scalability gossip protocol explained |
| https://medium.com/nerd-for-tech/gossip-protocol-in-distributed-systems-e2b0665c7135 | Gossip protocol in distributed systems |
| https://www.designgurus.io/answers/detail/what-is-a-gossip-protocol-in-distributed-systems-and-how-is-it-used-for-data-or-state-dissemination | Design Gurus gossip protocol explainer |
| https://www.cs.cornell.edu/courses/cs6410/2016fa/slides/19-p2p-gossip.pdf | Cornell CS gossip protocols slides |
| https://www.cs.uic.edu/~ajayk/Chapter9.pdf | UIC Chapter 9: Distributed Mutual Exclusion |
| https://cse.buffalo.edu/~eblanton/course/cse586-2021-0s/materials/29-mutex.pdf | Buffalo CSE mutual exclusion lecture |
| https://cseweb.ucsd.edu/classes/sp16/cse291-e/applications/ln/lecture5.html | UCSD distributed concurrency control |
| https://www.bodunhu.com/blog/posts/specifying-token-ring-for-mutual-exclusion/ | Token ring mutual exclusion specification |
| https://link.springer.com/chapter/10.1007/3-540-69108-1_11 | Efficiency of token-passing mutex experiments |
| https://www.researchgate.net/publication/221191880_Multi-Token_Distributed_Mutual_Exclusion_Algorithm | Multi-token distributed mutual exclusion |
| https://www.geeksforgeeks.org/mutual-exclusion-in-distributed-system/ | GeeksforGeeks distributed mutual exclusion |
| https://www.geeksforgeeks.org/difference-between-token-based-and-non-token-based-algorithms-in-distributed-system/ | Token vs non-token algorithms comparison |
| https://www.geeksforgeeks.org/distributed-systems/gossip-protocol-in-disrtibuted-systems/ | GeeksforGeeks gossip protocol |
| https://www.geeksforgeeks.org/operating-systems/consensus-problem-of-distributed-systems/ | GeeksforGeeks consensus problem |
| https://www.geeksforgeeks.org/operating-systems/consensus-algorithms-in-distributed-system/ | GeeksforGeeks consensus algorithms |
| https://www.geeksforgeeks.org/computer-networks/paxos-consensus-algorithm/ | GeeksforGeeks Paxos |
| https://www.designgurus.io/answers/detail/what-is-distributed-consensus-and-why-is-it-important-in-multi-node-systems | Design Gurus distributed consensus explainer |
| https://www.preethikasireddy.com/post/lets-take-a-crack-at-understanding-distributed-consensus | Understanding distributed consensus |
| https://candost.blog/books/consistency-and-consensus-in-distributed-systems/ | DDIA consistency and consensus notes |
| https://www.alibabacloud.com/blog/from-distributed-consensus-algorithms-to-the-blockchain-consensus-mechanism_595315 | Alibaba: consensus algorithms to blockchain |
| https://www.tandfonline.com/doi/full/10.1080/21642583.2014.897658 | Overview of consensus in constrained multi-agent coordination |
| https://medium.com/@mani.saksham12/raft-and-paxos-consensus-algorithms-for-distributed-systems-138cd7c2d35a | Raft and Paxos comparison |
| https://dev.to/narendars/distributed-consensus-paxos-vs-raft-and-modern-implementations-2gng | Distributed consensus Paxos vs Raft |
| https://medium.com/@kanerika/multi-agent-workflows-a-practical-guide-to-design-tools-and-deployment-3b0a2c46e389 | Multi-agent workflows practical guide |
| https://github.com/tmgthb/Autonomous-Agents | Autonomous Agents research papers collection |
| https://github.com/kyegomez/awesome-multi-agent-papers | Awesome multi-agent papers collection |
| https://arxiv.org/html/2506.19676v1 | Survey of LLM-Driven AI Agent Communication protocols and security |
| https://arxiv.org/html/2603.09134 | AgenticCyOps: securing multi-agentic AI in enterprise |
| https://www.mdpi.com/2076-3417/8/10/1919 | Scalable dynamic multi-agent PBFT in permissioned blockchain |
| https://eprint.iacr.org/2021/911.pdf | SoK: Understanding BFT in the age of blockchains |
| https://earezki.com/ai-news/2026-02-24-a-coding-implementation-to-simulate-practical-byzantine-fault-tolerance-with-asyncio-malicious-nodes-and-latency-analysis/ | PBFT simulation with asyncio |
| https://arxiv.org/abs/1805.06358 | CRDTs formal paper |
| https://pages.lip6.fr/Marc.Shapiro/papers/RR-7687.pdf | CRDT original research report |
| https://dl.acm.org/doi/10.1145/3695249 | Approaches to CRDTs -- ACM Computing Surveys |
| https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/ | CRDT Dictionary field guide |
| https://redis.io/blog/diving-into-crdts/ | Redis diving into CRDTs |
| https://pasksoftware.com/crdts/ | What are CRDTs explainer |
| https://medium.com/@goyalkavya/conflict-free-replicated-data-types-crdts-d40d49defe62 | CRDTs overview |
| https://www.dremio.com/wiki/conflict-free-replicated-data-type/ | Dremio CRDT wiki |
| https://www.resilio.com/blog/distributed-file-locking | Resilio distributed file locking blog |
| https://www.alibabacloud.com/blog/how-can-we-ensure-the-consistency-of-nfs-file-locks_597359 | NFS file lock consistency |
| https://www.softhandtech.com/what-is-locking-a-file/ | Understanding file locking guide |
| https://www.ituonline.com/tech-definitions/what-is-file-locking/ | ITU file locking definition |
| https://linux.die.net/man/2/flock | flock(2) Linux die.net manual |
| https://docs.kernel.org/filesystems/locking.html | Linux kernel filesystem locking docs |
| https://lwn.net/Articles/667210/ | LWN optional mandatory locking |
| https://www.reidgsmith.com/The_Contract_Net_Protocol_Dec-1980.pdf | Contract Net Protocol original paper (1980) |
| https://dl.acm.org/doi/10.1109/TC.1980.1675516 | Contract Net Protocol ACM reference |
| https://www.mdpi.com/1999-4893/12/4/70 | Improved Contract Net Protocol under multi-agent systems |
| https://www.nature.com/articles/s41598-022-26324-6 | Self-organised division of labour driven by stigmergy in leaf-cutter ants |
| https://www.academia.edu/2860075/Stigmergy_as_a_generic_mechanism_for_coordination_definition_varieties_and_aspects | Stigmergy as generic coordination mechanism |
| https://files01.core.ac.uk/download/pdf/236055548.pdf | Engineering human stigmergy |
| https://www.fiveable.me/swarm-intelligence-and-robotics/unit-6/stigmergy/study-guide/L6j1cyesyCpC1JCs | Fiveable stigmergy study guide |
| https://medium.com/@jsmith0475/collective-stigmergic-optimization-leveraging-ant-colony-emergent-properties-for-multi-agent-ai-55fa5e80456a | Collective stigmergic optimization for multi-agent AI |
| https://www.sciencedirect.com/topics/engineering/stigmergy | ScienceDirect stigmergy overview |
| https://lpm.media.mit.edu/agentic_draft.pdf | MIT Levels of Social Orchestration for Agentic Systems (draft) |
| https://microraft.io/ | MicroRaft Java Raft implementation |
| https://www.dabeaz.com/raft.html | David Beazley Raft tutorial |
| https://gist.github.com/yurishkuro/10cb2dc42f42a007a8ce0e055ed0d171 | etcd vs consul comparison |
| https://www.techrxiv.org/users/1000434/articles/1360836/master/file/data/LLM_Agent_Tutorial/LLM_Agent_Tutorial.pdf | Hands-on LLM-based Agents tutorial |
| https://xue-guang.com/post/llm-marl/ | LLMs for multi-agent cooperation |
| https://www.classicinformatics.com/blog/how-llms-and-multi-agent-systems-work-together-2025 | LLMs and multi-agent systems 2025 |
| https://www.emergentmind.com/topics/consensus-driven-reasoning | Emergent Mind consensus-driven reasoning |
| https://www.emergentmind.com/topics/hierarchical-agentic-taxonomy | Emergent Mind hierarchical agentic taxonomy |
| https://www.alphaxiv.org/overview/2512.20184v1 | AlphaXiv Aegean paper overview |
| https://www.themoonlight.io/en/review/reaching-agreement-among-reasoning-llm-agents | Moonlight Aegean paper review |
| https://papers.cool/arxiv/2510.16572 | Cool Papers Ripple Effect Protocol |
| https://slashpage.com/haebom/d367nxm3qdk5xmj98pv1 | Ripple Effect Protocol summary |
| https://openreview.net/forum?id=MjQCuQhtn4 | Ripple Effect Protocol OpenReview |
| https://openreview.net/pdf/69f40f61b0874e1186d631ab17393be6be8b0cf1.pdf | Ripple Effect Protocol OpenReview PDF |
| https://papers.ssrn.com/sol3/Delivery.cfm/91193b26-cc85-46e7-8ab6-52fc49f8be9e-MECA.pdf?abstractid=5817766&mirid=1 | Real-Time Trust-Weighted Consensus for LLMs |
| https://www.preprints.org/manuscript/202511.1370/v1/download | Multi-Agent LLM Systems: From concept paper |
| https://www.sciencedirect.com/science/article/pii/S0950705125016661 | Coordinated LLM multi-agent systems for collaborative QA |
| https://aclanthology.org/2025.acl-long.421.pdf | Evaluating collaboration and competition of LLM agents |
| https://medium.com/@aaronyuqi/first-hand-comparison-of-langgraph-crewai-and-autogen-30026e60b563 | First-hand comparison of frameworks |
| https://calmops.com/ai/ai-agent-frameworks-comparison-2026/ | AI agent frameworks complete guide 2026 |
| https://latenode.com/blog/platform-comparisons-alternatives/automation-platform-comparisons/langgraph-vs-autogen-vs-crewai-complete-ai-agent-framework-comparison-architecture-analysis-2025 | LateNode framework comparison 2025 |
| https://topuzas.medium.com/the-great-ai-agent-showdown-of-2026-openai-autogen-crewai-or-langgraph-7b27a176b2a1 | AI agent showdown 2026 |
| https://dev.to/topuzas/the-great-ai-agent-showdown-of-2026-openai-autogen-crewai-or-langgraph-1ea8 | Dev.to AI agent showdown 2026 |
| https://github.com/microsoft/autogen/issues/3215 | AutoGen feature request: subset speaker selection |
| https://github.com/microsoft/autogen/discussions/5016 | AutoGen discussion: FSM speaker transition control |
| https://docs.ag2.ai/latest/docs/api-reference/autogen/GroupChat/ | AG2 GroupChat API reference |
| https://medium.com/google-cloud/tutorial-multi-agent-interactions-with-autogen-and-gemini-part-8-group-chat-511440860129 | AutoGen + Gemini group chat tutorial |
| https://arxiv.org/pdf/2512.20184 | Aegean paper PDF |
| https://www.arxiv.org/pdf/2508.01531 | Gossip protocols for agentic AI PDF |
| https://www.arxiv.org/pdf/2510.16572 | Ripple Effect Protocol PDF |
| https://arxiv.org/pdf/2510.17149 | Which LLM Multi-Agent Protocol to Choose PDF |
| https://www.arxiv.org/pdf/2504.14668 | BFT for AI Safety PDF |
| https://arxiv.org/pdf/2205.02572 | Byzantine fault tolerance in distributed ML survey |
| https://research.google/archive/gfs-sosp2003.pdf | Google File System original paper |
| https://medium.com/@nehapandey408/understanding-the-distributed-file-system-that-powers-google-c84d5f482afb | Understanding Google's distributed filesystem |
| https://www.0xkishan.com/blogs/the-google-file-system-explained-part-one | Google File System explained |
| https://www.ijfmr.com/papers/2026/1/66724.pdf | Secure, trustworthy, regulated framework for AI |
| https://theses.hal.science/tel-05165765v1/file/2025IMTA0474_DeLacour-Divi.pdf | BFT thesis |
| https://repositum.tuwien.at/bitstream/20.500.12708/217904/1/Luo%20Haoxiang%20-%202025-05-08%20-%20A%20Weighted%20Byzantine%20Fault%20Tolerance%20Consensus...pdf | Weighted BFT consensus thesis |
| https://www.researchgate.net/publication/396715892_Ripple_Effect_Protocol_Coordinating_Agent_Populations | REP ResearchGate |
| https://www.researchgate.net/publication/394270662_CONSENSAGENT | CONSENSAGENT ResearchGate |
| https://www.researchgate.net/publication/399026612_Reaching_Agreement_Among_Reasoning_LLM_Agents | Aegean ResearchGate |
| https://x.com/rohanpaul_ai/status/2006386362942214174 | Aegean paper discussion on X |
| https://x.com/xwang174/status/1926299165526573203 | CONSENSAGENT author announcement on X |
| https://codelabs.developers.google.com/instavibe-adk-multi-agents/instructions | Google ADK multi-agent codelab |

---

## Open Questions That Emerged

1. **Blackboard control strategy for Sherpa**: Which control strategy (priority-based, focus-based, opportunistic, goal-directed) best fits Sherpa's Planner/Worker/Judge model? Priority-based seems closest, but goal-directed (advance toward initiative objectives) may produce better outcomes.

2. **Fencing token implementation**: How should monotonic version numbers work with git-based workflows? Git commit hashes are not monotonic. Options: timestamp-based versions in file headers, sequential counters in a version file, or git merge-base comparisons.

3. **Stability horizons for reviews**: Aegean's beta-round stability concept -- should Sherpa require that a proposal receive consistent approval across multiple review cycles before integration? What is the right beta value for human+AI review?

4. **CRDT selection for task boards**: If multiple agents update task status concurrently, which CRDT type fits? LWW-Register (last writer wins) is simplest but loses information. OR-Set (observed-remove set) preserves concurrent additions. The sqlite-agentic-state initiative should inform this choice.

5. **Sycophancy in integration review**: CONSENSAGENT found agents reinforce rather than critique each other. How prevalent is this in Sherpa's Judge pattern? Should the integration review skill include anti-sycophancy prompting?

6. **When to upgrade from filesystem to event-driven**: At what agent count does filesystem polling become a bottleneck? The GEACL paper suggests gossip overhead is 3% at 200 agents -- implying filesystem polling should work well below that. But filesystem operations are slower than in-memory events.

7. **Contract Net Protocol for specialized agents**: If agents develop specializations (some better at research, some at code review), should the coordinator use bid-based task allocation (CNP) rather than direct assignment? What's the overhead for 3-20 agents?

8. **Protocol routing**: The "Which LLM Multi-Agent Protocol to Choose?" paper found 36% task completion time variance from protocol choice. Should Sherpa's coordinator select coordination patterns dynamically based on task properties, or is static configuration sufficient for the initial version?
