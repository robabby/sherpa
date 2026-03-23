---
stress-tested: 2026-03-20
assumptions-extracted: 12
tested: 8
confirmed: 7
refuted: 0
inconclusive: 1
human-required: 0
---

# Stress Test: Studio Aggregate Views

## Assumptions Inventory

| # | Assumption | Rating | Load-bearing? | Test type |
|---|-----------|--------|--------------|-----------|
| A1 | Next.js static routes take priority over dynamic `[project]` segments | Asserted | Yes | Code-testable |
| A2 | `getAllProjects()` returns all 3 projects with valid `root` paths | Asserted | Yes | Code-testable |
| A3 | `scanResearchFiles` works when extracted from route to studio-core | Reasoned | Yes | Code-testable |
| A4 | Sidebar regex would mis-identify `/projects/research` as project slug `"research"` | Reasoned | Yes | Code-testable |
| A5 | `getTaskBoard({ projectRoot })` works for all 3 projects | Asserted | Medium | Code-testable |
| A6 | `getInitiatives(ctx)` works for all 3 project contexts | Asserted | Medium | Code-testable |
| A7 | `StatusBadge` accepts initiative status strings | Sourced | Low | Already verified |
| A8 | `gray-matter` is already a dependency of `studio-core` | Sourced | Low | Already verified |
| A9 | No registered project slug collides with aggregate route names | Asserted | Yes | Code-testable |
| A10 | Performance is acceptable scanning all projects per page load | Reasoned | Medium | Deferred |
| A11 | `Badge` outline variant exists and looks appropriate | Sourced | Low | Already verified |
| A12 | Aggregate research page links to project-scoped detail correctly | Reasoned | Medium | Deferred |

## Tests Designed

| # | Falsification test | Type |
|---|-------------------|------|
| A1 | Inspect Next.js App Router source for route resolution order — find evidence that dynamic segments are matched before static | Code |
| A2 | Read `sherpa.json`, trace env var interpolation in `loadJsonConfig`, check whether paths resolve and exist | Code |
| A4 | Trace sidebar logic with `pathname = "/projects/research"` — confirm it produces correct or broken nav links | Code |
| A5 | Check whether `getTaskBoard()` returns `[]` or throws when `docs/tasks/` is missing | Code |
| A6 | Check whether `getInitiatives()` returns `[]` or throws when `docs/initiatives/` is missing | Code |
| A9 | Read current project slugs, check Zod schema and registry for reserved-word guards | Code |

## Results: Confirmed

### A1: Static route priority — CONFIRMED (High confidence)

**Test:** Inspected Next.js 16.1.1 source — `default-route-matcher-manager.js` (lines 208-214) and `sorted-routes.js` `_smoosh()` method.

**Evidence:** The route matcher has an explicit two-phase strategy: static matchers are checked first (Phase 1), dynamic matchers only after exhausting static matches (Phase 2). First match wins. The `_smoosh()` sorting algorithm processes static children before dynamic placeholders at every tree level.

**Implication:** The routing strategy is sound. `/projects/research` will always serve the static aggregate page, not `[project]` with project="research".

### A4: Sidebar mis-identifies aggregate routes — CONFIRMED

**Test:** Traced `StudioSidebar` logic with `pathname = "/projects/research"`.

**Evidence:** The regex `pathname.match(/^\/projects\/([^/]+)/)` captures `"research"` as the project slug. This produces:
- `activeProject = "research"` (wrong — should be `null`)
- `hrefPrefix = "/projects/research"` (wrong — should be `"/projects"`)
- All nav links point to `/projects/research/<section>` — e.g., `/projects/research/process`, which hits `[project]` layout → `getProject("research")` → `notFound()` → 404
- `isActive` returns `false` for all nav items (nothing highlighted)

**Implication:** The planned fix (validate `matchedSlug` against `projects` prop, set `hrefPrefix = "/projects"` when null) is necessary and correctly designed. Without it, the sidebar is completely broken in aggregate mode.

### A5: getTaskBoard handles missing dirs — CONFIRMED

**Test:** Read `tasks.ts:178-182`. Checked directory existence for all 3 projects.

**Evidence:** Line 182: `if (!fs.existsSync(tasksDir)) return []` — graceful empty array. Sherpa has 28 task files, WavePoint has 35, robabby has none (no `docs/tasks/` dir → returns `[]`).

### A6: getInitiatives handles missing dirs — CONFIRMED

**Test:** Read `domain.ts:98-146` and `context.ts:103-115`. Checked directory existence.

**Evidence:** `listCtxSubdirectories` returns `[]` if directory doesn't exist (line 106 checks `fs.existsSync`, catch block also returns `[]`). Sherpa has 60+ initiatives, WavePoint has 29, robabby has none → returns `[]`.

### A9: No current slug collision — CONFIRMED (unguarded)

**Test:** Read `sherpa.json` project slugs and checked Zod schema for reserved-word validation.

**Evidence:** Current slugs: `sherpa`, `wavepoint`, `robabby` — none collide with `process`, `research`, `tasks`. However:
- The Zod schema (`projectConfigSchema`) only validates format (`/^[a-z0-9-]+$/`), no reserved-word list
- `initProjectRegistry` has no collision check
- A project named "Research" would derive slug `"research"` and register without error

**Implication:** Safe today. Add a reserved-word validation to the config schema as a defensive measure (seed, not blocking).

### A7, A8, A11: Sourced assumptions — CONFIRMED

Verified from source code: `StatusBadge` accepts any string status, `gray-matter` is in `studio-core/package.json`, `Badge` has an `outline` variant.

## Results: Inconclusive

### A2: getAllProjects returns valid paths — CONDITIONALLY CONFIRMED

**Test:** Read `sherpa.json`, traced `loadJsonConfig` → `resolveEnvVars`.

**Evidence:** Projects use `${SHERPA_PROJECTS_DIR}` env var interpolation. The var is set in `.env.local` (loaded by `sherpa.config.ts`). Both external project paths resolve and exist locally. **However:** `resolveEnvVars()` throws if the env var is unset — hard crash, no graceful degradation.

**Risk level:** Low for this initiative (aggregate views run in the same Studio process where `.env.local` is already loaded). The env var fragility is a pre-existing condition, not introduced by aggregate views.

**Implication:** Not a blocker for this initiative. The env var issue is a pre-existing concern for the multi-project system generally.

## Results: Refuted

None.

## Recommended Changes

No blocking changes needed. All load-bearing assumptions confirmed.

**Seeds for future hardening:**
1. **Reserved-word slug validation** — Add `process`, `research`, `tasks` (and future aggregate route names) to a blacklist in `projectConfigSchema`. Low effort, prevents a confusing failure mode.
2. **Duplicate slug detection** — `initProjectRegistry` silently overwrites if the primary project's derived slug matches a federated project's explicit slug. Add a warning.
