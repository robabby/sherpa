# Sherpa Framework Extraction — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract Studio's governance/workflow system into `@sherpa/studio-*` npm packages, starting as JIT internal packages in the the source monorepo and graduating to publishable npm packages.

**Architecture:** Payload CMS model — framework-inside-your-app, config-as-code via `defineConfig()`, curried plugin pattern. Five packages: `studio-core` (lib), `studio-ui` (components), `studio-mcp` (task server), `studio-cli` (scaffold + sync), `studio` (meta-package). Monorepo-first extraction following a 5-phase dependency DAG.

**Tech Stack:** TypeScript, pnpm workspaces, zod, gray-matter, React (peer), shadcn/ui (peer), @modelcontextprotocol/sdk, node-diff3, Changesets, tsup (Publishable phase)

**Research basis:** `research/iteration-2.md` (synthesis), `research/iteration-2/vector-1` through `vector-4` (deep dives)

---

## Package Architecture

```
packages/
  studio-core/           @sherpa/studio-core    — lib modules
  studio-ui/             @sherpa/studio-ui      — React components
  studio-mcp/            @sherpa/studio-mcp     — MCP task server
  studio-cli/            @sherpa/studio-cli     — sherpa init + sherpa sync
  studio/                @sherpa/studio         — meta-package (re-exports core + ui)
```

All packages start as JIT internal packages (`.ts` source, no build step, `private: true`). Same pattern as `packages/content/`.

---

## Task 1: Package Scaffolding

**Files:**
- Create: `packages/studio-core/package.json`
- Create: `packages/studio-core/tsconfig.json`
- Create: `packages/studio-core/src/index.ts` (empty barrel)
- Create: `packages/studio-ui/package.json`
- Create: `packages/studio-ui/tsconfig.json`
- Create: `packages/studio-ui/src/index.ts` (empty barrel)
- Create: `packages/studio-mcp/package.json`
- Create: `packages/studio-mcp/tsconfig.json`
- Create: `packages/studio/package.json`
- Create: `packages/studio/src/index.ts`
- Modify: `apps/web/package.json` (add workspace deps)
- Modify: `apps/web/next.config.ts` (add transpilePackages)

**Step 1: Create `packages/studio-core/package.json`**

```json
{
  "name": "@sherpa/studio-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts",
    "./schemas": "./src/schemas.ts",
    "./lifecycle": "./src/lifecycle.ts",
    "./tasks": "./src/tasks.ts",
    "./markdown": "./src/markdown.ts",
    "./velocity": "./src/velocity.ts",
    "./content": "./src/content.ts",
    "./config": "./src/config/index.ts"
  },
  "scripts": {
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

**Step 2: Create `packages/studio-core/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

**Step 3: Create `packages/studio-ui/package.json`**

```json
{
  "name": "@sherpa/studio-ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.tsx"
  },
  "scripts": {
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "@sherpa/studio-core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "lucide-react": ">=0.400",
    "recharts": ">=2",
    "motion": ">=12",
    "class-variance-authority": ">=0.7",
    "clsx": ">=2",
    "tailwind-merge": ">=3"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.8.2"
  }
}
```

**Step 4: Create `packages/studio-mcp/package.json`**

