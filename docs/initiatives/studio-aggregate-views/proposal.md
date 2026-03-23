---
status: approved
initiative: studio-aggregate-views
created: 2026-03-20
updated: '2026-03-20'
type: new-plan
risk: additive
targets:
  - apps/studio/src/middleware.ts
  - packages/studio-core/src/cross-project.ts
  - packages/studio-ui/src/project-switcher.tsx
  - apps/studio/src/app/(studio)/projects/page.tsx
  - apps/studio/src/app/(studio)/projects/research/page.tsx  # (new file)
  - apps/studio/src/app/(studio)/projects/process/page.tsx   # (new file)
  - apps/studio/src/app/(studio)/projects/tasks/page.tsx     # (new file)
dependencies: []
informs:
  - agent-context-portability
spawned-from: multi-project-studio
personas:
  - engineer
  - product-manager
---

## Summary

Add cross-project aggregate views to Studio so that selecting "All Projects" in the sidebar shows merged data from all registered projects — not just the primary project's data. Covers three views: research feed, process (initiatives), and task board. Each item carries a project badge so the user can see where it lives.

## State Snapshot

Three projects are registered (Sherpa, WavePoint, robabby) via `sherpa.json` `projects[]`. The multi-project-studio initiative landed and the infrastructure works:

- **Project registry** (`packages/studio-core/src/projects.ts`, 62 lines): `getAllProjects()` returns all `ResolvedProject` entries with loaded `ProjectContext`.
- **Cross-project functions** (`packages/studio-core/src/cross-project.ts`, 92 lines): `getAllInitiatives()` and `buildCrossProjectGraph()` already scan initiatives across all projects and resolve `project/slug` references. Currently only consumed by the command palette search.
- **Project switcher** (`packages/studio-ui/src/project-switcher.tsx`, 57 lines): "All Projects" option navigates to `/projects` — a simple project listing page. Does not preserve the current section.
- **Middleware** (`apps/studio/src/middleware.ts`, 69 lines): Redirects unscoped routes (`/process`, `/research`, `/tasks`, etc.) to `/projects/{primarySlug}/...`. This means there's no way to reach an aggregate view — the middleware intercepts first.
- **Project-scoped views**: Process page builds `ProcessNode[]` via `getProcessNodes()` with domain functions bound to a single `ProjectContext`. Research page uses a local `scanResearchFiles(projectRoot)`. Tasks page uses `getTaskBoard({ projectRoot })`.

The gap: all views are project-scoped. "All Projects" in the switcher shows a project listing card grid, not aggregate data. The cross-project infrastructure in `studio-core` supports initiatives but not research or tasks.

## Proposed Changes

### `packages/studio-core/` — Aggregate data functions

Extend `cross-project.ts` with aggregate functions for research and tasks:

- `getAllResearchFiles()` — call `scanResearchFiles()` per project, merge results, decorate each with `projectSlug` and `projectName`. Return sorted by date descending.
- `getAllTasks()` — call `getTaskBoard()` per project, merge results, decorate with project metadata.
- Extract `scanResearchFiles()` from the research page route into `studio-core` so it can be shared between the project-scoped and aggregate views.

The existing `getAllInitiatives()` already handles the initiative case — no changes needed there.

### `apps/studio/src/middleware.ts` — Stop redirecting aggregate routes

Remove `/process`, `/research`, and `/tasks` from `LEGACY_ROUTE_PREFIXES` so they stop redirecting to the primary project. These unscoped routes become the aggregate view paths. Other legacy prefixes (`/docs`, `/conventions`, `/skills`, etc.) continue redirecting — they don't have aggregate views yet.

### `packages/studio-ui/src/project-switcher.tsx` — Preserve section on switch

When switching to "All Projects", preserve the current section instead of navigating to `/projects`. If the user is on `/projects/sherpa/process`, switching to "All Projects" goes to `/projects/process` (aggregate process view). Symmetric: switching from aggregate to a project preserves the section too.

