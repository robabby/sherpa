# Vector 6: Agent Memory Architectures — How Fleets Maintain State Across Sessions

**Question:** How do agent fleets maintain context and state across sessions? What memory architectures exist for long-running AI agents?
**Agent dispatched:** 2026-03-12

## Findings

### 1. The Memory Landscape: Four Paradigms

Agent memory in 2025-2026 has consolidated around four competing paradigms, each with production implementations:

**A. Filesystem-as-Memory (validated, gaining momentum)**
- CLAUDE.md, MEMORY.md, AGENTS.md, activity.md files
- Letta's Context Repositories (MemFS): git-backed markdown files with frontmatter, progressive disclosure, subagent worktrees ([Letta Context Repos](https://www.letta.com/blog/context-repositories))
- Codex's memory directory: `~/.codex/memories/` with MEMORY.md, rollout_summaries/, skills/ ([Codex Memory System](https://deepwiki.com/openai/codex/3.7-memory-system))
- Manus: filesystem as unlimited memory, agents write/read `todo.md` for goal tracking across ~50 tool calls ([Manus Context Engineering](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus))
- **Letta benchmark result: filesystem-only agent scored 74.0% on LoCoMo, beating Mem0's best (68.5%)** ([Benchmarking AI Agent Memory](https://www.letta.com/blog/benchmarking-ai-agent-memory))
- Key insight: "Agents are highly effective at using tools likely in their training data (such as filesystem operations)" — specialized memory tools underperform

