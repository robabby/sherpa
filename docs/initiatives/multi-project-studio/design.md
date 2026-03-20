---
designed: 2026-03-20
type: both
components-new: 4
components-modified: 5
files-planned: 22
---

# Multi-Project Studio Design

## Overview

Extend Studio from single-project to multi-project hub following the Vercel model: Studio is the centralized dashboard, projects are data sources with `.sherpa/` dotfolders. Studio owns auth, viewer UI, and cross-project intelligence. Projects own their data.

Proposal: `docs/initiatives/multi-project-studio/proposal.md`
Research: `docs/initiatives/multi-project-studio/research/` (2 iterations)
Plan: `docs/initiatives/multi-project-studio/plan.md`

## Architecture

### Data Models

**`sherpa.json` — canonical project config (replaces `sherpa.config.ts`)**

```ts
// Config loaded from sherpa.json or .sherpa/config.json
interface SherpaJsonConfig {
  $schema?: string                    // JSON Schema URL for IDE validation
  admin?: AdminConfig                 // projectName, projectDescription
  paths?: PathsConfig                 // where governance data lives
  entities?: EntitiesConfig           // lifecycle stages, skill slugs
  vocabulary?: VocabularyConfig       // UI label overrides
  theme?: ThemeConfig                 // accent color, logo
  knowledge?: KnowledgeConfig         // embedding backend
  governance?: GovernanceConfig       // approval policies
  dispatch?: Partial<DispatchConfig>  // backend routing
  projects?: ProjectConfig[]          // federated projects (Studio only)
  extends?: string | string[]         // upstream convention inheritance (future)
}
```

**`ProjectConfig` — registered project in the federation**

```ts
interface ProjectConfig {
  name: string       // "WavePoint", "Rob Abby"
  slug: string       // "wavepoint", "robabby" (kebab-case, URL-safe)
  root: string       // absolute path to project root
  remote?: string    // git remote URL (for reference, not auto-sync)
}
```

**`ResolvedProject` — runtime project with loaded config**

```ts
interface ResolvedProject {
  name: string
  slug: string
  root: string
  remote?: string
  config: SherpaConfig  // fully resolved config for this project
}
```

**Project registry** — in-memory `Map<string, ResolvedProject>`:
- Initialized by `defineConfig()` / `loadConfig()`
- Primary project always present (the one Studio is installed in)
- Additional projects loaded from `projects[]` in config
- Each project's `sherpa.json` is read to resolve its own config

### Component Tree

```
StudioLayout (server, auth check)
├── CommandPalette (client, project-aware search)
├── SidebarProvider
│   ├── StudioSidebar (client)
│   │   ├── SidebarHeader
│   │   │   ├── Logo/Wordmark
│   │   │   └── ProjectSwitcher ← NEW (client)
│   │   │       └── Select + SelectContent
│   │   │           ├── SelectItem "All Projects"
│   │   │           └── SelectItem per project
│   │   ├── SidebarContent (nav groups, project-prefixed hrefs)
│   │   └── SidebarFooter (user menu, trigger)
│   └── SidebarInset
│       ├── StudioShellHeader (breadcrumb with project context)
│       └── main
│           └── [project] layout (server, validates slug)
│               └── page (server, calls domain functions with projectSlug)
```

**New components:**

| Component | Package | Type | Purpose |
|-----------|---------|------|---------|
| `ProjectSwitcher` | `studio-ui` | Client | Select dropdown in sidebar header |
| `ProjectCard` | `studio-ui` | Server | Project summary card for listing page |
| `ResearchIndex` | `studio-ui` | Server | Research file listing with date/category grouping |
| `ResearchViewer` | `studio-ui` | Server | Markdown research file renderer |

**Modified components:**

