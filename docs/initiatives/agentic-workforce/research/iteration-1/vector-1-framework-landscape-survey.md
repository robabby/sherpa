# Vector 1: Agentic Framework Landscape Survey

**Question:** What are the major agentic AI frameworks available in 2025-2026, and how do they compare?
**Agent dispatched:** 2026-03-10

## Findings

### OpenClaw (confirmed real, not a misspelling)

Created by Peter Steinberger (Austrian developer), formerly named Clawdbot/Moltbot/Molty. MIT-licensed. 250K+ GitHub stars in ~4 months — the most-starred non-aggregator software project on GitHub. 300-400K estimated users. It is a **personal AI agent runtime**, not a multi-agent orchestration framework. Architecture: persistent Gateway process (WebSocket server) connected to messaging channels (WhatsApp, Telegram, Discord, Signal, iMessage). Skills system with runtime discovery, file-based memory (Markdown/YAML, git-backable). Model-agnostic (Claude, GPT, DeepSeek, local via Ollama). Major security concern: 512 vulnerabilities found in a January 2026 audit, 8 critical.

### Tier 1: Production-grade orchestration frameworks

- **LangGraph** (by LangChain) — Graph-based state machines. Python + JS. 25K+ stars. Apache 2.0. Hit v1.0. Durable execution, human-in-the-loop, persistent memory. Most control-oriented framework. Steep learning curve. Used by Uber, LinkedIn, Klarna.
- **CrewAI** — Role-based crews + event-driven flows. Python only. 44.6K stars. Independent of LangChain. Dual architecture: autonomous "crews" for agent teams, "flows" for deterministic pipelines. 100K+ certified developers.
- **Microsoft AutoGen / Agent Framework** — Conversation-driven multi-agent. Python + .NET. 50K+ stars. MIT. Now being subsumed into "Microsoft Agent Framework" (convergence of AutoGen + Semantic Kernel), targeting 1.0 GA by end of Q1 2026.

### Tier 2: Vendor SDKs

- **Claude Agent SDK** (Anthropic) — Renamed from Claude Code SDK (September 2025). Python + TypeScript. Same runtime powering Claude Code exposed as SDK. Not open-source in framework sense.
- **OpenAI Agents SDK** — Evolution of Swarm. Lightweight primitives: Agents, Handoffs, Guardrails, Runner. Provider-agnostic.
- **Google Agent Development Kit (ADK)** — Open-source. Optimized for Gemini but model-agnostic. Deploys to Vertex AI.

### Tier 3: Specialized

- **Mastra** — TypeScript-native. Gatsby team. YC backed, $13M seed. 150K weekly npm downloads. Leading TS-native option.
- **Pydantic AI** — Type-safe agents from Pydantic team. MCP + A2A protocols.
- **OpenHands** (formerly OpenDevin) — 68.8K stars. Software engineering agents specifically.
- **smolagents** (Hugging Face) — Minimalist. ~1000 lines core. Code Agents pattern.
- **LlamaIndex** — RAG + agent workflows. 35K+ stars. Event-driven.
- **Composio** — Integration layer. 850+ managed connectors. Plugs into 25+ frameworks.

### Comparison Matrix

| Framework | Pattern | Language | Stars | License | Heterogeneous Models | Local Models |
|-----------|---------|----------|-------|---------|---------------------|-------------|
| OpenClaw | Gateway + skills | TypeScript | 250K+ | MIT | Yes | Yes (Ollama) |
| LangGraph | Graph state machine | Python/JS | 25K+ | Apache 2.0 | Yes | Yes |
| CrewAI | Role-based crews | Python | 44K+ | MIT | Yes | Yes |
| AutoGen/MS Agent | Conversation | Python/.NET | 50K+ | MIT | Yes | Yes |
| Claude Agent SDK | Agent runtime | Python/TS | N/A | Proprietary | Claude only | No |
| OpenAI Agents SDK | Minimal primitives | Python/TS | ~15K | MIT | Documented | Partial |
| Google ADK | Multi-agent | Python/TS | ~5K | Apache 2.0 | Yes | Yes |
| Mastra | Workflows + agents | TypeScript | ~30K | Apache 2.0 | Yes | Yes |
| Pydantic AI | Type-safe agents | Python | ~20K | MIT | Yes | Yes (Ollama) |
| OpenHands | Event stream | Python | 69K | MIT | Yes | Yes |

