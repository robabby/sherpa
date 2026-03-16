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

  it("stores timestamps in SQLite datetime format", () => {
    acquireAuthority(db, { scope: "file:fmt.ts", agentId: "agent-1", ttlSeconds: 300 })
    const lease = db.prepare("SELECT acquired_at, expires_at FROM authority_leases WHERE scope = ?")
      .get("file:fmt.ts") as { acquired_at: string; expires_at: string }

    // SQLite datetime format: YYYY-MM-DD HH:MM:SS (no T, no Z, no milliseconds)
    expect(lease.acquired_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    expect(lease.expires_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)

    // expires_at should be found by datetime('now') comparison
    const found = db.prepare(
      "SELECT 1 as ok FROM authority_leases WHERE scope = ? AND expires_at > datetime('now')"
    ).get("file:fmt.ts")
    expect(found).toBeTruthy()
  })
})
