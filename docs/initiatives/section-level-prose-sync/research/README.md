# Section-Level Prose Sync — Research

## Summary

Research into algorithms and prior art for syncing markdown convention files between an upstream framework and consumer projects at section (heading) granularity. Core algorithm for `sherpa sync`.

## Iterations

### Iteration 1 (2026-03-11)
Five-vector investigation covering deployed systems, markdown parsing, tree merge algorithms, OT/CRDT evaluation, and framework sync patterns. Strong convergence: section-level three-way diff3 with stored baseline is the correct approach. Weave validates the section model. Copier validates the sync architecture.

## Open Questions

1. **Weave integration vs custom build** — Should we use Weave's Rust core (WASM/CLI) or build our own TypeScript section parser with remark? Evaluate Weave's entity model for stored baselines, Node.js interop, and ownership marker support.

2. **Conflict UX design** — What's the user experience for section-level conflicts? Git-style markers, interactive CLI, VS Code merge editor, or Studio UI? What does Copier's conflict UX look like in practice?

3. **Section ownership semantics** — Full taxonomy of per-section sync policies (`managed`, `owned`, `locked`, `deprecated`). How do markers interact with three-way merge? Configuration surface in `sherpa.config.ts`.

4. **First-sync bootstrapping** — On first sync (no baseline), how to distinguish upstream template sections from consumer additions? Treat upstream as implicit base, or flag everything for review?

5. **Performance and incremental sync** — For repos with 50+ convention files, incremental sync via file-level content hashing. `.sherpa/sync-state/` scaling characteristics.

## Cross-References

- `docs/initiatives/distributed-agent-consistency/` — agents consuming filesystem state as distributed peers
- `docs/initiatives/mcp-coordination-layer/` — MCP server mediating state mutations