| Component | Package | Change |
|-----------|---------|--------|
| `StudioSidebar` | `studio-ui` | Accept `projects`, `activeProject` props; prefix nav hrefs |
| `StudioShellHeader` | `studio-ui` | Show project name in breadcrumb when project-scoped |
| `CommandPalette` | `apps/studio` | Search across all projects, show project badges on results |
| `ProcessWorkspace` | `studio-ui` | No changes needed — receives data via props, project-agnostic |
| `StudioLayout` | `apps/studio` | Pass projects list and active project to sidebar |

### Data Flow

**Page render (Vercel BFF pattern):**

```
Browser → /projects/robabby/research/2026-03-20
         ↓
Next.js App Router → [project] layout
         ↓ validates slug via getProject("robabby")
         ↓
research/[slug]/page.tsx (Server Component)
         ↓ calls readProjectFileFor(".sherpa/research/job-market/2026-03-20.md", "robabby")
         ↓ resolves to /root/robabby/.sherpa/research/job-market/2026-03-20.md
         ↓
Renders markdown → HTML response
```

**Project switching (client-side navigation):**

```
User selects "WavePoint" in ProjectSwitcher
         ↓
useRouter().push("/projects/wavepoint/process")
         ↓
Next.js client navigation → new Server Component render
         ↓
process/page.tsx calls getInitiatives("wavepoint")
         ↓
Resolves paths against wavepoint's project root
```

**Key principle:** No client-side data fetching for project data. All governance data loads in Server Components. Client components only manage UI state (sidebar open, selected node, filter/sort).

### Integration Points

**`content.ts` — the critical module.** Currently uses a single global `_projectRoot`. The design adds `resolveForProject(path, slug?)` that resolves against a specific project's root. The existing `resolveProjectPath(path)` is unchanged for backwards compatibility — it resolves against the primary project.

**`init.ts` — side-effect import.** Currently imports `sherpa.config.ts`. Changes to load `sherpa.json` via `loadConfig()`. Also triggers `initProjectRegistry()`.

**`domain.ts` — all domain functions.** Each gets an optional `projectSlug?: string` parameter. When omitted, behavior is unchanged (primary project). When provided, paths resolve against that project's root via `resolveForProject`.

**`knowledge-sync.ts` — scan directories.** Hardcoded `SCAN_DIRS` replaced with config-derived paths per project. `syncAllProjects()` iterates the registry.

**`connection.ts` — DB paths.** Already accepts `projectRoot` parameter. No changes needed — each project's `resolveDbPaths(project.root)` produces isolated `.sherpa/` DB paths.

**`studio-sidebar.tsx` — navigation.** `NAV_GROUPS` href values get prefixed with `/projects/{slug}` when a project is active. The `isActive` function updated to match project-prefixed paths.

### File Plan

**`packages/studio-core/` (config & data layer)**

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/config/load-json.ts` | Discover and load `sherpa.json` |
| Create | `src/config/dotfolder.ts` | `.sherpa/` schema definition, scaffold utility |
| Create | `src/projects.ts` | Project registry (init, get, getAll, resolve) |
| Modify | `src/config/types.ts` | Add `ProjectConfig`, `projects` field, `extends` field |
| Modify | `src/config/schema.ts` | Add Zod validation for projects and JSON config |
| Modify | `src/config/defaults.ts` | Include `projects: []` in defaults |
| Modify | `src/config/index.ts` | Add `loadConfig()`, wire `initProjectRegistry()` |
| Modify | `src/content.ts` | Add `resolveForProject()`, `readProjectFileFor()` |
| Modify | `src/domain.ts` | Add `projectSlug?` param to all domain functions |
| Modify | `src/db/knowledge-sync.ts` | Config-derived scan dirs, `syncAllProjects()` |
| Modify | `src/doc-tree.ts` | Configurable sections via `PathsConfig.docSections` |
| Modify | `src/index.ts` | Export project registry functions |

**`packages/studio-ui/` (components)**

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/project-switcher.tsx` | Select dropdown for project scope |
| Create | `src/project-card.tsx` | Project summary card |
| Create | `src/research-index.tsx` | Research file listing |
| Create | `src/research-viewer.tsx` | Markdown research renderer |
| Modify | `src/studio-sidebar.tsx` | Add project props, prefix hrefs |

