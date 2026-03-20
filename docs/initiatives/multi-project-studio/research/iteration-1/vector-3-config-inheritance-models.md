# Vector 3: Config Inheritance Models

**Question:** How do popular dev tools handle config inheritance — "extend upstream defaults, override locally"?
**Agent dispatched:** 2026-03-20

## Findings

### ESLint Flat Config — Array-Based, Last-Wins Cascade
- Exports an **array of config objects**. Later objects override earlier ones — explicit ordering
- Rules merge at the individual rule level — the entire rule tuple is replaced, not deep-merged
- New `defineConfig()` + `extends` (March 2025) brings back extends inside flat config. Extended entries prepended before current object, so local settings naturally override
- Old `.eslintrc` cascade walked directory tree — exponential complexity in monorepos. Flat config was invented to escape this
- **Monorepo pain:** Only one config file loads per invocation. Spread configs have glob paths relative to wrong directory (#1 complaint, [Issue #18385](https://github.com/eslint/eslint/issues/18385))

### TypeScript tsconfig — Shallow Key Merge
- `extends` accepts string or array (TS 5.0+). Later entries override earlier for conflicts
- `compilerOptions` merges shallowly by key. Individual keys merge; child wins
- **`files`, `include`, `exclude`, `paths` are FULLY REPLACED** — not merged. Major gotcha
- Project References (`references` + `composite`) are separate — define build dependency graphs, not config inheritance

### Tailwind CSS Presets — Per-Key Strategy
- `theme` (top-level keys): shallow replacement. `theme.extend`: always **combined/additive**
- `plugins`: arrays concatenated. `corePlugins`: type-dependent (object=merged, array=replaced)
- `presets: []` (empty array) opts out of all defaults — from-scratch base
- **v4 (2025)** moved to CSS-first configuration with `@theme` directives — paradigm shift

### Prettier — No Inheritance
- No `extends` mechanism. Manual spread in JS config: `export default { ...require("@org/config"), semi: false }`
- JSON config users cannot extend at all
- Team's position: few enough options that inheritance isn't needed

### Babel — Identity-Based Plugin Merging
- Three config layers: project-wide (`babel.config.json`) > file-relative (`.babelrc`) > programmatic
- Same plugin appearing in both base and override → recognized by identity, options replaced (not duplicated)
- Presets are opaque boxes — internal plugins are private

### Vite / Webpack
- **Vite:** `mergeConfig()` utility — deep merge with array concatenation (problematic — arrays should often replace). No built-in `extends`
- **Webpack:** `webpack-merge` package — customizable per-field strategy (append, prepend, replace, merge). Most flexible but complex API

## Comparison

| Tool | Merge Model | Array Handling | Built-in extends |
|------|------------|----------------|-----------------|
| ESLint Flat | Array of objects, last-wins | N/A (rules are objects) | Yes |
| TypeScript | Shallow key merge | Replaced wholesale | Yes |
| Tailwind | Per-key strategy | Type-dependent | Yes (presets) |
| Prettier | No inheritance | N/A | No |
| Babel | Identity-based plugin merge | Identity-based dedup | Implicit via layers |
| Webpack | Customizable per-field | Configurable | No (third-party) |

## Key Patterns

1. **Last-Wins Array** (ESLint, Tailwind): config is ordered array, later entries win. Most developer-friendly
2. **Shallow Key Merge with Escape Hatch** (TypeScript, Tailwind): top-level keys replaced, `extend` namespace always additive
3. **Identity-Based Dedup** (Babel, webpack-merge): same entity recognized by identity, options replaced not duplicated
4. **No Inheritance, Just Spread** (Prettier, Vite): works for flat configs, breaks with nested structures
5. **Per-Key Strategy** (webpack-merge, Tailwind): most flexible but hardest to document

## Sources

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [ESLint Evolving Flat Config](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/)
- [TypeScript TSConfig extends](https://www.typescriptlang.org/tsconfig/extends.html)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Tailwind CSS Presets](https://v3.tailwindcss.com/docs/presets)
- [Prettier Sharing Configurations](https://prettier.io/docs/sharing-configurations)
- [Babel Configuration](https://babeljs.io/docs/configuration)
- [Vite mergeConfig](https://vite.dev/guide/api-javascript)
- [webpack-merge](https://www.npmjs.com/package/webpack-merge)

## Implications for Sherpa

1. **Use Last-Wins Array as primary pattern** — ESLint's flat config is most relevant precedent
2. **Distinguish replace vs extend keys** — Tailwind's `theme` vs `theme.extend` is the cleanest solution
3. **Keep option surface flat** — less nesting = less merge complexity
4. **Avoid directory-tree cascading** — ESLint's old `.eslintrc` cascade is a cautionary tale
5. **Support opt-out of defaults** — `presets: []` pattern for from-scratch projects
6. **Solve array replacement vs concatenation upfront** — #1 gotcha across the ecosystem
7. **Identity-based dedup for convention rules** — use slugs as stable identifiers

## Open Questions

1. What is a "convention identity" — filename, slug, or explicit id field?
2. Should `extends` reference npm packages, file paths, or both?
3. How do globs interact with inheritance when loaded from `node_modules`?
4. Does Sherpa need "remove" semantics, or is "override to no-op" sufficient?
5. Per-field merge strategy for behavioral constraint fields (disposition replaces, fail-triggers appends?)
