# Iteration 1 — 2026-03-11

## Research Vectors

### Vector 1: Framework Extraction Patterns
**Question:** How do successful projects structure their "extract into framework" models?
**Full report:** [iteration-1/vector-1-framework-extraction-patterns.md](iteration-1/vector-1-framework-extraction-patterns.md)

**Key discoveries:**
- Six models examined: shadcn/ui (copy-own), Backstage (207 npm packages), T3 (scaffold-sever), Payload CMS (framework-inside-app), Nx (automated migrations), Refine (headless-core + adapter packages)
- shadcn/ui's new `registry:base` (2025-2026) distributes entire design systems including hooks, pages, config, and lib files — not just components
- Payload CMS is the closest analog: config-as-code via `payload.config.ts`, curried plugin pattern `(options) => (config) => modifiedConfig`, 44 packages
- Backstage's 207-package monorepo demonstrates the extreme end — powerful but massive overhead for a solo operator

**Implications:**
- Sherpa should follow the Payload model (framework-inside-your-app) for code, shadcn model (copy + own) for conventions, and a config-as-code entrypoint for customization

### Vector 2: Convention Portability
**Question:** How do you package AI-native conventions (rules, skills, roles) across projects?
**Full report:** [iteration-1/vector-2-convention-portability.md](iteration-1/vector-2-convention-portability.md)

**Key discoveries:**
- Claude Code has a full plugin system (plugins + marketplaces + semver + auto-updates) — the right mechanism for distributing executable conventions (skills, hooks, MCP servers)
- Agent Skills (SKILL.md) is an open standard under the Agentic AI Foundation (Linux Foundation) — adopted by Claude Code, Codex, VS Code Copilot, Cursor, Gemini CLI, 60K+ repos
- `.claude/rules/` files are NOT distributable via plugins — they're project-level only, shared via symlinks or git commit
- Convention versioning is the unsolved problem — no tool handles "upstream update + local customization" for Markdown files
- AGENTS.md is the cross-tool standard for convention files (broader than CLAUDE.md)

**Implications:**
- Three-layer distribution: plugins for skills/hooks, scaffold CLI for rules/templates, AGENTS.md generation for cross-tool compatibility
- The "immutable core + extension" pattern (base files read-only, `*.local.md` for overrides) is the most practical convention versioning approach

### Vector 3: White-Label UI Frameworks
**Question:** How do white-label UI frameworks handle theming, vocabulary, and branding?
**Full report:** [iteration-1/vector-3-white-label-ui.md](iteration-1/vector-3-white-label-ui.md)

**Key discoveries:**
- Payload CMS's white-label: ~10 lines for branding (logo, icon, favicon, meta), CSS variables by elevation, injection zones for composition
- Strapi proves that i18n translation files work for vocabulary customization within a single language — override translation keys to rename entities
- shadcn/ui `registry:base` distributes CSS variable themes as installable packages — Sherpa could distribute a default theme this way
- Minimum viable white-label: logo + primary color + custom domain + favicon makes it "feel mine." For governance tools, vocabulary matters disproportionately — "initiative" vs "project" vs "epic" signals process understanding

**Implications:**
- Three layers: CSS variables (visual), config object (branding assets), next-intl namespace (vocabulary)
- WavePoint's "Modern Mystic" becomes one consumer theme; Sherpa ships a neutral default

### Vector 4: Cross-Project Synchronization
**Question:** How do framework consumers receive updates without merge conflicts?
**Full report:** [iteration-1/vector-4-cross-project-sync.md](iteration-1/vector-4-cross-project-sync.md)

**Key discoveries:**
- Three distinct distribution channels needed: npm packages (code), Copier or custom CLI (conventions), scaffold-once + upgrade helper (project structure)
- Copier's three-way merge (old template vs user mods vs new template) is the strongest existing convention sync tool, but it's Python-based in a JS/TS ecosystem
- Git subtree is a poor fit — invisible state, manual pull requirements, merge pain
- **Key tactical insight**: Keep `@sherpa/studio` packages in the source monorepo during extraction. Use Turborepo internal packages for dev speed. Sherpa consumes from npm. Forces true independence without premature repo splitting

