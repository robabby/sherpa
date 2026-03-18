# defineConfig() Ecosystem Survey

Research into how popular developer tools structure their configuration APIs, with focus on layered config, presets, extends, and monorepo patterns.

**Date:** 2026-03-16
**Method:** Documentation review + source code analysis of Vite, Next.js, Tailwind CSS, ESLint, Nuxt, Astro, Turborepo, and TypeScript

---

## Key Discoveries

### 1. Vite: `defineConfig()` + `mergeConfig()` + Conditional Functions

- **`defineConfig()`** is purely a type-safety wrapper — it returns whatever you pass in, but provides IntelliSense. No runtime transformation. ([vite.dev/config](https://vite.dev/config/))

- **Environment-specific config** uses a function form that receives `{ command, mode, isSsrBuild, isPreview }`:
  ```ts
  export default defineConfig(({ command, mode }) => {
    if (command === 'serve') return { /* dev config */ }
    return { /* build config */ }
  })
  ```
  Source: [vite.dev/config](https://vite.dev/config/)

- **`mergeConfig(defaults, overrides, isRoot?)`** is an explicit merge utility exported from `vite`. Deep merges objects, but **arrays replace rather than concatenate** — arrays are treated as atomic values. Plugins are not merged (two configs defining the same plugin result in two entries). Source: [github.com/vitejs/vite/discussions/19211](https://github.com/vitejs/vite/discussions/19211)

- **No built-in `extends` or preset system.** Issue [#8964](https://github.com/vitejs/vite/issues/8964) requested it; the team's answer is "use `mergeConfig()` and JavaScript composition." Layered config is a userland pattern:
  ```ts
  // vite.config.ts
  import { defineConfig, mergeConfig } from 'vite'
  import baseConfig from './vite.base'
  export default defineConfig(mergeConfig(baseConfig, { /* overrides */ }))
  ```
  Source: [dev.to/padcom/vite-config-reuse-l3a](https://dev.to/padcom/vite-config-reuse-l3a)

- **Key constraint:** `mergeConfig` only accepts object form. Callback-form configs must be called first before merging.

### 2. Next.js: Phase-Aware Functions + Higher-Order Plugin Wrapping

- **Configuration as a function** receives `(phase, { defaultConfig })`. `phase` values come from `next/constants` (`PHASE_DEVELOPMENT_SERVER`, `PHASE_PRODUCTION_BUILD`, etc.). This is the primary environment-switching mechanism. Source: [nextjs.org/docs/app/api-reference/config/next-config-js](https://nextjs.org/docs/app/api-reference/config/next-config-js)
  ```js
  const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
  module.exports = (phase, { defaultConfig }) => {
    if (phase === PHASE_DEVELOPMENT_SERVER) {
      return { /* dev config */ }
    }
    return { /* prod config */ }
  }
  ```

- **Plugin composition** uses higher-order function wrapping — the "onion" pattern:
  ```js
  module.exports = withSentry(withMDX(nextConfig))
  ```
  Source: [github.com/vercel/next.js/discussions/40710](https://github.com/vercel/next.js/discussions/40710)

- **No built-in preset/extends system.** Config layering is handled through JavaScript composition. The `defaultConfig` parameter in the function form gives access to framework defaults.

- **Async config** supported since Next.js 12.1.0 — the function can be `async`.

### 3. Tailwind CSS v3: The Gold Standard for Presets

- **Three-layer merge:** `Tailwind defaults -> presets[] -> user config`. Presets are full config objects (same shape as `tailwind.config.js`), specified as an array. Multiple presets merge left-to-right. Source: [v3.tailwindcss.com/docs/presets](https://v3.tailwindcss.com/docs/presets)

- **Merge algorithm has two modes per key:**
  - **`theme` keys**: Merged **shallowly**. Top-level keys in user config **replace** the same keys in presets entirely.
  - **`theme.extend` keys**: **Collected across all configs** (presets + user) and applied on top of the rest. This is the additive path.
  - **`plugins`**: Always **merged/concatenated** across all configs.
  - **`corePlugins` as object**: Merged. **As array**: Replaces entirely.
  Source: [v3.tailwindcss.com/docs/presets](https://v3.tailwindcss.com/docs/presets)

- **This is the most relevant pattern for Sherpa.** The distinction between "replace a whole section" vs "extend additively" maps directly to Sherpa's needs: framework defaults should use the extend path, client config should be able to replace whole sections.

### 4. Tailwind CSS v4: CSS-First Configuration

- **Moved to CSS-first config** with `@theme` directive. The `@theme { --color-*: initial }` pattern clears a namespace before defining custom values — an explicit "reset then set" mechanism. Source: [tailwindcss.com/docs/configuration](https://tailwindcss.com/docs/configuration)

- **Shared themes** are just CSS files importable via `@import`. No special preset API needed — CSS `@import` is the composition mechanism:
  ```css
  @import "tailwindcss";
  @import "../brand/theme.css";
  @theme { --color-primary: var(--color-lagoon); }
  ```

- **Key insight:** The namespace-clearing pattern (`--color-*: initial`) is an elegant way to say "I'm taking full ownership of this section." Sherpa could use a similar signal for "this layer replaces rather than extends."

### 5. ESLint Flat Config: Array Composition + `defineConfig()` with `extends`

- **Flat config** is an array of config objects exported from `eslint.config.js`. Last matching config wins for any given file. Source: [eslint.org/docs/latest/use/configure/configuration-files](https://eslint.org/docs/latest/use/configure/configuration-files)

- **New `defineConfig()` helper** (2025) adds an `extends` key back to flat config objects. This was reintroduced because users found raw array spreading frustrating — some shared configs were objects, some were arrays, and composition was error-prone. Source: [eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/)
  ```js
  import { defineConfig } from "eslint/config"
  import js from "@eslint/js"
  export default defineConfig({
    files: ["**/*.js"],
    extends: ["js/recommended"],
  })
  ```

- **The `extends` array accepts mixed types:** strings (plugin config references), objects, or arrays. `defineConfig()` normalizes them all.

- **Key lesson:** The ESLint team learned that pure array composition without `extends` was too low-level for most users. They brought back the ergonomic abstraction while keeping the flat array as the underlying model.

### 6. Nuxt: Layers System (Full-Stack Config Inheritance)

- **Layers** are the most ambitious config composition system in this survey. A layer can contain components, composables, pages, layouts, middleware, configuration, and modules — not just config keys. Source: [nuxt.com/docs/4.x/getting-started/layers](https://nuxt.com/docs/4.x/getting-started/layers)

- **`extends` in `defineNuxtConfig()`** accepts local paths, npm packages, or git repos:
  ```ts
  export default defineNuxtConfig({
    extends: [
      '../base',                         // local layer
      '@my-themes/awesome',              // npm package
      'github:my-themes/awesome#v1',     // git remote
    ],
  })
  ```

- **Priority order** (highest to lowest): project files -> auto-scanned `~/layers/` (alphabetical, Z > A) -> `extends[]` entries (first = highest priority). Source: [nuxt.com/docs/4.x/guide/going-further/layers](https://nuxt.com/docs/4.x/guide/going-further/layers)

- **Publishable as npm packages.** A layer is just a directory with `nuxt.config.ts`. Install it as a devDependency, reference by package name in `extends`.

- **Key insight for Sherpa:** Nuxt layers prove that "config preset" can mean much more than key-value overrides. A Sherpa "client layer" could include not just config values but also custom role definitions, vocabulary files, and convention rules.

### 7. Turborepo: Root + Package Config with Explicit Inheritance

- **Two-level config:** Root `turbo.json` + per-package `turbo.json`. Package configs must declare `"extends": ["//"]` where `//` is a special token for "root of monorepo." Source: [turborepo.dev/docs/reference/package-configurations](https://turborepo.dev/docs/reference/package-configurations)

- **Array fields replace by default.** The `$TURBO_EXTENDS$` microsyntax changes this to append:
  ```json
  {
    "extends": ["//"],
    "tasks": {
      "build": {
        "outputs": ["$TURBO_EXTENDS$", ".next/**"]
      }
    }
  }
  ```
  This inherits root outputs and adds `.next/**`. Source: [turborepo.dev/blog/turbo-2-7](https://turborepo.dev/blog/turbo-2-7)

- **Root cannot extend** (prevents circular dependencies).

- **Key insight:** The explicit `$TURBO_EXTENDS$` marker is an interesting way to let array fields opt into merge-vs-replace on a per-field basis. More granular than Tailwind's approach.

### 8. TypeScript: `extends` in `tsconfig.json`

- **Single `extends` field** (string or array in TS 5.0+). `compilerOptions` are deep-merged (child wins on conflict). Source: [echobind.com/post/deep-dive-into-extending-tsconfig-json](https://echobind.com/post/deep-dive-into-extending-tsconfig-json)

- **`files`, `include`, `exclude` are NOT merged — they are replaced entirely.** This is the most common footgun in tsconfig inheritance. Source: [miyoon.medium.com/array-parameters-in-tsconfig-json-are-always-overwritten](https://miyoon.medium.com/array-parameters-in-tsconfig-json-are-always-overwritten-11c80bb514e1)

- **Monorepo pattern:** Shared `tsconfig.base.json` in root, each package extends it:
  ```json
  { "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "./dist" } }
  ```

- **Path resolution:** Paths in a tsconfig are relative to *that* file's location, not the extending file's.

### 9. Astro: `defineConfig()` + Integration Hooks

- **`defineConfig()`** is a type-safety wrapper like Vite's. Source: [docs.astro.build/en/reference/configuration-reference](https://docs.astro.build/en/reference/configuration-reference/)

- **Config modification happens through integration hooks.** The `astro:config:setup` hook provides `updateConfig()` which deep-merges into the user config:
  ```ts
  export default {
    name: 'my-integration',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({ build: { server: '...' } })
      }
    }
  }
  ```
  Source: [docs.astro.build/en/reference/integrations-reference](https://docs.astro.build/en/reference/integrations-reference/)

- **Presets** are arrays of integrations (not config objects). A preset returns `Integration[]`, not a config fragment.

- **No built-in `extends` or preset config system** for the top-level `defineConfig()`.

---

## Cross-Cutting Patterns

### Pattern 1: `defineConfig()` is Always a Type-Safety Shell

Every tool that provides `defineConfig()` uses it primarily for TypeScript IntelliSense. It does minimal or no runtime work. The real merge logic lives elsewhere (Vite's `mergeConfig`, Tailwind's internal resolver, ESLint's config array flattener).

**Implication for Sherpa:** Sherpa's current `defineConfig()` already does more than most (validation + default merging + plugin application). This is fine — but the type-safety wrapper pattern should remain the primary public API. Heavy logic should be in named, testable functions underneath.

### Pattern 2: "Extend" vs "Replace" Must Be Explicit

Every tool that handles layered config has had to decide how arrays and objects merge:

| Tool | Objects | Arrays |
|------|---------|--------|
| Vite `mergeConfig` | Deep merge | Replace |
| Tailwind v3 | Shallow merge at theme level; `extend` key for additive | Plugins concatenate; `corePlugins` depends on format |
| Tailwind v4 | N/A (CSS-based) | `--*: initial` to clear namespaces |
| ESLint flat | Last-wins in array | N/A (array of configs, not merged) |
| Nuxt layers | Deep merge with priority | Higher priority replaces |
| Turborepo | Deep merge | Replace by default; `$TURBO_EXTENDS$` for append |
| tsconfig | Deep merge `compilerOptions` | `files`/`include`/`exclude` replace entirely |

**Implication for Sherpa:** The three-layer model needs explicit merge semantics per section. Framework defaults should be "extend" (additive). Client layer should have a choice: extend OR replace. Deployment layer should always override (last-wins).

### Pattern 3: Config-as-Function for Environment Switching

Vite and Next.js both support exporting a function instead of an object. The function receives context (command/mode/phase) and returns environment-specific config. This is more powerful than static objects for deployment-layer config.

**Implication for Sherpa:** The deployment layer (surface selection, remote host, credentials) varies by environment. A function form would allow:
```ts
export default defineConfig(({ surface }) => ({
  deployment: surface === 'desktop' ? { ... } : { ... }
}))
```

### Pattern 4: Composition via Higher-Order Functions (Plugins)

Next.js (`withSentry(withMDX(config))`), Astro (integration hooks with `updateConfig`), and Sherpa's own `createPlugin` all use higher-order functions to layer config. This is the most flexible but least discoverable pattern.

**Implication for Sherpa:** The existing plugin system is sound. But plugins should be reserved for cross-cutting concerns (like `withSherpa` for Next.js). The three config layers should compose through a dedicated mechanism, not through plugins.

### Pattern 5: Presets as "Config Packages"

Tailwind v3 presets and Nuxt layers both allow publishing reusable config as npm packages. This is the most relevant pattern for Sherpa's consulting workflow: discovery produces config that gets packaged for the client.

| Aspect | Tailwind v3 Presets | Nuxt Layers |
|--------|-------------------|-------------|
| What's shared | Theme values, plugins, variants | Components, pages, config, modules |
| Package format | JS config object | Directory with nuxt.config.ts |
| Merge semantics | Shallow theme merge + extend collection | Priority-based override |
| Multiple presets | Yes, array | Yes, extends array |

**Implication for Sherpa:** A Sherpa "client preset" could be an npm package (or local directory) containing `sherpa.client.ts` + role definitions + vocabulary + conventions. The framework would resolve: `@sherpa/defaults` -> `@wavepoint/sherpa-config` -> `sherpa.config.ts`.

### Pattern 6: The "Reset Then Set" Pattern

Tailwind v4's `--color-*: initial` and Turborepo's array-replace-by-default both implement "clear the inherited values, then define my own." This is critical when a lower layer should take full ownership of a section.

**Implication for Sherpa:** If a client says "we don't use the default quality gates, we have our own," the client layer needs a way to say "replace this section entirely" rather than "merge my additions." A `$reset` sentinel or `override: true` flag per section would handle this.

---

## Implications for Sherpa's Three-Layer `defineConfig()`

### Proposed Layer Resolution Order

```
Layer 1: Framework defaults  (built into @sherpa/studio-core)
Layer 2: Client preset        (npm package or local directory, produced by consulting discovery)
Layer 3: User config           (sherpa.config.ts — deployment-specific, environment-aware)
```

### Design Recommendations

1. **Keep `defineConfig()` as the single entry point** but add an `extends` field (like ESLint/Nuxt):
   ```ts
   export default defineConfig({
     extends: ['@wavepoint/sherpa-config'],  // client preset
     deployment: { surface: 'web', ... },    // deployment layer
   })
   ```

2. **Client presets should be directories, not just config objects** (Nuxt layers model). A preset directory could contain:
   ```
   @wavepoint/sherpa-config/
     sherpa.preset.ts    # Config values
     roles/              # Custom role definitions
     vocabulary.ts       # Vocabulary overrides
     conventions/        # Custom convention rules
   ```

3. **Use Tailwind's "extend vs replace" distinction** per config section:
   - `vocabulary: { ... }` replaces the whole vocabulary section
   - `vocabulary: { extend: { ... } }` merges additively
   - Or simpler: top-level keys always shallow-merge (like Tailwind themes); use a dedicated `extend` sub-key for additive behavior

4. **Support function form for environment-aware deployment config:**
   ```ts
   export default defineConfig(({ env }) => ({
     extends: ['@client/sherpa-config'],
     deployment: env === 'production'
       ? { host: 'vps.example.com', tailscale: true }
       : { host: 'localhost' },
   }))
   ```

5. **Framework defaults should never appear in user-facing config.** They're built into `buildDefaults()` (which Sherpa already does correctly). The user should only see client + deployment layers.

6. **Config validation at each layer** with clear error messages about which layer caused the problem. Sherpa's current Zod validation is ahead of most tools here.

7. **Explicit merge semantics documented per section** — learn from tsconfig's footgun where `files`/`include` silently replace rather than merge.

---

## Open Questions

1. **Should client presets be npm packages, local directories, or both?** Nuxt supports all three (local path, npm, git remote). For consulting delivery, local directories during engagement, npm packages for long-term maintenance, makes sense. But what about air-gapped deployments?

2. **How does the deployment layer get credentials?** Every tool in this survey avoids credentials in config files. Sherpa should probably use environment variables or a separate `.env`-style file for provider API keys and Tailscale auth, with the deployment layer referencing them by name.

3. **Should `extends` be a single value or an array?** Tailwind and Nuxt support arrays (multiple presets). For Sherpa's consulting model, the common case is one client preset. But what about a client that also uses a vertical-specific preset (e.g., `@sherpa/astrology-preset` + `@wavepoint/sherpa-config`)?

4. **How does the client preset interact with `sherpa sync`?** If `sherpa sync` updates convention rules and role definitions, and the client preset also provides conventions, what's the merge order? This intersects with the Convention Sync CLI architecture.

5. **Should the framework layer be customizable at all?** Current design says "never edited by clients." But what if a client wants to disable a default quality gate? The Tailwind v4 "namespace reset" pattern (`--quality-gates-*: initial`) suggests there should be a controlled way to opt out of defaults.

6. **What about config watching/hot reload?** Vite watches `vite.config.ts` and restarts on change. If Sherpa Studio reads `sherpa.config.ts` at startup, changes during a running session would require restart. Is that acceptable?

7. **Type narrowing for surfaces.** If the deployment layer selects `surface: 'desktop'`, should the config type narrow to exclude web-only options? TypeScript conditional types could do this, but it adds complexity.

---

## Sources

- [Vite Configuration](https://vite.dev/config/)
- [Vite mergeConfig API](https://vite.dev/guide/api-javascript)
- [Vite `extends` issue #8964](https://github.com/vitejs/vite/issues/8964)
- [Vite config reuse patterns](https://dev.to/padcom/vite-config-reuse-l3a)
- [Next.js next.config.js](https://nextjs.org/docs/app/api-reference/config/next-config-js)
- [Next.js plugin composition discussion](https://github.com/vercel/next.js/discussions/40710)
- [Tailwind CSS v3 Presets](https://v3.tailwindcss.com/docs/presets)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/configuration/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [ESLint defineConfig + extends blog post](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/)
- [Nuxt Layers](https://nuxt.com/docs/4.x/getting-started/layers)
- [Nuxt Authoring Layers](https://nuxt.com/docs/4.x/guide/going-further/layers)
- [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/)
- [Astro Integration API](https://docs.astro.build/en/reference/integrations-reference/)
- [Turborepo Package Configurations](https://turborepo.dev/docs/reference/package-configurations)
- [Turborepo $TURBO_EXTENDS$ microsyntax](https://turborepo.dev/blog/turbo-2-7)
- [tsconfig.json extends deep dive](https://echobind.com/post/deep-dive-into-extending-tsconfig-json)
- [tsconfig array fields overwrite behavior](https://miyoon.medium.com/array-parameters-in-tsconfig-json-are-always-overwritten-11c80bb514e1)
