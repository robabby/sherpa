# MCP Coordination Layer — Phase 1: Authority System

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add authority leases with fencing tokens to the MCP server, enabling safe multi-agent coordination via acquire/release/renew tools and a dashboard bootstrap.

**Architecture:** `AuthorityManager` operations module wraps raw SQL over the foundation's `openDb()` connection to `coordination.db`. DB is created once by the HTTP server and shared across all MCP sessions. Three authority tools + one resource + one dashboard tool are registered on each `McpServer` instance. A background reaper cleans expired leases every 60 seconds.

**Tech Stack:** Drizzle ORM table definitions (`drizzle-orm/sqlite-core`) for type reference, raw SQL operations via `better-sqlite3` (consistent with foundation), `@sherpa/studio-core/db` (connection factory), vitest, `BEGIN IMMEDIATE` transactions for all writes.

**Initiative:** `mcp-coordination-layer` — Phase 1. Phase 0 (Streamable HTTP transport) shipped 2026-03-13.

**Kill criteria (from stake.md):**
- Hook latency > 100ms → stop
- SQLite contention > 50ms p99 → stop
- Transport can't support multiple concurrent clients → stop (already validated)

---

## Task 1: Add dependencies to studio-mcp

**Files:**
- Modify: `packages/studio-mcp/package.json`

**Step 1: Add workspace dependency on studio-core and drizzle-orm**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-mcp add @sherpa/studio-core@workspace:* drizzle-orm
```

**Step 2: Verify imports resolve**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-mcp exec tsc --noEmit
```

Expected: PASS (no new source files yet, just dependency resolution).

**Step 3: Commit**

```bash
git add packages/studio-mcp/package.json pnpm-lock.yaml
git commit -m "chore(studio-mcp): add studio-core and drizzle-orm dependencies"
```

---

## Task 2: Authority schema

**Files:**
- Create: `packages/studio-mcp/src/authority/schema.ts`
- Create: `packages/studio-mcp/src/__tests__/authority-schema.test.ts`

**Step 1: Write failing test**

Create `packages/studio-mcp/src/__tests__/authority-schema.test.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "@sherpa/studio-core/db"
import { applyAuthoritySchema } from "../authority/schema"

describe("authority schema", () => {
  let dir: string

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("creates authority_leases table", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-schema-"))
    const db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[]
    const names = tables.map((t) => t.name)

    expect(names).toContain("authority_leases")
    expect(names).toContain("state_versions")
    expect(names).toContain("fence_token_seq")
  })

  it("is idempotent", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-schema-"))
    const db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)
    applyAuthoritySchema(db) // second call should not throw

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[]
    expect(tables.map((t) => t.name)).toContain("authority_leases")
  })

  it("initializes fence_token_seq with 0", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-schema-"))
    const db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)

    const row = db.prepare("SELECT current_value FROM fence_token_seq").get() as any
    expect(row.current_value).toBe(0)
  })

  it("has covering index on authority_leases (scope, expires_at)", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-schema-"))
    const db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)

    const indexes = db
      .prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='authority_leases'")
      .all() as { name: string }[]
    expect(indexes.map((i) => i.name)).toContain("idx_leases_scope_expires")
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: FAIL — `../authority/schema` module doesn't exist.

**Step 3: Implement schema**

Create `packages/studio-mcp/src/authority/schema.ts`:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import type Database from "better-sqlite3"

// ---------------------------------------------------------------------------
// Drizzle table definitions (type reference — queries use raw SQL)
// ---------------------------------------------------------------------------

export const authorityLeases = sqliteTable("authority_leases", {
  scope: text("scope").primaryKey(),
  agentId: text("agent_id").notNull(),
  taskId: text("task_id"),
  fenceToken: integer("fence_token").notNull(),
  mode: text("mode", { enum: ["exclusive", "shared"] }).notNull().default("exclusive"),
  ttlSeconds: integer("ttl_seconds").notNull().default(1800),
  acquiredAt: text("acquired_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  renewedAt: text("renewed_at"),
})

export const stateVersions = sqliteTable("state_versions", {
  resourceUri: text("resource_uri").primaryKey(),
  version: integer("version").notNull().default(1),
  contentHash: text("content_hash"),
  updatedBy: text("updated_by"),
  updatedAt: text("updated_at").notNull(),
})

export const fenceTokenSeq = sqliteTable("fence_token_seq", {
  currentValue: integer("current_value").notNull().default(0),
})

// ---------------------------------------------------------------------------
// Schema DDL — raw SQL for CREATE TABLE
// ---------------------------------------------------------------------------

const AUTHORITY_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS authority_leases (
    scope        TEXT PRIMARY KEY,
    agent_id     TEXT NOT NULL,
    task_id      TEXT,
    fence_token  INTEGER NOT NULL,
    mode         TEXT NOT NULL DEFAULT 'exclusive',
    ttl_seconds  INTEGER NOT NULL DEFAULT 1800,
    acquired_at  TEXT NOT NULL,
    expires_at   TEXT NOT NULL,
    renewed_at   TEXT
  );

  CREATE TABLE IF NOT EXISTS state_versions (
    resource_uri TEXT PRIMARY KEY,
    version      INTEGER NOT NULL DEFAULT 1,
    content_hash TEXT,
    updated_by   TEXT,
    updated_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS fence_token_seq (
    current_value INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_leases_scope_expires
    ON authority_leases (scope, expires_at);

  CREATE INDEX IF NOT EXISTS idx_leases_agent
    ON authority_leases (agent_id);
`

