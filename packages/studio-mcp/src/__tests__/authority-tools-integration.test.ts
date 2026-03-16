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
