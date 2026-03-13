---
status: launched
source-iteration: 1
spawned-from: behavioral-agents
created: 2026-03-11
priority: high
sub-initiative: sub-initiatives/behavioral-lint-tool
---

# Behavioral Lint Tool

## Context

Iteration 1 revealed that no agent framework validates behavioral content. Sherpa's linter — gray-matter + Zod + identity-language regex — would be the first agent definition linter that enforces behavioral engineering principles. The tool has standalone product potential beyond Sherpa's internal use.

## Question

What's the optimal packaging and distribution strategy for a behavioral agent linter? Should it be a standalone npm package, a CLI tool, a GitHub Action, or all three? How should it handle multiple input formats (Sherpa YAML, CrewAI agents, SoulSpec, freeform system prompts)?

## Suggested Vectors

1. **CLI tool packaging patterns** — How do Vale, markdownlint, ESLint package and distribute? What's the typical npm/brew/binary distribution path?
2. **Multi-format linting** — Can the same behavioral rules apply to CrewAI's `backstory`, SoulSpec's `SOUL.md`, and generic system prompts? What's the parsing layer?
3. **GitHub Action marketplace** — What makes a popular GitHub Action? Adoption patterns, naming, README structure, marketplace ranking factors
4. **Joblint deep dive** — Detailed analysis of Joblint's pattern rules and how to adapt them for agent definitions

## Links

- Joblint Vale port: https://github.com/errata-ai/Joblint
- Original joblint: https://github.com/rowanmanning/joblint
- GitHub Docs linter: https://github.com/github/docs/tree/main/src/content-linter
- Vale: https://vale.sh/docs/
- gray-matter: https://github.com/jonschlinkert/gray-matter