### Agent2Agent (A2A) Protocol

Google-originated open protocol (April 2025) for agent-to-agent communication. Now under Linux Foundation governance. 50+ technology partners (Atlassian, Salesforce, SAP, PayPal). Complements MCP (which handles tool access).

## Sources

- [CrowdStrike OpenClaw security analysis](https://www.crowdstrike.com/en-us/blog/what-security-teams-need-to-know-about-openclaw-ai-super-agent/) — Security audit findings
- [Wikipedia OpenClaw](https://en.wikipedia.org/wiki/OpenClaw) — Background and history
- [Epsilla ContextEngine analysis](https://www.epsilla.com/blogs/2026-03-09-openclaw-2026-3-7-contextengine-agentic-architecture) — Architecture deep dive
- [LangGraph v1.0](https://blog.langchain.com/langchain-langgraph-1dot0/) — Release announcement
- [CrewAI GitHub](https://github.com/crewAIInc/crewAI) — Source and docs
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview) — AutoGen convergence
- [Claude Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview) — Official docs
- [OpenAI Agents SDK](https://openai.com/index/new-tools-for-building-agents/) — Launch post
- [Google ADK](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/) — Announcement
- [Mastra](https://mastra.ai/) — TS-native framework
- [A2A Protocol](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) — Google announcement

## Raw Links

- https://www.crowdstrike.com/en-us/blog/what-security-teams-need-to-know-about-openclaw-ai-super-agent/
- https://en.wikipedia.org/wiki/OpenClaw
- https://github.com/openclaw/openclaw
- https://www.epsilla.com/blogs/2026-03-09-openclaw-2026-3-7-contextengine-agentic-architecture
- https://www.digitalocean.com/resources/articles/what-is-openclaw
- https://ppaolo.substack.com/p/openclaw-system-architecture-overview
- https://docs.openclaw.ai/concepts/memory
- https://dev.to/entelligenceai/inside-openclaw-how-a-persistent-ai-agent-actually-works-1mnk
- https://deepwiki.com/openclaw/openclaw/15.1-architecture-deep-dive
- https://blog.langchain.com/langchain-langgraph-1dot0/
- https://blog.langchain.com/building-langgraph/
- https://github.com/crewAIInc/crewAI
- https://crewai.com/open-source
- https://github.com/microsoft/autogen
- https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview
- https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/
- https://platform.claude.com/docs/en/agent-sdk/overview
- https://github.com/anthropics/claude-agent-sdk-python
- https://github.com/anthropics/claude-agent-sdk-typescript
- https://openai.github.io/openai-agents-python/
- https://github.com/openai/openai-agents-python
- https://openai.com/index/new-tools-for-building-agents/
- https://github.com/mastra-ai/mastra
- https://mastra.ai/
- https://www.ycombinator.com/companies/mastra
- https://composio.dev/
- https://github.com/ComposioHQ/composio
- https://ai.pydantic.dev/
- https://github.com/pydantic/pydantic-ai
- https://google.github.io/adk-docs/
- https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/
- https://github.com/huggingface/smolagents
- https://huggingface.co/blog/smolagents
- https://www.llamaindex.ai/
- https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
- https://github.com/a2aproject/A2A
- https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents
- https://www.ibm.com/think/topics/agent2agent-protocol
- https://www.alphamatch.ai/blog/top-agentic-ai-frameworks-2026
- https://medium.com/data-science-collective/the-best-ai-agent-frameworks-for-2026-tier-list-b3a4362fac0d
- https://www.shakudo.io/blog/top-9-ai-agent-frameworks
- https://www.vellum.ai/blog/top-ai-agent-frameworks-for-developers
- https://aimultiple.com/agentic-frameworks
- https://particula.tech/blog/langgraph-vs-crewai-vs-openai-agents-sdk-2026
- https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared

## Implications

Sherpa's filesystem-based orchestration (markdown/YAML tasks, git worktrees) shares the exact same architectural DNA as OpenClaw's memory system. The key insight is that no framework solves Sherpa's actual problem — Sherpa dispatches opaque runtimes (Claude Code, LM Studio), not library-level LLM calls. This is closer to a job scheduler than an agent framework.

## Open Questions

1. Could Sherpa's domain primitives be exposed as OpenClaw skills?
2. Is Mastra (TypeScript-native) worth evaluating for potential platform features?
3. How does NVIDIA's upcoming agent platform fit into the stack?
