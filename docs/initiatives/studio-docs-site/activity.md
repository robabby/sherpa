---
started: 2026-03-23
worktree: null
---

# studio-docs-site Activity

## 2026-03-23

- Initiative proposed and approved
- Research iteration 1 launched — landscape survey of Fumadocs integration, docs architecture patterns, API reference generation, and reference implementations
- Iteration 1 complete — 4 vectors returned:
  - V1: Fumadocs v16 requires our exact stack (Next.js 16, React 19.2, TW v4). Zero compatibility risk.
  - V2: shadcn/ui uses Fumadocs as content engine only. Start with `fumadocs-ui`, evolve to custom.
  - V3: Cross-site pattern convergence: Getting Started → Concepts (3-5 pages) → Guides (by integration) → Reference. Max 6-8 top-level sections.
  - V4: `fumadocs-typescript` AutoTypeTable for MVP API reference. TypeDoc for scale-up. MCP needs custom component.
- Proposal updated with confirmed compatibility, refined targets, and API reference strategy
- Research iteration 2 launched — self-documenting pipeline for the docs site
- Iteration 2 complete — 4 vectors returned:
  - V1: Zod → docs via custom `<SchemaReference>` RSC. No generation step, zero drift. Prep: add `.describe()` to all fields.
  - V2: MCP tools → docs via InMemoryTransport extraction + `<McpTool>` MDX component. 20 tools, 5 domains.
  - V3: Component catalog → domain-grouped pages (7 pages, not 125). Composition graphs via Mermaid.
  - V4: Internal→external bridge via Content Registry (`_registry.ts`). `/integrate` stays as-is. Staleness signal comes from existing provenance frontmatter.
- Proposal updated: scope expanded to 8-10 sessions with self-documenting reference pipeline (Sessions 5-7)
- Implementation: 6 sessions completed on feat/studio-docs-site branch
  - Session 1: Fumadocs v16 infrastructure (source.config, createMDX, DocsLayout, search API, RootProvider)
  - Session 2: Getting-started content (3 pages) + navigation integration + /framework/docs redirect
  - Session 3: Concepts section (5 pages adapted from architecture docs) + Content Registry
  - Session 4: Guides section (4 how-to guides synthesized from conventions)
  - Session 5: Self-documenting infrastructure (130 .describe() annotations, SchemaReference RSC, McpTool component, prebuild script)
  - Session 6: Reference section (configuration, frontmatter schemas, CLI, MCP tools, components)
- PR #24 merged to main (2026-03-23)
- /integrate run — architecture docs, changelog, ADR 0017 updated
- Status → integrated

## Seeds

1. **`<ComponentReference>` enhanced display** — current component pages render as tables. A richer component with pattern badges, domain badges, client/server indicators, and `composedWith` links would improve the reference experience. Scoped out as polish (Session 7 in plan). → Low effort, high visual impact.

2. **Mermaid composition graph** — generate a visual graph of `composedWith` relationships across all 104 components. The prebuild script already has the data. Scoped out because Mermaid rendering in Fumadocs needs either `rehype-mermaid` or static SVG generation via `@mermaid-js/mermaid-cli`. → Medium effort.

3. **`llms.txt` + markdown rewrite** — serve docs as clean markdown at `/docs/:path*.md` for LLM consumption, following the shadcn/ui pattern. Low effort, high alignment with product positioning as an AI governance framework. → Rabbit hole avoided in Session 8.

4. **Public ADRs** — expose curated decision records (ADRs 1, 2, 4, 13, 14, 16, 17) on the docs site. Builds credibility with engineering leaders evaluating the framework. → Additive, no blocking dependencies.

5. **Cross-linking pass** — systematic cross-links between concepts ↔ guides ↔ reference pages. Currently some links exist but coverage is incomplete. → Single-session polish work.

6. **Content Registry staleness automation** — build-time check that compares `last-updated` from provenance against `lastSynced` in the registry and emits warnings. The data structures exist; the automation doesn't. → Low effort, high maintenance value.
