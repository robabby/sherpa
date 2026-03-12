# Actor Model Concepts Applied to AI Agent Coordination

**Research iteration:** 2
**Date:** 2026-03-11
**Scope:** How do actor model concepts (Erlang/OTP, Akka, Microsoft Orleans) map to AI agent coordination? How do existing multi-agent frameworks (AutoGen, CrewAI, LangGraph) handle state between agents -- do any of them use actor-like patterns?
**Methodology:** WebSearch and WebFetch used extensively. All claims are sourced with live URLs.

---

## Key Discoveries

### 1. AutoGen v0.4 Explicitly Implements the Actor Model

This is the single most important finding. AutoGen v0.4 (released late 2024, merged into Microsoft Agent Framework 2025) rebuilt its Core API on the actor model.

- AutoGen Core "implements an actor model for agentic AI, providing asynchronous message exchange between agents through a runtime" ([Microsoft Research](https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/))
- Agents communicate via two patterns: **direct messaging** (RPC-like) and **broadcasting to topics** (pub-sub) ([AutoGen 0.4 blog](https://devblogs.microsoft.com/autogen/autogen-reimagined-launching-autogen-0-4/))
- The Core provides both a local runtime and a distributed runtime for cross-process/cross-language agent execution
- In October 2025, Microsoft merged AutoGen with Semantic Kernel into the unified **Microsoft Agent Framework** ([Microsoft Learn](https://learn.microsoft.com/en-us/agent-framework/overview/))

**Implication for Sherpa:** The industry leader in multi-agent frameworks validated the actor model as the right abstraction. But AutoGen's actors communicate through an in-process runtime, not a filesystem. Sherpa's filesystem-based approach is a different coordination substrate for the same conceptual model.

### 2. Akka Has Pivoted Entirely to "Agentic AI" with Actor-Based Agents

Akka -- the JVM actor framework with 15 years of distributed systems history -- announced the **Akka Agentic Platform** in July 2025, explicitly positioning actors as AI agents.

- Each agent is an actor: "An agent is an actor. It encapsulates its own private state (memory, goals) and behavior within a protective boundary." ([Pradeep Loganathan's blog](https://pradeepl.com/blog/agentic-ai/akka-actor-model-agentic-ai/))
- Agent state is split into **short-term session memory** (per-session `Map<String,String>`) and **durable memory cache** (survives restarts)
- Supervision trees handle agent failure: "Parents define restart/stop/escalate policies. Failures are contained to the faulty agent." ([same source](https://pradeepl.com/blog/agentic-ai/akka-actor-model-agentic-ai/))
- Messages between agents are **immutable records** with typed actions (SAY, ASK, REMEMBER, RECALL, SUMMARY)
- Bounded mailboxes provide **backpressure**: "Bounded queues prevent memory blow-ups during spikes and enable predictable load shedding."
- Code example: [akka-agent-sdk-demo on GitHub](https://github.com/PradeepLoganathan/akka-agent-sdk-demo)
- Akka provides built-in memory modules for "short-term context and long-term semantic knowledge persistence across users, sessions, agents, and systems" -- a capability most competitors require external databases for ([Akka blog](https://akka.io/blog/agentic-ai-frameworks))

### 3. Dapr Agents: Virtual Actors as the Foundation for AI Agent Orchestration

Dapr (CNCF distributed application runtime) launched **Dapr Agents** in 2025, building AI agent capabilities directly on virtual actors.

- Dapr Agents uses Dapr's Virtual Actor pattern: "agents operate as self-contained, stateful units that handle messages sequentially" ([GitHub](https://github.com/dapr/dapr-agents))
- Workflow orchestration built on actors provides **durable execution**: "guarantees each agent task executes to completion in the face of network interruptions, node crashes and other types of disruptive failures"
- Three coordination patterns: service-to-service invocation (sync), pub/sub (event-driven), and durable workflows (long-running)
- State stored in pluggable backends (50+ supported) via Dapr's state store abstraction ([Dapr Docs](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/))
- Actor lifecycle is fully managed: "Actors activate on demand, stay alive while they're used, and quietly deactivate after a period of inactivity" ([Diagrid blog](https://www.diagrid.io/blog/understanding-dapr-actors-for-scalable-workflows-and-ai-agents))
- The Placement Service uses **Raft consensus** internally for actor location tracking, but this is hidden from developers

**Implication for Sherpa:** Dapr proves the virtual actor model works for AI agents at production scale. Sherpa's agents are more ephemeral (single context window), but the lifecycle pattern (activate on demand, deactivate when idle, persist state externally) maps directly.

### 4. Erlang/OTP "Let It Crash" Maps Cleanly to AI Agent Failure

The supervision tree model has direct parallels for AI agents:

| OTP Concept | AI Agent Equivalent |
|---|---|
| Process | Single agent (Claude instance in a worktree) |
| Process state | Context window contents + filesystem state |
| Supervisor | Human operator or coordinator agent |
| `one_for_one` restart | Restart the failed agent, keep others running |
| `one_for_all` restart | If one agent's failure corrupts shared state, restart all |
| `rest_for_one` restart | Restart dependent agents downstream of the failure |
| Message mailbox | Task queue / initiative board |
| Process crash | Context window overflow, hallucination, wrong-branch commit |

- Erlang processes are isolated and communicate via message passing, minimizing crash propagation ([Freshcode blog](https://www.freshcodeit.com/blog/why-elixir-is-the-best-runtime-for-building-agentic-workflows))
- The philosophy: "Let it crash... failures, crashes and exceptions become powerful building blocks to assemble large reliable systems" ([The Zen of Erlang](https://ferd.ca/the-zen-of-erlang.html))
- Restart strategies (one-for-one, one-for-all, rest-for-one) map to different agent failure scenarios ([Medium](https://medium.com/@matheuscamarques/building-fault-tolerant-systems-inside-the-otp-design-principles-of-erlang-8aed442d4a84))

**Implication for Sherpa:** Sherpa already has a natural "let it crash" model. When a Claude instance fills its context window or goes off-track, the human compacts or restarts it. The question is whether to formalize this with explicit supervision policies in `sherpa.config.ts`.

### 5. Jido Framework: Elixir/BEAM Actors as AI Agents (Most Direct Implementation)

Jido is an Elixir framework that directly implements AI agents as OTP actors.

- "Agents are immutable data structures with a single command function, where state changes are pure data transformations and side effects are described as directives" ([Jido docs](https://jido.run/docs/getting-started))
- "When an agent crashes, its supervisor restarts it automatically with clean state -- no orchestrator, no manual recovery, no downtime" ([GitHub](https://github.com/agentjido/jido))
- Uses CloudEvents-based signals for inter-agent messaging
- Can run "10k agents at 25KB each" on commodity hardware ([HN discussion](https://news.ycombinator.com/item?id=42550760))
- Jido 2.0 shipped with production-hardened GenServer-based agent runtime ([HN](https://news.ycombinator.com/item?id=47263036))
- A key insight from the HN discussion: "agents must be architecturally correct WITHOUT LLMs before they can be correct WITH LLMs" -- i.e., the coordination substrate should not depend on LLM behavior
- Elixir's BEAM VM provides "lightweight processes measured in kilobytes rather than megabytes" with "sub-millisecond message latency" across millions of processes

**Implication for Sherpa:** Jido validates the thesis that the actor model IS the right primitive for AI agents. The question for Sherpa is whether to adopt BEAM-style semantics at the conceptual level while implementing on filesystem + git rather than on the BEAM.

### 6. Context Windows Map to Actor State Encapsulation

The actor model's private state encapsulation has a natural analog in LLM agents:

- An actor's private state = an agent's context window contents. Both are invisible to other actors/agents unless explicitly shared via messages. ([Redis blog](https://redis.io/blog/ai-agent-memory-stateful-systems/))
- "Context acts as a runtime -- a fluid, bounded space where all computation, decision-making, and memory retrieval occurs. It is limited in size, transient in nature, and sensitive to structure." ([Medium](https://medium.com/@bijit211987/context-engineering-is-runtime-of-ai-agents-411c9b2ef1cb))
- Modern agent memory architectures scope memory "per user, per team, per organisation" using hierarchical namespaces ([Amazon Bedrock docs](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-memory-building-context-aware-agents/))
- The OpenAI Agents SDK provides `RunContextWrapper` for structured state objects that persist across runs ([OpenAI cookbook](https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization/))

**Key difference from classical actors:** An actor's state is mutable within the actor. An LLM agent's context window is append-only within a session and reset between sessions. This means agent "state" must be externalized (to files, databases) to survive across sessions -- which is exactly what Sherpa does with filesystem-based governance.

### 7. How Existing Frameworks Actually Handle State

| Framework | State Pattern | Actor-Like? |
|---|---|---|
| **AutoGen v0.4** | Actor model with async message passing. Centralized transcript as short-term memory, aggressive pruning at token limits. | **Yes, explicitly** |
| **LangGraph** | Typed state schema passed between graph nodes. Checkpointing after each super-step. Inspired by Google's Pregel. | **Partially** -- nodes are like actors, state is shared via typed schema rather than messages |
| **CrewAI** | Unified memory system with short-term (ChromaDB + RAG), long-term (SQLite3), entity (RAG), and contextual layers. All agents share crew memory by default. | **No** -- shared memory model, not message passing |
| **OpenAI Swarm** | Stateless between calls. System prompt switches on handoff. Full conversation history travels with each handoff. | **No** -- explicitly anti-actor (no persistent state) |
| **Akka Agents** | Private actor state + bounded mailbox + supervision tree. Short-term session memory + durable memory cache. | **Yes, native** |
| **Dapr Agents** | Virtual actor pattern with external state store. Durable workflow execution. Pub/sub + direct invocation. | **Yes, native** |
| **Jido (Elixir)** | GenServer-based actors with CloudEvents messaging. Immutable agent data structures + directive-based side effects. | **Yes, native** |

### 8. The Blackboard Pattern Is the Main Alternative to Actor Message Passing

The blackboard architecture (shared workspace that agents read/write) is the primary competing pattern:

- Originated at CMU in the 1970s (HEARSAY-II speech recognition system) ([Engineering Notes](https://notes.muthu.co/2025/10/collaborative-problem-solving-in-multi-agent-systems-with-the-blackboard-architecture/))
- Three components: the blackboard (shared state), knowledge sources (agents), and a control component (decides who acts next)
- Key difference from actors: "All agents see global state" vs. actor message passing's "point-to-point communication"
- Coordination is "data-driven and opportunistic" -- agents react to state changes on the blackboard
- **Sherpa's filesystem IS a blackboard.** Agents read from and write to shared files. The human acts as the control component.
- A GitHub project `agent-blackboard` implements this for software engineering with 9 specialized AI agents ([GitHub](https://github.com/claudioed/agent-blackboard))
- An arxiv paper explores "Advanced LLM Multi-Agent Systems Based on Blackboard Architecture" ([arxiv](https://arxiv.org/html/2507.01701v1))

**Critical insight:** Sherpa is already implementing the blackboard pattern, not the actor pattern. The filesystem is the blackboard. The initiative board is the control component. The question is whether to layer actor-like isolation ON TOP of the blackboard (give each agent its own worktree = private state + shared filesystem = blackboard access).

### 9. Microsoft's Official Agent Orchestration Patterns (Azure Architecture Center)

Microsoft published 5 canonical orchestration patterns in February 2026:

1. **Sequential** -- pipeline, each agent processes previous agent's output. Deterministic routing. ([Azure docs](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns))
2. **Concurrent** -- fan-out/fan-in, agents work independently on same input. Results aggregated.
3. **Group Chat** -- agents contribute to shared conversation thread. Chat manager controls turns.
4. **Handoff** -- dynamic delegation, one active agent at a time. Agent decides when to transfer.
5. **Magentic** -- manager agent builds and adapts a task ledger dynamically. Open-ended problem solving.

Key design guidance from the doc:
- "For orchestrations that span multiple user interactions or long-running tasks, persist shared state externally rather than relying on in-memory context alone."
- "Scope persisted state to the minimum necessary information to reduce token overhead and privacy risk."
- "Validate agent output before passing it to the next agent. Low-confidence, malformed, or off-topic responses can cascade through a pipeline."

**Implication for Sherpa:** Sherpa's current model is closest to **Magentic orchestration** -- a human manager builds and adapts a task ledger (initiative board), specialized agents work on tasks, the manager evaluates and redirects. The filesystem-based initiative system IS the task ledger.

### 10. Git Worktrees Are the Industry Standard for Multi-Agent Filesystem Isolation

- Cursor 2.0 ships parallel agents powered by git worktrees under the hood (October 2025) ([Dev.to](https://dev.to/arifszn/git-worktrees-the-power-behind-cursors-parallel-agents-19j1))
- Multiple articles describe running 5-8 Claude Code instances in parallel, each in its own worktree ([Medium](https://medium.com/@mabd.dev/git-worktrees-the-secret-weapon-for-running-multiple-ai-coding-agents-in-parallel-e9046451eb96), [Nx Blog](https://nx.dev/blog/git-worktrees-ai-agents), [Agent Interviews](https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/))
- Worktrees provide "isolated, persistent working directories for each branch" while "all worktrees share the same Git history" ([Nx Blog](https://nx.dev/blog/git-worktrees-ai-agents))
- Git merge is the coordination mechanism -- agents work independently, merge through PRs
- Worktree CLI tool: [@johnlindquist/worktree](https://www.npmjs.com/package/@johnlindquist/worktree)

**Implication for Sherpa:** Sherpa's worktree conventions are already aligned with industry practice. Worktrees provide actor-like isolation (private working directory = private state) with a shared substrate (git history = coordination channel).

### 11. Filesystem-Based State Management Is Emerging as a Recognized Pattern

- **Three-file pattern:** `current-task.json` + `memory/today.md` + `MEMORY.md` runs a 5-agent production system 24/7. "80% of AI agent production failures are attributed to state management issues rather than prompt quality." ([Dev|Journal](https://earezki.com/ai-news/2026-03-09-the-state-management-pattern-that-runs-our-5-agent-system-24-7/))
- **Filesystem-Based Agent State** is now cataloged as a named pattern: agents "persist intermediate results and working state to files" with checkpointing, resumption logic, and progress tracking ([Agentic Patterns](https://agentic-patterns.com/patterns/filesystem-based-agent-state/))
- **AgentFS** provides filesystem abstractions specifically for AI agents, with every operation recorded in SQLite ([GitHub](https://github.com/tursodatabase/agentfs))
- **1Password's analysis:** "With multiple agents, the problem shifts from reasoning to coordination. Filesystems scale here because they offer a shared, addressable namespace." But warns about the authority boundary problem: "Once an agent accesses the host filesystem, it effectively inherits the authority of the machine." ([1Password blog](https://1password.com/blog/filesystems-for-agent-swarms))
- Filesystems are natural for LLM agents because "modern language models are extensively trained on code repositories, logs, and shell workflows" -- file navigation is a native agent behavior

### 12. Google A2A Protocol: Industry Standard for Agent-to-Agent Communication

- Google launched the **Agent2Agent (A2A) Protocol** in April 2025 with 50+ technology partners, growing to 150+ by late 2025 ([Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/))
- A2A is built on HTTP, SSE, JSON-RPC -- standard web protocols
- **Agent Cards** (JSON) enable agent discovery and capability advertising
- Complements Anthropic's MCP: "A2A is horizontal -- it connects agents to other agents across organizational boundaries" while MCP connects agents to tools/data ([IBM](https://www.ibm.com/think/topics/agent2agent-protocol))
- A2A follows a client-server model where agents remain opaque to each other (neither needs to know the other's framework, model, or architecture)

---

## The Actor/Blackboard Spectrum

Based on this research, agent coordination patterns exist on a spectrum:

```
Pure Actor Model          Hybrid                    Pure Blackboard
(private state,           (isolated workspaces +    (shared state,
 message passing)          shared filesystem)         opportunistic access)
     |                         |                          |
  Akka Agents             Sherpa (worktrees)          CrewAI (shared memory)
  Jido/Elixir             Git-based multi-agent       LangGraph (shared state schema)
  AutoGen Core            Cursor parallel agents      Swarm (stateless handoff)
  Dapr Agents
```

**Sherpa sits in the hybrid zone.** Each agent has private state (its context window, its worktree), but coordinates through a shared filesystem (the initiative board, proposal files, activity logs). This is neither pure actor nor pure blackboard -- it's a blackboard with actor-like isolation.

---

## Implications for Sherpa

### What to adopt from the actor model:

1. **Supervision strategies as configuration.** Formalize what happens when an agent fails. Options: restart with clean context (one-for-one), restart all agents on the initiative (one-for-all), escalate to human. This could live in `sherpa.config.ts` as part of `defineConfig()`.

2. **Mailbox semantics for task dispatch.** Each agent's "mailbox" is its task queue. Tasks arrive as files (`docs/tasks/<slug>.md`). The agent processes one at a time. Bounded mailbox = max concurrent tasks per agent.

3. **Message types as a protocol.** Define typed messages between agents: PROPOSAL, REVIEW, APPROVAL, HANDOFF, ESCALATION. These are already implicit in the initiative lifecycle but could be formalized.

4. **Lifecycle management.** Adopt Orleans/Dapr virtual actor semantics: agents activate when there's work, deactivate when idle, state persists in the filesystem. No need to keep Claude instances running when there's nothing to do.

### What NOT to adopt:

1. **In-process message passing.** Sherpa's agents are separate OS processes (Claude instances) in separate worktrees. They don't share memory. Filesystem is the message bus, not function calls.

2. **Actor identity persistence.** Actors have stable identity across restarts. LLM agents do not -- each context window is a fresh instance. Agent identity in Sherpa should be the role + worktree, not a persistent process ID.

3. **Transparent location.** Actor frameworks abstract away which node runs which actor. For Sherpa's scale (3-20 agents), this abstraction adds complexity without benefit. The human knows where each agent is.

### What the blackboard model confirms:

1. **The filesystem IS the coordination mechanism.** Don't layer a separate message bus on top. Files are messages. Directories are channels. Git history is the audit log.

2. **The human IS the control component.** In the blackboard pattern, something decides which knowledge source acts next. In Sherpa, that's the human operator (or the Planner agent under human supervision).

3. **Proposals as blackboard entries.** The initiative system's proposal mechanism is exactly a blackboard write: "Here's what I think should change, based on what I see on the blackboard."

---

## Open Questions

1. **Should Sherpa formalize agent failure modes?** Erlang/OTP supervision strategies are well-defined (one-for-one, one-for-all, rest-for-one). Could Sherpa define equivalent restart policies for when a Claude instance fills its context window or produces bad output?

2. **Is the filesystem sufficient as the sole coordination channel at 10-20 agents?** The blackboard pattern has a known bottleneck problem at scale. Current Sherpa operates at 1-3 agents. At 10+, will file-based coordination create contention? Git merge conflicts become the "split brain" problem.

3. **Should Sherpa adopt an event-sourced append-only log instead of mutable files?** Dapr Agents uses event sourcing for workflow history. The filesystem-based pattern article recommends atomic writes (write-then-rename). An append-only `events.jsonl` file per initiative would provide full audit trail without merge conflicts.

4. **What's the right abstraction for agent identity?** Actors have persistent identity. LLM agents don't. Should Sherpa assign stable role-based identities (Planner, Worker-1, Judge) that persist across context window resets, or treat each session as a fresh agent?

5. **How does Jido's "agents must be architecturally correct WITHOUT LLMs" principle apply?** Should Sherpa's coordination patterns be testable with mock agents (simple scripts) before involving actual Claude instances?

6. **What's the Sherpa equivalent of backpressure?** Akka actors have bounded mailboxes. If a Sherpa worker agent can't keep up with tasks, what happens? Currently nothing -- tasks pile up. Should there be a max-tasks-per-agent limit?

7. **Does Google's A2A protocol matter for Sherpa?** A2A standardizes inter-agent communication over HTTP/JSON-RPC. If Sherpa ever needs agents from different providers (Claude + GPT + local models), A2A could be the interop layer.

---

## Sources

### Actor Model + AI Agents
- [Akka Actor Model: A Foundation for Concurrent AI Agents](https://pradeepl.com/blog/agentic-ai/akka-actor-model-agentic-ai/) -- Detailed technical mapping of Akka actors to AI agents with code examples
- [The Natural Synergy Between The Actor Pattern and Agentic AI Systems](https://www.robotmunki.com/blog/actor-pattern-and-ai.html) -- Conceptual mapping of actor pattern to agent systems
- [Agentic AI frameworks for enterprise scale: A 2026 guide (Akka)](https://akka.io/blog/agentic-ai-frameworks) -- Akka's comparison of its platform to AutoGen, CrewAI, LangGraph
- [Orchestrating AI Agents with Elixir's Actor Model (Freshcode)](https://www.freshcodeit.com/blog/why-elixir-is-the-best-runtime-for-building-agentic-workflows) -- BEAM/OTP supervision trees for AI agent workflows
- [Announcing the Akka Agentic Platform](https://akka.io/blog/announcing-akkas-agentic-ai-release) -- Akka's July 2025 agentic AI announcement

### Erlang/OTP Supervision
- [The Zen of Erlang](https://ferd.ca/the-zen-of-erlang.html) -- Definitive essay on "let it crash" philosophy
- [Building Fault-Tolerant Systems: OTP Design Principles](https://medium.com/@matheuscamarques/building-fault-tolerant-systems-inside-the-otp-design-principles-of-erlang-8aed442d4a84) -- OTP restart strategies explained
- [GenServer with supervision tree and state recovery after crash](https://www.bounga.org/elixir/2020/02/29/genserver-supervision-tree-and-state-recovery-after-crash/) -- Elixir GenServer supervision
- [AI Scalability With Erlang/OTP](https://www.restack.io/p/ai-scalability-answer-erlang-otp-cat-ai) -- Erlang/OTP for AI systems

### Microsoft Orleans Virtual Actors
- [Orleans: Virtual Actors - Microsoft Research](https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/) -- Original project page
- [Orleans: Distributed Virtual Actors paper (2014)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/Orleans-MSR-TR-2014-41.pdf) -- Original academic paper
- [Building Stateful AI Agents at Scale with Microsoft Orleans](https://dev.to/sreeni5018/building-stateful-ai-agents-at-scale-with-microsoft-orleans-4n14) -- January 2026 article on Orleans for AI agents
- [Orleans Virtual Actors in Practice](https://developersvoice.com/blog/dotnet/orleans-virtual-actors-in-practice/) -- Production patterns
- [dotnet/orleans GitHub](https://github.com/dotnet/orleans) -- Source code

### Dapr Agents
- [dapr/dapr-agents GitHub](https://github.com/dapr/dapr-agents) -- Source code and README
- [Understanding Dapr Actors for Scalable Workflows and AI Agents](https://www.diagrid.io/blog/understanding-dapr-actors-for-scalable-workflows-and-ai-agents) -- Detailed technical analysis
- [Dapr Actors Overview](https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/) -- Official documentation
- [Actors comparison: Akka, Dapr, Orleans, Service Fabric](https://nittikkin.medium.com/actors-and-virtual-actors-a-comparison-across-akka-dapr-orleans-and-service-fabric-c6c618f27) -- Cross-framework comparison

### Jido (Elixir Agent Framework)
- [agentjido/jido GitHub](https://github.com/agentjido/jido) -- Source code
- [Agent Jido docs](https://jido.run/docs/getting-started) -- Getting started guide
- [Jido 2.0 HN discussion](https://news.ycombinator.com/item?id=47263036) -- Technical community discussion
- [Show HN: Jido -- Run 10k agents at 25KB each](https://news.ycombinator.com/item?id=42550760) -- Performance discussion
- [agentjido/jido_ai GitHub](https://github.com/agentjido/jido_ai) -- AI integration layer
- [Your Agent Framework Is Just a Bad Clone of Elixir](https://georgeguimaraes.com/your-agent-orchestrator-is-just-a-bad-clone-of-elixir/) -- Polemic on BEAM superiority for agents
- [Integrating Generative AI into Elixir with Jido (Appunite)](https://www.appunite.com/blog/integrating-generative-ai-into-elixir-based-applications-by-using-the-jido-agentic-framework) -- Tutorial

### AutoGen / Microsoft Agent Framework
- [AutoGen v0.4: Reimagining the foundation (Microsoft Research)](https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/) -- Architecture rationale
- [AutoGen reimagined: Launching AutoGen 0.4](https://devblogs.microsoft.com/autogen/autogen-reimagined-launching-autogen-0-4/) -- Release announcement
- [Microsoft Agent Framework Overview](https://learn.microsoft.com/en-us/agent-framework/overview/) -- Unified framework docs
- [AutoGen: Enabling Next-Gen LLM Applications (arxiv)](https://arxiv.org/pdf/2308.08155) -- Original paper
- [microsoft/autogen GitHub](https://github.com/microsoft/autogen) -- Source code
- [AutoGen v0.4 Crash Course (Cohorte)](https://www.cohorte.co/blog/autogen-v0-4-ag2-crash-course-build-event-driven-observable-ai-agents-that-scale) -- Tutorial

### LangGraph
- [LangGraph State Management (Medium)](https://medium.com/@bharatraj1918/langgraph-state-management-part-1-how-langgraph-manages-state-for-multi-agent-workflows-da64d352c43b) -- State schema and reducers
- [LangGraph Architecture and Design (Medium)](https://medium.com/@shuv.sdr/langgraph-architecture-and-design-280c365aaf2c) -- Pregel-inspired design
- [LangGraph State Machines for Production (Dev.to)](https://dev.to/jamesli/langgraph-state-machines-managing-complex-agent-task-flows-in-production-36f4) -- Production patterns
- [langchain-ai/langgraph GitHub](https://github.com/langchain-ai/langgraph) -- Source code
- [Checkpoint-Based State Replay with LangGraph (Dev.to)](https://dev.to/sreeni5018/debugging-non-deterministic-llm-agents-implementing-checkpoint-based-state-replay-with-langgraph-5171) -- Debugging with checkpoints

### CrewAI
- [CrewAI Memory Documentation](https://docs.crewai.com/en/concepts/memory) -- Official memory system docs
- [Deep Dive into CrewAI Memory Systems (SparkCo)](https://sparkco.ai/blog/deep-dive-into-crewai-memory-systems) -- Detailed analysis
- [Memory Configuration and Storage (DeepWiki)](https://deepwiki.com/crewAIInc/crewAI/7.2-memory-configuration-and-storage) -- Storage internals
- [AI Agent Memory Comparison: LangGraph, CrewAI, AutoGen (Dev.to)](https://dev.to/foxgem/ai-agent-memory-a-comparative-analysis-of-langgraph-crewai-and-autogen-31dp) -- Cross-framework comparison

### OpenAI Swarm
- [openai/swarm GitHub](https://github.com/openai/swarm) -- Source code
- [Orchestrating Agents: Routines and Handoffs (OpenAI)](https://developers.openai.com/cookbook/examples/orchestrating_agents/) -- Official cookbook
- [OpenAI Swarm Framework Guide (Galileo)](https://galileo.ai/blog/openai-swarm-framework-multi-agents) -- Analysis
- [OpenAI Agents SDK docs](https://openai.github.io/openai-agents-python/) -- Successor to Swarm

### Blackboard Pattern
- [Collaborative Problem-Solving with Blackboard Architecture](https://notes.muthu.co/2025/10/collaborative-problem-solving-in-multi-agent-systems-with-the-blackboard-architecture/) -- Detailed analysis with Python examples
- [Building Multi-Agent Systems with MCPs and Blackboard Pattern (Medium)](https://medium.com/@dp2580/building-intelligent-multi-agent-systems-with-mcps-and-the-blackboard-pattern-to-build-systems-a454705d5672) -- MCP + blackboard integration
- [agent-blackboard GitHub](https://github.com/claudioed/agent-blackboard) -- 9 specialized software engineering agents
- [Exploring Advanced LLM Multi-Agent Systems Based on Blackboard Architecture (arxiv)](https://arxiv.org/html/2507.01701v1) -- Academic treatment
- [Four Design Patterns for Event-Driven Multi-Agent Systems (Confluent)](https://www.confluent.io/blog/event-driven-multi-agent-systems/) -- Blackboard as one of four patterns
- [All Agentic Architectures: Blackboard notebook](https://github.com/FareedKhan-dev/all-agentic-architectures/blob/main/07_blackboard.ipynb) -- Implementation notebook

### Microsoft Azure Agent Orchestration
- [AI Agent Orchestration Patterns - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) -- Five canonical patterns (February 2026)
- [Introducing Microsoft Agent Framework (Azure blog)](https://azure.microsoft.com/en-us/blog/introducing-microsoft-agent-framework/) -- Announcement
- [Agent Factory: Common Use Cases and Design Patterns](https://azure.microsoft.com/en-us/blog/agent-factory-the-new-era-of-agentic-ai-common-use-cases-and-design-patterns/) -- Pattern catalog

### Google A2A Protocol
- [Announcing A2A Protocol (Google)](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) -- Original announcement
- [What happened to Google's A2A?](https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/) -- Status update
- [What Is Agent2Agent Protocol? (IBM)](https://www.ibm.com/think/topics/agent2agent-protocol) -- Overview
- [A2A Protocol upgrade announcement (Google Cloud)](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade) -- Protocol evolution

### Filesystem-Based Agent Coordination
- [Three-File State Management Pattern (Dev|Journal)](https://earezki.com/ai-news/2026-03-09-the-state-management-pattern-that-runs-our-5-agent-system-24-7/) -- Production 5-agent system
- [Filesystem-Based Agent State Pattern (Agentic Patterns)](https://agentic-patterns.com/patterns/filesystem-based-agent-state/) -- Named pattern catalog
- [AgentFS GitHub (Turso)](https://github.com/tursodatabase/agentfs) -- Filesystem for agents
- [AgentFS.ai](https://www.agentfs.ai/) -- Agent filesystem project
- [Agents are making filesystems cool again (1Password)](https://1password.com/blog/filesystems-for-agent-swarms) -- Security analysis
- [Advanced AI Agents with File Access (FlowHunt)](https://www.flowhunt.io/blog/advanced-ai-agents-with-file-access-mastering-context-offloading-and-state-management/) -- Context offloading patterns

### Git Worktrees for Multi-Agent Development
- [Git Worktrees: Secret Weapon for Parallel AI Agents (Medium)](https://medium.com/@mabd.dev/git-worktrees-the-secret-weapon-for-running-multiple-ai-coding-agents-in-parallel-e9046451eb96)
- [How Git Worktrees Changed My AI Agent Workflow (Nx Blog)](https://nx.dev/blog/git-worktrees-ai-agents)
- [Parallel AI Coding with Git Worktrees and Claude Code (Agent Interviews)](https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/)
- [Git Worktrees: Power Behind Cursor's Parallel Agents (Dev.to)](https://dev.to/arifszn/git-worktrees-the-power-behind-cursors-parallel-agents-19j1)
- [Git Worktrees for AI Coding (Dev.to)](https://dev.to/mashrulhaque/git-worktrees-for-ai-coding-run-multiple-agents-in-parallel-3pgb)
- [Git Worktrees: From Multi-Agent to Real Multi-Agent Development (Vibehackers)](https://vibehackers.io/blog/git-worktrees-multi-agent-development)
- [@johnlindquist/worktree CLI](https://www.npmjs.com/package/@johnlindquist/worktree)
- [gwq: Git worktree manager GitHub](https://github.com/d-kuro/gwq)

### Academic Surveys
- [Multi-Agent Collaboration Mechanisms: A Survey of LLMs (arxiv)](https://arxiv.org/abs/2501.06322) -- Comprehensive taxonomy
- [Agentic AI: Architectures, Taxonomies, and Evaluation (arxiv)](https://arxiv.org/html/2601.12560v1) -- Framework survey
- [LLM-Based Multi-Agent Systems survey papers (GitHub)](https://github.com/taichengguo/LLM_MultiAgents_Survey_Papers) -- Curated paper list
- [awesome-llm-agents GitHub](https://github.com/kaushikb11/awesome-llm-agents) -- Curated framework list

### Framework Comparison Articles
- [LangGraph vs CrewAI vs AutoGen 2026 (ML Journey)](https://mljourney.com/langgraph-vs-crewai-vs-autogen-which-agent-framework-should-you-use-in-2026/)
- [CrewAI vs LangGraph vs AutoGen (DataCamp)](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)
- [AutoGen vs CrewAI vs LangGraph 2026 (Dev.to)](https://dev.to/synsun/autogen-vs-langgraph-vs-crewai-which-agent-framework-actually-holds-up-in-2026-3fl8)
- [AutoGen vs CrewAI vs LangGraph vs OpenAI Agents (Galileo)](https://galileo.ai/blog/autogen-vs-crewai-vs-langgraph-vs-openai-agents-framework)
- [Multi-Agent Frameworks Explained for Enterprise AI Systems](https://www.adopt.ai/blog/multi-agent-frameworks)

### Agent Memory and Context
- [Agent Memory: How to Build Agents that Learn and Remember (Letta)](https://www.letta.com/blog/agent-memory)
- [AI Agent Memory: Types, Architecture, Implementation (Redis)](https://redis.io/blog/ai-agent-memory-stateful-systems/)
- [Context Window Management Strategies (Maxim)](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)
- [The Context Window Problem: Scaling Agents (Factory.ai)](https://factory.ai/news/context-window-problem)
- [Context Engineering is Runtime of AI Agents (Medium)](https://medium.com/@bijit211987/context-engineering-is-runtime-of-ai-agents-411c9b2ef1cb)
- [Context Engineering for Agents (Galileo)](https://galileo.ai/blog/context-engineering-for-agents)
- [Agent Memory: Why Your AI Has Amnesia (Oracle)](https://blogs.oracle.com/developers/agent-memory-why-your-ai-has-amnesia-and-how-to-fix-it)

---

## Raw Links

Every URL encountered during research, including tangentially relevant ones not fully explored:

```
https://pradeepl.com/blog/agentic-ai/akka-actor-model-agentic-ai/
https://pradeepl.com/blog/agentic-ai/agentic-ai-from-copilots-to-agents/
https://pradeepl.com/blog/model-context-protocol/build-a-mcp-server/
https://github.com/PradeepLoganathan/akka-agent-sdk-demo/blob/main/src/main/java/com/example/demo/application/SimpleAgent.java
https://github.com/PradeepLoganathan/akka-agent-sdk-demo/blob/main/src/main/java/com/example/demo/api/AgentEndpoint.java
https://github.com/PradeepLoganathan/akka-agent-sdk-demo/blob/main/src/main/resources/static-resources/index.html
https://github.com/PradeepLoganathan/akka-agent-sdk-demo/blob/main/src/main/java/com/example/demo/api/UiEndpoint.java
https://github.com/PradeepLoganathan/akka-agent-sdk-demo/blob/main/src/main/resources/application.conf
https://www.robotmunki.com/blog/actor-pattern-and-ai.html
https://www.freshcodeit.com/blog/why-elixir-is-the-best-runtime-for-building-agentic-workflows
https://akka.io/blog/agentic-ai-frameworks
https://akka.io/blog/announcing-akkas-agentic-ai-release
https://akka.io/
https://doc.akka.io/
https://akka.io/akka-memory
https://akka.io/akka-agents
https://akka.io/get-started
https://console.akka.io/register
https://akka.io/app-types/agentic-ai
https://akka.io/blog/agentic-ai-tools
https://akka.io/blog/agentic-ai-architecture
https://www.infoworld.com/article/4022037/akka-releases-platform-for-agentic-ai.html
https://unimatrixz.com/topics/ai-agents/comparing-akka-vs-agentic-workflows-framework/
https://ferd.ca/the-zen-of-erlang.html
https://medium.com/@matheuscamarques/building-fault-tolerant-systems-inside-the-otp-design-principles-of-erlang-8aed442d4a84
https://www.bounga.org/elixir/2020/02/29/genserver-supervision-tree-and-state-recovery-after-crash/
https://aosabook.org/en/v1/riak.html
https://www.restack.io/p/ai-scalability-answer-erlang-otp-cat-ai
https://medium.com/@rng/erlang-a-veterans-take-on-concurrency-fault-tolerance-and-scalability-adff3f96565b
https://www.mgasch.com/2019/03/crash/
https://www.emqx.com/en/blog/1770-days-zero-downtime
https://pragtob.wordpress.com/tag/supervision-tree/
https://news.ycombinator.com/item?id=15735024
https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/
https://bogdan-dina03.medium.com/intro-to-virtual-actors-by-microsoft-orleans-6ae3264f138d
https://dev.to/willvelida/introduction-to-microsoft-orleans-796
https://bool.dev/blog/detail/microsoft-orleans-overview
https://dev.to/sreeni5018/building-stateful-ai-agents-at-scale-with-microsoft-orleans-4n14
https://developersvoice.com/blog/dotnet/orleans-virtual-actors-in-practice/
https://github.com/dotnet/orleans
https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/Orleans-MSR-TR-2014-41.pdf
https://www.microsoft.com/en-us/research/publication/orleans-distributed-virtual-actors-for-programmability-and-scalability/
https://dotnet.github.io/orleans/docs/resources/best_practices.html
https://github.com/dapr/dapr-agents
https://docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/
https://www.diagrid.io/blog/understanding-dapr-actors-for-scalable-workflows-and-ai-agents
https://www.diagrid.io/blog/durable-agentic-workflows-with-dapr
https://docs.dapr.io/developing-applications/dapr-agents/
https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/
https://dapr.io/
https://docs.dapr.io/concepts/faq/faq/
https://v1-9.docs.dapr.io/developing-applications/building-blocks/actors/howto-actors/
https://v1-10.docs.dapr.io/developing-applications/building-blocks/actors/actors-overview/
https://nittikkin.medium.com/actors-and-virtual-actors-a-comparison-across-akka-dapr-orleans-and-service-fabric-c6c618f27
https://docs.dapr.io/developing-applications/sdks/php/php-actors/
https://github.com/agentjido/jido
https://github.com/agentjido/jido_ai
https://jido.run/docs/getting-started
https://agentjido.xyz/
https://stage.jido.run/
https://jido.run/blog/jido-2-0-is-here
https://news.ycombinator.com/item?id=42550760
https://news.ycombinator.com/item?id=47263036
https://georgeguimaraes.com/your-agent-orchestrator-is-just-a-bad-clone-of-elixir/
https://www.appunite.com/blog/integrating-generative-ai-into-elixir-based-applications-by-using-the-jido-agentic-framework
https://github.com/georgeguimaraes/awesome-ml-gen-ai-elixir
https://elixirforum.com/t/is-anyone-working-on-ai-agents-in-elixir/69989
https://underjord.io/unpacking-elixir-the-actor-model.html
https://elixirmerge.com/p/exploring-concurrency-in-elixir-with-the-actor-model
https://copyprogramming.com/howto/simulations-with-elixir-and-the-actor-model
https://www.elixirpatterns.dev/
https://dashbit.co/blog/elixir-ml-s1-2024-mlir-arrow-instructor
https://hex.pm/packages/req_llm
https://github.com/brainlid/langchain
https://github.com/agoodway/goodwizard
https://github.com/actioncard/a2a-elixir
https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/
https://devblogs.microsoft.com/autogen/autogen-reimagined-launching-autogen-0-4/
https://www.cohorte.co/blog/autogen-v0-4-ag2-crash-course-build-event-driven-observable-ai-agents-that-scale
https://github.com/microsoft/autogen
https://www.microsoft.com/en-us/research/project/autogen/
https://microsoft.github.io/autogen/0.2/docs/Use-Cases/agent_chat/
https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/agents.html
https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/migration-guide.html
https://microsoft.github.io/autogen/0.2/blog/
https://arxiv.org/pdf/2308.08155
https://learn.microsoft.com/en-us/agent-framework/overview/
https://atalupadhyay.wordpress.com/2025/03/04/autogen-v0-4-a-complete-guide-to-the-next-generation-of-agentic-ai/
https://newsletter.victordibia.com/p/a-friendly-introduction-to-the-autogen
https://medium.com/@vishwajeetv2003/building-multi-agent-ai-applications-with-autogen-complete-tutorial-2026-2fbd9af73a9c
https://medium.com/@dwivedi.prateek/autogen-framework-redefining-multi-agent-ai-systems-for-enterprise-f50f9816a30f
https://www.ibm.com/think/topics/autogen
https://www.tribe.ai/applied-ai/microsoft-autogen-orchestrating-multi-agent-llm-systems
https://github.com/AI-Training-Projects/autogen_microsoft
https://github.com/langchain-ai/langgraph
https://github.com/langchain-ai/langgraph-swarm-py
https://docs.langchain.com/oss/python/langgraph/graph-api
https://medium.com/@bharatraj1918/langgraph-state-management-part-1-how-langgraph-manages-state-for-multi-agent-workflows-da64d352c43b
https://medium.com/@shuv.sdr/langgraph-architecture-and-design-280c365aaf2c
https://dev.to/sreeni5018/debugging-non-deterministic-llm-agents-implementing-checkpoint-based-state-replay-with-langgraph-5171
https://dev.to/jamesli/langgraph-state-machines-managing-complex-agent-task-flows-in-production-36f4
https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/langgraph-multi-agent-orchestration-complete-framework-guide-architecture-analysis-2025
https://community.intersystems.com/post/unveiling-langgraph
https://www.baihezi.com/mirrors/langgraph/concepts/index.html
https://www.datacamp.com/tutorial/langgraph-agents
https://docs.crewai.com/en/concepts/memory
https://docs.crewai.com/core-concepts/Memory/
https://www.gocodeo.com/post/evaluating-memory-and-state-handling-in-leading-ai-agent-frameworks
https://sparkco.ai/blog/deep-dive-into-crewai-memory-systems
https://deepwiki.com/crewAIInc/crewAI/7.2-memory-configuration-and-storage
https://developer.ibm.com/articles/build-an-agentic-framework-crewai/
https://www.emergentmind.com/topics/crewai
https://mem0.ai/blog/crewai-memory-production-setup-with-mem0
https://dev.to/foxgem/ai-agent-memory-a-comparative-analysis-of-langgraph-crewai-and-autogen-31dp
https://medium.com/@tarekeesa7/crewai-sharedmemory-groq-api-powerful-ai-agent-949ff19027c5
https://github.com/openai/swarm
https://community.openai.com/t/openai-swarm-for-agents-and-agent-handoffs/976579
https://galileo.ai/blog/openai-swarm-framework-multi-agents
https://developers.openai.com/cookbook/examples/orchestrating_agents/
https://lablab.ai/blog/understanding-openai-swarm-a-framework-for-multi-agent-systems
https://openai.github.io/openai-agents-python/
https://www.ai-bites.net/swarm-from-openai-routines-handoffs-and-agents-explained-with-code/
https://medium.com/@michael_79773/exploring-openais-swarm-an-experimental-framework-for-multi-agent-systems-5ba09964ca18
https://venturebeat.com/ai/openais-swarm-ai-agent-framework-routines-and-handoffs
https://notes.muthu.co/2025/10/collaborative-problem-solving-in-multi-agent-systems-with-the-blackboard-architecture/
https://medium.com/@dp2580/building-intelligent-multi-agent-systems-with-mcps-and-the-blackboard-pattern-to-build-systems-a454705d5672
https://www.confluent.io/blog/event-driven-multi-agent-systems/
https://aws.amazon.com/blogs/devops/multi-agent-collaboration-with-strands/
https://arxiv.org/html/2507.01701v1
https://oneuptime.com/blog/post/2026-01-30-agent-coordination/view
https://ieeexplore.ieee.org/document/1425173/
https://github.com/FareedKhan-dev/all-agentic-architectures/blob/main/07_blackboard.ipynb
https://github.com/claudioed/agent-blackboard
https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
https://azure.microsoft.com/en-us/blog/introducing-microsoft-agent-framework/
https://azure.microsoft.com/en-us/blog/agent-factory-the-new-era-of-agentic-ai-common-use-cases-and-design-patterns/
https://learn.microsoft.com/en-us/training/modules/agent-orchestration-patterns/
https://pureai.com/articles/2025/05/19/microsoft-formalizes-ai-agent-stack.aspx
https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-dec-2025-jan-2026/
https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/
https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai-agents/build-secure-process
https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/
https://www.ibm.com/think/topics/agent2agent-protocol
https://discuss.google.dev/t/understanding-a2a-the-protocol-for-agent-collaboration/189103
https://codelabs.developers.google.com/intro-a2a-purchasing-concierge
https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade
https://towardsdatascience.com/inside-googles-agent2agent-a2a-protocol-teaching-ai-agents-to-talk-to-each-other/
https://bhargavaparv.medium.com/meet-a2a-googles-agent-to-agent-protocol-explained-for-developers-24120d1cafff
https://developers.googleblog.com/building-agents-with-the-adk-and-the-new-interactions-api/
https://www.letsdatascience.com/blog/a2a-protocol-agent-to-agent
https://earezki.com/ai-news/2026-03-09-the-state-management-pattern-that-runs-our-5-agent-system-24-7/
https://dev.to/askpatrick/the-state-management-pattern-that-runs-our-5-agent-system-247-2hpj
https://agentic-patterns.com/patterns/filesystem-based-agent-state/
https://www.anthropic.com/engineering/code-execution-with-mcp
https://github.com/tursodatabase/agentfs
https://www.agentfs.ai/
https://1password.com/blog/filesystems-for-agent-swarms
https://1password.com/blog/its-openclaw
https://1password.com/blog/how-to-build-secure-agent-swarms-that-power-autonomous-systems
https://www.flowhunt.io/blog/advanced-ai-agents-with-file-access-mastering-context-offloading-and-state-management/
https://medium.com/@mabd.dev/git-worktrees-the-secret-weapon-for-running-multiple-ai-coding-agents-in-parallel-e9046451eb96
https://nx.dev/blog/git-worktrees-ai-agents
https://www.nrmitchi.com/2025/10/using-git-worktrees-for-multi-feature-development-with-ai-agents/
https://medium.com/@mike-welsh/supercharging-development-using-git-worktree-ai-agents-4486916435cb
https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/
https://github.com/d-kuro/gwq
https://dev.to/mashrulhaque/git-worktrees-for-ai-coding-run-multiple-agents-in-parallel-3pgb
https://dev.to/arifszn/git-worktrees-the-power-behind-cursors-parallel-agents-19j1
https://egghead.io/launch-multiple-cursor-composer-ai-agents-to-work-in-parallel~y1q56
https://vibehackers.io/blog/git-worktrees-multi-agent-development
https://github.com/johnlindquist/worktree-cli
https://www.npmjs.com/package/@johnlindquist/worktree
https://youtu.be/-DTpsDjYKCY
https://nx.dev/docs/features/enhance-ai
https://cli.github.com/
https://cursor.com/blog/scaling-agents
https://arxiv.org/abs/2501.06322
https://arxiv.org/html/2501.06322v1
https://arxiv.org/html/2508.04652v1
https://arxiv.org/html/2506.01839v1
https://www.tandfonline.com/doi/full/10.1080/00207543.2025.2604311
https://xue-guang.com/post/llm-marl/
https://arxiv.org/html/2601.12560v1
https://api.emergentmind.com/topics/large-language-model-based-multi-agent-systems-llm-mas
https://github.com/taichengguo/LLM_MultiAgents_Survey_Papers
https://arxiv.org/pdf/2505.21298
https://www.letta.com/blog/agent-memory
https://redis.io/blog/ai-agent-memory-stateful-systems/
https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/
https://factory.ai/news/context-window-problem
https://medium.com/@bijit211987/context-engineering-is-runtime-of-ai-agents-411c9b2ef1cb
https://galileo.ai/blog/context-engineering-for-agents
https://blogs.oracle.com/developers/agent-memory-why-your-ai-has-amnesia-and-how-to-fix-it
https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-memory-building-context-aware-agents/
https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization/
https://jamiemaguire.net/index.php/2025/12/20/microsoft-agent-framework-giving-agents-contextual-memory-using-aicontextprovider/
https://www.vellum.ai/blog/multi-agent-systems-building-with-context-engineering
https://www.sitepoint.com/multi-agent-ai-development-architecture/
https://www.freecodecamp.org/news/build-and-deploy-multi-agent-ai-with-python-and-docker/
https://kanerika.com/blogs/ai-agent-orchestration/
https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://www.adopt.ai/blog/multi-agent-frameworks
https://dev.to/micromax/understanding-the-actor-design-pattern-a-practical-guide-to-build-actor-systems-with-akka-in-java-p52
https://medium.com/@m.elqrwash/understanding-the-actor-design-pattern-a-practical-guide-to-building-actor-systems-with-akka-in-9ffda751deba
https://mljourney.com/langgraph-vs-crewai-vs-autogen-which-agent-framework-should-you-use-in-2026/
https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen
https://www.instinctools.com/blog/autogen-vs-langchain-vs-crewai/
https://dev.to/custodiaadmin/why-crewai-autogen-and-langgraph-agents-need-screenshots-context-drift-prevention-5em0
https://aaronyuqi.medium.com/first-hand-comparison-of-langgraph-crewai-and-autogen-30026e60b563
https://galileo.ai/blog/autogen-vs-crewai-vs-langgraph-vs-openai-agents-framework
https://latenode.com/blog/platform-comparisons-alternatives/automation-platform-comparisons/langgraph-vs-autogen-vs-crewai-complete-ai-agent-framework-comparison-architecture-analysis-2025
https://dev.to/synsun/autogen-vs-langgraph-vs-crewai-which-agent-framework-actually-holds-up-in-2026-3fl8
https://jetthoughts.com/blog/autogen-crewai-langgraph-ai-agent-frameworks-2025/
https://www.secondtalent.com/resources/top-llm-frameworks-for-building-ai-agents/
https://www.shakudo.io/blog/top-9-ai-agent-frameworks
https://www.firecrawl.dev/blog/best-open-source-agent-frameworks
https://github.com/kaushikb11/awesome-llm-agents
https://www.adaline.ai/blog/top-agentic-llm-models-frameworks-for-2026
https://isolutions.medium.com/language-model-agents-in-2025-897ec15c9c42
https://www.chatbase.co/blog/llm-agent-framework-guide
https://www.voiceflow.com/blog/ai-agent-framework-comparison
https://botpress.com/blog/llm-agent-framework
https://www.internationaljournalssrg.org/IJCSE/paper-details?Id=588
https://docs.anthropic.com/en/docs/agents-and-tools/mcp
```
