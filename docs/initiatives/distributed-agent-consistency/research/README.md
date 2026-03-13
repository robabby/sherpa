# Distributed Agent Consistency — Research

## Iteration History

### Iteration 1 (2026-03-11)
First research cycle. 5 parallel vectors investigating the distributed systems foundations for multi-agent AI coordination.

**Core finding:** Sherpa is a blackboard system with stigmergic coordination — a pattern validated since the 1970s, independently converged upon by MagenticOne and Jido. Consensus protocols are wrong; POSIX atomic primitives are right.

**Vectors investigated:**
1. Actor model (Erlang/Akka/Orleans) → AI agent coordination
2. Optimistic concurrency (ETags/version vectors) → file-based workflows
3. Consensus protocols (Raft/Paxos) → overkill; leader election sufficient
4. Multi-agent framework analysis → 41-87% failure rates, state mgmt unsolved
5. Event sourcing → start with JSONL audit logs, not full event sourcing

## Open Questions

1. **JSONL + git worktree merge behavior** — Do append-only JSONL files merge trivially in git (concatenate + sort), or do they produce false conflicts? Needs empirical testing.

2. **Section-level merge granularity** — Where is the boundary between "section" and "paragraph" for three-way merge? What operational granularity do Figma/Google Docs use?

3. **Supervision policy formalization** — Erlang's one-for-one / one-for-all / rest-for-one map to agent failure scenarios. Should restart policies live in `sherpa.config.ts`?

4. **MCP server as coordinator vs participant** — Should the MCP server mediate all writes (coordinator role) or be one more agent on the blackboard?

5. **Mock agent test harness** — Jido's principle: correct without LLMs before correct with them. How to build a test harness exercising concurrency with deterministic mock agents?

## Cross-References

- `docs/initiatives/section-level-prose-sync/` — Three-way merge algorithm
- `docs/initiatives/sqlite-agentic-state/` — SQLite + CRDTs as backing store
- `docs/initiatives/mcp-coordination-layer/` — MCP server as coordination mediator
- `docs/initiatives/mmo-patterns-for-agents/` — Game server architecture patterns
