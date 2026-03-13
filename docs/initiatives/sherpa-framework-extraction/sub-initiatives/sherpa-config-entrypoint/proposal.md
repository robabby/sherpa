---
status: pending
initiative: sherpa-config-entrypoint
created: 2026-03-12
updated: 2026-03-12
type: research-synthesis
risk: structural
targets:
  - packages/studio-core/src/config.ts
  - packages/studio-core/src/types.ts
  - packages/studio/src/next.ts
dependencies:
  - sherpa-framework-extraction
spawned-from: sherpa-framework-extraction
---

# Sherpa Config Entrypoint

## Summary

Design and implement the `sherpa.config.ts` config-as-code entrypoint for Sherpa Studio. Three functions compose the entire public API: `defineConfig()` (type-safe definition), `createStudio(config)` (runtime resolution), and `withSherpa(nextConfig)` (Next.js build integration). The config unifies vocabulary customization, theming, agent catalogs, path configuration, MCP server options, and plugin extension — consumed identically by Next.js apps, MCP servers, and CLI tools.

## State Snapshot

**What exists today:**
- Parent initiative has established the package architecture (`@sherpa/studio-core`, `-ui`, `-mcp`, `-cli`, meta-package `@sherpa/studio`)
- `createStudio(config)` API designed (iteration 3): nested namespace pattern with 13 domain groups
- Catalog registration designed: config-based spreading (Payload model), not imperative registration
- Extraction Tasks 1-5 of 13 complete — packages scaffolded, Layer 0-1 types/schemas/parsing extracted, catalogs with generic `CatalogRegistry<T>`

**What this sub-initiative adds:**
- Complete `defineConfig()` type definitions and implementation
- `SherpaUserConfig` / `SherpaResolvedConfig` type split
- Per-property merge semantics for plugin resolution
- `VocabularyConfig` with structured entries and next-intl compilation
- `ThemeConfig` aligned with shadcn registry format
- `withSherpa()` Next.js wrapper implementation
- Config loading for MCP/CLI via jiti

## Proposed Changes

### 1. Three-Function API Surface

```ts
// @sherpa/studio — re-export from core
export { defineConfig } from '@sherpa/studio-core'

// @sherpa/studio/next — build integration
export { withSherpa } from '@sherpa/studio-core/next'

// @sherpa/studio-core — runtime
export { createStudio } from '@sherpa/studio-core'
```

**`defineConfig()`** — Identity function for TypeScript inference. Zero processing, zero validation:
```ts
export function defineConfig<const T extends SherpaUserConfig>(config: T): T {
  return config
}
```

**`createStudio(config)`** — Resolves defaults, flattens plugins, validates with Zod, returns cached singleton with typed namespaces.

**`withSherpa(nextConfig)`** — Minimal: `transpilePackages` for Sherpa packages, `serverExternalPackages` if needed. No route injection (routes are scaffolded files).

### 2. Config Type Design

```ts
interface SherpaUserConfig {
  // Required
  projectRoot: string

  // Optional with defaults
  projectName?: string

  vocabulary?: Partial<Record<EntitySlug, Partial<VocabularyEntry>>>

  paths?: Partial<PathsConfig>

  theme?: ThemeConfig

  catalogs?: Record<string, unknown[]>

  agents?: AgentsConfig

  mcp?: McpConfig

  plugins?: SherpaPlugin[]
}

type EntitySlug =
  | 'initiative' | 'proposal' | 'task' | 'agent' | 'role'
  | 'session' | 'report' | 'deliverable' | 'research'
  | 'dashboard' | 'portfolio' | 'convention'

interface VocabularyEntry {
  singular: string
  plural: string
  article?: 'a' | 'an'
}

interface PathsConfig {
  initiatives: string    // default: 'docs/initiatives'
  tasks: string          // default: 'docs/tasks'
  agents: string         // default: 'docs/agents/roles'
  conventions: string    // default: '.claude/rules'
  skills: string         // default: '.claude/skills'
  sessions: string       // default: 'docs/sessions'
  reports: string        // default: 'docs/reports'
}

interface ThemeConfig {
  preset?: string                     // shadcn preset name or registry URL
  cssVars?: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  fonts?: string[]                    // registry:font references
}

type SherpaPlugin = (config: SherpaResolvedConfig) => SherpaResolvedConfig
```