/** Apply authority schema. Idempotent — safe to call on every startup. */
export function applyAuthoritySchema(db: Database.Database): void {
  db.exec(AUTHORITY_SCHEMA_SQL)

  // Seed fence_token_seq if empty
  const existing = db.prepare("SELECT COUNT(*) as count FROM fence_token_seq").get() as any
  if (existing.count === 0) {
    db.prepare("INSERT INTO fence_token_seq (current_value) VALUES (0)").run()
  }
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/studio-mcp/src/authority/schema.ts packages/studio-mcp/src/__tests__/authority-schema.test.ts
git commit -m "feat(studio-mcp): authority schema — leases, versions, fence token sequence"
```

---

## Task 3: Authority acquire operation

**Files:**
- Create: `packages/studio-mcp/src/authority/operations.ts`
- Create: `packages/studio-mcp/src/__tests__/authority-acquire.test.ts`

**Step 1: Write failing tests**

Create `packages/studio-mcp/src/__tests__/authority-acquire.test.ts`:

```typescript
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "@sherpa/studio-core/db"
import { applyAuthoritySchema } from "../authority/schema"
import { acquireAuthority } from "../authority/operations"
import type Database from "better-sqlite3"

describe("acquireAuthority", () => {
  let dir: string
  let db: Database.Database

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-acquire-"))
    db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)
  })

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("acquires an empty scope with fence token 1", () => {
    const result = acquireAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
    })

    expect(result.acquired).toBe(true)
    expect(result.fenceToken).toBe(1)
    expect(result.expiresAt).toBeTruthy()
  })

  it("denies acquisition of a held scope", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })

    const result = acquireAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-2",
    })

    expect(result.acquired).toBe(false)
    expect(result.heldBy).toBe("agent-1")
  })

  it("acquires an expired scope with incremented fence token", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })
    // Force expiry by backdating expires_at
    db.prepare(
      "UPDATE authority_leases SET expires_at = datetime('now', '-1 minute') WHERE scope = ?"
    ).run("file:src/foo.ts")

    const result = acquireAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-2",
    })

    expect(result.acquired).toBe(true)
    expect(result.fenceToken).toBe(2)
  })

  it("supports atomic transfer via transfer_from", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })

    const result = acquireAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-2",
      transferFrom: "agent-1",
    })

    expect(result.acquired).toBe(true)
    expect(result.fenceToken).toBe(2)
  })

  it("denies transfer when transfer_from doesn't match holder", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })

    const result = acquireAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-3",
      transferFrom: "agent-2",
    })

    expect(result.acquired).toBe(false)
    expect(result.heldBy).toBe("agent-1")
  })

  it("fence tokens are globally monotonic", () => {
    const r1 = acquireAuthority(db, { scope: "file:a.ts", agentId: "agent-1" })
    const r2 = acquireAuthority(db, { scope: "file:b.ts", agentId: "agent-2" })
    const r3 = acquireAuthority(db, { scope: "file:c.ts", agentId: "agent-3" })

    expect(r1.fenceToken).toBe(1)
    expect(r2.fenceToken).toBe(2)
    expect(r3.fenceToken).toBe(3)
  })

  it("uses custom TTL when provided", () => {
    const result = acquireAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
      ttlSeconds: 600,
    })

    expect(result.acquired).toBe(true)
    const lease = db.prepare("SELECT ttl_seconds FROM authority_leases WHERE scope = ?")
      .get("file:src/foo.ts") as any
    expect(lease.ttl_seconds).toBe(600)
  })

  it("associates task_id with lease when provided", () => {
    acquireAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
      taskId: "task-abc",
    })

    const lease = db.prepare("SELECT task_id FROM authority_leases WHERE scope = ?")
      .get("file:src/foo.ts") as any
    expect(lease.task_id).toBe("task-abc")
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: FAIL — `../authority/operations` doesn't exist.

**Step 3: Implement operations module**

Create `packages/studio-mcp/src/authority/operations.ts`:

```typescript
import type Database from "better-sqlite3"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AcquireInput {
  scope: string
  agentId: string
  taskId?: string
  ttlSeconds?: number
  transferFrom?: string
  mode?: "exclusive" | "shared"
}

export interface AcquireResult {
  acquired: boolean
  fenceToken?: number
  expiresAt?: string
  heldBy?: string
  heldUntil?: string
}

export interface ReleaseInput {
  scope: string
  agentId: string
  fenceToken: number
}

export interface ReleaseResult {
  released: boolean
  reason?: string
}

export interface RenewInput {
  scope: string
  agentId: string
  fenceToken: number
  ttlSeconds?: number
}

export interface RenewResult {
  renewed: boolean
  expiresAt?: string
  reason?: string
}

export interface LeaseInfo {
  scope: string
  agentId: string
  taskId: string | null
  fenceToken: number
  mode: string
  ttlSeconds: number
  acquiredAt: string
  expiresAt: string
  renewedAt: string | null
}

// ---------------------------------------------------------------------------
// Default TTLs
// ---------------------------------------------------------------------------

const DEFAULT_TTL_INTERACTIVE = 1800 // 30 minutes

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/** Acquire authority over a scope. Uses BEGIN IMMEDIATE for write safety. */
export function acquireAuthority(db: Database.Database, input: AcquireInput): AcquireResult {
  const ttl = input.ttlSeconds ?? DEFAULT_TTL_INTERACTIVE
  const mode = input.mode ?? "exclusive"

  return db.transaction(() => {
    // Check for existing unexpired lease
    const existing = db.prepare(`
      SELECT agent_id, fence_token, expires_at
      FROM authority_leases
      WHERE scope = ? AND expires_at > datetime('now')
    `).get(input.scope) as { agent_id: string; fence_token: number; expires_at: string } | undefined

    if (existing) {
      // Transfer: current holder must match transferFrom
      if (input.transferFrom && existing.agent_id === input.transferFrom) {
        db.prepare("DELETE FROM authority_leases WHERE scope = ?").run(input.scope)
      } else {
        return {
          acquired: false,
          heldBy: existing.agent_id,
          heldUntil: existing.expires_at,
        }
      }
    }

    // Get next fence token (globally monotonic)
    db.prepare("UPDATE fence_token_seq SET current_value = current_value + 1").run()
    const { current_value: fenceToken } = db.prepare(
      "SELECT current_value FROM fence_token_seq"
    ).get() as { current_value: number }

    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString()

    db.prepare(`
      INSERT INTO authority_leases (scope, agent_id, task_id, fence_token, mode, ttl_seconds, acquired_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(input.scope, input.agentId, input.taskId ?? null, fenceToken, mode, ttl, now, expiresAt)

    return { acquired: true, fenceToken, expiresAt }
  }).immediate()
}

