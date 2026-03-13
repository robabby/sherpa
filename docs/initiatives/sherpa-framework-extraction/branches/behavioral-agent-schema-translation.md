---
status: seed
source-iteration: 3
spawned-from: sherpa-framework-extraction
created: 2026-03-11
priority: medium
---

# Behavioral Agent Schema Translation

## Context

Iteration 3 confirmed that Claude Code plugins can distribute behavioral agent catalogs via `agents/` directories. However, the behavioral agent schema (used in `docs/agents/roles/`) has fields (`disposition`, `fail-triggers`, `quality-bar`, `escalation`, `context-packages`) that don't map directly to Claude Code's simpler subagent frontmatter format (`name`, `description`, `tools`, `model`, `skills`).

The question is how much fidelity is lost in translation. `fail-triggers` and `quality-bar` are used by the Judge role for programmatic evaluation — if they flatten to unstructured system prompt text, the Judge loses its structured evaluation criteria.

## Question

What is the optimal translation strategy from the Behavioral Agent schema to Claude Code subagent format? Can structured behavioral constraints be preserved for programmatic use while also rendering as effective system prompts?

## Suggested Vectors

1. **Claude Code subagent format deep dive** — What exactly goes in the Markdown body of a subagent definition? Is it a system prompt? How do complex behavioral instructions perform vs simple ones? What are the token limits?
2. **Structured data in Markdown** — Can YAML frontmatter in the subagent `.md` file carry extra fields that Claude Code ignores but the Judge can parse? Or does Claude Code validate/reject unknown frontmatter fields?
3. **Dual-format strategy** — Can the behavioral agent catalog maintain both formats: the rich schema (for Judge evaluation) and the Claude Code format (for plugin distribution)? Build step that generates one from the other?
4. **Judge evaluation without structured schema** — Can the Judge extract `quality-bar` and `fail-triggers` from natural language behavioral constraints in the system prompt? How reliable is this vs structured YAML fields?

## Links

- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Behavioral Engineering Rule](/.claude/rules/behavioral-engineering.md)
- [Behavioral Agents Initiative](docs/initiatives/behavioral-agents/)
