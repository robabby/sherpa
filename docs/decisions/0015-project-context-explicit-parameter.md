---
doc-type: decision
decision: 0015
authored-by: ai
reviewed-by: null
last-updated: 2026-03-20
source-initiatives:
  - multi-project-studio
status: accepted
---

> **AI-extracted** from multi-project-studio · Awaiting human review

## Context

The content module (`packages/studio-core/src/content.ts`) used three module-level globals (`_projectRoot`, `_claudeMdLocations`, `_claudeMdScanDirs`) to resolve file paths. The initial multi-project design proposed adding an optional `projectSlug` parameter to ~48 domain functions. Stress-test finding A1 refuted this approach: the "set global then read" pattern creates race conditions when concurrent Server Component renders access different projects, and partial migration (some callers omitting the slug) silently falls back to the wrong project.

## Decision

All domain functions accept an explicit `ProjectContext` object instead of relying on module-level globals. The context carries the resolved root path, paths config, and CLAUDE.md locations for a specific project. Built via `buildProjectContext()` from a resolved `SherpaConfig`.

```ts
interface ProjectContext {
  root: string
  paths: Required<PathsConfig>
  claudeMdLocations: string[]
  claudeMdScanDirs: string[]
}
```

Context-aware utility functions (`resolveCtxPath`, `readCtxFile`, `listCtxMarkdownFiles`) in `packages/studio-core/src/context.ts` replace the global path resolution functions. The project registry (`packages/studio-core/src/projects.ts`) maps slugs to their `ProjectContext`.

## Consequences

- Eliminates race conditions from concurrent multi-project access
- Every domain function call site explicitly declares which project it operates on
- ~48 function signatures were updated (mechanical but large surface area, done in Session 2a)
- The `REPORT_REGISTRY` global was made namespace-safe (keyed by `${projectRoot}:${slug}`)
- No silent fallback — if a caller omits the context, it's a compile-time error, not a runtime surprise
- `getDefaultContext()` provides backwards compatibility during migration
