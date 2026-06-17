# Studio Governance Refocus — Implementation Plan

## Context

Sherpa Studio grew into many lenses and became unwieldy. This refocuses it on **one thing: the governance lifecycle** (propose→shape→plan→integrate, with provenance), and removes the autonomous-agent dispatch/execution layer — delegating execution to the tools where it already happens (Claude Code now; OpenClaw/Luna as external collaborators Studio *observes*). Operating model is **pane-of-glass**: the lifecycle is driven through Claude Code (existing skills + governance MCP tools); Studio reads, visualizes, verifies, and surfaces provenance/drift. The only Studio write is **mark-verified**.

The work is **mostly subtraction**; the single genuine build is **git-aware doc drift** (which finally makes the already-rendered `stale` provenance state fire). Full rationale and design are in `docs/initiatives/studio-governance-refocus/` (`proposal.md`, `shape.md`, `design.md`, `decisions/`, `prototype.html`). Appetite is open-ended/quality-bounded — the No-Gos below are the budget.

## Locked decisions (do not reopen)

Governance-as-core · pane-of-glass (no Studio cockpit; mark-verified is the only write) · keep & repoint Sessions + MCP · keep behavioral role defs as read-only conventions · merge Workflow→Playbooks (drop the React-Flow DAG) · Linear out of v1 · single initiative · supersede the conflicting agentic initiatives · drift reuses the existing `stale` state (no new state) · drift computed on-demand from `source-initiatives → targets` · **Phase G edits CLAUDE.md/README/roadmap directly in-branch**.

## No-Gos (the budget)

No Linear bridge · no Studio cockpit/approve buttons · no knowledge-engine changes · no Process-view IA redesign beyond the drift indicator · no new provenance frontmatter fields · no mass docs rewrite (only CLAUDE.md/README/roadmap).

## Setup (Step 0)

1. Rebase local `main` onto `origin/main` (currently 6 behind).
2. Worktree per convention (`.claude/rules/worktree-conventions.md`): `git worktree add .worktrees/studio-governance-refocus -b initiative/studio-governance-refocus`.
3. Write the canonical `docs/initiatives/studio-governance-refocus/plan.md` (this plan, per the initiative convention — plans live in the initiative dir) + `activity.md` (`started`, worktree path).
4. End every commit with the `Co-Authored-By: Claude Opus 4.8 (1M context)` trailer. Each phase below is one coherent, independently-committable unit.

## Execution-shaping facts (verified — these differ from the raw blast radius)

- **`pnpm check` = `pnpm -r check`** (`tsc --noEmit` in all 4 packages, no dep graph). Green means *all* packages compile, so barrel/stub edits must land with the deletions.
- **`packages/studio-ui/src/index.ts` is an auto-generated barrel** and **`apps/studio/src/components/studio/*.tsx` are re-export stubs.** Pattern: for every deleted studio-ui component, also remove its barrel line, its `components/studio/<name>.tsx` stub (where one exists), and its `catalog.ts` entry — in lockstep.
- **Authority is woven into `packages/studio-mcp/src/initiative/tools.ts`** (`checkAuthority` import + `checkAuth` gate). **Decouple it BEFORE deleting `authority/`** or `tsc` breaks.
- **`provenance-header.tsx` gates Mark-as-Reviewed to `awaiting-review` only** — must widen to also show for `stale`, or the drift acceptance test is unreachable.
- **No-ops:** `config/schema.ts` has no dispatch field; `apps/studio/sherpa.config.ts` has no dispatch section. Don't touch them for dispatch.
- **`getSessions()` (`domain.ts:~1030`) reads `docs/sessions/*.json`** — a clean single-body swap.
- **Hidden consumers (not in the original cut list) that also break:** `studio-core/src/cross-project.ts` (`getAllProjectTasks` — zero consumers, edit out), `studio-mcp/src/index.ts` (authority+dashboard re-exports), `studio-mcp/src/dashboard.ts` (delete with authority), `studio-ui/src/task-summary-widget.tsx` + `role-editor.tsx` (delete — role-editor is a write, contra pane-of-glass), `studio-mcp/__tests__/http-server.test.ts` (drop reaper import), `studio-core/__tests__/linear-client.test.ts` (3rd linear test).

## Phases

