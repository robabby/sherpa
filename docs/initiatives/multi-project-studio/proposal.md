---
status: in-progress
initiative: multi-project-studio
created: 2026-03-20T00:00:00.000Z
updated: '2026-03-20'
type: new-plan
risk: structural
targets:
  - packages/studio-core/src/config/types.ts
  - packages/studio-core/src/config/defaults.ts
  - packages/studio-core/src/config/schema.ts
  - packages/studio-core/src/config/index.ts
  - packages/studio-core/src/content.ts
  - packages/studio-core/src/domain.ts
  - packages/studio-core/src/doc-tree.ts
  - packages/studio-core/src/db/connection.ts
  - packages/studio-core/src/db/knowledge-sync.ts
  - apps/studio/sherpa.config.ts
  - apps/studio/src/app/(studio)/layout.tsx
  - apps/studio/src/app/(studio)/projects/page.tsx      # (new file)
dependencies:
  - sherpa-framework-extraction
informs:
  - client-deployment-pipeline
  - agent-context-portability
  - zero-to-one-experience
personas:
  - engineer
spawned-from: null
---

## Summary

Extend Sherpa Studio from a single-project tool to a multi-project hub — the centralized governance dashboard for all of Rob's projects, the way Vercel is the centralized deployment dashboard for all of a team's apps. Each project gets a `.sherpa/` dotfolder as its local data layer (conventions, tasks, initiatives, research). Studio's config gains a `projects` registry that federates across multiple `.sherpa/` instances. Studio owns auth, the viewer UI, and cross-project intelligence; individual projects own their data. Convention inheritance flows from `@sherpa/studio` packages (upstream defaults) through `sherpa.config.ts` (per-project overrides) to `.sherpa/` (local data).

## State Snapshot

Studio currently operates on a single project root set via `defineConfig({ projectRoot })` in `apps/studio/sherpa.config.ts:5`. The content module (`packages/studio-core/src/content.ts`) stores one global `_projectRoot` and resolves all paths against it. Every domain function (`getInitiatives`, `getTaskBoard`, `getAgentRoles`, `getSkills`, etc.) reads from this single root.

The `.sherpa/` directory already exists in concept — `packages/studio-core/src/db/connection.ts` resolves database files (`coordination.db`, `events.db`, `knowledge.db`, `auth.db`) to a `.sherpa/` subdirectory of the project root. But `.sherpa/` has no defined schema beyond databases.

Config paths are partially configurable via `PathsConfig` in `types.ts:15-27` — initiatives, tasks, agent roles, rules, skills, sessions, research are all remappable. However, the doc tree (`doc-tree.ts`) hardcodes `docs/architecture/`, `docs/decisions/`, `docs/ux/` paths, and the knowledge sync (`knowledge-sync.ts`) hardcodes its 6 scan directories.

Studio already has auth (Better Auth with cookie sessions + API key support) and an existing `/research/[slug]` route. The auth and viewer infrastructure exists — it just needs to become project-aware.

Rob currently runs three codebases on a VPS (sherpa, wavepoint, robabby) with Luna as a shared agent across all three. Each repo needs its own governance data surfaced in Studio, but Studio can only read from one project root.

## The Vercel Model

Studio's relationship to projects follows the Vercel pattern:

| Vercel | Sherpa Studio |
|--------|--------------|
| Vercel dashboard | Studio UI |
| Vercel auth | Studio auth (Better Auth, already exists) |
| Vercel project | `.sherpa/` in a repo |
| Deployed app (your-app.vercel.app) | The product itself (robabby.com, wavepoint.app) |
| `vercel.json` in your repo | `sherpa.config.ts` in your repo |
| Vercel reads your repo to build/deploy | Studio reads your `.sherpa/` to show governance |

**The key insight: you don't build a deployment dashboard into every app. Vercel IS the dashboard.** Studio IS the research viewer, the task board, the initiative tracker, the convention inspector — for every project. Individual apps (robabby.com, wavepoint.app) stay clean product surfaces with no admin/governance UI.

