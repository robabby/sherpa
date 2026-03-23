---
doc-type: decision
decision: 0014
authored-by: ai
reviewed-by: null
last-updated: 2026-03-20
source-initiatives:
  - multi-project-studio
status: accepted
---

> **AI-extracted** from multi-project-studio · Awaiting human review

## Context

Multi-project support required a portable governance data layer that any project could adopt without restructuring its existing `docs/` directory. Simultaneously, Claude Code auto-discovers `.claude/rules/` and `.claude/skills/` — moving these would break agent tooling.

## Decision

Three directories, three concerns:

| Directory | Concern | Example contents |
|-----------|---------|-----------------|
| `.sherpa/` | Structured governance data consumed by tools | initiatives, tasks, research, agents, databases |
| `.claude/` | Agent config consumed by Claude Code | rules, skills, settings |
| `docs/` | Reference prose consumed by humans | architecture, decisions, UX guidelines |

This follows the Backstage model: structured data consumed by tools lives in a dotfolder, prose consumed by humans lives in docs. `.claude/` stays separate because it's Claude Code's native convention — bridging via `@import` in CLAUDE.md when needed.

## Consequences

- Projects adopt Sherpa by adding `.sherpa/` without touching existing `docs/` or `.claude/` layouts
- Governance data (initiatives, tasks) has a standard location across all projects
- Three directories to explain to new contributors (mitigated by README pointers)
- The boundary between `.sherpa/initiatives/` and `docs/initiatives/` may need refinement — currently Sherpa itself uses `docs/initiatives/` via `paths.initiatives` config
- Dotfolders are hidden by default in most file browsers, creating a discoverability gap (stress-test A10, human judgment needed)
- Confidence: Medium — if the split creates friction, simplify to two directories