/** Release authority over a scope. Validates fence token. */
export function releaseAuthority(db: Database.Database, input: ReleaseInput): ReleaseResult {
  return db.transaction(() => {
    const existing = db.prepare(`
      SELECT agent_id, fence_token FROM authority_leases WHERE scope = ?
    `).get(input.scope) as { agent_id: string; fence_token: number } | undefined

    if (!existing) {
      return { released: false, reason: "not_found" }
    }

    if (existing.agent_id !== input.agentId) {
      return { released: false, reason: "not_owner" }
    }

    if (existing.fence_token !== input.fenceToken) {
      return { released: false, reason: "invalid_fence_token" }
    }

    db.prepare("DELETE FROM authority_leases WHERE scope = ?").run(input.scope)
    return { released: true }
  }).immediate()
}

/** Renew (extend) an authority lease. Validates fence token. */
export function renewAuthority(db: Database.Database, input: RenewInput): RenewResult {
  return db.transaction(() => {
    const existing = db.prepare(`
      SELECT agent_id, fence_token, expires_at, ttl_seconds
      FROM authority_leases
      WHERE scope = ? AND expires_at > datetime('now')
    `).get(input.scope) as { agent_id: string; fence_token: number; expires_at: string; ttl_seconds: number } | undefined

    if (!existing) {
      return { renewed: false, reason: "not_found_or_expired" }
    }

    if (existing.agent_id !== input.agentId) {
      return { renewed: false, reason: "not_owner" }
    }

    if (existing.fence_token !== input.fenceToken) {
      return { renewed: false, reason: "invalid_fence_token" }
    }

    const ttl = input.ttlSeconds ?? existing.ttl_seconds
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString()
    const now = new Date().toISOString()

    db.prepare(`
      UPDATE authority_leases SET expires_at = ?, renewed_at = ?, ttl_seconds = ? WHERE scope = ?
    `).run(expiresAt, now, ttl, input.scope)

    return { renewed: true, expiresAt }
  }).immediate()
}

/** Check authority state for a scope (read-only). */
export function checkAuthority(db: Database.Database, scope: string): LeaseInfo | null {
  const row = db.prepare(`
    SELECT scope, agent_id, task_id, fence_token, mode, ttl_seconds, acquired_at, expires_at, renewed_at
    FROM authority_leases
    WHERE scope = ? AND expires_at > datetime('now')
  `).get(scope) as any | undefined

  if (!row) return null

  return {
    scope: row.scope,
    agentId: row.agent_id,
    taskId: row.task_id,
    fenceToken: row.fence_token,
    mode: row.mode,
    ttlSeconds: row.ttl_seconds,
    acquiredAt: row.acquired_at,
    expiresAt: row.expires_at,
    renewedAt: row.renewed_at,
  }
}

/** List all active (unexpired) leases. */
export function listActiveLeases(db: Database.Database, agentId?: string): LeaseInfo[] {
  const query = agentId
    ? "SELECT * FROM authority_leases WHERE expires_at > datetime('now') AND agent_id = ?"
    : "SELECT * FROM authority_leases WHERE expires_at > datetime('now')"

  const rows = agentId
    ? db.prepare(query).all(agentId)
    : db.prepare(query).all()

  return (rows as any[]).map((row) => ({
    scope: row.scope,
    agentId: row.agent_id,
    taskId: row.task_id,
    fenceToken: row.fence_token,
    mode: row.mode,
    ttlSeconds: row.ttl_seconds,
    acquiredAt: row.acquired_at,
    expiresAt: row.expires_at,
    renewedAt: row.renewed_at,
  }))
}

/** Delete all expired leases. Returns count of reaped rows. */
export function reapExpiredLeases(db: Database.Database): number {
  const result = db.prepare(
    "DELETE FROM authority_leases WHERE expires_at <= datetime('now')"
  ).run()
  return result.changes
}

