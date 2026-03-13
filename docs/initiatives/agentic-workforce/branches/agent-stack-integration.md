---
status: seed
source-iteration: 1
spawned-from: agentic-workforce
created: 2026-03-10
priority: medium
---

# Agent Stack Integration

## Context

Sherpa's internal agent orchestration (Planner/Worker/Judge pipeline, filesystem task board, git worktrees) is independently validated and correct for the 3-5 agent scale. However, the emerging "AI Agent Stack" ecosystem — OpenClaw (250K+ stars), NVIDIA's upcoming platform, A2A protocol — represents a distribution and integration opportunity, not a replacement.

The question isn't "which framework should we adopt?" — it's "what integration surfaces should Sherpa expose?"

## Question

How should Sherpa position itself as a computation provider in the agent stack ecosystem? What integration surfaces (MCP task board, OpenClaw skills, A2A endpoints) should be built, in what order, and with what expected return?

## Suggested Vectors

1. **OpenClaw Skill Authoring Deep Dive** — Read OpenClaw's skill documentation end-to-end. What's the developer experience? What's the API surface? Could Sherpa's existing MCP tools be automatically bridged to OpenClaw skills? What does distribution/discovery look like?

2. **MCP Task Board as External Surface** — Design the MCP server interface for Sherpa's task board. What operations should external agents perform? Read tasks, claim tasks, report completion, query status? What's the security model? This is the narrowest, most immediately useful integration.

3. **Computation Provider Economics** — Research how domain-specific computation providers (weather APIs, financial data, health scoring) integrate with and monetize through agent platforms. What's the business model? Per-call? Subscription? Freemium skills?

4. **NVIDIA Platform Watch** — When NVIDIA's agent platform launches (expected Q1-Q2 2026), document its architecture, plugin system, and MCP/A2A support. This vector should be deferred until launch.

5. **Claude Agent SDK Migration Plan** — Concrete 2-3 session plan for replacing `claude-worker.sh` + `auto-judge.sh` with a TypeScript orchestrator using `@anthropic-ai/claude-agent-sdk`. This improves internal plumbing while also demonstrating how Sherpa's orchestration can be programmatically composed.

## Links

- [OpenClaw](https://openclaw.ai/) — 250K+ star agent runtime
- [NVIDIA Agent Platform (Wired)](https://www.wired.com/story/nvidia-planning-ai-agent-platform-launch-open-source/) — Upcoming
- [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) — TypeScript/Python
- [A2A Protocol](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) — Agent interoperability
- [Sherpa Iteration 1](../research/iteration-1.md) — Source research
