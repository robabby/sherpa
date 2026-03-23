---
status: integrated
initiative: studio-docs-site
created: 2026-03-23
updated: '2026-03-23'
type: new-plan
risk: additive
targets:
  - apps/website/content/docs/                        # (new directory)
  - apps/website/src/app/(docs)/docs/[[...slug]]/page.tsx  # (new file)
  - apps/website/src/app/(docs)/docs/layout.tsx           # (new file)
  - apps/website/source.config.ts                         # (new file)
  - apps/website/src/lib/source.ts                        # (new file)
  - apps/website/src/app/api/search/route.ts              # (new file)
  - apps/website/next.config.ts
  - apps/website/tsconfig.json
  - apps/website/src/app/layout.tsx
  - apps/website/package.json
  - apps/website/src/config/navigation.ts
  - apps/website/src/components/site-header.tsx
  - apps/website/src/app/(marketing)/framework/docs/page.tsx
  - apps/website/src/app/sitemap.ts
dependencies: []
informs:
  - design-system
  - sherpa-website
personas:
  - engineer
  - product-manager
spawned-from: null
---

# Sherpa Studio Documentation Site

## Summary

Build a formal product documentation site at `sherpa.solar/docs` — the kind of reference developers expect from a real framework. Getting started guides, concept explanations, API reference, configuration docs, CLI reference. Uses Fumadocs within the existing website app for structured MDX navigation, full-text search, and code highlighting. Draws heavily on the 476+ markdown files and 8 architecture documents that already exist in `docs/` — the content is largely written, it just needs a public surface.

## State Snapshot

**No documentation site exists.** The website (`apps/website/`) has a placeholder page at `/framework/docs` (`apps/website/src/app/(marketing)/framework/docs/page.tsx:13-98`) that says "The docs are being written" and lists what exists internally (9 convention files, 21 skills, 30 role definitions, 65 initiatives, sherpa.config.ts). This page has no actual documentation content.

**Extensive internal documentation already exists.** The `docs/` directory contains:
- 8 architecture documents under `docs/architecture/*/index.md` covering all seven pillars (behavioral agent system, governance engine, execution pipeline, studio application, executable conventions, config-as-code, convention sync)
- 16 Architecture Decision Records in `docs/decisions/`
- 12 UX/product documents in `docs/ux/` (positioning, voice-and-tone, design principles, personas, content guidelines, etc.)
- `docs/framework.md` — seven pillars overview
- `docs/foundation-stone.md` — founding principles
- 76 initiative directories with proposals, plans, and research

**Package APIs are defined but undocumented for public consumption:**
- `@sherpa/studio-core` — 36 exported modules with 80+ TypeScript interfaces, Zod schemas, lifecycle logic, dispatch routing, Linear integration, file tree builders, config system
- `@sherpa/studio-ui` — 125 React components with machine-readable catalog at `packages/studio-ui/src/catalog.ts`
- `@sherpa/studio-mcp` — 8 MCP tools (task CRUD, dispatch, knowledge search, LM status)
- `@sherpa/studio` — umbrella package with `defineConfig()`, `withSherpa()`, `createStudio()`

**The website uses Next.js 16.1.1** with App Router, Tailwind v4, shadcn/ui, and Velite for MDX blog posts (`/learn` route). Velite handles the blog content collection; a docs framework would handle the `/docs` route independently.

**The `website-studio-product` initiative** (approved, in-progress) is pivoting sherpa.solar from consulting marketing to product showcase. A docs site is the natural next step once the product framing is established — it's where the "Framework" nav link should ultimately lead.

## Proposed Changes

### 1. Docs Framework: Fumadocs Integration

**Add Fumadocs** (`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`) to `apps/website/`. Fumadocs is the most mature Next.js App Router-native docs framework — structured sidebar navigation, full-text search via Orama (no external service), Shiki code highlighting, breadcrumbs, table of contents, and OpenAPI page support.

Fumadocs coexists with the existing Velite blog pipeline. Velite handles `content/posts/` for `/learn`. Fumadocs handles `content/docs/` for `/docs`. Each has its own content layer, no conflicts.

**New files:**
- `apps/website/source.config.ts` — Fumadocs source configuration (defines docs collection, file patterns, MDX processing)
- `apps/website/src/app/docs/layout.tsx` — docs layout with sidebar navigation, search, header integration
- `apps/website/src/app/docs/[[...slug]]/page.tsx` — catch-all docs route rendering MDX content

**Modified:**
- `apps/website/package.json` — add fumadocs dependencies
- `apps/website/src/app/sitemap.ts` — include docs pages in sitemap generation

### 2. Content Architecture

**Organize docs content** at `apps/website/content/docs/` using Fumadocs' file-based routing:

```
content/docs/
  index.mdx                           # Docs landing / overview
  meta.json                           # Root sidebar config
  getting-started/
    meta.json
    index.mdx                         # Installation & first project
    quick-start.mdx                   # 5-minute hello world
    project-structure.mdx             # What sherpa init creates
  concepts/
    meta.json
    index.mdx                         # The seven pillars overview
    behavioral-agents.mdx             # Agent roles, behavioral constraints
    governance-engine.mdx             # Initiative lifecycle, directoturtle
    execution-pipeline.mdx            # Dispatch, backends, task types
    conventions.mdx                   # Rules, skills, CLAUDE.md
    config-as-code.mdx                # sherpa.config.ts, defineConfig()
  guides/
    meta.json
    defining-agent-roles.mdx          # How to write behavioral role definitions
    creating-conventions.mdx          # .claude/rules/ authoring
    writing-skills.mdx                # Skill protocol and structure
    initiative-workflow.mdx           # Proposal → plan → activity → integration
    multi-project-setup.mdx           # Project registry, .sherpa/ dotfolder
    dispatch-and-backends.mdx         # Task routing, 9 backends, worker execution
  reference/
    meta.json
    configuration.mdx                 # Full sherpa.config.ts reference
    cli.mdx                           # sherpa init, sherpa sync
    studio-core-api.mdx               # @sherpa/studio-core exports
    studio-ui-components.mdx          # Component catalog with descriptions
    mcp-tools.mdx                     # 8 MCP tool specifications
  architecture/
    meta.json
    decisions/
      meta.json                       # Links to key ADRs
    platform-model.mdx                # Three invariants, pluggable runtime
```

**Content sourcing strategy:** The concepts and architecture sections draw directly from existing `docs/architecture/*/index.md` files, adapted from internal reference to user-facing explanation. Guides are new content synthesized from `.claude/rules/`, `.claude/skills/`, and `docs/initiatives/` patterns. Reference pages are generated or curated from package exports and TypeScript types.

### 3. Navigation & Site Integration

**Add "Docs" to the primary navigation** in `apps/website/src/config/navigation.ts`. Position it as the first item — docs are the primary path for developers evaluating the framework.

**Update the site header** (`apps/website/src/components/site-header.tsx`) to include the docs link.

**Replace the placeholder** at `/framework/docs` with a redirect to `/docs`. The current placeholder page (`apps/website/src/app/(marketing)/framework/docs/page.tsx`) becomes unnecessary.

### 4. Design Integration

