---
globs:
  - "docs/plans/**"
  - "docs/initiatives/**"
  - "docs/roadmap.md"
  - "apps/*/docs/plans/**"
  - "apps/*/docs/roadmap.md"
---

# Effort Estimation Convention

## Unit of Effort: Sessions

A **session** = one full context window of task execution between `/compact` or `/clear` commands. This is the natural unit of work for an AI-agent developer.

Never use calendar time (days, weeks) for effort estimates. Calendar time is meaningless when the developer is an AI agent with variable session lengths.

## How to Estimate Sessions

Factors that determine session count:
- **Files touched** — How many files need creation or modification?
- **Exploration required** — How much codebase understanding is needed before writing code?
- **Sequential dependencies** — What can't be parallelized within a single session?
- **Review checkpoints** — Does a human need to approve something mid-feature?

## Format

In proposals, plans, and roadmaps:

```markdown
**Effort:** 2 sessions
**Session breakdown:**
- Session 1: [what gets done]
- Session 2: [what gets done]
```

Use "N sessions" for confident estimates. Use "N-M sessions" when the upper bound depends on exploration or edge cases. Add "(if needed)" to optional sessions.

## Rough Calibration

| Scope | Sessions |
|-------|----------|
| Single component or data change | 1 |
| Feature with UI + API + schema | 2 |
| Feature with infrastructure setup (new service, new protocol) | 3-4 |
| Multi-feature system with dependencies | 4-6 |
