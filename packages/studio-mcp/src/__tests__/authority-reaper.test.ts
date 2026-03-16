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