**`apps/studio/` (routes & app)**

| Action | File | Purpose |
|--------|------|---------|
| Create | `sherpa.json` (monorepo root) | Replace `sherpa.config.ts` |
| Create | `src/app/(studio)/projects/page.tsx` | Projects listing |
| Create | `src/app/(studio)/projects/[project]/layout.tsx` | Project context + validation |
| Create | `src/app/(studio)/projects/[project]/process/page.tsx` | Project-scoped process |
| Create | `src/app/(studio)/projects/[project]/research/page.tsx` | Research index |
| Create | `src/app/(studio)/projects/[project]/research/[...slug]/page.tsx` | Research detail |
| Create | `src/app/(studio)/projects/[project]/tasks/page.tsx` | Project-scoped tasks |
| Modify | `src/app/(studio)/layout.tsx` | Pass projects to sidebar |
| Modify | `src/app/(studio)/page.tsx` | Redirect to primary project or listing |
| Modify | `src/lib/studio/init.ts` | Use `loadConfig()` instead of TS import |
| Modify | `sherpa.config.ts` | Thin wrapper calling `loadConfig()` |

## UI Design

### Layout

The Vercel sidebar-filter pattern: **same navigation structure, project selection narrows the data scope.**

- **Sidebar header:** Logo/wordmark + project switcher dropdown below
- **Sidebar content:** Same nav groups (Operations, Knowledge, System, Activity) — links prefixed by active project
- **Sidebar footer:** User menu + collapse trigger (unchanged)
- **Main content:** Project-scoped pages. Breadcrumb shows `Projects > {name} > {section}`

When "All Projects" is selected, nav links point to unscoped routes (existing behavior). When a project is selected, nav links point to `/projects/{slug}/...`.

### Component Selection

| Need | Component | Notes |
|------|-----------|-------|
| Project switcher | `Select` (shadcn) | Inside `SidebarHeader`, below logo. `FolderOpen` icon. Width matches sidebar |
| Project listing | `Card` (shadcn) | Grid of `ProjectCard` components. `CardHeader` + `CardTitle` + `CardDescription` |
| Research index | `Table` or custom list | Grouped by category subdirectory, sorted by date desc |
| Research detail | Custom renderer | Parse frontmatter, render markdown body. Minimal chrome |
| Active project indicator | `Badge` (shadcn) | In breadcrumb header when project-scoped |

### Interaction Patterns

1. **Project switching:** Select dropdown in sidebar. Changing selection triggers `router.push()` to the equivalent route in the new project. Current section (process, tasks, etc.) is preserved.

2. **"All Projects" default:** When no project is selected, existing unscoped routes work as today. This is the backwards-compatible path.

3. **Single-project redirect:** When only one project is registered, `/` redirects to `/projects/{slug}/process`. The switcher still appears but shows only one option.

4. **Research browsing:** `/projects/{slug}/research` shows a list of all research files with date, title (from frontmatter), and category. Click navigates to `/projects/{slug}/research/{category}/{date}`. Morning briefing links land directly on detail pages.

5. **Breadcrumb context:** `StudioShellHeader` shows `Sherpa Studio > [Project Name] > Process` when project-scoped. Project name links to project overview.

## Decisions

### D1: `sherpa.json` as canonical config format

**Decision:** Migrate from `sherpa.config.ts` to `sherpa.json`.

**Alternatives rejected:**
- `sherpa.config.ts` only — requires TypeScript, excludes non-technical personas
- Both supported equally — creates confusion about which is canonical

**Rationale:** JSON is the industry standard for project config (`nx.json`, `turbo.json`, `vercel.json`). JSON Schema gives IDE autocompletion without TypeScript. Easier for Luna and `sherpa init` to generate programmatically. `defineConfig()` remains as optional TS wrapper for power users.

**Confidence:** High
**Kill criteria:** If JSON can't express a needed config pattern (e.g., conditional logic), revisit.

