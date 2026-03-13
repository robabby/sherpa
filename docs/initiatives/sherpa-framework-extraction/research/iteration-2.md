# Iteration 2 — 2026-03-11

## What We Already Knew

Iteration 1 established the three-channel distribution architecture (npm for code, plugins for executable conventions, custom CLI for prose conventions), identified Payload CMS as the architectural model, proposed the five-package split (`@sherpa/studio-*`), and flagged convention sync as the hardest unsolved problem. Five open questions remained: convention sync CLI design, plugin marketplace, config-as-code entrypoint, extraction sequencing, and Turborepo-to-npm publishing.

## Research Vectors

### Vector 1: Convention Sync CLI Architecture
**Question:** What is the minimum viable convention sync tool for distributing and updating Markdown/YAML convention files?
**Full report:** [iteration-2/vector-1-convention-sync-cli.md](iteration-2/vector-1-convention-sync-cli.md)

**Key discoveries:**
- Copier's three-way merge is git-native (`git diff-tree` + `git apply --reject` + `git merge-file`), not a custom algorithm. Convention files simplify this because they're static (no Jinja2 template rendering needed).
- `node-diff3` (v3.2.0, MIT, pure JS) reimplements the same three-way merge algorithm without requiring git as a dependency.
- **No JS/TS tool combines scaffolding + provenance tracking + three-way merge.** Genuine ecosystem gap. Building blocks exist (`node-diff3`, `jsdiff`, `@inquirer/prompts`, `chalk`) but nobody has assembled them.
- Claude Code loads ALL matching `.claude/rules/*.md` files additively — no precedence. `.local.md` files work as extensions, not overrides. Framework rules state principles; local rules state applications. Both load. The sync tool never touches `.local.md` files.
- The manifest needs three artifacts per file: upstream hash at sync, local hash at sync, and cached old upstream content (in `.sherpa/cache/`, gitignored) for the merge ancestor.

**Implications:**
- MVP `sherpa sync`: manifest status detection → summary → per-file interactive prompt → `node-diff3` for diverged files
- Four runtime deps: `node-diff3`, `diff` (jsdiff), `@inquirer/prompts`, `chalk`
- Convention pattern: framework-synced base files + consumer-owned `.local.md` extensions + `sherpa.manifest.json` for provenance
- Scope: 1 session to build MVP

### Vector 2: Config-as-Code Entrypoint Design
**Question:** What should `sherpa.config.ts` look like concretely?
**Full report:** [iteration-2/vector-2-config-as-code-entrypoint.md](iteration-2/vector-2-config-as-code-entrypoint.md)

**Key discoveries:**
- Payload CMS's `buildConfig()` confirmed as the right model: two required fields, everything else optional with defaults, validated by Zod at startup
- The curried plugin pattern `(options) => (config) => modifiedConfig` is universal across Payload and Sanity — adopt directly
- Sanity's callback pattern `(defaults) => merged` for extensible properties eliminates "replace vs extend" ambiguity
- Keystatic's `createReader(cwd, config)` maps to `createStudio(config)` — a typed data access layer without HTTP
- Vocabulary is a config concern, not an i18n concern — consumers write `vocabulary: { initiative: 'Project' }` and the framework handles next-intl plumbing internally

**Implications:**
- Two-file integration: `sherpa.config.ts` (all config) + `withSherpa()` in `next.config.ts` (route injection)
- `defineConfig()` as entrypoint (matches Sanity/Vite convention)
- Complete TypeScript types produced for all config sections (SherpaUserConfig, AdminConfig, ThemeConfig, VocabularyConfig, PathsConfig, EntitiesConfig, AgentsConfig, McpConfig, SherpaPlugin)

### Vector 3: Extraction Dependency Graph
**Question:** What is the concrete extraction order for Studio's 21 lib files and 96 components?
**Full report:** [iteration-2/vector-3-extraction-dependency-graph.md](iteration-2/vector-3-extraction-dependency-graph.md)

**Key discoveries:**
- **Zero circular dependencies.** The lib layer is a clean DAG across 4 layers.
- **Only ONE external import** in the entire lib layer: `file-tree.ts` → `@/lib/content-urls` (one function, trivially injectable)
- **8 leaf nodes** (zero studio deps): types.ts, lifecycle.ts, process-nodes-shared.ts, tasks.ts, mcp.ts, content.ts, primitives-catalog.ts, api-catalog.ts
- **91 of 96 components** are domain-agnostic. Only 5 import from `@/lib/transit-content/` (WavePoint-specific).
- External runtime deps: only `zod` and `gray-matter`. Everything else is Node stdlib or Next.js guards.
- `server-only` guard in 7 files needs to be made configurable for non-Next.js consumers.
- `velocity.ts` shells out to `git` via `execSync` — should be optional module.