Governing rule: **leaf-first** — remove consumers before the exports they depend on, so `pnpm check` is green at the end of each phase.

### Phase A — Excise dispatch from app routes + UI (leaves)
- **Delete route dirs:** `apps/studio/src/app/(studio)/{tasks,dispatch,workflow,workforce}/`, `projects/[project]/tasks/`, `api/dispatch/{run,reset}/`, `api/stream/tasks/[taskId]/` (remove now-empty parents). Delete whole dirs incl. their `layout/loading/[slug]/actions` (orphan `layout.tsx` without `page.tsx` = Next build error).
- **Delete app wrappers:** `apps/studio/src/lib/studio/{tasks,task-events}.ts`.
- **Delete studio-ui components (+ barrel line + stub + catalog entry each):** `dispatch-content`, `hub-{dispatch,tasks,workflow,workforce}-panel`, `workforce-content`, `task-summary-widget`, `role-editor`, the `mission-*` family, the `workflow-*` family, `lib/task-styles.ts`.
- **Edit (remove dispatch coupling, keep file):** the hub `apps/studio/src/app/(studio)/page.tsx` (remove `getTaskBoard`/`getBackendHealth` imports + the inline "Tasks & Dispatch" and backend-health sections + failed-task ActionCards; collapse the Active-Work grid to one column); `projects/page.tsx` (drop `getTaskBoard`/`taskCount`); `actions/command-palette-items.ts` (drop `getTaskBoard` block + the removed-route static entries — full regroup deferred to F); `catalog.ts` (prune the removed entries/variants).
- **Verify:** `pnpm check` green (all 4); `pnpm --filter @sherpa/studio-app build` green; removed routes 404; hub renders without tasks/backend sections.

### Phase B — Excise dispatch from studio-core + mcp + config + scripts + tests (roots; index LAST)
- **B1 (first):** decouple `studio-mcp/src/initiative/tools.ts` from authority — remove `checkAuthority` import, the `checkAuth` helper, and `coordinationDb`/`requireAuthority` options + guards; `registerInitiativeTools` keeps `{ projectRoot, approvalPolicy }`.
- **B2:** slim `studio-mcp/src/server.ts` — remove dispatch/linear imports, the `task_*`/`lm_status` tool registrations + Linear/LM helpers, `registerAuthorityTools` + the `coordinationDb` option; keep `search_knowledge`/`get_summary` + `registerInitiativeTools` + the knowledge engine; update the file header comment.
- **B3:** delete `studio-mcp/src/authority/` + `dashboard.ts`; remove their re-exports from `studio-mcp/src/index.ts`; delete the authority/dashboard/task-routing tests; edit `http-server.test.ts` to drop the reaper import.
- **B4:** edit `studio-core/src/cross-project.ts` (drop task/linear imports + `getAllProjectTasks`/`CrossProjectTask`); edit `config/{types,defaults}.ts` (remove `DispatchConfig`/`DEFAULT_DISPATCH`); **then remove the dispatch/tasks/linear exports from `studio-core/src/index.ts`** and delete the 7 source files (`dispatch`, `dispatch-meta`, `tasks`, `task-events`, `linear-client`, `linear-mapping`, `linear-tasks`) + their 3 linear tests. Keep `./mcp-dashboard`.
- **B5:** delete scripts `dispatch.sh`, `dispatch-queue.sh`, `worker.sh`, `task-scanner.mjs`, `resolve-route.mjs`, `linear-import-tasks.mjs` (no `auto-judge.sh` exists; check `task-logger.mjs` is dead and remove if so).
- **Verify:** `pnpm check` + `pnpm test` green; **boot the MCP server and confirm the handshake lists only `search_knowledge`/`get_summary`/`initiative_*`** (no `task_*`/`authority_*`/`lm_status`/`get_dashboard`); grep gate `grep -rnE "dispatch|task_|authority|linear" packages/*/src apps/studio/src` returns only incidental hits (`mcp-dashboard` `domain:"tasks"`, knowledge backend enum, vocabulary `task`).

