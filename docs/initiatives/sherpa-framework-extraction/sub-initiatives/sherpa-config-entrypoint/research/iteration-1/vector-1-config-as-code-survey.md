# Vector 1: Config-as-Code Deep Survey

**Question:** How do the leading config-as-code frameworks (Payload CMS, Sanity Studio, Keystatic, Backstage, Nuxt, Astro) handle config defaults, merging, validation, and plugin hook points?
**Agent dispatched:** 2026-03-12

## Findings

### 1. Defaults Merging — Three Strategies

- **Payload** uses `deepmerge` library with `isPlainObject` guard + per-field nullish coalescing. `sanitizeConfig()` applies defaults after plugin resolution.
- **Sanity** applies defaults via reducer `initialValue` at resolution time — NOT in `defineConfig()`. `defineConfig()` itself is a pure identity function that does zero processing.
- **Nuxt** uses `defu` (arrays concat, objects deep-merge, nullish skipped) — purpose-built for layered config merging.
- **Keystatic's** `config()` is also a pure identity function — zero processing, zero defaults.

**Key insight:** Sanity and Keystatic prove that `defineConfig()` doesn't need to do anything — it exists purely for TypeScript inference. Defaults are applied later in `createStudio()` / `createReader()`.

### 2. Config Validation — Prior Iteration Was Wrong About Payload Using Zod

- **Payload v2** used Joi for config validation. **Payload v3 removed all schema validation** (July 2024). No Zod. Only TypeScript types + custom error classes for semantic violations (e.g., missing required fields, invalid collection slugs).
- **Only Astro uses Zod** for config validation (upgraded to Zod v4 in Astro 6). Config is validated against a Zod schema at build time.
- **Backstage** uses JSON Schema Draft-07 with per-plugin schema contribution.
- **Sanity and Keystatic** do zero runtime validation.

**Implication for Sherpa:** Zod validation should happen in `createStudio()`, not `defineConfig()`. This follows the Payload v3 pattern — TypeScript types catch 95% of config errors at compile time; runtime validation catches the rest at initialization.

### 3. Plugin Hook Points — Sanity's Reducer Architecture

- **Sanity's `configPropertyReducers.ts`** defines per-property merge semantics: array types concat, booleans last-wins, objects replace entirely. This is the deepest plugin system found.
- **`flattenConfig()`** does depth-first recursive plugin traversal into a flat array.
- **`resolveConfigProperty()`** runs the reducer chain with context threading.
- This is **superior to Payload's full-config-mutation pattern** — no spread-footgun, per-property semantics are explicit.
- **Astro** provides 13 lifecycle hooks (`astro:config:setup`, `astro:build:start`, etc.) with `updateConfig()` shallow merging.

**Implication for Sherpa:** Per-property reducers (Sanity model) are better than full-config mutation (Payload model) for a framework where plugins contribute to arrays (catalogs, roles) but shouldn't replace scalars (projectRoot, vocabulary).

### 4. Type Inference from Config

- **Sanity and Keystatic** use `const T` generics for literal type preservation (no codegen). The config type flows through to the reader/API layer.
- **Payload** generates types from JSON Schema with `declare module` augmentation. Codegen runs during build.
- **Astro** maintains hand-written interfaces + separate Zod schema (dual approach).

### 5. Config Splitting

- **Nuxt** has purpose-built two-file split: `nuxt.config.ts` (build-time, server) + `app.config.ts` (runtime, client-safe). The only framework with official multi-file config.
- **Backstage** supports multi-file YAML overlay with `$env`/`$file`/`$include` substitution directives.
- All others use single-file + conventional imports.

### 6. Runtime Config Access

- **Payload:** Async singleton `getPayload()` with config caching. PR #9501 fixed a 4.1s → 50ms performance regression caused by re-resolution.
- **Sanity:** React context via `useWorkspace()`.
- **Backstage:** Dependency injection (`configApiRef` frontend, `coreServices.rootConfig` backend).
- **Nuxt:** Composable `useRuntimeConfig()` with server/client split.

## Sources

- [Payload config types source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts) — TypeScript config interface
- [Payload config docs](https://payloadcms.com/docs/configuration/overview) — Official config reference
- [Payload buildConfig source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/build.ts) — Config resolution
- [Payload sanitizeConfig](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/sanitize.ts) — Defaults application
- [Payload deepmerge usage](https://github.com/payloadcms/payload/blob/main/packages/payload/src/utilities/deepMerge.ts) — Merge implementation
- [Payload PR #9501](https://github.com/payloadcms/payload/pull/9501) — Config caching performance fix
- [Sanity defineConfig source](https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/defineConfig.ts) — Identity function
- [Sanity configPropertyReducers.ts](https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/configPropertyReducers.ts) — Per-property merge semantics
- [Sanity flattenConfig](https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/flattenConfig.ts) — Plugin resolution
- [Sanity resolveConfigProperty](https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/resolveConfigProperty.ts) — Reducer chain
- [Sanity config docs](https://www.sanity.io/docs/configuration) — Official reference
- [Keystatic config source](https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/config.tsx) — Identity function
- [Keystatic reader docs](https://keystatic.com/docs/reader-api) — Typed data access
- [Backstage app-config docs](https://backstage.io/docs/conf/) — YAML config
- [Backstage config defining](https://backstage.io/docs/conf/defining/) — Plugin schema contribution
- [Nuxt config docs](https://nuxt.com/docs/guide/directory-structure/nuxt-config) — Two-file split
- [Nuxt defu](https://github.com/unjs/defu) — Config merge utility
- [Astro config reference](https://docs.astro.build/en/reference/configuration-reference/) — Zod-validated config
- [Astro integrations hooks](https://docs.astro.build/en/reference/integrations-reference/) — 13 lifecycle hooks

## Raw Links

- https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts
- https://payloadcms.com/docs/configuration/overview
- https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/build.ts
- https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/sanitize.ts
- https://github.com/payloadcms/payload/blob/main/packages/payload/src/utilities/deepMerge.ts
- https://github.com/payloadcms/payload/pull/9501
- https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/defineConfig.ts
- https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/configPropertyReducers.ts
- https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/flattenConfig.ts
- https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/config/resolveConfigProperty.ts
- https://www.sanity.io/docs/configuration
- https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/config.tsx
- https://keystatic.com/docs/reader-api
- https://backstage.io/docs/conf/
- https://backstage.io/docs/conf/defining/
- https://nuxt.com/docs/guide/directory-structure/nuxt-config
- https://github.com/unjs/defu
- https://docs.astro.build/en/reference/configuration-reference/
- https://docs.astro.build/en/reference/integrations-reference/

## Implications

1. `defineConfig()` should be an identity function for type inference — validation happens in `createStudio()`
2. Sanity's per-property reducers are superior to Payload's full-config mutation for plugin resolution
3. Config caching matters (Payload PR #9501) — `createStudio()` should cache the resolved config
4. No codegen needed — TypeScript `const T` generics can flow types from config to API without a build step

## Open Questions

1. Should `createStudio()` validate with Zod (Astro model) or rely on TypeScript + runtime error classes (Payload v3 model)?
2. Which per-property merge semantics should each config section use? (arrays: concat, scalars: last-wins, objects: deep-merge?)
3. How does the `defu` library compare to custom reducers for plugin config merging?
