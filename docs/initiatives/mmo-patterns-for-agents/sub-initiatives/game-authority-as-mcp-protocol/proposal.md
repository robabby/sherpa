---
status: pending
initiative: game-authority-as-mcp-protocol
created: 2026-03-12
updated: 2026-03-12
type: research-synthesis
risk: structural
targets:
  - packages/studio-mcp/src/authority/
  - docs/architecture/authority-protocol.md
dependencies:
  - mcp-coordination-layer
  - sqlite-agentic-state
spawned-from: mmo-patterns-for-agents
---

# Game Authority as MCP Protocol

## Summary

A concrete coordination protocol for Sherpa's MCP server, translating game authority transfer patterns into a six-state machine with fencing tokens, three-tier liveness detection, lock-delay, and implicit authority via task dispatch. Backed by SQLite (not Dolt), enforced at the mutation point, advisory by default but correct by construction.

## State Snapshot

- The `mcp-coordination-layer` initiative designed six MCP tool schemas but not the state machine connecting them or the liveness protocol
- No existing MCP coordination server (Agent Mail, Beads Village, multi-agent-coordination-mcp) implements fencing tokens, heartbeat-based liveness, or a formal authority state machine — all use advisory + TTL + hope
- Jepsen proved that etcd locks with short TTLs fail mutual exclusion within minutes — TTL alone is provably unsafe for correctness
- The Chubby/ZooKeeper/etcd lineage provides 20 years of production-validated patterns: coarse-grained locks, sequencers, lock-delay, ephemeral sessions, jeopardy state
- SQLite (better-sqlite3, WAL mode) at ~190ns per prepared statement is ~250x faster than Dolt over loopback on the authority-check hot path

## Proposed Changes

### Target: `docs/architecture/authority-protocol.md` (new)

Architectural reference defining Sherpa's authority coordination protocol.

**Six-State Authority Machine:**

| State | Description | Agent Can | Transitions To |
|-------|-------------|-----------|---------------|
| UNASSIGNED | No holder. May have lock-delay active. | — | AUTHORITATIVE |
| AUTHORITATIVE | Active authority with fence token | Read, write, heartbeat | ALI, JEOPARDY, UNASSIGNED |
| AUTHORITY_LOSS_IMMINENT (ALI) | Grace period — transfer triggered | Complete in-flight, commit WIP, heartbeat progress | UNASSIGNED (clean), ORPHANED (crash) |
| JEOPARDY | Heartbeat TTL expired, grace period active | Recover (resume heartbeat) | AUTHORITATIVE (recovery), ORPHANED (grace expires) |
| ORPHANED | No holder, preserves progress data | — | AUTHORITATIVE (adoption/reclaim) |
| EXPIRED | Cleaned up, no progress data | — | UNASSIGNED (reaper) |

**Three-Tier Liveness:**
1. Heartbeat TTL — implicit (any tool call with valid fence token) or explicit (`heartbeat_authority` with progress payload). TTLs: 5 min interactive, 2 min background, 30 min waiting-for-human.
2. Jeopardy grace — 1 minute after heartbeat TTL expires. Authority frozen, agent may recover.
3. Fencing tokens — monotonically increasing integers validated on every mutation. Safety net when tiers 1 and 2 fail.

**Lock-Delay (from Chubby):**
15-30 seconds after unclean authority loss (crash, timeout). Zero after clean release. Drains in-flight operations, prevents thundering herd.

**Worker Grace Period Checklist (AUTHORITY_LOSS_IMMINENT):**
1. Stop accepting new work
2. Complete in-flight file writes
3. Commit WIP to branch (`git commit -m "WIP: authority loss"`)
4. Heartbeat progress data: `{files_modified, last_commit_sha, completion_estimate, resume_point}`
5. Release subordinate authorities
6. Signal readiness via `release_authority`

**Permission Levels per Artifact Type:**

| Artifact | Level | Behavior |
|----------|-------|----------|
| Task definitions | SessionOwner | Planner only, non-transferable |
| Implementation files | Transferable | Worker→Judge, immediate transfer |
| Shared config (CLAUDE.md) | RequestRequired | Two-step consent handshake |
| Activity log | Distributable | Auto-follows current task holder |
| Roadmap/guidelines | None | Proposals only, never directly written |

