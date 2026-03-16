# SQLite Agentic State — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the SQLite foundation layer (connection factory, schemas, barrel exports) that unblocks mcp-coordination-layer and semantic-knowledge-engine.

**Architecture:** Two SQLite files in `.sherpa/` — `coordination.db` (agent sessions, task claims, ephemeral) and `events.db` (append-only audit trail). `better-sqlite3` driver for synchronous, in-process access. WAL mode with `BEGIN IMMEDIATE` writes. All `better-sqlite3` imports are confined to the `src/db/` directory — this is the driver abstraction boundary. If the driver needs to swap (to `node:sqlite` or `libsql`), only files inside `src/db/` change. All schemas use ULID primary keys and version columns for CAS. Convention-based paths (`.sherpa/*.db`) — no user-facing config extension.

**Tech Stack:** better-sqlite3, @types/better-sqlite3, ulid, drizzle-orm (devDependency for composability test), vitest

**Pre-mortem adjustments:** Driver abstraction boundary, Drizzle composability test (kill criterion #5), convention over config (dropped DbConfig from SherpaUserConfig), coordinate src/db/ ownership with SEK session.

---

## Pre-Implementation Checklist

Before starting Task 1, confirm with the semantic-knowledge-engine session:

- [ ] Agreed module structure for `packages/studio-core/src/db/` — this initiative owns `connection.ts`, `coordination-schema.ts`, `events-schema.ts`, `types.ts`, `index.ts`. SEK adds its own schema files to the same directory.
- [ ] Agreed barrel export contract — `index.ts` re-exports connection utilities and schema applicators. SEK adds its own exports when it lands.
- [ ] Agreed convention: connection factory is shared, schema files are per-initiative, pragmas are set once in `openDb()`.

If the SEK session has already created `src/db/`, adapt to their structure rather than conflicting.

---

### Task 1: Install Dependencies

**CRITICAL (from stress test):** pnpm 10.x blocks native addon postinstall scripts by default. better-sqlite3 WILL NOT WORK without the allowlist config below. This was discovered during stress testing — `pnpm add` succeeds but `require('better-sqlite3')` fails with "Could not locate the bindings file."

**Files:**
- Modify: `package.json` (root — add pnpm.onlyBuiltDependencies)
- Modify: `packages/studio-core/package.json`

**Step 1: Allow better-sqlite3 native build in pnpm**

In root `package.json`, add the `pnpm` section:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["better-sqlite3"]
  }
}
```

This tells pnpm to allow better-sqlite3's postinstall script to compile the native addon.

**Step 2: Add better-sqlite3 and ulid**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core add better-sqlite3 ulid
pnpm --filter @sherpa/studio-core add -D @types/better-sqlite3 drizzle-orm
```

Note: `drizzle-orm` is devDependency only — used in the composability test (Task 6), not in production code.

**Step 3: Verify native addon loaded (kill criterion #1)**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core exec node -e "const db = require('better-sqlite3')(':memory:'); console.log('OK:', db.prepare('SELECT sqlite_version() as v').get().v); db.close()"
```

Expected: `OK: 3.51.3` (or similar >= 3.46.0). If this fails, the native addon didn't compile — check that Step 1's pnpm config is in place and run `pnpm install` again.

**Step 4: Commit**

```bash
git add packages/studio-core/package.json pnpm-lock.yaml
git commit -m "feat(studio-core): add better-sqlite3, ulid, and drizzle-orm (dev) dependencies"
```

---

### Task 2: Connection Factory

The connection factory is the driver abstraction boundary. All `better-sqlite3` imports in the monorepo live in `src/db/`. If the driver swaps to `node:sqlite` or `libsql`, only files in this directory change.

**Files:**
- Create: `packages/studio-core/src/db/types.ts`
- Create: `packages/studio-core/src/db/connection.ts`
- Test: `packages/studio-core/src/__tests__/db-connection.test.ts`

**Step 1: Write the types**

Create `packages/studio-core/src/db/types.ts`:

```typescript
/** Resolved paths for all Sherpa databases. Convention: .sherpa/*.db */
export interface ResolvedDbPaths {
  dir: string
  coordination: string
  events: string
}
```

No `DbConfig` type — paths are convention-based (`.sherpa/`), not user-configurable. If a consumer needs a custom path, they pass it to `resolveDbPaths()` directly.

**Step 2: Write the failing test**

Create `packages/studio-core/src/__tests__/db-connection.test.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll, resolveDbPaths } from "../db/connection"

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-db-test-"))
}

