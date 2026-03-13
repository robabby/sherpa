# Iteration 1 — 2026-03-10

## Research Vectors

### Vector 1: Framework Landscape Survey
**Question:** What are the major agentic AI frameworks, and how do they compare?
**Full report:** [iteration-1/vector-1-framework-landscape-survey.md](iteration-1/vector-1-framework-landscape-survey.md)

**Key discoveries:**
- **OpenClaw is real and massive** — 250K+ GitHub stars, MIT, personal AI agent runtime (Gateway + messaging + skills). Model-agnostic. File-based memory (markdown/YAML, git-backable). Not an orchestration framework — it's an agent OS for personal automation.
- **The landscape has stratified**: Tier 1 orchestration (LangGraph, CrewAI, AutoGen), Tier 2 vendor SDKs (Claude Agent SDK, OpenAI Agents, Google ADK), Tier 3 specialized (Mastra, OpenHands, smolagents)
- **AutoGen is dying** — being replaced by Microsoft Agent Framework. LangChain deprecated for agents. Framework churn is real.
- **A2A protocol** (Google, Linux Foundation) complements MCP — tool access vs. agent-to-agent communication. 50+ partners.

**Implications:**
- No framework replaces Sherpa's dispatch model (opaque runtimes, not library LLM calls)
- OpenClaw's skill system is a potential distribution channel for domain primitives

### Vector 2: Solo Developer Agentic Patterns
**Question:** What patterns work at the 1-person + AI agents scale?
**Full report:** [iteration-1/vector-2-solo-dev-agentic-patterns.md](iteration-1/vector-2-solo-dev-agentic-patterns.md)

**Key discoveries:**
- **Sherpa's architecture is independently validated** — TICK.md, aitasks, ccswarm, Agent Orchestrator all converged on markdown + YAML + worktrees + shell dispatch
- **Claude Code Agent Teams** (experimental) handles within-session parallel work; Sherpa's overnight pipeline handles cross-session persistence — they coexist
- **The review bottleneck is universal** — human review capacity is the scaling constraint, not orchestration infrastructure
- **Framework overhead is measurable**: CrewAI 3x tokens, LangChain +40% latency, AutoGen debugging costs

**Implications:**
- Stay custom for orchestration, add capabilities incrementally (watchdog, observability, structured outputs)

### Vector 3: Claude Agent SDK Deep Dive
**Question:** Could the Claude Agent SDK serve as Sherpa's orchestration layer?
**Full report:** [iteration-1/vector-3-claude-agent-sdk-deep-dive.md](iteration-1/vector-3-claude-agent-sdk-deep-dive.md)

**Key discoveries:**
- Same runtime as Claude Code, packaged as TypeScript/Python library
- Provides typed cost tracking (`total_cost_usd`), structured outputs (Zod/JSON Schema), session management, and subagent orchestration
- Claude-only — cannot replace `lm-worker.mjs` for LM Studio tasks
- Migration estimate: 2-3 sessions to replace `claude-worker.sh` + `auto-judge.sh` with a TypeScript orchestrator

**Implications:**
- Natural upgrade path from shell scripts — same capabilities, better error handling and cost visibility
- Hybrid approach required: SDK for Claude workers, direct API for LM Studio workers

### Vector 4: Framework vs. Custom Tradeoffs
**Question:** When should you adopt a framework vs. stay custom?
**Full report:** [iteration-1/vector-4-framework-vs-custom-tradeoffs.md](iteration-1/vector-4-framework-vs-custom-tradeoffs.md)

**Key discoveries:**
- **Anthropic says don't use frameworks** — their own systems are custom-built
- **Scaling inflection is 5-8 agents** — Sherpa is at 3-5, below threshold
- **Framework graveyard is real** — Gartner predicts 40%+ agentic projects cancelled by 2027
- **Frameworks don't solve the hard problems** — even LangGraph's checkpointing has no failure detection

**Implications:**
- Correct decision to stay custom for internal orchestration
- This vector answered the wrong question — the user's real question is about connecting TO stacks, not replacing with them

### Vector 5: Agent Stack Integration Surface
**Question:** How does Sherpa connect to the emerging AI Agent Stack ecosystem?
**Full report:** [iteration-1/vector-5-agent-stack-integration-surface.md](iteration-1/vector-5-agent-stack-integration-surface.md)

**Key discoveries:**
- **Markdown + YAML is the universal agent format** — every major system uses it. Sherpa's convention was correct.
- **OpenClaw is a distribution channel**, not a replacement — domain primitives as OpenClaw skills
- **MCP is the universal bridge** — task board as MCP server enables external agent consumption
- **NVIDIA entering the stack** — open-source agent platform, details sparse, architecture unknown
- **Multi-model routing is rare** — Sherpa's Claude + LM Studio hybrid is differentiated

**Five integration paths ranked:**

| # | Path | Value | Effort |
|---|------|-------|--------|
| A | Migrate to Claude Code subagents | Highest | Low |
| B | Task board as MCP server | Medium | Low |
| C | Deterministic workflow definitions | Medium | Medium |
| D | OpenClaw as notification layer | Useful | Low |
| E | Full OpenClaw multi-agent | Future | High |

## Synthesis

The five vectors converge on a clear insight: **Sherpa's question isn't "which framework should we adopt?" — it's "what integration surfaces should we expose?"**

The internal orchestration (Planner/Worker/Judge, filesystem task board, git worktrees) is independently validated and correct for the 3-5 agent scale. Every framework comparison confirms that custom orchestration wins at this scale on cost, debuggability, and flexibility.

The real opportunity is the **platform surface**:

