---
status: pending
initiative: distributed-agent-consistency
created: 2026-03-11
updated: 2026-03-12
type: research-synthesis
risk: additive
targets:
  - docs/initiatives/distributed-agent-consistency/
  - packages/studio-core/
dependencies:
  - section-level-prose-sync
  - sqlite-agentic-state
  - mcp-coordination-layer
spawned-from: null
---

# Sherpa Consistency Layer

## Summary

Sherpa's multi-agent coordination is a **blackboard system with stigmergic signals** — a pattern with 50 years of validation, independently converged upon by MagenticOne's dual-ledger and Jido's architecture-first principle. This proposal defines the consistency layer: POSIX atomic primitives for conflict-free writes, content-hash ETags for conflict detection, version vectors for agent attribution, and JSONL audit logs as a stepping stone toward event sourcing. No external dependencies. No consensus protocols. The filesystem is the coordination substrate.

## State Snapshot

Sherpa currently has:
- Multiple Claude instances operating on shared filesystem state (markdown, YAML, JSON)
- Git worktrees providing branch-level isolation per agent/initiative
- Initiative lifecycle (proposal → review → activity → implementation) providing governance
- `activity.md` files as informal, unstructured event logs
- No concurrency control — two agents can overwrite each other's changes
- No conflict detection — silent data loss on concurrent edits

Adjacent initiatives in flight:
- `section-level-prose-sync` — three-way merge for markdown at section granularity
- `sqlite-agentic-state` — SQLite + CRDTs as backing store
- `mcp-coordination-layer` — MCP server as replication mediator

## Proposed Changes

### Target: `packages/studio-core/consistency/`

New module implementing the consistency layer in five incremental phases:

**Phase 0 — Atomic Writes (foundation)**
- `atomicWrite(path, content)` — write to temp file, `rename()` to final path
- Prevents corruption from interrupted writes
- Zero-cost, zero-risk, immediate value

**Phase 1 — Conflict Detection (ETags)**
- `readWithETag(path)` → `{ content, etag: sha256(content) }`
- `writeIfMatch(path, content, expectedETag)` → success or `ConflictError`
- ETag stored in YAML frontmatter as `_etag: <hash>` for initiative files
- Agents receive clear "409 Conflict" feedback when a file changed under them

**Phase 2 — Agent Attribution (Version Vectors)**
- Version vector in YAML frontmatter: `_versions: { planner: 3, worker-1: 1 }`
- Each agent increments its own counter on write
- Detects concurrent writes (incomparable version vectors = conflict)
- Provides authorship provenance for free

**Phase 3 — Structured Audit Log (JSONL Events)**
- `events.jsonl` per initiative directory — append-only, one JSON object per line
- Event schema: `{ ts, agent, action, target, payload, etag_before, etag_after }`
- POSIX `O_APPEND` guarantees atomic appends under 512 bytes
- Formalizes `activity.md` as structured, machine-readable event stream
- Git-mergeable: append-only files merge trivially (concatenate + sort by timestamp)

**Phase 4 — Coordination Locks**
- `mkdir`-based advisory locks with TTL heartbeat
- `acquireLock(resource)` → creates `.locks/<resource>/` with agent ID + timestamp
- `releaseLock(resource)` → removes lock directory
- Stale lock detection via TTL (5-minute default, configurable)
- Prevents duplicate work assignment, not concurrent reads

### Target: `docs/initiatives/distributed-agent-consistency/`

Research archive with findings from 5 vectors across actor models, optimistic concurrency, consensus protocols, multi-agent framework analysis, and event sourcing. 7 detailed research reports totaling 4000+ lines with 200+ sourced URLs.

## Rationale

**Why blackboard, not actors:** Sherpa's agents are ephemeral (single context window), communicate through shared files, and have a human as the control component. This is textbook blackboard architecture — validated since the 1970s, outperforming other multi-agent patterns by 13-57% in 2025 studies.

**Why not consensus:** Raft/Paxos solve replicated state across unreliable networks. Sherpa has a single filesystem. There's nothing to replicate. Leader election via `mkdir` atomicity is the one useful sub-pattern.

**Why incremental:** Event sourcing is a "one-way door" (Microsoft's own documentation warns against it). Sherpa's event vocabulary is still being discovered. Start with atomic writes and conflict detection; grow toward structured events as patterns emerge.

**Why POSIX primitives:** `mkdir` (EEXIST on collision), `rename` (atomic on same filesystem), `O_APPEND` (atomic under 512 bytes) — all work on Linux/macOS/Windows. Zero external dependencies. Battle-tested for 50 years.

**Industry validation:**
- AutoGen v0.4 adopted actor model for AI agents (Microsoft Research)
- MagenticOne's dual ledger independently converges on Sherpa's proposal/activity model
- Jido's principle: "correct without LLMs before correct with them" — the consistency layer must work with mock agents
- Failure rates of 41-87% in existing frameworks; specification failures (#1 category at 42%) map to what Sherpa's behavioral engineering addresses

## Dependencies

- `section-level-prose-sync` — Phase 1/2 ETags and version vectors need to survive section-level merges
- `sqlite-agentic-state` — Phase 3 JSONL events may eventually migrate to SQLite for query performance
- `mcp-coordination-layer` — Phase 4 coordination locks may be mediated through MCP server

## Review Notes

- **Phases 0-1 are zero-risk additive changes** that can ship independently
- **Phase 2 adds frontmatter fields** — all agents and tools that parse YAML must tolerate `_versions` and `_etag` keys
- **Phase 3 creates new files** (`events.jsonl`) — git merge behavior with append-only files needs testing
- **Phase 4 introduces filesystem side-effects** (lock directories) — cleanup on crash is the main risk
- **The `_` prefix convention** for system fields (`_etag`, `_versions`) prevents collision with user-defined frontmatter
- **Effort:** 4-6 sessions (Phase 0-1: 1 session, Phase 2: 1 session, Phase 3: 1-2 sessions, Phase 4: 1-2 sessions)
