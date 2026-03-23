# Vector 4: Deprecation Impact Analysis

**Question:** For each overlap, what files get deleted, what breaks, what's the migration?
**Agent dispatched:** 2026-03-21

## Delete Outright (LOW RISK)

### scripts/task-board.sh (139 lines)
- **No active code consumers.** Superseded by task-scanner.mjs and MCP tools.
- **Only doc references** in plan.md files (prose, not execution).
- **Migration:** Delete. No replacement needed.
- **Risk:** LOW

## Rewrite to Linear API (HIGH TOUCH)

### packages/studio-core/src/tasks.ts (234 lines) — CRITICAL
**Consumers (8 Studio UI pages):**
- `apps/studio/src/app/(studio)/tasks/page.tsx` (getTaskBoard, getTaskDetail)
- `apps/studio/src/app/(studio)/tasks/[slug]/page.tsx` (getTaskDetail)
- `apps/studio/src/app/(studio)/dispatch/page.tsx` (getTaskBoard)
- `apps/studio/src/app/(studio)/projects/[project]/tasks/page.tsx` (getTaskBoard, getTaskDetail)
- `apps/studio/src/app/(studio)/projects/page.tsx` (getTaskBoard)
- `apps/studio/src/app/(studio)/workforce/page.tsx` (getTaskBoard)
- `apps/studio/src/app/(studio)/page.tsx` (getTaskBoard — homepage)
- `apps/studio/src/app/(studio)/actions/command-palette-items.ts` (getTaskBoard)
- `packages/studio-core/src/cross-project.ts` (getAllTasks)

**Migration:** Create `linear-tasks.ts` as drop-in replacement. Same `TaskBoardEntry` interface, backed by Linear GraphQL. Keep `task-events.ts` for dispatch metrics. All 8 pages update their import.
**Risk:** CRITICAL — breakage cascades to Studio homepage, dispatch center, all project views.

### scripts/task-scanner.mjs (161 lines) — HIGH
**Consumers:**
- `scripts/auto-judge.sh` (line 37, 176-177) — queries by ID and status, updates fields
- `scripts/dispatch-queue.sh` (line 23, 55) — queries pending, updates mode
- `scripts/worker.sh` (line 24) — queries by ID for metadata

**Migration:** Replace filesystem scanning with Linear GraphQL client. Same CLI interface, new backend.
**Risk:** HIGH — core dispatch pipeline. Must maintain exact same output format for consumers.

### packages/studio-mcp/src/server.ts — task tools (~300 lines) — MEDIUM
**Tools to remove/repoint:**
- `task_list` → Linear GraphQL
- `task_get` → Linear GraphQL + local logs
- `task_create` → Linear mutation + local dispatch metadata
- `task_update` → Linear mutation (filter to governance fields only)

**Tools to keep:**
- `task_dispatch` — backend spawning, framework-native
- `task_logs` — event/artifact aggregation, framework-native

**Risk:** MEDIUM — MCP tool interface stays same, backend changes.

### scripts/auto-judge.sh (line 37) — LOW
**Change:** Update task-scanner calls to use Linear client. Judge logic (prompt, verdict writing) unchanged.
**Risk:** LOW — single line change.

### scripts/dispatch-queue.sh (line 23) — LOW
**Change:** Replace `task-scanner.mjs --status pending` with Linear query.
**Risk:** LOW — single line change.

### scripts/worker.sh (line 24) — LOW
**Change:** Replace `task-scanner.mjs --id $slug` with Linear query.
**Risk:** LOW — single line change, all other logic stays.

## Data Migration (ONE-TIME)

### docs/tasks/*.md (41 files) → Linear Issues
- Bulk import via `issueBatchCreate` GraphQL mutation
- Map frontmatter fields to Linear issue fields + labels
- Keep `docs/tasks/logs/` for execution artifacts
- Delete markdown task files after import
- **Effort:** 1-2 hours scripted
- **Risk:** LOW

### docs/tasks/README.md — UPDATE
- Change purpose from "task file format spec" to "task execution logs reference"
- **Risk:** LOW

## What Stays As-Is (NO CHANGES)

| File | Reason |
|------|--------|
| scripts/dispatch.sh | Role→task-type mapping, backend resolution — governance |
| scripts/resolve-route.mjs | Routing tables — governance |
| task-events.ts | Dispatch telemetry — governance, no Linear equivalent |
| All initiative tools | Initiative system stays Sherpa-native |
| All .claude/rules/ | Convention enforcement — governance |
| All Studio UI governance panels | Dispatch telemetry, verdicts, lifecycle — no Linear equivalent |
| docs/tasks/logs/ | Execution artifacts stay framework-side |

## Migration Effort Estimate

| Phase | Work | Sessions |
|-------|------|----------|
| Linear API client (linear-tasks.ts) | GraphQL wrapper, type mapping | 1-2 |
| Script repointing | task-scanner → Linear in 3 scripts | 1 |
| MCP tool repointing | 4 tools → Linear backend | 1 |
| Studio UI migration | 8 pages update imports | 1-2 |
| Data migration | Bulk import 41 tasks, cleanup | 1 |
| **Total** | | **5-7 sessions** |

## Decision: What Gets Deleted

```
CONFIRMED DELETE:
  scripts/task-board.sh                          (139 lines)
  docs/tasks/*.md                                (41 files, after import)

CONFIRMED REWRITE (same interface, Linear backend):
  packages/studio-core/src/tasks.ts              (234 lines → linear-tasks.ts)
  scripts/task-scanner.mjs                       (161 lines, scanTasks() replaced)
  packages/studio-mcp/src/server.ts              (task_list, task_get, task_create, task_update)

CONFIRMED KEEP (no changes):
  packages/studio-core/src/task-events.ts        (128 lines)
  scripts/dispatch.sh                            (interactive launcher)
  scripts/resolve-route.mjs                      (routing)
  scripts/worker.sh                              (orchestration)
  scripts/auto-judge.sh                          (judge pipeline)
  scripts/dispatch-queue.sh                      (batch dispatch)
  docs/tasks/logs/                               (execution artifacts)
  All initiative system files
  All Studio governance UI
```
