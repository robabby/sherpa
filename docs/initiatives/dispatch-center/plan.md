# Dispatch Center Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port WavePoint's agentic dispatch system to Sherpa, expand to 5 backends (Claude Code, OpenCode, Codex, Gemini CLI, LM Studio), add task-type routing, dispatch modes, and a Studio Dispatch Center UI.

**Architecture:** Unified shell entry points (`dispatch.sh`, `worker.sh`, `auto-judge.sh`) delegate to backend-specific modules in `scripts/backends/`. Routing resolves task-type to backend+model via `sherpa.config.ts`. Studio UI provides a three-panel Dispatch Center at `/dispatch`. MCP server expands to support all backends.

**Tech Stack:** Shell (zsh), Node.js (ESM), TypeScript, React (Next.js 16), shadcn/ui, studio-core APIs

**Prerequisites already complete:**
- Task data model: `TaskBoardEntry`, `TaskDetail`, `TaskStats` types in studio-core
- Task APIs: `getTaskBoard()`, `getTaskDetail()`, `getTaskStats()` in studio-core
- MCP tools: `task_list`, `task_get`, `task_create`, `task_update`, `task_dispatch`, `task_logs`
- Task file format: `docs/tasks/README.md` with frontmatter schema
- Agent roles: role definitions in `docs/agents/roles/` with frontmatter

---

## Session 1: Scripts Foundation + Claude Backend

Port the core dispatch scripts from WavePoint, adapted for Sherpa's multi-backend architecture. Start with Claude as the known-good backend.

### Task 1.1: Task Scanner

**Files:**
- Create: `scripts/task-scanner.mjs`

Port from `../wavepoint/scripts/task-scanner.mjs`. Changes from WavePoint version:
- Replace `WAVEPOINT_ROLE` references with `SHERPA_ROLE`
- Add `task-type` and `mode` to recognized frontmatter fields
- Add `--task-type` and `--mode` filter flags

**Verify:** `node scripts/task-scanner.mjs --help` prints usage. Scanning `docs/tasks/` returns empty array (no tasks yet) or existing tasks if any.

### Task 1.2: Task Board CLI

**Files:**
- Create: `scripts/task-board.sh`

Port from `../wavepoint/scripts/task-board.sh`. Changes:
- `WAVEPOINT_ROLE` → `SHERPA_ROLE`
- `add` command accepts `--task-type` and `--mode` flags
- Default `task-type` to `general`, default `mode` to `supervised`

**Verify:** Create, list, claim, done cycle works. Clean up test task.

### Task 1.3: Dispatch Script (Interactive)

**Files:**
- Create: `scripts/dispatch.sh`

Port from `../wavepoint/scripts/dispatch.sh`. Major changes:
- Read `task-type` (not `model-tier`) from role frontmatter
- Resolve backend+model from a hardcoded routing table (config integration comes in Session 3)
- Support `--backend <name>` flag to override routing
- Claude backend: set `ANTHROPIC_MODEL`, `CLAUDE_CODE_SUBAGENT_MODEL`, `SHERPA_ROLE`, exec `claude`
- Stub cases for opencode, codex, gemini, lm-studio (print "not yet implemented" and exit)

**Verify:** `./scripts/dispatch.sh architect` resolves to Claude Opus, prints routing info, launches Claude Code.

### Task 1.4: Worker (Unified Entry Point)

**Files:**
- Create: `scripts/worker.sh`
- Create: `scripts/backends/claude.sh`

`worker.sh` handles the common lifecycle:
1. Read task file via `task-scanner.mjs`
2. Extract `backend`, `model`, `task-type`, `mode` from frontmatter
3. Validate mode guard rails (overnight + code-implementation = reject)
4. Update status to `dispatched`
5. Set `SHERPA_*` environment variables
6. Delegate to `scripts/backends/<backend>.sh` (or `.mjs` for lm-studio)
7. On return: update status to `completed` or `failed`, write log

