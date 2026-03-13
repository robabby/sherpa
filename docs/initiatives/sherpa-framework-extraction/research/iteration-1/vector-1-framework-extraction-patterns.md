# Framework Extraction Models — Research Report

**Date:** 2026-03-11
**Initiative:** sherpa-framework-extraction
**Research question:** How do successful open-source projects structure "extract into framework" models? What package architectures work for distributing an internal tool as a reusable framework?

---

## Key Discoveries

### 1. shadcn/ui: The Registry Model (Copy + Own)

- **Core model:** Components are copied into your project as source code, not installed as npm dependencies. You own the code after installation. ([shadcn/ui docs](https://ui.shadcn.com/docs/cli))
- **`shadcn init`** scaffolds: installs dependencies, adds `cn()` utility, configures CSS variables, creates `components.json` config file. Supports `--template` (next, vite, astro, etc.), `--base` (radix or base UI), `--preset` for design system configuration. ([shadcn/ui CLI docs](https://ui.shadcn.com/docs/cli))
- **Update story:** No automatic updates. You diff manually: `npx shadcn@latest diff button` compares your local component against the registry. The `--diff` flag on `add` previews changes before applying. The `--overwrite` flag replaces your file with the latest registry version. ([GitHub Discussion #790](https://github.com/shadcn-ui/ui/discussions/790))
- **CLI v4 (March 2026):** Added `registry:base` type that distributes an *entire design system* as a single payload (components, deps, CSS vars, fonts, config). Added `--dry-run`, `--view` flags. Added `/skills` for AI agent context. ([shadcn/cli v4 changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4))
- **Custom registries:** You can host your own registry as JSON files conforming to the `registry-item` schema. Items include components, hooks, pages, config, rules, and arbitrary files. Consumers install via URL: `npx shadcn@latest add http://your-registry.com/r/item.json`. Supports namespaces (`@acme/item`), authentication for private registries, and `registry:base` for full design systems. ([Registry docs](https://ui.shadcn.com/docs/registry), [Getting started](https://ui.shadcn.com/docs/registry/getting-started))
- **Appropriate for full frameworks?** The registry model has expanded beyond components to support hooks, pages, lib files, and config files. The `registry:base` type can distribute entire design systems. However, there is no dependency resolution, no migration system, and no automated update flow. Once code is copied, divergence is the consumer's problem.

### 2. Backstage.io: The App/Plugin/Core Split

- **Three-tier architecture:** Core (base functionality), App (deployed instance customized per org), Plugins (additional features, company-specific or community). ([Architecture overview](https://backstage.io/docs/overview/architecture-overview/))
- **Package scale:** 53 core packages in `packages/` + 154 plugins in `plugins/` in the main repo. Plus a separate `@backstage-community` scope for community plugins. ([GitHub: backstage/backstage](https://github.com/backstage/backstage))
- **Plugin structure:** Up to 5 packages per plugin: 2 frontend, 2 backend, 1 isomorphic. Naming: `@<scope>/plugin-<id>`, `@<scope>/plugin-<id>-backend`, `@<scope>/plugin-<id>-node` (extension points), `@<scope>/plugin-<id>-backend-module-<moduleId>`. ([Plugin structure docs](https://backstage.io/docs/plugins/structure-of-a-plugin/))
- **Plugin isolation:** "If plugins want to communicate with each other, they must do so over the wire. There can be no direct communication between plugins through code." ([Architecture overview](https://backstage.io/docs/overview/architecture-overview/))
- **New backend system:** Dependency injection via `createBackend()` as DI container. Services (logging, DB, scheduling) are injected. Plugins register via `createBackendPlugin()`. Modules extend plugins via `createBackendModule()` with declared dependencies on services and extension points. Reduced typical backend from hundreds of LOC to ~24 lines. ([Backend system docs](https://backstage.io/docs/backend-system/architecture/index/), [Services docs](https://backstage.io/docs/backend-system/architecture/services/))
- **Scaffolding:** `npx @backstage/create-app@latest` creates a monorepo with `packages/app/` (frontend) and `packages/backend/` plus `app-config.yaml`. ([Getting started](https://backstage.io/docs/getting-started/))
- **Update story:** `yarn backstage-cli versions:bump` updates all `@backstage/*` packages to latest compatible versions. The Upgrade Helper (web tool) shows a diff between any two Backstage releases. But structural changes (template updates) require manual application from the `@backstage/create-app` CHANGELOG. Backstage "functions as a library ecosystem rather than a monolithic application." ([Keeping updated docs](https://backstage.io/docs/getting-started/keeping-backstage-updated/), [Upgrade Helper](https://backstage.github.io/upgrade-helper/))

### 3. T3 Stack / create-t3-app: The Scaffold-and-Sever Model

- **Philosophy:** "Create T3 App is a scaffolding tool, not a framework. This means that once you initialize an app, it's yours." ([T3 FAQ](https://create.t3.gg/en/faq))
- **No upstream relationship:** After scaffolding, there is zero connection to upstream. No CLI to pull updates. No version tracking. "It is not really necessary to implement every change we make to the template in your app." ([T3 FAQ](https://create.t3.gg/en/faq))
- **What's configurable at init:** TypeScript/JS, optional packages (tRPC, NextAuth, Tailwind, Prisma/Drizzle), database provider. All decisions are one-time at scaffold. ([Installation docs](https://create.t3.gg/en/installation))
- **No post-scaffold tooling:** Users can watch GitHub releases for changes, but applying them is entirely manual and optional.

### 4. Payload CMS: Framework-Inside-Next.js

- **Architecture:** Payload 3.0 installs *directly into* your Next.js `/app` folder. The admin panel runs on the App Router with React Server Components. Core is decoupled from rendering/HTTP layers. ([Payload blog](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app))
- **Multi-package monorepo:** 44 packages including `payload` (core), `next` (Next.js adapter), `ui` (admin panel components), `sdk`, `graphql`, `richtext-lexical`, `richtext-slate`, 8 database adapters (`db-postgres`, `db-mongodb`, etc.), 6 storage providers, 10+ `plugin-*` packages, `translations`, `create-payload-app`. ([GitHub: payloadcms/payload](https://github.com/payloadcms/payload))
- **Config-as-code:** Everything is configured through `payload.config.ts` using `buildConfig()`. Collections, globals, hooks, plugins, admin panel settings — all typed TypeScript. ([Config docs](https://payloadcms.com/docs/configuration/overview))
- **Plugin pattern (exact signature):**
  ```ts
  export const samplePlugin =
    (pluginOptions: PluginTypes) =>
    (incomingConfig: Config): Config => {
      let config = { ...incomingConfig }
      config.collections = [...(config.collections || []), newCollection]
      // ... modify config ...
      return config
    }
  ```
  Plugins are curried functions: options -> config -> modified config. They spread existing config properties and add/modify. Plugins execute after validation but before sanitization. ([Build your own plugin](https://payloadcms.com/docs/plugins/build-your-own), [GitHub source](https://github.com/payloadcms/payload/blob/main/docs/plugins/build-your-own.mdx))
- **Route structure:** Payload creates `(payload)/` route group with `/admin/` (panel), `/api/` (REST), `/graphql/` routes. Consumer's existing app moves into its own route group `(my-app)/`. ([Installation docs](https://payloadcms.com/docs/getting-started/installation))
- **Update story:** Standard npm semver. `payload` is a regular dependency. Updates come through `npm update` / `pnpm update`. Breaking changes handled through major versions + migration guides.

### 5. Turborepo / Nx Generators and Migrations

#### Turborepo Generators
- **Workspace generators:** `turbo gen workspace` scaffolds new packages from existing workspace templates or remote GitHub repos. ([Turborepo docs](https://turborepo.dev/docs/guides/generating-code))
- **Custom generators:** Built on Plop.js. Config at `turbo/generators/config.ts`. Auto-discovered per workspace. TypeScript support without config. ([Turborepo docs](https://turborepo.dev/docs/guides/generating-code))
- **No framework update distribution:** Turborepo generators are for scaffolding *within* a monorepo, not for distributing updates to external consumers. ([Turborepo docs](https://turborepo.dev/docs/guides/generating-code))

#### Nx Generators and Migrations
- **Presets:** A preset is a special generator shipped as an npm package. After publishing, consumers run `npx create-nx-workspace my-app --preset=my-plugin-name` to scaffold a workspace. Presets are for initial scaffolding only. ([Nx preset docs](https://nx.dev/docs/extending-nx/create-preset))
- **Migration generators (the killer feature):** Plugin authors can ship *automated code transformations* keyed to version numbers. When consumers run `nx migrate`, the system reads `migrations.json` from each plugin and runs generators that modify project config, rename files, update imports, etc. This is the only framework examined that provides a *programmatic* mechanism for shipping breaking changes to consumers. ([Migration generators docs](https://nx.dev/docs/extending-nx/migration-generators), [Automate updating deps](https://nx.dev/docs/features/automate-updating-dependencies))
- **migrations.json pattern:** Each version bump can declare migration generators and/or `packageJsonUpdates` for simple dependency version bumps. Generators use Nx DevKit to read/write the file tree. ([Migration generators docs](https://nx.dev/docs/extending-nx/migration-generators))
- **Consumer experience:** `nx migrate @sherpa/studio@latest` would: (1) update package.json, (2) generate `migrations.json` listing pending transforms, (3) consumer runs `nx migrate --run-migrations` to apply. Changes are unstaged for review. ([Advanced update process](https://nx.dev/docs/guides/tips-n-tricks/advanced-update))

### 6. Single Package vs Multi-Package

#### Refine.dev as exemplar of multi-package
- **38 packages** under `@refinedev/*`: `core` (headless logic), then separate UI packages (`antd`, `mui`, `mantine`, `chakra-ui`), separate data providers (`rest`, `graphql`, `supabase`, etc.), separate router packages (`nextjs-router`, `react-router`, `remix-router`). ([GitHub: refinedev/refine](https://github.com/refinedev/refine))
- **Provider pattern:** Core defines interfaces; adapters implement them. `@refinedev/core` has zero UI dependencies. Each UI package wraps core hooks with framework-specific components. ([npm: @refinedev/core](https://www.npmjs.com/package/@refinedev/core))

#### When to split

| Signal | Single package | Multi-package |
|--------|---------------|---------------|
| Consumers want subsets | No | Yes |
| UI framework varies | No | Yes (separate UI packages) |
| Backend varies (DB, MCP) | No | Yes (adapter packages) |
| Update cadence differs | No | Yes |
| Tree-shaking sufficient | Yes | Not needed |
| Startup simplicity | Yes | More `npm install` commands |

**Key tradeoff:** Multi-package gives consumers opt-in granularity but increases maintenance burden and version coordination. Unified versioning (all packages bump together) simplifies this but wastes version numbers. Independent versioning gives cleaner changelogs but requires explicit compatibility matrices.

#### Package split patterns observed

| Framework | Core packages | Total packages | Split strategy |
|-----------|--------------|----------------|----------------|
| Backstage | 53 core + 154 plugins | 207+ | By concern (backend-plugin-api, cli, config, etc.) |
| Payload CMS | ~15 core | 44 | By integration (db-*, storage-*, plugin-*, richtext-*) |
| Refine | ~5 core | 38 | By UI framework + data provider + router |
| shadcn/ui | 0 (registry model) | 0 | Code distribution, not packages |

---

## Comparative Model Summary

| Dimension | shadcn Registry | Backstage | T3/create-app | Payload CMS | Nx Migrations |
|-----------|----------------|-----------|---------------|-------------|---------------|
| **Distribution** | JSON registry -> copy files | npm packages | CLI scaffold | npm packages | npm packages + migrations |
| **Ownership** | Consumer owns code | Framework owns code | Consumer owns code | Framework owns code | Framework owns code |
| **Update mechanism** | Manual diff + overwrite | `versions:bump` CLI + Upgrade Helper | None | npm update + migration guides | `nx migrate` with automated codemods |
| **Breaking changes** | Consumer's problem | CHANGELOG + Upgrade Helper | Consumer's problem | Major version + manual migration | Automated migration generators |
| **Plugin/extension** | Custom registry items | createBackendPlugin + createBackendModule | N/A | Config transform function | Nx plugin generators |
| **Convention distribution** | Registry items (any file type) | Template + docs | Template only | Config-as-code | Generators + migrations |
| **Complexity** | Low | Very high | Very low | Medium | High |

---

## Implications for Sherpa Framework Extraction

### The hybrid model is the right answer

No single model fits Sherpa's needs. The framework needs:

1. **npm packages for code** (Payload model): `@sherpa/studio-core` (lib layer, ~5,600 LOC), `@sherpa/studio-ui` (components, ~98 files), `@sherpa/studio-mcp` (task MCP server). These are living dependencies — consumers import and extend, not copy.

2. **Registry or scaffold for conventions** (shadcn model): `.claude/rules/`, `.claude/skills/`, `docs/agents/roles/`, `docs/tasks/README.md`, initiative directory structure. These are copied into the consumer project and then owned. A `sherpa init` CLI could scaffold these, similar to `shadcn init`.

3. **Config-as-code for extension** (Payload model): A `sherpa.config.ts` that defines project name, theme tokens, vocabulary overrides (e.g., "initiatives" vs "projects"), domain-specific components to inject, and convention file paths.

4. **Migration system for updates** (Nx model): When `@sherpa/studio-core` ships a breaking change, it should include a migration generator that consumers can run. This is the hardest to build but the most valuable long-term.

### Recommended package split

Based on the patterns observed:

```
@sherpa/studio-core     # Governance, lifecycle, task board, velocity, schemas
@sherpa/studio-ui       # React components (depends on core)
@sherpa/studio-mcp      # Task MCP server (depends on core)
@sherpa/create-sherpa    # CLI scaffold tool
```

**Why not single package:** The MCP server is consumed by Claude Code, not by the Next.js app. Bundling it with UI components makes no sense. The core lib is usable without the UI (API-only consumers, CLI tools).

**Why not more packages:** 4 is enough. Don't split `studio-core` further (it's 5,600 LOC, not 50,000). Don't split UI by page/feature (unlike Backstage's 154 plugins, Studio has a cohesive surface).

### Convention distribution recommendation

**Scaffold + sync hybrid:**
- `sherpa init` copies convention files (rules, skills, roles, task schema, CLAUDE.md templates) into the consumer project
- Convention files include a `# managed by @sherpa/studio` header comment
- A `sherpa update-conventions` command diffs upstream conventions against local versions, similar to `shadcn diff`
- Consumer can modify conventions (they own them), but the diff tool highlights upstream changes

### The Payload plugin pattern is the right extension model

```ts
// sherpa.config.ts
export default defineConfig({
  project: { name: 'WavePoint', slug: 'wavepoint' },
  theme: { /* CSS variable overrides */ },
  extensions: [
    wavePointStudioPlugin({
      transitDashboard: true,
      cosmicContext: true,
    }),
  ],
})
```

The curried function pattern `(options) => (config) => modifiedConfig` is proven, composable, and typed. It lets WavePoint inject its 3 domain-specific components without forking the framework.

---

## Open Questions

1. **Where does `@sherpa/studio` live?** In the Sherpa monorepo (making WavePoint a consumer via npm)? In its own repo (making both Sherpa and WavePoint consumers)? Or in a shared monorepo?

2. **How do convention file updates interact with Claude Code's auto-loading?** If `sherpa update-conventions` modifies `.claude/rules/`, does Claude Code pick up changes mid-session or only on restart?

3. **Should the UI package export components or a registry?** Exporting as npm package means consumers import `<TaskBoard />`. Exporting as a shadcn-style registry means consumers copy the source and own it. The npm model is cleaner for updates; the registry model is more flexible for customization.

4. **How does the migration system work without Nx?** Nx migrations require the Nx workspace infrastructure. WavePoint uses Turborepo + pnpm. Building a standalone migration runner (even a simple one) is non-trivial.

5. **What's the minimum viable extraction?** The Backstage model took years to stabilize. Payload spent a major version (2.0 -> 3.0) on the replatform. Is there a "Payload 1.0" equivalent — extract core + config, defer plugin system and migrations?

6. **Timing: extract now or continue dogfooding?** The proposal notes Studio is still maturing (morning review, /plan-tasks not fully built). Premature extraction risks locking wrong boundaries. But the behavioral-agents initiative needs a Sherpa codebase *soon*. Tension between shipping speed and architectural correctness.

---

## Sources

### Primary Documentation
- [shadcn/ui CLI docs](https://ui.shadcn.com/docs/cli) — Init command, add, diff, overwrite flags
- [shadcn/ui Registry introduction](https://ui.shadcn.com/docs/registry) — Custom registry system overview
- [shadcn/ui Registry getting started](https://ui.shadcn.com/docs/registry/getting-started) — registry.json schema, item definitions, build/deploy
- [shadcn/cli v4 changelog (March 2026)](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — registry:base, skills, presets
- [shadcn/ui component update discussion](https://github.com/shadcn-ui/ui/discussions/790) — Community discussion on update mechanisms
- [Backstage architecture overview](https://backstage.io/docs/overview/architecture-overview/) — Core/App/Plugin split, plugin isolation
- [Backstage plugin structure](https://backstage.io/docs/plugins/structure-of-a-plugin/) — 5-package plugin pattern
- [Backstage backend system architecture](https://backstage.io/docs/backend-system/architecture/index/) — New DI-based backend
- [Backstage backend services](https://backstage.io/docs/backend-system/architecture/services/) — Service injection pattern
- [Backstage getting started](https://backstage.io/docs/getting-started/) — create-app scaffolding
- [Backstage keeping updated](https://backstage.io/docs/getting-started/keeping-backstage-updated/) — versions:bump, Upgrade Helper
- [Backstage Upgrade Helper](https://backstage.github.io/upgrade-helper/) — Visual diff between releases
- [Backstage backend modules](https://backstage.io/docs/backend-system/architecture/modules/) — createBackendModule pattern
- [Backstage extension points](https://backstage.io/docs/backend-system/architecture/extension-points/) — Plugin extensibility
- [T3 Stack FAQ](https://create.t3.gg/en/faq) — "Scaffolding tool, not a framework" philosophy
- [T3 Stack installation](https://create.t3.gg/en/installation) — CLI options, CI flags
- [create-t3-app GitHub](https://github.com/t3-oss/create-t3-app) — Repository and releases
- [Payload 3.0 announcement](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app) — Next.js native CMS
- [Payload config overview](https://payloadcms.com/docs/configuration/overview) — payload.config.ts, buildConfig
- [Payload plugins overview](https://payloadcms.com/docs/plugins/overview) — Plugin system
- [Payload build your own plugin](https://payloadcms.com/docs/plugins/build-your-own) — Plugin function signature, template
- [Payload build-your-own-plugin source (GitHub)](https://github.com/payloadcms/payload/blob/main/docs/plugins/build-your-own.mdx) — Exact code examples
- [Payload plugin template (GitHub)](https://github.com/payloadcms/payload/tree/main/templates/plugin) — Official template
- [Payload installation docs](https://payloadcms.com/docs/getting-started/installation) — Route group structure
- [Turborepo code generation guide](https://turborepo.dev/docs/guides/generating-code) — Workspace generators, Plop integration
- [Turborepo generate reference](https://turborepo.dev/docs/reference/generate) — CLI flags, workspace copy
- [Nx migration generators](https://nx.dev/docs/extending-nx/migration-generators) — Plugin author migration pattern
- [Nx automate updating dependencies](https://nx.dev/docs/features/automate-updating-dependencies) — Consumer update experience
- [Nx create a custom preset](https://nx.dev/docs/extending-nx/create-preset) — Distributable workspace scaffolds
- [Nx advanced update process](https://nx.dev/docs/guides/tips-n-tricks/advanced-update) — nx migrate deep dive

### Multi-Package Architecture
- [Refine GitHub repo](https://github.com/refinedev/refine) — 38-package headless framework
- [@refinedev/core on npm](https://www.npmjs.com/package/@refinedev/core) — Core package, provider pattern
- [Turborepo internal packages](https://turborepo.dev/docs/core-concepts/internal-packages) — Monorepo package patterns
- [Complete monorepo guide (pnpm + Changesets)](https://jsdev.space/complete-monorepo-guide/) — Versioning strategies
- [Monorepo tools 2026 comparison](https://viadreams.cc/en/blog/monorepo-tools-2026/) — Turborepo vs Nx vs pnpm

### Supplementary
- [Vercel Academy: shadcn updating components](https://vercel.com/academy/shadcn-ui/updating-and-maintaining-components) — Official Vercel guidance
- [Vercel Academy: Turborepo generators](https://vercel.com/academy/production-monorepos/turborepo-generators) — Production patterns
- [Backstage backend system alpha announcement](https://backstage.io/blog/2023/02/15/backend-system-alpha/) — Design rationale
- [Backstage community plugins](https://backstage.io/blog/2024/04/19/community-plugins/) — @backstage-community scope
- [shadcn/ui registry template (GitHub)](https://github.com/shadcn-ui/registry-template) — Starter for custom registries
- [Nx tackling breaking changes article](https://dev.to/valorsoftware/tackling-breaking-changes-using-nx-workspace-generators-4mnk) — Practical migration examples
- [Nx evergreen tooling blog](https://nx.dev/blog/evergreen-tooling-more-than-just-codemods) — Philosophy behind migrations

---

## Raw Links

```
https://ui.shadcn.com/docs/cli
https://ui.shadcn.com/docs/registry
https://ui.shadcn.com/docs/registry/getting-started
https://ui.shadcn.com/docs/registry/authentication
https://ui.shadcn.com/docs/registry/registry-index
https://ui.shadcn.com/docs/changelog
https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
https://ui.shadcn.com/docs/directory
https://ui.shadcn.com/docs/components-json
https://ui.shadcn.com/create
https://github.com/shadcn-ui/ui/discussions/790
https://github.com/shadcn-ui/ui/discussions/7170
https://github.com/shadcn-ui/registry-template
https://backstage.io/docs/overview/architecture-overview/
https://backstage.io/docs/plugins/structure-of-a-plugin/
https://backstage.io/docs/backend-system/architecture/index/
https://backstage.io/docs/backend-system/architecture/services/
https://backstage.io/docs/backend-system/architecture/plugins/
https://backstage.io/docs/backend-system/architecture/modules/
https://backstage.io/docs/backend-system/architecture/extension-points/
https://backstage.io/docs/backend-system/
https://backstage.io/docs/backend-system/building-backends/index/
https://backstage.io/docs/backend-system/building-plugins-and-modules/index/
https://backstage.io/docs/frontend-system/architecture/index/
https://backstage.io/docs/frontend-system/building-apps/index/
https://backstage.io/docs/plugins/new-backend-system/
https://backstage.io/docs/getting-started/
https://backstage.io/docs/getting-started/create-an-app/
https://backstage.io/docs/getting-started/keeping-backstage-updated/
https://backstage.io/docs/tooling/cli/commands/
https://backstage.github.io/upgrade-helper/
https://backstage.io/blog/2023/02/15/backend-system-alpha/
https://backstage.io/blog/2024/04/19/community-plugins/
https://backstage.spotify.com/docs/plugins/getting-started
https://backstage.spotify.com/discover/blog/avoid-upgrade-surprises-with-backstage-upgrade-helper/
https://github.com/backstage/backstage
https://github.com/backstage/backstage/blob/master/packages/create-app/CHANGELOG.md
https://create.t3.gg/
https://create.t3.gg/en/installation
https://create.t3.gg/en/faq
https://github.com/t3-oss/create-t3-app
https://www.npmjs.com/package/create-t3-app
https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app
https://payloadcms.com/docs/configuration/overview
https://payloadcms.com/docs/plugins/overview
https://payloadcms.com/docs/plugins/build-your-own
https://payloadcms.com/docs/getting-started/installation
https://payloadcms.com/developers
https://payloadcms.com/posts/blog/tutorial-building-your-own-payload-plugin
https://payloadcms.com/posts/blog/announcing-plugins
https://payloadcms.com/docs/plugins/mcp
https://github.com/payloadcms/payload
https://github.com/payloadcms/payload/blob/main/docs/plugins/build-your-own.mdx
https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts
https://github.com/payloadcms/payload/tree/main/templates/plugin
https://turborepo.dev/docs/guides/generating-code
https://turborepo.dev/docs/reference/generate
https://turbo.build/repo/docs/core-concepts/monorepos/code-generation
https://vercel.com/academy/production-monorepos/turborepo-generators
https://vercel.com/academy/shadcn-ui/updating-and-maintaining-components
https://github.com/vercel/turborepo/issues/1185
https://github.com/vercel/turborepo/discussions/243
https://nx.dev/docs/extending-nx/migration-generators
https://nx.dev/docs/extending-nx/create-preset
https://nx.dev/docs/extending-nx/local-generators
https://nx.dev/docs/features/automate-updating-dependencies
https://nx.dev/docs/guides/tips-n-tricks/advanced-update
https://nx.dev/docs/reference/nx/migrations
https://nx.dev/docs/reference/workspace/generators
https://nx.dev/docs/reference/plugin/generators
https://nx.dev/blog/evergreen-tooling-more-than-just-codemods
https://github.com/nrwl/nx/blob/master/docs/shared/recipes/plugins/migration-generators.md
https://github.com/nrwl/nx/discussions/15139
https://dev.to/valorsoftware/tackling-breaking-changes-using-nx-workspace-generators-4mnk
https://github.com/refinedev/refine
https://www.npmjs.com/package/@refinedev/core
https://www.npmjs.com/package/@refinedev/antd
https://jsdev.space/complete-monorepo-guide/
https://viadreams.cc/en/blog/monorepo-tools-2026/
https://turborepo.dev/docs/core-concepts/internal-packages
https://designrevision.com/blog/shadcn-ui-guide
https://registry.directory/
https://www.freecodecamp.org/news/how-to-set-up-a-registry-in-shadcn/
https://spin.atomicobject.com/embed-payload-cms-next-js-app/
https://reflect.run/articles/introduction-to-t3-stack-and-create-t3-app/
https://deepwiki.com/t3-oss/create-t3-app/1.1-t3-stack
```
