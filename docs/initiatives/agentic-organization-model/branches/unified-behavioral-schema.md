---
status: seed
source-iteration: 1
spawned-from: agentic-organization-model
created: 2026-03-12
priority: high
---

# Unified Behavioral Schema

## Context

Vector 3 (skills/agents/instances convergence) demonstrated that Agent Skills standard + Sherpa behavioral fields + Claude Code memory compose into a single schema. Currently, skills live in `.claude/skills/`, roles in `docs/agents/roles/`, and instances don't exist yet — three separate formats in three separate directories. The convergence suggests a single schema with progressive enhancement based on populated fields.

## Question

What is the concrete unified schema that serves as skill, role, and instance? How does it maintain Agent Skills standard compatibility while adding Sherpa's behavioral fields? What's the migration path from the current split directories? How does the Zod validation pipeline extend to cover all three zoom levels?

## Suggested Vectors

1. **Agent Skills standard deep-dive** — Read the full spec, validation library, and reference implementations. Map every field to Sherpa's schema. Identify gaps and extensions. Test compatibility: can a Sherpa role definition be installed as an Agent Skill in Cursor/Copilot?
2. **Claude Code skills vs subagents format comparison** — Detailed field-by-field comparison of SKILL.md and .claude/agents/*.md. What's shared, what's unique, what conflicts? How does `context: fork` bridge them?
3. **Schema migration design** — Concrete plan for moving from current 2-directory split to unified format. Breaking changes, backwards compatibility, Zod schema evolution, Studio UI impact.
4. **Progressive enhancement validation** — Build sample definitions at each zoom level (skill, role, instance) and validate they compose correctly. Test that a Role can load 2-3 Skills as T-shaped companions.

## Links

- [Agent Skills specification](https://agentskills.io/specification)
- [Claude Code Skills docs](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents docs](https://code.claude.com/docs/en/sub-agents)
- [SkillsBench](https://arxiv.org/html/2602.12670v1)
- [Agent Behavioral Contracts](https://arxiv.org/html/2602.22302)