```json
{
  "name": "@sherpa/studio-mcp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": {
    "sherpa-mcp": "./src/server.ts"
  },
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.18.2",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

**Step 5: Create `packages/studio/package.json` (meta-package)**

```json
{
  "name": "@sherpa/studio",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./config": "./src/config.ts",
    "./next": "./src/next.ts"
  },
  "dependencies": {
    "@sherpa/studio-core": "workspace:*",
    "@sherpa/studio-ui": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

**Step 6: Create initial barrel files**

`packages/studio-core/src/index.ts`:
```ts
// @sherpa/studio-core — governance, lifecycle, task management
// Populated during extraction phases
export {}
```

`packages/studio-ui/src/index.ts`:
```ts
// @sherpa/studio-ui — React components
export {}
```

`packages/studio/src/index.ts`:
```ts
export * from '@sherpa/studio-core'
export type * from '@sherpa/studio-core/types'
```

`packages/studio/src/config.ts`:
```ts
export { defineConfig, createPlugin } from '@sherpa/studio-core/config'
export type { SherpaUserConfig, SherpaConfig, SherpaPlugin } from '@sherpa/studio-core/config'
```

`packages/studio/src/next.ts`:
```ts
export { withSherpa } from '@sherpa/studio-core/config'
```

**Step 7: Add workspace dependencies to `apps/web/package.json`**

Add to `dependencies`:
```json
"@sherpa/studio-core": "workspace:*",
"@sherpa/studio-ui": "workspace:*",
"@sherpa/studio": "workspace:*"
```

**Step 8: Add `transpilePackages` to `apps/web/next.config.ts`**

Add to the Next.js config object:
```ts
transpilePackages: [
  "@sherpa/studio-core",
  "@sherpa/studio-ui",
  "@sherpa/studio",
]
```

Note: `@wavepoint/content` may already have a `transpilePackages` entry — add to the existing array.

**Step 9: Run `pnpm install` to link workspace packages**

The `pnpm-workspace.yaml` already has `packages/*` so new packages auto-discover.

```bash
pnpm install
```

**Step 10: Verify with typecheck**

```bash
cd packages/studio-core && pnpm check
cd ../studio-ui && pnpm check
```

**Step 11: Commit**

```bash
git add packages/studio-core/ packages/studio-ui/ packages/studio-mcp/ packages/studio/
git add apps/web/package.json apps/web/next.config.ts pnpm-lock.yaml
git commit -m "feat: scaffold @sherpa/studio-* package structure (JIT)"
```

---

## Task 2: Extract `@sherpa/studio-core` — Layer 0 (Foundation Types)

The foundation layer has zero internal dependencies. Extract first with zero risk.

**Source → Destination mapping:**

| Source | Destination | Changes Required |
|--------|-------------|-----------------|
| `packages/studio-core/src/types.ts` | `packages/studio-core/src/types.ts` | Split: framework types stay, WavePoint-specific types move to extension file |
| `packages/studio-core/src/lifecycle.ts` | `packages/studio-core/src/lifecycle.ts` | None — zero deps, pure function |
| `packages/studio-core/src/process-nodes-shared.ts` | `packages/studio-core/src/process-nodes-shared.ts` | None — zero deps |

**Files:**
- Create: `packages/studio-core/src/types.ts`
- Create: `packages/studio-core/src/lifecycle.ts`
- Create: `packages/studio-core/src/process-nodes-shared.ts`
- Create: `packages/studio-core/src/types-extensions.ts` (WavePoint-specific types)
- Modify: `packages/studio-core/src/types.ts` (re-export from core + extensions)

### Step 1: Split `types.ts` — framework vs WavePoint

Copy `packages/studio-core/src/types.ts` → `packages/studio-core/src/types.ts`.

**Remove these WavePoint-specific types from the core copy** (they move to `types-extensions.ts`):

- `PRIMITIVE_LEVELS`, `PrimitiveLevel`, `LEVEL_NAMES`, `LEVEL_DESCRIPTIONS`, `LEVEL_VERBS` — WavePoint abstraction ladder
- `PrimitiveMetadata`, `ExportSignatureKind`, `SignatureParameter`, `SignatureProperty`, `SignatureMember`, `ExportSignature`, `PrimitiveCatalogEntry` — primitives catalog
- `EndpointMetadata`, `EndpointCatalogEntry`, `ExposureType` — API catalog
- `RESEARCH_REPORT_KINDS`, `ResearchReportKind`, `ResearchReport`, `SaturnBacktestPayload`, `SaturnQuarterCycleEvent`, `MonteCarloResult`, `LongitudeTimeSeriesPoint`, `EclipseBacktestPayload`, `EclipseActivationEvent` — research report payloads

**Keep these in core** (they are framework-generic):

- Agent types: `AGENT_ROLE_CATEGORIES`, `AgentRole`, etc.
- Initiative types: `Initiative`, `INITIATIVE_STATUSES`, etc.
- Workstream types
- Content types: `ContentFile`, `Rule`, `DocumentContent`, `SectionHeading`
- Activity types: `ActivityEntry`, `DateActivityData`, etc.
- Portfolio types: `PortfolioData`, `PortfolioApp`, `CrossDependency`, `MonorepoInitiative`
- Skill types
- Branch/Research types: `BranchSeed`, `ResearchTreeNode`, `ResearchIteration`, `InitiativeResearch`
- Process types: `UnifiedInitiativeEntry`, `UnifiedProcessData`, `ProcessDashboardStats`
- Deliverables types: `ChartSpec`, `DeckSpec`, slides — generic governance deliverables
- Session types: `Session`, `SessionTokens`, `SESSION_OUTCOMES`
- HubStats (make it extensible with a generic `extensions` field instead of hardcoded `primitives` and `api`)

**The `HubStats` change:**

Replace the WavePoint-specific fields with an extension point:

```ts
export interface HubStats {
  process: { ... }      // keep
  portfolio: { ... }    // keep
  docs: { ... }         // keep
  conventions: { ... }  // keep
  sessions: { ... }     // keep
  // Replaces primitives + api with generic extension
  extensions: Record<string, Record<string, number>>
}
```

### Step 2: Create `packages/studio-core/src/types-extensions.ts`

Move the WavePoint-specific types here. This file imports from `@sherpa/studio-core/types` for any base types it extends.

```ts
// WavePoint-specific Studio type extensions
// These extend @sherpa/studio-core with domain-specific types

export const PRIMITIVE_LEVELS = ["L1", "L2", "L3", "L4", "L5"] as const
export type PrimitiveLevel = (typeof PRIMITIVE_LEVELS)[number]
// ... (all the primitives, endpoint, and research report types)
```

### Step 3: Update `packages/studio-core/src/types.ts` to re-export

```ts
// Re-export all framework types
export * from "@sherpa/studio-core/types"
// Re-export WavePoint extensions
export * from "./types-extensions"
```

This preserves all existing import paths — nothing else in the web app needs to change yet.

### Step 4: Copy `lifecycle.ts` and `process-nodes-shared.ts`

These files have zero dependencies on other studio modules. Copy directly:

- `packages/studio-core/src/lifecycle.ts` → `packages/studio-core/src/lifecycle.ts`
- `packages/studio-core/src/process-nodes-shared.ts` → `packages/studio-core/src/process-nodes-shared.ts`

No changes needed to either file.

### Step 5: Update the web app files to re-export from core

`packages/studio-core/src/lifecycle.ts`:
```ts
export { detectLifecycle, LIFECYCLE_STAGES } from "@sherpa/studio-core/lifecycle"
export type { LifecycleInfo, LifecycleStage } from "@sherpa/studio-core/lifecycle"
```

`packages/studio-core/src/process-nodes-shared.ts`:
```ts
export * from "@sherpa/studio-core/process-nodes-shared"
```

### Step 6: Update `packages/studio-core/src/index.ts` barrel

```ts
export * from "./types"
export * from "./lifecycle"
export * from "./process-nodes-shared"
```

### Step 7: Run typecheck across the monorepo

```bash
pnpm check
```

### Step 8: Commit

```bash
git commit -m "feat(studio-core): extract Layer 0 — types, lifecycle, process-nodes-shared"
```

---

## Task 3: Extract `@sherpa/studio-core` — Layer 0 (Self-Contained Modules)

These Layer 0 files are self-contained with their own frontmatter parsers. They don't import from other studio modules.

**Source → Destination:**

| Source | Destination | Changes |
|--------|-------------|---------|
| `packages/studio-core/src/tasks.ts` | `packages/studio-core/src/tasks.ts` | Make paths configurable via function parameter |
| `packages/studio-core/src/mcp.ts` | `packages/studio-core/src/mcp-dashboard.ts` | Rename to avoid confusion with MCP server; make paths configurable |

### Step 1: Extract `tasks.ts`

Copy to `packages/studio-core/src/tasks.ts`.

**Change required:** The current `tasks.ts` hardcodes `docs/tasks` path. Make the tasks directory path a parameter:

```ts
// Before (hardcoded)
const TASKS_DIR = path.resolve(...)

// After (configurable)
export function getTaskBoard(opts?: { tasksDir?: string }) {
  const tasksDir = opts?.tasksDir ?? "docs/tasks"
  // ...
}
```

Apply the same pattern to `getTaskDetail()` and `getTaskStats()`.

### Step 2: Extract `mcp.ts` → `mcp-dashboard.ts`

Copy `packages/studio-core/src/mcp.ts` → `packages/studio-core/src/mcp-dashboard.ts`.

Same configurable path pattern. Rename to avoid confusion with the MCP server package.

### Step 3: Update web app files to re-export

```ts
// packages/studio-core/src/tasks.ts
export * from "@sherpa/studio-core/tasks"
```

```ts
// packages/studio-core/src/mcp.ts
export { getMcpDashboard } from "@sherpa/studio-core/mcp-dashboard"
```

### Step 4: Commit

```bash
git commit -m "feat(studio-core): extract tasks and mcp-dashboard (Layer 0)"
```

---

## Task 4: Extract `@sherpa/studio-core` — Layer 1 (Schemas + Parsing)

**Source → Destination:**

| Source | Destination | Changes |
|--------|-------------|---------|
| `packages/studio-core/src/schemas.ts` | `packages/studio-core/src/schemas.ts` | Split: framework schemas stay, report schemas → extension |
| `packages/studio-core/src/markdown.ts` | `packages/studio-core/src/markdown.ts` | None (deps: zod, gray-matter, type-only import from types) |
| `packages/studio-core/src/activity-links.ts` | `packages/studio-core/src/activity-links.ts` | None (type-only dep on types) |
| `packages/studio-core/src/prompts.ts` | `packages/studio-core/src/prompts.ts` | None (type-only deps on types + process-nodes-shared) |

### Step 1: Split `schemas.ts`

Copy to `packages/studio-core/src/schemas.ts`.

**Remove WavePoint-specific schemas** from core:
- `primitiveManifestEntrySchema`, `primitiveManifestSchema`, `primitiveMetadataSchema` — primitives catalog
- `researchReportSchema`, `saturnReportSchema`, `eclipseReportSchema`, and all their sub-schemas — research report payloads
- `exportSignatureSchema` — primitives type signatures

**Keep in core:**
- `initiativeFrontmatterSchema`
- `workstreamFrontmatterSchema`
- `branchSeedFrontmatterSchema`
- `skillFrontmatterSchema`
- `agentRoleFrontmatterSchema`
- `sessionSchema`, `sessionTokensSchema`
- `chartSpecSchema`, `deckSpecSchema` (deliverables)
- `ruleFrontmatterSchema`

**Import change:** `schemas.ts` imports const arrays from `./types`. After split, import from the local core types:
```ts
import { INITIATIVE_STATUSES, ... } from "./types"
```

### Step 2: Create `packages/studio-core/src/schemas-extensions.ts`

Move WavePoint-specific schemas here. Import base types from core.

### Step 3: Update `packages/studio-core/src/schemas.ts` to re-export

```ts
export * from "@sherpa/studio-core/schemas"
export * from "./schemas-extensions"
```

### Step 4: Extract `markdown.ts`

Copy directly. Deps are `zod` and `gray-matter` (both in core's `dependencies`) + type-only import from `./types`.

### Step 5: Extract `activity-links.ts`

Copy directly. Type-only dep on `./types`.

### Step 6: Extract `prompts.ts`

Copy directly. Type-only deps on `./types` and `./process-nodes-shared`.

### Step 7: Update barrel, re-export files, typecheck, commit

```bash
git commit -m "feat(studio-core): extract Layer 1 — schemas, markdown, activity-links, prompts"
```

---

## Task 5: Extract `@sherpa/studio-core` — Catalogs (Empty Registries)

The catalog files have generic structure but WavePoint-specific content. Extract as empty registries with a registration API.

**Source → Destination:**

| Source | Destination | Changes |
|--------|-------------|---------|
| `packages/studio-core/src/primitives-catalog.ts` | `packages/studio-core/src/catalog.ts` | Generic registry pattern, empty by default |
| `packages/studio-core/src/api-catalog.ts` | (merged into `catalog.ts`) | Generic registry pattern |
| `packages/studio-core/src/api-endpoints.ts` | `packages/studio-core/src/api-endpoints.ts` | Use registry instead of import |
| `packages/studio-core/src/primitives.ts` | `packages/studio-core/src/primitives.ts` | Use registry instead of import |

### Step 1: Create `packages/studio-core/src/catalog.ts`

Generic catalog registry that consumers populate via config:

```ts
import type { PrimitiveCatalogEntry, EndpointCatalogEntry } from "./types"

// These types are defined in the consumer's types-extensions.
// The framework provides the registry pattern; consumers provide the content.

export interface CatalogRegistry<T> {
  entries: Map<string, T>
  register(slug: string, entry: T): void
  get(slug: string): T | undefined
  getAll(): T[]
}

export function createCatalogRegistry<T>(): CatalogRegistry<T> {
  const entries = new Map<string, T>()
  return {
    entries,
    register(slug, entry) { entries.set(slug, entry) },
    get(slug) { return entries.get(slug) },
    getAll() { return Array.from(entries.values()) },
  }
}
```

### Step 2: Create WavePoint registration

`packages/studio-core/src/catalogs.ts`:
```ts
import { createCatalogRegistry } from "@sherpa/studio-core/catalog"
import { PRIMITIVES_CATALOG } from "./primitives-catalog"
import { API_CATALOG } from "./api-catalog"

// Keep the original catalog files unchanged as data sources.
// Register their content into the framework registries.
export const primitivesRegistry = createCatalogRegistry<...>()
export const apiRegistry = createCatalogRegistry<...>()

// Populate from WavePoint data
for (const [slug, entry] of Object.entries(PRIMITIVES_CATALOG)) {
  primitivesRegistry.register(slug, { slug, ...entry })
}
for (const [slug, entry] of Object.entries(API_CATALOG)) {
  apiRegistry.register(slug, { slug, ...entry })
}
```

### Step 3: Extract `api-endpoints.ts` and `primitives.ts`

These files need their catalog imports changed from static data to registry lookups. The framework versions accept a registry parameter; the WavePoint wrappers pass in the populated registries.

### Step 4: Commit

```bash
git commit -m "feat(studio-core): extract catalogs as empty registries with registration API"
```

---

## Task 6: Extract `@sherpa/studio-core` — Layer 2 (I/O Layer)

**Source → Destination:**

| Source | Destination | Changes |
|--------|-------------|---------|
| `packages/studio-core/src/content.ts` | `packages/studio-core/src/content.ts` | Remove `server-only`; make project root configurable; remove CACHE_ROOT mechanism |
| `packages/studio-core/src/velocity.ts` | `packages/studio-core/src/velocity.ts` | Remove `server-only`; make git optional (graceful fallback) |
| `packages/studio-core/src/deliverables.ts` | `packages/studio-core/src/deliverables.ts` | Remove `server-only`; import content from local |
| `packages/studio-core/src/research-report.ts` | `packages/studio-core/src/research-report.ts` | Remove `server-only`; make report registry extensible |

### Step 1: Extract `content.ts` — configurable project root

The current `content.ts` has a CACHE_ROOT mechanism (dev reads monorepo root, prod reads `.studio-cache/`). For the framework:

```ts
// packages/studio-core/src/content.ts
import fs from "fs"
import path from "path"

let _projectRoot: string = process.cwd()

/** Set the project root for all file operations. */
export function setProjectRoot(root: string): void {
  _projectRoot = path.resolve(root)
}

/** Get the current project root. */
export function getProjectRoot(): string {
  return _projectRoot
}

/** Resolve a path relative to the project root. */
export function resolveProjectPath(relativePath: string): string {
  return path.resolve(_projectRoot, relativePath)
}

/** Read a file by relative path. Returns null if not found. */
export function readProjectFile(relativePath: string): string | null {
  try {
    return fs.readFileSync(resolveProjectPath(relativePath), "utf-8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

// ... remaining functions (listMarkdownFiles, listSubdirectories, etc.)
// Same logic but using resolveProjectPath() instead of resolveMonorepoPath()
```

**Key change:** Remove `import "server-only"`. The `server-only` guard is a Next.js concern — consumers add it in their wrapper if needed.

**Naming:** Rename functions from `*Monorepo*` to `*Project*` (`readMonorepoFile` → `readProjectFile`, `resolveMonorepoPath` → `resolveProjectPath`). This is a generic framework, not a monorepo-specific tool.

### Step 2: Update Sherpa's `content.ts` to wrap core

```ts
// packages/studio-core/src/content.ts
import "server-only"
import {
  setProjectRoot,
  readProjectFile,
  resolveProjectPath,
  // ...
} from "@sherpa/studio-core/content"
import path from "path"

// WavePoint-specific: dev reads monorepo root, prod reads .studio-cache/
const CACHE_ROOT =
  process.env.NODE_ENV === "development"
    ? path.resolve(process.cwd(), "../..")
    : path.resolve(process.cwd(), ".studio-cache")

setProjectRoot(CACHE_ROOT)

// Re-export with Sherpa's legacy names for backward compatibility
export const MONOREPO_ROOT = path.resolve(process.cwd(), "../..")
export function resolveMonorepoPath(p: string) { return resolveProjectPath(p) }
export function readMonorepoFile(p: string) { return readProjectFile(p) }
export {
  getFileStats,
  listMarkdownFiles,
  listJsonFiles,
  listSubdirectories,
  countFiles,
  findClaudeMdFiles,
} from "@sherpa/studio-core/content"
```

### Step 3: Extract `velocity.ts` — optional git

Remove `server-only`. Make `execSync` usage graceful:

```ts
function getGitStaleness(slug: string, projectRoot: string): number | null {
  try {
    const result = execSync(
      `git log --format="%ai" -1 -- "docs/initiatives/${slug}/"`,
      { cwd: projectRoot, timeout: 5000, encoding: "utf-8" },
    ).trim()
    // ...
  } catch {
    return null  // git not available — graceful fallback
  }
}
```

The function already catches errors and returns null, so this is mostly about removing `server-only` and using `getProjectRoot()` instead of `MONOREPO_ROOT`.

### Step 4: Extract `deliverables.ts` and `research-report.ts`

Remove `server-only`. Update imports from `./content` and `./schemas` to local paths. Make the research report registry extensible:

```ts
// Framework provides base registry + registration
const REPORT_REGISTRY = new Map<string, { filePath: string }>()

export function registerResearchReport(slug: string, filePath: string) {
  REPORT_REGISTRY.set(slug, { filePath })
}

export function getResearchReport(slug: string) {
  const entry = REPORT_REGISTRY.get(slug)
  if (!entry) return null
  // ... read and parse
}
```

### Step 5: Commit

```bash
git commit -m "feat(studio-core): extract Layer 2 — content, velocity, deliverables, research-report"
```

---

## Task 7: Extract `@sherpa/studio-core` — Layer 3 (Composites)

**Source → Destination:**

| Source | Destination | Changes |
|--------|-------------|---------|
| `packages/studio-core/src/file-tree.ts` | `packages/studio-core/src/file-tree.ts` | Remove `server-only`; inject URL builder via parameter instead of importing `@/lib/content-urls` |
| `packages/studio-core/src/process-nodes.ts` | `packages/studio-core/src/process-nodes.ts` | Remove `server-only` |
| `packages/studio-core/src/index.ts` | `packages/studio-core/src/index.ts` | Extract domain functions; remove `server-only` |

### Step 1: Extract `file-tree.ts` — injectable URL builder

The ONE external import: `researchReportUrl` from `@/lib/content-urls`. Replace with an injectable function parameter:

```ts
// packages/studio-core/src/file-tree.ts

export interface FileTreeOptions {
  /** URL builder for research report links. If not provided, no reportHref is set. */
  researchReportUrl?: (slug: string) => string
}

function buildResearchChildren(
  basePath: string,
  research: InitiativeResearch | null,
  options?: FileTreeOptions,
): FileTreeNode[] {
  // ... existing logic, but where it used researchReportUrl(parsed.id):
  meta: {
    reportHref: options?.researchReportUrl?.(parsed.id)
  }
}
```

Propagate the options parameter through `buildInitiativeFileTree` and `buildBranchFileTree`.

### Step 2: Update Sherpa's wrapper to inject URL builder

```ts
// packages/studio-core/src/file-tree.ts
import "server-only"
import {
  buildInitiativeFileTree as coreBuildInitiativeFileTree,
  buildBranchFileTree as coreBuildBranchFileTree,
} from "@sherpa/studio-core/file-tree"
import { researchReportUrl } from "@/lib/content-urls"

const FILE_TREE_OPTIONS = { researchReportUrl }

export function buildInitiativeFileTree(...args) {
  return coreBuildInitiativeFileTree(...args, FILE_TREE_OPTIONS)
}
// Similar for buildBranchFileTree
```

### Step 3: Extract `process-nodes.ts`

Remove `server-only`. Update internal imports to core paths. No other changes needed.

### Step 4: Extract domain functions from `index.ts`

The barrel `index.ts` is both a barrel (re-exports) AND a domain orchestrator (~800 lines of functions like `getInitiatives()`, `getPortfolio()`, `getSkills()`, etc.).

Split into:
- `packages/studio-core/src/domain.ts` — all the domain functions (getInitiatives, getPortfolio, getConventions, getSkills, getAgentRoles, getSessions, getHubStats, etc.)
- `packages/studio-core/src/index.ts` — barrel re-exporting everything

The domain functions need their `import "server-only"` removed and their internal imports updated.

### Step 5: Update the barrel

`packages/studio-core/src/index.ts`:
```ts
// Types and schemas
export * from "./types"
export * from "./schemas"

// Pure logic
export * from "./lifecycle"
export * from "./process-nodes-shared"

// Self-contained modules
export * from "./tasks"
export * from "./mcp-dashboard"

// Parsing
export * from "./markdown"
export * from "./activity-links"
export * from "./prompts"

// Catalogs
export * from "./catalog"
export * from "./api-endpoints"
export * from "./primitives"

// I/O
export * from "./content"
export * from "./velocity"
export * from "./deliverables"
export * from "./research-report"

// Composites
export * from "./file-tree"
export * from "./process-nodes"
export * from "./domain"
```

### Step 6: Full monorepo typecheck + commit

```bash
pnpm check
git commit -m "feat(studio-core): extract Layer 3 — file-tree, process-nodes, domain functions"
```

---

## Task 8: Implement `defineConfig()` + Config System

**Files:**
- Create: `packages/studio-core/src/config/index.ts`
- Create: `packages/studio-core/src/config/types.ts`
- Create: `packages/studio-core/src/config/defaults.ts`
- Create: `packages/studio-core/src/config/schema.ts`

### Step 1: Create config types

`packages/studio-core/src/config/types.ts`:

Use the TypeScript types drafted in `research/iteration-2/vector-2-config-as-code-entrypoint.md`. The complete type definitions are there. Key interfaces:

- `SherpaUserConfig` — what consumers write
- `SherpaConfig` — fully resolved after defaults + plugins
- `AdminConfig`, `ThemeConfig`, `VocabularyConfig`, `PathsConfig`
- `EntitiesConfig`, `AgentsConfig`, `McpConfig`
- `LifecycleStageDefinition`
- `SherpaPlugin` — `(config: SherpaConfig) => SherpaConfig`

### Step 2: Create defaults

`packages/studio-core/src/config/defaults.ts`:

```ts
import type { SherpaConfig, PathsConfig, VocabularyConfig } from "./types"

export const DEFAULT_PATHS: Required<PathsConfig> = {
  initiatives: "docs/initiatives",
  tasks: "docs/tasks",
  agentRoles: "docs/agents/roles",
  rules: ".claude/rules",
  skills: ".claude/skills",
  sessions: "docs/sessions",
  research: "docs/research",
  roadmap: "docs/roadmap.md",
  mcpConfig: ".mcp.json",
  archive: ".archive",
}

export const DEFAULT_VOCABULARY: Required<VocabularyConfig> = {
  initiative: "Initiative",
  initiativePlural: "Initiatives",
  proposal: "Proposal",
  proposalPlural: "Proposals",
  task: "Task",
  taskPlural: "Tasks",
  agent: "Agent",
  agentPlural: "Agents",
  role: "Role",
  rolePlural: "Roles",
  statusPending: "Pending",
  statusApproved: "Approved",
  statusInProgress: "In Progress",
  statusIntegrated: "Integrated",
  statusDeclined: "Declined",
  statusArchived: "Archived",
  dashboard: "Dashboard",
  process: "Process",
  research: "Research",
  conventions: "Conventions",
  portfolio: "Portfolio",
}

// ... defaults for admin, theme, entities, agents, mcp, lifecycle
```

### Step 3: Create Zod validation schema

`packages/studio-core/src/config/schema.ts`:

Zod schema mirroring `SherpaUserConfig`. Validates at startup, fills defaults.

### Step 4: Implement `defineConfig()` and `createPlugin()`

`packages/studio-core/src/config/index.ts`:

```ts
import type { SherpaUserConfig, SherpaConfig, SherpaPlugin } from "./types"
import { buildDefaults } from "./defaults"
import { userConfigSchema } from "./schema"

export function defineConfig(userConfig: SherpaUserConfig): SherpaConfig {
  // 1. Validate with Zod
  const validated = userConfigSchema.parse(userConfig)

  // 2. Merge with defaults
  let config = buildDefaults(validated)

  // 3. Apply plugins in order
  for (const plugin of config.plugins) {
    config = plugin(config)
  }

  return config
}

export function createPlugin<TOptions>(
  factory: (options: TOptions) => SherpaPlugin
): (options: TOptions) => SherpaPlugin {
  return factory
}

export { withSherpa } from "./next-wrapper"
export type * from "./types"
```

### Step 5: Implement `withSherpa()` Next.js wrapper (stub)

`packages/studio-core/src/config/next-wrapper.ts`:

```ts
import type { NextConfig } from "next"

/**
 * Wraps next.config.ts to inject Sherpa Studio routes.
 * MVP: just adds transpilePackages. Full route injection is Phase 3+.
 */
export function withSherpa(
  nextConfig: NextConfig,
  _sherpaConfigPath?: string,
): NextConfig {
  const existing = nextConfig.transpilePackages ?? []
  return {
    ...nextConfig,
    transpilePackages: [
      ...existing,
      "@sherpa/studio-core",
      "@sherpa/studio-ui",
      "@sherpa/studio",
    ],
  }
}
```

### Step 6: Hook config into content module

Update `packages/studio-core/src/content.ts` to optionally read from config:

```ts
import { getProjectRoot } from "./content"

// When defineConfig() is called, it calls setProjectRoot() with the resolved projectDir.
// This connects the config system to the content module.
```

### Step 7: Commit

```bash
git commit -m "feat(studio-core): implement defineConfig(), defaults, Zod validation, withSherpa()"
```

---

## Task 9: Extract `@sherpa/studio-ui` — Components

**Scope:** 91 of 96 components are domain-agnostic. 5 are excluded.

**Files:**
- Move: 91 `.tsx` files from `packages/studio-ui/src/` → `packages/studio-ui/src/`
- Create: `packages/studio-ui/src/lib/utils.ts` (bundled `cn()` helper)
- Create: `packages/studio-ui/src/lib/animation-constants.ts` (bundled easing values)

### Step 1: Bundle shared utilities

`packages/studio-ui/src/lib/utils.ts`:
```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`packages/studio-ui/src/lib/animation-constants.ts`:

Copy the animation constants from `apps/web/src/lib/animation-constants.ts`. These are simple easing values and durations — no dependencies.

### Step 2: Move 91 components

For each component, the import rewrites needed:

| Old Import | New Import |
|------------|-----------|
| `from "@/lib/studio"` or `from "@/lib/studio/*"` | `from "@sherpa/studio-core"` or subpath |
| `from "@/lib/utils"` | `from "../lib/utils"` (bundled) |
| `from "@/lib/animation-constants"` | `from "../lib/animation-constants"` (bundled) |
| `from "@/components/ui/*"` | Keep as peer dep — consumer provides shadcn/ui |

**The shadcn/ui peer dependency strategy:**

Components import from `@/components/ui/*` (e.g., `@/components/ui/button`). For the framework, these become peer dependencies. Two approaches:

**Option A (recommended for JIT phase):** Keep `@/` imports — the consuming Next.js app already has the path alias. No change needed during JIT phase.

**Option B (for Publishable phase):** Add a `ui` export mapping in `package.json` or use a path alias in tsconfig. Address when graduating to publishable.

### Step 3: Exclude 5 domain-coupled components

These stay in `packages/studio-ui/src/`:
1. `hub-transit-content-panel.tsx`
2. `pipeline-control-center.tsx`
3. `coverage-timeline.tsx`
4. `transit-content-mini-donut.tsx`
5. `content-system-guide.tsx`

### Step 4: Create barrel export

`packages/studio-ui/src/index.ts`:

Export all 91 components. Group by domain:

```ts
// Hub panels
export { HubCard } from "./hub-card"
export { HubActivityPanel } from "./hub-activity-panel"
// ... etc

// Process
export { ProcessDashboard } from "./process-dashboard"
export { ProcessWorkspace } from "./process-workspace"
// ... etc

// Initiative
export { InitiativeCard } from "./initiative-card"
// ... etc
```

### Step 5: Update web app imports

Each moved component gets a re-export stub in the old location:

```ts
// packages/studio-ui/src/hub-card.tsx
export { HubCard } from "@sherpa/studio-ui"
```

Or update imports directly if there aren't too many consumers. Search for import patterns first:

```bash
grep -r "from.*@/components/studio/" apps/web/src/app/ --include="*.tsx" | wc -l
```

### Step 6: Commit

```bash
git commit -m "feat(studio-ui): extract 91 domain-agnostic components"
```

---

## Task 10: Extract `@sherpa/studio-mcp` — MCP Task Server

**Source:** `scripts/studio-mcp-server.ts`

**Files:**
- Create: `packages/studio-mcp/src/server.ts`
- Create: `packages/studio-mcp/src/index.ts`
- Modify: `.mcp.json` (point to new location)

### Step 1: Copy and adapt the MCP server

`packages/studio-mcp/src/server.ts`:

```ts
#!/usr/bin/env node
```

**Changes from source:**
1. Replace `#!/usr/bin/env bun` with `#!/usr/bin/env node` (decouple from bun)
2. Replace `import.meta.dir` root discovery with:
   ```ts
   const REPO_ROOT = process.env.SHERPA_PROJECT_ROOT
     ?? findGitRoot()
     ?? process.cwd()

   function findGitRoot(): string | null {
     try {
       return execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim()
     } catch { return null }
   }
   ```
3. Make `TASKS_DIR` and `LOGS_DIR` relative to `REPO_ROOT` using configurable paths
4. Keep the same MCP tool definitions (task_list, task_get, task_create, task_update, task_dispatch, task_logs, lm_status)

### Step 2: Create barrel

`packages/studio-mcp/src/index.ts`:

```ts
export { createStudioMcpServer } from "./server"
```

Export a factory function for programmatic usage, while the `bin` entry runs standalone.

### Step 3: Update `.mcp.json`

```json
{
  "studio": {
    "command": "node",
    "args": ["packages/studio-mcp/src/server.ts"],
    "env": {
      "SHERPA_PROJECT_ROOT": "."
    }
  }
}
```

Or keep using bun during JIT phase:
```json
{
  "studio": {
    "command": "bun",
    "args": ["packages/studio-mcp/src/server.ts"]
  }
}
```

### Step 4: Commit

```bash
git commit -m "feat(studio-mcp): extract MCP task server as standalone package"
```

---

## Task 11: Design `@sherpa/studio-cli` — `sherpa init` + `sherpa sync`

This is **new code**, not extraction. The CLI scaffolds new projects and syncs convention files.

**Files:**
- Create: `packages/studio-cli/package.json`
- Create: `packages/studio-cli/src/index.ts` (CLI entry)
- Create: `packages/studio-cli/src/commands/init.ts`
- Create: `packages/studio-cli/src/commands/sync.ts`
- Create: `packages/studio-cli/src/manifest.ts`
- Create: `packages/studio-cli/src/merge.ts`

### Step 1: Create `packages/studio-cli/package.json`

```json
{
  "name": "@sherpa/studio-cli",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": {
    "sherpa": "./src/index.ts"
  },
  "dependencies": {
    "node-diff3": "^3.2.0",
    "diff": "^7.0.0",
    "@inquirer/prompts": "^7.0.0",
    "chalk": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "@types/diff": "^6.0.0"
  }
}
```

### Step 2: Implement `sherpa init`

Scaffolds convention files into a new project:
1. Create `.claude/rules/` with framework convention files
2. Create `docs/initiatives/`, `docs/tasks/`, `docs/agents/roles/`
3. Create `sherpa.config.ts` with minimal config
4. Create `sherpa.manifest.json` with initial hashes
5. Create `.sherpa/cache/` (gitignored)

### Step 3: Implement `sherpa sync`

Follow the algorithm from `research/iteration-2/vector-1-convention-sync-cli.md`:

```ts
// packages/studio-cli/src/commands/sync.ts

import { diff3Merge } from "node-diff3"
import { createPatch } from "diff"
import { select } from "@inquirer/prompts"
import chalk from "chalk"

export async function sync() {
  // 1. Read sherpa.manifest.json
  // 2. For each managed file: compare hashes, classify status
  // 3. Display summary table
  // 4. For diverged files: three-way merge via node-diff3
  // 5. Interactive prompt per file
  // 6. Update manifest
}
```

### Step 4: Implement manifest schema

`packages/studio-cli/src/manifest.ts`:

```ts
export interface SherpaManifest {
  $schema: "sherpa/manifest@1"
  frameworkVersion: string
  syncedAt: string
  files: Record<string, ManifestFileEntry>
}

export interface ManifestFileEntry {
  upstreamHash: string
  localHashAtSync: string
  status: "synced" | "modified" | "new" | "deleted" | "diverged" | "orphaned"
  syncedVersion: string
  syncedAt: string
}
```

### Step 5: Commit

```bash
git commit -m "feat(studio-cli): implement sherpa init + sherpa sync with three-way merge"
```

---

## Task 12: WavePoint as First Consumer — Migration

Switch Sherpa's `apps/web/` from direct `@/lib/studio` imports to consuming `@sherpa/studio-*` packages.

**This task has two approaches, choose based on context:**

### Approach A: Thin Wrapper (recommended for JIT phase)

Keep `packages/studio-core/src/` as a thin wrapper layer that:
1. Adds `import "server-only"` guard
2. Sets WavePoint-specific config (CACHE_ROOT, catalog data, URL builders)
3. Re-exports from `@sherpa/studio-core`

Existing app code (`src/app/app/studio/` routes) continues to import from `@/lib/studio`. The wrapper is the seam.

**This is what Tasks 2-7 already set up.** After those tasks, the wrapper files exist and working. This task is about verifying completeness and creating `sherpa.config.ts`.

### Approach B: Direct Migration (for Publishable phase)

Update all `@/lib/studio` imports to `@sherpa/studio-core` imports directly. Remove the wrapper layer. This is a larger change — defer to when packages are published and stable.

### Step 1: Create Sherpa's `sherpa.config.ts`

`apps/web/sherpa.config.ts`:

```ts
import { defineConfig } from "@sherpa/studio/config"

export default defineConfig({
  projectDir: process.cwd(),
  admin: {
    titleSuffix: "Studio",
    basePath: "/app/studio",
    defaultColorMode: "dark",
  },
  vocabulary: {
    initiative: "Initiative",
    task: "Task",
    agent: "Agent",
  },
  paths: {
    initiatives: "docs/initiatives",
    tasks: "docs/tasks",
    agentRoles: "docs/agents/roles",
  },
})
```

### Step 2: Register WavePoint catalogs

The wrapper layer registers WavePoint-specific catalog entries (primitives, API endpoints, research report types) into the framework registries.

### Step 3: Verify all Studio routes still work

```bash
pnpm dev
# Navigate to /app/studio/ and verify:
# - Hub dashboard renders
# - Initiative list loads
# - Task board displays
# - Agent roles render
# - Process graph works
```

### Step 4: Run existing tests

```bash
pnpm test -- --grep studio
```

### Step 5: Commit

```bash
git commit -m "feat: WavePoint as first @sherpa/studio consumer with sherpa.config.ts"
```

---

## Task 13: Publishing Pipeline Setup

Prepare for npm publishing. Defer actual publishing until Sherpa (`../sherpa`) exists as consumer.

**Files:**
- Create: `.changeset/config.json`
- Create: `packages/studio-core/tsup.config.ts`
- Create: `packages/studio-ui/tsup.config.ts`
- Create: `packages/studio-mcp/tsup.config.ts`
- Create: `packages/studio-cli/tsup.config.ts`
- Modify: each package's `package.json` (add build scripts, dist paths)

### Step 1: Install Changesets

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

### Step 2: Configure Changesets fixed mode

`.changeset/config.json`:
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [["@sherpa/studio-core", "@sherpa/studio-ui", "@sherpa/studio-mcp", "@sherpa/studio-cli", "@sherpa/studio"]],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Step 3: Add tsup build configs

`packages/studio-core/tsup.config.ts`:
```ts
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/config/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["zod", "gray-matter"],
})
```

### Step 4: Update package.json for Publishable (when ready)

When graduating from JIT to Publishable, update each `package.json`:

```json
{
  "private": false,
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "check": "tsc --noEmit"
  },
  "files": ["dist", "src"]
}
```

**Do NOT make this change during JIT phase.** The JIT `exports` point at `.ts` source files. Only switch to `dist/` when ready to publish.

### Step 5: Document yalc workflow

For testing across repos (WavePoint + Sherpa):

```bash
# In the source monorepo:
cd packages/studio-core
pnpm build
yalc publish

# In ../sherpa:
yalc add @sherpa/studio-core
pnpm install
```

### Step 6: Commit

```bash
git commit -m "feat: Changesets config + tsup build configs for publishing pipeline"
```

---

## Open Questions — Resolved in Plan

| Question | Decision |
|----------|----------|
| **`createStudio(config)` API** | Deferred to post-extraction. `defineConfig()` + `setProjectRoot()` is sufficient for JIT phase. The data access layer (`getInitiatives()`, etc.) works via module-level state set by the config. |
| **How do plugins register catalog entries?** | Config-based. Plugins modify the `entities` config field. The `createCatalogRegistry()` utility handles runtime registration. |
| **`server-only` strategy** | Strip during extraction. Consumers add `import "server-only"` in their wrapper files. Framework code is environment-agnostic. |
| **Testing strategy** | During JIT: tests stay in `apps/web` (they test through the wrapper). Post-extraction: add vitest to each package with standalone test fixtures. |
| **`turbo.json`** | Skip for now. pnpm workspace scripts suffice. Add turbo.json if build caching becomes valuable (likely when packages have build steps in Publishable phase). |

---

## Session Breakdown

**Effort:** 8-10 sessions

| Session | Tasks | What Gets Done |
|---------|-------|---------------|
| 1 | Task 1 | Package scaffolding — directories, package.json, tsconfig, workspace linking |
| 2 | Tasks 2-3 | Layer 0 extraction — types (split), lifecycle, process-nodes-shared, tasks, mcp-dashboard |
| 3 | Tasks 4-5 | Layer 1 extraction — schemas (split), markdown, activity-links, prompts, catalogs |
| 4 | Task 6 | Layer 2 extraction — content (configurable root), velocity (optional git), deliverables, research-report |
| 5 | Tasks 7-8 | Layer 3 extraction — file-tree (injectable URL), process-nodes, domain functions, defineConfig() + config system |
| 6 | Task 9 | UI extraction — 91 components, cn() bundling, animation constants, shadcn peer deps |
| 7 | Task 10 | MCP extraction — standalone server, Node.js shebang, configurable project root |
| 8 | Task 11 | CLI — sherpa init + sherpa sync (new code, convention sync with node-diff3) |
| 9 | Task 12 | WavePoint migration — sherpa.config.ts, catalog registration, verify all routes |
| 10 (if needed) | Task 13 | Publishing pipeline — Changesets, tsup configs, yalc workflow documentation |

Sessions 1-5 form the critical path (`@sherpa/studio-core`). Sessions 6-8 are independent and can run in parallel once core is stable. Session 9 is the integration test. Session 10 is deferred until a second consumer (Sherpa) exists.

### Parallelization Opportunities

After session 5, these are independent:
- Session 6 (UI) — needs only core types
- Session 7 (MCP) — standalone server, minimal core dependency
- Session 8 (CLI) — entirely new code

A parallel session dispatch could complete sessions 6+7+8 concurrently.

---

## Verification Checklist

After each extraction session, verify:

- [ ] `pnpm check` passes across all packages
- [ ] `pnpm test` passes in `apps/web`
- [ ] `pnpm dev` starts without errors
- [ ] Studio routes render correctly at `/app/studio/`
- [ ] No circular dependencies between packages (core ← ui, not ui → core → ui)
- [ ] No `@/lib/studio` imports remain in `packages/studio-core/src/`
- [ ] No `server-only` imports in any `packages/` directory
- [ ] All re-export stubs in `packages/studio-core/src/` match core exports
