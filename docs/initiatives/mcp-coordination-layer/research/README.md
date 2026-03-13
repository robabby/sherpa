# MCP Coordination Layer — Research

## Iterations

### Iteration 1 (2026-03-11)
First research cycle. Surveyed MCP protocol primitives, existing MCP servers with coordination patterns, authority tracking design, SQLite concurrency architecture, and file projection sync strategies. Produced initial proposal.

**Key finding:** Single-process Streamable HTTP + SQLite (WAL, better-sqlite3) + implicit authority via task dispatch + write-through file projection is the architecture. MCP has no coordination primitives — all coordination is application-level tool logic.

**Vector reports:** `iteration-1/vector-{1-5}-*.md` (243KB of raw research)

### Iteration 2 (2026-03-12)
Second research cycle. Informed by mmo-patterns-for-agents sibling initiative. Investigated minimal tool surface for five MMO patterns, stateful vs stateless architecture, Claude Code native features, persistence layer alternatives (Dolt, git-only, hybrid), and the bootstrap problem.

**Key finding:** Tool surface reduces from 6 to 4 tools + 1 resource. Three-layer architecture: MCP server (state) + Claude Code hooks (enforcement) + CLAUDE.md (conventions). Hooks make enforcement deterministic — PreToolUse HTTP hooks check authority on every file edit. SQLite confirmed from every angle (3-7μs reads, no cache needed). Bootstrap solved via three-layer protocol (SessionStart hook → get_dashboard tool → resource subscriptions).

**Vector reports:** `iteration-2/vector-{1-5}-*.md` (~170KB of raw research)

## Open Questions

1. **Hook configuration bootstrapping** — How does `sherpa init` automate PreToolUse HTTP hook installation? What's the adoption friction if manual?
2. **Agent identity across sessions** — No stable session IDs in Claude Code. How does the MCP server identify agents? UUID assignment? SessionStart hook identity passing?
3. **`get_dashboard` schema design** — Concrete JSON schema for Worker vs Planner vs Judge bootstrap payloads. Token budget per role.
4. **Full tool surface beyond authority** — Authority is 4 tools. Task management + initiative lifecycle + mutations add more. Can we stay under 10 total?
5. **Hook latency and fail-open policy** — If MCP server is down, should hooks fail-open (allow, degrade) or fail-closed (block)? Acceptable latency budget for synchronous authority check?

## Related Research

- `../mmo-patterns-for-agents/` — Five patterns that define what the coordination server does
- `../sqlite-agentic-state/` — SQLite as backing store for agent state
- `../distributed-agent-consistency/` — Consistency models for multi-agent collaboration
- `../section-level-prose-sync/` — Three-way merge at section granularity
