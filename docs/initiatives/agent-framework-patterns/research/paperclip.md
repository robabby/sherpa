# Paperclip Codebase Audit

Full audit of the Paperclip repository (MIT, 2026) for Sherpa agent framework pattern extraction.

---

## Overview

**What it is:** Open-source control plane for orchestrating AI agent "companies." Node.js server + React UI that manages org charts, task assignment, heartbeat scheduling, cost tracking, budgets, governance/approvals, and multi-company isolation. Positions itself as "the operating system for autonomous AI companies."

**Scale and maturity:** Pre-v1 but actively developed. ~35 server source files, ~50 UI pages/components, 7 adapter packages, 6 skills, ~35 unit tests, 1 e2e test. Embedded PGlite for zero-config dev. The spec documents (`SPEC.md`, `SPEC-implementation.md`) are detailed and well-structured — the team thinks carefully about boundaries.

**Tech stack:**
- Backend: Node.js + TypeScript + Express-compatible REST API (described as Hono in spec, implemented with Express)
- Database: PostgreSQL via Drizzle ORM (PGlite embedded for dev, Docker/Supabase for prod)
- Frontend: React + Vite + TanStack Query + shadcn/ui
- Auth: Better Auth (session-based for board humans, hashed API keys for agents)
- Adapters: claude_local, codex_local, cursor, opencode_local, pi_local, openclaw_gateway, process, http

**Key design philosophy:** "Bring your own agent" — Paperclip doesn't run agents, it orchestrates them. The minimum contract is "be callable." Progressive integration levels from basic (callable) to fully instrumented (status + cost + task updates).

---

## Architecture

### Package Structure

```
server/           Express REST API, services, adapters, middleware
  src/adapters/   Built-in process and http adapters
  src/services/   Core business logic (agents, issues, heartbeat, costs, approvals, etc.)
  src/routes/     HTTP route handlers
  src/middleware/  Auth, validation, error handling, board mutation guard
  src/secrets/    Encrypted secret storage providers
  src/storage/    File/object storage (local disk, S3)
packages/
  db/             Drizzle schema, migrations, client (30+ tables)
  shared/         Shared types, validators, constants, API path helpers
  adapter-utils/  Shared adapter types and server utilities
  adapters/       Per-adapter packages:
    claude-local/   Claude Code CLI adapter (server + UI + CLI)
    codex-local/    Codex CLI adapter
    cursor-local/   Cursor adapter
    opencode-local/ OpenCode adapter
    openclaw-gateway/ OpenClaw SSE/webhook adapter
    pi-local/       Pi adapter
ui/               React + Vite board operator interface
cli/              CLI tool (onboarding, heartbeat run, doctor, worktree, etc.)
skills/           Skill definitions (SKILL.md) injected into agents at runtime
```

### Key Design Decisions

1. **Company-scoped everything.** Every entity (agent, issue, goal, project, cost event, approval) belongs to exactly one company. This is enforced at the schema level with `company_id` FK and checked in every route.

2. **Single-assignee task model.** Issues have exactly one assignee. No shared ownership. Atomic checkout prevents conflicts.

3. **Heartbeat, not continuous.** Agents run in short execution windows (heartbeats), not continuously. This is a protocol, not a runtime — Paperclip triggers the agent, the agent does work and exits.

4. **Tasks as communication.** All agent communication flows through issues + comments. No separate chat system. This creates a natural audit trail.

5. **Board governance.** Human operator has unrestricted access. Approval gates for hires and strategy. Board can pause/resume/terminate any agent at any time.

6. **Adapter abstraction.** Each adapter is a separate npm package with server (execute/test/sessionCodec), UI (config form), and CLI (format events) exports. The registry maps adapter types to modules.

---

## Pattern Catalog

### 1. Heartbeat Scheduling and Execution

#### What They Do

Agents don't run continuously. They wake on a schedule or event, execute a bounded work cycle, and exit. The heartbeat service (`server/src/services/heartbeat.ts`, ~900 lines) manages the full lifecycle:

**Wakeup sources:**
```typescript
interface WakeupOptions {
  source?: "timer" | "assignment" | "on_demand" | "automation";
  triggerDetail?: "manual" | "ping" | "callback" | "system";
  reason?: string | null;
  payload?: Record<string, unknown> | null;
  idempotencyKey?: string | null;
  contextSnapshot?: Record<string, unknown>;
}
```

**Concurrency control:** Per-agent start lock prevents double-invocation:
```typescript
const startLocksByAgent = new Map<string, Promise<void>>();

async function withAgentStartLock<T>(agentId: string, fn: () => Promise<T>) {
  const previous = startLocksByAgent.get(agentId) ?? Promise.resolve();
  const run = previous.then(fn);
  const marker = run.then(() => undefined, () => undefined);
  startLocksByAgent.set(agentId, marker);
  try { return await run; }
  finally { if (startLocksByAgent.get(agentId) === marker) startLocksByAgent.delete(agentId); }
}
```

**Max concurrent runs:** Configurable per-agent (1-10, default 1). Scheduler skips invocation when agent is paused/terminated, a run is active, or budget is hit.

**Wakeup coalescing:** When an agent is already running, new wakeup requests are merged (coalesced) rather than launching duplicate runs. The `agent_wakeup_requests` table tracks pending wakeups with `coalescedCount`.

**Session persistence:** Agents resume previous sessions across heartbeats. Task-scoped sessions (`agent_task_sessions` table) map `(company, agent, adapter, taskKey)` to session params, enabling different sessions per task. The `AdapterSessionCodec` interface handles serialization:
```typescript
interface AdapterSessionCodec {
  deserialize(raw: unknown): Record<string, unknown> | null;
  serialize(params: Record<string, unknown> | null): Record<string, unknown> | null;
  getDisplayId?: (params: Record<string, unknown> | null) => string | null;
}
```

