# Vector 2: Multi-Agent Governance Patterns

**Question:** How do production multi-agent frameworks handle shared behavioral conventions across heterogeneous agents? Is there a concept of "portable governance" across runtimes?
**Agent dispatched:** 2026-03-18

## Findings

**No production framework has solved portable governance as a first-class feature.** Every major framework handles behavioral constraints differently, and none provides a unified governance document mechanism across runtimes.

**Framework-specific approaches:**

- **CrewAI**: Per-agent config (role, goal, backstory). Shared memory stores task outputs, not behavioral rules. No crew-wide instruction injection. ([docs.crewai.com](https://docs.crewai.com/en/concepts/agents))
- **AutoGen**: Per-agent `system_message`. Group chat shares conversation thread but not behavioral constraints. FSM graphs for workflow governance (who speaks when), not behavioral governance. ([microsoft.github.io/autogen](https://microsoft.github.io/autogen/0.2/docs/Use-Cases/agent_chat/))
- **LangGraph**: Shared state dictionary as "clipboard" — you can put governance in state fields but there's no dedicated layer. Approval gates and moderation as graph nodes. ([latenode.com](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/))
- **OpenAI Swarm/Agents SDK**: Per-agent `instructions`. On handoff, system prompt changes entirely. Guardrails are per-agent and don't propagate through handoffs. ([openai.github.io/openai-agents-python](https://openai.github.io/openai-agents-python/guardrails/))
- **Google ADK**: No instruction inheritance parent→child. `session.state` for shared data. Vertex AI Agent Builder has PolicyEngine for tool-call-level enforcement. ([google.github.io/adk-docs](https://google.github.io/adk-docs/agents/multi-agents/))

**Anthropic's multi-agent approach:** Lead agent writes explicit per-task instructions for each subagent. No shared governance document. ([anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system))

**MCP provides plumbing but not governance semantics.** Resources can expose governance docs as read-only data. Prompts are user-controlled templates. Neither enforces behavioral constraints. 2026 roadmap lists governance maturation as priority but focuses on spec process, not agent behavior. ([modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2025-11-25))

**Academic research identifies the gap explicitly:**

- **Governance-as-a-Service (GaaS)** (arXiv 2508.18765): Runtime enforcement layer between agents and environment. Declarative JSON rules (pattern, type, severity). Trust Factor scoring for compliance history. Works across heterogeneous agents without cooperation — intercepts outputs. Modes: coercive (block), normative (warn), adaptive (escalate).
- **Agent Constitution Framework (ACF)** (arXiv 2510.13857): Instruction Set Architecture with 5 operational cores including Normative Core (non-bypassable arbiter). Instruction Bindings for cross-model portability.
- **Evolving Constitutions** (arXiv 2602.00755): Genetic programming evolves behavioral norms — 123% better than human-designed baselines. Minimal communication outperformed verbose coordination.
- **Multi-level Value Alignment** (arXiv 2506.09656): Macro (universal), meso (industry), micro (task-specific) alignment levels. Higher constrains lower.

## Sources

- [CrewAI agents docs](https://docs.crewai.com/en/concepts/agents)
- [AutoGen docs](https://microsoft.github.io/autogen/0.2/docs/Use-Cases/agent_chat/)
- [LangGraph guide](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/)
- [OpenAI Agents SDK guardrails](https://openai.github.io/openai-agents-python/guardrails/)
- [Google ADK multi-agents](https://google.github.io/adk-docs/agents/multi-agents/)
- [Anthropic multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system)
- [MCP spec 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [GaaS paper](https://arxiv.org/html/2508.18765v1)
- [ACF paper](https://arxiv.org/html/2510.13857v1)
- [Evolving Constitutions](https://arxiv.org/abs/2602.00755)
- [Multi-level Alignment](https://arxiv.org/html/2506.09656v2)

## Implications

- Sherpa's approach (assembled governance file + prompt injection) is the de facto pattern — every framework uses prompt injection, none has a standard wire protocol
- The GaaS pattern maps well to Sherpa's Judge role — output validation rather than input injection
- MCP Resources could serve governance docs to any connected agent without filesystem access
- Three-tier alignment (macro/meso/micro) maps directly to Sherpa's structure: `.claude/rules/` (macro), `sherpa.config.ts` (meso), `docs/tasks/` (micro)
- Machine-readable governance schema (beyond markdown) may be needed for enforcement, not just advisory compliance

## Open Questions

1. Can MCP enforce constraints or only serve context?
2. Should the Judge role become a formal GaaS-style enforcement layer with declarative rules?
3. What machine-readable schema for behavioral constraints? JSON rules alongside markdown?
4. How to handle governance drift when different models interpret same text differently?