/** Release all leases held by an agent. Used on session end. */
export function releaseAllForAgent(db: Database.Database, agentId: string): number {
  const result = db.prepare(
    "DELETE FROM authority_leases WHERE agent_id = ?"
  ).run(agentId)
  return result.changes
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/studio-mcp/src/authority/operations.ts packages/studio-mcp/src/__tests__/authority-acquire.test.ts
git commit -m "feat(studio-mcp): authority acquire with monotonic fence tokens"
```

---

## Task 4: Authority release operation tests

**Files:**
- Create: `packages/studio-mcp/src/__tests__/authority-release.test.ts`

**Step 1: Write tests**

Create `packages/studio-mcp/src/__tests__/authority-release.test.ts`:

```typescript
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "@sherpa/studio-core/db"
import { applyAuthoritySchema } from "../authority/schema"
import { acquireAuthority, releaseAuthority } from "../authority/operations"
import type Database from "better-sqlite3"

describe("releaseAuthority", () => {
  let dir: string
  let db: Database.Database

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-release-"))
    db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)
  })

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("releases an owned scope", () => {
    const acq = acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })
    const result = releaseAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
      fenceToken: acq.fenceToken!,
    })

    expect(result.released).toBe(true)

    const row = db.prepare("SELECT * FROM authority_leases WHERE scope = ?").get("file:src/foo.ts")
    expect(row).toBeUndefined()
  })

  it("denies release with wrong fence token", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })

    const result = releaseAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
      fenceToken: 999,
    })

    expect(result.released).toBe(false)
    expect(result.reason).toBe("invalid_fence_token")
  })

  it("denies release by non-owner", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })

    const result = releaseAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-2",
      fenceToken: 1,
    })

    expect(result.released).toBe(false)
    expect(result.reason).toBe("not_owner")
  })

  it("returns not_found for nonexistent scope", () => {
    const result = releaseAuthority(db, {
      scope: "file:nonexistent.ts",
      agentId: "agent-1",
      fenceToken: 1,
    })

    expect(result.released).toBe(false)
    expect(result.reason).toBe("not_found")
  })
})
```

**Step 2: Run test to verify it passes**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS (implementation already in operations.ts from Task 3).

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/__tests__/authority-release.test.ts
git commit -m "test(studio-mcp): authority release — owner, wrong token, not-found"
```

---

## Task 5: Authority renew operation tests

**Files:**
- Create: `packages/studio-mcp/src/__tests__/authority-renew.test.ts`

**Step 1: Write tests**

Create `packages/studio-mcp/src/__tests__/authority-renew.test.ts`:

```typescript
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "@sherpa/studio-core/db"
import { applyAuthoritySchema } from "../authority/schema"
import { acquireAuthority, renewAuthority } from "../authority/operations"
import type Database from "better-sqlite3"

describe("renewAuthority", () => {
  let dir: string
  let db: Database.Database

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-renew-"))
    db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)
  })

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("renews a valid lease with extended expiry", () => {
    const acq = acquireAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
      ttlSeconds: 60,
    })

    const result = renewAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
      fenceToken: acq.fenceToken!,
      ttlSeconds: 3600,
    })

    expect(result.renewed).toBe(true)
    expect(result.expiresAt).toBeTruthy()
    const newExpiry = new Date(result.expiresAt!).getTime()
    const origExpiry = new Date(acq.expiresAt!).getTime()
    expect(newExpiry).toBeGreaterThan(origExpiry)
  })

  it("denies renew with wrong fence token", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })

    const result = renewAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
      fenceToken: 999,
    })

    expect(result.renewed).toBe(false)
    expect(result.reason).toBe("invalid_fence_token")
  })

  it("denies renew of expired lease", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })
    db.prepare(
      "UPDATE authority_leases SET expires_at = datetime('now', '-1 minute') WHERE scope = ?"
    ).run("file:src/foo.ts")

    const result = renewAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-1",
      fenceToken: 1,
    })

    expect(result.renewed).toBe(false)
    expect(result.reason).toBe("not_found_or_expired")
  })

  it("denies renew by non-owner", () => {
    acquireAuthority(db, { scope: "file:src/foo.ts", agentId: "agent-1" })

    const result = renewAuthority(db, {
      scope: "file:src/foo.ts",
      agentId: "agent-2",
      fenceToken: 1,
    })

    expect(result.renewed).toBe(false)
    expect(result.reason).toBe("not_owner")
  })
})
```

**Step 2: Run test to verify it passes**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS.

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/__tests__/authority-renew.test.ts
git commit -m "test(studio-mcp): authority renew — extend, wrong token, expired, non-owner"
```

---

## Task 6: Reaper and bulk release tests

**Files:**
- Create: `packages/studio-mcp/src/__tests__/authority-reaper.test.ts`

**Step 1: Write tests**

Create `packages/studio-mcp/src/__tests__/authority-reaper.test.ts`:

```typescript
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "@sherpa/studio-core/db"
import { applyAuthoritySchema } from "../authority/schema"
import { acquireAuthority, reapExpiredLeases, releaseAllForAgent } from "../authority/operations"
import type Database from "better-sqlite3"

describe("reapExpiredLeases", () => {
  let dir: string
  let db: Database.Database

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-reaper-"))
    db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)
  })

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("deletes expired leases", () => {
    acquireAuthority(db, { scope: "file:a.ts", agentId: "agent-1" })
    acquireAuthority(db, { scope: "file:b.ts", agentId: "agent-2" })
    db.prepare(
      "UPDATE authority_leases SET expires_at = datetime('now', '-1 minute') WHERE scope = ?"
    ).run("file:a.ts")

    const reaped = reapExpiredLeases(db)
    expect(reaped).toBe(1)

    const remaining = db.prepare("SELECT scope FROM authority_leases").all() as any[]
    expect(remaining).toHaveLength(1)
    expect(remaining[0].scope).toBe("file:b.ts")
  })

  it("preserves valid leases", () => {
    acquireAuthority(db, { scope: "file:a.ts", agentId: "agent-1" })
    const reaped = reapExpiredLeases(db)
    expect(reaped).toBe(0)
  })

  it("returns 0 when table is empty", () => {
    expect(reapExpiredLeases(db)).toBe(0)
  })
})

