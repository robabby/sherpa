---
staked: 2026-03-13
thesis: "Single-process Streamable HTTP MCP server backed by SQLite with authority leases, fencing tokens, and hook-based enforcement provides safe multi-agent coordination"
sessions-at-risk: 4-6
kill-criteria-count: 6
---

## Thesis

We believe a single-process Streamable HTTP MCP server backed by SQLite (WAL mode, better-sqlite3) with 4 authority tools, fencing tokens, and Claude Code hook enforcement will enable safe multi-agent coordination.

**Evidence base:** 10 research vectors across 2 iterations (243KB+ raw research), performance benchmarks on M1, 12 MMO systems studied, 3 existing MCP coordination servers analyzed, convergent findings from 6 production lease systems (etcd, Consul, Azure Blob, ZooKeeper, Vault, Kubernetes). Third-party implementations (Agent Mail, Cord, session-collab-mcp) independently validate the architecture.

**Core bet:** Three-layer separation — MCP server provides state, Claude Code hooks provide deterministic enforcement, CLAUDE.md provides behavioral conventions — cleanly solves the "what if the agent forgets to check authority?" failure mode.

## Rejected Alternatives

### Thesis B — Transport Only, Defer Coordination

Add Streamable HTTP without authority/leasing. Use Claude Code's native worktrees and task tools for coordination. Build authority only when collisions occur.

**Rejected because:** False economy. Claude Code docs explicitly warn "two teammates editing same file leads to overwrites." Cursor's 20-agent experiment showed optimistic-only coordination fails at scale. Deferring means rebuilding the server when coordination is inevitably needed — the gap is documented, not hypothetical.

### Thesis C — Filesystem-First Coordination (POSIX Primitives)

Use POSIX primitives (mkdir locks, O_APPEND events, content-hash ETags) for coordination without SQLite.

**Rejected because:** The `distributed-agent-consistency` initiative's own research documents the fragility — Git's lock file model is pessimistic/fragile, Claude Code itself hits stale `.git/index.lock`. No fencing tokens are possible without a centralized authority. Stale locks from crashed agents have no automatic recovery. SQLite adds one dependency and eliminates the entire problem class.

## Leading Indicators

1. **Session 1 (Phase 0):** Streamable HTTP transport serves all 7 existing tools. Must validate THREE things: (a) multi-client transport works (requires session manager — SDK only supports one session per transport instance), (b) `.mcp.json` URL field works, (c) hook latency baseline measured.
2. **Session 2:** SQLite stores authority leases. `authority_acquire` returns fencing tokens. Leases expire via TTL reaper.
3. **Session 3:** PreToolUse hooks enforce authority — `Edit`/`Write` calls are blocked when agent lacks valid lease. Round-trip latency under 100ms.
4. **Session 4:** `get_dashboard` returns role-scoped state. Workers receive implicit authority via task dispatch.

## Kill Criteria

1. **Transport failure:** `StreamableHTTPServerTransport` cannot support multiple concurrent Claude Code clients connecting to the same server instance. (Falsifiable in Session 1.)
2. **Hook latency:** Claude Code `PreToolUse` hooks making HTTP round-trips to the MCP server exceed 100ms p95, causing perceptible UX degradation during file edits. (Falsifiable in Session 3.)
3. **SQLite contention:** SQLite WAL under concurrent hook checks from multiple agents exceeds 50ms p99 read latency, contradicting the 3-7μs benchmark. (Falsifiable in Session 3.)
4. **Adoption friction:** Installing authority enforcement requires more than `sherpa init` — if hook configuration can't be automated, the enforcement layer won't be adopted. (Falsifiable in Session 4.)
5. **Demand signal (added by pre-mortem):** If no file collision has occurred across 4 weeks of active multi-agent dispatch after Phase 0 ships, defer authority (Phases 1-3) to a future initiative. The gap is documented but not experienced. (Falsifiable 4 weeks after Phase 0.)
6. **Circular dependency (added by pre-mortem):** If `sqlite-agentic-state` and `distributed-agent-consistency` remain pending with no plan.md after Phase 0 completes, inline their contributions and remove them as blocking dependencies. (Falsifiable after Phase 0.)

## Review Trigger

- **Time-based:** After Session 3 (hooks + authority working together). If leading indicators 1-3 are green, commit remaining sessions. If any kill criterion is triggered, stop and reassess.
- **Event-based:** If Claude Code ships native coordination primitives (authority, fencing) in their Agent Teams feature, reassess whether this layer is still needed.
- **Demand-based (added by pre-mortem):** 4 weeks after Phase 0, check dispatch history for actual file collisions. If none, defer Phases 1-3.
