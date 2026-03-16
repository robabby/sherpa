# Studio UX Patterns — Research

## Summary

Iteration 1 validated all four interaction patterns in the proposal. Each has an established, well-documented approach with minimal implementation ambiguity. The 3-session appetite may be generous — research suggests each pattern is a half-session or less.

## Iterations

1. [Iteration 1](iteration-1.md) (2026-03-15) — Landscape survey of cmdk, skeleton loading, empty states, and dynamic favicon patterns across Vercel, GitHub Primer, Shopify Polaris, NNGroup research, and real-world codebases.

## Open Questions

1. **Safari favicon reliability** — Manual testing needed for dynamic `<link>` swapping in Safari 26+
2. **EmptyState CLI command slot** — Dedicated prop vs. children escape hatch
3. **Skeleton template placement** — `apps/studio/` vs. `packages/studio-ui/`
4. **Command palette scale ceiling** — Pre-fetch works at <200 items; monitor growth