`backends/claude.sh` implements the Claude Code headless contract:
- Reads `SHERPA_*` env vars
- Creates worktree if `SHERPA_WORKTREE` is set
- Runs `claude --print --model $SHERPA_MODEL --max-budget-usd $SHERPA_BUDGET_USD`
- Captures output to `SHERPA_LOG_FILE`

**Verify:** Create a test task with `backend: claude`, dispatch via `./scripts/worker.sh test-task`. Confirm status lifecycle and log output.

### Task 1.5: Auto-Judge

**Files:**
- Create: `scripts/auto-judge.sh`

Port from `../wavepoint/scripts/auto-judge.sh`. Changes:
- Support `--backend` flag to pick which model judges (default: claude-sonnet-4-6)
- Add opencode as a judge backend option (for free judging)
- Read task diff from worktree branch if available

**Verify:** `./scripts/auto-judge.sh --help` prints usage.

### Task 1.6: Dispatch Queue

**Files:**
- Create: `scripts/dispatch-queue.sh`

Simplified from WavePoint's `dispatch-queue.mjs`. Shell script that:
1. Accepts `--mode supervised|overnight` and a list of task slugs (or `--pending`)
2. Validates mode guard rails
3. Dispatches each task sequentially via `worker.sh`
4. Prints summary on completion

**Verify:** `./scripts/dispatch-queue.sh --pending` reports "No tasks to dispatch" when queue is empty.

**Session 1 commit:** `feat(dispatch): port core scripts from WavePoint with multi-backend architecture`

---

## Session 2: Backend Research + Implementation

Research the CLI interfaces for OpenCode, Codex, and Gemini, then implement backend modules.

### Task 2.1: CLI Research Spike

**Research (no code):**
- OpenCode CLI: headless/print mode flag, model selection syntax, auth mechanism, health check
- Codex CLI: headless/print mode flag, model selection, auth, health check
- Gemini CLI: headless/print mode flag, model selection, auth, health check
- Document findings in `docs/initiatives/dispatch-center/research/cli-flags.md`

**Acceptance:** Each CLI has documented: (1) interactive launch command, (2) headless execution command, (3) model selection flag, (4) auth setup, (5) health check command.

### Task 2.2: OpenCode Backend

**Files:**
- Create: `scripts/backends/opencode.sh`

Implement based on research findings. Must support:
- Interactive: `exec opencode <flags>`
- Headless: capture output to log file
- Model selection: Nemotron 3 Super, MiniMax M2.5, MiMo V2 Flash, Big Pickle
- Health check

**Verify:** Interactive launch with `./scripts/dispatch.sh researcher` (assuming researcher role has `task-type: research` → opencode).

### Task 2.3: Codex Backend

**Files:**
- Create: `scripts/backends/codex.sh`

Implement based on research. Primary use: code review and code-heavy tasks.

**Verify:** Interactive launch with a code-review role.

### Task 2.4: Gemini Backend

**Files:**
- Create: `scripts/backends/gemini.sh`

Implement based on research. Primary use: content generation, research, utility.

**Verify:** Interactive launch with a content-generation role.

### Task 2.5: LM Studio Backend

**Files:**
- Create: `scripts/backends/lm-studio.mjs`

Port from `../wavepoint/scripts/lm-worker.mjs`. Changes:
- Read `SHERPA_*` env vars instead of parsing frontmatter directly
- Remove WavePoint-specific voice guidelines from system prompt
- Keep context file resolution, think-block stripping, and structured logging

**Verify:** Health check succeeds when LM Studio is running, fails gracefully when not.

### Task 2.6: Update dispatch.sh Stubs

**Files:**
- Modify: `scripts/dispatch.sh`

Replace stub cases for opencode, codex, gemini with real implementations using the backend modules.

**Session 2 commit:** `feat(dispatch): implement opencode, codex, gemini, lm-studio backends`

---

## Session 3: Routing Config + Role Updates

Wire task-type routing through `sherpa.config.ts` and update role definitions.

### Task 3.1: Dispatch Config Types

**Files:**
- Create: `packages/studio-core/src/dispatch.ts`

