# Iteration 1 — 2026-03-12

## Research Vectors

### Vector 1: Config-as-Code Deep Survey
**Question:** How do leading frameworks handle config defaults, merging, validation, and plugin hook points?
**Full report:** [iteration-1/vector-1-config-as-code-survey.md](iteration-1/vector-1-config-as-code-survey.md)

**Key discoveries:**
- `defineConfig()` is an identity function in both Sanity and Keystatic — zero processing. Defaults applied in `createStudio()`/`createReader()`, not at definition time.
- Payload v3 **removed all Zod/Joi validation** from config. Only TypeScript types + runtime error classes. Astro is the only framework using Zod for config.
- Sanity's per-property reducers (`configPropertyReducers.ts`) are superior to Payload's full-config mutation — explicit array concat vs object replace semantics, no spread footgun.
- Config caching matters: Payload PR #9501 fixed a 4.1s → 50ms regression from re-resolution.

**Implications:**
- `defineConfig()` = identity function for type inference
- Zod validation in `createStudio()`, not `defineConfig()`
- Per-property merge semantics (Sanity model) over full-config mutation (Payload model)

### Vector 2: Vocabulary System Design
**Question:** How should domain entities be renamed per deployment?
**Full report:** [iteration-1/vector-2-vocabulary-system-design.md](iteration-1/vector-2-vocabulary-system-design.md)

**Key discoveries:**
- next-intl messages are plain objects merged via spread in `getRequestConfig()`. Messages don't need to be JSON files — can be constructed programmatically from config. ([next-intl Discussion #1607](https://github.com/amannn/next-intl/discussions/1607))
- Strapi and react-admin both use i18n for vocabulary customization (not locale translation) — production-validated pattern.
- Salesforce and Jira confirm: paths are immutable, vocabulary is cosmetic. `docs/initiatives/` stays regardless of UI label. API names never change.
- Structured vocabulary entries (`{ singular, plural, article? }`) are better than string pairs. 12 user-facing entities need vocabulary; lifecycle statuses are a secondary set.

**Implications:**
- `VocabularyConfig` is a flat `Partial<Record<EntitySlug, Partial<VocabularyEntry>>>` — compiled to ICU messages internally
- Paths never change. `PathsConfig` and `VocabularyConfig` are independent.
- `getVocabulary()` standalone function needed for CLI/MCP (no React context)

### Vector 3: Theme Distribution via shadcn Registry
**Question:** How should themes be packaged and distributed using shadcn's registry?
**Full report:** [iteration-1/vector-3-theme-distribution.md](iteration-1/vector-3-theme-distribution.md)

**Key discoveries:**
- shadcn's `registry:base` + `registry:theme` + `registry:font` composition is the complete design system distribution mechanism. 12 registry item types exist.
- Tailwind v4 uses a two-layer CSS variable system: semantic tokens (`:root`/`.dark`) + utility-class generation (`@theme inline`). ~28 core CSS variables.
- shadcn validates structure but NOT variable completeness — missing `--primary` causes silent visual breakage. Sherpa must add required-variable validation.
- shadcn preset system (`presetSchema`) bundles base + style + theme + font + iconLibrary into a single installable unit. 5 built-in presets.
- Registry CDN: `pnpm shadcn build` outputs JSON to `public/r/`, consumers add namespace to `components.json`, install via `npx shadcn add @namespace/item`.

**Implications:**
- Use shadcn registry format as-is — don't invent custom theme format
- Add Zod validation layer for required CSS variable completeness
- Sherpa theme ≈ shadcn preset (base + theme + font)

### Vector 4: Config Composition with Next.js + Multi-Runtime
**Question:** How does `sherpa.config.ts` compose with `next.config.ts` and serve MCP/CLI?
**Full report:** [iteration-1/vector-4-config-composition.md](iteration-1/vector-4-config-composition.md)

**Key discoveries:**
- Payload's `withPayload()` does NOT inject routes — only build tooling (`serverExternalPackages`, `webpack.externals`, `headers()`). Routes are scaffolded files in `app/`. ([Payload source](https://github.com/payloadcms/payload/blob/main/packages/next/src/withPayload/withPayload.js))
- All 4 major Next.js config wrappers (Payload, Sentry, next-intl, @next/mdx) follow `(nextConfig) => nextConfig`. Manual nesting for composition.
- Dual-bundler support is mandatory: provide both `webpack:` and `turbopack:` config. Prefer `serverExternalPackages` over `webpack.externals`.
- MCP/CLI load `.ts` config via `jiti` (what Next.js itself uses) or `bun`. No build step needed.
- Single config file serves all runtimes. Constraint: no JSX, no React, no Next.js imports. Pure data.

