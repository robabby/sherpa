---
id: sek-validate-search-knowledge
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

# Validate search_knowledge MCP tool end-to-end

## Objective

Call the search_knowledge MCP tool in all 3 modes (text, semantic, hybrid) with real queries and validate that results are relevant, correctly ranked, and the response format matches the documented schema. Report any issues.

## Context

The knowledge engine MCP tools are registered in `packages/studio-mcp/src/server.ts`. The MCP server must be running (`pnpm mcp`). The `.mcp.json` routes to `http://localhost:3100/mcp`.

Run `pnpm sync:db` before testing to ensure the DB is fresh.

Test queries to run:
1. text mode: "authority coordination" — expect mcp-coordination-layer in top results
2. text mode: "sqlite WAL concurrent" — expect sqlite-agentic-state research in top results
3. text mode with kind filter: "dispatch" kind=task — expect only task files
4. semantic mode: "database state management" — expect sqlite-related initiatives
5. hybrid mode: "agent behavioral constraints" — expect behavioral-agents initiative
6. Edge cases: malformed FTS5 syntax, nonexistent kind filter

## Acceptance Criteria

- [ ] All 3 search modes return results without errors
- [ ] Text mode results match FTS5 BM25 expectations (relevant files in top 3)
- [ ] Semantic mode returns initiative-level results ranked by TF-IDF similarity
- [ ] Hybrid mode merges text + semantic via RRF (results from both sources appear)
- [ ] Response includes backend and capabilities fields
- [ ] Kind and initiative filters work correctly
- [ ] Error messages are helpful for malformed queries

## Constraints

Do NOT modify any code. This is a validation task — report findings only. If a tool call fails, capture the full error response.

## Deliverables

A structured report with: (1) each test query, the mode used, and the response received, (2) pass/fail for each acceptance criterion, (3) any bugs or unexpected behaviors discovered, (4) overall assessment of tool readiness.
