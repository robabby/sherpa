# Multi-Project Studio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Sherpa Studio from a single-project tool to a multi-project hub that federates across `.sherpa/` dotfolders in multiple repos.

**Architecture:** Vercel model — Studio is the centralized dashboard with its own auth. Projects are data sources with `.sherpa/` dotfolders. Studio reads from all registered projects via a project registry in `sherpa.json`. Server Components aggregate data at render time (BFF pattern). URL routing is path-based: `/projects/{slug}/...`.

**Tech Stack:** Next.js 16 (App Router, Server Components), TypeScript, shadcn/ui (new-york style, Radix base), Tailwind v4, better-sqlite3, Zod, `@sherpa/studio-core` + `@sherpa/studio-ui`

**Stress-test findings incorporated:** Session 2 redesigned from optional `projectSlug` parameters to explicit `ProjectContext` object (A1 refuted assumption). `sherpa.json` is primary config with `sherpa.config.ts` retained as escape hatch for plugins (A2 caveat). `closeForProject()` added to DB connection module (A3 minor fix).

---

## Session 1: Config Foundation

Migrate from `sherpa.config.ts` to `sherpa.json`, add project registry types, define `.sherpa/` schema.

### Task 1.1: Define `sherpa.json` Schema

**Files:**
- Modify: `packages/studio-core/src/config/types.ts`
- Modify: `packages/studio-core/src/config/schema.ts`
- Modify: `packages/studio-core/src/config/defaults.ts`

**Step 1: Add `ProjectConfig` and `ProjectContext` types to `types.ts`**

Add after the `GovernanceConfig` interface:

```ts
export interface ProjectConfig {
  /** Display name in Studio UI. */
  name: string
  /** Unique URL-safe identifier. */
  slug: string
  /** Absolute path to project root. */
  root: string
  /** Git remote URL for sync (optional). */
  remote?: string
}

/**
 * Runtime context for a resolved project.
 * Passed explicitly to all domain functions — no module-level globals.
 * This design avoids the race condition identified in stress-test A1.
 */
export interface ProjectContext {
  /** Absolute path to project root. */
  root: string
  /** Resolved paths config for this project. */
  paths: Required<PathsConfig>
  /** CLAUDE.md locations for this project. */
  claudeMdLocations: string[]
  /** CLAUDE.md scan directories for this project. */
  claudeMdScanDirs: string[]
}
```

Add `projects` to `SherpaUserConfig`:

```ts
/** Additional projects to federate in Studio. */
projects?: ProjectConfig[]
```

Add `projects` to `SherpaConfig` (resolved, non-optional):

```ts
projects: ProjectConfig[]
```

**Step 2: Add project schema validation to `schema.ts`**

```ts
const projectConfigSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  root: z.string().min(1),
  remote: z.string().optional(),
})
```

Add to `userConfigSchema`:

```ts
projects: z.array(projectConfigSchema).optional(),
```

**Step 3: Update `defaults.ts`**

In `buildDefaults()`, add:

```ts
projects: userConfig.projects ?? [],
```

**Step 4: Commit**

```bash
git add packages/studio-core/src/config/
git commit -m "feat(config): add ProjectConfig, ProjectContext types and project registry schema"
```

### Task 1.2: Create `sherpa.json` Loader

**Files:**
- Create: `packages/studio-core/src/config/load-json.ts`
- Modify: `packages/studio-core/src/config/index.ts`

**Step 1: Create JSON config loader**

`packages/studio-core/src/config/load-json.ts`:

```ts
import fs from "node:fs"
import path from "node:path"
import type { SherpaUserConfig } from "./types"

const CONFIG_FILES = ["sherpa.json", ".sherpa/config.json"] as const

/**
 * Discover and load sherpa.json from project root.
 * Searches: sherpa.json, .sherpa/config.json
 * Returns null if no config file found.
 */
export function loadJsonConfig(projectRoot: string): SherpaUserConfig | null {
  for (const filename of CONFIG_FILES) {
    const configPath = path.join(projectRoot, filename)
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8")
      const parsed = JSON.parse(raw) as SherpaUserConfig
      // Resolve projectRoot relative to config file location
      parsed.projectRoot = parsed.projectRoot
        ? path.resolve(path.dirname(configPath), parsed.projectRoot)
        : projectRoot
      return parsed
    }
  }
  return null
}
```