describe("releaseAllForAgent", () => {
  let dir: string
  let db: Database.Database

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-agent-release-"))
    db = openDb(path.join(dir, "coordination.db"))
    applyAuthoritySchema(db)
  })

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("releases all leases for a specific agent", () => {
    acquireAuthority(db, { scope: "file:a.ts", agentId: "agent-1" })
    acquireAuthority(db, { scope: "file:b.ts", agentId: "agent-1" })
    acquireAuthority(db, { scope: "file:c.ts", agentId: "agent-2" })

    const released = releaseAllForAgent(db, "agent-1")
    expect(released).toBe(2)

    const remaining = db.prepare("SELECT scope FROM authority_leases").all() as any[]
    expect(remaining).toHaveLength(1)
    expect(remaining[0].scope).toBe("file:c.ts")
  })
})
```

**Step 2: Run test to verify it passes**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS.

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/__tests__/authority-reaper.test.ts
git commit -m "test(studio-mcp): TTL reaper and bulk agent release"
```

---

## Task 7: Authority barrel export + reaper module

**Files:**
- Create: `packages/studio-mcp/src/authority/index.ts`
- Create: `packages/studio-mcp/src/authority/reaper.ts`

**Step 1: Create reaper module**

Create `packages/studio-mcp/src/authority/reaper.ts`:

```typescript
import type Database from "better-sqlite3"
import { reapExpiredLeases } from "./operations"

const DEFAULT_INTERVAL_MS = 60_000

let reaperInterval: ReturnType<typeof setInterval> | null = null

/** Start the TTL reaper. Cleans expired leases on a fixed interval. */
export function startReaper(db: Database.Database, intervalMs = DEFAULT_INTERVAL_MS): void {
  stopReaper()
  reaperInterval = setInterval(() => {
    try {
      const count = reapExpiredLeases(db)
      if (count > 0) {
        console.error(`[sherpa-mcp] Reaped ${count} expired lease(s)`)
      }
    } catch (err) {
      console.error("[sherpa-mcp] Reaper error:", err)
    }
  }, intervalMs)

  if (reaperInterval.unref) {
    reaperInterval.unref()
  }
}

/** Stop the TTL reaper. */
export function stopReaper(): void {
  if (reaperInterval) {
    clearInterval(reaperInterval)
    reaperInterval = null
  }
}
```

**Step 2: Create barrel export**

Create `packages/studio-mcp/src/authority/index.ts`:

```typescript
export { applyAuthoritySchema, authorityLeases, stateVersions, fenceTokenSeq } from "./schema"
export {
  acquireAuthority,
  releaseAuthority,
  renewAuthority,
  checkAuthority,
  listActiveLeases,
  reapExpiredLeases,
  releaseAllForAgent,
} from "./operations"
export type {
  AcquireInput,
  AcquireResult,
  ReleaseInput,
  ReleaseResult,
  RenewInput,
  RenewResult,
  LeaseInfo,
} from "./operations"
export { startReaper, stopReaper } from "./reaper"
```

**Step 3: Typecheck**

```bash
pnpm --filter @sherpa/studio-mcp exec tsc --noEmit
```

Expected: PASS.

**Step 4: Commit**

```bash
git add packages/studio-mcp/src/authority/index.ts packages/studio-mcp/src/authority/reaper.ts
git commit -m "feat(studio-mcp): authority barrel exports + TTL reaper module"
```

---

## Task 8: Register authority MCP tools + resource

**Files:**
- Create: `packages/studio-mcp/src/authority/tools.ts`
- Modify: `packages/studio-mcp/src/server.ts`

**Step 1: Create MCP tool registration module**

Create `packages/studio-mcp/src/authority/tools.ts`:

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type Database from "better-sqlite3"
import {
  acquireAuthority,
  releaseAuthority,
  renewAuthority,
  checkAuthority,
} from "./operations"
import { buildDashboard } from "../dashboard"

