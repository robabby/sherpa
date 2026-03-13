# Game Authority as MCP Protocol — Research

## Iterations

### Iteration 1 (2026-03-12)

**Theme:** Concrete MCP tool API design for authority management — state machine, heartbeat protocol, backing store, and prior art deep dive.

**Vectors investigated:**
1. Dolt vs SQLite as authority backing store (verdict: SQLite, 250x hot-path latency gap)
2. Existing MCP coordination server tool APIs (4 servers analyzed, gap confirmed)
3. Chubby/ZooKeeper lineage (20 years of production lock service design)
4. Authority state machine as MCP tool call sequences (6 states, 17 transitions)
5. Heartbeat, orphan detection, and adoption protocol (3-tier liveness model)

**Synthesis:** [iteration-1.md](iteration-1.md)

**Raw reports:** [iteration-1/](iteration-1/)

## Open Questions

1. **Authority × git worktrees** — Does worktree isolation make file-level authority unnecessary for most operations?
2. **Schema design for six-state machine** — SQLite tables, indexes, hot-path optimization. Cross-ref `authority-schema-design` branch seed.
3. **Progress data schema** — What structured data enables task resumption after adoption?
4. **Lock-delay vs fast reassignment** — Zero for clean transfers, positive for crashes?
5. **MCP notification for authority changes** — Resource subscriptions vs polling vs response injection?

## Related Research

- `../../research/` — Parent initiative (MMO patterns survey, iteration 1)
- `../../../mcp-coordination-layer/` — Sibling initiative (MCP server architecture, tool schemas)
- `../../../sqlite-agentic-state/` — Sibling initiative (SQLite as backing store)
- `../../branches/doi-model-for-agents.md` — Sibling branch seed (interest management)