**Step 2: Add `loadConfig()` to `config/index.ts`**

```ts
import { loadJsonConfig } from "./load-json"

/**
 * Load config from sherpa.json (or .sherpa/config.json).
 * Falls back to defaults if no config file found.
 * sherpa.config.ts remains as escape hatch for plugins (stress-test A2).
 */
export function loadConfig(projectRoot?: string): SherpaConfig {
  const root = projectRoot ?? process.cwd()
  const jsonConfig = loadJsonConfig(root)
  return defineConfig(jsonConfig ?? { projectRoot: root })
}
```

**Step 3: Commit**

```bash
git add packages/studio-core/src/config/
git commit -m "feat(config): add sherpa.json loader with discovery fallback"
```

### Task 1.3: Migrate Studio App to `sherpa.json`

**Files:**
- Create: `sherpa.json` (monorepo root)
- Modify: `apps/studio/sherpa.config.ts`

**Step 1: Create `sherpa.json` at monorepo root**

```json
{
  "$schema": "https://sherpa.solar/schema.json",
  "admin": {
    "projectName": "Sherpa",
    "projectDescription": "Behavioral agentic collaboration framework"
  },
  "paths": {
    "initiatives": "docs/initiatives",
    "agentRoles": "docs/agents/roles",
    "rules": ".claude/rules",
    "skills": ".claude/skills"
  },
  "entities": {
    "projectSkillSlugs": ["rr", "integration-review", "plan-tasks"],
    "claudeMdLocations": ["CLAUDE.md"],
    "claudeMdScanDirs": []
  },
  "projects": []
}
```

**Step 2: Update `sherpa.config.ts` to use `loadConfig`**

```ts
import path from "node:path"
import { loadConfig } from "@sherpa/studio/config"

export default loadConfig(path.resolve(process.cwd(), "../.."))
```

**Step 3: Verify — `pnpm dev` loads without errors**

**Step 4: Commit**

```bash
git add sherpa.json apps/studio/sherpa.config.ts
git commit -m "feat(studio): migrate config from sherpa.config.ts to sherpa.json"
```

### Task 1.4: Define `.sherpa/` Directory Schema

**Files:**
- Create: `packages/studio-core/src/config/dotfolder.ts`

**Step 1: Create dotfolder schema definition and scaffold utility**

```ts
import fs from "node:fs"
import path from "node:path"

export const DOTFOLDER = ".sherpa" as const

export const DOTFOLDER_DIRS = [
  "initiatives",
  "tasks",
  "research",
  "rules",
  "skills",
  "agents",
  "db",
] as const

/** Scaffold a .sherpa/ directory at the given project root. */
export function scaffoldDotfolder(projectRoot: string): void {
  const base = path.join(projectRoot, DOTFOLDER)
  for (const dir of DOTFOLDER_DIRS) {
    fs.mkdirSync(path.join(base, dir), { recursive: true })
  }
  const gitignore = path.join(base, "db", ".gitignore")
  if (!fs.existsSync(gitignore)) {
    fs.writeFileSync(gitignore, "*.db\n*.db-wal\n*.db-shm\n")
  }
}

/** Check if a project root has a .sherpa/ directory. */
export function hasDotfolder(projectRoot: string): boolean {
  return fs.existsSync(path.join(projectRoot, DOTFOLDER))
}
```

**Step 2: Commit**

```bash
git add packages/studio-core/src/config/dotfolder.ts
git commit -m "feat(config): define .sherpa/ dotfolder schema and scaffold utility"
```

---

## Session 2a: Refactor Content Module to ProjectContext

**Why this session exists (stress-test A1):** The current content module uses 3 module-level globals (`_projectRoot`, `_claudeMdLocations`, `_claudeMdScanDirs`). Adding multi-root alongside these creates race conditions. This session refactors all ~48 domain functions to accept an explicit `ProjectContext` object, eliminating the globals. This is mechanical but necessary — it must happen before multi-project can work safely.