/** Register authority tools and dashboard on an MCP server instance. */
export function registerAuthorityTools(
  server: McpServer,
  db: Database.Database,
  projectRoot: string,
): void {
  server.tool(
    "authority_acquire",
    "Request exclusive authority over a scope (file or directory). Returns a fencing token. Use transfer_from for atomic handoff.",
    {
      scope: z.string().describe("Resource scope (file:src/foo.ts or dir:src/components/)"),
      agent_id: z.string().describe("Requesting agent's ID"),
      task_id: z.string().optional().describe("Associated task ID"),
      ttl_seconds: z.number().optional().describe("Lease duration in seconds (default: 1800)"),
      transfer_from: z.string().optional().describe("Current holder's agent ID for atomic transfer"),
    },
    async ({ scope, agent_id, task_id, ttl_seconds, transfer_from }) => {
      const result = acquireAuthority(db, {
        scope,
        agentId: agent_id,
        taskId: task_id,
        ttlSeconds: ttl_seconds,
        transferFrom: transfer_from,
      })
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] }
    },
  )

  server.tool(
    "authority_release",
    "Release authority over a scope. Requires valid fencing token.",
    {
      scope: z.string().describe("Resource scope to release"),
      agent_id: z.string().describe("Agent releasing authority"),
      fence_token: z.number().describe("Fencing token from authority_acquire"),
    },
    async ({ scope, agent_id, fence_token }) => {
      const result = releaseAuthority(db, { scope, agentId: agent_id, fenceToken: fence_token })
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] }
    },
  )

  server.tool(
    "authority_renew",
    "Extend the TTL of an existing authority lease. Requires valid fencing token.",
    {
      scope: z.string().describe("Resource scope to renew"),
      agent_id: z.string().describe("Agent renewing authority"),
      fence_token: z.number().describe("Fencing token from authority_acquire"),
      ttl_seconds: z.number().optional().describe("New lease duration in seconds"),
    },
    async ({ scope, agent_id, fence_token, ttl_seconds }) => {
      const result = renewAuthority(db, { scope, agentId: agent_id, fenceToken: fence_token, ttlSeconds: ttl_seconds })
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] }
    },
  )

  server.tool(
    "get_dashboard",
    "Bootstrap snapshot of system state: active leases, tasks, system health. Call as first action in a new session.",
    {
      agent_id: z.string().optional().describe("Filter to this agent's state"),
      role: z.string().optional().describe("Agent role for role-scoped view"),
    },
    async ({ agent_id, role }) => {
      const dashboard = buildDashboard(db, projectRoot, { agentId: agent_id, role })
      return { content: [{ type: "text" as const, text: JSON.stringify(dashboard, null, 2) }] }
    },
  )

  server.resource(
    "authority",
    "authority://{scope}",
    { description: "Read-only authority state for a scope" },
    async (uri) => {
      const scope = uri.pathname.replace(/^\/\//, "")
      const lease = checkAuthority(db, scope)
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(lease ?? { held: false, scope }),
        }],
      }
    },
  )
}
```

**Step 2: Add coordinationDb to StudioMcpOptions and wire into server.ts**

In `packages/studio-mcp/src/server.ts`, add to `StudioMcpOptions` interface:

```typescript
/** SQLite database for coordination. When provided, authority tools are registered. */
coordinationDb?: import("better-sqlite3").Database
```

At the end of `createStudioMcpServer`, before `return server`, add:

```typescript
// --- Authority tools (only when coordination DB is provided) ---
if (opts?.coordinationDb) {
  const { registerAuthorityTools } = await import("./authority/tools.js")
  registerAuthorityTools(server, opts.coordinationDb, projectRoot)
}
```

Note: `createStudioMcpServer` is currently synchronous. Since we're using dynamic import, change to async — but `McpServer` tool handlers are already async, so this is safe. Alternatively, use static import at the top of server.ts and call it synchronously:

```typescript
import { registerAuthorityTools } from "./authority/tools.js"
```

Then at end of function:

```typescript
if (opts?.coordinationDb) {
  registerAuthorityTools(server, opts.coordinationDb, projectRoot)
}
```

**Step 3: Typecheck**

```bash
pnpm --filter @sherpa/studio-mcp exec tsc --noEmit
```

Expected: PASS.

**Step 4: Commit**

```bash
git add packages/studio-mcp/src/authority/tools.ts packages/studio-mcp/src/server.ts
git commit -m "feat(studio-mcp): register authority_acquire, authority_release, authority_renew, get_dashboard tools + authority resource"
```

---

## Task 9: Dashboard module

**Files:**
- Create: `packages/studio-mcp/src/dashboard.ts`
- Create: `packages/studio-mcp/src/__tests__/dashboard.test.ts`

**Step 1: Write failing test**

Create `packages/studio-mcp/src/__tests__/dashboard.test.ts`:

```typescript
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "@sherpa/studio-core/db"
import { applyCoordinationSchema } from "@sherpa/studio-core/db"
import { applyAuthoritySchema } from "../authority/schema"
import { acquireAuthority } from "../authority/operations"
import { buildDashboard } from "../dashboard"
import type Database from "better-sqlite3"

