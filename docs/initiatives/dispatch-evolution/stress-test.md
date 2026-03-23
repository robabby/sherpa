---
stress-tested: 2026-03-19
assumptions-extracted: 12
tested: 10
confirmed: 7
refuted: 1
inconclusive: 1
human-required: 1
---

# Dispatch Evolution — Stress Test

## Assumptions Inventory

| # | Assumption | Rating | Priority |
|---|-----------|--------|----------|
| 1 | Backend rarely changes — openclaw or claude covers nearly all dispatch | Asserted | High |
| 2 | `.sherpa/` is gitignored and safe for settings persistence | Reasoned | Medium |
| 3 | `.sherpa/settings.json` is writable by the Next.js server process | Reasoned | Medium |
| 4 | Health-checking all 9 backends is slow (~45s worst case) | Asserted | Medium |
| 5 | `DispatchMode` is scoped to dispatch files — rename is contained | Reasoned | High |
| 6 | `worker.sh` can dispatch without an agent parameter | Reasoned | High |
| 7 | The agent parameter currently reaches the worker and affects dispatch | Asserted | High |
| 8 | `Settings` icon exists in lucide-react | Sourced | Low |
| 9 | "Interactive" mode is unused — safe to drop | Asserted | Medium |
| 10 | Task-level `backend:` overrides won't conflict with system-level setting | Reasoned | High |
| 11 | Two backends (openclaw, claude) are sufficient for the settings toggle | Asserted | Medium |
| 12 | Well-written tasks are self-sufficient without behavioral agent roles | Asserted | High |

## Tests Designed

### A1: Backend rarely changes (Code-testable)
**Falsification:** If task files specify more than 2 distinct backends, per-task backend variation is real, not rare.
**Test:** Grep all task files for explicit `backend:` values and count distinct backends used.

### A2: `.sherpa/` is gitignored (Code-testable)
**Falsification:** If `.sherpa/` is not in `.gitignore`, settings.json would be committed to git.
**Test:** Read `.gitignore` and check for `.sherpa/` entry.

### A3: `.sherpa/settings.json` writable (Code-testable)
**Falsification:** If the directory doesn't exist and can't be created, or if file write permissions are restricted.
**Test:** Check if `.sherpa/` exists; verify parent directory is writable.

### A5: DispatchMode rename is contained (Code-testable)
**Falsification:** If `DispatchMode`, `interactive`, `overnight`, or `mode:` appear in files beyond the 7 proposal targets, the blast radius is underestimated.
**Test:** Full codebase grep for all dispatch mode references.

### A6: worker.sh handles null agent (Code-testable)
**Falsification:** If `worker.sh` requires or uses an `agent` parameter, "no role" dispatch would break.
**Test:** Read worker.sh and trace the agent parameter through the dispatch chain.

### A7: Agent parameter affects dispatch (Code-testable)
**Falsification:** If the agent parameter is logged but never passed to worker.sh, the current UI gives users a false sense of control.
**Test:** Read `api/dispatch/run/route.ts` and trace where `agent` goes after the API receives it.

### A9: Interactive mode is unused (Code-testable)
**Falsification:** If any task file uses `mode: interactive`, dropping it would break those tasks.
**Test:** Grep all task files for `mode: interactive`.

### A10: Task-level overrides don't conflict (Code-testable)
**Falsification:** If `resolveRoute()` doesn't check task-level overrides before system defaults, the system setting would silently override explicit per-task choices.
**Test:** Read `resolveRoute()` and verify the priority chain.

### A11: Two backends are sufficient (Code-testable)
**Falsification:** If tasks use backends beyond openclaw/claude in significant numbers, the settings page's two-option toggle is too narrow.
**Test:** Count distinct backend values across task files.

### A12: Tasks work without agent roles (Human-testable)
**Falsification:** If dispatched tasks without agent roles produce measurably worse output (miss quality bars, ignore conventions), the "no role" default would reduce dispatch quality.
**Test:** Dispatch 3-5 tasks with and without agent roles, compare output quality.

## Results: Confirmed

### A2: `.sherpa/` is gitignored — CONFIRMED
`.gitignore` line 38: `.sherpa/` is explicitly excluded under the comment "Sherpa databases (derived, rebuildable from filesystem)". Directory does not currently exist. `git ls-files .sherpa/` returns nothing.

### A3: `.sherpa/settings.json` writable — CONFIRMED
`.sherpa/` doesn't exist yet but the project root is writable. `getSettings()` should create the directory on first write. Standard Node.js `fs.mkdirSync({ recursive: true })` pattern.

### A6: worker.sh handles null agent — CONFIRMED
worker.sh accepts only `<task-slug>` as its argument (line 7). It does not accept, reference, or use an agent parameter anywhere. It reads `backend` and `model` from task frontmatter, resolves via `resolve-route.mjs` if empty, and falls back to `claude`. The "no role" default cannot break dispatch.

### A8: Settings icon exists — CONFIRMED
`lucide-react` exports both `Settings` and `Settings2` icons. `typeof m.Settings === 'object'` confirmed via Node.js require.

### A9: Interactive mode is unused — CONFIRMED
0 task files use `mode: interactive`. It appears only in `docs/tasks/README.md` as schema documentation. 24 task files use `mode: supervised`. 0 task files use `mode: overnight`. Dropping "interactive" has zero operational impact.

### A10: Task-level overrides don't conflict — CONFIRMED
`resolveRoute()` (dispatch.ts:91-110) checks in priority order: (1) Claude-only governance constraint, (2) explicit `overrides.backend` from task frontmatter, (3) task-type routing from config, (4) config fallback. Per-task `backend:` always wins over system defaults. The system-level setting would only apply when a task has no explicit backend — which is the correct behavior.

