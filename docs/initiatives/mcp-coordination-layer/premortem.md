---
premortem: 2026-03-13
failure-modes-identified: 12
mitigations-added: 8
kill-criteria-added: 2
---

## Frame

> It's June 2026. The MCP Coordination Layer initiative consumed 6 sessions and delivered nothing usable. What happened?

Three adversarial lenses — technical, scope, context — were run in parallel. The findings converged on a single theme: **the research quality created false urgency for a sophisticated architecture that current scale doesn't demand.** Phase 0 (Streamable HTTP transport) is independently valuable and low-risk. Everything beyond Phase 0 compounds risk without validated demand.

---

## Technical Failures

### T1. Transport Supports Only One Client Session (HIGH / FATAL)

The SDK's `StreamableHTTPServerTransport` has a single `_initialized` flag and one `sessionId`. When Client A initializes, Client B gets HTTP 400 `"Server already initialized"`. The `McpServer.connect()` throws if called twice. Multiple clients require a session manager that creates a new Server+Transport pair per client, routing by `mcp-session-id` header.

**Why missed:** Research assumed "HTTP supports concurrent requests" equals "SDK transport supports concurrent MCP sessions." The SDK source was not inspected.

**Mitigation:** Build a session manager (~100 lines) that maps `mcp-session-id` to Server+Transport pairs. The `onsessioninitialized` / `onsessionclosed` callbacks exist for this. Solvable but was not planned.

### T2. Hook Latency — Shell Roundtrip Tax (MEDIUM / SIGNIFICANT)

PreToolUse hooks execute as shell commands. An HTTP authority check requires: process spawn (~5-15ms), Node.js cold start (~30-80ms), HTTP request (~1-5ms), response parsing. Naive implementation: 150-300ms p95. Optimized: 50-100ms. Every Edit/Write pays this tax.

**Mitigation:** Verify Claude Code's `"http"` hook type handles direct HTTP POST without shell wrapper. If command hooks are required, use a compiled binary (Go/Rust) or Unix domain socket to cut overhead.

### T3. Synchronous SQLite Blocks Event Loop (MEDIUM / SIGNIFICANT)

`better-sqlite3` writes are synchronous C++ calls. `BEGIN IMMEDIATE` acquires the WAL write lock (up to 5-50ms under contention) and blocks the event loop. During a write, no HTTP requests are processed, no SSE events sent.

**Mitigation:** At low concurrency (2-3 agents), imperceptible. At 5+, batch writes into single event loop ticks, or move to libsql's async API earlier than planned.

### T4. Server Startup Race (HIGH / SIGNIFICANT)

Hooks are configured statically. If the MCP server isn't running when Claude Code starts, every Edit/Write hook gets `ECONNREFUSED`. Fail-closed blocks all edits. Fail-open bypasses authority.

**Mitigation:** Fail-open with logging. SessionStart hook auto-starts the server if not running. Health check endpoint with short timeout.

### T5. Worktree Path Normalization (MEDIUM / SIGNIFICANT)

The same file exists at different absolute paths across worktrees. PreToolUse hooks receive absolute paths. If normalization to repo-relative paths fails, authority checks either always fail or always pass.

**Mitigation:** Hook determines git root via `git rev-parse --show-toplevel`, computes repo-relative path. MCP server stores scopes as relative paths only.

---

## Scope Failures

### S1. The Problem Doesn't Exist Yet (HIGH / FATAL)

No multi-agent file collision has ever occurred in Sherpa's history. Current workflow: 1 user, 1-3 agents, separate tasks, separate file targets, worktree isolation. The 243KB of research validates an architecture for 20+ concurrent agents. Sherpa has 3.

**Why missed:** Research quality created false confidence that the problem is urgent. Cursor's 20-agent experiment and Claude Code's "overwrites" warning are real — at scales Sherpa hasn't reached.

**Mitigation:** Ship Phase 0 (transport). Stop. Build authority only when the first actual collision occurs or parallel dispatch regularly involves 4+ concurrent sessions.

### S2. Worktrees + Conventions Already Solve It (HIGH / SIGNIFICANT)

Worktrees provide physical isolation. The initiative convention prohibits editing shared artifacts directly ("write proposals instead"). The Judge reviews PRs at merge time. This is a prevention → detection → compensation stack that already works. The coordination layer duplicates it with higher operational cost.

**Mitigation:** Document the existing collision-prevention stack explicitly. Measure its gaps with real usage data before replacing it.

### S3. Session Budget Overrun (HIGH / SIGNIFICANT)

Deliverables: new transport + SQLite schema + Drizzle ORM + 4 authority tools + 1 resource + 1 dashboard tool + 6 hook integrations + write-through projection + bootstrap protocol + port resolution + lifecycle management. In 4-6 sessions. Each component is tractable alone; integration is where time disappears.

**Mitigation:** Hard phase boundaries. Each phase ships independently. If Phase 0 takes 2 sessions instead of 1, the budget is already overrun — recalibrate.

### S4. Feature Creep from Rich Research (HIGH / SIGNIFICANT)

243KB of research produced: EVE time dilation backpressure, MMO replication patterns, Azure Blob Break model, Durable Objects architecture, fencing token validation, write-through projection with content hashing. All individually justified. Collectively, a production-grade system for a prototype-stage workflow.

**Mitigation:** Define a walking skeleton: Streamable HTTP + one SQLite table + `authority_acquire` + `authority_release`. No hooks, no projection, no bootstrap. If unused for 2 weeks, stop.

---

## Context Failures

### C1. Claude Code Ships Native Coordination (HIGH / FATAL)

