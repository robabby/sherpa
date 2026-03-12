---
status: pending
initiative: mcp-coordination-layer
created: 2026-03-11
updated: 2026-03-11
type: research-synthesis
risk: structural
targets:
  - docs/initiatives/mcp-coordination-layer/
dependencies:
  - sqlite-agentic-state
  - distributed-agent-consistency
spawned-from: null
---

# MCP Coordination Layer

## Summary

Build a single-process MCP server (Streamable HTTP transport) backed by SQLite (WAL mode, better-sqlite3) that mediates all agent state mutations with authority tracking, optimistic concurrency, and write-through file projection. The MCP server is both the lock manager and resource layer — enabling fencing token enforcement at the mutation point.

## State Snapshot

- MCP spec 2025-11-25 has no built-in coordination primitives — no ETags, version vectors, authority tracking, or conflict resolution
- Only 3 existing MCP servers implement any locking (Agent Mail, Beads Village, Atomic Writer), none implement optimistic concurrency
- SEP-1708 proposes file locking but is not merged
- The MCP ecosystem is converging on application-level coordination implemented in tool logic
- Cursor's 20-agent experiment found that both pure pessimistic locking and pure optimistic concurrency fail for AI agents; Planner/Worker/Judge with scope isolation works

## Proposed Changes

### Target: `packages/studio-mcp/` (new package)

Single-process MCP server with Streamable HTTP transport. Key components:

**Authority Tools:**
- `acquire_authority` — Request lease over a scope (initiative, file, or task). Returns fencing token. TTL-based with configurable duration.
- `release_authority` — Explicitly release a lease.
- `check_authority` — Query current authority state for a scope.
- `transfer_authority` — Hand off authority to another agent.
- `heartbeat_authority` — Renew lease TTL. Also implicitly renewed on any mutation with a valid token.
- `override_authority` — Human-only break operation (Azure Blob model). Immediately breaks any lease.

**Implicit Authority via Task Dispatch:**
When a task is dispatched to a worker, the MCP server auto-acquires file-level authority over the task's target files. No separate `acquire_authority` call needed. Workers operate on their dispatched scope. Explicit authority tools are reserved for planners, shared artifacts, and exploratory work.

**Concurrency Model:**
- Default: optimistic concurrency — version checks on every mutation. Tool calls include `expectedVersion`, server rejects stale writes.
- High-contention: pessimistic leases — explicit `acquire_authority` with fencing tokens for shared artifacts and initiative-level operations.
- The MCP server enforces fencing token ordering at the mutation point (Kleppmann's ideal architecture).

**SQLite Architecture:**
- WAL mode, `BEGIN IMMEDIATE` for all write transactions
- better-sqlite3 driver (synchronous, 1.2M ops/sec, no connection pooling)
- Drizzle ORM for type-safe schema
- One tool call = one IMMEDIATE transaction
- Single-process Streamable HTTP eliminates cross-process SQLITE_BUSY

**Write-Through File Projection:**
- Every mutation regenerates affected markdown files synchronously
- Atomic file writes via temp+rename pattern
- Sync metadata in frontmatter: `_projection_hash`, `_projected_at`, `_source_version`
- Human edit detection via content hashing (body hash ≠ last-projected hash → human edit)
- `sherpa sync` CLI: `project` (rebuild files), `ingest` (pull human edits), `reconcile` (bidirectional)

**Resource Subscriptions:**
- `authority://{scope}` resources for authority state observation
- `notifications/resources/updated` pushed to connected agents on authority changes

### Target: `packages/studio-core/` (schema additions)

Authority record schema:
- `authority_leases` table: `scope`, `agent_id`, `task_id`, `fence_token`, `mode` (exclusive/shared), `ttl_seconds`, `acquired_at`, `expires_at`, `renewed_at`
- `state_versions` table: `resource_uri`, `version` (monotonic), `content_hash`, `updated_by`, `updated_at`
- Periodic reaper for expired leases (30 min interactive, 10 min background workers)

## Rationale

1. **Single-process architecture eliminates distributed coordination.** By routing all mutations through one Node.js process, we sidestep SQLITE_BUSY, cross-process locking, connection pooling, and distributed consensus. SQLite's single-writer model becomes a feature, not a limitation.

2. **Task dispatch as implicit authority is battle-tested.** BullMQ, Temporal, and Cursor's Planner/Worker/Judge all demonstrate that the natural unit of authority is the dispatched task, not explicit lock acquisition. This aligns with Sherpa's existing initiative/task architecture.

3. **MCP Agent Mail validates advisory coordination** but uses Git as storage. Sherpa inverts this (SQLite as truth, files as projection) while adopting the advisory-over-mandatory philosophy.

4. **Write-through projection is the simplest correct strategy.** At Sherpa's write frequency (initiative updates, not thousands/second), synchronous file regeneration has negligible latency cost and eliminates staleness. Logseq's retreat from bidirectional sync confirms that limiting editable surface area is wise.

5. **The MCP server as both lock manager and resource layer** is Kleppmann's recommended architecture for fencing token correctness — the enforcement point is the mutation point.

## Dependencies

- `sqlite-agentic-state` — Schema design and SQLite configuration choices feed into this initiative's database layer
- `distributed-agent-consistency` — Consistency model research informs the authority and concurrency design

## Review Notes

- **Upgrade path:** If single-writer SQLite becomes a bottleneck, Turso/libSQL provides MVCC with row-level conflict detection and 4x write throughput, API-compatible in embedded mode.
- **Git worktree interaction:** If agents work in isolated worktrees, file-level authority may be unnecessary for most operations. This needs investigation in iteration 2.
- **Multi-MCP topology:** Multiple MCP servers sharing one SQLite database would reintroduce cross-process contention. The current design assumes one coordination server.
- **Effort:** 4-6 sessions for MVP (authority tools + SQLite schema + write-through projection). Session breakdown in `plan.md` once approved.
