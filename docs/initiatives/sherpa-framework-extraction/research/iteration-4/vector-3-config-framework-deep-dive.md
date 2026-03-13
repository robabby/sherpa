# Config Framework Deep Dive: Defaults, Validation, Hooks, Type Inference, Splitting, Runtime Access

**Research date:** 2026-03-12
**Question:** How do Payload CMS, Sanity Studio, Keystatic, Backstage, Nuxt, and Astro handle config defaults, merging, validation, plugin hooks, type inference, config splitting, and runtime access?
**Iteration:** 4, Vector 3
**Prior art:** Iteration 2 / Vector 2 established the broad patterns. This iteration goes deeper into implementation.

---

## Key Discoveries

### 1. Defaults Merging — Three Distinct Strategies

**Payload CMS: Per-field defaults + `deepmerge` library for collections**
- `addDefaultsToConfig()` applies baseline defaults before sanitization ([Payload config defaults source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/defaults.ts))
- Admin settings use nullish coalescing (`??=`) — only set if undefined
- Collections/globals use the `deepmerge` npm library with `isMergeableObject: isPlainObject` to prevent merging class instances ([commit 2c66ad8](https://github.com/payloadcms/payload/commit/2c66ad86898c28da32b1714821c2ea8fe8e17868))
- i18n translations use a custom `deepMergeSimple()` from `@payloadcms/translations/utilities`
- System collections (jobs, folders, locked-docs, preferences, migrations) are **pushed** onto the collections array — not merged
- Default values include: `depth: 2`, `maxDepth: 10`, `defaultTextFieldLimit: 40000`, `cookiePrefix: 'payload'`, `telemetry: true`, `maxComplexity: 1000` for GraphQL ([defaults source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/defaults.ts))

**Sanity Studio: No defaults in defineConfig — reducer-based resolution at runtime**
- `defineConfig()` is a **pure identity function** — returns config unchanged ([defineConfig source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/defineConfig.ts))
- Defaults are applied during `resolveConfigProperty()` via an `initialValue` parameter passed to the reducer chain ([resolveConfigProperty source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/resolveConfigProperty.ts))
- Each property type has its own reducer in `configPropertyReducers.ts` with specific merge semantics ([configPropertyReducers source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/configPropertyReducers.ts))

**Nuxt: `defu` library — recursive defaults with array concatenation**
- Uses the [`defu`](https://github.com/unjs/defu) library (from unjs ecosystem) for merging config ([defu docs](https://unjs.io/packages/defu/))
- Arrays are **concatenated** by default: `defu({ array: ['b'] }, { array: ['a'] })` => `['b', 'a']`
- Nullish values (null/undefined) are skipped
- `__proto__` and `constructor` keys are blocked (prototype pollution prevention)
- Custom merge strategies possible via `createDefu()` — e.g., sum numbers instead of override, replace arrays instead of concat
- `runtimeConfig` values can be overridden by `NUXT_*` environment variables at runtime ([Nuxt runtime config docs](https://nuxt.com/docs/4.x/guide/going-further/runtime-config))

**Astro: Shallow merge via `updateConfig()` in integration hooks**
- `updateConfig()` in `astro:config:setup` hook **merges with user config + other integration updates** — you can omit keys ([Astro integration reference](https://docs.astro.build/en/reference/integrations-reference/))
- The merge is shallow — only include modified properties

**Backstage: Deep merge with null-as-absence**
- Multiple YAML config files merged with priority ordering — later files override earlier
- Primitives and arrays: completely replaced
- Objects: deeply merged
- `null` = explicit absence (won't fall back to lower-priority config) ([Backstage writing config docs](https://backstage.io/docs/conf/writing/))

**Keystatic: No defaults at all**
- `config()` is a pure identity function with zero runtime behavior ([Keystatic config source](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/config.tsx))

### 2. Config Validation — Surprising Variation

| Framework | Validation Library | When | Strategy |
|-----------|-------------------|------|----------|
| **Payload v2** | Joi | Startup (runtime) | Full schema validation with `abortEarly: false`, collects all errors |
| **Payload v3** | **None** (Joi removed July 2024) | Startup (runtime) | TypeScript types + custom `InvalidConfiguration` / `DuplicateCollection` error classes in `sanitize.ts` |
| **Sanity** | None | Runtime | `defineConfig` does nothing; `definePlugin` validates only `projectId`/`dataset` absence |
| **Backstage** | JSON Schema Draft-07 | CLI (`config:check`) | Schemas from `package.json` stitched together; validated via `backstage-cli config:check` |
| **Nuxt** | `untyped` (unjs) | Module setup | Schema-based validation; third-party Zod/Valibot modules available (`nuxt-safe-runtime-config`) |
| **Astro** | Zod (v4 as of Astro 6) | Startup | `AstroConfigSchema` Zod schema validates config; errors formatted with custom error map |
| **Keystatic** | None | None | Pure type checking only |

**Critical insight for Sherpa:** Payload's shift from Joi to TypeScript-only validation is significant. Their v3 `sanitize.ts` does **no schema validation** — it relies on TypeScript for structural correctness and throws custom error classes only for semantic violations (duplicate slugs, missing auth collection, invalid timezones). The prior iteration's assumption that Payload uses Zod was incorrect based on iteration 2 inference from the config pipeline diagram; the actual source code shows no Zod in config validation.

Astro is the only framework using Zod for config validation. This validates our plan to use Zod for `sherpa.config.ts` — it's a deliberate choice, not an industry default.

Source references:
- [Payload v2 validate.ts (Joi)](https://github.com/payloadcms/payload/blob/master/src/config/validate.ts)
- [Payload v3 sanitize.ts (no Joi/Zod)](https://raw.githubusercontent.com/payloadcms/payload/main/packages/payload/src/config/sanitize.ts)
- [Payload Joi removal commit](https://github.com/payloadcms/payload/actions/runs/10001152608)
- [Backstage config schema defining](https://backstage.io/docs/conf/defining/)
- [Astro Zod v4 upgrade](https://github.com/withastro/astro/commit/0ff51dfa3c6c615af54228e159f324034472b1a2)
- [Astro Zod error message improvements PR](https://github.com/withastro/astro/pull/12634)
- [Nuxt safe runtime config (Standard Schema)](https://github.com/onmax/nuxt-safe-runtime-config)

### 3. Plugin Hook Points — Granularity Comparison

**Payload: Config-level mutation (coarse-grained)**
- Plugin signature: `(incomingConfig: Config) => Config` — receives and returns full config ([Payload plugin docs](https://payloadcms.com/docs/plugins/build-your-own))
- Can modify: collections, globals, fields, hooks, endpoints, admin views, custom components
- **Hook merging caveat:** Function properties (hooks) cannot use spread syntax — must execute existing function first, then add new logic
- Plugins execute in array order; later plugins see earlier plugins' modifications
- Executed **after** validation, **before** sanitization + default merging ([Payload plugin overview](https://payloadcms.com/docs/plugins/overview))

**Sanity: Reducer-based per-property resolution (fine-grained)**
- Plugin config flattened via `flattenConfig()` — depth-first recursive traversal of nested plugins ([flattenConfig source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/flattenConfig.ts))
- Each property type has its own reducer with specific merge semantics ([configPropertyReducers source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/configPropertyReducers.ts)):
  - **Array properties** (schema types, tools, document actions/badges, asset sources, inspectors): `[...prev, ...pluginValues]` — concatenation
  - **Boolean properties** (comments enabled, events API, media library): last value wins
  - **Object properties** (decision parameters, internal tasks): full replacement, no deep merge
  - **Function-only properties** (new document options, production URL): must be functions
- Context object varies by property — `schema.types` gets `{projectId, dataset}`, `tools` gets `{getClient, currentUser, schema, projectId, dataset}`
- Plugins can add: schema types, tools, document actions, document badges, form components, studio UI overrides, asset sources, inspectors
- **Plugins can nest other plugins** — `flattenConfig` handles recursive traversal

**Astro: Lifecycle hooks (13 hook points)**
- Integrations hook into specific lifecycle moments, not config mutation ([Astro integration reference](https://docs.astro.build/en/reference/integrations-reference/)):
  - `astro:config:setup` — modify Astro config, add Vite plugins, inject routes/scripts/middleware
  - `astro:config:done` — read final config, set adapter, inject types
  - `astro:route:setup` — configure individual route options
  - `astro:routes:resolved` — read-only access to resolved routes
  - `astro:server:setup/start/done` — dev server lifecycle
  - `astro:build:start/setup/ssr/generated/done` — build lifecycle
  - Custom hooks via global augmentation (`Astro.IntegrationHook`)

**Backstage: Schema contribution (declarative)**
- Plugins contribute JSON Schema fragments via `"configSchema"` field in `package.json` ([Backstage defining config](https://backstage.io/docs/conf/defining/))
- Schemas stitched together during validation
- Custom visibility keywords: `frontend`, `backend` (default), `secret`
- Conflicting visibility across schemas = error during merge
- `backstage-cli config:check` validates against stitched schema

### 4. Type Inference from Config

**Payload: Code generation via JSON Schema**
- `generate:types` command produces `payload-types.ts` from config ([Payload generating types](https://payloadcms.com/docs/typescript/generating-types))
- Types generated from JSON Schema (not directly from TypeScript config)
- Adds `declare module 'payload' { export interface GeneratedTypes extends Config {} }` for module augmentation
- Custom JSON schema extensions possible via `typescript.schema` callback in config
- `buildConfig()` itself provides type-ahead via strong TypeScript types on the `Config` interface

**Sanity: `defineConfig` uses `const T` generic for literal type preservation**
- `defineConfig<const T extends Config>(config: T): T` — preserves exact literal types via TypeScript 5.0+ const type parameters ([defineConfig source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/defineConfig.ts))
- No code generation — types flow through via generics

**Keystatic: `typeof config` + `Entry<>` helper for collection type extraction**
- `Entry<typeof keystaticConfig['collections']['movies']>` extracts typed entry shapes ([Keystatic Reader API](https://keystatic.com/docs/reader-api))
- `createReader(cwd, config)` returns type-safe methods with collection shapes inferred from config
- No code generation — pure generic inference

**Astro: Hand-maintained interface + Zod schema (dual)**
- `AstroUserConfig` interface is **manually maintained** for JSDoc documentation ([Astro config types source](https://github.com/withastro/astro/blob/main/packages/astro/src/types/public/config.ts))
- Zod schema exists separately for runtime validation
- Comment in source: "Zod comes with the ability to auto-generate AstroConfig from the schema... If we ever get to the point where we no longer need the dedicated type, consider replacing it"
- `AstroUserConfig` = input (all optional), `AstroConfig` = resolved (defaults filled in)

**Nuxt: `untyped` auto-generates TypeScript from schema**
- `@nuxt/schema` uses `untyped` library to auto-generate types
- Manual augmentation possible via `nuxt/schema` module declaration

### 5. Config Splitting

**Nuxt: Two-file split by design**
- `nuxt.config.ts` — build configuration, modules, runtime config, Vite/webpack settings ([Nuxt config docs](https://nuxt.com/docs/4.x/getting-started/configuration))
- `app.config.ts` — public variables determined at build time (theme, title, etc.), reactive in client, no env var override
- Runtime config: supports `NUXT_*` env var override at runtime; serialized into Nitro payload

**Payload: Single file + modular imports (convention, not framework)**
- One `payload.config.ts` file — no framework-supported splitting
- Best practice: collections defined in separate files, imported into config ([Payload collection structure](https://www.buildwithmatija.com/blog/payload-cms-collection-structure-best-practices))
- Each collection gets a directory: `collections/posts/config.ts`, `collections/posts/hooks/beforeValidate.ts`

**Backstage: Multi-file overlay**
- `app-config.yaml` — base config
- `app-config.local.yaml` — local overrides (gitignored)
- `app-config.production.yaml` — production overrides
- Additional files via `--config <path>` CLI flag
- `$include` — load YAML/JSON fragments from other files
- `$file` — read entire file as string value
- `$env` — environment variable substitution
- Priority order: `APP_CONFIG_*` env vars > CLI files > default files ([Backstage config writing](https://backstage.io/docs/conf/writing/))

**Astro: Single file + integration config**
- One `astro.config.mjs` (or `.ts`) — no framework-supported splitting
- Integrations add config via `updateConfig()` in hooks

**Sanity/Keystatic: Single file**
- One `sanity.config.ts` / `keystatic.config.ts`
- No framework-supported splitting

### 6. Runtime Config Access

| Framework | Pattern | Mechanism |
|-----------|---------|-----------|
| **Payload** | Async singleton | `await getPayload({ config })` — cached, HMR-aware ([Payload Local API](https://payloadcms.com/docs/local-api/overview)) |
| **Sanity** | React context | `useWorkspace()` hook — provides `currentUser`, `dataset`, `schema` etc. ([Sanity React hooks](https://www.sanity.io/docs/studio-react-hooks)); `StudioProvider` > `WorkspacesProvider` > `WorkspaceContext` |
| **Backstage** | Dependency injection | Frontend: `configApiRef` from `@backstage/core-plugin-api`; Backend: `coreServices.rootConfig` ([Backstage reading config](https://backstage.io/docs/conf/reading/)) |
| **Nuxt** | Composable | `useRuntimeConfig()` — server gets full config (read-only), client gets only `public` keys (writable + reactive) ([Nuxt useRuntimeConfig](https://nuxt.com/docs/4.x/api/composables/use-runtime-config)) |
| **Astro** | Hook arguments | `config` object passed to `astro:config:done` and other hooks; no global accessor |
| **Keystatic** | Reader object | `createReader(cwd, config)` — config passed at reader creation, no global accessor |

**Payload performance insight:** Config was being loaded and sanitized **twice per page transition** in dev mode. PR #9501 introduced config caching — `buildConfig(() => ({ ... }))` accepts a function to enable deferred, cached sanitization. Reduced 400-field config from 4.1 seconds to 50ms. ([PR #9501](https://github.com/payloadcms/payload/pull/9501))

---

## Implications for Sherpa's `defineConfig()`

### 1. Keep `defineConfig()` as identity function (follow Sanity/Keystatic, not Payload)
Both Sanity and Keystatic prove that the `define*` function can be a pure identity function that exists only for type inference. Processing happens later. This is simpler and more composable:
```typescript
export function defineConfig<const T extends SherpaConfig>(config: T): T {
  return config
}
```
Actual validation and default-merging should happen in `createStudio(config)` or equivalent runtime entry point.

### 2. Use Zod for validation (follow Astro, not Payload v3)
Payload v3 dropped all schema validation. Astro uses Zod. For a framework intended for external consumers, runtime validation with helpful error messages matters more than for an internal tool. Our config pipeline should be:
```
defineConfig() → identity (type inference)
createStudio() → Zod parse → defaults merge → plugin resolution → SanitizedConfig
```

### 3. Adopt Sanity's per-property reducer pattern for plugin resolution
This is the deepest insight from the research. Sanity's approach is superior to Payload's full-config-mutation pattern:
- Each property type has explicit merge semantics (concat, replace, last-wins)
- The reducer chain processes `flattenConfig()` output in order
- Context varies per property — don't expose more than needed
- No footgun of accidentally dropping collections by forgetting to spread

Concrete implementation for Sherpa:
```typescript
const propertyReducers = {
  entities: arrayReducer,       // concat
  agents: arrayReducer,         // concat
  tools: arrayReducer,          // concat
  theme: objectReducer,         // deep merge
  vocabulary: objectReducer,    // deep merge
  paths: objectReducer,         // shallow merge (last wins per key)
  mcp: booleanReducer,          // last wins
}
```

### 4. Two-file integration pattern (follow Nuxt's split + Payload's withPayload)
```
sherpa.config.ts   → defineConfig()   → identity, type inference
next.config.ts     → withSherpa()     → route injection, middleware
```
`sherpa.config.ts` handles all Sherpa configuration. `withSherpa()` handles Next.js integration plumbing. This maps to Nuxt's `nuxt.config.ts` + `app.config.ts` split.

### 5. Cached initialization (follow Payload PR #9501)
Accept a function in `createStudio()` to enable deferred, cached config resolution:
```typescript
const studio = await createStudio(() => config)  // cached after first call
```

### 6. Config types: UserConfig vs ResolvedConfig (follow Astro pattern)
- `SherpaUserConfig` — all optional, user-facing, JSDoc-documented
- `SherpaResolvedConfig` — all required, defaults filled, post-validation
- `defineConfig<const T>()` preserves literal types via const generic

---

## Open Questions

1. **Should Sherpa support Sanity-style callback properties?** e.g. `tools: (prev, context) => [...prev, myTool]`. This adds complexity but eliminates the "replace vs extend" ambiguity. Sanity's reducer system makes this clean but is non-trivial to implement.

2. **What should the Zod error messages look like?** Astro invested in custom error maps for user-friendly messages. What's the right DX for `sherpa.config.ts` validation failures?

3. **Should plugins be curried (Payload) or factory (Sanity)?** Payload: `(options) => (config) => config`. Sanity: `definePlugin((options) => pluginOptions)`. The Sanity pattern is simpler — the plugin doesn't need to know about the full config. The reducer handles composition.

4. **How should config splitting work for non-Next.js targets?** If Sherpa supports plain Node.js or Bun, the `withSherpa()` Next.js wrapper doesn't apply. Is there a generic `createServer(config)` pattern?

---

## All Sources

### Payload CMS
- [Payload config docs](https://payloadcms.com/docs/configuration/overview)
- [Payload config types source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts)
- [Payload config defaults source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/defaults.ts)
- [Payload sanitize.ts source (v3)](https://raw.githubusercontent.com/payloadcms/payload/main/packages/payload/src/config/sanitize.ts)
- [Payload validate.ts source (v2, Joi)](https://github.com/payloadcms/payload/blob/master/src/config/validate.ts)
- [Payload deepmerge plain-objects commit](https://github.com/payloadcms/payload/commit/2c66ad86898c28da32b1714821c2ea8fe8e17868)
- [Payload Joi removal action run](https://github.com/payloadcms/payload/actions/runs/10001152608)
- [Payload config caching PR #9501](https://github.com/payloadcms/payload/pull/9501)
- [Payload plugin docs](https://payloadcms.com/docs/plugins/overview)
- [Payload build your own plugin](https://payloadcms.com/docs/plugins/build-your-own)
- [Payload plugin tutorial blog](https://payloadcms.com/posts/blog/tutorial-building-your-own-payload-plugin)
- [Payload generating types docs](https://payloadcms.com/docs/typescript/generating-types)
- [Payload TypeScript overview](https://payloadcms.com/docs/typescript/overview)
- [Payload collections config](https://payloadcms.com/docs/configuration/collections)
- [Payload globals config](https://payloadcms.com/docs/configuration/globals)
- [Payload hooks overview](https://payloadcms.com/docs/hooks/overview)
- [Payload collection hooks](https://payloadcms.com/docs/hooks/collections)
- [Payload Local API](https://payloadcms.com/docs/local-api/overview)
- [Payload config-parser repo](https://github.com/payloadcms/config-parser)
- [Payload plugin template](https://github.com/payloadcms/plugin-template)
- [Payload collection structure best practices](https://www.buildwithmatija.com/blog/payload-cms-collection-structure-best-practices)
- [Payload migration guide v2→v3](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/overview.mdx)
- [Payload JSON schema types discussion](https://github.com/payloadcms/payload/discussions/4879)
- [Payload Zod schema generation discussion](https://github.com/payloadcms/payload/discussions/4259)
- [Payload plugin extension discussion](https://github.com/payloadcms/payload/discussions/2369)

### Sanity Studio
- [Sanity configuration docs](https://www.sanity.io/docs/studio/configuration)
- [Sanity config API reference](https://www.sanity.io/docs/studio/config-api-reference)
- [Sanity defineConfig source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/defineConfig.ts)
- [Sanity definePlugin source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/definePlugin.ts)
- [Sanity flattenConfig source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/flattenConfig.ts)
- [Sanity resolveConfigProperty source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/resolveConfigProperty.ts)
- [Sanity configPropertyReducers source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/configPropertyReducers.ts)
- [Sanity resolveConfig source](https://github.com/sanity-io/sanity/blob/main/packages/sanity/src/core/config/resolveConfig.ts)
- [Sanity plugins API reference](https://www.sanity.io/docs/studio/plugins-api-reference)
- [Sanity document actions docs](https://www.sanity.io/docs/studio/document-actions)
- [Sanity workspaces docs](https://www.sanity.io/docs/studio/workspaces)
- [Sanity React hooks docs](https://www.sanity.io/docs/studio-react-hooks)
- [Sanity studio components reference](https://www.sanity.io/docs/studio-components-reference)
- [Sanity component API](https://www.sanity.io/docs/component-api)
- [Sanity developing plugins](https://www.sanity.io/docs/studio/developing-plugins)
- [Sanity v3 developer preview blog](https://www.sanity.io/blog/sanity-studio-v3-developer-preview)
- [Sanity v3 customization blog](https://www.sanity.io/blog/sanity-studio-v3-simplified-yet-powerful-customization)
- [Sanity Config API feedback discussion](https://github.com/sanity-io/sanity/discussions/3328)
- [Sanity Workspace API reference](https://www.sanity.io/docs/reference/api/sanity/Workspace)
- [Sanity core architecture (ReadMeX)](https://readmex.com/en-US/sanity-io/sanity/page-3676d9601-b30b-413e-9b43-0ef80472073c)
- [Sanity plugin-kit](https://github.com/sanity-io/plugin-kit)

### Keystatic
- [Keystatic configuration docs](https://keystatic.com/docs/configuration)
- [Keystatic Reader API docs](https://keystatic.com/docs/reader-api)
- [Keystatic config source](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/config.tsx)
- [Keystatic GitHub repo](https://github.com/Thinkmill/keystatic)
- [Keystatic collections docs](https://keystatic.com/docs/collections)
- [Keystatic validation discussion](https://github.com/Thinkmill/keystatic/discussions/1263)

### Backstage
- [Backstage config overview](https://backstage.io/docs/conf/)
- [Backstage defining config for plugins](https://backstage.io/docs/conf/defining/)
- [Backstage writing config](https://backstage.io/docs/conf/writing/)
- [Backstage reading config](https://backstage.io/docs/conf/reading/)
- [Backstage ConfigApi reference](https://backstage.io/docs/reference/core-plugin-api.configapi/)
- [Backstage ConfigReader reference](https://backstage.io/docs/reference/config.configreader/)
- [Backstage createPlugin reference](https://backstage.io/docs/reference/core-plugin-api.createplugin/)
- [Backstage config-schema plugin package.json](https://github.com/backstage/backstage/blob/master/plugins/config-schema/package.json)
- [@backstage/plugin-config-schema npm](https://www.npmjs.com/package/@backstage/plugin-config-schema)
- [Backstage config validation issue #3922](https://github.com/backstage/backstage/issues/3922)

### Nuxt
- [Nuxt configuration docs (v4)](https://nuxt.com/docs/4.x/getting-started/configuration)
- [Nuxt runtime config docs (v4)](https://nuxt.com/docs/4.x/guide/going-further/runtime-config)
- [Nuxt useRuntimeConfig composable](https://nuxt.com/docs/4.x/api/composables/use-runtime-config)
- [Nuxt app.config.ts docs](https://nuxt.com/docs/4.x/directory-structure/app/app-config)
- [Nuxt config merging issue #31492](https://github.com/nuxt/nuxt/issues/31492)
- [Nuxt config merging issue #33551](https://github.com/nuxt/nuxt/issues/33551)
- [Nuxt multiple config files discussion](https://github.com/nuxt/nuxt/discussions/28103)
- [Nuxt module config validation discussion](https://github.com/nuxt/nuxt/discussions/26858)
- [nuxt-safe-runtime-config (Standard Schema)](https://github.com/onmax/nuxt-safe-runtime-config)
- [nuxt-config-schema experiment](https://github.com/nuxt-experiments/nuxt-config-schema)
- [Configuration in Nuxt 3 (Mastering Nuxt)](https://masteringnuxt.com/blog/configuration-in-nuxt-3-runtimeConfig-vs-appConfig)
- [defu GitHub repo](https://github.com/unjs/defu)
- [defu docs](https://unjs.io/packages/defu/)
- [defu array merge order issue #98](https://github.com/unjs/defu/issues/98)
- [defu blog (Dev.to)](https://dev.to/jacobandrewsky/assigning-default-properties-efficiently-with-defu-2in2)

### Astro
- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/)
- [Astro integration reference](https://docs.astro.build/en/reference/integrations-reference/)
- [Astro configuring overview](https://docs.astro.build/en/guides/configuring-astro/)
- [Astro config types source](https://github.com/withastro/astro/blob/main/packages/astro/src/types/public/config.ts)
- [Astro Zod v4 upgrade commit](https://github.com/withastro/astro/commit/0ff51dfa3c6c615af54228e159f324034472b1a2)
- [Astro Zod error improvements PR #12634](https://github.com/withastro/astro/pull/12634)
- [Astro Zod API reference](https://docs.astro.build/en/reference/modules/astro-zod/)
- [Astro v6 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [Astro config imports API](https://docs.astro.build/en/reference/modules/astro-config/)
- [Astro integrations guide](https://docs.astro.build/en/guides/integrations-guide/)
- [Astro updateConfig issue #12372](https://github.com/withastro/astro/issues/12372)
- [Astro updateConfig fix PR #13990](https://github.com/withastro/astro/pull/13990)
- [Astro 6 preview (Southwell Media)](https://www.southwellmedia.com/blog/astro-6-whats-coming-2026)
- [Understanding Astro integrations (LogRocket)](https://blog.logrocket.com/understanding-astro-integrations-hooks-lifecycle/)

### TypeScript Schema/Inference
- [TypeScript infer keyword deep dive](https://alexharri.com/blog/build-schema-language-with-infer)
- [Zod docs](https://zod.dev/)
- [Zod defining schemas](https://zod.dev/api)

---

## Raw Links

Every URL encountered during this research, including tangential ones:

```
https://payloadcms.com/docs/configuration/overview
https://payloadcms.com/docs/plugins/overview
https://payloadcms.com/docs/configuration/collections
https://payloadcms.com/docs/configuration/globals
https://payloadcms.com/docs/admin/components
https://payloadcms.com/community-help/discord/sanitization-error-sanitizets
https://payloadcms.com/community-help/discord/usual-process-to-change-payload-config-database-schema-in-production
https://github.com/payloadcms/config-parser
https://payloadcms.com/docs/admin/excluding-server-code
https://payloadcms.com/docs/troubleshooting/troubleshooting
https://github.com/payloadcms/payload/commit/2c66ad86898c28da32b1714821c2ea8fe8e17868
https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts
https://github.com/payloadcms/payload/commit/ba2f2d6e9b66568b11632bacdd92cfdc8ddae300
https://github.com/payloadcms/payload
https://github.com/payloadcms/payload/pull/9501
https://github.com/payloadcms/payload/blob/main/docs/plugins/overview.mdx
https://github.com/payloadcms/payload/discussions/2369
https://github.com/payloadcms/payload/blob/main/packages/ui/src/forms/Form/types.ts
https://github.com/payloadcms/payload/commit/0117f18eb1dd163143e18cd8061a4b96d41c411e
https://github.com/payloadcms/public-demo/blob/master/src/payload/payload.config.ts
https://payloadcms.com/docs/typescript/generating-types
https://github.com/payloadcms/payload/blob/main/docs/typescript/generating-types.mdx
https://payloadcms.com/posts/blog/announcing-generated-types
https://github.com/payloadcms/payload/discussions/225
https://github.com/payloadcms/payload/blob/1.x/docs/typescript/generating-types.mdx
https://payloadcms.com/docs/typescript/overview
https://github.com/payloadcms/payload/releases
https://github.com/payloadcms/payload/issues/5868
https://payloadcms.com/posts/blog/interfacename-generating-composable-graphql-and-typescript-types
https://payloadcms.com/docs/fields/json
https://payloadcms.com/docs/plugins/build-your-own
https://payloadcms.com/posts/blog/tutorial-building-your-own-payload-plugin
https://payloadcms.com/docs/hooks/overview
https://github.com/payloadcms/payload/issues/7494
https://github.com/payloadcms/plugin-template
https://payloadcms.com/docs/hooks/collections
https://payloadcms.com/docs/admin/react-hooks
https://payloadcms.com/docs/hooks/fields
https://payloadcms.com/docs/plugins/mcp
https://payloadcms.com/docs/rest-api/overview
https://deepwiki.com/payloadcms/payload/10.2-templates-and-examples
https://payloadcms.com/community-help/discord/there-were-1-errors-validating-your-payload-config-1-editor-is-required
https://github.com/payloadcms/payload/issues/6425
https://payloadcms.com/community-help/discord/need-insight-on-validation-error
https://payloadcms.com/community-help/discord/how-would-one-go-about-translating-error-messages-that-are-returned-by-a-field-validate-function
https://payloadcms.com/community-help/discord/after-reinstalling-payload-i-get-weird-errors
https://github.com/payloadcms/payload/issues/6611
https://github.com/payloadcms/payload/issues/11723
https://github.com/payloadcms/payload/discussions/4259
https://payloadcms.com/community-help/discord/access-drizzle-schema-to-use-with-drizzle-plugins
https://github.com/payloadcms/payload/discussions/4318
https://github.com/payloadcms/payload/blob/main/packages/payload/src/fields/validations.ts
https://payloadcms.com/community-help/github/admin-collection-level-validation
https://payloadcms.com/community-help/discord/validation-at-the-collection-level
https://github.com/payloadcms/payload/issues/11224
https://github.com/payloadcms/payload/blob/master/src/config/validate.ts
https://github.com/payloadcms/payload/actions/runs/10001152608
https://github.com/payloadcms/payload/discussions/3501
https://www.wisp.blog/blog/payload-30-is-live-whats-new-in-this-game-changing-release
https://payloadcms.com/posts/blog/launch-week
https://github.com/payloadcms/payload/blob/main/docs/migration-guide/overview.mdx
https://github.com/payloadcms/payload/discussions/6929
https://payloadcms.com/docs/database/migrations
https://www.magicslides.app/mcps/payloadcms/payload
https://github.com/payloadcms/payload/issues/6630
https://payloadcms.com/community-help/discord/access-payload-instance-in-server-component-payload-2
https://dev.to/aaronksaunders/authentication-with-payload-cms-and-nextjs-client-vs-server-approaches-c5a
https://payloadcms.com/docs/local-api/overview
https://smithery.ai/skills/payloadcms/payload
https://payloadcms.com/community-help/github/access-to-payload-object-on-plugin-initialization
https://www.deployhq.com/guides/payload-cms
https://medium.com/@yrogovich/how-payload-3-0-is-changing-the-headless-cms-game-in-2025-c6b8ce193518
https://github.com/payloadcms/payload/discussions/6596
https://www.npmjs.com/package/@payload-enchants/cached-local-api
https://github.com/payloadcms/payload/blob/1.x/docs/getting-started/installation.mdx
https://github.com/payloadcms/nextjs-custom-server/issues/26
https://github.com/payloadcms/payload/discussions/7415
https://github.com/payloadcms/payload/issues/7437
https://github.com/payloadcms/payload/issues/12640
https://payloadcms.com/community-help/discord/organize-collection-in-folders-groups
https://github.com/payloadcms/payload/discussions/5046
https://github.com/payloadcms/payload/discussions/4650
https://github.com/payloadcms/payload/discussions/9399
https://www.buildwithmatija.com/blog/payload-cms-collection-structure-best-practices
https://github.com/payloadcms/payload/issues/7549
https://github.com/payloadcms/payload/releases/tag/v3.42.0
https://github.com/payloadcms/payload/blob/main/payload-types.ts
https://github.com/payloadcms/payload/discussions/4879
https://github.com/payloadcms/payload/issues/11383
https://www.sanity.io/docs/studio/configuration
https://www.sanity.io/docs/configuration
https://www.sanity.io/docs/studio/schema-types
https://www.sanity.io/docs/studio/validation
https://www.sanity.io/docs/studio-components-reference
https://www.sanity.io/docs/component-api
https://www.sanity.io/docs/studio-components
https://beta.sanity.io/docs/platform/studio/config
https://www.sanity.io/docs/studio/document-actions
https://www.sanity.io/guides/validation-helpers
https://www.sanity.io/docs/studio/plugins-api-reference
https://www.sanity.io/docs/studio/studio-plugins
https://www.sanity.io/plugins
https://www.sanity.io/docs/studio/developing-plugins
https://www.sanity.io/docs/studio/studio-plugins.md
https://www.sanity.io/docs/developer-guides/an-opinionated-guide-to-sanity-studio
https://tedgustaf.com/blog/2022/sanity-studio-v3/
https://www.sanity.io/plugins/sanity-plugin-schema-markup
https://www.sanity.io/docs/studio/workspaces
https://www.sanity.io/docs/reference/api/sanity/Workspace
https://www.sanity.io/docs/studio/config-api-reference
https://www.sanity.io/answers/resolving-multiple-workspaces-sources-configured-error-in-sanity-io-version-3
https://github.com/sanity-io/next-sanity/issues/724
https://www.sanity.io/docs/studio/environment-variables
https://github.com/sanity-io/sanity
https://reference.sanity.io/sanity/index/Workspace/
https://www.sanity.io/docs/studio-react-hooks
https://reference.sanity.io/_sanity/sdk-react/
https://www.sanity.io/blog/sanity-studio-v3-developer-preview
https://www.sanity.io/studio
https://www.npmjs.com/@sanity/react-hooks
https://www.sanity.io/answers/migrating-from-sanity-version---to----encountering-issue-with-using-the-sanity-client-in-a-react-function-
https://github.com/sanity-io/sanity/discussions/3328
https://www.sanity.io/docs/studio/installing-and-configuring-plugins
https://www.sanity.io/blog/sanity-studio-v3-simplified-yet-powerful-customization
https://github.com/sanity-io/sanity/discussions/3343
https://www.sanity.io/docs/visual-editing/presentation-resolver-api
https://github.com/sanity-io/plugin-kit
https://readmex.com/en-US/sanity-io/sanity/page-3676d9601-b30b-413e-9b43-0ef80472073c
https://keystatic.com/docs/reader-api
https://keystatic.com/
https://keystatic.com/docs/installation-remix
https://keystatic.com/docs/configuration
https://keystatic.com/docs/collections
https://github.com/Thinkmill/keystatic
https://github.com/Thinkmill/keystatic/discussions
https://github.com/Thinkmill/keystatic/discussions/1263
https://github.com/Thinkmill/keystatic/issues/1281
https://github.com/Thinkmill/keystatic/blob/main/README.md
https://github.com/Thinkmill/keystatic-manual-setup-demo
https://github.com/Thinkmill/keystatic/discussions/880
https://github.com/Thinkmill/keystatic/issues/1341
https://github.com/Thinkmill/built-with-keystatic/blob/main/keystatic.config.ts
https://github.com/Thinkmill/built-with-keystatic
https://backstage.io/docs/conf/
https://backstage.io/docs/conf/defining/
https://backstage.io/docs/conf/writing/
https://github.com/backstage/backstage/blob/master/docs/conf/index.md
https://github.com/sourcefuse/backstage/blob/main/app-config.yaml
https://backstage.spotify.com/docs/plugins/soundcheck/tutorials/start-to-enable-your-experts-to-manage-maturity-progress
https://github.com/backstage/backstage/blob/master/plugins/config-schema/package.json
https://github.com/backstage/backstage/blob/master/app-config.yaml
https://www.npmjs.com/package/@backstage/plugin-config-schema
https://github.com/backstage/backstage/issues/3922
https://backstage.io/docs/conf/reading/
https://backstage.io/docs/reference/core-plugin-api.configapi/
https://github.com/backstage/backstage/blob/master/docs/conf/reading.md
https://backstage.io/docs/reference/config.configreader/
https://github.com/backstage/backstage/blob/master/packages/core-plugin-api/src/apis/definitions/ConfigApi.ts
https://backstage.io/docs/reference/core-plugin-api.createplugin/
https://github.com/backstage/backstage/blob/master/docs/api/utility-apis.md
https://github.com/backstage/backstage/blob/master/contrib/docs/tutorials/authenticate-api-requests.md
https://github.com/backstage/backstage/issues/27871
https://github.com/backstage/backstage/blob/master/packages/catalog-model/src/schema/Entity.schema.json
https://newreleases.io/project/github/backstage/backstage/release/v0.3.1
https://github.com/backstage/backstage/blob/master/packages/catalog-model/src/schema/kinds/API.v1alpha1.schema.json
https://github.com/backstage/backstage/blob/master/docs/service_specification.schema.json
https://www.jsonschemavalidator.net/
https://github.com/backstage/backstage/blob/master/packages/create-app/templates/default-app/app-config.production.yaml
https://notes.kodekloud.com/docs/Certified-Backstage-Associate-CBA/Backstage-Basics/Backstage-Configuration/page
https://github.com/backstage/backstage/issues/8176
https://backstage.spotify.com/learn/standing-up-backstage/putting-backstage-into-action/10-production/
https://github.com/backstage/backstage/issues/5751
https://github.com/spotify/backstage/issues/2889
https://docs.astro.build/en/reference/configuration-reference/
https://docs.astro.build/en/reference/integrations-reference/
https://docs.astro.build/en/guides/configuring-astro/
https://docs.astro.build/en/guides/integrations-guide/
https://docs.astro.build/en/reference/modules/astro-config/
https://github.com/withastro/astro.build/blob/main/astro.config.mjs
https://www.astrojs.cn/en/reference/modules/astro-config/
https://tanggd.github.io/en/guides/integrations-guide/
https://github.com/withastro/contribute.docs.astro.build/blob/main/astro.config.mjs
https://github.com/withastro/astro/releases
https://docs.astro.build/en/reference/modules/astro-zod/
https://docs.astro.build/en/guides/upgrade-to/v6/
https://docs.astro.build/en/guides/content-collections/
https://tillitsdone.com/blogs/zod-form-validation-in-astro-js/
https://www.southwellmedia.com/blog/astro-6-whats-coming-2026
https://github.com/withastro/astro/commit/0ff51dfa3c6c615af54228e159f324034472b1a2
https://zod.dev/api
https://tillitsdone.com/blogs/zod-integration-with-astro-js/
https://github.com/withastro/astro/commit/03958d939217e6acef25c0aa1af2de663b04c956
https://github.com/withastro/astro/pull/12634
https://github.com/dannysmith/astro-editor
https://github.com/withastro/docs/blob/main/src/content/docs/en/reference/modules/astro-content.mdx
https://github.com/withastro/roadmap/discussions/806
https://deepwiki.com/withastro/astro.build/3.1-content-collections-and-schema
https://sourceforge.net/projects/astro.mirror/files/astro@6.0.0/
https://github.com/withastro/astro/blob/fdd607c5755034edf262e7b275732519328a33b2/packages/astro/src/@types/astro.ts
https://github.com/withastro/astro/blob/00327c213f74627ac9ca1dec774efa5bf71e9375/packages/astro/src/@types/astro.ts
https://github.com/withastro/astro/blob/3b10b97a4fecd1dfd959b160a07b5b8427fe40a7/packages/astro/src/types/public/config.ts
https://github.com/withastro/astro/blob/main/packages/astro/src/types/public/config.ts
https://github.com/withastro/astro/issues/5604
https://github.com/withastro/astro/blob/ad2962fdacb23589db5e33789aba82e8bde836ce/packages/astro/src/@types/config.ts
https://github.com/withastro/astro/commit/3488be9b59d1cb65325b0e087c33bcd74aaa4926
https://github.com/withastro/astro/issues/12372
https://github.com/withastro/astro/pull/13990
https://github.com/withastro/astro/issues/13888
https://github.com/withastro/astro/pull/5046
https://blog.logrocket.com/understanding-astro-integrations-hooks-lifecycle/
https://nuxt.com/docs/4.x/directory-structure/app/app-config
https://github.com/nuxt/nuxt/issues/31492
https://nuxt.com/docs/guide/directory-structure/app-config
https://masteringnuxt.com/blog/configuration-in-nuxt-3-runtimeConfig-vs-appConfig
https://nuxt.com/docs/4.x/getting-started/configuration
https://nuxt.com/docs/4.x/directory-structure/tsconfig
https://nuxt.com/docs/3.x/getting-started/configuration
https://github.com/nuxt/nuxt/issues/33551
https://github.com/nuxt/nuxt/discussions/28103
https://typescript.nuxtjs.org/guide/setup/
https://nuxt.com/docs/4.x/api/nuxt-config
https://nuxt-security.vercel.app/getting-started/usage
https://nuxt.com/docs/4.x/guide/going-further/runtime-config
https://masteringnuxt.com/blog/runtime-configs-in-nuxtjs
https://github.com/nuxt/nuxt/discussions/26858
https://github.com/onmax/nuxt-safe-runtime-config
https://github.com/nuxt/ui/issues/6098
https://nuxt.com/docs/4.x/api/composables/use-runtime-config
https://nuxt.com/docs/3.x/api/composables/use-runtime-config
https://nuxt.com/docs/3.x/guide/going-further/runtime-config
https://github.com/nuxt/nuxt/issues/15366
https://nuxt.com/docs/4.x/migration/runtime-config
https://learnnuxt.co/free/introduction/runtime-config-and-env
https://new.nuxtjs.cn/docs/guide/going-further/runtime-config
https://github.com/unjs/defu
https://dev.to/jacobandrewsky/assigning-default-properties-efficiently-with-defu-2in2
https://unjs.io/packages/defu/
https://github.com/unjs/defu/releases
https://github.com/unjs/defu/issues/98
https://medium.com/@ramunarasinga/lodash-merge-vs-defu-db52b786ebd8
https://gist.github.com/ahtcx/0cd94e62691f539160b32ecda18af3d6
https://github.com/cpreston321/h3-defu
https://github.com/fastify/deepmerge
https://www.30secondsofcode.org/js/s/merge-objects/
https://tessl.io/registry/tessl/npm-nuxt--schema/4.1.0/files/docs/schema-validation.md
https://github.com/nuxt/nuxt/issues/15592
https://content.nuxt.com/docs/collections/validators
https://github.com/nuxt-experiments/nuxt-config-schema
https://deepwiki.com/nuxt/ui/5.1-schema-validation
https://nuxt.com/modules/vee-validate
https://www.npmjs.com/package/nuxt-config-schema
https://nuxtseo.com/docs/schema-org/api/config
https://github.com/nuxt/nuxt/issues/22701
https://alexharri.com/blog/build-schema-language-with-infer
https://medium.com/@robinviktorsson/the-infer-keyword-in-typescript-a-deep-dive-with-practical-examples-3a7a51bd3ed6
https://www.w3schools.com/typescript/typescript_type_inference.php
https://mongoosejs.com/docs/typescript/schemas.html
https://zod.dev/
https://www.npmjs.com/package/zod
https://github.com/colinhacks/zod
https://colinhacks.com/essays/zod
https://egghead.io/blog/zod-vs-yup-vs-joi-vs-io-ts-for-creating-runtime-typescript-validation-schemas
https://betterstack.com/community/guides/scaling-nodejs/joi-vs-zod/
https://betterstack.com/community/guides/scaling-nodejs/yup-vs-zod/
https://medium.com/@jaimansoni/choosing-the-best-javascript-validation-library-yup-zod-or-joi-999280fc622c
https://www.builder.io/blog/introducing-valibot
https://github.com/hapijs/hapi/issues/4414
https://github.com/hapijs/joi/issues/2401
https://hapi.dev/tutorials/validation/?lang=en_US
https://github.com/hapijs/joi/issues/1788
https://github.com/hapijs/joi/issues/384
https://dev.to/jacqueline/using-hapi-joi-version-16-1-7-to-validate-a-request-body-in-a-restful-api-bje
https://github.com/colinhacks/zod/discussions/3223
https://github.com/alexmarqs/zod-config
https://www.contenttoolkit.co/tools/payload/releases
https://www.sanity.io/answers/issue-installing-the-official-sanity-media-plugin-on-sanity-v--
https://www.sanity.io/docs/sanity-studio-configuration
```