1. **MCP is already the answer.** Sherpa's domain primitives are exposed via MCP server. The same protocol could expose the task board, making Sherpa's agent orchestration queryable by any MCP client — including OpenClaw, Claude Code, and (likely) NVIDIA's upcoming platform.

2. **OpenClaw's 250K+ user base is a distribution channel.** Sherpa's domain computation packaged as OpenClaw skills would reach a massive audience. The skill authoring API uses markdown + YAML — the same format Sherpa already uses. This is a platform externalization opportunity.

3. **NVIDIA's entry validates the category.** "AI Agent Stack" is becoming a real software category, not just a buzzword. NVIDIA's open-source platform will likely support MCP (it's the emerging standard). Sherpa's MCP-first strategy is correctly positioned.

4. **The Claude Agent SDK is a natural internal upgrade.** Replace shell scripts with typed TypeScript orchestration — same runtime, better error handling, cost tracking, structured outputs. 2-3 session investment. This doesn't change the architecture, just improves the plumbing.

**The strategic frame:** Sherpa is a **computation provider** in the agent ecosystem. Agent stacks are the runtime. Sherpa's primitives are the data/computation layer that agents consume. The protocols (MCP for tools, A2A for agent-to-agent) are the glue. The right move is to invest in integration surfaces, not to adopt someone else's orchestration.

## All Sources

### Agent Stacks & Frameworks
- [OpenClaw](https://openclaw.ai/) — Personal AI agent runtime, 250K+ stars
- [OpenClaw GitHub](https://github.com/openclaw/openclaw) — Source code
- [OpenClaw Architecture (Epsilla)](https://www.epsilla.com/blogs/2026-03-09-openclaw-2026-3-7-contextengine-agentic-architecture) — ContextEngine deep dive
- [OpenClaw Security (CrowdStrike)](https://www.crowdstrike.com/en-us/blog/what-security-teams-need-to-know-about-openclaw-ai-super-agent/) — 512 vulnerabilities audit
- [NVIDIA Agent Platform (Wired)](https://www.wired.com/story/nvidia-planning-ai-agent-platform-launch-open-source/) — Upcoming launch
- [LangGraph v1.0](https://blog.langchain.com/langchain-langgraph-1dot0/) — Graph-based orchestration
- [CrewAI](https://github.com/crewAIInc/crewAI) — Role-based crews, 44K+ stars
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview) — AutoGen successor
- [Mastra](https://mastra.ai/) — TypeScript-native, YC backed
- [Pydantic AI](https://ai.pydantic.dev/) — Type-safe agents, MCP + A2A
- [OpenHands](https://github.com/OpenHands/OpenHands) — Software dev agents, 69K stars
- [smolagents (Hugging Face)](https://huggingface.co/blog/smolagents) — Minimalist code agents

### Vendor SDKs
- [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic's agent runtime
- [Claude Agent SDK Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents) — Parallel dispatch
- [Claude Agent Teams](https://code.claude.com/docs/en/agent-teams) — Experimental multi-instance
- [Anthropic Multi-Agent Research](https://www.anthropic.com/engineering/multi-agent-research-system) — Production case study
- [OpenAI Agents SDK](https://openai.com/index/new-tools-for-building-agents/) — Lightweight primitives
- [Google ADK](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/) — Multi-agent, Vertex AI

### Protocols
- [A2A Protocol (Google)](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) — Agent-to-agent
- [A2A at Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents) — Governance
- [IBM A2A Explainer](https://www.ibm.com/think/topics/agent2agent-protocol) — Technical overview

### Solo Dev Patterns
- [ccswarm](https://github.com/nwiizo/ccswarm) — Worktree + Claude Code dispatch
- [ComposioHQ Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) — Task planning + agent spawning
- [Composio Integration Analysis](https://composio.dev/blog/why-ai-agent-pilots-fail-2026-integration-roadmap) — 84.6% CI self-correction
- [Claude Code Multi-Agent (Shipyard)](https://shipyard.build/blog/claude-code-multi-agent/) — Patterns
- [Claude Code Hidden Swarm](https://paddo.dev/blog/claude-code-hidden-swarm/) — Discovery

### Comparisons & Analysis
- [Anthropic Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) — "Don't use frameworks"
- [Framework Tier List 2026](https://medium.com/data-science-collective/the-best-ai-agent-frameworks-for-2026-tier-list-b3a4362fac0d) — Market overview
- [LangGraph vs CrewAI vs OpenAI SDK](https://particula.tech/blog/langgraph-vs-crewai-vs-openai-agents-sdk-2026) — Comparison
- [Langfuse](https://langfuse.com/) — Open-source LLM observability

## Proposals Generated

**Branch seed created:** `docs/initiatives/agentic-workforce/branches/agent-stack-integration.md` — Sub-initiative for investigating integration surfaces (MCP task board, OpenClaw skills, Claude Agent SDK migration).

## Open Questions for Next Iteration

1. **OpenClaw skill authoring**: What does the skill API actually look like? What's the developer experience for publishing third-party skills? Could Sherpa's MCP tools be bridged to OpenClaw skills automatically?

2. **NVIDIA platform architecture**: When it launches, what integration points will it offer? Does it adopt MCP? Is there a plugin/skill marketplace?

3. **MCP task board design**: What would Sherpa's task board look like as an MCP server? What operations should external agents be able to perform? (Read tasks, claim tasks, report completion?)

4. **Computation provider business model**: In agent ecosystems, who pays the computation provider? Per-call pricing? Subscriptions? Is there precedent from weather/finance APIs integrated with agent platforms?

5. **Claude Agent SDK migration**: Concrete session plan for replacing `claude-worker.sh` + `auto-judge.sh` with a TypeScript orchestrator using `@anthropic-ai/claude-agent-sdk`.