**Implications:**
- Hybrid model: npm + semver for code, custom `sherpa sync` CLI for conventions, upgrade helper diffs for project structure
- Monorepo-first during extraction, publish to npm for external consumption

### Vector 5: MCP Server Distribution
**Question:** How are MCP servers packaged and distributed?
**Full report:** [iteration-1/vector-5-mcp-server-distribution.md](iteration-1/vector-5-mcp-server-distribution.md)

**Key discoveries:**
- npm via `npx` is the dominant pattern (~60% of servers). Anthropic's reference servers all follow the same template: bin entry, shebang, `files: ["dist"]`
- Project root discovery is a known pain point — `process.cwd()` returns npm cache for npx-launched servers. Best pattern: env var → git root → cwd fallback
- MCP Registry (registry.modelcontextprotocol.io) exists in preview — metadata-only, namespace via reverse DNS
- Task Master AI is the closest comparable — 36 tools, tiered loading (7/15/36), file-based storage, npm distribution
- Claude Code's automatic tool search defers tool schemas when >10% of context, reducing context by ~85%

**Implications:**
- `@sherpa/task-mcp-server` distributed via npm/npx, matching Anthropic conventions
- Decouple from bun (use `#!/usr/bin/env node`), separate LM Studio dispatch into optional extension
- Register on MCP Registry for discoverability

## Synthesis

The five vectors converge on a **three-channel distribution architecture** that no single existing framework implements but that combines proven patterns from each:

### The Three Channels

| Channel | What | Mechanism | Update Story |
|---------|------|-----------|-------------|
| **Code packages** | UI components, lib modules, MCP server | npm packages (`@sherpa/studio-*`) | Standard semver, Changesets |
| **Executable conventions** | Skills, hooks, MCP server configs | Claude Code plugin marketplace | Plugin auto-updates via semver |
| **Prose conventions** | Rules, CLAUDE.md templates, roles, task schemas | Scaffold CLI (`sherpa init`) + sync CLI (`sherpa sync`) | Three-way merge or diff-and-prompt |

### The Central Insight: Conventions Are Harder Than Code

Every vector surfaced the same gap: **there is no established mechanism for distributing and updating Markdown convention files.** npm handles code. Plugin systems handle executable tools. But `.claude/rules/behavioral-engineering.md` is neither — it's a prose document that shapes agent behavior, needs to evolve with the framework, but also needs local customization.