**Two-Track Authority Model:**
- *Implicit:* `dispatch_task` auto-acquires authority over `task.targets[]`. Worker receives `fence_token`. `done()` auto-releases. Most agents never touch authority API.
- *Explicit:* `acquire_authority` for Planners on shared artifacts. `RequestRequired` permission triggers consent handshake. `override_authority` for human admin.

### Target: `packages/studio-mcp/src/authority/` (new module)

Implementation module within the MCP server package.

**Authority state machine** — SQLite-backed state transitions with:
- `authority_leases` table: `scope`, `holder_agent_id`, `task_id`, `fence_token` (INTEGER AUTOINCREMENT), `state` (enum), `mode` (exclusive/shared), `heartbeat_ttl_seconds`, `last_heartbeat_at`, `jeopardy_at`, `lock_delay_until`, `progress_data` (JSON), `created_at`, `expires_at`
- Partial index on `state IN ('AUTHORITATIVE', 'ALI', 'JEOPARDY')` for hot-path queries
- Single-process Streamable HTTP ensures all state transitions are serialized by the event loop — no distributed consensus needed

**Reaper timer** — 30-second interval, scans for:
- Heartbeat TTL expired → transition to JEOPARDY (if not already)
- Jeopardy grace expired → transition to ORPHANED
- Orphaned tasks older than configurable threshold → transition to EXPIRED
- Lock-delay completed → clear lock-delay flag, scope becomes acquirable

**Fence token generation** — SQLite `INTEGER PRIMARY KEY AUTOINCREMENT` on a `fence_token_seq` table. Single-writer makes this trivially monotonic. No consensus needed.

## Rationale

1. **The gap is validated.** Five vectors independently confirmed that no existing MCP server implements enforced authority with fencing tokens. Advisory coordination exists (Agent Mail) but provably fails for correctness (Jepsen on etcd).

2. **Chubby's coarse-grained model is the right fit.** Sherpa grants authority per-task (coarse), not per-file-write (fine). Authority check is per-mutation but the check is a ~190ns SQLite index lookup. Authority acquisition rate (task dispatch frequency) is decoupled from operation rate (file mutations per second).

3. **The single-process architecture eliminates distributed coordination entirely.** No Paxos, no Raft, no ZAB. Fencing token generation is a SQLite autoincrement. State transitions are serialized by the Node.js event loop. This is the strongest possible correctness guarantee with the simplest possible implementation.

4. **Three-tier liveness compensates for each mechanism's weaknesses.** Heartbeat TTL may false-positive (agent thinking). Jeopardy grace may be too generous (truly crashed agent holds resources). Fencing tokens catch what both miss (zombie writes). No single mechanism is sufficient; together they're robust.

5. **SQLite, not Dolt.** The 250x latency gap is decisive for the hot path. Dolt solves multi-writer/distributed problems Sherpa doesn't have. Turso/libSQL is the upgrade path if write concurrency ever matters.

## Dependencies

- `mcp-coordination-layer` — This protocol runs inside the MCP coordination server. The tool schemas from that initiative's iteration 1 are inputs to this design.
- `sqlite-agentic-state` — Schema design for the authority tables feeds into the `authority_leases` table design.

## Review Notes

- **Lock-delay vs fast reassignment:** Lock-delay (15-30s) slows recovery after crashes. Should be zero for Planner-initiated reassignments (clean transfers) and positive only for crash detection (unclean transfers).
- **Authority × worktrees:** If agents work in isolated git worktrees, file-level authority may be unnecessary for most operations. Authority may only matter at the merge point. Needs investigation.
- **Progress data resumption:** The heartbeat-with-progress pattern is well-motivated (Temporal), but how an adopting Worker actually uses `{files_modified, last_commit_sha, resume_point}` to resume mid-task needs concrete design.
- **MCP notification vs polling:** Resource subscriptions (`authority://{scope}`) can push authority state changes, but client support is spotty. May need to inject authority notifications into tool call responses as metadata.
- **Effort:** 3-4 sessions for the authority module MVP. Session 1: schema + state machine + reaper. Session 2: tool handlers + fencing enforcement. Session 3: implicit dispatch integration + heartbeat. Session 4 (if needed): lock-delay + permission levels.
