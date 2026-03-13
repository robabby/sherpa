# Vector 3: Extraction Dependency Graph

**Question:** What is the concrete extraction dependency graph for Studio's lib and component layers?
**Agent dispatched:** 2026-03-11

## Findings

### File Inventory

21 files in `packages/studio-core/src/` (19 source + 1 test + 1 barrel). 96 components in `packages/studio-ui/src/`.

### LAYER 0 — Leaf Nodes (zero studio dependencies)

These files import nothing from other studio modules. Extract first with zero risk.

| File | Exports | External Deps | Notes |
|------|---------|---------------|-------|
| `types.ts` | All type interfaces + const arrays | None | Foundation of everything |
| `lifecycle.ts` | `detectLifecycle()`, `LIFECYCLE_STAGES` | None | Pure function, no I/O |
| `process-nodes-shared.ts` | `ProcessNode`, `FileTreeNode`, filters, graph logic | None | Shared between server/client |
| `tasks.ts` | `getTaskBoard()`, `getTaskDetail()`, `getTaskStats()` | `fs`, `path` | Self-contained (own frontmatter parser) |
| `mcp.ts` | `getMcpDashboard()` | `fs`, `path` | Self-contained |
| `content.ts` | `readMonorepoFile()`, `resolveMonorepoPath()`, filesystem primitives | `fs`, `path`, `server-only` | I/O foundation |
| `primitives-catalog.ts` | `PRIMITIVES_CATALOG` (static data) | None | Type-only dep on types.ts |
| `api-catalog.ts` | `API_CATALOG` (static data) | None | Type-only dep on types.ts |

### LAYER 1 — Single Dependency

| File | Depends On | Exports |
|------|-----------|---------|
| `schemas.ts` | `types.ts` (const arrays) | All Zod schemas |
| `markdown.ts` | `types.ts` (type-only) | `parseFrontmatter()`, `extractTitle()`, parsing utilities |
| `activity-links.ts` | `types.ts` (type-only) | `parseActivityDescription()`, `processActivityData()` |
| `api-endpoints.ts` | `api-catalog.ts`, `types.ts` | `getApiCatalog()`, `groupEndpointsByTag()` |
| `prompts.ts` | `types.ts`, `process-nodes-shared.ts` (type-only) | Prompt generation functions |

### LAYER 2 — Multi-dependency

| File | Depends On | Exports | Notes |
|------|-----------|---------|-------|
| `primitives.ts` | `primitives-catalog.ts`, `schemas.ts`, `types.ts` | `getPrimitivesCatalog()`, dependency mapping | |
| `velocity.ts` | `content.ts`, `types.ts` | `getInitiativeVelocity()`, staleness detection | Uses `execSync` for git |
| `deliverables.ts` | `content.ts`, `schemas.ts`, `types.ts` | `getDeliverables()`, `getDeliverable()` | |
| `research-report.ts` | `content.ts`, `schemas.ts`, `types.ts` | `getResearchReport()`, registry | |
| `file-tree.ts` | `content.ts`, `markdown.ts`, `process-nodes-shared.ts`, `types.ts`, **`@/lib/content-urls`** | `buildInitiativeFileTree()` | **ONE external import** |

### LAYER 3 — Root Modules

| File | Depends On | Notes |
|------|-----------|-------|
| `process-nodes.ts` | `content.ts`, `types.ts`, `process-nodes-shared.ts`, `velocity.ts`, `lifecycle.ts` | Big composer function |
| `index.ts` | ALL modules | Barrel + domain orchestrator functions |

### Dependency Graph (ASCII)

```
LAYER 0 (Leaves — extract first)
─────────────────────────────────
types.ts              ← Foundation (all types + const arrays)
lifecycle.ts          ← Pure logic (zero deps)
process-nodes-shared.ts ← Shared types + filters (zero deps)
tasks.ts              ← Self-contained (own frontmatter parser)
mcp.ts                ← Self-contained
content.ts            ← Filesystem I/O primitives
primitives-catalog.ts ← Static data (type-only → types.ts)
api-catalog.ts        ← Static data (type-only → types.ts)

LAYER 1 (Single dependency)
────────────────────────────
schemas.ts           → types.ts
markdown.ts          → types.ts (type-only)
activity-links.ts    → types.ts (type-only)
api-endpoints.ts     → api-catalog.ts, types.ts
prompts.ts           → types.ts, process-nodes-shared.ts (type-only)

LAYER 2 (Multi-dependency)
──────────────────────────
primitives.ts        → primitives-catalog.ts, schemas.ts, types.ts
velocity.ts          → content.ts, types.ts
deliverables.ts      → content.ts, schemas.ts, types.ts
research-report.ts   → content.ts, schemas.ts, types.ts
file-tree.ts         → content.ts, markdown.ts, process-nodes-shared.ts, types.ts
                       + @/lib/content-urls (EXTERNAL — only non-studio import)

LAYER 3 (Roots)
───────────────
process-nodes.ts     → content.ts, types.ts, process-nodes-shared.ts, velocity.ts, lifecycle.ts
index.ts             → ALL modules (barrel + domain functions)
```

