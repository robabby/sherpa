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