### Task 2a.1: Create ProjectContext Builder

**Files:**
- Create: `packages/studio-core/src/context.ts`
- Modify: `packages/studio-core/src/config/index.ts`

**Step 1: Create context module**

`packages/studio-core/src/context.ts`:

```ts
import path from "node:path"
import fs from "node:fs"
import type { ProjectContext } from "./config/types"
import { DEFAULT_PATHS } from "./config/defaults"
import type { SherpaConfig } from "./config/types"

/**
 * Build a ProjectContext from a resolved SherpaConfig.
 * This replaces the 3 module-level globals in content.ts.
 */
export function buildProjectContext(config: SherpaConfig): ProjectContext {
  return {
    root: config.projectRoot,
    paths: config.paths,
    claudeMdLocations: config.entities.claudeMdLocations,
    claudeMdScanDirs: config.entities.claudeMdScanDirs,
  }
}

/** Resolve a path relative to a project context's root. */
export function resolveCtxPath(ctx: ProjectContext, relativePath: string): string {
  return path.resolve(ctx.root, relativePath)
}

/** Read a file from a project context. Returns null if not found. */
export function readCtxFile(ctx: ProjectContext, relativePath: string): string | null {
  try {
    return fs.readFileSync(resolveCtxPath(ctx, relativePath), "utf-8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

/** List markdown files in a directory relative to the context root. */
export function listCtxMarkdownFiles(
  ctx: ProjectContext,
  relativeDir: string,
  recursive = true
): string[] {
  const absDir = resolveCtxPath(ctx, relativeDir)
  if (!fs.existsSync(absDir)) return []
  const results: string[] = []
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".")) continue
        if (entry.name === ".archive") continue
        if (recursive) walk(full)
      } else if (entry.name.endsWith(".md")) {
        results.push(path.relative(ctx.root, full))
      }
    }
  }
  walk(absDir)
  return results
}
```

**Step 2: Create a default context from `defineConfig`**

In `config/index.ts`, store the built context:

```ts
import { buildProjectContext } from "../context"
import type { ProjectContext } from "./types"

let _defaultContext: ProjectContext | null = null

export function getDefaultContext(): ProjectContext {
  if (!_defaultContext) throw new Error("defineConfig() has not been called")
  return _defaultContext
}

// Inside defineConfig(), after plugins are applied:
_defaultContext = buildProjectContext(config)
```

This preserves backwards compatibility — existing callers that don't pass a context get the default. New callers pass an explicit context.

**Step 3: Commit**

```bash
git add packages/studio-core/src/context.ts packages/studio-core/src/config/index.ts
git commit -m "feat(core): add ProjectContext builder — explicit context replaces module globals"
```

### Task 2a.2: Migrate Domain Functions to Accept ProjectContext

**Files:**
- Modify: `packages/studio-core/src/domain.ts` (~24 functions)
- Modify: `packages/studio-core/src/file-tree.ts` (~7 functions)
- Modify: `packages/studio-core/src/doc-tree.ts` (~3 functions)
- Modify: `packages/studio-core/src/process-nodes.ts` (~1 function, 12 call sites)
- Modify: `packages/studio-core/src/velocity.ts` (~2 functions)
- Modify: `packages/studio-core/src/research-report.ts` (namespace-safe registry)
- Modify: `packages/studio-core/src/deliverables.ts` (~3 functions)

**Step 1: Add overloaded signatures for backwards compatibility**

Each domain function gets a new signature accepting `ProjectContext`, with the old signature preserved via overload:

```ts
import { getDefaultContext } from "./config"
import type { ProjectContext } from "./config/types"
import { resolveCtxPath, readCtxFile, listCtxMarkdownFiles } from "./context"

// Overloaded: old callers still work, new callers pass context
export function getInitiatives(ctx?: ProjectContext): Initiative[] {
  const c = ctx ?? getDefaultContext()
  const initDir = resolveCtxPath(c, c.paths.initiatives)
  // ... rest of function uses c and resolveCtxPath/readCtxFile instead of globals
}
```

