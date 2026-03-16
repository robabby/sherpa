---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
last-verified: 2026-03-16
source-initiatives:
  - dispatch-center
  - agent-narrative-streaming
  - studio-agent-missions
  - sqlite-agentic-state
---

> **AI-generated** 2026-03-16 · Awaiting human review
> Sources: dispatch-center, agent-narrative-streaming, studio-agent-missions, sqlite-agentic-state

# Execution Pipeline

The Planner/Worker/Judge trifecta that decomposes initiatives into tasks, dispatches them across five backends, and reviews the output. Three dispatch modes (interactive, supervised, overnight) with task-type routing configured in `sherpa.config.ts`.

## Overview

The pipeline converts approved initiatives into completed work through three roles: the **Planner** decomposes initiatives into tasks (`/plan-tasks`), the **Worker** executes tasks in isolated worktrees, and the **Judge** evaluates output against acceptance criteria (`auto-judge.sh`). Each role can be filled by a human or an AI agent.

## Task Types and Routing

Eight task types, each routable to a different backend (`packages/studio-core/src/dispatch.ts:16-24`):

| Task Type | Default Backend | Description |
|-----------|----------------|-------------|
| `code-implementation` | claude | Feature development |
| `code-review` | claude | Peer code review |
| `architect` | claude | Design/architecture decisions |
| `research` | groq/google-ai | Discovery and analysis |
| `content-generation` | opencode | Documentation/copy |
| `audit` | claude | Compliance/security review |
| `embeddings` | lm-studio | Vectorization/indexing |
| `general` | opencode | Uncategorized work |

Route resolution order: Claude-only constraint (governance files force claude) → explicit frontmatter override → task-type lookup → fallback route.

**Governance guard:** Files matching `.claude/`, `CLAUDE.md`, or `docs/agents/roles/` always route to claude regardless of task type.

## Dispatch Modes

| Mode | Human Involvement | Overnight? |
|------|------------------|------------|
| `interactive` | Human drives, real-time feedback | No |
| `supervised` | Agent runs headless, human reviews output | No |
| `overnight` | Fully autonomous, no human in loop | Yes — blocked for code-implementation and architect |

## Backend Architecture

Five CLI backends + three API backends (`packages/studio-core/src/dispatch-meta.ts`):

**CLI backends** (shell scripts in `scripts/backends/`):
- `claude.sh` — Claude Code CLI. Interactive: passthrough. Headless: `--print --output-format stream-json --permission-mode acceptEdits`
- `opencode.sh` — OpenCode CLI
- `codex.sh` — OpenAI Codex CLI
- `gemini.sh` — Google Gemini CLI
- `lm-studio.mjs` — Local inference via OpenAI-compatible API at localhost:1234

**API backends** (Node modules):
- `groq.mjs`, `google-ai.mjs`, `lm-studio-api.mjs` — AI SDK providers via fetch

Each backend responds to `--health` with JSON `{ available, models?, error? }`. Health check timeout: 3s API, 5s CLI.

## Dispatch Flow

### Interactive (`scripts/dispatch.sh`)

1. Read role definition from `docs/agents/roles/{slug}.md`
2. Extract `task-type` from role frontmatter
3. Resolve route via `resolve-route.mjs` (task-type + mode + optional override)
4. Export env vars: `SHERPA_ROLE`, `SHERPA_MODE`, `SHERPA_MODEL`
5. Exec backend script

### Headless (`scripts/worker.sh`)

1. Load task metadata via `task-scanner.mjs --id {slug}`
2. Resolve backend/model (frontmatter override → config route → fallback)
3. Mode guard rail: reject overnight for code-implementation/architect
4. Assemble prompt: task body wrapped with worker constraints and scope boundaries
5. Update status → `dispatched`, log event to NDJSON
6. Export env vars: `SHERPA_TASK_SLUG`, `SHERPA_MODEL`, `SHERPA_BUDGET_USD`, `SHERPA_LOG_FILE`
7. Spawn background log streamer (`agent-log-streamer.sh`) for real-time NDJSON events
8. Invoke backend, capture exit code
9. Update status → `completed` (exit 0) or `failed` (non-zero), log duration