The closest existing solution is Copier's three-way merge, but it's Python tooling. The practical path for Sherpa is a custom `sherpa sync` CLI that:
1. Tracks which convention files came from the framework (via a manifest)
2. Compares local versions to upstream
3. Presents diffs for human review (like Backstage's upgrade helper)
4. Supports `*.local.md` overrides that survive sync

### The Payload Pattern Is the Architecture

Payload CMS is the closest structural analog:
- Framework installs *into* your Next.js app (not a standalone admin panel)
- Config-as-code entrypoint (`payload.config.ts` → `sherpa.config.ts`)
- Curried plugin pattern for extensions
- CSS variables for theming
- White-label as a first-class feature

### Package Architecture Recommendation

```
@sherpa/studio-core     — lib modules (governance, tasks, lifecycle, velocity)
@sherpa/studio-ui       — React components (shadcn-based, CSS variable themed)
@sherpa/studio-mcp      — task MCP server (standalone, npm/npx)
@sherpa/studio-cli      — scaffold + sync CLI (sherpa init, sherpa sync)
@sherpa/studio          — meta-package re-exporting core + ui
```

During extraction, all packages live in the source monorepo as Turborepo internal packages. Sherpa (`../sherpa`) consumes from npm from day one, forcing real package boundaries.

### Vocabulary Customization via i18n

Strapi proved that i18n translation files work for entity renaming within a single language. Sherpa should use next-intl with a namespace override:
```ts
// sherpa.config.ts
export default defineConfig({
  vocabulary: {
    initiative: "project",
    proposal: "RFC",
    workstream: "team",
    task: "ticket"
  }
})
```

### Agent Skills as Open Standard

The Agent Skills format (SKILL.md) is already adopted by 6+ tools and 60K+ repos under the Agentic AI Foundation. Sherpa skills should follow this standard from day one — it's the only cross-tool convention format with real adoption.

## All Sources

### Framework Architecture
- [shadcn/ui registry:base](https://ui.shadcn.com/docs/registry) — Custom registry distribution
- [Backstage architecture](https://backstage.io/docs/overview/architecture-overview/) — Core/App/Plugin split
- [Payload CMS config](https://payloadcms.com/docs/getting-started/what-is-payload) — Config-as-code pattern
- [Refine architecture](https://refine.dev/docs/) — Headless core + adapters
- [Nx migrations](https://nx.dev/concepts/more-concepts/nx-migrations) — Automated code transforms

### Convention Distribution
- [Claude Code plugins](https://code.claude.com/docs/en/plugins) — Plugin marketplace system
- [Agent Skills standard](https://github.com/agentic-ai-foundation/agent-skills-spec) — SKILL.md open standard
- [Copier docs](https://copier.readthedocs.io/) — Template three-way merge
- [AGENTS.md cross-tool format](https://docs.google.com/document/d/1PjKI4sCCu-8f6hKQ_8i5kbj-pNiY0txJF-) — Cross-tool convention

### White-Label
- [Payload admin customization](https://payloadcms.com/docs/admin/overview) — White-label admin panel
- [Strapi admin customization](https://docs.strapi.io/dev-docs/admin-panel-customization) — i18n vocabulary override
- [Backstage theming](https://backstage.io/docs/getting-started/app-custom-theme/) — CSS variable + MUI theming

### MCP Distribution
- [MCP build guide](https://modelcontextprotocol.io/docs/develop/build-server) — Official packaging
- [MCP Registry](https://modelcontextprotocol.io/registry/quickstart) — Publishing to registry
- [Claude Code MCP config](https://code.claude.com/docs/en/mcp) — Configuration reference
- [Task Master AI](https://github.com/eyaltoledano/claude-task-master) — Comparable product

### Cross-Project Sync
- [Expo upgrade helper](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) — SDK upgrade model
- [Next.js codemods](https://nextjs.org/docs/app/guides/upgrading) — Automated migration
- [Backstage upgrade helper](https://backstage.github.io/upgrade-helper/) — Structural diff tool
- [Turborepo internal packages](https://turbo.build/repo/docs/crafting-your-repository/structuring-a-repository) — Monorepo package strategy

## Proposals Generated

The proposal at `docs/initiatives/sherpa-framework-extraction/proposal.md` should be updated with:
1. The three-channel distribution architecture (code → npm, executable conventions → plugins, prose conventions → CLI)
2. The specific package split (`@sherpa/studio-core`, `-ui`, `-mcp`, `-cli`)
3. The Payload CMS architectural model as the primary reference
4. The convention sync CLI as a Phase 2 deliverable
5. The monorepo-first extraction strategy (keep packages in WavePoint during development)

## Open Questions for Next Iteration

1. **Convention sync CLI design** — What's the minimum viable `sherpa sync` command? What file format tracks which conventions came from the framework? How does it handle merge conflicts in Markdown files?

2. **Plugin marketplace for Sherpa** — Claude Code's plugin system distributes skills and hooks. Can Sherpa's behavioral agent catalog be distributed as a plugin? What's the plugin manifest format and how does auto-update work?

3. **Config-as-code entrypoint** — What does `sherpa.config.ts` look like? What's configurable (vocabulary, theme, agent catalog path, task directory, MCP server options)? How does it compose with Next.js config?

4. **Extraction sequencing** — Which modules extract first? The lib layer (pure functions) is the natural starting point, but the UI layer is more visible. What's the dependency order for clean extraction?

5. **Turborepo internal packages → npm publishing** — What's the workflow for developing as internal packages in the source monorepo, then publishing to npm for Sherpa to consume? How do you test the published package experience before actually publishing?