**Step 2: Apply this pattern to all ~48 functions**

This is mechanical: for each function, replace `resolveProjectPath(x)` with `resolveCtxPath(c, x)` and `readProjectFile(x)` with `readCtxFile(c, x)`. The function gets `ctx?: ProjectContext` as first parameter with `const c = ctx ?? getDefaultContext()` fallback.

**Step 3: Fix REPORT_REGISTRY namespace collision**

In `research-report.ts`, change the global `REPORT_REGISTRY` to be keyed by `${projectRoot}:${slug}` instead of just `slug`. Or move the registry into `ProjectContext`.

**Step 4: Verify — `pnpm check` passes, `pnpm dev` works (all callers still use defaults)**

**Step 5: Commit**

```bash
git add packages/studio-core/src/
git commit -m "refactor(core): migrate all domain functions to explicit ProjectContext"
```

### Task 2a.3: Update Studio App Callers

**Files:**
- Modify: `apps/studio/src/app/(studio)/process/page.tsx`
- Modify: `apps/studio/src/app/(studio)/tasks/page.tsx`
- Modify: all other `(studio)` page files that call domain functions

**Step 1: Update page components to pass context explicitly**

Each page component imports `getDefaultContext()` and passes it:

```tsx
import { getDefaultContext } from "@sherpa/studio-core"

export default async function ProcessPage() {
  const ctx = getDefaultContext()
  const initiatives = getInitiatives(ctx)
  // ...
}
```

This step is optional for backwards compatibility (the `?? getDefaultContext()` fallback handles it), but explicit is better than implicit. Migrate callers incrementally.

**Step 2: Verify — `pnpm dev` works, all pages render correctly**

**Step 3: Commit**

```bash
git add apps/studio/src/
git commit -m "refactor(studio): pass explicit ProjectContext to domain function calls"
```

---

## Session 2b: Multi-Project Registry

Now that domain functions accept `ProjectContext`, adding multiple projects is safe.

### Task 2b.1: Create Project Registry

**Files:**
- Create: `packages/studio-core/src/projects.ts`
- Modify: `packages/studio-core/src/config/index.ts`

**Step 1: Create project registry module**

`packages/studio-core/src/projects.ts`:

```ts
import type { SherpaConfig, ProjectConfig, ProjectContext } from "./config/types"
import { loadJsonConfig } from "./config/load-json"
import { buildDefaults } from "./config/defaults"
import { buildProjectContext } from "./context"

interface ResolvedProject {
  name: string
  slug: string
  root: string
  remote?: string
  config: SherpaConfig
  context: ProjectContext
}

let _projects: Map<string, ResolvedProject> = new Map()
let _primarySlug: string = ""

/** Initialize the project registry from the primary config. */
export function initProjectRegistry(primaryConfig: SherpaConfig): void {
  _projects.clear()

  const primarySlug = primaryConfig.admin.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  _primarySlug = primarySlug

  _projects.set(primarySlug, {
    name: primaryConfig.admin.projectName,
    slug: primarySlug,
    root: primaryConfig.projectRoot,
    config: primaryConfig,
    context: buildProjectContext(primaryConfig),
  })

  for (const project of primaryConfig.projects) {
    const projectJson = loadJsonConfig(project.root)
    const config = projectJson
      ? buildDefaults({ ...projectJson, projectRoot: project.root })
      : buildDefaults({ projectRoot: project.root })

    _projects.set(project.slug, {
      ...project,
      config,
      context: buildProjectContext(config),
    })
  }
}

/** Get a resolved project by slug. Returns the ProjectContext for domain functions. */
export function getProjectContext(slug: string): ProjectContext | undefined {
  return _projects.get(slug)?.context
}

/** Get project metadata by slug. */
export function getProject(slug: string): ResolvedProject | undefined {
  return _projects.get(slug)
}

export function getPrimarySlug(): string { return _primarySlug }
export function getAllProjects(): ResolvedProject[] { return Array.from(_projects.values()) }
```

