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
    applyAuthoritySchema(db)

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
