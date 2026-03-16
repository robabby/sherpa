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