**Step 2: Wire into `defineConfig`**

```ts
import { initProjectRegistry } from "../projects"
// Inside defineConfig(), after building context:
initProjectRegistry(config)
```

**Step 3: Commit**

```bash
git add packages/studio-core/src/projects.ts packages/studio-core/src/config/index.ts
git commit -m "feat(core): add project registry with per-project ProjectContext"
```

### Task 2b.2: Export Project Registry

**Files:**
- Modify: `packages/studio-core/src/index.ts`

```ts
export { getProject, getProjectContext, getPrimarySlug, getAllProjects } from "./projects"
export { buildProjectContext, resolveCtxPath, readCtxFile } from "./context"
export type { ProjectConfig, ProjectContext } from "./config/types"
```

**Commit**

```bash
git add packages/studio-core/src/index.ts
git commit -m "feat(core): export project registry and context from studio-core"
```

---

## Session 3: Knowledge Sync & DB Isolation

Make scan directories configurable. Per-project database isolation.

### Task 3.1: Configurable Scan Directories

**Files:**
- Modify: `packages/studio-core/src/db/knowledge-sync.ts`

**Step 1: Replace hardcoded `SCAN_DIRS` with context-derived paths**

```ts
import type { ProjectContext } from "../config/types"

function getScanDirs(ctx: ProjectContext): string[] {
  return [
    ctx.paths.initiatives,
    ctx.paths.tasks,
    ctx.paths.agentRoles,
    ctx.paths.baseCatalog,
    ctx.paths.rules,
    ctx.paths.skills,
  ]
}
```

**Step 2: Update `syncFromFilesystem` to accept `ProjectContext`**

The function already takes `projectRoot` — change it to accept `ctx: ProjectContext` and derive scan dirs from it.

**Step 3: Add `syncAllProjects`**

```ts
import { getAllProjects } from "../projects"

export function syncAllProjects(): Map<string, SyncStats> {
  const results = new Map<string, SyncStats>()
  for (const project of getAllProjects()) {
    const dbPaths = resolveDbPaths(project.root)
    const db = openDb(dbPaths.knowledge)
    ensureSchema(db)
    const stats = syncFromFilesystem(db, project.context)
    results.set(project.slug, stats)
  }
  return results
}
```

