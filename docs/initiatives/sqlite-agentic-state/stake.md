---
staked: 2026-03-16
thesis: "Lean foundation with better-sqlite3 and raw SQL — ship the DB module in 2 sessions, unblock mcp-coordination-layer immediately"
sessions-at-risk: 2
kill-criteria-count: 6
---

# Stake: SQLite Agentic State

## Thesis

**Thesis A — Lean Foundation:** We believe building a minimal SQLite module with better-sqlite3, raw SQL schemas, and a connection factory will unblock mcp-coordination-layer and semantic-knowledge-engine within 2 sessions, because the research (5 vectors, 100+ sources) has converged on WAL + optimistic locking as the proven pattern for 2-6 concurrent agents, and the foundation layer requires only ~100 lines of schema SQL across two database files.

Evidence strength: **Sourced.** Overstory validates the exact architecture (multi-agent AI + SQLite WAL, ~1-5ms queries). SkyPilot benchmarks 1000+ concurrent processes on WAL. Fossil SCM validates the files-are-canonical pattern. better-sqlite3 has 5M+ weekly downloads and known compatibility with the pnpm/monorepo toolchain.

## Rejected Alternatives

### Thesis B — Drizzle ORM Foundation

We believe building the foundation with Drizzle ORM would provide type-safe schemas and a migration framework that downstream initiatives inherit.

**Rejected because:** The coordination schema is ~30 lines of SQL across 3 tables. Drizzle adds `drizzle-orm` + `drizzle-kit` + schema definition files + migration configuration for a schema that fits on one screen. The mcp-coordination-layer proposal states "Drizzle ORM for type-safe schema" — but that initiative can layer Drizzle on top of the `better-sqlite3` Database instance this foundation provides. Our connection factory returns the raw driver; ORM wrapping is additive, not foundational.

**What we give up:** Type-safe query building from day one. If schemas grow beyond ~10 tables, raw SQL becomes a maintenance burden. Acceptable trade-off — we're building 3 tables, not 10.

### Thesis C — Dissolve Into Consumers

Let semantic-knowledge-engine (parallel session) and mcp-coordination-layer each create their own DB infrastructure. Archive sqlite-agentic-state.

**Rejected because:** Two initiatives independently targeting `packages/studio-core/src/db/` creates pattern divergence risk. The coordination.db and events.db databases need an owner — they're shared infrastructure, not feature-specific. SEK owns knowledge.db; mcp-coordination-layer owns authority semantics; but the connection factory, WAL pragma setup, and event audit trail are cross-cutting concerns that belong in a foundation module. Additionally, the user explicitly chose this build order to unblock mcp-coordination-layer.

**What we give up:** Zero overhead from a foundation initiative. If the coordination.db schema turns out to be trivially small (just authority_leases), a standalone foundation layer may feel like over-abstraction.

## Leading Indicators

Checkable within session 1:

1. **better-sqlite3 compiles cleanly** in the pnpm monorepo on macOS ARM (Node 24)
2. **WAL mode activates** — `PRAGMA journal_mode` returns `"wal"` after connection setup
3. **SQLite version >= 3.46.0** — bundled with better-sqlite3, sufficient for WAL safety (the 3.52.0 WAL-reset fix is for a rare edge case; 3.46+ is the practical minimum)
4. **CAS pattern works** — `UPDATE ... WHERE version = ? RETURNING *` returns 0 rows on stale version, confirming optimistic locking
5. **Connection pooling** — same path returns same instance, `closeAll()` cleans up
6. **Drizzle composes with connection factory** — wrapping the `better-sqlite3` Database instance with Drizzle and creating a table succeeds *(added from pre-mortem)*
7. **SEK session confirms shared module structure** — agreed barrel export contract for `src/db/` *(added from pre-mortem)*

## Kill Criteria

1. **better-sqlite3 native compilation fails** on macOS ARM in the monorepo, and the failure is not resolvable with standard `node-gyp` configuration. Pivot: use `node:sqlite` (experimental on Node 24) or libsql.
2. **Bundled SQLite version has known WAL corruption bugs** — if the version shipped with better-sqlite3 is < 3.46.0 or has documented WAL issues. Pivot: pin better-sqlite3 to a version with patched SQLite.
3. **Connection factory doesn't compose with Drizzle** — when mcp-coordination-layer attempts to wrap the `Database` instance with Drizzle, it fails or requires architecture changes. This would mean our foundation actively blocks its primary consumer. Pivot: refactor to export Drizzle-compatible interface.
4. **Existing MCP task tools can't migrate** — if the 7 existing filesystem-based task tools in studio-mcp can't be incrementally migrated to SQLite-backed (because the schema doesn't support the existing frontmatter fields or the tool signatures diverge too much). Pivot: redesign coordination.db schema to mirror existing task frontmatter.
5. **Drizzle can't wrap the connection factory** — if mcp-coordination-layer's chosen ORM can't compose with a raw `better-sqlite3` Database instance (tested in session 1 as a leading indicator), the foundation is architecturally incompatible with its primary consumer. Pivot: adopt Drizzle in the foundation or dissolve into consumers. *(Added from pre-mortem)*
6. **Single-session usage persists for 4+ weeks** — if coordination.db only ever has 1 active agent_session row after shipping, the coordination layer is premature. Pivot: archive coordination.db scope, focus on events.db audit trail only. *(Added from pre-mortem)*

## Review Trigger

- **After session 1:** All leading indicators pass (including Drizzle composability test) → proceed to session 2 (MCP tools)
- **After session 2:** mcp-coordination-layer has started using the DB module → foundation is validated
- **Event-based:** If semantic-knowledge-engine ships its DB module first, compare patterns and reconcile within 1 session
- **Watch:** Claude Code changelog for "agent state" or "coordination" features (context failure mode — platform convergence)
- **Watch:** studio-desktop-app decisions about native addon policy
