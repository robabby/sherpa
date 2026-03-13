---
status: seed
source-iteration: 1
spawned-from: agentic-workspace
created: 2026-03-12
priority: medium
---

# Skill Composition Model

## Context

Composition is the unsolved problem in the Agent Skills ecosystem. 351K+ individual skills exist, but orchestrating them doesn't work yet (AgentSkillOS paper, arxiv 2603.02176). Sherpa's pipeline pattern (/rr → /integration-review → /plan-tasks) is exactly the DAG-based orchestration that research shows outperforms flat invocation. But this composition is implicit (natural language references in skill instructions), not formalized.

## Question

How should Sherpa formalize skill composition — the ability for skills to declare dependencies, execution order, and data flow — in a way that's portable across agents (Claude, Codex, Gemini CLI) and compatible with the MCP 2026 roadmap's planned "Skills primitive for composed capabilities"?

## Suggested Vectors

1. AgentSkillOS analysis — deep-dive the DAG pipeline strategies (Quality-First, Efficiency-First, Simplicity-First) and their applicability to Sherpa's governance workflows
2. Pipeline manifest design — what would a `sherpa-pipeline.yaml` or equivalent look like? How does it relate to GitHub Actions workflow syntax, Dagger pipelines, or Temporal workflows?
3. MCP Skills primitive anticipation — what's known about MCP's planned Skills primitive? How should Sherpa align?
4. Cross-agent portability — Sherpa's skills use Claude-specific features (Agent tool, WebSearch). What abstraction layer enables portability to Codex CLI, Gemini CLI?
5. Granularity question — is /rr (380 lines) the right unit, or should it decompose into smaller composable skills (orient, focus, fan-out, converge, propose, seed)?

## Links

- [arxiv.org/html/2603.02176](https://arxiv.org/html/2603.02176) — AgentSkillOS: skill composition via DAG orchestration
- [modelcontextprotocol.io/development/roadmap](https://modelcontextprotocol.io/development/roadmap) — MCP 2026 roadmap
- [iteration-1/vector-4-skills-conventions-distribution.md](../research/iteration-1/vector-4-skills-conventions-distribution.md) — Skills distribution research