**Step 4: Verify — `pnpm sync:db` works, `pnpm check` passes**

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/knowledge-sync.ts
git commit -m "feat(core): make knowledge sync configurable per-project via ProjectContext"
```

### Task 3.2: Per-Project DB Isolation + `closeForProject`

**Files:**
- Modify: `packages/studio-core/src/db/connection.ts`

**Step 1: Add `closeForProject`**

```ts
/** Close connections for a specific project root. Stress-test A3 finding. */
export function closeForProject(projectRoot: string): void {
  const prefix = path.resolve(projectRoot)
  for (const [dbPath, db] of pool.entries()) {
    if (dbPath.startsWith(prefix)) {
      try { db.close() } catch { /* already closed */ }
      pool.delete(dbPath)
    }
  }
}
```

**Step 2: Commit**

```bash
git add packages/studio-core/src/db/connection.ts
git commit -m "feat(core): add closeForProject for per-project DB lifecycle"
```

---

## Session 4: Studio UI — Project Routing & Switcher

Add `/projects/[project]/...` routing and project scope selector in sidebar.

### Task 4.1: Add Project Route Structure

**Files:**
- Create: `apps/studio/src/app/(studio)/projects/page.tsx`
- Create: `apps/studio/src/app/(studio)/projects/[project]/layout.tsx`
- Create: `apps/studio/src/app/(studio)/projects/[project]/process/page.tsx`
- Create: `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx`
- Create: `apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx`
- Create: `apps/studio/src/app/(studio)/projects/[project]/tasks/page.tsx`

**Step 1: Create projects listing page**

Server Component using `getAllProjects()`. Grid of `Card` components.

**Step 2: Create project layout**

`[project]/layout.tsx` — validates slug via `getProject()`, returns `notFound()` if invalid. Provides project context to children via props or a React context provider.

**Step 3: Create project-scoped pages**

Each page mirrors its unscoped equivalent but passes the project's `ProjectContext` to domain functions:

```tsx
export default async function ProjectProcessPage({
  params,
}: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params
  const ctx = getProjectContext(slug)
  if (!ctx) notFound()
  const initiatives = getInitiatives(ctx)
  // Reuse existing ProcessWorkspace component with the data
}
```

**Step 4: Commit**

```bash
git add apps/studio/src/app/\(studio\)/projects/
git commit -m "feat(studio): add project-scoped route structure /projects/[project]/..."
```

### Task 4.2: Add Project Switcher to Sidebar

**Files:**
- Create: `packages/studio-ui/src/project-switcher.tsx`
- Modify: `packages/studio-ui/src/studio-sidebar.tsx`

**Step 1: Create `ProjectSwitcher` component**

Client component using shadcn `Select`. Shows active project, "All Projects" as first option. On change, navigates to `/projects/{slug}/{current-section}`.

**Step 2: Update `StudioSidebar` props**

Add `projects` and `activeProject` props. Insert `ProjectSwitcher` in `SidebarHeader`. Prefix nav hrefs with `/projects/{slug}` when project is active.

**Step 3: Update `StudioLayout` to pass project data to sidebar**

Parse active project from pathname. Pass `projects` list and `activeProject` slug to `StudioSidebar`.

**Step 4: Commit**

```bash
git add packages/studio-ui/src/ apps/studio/src/app/\(studio\)/layout.tsx
git commit -m "feat(studio-ui): add project switcher with Vercel-style scope filtering"
```

### Task 4.3: Home Page Redirect

**Files:**
- Modify: `apps/studio/src/app/(studio)/page.tsx`

Single project → redirect to `/projects/{slug}/process`. Multi-project → redirect to `/projects`.

**Commit**

---

## Session 5: Research Viewer + Doc Tree

### Task 5.1: Research Viewer for Multi-Project

The key feature — Luna's morning briefing links to `studio.sherpa.solar/projects/robabby/research/job-market/2026-03-20`.

**Files:**
- Enhance: `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx`
- Enhance: `apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx`

Research index lists `.md` files from `.sherpa/research/` grouped by category subdirectory. Detail page parses frontmatter, renders markdown body.

### Task 5.2: Configurable Doc Tree Sections

Replace hardcoded `docs/architecture/`, `docs/decisions/`, `docs/ux/` in `doc-tree.ts` with config-driven sections. Add `docSections` to `PathsConfig`.

---

## Session 6: Convention Inheritance + Cross-Project Views

### Task 6.1: Convention Inheritance in `sherpa.json`

Add `extends` field. Resolve upstream defaults from npm packages. ESLint flat config last-wins merge.

### Task 6.2: Cross-Project Initiative Graph

Scan all projects' initiatives. Resolve `dependencies`/`informs` across project boundaries with `project/slug` notation.

### Task 6.3: Legacy Route Redirects

Middleware redirects: `/process` → `/projects/{primary}/process`, etc.

---

## Session 7 (if needed): Polish & Edge Cases

- Command palette cross-project search
- Breadcrumb project context in `StudioShellHeader`
- Convention drift detection UI
- `sherpa init` CLI command

---

## Session 8: Project Activation

Register wavepoint and robabby as the first federated projects. Add env var interpolation to the config loader for local/VPS path resolution.

### Task 8.1: Add Env Var Interpolation to Config Loader

**Files:**
- Modify: `packages/studio-core/src/config/load-json.ts`

**Step 1: Add `resolveEnvVars` to the loader**

Before `JSON.parse`, interpolate `${ENV_VAR}` patterns in the raw JSON string:

```ts
function resolveEnvVars(raw: string): string {
  return raw.replace(/\$\{(\w+)\}/g, (match, name) => {
    const value = process.env[name]
    if (value === undefined) {
      throw new Error(`Environment variable ${name} is not set (referenced in sherpa.json)`)
    }
    return value
  })
}
```

Apply in `loadJsonConfig` before `JSON.parse(raw)` → `JSON.parse(resolveEnvVars(raw))`.

**Step 2: Verify — set `SHERPA_PROJECTS_DIR`, load config, confirm paths resolve**

**Step 3: Commit**

### Task 8.2: Scaffold `.sherpa/` in WavePoint and robabby

**Files (in wavepoint repo):**
- Create: `.sherpa/config.json`
- Create: `.sherpa/research/.gitkeep`
- Create: `.sherpa/initiatives/.gitkeep`
- Create: `.sherpa/tasks/.gitkeep`
- Create: `.sherpa/rules/.gitkeep`
- Create: `.sherpa/skills/.gitkeep`
- Create: `.sherpa/agents/.gitkeep`
- Create: `.sherpa/db/.gitignore` (*.db, *.db-wal, *.db-shm)

**Files (in robabby repo):**
- Same structure as wavepoint

**WavePoint `.sherpa/config.json`:**
```json
{
  "$schema": "https://sherpa.solar/schema.json",
  "admin": {
    "projectName": "WavePoint",
    "projectDescription": "Astrology platform"
  },
  "paths": {
    "rules": ".claude/rules",
    "skills": ".claude/skills"
  }
}
```

**robabby `.sherpa/config.json`:**
```json
{
  "$schema": "https://sherpa.solar/schema.json",
  "admin": {
    "projectName": "Rob Abby",
    "projectDescription": "Personal site"
  }
}
```

**Commit in each repo separately.**

### Task 8.3: Register Projects in Sherpa's `sherpa.json`

**Files:**
- Modify: `sherpa.json` (monorepo root)

Update `projects` array:

```json
"projects": [
  {
    "name": "WavePoint",
    "slug": "wavepoint",
    "root": "${SHERPA_PROJECTS_DIR}/wavepoint",
    "remote": "git@github.com:robabby/wavepoint.git"
  },
  {
    "name": "Rob Abby",
    "slug": "robabby",
    "root": "${SHERPA_PROJECTS_DIR}/robabby",
    "remote": "git@github.com:robabby/robabby.git"
  }
]
```

### Task 8.4: Set Env Vars

**Local:** Add `SHERPA_PROJECTS_DIR=/Users/rob/Workbench` to `apps/studio/.env.local`

**VPS:** Add `SHERPA_PROJECTS_DIR=/root` to the systemd unit or docker-compose env

### Task 8.5: Verify End-to-End

1. `pnpm dev` — Studio loads without errors
2. `/projects` page shows Sherpa, WavePoint, Rob Abby
3. `/projects/wavepoint/process` renders (empty initiatives, expected)
4. `/projects/robabby/research/` renders (empty, expected — Luna hasn't written yet)
5. Project switcher lists all three projects
6. `pnpm build` succeeds

### Task 8.6: Update Luna's Research Task Templates

Update Luna's overnight research cron to write output to `.sherpa/research/<category>/<date>.md` in each project repo instead of OpenClaw memory. Research file format:

```markdown
---
title: <descriptive title>
date: YYYY-MM-DD
category: <category-slug>
---

<content>
```

---

## Verification Checklist

1. [ ] `sherpa.json` loads and resolves correctly
2. [ ] `pnpm check` passes across all packages
3. [ ] `pnpm build` produces working production build
4. [ ] `/projects` page lists all registered projects
5. [ ] `/projects/{slug}/process` shows project-scoped initiatives
6. [ ] `/projects/{slug}/research/` renders research files from `.sherpa/research/`
7. [ ] Project switcher in sidebar changes active project context
8. [ ] Existing single-project behavior unchanged (no `projects` in config)
9. [ ] Per-project SQLite databases isolated
10. [ ] Knowledge sync covers all registered projects
11. [ ] Legacy unscoped routes redirect to primary project
12. [ ] Morning briefing link `studio.sherpa.solar/projects/robabby/research/2026-03-20` works
13. [ ] No race conditions — concurrent requests to different projects resolve correctly
14. [ ] `REPORT_REGISTRY` handles cross-project slugs without collision
