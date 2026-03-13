# Sherpa Framework Extraction — Research

## Iterations

| # | Date | Vectors | Key Insight |
|---|------|---------|-------------|
| 1 | 2026-03-11 | Framework patterns, convention portability, white-label, cross-project sync, MCP distribution | Three-channel distribution: npm for code, plugins for executable conventions, custom CLI for prose conventions. Payload CMS is the architectural model. Convention sync is the hardest unsolved problem. |
| 2 | 2026-03-11 | Convention sync CLI, config-as-code entrypoint, extraction dependency graph, Turborepo→npm publishing | Sherpa is concretely implementable: clean DAG (zero circular deps), 91/96 components domain-agnostic, `defineConfig()` + `withSherpa()` config, `node-diff3` + manifest for convention sync, JIT→Publishable graduation path. |
| 3 | 2026-03-11 | `createStudio()` API, catalog registration, `server-only` portability, standalone testing | `createStudio(config)` returns nested namespaces (13 groups). Config-based catalog registration (Payload spreading). Strip `server-only` from core (Payload model). `__fixtures__/` + per-package vitest. All original open questions answered — Phase 2 extraction plan is unblocked. |
| 4 | 2026-03-11 | shadcn/ui extraction, sync vs async API, convention ecosystem update, monorepo gotchas | Ship sync v1 (content.ts I/O boundary, 1-session async migration). UI: bundle primitives JIT → registry Publishable (Plate model). Convention governance (L4) still vacant — Sherpa's unique position. Sub-path exports critical for studio-ui. Three plan revisions needed (Tasks 9, 13, .npmrc). |

## Open Questions for Next Iteration

1. **shadcn primitive bundling mechanics** — When copying ~19 shadcn components into `packages/studio-ui/src/ui/`, do they need their own Radix peer deps? What's the minimal set actually used by the 91 studio components?

2. **Sub-path export granularity for studio-ui** — Per component, per domain group, or per concern? Trade-off between import convenience and tree-shaking.

3. **AGENTS.md generation from conventions** — Should `sherpa sync` also generate an AGENTS.md from synced `.claude/rules/` files? Bridges with the 60K-repo cross-tool standard.

4. **Multi-plugin collision policy** — Unresolved from iteration 3. When two plugins contribute catalog entries with the same slug, what happens?

5. **Behavioral agent schema translation fidelity** — Unresolved from iteration 3. How much of the behavioral agent schema survives translation to Claude Code subagent format?

## Research Archive

- `iteration-1.md` — Synthesis (2026-03-11)
- `iteration-1/` — Full agent reports (5 vectors)
  - `vector-1-framework-extraction-patterns.md`
  - `vector-2-convention-portability.md`
  - `vector-3-white-label-ui.md`
  - `vector-4-cross-project-sync.md`
  - `vector-5-mcp-server-distribution.md`
- `iteration-2.md` — Synthesis (2026-03-11)
- `iteration-2/` — Full agent reports (4 vectors)
  - `vector-1-convention-sync-cli.md`
  - `vector-2-config-as-code-entrypoint.md`
  - `vector-3-extraction-dependency-graph.md`
  - `vector-4-turborepo-npm-publishing.md`
- `iteration-3.md` — Synthesis (2026-03-11)
- `iteration-3/` — Full agent reports (4 vectors)
  - `vector-1-create-studio-api.md`
  - `vector-2-catalog-registration-plugin-extension.md`
  - `vector-3-server-only-portability.md`
  - `vector-4-standalone-testing-strategy.md`
- `iteration-4.md` — Synthesis (2026-03-11)
- `iteration-4/` — Full agent reports (4 vectors)
  - `vector-1-shadcn-ui-framework-extraction.md`
  - `vector-2-sync-async-api-migration.md`
  - `vector-3-convention-distribution-ecosystem.md`
  - `vector-4-monorepo-framework-package-gotchas.md`
- `kickoff-prompt.md` — Original research prompt (6 vectors)
