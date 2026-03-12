# Consensus vs. Coordination Patterns for Multi-Agent AI Systems

**Research iteration:** 1
**Date:** 2026-03-11
**Scope:** Are consensus protocols (Raft, Paxos, PBFT) the right model for AI agent coordination, or are simpler patterns sufficient for 3-20 agents?
**Methodology note:** WebSearch and WebFetch were unavailable during this iteration. All claims are sourced from training knowledge (papers, docs, and projects published through early 2025). URLs are provided for verification — a follow-up iteration should live-fetch these to confirm accuracy and capture updated content.

---

## Key Discoveries

### 1. Raft Consensus — What Problem It Actually Solves

- **Raft solves replicated state machine consensus**: ensuring N servers agree on the same sequence of commands, surviving up to (N-1)/2 failures. The core paper is Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm" (USENIX ATC 2014). (https://raft.github.io/raft.pdf)
- **The problem Raft addresses is NOT coordination of workers — it's replication of a log.** Raft ensures that if a leader accepts a write, that write is durably committed across a majority. This is fundamentally about data consistency across replicas, not task assignment or turn-taking.
- **Raft has three sub-problems**: leader election, log replication, and safety (ensuring logs never diverge). Leader election alone is the simplest piece — the rest is machinery for replicated state. (https://raft.github.io/)
- **Simplest Raft implementations** are still 1,000-3,000 lines of code. The hashicorp/raft Go library is widely used and considered one of the more accessible implementations. (https://github.com/hashicorp/raft)
- **Raft is overkill for 3-20 AI agents** unless those agents need to agree on a replicated log of all state mutations. If you have a single source of truth (filesystem, database), you don't need replicated consensus — you need concurrency control on that single source.

### 2. Paxos — Why It's Complex, What "Simplified" Means

- **Paxos (Lamport, 1998/2001)** solves the same fundamental problem as Raft — consensus on a single value among distributed processes. The original paper "The Part-Time Parliament" was famously difficult to understand, leading Lamport to write "Paxos Made Simple" (2001). (https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)
- **Why Paxos is hard**: The basic protocol decides a single value. Real systems need Multi-Paxos (a sequence of values), which requires leader election, log compaction, membership changes — none of which are specified in the original paper. Implementers must fill in these gaps. Chubby (Google's lock service) used Paxos internally; the "Paxos Made Live" paper (Chandra et al., 2007) describes the engineering challenges. (https://research.google/pubs/pub33002/)
- **"Simplified Paxos" typically means Multi-Paxos with a stable leader**, which converges toward Raft's design. Raft was explicitly designed as "Paxos made understandable."
- **For Sherpa's use case**: Paxos is even more overkill than Raft. It solves the problem of agreement without a central coordinator — but Sherpa HAS a central coordinator (the filesystem / MCP server).

### 3. PBFT — Byzantine Fault Tolerance

- **PBFT (Castro & Liskov, 1999)** handles Byzantine faults — nodes that lie, send conflicting messages, or behave arbitrarily. Requires 3f+1 nodes to tolerate f Byzantine faults. (http://pmg.csail.mit.edu/papers/osdi99.pdf)
- **Completely irrelevant for AI agent coordination.** Byzantine tolerance is for adversarial environments (blockchains, untrusted networks). Sherpa's agents are all Claude instances under the same operator's control. If an agent produces garbage, the problem is the prompt, not Byzantine behavior.
- **The only edge case**: if agents could hallucinate state mutations that corrupt shared state. But this is better handled by validation/schema checks than by Byzantine consensus.

### 4. Leader Election — The Actually Useful Piece

- **Leader election is the one consensus sub-problem that maps well to multi-agent coordination.** A "coordinator agent" that assigns work, resolves conflicts, and sequences decisions is a natural pattern.
- **ZooKeeper** uses ZAB (ZooKeeper Atomic Broadcast) for leader election. Clients create ephemeral sequential znodes; the lowest-numbered znode holder becomes leader. (https://zookeeper.apache.org/doc/current/recipes.html#sc_leaderElection)
- **etcd** uses Raft internally; leader election is exposed via the `Election` API in the `clientv3/concurrency` package. (https://etcd.io/docs/v3.5/dev-guide/api_concurrency_reference_v3/)
- **Consul** provides a leader election primitive via session-based locking on KV keys. (https://developer.hashicorp.com/consul/tutorials/developer-configuration/application-leader-elections)
- **For Sherpa**: A "coordinator agent" pattern (one agent is the designated coordinator, others are workers) is far simpler than full consensus. The coordinator doesn't need to be elected dynamically — it can be statically assigned or designated by the human. If the coordinator fails, the human reassigns. This eliminates the need for an election protocol entirely.
- **Filesystem-based leader election** is possible: create a lock file with an atomic `O_CREAT|O_EXCL` open. The agent that successfully creates the file is the leader. This is how many Unix daemons do it. Stale locks are the failure mode (agent crashes without cleanup), solved by including a PID/timestamp and having a TTL-based expiry.

### 5. Token-Passing and Mutex Patterns

- **Token ring** is a classic coordination pattern: a token circulates among nodes, and only the token holder can act. This guarantees mutual exclusion without a central coordinator. (https://en.wikipedia.org/wiki/Token_ring)
- **Failure modes**: If the token holder crashes, the token is lost. Recovery requires a token regeneration protocol, which itself requires consensus (or a timeout-based heuristic). For 3-20 agents operating over minutes/hours, a simple timeout ("if no activity from token holder in 5 minutes, generate new token") is sufficient.
- **Filesystem token**: A file that contains the current token holder's identifier. Agents poll the file. The current holder writes the next holder's ID when done. This is essentially sequential execution with explicit handoff.
- **Scalability**: Token-passing serializes all work. For 3-20 agents, this means agents are idle most of the time waiting for the token. This is acceptable ONLY if the work is inherently sequential. If agents can work in parallel on independent tasks, token-passing wastes capacity.
- **Distributed mutex via filesystem**: `flock()` (advisory file locking) or `lockfile` commands. SQLite uses its own locking protocol for concurrent access. These are well-understood patterns. (https://www.sqlite.org/lockingv3.html)

### 6. Turn-Based / Round-Robin Coordination

- **Board game AI** uses strict turn order: each agent acts in sequence, observing the full state before deciding. This is the simplest coordination pattern — no concurrency issues because there IS no concurrency.
- **Round-robin** is a degenerate case of token-passing where the token follows a fixed order. No election, no recovery — just a counter modulo N.
- **Multi-agent reinforcement learning (MARL)** research distinguishes between simultaneous action (all agents act at once, then environment resolves) and sequential action (turn-based). For LLM agents, sequential/turn-based is far more natural because each agent needs to see the effects of previous agents' actions.
- **The "conversation" pattern**: AutoGen, CrewAI, and similar frameworks model multi-agent interaction as a conversation where agents take turns speaking. This IS turn-based coordination, just not formalized as such.

### 7. What AutoGen, CrewAI, and LangGraph Actually Use

- **AutoGen (Microsoft)**: Uses a "conversation-based" coordination model. Agents are arranged in chat topologies — two-agent chat, group chat, or nested chat. Group chat uses a "speaker selection" policy that can be round-robin, random, or LLM-decided (the LLM picks who speaks next based on conversation context). There is NO consensus protocol. Coordination is sequential message-passing in a shared conversation. (https://microsoft.github.io/autogen/docs/tutorial/conversation-patterns)
  - AutoGen 0.4 (late 2024 rewrite) introduced `Team` abstractions: `RoundRobinGroupChat`, `SelectorGroupChat` (LLM-selected next speaker), and `Swarm` (handoff-based). Still sequential, no parallelism. (https://microsoft.github.io/autogen/dev/user-guide/agentchat-user-guide/index.html)

- **CrewAI**: Uses a "crew" metaphor with sequential or hierarchical process modes. Sequential = agents run in a fixed order, each receiving the previous agent's output. Hierarchical = a "manager" agent delegates to workers and synthesizes results. No consensus protocol — the manager IS the coordinator. (https://docs.crewai.com/concepts/processes)
  - CrewAI's "hierarchical" mode is exactly the "coordinator agent" pattern: one agent has authority to assign tasks and accept/reject results.

- **LangGraph (LangChain)**: Models agent workflows as state machines (directed graphs). Nodes are agent actions, edges are conditional transitions. Coordination is the graph structure itself — the developer defines who goes next based on state. Supports parallel fan-out (multiple nodes execute simultaneously) with a "reducer" to merge results. (https://langchain-ai.github.io/langgraph/)
  - LangGraph's `Send` API enables dynamic fan-out to multiple agents, with results collected by a downstream node. This is map-reduce, not consensus.
  - LangGraph explicitly supports "human-in-the-loop" as a first-class pattern — the graph pauses for human approval at designated checkpoints. This aligns with Sherpa's model.

- **OpenAI Swarm (experimental)**: Agents can "hand off" to other agents via function calls. The active agent decides who goes next. No central coordinator, no consensus — just sequential execution with dynamic routing. (https://github.com/openai/swarm)

- **Key finding: NONE of these frameworks use consensus protocols.** They all use some combination of: sequential execution, round-robin, manager/worker hierarchy, or LLM-decided routing. The most sophisticated pattern in production is LangGraph's state-machine-with-fan-out, which is map-reduce, not consensus.

### 8. Gossip Protocols and Eventual Consistency

- **Gossip protocols** (epidemic protocols) spread state updates by having each node periodically share its state with random peers. Eventually all nodes converge. Used by Cassandra, DynamoDB, and SWIM (membership protocol). (https://en.wikipedia.org/wiki/Gossip_protocol)
- **CRDTs (Conflict-free Replicated Data Types)** enable automatic conflict resolution for concurrent updates. Each agent maintains its own replica; merges are deterministic. Relevant CRDT types: G-Counter (grow-only counter), OR-Set (observed-remove set), LWW-Register (last-writer-wins). (https://crdt.tech/)
- **For Sherpa**: Gossip is interesting if agents maintain local caches of shared state. Rather than every agent reading the filesystem on every action, agents could "gossip" state deltas. But with 3-20 agents and a shared filesystem, just reading the filesystem IS the gossip protocol — the filesystem is the shared medium. CRDTs become relevant if agents make concurrent writes to the same data (e.g., updating a task board simultaneously). The sqlite-agentic-state initiative is already exploring this via SQLite-Sync CRDTs.
- **Automerge** and **Yjs** are CRDT libraries that handle collaborative editing. Automerge specifically targets JSON-like documents. (https://automerge.org/) (https://yjs.dev/)
- **cr-sqlite** embeds CRDTs directly into SQLite, enabling multi-writer SQLite databases that merge deterministically. This is highly relevant to the sqlite-agentic-state initiative. (https://github.com/vlcn-io/cr-sqlite)

### 9. Consensus Protocols Adapted for AI/LLM Agents

- **Research in this area is thin** (as of early 2025). Most multi-agent LLM research focuses on prompting strategies (debate, reflection, voting) rather than distributed systems coordination.
- **LLM-based "debate" protocols**: Du et al., "Improving Factuality and Reasoning in Language Models through Multiagent Debate" (2023). Multiple LLMs argue and converge on an answer through rounds of debate. This is conceptually similar to consensus but implemented as iterative prompting, not a distributed protocol. (https://arxiv.org/abs/2305.14325)
- **"Society of Mind" approaches**: Zhuge et al., "Mindstorms in Natural Language-Based Societies of Mind" (2023). Multiple LLM agents with different roles collaborate through structured conversation. Coordination is turn-based conversation, not a formal protocol. (https://arxiv.org/abs/2305.17066)
- **"LLM Consensus"**: A few papers explore using LLMs to reach consensus on factual claims through iterative rounds. This is "consensus" in the social/epistemic sense, not the distributed systems sense. The mechanism is repeated prompting until agents agree, with no crash tolerance or formal safety guarantees.
- **AgentVerse** (Chen et al., 2023): Framework for collaborative LLM agents. Uses a "recruitment, collaborative decision-making, execution, evaluation" cycle. Decision-making can involve voting or discussion among agents. (https://arxiv.org/abs/2308.10848)
- **MetaGPT** (Hong et al., 2023): Assigns software engineering roles to agents (product manager, architect, engineer). Coordination is sequential pipeline — each role completes before the next begins. Documents (PRDs, designs) serve as the coordination medium, similar to Sherpa's filesystem approach. (https://arxiv.org/abs/2308.00352) (https://github.com/geekan/MetaGPT)
- **ChatDev** (Qian et al., 2023): Simulates a software company with agent roles. Uses "chat chains" — sequential phases where pairs of agents discuss until consensus (via a "chat termination" condition). (https://arxiv.org/abs/2307.07924) (https://github.com/OpenBMB/ChatDev)

### 10. The Filesystem as Coordination Medium

- **The filesystem IS the distributed state store in Sherpa's model.** This is closer to a shared database than a peer-to-peer network. The consistency question becomes: how do you prevent race conditions on file writes?
- **Git itself is a coordination protocol**: branches provide isolation, merges provide integration, conflicts provide detection of concurrent edits. This is optimistic concurrency control — assume no conflicts, detect and resolve when they occur.
- **File locking** (`flock()`, `fcntl()`) provides pessimistic concurrency control on POSIX systems. Not available on all filesystems (NFS advisory locking is notoriously unreliable).
- **Atomic file writes** (write to temp file, then `rename()`) prevent torn reads. This is how many databases ensure crash consistency.
- **The "state file" pattern**: A single JSON/YAML file that represents the current coordination state (who's working on what, what's pending, what's done). Agents read before acting, write after acting. Race condition: two agents read the same state, both decide to take the same task. Solution: atomic compare-and-swap (read, modify, write-if-unchanged) or a lock.

---

## Implications for Sherpa's Filesystem-Based Multi-Agent Coordination

### What Sherpa Does NOT Need

1. **Full consensus protocols (Raft, Paxos, PBFT)**: These solve replicated state across unreliable networks. Sherpa has a single filesystem as source of truth — there's nothing to replicate.
2. **Byzantine fault tolerance**: All agents are Claude instances under operator control. Misbehavior is a prompt/config problem, not a trust problem.
3. **Sub-millisecond coordination**: Agents operate on session timescales (minutes to hours). Lock contention measured in seconds is perfectly acceptable.

### What Sherpa DOES Need

1. **Mutual exclusion on shared resources**: When two agents want to modify the same file, one must wait. File locking (`flock()`) or atomic compare-and-swap on a state file handles this.
2. **Task assignment without double-claiming**: A coordinator pattern (one agent assigns, others execute) or an atomic "claim" mechanism (agent writes its ID to a task file using atomic create/rename).
3. **State visibility**: Every agent needs to see what other agents are doing. The filesystem already provides this — agents read each other's activity logs, task files, etc.
4. **Ordering of dependent work**: If Agent B's work depends on Agent A's output, B must wait for A. This is a simple dependency graph, not consensus — a DAG executor (like LangGraph's approach) suffices.
5. **Conflict detection on concurrent prose edits**: If two agents edit the same document, the merge must be handled. Git's merge machinery or CRDTs (from the sqlite-agentic-state initiative) address this.

### Recommended Pattern: Coordinator + File Locks + Optimistic Concurrency

The pattern that fits Sherpa's constraints:

1. **Coordinator agent** (statically assigned or human-designated) owns the task board and assignment decisions.
2. **Workers** claim assigned tasks via atomic file operations (create a `.lock` or `.claimed` file).
3. **Optimistic concurrency** for document edits — work on branches, detect conflicts at merge time (git's existing model).
4. **Filesystem polling** (or MCP-mediated notification) for state visibility — each agent reads the task board and activity logs before acting.
5. **Human-in-the-loop** for conflict resolution that can't be automated — the Judge role in the Planner/Worker/Judge model.

This is essentially CrewAI's "hierarchical" mode implemented on a filesystem substrate. No consensus protocol needed.

### The One Place Consensus Thinking Helps

**Ordering of state mutations when the coordinator is absent.** If Sherpa evolves to support truly peer-to-peer agent coordination (no designated coordinator), then a lightweight consensus mechanism for "who acts next" becomes valuable. But even then, a simple leader election (filesystem lock file with TTL) or round-robin suffices for 3-20 agents.

---

## Sources (with descriptions)

### Papers

| URL | Description |
|-----|-------------|
| https://raft.github.io/raft.pdf | Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm" (2014). The Raft paper. |
| https://lamport.azurewebsites.net/pubs/paxos-simple.pdf | Lamport, "Paxos Made Simple" (2001). The accessible Paxos explanation. |
| https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf | Lamport, "The Part-Time Parliament" (1998). The original Paxos paper. |
| http://pmg.csail.mit.edu/papers/osdi99.pdf | Castro & Liskov, "Practical Byzantine Fault Tolerance" (1999). PBFT paper. |
| https://research.google/pubs/pub33002/ | Chandra et al., "Paxos Made Live" (2007). Engineering challenges of real-world Paxos. |
| https://arxiv.org/abs/2305.14325 | Du et al., "Improving Factuality and Reasoning in Language Models through Multiagent Debate" (2023). |
| https://arxiv.org/abs/2305.17066 | Zhuge et al., "Mindstorms in Natural Language-Based Societies of Mind" (2023). |
| https://arxiv.org/abs/2308.10848 | Chen et al., "AgentVerse: Facilitating Multi-Agent Collaboration" (2023). |
| https://arxiv.org/abs/2308.00352 | Hong et al., "MetaGPT: Meta Programming for Multi-Agent Collaborative Framework" (2023). |
| https://arxiv.org/abs/2307.07924 | Qian et al., "ChatDev: Communicative Agents for Software Development" (2023). |

### Documentation & Frameworks

| URL | Description |
|-----|-------------|
| https://raft.github.io/ | Raft consensus algorithm homepage. Visualization, paper, implementations list. |
| https://github.com/hashicorp/raft | HashiCorp's Raft implementation in Go. One of the most used Raft libraries. |
| https://etcd.io/docs/v3.5/dev-guide/api_concurrency_reference_v3/ | etcd concurrency API, including leader election primitives. |
| https://zookeeper.apache.org/doc/current/recipes.html#sc_leaderElection | ZooKeeper leader election recipe. |
| https://developer.hashicorp.com/consul/tutorials/developer-configuration/application-leader-elections | Consul leader election tutorial. |
| https://microsoft.github.io/autogen/ | AutoGen homepage. Microsoft's multi-agent conversation framework. |
| https://microsoft.github.io/autogen/docs/tutorial/conversation-patterns | AutoGen conversation patterns documentation. |
| https://microsoft.github.io/autogen/dev/user-guide/agentchat-user-guide/index.html | AutoGen 0.4 AgentChat user guide. |
| https://docs.crewai.com/concepts/processes | CrewAI process modes: sequential and hierarchical. |
| https://langchain-ai.github.io/langgraph/ | LangGraph documentation. State machine orchestration for LLM agents. |
| https://github.com/openai/swarm | OpenAI Swarm. Experimental agent handoff framework. |
| https://github.com/geekan/MetaGPT | MetaGPT. Multi-agent framework with software engineering roles. |
| https://github.com/OpenBMB/ChatDev | ChatDev. Chat-based software development agent simulation. |
| https://crdt.tech/ | CRDT resources and research. Conflict-free Replicated Data Types. |
| https://automerge.org/ | Automerge. CRDT library for JSON-like collaborative data structures. |
| https://yjs.dev/ | Yjs. High-performance CRDT framework for collaborative editing. |
| https://github.com/vlcn-io/cr-sqlite | cr-sqlite. CRDTs embedded in SQLite for multi-writer databases. |
| https://www.sqlite.org/lockingv3.html | SQLite locking and concurrency documentation. |

### Wikipedia & Reference

| URL | Description |
|-----|-------------|
| https://en.wikipedia.org/wiki/Raft_(algorithm) | Wikipedia on Raft. Good overview with references. |
| https://en.wikipedia.org/wiki/Paxos_(computer_science) | Wikipedia on Paxos. Covers variants and real-world use. |
| https://en.wikipedia.org/wiki/Token_ring | Wikipedia on token ring networks. |
| https://en.wikipedia.org/wiki/Gossip_protocol | Wikipedia on gossip protocols / epidemic algorithms. |
| https://en.wikipedia.org/wiki/Leader_election | Wikipedia on leader election algorithms. |
| https://en.wikipedia.org/wiki/Byzantine_fault | Wikipedia on Byzantine fault tolerance. |
| https://en.wikipedia.org/wiki/Optimistic_concurrency_control | Wikipedia on optimistic concurrency control. |

---

## Raw Link List

Every URL encountered during this research, including tangential ones for future mining:

```
https://raft.github.io/raft.pdf
https://raft.github.io/
https://github.com/hashicorp/raft
https://lamport.azurewebsites.net/pubs/paxos-simple.pdf
https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf
http://pmg.csail.mit.edu/papers/osdi99.pdf
https://research.google/pubs/pub33002/
https://etcd.io/docs/v3.5/dev-guide/api_concurrency_reference_v3/
https://zookeeper.apache.org/doc/current/recipes.html#sc_leaderElection
https://developer.hashicorp.com/consul/tutorials/developer-configuration/application-leader-elections
https://microsoft.github.io/autogen/
https://microsoft.github.io/autogen/docs/tutorial/conversation-patterns
https://microsoft.github.io/autogen/dev/user-guide/agentchat-user-guide/index.html
https://docs.crewai.com/concepts/processes
https://langchain-ai.github.io/langgraph/
https://github.com/openai/swarm
https://github.com/geekan/MetaGPT
https://github.com/OpenBMB/ChatDev
https://arxiv.org/abs/2305.14325
https://arxiv.org/abs/2305.17066
https://arxiv.org/abs/2308.10848
https://arxiv.org/abs/2308.00352
https://arxiv.org/abs/2307.07924
https://crdt.tech/
https://automerge.org/
https://yjs.dev/
https://github.com/vlcn-io/cr-sqlite
https://www.sqlite.org/lockingv3.html
https://en.wikipedia.org/wiki/Raft_(algorithm)
https://en.wikipedia.org/wiki/Paxos_(computer_science)
https://en.wikipedia.org/wiki/Token_ring
https://en.wikipedia.org/wiki/Gossip_protocol
https://en.wikipedia.org/wiki/Leader_election
https://en.wikipedia.org/wiki/Byzantine_fault
https://en.wikipedia.org/wiki/Optimistic_concurrency_control
https://en.wikipedia.org/wiki/Lamport_timestamp
https://en.wikipedia.org/wiki/Vector_clock
https://en.wikipedia.org/wiki/Chandy-Lamport_algorithm
https://jepsen.io/analyses
https://github.com/etcd-io/etcd
https://github.com/hashicorp/consul
https://github.com/apache/zookeeper
https://research.google/pubs/pub27897/
https://www.microsoft.com/en-us/research/publication/the-chubby-lock-service-for-loosely-coupled-distributed-systems/
https://github.com/tikv/raft-rs
https://github.com/willemt/raft
https://github.com/canonical/raft
https://arxiv.org/abs/2304.03442
https://arxiv.org/abs/2303.17760
https://github.com/langchain-ai/langgraph
https://docs.crewai.com/
https://github.com/joaomdmoura/crewAI
```

---

## Open Questions

1. **What exactly does the MCP server mediate?** If the MCP server handles all state mutations (per the mcp-coordination-layer initiative), it becomes the single coordinator — eliminating the need for any peer-to-peer coordination protocol. Every agent talks to the MCP server, which serializes mutations. Is this the intended architecture?

2. **How concurrent are agents in practice?** If agents work on isolated tasks (different files, different initiatives), coordination needs are minimal — just task assignment. If agents frequently touch the same files, stronger concurrency control is needed. What's the expected concurrency profile?

3. **Can CRDTs handle prose merging?** The sqlite-agentic-state initiative explores CRDTs for state. But CRDTs for text (like Automerge's text type) produce character-level merges that may create incoherent prose. For AI-generated documents, is "last writer wins" actually better than character-level merging?

4. **What happens when a worker agent crashes mid-task?** The session-based execution model means an agent might lose context mid-task. How does the coordinator detect this and reassign? Heartbeat files with timestamps? TTL-based lock expiry?

5. **Does the Planner/Worker/Judge model already solve this?** The existing three-role model has a natural coordinator (Planner) and explicit checkpoints (Judge). If the Planner serializes all task assignments and the Judge gates all merges, you have sequential coordination without any protocol.

6. **Is LangGraph's state-machine model worth adopting?** LangGraph's DAG-based orchestration with fan-out and reducers is the most sophisticated coordination pattern in the multi-agent LLM space. It handles parallel execution with merge points. Could Sherpa's task dispatch adopt a similar model?

7. **What can we learn from MMO server meshing?** The mmo-patterns-for-agents initiative suggests looking at how games handle thousands of concurrent state mutations. MMO architectures use authoritative servers (not consensus), spatial partitioning (divide the world into zones), and interest management (each client only gets state it can see). The "zones" concept maps to initiative/worktree isolation.

---

## Methodology Caveat

This research was produced from training knowledge without live web access. The URLs listed are from training data and were valid as of early 2025. A follow-up iteration should:

1. **Live-fetch all URLs** to verify they still resolve and capture current content
2. **Search for 2025-2026 papers** on multi-agent LLM coordination — this field is moving fast
3. **Check AutoGen, CrewAI, and LangGraph changelogs** for any new coordination primitives added since early 2025
4. **Search for "filesystem-based agent coordination"** specifically — there may be projects pursuing the same approach as Sherpa
5. **Look for benchmarks** comparing coordination patterns at the 3-20 agent scale
