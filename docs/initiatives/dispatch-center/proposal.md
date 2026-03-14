---
status: integrated
initiative: dispatch-center
created: 2026-03-13
updated: 2026-03-13
type: new-plan
risk: structural
targets:
  - scripts/
  - scripts/backends/
  - packages/studio-core/src/tasks.ts
  - packages/studio-core/src/dispatch.ts
  - packages/studio-mcp/src/server.ts
  - apps/studio/src/app/dispatch/
  - docs/agents/roles/
  - docs/tasks/README.md
dependencies:
  - agent-infrastructure
spawned-from: agent-infrastructure
---

# Dispatch Center

Port WavePoint's agentic dispatch system to Sherpa and expand it from 2 backends (Claude Code + LM Studio) to 5 (Claude Code, OpenCode, Codex, Gemini CLI, LM Studio). Add a Studio UI Dispatch Center where workforce capacity meets the task backlog.

## State Snapshot

Sherpa has the data model but not the execution layer. `studio-core` exposes `getTaskBoard()`, `getTaskDetail()`, and `getTaskStats()`. The MCP server has `task_list`, `task_get`, `task_create`, `task_update`, `task_dispatch`, `task_logs`. `docs/tasks/README.md` defines the task file format with backend and task-type fields.

What's missing: the 8 shell/Node scripts from WavePoint that actually dispatch tasks, manage workers, run judges, and orchestrate queues. None were ported. Additionally, the existing system only knows about Claude Code and LM Studio — it has no concept of OpenCode, Codex, or Gemini CLI as execution backends.

WavePoint source: `../wavepoint/scripts/` — `dispatch.sh`, `claude-worker.sh`, `auto-judge.sh`, `task-board.sh`, `task-scanner.mjs`, `dispatch-queue.mjs`, `lm-worker.mjs`, `studio-mcp-server.ts`.

## Proposed Changes

### 1. Scripts — Execution Layer

Port and restructure WavePoint's dispatch scripts with a unified multi-backend architecture.

**Unified entry points:**
- `scripts/dispatch.sh` — interactive CLI launcher. Reads role frontmatter, resolves backend + model from config, launches the appropriate CLI.
- `scripts/worker.sh` — headless worker. Reads task file, handles common lifecycle (status updates, worktree creation, log capture), delegates to backend-specific module.
- `scripts/auto-judge.sh` — verdict system. Reviews completed tasks against acceptance criteria. Supports all backends for the judge itself.
- `scripts/task-board.sh` — CLI CRUD for task files.
- `scripts/task-scanner.mjs` — task file scanner with filters and frontmatter updates.
- `scripts/dispatch-queue.sh` — batch/overnight queue runner with mode guard rails.

**Backend-specific modules:**
- `scripts/backends/claude.sh` — `claude --print --model X --max-budget-usd Y`
- `scripts/backends/opencode.sh` — OpenCode Zen CLI with model selection
- `scripts/backends/codex.sh` — OpenAI Codex CLI
- `scripts/backends/gemini.sh` — Google Gemini CLI
- `scripts/backends/lm-studio.mjs` — HTTP API worker (Node, not a CLI)

Each backend implements a standard contract via environment variables (`SHERPA_TASK_SLUG`, `SHERPA_MODEL`, `SHERPA_LOG_FILE`, etc.) and exit codes (0 = completed, 1 = failed, 2 = backend unavailable).

### 2. Routing — Task-Type Config

Replace `model-tier` with task-type-based routing in `sherpa.config.ts`.

```ts
dispatch: {
  routes: {
    'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
    'code-review':         { backend: 'codex' },
    'architect':           { backend: 'claude', model: 'claude-opus-4-6' },
    'research':            { backend: 'opencode', model: 'minimax-m2.5' },
    'content-generation':  { backend: 'gemini' },
    'audit':               { backend: 'opencode', model: 'minimax-m2.5' },
    'embeddings':          { backend: 'opencode', model: 'minimax-m2.5' },
  },
  fallback: { backend: 'opencode', model: 'minimax-m2.5' },
  offlineFallback: { backend: 'lm-studio' },
  overnight: {
    blocked: ['code-implementation', 'architect'],
  },
}
```

**Resolution order:** task `backend`+`model` override > task `task-type` > role `task-type` > config fallback > offline fallback.

