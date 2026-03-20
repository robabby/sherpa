# Multi-Project Studio Research

## Summary

Iteration 1 surveyed the landscape across four dimensions: dotfolder schema conventions, multi-workspace federation patterns, config inheritance models, and multi-project dashboard UX. The research validates the proposal's core architecture (config at root, data in dotfolder, npm-based convention inheritance) and adds concrete design patterns from ESLint, Tailwind, Vercel, Linear, Nx, and Backstage.

## Key Findings

1. **Config at root, state in dotfolder** — universal pattern (Nx, Turbo, VS Code). `sherpa.config.ts` stays at project root; `.sherpa/` holds governance data.
2. **ESLint flat config is the inheritance model** — ordered array, last-wins, with Tailwind's replace-vs-extend per-field strategy.
3. **Vercel's project-as-filter is the UX model** — same sidebar nav, project selector narrows scope. Linear's custom views for cross-project queries.
4. **Initiative dependency graph is the differentiator** — cross-project visualization of `dependencies`/`informs` relationships.

## Resolved Questions (from iteration 2)

1. **`.sherpa/` vs `docs/`:** Governance data (initiatives, tasks, agents) → `.sherpa/`. Reference docs (architecture, decisions) → `docs/`. The Backstage model.
2. **`.sherpa/` + `.claude/` coexistence:** Dual ownership. `.sherpa/rules/` for portable conventions, `.claude/rules/` for agent-specific. Bridge via `@import`.
3. **MCP federation:** No gateway. BFF via Server Components + Virtual MCP with namespace-prefixed tools.
4. **URL structure:** Path-based. `/projects/{slug}/...`. Unanimous across all platforms studied.
5. **Config format:** `sherpa.json` (not `sherpa.config.ts`). JSON is the industry standard.

## Open Questions

1. Migration strategy for 60+ initiatives and 28+ tasks from `docs/` to `.sherpa/`
2. `sherpa init` experience for new and existing projects
3. Convention inheritance in `sherpa.json` — `extends` field semantics
4. Cross-project initiative references — namespaced slugs (`project/slug`)
5. Convention drift detection — how to surface which projects are behind upstream

## Iterations

- [Iteration 1](iteration-1.md) — 2026-03-20: Landscape survey (dotfolders, federation, config inheritance, dashboard UX)
- [Iteration 2](iteration-2.md) — 2026-03-20: Design decisions (coexistence, MCP federation, URL routing, governance boundaries)