**B. Vector Store + Embedding Memory (mature, widely deployed)**
- Mem0: parallel writes to vector store (semantic search) + optional graph store (relationships) + history log ([Mem0 docs](https://docs.mem0.ai/platform/overview), [Mem0 paper](https://arxiv.org/abs/2504.19413))
- Claimed 26% accuracy boost, 91% lower p95 latency, 90% token savings over baseline
- LangMem: background memory manager with episodic/semantic/procedural memory types, native LangGraph integration ([LangMem SDK](https://langchain-ai.github.io/langmem/))
- Storage backends: Pinecone, Weaviate, Qdrant, Chroma, pgvector
- Weakness: vector stores lose explicit relationships between facts — similarity search retrieves isolated memories

**C. Temporal Knowledge Graphs (emerging, highest accuracy)**
- Zep/Graphiti: bi-temporal knowledge graph engine on Neo4j — every fact has a validity window (when it became true, when superseded) ([Zep paper](https://arxiv.org/abs/2501.13956))
- 94.8% accuracy on DMR benchmark (vs MemGPT 93.4%), 18.5% improvement on LongMemEval, 90% latency reduction
- Three-tier subgraph: episodes, semantic entities, communities
- Neo4j Agent Memory: POLE+O data model (Person, Object, Location, Event, Organization) with short-term, long-term, and reasoning memory ([neo4j-labs/agent-memory](https://github.com/neo4j-labs/agent-memory))
- Mem0 added graph memory in Pro tier, using FalkorDB ([Mem0 graph docs](https://docs.mem0.ai/cookbooks/essentials/choosing-memory-architecture-vector-vs-graph))

**D. LLM-as-Operating-System (tiered memory management)**
- Letta/MemGPT: core memory (always in context, like RAM) + archival memory (external, like disk) + recall memory (searchable conversation history) ([Letta docs](https://docs.letta.com/concepts/memgpt/))
- Agents actively manage what stays in context vs what gets stored externally using self-edit tools
- Raised $10M+ from stealth ([BigDATAwire](https://www.hpcwire.com/bigdatawire/this-just-in/letta-emerges-from-stealth-with-10m-to-build-ai-agents-with-advanced-memory/))

### 2. Production Implementations: Claude Code, Codex, Devin

**Claude Code Memory (3 layers)**
- **CLAUDE.md files**: user-written persistent instructions, loaded at session start. Hierarchy: managed policy > project > user. Support `@path` imports (5 levels deep). `.claude/rules/*.md` for path-scoped rules with glob frontmatter. ([Claude Code Memory Docs](https://code.claude.com/docs/en/memory))
- **Auto memory**: Claude writes notes to itself at `~/.claude/projects/<project>/memory/MEMORY.md` + topic files. First 200 lines loaded every session, topic files loaded on demand. All worktrees/subdirectories within same git repo share one auto memory directory.
- **Session memory**: background extraction every ~10K tokens (first), then ~5K tokens or 3 tool calls. Relevant past session summaries injected at session start. `/compact` is now instant because summaries are written continuously. ([Session Memory details](https://claudefa.st/blog/guide/mechanics/session-memory))
- Subagents can maintain their own auto memory
- Context isolation: each subagent gets fresh context, communicates via filesystem or return values

**OpenAI Codex Memory (2-phase pipeline)**
- Phase 1: per-rollout extraction — LLM extracts `raw_memory`, `rollout_summary`, `rollout_slug` from completed sessions, stores in SQLite ([Codex Memory System](https://deepwiki.com/openai/codex/3.7-memory-system))
- Phase 2: global consolidation — singleton sub-agent reads all Phase 1 outputs, produces `MEMORY.md` handbook + `memory_summary.md` + `skills/<name>/SKILL.md`
- Memory pollution: sessions using web search get marked "polluted", triggering forgetting passes
- Watermark-based deduplication prevents redundant consolidation
- Filesystem layout: `~/.codex/memories/{MEMORY.md, raw_memories.md, rollout_summaries/, skills/}`
- SQLite-backed state persistence with job claiming and lease management

**Devin Workspace State**
- Machine snapshots: workspace resets to saved state at session start, all repos co-exist on default snapshot ([Devin Docs](https://docs.devin.ai/work-with-devin/devin-session-tools))
- Vectorized code snapshots + full replay timeline of every command, file diff, browser tab
- Running to-do list for long-running migrations, persisting across hours or days

### 3. Multi-Agent Shared State

**Current approaches:**
- Filesystem as shared memory: CLAUDE.md loaded by all agents, AGENTS.md (60K+ repos, now under Linux Foundation AAIF) as universal standard ([AGENTS.md](https://agents.md/), [AAIF announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation))
- Git worktrees for subagent isolation: Letta's Context Repositories give each subagent an isolated git worktree, merge via standard git conflict resolution ([Letta Context Repos](https://www.letta.com/blog/context-repositories))
- Anthropic multi-agent research system: lead agent maintains overall state, spawns parallel subagents with defined objectives and output formats. Subagent results summarized to 1-2K tokens. Outperforms single Opus 4 by 90.2%. Bottleneck: synchronous execution — lead waits for each batch. ([Anthropic multi-agent](https://www.anthropic.com/engineering/multi-agent-research-system))
- Neo4j agent-memory: shared knowledge graph with short-term (conversation), long-term (entities/relationships), and reasoning memory (decision traces) accessible by multiple agents ([neo4j-labs/agent-memory](https://github.com/neo4j-labs/agent-memory))

**Emerging protocols:**
- A2A (Agent-to-Agent): Google-originated, now Linux Foundation. Task lifecycle states (submitted, working, input-required, completed, failed). 150+ organizations. ([A2A spec](https://a2a-protocol.org/latest/specification/))
- MCP (Model Context Protocol): Anthropic-originated. Tool/resource access standardization. Also under AAIF. ([MCP docs](https://modelcontextprotocol.io/docs/getting-started/intro))

### 4. Context Engineering: The Unifying Frame

Anthropic now frames the entire problem as "context engineering" — curating the optimal set of tokens during inference. Key strategies ([Anthropic context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)):
- **Compaction**: summarize conversation history when approaching context limits, reinitialize with compressed content
- **Structured note-taking**: agents maintain external files (NOTES.md, todo.md) recalled during later interactions
- **Sub-agent architectures**: focused tasks with clean context windows, condensed 1-2K token summaries back to lead
- **Progressive disclosure**: lightweight identifiers (file paths, URLs) with dynamic loading at runtime — mirrors human cognition using external indexing
- **KV-cache optimization**: Manus reports 10x cost difference between cached/uncached input tokens. Append-only context, deterministic serialization, stable prefixes

### 5. Sleep-Time Compute and Background Processing

Neuroscience-inspired pattern: agents consolidate memory during "downtime" between sessions.
- Letta: sleep-time agents handle memory consolidation asynchronously while responding in real-time ([Letta sleep-time](https://www.letta.com/blog/sleep-time-compute))
- Codex: Phase 2 consolidation runs as background singleton job at session startup
- Claude Code: session memory writes summaries continuously in background
- Google Always On Memory Agent: runs 24/7 as background process, consolidates every 30 minutes, uses SQLite (no vector DB), built on Gemini 3.1 Flash-Lite ([Always On Memory Agent](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/agents/always-on-memory-agent))
- Sleep-time compute showed same accuracy with 11K tokens that baseline needed 20K tokens for (Claude 3.5 Sonnet experiment)

### 6. Novel Architectures (2025-2026)

**GAM (General Agentic Memory)**: dual-agent architecture — "memorizer" captures every exchange as concise memos + full page store, "researcher" performs JIT retrieval with BM25 + embeddings. Over 90% accuracy on RULER benchmark where conventional RAG failed. ([VentureBeat](https://venturebeat.com/ai/gam-takes-aim-at-context-rot-a-dual-agent-memory-architecture-that))

**Observational Memory (Mastra)**: two background agents (Observer + Reflector) compress conversation history into dated observation log kept in-context. Eliminates retrieval entirely. 3-6x text compression, 5-40x for tool-heavy workloads. 10x cost reduction. ([VentureBeat](https://venturebeat.com/data/observational-memory-cuts-ai-agent-costs-10x-and-outscores-rag-on-long))

**MemAct (Memory as Action)**: treats working memory management as learnable policy actions — deletion/insertion operations optimized via reinforcement learning. MemAct-RL-14B matches accuracy of 16x larger models while reducing context length 51%. ([arxiv](https://arxiv.org/abs/2510.12635))

**Continuum Memory Architectures**: spectrum of memory updating at different frequencies, inspired by Google's Nested Learning (NeurIPS 2025). Creates persistent, mutable, consolidating substrate. ([arxiv](https://arxiv.org/html/2601.09913))

### 7. Academic Survey: Taxonomy of Agent Memory

The comprehensive survey "Memory in the Age of AI Agents" (47 authors, Dec 2025) proposes three dimensions ([arxiv](https://arxiv.org/abs/2512.13564)):

**Forms**: token-level (in-context), parametric (fine-tuned weights), latent (learned representations)

**Functions**: factual (what agents know), experiential (what agents have done), working (active task state)

**Dynamics**: formation (how memories are created), evolution (how they change), retrieval (how they're accessed)

Key claim: traditional short-term/long-term distinction is "insufficient to capture the diversity of contemporary agent memory systems." Memory is now "a first-class primitive in the design of future agentic intelligence."

ICLR 2026 accepted a workshop: "MemAgents: Memory for LLM-Based Agentic Systems" ([OpenReview](https://openreview.net/pdf?id=U51WxL382H))

### 8. Benchmarks

| Benchmark | What it tests | Key results |
|-----------|--------------|-------------|
| LoCoMo | Very long-term conversation QA (300 turns, 9K tokens, 35 sessions) | Filesystem: 74.0%, Mem0 graph: 68.5% |
| DMR (Deep Memory Retrieval) | Cross-session synthesis | Zep: 94.8%, MemGPT: 93.4% |
| LongMemEval | 5 core memory abilities, 500 manual questions | Commercial systems: 30-70% accuracy |
| RULER | Information linking over long periods | GAM: >90%, conventional RAG: failed |

### 9. Market Comparison

| System | Architecture | Storage | Open Source | Pricing |
|--------|-------------|---------|-------------|---------|
| Mem0 | Vector + optional graph | Managed/self-host | Yes (core) | Free-$249/mo |
| Zep | Temporal knowledge graph | Cloud-only | Graphiti (engine) | $25/mo+ |
| LangMem | Background manager | Any (via LangGraph) | Yes (MIT) | Free |
| Letta | MemFS (git-backed files) | Local/server | Yes | Free/$49/mo |
| Neo4j Agent Memory | Graph-native POLE+O | Neo4j | Yes (Labs) | Free |
| Google Always On | LLM + SQLite | Local SQLite | Yes (MIT) | Free |

## Implications for Sherpa

### Validation of Filesystem Approach

Sherpa's filesystem-based state model (activity.md, proposal.md, research/ directories, CLAUDE.md) is strongly validated by multiple converging signals:

1. **Letta's benchmark**: filesystem-only agent (74.0%) beat specialized memory tools (68.5%) on LoCoMo. Their explanation: agents are trained on filesystem operations, so they're naturally good at them.
2. **Letta rebuilt toward filesystem**: Context Repositories (Feb 2026) moved from their original MemGPT tiered-memory to git-backed markdown files with frontmatter — essentially converging on what Sherpa already does.
3. **Codex converges similarly**: `~/.codex/memories/MEMORY.md` + skills/ directory + rollout_summaries/ is structurally similar to Sherpa's initiative directories.
4. **Manus production validation**: filesystem as "unlimited, persistent, directly operable" memory in production at scale.
5. **Anthropic's own guidance**: "progressive disclosure" using file paths as lightweight identifiers with dynamic loading — exactly what CLAUDE.md imports and `.claude/rules/` with path globs implement.

### What Sherpa Does That Others Don't

- **Git-native governance**: Sherpa's initiative directories are already git-tracked, providing versioning that Letta had to explicitly build (Context Repositories). Proposal/activity/research structure creates implicit temporal memory.
- **Behavioral agent definitions**: Most memory systems focus on conversation history or facts. Sherpa's `.agents/` behavioral definitions persist procedural knowledge (how to work) alongside factual knowledge (what's happening).
- **Multi-session initiative tracking**: activity.md logs, research iterations, and proposal lifecycle create a structured episodic memory that spans sessions without explicit memory extraction.

### What Sherpa Could Adopt

1. **Sleep-time consolidation**: Between sessions, a background process could synthesize activity logs into updated MEMORY.md or project summaries. Both Codex and Letta do this.
2. **Structured memory extraction**: Codex's Phase 1/Phase 2 pipeline (extract from session, consolidate globally) could be adapted for Sherpa's session-based workflow. Each session's key decisions could auto-extract into a structured format.
3. **Progressive disclosure metadata**: Letta's frontmatter approach (description, character limit, read-only flag) on memory files could help CLAUDE.md and rules files self-describe for better context management.
4. **Memory pollution tracking**: Codex marks sessions as "polluted" when using web search. Sherpa could track which research came from external sources vs codebase exploration.
5. **Subagent worktree isolation**: Letta's concurrent subagent processing via git worktrees aligns perfectly with Sherpa's existing worktree conventions.

### What's Missing Everywhere

- No standard for **cross-project memory sharing**. Each tool's memory is siloed to a project/repo.
- **Multi-human + multi-agent** coordination has no production solution. Sherpa's governance model (proposals, reviews, activity logs) is actually ahead of the field here.
- **Temporal relationship tracking** (Zep's validity windows) hasn't made it into filesystem-based approaches yet. Sherpa's proposal frontmatter `created`/`updated`/`started` fields are a primitive version.

## Open Questions

1. Should Sherpa adopt AGENTS.md as a complement to CLAUDE.md? It's now a Linux Foundation standard with 60K+ repos.
2. Is there value in adding vector search over initiative directories and research artifacts? Or does filesystem + grep remain sufficient?
3. Could Sherpa's activity.md logs be structured enough to enable automatic memory extraction (like Codex's Phase 1)?
4. Should initiative research artifacts include machine-readable memory metadata (beyond current YAML frontmatter)?
5. How should memory work when multiple Claude Code sessions operate on the same Sherpa repo simultaneously? Current auto memory is per-project, not per-initiative.

## Sources

### Primary Sources (directly fetched and analyzed)

- [Claude Code Memory Docs](https://code.claude.com/docs/en/memory) — Complete docs on CLAUDE.md, auto memory, rules, session memory
- [Anthropic: Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Compaction, structured note-taking, sub-agents, progressive disclosure
- [Anthropic: Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) — Orchestrator-worker pattern, 90.2% improvement over single agent
- [Letta: Context Repositories](https://www.letta.com/blog/context-repositories) — MemFS architecture, git-backed versioning, subagent worktrees
- [Letta: Benchmarking AI Agent Memory](https://www.letta.com/blog/benchmarking-ai-agent-memory) — Filesystem beats specialized memory tools on LoCoMo
- [Manus: Context Engineering for AI Agents](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) — KV-cache, filesystem as memory, tool masking, todo.md pattern
- [Codex Memory System (DeepWiki)](https://deepwiki.com/openai/codex/3.7-memory-system) — Full SQLite schema, Phase 1/2 pipeline, consolidation, filesystem layout
- [Zep Paper (arxiv)](https://arxiv.org/abs/2501.13956) — Temporal knowledge graph, Graphiti engine, 94.8% DMR accuracy
- [Mem0 vs Zep vs LangMem vs MemoClaw Comparison](https://dev.to/anajuliabit/mem0-vs-zep-vs-langmem-vs-memoclaw-ai-agent-memory-comparison-2026-1l1k) — Feature-by-feature comparison
- [Memory in the Age of AI Agents (arxiv)](https://arxiv.org/abs/2512.13564) — 47-author survey, forms/functions/dynamics taxonomy
- [Neo4j Agent Memory](https://github.com/neo4j-labs/agent-memory) — POLE+O model, multi-framework integration
- [Agent Design Patterns (Lance Martin)](https://rlancemartin.github.io/2026/01/09/agent_design/) — Progressive disclosure, context offloading, skill learning

### Secondary Sources (search results analyzed)

- [Letta Platform](https://www.letta.com/) — MemGPT creators, $10M+ funding
- [Letta Docs: Memory](https://docs.letta.com/letta-code/memory/) — MemFS documentation
- [Letta: Rearchitecting Agent Loop](https://www.letta.com/blog/letta-v1-agent) — Lessons from ReAct, MemGPT, Claude Code
- [Letta: Sleep-Time Compute](https://www.letta.com/blog/sleep-time-compute) — Background memory consolidation
- [Letta: Conversations API](https://www.letta.com/blog/conversations) — Shared agent memory across concurrent experiences
- [Letta: Memory Blocks](https://www.letta.com/blog/memory-blocks) — Key to agentic context management
- [Letta: Agent Memory Blog](https://www.letta.com/blog/agent-memory) — How to build agents that learn and remember
- [Mem0 Platform](https://mem0.ai/) — Universal memory layer
- [Mem0 Docs](https://docs.mem0.ai/platform/overview) — Platform overview
- [Mem0 Research](https://mem0.ai/research) — 26% accuracy boost paper
- [Mem0 Paper (arxiv)](https://arxiv.org/abs/2504.19413) — Production-ready agents with scalable memory
- [Mem0 Graph Memory Solutions](https://mem0.ai/blog/graph-memory-solutions-ai-agents) — Graph memory comparison (Jan 2026)
- [Mem0 Architecture (Medium)](https://medium.com/@parthshr370/from-chat-history-to-ai-memory-a-better-way-to-build-intelligent-agents-f30116b0c124) — Architecture deep dive
- [Mem0 + AWS](https://aws.amazon.com/blogs/database/build-persistent-memory-for-agentic-ai-applications-with-mem0-open-source-amazon-elasticache-for-valkey-and-amazon-neptune-analytics/) — AWS integration pattern
- [Mem0 + AutoGen](https://microsoft.github.io/autogen/0.2/docs/ecosystem/mem0/) — Microsoft integration
- [Zep: Graphiti on Neo4j](https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/) — Knowledge graph memory
- [Zep Platform](https://www.getzep.com/) — Context engineering and agent memory
- [Graphiti GitHub](https://github.com/getzep/graphiti) — Open-source temporal knowledge graph engine
- [LangMem SDK](https://blog.langchain.com/langmem-sdk-launch/) — Launch announcement
- [LangMem Conceptual Guide](https://langchain-ai.github.io/langmem/concepts/conceptual_guide/) — Episodic, semantic, procedural memory
- [LangMem GitHub](https://github.com/langchain-ai/langmem) — Source code
- [LangChain Long-Term Memory Docs](https://docs.langchain.com/oss/python/deepagents/long-term-memory) — LangGraph integration
- [LangGraph State Management](https://sparkco.ai/blog/mastering-langgraph-state-management-in-2025) — Checkpointing patterns
- [Claude Code Session Memory](https://claudefa.st/blog/guide/mechanics/session-memory) — Cross-session context details
- [Claude Code Memory Architecture (DEV)](https://dev.to/suede/the-architecture-of-persistent-memory-for-claude-code-17d) — Persistent memory architecture
- [Claude mem Plugin](https://github.com/thedotmack/claude-mem) — Community memory plugin
- [Memsearch Plugin](https://milvus.io/blog/adding-persistent-memory-to-claude-code-with-the-lightweight-memsearch-plugin.md) — Milvus-based memory for Claude Code
- [Claude Memory Tool (API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) — Memory tool for Claude API
- [Claude Memory System (giuseppegurgone)](https://giuseppegurgone.com/claude-memory) — Experimental memory system analysis
- [Memory for Claude Code (Medium)](https://agentnativedev.medium.com/persistent-memory-for-claude-code-never-lose-context-setup-guide-2cb6c7f92c58) — Setup guide
- [AGENTS.md Specification](https://agents.md/) — Universal agent instruction format
- [AGENTS.md GitHub](https://github.com/agentsmd/agents.md) — Source and specification
- [AAIF Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) — MCP + AGENTS.md + Goose under neutral governance
- [OpenAI AAIF Announcement](https://openai.com/index/agentic-ai-foundation/) — OpenAI co-founding AAIF
- [AAIF Guide](https://intuitionlabs.ai/articles/agentic-ai-foundation-open-standards) — Open standards for AI agents
- [Filesystem Agent Memory Guide (HackerNoon)](https://hackernoon.com/the-complete-guide-to-ai-agent-memory-files-claudemd-agentsmd-and-beyond) — CLAUDE.md, AGENTS.md, .cursorrules comparison
- [Devin Session Tools](https://docs.devin.ai/work-with-devin/devin-session-tools) — Workspace state, snapshots
- [Codex Changelog](https://developers.openai.com/codex/changelog/) — Memory improvements timeline
- [Codex AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md/) — AGENTS.md in Codex
- [Codex Context Management](https://datalakehousehub.com/blog/2026-03-context-management-openai-codex/) — Comprehensive context strategies
- [OpenAI Agents SDK Sessions](https://openai.github.io/openai-agents-python/sessions/) — Session management
- [OpenAI Context Personalization Cookbook](https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization/) — State management with long-term memory
- [Basic Memory for Codex](https://docs.basicmemory.com/integrations/codex) — Third-party memory integration
- [GAM Dual-Agent Architecture (VentureBeat)](https://venturebeat.com/ai/gam-takes-aim-at-context-rot-a-dual-agent-memory-architecture-that) — Memorizer + researcher pattern
- [Observational Memory (VentureBeat)](https://venturebeat.com/data/observational-memory-cuts-ai-agent-costs-10x-and-outscores-rag-on-long) — Mastra's observer + reflector pattern
- [Google Always On Memory Agent](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/agents/always-on-memory-agent) — LLM + SQLite, no vector DB
- [Google Always On Memory (VentureBeat)](https://venturebeat.com/orchestration/google-pm-open-sources-always-on-memory-agent-ditching-vector-databases-for) — Design philosophy
- [A2A Protocol Spec](https://a2a-protocol.org/latest/specification/) — Agent-to-agent protocol
- [A2A Announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) — Google's original announcement
- [MCP Introduction](https://modelcontextprotocol.io/docs/getting-started/intro) — Model Context Protocol docs
- [Memory as Action Paper (arxiv)](https://arxiv.org/abs/2510.12635) — MemAct RL framework
- [Continuum Memory Architectures (arxiv)](https://arxiv.org/html/2601.09913) — Spectrum-frequency memory
- [MemAgents ICLR 2026 Workshop](https://openreview.net/pdf?id=U51WxL382H) — Workshop proposal
- [Agent Memory Paper List (GitHub)](https://github.com/Shichun-Liu/Agent-Memory-Paper-List) — Comprehensive paper collection
- [Awesome Memory for Agents (GitHub)](https://github.com/TsinghuaC3I/Awesome-Memory-for-Agents) — Tsinghua paper collection
- [Multi-Agent Memory Survey (TechRxiv)](https://www.techrxiv.org/users/1007269/articles/1367390/master/file/data/LLM_MAS_Memory_Survey_preprint_/LLM_MAS_Memory_Survey_preprint_.pdf?inline=true) — MAS memory mechanisms
- [Episodic Memory Position Paper (arxiv)](https://arxiv.org/pdf/2502.06975) — "Episodic Memory is the Missing Piece"
- [CORAL: Cognitive Resource Self-Allocation (OpenReview)](https://openreview.net/forum?id=NBGlItueYE) — Context window management
- [Intrinsic Memory Agents (arxiv)](https://arxiv.org/pdf/2508.08997) — Heterogeneous multi-agent memory
- [LoCoMo Benchmark](https://snap-research.github.io/locomo/) — Long-term conversational memory evaluation
- [LoCoMo Paper (arxiv)](https://arxiv.org/abs/2402.17753) — Benchmark paper
- [LongMemEval (arxiv)](https://arxiv.org/pdf/2410.10813) — Memory evaluation benchmark
- [Agentic RAG Survey (arxiv)](https://arxiv.org/abs/2501.09136) — Agentic RAG comprehensive survey
- [A-RAG Hierarchical Retrieval (arxiv)](https://arxiv.org/html/2602.03442v1) — Scaling agentic RAG
- [RAG 2025 Review (RAGFlow)](https://ragflow.io/blog/rag-review-2025-from-rag-to-context) — RAG to context engine evolution
- [Agentic Context Engineering (arxiv)](https://arxiv.org/abs/2510.04618) — Evolving contexts for self-improving LLMs
- [Multi-Agent Orchestration Guide](https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier) — 2026 patterns
- [O'Reilly: Multi-Agent Memory Engineering](https://www.oreilly.com/radar/why-multi-agent-systems-need-memory-engineering/) — Why MAS need memory
- [Memory Wars (GoFast)](https://www.gofast.ai/blog/memory-wars-agent-persistence-competitive-battleground-ai-agent-memory) — Competitive landscape analysis
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents) — Context isolation, memory sharing
- [VS Code Multi-Agent Development](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development) — IDE multi-agent support
- [MCP Memory Service](https://github.com/doobidoo/mcp-memory-service) — Open-source MCP memory with knowledge graph
- [OpenMemory](https://github.com/CaviraOSS/OpenMemory) — Local persistent memory for LLM applications
- [Microsoft Agent Framework Checkpointing](https://learn.microsoft.com/en-us/agent-framework/tutorials/workflows/checkpointing-and-resuming) — Checkpoint/resume pattern
- [Anthropic Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) — Agent architecture guidance
- [Anthropic Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents) — Tool design principles
- [Anthropic Context Management](https://www.anthropic.com/news/context-management) — Context management feature
- [Memory Cookbook (Claude API)](https://platform.claude.com/cookbook/tool-use-memory-cookbook) — Memory implementation patterns
- [Stateful AI Agents Deep Dive (Medium)](https://medium.com/@piyush.jhamb4u/stateful-ai-agents-a-deep-dive-into-letta-memgpt-memory-models-a2ffc01a7ea1) — MemGPT memory models analysis
- [Letta + DeepLearning.AI Course](https://www.letta.com/blog/deeplearning-ai-llms-as-operating-systems-agent-memory) — LLMs as operating systems
- [Cognitive Agents with LangChain (2026)](https://research.aimultiple.com/ai-agent-memory/) — Creating minds with LangChain
- [LangChain + MongoDB Long-Term Memory](https://www.mongodb.com/company/blog/product-release-announcements/powering-long-term-memory-for-agents-langgraph) — LangGraph + MongoDB integration
- [Databricks Agent Memory](https://docs.databricks.com/aws/en/generative-ai/agent-framework/stateful-agents) — Stateful agents documentation
- [Context Engineering Complete Guide (2026)](https://codeconductor.ai/blog/context-engineering) — Comprehensive guide
- [AI Agent Protocols 2026](https://www.ruh.ai/blogs/ai-agent-protocols-2026-complete-guide) — Protocol standardization guide

## Raw Links

https://docs.letta.com/concepts/memgpt/
https://www.letta.com/
https://www.letta.com/blog/benchmarking-ai-agent-memory
https://www.letta.com/blog/context-repositories
https://www.letta.com/blog/letta-v1-agent
https://www.letta.com/blog/sleep-time-compute
https://www.letta.com/blog/conversations
https://www.letta.com/blog/memory-blocks
https://www.letta.com/blog/agent-memory
https://www.letta.com/blog/letta-code
https://www.letta.com/blog/memgpt-and-letta
https://www.letta.com/research
https://docs.letta.com/letta-code/memory/
https://github.com/letta-ai/letta
https://github.com/letta-ai/letta-code
https://github.com/letta-ai/awesome-letta
https://www.hpcwire.com/bigdatawire/this-just-in/letta-emerges-from-stealth-with-10m-to-build-ai-agents-with-advanced-memory/
https://research.memgpt.ai/
https://arxiv.org/abs/2501.13956
https://arxiv.org/html/2501.13956v1
https://blog.getzep.com/content/files/2025/01/ZEP__USING_KNOWLEDGE_GRAPHS_TO_POWER_LLM_AGENT_MEMORY_2025011700.pdf
https://github.com/getzep/graphiti
https://www.getzep.com/
https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/
https://github.com/neo4j-labs/agent-memory
https://medium.com/neo4j/meet-lennys-memory-building-context-graphs-for-ai-agents-24cb102fb91a
https://mem0.ai/
https://docs.mem0.ai/platform/overview
https://docs.mem0.ai/cookbooks/essentials/choosing-memory-architecture-vector-vs-graph
https://mem0.ai/research
https://mem0.ai/blog/graph-memory-solutions-ai-agents
https://github.com/mem0ai/mem0
https://arxiv.org/abs/2504.19413
https://arxiv.org/html/2504.19413v1
https://aws.amazon.com/blogs/database/build-persistent-memory-for-agentic-ai-applications-with-mem0-open-source-amazon-elasticache-for-valkey-and-amazon-neptune-analytics/
https://microsoft.github.io/autogen/0.2/docs/ecosystem/mem0/
https://medium.com/@parthshr370/from-chat-history-to-ai-memory-a-better-way-to-build-intelligent-agents-f30116b0c124
https://www.datacamp.com/tutorial/mem0-tutorial
https://www.falkordb.com/blog/graph-memory-llm-agents-mem0-falkordb/
https://code.claude.com/docs/en/memory
https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
https://platform.claude.com/cookbook/tool-use-memory-cookbook
https://claudefa.st/blog/guide/mechanics/session-memory
https://dev.to/suede/the-architecture-of-persistent-memory-for-claude-code-17d
https://dev.to/shimo4228/embedding-memory-into-claude-code-from-session-loss-to-persistent-context-54d8
https://giuseppegurgone.com/claude-memory
https://github.com/thedotmack/claude-mem
https://milvus.io/blog/adding-persistent-memory-to-claude-code-with-the-lightweight-memsearch-plugin.md
https://agentnativedev.medium.com/persistent-memory-for-claude-code-never-lose-context-setup-guide-2cb6c7f92c58
https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/faq/
https://github.com/anthropics/claude-code/issues/14227
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
https://www.anthropic.com/engineering/multi-agent-research-system
https://www.anthropic.com/research/building-effective-agents
https://www.anthropic.com/engineering/writing-tools-for-agents
https://www.anthropic.com/news/context-management
https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
https://code.claude.com/docs/en/sub-agents
https://blog.langchain.com/langmem-sdk-launch/
https://langchain-ai.github.io/langmem/
https://langchain-ai.github.io/langmem/concepts/conceptual_guide/
https://github.com/langchain-ai/langmem
https://docs.langchain.com/oss/python/deepagents/long-term-memory
https://changelog.langchain.com/announcements/langmem-sdk-for-long-term-agent-memory
https://www.mongodb.com/company/blog/product-release-announcements/powering-long-term-memory-for-agents-langgraph
https://www.digitalocean.com/community/tutorials/langmem-sdk-agent-long-term-memory
https://docs.devin.ai/work-with-devin/devin-session-tools
https://github.com/DevinAI-agent/devin-AI
https://cli.devin.ai/docs/reference/commands
https://developers.openai.com/codex/changelog/
https://developers.openai.com/codex/
https://developers.openai.com/codex/guides/agents-md/
https://developers.openai.com/codex/config-reference/
https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization/
https://deepwiki.com/openai/codex/3.7-memory-system
https://datalakehousehub.com/blog/2026-03-context-management-openai-codex/
https://openai.github.io/openai-agents-python/sessions/
https://github.com/openai/codex/discussions/8339
https://docs.basicmemory.com/integrations/codex
https://agents.md/
https://github.com/agentsmd/agents.md
https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
https://openai.com/index/agentic-ai-foundation/
https://www.prnewswire.com/news-releases/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation-aaif-anchored-by-new-project-contributions-including-model-context-protocol-mcp-goose-and-agentsmd-302636897.html
https://www.infoq.com/news/2025/12/agentic-ai-foundation/
https://a2a-protocol.org/latest/specification/
https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
https://modelcontextprotocol.io/docs/getting-started/intro
https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
https://hackernoon.com/the-complete-guide-to-ai-agent-memory-files-claudemd-agentsmd-and-beyond
https://rlancemartin.github.io/2026/01/09/agent_design/
https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/agents/always-on-memory-agent
https://venturebeat.com/orchestration/google-pm-open-sources-always-on-memory-agent-ditching-vector-databases-for
https://venturebeat.com/ai/gam-takes-aim-at-context-rot-a-dual-agent-memory-architecture-that
https://venturebeat.com/data/observational-memory-cuts-ai-agent-costs-10x-and-outscores-rag-on-long
https://github.com/doobidoo/mcp-memory-service
https://github.com/CaviraOSS/OpenMemory
https://github.com/GibsonAI/Memori
https://docs.cloud.google.com/agent-builder/agent-engine/memory-bank/overview
https://arxiv.org/abs/2512.13564
https://arxiv.org/pdf/2512.13564
https://arxiv.org/abs/2510.12635
https://arxiv.org/pdf/2510.12635
https://arxiv.org/html/2510.12635
https://arxiv.org/html/2601.09913
https://arxiv.org/pdf/2601.09913
https://arxiv.org/abs/2404.13501
https://arxiv.org/abs/2402.17753
https://arxiv.org/pdf/2410.10813
https://arxiv.org/pdf/2510.01353
https://arxiv.org/abs/2501.09136
https://arxiv.org/html/2602.03442v1
https://arxiv.org/html/2506.00054v1
https://arxiv.org/abs/2510.04618
https://arxiv.org/html/2510.04618
https://arxiv.org/pdf/2509.25250
https://arxiv.org/pdf/2508.08997
https://arxiv.org/html/2507.18910v1
https://arxiv.org/html/2603.04740v1
https://openreview.net/pdf?id=U51WxL382H
https://openreview.net/forum?id=NBGlItueYE
https://openreview.net/forum?id=UbSUxAK3BI
https://openreview.net/pdf?id=eC4ygDs02R
https://github.com/Shichun-Liu/Agent-Memory-Paper-List
https://github.com/TsinghuaC3I/Awesome-Memory-for-Agents
https://github.com/masamasa59/ai-agent-papers/blob/main/capability-papers/memory.md
https://www.techrxiv.org/users/1007269/articles/1367390/master/file/data/LLM_MAS_Memory_Survey_preprint_/LLM_MAS_Memory_Survey_preprint_.pdf?inline=true
https://arxiv.org/pdf/2502.06975
https://snap-research.github.io/locomo/
https://medium.com/asymptotic-spaghetti-integration/emergence-ai-broke-the-agent-memory-benchmark-i-tried-to-break-their-code-23b9751ded97
https://supermemory.ai/research
https://arxiv.org/pdf/2507.05257
https://arxiv.org/pdf/2602.11243
https://www.emergentmind.com/topics/memory-mechanisms-in-llm-based-agents
https://www.emergentmind.com/topics/zep-a-temporal-knowledge-graph-architecture
https://www.emergentmind.com/topics/retrieval-augmented-generation-rag-b2f527f9-ed5b-4d55-bf40-48c4e873c676
https://www.emergentmind.com/topics/locomo-benchmark
https://www.emergentmind.com/topics/long-horizon-agentic-search-frameworks
https://www.themoonlight.io/en/review/memory-as-action-autonomous-context-curation-for-long-horizon-agentic-tasks
https://dev.to/anajuliabit/mem0-vs-zep-vs-langmem-vs-memoclaw-ai-agent-memory-comparison-2026-1l1k
https://dev.to/zer0h1ro/odei-vs-mem0-vs-zep-choosing-agent-memory-architecture-in-2026-15c0
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://dev.to/theprodsde/langgraph-vs-semantic-kernel-python-ai-agents-in-2026-1p4g
https://medium.com/@saeedhajebi/building-ai-agents-with-knowledge-graph-memory-a-comprehensive-guide-to-graphiti-3b77e6084dec
https://medium.com/@kushalbanda/how-we-built-our-multi-agent-research-system-5f5e10b2a8d6
https://medium.com/data-unlocked/the-memory-problem-in-ai-agents-is-half-solved-heres-the-other-half-ebbf218ae4d5
https://shilpathota.medium.com/agentic-knowledge-graph-construction-with-neo4j-aadda43b71d9
https://agentnativedev.medium.com/reverse-engineering-anthropics-agent-blueprint-to-outperform-claude-opus-4-by-90-564f20a0e0a3
https://medium.com/@piyush.jhamb4u/stateful-ai-agents-a-deep-dive-into-letta-memgpt-memory-models-a2ffc01a7ea1
https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent
https://llmmultiagents.com/en/blogs/anthropic-multi-agent-system-reflection
https://the-decoder.com/general-agentic-memory-tackles-context-rot-and-outperforms-rag-in-memory-benchmarks/
https://the-decoder.com/anthropic-shares-blueprint-for-claude-research-agent-using-multiple-ai-agents-in-parallel/
https://simonwillison.net/2025/Jun/14/multi-agent-research-system/
https://www.gofast.ai/blog/memory-wars-agent-persistence-competitive-battleground-ai-agent-memory
https://www.generalintelligencecompany.com/writing/introducing-cofounder-our-state-of-the-art-memory-system-in-an-agent
https://www.oreilly.com/radar/why-multi-agent-systems-need-memory-engineering/
https://ragflow.io/blog/rag-review-2025-from-rag-to-context
https://squirro.com/squirro-blog/state-of-rag-genai
https://www.pinecone.io/learn/retrieval-augmented-generation/
https://www.promptingguide.ai/research/rag
https://aws.amazon.com/what-is/retrieval-augmented-generation/
https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
https://www.onabout.ai/p/mastering-multi-agent-orchestration-architectures-patterns-roi-benchmarks-for-2025-2026
https://www.adopt.ai/blog/multi-agent-frameworks
https://www.multimodal.dev/post/best-multi-agent-ai-frameworks
https://futureagi.substack.com/p/top-5-agentic-ai-frameworks-to-watch
https://aimultiple.com/agentic-frameworks
https://www.intuz.com/blog/top-5-ai-agent-frameworks-2025
https://calmops.com/ai/ai-agent-frameworks-comparison-2026/
https://calmops.com/database/neo4j/neo4j-trends/
https://www.ruh.ai/blogs/ai-agent-protocols-2026-complete-guide
https://sparkco.ai/blog/mastering-langgraph-state-management-in-2025
https://sparkco.ai/blog/mastering-memory-consistency-in-ai-agents-2025-insights
https://learn.microsoft.com/en-us/agent-framework/tutorials/workflows/checkpointing-and-resuming
https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/as-agents
https://discuss.huggingface.co/t/how-do-you-preserve-agent-state-across-restarts/172174/1
https://discuss.huggingface.co/t/how-do-you-preserve-agent-state-across-restarts/172174/2
https://docs.databricks.com/aws/en/generative-ai/agent-framework/stateful-agents
https://www.augmentcode.com/tools/best-devin-alternatives
https://vstorm.co/open-source/pydantic-deep-agents-vs-langchain-deep-agents-which-python-ai-agent-framework-should-you-choose/
https://www.leanware.co/insights/langchain-agents-complete-guide-in-2025
https://research.aimultiple.com/ai-agent-memory/
https://codeconductor.ai/blog/context-engineering
https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide
https://www.richsnapp.com/article/2025/10-05-context-management-with-subagents-in-claude-code
https://arxiv.org/html/2508.08322v1
https://www.heyuan110.com/posts/ai/2026-02-28-claude-code-teams-guide/
https://github.com/wshobson/agents
https://github.com/VoltAgent/awesome-claude-code-subagents
https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development
https://deepwiki.com/anthropics/claude-code/2.4-session-management
https://deepwiki.com/victor-software-house/claude-code-docs/3.2.2-session-management
https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/13.1-session-management-commands
https://deepwiki.com/microsoft/agent-framework/3.4.1-agent-threads-and-state
https://github.com/ruvnet/ruflo/wiki/session-persistence
https://stevekinney.com/courses/ai-development/claude-code-session-management
https://docs.claude.com/en/api/agent-sdk/sessions
https://platform.claude.com/docs/en/agent-sdk/sessions
https://www.promptfoo.dev/docs/providers/claude-agent-sdk/
https://watch.knowledgegraph.tech/videos/zep-a-temporal-knowledge-graph-architecture-for-agent-memory-720p
https://www.researchgate.net/publication/388402077_Zep_A_Temporal_Knowledge_Graph_Architecture_for_Agent_Memory
https://dl.acm.org/doi/10.1145/3748302
https://aiagent.marktechpost.com/post/how-to-build-a-multi-agent-research-system
https://centific.com/news-and-press/anthropic-s-multi-agent-research-system-raises-the-bar-for-open-ended-ai-reasoning
https://blog.futuresmart.ai/building-ai-knowledge-graph-using-graphiti-and-neo4j
https://playbooks.com/mcp/jovanhsu-neo4j-knowledge-graph
https://huggingface.co/papers/2512.13564
https://liner.com/review/memory-in-age-ai-agents
https://papers.cool/arxiv/2512.13564
https://arxiviq.substack.com/p/memory-in-the-age-of-ai-agents
https://labs.adaline.ai/p/the-ai-research-landscape-in-2026
https://fastcompanyme.com/technology/why-sleep-time-compute-is-the-next-big-leap-in-ai/
https://www.fastcompany.com/91368307/why-sleep-time-compute-is-the-next-big-leap-in-ai
https://www.prompthub.us/blog/sleep-time-compute
https://www.digit.in/features/general/googles-new-ai-agent-remembers-everything-heres-how-it-works.html
https://blocksandfiles.com/2025/09/24/memverges-ambitious-long-context-ai-memmachine-memory/
https://news.ycombinator.com/item?id=47290892
https://www.deployhq.com/guides/devin
https://www.datacamp.com/tutorial/devin-ai
https://www.solo.io/blog/aaif-announcement-agentgateway
https://www.cdomagazine.tech/aiml/agentic-ai-foundation-launched-to-advance-open-standards
https://www.privacyguides.org/news/2025/12/24/the-linux-foundation-announces-formation-of-the-agentic-ai-foundation/
https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/
https://a2aprotocol.ai/blog/2025-part2-full-guide-a2a-protocol
https://zuplo.com/learning-center/agent-to-agent-a2a-protocol-guide
https://bhargavaparv.medium.com/meet-a2a-googles-agent-to-agent-protocol-explained-for-developers-24120d1cafff
https://www.ibm.com/think/topics/agent2agent-protocol
https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade
https://codelabs.developers.google.com/intro-a2a-purchasing-concierge
https://docs.openclaw.ai/concepts/memory
https://www.zenml.io/llmops-database/building-a-multi-agent-research-system-for-complex-information-tasks
https://intuitionlabs.ai/articles/openai-codex-app-ai-coding-agents
https://www.elephaant.com/blog/google-always-on-memory-agent-vector-db-alternative-2026
https://arxiv.org/abs/2301.00234
https://medium.com/@joaolages/kv-caching-explained-276520203249
https://docs.vllm.ai/en/stable/design/v1/prefix_caching.html
https://arxiv.org/abs/1410.5401
https://startupnews.fyi/2026/01/16/memory-for-ai-agents-a-new-paradigm-of-context-engineering/
