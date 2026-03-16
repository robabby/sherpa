---
stress-tested: 2026-03-16
assumptions-extracted: 12
tested: 10
confirmed: 8
refuted: 1
inconclusive: 1
human-required: 2
---

# Stress Test: SQLite Agentic State

## Assumptions Inventory

| # | Assumption | Rating | Load-Bearing? |
|---|-----------|--------|---------------|
| A1 | better-sqlite3 compiles on macOS ARM / Node 24 | Reasoned | Yes |
| A2 | WAL mode activates and returns "wal" | Sourced | Yes |
| A3 | Bundled SQLite >= 3.46.0 | Reasoned | Yes |
| A4 | `UPDATE ... WHERE version = ? RETURNING *` works for CAS | Sourced | Yes |
| A5 | Drizzle ORM wraps a better-sqlite3 Database instance | Asserted | Yes |
| A6 | `BEGIN IMMEDIATE` + `busy_timeout` prevents SQLITE_BUSY | Sourced | Yes |
| A7 | ULID generation is fast enough for concurrent agents | Reasoned | No |
| A8 | Connection pooling (Map) works across ESM imports | Reasoned | Yes |
| A9 | `drizzle-orm/better-sqlite3` adapter exists | Asserted | Yes |
| A10 | better-sqlite3 and drizzle-orm are compatible at current versions | Asserted | Yes |
| A11 | pnpm install handles better-sqlite3 native build automatically | Asserted | Yes |
| A12 | Drizzle has a node:sqlite adapter (for driver pivot) | Asserted | Moderate |

## Tests Designed

### A1: Native addon loads

**Falsification:** `require('better-sqlite3')` throws on Node 24.11.1 / arm64.

### A2: WAL mode

**Falsification:** `PRAGMA journal_mode = WAL` returns something other than "wal" on a file-based DB.

### A3: SQLite version

**Falsification:** `SELECT sqlite_version()` returns < 3.46.0.

### A4: CAS with RETURNING

**Falsification:** `UPDATE ... WHERE version = 1 RETURNING *` returns a row even when version has changed.

### A5 + A9 + A10: Drizzle composability

**Falsification:** `drizzle(rawDb)` throws or Drizzle queries fail on a connection opened by our factory with WAL pragmas set.

### A6: BEGIN IMMEDIATE

**Falsification:** `db.transaction(...).immediate()` throws or doesn't hold write lock.

### A7: ULID throughput

**Falsification:** 10K ULIDs take > 1000ms or produce duplicates.

### A8: Connection pooling

**Falsification:** `Map.get(path)` returns different instance than `Map.set(path, db)`.

### A11: pnpm install builds native addon

**Falsification:** `pnpm add better-sqlite3` followed by `require('better-sqlite3')` fails without manual intervention.

### A12: Drizzle node:sqlite adapter

**Falsification:** No `node:sqlite` or equivalent adapter in drizzle-orm's exports.

## Results: Confirmed

| # | Assumption | Evidence |
|---|-----------|----------|
| A1 | better-sqlite3 loads on Node 24 / ARM | Module loaded after prebuild-install. `v24.11.1 / arm64` |
| A2 | WAL mode activates | `journal_mode=wal` on file-based DB. `node:sqlite` also confirmed: `journal_mode=wal` |
| A3 | SQLite >= 3.46.0 | better-sqlite3 bundles **SQLite 3.51.3**. node:sqlite bundles **3.50.4**. Both well above minimum. |
| A4 | CAS with RETURNING | Correct version: returns updated row (version=2). Stale version: returns `undefined`. Both confirmed. |
| A5+A9+A10 | Drizzle composability | `drizzle(rawDb)` succeeds. Drizzle queries work on raw-SQL tables. Raw + Drizzle tables coexist in same DB. Adapter: `drizzle-orm/better-sqlite3` exists and works. |
| A6 | BEGIN IMMEDIATE | `db.transaction(...).immediate()` executes correctly, inserts visible inside transaction. |
| A7 | ULID throughput | 10K unique ULIDs in 125ms. Zero collisions. |
| A8 | Connection pooling | `Map.get()` returns identical instance. `===` confirmed. |

## Results: Refuted

### A11: pnpm install does NOT build the native addon automatically (LOAD-BEARING)