This means:
- **Studio owns auth** — one login, all projects visible
- **Studio owns all viewer/admin UI** — research viewer, task board, initiative process, agent workforce
- **Projects own their data** — `.sherpa/research/`, `.sherpa/tasks/`, etc. live in each repo, committed to git
- **Luna writes to project repos** — cron jobs produce research in `robabby/.sherpa/research/`, Studio reads it
- **Morning briefing links point to Studio** — not to individual project sites

## Proposed Changes

### 1. `.sherpa/` Dotfolder Convention (`packages/studio-core`)

Define the canonical `.sherpa/` directory schema that any project can adopt:

```
.sherpa/
  initiatives/           # project-specific initiatives
  tasks/                 # project-specific tasks
  research/              # project-specific research output
  rules/                 # local convention overrides
  skills/                # project-specific skills
  agents/                # project-specific agent role definitions
  db/                    # databases (already here: coordination, events, knowledge, auth)
```

Design principles (validated by iteration 1 research):
- **Config at root, data in dotfolder** — `sherpa.config.ts` stays at the project root (like `nx.json`, `turbo.json`). `.sherpa/` holds governance state
- **Convention-based discovery** — collections auto-discovered by glob (e.g., `rules/*.md`), no registration manifest
- **Committed/ignored split** — rules, skills, agents, research committed to git. `db/` gitignored (machine-generated, doesn't diff)
- **Optional adoption** — projects without `.sherpa/` fall back to the current `docs/` paths

### 2. Project Registry in Config (`packages/studio-core/src/config/`)

Add a `projects` section to `SherpaUserConfig`:

```ts
projects?: Array<{
  name: string          // Display name
  slug: string          // Unique identifier
  root: string          // Absolute path to project root
  remote?: string       // Git remote URL (for sync)
}>
```

The primary project (the one Studio is installed in) is always implicitly included. Additional projects are listed in the config. Each project gets its own resolved `SherpaConfig` via `defineConfig()` defaults — a project without a `sherpa.config.ts` uses the framework defaults against its root.

### 3. Content Module Multi-Root Support (`packages/studio-core/src/content.ts`)

Replace the single `_projectRoot` global with a project-aware content resolver. Domain functions gain an optional `projectSlug` parameter. When omitted, they operate on the primary project (backwards compatible). When provided, they resolve paths against that project's root.

### 4. Knowledge Sync Configurability (`packages/studio-core/src/db/knowledge-sync.ts`)

Replace the hardcoded `SCAN_DIRS` array with paths derived from the resolved config. Add per-project database isolation — each project gets its own `.sherpa/db/` directory. The knowledge sync indexes all registered projects into a unified search surface.

### 5. Doc Tree Configurability (`packages/studio-core/src/doc-tree.ts`)

Replace hardcoded `docs/architecture/`, `docs/decisions/`, `docs/ux/` with configurable sections in `PathsConfig`. Projects that don't have these directories simply show empty sections.

### 6. Studio UI — Project Context (`apps/studio`)

Add a project scope selector to the Studio sidebar (Vercel pattern: same nav items, project selection filters the data). Each navigation section (Process, Workforce, Docs, Research, etc.) respects the active project context. "All Projects" is the default/unfiltered state.

Additional UI patterns (from iteration 1 research):
- **"My Work" cross-project view** (Linear pattern) — personal view of tasks across all projects
- **Custom saved views** (Linear pattern) — "all blocked tasks," "all in-progress initiatives" as sidebar items
- **Command palette / universal search** — Cmd+K across all projects
- **Cross-project initiative graph** — visualize `dependencies`/`informs` relationships across projects. This is the governance equivalent of Nx's project graph

### 7. Convention Inheritance Model

Conventions propagate via npm packages, not custom sync (ESLint flat config model, validated by iteration 1 research):
- **Upstream defaults** ship as part of `@sherpa/studio` (rules, skills, agent roles)
- **Per-project overrides** live in `.sherpa/rules/`, `.sherpa/skills/`
- **`sherpa.config.ts`** controls the merge — ordered array, last entry wins
- **Replace vs extend per-field** (Tailwind pattern) — `disposition` replaces, `rules` extends/appends
- **Slug-based identity** for convention rule merging (Babel pattern) — same slug in upstream and local → local wins

## Rationale

**Why Studio as the centralized dashboard?** The Vercel model: you don't build a dashboard into every app. Studio already has auth, a research viewer route, and a governance UI. Making it project-aware is simpler than building authenticated viewers into each project's web app. One login, all projects.

**Why not multiple Studio instances?** Running a separate Studio per project adds operational complexity and prevents cross-project views (unified task board, shared agent workforce, cross-project search). A single Studio that federates is simpler to operate and more useful.

**Why `.sherpa/` instead of extending `docs/`?** The dotfolder convention is a recognized pattern (`.github/`, `.claude/`, `.vscode/`). Research validated that config at root + data in dotfolder is the universal pattern across dev tools. Existing `docs/` layouts remain untouched — migration is optional and incremental.

**Why npm for convention inheritance?** Sherpa is already an npm monorepo distributing `@sherpa/studio-*` packages. Convention propagation is a dependency management problem — npm already solves versioning, pinning, and upgrade flows. ESLint's flat config evolution confirms this is the right model.

**Alternative considered: per-project viewers.** Building an authenticated research viewer into robabby.com was the original plan. Rejected because it duplicates Studio's existing auth and rendering capabilities, and doesn't scale — every new project would need its own viewer.

**Alternative considered: git subtrees for convention sync.** Rejected because it couples convention updates to git operations rather than package versioning, and creates merge conflicts when downstream projects customize conventions.

## Dependencies

- **`sherpa-framework-extraction`** (hard dependency) — the `@sherpa/studio-*` packages must be extractable and installable before other projects can adopt them. This initiative is in-progress (iteration 4).

**Informs:**
- **`client-deployment-pipeline`** — multi-project support defines how clients adopt Studio. The `.sherpa/` dotfolder and `defineConfig()` become the client onboarding surface.
- **`agent-context-portability`** — the `.sherpa/` convention gives agents a standard location for governance data across any project.
- **`zero-to-one-experience`** — first-run UX changes when Studio can add existing projects vs. only bootstrapping new ones.

## Review Notes

**Scope risk:** This touches foundation-level code (content module, config system, knowledge sync). Changes must be backwards-compatible — existing single-project setups must work without modification.

**Migration path:** Existing `docs/initiatives/`, `docs/tasks/` layouts continue to work via `PathsConfig` defaults. `.sherpa/` adoption is opt-in per project. The sherpa repo itself would adopt `.sherpa/` as the Sherpa Consulting project instance, but existing paths remain as aliases during transition.

**The robabby research data is the first proof-of-concept.** Luna's overnight research output goes to `robabby/.sherpa/research/`. Studio reads it via the project registry. Morning briefing links point to Studio's research route scoped to the robabby project.

**Research (iteration 1) validated:**
- Config at root, data in dotfolder — universal pattern (Nx, Turbo, VS Code)
- ESLint flat config as the convention inheritance model
- Vercel sidebar-filter as the multi-project UX pattern
- Cross-project initiative graph as the differentiating feature

**Open questions (from iteration 1):**
- How does `.sherpa/` coexist with `.claude/`? Rules and skills currently live in `.claude/` for Claude Code auto-discovery
- MCP federation — single aggregating server or per-project instances?
- Convention drift detection — how to surface which projects are behind upstream?
- URL structure — path-based (`/projects/robabby/research/...`) vs state-based (`/research/...?project=robabby`)
- What goes in `.sherpa/` vs stays in `docs/`? The directoturtle convention currently assumes `docs/`

**Effort:** 4-6 sessions
**Session breakdown:**
- Session 1: `.sherpa/` schema definition, config types, project registry, `PathsConfig` expansion
- Session 2: Content module multi-root, domain function `projectSlug` parameter
- Session 3: Knowledge sync configurability, per-project DB isolation
- Session 4: Studio UI — project scope selector, project-scoped navigation
- Session 5-6 (if needed): Doc tree configurability, convention inheritance UI, cross-project initiative graph