### `apps/studio/src/app/(studio)/projects/` — Aggregate view routes

Create three aggregate view pages as static routes under `projects/`. Next.js static routes take priority over `[project]` dynamic segments, so `/projects/research` serves the aggregate page while `/projects/sherpa/research` serves the project-scoped page.

**Research feed** (`projects/research/page.tsx`): Calls `getAllResearchFiles()` from `cross-project.ts`. Same grouped-by-category layout as the project-scoped research page, but each item shows a project badge. This is the highest-value aggregate — Luna's morning briefing can link to `/projects/research` for the daily digest across all projects.

**Process view** (`projects/process/page.tsx`): Calls `getAllInitiatives()` from `cross-project.ts`. Renders the initiative list with project badges. Uses a simplified view (flat initiative list with status/type/project badges) rather than the full `ProcessWorkspace` tree — the tree view is project-scoped because initiative hierarchy is per-project.

**Task board** (`projects/tasks/page.tsx`): Calls `getAllTasks()` from `cross-project.ts`. Same `MissionWorkspace` component with merged task data. Project badge on each task card.

### `apps/studio/src/app/(studio)/projects/page.tsx` — Enhanced landing

The "All Projects" landing gains summary stats per project (initiative count, task count, recent research count) to serve as a dashboard. Links to aggregate views in the nav.

## Rationale

The Vercel model: team-level dashboards aggregate across all projects. You select a project to narrow scope, or stay at team level for the portfolio view. Sherpa's multi-project infrastructure already supports this — `getAllProjects()`, `getProjectContext()`, and `getAllInitiatives()` are the building blocks. The gap is purely in the view layer and middleware routing.

**Why static routes, not a reserved slug like `/projects/all/...`?** Static routes are cleaner in Next.js — they take priority over `[project]` dynamic segments naturally. No need for a magic slug or special-case logic in the `[project]` layout. The `[project]` layout already calls `notFound()` for unrecognized slugs, so there's no collision risk.

**Why not full `ProcessWorkspace` for aggregate?** The tree view (`initiative-tree` kind) shows parent/child/branch relationships within a single project. Cross-project doesn't have that hierarchy — initiatives across projects are peers. A flat list with project badges and status/type filters is the right aggregate representation. Individual items link to their project-scoped detail view for the full tree.

**Why research first?** Highest immediate ROI. Luna generates research nightly across multiple projects. A unified feed at `/projects/research` gives Rob a single page to see all overnight output instead of switching between three projects. The morning briefing Telegram message can link directly here.

## Dependencies

- `spawned-from: multi-project-studio` — builds on the integrated multi-project infrastructure.
- No blocking dependencies. The cross-project functions in `studio-core` and the route structure are ready.

## Review Notes

**Routing collision guard:** The aggregate routes (`process`, `research`, `tasks`) must never match a registered project slug. Currently projects are named "sherpa", "wavepoint", "robabby" — no collision. If a project were ever named "process", it would be shadowed by the static aggregate route. The `[project]` layout's `notFound()` check is the safety net, but a validation rule in the config loader could enforce this explicitly.

**Activity stream deferred:** A cross-project activity stream (`/projects/activity`) is valuable but requires more design — what events to surface, how to merge timelines from `activity.md` files, how to handle different cadences. Tracked as a seed, not in scope.

**Performance:** Scanning 3 projects on each aggregate page load is fine. For 10+ projects, consider caching `ResolvedProject` data or using `React.cache()` to deduplicate within a single render. Not needed now.

**Effort:** 2 sessions

**Session breakdown:**
- Session 1: Middleware changes, extract `scanResearchFiles` to studio-core, add `getAllResearchFiles()` and `getAllTasks()` to cross-project, fix project switcher section preservation, create aggregate research page. This is the highest-value session — research feed is immediately useful.
- Session 2: Aggregate process page (flat initiative list with project badges), aggregate task board, enhanced projects landing with stats. Polish project badges as a shared component.
