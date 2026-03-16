---
id: sek-validate-get-summary
status: pending
role: engineer
priority: high
initiative: semantic-knowledge-engine
backend: claude
model: claude-sonnet-4-6
task-type: code-review
mode: supervised
budget-usd: 0.50
worktree: null
branch: null
created: 2026-03-16T16:30:00
dispatched-at: null
completed-at: null
session-id: null
judge-verdict: pending
---

# Validate get_summary MCP tool at all 3 levels

## Objective

Call get_summary at file, initiative, and portfolio levels. Validate that each level returns the correct data shape, that initiative summaries are accurate, that staleness tracking works, and that the portfolio view applies temporal weighting correctly.

## Context

`get_summary` has 3 levels: file (single file metadata), initiative (summary + files + edges + stale flag), portfolio (all initiative summaries weighted by status). Registered in `packages/studio-mcp/src/server.ts`.

Test matrix:
1. level=file, path=docs/initiatives/semantic-knowledge-engine/proposal.md
2. level=file, path=nonexistent.md — expect helpful error
3. level=initiative, initiative=semantic-knowledge-engine
4. level=initiative, initiative=mcp-coordination-layer — compare summary to actual proposal
5. level=portfolio — all initiatives grouped by status
6. level=portfolio — verify archived/declined excluded, old integrated title-only

## Acceptance Criteria

- [ ] File level returns frontmatter as parsed JSON with correct status/type/risk
- [ ] Initiative level includes generated summary that reflects the proposal
- [ ] Initiative level includes stale flag and changedSinceSummary when applicable
- [ ] Initiative level includes both files and edges
- [ ] Portfolio level groups initiatives by status with correct counts
- [ ] Portfolio level excludes archived and declined
- [ ] Error responses for missing files/initiatives are helpful

## Constraints

Do NOT modify any code. Report findings only. For initiative summaries, compare the generated summary against the actual proposal.md to assess accuracy.

## Deliverables

A structured report with: (1) each test case and response, (2) summary accuracy assessment, (3) staleness tracking verification, (4) portfolio temporal weighting verification, (5) overall data quality assessment.