describe("resolveDbPaths", () => {
  it("resolves default paths from projectRoot", () => {
    const paths = resolveDbPaths("/fake/project")
    expect(paths.dir).toBe("/fake/project/.sherpa")
    expect(paths.coordination).toBe("/fake/project/.sherpa/coordination.db")
    expect(paths.events).toBe("/fake/project/.sherpa/events.db")
  })

  it("accepts custom directory", () => {
    const paths = resolveDbPaths("/fake/project", "data")
    expect(paths.dir).toBe("/fake/project/data")
    expect(paths.coordination).toBe("/fake/project/data/coordination.db")
  })
})

describe("openDb", () => {
  let dir: string

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("creates a WAL-mode database", () => {
    dir = tmpDir()
    const dbPath = path.join(dir, "test.db")
    const db = openDb(dbPath)

    const journalMode = db.pragma("journal_mode", { simple: true })
    expect(journalMode).toBe("wal")
  })

  it("sets required pragmas", () => {
    dir = tmpDir()
    const dbPath = path.join(dir, "test.db")
    const db = openDb(dbPath)

    expect(db.pragma("synchronous", { simple: true })).toBe(1) // NORMAL
    expect(db.pragma("busy_timeout", { simple: true })).toBe(5000)
    expect(db.pragma("foreign_keys", { simple: true })).toBe(1)
  })

  it("returns same instance for same path", () => {
    dir = tmpDir()
    const dbPath = path.join(dir, "test.db")
    const db1 = openDb(dbPath)
    const db2 = openDb(dbPath)
    expect(db1).toBe(db2)
  })

  it("creates parent directory if missing", () => {
    dir = tmpDir()
    const nested = path.join(dir, "sub", "deep")
    const dbPath = path.join(nested, "test.db")
    const db = openDb(dbPath)
    expect(db.open).toBe(true)
    expect(fs.existsSync(nested)).toBe(true)
  })
})
```

**Step 3: Run test to verify it fails**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core test -- src/__tests__/db-connection.test.ts
```

Expected: FAIL — module `../db/connection` does not exist

**Step 4: Write connection factory**

Create `packages/studio-core/src/db/connection.ts`:

```typescript
/**
 * SQLite connection factory — the driver abstraction boundary.
 *
 * All better-sqlite3 imports in the monorepo live in src/db/.
 * If the driver needs to swap (to node:sqlite or libsql),
 * only files in this directory change.
 */
import Database from "better-sqlite3"
import fs from "node:fs"
import path from "node:path"
import type { ResolvedDbPaths } from "./types"

const DEFAULT_DIR = ".sherpa"
const DB_FILES = { coordination: "coordination.db", events: "events.db" } as const

/** Resolve absolute DB paths from project root. Convention: .sherpa/*.db */
export function resolveDbPaths(projectRoot: string, dbDir?: string): ResolvedDbPaths {
  const dir = path.join(projectRoot, dbDir ?? DEFAULT_DIR)
  return {
    dir,
    coordination: path.join(dir, DB_FILES.coordination),
    events: path.join(dir, DB_FILES.events),
  }
}

/** Open connections keyed by absolute path — one instance per file. */
const pool = new Map<string, Database.Database>()

/** Open (or return cached) SQLite database with Sherpa's standard pragmas. */
export function openDb(dbPath: string): Database.Database {
  const existing = pool.get(dbPath)
  if (existing) return existing

  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new Database(dbPath)
  db.pragma("journal_mode = WAL")
  db.pragma("synchronous = NORMAL")
  db.pragma("busy_timeout = 5000")
  db.pragma("foreign_keys = ON")

  pool.set(dbPath, db)
  return db
}

/** Close all open connections. Call on shutdown. */
export function closeAll(): void {
  for (const db of pool.values()) {
    try { db.close() } catch { /* already closed */ }
  }
  pool.clear()
}
```

