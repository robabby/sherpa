---
doc-type: decision
decision: 0003
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - parallel-workflow-governance
status: accepted
---

> **AI-extracted** from parallel-workflow-governance · Awaiting human review

## Context

When multiple initiatives run concurrently, they may need to modify the same shared artifacts (roadmap, guidelines, CLAUDE.md files). Direct edits from initiative branches would create merge conflicts and potentially corrupt the authoritative version of these documents.

## Decision

Initiatives never edit shared artifacts directly. All changes to shared artifacts go through proposals (`docs/initiatives/<slug>/proposal.md`). Proposals describe the intended changes and are reviewed via integration review (`/integration-review`), which resolves conflicts across proposals targeting the same artifact before any edits land.

## Consequences

- Shared artifacts remain stable — no surprise edits from concurrent branches
- Integration review can batch-process proposals targeting the same file, resolving conflicts before they happen
- Initiative branches contain only new files (proposals, plans, activity logs) — never modifications to shared files
- Adds a review step that slows down direct changes, but this is intentional friction that prevents corruption
