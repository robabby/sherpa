# Agentic Design Patterns Reference

Canonical reference for the 21 patterns and 8 organizational structures used by Sherpa's agent role system. Derived from Gulli's "Agentic Design Patterns" (Springer, 2025).

## Patterns

Each pattern has a slug (used in role frontmatter `patterns:` field), a part classification, and a description of what it does and when to apply it.

### Part 1 — Orchestration

How agent work is structured and coordinated.

| # | Slug | Name | What It Does | When to Use |
|---|------|------|-------------|-------------|
| 1 | `prompt-chaining` | Prompt Chaining | Breaks a complex task into sequential focused sub-tasks. Output of step N becomes input for step N+1. | Linear transformation workflows where each step needs the previous result. |
| 2 | `routing` | Routing | Classifies input and directs it to a specialized handler. A dispatcher examines the request and selects the right agent. | When different request types need fundamentally different handling. |
| 3 | `parallelization` | Parallelization | Executes independent tasks concurrently, then aggregates results. Fan-out to workers, fan-in to merge. | When sub-tasks are independent and latency matters. |
| 4 | `reflection` | Reflection | Evaluates own output and iteratively improves. One agent produces, another critiques, producer refines. Prevents cognitive bias of self-review. | Quality-critical outputs that benefit from independent evaluation. |
| 5 | `tool-use` | Tool Use | Interacts with external APIs, databases, code execution environments, and build systems. Extends agent capability beyond text generation. | When the task requires interaction with external systems. |
| 6 | `planning` | Planning | Decomposes a high-level objective into actionable steps before execution begins. Creates implementation plans, identifies dependencies, sequences work. | Complex multi-step goals that need structured decomposition. |
| 7 | `multi-agent-collaboration` | Multi-Agent Collaboration | Specialized agents with defined roles work toward a shared goal. Each agent has distinct capabilities, context, and authority. | When a goal requires diverse capabilities that exceed any single agent's scope. |

### Part 2 — State & Memory

How agents maintain context, learn, and track progress.

| # | Slug | Name | What It Does | When to Use |
|---|------|------|-------------|-------------|
| 8 | `memory-management` | Memory Management | Manages short-term memory (context window) and long-term memory (persistent storage). Curates what persists across sessions. | When agent effectiveness depends on accumulated knowledge. |
| 9 | `learning-and-adaptation` | Learning and Adaptation | Evolves behavior from static to dynamic based on feedback and experience. Incorporates lessons learned into future sessions. | When repeated tasks benefit from accumulated improvements. |
| 10 | `model-context-protocol` | Model Context Protocol | Open standard (MCP) for LLM-to-tool communication. Provides structured, discoverable tool interfaces. | When agents need to interact with tools across frameworks. |
| 11 | `goal-setting-and-monitoring` | Goal Setting and Monitoring | Embeds purpose and self-assessment feedback loops. Agents define success criteria and track progress against them. | When tasks need measurable completion criteria. |

### Part 3 — Reliability

How agents stay correct and safe.

| # | Slug | Name | What It Does | When to Use |
|---|------|------|-------------|-------------|
| 12 | `exception-handling` | Exception Handling | Detects, handles, and recovers from operational failures. Graceful degradation, retry logic, fallback strategies. | When failure modes are known and recoverable. |
| 13 | `human-in-the-loop` | Human-in-the-Loop | Integrates human judgment at critical decision points. Agents escalate when confidence is low or stakes are high. | Decisions with high consequences, ambiguous requirements, or ethical dimensions. |
| 14 | `knowledge-retrieval` | Knowledge Retrieval (RAG) | Grounds responses in external knowledge bases. Retrieves authoritative sources rather than generating from training data alone. | When accuracy depends on specific, verifiable source material. |

### Part 4 — Advanced

Coordination, reasoning, and operational patterns at scale.

| # | Slug | Name | What It Does | When to Use |
|---|------|------|-------------|-------------|
| 15 | `inter-agent-communication` | Inter-Agent Communication | A2A protocol for cross-framework agent coordination. Enables agents built with different tools to exchange messages and delegate tasks. | When agents span multiple frameworks or execution environments. |
| 16 | `resource-aware-optimization` | Resource-Aware Optimization | Routes work by complexity and manages compute/cost/time budgets. Matches task difficulty to model capability. | When cost matters and not every task needs the most capable model. |
| 17 | `reasoning-techniques` | Reasoning Techniques | Advanced reasoning strategies: Chain-of-Thought (CoT), Tree-of-Thought (ToT), ReAct, Chain of Debates. Structured thinking for complex problems. | When problems require multi-step reasoning or exploring alternative solution paths. |
| 18 | `guardrails` | Guardrails / Safety | Multi-layered defense for safe, aligned behavior. Input validation, output filtering, permission boundaries, behavioral constraints. | Every production agent system. Defense in depth. |
| 19 | `evaluation-and-monitoring` | Evaluation and Monitoring | Continuous measurement of agent performance in production. Metrics, quality checks, drift detection. | When agents run repeatedly and quality must be maintained over time. |
| 20 | `prioritization` | Prioritization | Ranks tasks under resource constraints. Determines what gets done first when capacity is limited. | When the backlog exceeds available agent capacity. |
| 21 | `exploration-and-discovery` | Exploration and Discovery | Seeks new information and identifies unknown unknowns. Systematic investigation of the problem space before committing to solutions. | When the problem is under-specified or the solution space is large. |

## Organizational Structures

How multiple agents relate to each other. Each structure has a slug (used in role frontmatter `structure:` field).

| Slug | Name | How It Works | Best For | Example Roles |
|------|------|-------------|----------|---------------|
| `pipeline` | Pipeline | Agents in a chain — output of A becomes input for B. | Linear transformation workflows. | Marketer, Technical Writer |
| `router-dispatcher` | Router / Dispatcher | Central classifier directs work to specialists. | Heterogeneous request types. | *(Phase 2 — workforce dispatch)* |
| `parallel-fan-out-in` | Parallel Fan-Out/In | Concurrent execution with aggregation. | Independent sub-tasks, latency-sensitive. | *(Used in /rr research vectors)* |
| `producer-critic` | Producer-Critic Pair | Generator + evaluator in a feedback loop. | Quality-critical outputs. | Engineer + Code Reviewer |
| `hierarchical-manager-worker` | Hierarchical Manager-Worker | Coordinator delegates to specialized sub-agents. | Complex multi-step goals. | Product Manager, Product Owner, Architect |
| `expert-team` | Expert Team | Peer specialists collaborating on shared output. | Output requiring multiple domains. | Designer, UX Researcher |
| `debate-consensus` | Debate / Consensus | Multiple perspectives discuss and converge. | Decisions requiring diverse viewpoints. | *(Not yet assigned)* |
| `scientific-method` | Scientific Method | Hypothesize, test, rank, evolve. | Exploration and discovery tasks. | Research Lead |

## Cross-Cutting Concept: Context Engineering

The systematic discipline of designing and delivering a complete informational environment to an AI model. Goes beyond prompt engineering to include system prompts, retrieved documents, tool outputs, user identity, interaction history, and environmental state. Output quality depends more on context richness than model architecture alone.

In Sherpa's role system, context engineering is implemented through `context-packages` (what each role reads at session start), `rules` (behavioral constraints), and `skills` (available capabilities). The role catalog is itself a context engineering artifact.

## Source

Antonio Gulli, "Agentic Design Patterns" (Springer, 2025). 424 pages, 21 patterns across 4 parts. Code frameworks: LangChain/LangGraph, Crew AI, Google Agent Development Kit (ADK). Full extraction at `docs/resources/agentic-design-patterns/`.