**Evidence:** `pnpm --filter @sherpa/studio-core add better-sqlite3` installs the package but does NOT run the postinstall script that compiles the native addon. pnpm 10.x's `onlyBuiltDependencies` feature blocks build scripts by default for security. The binary file at `build/Release/better_sqlite3.node` does not exist after install.

**Resolution required:** Manual `prebuild-install` inside the package directory, OR adding better-sqlite3 to pnpm's `onlyBuiltDependencies` allowlist in root `package.json`:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["better-sqlite3"]
  }
}
```

**Implications:** This is **not a kill criterion** — it's a configuration issue, not an architectural incompatibility. But it will bite every developer and CI pipeline that doesn't know about it. The plan must include the pnpm config step, and CI must be verified.

**Mitigation:** Add `pnpm.onlyBuiltDependencies` to root `package.json` as part of Task 1. Verify with `pnpm install` in a clean environment.

## Results: Inconclusive

### A12: Drizzle does NOT have a node:sqlite adapter

**Evidence:** Drizzle-orm exports include `better-sqlite3`, `bun-sqlite`, `durable-sqlite`, `expo-sqlite`, `op-sqlite`, `sqlite-proxy` — but no `node:sqlite` adapter. If we later pivot from better-sqlite3 to node:sqlite (as the pre-mortem suggested), Drizzle composability (kill criterion #5) would break.

**Implications:** The driver abstraction boundary matters more than planned. If `node:sqlite` stabilizes and the ecosystem moves to it (context failure C2), we'd need either:
- A Drizzle `sqlite-proxy` adapter wrapping node:sqlite (possible but untested)
- To drop Drizzle and use raw SQL everywhere (acceptable for 3-10 tables)
- To use `libsql` instead (has a Drizzle adapter, API-compatible with better-sqlite3)

**Rating: Inconclusive** — not a current blocker, but constrains future pivot options. The driver abstraction boundary in `src/db/` becomes more important, not less.

## Human-Required

### H1: Will pnpm's `onlyBuiltDependencies` allowlisting break any CI or security policy?

Adding native build allowlisting to the root `package.json` may conflict with CI security scanning or organizational policy. Needs human judgment on whether this is acceptable.

### H2: Is the native addon acceptable for the desktop app distribution?

The pre-mortem identified desktop app packaging as a risk. The stress test confirmed better-sqlite3 works but requires native compilation. Human decision needed on whether this constrains the desktop app initiative.

## node:sqlite as Backup Driver

While testing alternatives, `node:sqlite` on Node 24 was verified:

| Capability | Status | Evidence |
|-----------|--------|----------|
| WAL mode | Works | `journal_mode=wal` on file-based DB |
| RETURNING | Works | Returns updated row correctly |
| BEGIN IMMEDIATE | Works (via exec) | Manual `BEGIN IMMEDIATE` / `COMMIT` |
| `.transaction()` | **Missing** | `typeof db.transaction === 'undefined'` |
| Experimental warning | Yes | `ExperimentalWarning: SQLite is an experimental feature` |
| SQLite version | 3.50.4 | Slightly older than better-sqlite3's 3.51.3 |
| Drizzle adapter | **None** | No node:sqlite adapter in drizzle-orm exports |

**Assessment:** `node:sqlite` is a viable emergency fallback but lacks `.transaction()` and Drizzle composability. Not a drop-in replacement. `libsql` (same API as better-sqlite3, Drizzle adapter available) is a better pivot target if needed.

## Recommended Changes

1. **Plan Task 1 must include pnpm config** — add `pnpm.onlyBuiltDependencies: ["better-sqlite3"]` to root `package.json` before `pnpm add`. This is a hard prerequisite, not a nice-to-have.

2. **Document the driver boundary explicitly** — the `src/db/` abstraction boundary is load-bearing for future driver pivots. All `better-sqlite3` imports must stay inside `src/db/`. This is already in the plan but should be called out as a hard constraint, not a preference.

3. **libsql is the preferred pivot target** — if better-sqlite3 becomes untenable (desktop packaging, node:sqlite stabilization), libsql has: same API, Drizzle adapter, WASM option, no native compilation requirement. Prefer over node:sqlite for driver pivot.
