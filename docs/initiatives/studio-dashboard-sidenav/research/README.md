# Studio Dashboard & Side-Nav — Research

## Iterations

- **Iteration 1** (2026-03-14): Landscape survey — sidebar layout patterns, Next.js App Router integration, dashboard prioritization models, shadcn/ui sidebar component

## Open Questions

1. What are the exact "needs attention" triggers for Sherpa's Tier 1 dashboard? (proposal age, task staleness, dispatch failure thresholds)
2. Should the dashboard be role-aware? (Planner/Worker/Judge see different priorities)
3. Which shadcn collapse mode: `"icon"` (rail) vs `"offcanvas"`?
4. StudioHeader placement in the new layout shell — inside content area or fixed above?
5. Is `cacheComponents` enabled in Next.js 16 config? (determines persistence approach)

## Cross-References

- `studio-state-machine` — approved, overlaps on `page.tsx` and `hub-panel.tsx`. Dashboard restructure should coordinate when state-machine activates.