**Context delivery:** Each heartbeat injects environment variables:
```
PAPERCLIP_AGENT_ID, PAPERCLIP_COMPANY_ID, PAPERCLIP_API_URL, PAPERCLIP_RUN_ID
PAPERCLIP_API_KEY (auto-generated JWT for local adapters)
PAPERCLIP_TASK_ID, PAPERCLIP_WAKE_REASON, PAPERCLIP_WAKE_COMMENT_ID
PAPERCLIP_APPROVAL_ID, PAPERCLIP_APPROVAL_STATUS
PAPERCLIP_WORKSPACE_CWD, PAPERCLIP_WORKSPACE_SOURCE
```

**Run lifecycle:** `queued -> running -> succeeded | failed | cancelled | timed_out`. Each run stores `heartbeat_runs` row with exit code, signal, usage JSON, result JSON, session IDs before/after, log references, stdout/stderr excerpts, error codes, and context snapshot.

#### What WavePoint Does

WavePoint uses `scripts/dispatch.sh` which routes by model-tier (high->Opus, medium->Sonnet, low->local/Haiku). Workers are fire-and-forget background processes:
- `scripts/claude-worker.sh` runs `claude --print --worktree` for code tasks
- `scripts/lm-worker.mjs` calls LM Studio API for content/research tasks
- `scripts/dispatch-queue.mjs` handles sequential LM Studio dispatch

No heartbeat scheduling. No session resumption. No wakeup coalescing. No per-agent concurrency limits. Workers run once and complete.

#### Delta

| Aspect | Paperclip | WavePoint |
|--------|-----------|-----------|
| Scheduling | Cron-like timer + event-driven | Manual dispatch only |
| Session resume | Per-task session persistence | No session persistence |
| Concurrency | Per-agent lock + max concurrent | No coordination |
| Wakeup coalescing | Built-in | Not applicable |
| Context injection | Rich env vars (task, reason, approval) | Worktree path only |
| Run tracking | DB row per run with full metadata | NDJSON event log |

#### Recommendation: ADAPT

The heartbeat model is powerful for always-on agent orchestration but over-engineered for Sherpa's current "human dispatches, agent completes" workflow. **Adopt selectively:**

- **Session persistence per task** — Store session IDs in task frontmatter so `claude --resume` works across dispatch cycles. This is high-value, low-effort.
- **Context injection pattern** — Pass structured env vars (TASK_ID, WAKE_REASON) to workers instead of just worktree path. Enables smarter worker behavior.
- **Skip timer scheduling** — WavePoint's human-in-the-loop model doesn't need autonomous scheduling yet.
- **Skip wakeup coalescing** — Only matters at scale with many concurrent agents.

---

### 2. Atomic Task Checkout

#### What They Do

Single-assignee task model with database-enforced atomic checkout. From `SPEC-implementation.md`:

```
POST /issues/:issueId/checkout
{ "agentId": "uuid", "expectedStatuses": ["todo", "backlog", "blocked"] }

Server: single SQL UPDATE with WHERE id = ? AND status IN (?) AND (assignee_agent_id IS NULL OR assignee_agent_id = :agentId)
If updated 0 rows: 409 Conflict with current owner/status
Success: sets assignee_agent_id, status = in_progress, started_at
```

The implementation in `server/src/services/issues.ts` is substantial (~1400 lines). Key behaviors:

- Checkout is idempotent for the same agent (can re-checkout your own task)
- 409 Conflict tells you who has it, preventing silent failures
- `POST /issues/:issueId/release` releases a checked-out task
- Assignment triggers an agent wakeup (`shouldWakeAssigneeOnCheckout`)
- Status side effects: entering `in_progress` sets `startedAt`, `done` sets `completedAt`, `cancelled` sets `cancelledAt`

The SKILL.md drills this into agents: "Always checkout before working. Never retry a 409."

#### What WavePoint Does

YAML frontmatter `status: pending | dispatched | completed | failed | reviewed` in markdown files. No concurrency control. Task assignment is human-directed — the Planner assigns in the task file, then dispatches manually.

#### Delta

Paperclip solves a real concurrency problem (multiple agents racing for the same task) that Sherpa doesn't have because dispatch is sequential and human-controlled. However, the status side effects pattern (auto-setting timestamps on transitions) is valuable.

#### Recommendation: SKIP (for now)

Atomic checkout matters when multiple agents self-select work. Sherpa's Planner assigns work explicitly. If WavePoint moves to autonomous task pickup, this becomes critical. For now, the overhead of a DB-backed checkout system isn't justified. **Adopt the timestamp side-effects pattern** in task frontmatter (auto-set `dispatched-at`, `completed-at` when status changes).

---

### 3. Budget and Cost Tracking

#### What They Do

Token-level cost tracking with hard budget enforcement. Three components:

**Cost event ingestion** (`server/src/services/costs.ts`):
```typescript
createEvent: async (companyId, data) => {
  // Validate agent belongs to company
  // Insert cost_events row
  // Atomically increment agent.spentMonthlyCents
  // Atomically increment company.spentMonthlyCents
  // Check if agent hit budget limit -> auto-pause
  if (updatedAgent.budgetMonthlyCents > 0 &&
      updatedAgent.spentMonthlyCents >= updatedAgent.budgetMonthlyCents &&
      updatedAgent.status !== "paused" && updatedAgent.status !== "terminated") {
    await db.update(agents).set({ status: "paused" }).where(eq(agents.id, updatedAgent.id));
  }
}
```

**Cost events schema** (`packages/db/src/schema/cost_events.ts`):
```typescript
costEvents = pgTable("cost_events", {
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  issueId: uuid("issue_id").references(() => issues.id),
  projectId: uuid("project_id").references(() => projects.id),
  billingCode: text("billing_code"),
  provider: text("provider").notNull(),  // "openai", "anthropic"
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costCents: integer("cost_cents").notNull(),
  occurredAt: timestamp("occurred_at").notNull(),
});
```

