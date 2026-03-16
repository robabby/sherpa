---
premortem: 2026-03-16
failure-modes-identified: 7
mitigations-added: 5
kill-criteria-added: 2
---

# Pre-mortem: SQLite Agentic State

## Frame

> It's June 2026. The sqlite-agentic-state initiative consumed 2-3 sessions and delivered nothing usable. The connection factory exists but no downstream consumer uses it as designed. The coordination.db has one active session at any given time. What happened?

## Technical Failures

### T1: Drizzle vs Raw SQL Migration Clash (Fatal)

coordination.db has raw SQL tables managed by a `schema_version` table. mcp-coordination-layer adds authority_leases via Drizzle, which uses `__drizzle_migrations`. Drizzle's `introspect` sees raw-SQL tables as "unmanaged" and a `drizzle-kit push` during development wipes agent_sessions. Two incompatible migration systems in one database file.

### T2: Two Initiatives Collide in `packages/studio-core/src/db/` (Significant)

Both this initiative and semantic-knowledge-engine target the same new directory. Both create connection.ts with different pragma assumptions. Merge conflict in index.ts gets resolved by "accept both" without understanding the implications. Result: knowledge.db connections inherit coordination.db pragmas or vice versa.

### T3: Native Addon ABI Breaks (Significant)

better-sqlite3 prebuilt binaries lag behind Node 24.x point releases. CI fails with cryptic native module errors after a routine Node version bump. Locally it works because stale node_modules have cached prebuilds.

### T4: Event Loop Blocking Under Load (Significant)

better-sqlite3 is synchronous. events.db grows linearly (append-only). Large sequential reads block the event loop for 50-200ms, making the MCP Streamable HTTP transport unresponsive. Agents time out and retry, amplifying the problem.

### T5: WAL Checkpoint Starvation (Significant)

Long-lived MCP SSE connections keep read transactions active. WAL checkpointer can't acquire exclusive lock. WAL file grows without bound. On budget VPS, disk fills first.

## Scope Failures

### S1: Foundation Has No Consumer That Wants It As-Is (Fatal)

mcp-coordination-layer chose Drizzle (wraps around the raw connection). semantic-knowledge-engine builds its own separate database. Neither consumer uses the "foundation" as a foundation. One routes around it via ORM, the other bypasses it entirely. The foundation is vestigial from day one.

### S2: Database for a grep-Scale Workload (Significant)

149 initiative directories, 479 markdown files. `grep -r "status: pending" docs/initiatives/` returns in 12ms. The SQLite query returns in 8ms. Nobody can tell the difference. The real value is in the semantic-knowledge-engine (embeddings, summaries, clustering), not in replacing grep with SQL.

### S3: MCP Tool Migration Is a Tarpit (Significant)

7 existing filesystem-based tools are load-bearing. 9 new SQLite-backed tools can't replace them without dual-writing to both SQLite and markdown. The old tools stay. The new tools get used by zero agents.

### S4: Native Dependency Breaks Framework Portability (Significant)

better-sqlite3 requires node-gyp or prebuilt binaries. The desktop app vision ("thumb drive test — install in 60 seconds") and WavePoint's Vercel deployment both choke on native addon compilation.

### S5: Premature Config Extension (Minor)

`DbConfig` in `SherpaUserConfig` creates a configuration surface nobody needs. A convention (`.sherpa/coordination.db`, always WAL) would serve the same purpose without the API surface commitment.

## Context Failures

### C1: Claude Code Ships Built-in Coordination (Fatal, Medium Likelihood)

Claude Code 2.x introduces agent session state, task claiming, and inter-agent messaging as first-class features. The coordination.db schema becomes redundant with the platform's internal state.

### C2: node:sqlite Goes Stable + Desktop App Kills Native Addons (Significant, High Likelihood)

Node 25.7 ships stable `node:sqlite`. Simultaneously, the studio-desktop-app initiative establishes "no native addons" as an architectural constraint. better-sqlite3 becomes the wrong driver from both directions.

