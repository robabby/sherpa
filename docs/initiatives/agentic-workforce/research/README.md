# Agentic Workforce Research

## Iterations

| # | Date | Focus | Vectors |
|---|------|-------|---------|
| 1 | 2026-03-10 | Agent stack landscape, frameworks vs. custom, integration surfaces | 5 |
| 2 | 2026-03-12 | Solo & micro-team AI agency landscape, ground truth on practitioners | 1 |

## Summary

Iteration 1 surveyed the entire agentic framework landscape (12+ frameworks), evaluated Sherpa's custom orchestration against them, deep-dived the Claude Agent SDK, and investigated how Sherpa connects to the emerging "AI Agent Stack" ecosystem (OpenClaw, NVIDIA, A2A protocol).

**Key conclusion (iter 1):** Sherpa's internal orchestration is validated and correct. The opportunity is in **integration surfaces** — exposing primitives to agent ecosystems via MCP, OpenClaw skills, and A2A protocol, not in adopting an external framework.

Iteration 2 mapped the ground truth of who is actually running solo/micro-team consulting businesses powered by AI agents. Named practitioners (Setas, Bilsborough, Saraev, Lemkin), revenue data ($25K-$40K/month for content agencies at 75-85% margins), and tool stacks documented across 70+ sources.

**Key conclusion (iter 2):** The market is real but immature. Every successful practitioner converged on markdown agent files + simple dispatch + human review. Nobody has structured governance for agent-powered consulting — Sherpa's initiative lifecycle, behavioral constraints, and quality gates are genuinely differentiated.

## Open Questions for Next Iteration

1. **Claude Code consulting community** — Reddit threads suggest practitioners exist but aren't writing publicly. Direct community research needed.

2. **AI automation agency failure rate** — Enormous content marketing funnel exists but no data on sustainability.

3. **OpenClaw skill authoring** — Developer experience for third-party skills, MCP-to-OpenClaw bridging.

4. **MCP task board design** — Task board as MCP server for external agents.

5. **"Rails moment" for AI consulting** — Can Sherpa's governance framework define a category the way Rails defined web development?

## Related Initiatives

- `docs/initiatives/agentic-workforce/` — Parent initiative (agent roles, orchestration research)
- `docs/initiatives/agentic-workforce/sub-initiatives/planner-worker-judge/` — Execution pipeline
- `docs/initiatives/agent-infrastructure/` — Model routing, local model integration
- `docs/initiatives/mcp-agent-delegation/` — DECLINED (premature, revisit at 5+ agents)
- `docs/initiatives/studio-collaboration-platform/` — Studio as human+AI collaboration surface

## Branches

- `branches/agent-stack-integration.md` — Integration surfaces for agent ecosystems (seeded from iteration 1)
