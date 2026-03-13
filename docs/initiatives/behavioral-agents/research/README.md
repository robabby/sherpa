# Behavioral Agents Research

Research supporting the behavioral-agents initiative — migrating ~120 agency-agents definitions to Sherpa's behavioral engineering format.

## Iterations

| # | Date | Vectors | Key Finding |
|---|------|---------|-------------|
| 1 | 2026-03-11 | Competing formats, taxonomy, validation tooling, competitive landscape | Behavioral decomposition is structurally novel — no framework structures behavioral content. First-mover advantage is real. |
| 2 | 2026-03-11 | Universal roles, agency-agents audit, coverage models, gap analysis, triage | 48-agent v1 catalog across 10 categories. 50/50 migrate/create split. Code Reviewer is the single most important agent (59.4% of tokens per Anthropic). |
| 3 | 2026-03-11 | Multi-agent scaling research, production deployments, specialization evidence, catalog benchmarks, T-shaped agents | Ship ~20 behavioral agents with 2-3 companion skills each. Compact definitions outperform comprehensive by 3x (SkillsBench). Heterogeneous > homogeneous. Revises iteration-2's 48 down to 20 based on scaling/specialization research. |

## Open Questions

1. ~~**Should the linter be a standalone npm package?**~~ YES — spawned sub-initiative `sub-initiatives/behavioral-lint-tool/`.
2. ~~**What's the minimum viable catalog?**~~ REVISED: Iteration 2 said 48. Iteration 3 revises to ~20 based on SkillsBench evidence (compact > comprehensive) and scaling research (heterogeneity > quantity). Remaining 28 from iteration 2 become companion skills or vertical extensions.
3. ~~**Dynamic instructions vs. static YAML.**~~ SKIP — static YAML is sufficient. Every major framework separates definition (static) from runtime context (dynamic). See `research/dynamic-context-hooks.md`.
4. **Distribution strategy.** Spec site (behavioral-agents.dev)? npm package? GitHub Action? Reddit launch? What drives adoption?
5. **Agent Behavioral Contracts (ABC) collaboration.** Their runtime enforcement complements Sherpa's definitions. Worth pursuing?

## Cross-References

- Parent initiative: `docs/initiatives/agent-framework-patterns/` (research complete)
- Schema spec: `docs/initiatives/behavioral-agents/schema-spec.md`
- Behavioral engineering rule: `.claude/rules/behavioral-engineering.md`
- Role prompting evidence: `docs/initiatives/agent-framework-patterns/research/role-prompting-efficacy.md`
- Agency-agents audit: `docs/initiatives/agent-framework-patterns/research/agency-agents.md`
- Sub-initiative: `sub-initiatives/behavioral-lint-tool/` (lint tool packaging & distribution)
