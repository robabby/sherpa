# Iteration 2 — 2026-03-21

## What We Already Knew

Iteration 1 established that Linear is substrate, not competitor. The API is sufficient, the governance gap is real, and most Sherpa dimensions map cleanly to Linear features. But we surveyed Linear's surface — we didn't map it against Sherpa's actual code. This iteration does the overlap analysis with a deprecation lens: where do we overlap, and what can we delete?

## Findings

### Vector 1: Task Management Overlap
**Question:** Where does Sherpa's task system duplicate what Linear already does, and what can be deleted?
**Full report:** [iteration-2/vector-1-task-management-overlap.md](iteration-2/vector-1-task-management-overlap.md)

- Task system has three layers: state tracking (REDUNDANT), execution orchestration (GOVERNANCE), dispatch telemetry (GOVERNANCE)
- `task-board.sh` (139 lines) — entirely redundant, delete outright
- `task-scanner.mjs` — `scanTasks()` redundant, keep `parseFrontmatter()`, `findStaleTasks()`, `updateTask()`
- `tasks.ts` — `getTaskStats()` redundant, keep `getTaskDetail()` and metrics computation
- `task-events.ts` (128 lines) — 100% governance, keep entirely
- MCP tools: delete `task_list`, bridge `task_get/create/update`, keep `task_dispatch/task_logs`
- Frontmatter: 7 fields move to Linear (state), 7 stay framework-side (governance)

**Implications:** Task state management is the primary overlap. ~400 lines of CRUD code can be deleted; dispatch logic stays.

### Vector 2: Initiative/Project Tracking Overlap
**Question:** Where does Sherpa's initiative system duplicate Linear's projects/initiatives?
**Full report:** [iteration-2/vector-2-initiative-tracking-overlap.md](iteration-2/vector-2-initiative-tracking-overlap.md)

- **Initiative system is almost entirely governance.** Unlike tasks, initiatives ARE the core value.
- 9-stage lifecycle detector (lifecycle.ts) has no Linear equivalent — auto-computes workflow stage from file existence + status + research count
- VALID_TRANSITIONS prevents invalid state jumps — Linear lets you freely change statuses
- Actor-gated approval: agents can't approve structural changes — no Linear equivalent
- Seeds, spawned-from genealogy, integration review, dependencies vs informs — all governance-native
- Only `initiative_list` and `initiative_get` MCP tools are potentially redundant

**Implications:** Don't touch the initiative system. It's Sherpa's core IP. At most, sync status to Linear as a read-only view.

### Vector 3: UI/Visualization Overlap
**Question:** Which Studio UI surfaces duplicate Linear's views?
**Full report:** [iteration-2/vector-3-ui-visualization-overlap.md](iteration-2/vector-3-ui-visualization-overlap.md)

- **~12% of Studio UI is redundant with Linear** (task lists, status badges)
- **~88% is governance-specific** (dispatch telemetry, judge verdicts, lifecycle stages, convention compliance)
- Dispatch Center: 25% redundant (backlog list), 75% governance (workforce, mode selector, guard rails)
- Tasks page: 15% redundant (task list), 85% governance (event timeline, metrics, log viewer)
- Initiative views: 0% redundant, 100% governance
- Dashboard/sidebar: 0% redundant, 100% governance

**Implications:** Studio is a governance console, not a project management dashboard. Linear doesn't replace it.

### Vector 4: Deprecation Impact Analysis
**Question:** What files get deleted, what breaks, what's the migration path?
**Full report:** [iteration-2/vector-4-deprecation-impact.md](iteration-2/vector-4-deprecation-impact.md)

- **Delete:** `task-board.sh` (139 lines), `docs/tasks/*.md` (41 files after import)
- **Rewrite:** `tasks.ts` → `linear-tasks.ts` (same interface, Linear backend), task-scanner.mjs `scanTasks()`, 4 MCP tools
- **Keep untouched:** task-events.ts, dispatch.sh, resolve-route.mjs, worker.sh, auto-judge.sh, all initiative code, all Studio governance UI
- **Critical consumer:** 8 Studio UI pages import `getTaskBoard()`/`getTaskDetail()` — these all need import updates
- **Migration effort:** 5-7 sessions across 5 phases

**Implications:** Well-defined refactoring with clear boundaries. The main risk is the 8 Studio UI pages that need import updates.

