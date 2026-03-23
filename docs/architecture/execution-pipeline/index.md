---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-19
last-verified: 2026-03-19
source-initiatives:
  - dispatch-center
  - agent-narrative-streaming
  - studio-agent-missions
  - sqlite-agentic-state
  - mcp-coordination-layer
  - semantic-knowledge-engine
  - mcp-multi-backend-dispatch
  - mcp-initiative-governance
  - agentic-runtime-platforms
  - vps-remote-compute
  - studio-production-auth
---

> **AI-updated** 2026-03-19 · Awaiting human review
> Sources: dispatch-center, agent-narrative-streaming, studio-agent-missions, sqlite-agentic-state, mcp-coordination-layer, semantic-knowledge-engine, mcp-multi-backend-dispatch, mcp-initiative-governance, agentic-runtime-platforms, studio-production-auth

# Execution Pipeline

The Planner/Worker/Judge trifecta that decomposes initiatives into tasks, dispatches them across nine backends (CLI, API, and gateway), and reviews the output. Three dispatch modes (interactive, supervised, overnight) with task-type routing configured in `sherpa.config.ts`.

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

Five CLI backends + three API backends + one gateway backend (`packages/studio-core/src/dispatch-meta.ts`):

**CLI backends** (shell scripts in `scripts/backends/`):
- `claude.sh` — Claude Code CLI. Interactive: passthrough. Headless: `--print --output-format stream-json --permission-mode acceptEdits`
- `opencode.sh` — OpenCode CLI
- `codex.sh` — OpenAI Codex CLI
- `gemini.sh` — Google Gemini CLI
- `lm-studio.mjs` — Local inference via OpenAI-compatible API at localhost:1234

**API backends** (Node modules):
- `groq.mjs`, `google-ai.mjs`, `lm-studio-api.mjs` — AI SDK providers via fetch

**Gateway backends** (Node modules, WebSocket):
- `openclaw.mjs` — Remote OpenClaw agent via WebSocket protocol v3 over Tailscale. Implements full device identity auth (Ed25519 key pair at `.openclaw-dispatch/device.json`). Dispatches via `chat.send`, collects streamed deltas, detects turn completion via `lifecycle.end` event. One-time device pairing required; device token persisted for subsequent connections. Currently explicit-only routing (`backend: openclaw`).

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

Tasks are managed in Linear. The `TaskBoardEntry` interface (`packages/studio-core/src/tasks.ts`) is populated by `getLinearTaskBoard()` in `packages/studio-core/src/linear-tasks.ts`, which queries the Linear API via `@linear/sdk` and maps issues to:

```
{ id, file, status, role, priority, initiative, backend, model,
  budgetUsd, worktree, branch, taskType, mode,
  durationSeconds, tokensInput, tokensOutput, costUsd,
  hasReport, hasVerdict, hasBlockers }
```

Sherpa's task taxonomy maps to Linear via mutually exclusive label groups: Task Type (8 labels), Mode (3), Role (5), Verdict (4). Priority maps natively (urgent=1, high=2, medium=3, low=4). Workflow state types map to Sherpa status (unstarted→pending, started→dispatched, completed→completed, canceled→failed).

Status lifecycle: `pending` → `dispatched` → `completed`/`failed` → `reviewed`

> **Note:** As of sherpa-linear-integration (2026-03-22), task state lives in Linear. `docs/tasks/logs/` retains execution artifacts (NDJSON events, verdicts, reports) on disk.

## Current State

**Implemented:** Five CLI backends, three API backends, one gateway backend (OpenClaw), interactive/supervised/overnight modes, task-type routing, judge workflow, NDJSON event system, SSE streaming, velocity tracking, budget allocation.

**SQLite State Layer:** Task coordination and agent session state backed by SQLite in WAL mode (`@sherpa/studio-core/db`). Connection factory at `packages/studio-core/src/db/connection.ts` with pooled connections and standard pragmas. Coordination database (`.sherpa/coordination.db`) stores agent_sessions and task_claims with CAS via version columns. Events database (`.sherpa/events.db`) provides append-only audit trail with ULID-keyed entries. See [0007 — SQLite embedded state, Fossil pattern](../../decisions/0007-sqlite-embedded-state-fossil-pattern.md).

**MCP Coordination Server:** Single-process MCP server at `packages/studio-mcp/` serving Streamable HTTP on port 3100 (`/mcp` endpoint). **Auth-gated** — all requests (except `/health`) must provide either an `x-api-key` header (agents, validated via Better Auth API key plugin) or a session cookie (humans, validated via `fromNodeHeaders`). Auth middleware at `packages/studio-mcp/src/auth/middleware.ts` shares `.sherpa/auth.db` with Studio via SQLite WAL. Multi-client session management — each connecting client gets its own `McpServer` + `StreamableHTTPServerTransport` pair, routed by `mcp-session-id` header. Health check at `/health` (unauthenticated). Authority lease system backed by SQLite `coordination.db` with three tools (`authority_acquire`, `authority_release`, `authority_renew`), one resource (`authority://{scope}`), and a `get_dashboard` bootstrap tool. Fencing tokens are globally monotonic via a `fence_token_seq` counter. TTL reaper cleans expired leases every 60 seconds. Authority enforcement (hooks) is deferred — applies only to autonomous agents, not collaborative sessions. See [0008 — Authority enforcement scoped to autonomous agents](../../decisions/0008-authority-enforcement-autonomous-only.md), [0012 — Better Auth over Supabase Auth](../../decisions/0012-better-auth-over-supabase.md).

