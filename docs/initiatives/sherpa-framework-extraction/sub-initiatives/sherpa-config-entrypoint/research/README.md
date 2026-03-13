# Sherpa Config Entrypoint — Research

## Iterations

| # | Date | Vectors | Key Insight |
|---|------|---------|-------------|
| 1 | 2026-03-12 | Config-as-code survey, vocabulary system, theme distribution, config composition | The config is three separate concerns: `defineConfig()` (identity function for types), `createStudio()` (runtime resolution), `withSherpa()` (build integration). Vocabulary is cosmetic (Salesforce model), paths are immutable. shadcn registry is the theme distribution mechanism. Per-property merge semantics (Sanity model) over full-config mutation (Payload model). |

## Open Questions for Next Iteration

1. **Plugin collision policy** — When two plugins contribute catalog entries with the same slug, what happens? Error, merge, or last-wins? How does Sanity's `flattenConfig` handle this?

2. **`withSherpa()` scope** — Does Sherpa need any webpack/turbopack modifications, or is `transpilePackages` sufficient for pure ESM TypeScript packages?

3. **Vocabulary in MCP tool names** — If "initiative" becomes "project", should MCP tools change from `list_initiatives` to `list_projects`? Or are tool names stable API surface (like paths)?

4. **Theme preset vs inline** — Should config accept a preset name (resolved from registry at init time) or inline CSS variables? Presets are install-time artifacts, inline is always-available.

5. **Async vs sync `createStudio()`** — Current code uses `readFileSync`. All comparable frameworks (Keystatic, Payload) are async. Migration cost vs forward compatibility.

## Research Archive

- `iteration-1.md` — Synthesis (2026-03-12)
- `iteration-1/` — Full agent reports (4 vectors)
  - `vector-1-config-as-code-survey.md`
  - `vector-2-vocabulary-system-design.md`
  - `vector-3-theme-distribution.md`
  - `vector-4-config-composition.md`