**Step 5: Run test to verify it passes**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core test -- src/__tests__/db-connection.test.ts
```

Expected: PASS (4 tests)

**Step 6: Commit**

```bash
git add packages/studio-core/src/db/connection.ts packages/studio-core/src/db/types.ts packages/studio-core/src/__tests__/db-connection.test.ts
git commit -m "feat(studio-core): SQLite connection factory with WAL mode"
```

---

### Task 3: Coordination DB Schema

**Files:**
- Create: `packages/studio-core/src/db/coordination-schema.ts`
- Test: `packages/studio-core/src/__tests__/db-coordination-schema.test.ts`

**Step 1: Write the failing test**

Create `packages/studio-core/src/__tests__/db-coordination-schema.test.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "../db/connection"
import { applyCoordinationSchema, COORDINATION_SCHEMA_VERSION } from "../db/coordination-schema"

function tmpDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-coord-test-"))
  const dbPath = path.join(dir, "coordination.db")
  return { dir, db: openDb(dbPath) }
}

describe("coordination schema", () => {
  let dir: string

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("creates all tables", () => {
    const tmp = tmpDb(); dir = tmp.dir
    applyCoordinationSchema(tmp.db)

    const tables = tmp.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[]
    const names = tables.map(t => t.name)

    expect(names).toContain("schema_version")
    expect(names).toContain("agent_sessions")
    expect(names).toContain("task_claims")
  })

  it("records schema version", () => {
    const tmp = tmpDb(); dir = tmp.dir
    applyCoordinationSchema(tmp.db)

    const row = tmp.db
      .prepare("SELECT version FROM schema_version ORDER BY applied_at DESC LIMIT 1")
      .get() as { version: number }
    expect(row.version).toBe(COORDINATION_SCHEMA_VERSION)
  })

  it("is idempotent", () => {
    const tmp = tmpDb(); dir = tmp.dir
    applyCoordinationSchema(tmp.db)
    applyCoordinationSchema(tmp.db) // second call should not throw
  })

  it("supports inserting and querying an agent session", () => {
    const tmp = tmpDb(); dir = tmp.dir
    applyCoordinationSchema(tmp.db)

    tmp.db.prepare(`
      INSERT INTO agent_sessions (id, agent_id, role, started_at, heartbeat_at)
      VALUES ('01ABC', 'planner-1', 'planner', datetime('now'), datetime('now'))
    `).run()

    const row = tmp.db.prepare("SELECT * FROM agent_sessions WHERE id = '01ABC'").get() as any
    expect(row.agent_id).toBe("planner-1")
    expect(row.role).toBe("planner")
  })

  it("supports CAS on task_claims via version column", () => {
    const tmp = tmpDb(); dir = tmp.dir
    applyCoordinationSchema(tmp.db)

    // Insert a claim
    tmp.db.prepare(`
      INSERT INTO task_claims (id, task_id, agent_id, status, version, claimed_at)
      VALUES ('01DEF', 'build-ui', 'worker-1', 'claimed', 1, datetime('now'))
    `).run()

    // CAS update with correct version succeeds
    const result = tmp.db.prepare(`
      UPDATE task_claims SET status = 'completed', version = version + 1
      WHERE id = '01DEF' AND version = 1
    `).run()
    expect(result.changes).toBe(1)

    // CAS update with stale version fails
    const stale = tmp.db.prepare(`
      UPDATE task_claims SET status = 'failed', version = version + 1
      WHERE id = '01DEF' AND version = 1
    `).run()
    expect(stale.changes).toBe(0)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core test -- src/__tests__/db-coordination-schema.test.ts
```

Expected: FAIL — module does not exist

**Step 3: Write coordination schema**

Create `packages/studio-core/src/db/coordination-schema.ts`:

```typescript
import type Database from "better-sqlite3"

export const COORDINATION_SCHEMA_VERSION = 1

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version   INTEGER NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS agent_sessions (
    id           TEXT PRIMARY KEY,
    agent_id     TEXT NOT NULL,
    role         TEXT NOT NULL,
    worktree     TEXT,
    started_at   TEXT NOT NULL,
    heartbeat_at TEXT NOT NULL,
    ended_at     TEXT
  );

  CREATE TABLE IF NOT EXISTS task_claims (
    id         TEXT PRIMARY KEY,
    task_id    TEXT NOT NULL,
    agent_id   TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'claimed',
    version    INTEGER NOT NULL DEFAULT 1,
    claimed_at TEXT NOT NULL,
    updated_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_task_claims_task
    ON task_claims (task_id);
  CREATE INDEX IF NOT EXISTS idx_task_claims_agent
    ON task_claims (agent_id, status);
  CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent
    ON agent_sessions (agent_id);
`

/** Apply coordination schema. Idempotent — safe to call on every startup. */
export function applyCoordinationSchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL)

  // Record version if not already present for this version
  const existing = db
    .prepare("SELECT 1 FROM schema_version WHERE version = ?")
    .get(COORDINATION_SCHEMA_VERSION)

  if (!existing) {
    db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(
      COORDINATION_SCHEMA_VERSION
    )
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core test -- src/__tests__/db-coordination-schema.test.ts
```

Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/coordination-schema.ts packages/studio-core/src/__tests__/db-coordination-schema.test.ts
git commit -m "feat(studio-core): coordination.db schema with agent_sessions and task_claims"
```

---

### Task 4: Events DB Schema

**Files:**
- Create: `packages/studio-core/src/db/events-schema.ts`
- Test: `packages/studio-core/src/__tests__/db-events-schema.test.ts`

**Step 1: Write the failing test**

Create `packages/studio-core/src/__tests__/db-events-schema.test.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "../db/connection"
import { applyEventsSchema, appendEvent } from "../db/events-schema"

function tmpDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-events-test-"))
  const dbPath = path.join(dir, "events.db")
  return { dir, db: openDb(dbPath) }
}

describe("events schema", () => {
  let dir: string

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("creates events table", () => {
    const tmp = tmpDb(); dir = tmp.dir
    applyEventsSchema(tmp.db)

    const tables = tmp.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='events'")
      .all()
    expect(tables).toHaveLength(1)
  })

  it("appends an event", () => {
    const tmp = tmpDb(); dir = tmp.dir
    applyEventsSchema(tmp.db)

    appendEvent(tmp.db, {
      agent_id: "worker-1",
      action: "task_claimed",
      target: "build-ui",
      payload: { priority: "high" },
    })

    const rows = tmp.db.prepare("SELECT * FROM events").all() as any[]
    expect(rows).toHaveLength(1)
    expect(rows[0].agent_id).toBe("worker-1")
    expect(rows[0].action).toBe("task_claimed")
    expect(JSON.parse(rows[0].payload)).toEqual({ priority: "high" })
  })

  it("auto-generates id and timestamp", () => {
    const tmp = tmpDb(); dir = tmp.dir
    applyEventsSchema(tmp.db)

    appendEvent(tmp.db, {
      agent_id: "planner",
      action: "initiative_approved",
      target: "sqlite-agentic-state",
    })

    const row = tmp.db.prepare("SELECT * FROM events").get() as any
    expect(row.id).toBeTruthy()
    expect(row.id.length).toBeGreaterThan(20) // ULID length
    expect(row.created_at).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core test -- src/__tests__/db-events-schema.test.ts
```

Expected: FAIL

**Step 3: Write events schema**

Create `packages/studio-core/src/db/events-schema.ts`:

```typescript
import type Database from "better-sqlite3"
import { ulid } from "ulid"

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS events (
    id         TEXT PRIMARY KEY,
    agent_id   TEXT NOT NULL,
    action     TEXT NOT NULL,
    target     TEXT,
    payload    TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_events_action
    ON events (action);
  CREATE INDEX IF NOT EXISTS idx_events_agent
    ON events (agent_id);
  CREATE INDEX IF NOT EXISTS idx_events_created
    ON events (created_at);
`

/** Apply events schema. Idempotent. */
export function applyEventsSchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL)
}

export interface EventInput {
  agent_id: string
  action: string
  target?: string
  payload?: Record<string, unknown>
}

/** Append an event. Generates ULID and timestamp automatically. */
export function appendEvent(db: Database.Database, event: EventInput): string {
  const id = ulid()
  db.prepare(`
    INSERT INTO events (id, agent_id, action, target, payload)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    id,
    event.agent_id,
    event.action,
    event.target ?? null,
    event.payload ? JSON.stringify(event.payload) : null,
  )
  return id
}
```

**Step 4: Run test to verify it passes**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core test -- src/__tests__/db-events-schema.test.ts
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/events-schema.ts packages/studio-core/src/__tests__/db-events-schema.test.ts
git commit -m "feat(studio-core): events.db schema with append-only audit trail"
```

---

### Task 5: Barrel Exports

No config extension — convention-based paths only. The `.sherpa/` directory is the convention; `resolveDbPaths()` accepts an optional override for consumers that need it.

**Files:**
- Create: `packages/studio-core/src/db/index.ts`
- Modify: `packages/studio-core/package.json` (add export)

**Step 1: Create barrel export**

Create `packages/studio-core/src/db/index.ts`:

```typescript
export { openDb, closeAll, resolveDbPaths } from "./connection"
export { applyCoordinationSchema, COORDINATION_SCHEMA_VERSION } from "./coordination-schema"
export { applyEventsSchema, appendEvent } from "./events-schema"
export type { ResolvedDbPaths } from "./types"
export type { EventInput } from "./events-schema"
```

**Step 2: Add package export**

In `packages/studio-core/package.json`, add to exports:

```json
"./db": "./src/db/index.ts"
```

**Step 3: Run typecheck**

```bash
cd /Users/rob/Workbench/sherpa && pnpm check
```

Expected: PASS

**Step 4: Commit**

```bash
git add packages/studio-core/src/db/index.ts packages/studio-core/package.json
git commit -m "feat(studio-core): db barrel exports at @sherpa/studio-core/db"
```

---

### Task 6: Drizzle Composability Test (Kill Criterion #5)

This test validates that mcp-coordination-layer can wrap the `better-sqlite3` Database instance with Drizzle ORM. If this fails, the foundation is architecturally incompatible with its primary consumer.

**Files:**
- Test: `packages/studio-core/src/__tests__/db-drizzle-compat.test.ts`

**Step 1: Write the composability test**

```typescript
import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "../db/connection"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { sql } from "drizzle-orm"

describe("drizzle composability", () => {
  let dir: string

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("wraps openDb() result with Drizzle", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-drizzle-test-"))
    const dbPath = path.join(dir, "test.db")
    const rawDb = openDb(dbPath)

    // Drizzle should accept the better-sqlite3 Database instance
    const db = drizzle(rawDb)
    expect(db).toBeTruthy()
  })

  it("Drizzle queries work on openDb() connection with WAL pragmas", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-drizzle-test-"))
    const dbPath = path.join(dir, "test.db")
    const rawDb = openDb(dbPath)
    const db = drizzle(rawDb)

    // Create a table via raw SQL (as this initiative does)
    rawDb.exec("CREATE TABLE IF NOT EXISTS test_table (id TEXT PRIMARY KEY, value TEXT)")
    rawDb.prepare("INSERT INTO test_table (id, value) VALUES (?, ?)").run("1", "hello")

    // Query via Drizzle
    const rows = db.all(sql`SELECT * FROM test_table WHERE id = '1'`)
    expect(rows).toHaveLength(1)
  })

  it("Drizzle can create tables alongside raw-SQL tables", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-drizzle-test-"))
    const dbPath = path.join(dir, "test.db")
    const rawDb = openDb(dbPath)
    const db = drizzle(rawDb)

    // Raw SQL table (as this initiative creates)
    rawDb.exec("CREATE TABLE IF NOT EXISTS raw_table (id TEXT PRIMARY KEY)")

    // Drizzle-managed table (as mcp-coordination-layer would create)
    db.run(sql`CREATE TABLE IF NOT EXISTS drizzle_table (id TEXT PRIMARY KEY, scope TEXT)`)

    // Both tables coexist
    const tables = rawDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[]
    const names = tables.map(t => t.name)
    expect(names).toContain("raw_table")
    expect(names).toContain("drizzle_table")
  })
})
```

**Step 2: Run test**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core test -- src/__tests__/db-drizzle-compat.test.ts
```

Expected: PASS (3 tests). If this fails, **kill criterion #5 fires** — the foundation is incompatible with its primary consumer. Pivot: adopt Drizzle in the foundation or dissolve into consumers.

**Step 3: Commit**

```bash
git add packages/studio-core/src/__tests__/db-drizzle-compat.test.ts
git commit -m "test(studio-core): validate Drizzle ORM composability with connection factory"
```

---

### Task 7: Integration Test — Full Lifecycle

**Files:**
- Create: `packages/studio-core/src/__tests__/db-integration.test.ts`

**Step 1: Write integration test**

```typescript
import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll, resolveDbPaths } from "../db"
import { applyCoordinationSchema } from "../db"
import { applyEventsSchema, appendEvent } from "../db"

describe("db integration", () => {
  let projectRoot: string

  afterEach(() => {
    closeAll()
    if (projectRoot) fs.rmSync(projectRoot, { recursive: true, force: true })
  })

  it("creates both databases from resolved paths", () => {
    projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-int-test-"))
    const paths = resolveDbPaths(projectRoot)

    const coordDb = openDb(paths.coordination)
    applyCoordinationSchema(coordDb)

    const eventsDb = openDb(paths.events)
    applyEventsSchema(eventsDb)

    // Verify both files exist
    expect(fs.existsSync(paths.coordination)).toBe(true)
    expect(fs.existsSync(paths.events)).toBe(true)

    // Verify they're independent (different connections)
    expect(coordDb).not.toBe(eventsDb)

    // Write to events from coordination context
    appendEvent(eventsDb, {
      agent_id: "test",
      action: "session_started",
      target: "integration-test",
    })

    const events = eventsDb.prepare("SELECT COUNT(*) as count FROM events").get() as any
    expect(events.count).toBe(1)
  })

  it("supports BEGIN IMMEDIATE for write transactions", () => {
    projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-int-test-"))
    const paths = resolveDbPaths(projectRoot)
    const db = openDb(paths.coordination)
    applyCoordinationSchema(db)

    // Simulate a write transaction with BEGIN IMMEDIATE
    const insert = db.transaction(() => {
      db.prepare(`
        INSERT INTO agent_sessions (id, agent_id, role, started_at, heartbeat_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `).run("01XYZ", "worker-1", "engineer")

      return db.prepare("SELECT * FROM agent_sessions WHERE id = ?").get("01XYZ")
    })

    const row = insert.immediate() as any
    expect(row.agent_id).toBe("worker-1")
  })
})
```

**Step 2: Run all tests**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-core test
```

Expected: ALL PASS (including Tasks 2-6 tests)

**Step 3: Run full monorepo typecheck**

```bash
cd /Users/rob/Workbench/sherpa && pnpm check
```

Expected: PASS

**Step 4: Commit**

```bash
git add packages/studio-core/src/__tests__/db-integration.test.ts
git commit -m "test(studio-core): db integration test — full lifecycle with BEGIN IMMEDIATE"
```

---

## After Task 7: Leading Indicator Checklist

Before proceeding, verify all leading indicators from the stake:

- [ ] 1. better-sqlite3 compiled cleanly (Task 1, Step 2)
- [ ] 2. WAL mode activates (Task 2 test)
- [ ] 3. SQLite version >= 3.46.0 (Task 1, Step 3)
- [ ] 4. CAS pattern works (Task 3 test)
- [ ] 5. Connection pooling works (Task 2 test)
- [ ] 6. Drizzle composes with connection factory (Task 6)
- [ ] 7. SEK session confirmed shared module structure (pre-implementation checklist)

All pass → generate MCP coordination layer pickup prompt, then proceed to session 2.

Any fail → evaluate against kill criteria in `stake.md`.

---

## After Task 7: Generate MCP Coordination Layer Pickup Prompt

At this point, the DB foundation is complete and mcp-coordination-layer is unblocked. Generate a pickup prompt for a parallel session to begin Phase 1 of that initiative.

---

## Session 2 (future): Migrate Existing MCP Tools + Write-Through Sync

Decided by shape: **migrate the existing 7 filesystem-based task tools to SQLite-backed. No new tools.** Same tool names, same parameter schemas, same output shapes. `scanTasks()` and `findAndUpdateTask()` become SQLite queries.

Scope (plan in detail after session 1 leading indicators pass):
- Migrate 7 existing MCP tools in `studio-mcp/src/server.ts` from filesystem to coordination.db
- One-way write-through: SQLite mutations project back to markdown task files for human governance
- Wire MCP server to resolve DB paths from convention (`.sherpa/`)
- Kill criterion: if migration breaks dispatch scripts, stop
