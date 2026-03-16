---
id: sek-validate-query-related
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

# Validate query_related MCP tool in all 3 modes

## Objective

Call query_related in explicit, emergent, and creative modes for multiple initiatives. Validate that explicit edges match frontmatter, emergent finds unlisted connections, and creative finds structurally distant but semantically close pairs.

## Context

`query_related` is the relationship explorer. Registered in `packages/studio-mcp/src/server.ts`. Uses edges table for explicit mode, inferred_edges for emergent/creative, recursive CTE for graph distance.

Test matrix:
1. explicit + semantic-knowledge-engine — expect informs (mcp-coordination-layer, studio-desktop-app) and targets edges
2. explicit + mcp-coordination-layer — expect depends-on sqlite-agentic-state, second-hop edges
3. emergent + semantic-knowledge-engine — expect initiatives similar but not explicitly linked
4. emergent + mcp-coordination-layer — expect unlisted similar initiatives
5. creative + semantic-knowledge-engine — expect high similarity + graph distance >= 3
6. creative + behavioral-agents — test a different part of the graph

Cross-reference explicit results against the actual proposal.md frontmatter to verify accuracy.

## Acceptance Criteria

- [ ] Explicit mode edges match frontmatter dependencies/informs/targets exactly
- [ ] Explicit mode includes second-hop edges
- [ ] Emergent mode returns only pairs with NO explicit edge between them
- [ ] Emergent mode results have non-zero similarity scores
- [ ] Creative mode results have graph distance >= 3 or 'unreachable'
- [ ] Creative mode results have similarity scores (semantically close)
- [ ] All responses include backend and capabilities fields

## Constraints

Do NOT modify any code. Report findings only. For explicit mode, manually verify 3+ edges against the actual proposal.md frontmatter using the Read tool.

## Deliverables

A structured report with: (1) each test case and full response, (2) explicit mode accuracy check against frontmatter, (3) emergent mode novelty assessment, (4) creative mode quality assessment.