### Phase C — Repoint Sessions to Claude Code logs
- **New:** `packages/studio-core/src/claude-code-sessions.ts` — `readClaudeCodeSessions({ projectRoot })`: defensive `~/.claude/projects/<encoded-cwd>/*.jsonl` adapter. Isolate the `/→-` cwd-encoding in one function. Line-by-line `JSON.parse` in try/catch; missing dir → `[]`; never throw. Map sessionId/timestamps/model/branch/tokens/toolsUsed; `filesModified`/`commits` ship `[]`, `initiative`/`role`/`summary` → null, `outcome` inferred. Export from `index.ts`.
- **Edit:** `domain.ts` `getSessions()` body → call the adapter. `Session` type unchanged, so the API route, Sessions page, `hub-sessions-panel`, `initiative-sessions-section` are insulated.
- **Verify:** `pnpm check`/`test` green; `/sessions` shows real Claude Code sessions (≥ the live one) with model/tokens/branch; absent fields degrade without crashing.

### Phase D — Slim MCP presentation
- **Edit:** `studio-core/src/mcp-dashboard.ts` domain union (`tasks|infrastructure` → `knowledge|governance`) + its consumers (`apps/studio/src/lib/studio/mcp.ts`, the MCP page) so the `/mcp` tab presents the governance API, no Tasks category. Cosmetic typing.
- **Verify:** `pnpm check` green; `/mcp` shows only governance + knowledge tools.

### Phase E — Git-aware drift + provenance spine (the one real build)
- **New:** `packages/studio-core/src/doc-drift.ts` — `DocDrift { relatedPaths, commitsSinceVerified, isStale }`; `buildInitiativeTargetIndex(ctx)` (slug→`targets`, via `listInitiatives()`); `computeDocDrift(provenance, targetIndex, ctx)` → null unless maintained + has `sourceInitiatives` + `lastVerified`; else one `git log --format=%h --since=<lastVerified> -- <paths>` **reusing the `velocity.ts:getGitStaleness` execSync pattern** (cwd `ctx.root`, timeout 5000, catch→null). Add `DocDrift` to `types.ts`; export.
- **Edit (core):** `doc-tree-types.ts` — `computeState(provenance, drift?)` returns `stale` when maintained + `drift.isStale`; add `DocTreeNode.drift?`. `doc-tree.ts` — thread optional `{ targetIndex }` through `getDocTree`/`readDocNode`.
- **Edit (ui):** `docs-workspace.tsx` — delete the local `computeProvenanceState` (latent bug), use core `computeState`, accept/render drift. `provenance-header.tsx` — add the "N commits since verified" line **and widen the Mark-as-Reviewed gate to `awaiting-review || stale`**. `process-detail-pane.tsx` — minimal drift indicator reusing existing stale-dot styling (no IA redesign).
- **Edit (app):** `docs/page.tsx` and `process/page.tsx` — `buildInitiativeTargetIndex`, pass `{ targetIndex }`, compute drift for the open node, pass `state`+`drift` down. `mark-verified` already exists in `docs/actions.ts` (sets `reviewed-by: human` + `last-verified: today`).
- **Verify:** `pnpm check`/`test` green; add unit tests for `computeDocDrift` + `computeState(provenance, drift)`. End-to-end: a maintained `docs/architecture/**` doc whose source initiatives' `targets` got commits since its `last-verified` (the excision itself made several stale) shows "Possibly stale · N commits since verified"; **Mark as Reviewed clears it**; same doc shows a stale dot in `/process`. Confirm `/docs` stays snappy (git runs only for ~14 provenance docs).

### Phase F — Nav reorg + Roles view
- **New:** `packages/studio-ui/src/roles-content.tsx` (fork the deleted `workforce-content.tsx` from git history, MINUS `TaskSummaryWidget`/`tasks` props and dispatch fields `modelTier`/`taskType`/`eligibleTaskTypes`/`source`/health; keep convention fields) + barrel line + `components/studio/roles-content.tsx` stub. `apps/studio/src/app/(studio)/roles/{page,layout}.tsx` mirroring the `conventions/`/`skills/` route shape; `page.tsx` calls `getAgentRoles()` only (no `getTaskBoard` — severs the coupling). `/roles/[slug]` deferred.
- **Edit (both nav sources in lockstep):** `studio-sidebar.tsx` `NAV_GROUPS` → **GOVERN** [Process] · **AUTHOR** [Conventions, Skills, Playbooks, Roles, Docs, Research] · **OBSERVE** [Sessions, Activity, MCP]; `studio-shell-header.tsx` `sectionLabels` (drop tasks/dispatch/workflow/workforce; add `roles`); `command-palette-items.ts` regroup + Roles entry.
- **Verify:** `pnpm check` + build green; sidebar = GOVERN/AUTHOR/OBSERVE; `/roles` renders read-only (no edit/dispatch/task widgets); breadcrumb + palette resolve `/roles`.