### D2: BFF via Server Components, not API gateway

**Decision:** Server Components fetch from multiple project roots at render time. No MCP gateway or API aggregation layer.

**Alternatives rejected:**
- GraphQL Federation — overkill for filesystem-based data
- MCP Gateway (Kong, ContextForge) — enterprise complexity for 1-3 project setup
- Separate BFF service — unnecessary when Next.js Server Components are the BFF

**Rationale:** `createStudioMcpServer()` already accepts `projectRoot`. Domain functions already read from filesystem. Adding `projectSlug` parameter is trivial. No new infrastructure, no new processes, no new dependencies.

**Confidence:** High
**Kill criteria:** If remote projects (not on local filesystem) become a requirement, revisit with virtual MCP.

### D3: Path-based project routing (`/projects/{slug}/...`)

**Decision:** Project scope is a URL path segment, not a query parameter.

**Alternatives rejected:**
- Query params (`?project=robabby`) — every platform studied (Vercel, GitHub, Linear, Netlify, Railway) uses path segments
- Subdomain (`robabby.studio.sherpa.solar`) — infrastructure complexity, DNS management

**Rationale:** Industry consensus is unanimous. Path segments enable natural deep linking, bookmarking, and sharing. Next.js App Router supports directly with `[project]` dynamic segments.

**Confidence:** High
**Kill criteria:** None — this is a convention, not a technical constraint.

### D4: Three-directory model (`.sherpa/` + `.claude/` + `docs/`)

**Decision:** Governance data (initiatives, tasks, agents) → `.sherpa/`. Agent config (rules, skills) → `.claude/`. Reference docs (architecture, decisions) → `docs/`.

**Alternatives rejected:**
- `.sherpa/` absorbs `.claude/` — breaks Claude Code auto-discovery
- Everything stays in `docs/` — no portable data layer for non-sherpa projects
- Neutral `.agents/` directory — adds a third concern without solving the core problem

**Rationale:** Backstage model: structured data consumed by tools = dotfolder. Prose consumed by humans = docs. `.claude/` stays separate because it's Claude Code's native convention. Bridge via `@import` in CLAUDE.md.

**Confidence:** Medium — the boundary between `.sherpa/` and `docs/` for initiatives may need refinement during migration.
**Kill criteria:** If the three-directory split creates confusion or friction during daily use, simplify to two.

### D5: Sidebar project switcher (Vercel pattern)

**Decision:** Project switcher is a `Select` dropdown in the sidebar header, above the nav groups.

**Alternatives rejected:**
- Top-level dropdown in the shell header — takes horizontal space, less natural
- Separate `/projects` route only — no persistent project context
- Tab bar — doesn't scale beyond 3-4 projects

**Rationale:** Vercel's 2026 redesign validated this pattern: same nav items at team and project scope, project selection filters the data. Lowest friction, zero learning curve for users of Vercel/Linear.

**Confidence:** High
**Kill criteria:** If sidebar real estate becomes too tight with the switcher, move to header.

## Open Questions

1. **`isActive` matching for project-scoped routes.** The current `isActive(pathname, href)` checks `pathname.startsWith(href + "/")`. With project-prefixed hrefs like `/projects/sherpa/process`, the matching still works if `href` includes the full prefix. But "All Projects" mode uses unscoped hrefs — need to handle both cases in one function.

2. **Search params preservation during project switch.** When switching from `/projects/sherpa/process?kind=initiative-tree&sort=updated` to wavepoint, should search params carry over? Likely yes — the filter state is view-level, not project-level.

3. **Research file format standardization.** The plan assumes `YYYY-MM-DD.md` with YAML frontmatter. Luna's current research files need to be checked — are they already using this format? If not, migration needed.

4. **`sherpa.config.ts` deprecation timeline.** The plan keeps `sherpa.config.ts` as a thin wrapper calling `loadConfig()`. When can it be fully removed? After all consuming code migrates to `loadConfig()` or JSON-first patterns.