### Circular Dependencies

**None.** The dependency graph is a clean DAG. No file imports from a module that imports back to it. Excellent for extraction.

### External Dependencies Summary

| Dependency | Used By | Type |
|---|---|---|
| `zod` | schemas.ts, markdown.ts | Runtime |
| `gray-matter` | markdown.ts | Runtime |
| `fs`, `path` | 8 files | Node stdlib |
| `child_process` | velocity.ts (execSync for git) | Node stdlib |
| `server-only` | 7 files | Next.js guard |
| `@/lib/content-urls` | file-tree.ts (1 function) | **ONLY external app import** |

### The ONE Coupling Point

`file-tree.ts` imports `researchReportUrl` from `@/lib/content-urls` to generate `/app/studio/research/<id>` URLs. Fix: make injectable via config parameter or inline the trivial URL construction. 5-minute fix.

### Recommended Extraction Sequence for `@sherpa/studio-core`

**Phase 1 — Foundation (zero changes):** types.ts, lifecycle.ts, process-nodes-shared.ts, tasks.ts, mcp.ts

**Phase 2 — Schemas + Parsing:** schemas.ts (requires zod), markdown.ts (requires gray-matter), activity-links.ts

**Phase 3 — Data Catalogs:** primitives-catalog.ts, api-catalog.ts, api-endpoints.ts, prompts.ts. Note: catalog files contain WavePoint-specific entries but have a generic structure — extract as empty registries with registration API.

**Phase 4 — I/O Layer:** content.ts (needs `server-only` → configurable), primitives.ts, velocity.ts, deliverables.ts, research-report.ts

**Phase 5 — Composites:** file-tree.ts (decouple external import first), process-nodes.ts, index.ts (barrel + domain functions)

### `server-only` Guard

7 files import `server-only` (Next.js build-time guard preventing client-side import). For non-Next.js consumers this must be made configurable — either conditional import or stripped during build.

### Component Layer Analysis

**96 total components.** Dependencies:

| Import Source | Components | Domain-Coupled? |
|---|---|---|
| `@/lib/studio` | ~80 | No (becomes `@sherpa/studio-core`) |
| `@/lib/utils` (cn) | ~50 | No (trivially replaceable) |
| `@/components/ui/*` (shadcn) | ~25 | No (peer dependency) |
| `@/lib/animation-constants` | 8 | Mild (simple easing constants, bundleable) |
| `@/lib/transit-content/*` | 5 | **YES — domain-coupled** |

### 5 Domain-Coupled Components

1. `hub-transit-content-panel.tsx` — imports `TransitContentHubData`
2. `pipeline-control-center.tsx` — imports `PipelineFileState`
3. `coverage-timeline.tsx` — imports `MonthlyDensityPoint`
4. `transit-content-mini-donut.tsx` — imports `ContentStatusBreakdown`
5. `content-system-guide.tsx` — imports from `@/lib/transit-content/system-guide`

**Recommendation:** Exclude from `@sherpa/studio-ui` v0.1. They are WavePoint-specific content pipeline dashboards. Ship as WavePoint extensions.

### `@sherpa/studio-ui` v0.1 Scope

**91 of 96 components** are domain-agnostic and ready for extraction. They depend only on studio-core, shadcn (peer dep), cn helper (trivially included), and animation constants (bundleable).

## Implications

- The lib layer is exceptionally well-structured for extraction — clean DAG, zero circular deps, only 1 external import
- `@sherpa/studio-core` can be extracted in 5 phases following the dependency layers
- `@sherpa/studio-ui` v0.1 ships 91/96 components with only 5 excluded as domain extensions
- The `primitives-catalog.ts` and `api-catalog.ts` files need to become empty registries with a registration API — their structure is generic but their content is WavePoint-specific
- `server-only` in 7 files needs to be made configurable for non-Next.js consumers

## Open Questions

- Should `content.ts` (filesystem I/O) be configurable for non-Node.js environments, or is Node.js a hard requirement?
- How should the catalog registration API work? Plugin-based (plugins register catalog entries) or config-based (config file lists catalog paths)?
- Should `velocity.ts` (which shells out to `git`) be an optional module? Not all consumers will have git available.