describe("buildDashboard", () => {
  let dir: string
  let db: Database.Database

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-dashboard-"))
    db = openDb(path.join(dir, "coordination.db"))
    applyCoordinationSchema(db)
    applyAuthoritySchema(db)
  })

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("returns empty dashboard when no state exists", () => {
    const dashboard = buildDashboard(db, dir)
    expect(dashboard.leases).toEqual([])
    expect(dashboard.summary.totalLeases).toBe(0)
  })

  it("includes agent's active leases when agent_id is provided", () => {
    acquireAuthority(db, { scope: "file:a.ts", agentId: "agent-1" })
    acquireAuthority(db, { scope: "file:b.ts", agentId: "agent-2" })

    const dashboard = buildDashboard(db, dir, { agentId: "agent-1" })
    expect(dashboard.leases).toHaveLength(1)
    expect(dashboard.leases[0].scope).toBe("file:a.ts")
  })

  it("includes all leases when no agent_id filter", () => {
    acquireAuthority(db, { scope: "file:a.ts", agentId: "agent-1" })
    acquireAuthority(db, { scope: "file:b.ts", agentId: "agent-2" })

    const dashboard = buildDashboard(db, dir)
    expect(dashboard.leases).toHaveLength(2)
    expect(dashboard.summary.totalLeases).toBe(2)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: FAIL — `../dashboard` doesn't exist.

**Step 3: Implement dashboard**

Create `packages/studio-mcp/src/dashboard.ts`:

```typescript
import type Database from "better-sqlite3"
import { listActiveLeases, type LeaseInfo } from "./authority/operations"
import fs from "node:fs"
import path from "node:path"

export interface DashboardOptions {
  agentId?: string
  role?: string
}

export interface Dashboard {
  leases: LeaseInfo[]
  tasks: DashboardTask[]
  summary: {
    totalLeases: number
    totalAgents: number
  }
}

interface DashboardTask {
  id: string
  status: string
  role: string
  priority: string
}

/** Build a role-scoped dashboard snapshot. */
export function buildDashboard(
  db: Database.Database,
  projectRoot: string,
  opts?: DashboardOptions,
): Dashboard {
  const leases = listActiveLeases(db, opts?.agentId)
  const allLeases = listActiveLeases(db)
  const agentIds = new Set(allLeases.map((l) => l.agentId))
  const tasks = scanTasksLightweight(path.join(projectRoot, "docs/tasks"))

  return {
    leases,
    tasks,
    summary: {
      totalLeases: allLeases.length,
      totalAgents: agentIds.size,
    },
  }
}

function scanTasksLightweight(tasksDir: string): DashboardTask[] {
  if (!fs.existsSync(tasksDir)) return []

  const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md") && f !== "README.md")
  const tasks: DashboardTask[] = []

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(tasksDir, file), "utf-8")
      const match = content.match(/^---\n([\s\S]*?)\n---/)
      if (!match) continue

      const meta: Record<string, string> = {}
      for (const line of match[1].split("\n")) {
        const colonIdx = line.indexOf(":")
        if (colonIdx === -1) continue
        meta[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim()
      }

      if (meta.id) {
        tasks.push({
          id: meta.id,
          status: meta.status ?? "unknown",
          role: meta.role ?? "unknown",
          priority: meta.priority ?? "medium",
        })
      }
    } catch { /* skip */ }
  }

  return tasks
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/studio-mcp/src/dashboard.ts packages/studio-mcp/src/__tests__/dashboard.test.ts
git commit -m "feat(studio-mcp): get_dashboard — leases, tasks, system summary"
```

---

## Task 10: Wire DB lifecycle into HTTP server

**Files:**
- Modify: `packages/studio-mcp/src/http-server.ts`
- Modify: `packages/studio-mcp/src/index.ts`

**Step 1: Update http-server.ts**

Add imports at the top:

```typescript
import { openDb, closeAll as closeAllDbs, resolveDbPaths } from "@sherpa/studio-core/db"
import { applyCoordinationSchema } from "@sherpa/studio-core/db"
import { applyAuthoritySchema } from "./authority/schema"
import { startReaper, stopReaper } from "./authority/reaper"
```

In `startHttpServer`, after `const port = resolvePort(opts)`, add:

```typescript
// Resolve project root (same logic as server.ts)
const projectRoot = opts?.projectRoot
  ?? process.env.SHERPA_PROJECT_ROOT
  ?? process.cwd()

// Initialize coordination database
const dbPaths = resolveDbPaths(projectRoot)
const coordinationDb = openDb(dbPaths.coordination)
applyCoordinationSchema(coordinationDb)
applyAuthoritySchema(coordinationDb)

// Start TTL reaper
startReaper(coordinationDb)
```

Update the session factory to pass `coordinationDb`:

```typescript
const sessions = new SessionManager(() => {
  const server = createStudioMcpServer({ ...opts, coordinationDb })
  // ...rest unchanged
})
```

Update shutdown:

```typescript
const shutdown = async () => {
  console.error("\n[sherpa-mcp] Shutting down...")
  stopReaper()
  await sessions.closeAll()
  closeAllDbs()
  httpServer.close()
  process.exit(0)
}
```

**Step 2: Update index.ts exports**

Add to `packages/studio-mcp/src/index.ts`:

```typescript
export {
  applyAuthoritySchema,
  acquireAuthority,
  releaseAuthority,
  renewAuthority,
  checkAuthority,
  listActiveLeases,
  reapExpiredLeases,
  startReaper,
  stopReaper,
} from "./authority"
export type { AcquireInput, AcquireResult, ReleaseInput, ReleaseResult, RenewInput, RenewResult, LeaseInfo } from "./authority"
export { buildDashboard } from "./dashboard"
export type { Dashboard, DashboardOptions } from "./dashboard"
```

**Step 3: Typecheck**

```bash
pnpm check
```

Expected: PASS.

**Step 4: Commit**

```bash
git add packages/studio-mcp/src/http-server.ts packages/studio-mcp/src/index.ts
git commit -m "feat(studio-mcp): wire authority DB lifecycle — init, reaper, shutdown"
```

---

## Task 11: Full integration test with coexistence validation

**Files:**
- Create: `packages/studio-mcp/src/__tests__/authority-tools-integration.test.ts`

**Step 1: Write integration test**

Create `packages/studio-mcp/src/__tests__/authority-tools-integration.test.ts`:

```typescript
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "@sherpa/studio-core/db"
import { applyCoordinationSchema } from "@sherpa/studio-core/db"
import { applyAuthoritySchema } from "../authority/schema"
import { acquireAuthority, releaseAuthority, renewAuthority, checkAuthority } from "../authority/operations"
import type Database from "better-sqlite3"

describe("authority tools integration", () => {
  let dir: string
  let db: Database.Database

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-auth-tools-int-"))
    db = openDb(path.join(dir, "coordination.db"))
    applyCoordinationSchema(db)
    applyAuthoritySchema(db)
  })

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("full lifecycle: acquire → check → renew → release → check", () => {
    const acq = acquireAuthority(db, {
      scope: "file:src/index.ts",
      agentId: "planner-1",
      taskId: "plan-001",
      ttlSeconds: 1800,
    })
    expect(acq.acquired).toBe(true)
    expect(acq.fenceToken).toBe(1)

    const check1 = checkAuthority(db, "file:src/index.ts")
    expect(check1).not.toBeNull()
    expect(check1!.agentId).toBe("planner-1")

    const ren = renewAuthority(db, {
      scope: "file:src/index.ts",
      agentId: "planner-1",
      fenceToken: 1,
      ttlSeconds: 3600,
    })
    expect(ren.renewed).toBe(true)

    const rel = releaseAuthority(db, {
      scope: "file:src/index.ts",
      agentId: "planner-1",
      fenceToken: 1,
    })
    expect(rel.released).toBe(true)

    expect(checkAuthority(db, "file:src/index.ts")).toBeNull()
  })

  it("coexists with foundation coordination schema", () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[]
    const names = tables.map((t) => t.name)

    expect(names).toContain("agent_sessions")
    expect(names).toContain("task_claims")
    expect(names).toContain("authority_leases")
    expect(names).toContain("state_versions")
    expect(names).toContain("schema_version")
  })
})
```

**Step 2: Run test**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS.

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/__tests__/authority-tools-integration.test.ts
git commit -m "test(studio-mcp): authority full lifecycle + foundation schema coexistence"
```

---

## Task 12: E2E test via HTTP MCP protocol

**Files:**
- Create: `packages/studio-mcp/src/__tests__/authority-e2e.test.ts`

**Step 1: Write E2E test**

Create `packages/studio-mcp/src/__tests__/authority-e2e.test.ts`:

```typescript
import { describe, it, expect, afterEach, vi } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { closeAll } from "@sherpa/studio-core/db"
import { startHttpServer } from "../http-server"
import { stopReaper } from "../authority/reaper"
import type http from "node:http"

const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as never)

let httpServer: http.Server | null = null
let tmpDir: string | null = null

afterEach(async () => {
  stopReaper()
  if (httpServer) {
    await new Promise<void>((resolve, reject) => {
      httpServer!.close((err) => (err ? reject(err) : resolve()))
    })
    httpServer = null
  }
  closeAll()
  if (tmpDir) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    tmpDir = null
  }
  exitSpy.mockClear()
})

