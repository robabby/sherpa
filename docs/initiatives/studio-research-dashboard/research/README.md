# Research: Studio Research Dashboard

Research for redesigning the Studio research page into an operational dashboard with view modes, research state, and heartbeat visibility.

## Iterations

- [Iteration 1](iteration-1.md) — 2026-03-21: Landscape survey. Markdown parsing, timezone math, view mode patterns, status indicators. **Key finding:** zero new dependencies needed — all building blocks exist in the codebase.

## Open Questions

1. **RESEARCH_STATE.md format stability** — Should parsing use exact section heading matches or fuzzy matching for agent-maintained files?
2. **Refresh interval** — 2 minutes (feels live) vs 5 minutes (lower server load) for the auto-refresh interval alongside RefreshOnFocus?
3. **View state persistence** — URL params (shareable, matches process page) vs useState (simpler) for active tab selection?

## Related Initiatives

- `harmonic-research-system` — foundational research system design
- `research-markdown-renderer` — rendering research file content
