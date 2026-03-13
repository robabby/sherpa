# Iteration 3 — 2026-03-11

## What We Already Knew

Iteration 1 established the three-channel distribution architecture (npm, plugins, CLI) and identified Payload CMS as the architectural model. Iteration 2 proved concrete implementability: clean extraction DAG (zero circular deps), 91/96 components domain-agnostic, `defineConfig()` + `withSherpa()` config entrypoint, `node-diff3` + manifest for convention sync, and JIT→Publishable graduation path. Five open questions remained: `createStudio()` API, catalog registration, plugin marketplace, `server-only` portability, and standalone testing.

## Research Vectors

### Vector 1: `createStudio(config)` API Design
**Question:** What does the typed server-side data access layer return?
**Full report:** [iteration-3/vector-1-create-studio-api.md](iteration-3/vector-1-create-studio-api.md)

**Key discoveries:**
- Keystatic's `createReader(cwd, config)` returns a typed object with nested namespaces per collection ([Keystatic Reader API](https://keystatic.com/docs/reader-api)). Payload's `getPayload({ config })` returns a singleton with flat CRUD methods parameterized by collection name ([Payload Local API](https://payloadcms.com/docs/local-api/overview)). Prisma and Stripe use nested namespaces (`prisma.user.findMany()`, `stripe.customers.list()`).
- **Nested namespaces > flat methods** for Studio because operations are heterogeneous — `getInitiatives()` returns `Initiative[]`, `getHubStats()` returns `HubStats`. Flat methods with collection parameter (Payload pattern) only works when all collections have uniform CRUD.
- **Module-scope singleton** is correct. No per-request state, no user context, no connection pooling. Keystatic and Payload both use singletons.
- **Leave caching to the consumer.** Neither Keystatic nor Payload build in Next.js caching. Consumers wrap with `React.cache()` or `use cache`. Baking caching in couples Sherpa to Next.js.
- **13 domain namespaces** map cleanly to current barrel exports: `initiatives`, `tasks`, `agents`, `docs`, `conventions`, `portfolio`, `skills`, `sessions`, `stats`, `process`, `research`, `primitives`, `api`.
- **Utilities stay as standalone exports.** `parseFrontmatter`, `extractTitle`, Zod schemas, types, constants — pure functions with no config dependency.

**Implications:**
- `const studio = createStudio(config)` returns a typed object with `studio.initiatives.list()`, `studio.agents.listRoles()`, `studio.stats.hub()` etc.
- This is the primary API surface of `@sherpa/studio-core` — the thing consumers actually call

### Vector 2: Catalog Registration & Plugin Extension
**Question:** How should plugins register catalog entries? Can behavioral agent catalogs be Claude Code plugins?
**Full report:** [iteration-3/vector-2-catalog-registration-plugin-extension.md](iteration-3/vector-2-catalog-registration-plugin-extension.md)

**Key discoveries:**
- Payload's plugin type is a pure function: `Plugin = (config: Config) => Config`. Collections added by spreading — no imperative registration API. Composable (plugin A's output is plugin B's input). ([Payload Plugins](https://payloadcms.com/docs/plugins/overview))
- Backstage's imperative `catalog.addEntityProvider(provider)` is designed for dynamic/async providers — overkill for Sherpa's static catalogs. ([Backstage Extension Points](https://backstage.io/docs/backend-system/architecture/extension-points/))
- **Claude Code plugins distribute 7 component types** including agents and skills. Agent definitions map to behavioral engineering format. However, plugins CANNOT distribute `.claude/rules/` files — only agents, skills, hooks, MCP servers. ([Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference))
- **Agent Skills standard adopted by 31+ agents** (Claude Code, Cursor, Codex, Gemini CLI, VS Code Copilot, etc.). Skills packaged as SKILL.md work across all. ([agentskills.io](https://agentskills.io/home))
- **Config-based registration wins for 3-5 static catalog types**: fully typed, composable, inspectable. Plugins contribute via config spreading, not imperative registration.

**Implications:**
- Catalogs are a config concern: `defineConfig({ catalogs: { primitives: [...], endpoints: [...], roles: [...] } })`
- Plugins contribute catalogs by spreading into config arrays (Payload pattern)
- A `sherpa-studio-plugin` for Claude Code can distribute behavioral agents + skills + hooks + MCP server
- Schema translation layer needed: behavioral agent format → Claude Code subagent format

### Vector 3: `server-only` Portability & Environment Strategy
**Question:** How do we handle `server-only` imports for non-Next.js environments?
**Full report:** [iteration-3/vector-3-server-only-portability.md](iteration-3/vector-3-server-only-portability.md)

**Key discoveries:**
- **`server-only` THROWS in plain Node.js and Bun** — it's a 3-file package that uses `react-server` conditional exports. Without a bundler setting that condition, the import crashes. ([Nico's Blog](https://www.nico.fyi/blog/server-only-package))
- **Payload's core package has zero `server-only` imports.** `@payloadcms/next` is the Next.js adapter — package-level separation, not conditional exports. ([Payload Docs](https://payloadcms.com/docs/local-api/outside-nextjs))
- **Keystatic uses the most sophisticated conditional exports found** (5 conditions per export path) plus `#imports` (Node.js subpath imports) for internal conditional modules. But they do NOT use `server-only`. ([Keystatic package.json](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/package.json))
- **Keystatic's `MinimalFs` abstraction** (`readFile`, `readdir`, `fileExists`) is the cleanest filesystem injection pattern. Local reader wraps `fs/promises`, GitHub reader wraps GitHub API. ([Keystatic source](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts))
- **Recommendation: Strip `server-only` entirely from `@sherpa/studio-core`** (Strategy A). Consumers add the guard at their re-export layer. This is exactly what Payload does.
- **Filesystem: Parameterize root path, not abstract FS.** All target runtimes (Node.js, Bun) have compatible `fs`. YAGNI on `MinimalFs` until a non-filesystem backend is needed.

**Implications:**
- Zero conditional export complexity in the framework package
- WavePoint's thin wrapper adds `import "server-only"` at re-export
- `@sherpa/studio-next` adapter package can be added later (Strategy C) as convenience for external consumers

### Vector 4: Standalone Testing Strategy
**Question:** How do you test `@sherpa/studio-core` in isolation?
**Full report:** [iteration-3/vector-4-standalone-testing-strategy.md](iteration-3/vector-4-standalone-testing-strategy.md)

**Key discoveries:**
- **Payload uses root vitest config with `projects` array** — per-package tests run without per-package configs. Filesystem tests use real temp directories, not memfs. ([Payload vitest.config.ts](https://github.com/payloadcms/payload/blob/main/vitest.config.ts))
- **Backstage uses dependency injection** via `startTestBackend()` with 18 mock services. Entity validation uses inline fixture objects, not filesystem fixtures, and no snapshot testing. ([Backstage testing docs](https://backstage.io/docs/backend-system/building-plugins-and-modules/testing/))
- **WavePoint's existing vitest config already stubs `server-only`** via `resolve.alias` pointing to an empty export file. The extracted package should simply remove `server-only` imports entirely.
- **Two-layer test strategy**: unit tests for pure parsing (string in → structured out, no mocking), integration tests with committed `__fixtures__/` directory mimicking monorepo structure (~20 files).
- **Mock `child_process` for velocity.ts** using `vi.mock('node:child_process')` with canned output. No need for full adapter interface.
- **No snapshot testing for governance data.** Explicit assertions (`expect(result.status).toBe('approved')`) more maintainable than full-object snapshots.

**Implications:**
- `__fixtures__/` directory with minimal monorepo structure is sufficient
- Per-package `vitest.config.ts` with `environment: 'node'`
- `zod` as peerDependency, `gray-matter` as direct dependency

## Synthesis

### The Central Insight: The API Surface Is the Missing Piece

Iterations 1-2 answered "how to build it" (extraction sequence, packaging, distribution). Iteration 3 answers "how to use it." The `createStudio(config)` API design is the linchpin — it determines what `@sherpa/studio-core` feels like to a consumer. The nested namespace pattern (`studio.initiatives.list()`) is the right shape: it mirrors the config structure, provides clean TypeScript autocompletion, and maps 1:1 to the existing barrel exports without a flat/collection-parameterized indirection.

### Cross-Vector Pattern: Payload Is the Architecture Template

Every vector independently converged on Payload CMS as the structural model:

| Concern | Payload's Solution | Sherpa's Equivalent |
|---------|-------------------|-------------------|
| Data access API | `getPayload({ config })` singleton | `createStudio(config)` singleton |
| Plugin registration | Config spreading `(config) => modifiedConfig` | Same — catalogs as config arrays |
| Environment portability | Core package has no `server-only`; `@payloadcms/next` is the adapter | Strip `server-only` from core; thin wrapper adds it |
| Testing | Root vitest config, real temp dirs, co-located tests | Per-package vitest config, committed `__fixtures__/` |

This is no longer "inspired by Payload" — it's a concrete architectural clone of their separation strategy. Three iterations of independent research all pointed to the same framework.

### Cross-Vector Pattern: The Namespace-Config Symmetry

The `createStudio()` namespaces and the `defineConfig()` config sections should mirror each other:

```
Config shape:                    API shape:
defineConfig({                   createStudio(config) → {
  catalogs: {                      initiatives: { list(), get(), ... }
    primitives: [...],             tasks: { list(), get(), ... }
    endpoints: [...],              agents: { listRoles(), ... }
    roles: [...],                  catalogs: {
  },                                 primitives: { list(), stats() }
  vocabulary: { ... },               endpoints: { list(), getForPrimitive() }
  paths: { ... },                    roles: { list() }
  agents: { ... },                 }
  plugins: [...]                   stats: { hub() }
})                                 ...
                                 }
```

This symmetry means the config tells Sherpa what your project looks like, and the API provides typed access to read it. Plugins contribute to both sides — they can add catalog entries (config) and the framework automatically exposes them via the API.

### Cross-Vector Pattern: Remove, Don't Abstract

The consistent finding across vectors 3 and 4: **remove `server-only` rather than abstracting around it, parameterize the root path rather than injecting a filesystem interface, mock `child_process` rather than building a git adapter.** Every vector found that the simpler approach (removal, parameterization) was what the proven frameworks actually do, while the more complex approach (conditional exports, `MinimalFs`, adapter patterns) was either premature or never adopted by the referenced frameworks.

### The Complete Consumer Experience

After iteration 3, the full developer experience is clear:

```ts
// sherpa.config.ts
import { defineConfig, wavePointPlugin } from '@sherpa/studio'

export default defineConfig({
  projectRoot: process.cwd(),
  vocabulary: { initiative: 'Initiative', task: 'Task' },
  catalogs: {
    primitives: [...],
    endpoints: [...],
  },
  plugins: [wavePointPlugin({ theme: 'modern-mystic' })],
})

// Any server-side code:
import { createStudio } from '@sherpa/studio-core'
import config from './sherpa.config'

const studio = createStudio(config)
const initiatives = studio.initiatives.list()
const roles = studio.agents.listRoles()
const stats = studio.stats.hub()

// Next.js wrapper (adds server-only guard):
// packages/studio-core/src/index.ts
import 'server-only'
export { studio } from './create' // re-export the instance
```

## All Sources

### API Design Patterns
- [Keystatic Reader API](https://keystatic.com/docs/reader-api) — Typed data access layer
- [Payload Local API](https://payloadcms.com/docs/local-api/overview) — Server-side data access
- [Prisma Client API](https://www.prisma.io/docs/orm/prisma-client) — Nested namespace pattern
- [Stripe Node.js SDK](https://github.com/stripe/stripe-node) — Resource-based API design

### Plugin & Catalog Registration
- [Payload Plugins Overview](https://payloadcms.com/docs/plugins/overview) — Config transformation pattern
- [Payload Building Plugins](https://payloadcms.com/docs/plugins/build-your-own) — Collection spreading
- [Backstage Extension Points](https://backstage.io/docs/backend-system/architecture/extension-points/) — Typed registration surfaces
- [Backstage External Integrations](https://backstage.io/docs/features/software-catalog/external-integrations/) — EntityProvider pattern
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) — 7 component types
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) — Agent definition format
- [agentskills.io](https://agentskills.io/home) — Agent Skills standard (31+ agents)
- [SKILL.md Specification](https://www.mdskills.ai/specs/skill-md) — Skill format spec

### Environment Portability
- [Nico's Blog: server-only explained](https://www.nico.fyi/blog/server-only-package) — 3-file mechanism
- [React RFC #227](https://github.com/reactjs/rfcs/blob/main/text/0227-server-module-conventions.md) — `react-server` condition spec
- [Payload: Using Outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs) — Standalone script support
- [Keystatic package.json](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/package.json) — Conditional exports
- [Keystatic reader/generic.ts](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts) — MinimalFs abstraction
- [Node.js Packages docs](https://nodejs.org/api/packages.html) — Conditional exports specification
- [hirok.io exports guide](https://hirok.io/posts/package-json-exports) — Default conditions per bundler

### Testing
- [Payload vitest.config.ts](https://github.com/payloadcms/payload/blob/main/vitest.config.ts) — Root config with projects
- [Payload manage-env-files.spec.ts](https://github.com/payloadcms/payload/blob/main/packages/create-payload-app/src/lib/manage-env-files.spec.ts) — Real temp dir testing
- [Backstage backend testing](https://backstage.io/docs/backend-system/building-plugins-and-modules/testing/) — DI-based test harness
- [Vitest test projects](https://vitest.dev/guide/projects) — Monorepo project config
- [Vitest file system mocking](https://vitest.dev/guide/mocking/file-system) — memfs pattern
- [Vitest 3 Monorepo Setup](https://www.thecandidstartup.org/2025/09/08/vitest-3-monorepo-setup.html) — Practical guide

## Proposals Generated

Updated `docs/initiatives/sherpa-framework-extraction/proposal.md` with:
1. `createStudio(config)` nested namespace API design (13 namespaces + standalone utility exports)
2. Config-based catalog registration via plugin spreading (Payload pattern)
3. `server-only` removal strategy (strip from core, consumers add at wrapper layer)
4. Standalone testing strategy (`__fixtures__/` + per-package vitest config)
5. Claude Code plugin structure for distributing behavioral agents + skills

## Open Questions for Next Iteration

1. **Sync vs async API** — Should `createStudio()` methods be sync (matching current `readFileSync` implementation) or async (future-proofing for remote content sources)? Keystatic is async, Payload is async. Current implementation is sync. Migration cost vs forward compatibility.

2. **Behavioral agent schema translation** — How much of the behavioral agent schema (disposition, fail-triggers, quality-bar, escalation graph) survives translation to Claude Code's simpler subagent format? Can structured behavioral constraints be preserved for programmatic Judge evaluation, or do they flatten to system prompt text?

3. **Multi-plugin catalog collision policy** — When two plugins contribute catalog entries with the same slug, who wins? Payload uses last-plugin-wins ordering. Backstage uses `locationKey` conflict resolution. Sherpa needs an explicit policy (error, merge, last-wins).

4. **Directory convention portability** — `readMonorepoFile` hardcodes paths like `docs/initiatives/`, `docs/tasks/`, `.claude/rules/`. Non-WavePoint consumers will have different directory conventions. How much of this is config (`paths:` section) vs vocabulary (`initiative` → `project`)?

5. **Phase 2 extraction plan readiness** — All 5 original open questions are now answered. Is the research sufficient to write the detailed Phase 2 extraction plan (file-by-file moves, package.json configs, tsup builds, Changesets setup)?