**Implications:**
- 5-phase extraction: Foundation (leaves) → Schemas/Parsing → Data Catalogs → I/O Layer → Composites
- `@sherpa/studio-ui` v0.1 ships 91/96 components; 5 excluded as WavePoint extensions
- Catalog files (`primitives-catalog.ts`, `api-catalog.ts`) have generic structure but WavePoint-specific content — extract as empty registries with registration API

### Vector 4: Turborepo Internal Packages → npm Publishing
**Question:** What's the concrete workflow for internal packages + Changesets + npm?
**Full report:** [iteration-2/vector-4-turborepo-npm-publishing.md](iteration-2/vector-4-turborepo-npm-publishing.md)

**Key discoveries:**
- Turborepo defines three package strategies: JIT (no build), Compiled (tsc, cached), Publishable (tsup, npm-ready). `@wavepoint/content` already uses JIT. Sherpa packages should start JIT and graduate to Publishable.
- Changesets handles `workspace:*` automatically — pnpm converts workspace protocol to real semver at publish time. The `pnpm install` step after `changeset version` is critical and often forgotten.
- **`fixed` mode** is right for Sherpa — all `@sherpa/studio-*` packages release together at the same version.
- tsup is the recommended build tool (CJS+ESM dual output + `.d.ts` in one command).
- **yalc is the best local testing option** for iterating across two repos. Skip verdaccio (overkill) and `pnpm link` (duplicate React footguns).
- The `.d.ts` gotcha is the #1 transition pitfall — internal packages point `types` at `.ts` source files, but published packages must point at generated `.d.ts` in `dist/`.
- **WavePoint doesn't currently use Turborepo** (no `turbo.json`). Adding it is a separate decision from Changesets.

**Implications:**
- Start as JIT internal packages, graduate to Publishable with tsup when ready for npm
- Use yalc for local cross-repo testing during development
- Changesets `fixed` mode ensures coherent framework versions
- Consider whether turbo.json is worth adding or whether pnpm workspace scripts suffice

## Synthesis

### The Central Insight: Sherpa Is Implementable Now

Iteration 1 proved the architecture was sound. Iteration 2 proves it's **concretely buildable**. Every open question from iteration 1 now has a specific, sourced answer:

| Question | Answer | Confidence |
|----------|--------|------------|
| Convention sync mechanism | `node-diff3` + manifest + interactive terminal UX | High — algorithm proven in Copier, JS building blocks exist |
| Config entrypoint design | `defineConfig()` with typed sections, Payload/Sanity-modeled | High — complete TypeScript types drafted |
| Extraction order | 5-phase DAG (8 leaves → 5 singles → 5 multis → 2 roots) | Very high — based on actual import analysis |
| Component readiness | 91/96 domain-agnostic | Very high — only 5 have domain imports |
| Publishing workflow | JIT → Publishable (tsup) + Changesets fixed mode + yalc | High — standard tooling, well-documented |

### The Config Pipeline

```
sherpa.config.ts → defineConfig() → defaults → callbacks → plugins → Zod → SherpaConfig
next.config.ts  → withSherpa()   → route injection → NextConfig
```

### The Sync Algorithm

```
sherpa sync:
  1. Read sherpa.manifest.json (provenance: upstream hash, local hash, cached content)
  2. For each managed file:
     - Hash current local file
     - Fetch current upstream content from npm package
     - Compare: unchanged / locally modified / upstream updated / diverged
  3. Display summary table
  4. Per-file interactive prompt:
     - Unchanged upstream: skip
     - Upstream-only change: auto-apply
     - Local-only change: skip (already customized)
     - Diverged: node-diff3 three-way merge → show diff → accept/reject/edit
  5. Update manifest
```

### The Extraction Sequence

```
Phase 1: @sherpa/studio-core foundation
  types.ts → lifecycle.ts → process-nodes-shared.ts → tasks.ts → mcp.ts

Phase 2: @sherpa/studio-core schemas + parsing
  schemas.ts → markdown.ts → activity-links.ts

Phase 3: @sherpa/studio-core catalogs (empty registries + registration API)
  primitives-catalog.ts → api-catalog.ts → api-endpoints.ts → prompts.ts

Phase 4: @sherpa/studio-core I/O
  content.ts → velocity.ts → deliverables.ts → research-report.ts

Phase 5: @sherpa/studio-core composites
  file-tree.ts (decouple 1 import) → process-nodes.ts → index.ts

Phase 6: @sherpa/studio-ui (91 components, 5 excluded)
Phase 7: @sherpa/studio-mcp (standalone, already domain-agnostic)
Phase 8: @sherpa/studio-cli (sherpa init + sherpa sync — new code)
```

### Cross-Vector Pattern: The "Empty Registry" Problem