**Budget layers:**
- Company monthly budget (`companies.budgetMonthlyCents`)
- Agent monthly budget (`agents.budgetMonthlyCents`)
- Soft alert at 80% (SKILL.md: "Above 80%, focus on critical tasks only")
- Hard limit at 100%: auto-pause agent, block new checkout/invocation

**Cost rollups:** Read-time aggregate queries, not materialized views. Dashboard shows month-to-date spend, budget utilization percent, cost-by-agent, cost-by-project.

**Billing codes:** Tasks carry a `billingCode` field so cross-team cost attribution works. When Agent A requests work from Agent B, B's costs roll up to A's request.

**Billing type distinction:** The Claude adapter distinguishes API billing (`ANTHROPIC_API_KEY` present) vs. subscription billing (local login auth). This affects cost tracking display.

**Usage from heartbeat runs:** The `heartbeat_runs.usageJson` stores per-run token/cost data from adapter results. The costs-by-project view correlates runs to projects via activity log entries.

#### What WavePoint Does

Task frontmatter has `budget-usd` field but no runtime enforcement. No cost event storage. No per-agent tracking. No rollup queries. No auto-pause. The constraint is manual: "No API costs until revenue."

#### Delta

This is the biggest capability gap. Paperclip has a complete cost accounting system:
- Per-event granularity (every LLM call recorded)
- Multi-level rollups (agent, task, project, company)
- Hard enforcement (auto-pause at budget)
- Attribution (billing codes for cross-team work)

Sherpa has a field in YAML and nothing else.

#### Recommendation: ADAPT (phased)

**Phase 1 (immediate, 1 session):** Add cost tracking to `lm-worker.mjs` output. LM Studio API returns token counts — capture them in the NDJSON event log. Add `cost-usd-actual` to task frontmatter on completion.

**Phase 2 (when API costs start):** Add a `cost_events` equivalent — could be a JSON file per task at `docs/tasks/logs/<slug>-costs.json` or a simple DB table. Track provider, model, input/output tokens, cost cents per call.

**Phase 3 (when budget matters):** Add enforcement to dispatch scripts. Before dispatching, check cumulative spend against budget. Skip or warn if over threshold.

The billing code pattern is interesting but premature for a solo operator.

---

### 4. Config Versioning and Rollback

#### What They Do

Every agent configuration change creates an immutable revision record:

```typescript
// packages/db/src/schema/agent_config_revisions.ts
agentConfigRevisions = pgTable("agent_config_revisions", {
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "cascade" }),
  createdByAgentId: uuid("created_by_agent_id").references(() => agents.id),
  createdByUserId: text("created_by_user_id"),
  source: text("source").notNull().default("patch"),  // "patch" | "rollback"
  rolledBackFromRevisionId: uuid("rolled_back_from_revision_id"),
  changedKeys: jsonb("changed_keys").$type<string[]>().notNull(),
  beforeConfig: jsonb("before_config").notNull(),
  afterConfig: jsonb("after_config").notNull(),
});
```

The service (`server/src/services/agents.ts`) automatically detects which config fields changed:

```typescript
const CONFIG_REVISION_FIELDS = [
  "name", "role", "title", "reportsTo", "capabilities",
  "adapterType", "adapterConfig", "runtimeConfig", "budgetMonthlyCents", "metadata",
] as const;

function diffConfigSnapshot(before, after) {
  return CONFIG_REVISION_FIELDS.filter(field => !jsonEqual(before[field], after[field]));
}
```

Rollback is first-class: `rollbackConfigRevision` restores a previous config by re-applying the snapshot from `afterConfig`, while creating a new revision marked as `source: "rollback"` with `rolledBackFromRevisionId`. Secret values are redacted — revisions containing redacted markers cannot be rolled back.

#### What WavePoint Does

Agent role definitions at `docs/agents/roles/<slug>.md` are markdown files tracked in git. Configuration changes go through git commits. No structured diff or rollback mechanism beyond git history.

#### Delta

Paperclip's config versioning is purpose-built for runtime agent tuning — you can see what changed, who changed it, and roll back. WavePoint's git-based approach works but lacks the structured diff, attribution, and instant rollback.

#### Recommendation: SKIP