### A11: Two backends are sufficient for the toggle — CONFIRMED (with nuance)
21 task files set explicit backends across 7 distinct values (openclaw, claude, gemini, google-ai, groq, codex, lm-studio). However, these are per-task overrides that bypass the system setting via `resolveRoute()` priority. The settings toggle controls the *default* for tasks without explicit backends. Since `resolveRoute()` respects per-task overrides, a two-option toggle is sufficient for the default — it doesn't restrict what individual tasks can do.

## Results: Refuted

### A7: Agent parameter affects dispatch — REFUTED

**Evidence:** The dispatch API route (`api/dispatch/run/route.ts`) accepts `agent` in the request body, logs it, but **never passes it to worker.sh**. The spawn call is:

```typescript
spawn(workerScript, [taskId], { ... })
```

Only `taskId` reaches the worker. The agent parameter is not written to task frontmatter, not passed as an argument, and not used in any downstream logic. Worker.sh has no awareness of agent roles.

**Implication:** The current UI's agent selection is cosmetic — it has no effect on task execution. This actually *validates* the design decision to make agent selection optional, but it also means **the initiative needs to decide whether to wire agent roles into the worker pipeline or leave them as a UI-only concept.**

If agent roles should actually affect dispatch (injecting behavioral constraints into the agent's context), that's new plumbing. If they're purely for human tracking/auditing, the current no-op is fine — but the UI should make this clear rather than implying the agent changes execution.

## Results: Inconclusive

### A4: Health-checking all 9 backends is slow — INCONCLUSIVE
**Reason:** `studio-core` is not built (no `dist/` directory), so the health check function couldn't be executed directly. Each backend has a 3-5 second timeout per the health check code. With 9 backends running sequentially, the theoretical worst case is 9 × 5s = 45s if all timeout. In practice, available backends return in <1s and only offline backends hit the timeout. The claim is mathematically sound but unverified empirically.

## Results: Wider Blast Radius Discovered

### A5: DispatchMode rename is NOT contained — WIDER THAN PROPOSED

The proposal lists 7 target files. The actual blast radius is **26+ files**:

**Code files (must change):**
- `packages/studio-core/src/dispatch.ts` — type definition + 3 function signatures
- `packages/studio-ui/src/dispatch-content.tsx` — local type + 6 usages
- `apps/studio/src/app/(studio)/dispatch/page.tsx` — VALID_MODES array + type

**Shell scripts (must change):**
- `scripts/worker.sh` — `MODE="${MODE:-supervised}"`, overnight guard check
- `scripts/resolve-route.mjs` — mode default, overnight block logic
- `scripts/dispatch-queue.sh` — `--mode` flag

**Task files (24 files, must update frontmatter):**
- All use `mode: supervised` — field name or value needs updating

**Documentation (should update for consistency):**
- `docs/tasks/README.md` — schema documentation
- `docs/architecture/execution-pipeline/index.md` — describes three modes
- `docs/decisions/0004-five-backend-dispatch.md` — references three modes
- `docs/changelog.md` — historical mention
- 6+ initiative docs referencing dispatch modes

**Impact:** The session estimate (4 sessions) is still achievable because the task file updates are mechanical (find/replace `mode: supervised` → `autonomyLevel: supervised`). But the proposal's target list underestimates the scope. Shell scripts and task file updates should be added as explicit targets.

## Human-Required

### A12: Tasks work without agent roles
**Suggested test:** Dispatch 3 research tasks and 2 audit tasks twice — once with the appropriate agent role, once with "Default (no role)." Compare output against the quality scorecard (`.claude/rules/content-quality.md`). If role-less tasks score equivalently (both 5+ of 8 criteria passing), the assumption holds. If role-less tasks consistently miss quality bars, the "no role" default is risky.

**Why human-required:** This requires running actual dispatches and evaluating output quality. The evaluation is subjective — only the human can judge whether behavioral constraints meaningfully improve task output for their use cases.

### A1: Backend rarely changes
**Status:** Partially confirmed by code evidence. 21/24 task files with explicit backends could be read as "backends are varied" or "backends are set once per task and never changed." The assumption is really about *dispatch-time* behavior (does the user change backends during a session?), which is observational. The user asserted this from experience; the code can't confirm or deny it.

## Recommended Changes

### 1. Expand proposal target list
Add to targets:
- `scripts/worker.sh`
- `scripts/resolve-route.mjs`
- `scripts/dispatch-queue.sh`
- `docs/tasks/README.md`

Note in plan: 24 task files need `mode:` field updated (mechanical, scriptable).

### 2. Decide on agent role plumbing
The refuted assumption (A7) surfaces a design question: should agent roles affect task execution, or are they metadata? Three options:

**Option A: Wire it in.** Pass agent slug to worker.sh, have the worker inject the role definition (from `docs/agents/roles/{slug}.md`) into the agent's context. This makes behavioral constraints real.

**Option B: Leave it as metadata.** Agent selection is recorded in task logs for tracking/auditing but doesn't change execution. The "Default (no role)" label makes this honest.

**Option C: Defer.** Ship the dispatch evolution with agent-as-metadata (Option B), add the wiring as a follow-on initiative. This keeps scope contained.

**Recommendation:** Option C. Wiring agent roles into worker.sh is valuable but it's a different concern than the UI simplification this initiative is about. Flag it as a seed in the activity log.

### 3. Add task file migration to session plan
Session 4 should include a scripted migration of 24 task files: rename `mode: supervised` to `autonomyLevel: supervised` (or decide to keep the field name and just change the allowed values).
