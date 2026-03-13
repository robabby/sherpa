# Vector 4: Framework vs. Custom Orchestration Tradeoffs

**Question:** When should you use an agentic framework vs. build custom orchestration?
**Agent dispatched:** 2026-03-10

## Findings

### Anthropic says don't use frameworks

Their canonical "Building Effective Agents" guide warns that frameworks obscure prompts and make debugging harder. Their own multi-agent systems are custom-built. The most successful implementations they've seen use "simple, composable patterns."

### Sherpa is below the scaling inflection point

Google's research (180 configurations) and practitioner experience converge: the inflection where custom coordination breaks down is 5-8 agents in flat topologies. Sherpa is at 3-5. The markdown task files + git worktrees + shell dispatch pattern is the same architecture multiple open-source tools converged on independently.

### The framework graveyard is real

- LangChain deprecated for agents
- OpenAI Swarm was DOA (replaced by Agents SDK)
- AutoGen in maintenance mode (being replaced by Microsoft Agent Framework)
- Gartner predicts 40%+ of agentic projects cancelled by 2027

### Frameworks don't solve the hard problems

Diagrid's analysis: even LangGraph's checkpointing provides no automatic failure detection, no watchdog, no heartbeat. "Your workflow is simply dead until something external notices." The fix is a simple cron watchdog, not a framework.

### Framework costs

- CrewAI: 3x token overhead
- LangChain: 40% latency + $200K/yr overhead for one fintech
- LangGraph: $4 surprise bills from uncontrolled revision cycles

### Three incremental improvements worth considering

1. Add a cron-based watchdog for `dispatched` tasks that haven't completed
2. Evaluate Langfuse (open source, MIT) for trace visualization
3. Track Claude Agent SDK as natural upgrade path from `claude --print`

## Sources

- [Anthropic "Building Effective Agents"](https://www.anthropic.com/research/building-effective-agents) — Canonical guidance
- [Diagrid durable execution analysis](https://www.diagrid.io/) — Framework checkpointing limitations
- [Gartner agentic AI predictions](https://www.gartner.com/) — 40%+ cancellation forecast
- [Langfuse](https://langfuse.com/) — Open-source LLM observability

## Raw Links

- https://www.anthropic.com/research/building-effective-agents
- https://langfuse.com/
- https://www.diagrid.io/
- https://www.gartner.com/
- https://composio.dev/blog/why-ai-agent-pilots-fail-2026-integration-roadmap

## Implications

"Stay custom" is correct for Sherpa's internal orchestration. But this vector answered the wrong question — the user's real question is about connecting TO agent stacks, not replacing with them.

## Open Questions

1. At what agent count should Sherpa re-evaluate? (Likely 8-10)
2. Is Langfuse worth adding for observability before scale demands it?