Git provides adequate version control for Sherpa's current scale. Config revision tracking is valuable when agents are autonomously modifying each other's configurations (Paperclip's CEO can propose hires), which Sherpa doesn't support. If WavePoint adds autonomous agent configuration, revisit this pattern.

---

### 5. Approval Gates and Governance

#### What They Do

Formal approval workflow for governance-gated actions:

```typescript
// Schema
approvals = pgTable("approvals", {
  type: text("type"),  // "hire_agent" | "approve_ceo_strategy"
  status: text("status"),  // "pending" | "approved" | "rejected" | "cancelled" | "revision_requested"
  requestedByAgentId: uuid,
  payload: jsonb("payload").notNull(),
  decidedByUserId: uuid,
  decisionNote: text,
  decidedAt: timestamp,
});
```

**Approval lifecycle:**
1. Agent (or system) creates approval request with payload
2. Board reviews in UI (dedicated `/approvals` page)
3. Board can: approve, reject, or request revision
4. On `revision_requested`, agent can resubmit with updated payload
5. On approval of `hire_agent`, system auto-creates the agent (or activates a `pending_approval` agent)
6. Decision logged in `activity_log`

**Hire approval hook:** When a hire is approved, a `notifyHireApproved` hook fires. The OpenClaw gateway adapter uses this to send a callback to the OpenClaw instance.

**Issue-approval linking:** Approvals can be linked to issues via `issue_approvals` table, so the board sees the context of why an approval was requested.

**Idempotency:** The approval resolution is designed for concurrent safety — if two board sessions approve simultaneously, only one triggers side effects:

```typescript
const updated = await db.update(approvals).set({ status: targetStatus })
  .where(and(eq(approvals.id, id), inArray(approvals.status, resolvableStatuses)))
  .returning().then(rows => rows[0] ?? null);
if (updated) return { approval: updated, applied: true };
// Re-fetch to check if already resolved
const latest = await getExistingApproval(id);
if (latest.status === targetStatus) return { approval: latest, applied: false };
```

#### What WavePoint Does

Initiative proposal system at `docs/initiatives/` with YAML frontmatter status (`pending | approved | in-progress | integrated | declined`). Human reviews and changes status. No runtime enforcement — agents don't need approval to act.

#### Delta

Paperclip's approval system is runtime-enforced (agents literally cannot be created without board approval). WavePoint's system is convention-enforced (proposals exist but nothing blocks an agent from editing shared files). The formal `revision_requested` → `resubmit` cycle is a nice pattern for iterative refinement.

#### Recommendation: ADAPT (lightweight)

WavePoint's initiative proposal system already captures the governance intent. What's missing is **linking approvals to automated actions**. When a Studio initiative is approved, the post-approval automation could be more structured:

- Record who approved, when, and with what note (currently happens informally)
- The `revision_requested` status is useful — add it to initiative frontmatter options
- Skip the runtime enforcement — WavePoint's human-in-the-loop model doesn't need it

---

### 6. Activity Log and Audit Trail

#### What They Do

Every mutating action writes to `activity_log`:

```typescript
// server/src/services/activity-log.ts
export async function logActivity(db: Db, input: LogActivityInput) {
  const sanitizedDetails = input.details ? sanitizeRecord(input.details) : null;
  await db.insert(activityLog).values({
    companyId: input.companyId,
    actorType: input.actorType,   // "agent" | "user" | "system"
    actorId: input.actorId,
    action: input.action,         // "issue.created", "agent.paused", etc.
    entityType: input.entityType, // "issue", "agent", "approval"
    entityId: input.entityId,
    agentId: input.agentId ?? null,
    runId: input.runId ?? null,    // Links action to specific heartbeat run
    details: sanitizedDetails,
  });
  publishLiveEvent({ companyId, type: "activity.logged", payload: { ... } });
}
```

Key behaviors:
- **Automatic redaction:** The `sanitizeRecord` function redacts secrets (API keys, tokens, passwords, JWTs) from activity details before storage
- **Run attribution:** The `runId` field connects activity entries to specific heartbeat runs, enabling "what did this run do?" queries
- **Live events:** Every activity log entry also publishes a `LiveEvent` for real-time UI updates via WebSocket
- **Immutable:** Activity log is append-only. No updates or deletes.

The `activity_log` schema includes indexes on `(company_id, created_at desc)`, `(run_id)`, and `(entity_type, entity_id)` for efficient queries.

#### What WavePoint Does

NDJSON event logs at `docs/tasks/logs/<slug>-events.ndjson`. Append-only, per-task. No structured schema, no indexes, no real-time events, no automatic redaction. Events are written by worker scripts with arbitrary payloads.

#### Delta

Paperclip's activity log is a proper audit system: structured, indexed, redacted, queryable, and real-time. WavePoint's NDJSON files are functional but lack structure, cross-task querying, and redaction.

#### Recommendation: ADAPT

- **Structured event schema** — Define a standard shape for NDJSON events: `{ ts, actor, action, entity_type, entity_id, details }`. This is low-effort and enables future tooling.
- **Automatic redaction** — Paperclip's regex-based secret detection is simple and effective. Apply similar filtering before writing events.
- **Skip live events** — Sherpa doesn't have a persistent server process. Studio MCP server could eventually provide this.
- **Skip DB storage** — File-based NDJSON is fine at current scale.

---

### 7. Adapter System ("Bring Your Own Agent")

#### What They Do

Each adapter is a separate npm package with a standardized interface:

```typescript
// packages/adapter-utils/src/types.ts
interface ServerAdapterModule {
  type: string;
  execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
  testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult>;
  sessionCodec?: AdapterSessionCodec;
  supportsLocalAgentJwt?: boolean;
  models?: AdapterModel[];
  listModels?: () => Promise<AdapterModel[]>;
  agentConfigurationDoc?: string;
  onHireApproved?: (payload, adapterConfig) => Promise<HireApprovedHookResult>;
}
```

**Execution context** passed to adapters:
```typescript
interface AdapterExecutionContext {
  runId: string;
  agent: AdapterAgent;
  runtime: AdapterRuntime;        // session state
  config: Record<string, unknown>; // adapter-specific config
  context: Record<string, unknown>; // wake context (task, reason, etc.)
  onLog: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
  onMeta?: (meta: AdapterInvocationMeta) => Promise<void>;
  authToken?: string;
}
```

**Execution result** returned by adapters:
```typescript
interface AdapterExecutionResult {
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  errorMessage?: string | null;
  errorCode?: string | null;
  usage?: UsageSummary;          // input/output tokens
  sessionId?: string | null;
  sessionParams?: Record<string, unknown>;
  provider?: string | null;
  model?: string | null;
  billingType?: "api" | "subscription" | "unknown";
  costUsd?: number | null;
  summary?: string | null;
  clearSession?: boolean;
}
```

**Each adapter package exports three modules:**
- `server/` — `execute()`, `testEnvironment()`, `sessionCodec`
- `ui/` — `buildConfig()`, React config form component, `parseStdout()` for transcript parsing
- `cli/` — `formatStdoutEvent()` for terminal display

**The Claude local adapter** (`packages/adapters/claude-local/src/server/execute.ts`) is the most sophisticated:
- Resolves workspace from project/task/agent hierarchy
- Builds Claude CLI args (`--print`, `--resume`, `--model`, `--max-turns`, etc.)
- Injects Paperclip skills via `--add-dir` (creates temp dir with skill symlinks)
- Handles session resume with fallback (if session is unavailable, starts fresh)
- Parses Claude stream-JSON output for usage/cost/session extraction
- Detects login-required errors and surfaces login URL

**Adapter registry** (`server/src/adapters/registry.ts`):
```typescript
const adaptersByType = new Map<string, ServerAdapterModule>([
  claudeLocalAdapter, codexLocalAdapter, openCodeLocalAdapter,
  piLocalAdapter, cursorLocalAdapter, openclawGatewayAdapter,
  processAdapter, httpAdapter,
].map(a => [a.type, a]));
```

**Environment testing:** Each adapter implements `testEnvironment()` that validates the host can run that adapter (CLI installed, authenticated, working directory accessible, etc.). Results show in the UI before you commit to a config.

#### What WavePoint Does

`scripts/dispatch.sh` routes by model-tier to either `claude-worker.sh` or `lm-worker.mjs`. No adapter abstraction — the scripts hardcode the invocation patterns. No environment testing. No session codec. No skill injection.

#### Delta

Paperclip's adapter system is a proper plugin architecture. Each adapter is independently packaged, tested, and configurable. Sherpa has two hardcoded dispatch paths.

#### Recommendation: ADAPT (concept, not implementation)

The full adapter package system is over-engineered for Sherpa's two backends. But the concepts are valuable:

- **Standardize worker output** — Define a result interface similar to `AdapterExecutionResult` for both `claude-worker.sh` and `lm-worker.mjs`. Both should report: exit code, token usage, cost, session ID, error details.
- **Environment testing** — Add a `--test` flag to dispatch scripts that validates the backend is available before running.
- **Skill injection** — Paperclip's pattern of symlinking skills into a temp dir and passing `--add-dir` to Claude is clever. Sherpa could do the same with `.claude/skills/` directories for workers.
- **Skip the full adapter registry** — Two backends don't need a plugin system.

---

### 8. Org Chart and Hierarchical Reporting

#### What They Do

Strict tree-based org structure:

```typescript
// agents table
reportsTo: uuid("reports_to").references(() => agents.id),
```

**Cycle detection:** Before setting `reportsTo`, the service walks the chain to prevent cycles:
```typescript
async function assertNoCycle(agentId: string, reportsTo: string | null) {
  if (!reportsTo) return;
  if (reportsTo === agentId) throw unprocessable("Agent cannot report to itself");
  let cursor = reportsTo;
  while (cursor) {
    if (cursor === agentId) throw unprocessable("Reporting relationship would create cycle");
    const next = await getById(cursor);
    cursor = next?.reportsTo ?? null;
  }
}
```

**Chain of command:** `getChainOfCommand(agentId)` returns the full management chain upward. This is injected into agent context so they know their escalation path.

**Org tree rendering:** `orgForCompany()` builds a nested tree structure for the UI org chart view.

**Cross-team work:** Tasks carry `request_depth` (how many delegation hops from the original requester) and `billing_code` for cost attribution across teams.

#### What WavePoint Does

14 agent roles at `docs/agents/roles/` with YAML frontmatter defining `model-tier`, `context-packages`, `permissions`. No reporting hierarchy. Dispatch routes by role, not org position.

#### Delta

Paperclip models real corporate hierarchy. WavePoint models capability roles. The `chainOfCommand` pattern (knowing your escalation path) is interesting, but the full org chart is designed for multi-agent autonomous companies with hundreds of agents — far beyond WavePoint's current scope.

#### Recommendation: SKIP

WavePoint operates with 1 human + a handful of agent sessions. Org charts, cross-team billing codes, and request depth tracking are multi-team-scale features. If WavePoint grows to need autonomous delegation chains, this pattern becomes relevant.

---

### 9. Dashboard UX and Real-Time Updates

#### What They Do

**Dashboard summary endpoint** (`server/src/services/dashboard.ts`):
```typescript
return {
  agents: { active, running, paused, error },
  tasks: { open, inProgress, blocked, done },
  costs: { monthSpendCents, monthBudgetCents, monthUtilizationPercent },
  pendingApprovals,
  staleTasks,  // in_progress for >1 hour with no activity
};
```

**Stale task detection:** Tasks `in_progress` for over 60 minutes are flagged as stale. This surfaces stuck agents without auto-remediation.

**Live events system** (`server/src/services/live-events.ts`):
```typescript
const emitter = new EventEmitter();
emitter.setMaxListeners(0);

export function publishLiveEvent(input: { companyId, type, payload }) {
  const event = { id: nextEventId++, companyId, type, createdAt: new Date().toISOString(), payload };
  emitter.emit(input.companyId, event);
}

export function subscribeCompanyLiveEvents(companyId, listener) {
  emitter.on(companyId, listener);
  return () => emitter.off(companyId, listener);
}
```

**WebSocket transport** (`server/src/realtime/live-events-ws.ts`) pushes events to the browser. The UI auto-reconnects on drop.

**LiveRunWidget** (`ui/src/components/LiveRunWidget.tsx`): Shows real-time transcript of running agents on issue detail pages. Polls run logs, parses adapter-specific transcript entries (assistant text, tool calls, tool results, thinking, errors), and streams them into a feed. Entries are truncated to prevent memory issues (80 items max, 220 chars per item, 4KB for streaming text).

**Costs page** (`ui/src/pages/Costs.tsx`): Date-range selector (MTD, 7d, 30d, YTD, All, Custom). Shows cost summary, cost-by-agent, cost-by-project. Each agent row includes API run count, subscription run count, and separate token tallies.

**Activity page** with per-event animation on arrival (new events slide in).

**Key UI patterns:**
- Company selector (rail + switcher) scopes all views
- Quick actions available everywhere (pause/resume agent, create task, approve/reject)
- Conflict toasts on checkout failure
- Empty states with calls-to-action
- Skeleton loading states per page type
- Command palette with keyboard shortcuts

#### What WavePoint Does

Studio MCP dashboard with initiative visualization, workforce browser, pending morning review MVP. File-tree navigation for research reports. No real-time updates. No cost visualization. No stale task detection. No live agent transcript.

#### Delta

Paperclip's dashboard is purpose-built for agent monitoring: "what's running, what's stuck, what's it costing." WavePoint's Studio is built for initiative/governance visualization.

#### Recommendation: ADAPT (selectively)

**High-value patterns for Studio morning review:**
- **Stale task detection** — Flag tasks `dispatched` for over N hours with no completion. This is trivial to implement in the task scanner.
- **Summary endpoint shape** — The `{ agents, tasks, costs, pendingApprovals, staleTasks }` structure is a good template for a `/morning` summary.
- **Cost-by-agent view** — When cost tracking exists, show per-agent spend in Studio.

**Skip for now:**
- Live transcript (requires persistent server)
- Real-time events (requires WebSocket infrastructure)
- Company selector (single-company operation)

---

### 10. Skill System (Runtime Agent Instruction Injection)

#### What They Do

Skills are directories containing `SKILL.md` files that teach agents how to interact with Paperclip. Located at `skills/`:

```
skills/
  paperclip/           Main coordination skill
    SKILL.md           Core heartbeat procedure
    references/
      api-reference.md Full API docs
  paperclip-create-agent/  Hiring workflow skill
    SKILL.md
    references/
      api-reference.md
  create-agent-adapter/    Adapter development skill
  para-memory-files/       PARA method memory organization
  pr-report/              PR report generation
  release-changelog/       Release changelog
  release/                 Release process
```

**Injection mechanism:** The Claude adapter creates a temp directory with `.claude/skills/` containing symlinks to skill directories:
```typescript
async function buildSkillsDir(): Promise<string> {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "paperclip-skills-"));
  const target = path.join(tmp, ".claude", "skills");
  await fs.mkdir(target, { recursive: true });
  const skillsDir = await resolvePaperclipSkillsDir();
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await fs.symlink(path.join(skillsDir, entry.name), path.join(target, entry.name));
    }
  }
  return tmp;
}
```

Then passed via `claude --add-dir <skillsDir>`, which makes Claude Code discover and register the skills.

**The Paperclip SKILL.md** is the most important. It defines a 9-step heartbeat procedure that every agent follows:
1. Identity check (`GET /api/agents/me`)
2. Approval follow-up (if triggered)
3. Get assignments (filtered by agent ID and active statuses)
4. Pick work (with mention exception and blocked-task dedup)
5. Checkout (atomic, with 409 handling)
6. Understand context (read issue + comments + ancestors)
7. Do the work
8. Update status and communicate (always comment before exiting)
9. Delegate if needed (create subtasks with parentId and goalId)

This is an opinionated agent behavior protocol encoded as a skill file. It includes rules like "never retry a 409," "never look for unassigned work," "blocked-task dedup" (don't re-comment on blocked tasks without new context), and comment formatting standards.

#### What WavePoint Does

`.agents/skills/` with `SKILL.md` + `rules/` per skill. Skills are loaded into Claude Code sessions via the `.claude/skills/` convention. The main skills are `integration-review`, `rr` (recursive research), and operational skills like `plan-tasks` and `morning`.

#### Delta

Paperclip and WavePoint both use Claude's skill injection, but for different purposes:
- Paperclip skills teach agents how to coordinate via the Paperclip API
- WavePoint skills teach agents how to follow WavePoint's governance and research protocols

Paperclip's skill injection from temp symlinked directories is a clever pattern for ensuring agents always have the latest skills regardless of their working directory.

#### Recommendation: ADOPT (the injection pattern)

Sherpa could use the symlink-to-tempdir pattern for worker sessions that need skills but operate in isolated worktrees. Currently, worktree-based workers might not have access to the full `.claude/skills/` tree. The temp dir approach ensures skills are always available.

The heartbeat procedure is not directly applicable — WavePoint agents don't run in heartbeat loops. But the structured "procedure" pattern (numbered steps with clear rules) is worth studying for Sherpa's own SKILL.md files.

---

### 11. Secret Management

#### What They Do

Two-tier secret storage:

**Company secrets table:**
```typescript
company_secrets: { id, company_id, name, provider, metadata }
company_secret_versions: { id, secret_id, version, encrypted_value, provider_ref }
```

**Local encrypted provider:** Secrets encrypted at rest with AES-256-GCM using a local master key stored at `~/.paperclip/instances/default/secrets/master.key`. Auto-created if missing.

**Strict mode:** `PAPERCLIP_SECRETS_STRICT_MODE=true` blocks new inline sensitive env values in adapter configs.

**Migration tool:** `pnpm secrets:migrate-inline-env --apply` migrates plaintext secrets from adapter configs to encrypted storage.

**Redaction everywhere:**
```typescript
// server/src/redaction.ts
const SECRET_PAYLOAD_KEY_RE =
  /(api[-_]?key|access[-_]?token|auth|bearer|secret|passwd|password|credential|jwt|private[-_]?key|cookie|connectionstring)/i;
const JWT_VALUE_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function sanitizeRecord(record) {
  for (const [key, value] of Object.entries(record)) {
    if (SECRET_PAYLOAD_KEY_RE.test(key)) redacted[key] = "***REDACTED***";
    if (typeof value === "string" && JWT_VALUE_RE.test(value)) redacted[key] = "***REDACTED***";
    // ... recurse into objects/arrays
  }
}
```

This redaction is applied to: activity log details, config revision snapshots, adapter env logs, and export packages.

#### What WavePoint Does

`.env.local` for secrets. Gitignored. No encrypted storage. No redaction in event logs.

#### Delta

Paperclip handles secrets more carefully because agents access secrets at runtime and activity logs persist sensitive data. WavePoint's secrets are only used by the web app at build/runtime, not by agents.

#### Recommendation: ADAPT (redaction only)

The regex-based redaction pattern is worth adopting for Sherpa's NDJSON event logs. If task events ever contain adapter configuration or environment details, they should be sanitized first. The full encrypted secret storage is overkill for Sherpa's current model.

---

### 12. Company Portability (Export/Import)

#### What They Do

Full company configurations can be exported and imported as portable packages:

```typescript
// Export
CompanyPortabilityExport = {
  include: { company: true, agents: true },
  format: "template" | "snapshot"
}

// Import
CompanyPortabilityImport = {
  targetMode: "new_company" | "existing_company",
  collisionStrategy: "rename" | "skip" | "replace",
  preview: true  // dry-run
}
```

**Export format:** `paperclip.manifest.json` + agent markdown files (`agents/<slug>/AGENTS.md`, optional `HEARTBEAT.md`).

**Secret scrubbing:** Exports never include secret values. Sensitive env keys are detected and replaced with placeholders.

**Collision handling:** On import, agent name collisions are resolved by strategy: rename (append number), skip, or replace.

**Runtime defaults injection:** Import auto-applies sensible runtime defaults (heartbeat intervals, timeouts) per adapter type.

#### What WavePoint Does

Nothing equivalent. Agent roles are markdown files in git, not importable/exportable packages.

#### Recommendation: SKIP

Company portability is a marketplace feature ("ClipMart — buy and sell entire agent companies"). Sherpa is a single-operator system with no need for org templating.

---

### 13. Execution Workspace Management

#### What They Do

Sophisticated workspace resolution for where agents execute code:

```typescript
type ResolvedWorkspaceForRun = {
  cwd: string;
  source: "project_primary" | "task_session" | "agent_home";
  projectId: string | null;
  workspaceId: string | null;
  repoUrl: string | null;
  repoRef: string | null;
  workspaceHints: Array<{ workspaceId, cwd, repoUrl, repoRef }>;
  warnings: string[];
};
```

**Resolution hierarchy:**
1. Project workspace (`project_workspaces` table with `cwd`, `repoUrl`, `repoRef`)
2. Task session workspace (from previous run's saved params)
3. Agent home directory (fallback: `~/.paperclip/instances/default/data/workspaces/<agent-id>`)

**Execution workspace policies** (per-project):
- `project_primary`: all agents work in the project's main directory
- `isolated`: each task gets its own workspace (git worktree strategy)

**Git worktree integration:** The `isolated` mode supports `git_worktree` strategy with `baseRef`, `branchTemplate`, `worktreeParentDir`, `provisionCommand`, and `teardownCommand`.

**Workspace migration:** If an agent's session was saved in a fallback workspace but a project workspace becomes available, the system auto-migrates (with warning).

#### What WavePoint Does

WavePoint's worktree conventions (`.claude/rules/worktree-conventions.md`) handle workspace isolation at the git level. Workers operate in `.worktrees/<name>/` directories. No project-workspace database. No automatic resolution hierarchy.

#### Delta

Paperclip's workspace management is DB-backed and runtime-resolved. WavePoint's is convention-based and human-managed. The key insight is the **resolution hierarchy** — project > session > fallback — which ensures agents always have a valid workspace.

#### Recommendation: SKIP (already solved differently)

WavePoint's worktree conventions solve the same problem with a lighter approach. The DB-backed project-workspace table is useful for multi-team scenarios where workspaces need to be shared and discovered, but WavePoint's single-operator model doesn't need this.

---

### 14. Testing Patterns

#### What They Do

~35 unit tests in `server/src/__tests__/`:
- Adapter model/environment tests (`claude-local-adapter.test.ts`, `codex-local-adapter.test.ts`, etc.)
- Auth and permission tests (`agent-auth-jwt.test.ts`, `board-mutation-guard.test.ts`)
- Service logic tests (`approvals-service.test.ts`, `hire-hook.test.ts`)
- Route guard tests (`companies-route-path-guard.test.ts`, `private-hostname-guard.test.ts`)
- Checkout wakeup logic tests (`issues-checkout-wakeup.test.ts`)

**Testing approach:** Tests use Vitest with mocked DB stubs. The approval service test demonstrates concurrent safety testing:
```typescript
it("treats repeated approve retries as no-ops after another worker resolves", async () => {
  const dbStub = createDbStub(
    [[createApproval("pending")], [createApproval("approved")]],
    [],  // update returns 0 rows (lost race)
  );
  const svc = approvalService(dbStub.db as any);
  const result = await svc.approve("approval-1", "board", "ship it");
  expect(result.applied).toBe(false);
  expect(mockAgentService.activatePendingApproval).not.toHaveBeenCalled();
});
```

1 Playwright e2e test (`tests/e2e/onboarding.spec.ts`).

~10 CLI tests (`cli/src/__tests__/`) covering context resolution, home paths, worktree management.

Additional adapter-level tests in packages (`opencode-local`, `pi-local`).

#### What WavePoint Does

Web app tests (`pnpm test`). No agent orchestration tests. No dispatch/worker tests. No pipeline integration tests.

#### Delta

Paperclip tests the orchestration layer specifically: concurrent checkout, approval idempotency, adapter environment checks. WavePoint tests the web application but not the agent pipeline.

#### Recommendation: ADOPT (orchestration tests)

Add tests for:
- Task scanner correctness (`scripts/task-scanner.mjs`)
- Dispatch queue behavior (`scripts/dispatch-queue.mjs`)
- NDJSON event log parsing
- Task frontmatter validation

These are low-effort, high-value regression guards for the pipeline.

---

### 15. Multi-Company Data Isolation

#### What They Do

Every entity is company-scoped. Routes enforce company boundaries:
```typescript
// From AGENTS.md (their equivalent of CLAUDE.md)
// Rule 1: Keep changes company-scoped.
// Every domain entity should be scoped to a company and company
// boundaries must be enforced in routes/services.
```

Agent API keys are scoped to one agent and one company. An agent key cannot access other companies' data.

The UI has a company selector rail that switches all views.

#### What WavePoint Does

Single-tenant. No multi-company concept.

#### Recommendation: SKIP

Multi-company isolation is for operators running multiple autonomous businesses. Sherpa is one company. If WavePoint ever offered Paperclip-as-a-service, this matters. For now, it's unnecessary complexity.

---

## Strengths (What Paperclip Does Better or WavePoint Hasn't Considered)

1. **Cost enforcement is real, not aspirational.** Auto-pause at budget limit with atomic increment. Sherpa has a field in YAML that nothing reads.

2. **Session persistence across runs.** Per-task session storage enables Claude `--resume` across heartbeats. Sherpa workers start fresh every time, losing context.

3. **Structured activity log with automatic redaction.** Every mutation is logged with actor attribution, run correlation, and secret scrubbing. WavePoint's NDJSON events lack structure and redaction.

4. **Config rollback with diff tracking.** You can see exactly what changed in an agent's configuration and revert it. Git provides this conceptually but not as a first-class runtime feature.

5. **Stale task detection.** Simple but effective: tasks `in_progress` for >1 hour are flagged. Sherpa has no equivalent.

6. **Adapter environment testing.** Before committing to an agent configuration, you can validate the host environment can run that adapter. WavePoint dispatches and hopes for the best.

7. **Skill injection via temp symlinked directories.** Ensures agents in any working directory always have access to coordination skills. Solves the "skill not available in worktree" problem.

8. **Run-to-activity correlation.** Every activity log entry can be linked to the specific heartbeat run that caused it via `runId`. This enables "what did this agent session do?" queries. WavePoint's per-task NDJSON has no cross-task correlation.

---

## Over-Engineering (Built for Multi-Team Scale a Solo Operator Doesn't Need)

1. **Multi-company isolation.** Every query scoped by `company_id`. Unnecessary overhead for single-operator.

2. **Org charts and reporting hierarchies.** CEO -> CTO -> Engineers structure with cycle detection. A solo developer with a few agent sessions doesn't need corporate hierarchy.

3. **Cross-team billing codes.** Cost attribution when Agent A requests work from Agent B. Solves a coordination problem that doesn't exist at WavePoint's scale.

4. **Request depth tracking.** How many delegation hops from the original requester. Multi-team coordination metric.

5. **Company portability/templates.** Export/import entire company configurations. Marketplace feature ("ClipMart").

6. **Approval flow for hiring.** Formal governance for creating new agents. When you're the only human, you don't need to approve your own decisions.

7. **Agent permissions model.** `canCreateAgents`, `chainOfCommand` escalation. Complexity for autonomous agent-to-agent governance.

8. **Full adapter plugin architecture.** 7 adapter packages with server/ui/cli exports each. Sherpa has 2 backends and doesn't need a plugin system.

---

## Gaps (What's Missing from Paperclip)

1. **No filesystem-based fallback.** Everything requires PostgreSQL. WavePoint's file-based approach (YAML frontmatter + NDJSON) works without any infrastructure.

2. **No local LLM support.** All adapters target cloud-hosted models (Claude, Codex, Cursor). No equivalent of WavePoint's `lm-worker.mjs` for free local inference via LM Studio.

3. **No initiative/proposal governance.** Paperclip has approval gates for agent hiring, but no system for proposing and reviewing strategic changes. WavePoint's initiative system (proposal -> plan -> implementation) is more thoughtful for governance of *what* to build, not just *who* to hire.

4. **No judge role.** Paperclip's quality assurance is the board reviewing agent output. WavePoint's formal Judge role (`docs/agents/roles/judge.md`) with three modes (in-session, automated, local) is a more structured approach to output quality.

5. **No cost-free operating mode.** Paperclip assumes API costs are inherent. WavePoint's "no API costs until revenue" constraint drives creative solutions (local models, `--print` mode). Paperclip doesn't optimize for zero-cost operation.

6. **No content/research pipeline.** Paperclip is focused on code execution. WavePoint's content generation pipeline (transit content, research reports) shows a broader use of agent capabilities.

7. **No morning review pattern.** No equivalent of WavePoint's `/morning` skill for reviewing overnight work. The dashboard surfaces data but doesn't structure a review workflow.

---

## Key Takeaways (Ranked by Impact for Sherpa)

### Tier 1: Adopt Now (1-2 sessions each)

1. **Session persistence per task.** Store `claude --resume` session IDs in task frontmatter or a sidecar file. This eliminates the biggest waste: agents re-reading codebase context on every dispatch. Paperclip's `agent_task_sessions` table maps `(agent, adapter, taskKey) -> sessionParams`. WavePoint equivalent: add `session-id` to task frontmatter, pass `--resume <id>` in `claude-worker.sh`.

2. **Structured event schema for NDJSON.** Standardize on `{ ts, actor, action, entity_type, entity_id, run_id, details }`. Add automatic redaction of secrets in details payloads. This enables future tooling without changing the file-based approach.

3. **Stale task detection.** Add to `task-scanner.mjs`: flag tasks `dispatched` for >N hours without completion events. Surface in `/morning` review. Trivial to implement.

### Tier 2: Adapt for Next Phase (when API costs start)

4. **Cost event capture from workers.** Both `claude-worker.sh` and `lm-worker.mjs` should report token counts and cost in their completion events. Claude's `--output-format stream-json` provides this. LM Studio API returns it. Store as structured events.

5. **Budget enforcement in dispatch.** Before dispatching, check cumulative spend against `budget-usd` in task frontmatter. Warn or block if over threshold. Simple guard in `dispatch.sh`.

6. **Worker output standardization.** Define a shared result interface for all workers: `{ exitCode, tokens: { input, output }, costUsd, sessionId, model, provider, error }`. Write to task frontmatter on completion.

### Tier 3: Study for Architecture Decisions

7. **Adapter environment testing pattern.** Before dispatching to a backend, validate it's available. `--test` flag for dispatch scripts.

8. **Skill injection via temp directories.** For worktree-based workers that lack `.claude/skills/`, create temp dir with symlinks and pass `--add-dir`. Solves the "skills not available in isolated worktree" problem.

9. **Run-to-activity correlation.** When the event log matures, add a `run-id` field to correlate events across tasks. Enables "what did dispatch X produce?" queries.

### Not Applicable

10. Multi-company isolation, org charts, cross-team billing, company portability — these solve problems Sherpa doesn't have and won't have until a platform scale that's years away.
