---
status: seed
source-iteration: 3
spawned-from: agentic-workspace
created: 2026-03-12
priority: medium
---

# pipeline-manifest-spec — Skill Composition via Filesystem Artifacts

## Context

Iteration 3 research confirmed that the Agent Skills standard has no composition primitive (by design — 30+ tools adopt the flat format). AgentSkillOS showed DAG orchestration outperforms flat invocation by 30-45%, but published no reusable schema. Prefect removed the DAG constraint entirely. MCP Discussion #1779 proposes a Skills primitive but has no RFC.

Sherpa's working pipeline (/rr → /integration-review → /plan-tasks) is already DAG-based composition via filesystem artifacts — skills communicate through file outputs. The question is formalizing this into a lightweight, portable specification.

## Question

What should the pipeline manifest format look like, how does it interact with the Agent Skills standard, and can it be portable across agents that support skills?

## Suggested Vectors

1. **Pipeline manifest design** — Concrete YAML spec for declaring stages, artifact patterns (produces/consumes), conditions, and ordering. Align with Agent Skills frontmatter.
2. **Windmill OpenFlow adaptation** — Can a subset of OpenFlow + Agent Skills metadata create a viable hybrid? What's reusable, what's too imperative?
3. **Cross-agent portability** — Can Claude Code, Codex, and Gemini CLI interpret the same pipeline manifest? What runtime support is needed vs. what can be convention-only?
4. **Composition security** — Permission envelope for composed pipelines. Trust boundaries when skills invoke subagents. Snyk ToxicSkills data (36.82% flawed) at composition scale.
5. **Agent Skills standard extension** — Should this be proposed as an upstream extension (risk: fragmentation) or kept as a separate Sherpa-originated spec (risk: adoption)?

## Links

- [AgentSkillOS](https://arxiv.org/abs/2603.02176) — DAG orchestration research
- [Agent Skills standard](https://agentskills.io/specification) — SKILL.md format
- [Windmill OpenFlow](https://www.windmill.dev/docs/openflow) — Formal workflow DAG spec
- [MCP Discussion #1779](https://github.com/modelcontextprotocol/specification/discussions/1779) — Skills-for-Prompts proposal
- [MetaGPT](https://arxiv.org/abs/2308.00352) — SOP pipelines outperform ad-hoc
- iteration-3/vector-8-skill-composition-specification.md