### Judge (`scripts/auto-judge.sh`)

1. Input: task definition (acceptance criteria) + worker output + git diff
2. Evaluate each criterion, render verdict as YAML frontmatter + markdown table
3. Write to `docs/tasks/logs/{id}-verdict.md`
4. Verdict values: `approved`, `needs-changes`, `rejected`
5. Update task status → `reviewed`, set `judge-verdict` field
6. Can run via claude (default), lm-studio, or opencode backends

## Agent Event System

Events tracked in NDJSON format at `docs/tasks/logs/{id}-events.ndjson` (`packages/studio-core/src/task-events.ts`):

| Event | When |
|-------|------|
| `dispatch_requested` | UI triggers dispatch |
| `worker_started` | worker.sh begins |
| `backend_delegating` | About to call backend script |
| `dispatch_spawned` | Subprocess PID assigned |
| `agent_output` | Batched text from runtime (lines, batch, byteOffset) |
| `status_changed` | Transition with from/to states + durationSeconds |
| `dispatch_failed` | Subprocess failed to start |

Events are append-only with monotonic timestamps. The log streamer sidecar batches agent output into NDJSON for real-time UI updates via SSE.

### Metrics Extraction

`extractAgentMetrics` computes from events: `durationSeconds`, `tokensInput`, `tokensOutput`, `costUsd`. Fallback: compute duration from first/last event timestamps if recorded value is invalid.

## Velocity Tracking

Initiative momentum calculated from filesystem and git evidence (`packages/studio-core/src/velocity.ts`):

| Momentum | Threshold | Meaning |
|----------|-----------|---------|
| `active` | Activity within 3 days | Work happening |
| `cooling` | Activity within 7 days | Slowing down |
| `stale` | No activity in 7+ days | Needs attention |

Research depth: `iterations / (iterations + open_questions)` — 0 to 1 normalized convergence score.

## Task Data Model

`TaskBoardEntry` in `packages/studio-core/src/tasks.ts`:

```
{ id, file, status, role, priority, initiative, backend, model,
  budgetUsd, worktree, branch, taskType, mode,
  durationSeconds, tokensInput, tokensOutput, costUsd,
  hasReport, hasVerdict, hasBlockers }
```

Status lifecycle: `pending` → `dispatched` → `completed`/`failed` → `reviewed`

## Current State

**Implemented:** Five CLI backends, three API backends, interactive/supervised/overnight modes, task-type routing, judge workflow, NDJSON event system, SSE streaming, velocity tracking, budget allocation.

**SQLite State Layer:** Task coordination and agent session state backed by SQLite in WAL mode (`@sherpa/studio-core/db`). Connection factory at `packages/studio-core/src/db/connection.ts` with pooled connections and standard pragmas. Coordination database (`.sherpa/coordination.db`) stores agent_sessions and task_claims with CAS via version columns. Events database (`.sherpa/events.db`) provides append-only audit trail with ULID-keyed entries. See [0007 — SQLite embedded state, Fossil pattern](../../decisions/0007-sqlite-embedded-state-fossil-pattern.md).

**Seeds (from completed initiatives):** MCP HTTP streamable transport, scheduled dispatch, cost tracking dashboard, parallel dispatch, live terminal feed, backend-specific log parsers.

## Related

- [Governance Engine](../governance-engine/index.md) — creates and tracks the tasks this pipeline executes
- [Studio Application](../studio-application/index.md) — visualizes dispatch, missions, and events
- [Config-as-Code](../config-as-code/index.md) — dispatch routing configuration

## Decisions

- [0004 — Five-backend dispatch architecture](../../decisions/0004-five-backend-dispatch.md)
- [0005 — Mission control over table board](../../decisions/0005-mission-control-over-table-board.md)
- [0006 — SSE streaming for agent events](../../decisions/0006-sse-streaming-for-agent-events.md)
- [0007 — SQLite embedded state, Fossil pattern](../../decisions/0007-sqlite-embedded-state-fossil-pattern.md)