### Phase G — Identity reframe (direct edit, per decision)
- **Edit directly in-branch:** `CLAUDE.md` (Governance Engine becomes the headline; remove Pillar 3 / Execution Pipeline, the 9-backend Dispatch section, `scripts/dispatch.sh` refs; reposition to "human+AI governance & convention engine" — follow `.claude/rules/claude-md-standards.md`); `README.md` (governance headline); `docs/roadmap.md` (reflect the refocus). Scope strictly to these three.
- **Verify:** `pnpm check` unaffected; grep CLAUDE.md for "Pillar 3"/"Dispatch"/"9 backend"/"dispatch.sh" → absent.

### Phase H — Portfolio triage (governance metadata, no code)
- Disposition the ~20 agentic initiatives per the proposal's supersession list using the kept governance tools (`initiative_update_status` → `declined`/`archived`) — dogfooding the slimmed MCP. Mark the superseded approved work (`agentic-workforce`, `studio-workflow-canvas`, `linear-initiative-sync`, `ai-sdk-dispatch`, `dispatch-evolution`, `agentic-workspace`, `agentic-runtime-platforms`); preserve `behavioral-agents`.
- **Verify:** `initiative_list` reflects dispositions; Process portfolio counts update.

## Reuse (don't reinvent)
- `packages/studio-core/src/velocity.ts` `getGitStaleness` — the `execSync` git-by-path pattern for `doc-drift.ts`.
- `listInitiatives()` (`initiative-ops.ts`) — already exposes `targets[]` for the drift index.
- `computeState`/`parseProvenance`/`readDocNode` (`doc-tree*.ts`) + `provenance-header.tsx` — drift plugs into existing provenance rendering.
- `docs/actions.ts` mark-verified — already implemented; just widen the button gate.
- `getAgentRoles()` (`domain.ts`) — the role parser the read-only Roles view reuses.

## Risks (ranked)
1. **Authority decouple ordering** — B1 before B3, or studio-mcp `tsc` breaks. 2. **Barrel/stub lockstep** — a dangling `export *`/stub fails the whole `pnpm -r check`. 3. **Hidden consumers** (`cross-project`, `studio-mcp/index`, `dashboard`, `task-summary-widget`, `role-editor`) — handled in A/B. 4. **MCP must still boot** after tool/`coordinationDb` removal — Phase B gate; watch orphaned `tasksDir`/`logEvent`/`spawn` plumbing. 5. **Mark-verified gate** must widen to `stale` (Phase E). 6. **`docs-workspace` state** — compute drift in the page, pass down. 7. **Orphaned `layout/loading`** when deleting routes — delete whole dirs. 8. **Rebase first** (main 6 behind).

## End-to-end verification (run the app, on the worktree branch)
1. `pnpm check` (4 green) + `pnpm --filter @sherpa/studio-app build` + `pnpm test` all green; `/tasks`,`/dispatch`,`/workflow`,`/workforce`,`/projects/<slug>/tasks` → 404; hub clean.
2. `/sessions` lists real Claude Code sessions incl. the live one.
3. A known-stale architecture doc shows the commit-count "Possibly stale" banner; Mark-as-Reviewed clears it; stale dot appears in `/process`.
4. MCP server boots exposing only `search_knowledge`/`get_summary`/`initiative_*`.
5. Sidebar = GOVERN/AUTHOR/OBSERVE; `/roles` is read-only.
6. `CLAUDE.md`/README reframed (no Pillar 3 / dispatch).
7. Final grep gate clean (only the incidental hits).

## Critical files
`studio-mcp/src/initiative/tools.ts` (authority decouple — the linchpin) · `studio-mcp/src/server.ts` (slim + still boots) · `studio-core/src/index.ts` (exports last; add drift+sessions) · `studio-ui/src/index.ts` (barrel lockstep) · `apps/studio/src/app/(studio)/page.tsx` (highest-touch hub edit) · `studio-ui/src/provenance-header.tsx` (drift line + button gate).
