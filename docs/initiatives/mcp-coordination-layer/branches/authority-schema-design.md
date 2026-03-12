---
status: seed
source-iteration: 1
spawned-from: mcp-coordination-layer
created: 2026-03-11
priority: high
---

# Authority Schema Design

## Context

Iteration 1 established that authority tracking lives in SQLite with fencing tokens, lease TTLs, and version tracking. The schema needs to optimize for the hot path: checking authority on every mutation. This is a distinct domain from the MCP tool API design — it's about the data model underneath.

## Question

What SQLite tables, indexes, and query patterns model authority leases, fencing tokens, and version tracking for optimal performance under concurrent agent access?

## Suggested Vectors

1. **Lease table design** — Columns, types, constraints. How to model scope hierarchically (initiative > file > section). Composite keys vs separate columns. Expiry as computed column or indexed timestamp.
2. **Fencing token generation** — Monotonic counters vs UUIDs vs timestamps. Single-writer makes monotonic counter trivial. How to handle token comparison across scopes.
3. **Version tracking tables** — Per-resource version counters. Optimistic concurrency check as single-statement CAS: `UPDATE ... WHERE version = expected SET version = expected + 1`. Race-free with BEGIN IMMEDIATE.
4. **Index optimization for hot paths** — `check_authority(scope, agent_id)` on every mutation. Covering indexes. Partial indexes for active leases only (`WHERE expires_at > now`).
5. **Reaper design** — Periodic cleanup of expired leases. Batch DELETE with LIMIT to avoid long write locks. Frequency vs batch size tradeoffs.

## Links

- [Kleppmann: Fencing tokens](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
- [SyncGuard fencing implementation](https://kriasoft.com/syncguard/fencing)
- [Azure Blob Lease API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob)
- [SQLite partial indexes](https://sqlite.org/partialindex.html)
- [better-sqlite3 transaction API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