Both the extraction graph (Vector 3) and the config entrypoint (Vector 2) surfaced the same design challenge: catalog files (`primitives-catalog.ts`, `api-catalog.ts`) have generic structure but WavePoint-specific content. The config system solves this — catalogs are populated via `sherpa.config.ts` or via plugins that call a registration API. The framework ships empty; consumers fill the registries.

### Cross-Vector Pattern: The JIT-to-Publishable Graduation

Vector 4 (Turborepo) and Vector 3 (extraction graph) converge on a gradual extraction strategy:
1. **Today**: Studio code lives in `packages/studio-core/src/` (monolith)
2. **Phase 1**: Move to `packages/studio-core/src/` as JIT internal package (import aliases change, zero build step)
3. **Phase 2**: Add tsup build, Changesets config, graduate to Publishable
4. **Phase 3**: `../sherpa` installs from npm, validates real package boundaries

This three-step graduation means extraction doesn't require a "big bang" migration.

## All Sources

### Convention Sync & File Distribution
- [Copier docs](https://copier.readthedocs.io/) — Python template engine with three-way merge
- [Copier source: _apply_update](https://github.com/copier-org/copier/blob/master/copier/main.py) — Three-way merge implementation
- [node-diff3](https://www.npmjs.com/package/node-diff3) — Three-way merge in pure JavaScript
- [jsdiff](https://www.npmjs.com/package/diff) — Diff generation library
- [Backstage upgrade helper](https://backstage.github.io/upgrade-helper/) — Structural diff tool
- [rn-diff-purge](https://github.com/react-native-community/rn-diff-purge) — React Native upgrade diffs
- [Claude Code rules docs](https://code.claude.com/docs/en/rules) — Rule file loading behavior

### Config-as-Code Systems
- [Payload CMS config](https://payloadcms.com/docs/configuration/overview) — buildConfig() pattern
- [Payload CMS types source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts) — Config type definitions
- [Sanity Studio config](https://www.sanity.io/docs/configuration) — defineConfig() pattern
- [Keystatic config](https://keystatic.com/docs/configuration) — createReader() pattern
- [Backstage app-config](https://backstage.io/docs/conf/) — YAML config merging
- [next-intl namespace docs](https://next-intl.dev/docs/usage/messages) — i18n for vocabulary
- [Strapi i18n customization](https://docs.strapi.io/dev-docs/admin-panel-customization) — Translation-based vocabulary

### Package Publishing
- [Turborepo internal packages](https://turborepo.dev/docs/core-concepts/internal-packages) — JIT/Compiled/Publishable strategies
- [Changesets docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md) — Version management
- [Changesets fixed mode](https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md) — Synchronized versioning
- [tsup docs](https://tsup.egoist.dev/) — TypeScript bundler
- [yalc](https://github.com/wclr/yalc) — Local package testing
- [pnpm workspace protocol](https://pnpm.io/workspaces) — workspace:* → semver conversion

### Extraction Patterns
- [shadcn/ui registry](https://ui.shadcn.com/docs/registry) — Component distribution via registry
- [Payload CMS plugins](https://payloadcms.com/docs/plugins/overview) — Curried plugin pattern
- [Sanity plugins](https://www.sanity.io/docs/developing-plugins) — Plugin composition

## Proposals Generated

Updated `docs/initiatives/sherpa-framework-extraction/proposal.md` with:
1. Concrete extraction sequence (8-phase, dependency-ordered)
2. Config entrypoint design (`defineConfig()` + `withSherpa()`)
3. Convention sync algorithm (manifest + node-diff3 + interactive terminal)
4. JIT-to-Publishable graduation strategy
5. Component readiness assessment (91/96 domain-agnostic)

## Open Questions for Next Iteration

1. **`createStudio(config)` API design** — What does the typed server-side data access layer return? Methods like `getInitiatives()`, `getTasks()`? How does it compose with Next.js server components? This is the API surface that makes `@sherpa/studio-core` usable.

2. **Convention catalog design** — How do plugins register catalog entries (primitives, API endpoints, agent roles)? Is it config-based (`collections` array like Payload) or imperative (`registry.register()` like Backstage)?

3. **Plugin marketplace for Sherpa** — Deferred from iteration 2. Claude Code's plugin system distributes skills and hooks. Can behavioral agent catalogs be distributed as a plugin? What's the plugin manifest format?

4. **`server-only` and environment portability** — 7 lib files import `server-only`. Should Sherpa support non-Next.js environments (plain Node.js, Bun)? If so, what's the conditional import strategy?

5. **Testing strategy for extracted packages** — How do you test `@sherpa/studio-core` in isolation? The current test file (`__tests__/studio.test.ts`) tests within the Next.js app context. What's the standalone test setup?