TypeScript types for the dispatch config:

```ts
export type Backend = 'claude' | 'opencode' | 'codex' | 'gemini' | 'lm-studio'
export type DispatchMode = 'interactive' | 'supervised' | 'overnight'
export type TaskType = 'code-implementation' | 'code-review' | 'architect' | 'research' | 'content-generation' | 'audit' | 'embeddings' | 'general'

export interface BackendRoute {
  backend: Backend
  model?: string
}

export interface DispatchConfig {
  routes: Record<TaskType, BackendRoute>
  fallback: BackendRoute
  offlineFallback: BackendRoute
  overnight: {
    blocked: TaskType[]
  }
}
```

Export `resolveRoute(taskType, mode, overrides?)` function that implements the resolution order.

### Task 3.2: Config Integration

**Files:**
- Modify: `packages/studio-core/src/config/types.ts` — add `dispatch` to config schema
- Modify: `packages/studio-core/src/config/defaults.ts` — add default dispatch routes

### Task 3.3: Role Frontmatter Updates

**Files:**
- Modify: `docs/agents/roles/*.md` — add `task-type` field to each role
- Modify: `scripts/validate-agent.ts` — validate `task-type` field

Proposed mappings:
- `architect` → `task-type: architect`
- `engineer` → `task-type: code-implementation`
- `code-reviewer` → `task-type: code-review`
- `research-lead` → `task-type: research`
- `designer` → `task-type: content-generation`
- `technical-writer` → `task-type: content-generation`
- `judge` → `task-type: code-review`

Add `eligible-task-types` list for agents that can handle multiple types (e.g., `engineer` can also do `code-review`).

### Task 3.4: Wire Config to Scripts

**Files:**
- Modify: `scripts/dispatch.sh` — read routing from config instead of hardcoded table
- Modify: `scripts/worker.sh` — resolve route via config

Create a small Node helper `scripts/resolve-route.mjs` that reads `sherpa.config.ts`, resolves task-type to backend+model, and prints the result as JSON. Shell scripts call this and parse the output.

### Task 3.5: MCP Server Backend Expansion

**Files:**
- Modify: `packages/studio-mcp/src/server.ts`

Update `task_dispatch` to:
- Read task-type and resolve backend from config
- Support all 5 backends (currently only lm-studio)
- Add `backend_status` tool — health check all configured backends
- Update `task_create` to accept `task-type` and `mode`

**Session 3 commit:** `feat(dispatch): task-type routing via sherpa.config.ts with role frontmatter updates`

---

## Session 4: Dispatch Center UI

Build the three-panel Studio page.

### Task 4.1: Workforce Data Layer

**Files:**
- Create: `packages/studio-core/src/workforce.ts`

Functions for the workforce panel:
- `getWorkforce()` — returns agent roles with their `task-type`, `eligible-task-types`, and current assignment status
- `getBackendHealth()` — checks each backend's availability
- `getDispatchQueue()` — returns tasks in `dispatched` status with elapsed time

### Task 4.2: Dispatch API Routes

**Files:**
- Create: `apps/studio/src/app/api/dispatch/route.ts` — GET returns dispatch state (backlog + assignments + workforce)
- Create: `apps/studio/src/app/api/dispatch/health/route.ts` — GET returns backend health checks
- Create: `apps/studio/src/app/api/dispatch/run/route.ts` — POST triggers dispatch for a task

### Task 4.3: Dispatch Center Page

**Files:**
- Create: `apps/studio/src/app/dispatch/page.tsx`
- Create: `apps/studio/src/app/dispatch/layout.tsx`

Three-panel layout using shadcn/ui:

**Left panel — Backlog:**
- Filterable list of pending tasks
- Grouped by task-type with counts
- Each task shows: title, task-type badge, eligible backends
- Click to select for dispatch

**Center panel — Assignments:**
- Active dispatches with live status
- Time elapsed, backend, model, mode
- Status badges: dispatched (spinning), completed (green), failed (red)
- Click for task detail overlay

