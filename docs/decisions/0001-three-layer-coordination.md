---
doc-type: decision
decision: 0001
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - parallel-workflow-governance
status: accepted
refined-by:
  - 0008-authority-enforcement-autonomous-only
---

> **AI-extracted** from parallel-workflow-governance, framework.md · Awaiting human review

## Context

Multiple agents and humans work on the same codebase simultaneously. Without coordination, agents can corrupt shared artifacts, overwrite each other's work, or violate conventions they aren't aware of. The system needed a conflict resolution model that prevents corruption without requiring a central coordinator bottleneck.

## Decision

Adopt a three-layer coordination model inspired by MMO game architecture:

1. **MCP Server (state authority)** — SQLite WAL, single-process, 3-7us indexed reads. The source of truth for initiative state, task assignments, and coordination data.
2. **Claude Code Hooks (enforcement)** — PreToolUse shell checks that prevent convention violations before they happen. Hard enforcement, not guidance. *Narrowed by [ADR-0008](0008-authority-enforcement-autonomous-only.md): enforcement applies only to dispatched autonomous agents, not Human+AI collaborative sessions.*
3. **CLAUDE.md + Rules (guidance)** — Behavioral conventions that auto-load via glob frontmatter. Soft guidance that agents follow but can't be mechanically enforced.

Prevention before detection before compensation. Each layer has a single-writer authority per component.

## Consequences

- Agents can work in parallel without a central coordinator — the MCP server arbitrates state, but doesn't bottleneck execution
- Convention violations are caught at hook layer before they corrupt shared artifacts
- New conventions can be added as rules files without changing infrastructure
- The model is composable — a project can run with just layer 3 (rules) and add layers 1-2 as complexity grows
