---
id: sek-validate-get-context
status: completed
role: engineer
priority: high
initiative: semantic-knowledge-engine
backend: claude
model: claude-opus-4-6
task-type: code-review
mode: supervised
budget-usd: 0.50
worktree: null
branch: null
created: 2026-03-16T16:30:00
dispatched-at: 2026-03-16T17:00:00
completed-at: 2026-03-16T17:15:00
session-id: null
judge-verdict: pass
---

# Validate get_context MCP tool across all 4 roles

## Objective

Call the get_context MCP tool with each of the 4 roles (worker, planner, judge, researcher) both with and without an initiative slug. Validate that role-scaling produces meaningfully different responses and that the token budgets are respected.

## Context

`get_context` is the session bootstrap tool. It returns role-appropriate system state in a single call. Registered in `packages/studio-mcp/src/server.ts`. Role budgets defined in `ROLE_BUDGETS` constant.

Test matrix:
1. worker + initiative=semantic-knowledge-engine — expect deep scope (full file list), shallow system
2. planner + no initiative — expect deep system (in-progress summaries, recent), shallow scope
3. judge + initiative=mcp-coordination-layer — expect scope + full neighborhood summaries
4. researcher + initiative=sqlite-agentic-state — expect deep everything
5. worker + no initiative — expect system overview only, no scope
6. planner + initiative=semantic-knowledge-engine — expect initiative titles only (not full file list)

## Acceptance Criteria

- [ ] All 4 roles return different response shapes
- [ ] Worker responses include full file list in scope but only status counts in system
- [ ] Planner responses include in-progress summaries and recently landed in system
- [ ] Judge responses include neighborhood with adjacent initiative summaries
- [ ] Scope is null when no initiative is provided
- [ ] Response includes backend and capabilities fields
- [ ] Token budget fields are present and proportional to role

## Constraints

Do NOT modify any code. Report findings only. Capture full JSON responses for each test case.

## Deliverables

A structured report showing each role+initiative combination, the response shape, whether role-scaling worked correctly, and any issues with the bootstrap data quality.