**Implications:**
- `withSherpa()` is minimal: `transpilePackages` + `serverExternalPackages`, maybe `headers()`
- Route injection via `sherpa init` scaffolding, not config wrapper
- Config file at fixed path (`sherpa.config.ts`) + optional `SHERPA_CONFIG_PATH` env var

## Synthesis

### The Central Insight: The Config Is Three Separate Concerns

The four vectors converge on a clean separation that wasn't obvious in the seed question:

| Concern | Mechanism | Consumer |
|---------|-----------|----------|
| **Type-safe definition** | `defineConfig()` — identity function, zero processing | Developer authoring config |
| **Runtime resolution** | `createStudio(config)` — applies defaults, resolves plugins, validates, caches | Next.js server, MCP, CLI |
| **Build integration** | `withSherpa(nextConfig)` — transpilePackages + externals | Next.js build pipeline |

These three functions are the entire public API surface of the config system. They have zero overlap.

### Cross-Vector Pattern: The Identity Function Revelation

The most surprising finding is that `defineConfig()` should do **nothing**. Sanity, Keystatic, Vite, Vitest, and Drizzle all implement it as a pass-through — it exists solely for TypeScript inference. Payload's `buildConfig()` does slightly more (applies some defaults) but even Payload has shifted toward lazy resolution in `getPayload()`.

This means:
- Zero validation at definition time → faster imports
- All defaults/merging/validation happen in `createStudio()` → single resolution point
- Config file remains a pure typed object → importable from any runtime

### Cross-Vector Pattern: Paths Are Immutable, Everything Else Is Vocabulary

Vector 2 (Salesforce/Jira lesson) and Vector 4 (file-system routing) converge: **the filesystem is the API surface**. `docs/initiatives/` is a path, not a label. It doesn't change when vocabulary changes. Routes like `/app/studio/` are file-system paths, not config values.

This means the `PathsConfig` section is actually about **where Sherpa looks for governance artifacts**, not what they're called:

```ts
paths: {
  initiatives: 'docs/initiatives',    // Where initiative dirs live
  tasks: 'docs/tasks',                // Where task files live
  agents: 'docs/agents/roles',        // Where role definitions live
  conventions: '.claude/rules',       // Where convention files live
  skills: '.claude/skills',           // Where skill files live
}
```

These are pure filesystem paths. Vocabulary is a completely separate overlay.

### Cross-Vector Pattern: Validation Is Always a Layer, Never Inline

Every vector found the same pattern:
- shadcn validates structure but not completeness → Sherpa adds required-var checking
- Payload removed config validation entirely → relies on TypeScript + runtime errors
- next-intl validates nothing about messages → consumer's responsibility
- Config wrappers don't validate next.config → Next.js does that

**Sherpa's validation strategy:** Zod schema in `createStudio()` that validates the resolved config (after defaults + plugin merging). The schema catches: missing required fields, invalid path references, vocabulary entries for unknown entity slugs, theme CSS variable completeness.

### Cross-Vector Pattern: Composition Order Matters

Vector 1 (Sanity reducers) and Vector 4 (wrapper nesting) both highlight that **the order plugins/wrappers are applied changes the output**. Sanity solves this with explicit per-property merge semantics. For Sherpa:

- **Arrays (catalogs, roles):** Concat. Plugin A's roles + Plugin B's roles = all roles.
- **Objects (vocabulary, paths):** Shallow merge. Plugin B's vocabulary overrides Plugin A's.
- **Scalars (projectRoot, projectName):** Last wins. Can't meaningfully merge.
- **Functions (hooks, callbacks):** Chain. All hooks run in order.

### The Complete `sherpa.config.ts` Architecture