**Role frontmatter gains `task-type`:**
```yaml
task-type: code-review
```

**Task frontmatter gains `task-type` and `mode`:**
```yaml
task-type: audit
mode: overnight
```

### 3. Dispatch Modes

Three modes reflecting human availability:

| Mode | Human response | Code implementation | Budget |
|------|---------------|-------------------|--------|
| `interactive` | Immediate | Yes (Claude Opus) | You're watching |
| `supervised` | Minutes to hours | Yes | Per-task budget cap |
| `overnight` | 6-8 hours | Blocked | Free models only |

Overnight mode rejects `code-implementation` and `architect` task types. Until the system proves it can handle unattended code changes reliably, overnight work is limited to research, audits, content, and embeddings.

### 4. Budget Allocation

| Backend | Use For | Budget Posture |
|---------|---------|---------------|
| Claude (Opus/Sonnet) | High-stakes code implementation, architecture | Tight — specific circumstances only |
| Codex (OpenAI) | Code review, code-heavy tasks | Liberal within monthly subscription |
| Gemini | Content creation, research, utility | TBD — needs benchmark against Nemotron |
| OpenCode Zen (free) | Overnight/batch: audits, research, embeddings | Default workhorse once validated |
| Local (LM Studio) | Offline fallback only | Free but slow |

### 5. Studio UI — Dispatch Center (`/dispatch`)

Three-panel layout where workforce meets backlog:

**Left — Backlog:** Pending tasks from the task board, filtered to dispatchable items, grouped by task-type. Source: `getTaskBoard()` filtered to `status: pending`.

**Center — Assignments:** Active and queued dispatches. Live status, time elapsed, backend, model. The heartbeat of the system.

**Right — Workforce:** Available agents and backends. Health status per backend, current load, eligible task types per agent role. Drag an agent onto a task or use auto-assign.

**Bottom bar — Queue controls:** Mode selector (interactive/supervised/overnight), "Dispatch selected", "Auto-dispatch backlog", guard rail warnings for blocked task types.

**Agent self-service:** Agents with `eligible-task-types` in their role frontmatter can "swim up" and claim eligible work from the backlog autonomously. The dispatch center shows this matchmaking.

### 6. MCP Server Updates

Expand `task_dispatch` in `studio-mcp` to support all 5 backends (currently only dispatches to LM Studio). Add backend health check tool. Update `task_create` to accept `task-type` and `mode` fields.

## Rationale

WavePoint proved the Planner/Worker/Judge pipeline works. The scripts ran hundreds of tasks across Claude Code and LM Studio backends. Sherpa has the data model and control plane (studio-core types, MCP tools) but no execution layer.

The free model landscape changed the economics. OpenCode Zen offers Nemotron 3 Super (1M context, #1 on DeepResearch Bench), MiniMax M2.5 (80.2% SWE-Bench), and MiMo V2 Flash — all free. Local models are no longer the budget option; they're the offline fallback. This shifts the architecture from "Claude for quality, local for cost" to "task-type determines backend, free cloud models are the workhorse."

The Dispatch Center UI closes the loop: Studio already shows tasks and agents, but can't assign or launch them. This page is where the three concerns meet.

## Dependencies

- **agent-infrastructure** (spawned from) — research on model routing, local model validation, dispatch script design.
- **docs/tasks/README.md** — task file format already defined and updated for multi-backend.
- **studio-core tasks.ts** — read-side APIs already implemented.
- **studio-mcp server.ts** — MCP tools already implemented, need backend expansion.

## Review Notes

- OpenCode, Codex, and Gemini CLI headless flags need a research spike before implementing backend modules. Claude Code's flags are known; the others are not.
- Free OpenCode models should be validated on real Sherpa tasks before becoming the overnight default. Run research and audit tasks, compare output quality to Claude baselines.
- The `agent-infrastructure` initiative's existing plan (dispatch script, agent eval, task board) is subsumed by this initiative. That plan was Claude-only; this one is multi-backend from the start.
- Gemini's positioning (content vs research vs utility) needs benchmarking against Nemotron to finalize routing rules.
- The overnight guard rail (no code implementation) is a policy decision, not a technical limitation. It can be relaxed once the system proves reliable.

**Effort:** 5 sessions (could stretch to 6 if CLI research in Session 2 surfaces surprises)
