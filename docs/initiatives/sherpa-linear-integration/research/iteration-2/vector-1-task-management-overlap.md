# Vector 1: Task Management Overlap

**Question:** Where does Sherpa's task system duplicate what Linear already does, and what can be deleted?
**Agent dispatched:** 2026-03-21

## Classification Summary

Sherpa's task system has three distinct layers:

1. **State tracking** (REDUNDANT) — status, priority, assignment, timestamps
2. **Execution orchestration** (GOVERNANCE) — dispatch pipeline, mode guards, retry loops, backend routing
3. **Dispatch telemetry** (GOVERNANCE) — event logs, token/cost accounting, duration metrics

## Component Analysis

### task-board.sh (139 lines) — DELETE
All 4 commands (add, list, claim, done) are CRUD that Linear replaces. Not called by any modern scripts — superseded by task-scanner.mjs and MCP tools.

### task-scanner.mjs (161 lines) — PARTIAL DEPRECATION
- `scanTasks()` — REDUNDANT (Linear filters issues)
- `parseFrontmatter()` / `serializeFrontmatter()` — BRIDGE (keep for file I/O)
- `findStaleTasks()` — GOVERNANCE (dispatch health, no Linear equivalent)
- `updateTask()` — BRIDGE (runtime field updates during dispatch)

Consumers: auto-judge.sh (3 calls), dispatch-queue.sh (1 call), worker.sh (1 call)

### tasks.ts (234 lines) — REWRITE
- `getTaskStats()` — REDUNDANT (Linear dashboard)
- `getTaskDetail()` — GOVERNANCE (pulls dispatch metrics, logs, judge artifacts)
- `getTaskBoard()` — MIXED (metrics computation is governance; sorting/filtering is redundant)

Consumers: 8 Studio UI pages, cross-project aggregation, command palette

### task-events.ts (128 lines) — KEEP ENTIRELY
All governance. Event logs are Sherpa's dispatch telemetry — Linear has no equivalent. `getTaskEvents()` and `extractAgentMetrics()` (duration, tokens, cost) are framework-native.

### MCP Task Tools (6 tools, ~300 lines)
| Tool | Classification | Action |
|------|---------------|--------|
| task_list | REDUNDANT | Replace with Linear GraphQL |
| task_get | BRIDGE | Read from Linear + local logs |
| task_create | BRIDGE | Create Linear issue + local dispatch metadata |
| task_update | BRIDGE | Sync to Linear; keep governance fields local |
| task_dispatch | GOVERNANCE | Keep — backend spawning, health checks |
| task_logs | GOVERNANCE | Keep — event/artifact aggregation |

### dispatch-queue.sh (79 lines) — BRIDGE
Replace filesystem scan with Linear API query for pending issues. Keep dispatch loop (worker.sh spawning). Becomes: get tasks from Linear → dispatch via worker.sh → sync results back.

### worker.sh (207 lines) — KEEP + BRIDGE
Task resolution (line 20) needs to read from Linear instead of filesystem. All other logic (mode guards, backend routing, env setup) stays framework-native.

## Frontmatter Field Classification

| Field | Category | Action |
|-------|----------|--------|
| id, status, priority, created, dispatched-at, completed-at, claimed-by | State | Move to Linear |
| role, task-type, mode, initiative | Execution context | Linear labels/custom fields |
| backend, model, budget-usd | Backend routing | Keep framework-side |
| worktree, branch, session-id | Execution tracking | Keep framework-side |
| judge-verdict, max-retries, attempt | Judge pipeline | Keep framework-side |

## Task Body Sections
Objective, Context, Acceptance Criteria, Constraints, Deliverables — NOT parsed programmatically. Read as whole markdown by workers/judges. Map directly to Linear issue description. REDUNDANT.

## The docs/tasks/ Directory
- Delete task files (move state to Linear)
- Keep `logs/` directory for worker output artifacts (verdicts, blockers, reports, NDJSON events)
- Hybrid: Linear owns state, filesystem owns execution history