### C3: Multi-Agent Coordination is Premature (Significant, High Likelihood)

Sherpa remains single-operator, 1-2 concurrent sessions for 12+ months. The coordination complexity (WAL tuning, connection pooling, CAS, two database files) is maintenance overhead for capabilities nobody exercises.

## Ranked Failure Modes

| Rank | Mode | L x S | Likelihood | Severity | Detection Signal |
|------|------|-------|------------|----------|-----------------|
| 1 | **S1: Foundation without consumers** | High | High | Fatal | mcp-coordination-layer PR imports better-sqlite3 directly, bypassing factory |
| 2 | **T1: Drizzle vs raw SQL clash** | High | High | Fatal | "Wait, are we using Drizzle or raw SQL for coordination.db?" |
| 3 | **C2: Native addon becomes untenable** | High | High | Significant | Desktop initiative lists "no native addons" as constraint |
| 4 | **S2: Database for grep-scale workload** | High | High | Significant | coordination.db has exactly 1 active session for months |
| 5 | **C1: Claude Code ships coordination** | Medium | Medium | Fatal | "agent state" or "session coordination" in Claude Code changelog |
| 6 | **S3: MCP tool migration tarpit** | Medium | High | Significant | Old filesystem tools can't be deprecated |
| 7 | **T2: src/db/ directory collision** | Medium | Medium | Significant | Merge conflict in db/index.ts |

## Mitigations

### M1: Abstract the driver (addresses #3, T3, T4)

The connection factory should return a thin interface, not a raw `better-sqlite3.Database`. Define:

```typescript
interface SherpaDb {
  exec(sql: string): void
  prepare(sql: string): SherpaStatement
  transaction<T>(fn: () => T): { immediate: () => T }
  close(): void
}
```

If the driver can be swapped in one file, native addon risk becomes a version bump, not an architectural rewrite. This also makes the foundation composable with Drizzle (which only needs the underlying connection handle).

### M2: Validate Drizzle composability in session 1 (addresses #1, #2)

Add a test that wraps the `better-sqlite3` Database instance with Drizzle and creates a table. If this works, the foundation composes. If it doesn't, we know immediately. Don't defer this discovery to mcp-coordination-layer.

### M3: Drop DbConfig from user-facing config (addresses S5)

Use convention-based paths (`.sherpa/coordination.db`). The config system already has `paths` — add `dbDir` there if needed. Don't create a new top-level config section for something nobody will configure.

### M4: Coordinate src/db/ ownership with SEK explicitly (addresses #7, T2)

Before starting implementation: agree on module structure with the SEK session. The connection factory is shared; schema files are per-initiative. Define the barrel export contract now, not at merge time.

### M5: Design MCP tool migration before building new tools (addresses #6)

Before session 2, decide: are the 9 new tools **replacements** (migrate existing tools to SQLite-backed) or **additions** (new capabilities alongside existing tools)? If replacements, plan the dual-write transition. If additions, clarify what they do that the existing tools don't.

## Updates to Stake

### New Kill Criteria (added to existing 4)

5. **Drizzle can't wrap the connection factory** — If mcp-coordination-layer's chosen ORM can't compose with a raw `better-sqlite3` Database instance (tested in session 1), the foundation is architecturally incompatible with its primary consumer. Pivot: adopt Drizzle in the foundation or dissolve into consumers.

6. **Single-session usage persists for 4+ weeks after shipping** — If coordination.db only ever has 1 active agent_session row, the coordination layer is premature. Pivot: archive coordination.db scope, focus on events.db audit trail only.

### Updated Leading Indicators

- Add: Drizzle wraps the connection successfully in a test (session 1)
- Add: SEK session confirms shared module structure for `src/db/`
- Watch: Claude Code changelog for "agent state" or "coordination" features
- Watch: studio-desktop-app decisions about native addon policy

## Human-Identified Risks

*This section intentionally left empty. Fill in during review with team-dynamic, political, or organizational risks that the pre-mortem's adversarial analysis cannot see.*