**MCP Task Tools:** Task CRUD tools (`task_list`, `task_get`, `task_create`, `task_update`) query the Linear API via `@linear/sdk`. `task_create` creates a Linear issue with mapped priority and label groups, then resolves backend routing via `resolveRoute()`. `task_dispatch` remains filesystem-based — it reads local task metadata and delegates to `scripts/worker.sh` for backend script selection, NDJSON event logging, and log streamer sidecars. `task_logs` reads execution artifacts from `docs/tasks/logs/`. See [0016 — Linear as task state backend](../../decisions/0016-linear-as-task-backend.md).

**MCP Initiative Governance:** Seven initiative lifecycle tools registered in `packages/studio-mcp/src/initiative/tools.ts` — list, get, seeds (read-only), create, approve, update_status, activity (write, authority-gated). Write tools check authority leases when a coordination DB is available. Approval is governance-policy-gated via `governance.approval.agents` in `sherpa.config.ts` (default: `'never'`). Backed by `packages/studio-core/src/initiative-ops.ts` — filesystem CRUD with Zod validation and lifecycle transition enforcement.

**Seeds (from completed initiatives):** Scheduled dispatch, cost tracking dashboard, parallel dispatch, live terminal feed, backend-specific log parsers, hook enforcement for autonomous agents, bootstrap protocol with resource subscriptions, implicit authority via task dispatch.

## Knowledge Engine

SQLite-backed knowledge index at `.sherpa/knowledge.db` providing agents with queryable, context-efficient access to system state. Markdown files remain canonical; the database is a derived index that can be rebuilt from the filesystem (`pnpm sync:db`, 235ms incremental).

### Architecture

- **Database:** SQLite in WAL mode via `better-sqlite3`, sharing the connection factory from `@sherpa/studio-core/db`
- **Schema (v3):** 6 tables — `files`, `edges`, `files_fts` (standalone FTS5), `summaries`, `inferred_edges`, `clusters`
- **Sync pipeline:** `syncFromFilesystem()` with content-hash skip, standalone FTS5 with DELETE+INSERT (never REPLACE — see stress test A6), staleness propagation to parent summaries
- **Pluggable backend:** `KnowledgeBackend` interface (`embed`, `summarize`, `cosineSimilarity`, `buildCorpusIndex`). `AlgorithmicBackend` ships as zero-dependency default (TF-IDF vectors + extractive summaries). See [0009 — Pluggable knowledge backend](../../decisions/0009-pluggable-knowledge-backend-algorithmic-default.md).
- **Clustering:** Agglomerative single-linkage with auto-generated labels from highest-IDF shared terms

### MCP Tools

Four tools registered in `packages/studio-mcp/src/server.ts`:

| Tool | Purpose | Modes/Levels |
|------|---------|-------------|
| `search_knowledge` | Full-text and semantic search | text (FTS5 BM25), semantic (TF-IDF), hybrid (reciprocal rank fusion, k=60) |
| `get_summary` | Structured metadata at any zoom | file (frontmatter), initiative (summary + files + edges + stale flag), portfolio (all initiatives with temporal weighting) |
| `get_context` | Role-scaled session bootstrap | worker (deep scope, shallow system), planner (shallow scope, deep system), judge (scope + neighborhood), researcher (deep everything) |
| `query_related` | Relationship explorer | explicit (edge traversal + second-hop), emergent (high similarity, no explicit edge), creative (high similarity + high graph distance) |

Every response includes `backend` and `capabilities` fields so agents know the quality of intelligence available.

### Key Files

- `packages/studio-core/src/db/knowledge-schema.ts` — schema DDL, version management
- `packages/studio-core/src/db/knowledge-sync.ts` — filesystem → SQLite sync
- `packages/studio-core/src/db/knowledge-embeddings.ts` — embedding sync, inferred edges
- `packages/studio-core/src/db/classify.ts` — file classifier, edge extractor
- `packages/studio-core/src/knowledge/` — `KnowledgeBackend` interface, `AlgorithmicBackend`, clustering
- `packages/studio-core/src/config/types.ts` — `KnowledgeConfig` section
- `scripts/sync-knowledge-db.mjs` — `pnpm sync:db` CLI

### Design Decisions

- **Standalone FTS5:** External content mode (`content='files'`) corrupts the index on upsert (stress test A6). Standalone table with explicit DELETE+INSERT is the safe pattern.
- **Rank-based retrieval:** TF-IDF scores on governance corpora range 0.05-0.20. Any absolute threshold returns nothing or everything. Top-K ranking works correctly.
- **Lazy sync:** Git hooks and file watchers deferred. `ensureKnowledgeDb()` syncs on first MCP tool call. Re-sync takes 235ms, effectively free.
- **Agglomerative over HDBSCAN:** No production TypeScript HDBSCAN library exists. Agglomerative works at current scale (47 initiatives). Upgrade path documented for 500+.

## Related

- [Governance Engine](../governance-engine/index.md) — creates and tracks the tasks this pipeline executes
- [Studio Application](../studio-application/index.md) — visualizes dispatch, missions, and events
- [Config-as-Code](../config-as-code/index.md) — dispatch routing configuration

## Decisions

- [0004 — Five-backend dispatch architecture](../../decisions/0004-five-backend-dispatch.md)
- [0005 — Mission control over table board](../../decisions/0005-mission-control-over-table-board.md)
- [0006 — SSE streaming for agent events](../../decisions/0006-sse-streaming-for-agent-events.md)
- [0007 — SQLite embedded state, Fossil pattern](../../decisions/0007-sqlite-embedded-state-fossil-pattern.md)
- [0008 — Authority enforcement scoped to autonomous agents](../../decisions/0008-authority-enforcement-autonomous-only.md)
- [0009 — Pluggable knowledge backend, algorithmic default](../../decisions/0009-pluggable-knowledge-backend-algorithmic-default.md)