**Right panel — Workforce:**
- Backend cards showing health status (green/red dot)
- Per backend: available models, current load
- Agent role cards with eligible task types
- Drag-to-assign interaction (or click assign)

### Task 4.4: Queue Controls

**Files:**
- Create components within `apps/studio/src/app/dispatch/`

Bottom bar:
- Mode selector: interactive / supervised / overnight (radio group)
- "Dispatch Selected" button — dispatches selected backlog tasks
- "Auto-Dispatch" button — matches eligible tasks to available workforce
- Guard rail banner: shows when overnight mode blocks certain task types
- Queue summary: X tasks queued, Y active, Z completed today

### Task 4.5: Navigation

**Files:**
- Modify: Studio sidebar/nav to add Dispatch Center link

**Session 4 commit:** `feat(studio): Dispatch Center UI — three-panel backlog/assignments/workforce`

---

## Session 5: Auto-Dispatch + Polish

### Task 5.1: Agent Eligibility Matching

**Files:**
- Add to: `packages/studio-core/src/workforce.ts`

`matchTasksToAgents(tasks, agents, mode)` function:
- For each pending task, find agents whose `eligible-task-types` include the task's `task-type`
- Respect mode guard rails
- Return proposed assignments
- Tie-break: prefer the agent whose primary `task-type` matches over one where it's in the eligible list

### Task 5.2: Auto-Dispatch Flow

**Files:**
- Modify: `apps/studio/src/app/dispatch/` components

"Auto-Dispatch" button:
1. Calls `matchTasksToAgents` to get proposed assignments
2. Shows preview: "Will dispatch X tasks to Y backends"
3. On confirm: triggers sequential dispatch via API
4. Live updates as each task transitions

### Task 5.3: Overnight Queue Builder

**Files:**
- Add to dispatch page components

Specialized view when mode = overnight:
- Only shows tasks eligible for overnight dispatch
- Blocked task types greyed out with explanation
- "Queue for Tonight" button — stages tasks without dispatching
- "Start Overnight Run" button — kicks off `dispatch-queue.sh --mode overnight`

### Task 5.4: Validation — Free Model Efficacy

**Research task (no code):**
- Run 3-5 representative tasks (research, audit, content) on Nemotron 3 Super via OpenCode
- Compare output quality against Claude Sonnet baseline
- Document results in `docs/initiatives/dispatch-center/research/free-model-validation.md`
- This validates the overnight workhorse strategy before relying on it

### Task 5.5: Polish + Documentation

**Files:**
- Update: `docs/tasks/README.md` — add new fields (task-type, mode), update backend table
- Update: `CLAUDE.md` — add dispatch scripts to commands section
- Create: `docs/initiatives/dispatch-center/activity.md`

**Session 5 commit:** `feat(dispatch): auto-dispatch, overnight queue, free model validation`

---

## Summary

| Session | What | Key Deliverables |
|---------|------|-----------------|
| 1 | Scripts foundation + Claude backend | dispatch.sh, worker.sh, auto-judge.sh, task-board.sh, task-scanner.mjs, dispatch-queue.sh, backends/claude.sh |
| 2 | Backend research + implementation | CLI research doc, backends/opencode.sh, backends/codex.sh, backends/gemini.sh, backends/lm-studio.mjs |
| 3 | Routing config + role updates | dispatch.ts types, sherpa.config.ts routes, role frontmatter task-types, MCP expansion |
| 4 | Dispatch Center UI | /dispatch page, three-panel layout, queue controls, API routes |
| 5 | Auto-dispatch + polish | eligibility matching, overnight queue, free model validation, docs |

**Effort:** 5 sessions

**Not in scope (future work):**
- Cron-style automated scheduling (manual queue trigger for now)
- Cost tracking dashboard (track spend per backend over time)
- Multi-task parallel dispatch (sequential for now, parallel when system proves reliable)
- Gemini vs Nemotron benchmarking (deferred until both backends are live)
- Relaxing overnight code-implementation guard rail (requires proven reliability)
