# Vector 2: Multi-Workspace Federation in Dev Tools

**Question:** How do developer tools handle multi-project/multi-root workspaces in a single UI?
**Agent dispatched:** 2026-03-20

## Findings

### VS Code Multi-Root Workspaces
- `.code-workspace` JSON file lists folder roots. Explorer shows all as peer nodes
- **Three-tier settings merge:** User > Workspace > Folder. Primitives/arrays: later overrides. Objects: deep-merged
- **Window-level vs resource-level distinction:** window settings (zoom) can't vary per folder; resource settings (formatter) can
- Global search spans all roots, grouping by folder. Scope with `./` prefix
- **Complaints:** Many extensions don't support multi-root API. No "active project" concept. Language servers sometimes fail cross-project

### Nx Workspace
- Projects discovered by `project.json` or `package.json` presence. Plugin system for custom detection
- **`nx.json`** defines workspace-wide defaults. Per-project `project.json` overrides. Merge: project > targetDefaults > inferred
- **Project graph** auto-constructed from TS imports and package.json deps. Interactive visualization with filter/group/drill
- **Nx Console** (IDE extension): project tree view, inline actions, Project Details View, integrated graph visualization
- **Affected commands** use graph to only run tasks for changed projects

### JetBrains IDEs
- Historically: one project = one window. Modules are sub-units, not independent roots
- **2024 Workspaces** (preview): workspace folder stores references to projects elsewhere. Projects retain original configs
- Settings copied to workspace folder. One project can belong to multiple workspaces with different settings
- **Still in incubation** — run configs must be re-created, no settings sync, `.idea` folder makes VCS sharing tricky

### Turborepo
- `turbo.json` at root, per-package overrides via `"extends": ["//"]`
- Scalar fields inherit/override. Array fields replace by default; `$TURBO_EXTENDS$` to append
- **No built-in UI or dashboard** — CLI-only. Graph output is static graphviz. Major gap vs Nx
- Filtering: `--filter=@repo/ui` scopes execution to single package

### Backstage (Spotify)
- Every entity in `catalog-info.yaml` colocated with source. Kinds: Component, API, System, Domain, Resource, Group, User
- **Relationships** form a software graph: `providesApi`, `consumesApi`, `dependsOn`, `partOf`, `ownedBy`
- Catalog list view: filterable table. Default: "owned by my team." "All" toggle for everything
- **System** groups related components — closest to "project selector"
- **Complaints:** Not turnkey (2-5 engineers, 6-12 months). Rigid data model. YAML drift. Low adoption without curation

## Common Patterns

1. **Config layering:** global > workspace > project with override semantics (universal)
2. **Project discovery via convention:** marker files (`package.json`, `project.json`, `catalog-info.yaml`), not central manifest
3. **Flat list with filters, not deep nesting:** Backstage, Nx Console, Vercel all use filterable flat lists
4. **Dependency graph as first-class concept:** Nx and Backstage build entity graphs — most praised feature
5. **Project-as-filter, not project-as-container:** reduces context-switching friction
6. **Sidebar with project context:** Vercel pattern emerging as standard

## Sources

- [VS Code Multi-root Workspaces](https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces)
- [VS Code Settings](https://code.visualstudio.com/docs/configure/settings)
- [Nx Project Configuration](https://nx.dev/docs/reference/project-configuration)
- [Nx Explore Graph](https://nx.dev/docs/features/explore-graph)
- [Nx Console Project Details](https://nx.dev/docs/guides/nx-console/console-project-details)
- [JetBrains Workspaces](https://blog.jetbrains.com/idea/2024/08/workspaces-in-intellij-idea/)
- [JetBrains Workspaces Challenges](https://blog.jetbrains.com/idea/2025/03/ide-workspaces-development-challenges-and-plans/)
- [Turborepo Configuration](https://turborepo.dev/docs/reference/configuration)
- [Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/)
- [Cortex Backstage Overview](https://www.cortex.io/post/an-overview-of-spotify-backstage)

## Implications for Sherpa Studio

1. **Use `sherpa.config.ts` as project marker** — auto-discover by scanning for it
2. **Three-tier config: global > workspace > project** with explicit merge semantics
3. **Project switcher, not tree** — dropdown/sidebar that changes scope of current view
4. **Build a project graph** — initiative dependencies/informs already exist; cross-project visualization is the differentiator
5. **"My projects" as default filter** — owned projects first, "All" toggle
6. **Avoid Backstage trap** — keep data model flexible, don't force rigid kinds/types

## Open Questions

1. Cross-project task dependencies — how does the task board show them?
2. Should a workspace-level `sherpa.config.ts` exist for shared settings?
3. MCP federation — one aggregating MCP or per-project servers?
4. How to surface convention drift across projects?
5. Active project concept — all roots as peers (VS Code) or explicit selection (Vercel)?
