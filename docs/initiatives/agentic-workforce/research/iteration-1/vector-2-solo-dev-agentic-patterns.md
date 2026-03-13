# Vector 2: Solo Developer Agentic Patterns

**Question:** How are solo developers and small teams using agentic frameworks in practice? What patterns work at the 1-person + AI agents scale?
**Agent dispatched:** 2026-03-10

## Findings

### Sherpa's architecture is validated by convergence

Multiple independent projects have converged on the exact same pattern Sherpa already uses:
- **TICK.md** — markdown task files with YAML frontmatter for AI agent coordination
- **aitasks** — filesystem-based task management for AI agents
- **planning-with-files** — markdown planning documents as agent state
- **ccswarm** — git worktree isolation + Claude Code dispatch
- **Agent Orchestrator (ComposioHQ)** — plans tasks, spawns agents, handles CI

This is not a hack — it is a proven, independently-validated architecture.

### Claude Code Agent Teams (experimental)

Released Feb 2026. Handles within-session parallel work with built-in task lists, teammate messaging, and worktree isolation. Sherpa's overnight Planner/Worker/Judge pipeline handles cross-session persistence, model routing, and LM Studio integration. The two patterns coexist — Agent Teams for within-session, custom dispatch for cross-session.

### The "Bitter Lesson" thesis

Each model capability improvement erodes another slice of framework value:
- AWS Strands team: "We no longer needed such complex orchestration because models now have native tool-use and reasoning"
- LangChain effectively deprecated itself for agents
- HN consensus: "Each small bump in model performance kills another agent framework"

### The review bottleneck is universal

Every practitioner source agrees: the bottleneck for parallel agents is human code review capacity. Only senior+ engineers succeed at managing multiple agent outputs simultaneously. Composio addressed this with automated CI self-correction (84.6% success rate, zero human intervention for CI failures).

### Framework costs are concrete and measurable

- CrewAI: 3x token overhead even for single tool calls
- LangChain: one fintech saved 40% latency + $200K/yr switching to custom
- LangGraph: $4 surprise bills from uncontrolled revision cycles
- AutoGen: full afternoon lost debugging speaker selection routing

### Solo developer case studies

- Joao's 8-agent company (EUR 42/mo) — specialized agents + shared state
- AgentOS's three Claude Code subagents with shared database
- Xian's parent/child agent playbook on n8n
- Pattern is consistent: specialized agents + shared state + human judgment for strategic decisions

## Sources

- [ccswarm GitHub](https://github.com/nwiizo/ccswarm) — Git worktree isolation + Claude Code
- [ComposioHQ agent-orchestrator](https://github.com/ComposioHQ/agent-orchestrator) — Plans tasks, spawns agents
- [Claude Code Agent Teams docs](https://code.claude.com/docs/en/agent-teams) — Experimental multi-instance
- [AWS Strands announcement](https://aws.amazon.com/blogs/machine-learning/introducing-strands-agents/) — Model-native tool use reducing framework need

## Raw Links

- https://github.com/nwiizo/ccswarm
- https://github.com/ComposioHQ/agent-orchestrator
- https://code.claude.com/docs/en/agent-teams
- https://aws.amazon.com/blogs/machine-learning/introducing-strands-agents/
- https://composio.dev/blog/why-ai-agent-pilots-fail-2026-integration-roadmap
- https://github.com/wshobson/agents
- https://shipyard.build/blog/claude-code-multi-agent/
- https://paddo.dev/blog/claude-code-hidden-swarm/
- https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f

## Implications

Sherpa's custom orchestration is validated. The question should shift from "should we adopt a framework?" to "what specific capabilities (notification, observability, deterministic workflows) should we add incrementally?"

## Open Questions

1. Should within-session work migrate to Agent Teams while overnight work stays custom?
2. Should Sherpa adopt TICK.md or aitasks as a protocol standard?
3. What review automation would maintain quality as agent count scales past 5?