### 3. Plugin Resolution — Per-Property Merge Semantics (Sanity Model)

Instead of Payload's full-config mutation, use Sanity's per-property reducers:

| Property type | Merge strategy | Example |
|---------------|---------------|---------|
| Arrays (catalogs, roles) | Concat | Plugin A's roles + Plugin B's roles |
| Objects (vocabulary, paths) | Shallow merge | Plugin B's vocabulary overrides A's |
| Scalars (projectRoot, projectName) | Last wins | Can't meaningfully merge |

### 4. Vocabulary — Config to next-intl Compilation

```ts
// In sherpa.config.ts (consumer writes):
vocabulary: {
  initiative: { singular: 'Project', plural: 'Projects' },
  task: { singular: 'Work Item', plural: 'Work Items' },
}

// Framework compiles to next-intl messages:
{
  sherpa: {
    entity: {
      initiative: '{count, plural, =1 {Project} other {Projects}}',
      task: '{count, plural, =1 {Work Item} other {Work Items}}',
    },
    // ... lifecycle statuses, action labels
  }
}

// Standalone access (CLI, MCP — no React context):
const vocab = studio.vocabulary.get('initiative') // { singular: 'Project', plural: 'Projects' }
```

Paths never change. `docs/initiatives/` stays regardless of vocabulary. CLI output: "Found 3 projects in docs/initiatives/".

### 5. Theme — shadcn Registry Alignment

Theme config accepts either a preset reference (resolved at `sherpa init` time from the registry) or inline CSS variables. Sherpa validates that all ~28 required CSS variables are present in both `light` and `dark`:

```ts
const REQUIRED_THEME_VARS = [
  'background', 'foreground', 'primary', 'primary-foreground',
  'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'border', 'input', 'ring',
  'card', 'card-foreground', 'popover', 'popover-foreground',
  'sidebar', 'sidebar-foreground', 'sidebar-primary',
  'sidebar-primary-foreground', 'sidebar-accent',
  'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
] as const
```

### 6. `withSherpa()` — Minimal Next.js Wrapper

```ts
export function withSherpa(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    transpilePackages: [
      ...(nextConfig.transpilePackages ?? []),
      '@sherpa/studio-core',
      '@sherpa/studio-ui',
      '@sherpa/studio',
    ],
  }
}
```

No route injection, no webpack config, no middleware. Routes are scaffolded by `sherpa init`.

### 7. Multi-Runtime Config Loading

- **Next.js:** `import config from './sherpa.config'` — webpack/turbopack handle TypeScript natively
- **MCP server / CLI:** Load via `jiti` (same loader Next.js uses for `next.config.ts`) or `bun`
- **Config discovery:** Fixed path `sherpa.config.ts` at project root. Optional `SHERPA_CONFIG_PATH` env var override. No cosmiconfig.

## Rationale

- **Identity function `defineConfig()`** — validated by Sanity, Keystatic, Vite, Vitest, Drizzle. Zero processing at definition time means faster imports and pure typed objects importable from any runtime.
- **Per-property merge semantics** — Sanity's reducer model is proven superior to Payload's full-config mutation. Explicit concat vs replace semantics prevent accidental overwrites.
- **Vocabulary is cosmetic, paths are immutable** — Salesforce (API name vs label) and Jira (Issue → Work Item) prove this universally.
- **shadcn registry for themes** — 12 registry types, preset system, CDN distribution, authentication support. Don't invent a custom format.
- **Minimal `withSherpa()`** — Every major Next.js wrapper (Payload, Sentry, next-intl) handles build tooling only. Route injection is scaffolded files.

## Dependencies

- `sherpa-framework-extraction` — parent initiative, package architecture

## Review Notes

- **Task 8 in parent plan** — The extraction plan already has Task 8: "`defineConfig()` + config system". This proposal provides the research-backed design for that task.
- **Plugin collision policy** — Not yet decided. When two plugins contribute entries with the same slug, should it error, merge, or last-wins? Needs explicit policy before implementation.
- **MCP tool naming and vocabulary** — If vocabulary changes entity names, should MCP tools follow? Or are tool names part of the stable API surface?
- **Sync vs async** — Current codebase uses `readFileSync`. Keystatic and Payload are async. Decision deferred to implementation, but the type signatures should be designed to support either.