**Style Fumadocs to match the existing website design system.** Fumadocs supports theming via CSS variables and Tailwind. Map the warm gold/obsidian palette (gold #d4a574, obsidian #08080a, cream #f5f0e8) to Fumadocs' theme variables. Use Fraunces for headings, DM Sans for body, JetBrains Mono for code — consistent with the website typography.

Dark mode support via `next-themes` is already in place; Fumadocs respects the same provider.

### 5. Search

**Full-text search via Orama** (ships with Fumadocs). Indexes all docs content at build time. No external search service, no API keys, no cost. Search appears in the docs sidebar and can optionally surface in the site header for global docs search.

## Rationale

**Why path-based (`sherpa.solar/docs`) over subdomain (`docs.sherpa.solar`):**
- SEO authority consolidates on one domain — critical for a new product site building its first PageRank
- Single deployment, single build pipeline, shared header/footer/design tokens
- Vercel, Linear, Next.js, Tailwind, and shadcn/ui all use path-based docs
- The website is a single Next.js app in a monorepo — adding a route group is simpler than configuring a subdomain with separate builds, DNS records, and deployment
- If docs outgrow the website app, extraction to `apps/docs/` and a subdomain is a straightforward future move. Starting with path-based doesn't close any doors.

**Why Fumadocs over alternatives:**
- *vs. extending Velite:* Velite is a content layer, not a docs framework. It lacks sidebar navigation, search, breadcrumbs, and structured page types. Building these from scratch is weeks of work Fumadocs already solved.
- *vs. Nextra:* Nextra historically targeted Pages Router. Nextra 4 supports App Router but Fumadocs has deeper App Router integration and more active development.
- *vs. Docusaurus:* React-based but not Next.js. Would require a separate app with its own build system, can't share components or styling with the website.
- *vs. Mintlify/GitBook:* SaaS platforms. Content lives externally, styling is constrained, and it creates a dependency on a third-party service. Counter to Sherpa's self-hosted posture.

**Why the content is mostly ready:** The gap isn't "write 476 docs from scratch" — it's "adapt internal governance documentation into user-facing product documentation." The architecture docs, convention rules, and decision records are already written at a depth that most docs sites aspire to. The primary authoring work is getting-started guides and API reference curation.

## Dependencies

**No blocking dependencies.** The website infrastructure is complete. Fumadocs can be added to the existing app regardless of `website-studio-product` progress.

**`website-studio-product` (non-blocking, sequencing preference):** The product pivot establishes the framing and navigation hierarchy that docs will live within. Ideally, the product reorientation lands first so docs content aligns with the product positioning. But docs can start in parallel — the content (concepts, guides, reference) is framing-independent.

**`design-system` (informed by this initiative):** The design system initiative targets a Storybook at `sherpa.solar/storybook`. The docs site will eventually link to Storybook for component documentation. This initiative informs design-system by establishing the docs routing pattern and design token mapping that Storybook can follow.

## Review Notes

**Scope boundaries:**
- **IN:** Fumadocs integration, content architecture, getting-started guide, concepts section (seven pillars), 2-3 guides, configuration reference, navigation update, design theming, search, sitemap integration, self-documenting reference pipeline (Zod schemas, MCP tools, component catalog), Content Registry for internal→external doc mapping
- **OUT:** TypeDoc comprehensive per-export API reference, versioned docs, i18n, blog migration to Fumadocs, automatic voice transformation (LLM-based content adaptation)
- **MAYBE:** CLI reference (depends on `sherpa sync` / `sherpa init` progress), `llms.txt` LLM-optimized docs endpoint, public ADRs

**Compatibility confirmed by research:** Fumadocs v16 *requires* Next.js 16+ and React 19.2+ — our exact stack (Next.js 16.1.1, React 19.2.3, Tailwind v4, ESM). Zero compatibility risk. The `fumadocs-ui/css/shadcn.css` preset automatically adopts our existing shadcn CSS variables, so the warm gold/obsidian palette carries over without manual color mapping. The only risk to test is global CSS style bleed from Fumadocs preset on marketing pages — scope via `(docs)` route group.

**Architecture choice: `fumadocs-ui` layouts for MVP.** shadcn/ui uses Fumadocs purely as a content engine with fully custom layouts. We should start with `fumadocs-ui` layouts (faster, less code) and evolve to custom layouts later if needed. Both paths are proven.

**Self-documenting reference pipeline (from iteration 2 research):** Three auto-generation targets confirmed:
1. **Zod schemas → config/frontmatter reference.** Custom `<SchemaReference>` RSC imports Zod schemas directly, converts to JSON Schema at build time, renders with nested TypeTable components. Zero drift risk — no generation step, no intermediate files. Prep work: add `.describe()` to all schema fields.
2. **MCP tools → tool reference.** Build script uses InMemoryTransport to call `tools/list` on our MCP server in-process, generating MDX files with `<McpTool>` components. 20 tools across 5 domains (Tasks, Knowledge, Infrastructure, Authority, Initiatives).
3. **Component catalog → component reference.** Build script reads `COMPONENT_CATALOG` (125 entries), generates domain-grouped MDX pages (7 pages with deep-link anchors) using `<ComponentReference>` components. Composition graphs via Mermaid.

**Content Registry (from iteration 2 research):** Internal architecture docs and external docs pages are separate surfaces with a traceable link — NOT an auto-transform pipeline. A TypeScript manifest (`_registry.ts`) maps internal paths to external paths with `lastSynced` dates. Build-time staleness detection compares internal `last-updated` (provenance frontmatter) against registry `lastSynced`. No new infrastructure — the provenance system already provides the signal.

**Content adaptation principle:** Internal docs written for AI agents and contributors need different framing for external developers evaluating the framework. Concepts should explain *why* and *what*, not just *how we use it internally*. Voice should follow `docs/ux/voice-and-tone.md` — practitioner register, specific mechanisms, no marketing claims.

**Open questions:**
1. Should the docs include the full ADR history, or just key architectural decisions? (Recommendation: curated subset — ADRs 1, 2, 4, 13, 14, 16 are user-relevant)
2. Should the component catalog from `studio-ui` be part of docs or wait for the Storybook from `design-system`? (Recommendation: include a components overview page in docs; defer interactive stories to Storybook)
3. How much of the initiative/governance system documentation is relevant to end users vs. only to Sherpa's own workflow? (Recommendation: the governance engine is a core pillar — document it as a feature, not an internal process)

**Effort:** 8-10 sessions
**Session breakdown:**
- Session 1: Fumadocs integration — install dependencies, create source config, docs layout, catch-all route, verify build. First content page (docs landing). Design token mapping to match website palette.
- Session 2: Getting started section — installation, quick-start, project structure. Navigation update, header integration, placeholder redirect.
- Session 3: Concepts section — adapt the seven architecture documents into user-facing concept pages. This is the highest-value content. Create Content Registry (`_registry.ts`) mapping internal to external pages.
- Session 4: Guides section — behavioral agent roles, conventions, skills authoring. Synthesized from `.claude/rules/` and existing patterns.
- Session 5: Self-documenting reference infrastructure — `<SchemaReference>` RSC for Zod schemas, `<McpTool>` MDX component, `generate-reference-docs.ts` prebuild script. Add `.describe()` annotations to Zod schema fields.
- Session 6: Reference content — configuration reference (auto-generated from Zod), MCP tool reference (auto-generated from InMemoryTransport), CLI reference.
- Session 7: Component catalog reference — `<ComponentReference>` component, domain-grouped pages (7), composition graph via Mermaid. Storybook link integration.
- Session 8: Search integration, sitemap, SEO metadata, `last-updated` dates on all pages, cross-linking, staleness reporting from Content Registry.
- Sessions 9-10 (if needed): Additional guides (initiative workflow, dispatch, multi-project), `llms.txt` + `.md` rewrite for LLM-optimized docs, polish pass.