Anthropic's Agent Teams is experimental and evolving fast (worktrees, task tools, hooks, subagent definitions all shipped in months). They know about the gap — their docs warn about concurrent edits. The 16-agent C compiler project demonstrated the need. They have every incentive to solve this natively.

**Mitigation:** Weekly changelog monitoring. If any update mentions "authority," "file locks," "fencing," or "conflict detection" in Agent Teams context, freeze immediately. Design architecture so SQLite state has value independent of authority.

### C2. Circular Dependency Deadlock (HIGH / FATAL)

`mcp-coordination-layer` depends on `sqlite-agentic-state` and `distributed-agent-consistency`. Both depend back on `mcp-coordination-layer`. Neither has been approved, planned, or started. This is a three-way deadlock visible in the proposal frontmatter right now.

**Mitigation:** Break the cycle. The coordination layer proposal already contains the SQLite schema it needs. Inline it. Use the distributed-agent-consistency research findings directly. Downgrade both dependencies from blocking to informing.

### C3. MCP SDK Breaking Changes (MEDIUM / SIGNIFICANT)

The SDK is at 1.18 (high minor version = rapid iteration). The MCP spec already deprecated an entire transport layer (SSE). A 2.0 could restructure the transport API before the initiative completes.

**Mitigation:** Pin to exact SDK version during implementation. Wrap transport in a thin adapter. Complete Phase 0 first to validate the API surface.

### C4. Over-Engineered for Actual Scale (HIGH / SIGNIFICANT)

Every design decision is justified by production systems (etcd, Consul, ZooKeeper) that serve thousands to millions of concurrent actors. Sherpa serves 3. The kill criteria (latency, contention) are met. The system works perfectly. And is never needed.

**Mitigation:** Same as S1. Build the simplest version. Add authority only when a collision actually occurs.

---

## Ranked Failure Modes

| Rank | ID | Failure Mode | L x S | Detection Signal |
|------|-----|-------------|-------|------------------|
| 1 | S1 | Problem doesn't exist yet | HIGH x FATAL | Zero file collisions in dispatch history |
| 2 | T1 | Transport: one session per instance | HIGH x FATAL | Second client gets HTTP 400 on connect |
| 3 | C1 | Claude Code ships native coordination | HIGH x FATAL | Changelog mentions authority/fencing |
| 4 | C2 | Circular dependency deadlock | HIGH x FATAL | Neither dependency initiative has activity |
| 5 | S3 | Session budget overrun | HIGH x SIG | Phase 0 takes 2 sessions instead of 1 |
| 6 | T4 | Server startup race with hooks | HIGH x SIG | ECONNREFUSED on first Edit after session start |
| 7 | S4 | Feature creep from research | HIGH x SIG | Implementation includes edge-case features before basic cycle validated |
| 8 | S2 | Worktrees already solve it | HIGH x SIG | Authority tools called but never deny anything |
| 9 | C4 | Over-engineered for scale | HIGH x SIG | System runs perfectly and is never needed |
| 10 | T2 | Hook latency shell tax | MED x SIG | >100ms p95 on Edit/Write hook round-trip |
| 11 | T3 | Sync SQLite blocks event loop | MED x SIG | Intermittent >50ms authority check latencies |
| 12 | T5 | Worktree path normalization | MED x SIG | Authority denials for files agent should own |

---

## Mitigations

| Mitigation | Addresses | Action |
|-----------|-----------|--------|
| Ship Phase 0 independently, gate Phase 1+ on demand signal | S1, S2, C4 | Do not start authority work until a collision occurs or 4+ concurrent sessions are routine |
| Build session manager for multi-client transport | T1 | ~100 lines routing by `mcp-session-id`. Must be in Phase 0 scope. |
| Break circular dependencies | C2 | Inline SQLite schema from coordination layer proposal. Downgrade deps to informing. |
| Validate hook latency in Session 1 | T2 | Configure a test hook, POST to endpoint, measure end-to-end. If >100ms, evaluate alternatives before Phase 2. |
| Auto-start server from hooks/dispatch | T4 | SessionStart hook or dispatch.sh checks server health, starts if down |
| Monitor Claude Code changelog weekly | C1 | If authority-related features appear, freeze and reassess |
| Pin SDK version, wrap transport | C3 | Exact version pin, thin adapter layer |
| Walking skeleton before full build | S4, S3 | Streamable HTTP + one table + acquire/release. Validate before adding sophistication. |

---

## Updates to Stake

### New Kill Criteria (add to stake.md)

5. **Demand signal:** If no file collision has occurred across 4 weeks of active multi-agent dispatch after Phase 0 ships, defer authority (Phases 1-3) to a future initiative. The gap is documented but not experienced.
6. **Circular dependency:** If `sqlite-agentic-state` and `distributed-agent-consistency` remain pending with no plan.md after Phase 0 completes, inline their contributions and remove them as blocking dependencies.

### Amended Leading Indicators

- **Session 1 (Phase 0):** Must validate THREE things before proceeding: (a) multi-client transport works (T1), (b) `.mcp.json` URL field works, (c) hook latency baseline measured. If any fails, stop and redesign.

### Risk the Stake Underweights

The stake evaluates technical feasibility. It does not evaluate **demand** — whether the problem this solves has actually occurred. The pre-mortem's #1 ranked failure mode (S1: problem doesn't exist yet) is not covered by any existing kill criterion. Kill criterion #5 above addresses this.

---

## Human-Identified Risks

*This section is intentionally left empty. The pre-mortem enumerates technical, scope, and context risks systematically. Organizational, political, and team-dynamic risks that AI cannot see should be added here by the human reviewer.*