```ts
// sherpa.config.ts — pure typed object, no side effects
import { defineConfig } from '@sherpa/studio'

export default defineConfig({
  // Required
  projectRoot: import.meta.dirname,

  // Optional with sensible defaults
  projectName: 'My Project',

  vocabulary: {
    initiative: { singular: 'Project', plural: 'Projects' },
    task: { singular: 'Task', plural: 'Tasks' },
  },

  paths: {
    initiatives: 'docs/initiatives',
    tasks: 'docs/tasks',
    agents: 'docs/agents/roles',
  },

  theme: {
    preset: 'default',        // or '@sherpa/modern-mystic'
    // OR inline CSS vars
    cssVars: { light: { ... }, dark: { ... } },
  },

  catalogs: {
    primitives: [...],
    endpoints: [...],
  },

  agents: {
    roles: [...],
    modelTiers: { ... },
  },

  mcp: {
    enabled: true,
    toolPrefix: 'sherpa',
  },

  plugins: [
    wavePointPlugin({ ... }),
  ],
})

// next.config.ts — minimal build integration
import { withSherpa } from '@sherpa/studio/next'
export default withSherpa({ /* standard next config */ })

// Any server code — runtime data access
import { createStudio } from '@sherpa/studio'
import config from './sherpa.config'
const studio = createStudio(config)  // cached singleton
```

## All Sources

### Config Architecture
- [Sanity defineConfig source](https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/defineConfig.ts)
- [Sanity configPropertyReducers](https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/configPropertyReducers.ts)
- [Keystatic config source](https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/config.tsx)
- [Payload config types](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts)
- [Payload PR #9501](https://github.com/payloadcms/payload/pull/9501) — Config caching fix

### Vocabulary / i18n
- [next-intl configuration](https://next-intl.dev/docs/usage/configuration)
- [next-intl TypeScript](https://next-intl.dev/docs/workflows/typescript)
- [Strapi admin customization](https://docs.strapi.io/cms/admin-panel-customization)
- [react-admin Translation](https://marmelab.com/react-admin/Translation.html)
- [Salesforce rename](https://help.salesforce.com/s/articleView?id=platform.customize_rename.htm&language=en_US&type=5)

### Theme Distribution
- [shadcn registry](https://ui.shadcn.com/docs/registry)
- [shadcn registry:base examples](https://ui.shadcn.com/docs/registry/examples)
- [shadcn theming](https://ui.shadcn.com/docs/theming)
- [shadcn registry schema.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/schema.ts)
- [Tailwind v4 @theme](https://tailwindcss.com/docs/theme)

### Config Composition
- [Payload withPayload.js](https://github.com/payloadcms/payload/blob/main/packages/next/src/withPayload/withPayload.js)
- [Sentry withSentryConfig](https://github.com/getsentry/sentry-javascript/blob/develop/packages/nextjs/src/config/withSentryConfig/index.ts)
- [next-intl createNextIntlPlugin](https://github.com/amannn/next-intl/blob/main/packages/next-intl/src/plugin/createNextIntlPlugin.tsx)
- [jiti](https://github.com/unjs/jiti) — TypeScript loader for config
- [Payload outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs)

## Proposals Generated

Created `docs/initiatives/sherpa-framework-extraction/sub-initiatives/sherpa-config-entrypoint/proposal.md` with:
1. Three-function API surface (`defineConfig`, `createStudio`, `withSherpa`)
2. Per-property merge semantics (Sanity model) for plugin resolution
3. Structured vocabulary config with `VocabularyEntry` type
4. shadcn registry as theme distribution mechanism
5. Minimal `withSherpa()` — transpilePackages + externals only

## Open Questions for Next Iteration

1. **Plugin resolution order** — When two plugins contribute entries with the same slug to the same catalog, what's the collision policy? Error, merge, or last-wins? How does Sanity's `flattenConfig` handle this specifically?

2. **`withSherpa()` scope** — Does Sherpa need any webpack/turbopack config modifications at all, or is `transpilePackages` + `serverExternalPackages` sufficient for pure ESM TypeScript packages?

3. **Vocabulary in MCP tool names** — If a consumer renames "initiative" to "project", should MCP tools change from `list_initiatives` to `list_projects`? Or are tool names part of the stable API surface (like file paths)?

4. **Theme preset vs inline** — Should `sherpa.config.ts` accept a preset name that resolves from the shadcn registry at init time, or inline CSS variables that ship with the config? Presets are install-time, inline is always-available.

5. **Async vs sync `createStudio()`** — Current Studio modules use `readFileSync`. Keystatic and Payload both use async APIs. Should `createStudio()` return a promise, or stay sync and defer async operations to individual method calls?