async function initSession(port: number): Promise<string> {
  const res = await fetch(`http://localhost:${port}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-e2e", version: "1.0" },
      },
    }),
  })
  await res.text()
  return res.headers.get("mcp-session-id")!
}

async function callTool(
  port: number,
  sessionId: string,
  tool: string,
  args: Record<string, unknown>,
  requestId = 2,
): Promise<any> {
  const res = await fetch(`http://localhost:${port}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId,
      method: "tools/call",
      params: { name: tool, arguments: args },
    }),
  })
  const text = await res.text()
  return JSON.parse(text)
}

describe("authority E2E via HTTP", () => {
  it("acquire, dashboard, release through MCP protocol", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-e2e-"))
    const result = await startHttpServer({ port: 0, projectRoot: tmpDir })
    httpServer = result.server
    const port = (result.server.address() as { port: number }).port

    const sessionId = await initSession(port)
    expect(sessionId).toBeTruthy()

    // Acquire authority
    const acqResult = await callTool(port, sessionId, "authority_acquire", {
      scope: "file:src/main.ts",
      agent_id: "test-agent",
      ttl_seconds: 300,
    })
    const acq = JSON.parse(acqResult.result.content[0].text)
    expect(acq.acquired).toBe(true)
    expect(acq.fenceToken).toBe(1)

    // Dashboard shows the lease
    const dashResult = await callTool(port, sessionId, "get_dashboard", {
      agent_id: "test-agent",
    }, 3)
    const dashboard = JSON.parse(dashResult.result.content[0].text)
    expect(dashboard.leases).toHaveLength(1)
    expect(dashboard.summary.totalLeases).toBe(1)

    // Release authority
    const relResult = await callTool(port, sessionId, "authority_release", {
      scope: "file:src/main.ts",
      agent_id: "test-agent",
      fence_token: 1,
    }, 4)
    const rel = JSON.parse(relResult.result.content[0].text)
    expect(rel.released).toBe(true)
  })
})
```

**Step 2: Run all tests**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: ALL PASS.

**Step 3: Monorepo typecheck**

```bash
pnpm check
```

Expected: PASS.

**Step 4: Commit**

```bash
git add packages/studio-mcp/src/__tests__/authority-e2e.test.ts
git commit -m "test(studio-mcp): authority E2E — acquire, dashboard, release via HTTP MCP protocol"
```

**Step 5: Update activity log**

Add to `docs/initiatives/mcp-coordination-layer/activity.md`:

```
- 2026-03-16: Phase 1 implemented. Authority system: 3 tools (authority_acquire, authority_release, authority_renew) + 1 resource (authority://{scope}) + get_dashboard bootstrap. Fence tokens globally monotonic via fence_token_seq. TTL reaper on 60s interval. Full E2E via HTTP MCP protocol.
```

**Step 6: Commit**

```bash
git add docs/initiatives/mcp-coordination-layer/activity.md
git commit -m "docs: Phase 1 implementation complete — authority system"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Dependencies | `package.json` |
| 2 | Authority schema (tables + DDL) | `authority/schema.ts` + test |
| 3 | Acquire + all operations | `authority/operations.ts` + test |
| 4 | Release tests | test |
| 5 | Renew tests | test |
| 6 | Reaper + bulk release tests | test |
| 7 | Barrel export + reaper module | `authority/index.ts`, `authority/reaper.ts` |
| 8 | MCP tool registration + resource | `authority/tools.ts`, `server.ts` |
| 9 | Dashboard | `dashboard.ts` + test |
| 10 | DB lifecycle wiring | `http-server.ts`, `index.ts` |
| 11 | Integration test (lifecycle + coexistence) | test |
| 12 | E2E test via HTTP | test |

**New files:** 8 source + 8 test = 16 files
**Modified files:** 3 (`server.ts`, `http-server.ts`, `index.ts`)
**Effort:** 1-2 sessions