## Synthesis

### The Overlap Map

The research reveals a clean three-zone model:

**Zone 1: DELETE (Linear replaces entirely)**
- Task state CRUD (task-board.sh, scanTasks, getTaskStats, task_list MCP tool)
- Task file state fields (status, priority, timestamps, assignment)
- Task body as markdown files (Objective/Context/Criteria → Linear issue description)
- **~550 lines of code + 41 task files**

**Zone 2: BRIDGE (Linear owns state, Sherpa adds governance overlay)**
- Task data layer (rewrite tasks.ts to read from Linear API)
- Task MCP tools (task_get/create/update backed by Linear)
- Dispatch scripts (replace filesystem queries with Linear API calls)
- Studio task list panels (pull from Linear, overlay governance data)
- **~700 lines rewritten, same interfaces**

**Zone 3: KEEP (Sherpa-native, no Linear equivalent)**
- Dispatch pipeline (backend routing, mode guards, worker orchestration)
- Dispatch telemetry (event logs, token/cost accounting, duration)
- Judge pipeline (verdicts, retry loops, accumulated context)
- Initiative system (lifecycle detection, approval policies, seeds, genealogy)
- Convention enforcement (rules, skills, behavioral constraints)
- Studio governance UI (~88% of surfaces)
- **~3,500+ lines untouched**

### The Decision Framework

For each subsystem, the question is: **"Is this state management or behavior enforcement?"**

| If it's... | Then... | Example |
|------------|---------|---------|
| Tracking what status something is in | Linear | Task status: pending → dispatched → completed |
| Enforcing what transitions are allowed | Sherpa | VALID_TRANSITIONS: agents can't approve structural changes |
| Listing and filtering items | Linear | Show me all pending research tasks |
| Routing items to execution backends | Sherpa | Research tasks go to openclaw, code tasks go to claude |
| Displaying progress and burndown | Linear | 60% of sprint complete |
| Showing dispatch telemetry and verdicts | Sherpa | Worker used 45K tokens, cost $0.12, judge: needs-changes |

### What This Simplifies on Sherpa's Roadmap

Three pending initiatives become unnecessary or dramatically smaller:

| Initiative | Current Scope | With Linear |
|------------|--------------|-------------|
| `scheduled-dispatch` | Build scheduler, cron templates, queue enhancement | Linear has cycles + automation rules |
| `dispatch-idempotence` | Atomic writes, status guards, lifecycle validation | Linear's API handles concurrent state |
| `dispatch-evolution` | Simplify dispatch UX, Settings page | Still needed, but task backend shifts to Linear |

### The Core Value Clarification

This research crystallizes Sherpa's value proposition:

**Sherpa is NOT:** A project management tool. Don't compete with Linear on task CRUD, status boards, or progress tracking.

**Sherpa IS:** A governance layer for AI-driven workflows. Behavioral constraints, convention enforcement, lifecycle management, dispatch orchestration, quality gates. Things that Linear explicitly delegates to agents via Agent Guidance but provides no enforcement mechanism for.

Deleting the task state management code sharpens this distinction. Every remaining line of code is governance — the thing that makes Sherpa worth installing as a Linear Agent.

## Proposals Generated

Updated `docs/initiatives/sherpa-linear-integration/proposal.md` with candidate architecture and strategic framing (iteration 1). This iteration's findings strengthen the recommendation — the overlap is well-defined, the deprecation path is clear, and the remaining code IS the product.

## Open Questions for Next Iteration

1. **MVP implementation scope** — What's the thinnest vertical slice that demonstrates Sherpa as a Linear Agent? Possibly: webhook receiver → governance check → comment posted. Could this be built in 1-2 sessions?

2. **Linear free tier validation** — Does the free plan support the API volume, webhook count, and label groups needed? Need to test with actual Linear workspace.

3. **Custom fields vs label groups** — Linear has no custom fields API. Label groups (single-select) work for task-type/mode/role. But what about multi-value scenarios (issue touching both research and content-generation)? Need to validate with real Linear workspace.

4. **Integration Directory submission** — Sherpa Consulting doesn't have LLC/EIN. Can a sole proprietorship submit? Need to clarify with Linear's integrations@linear.app.

5. **Offline fallback architecture** — If Linear is the task state backend, what happens when the network is down? Accept online-only for Linear integration, keep filesystem as fallback path?
