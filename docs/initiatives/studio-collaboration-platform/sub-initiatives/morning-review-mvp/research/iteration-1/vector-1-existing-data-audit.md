# Vector 1: Existing Data Audit

**Question:** What data is already available in `docs/tasks/`, `docs/sessions/`, `docs/workstreams/` that a morning review page could surface?
**Agent dispatched:** 2026-03-09

## Findings

### Task Files (`docs/tasks/*.md`)

**Frontmatter Fields (14 fields, parsed by `getTaskBoard()` in `tasks.ts`):**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Task slug |
| `status` | enum | `pending \| dispatched \| completed \| failed \| reviewed` |
| `role` | string | `engineer \| research-lead \| technical-writer \| code-reviewer \| designer` |
| `priority` | enum | `low \| medium \| high \| urgent` |
| `initiative` | string \| null | Links to parent initiative |
| `backend` | string | `claude \| lm-studio` |
| `model` | string | e.g., `claude-sonnet-4-6`, `qwen-3.5-9b` |
| `budget-usd` | string | Max cost (default `1.00`) |
| `worktree` | string \| null | Set by dispatcher |
| `branch` | string \| null | Git branch name |
| `created` | ISO timestamp | Task creation time |
| `dispatched-at` | ISO timestamp \| null | When worker received task |
| `completed-at` | ISO timestamp \| null | When worker finished |
| `session-id` | UUID \| null | Session that dispatched/judged |
| `judge-verdict` | enum | `pending \| approved \| needs-changes \| rejected` |

**Body Sections:** H1 title, ## Objective, ## Context, ## Acceptance Criteria, ## Constraints, ## Deliverables

**Auxiliary Files (checked in `docs/tasks/logs/`):**
- `<task-id>-report.md` / `<task-id>-output.md` — worker output
- `<task-id>-verdict.md` — judge verdict
- `<task-id>-blockers.md` — unmet dependencies

**Current volume:** 1 task file (`cosmic-activity-research.md`), logs directory empty.

**`getTaskBoard()` return type:**
```typescript
interface TaskBoardEntry {
  id, file, status, role, priority, initiative, backend, model,
  budgetUsd, worktree, branch, created, dispatchedAt, completedAt,
  judgeVerdict, title: string;
  hasReport, hasVerdict, hasBlockers: boolean;
}
```

### Session Files (`docs/sessions/*.json`)

**Schema (16 fields, 29 files spanning Mar 7–10):**

| Field | Type | Notes |
|-------|------|-------|
| `$schema` | literal | `"wavepoint/session@1"` |
| `sessionId` | UUID | Unique identifier |
| `startedAt` | ISO timestamp | Session start (UTC) |
| `endedAt` | ISO timestamp \| null | Session end or null if in-progress |
| `durationMinutes` | number \| null | Computed duration |
| `model` | string | e.g., `claude-opus-4-6` |
| `branch` | string | Git branch at session start |
| `initiative` | string \| null | Derived from branch pattern |
| `role` | string \| null | From `WAVEPOINT_ROLE` env var |
| `tokens.input` | number | Input tokens consumed |
| `tokens.output` | number | Output tokens generated |
| `tokens.cacheRead` | number | Cache hit tokens |
| `tokens.cacheCreation` | number | Cache creation tokens |
| `filesModified` | string[] | Files edited (Edit/Write tools) |
| `toolsUsed` | string[] | Tool names (sorted) |
| `commits` | string[] | Commit hashes |
| `outcome` | enum | `completed \| interrupted \| in-progress` |
| `summary` | string \| null | Optional session summary |

**Query functions:** `getSessions()`, `computeSessionStats()` (total, thisWeek, totalTokens, weeklyTokens)

### Workstream Files (`docs/workstreams/*.md`)

**Frontmatter (6 fields, 24 files):**

| Field | Type | Notes |
|-------|------|-------|
| `status` | enum | `active \| paused \| completed` |
| `started` | date string | YYYY-MM-DD |
| `worktree` | string \| null | Worktree path if isolated |
| `focus` | string | 1-sentence focus statement |
| `initiative` | string | Parent initiative slug |
| `roles` | object[] | Optional role assignments |

**Body:** `## Activity Log` with dated entries parsed by `parseActivityLog()` → `ActivityEntry[]`

**Query functions:** `getWorkstreams()`, `getActivityByDate()`

### Initiative Data

**Frontmatter (10 fields, 20+ initiatives):** status, initiative, created, updated, type, risk, targets, dependencies, spawned-from

**Query functions:** `getInitiatives()`, `getUnifiedProcessData()`, `detectLifecycle()`, `getAllVelocity()`

## Data Availability Matrix

| Morning Review Need | Data Source | Available Today? | Gaps |
|-------------------|------------|-----------------|------|
| Overnight task completions | `getTaskBoard()` + filter by completedAt | Yes (if tasks exist) | Only 1 task, none dispatched |
| Session recap | `getSessions()` + filter by startedAt | Yes (29 manifests) | Some have zero tokens |
| Active workstream status | `getWorkstreams()` | Yes (18 active) | No progress percentage |
| Initiative attention queue | `getInitiatives()` + `detectLifecycle()` | Yes (built in hub) | — |
| Worker output preview | `docs/tasks/logs/` filesystem read | No (logs dir empty) | Needs worker runs |
| Judge verdicts | `TaskBoardEntry.hasVerdict` | No (no verdicts yet) | Needs auto-judge runs |
| Cost tracking | Session tokens exist | Partial (tokens yes, USD no) | No rate table |
| Session-to-task linking | `session.initiative` ↔ `task.initiative` | One-way only | Tasks don't reference sessions |
| Worker performance metrics | — | No | Needs historical data |

## Open Questions

- Should `getTaskBoard()` be extended with `readTaskLog()` to surface log content?
- Should session manifests include a `taskId` field for direct session→task linking?
- What's the token→USD rate table? (Opus input: $15/1M, output: $75/1M, etc.)
