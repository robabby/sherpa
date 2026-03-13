# MMO Patterns for Agents — Research Index

## Iteration 1 (2026-03-11)

**Theme:** Foundational survey of MMO server architecture patterns and their mapping to multi-agent AI coordination.

**Vectors investigated:**
1. MMO architectures beyond Star Citizen (12 systems surveyed)
2. Interest management algorithms (5-class taxonomy + DOI model)
3. Authority transfer protocols (10 distinct approaches)
4. Tick rate and reconciliation (8 games + differential sync)
5. Lag compensation and rollback (15 patterns from games + distributed systems)

**Synthesis:** [iteration-1.md](iteration-1.md)

**Raw reports:** [iteration-1/](iteration-1/)

## Open Questions

1. **DOI model implementation** — What formula, coefficients, and decay function for agent context scoping? Needs prototyping.
2. **MCP coordination server design** — What does the replication layer API look like? Which Star Citizen subsystems (Replicant, Gateway, Atlas, Scribe) map to MCP tools?
3. **Section-level granularity automation** — Can we reliably parse markdown/code into components for fine-grained authority? Cross-ref `section-level-prose-sync`.
4. **Empirical conflict rate** — How often do agents actually collide on the same files? Determines the right point on the prevention→compensation spectrum.
5. **Fencing tokens in git** — How to implement monotonically increasing authority tokens in a git-based system? Cross-ref `sqlite-agentic-state`.

## Sub-Initiatives

- `sub-initiatives/game-authority-as-mcp-protocol/` — Concrete MCP tool API design for authority management (6-state machine, 3-tier liveness, fencing tokens). Launched from `branches/game-authority-as-mcp-protocol.md`.

## Related Initiatives

- `mcp-coordination-layer` — The MCP server as replication layer
- `distributed-agent-consistency` — Consistency model for multi-agent work
- `sqlite-agentic-state` — State backing store for authority tracking
- `section-level-prose-sync` — Fine-grained document merge algorithm
