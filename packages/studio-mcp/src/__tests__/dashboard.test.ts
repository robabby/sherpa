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

  it("returns empty dashboard when no state exists", async () => {
    const dashboard = await buildDashboard(db, dir)
    expect(dashboard.leases).toEqual([])
    expect(dashboard.summary.totalLeases).toBe(0)
  })

  it("includes agent's active leases when agent_id is provided", async () => {
    acquireAuthority(db, { scope: "file:a.ts", agentId: "agent-1" })
    acquireAuthority(db, { scope: "file:b.ts", agentId: "agent-2" })

    const dashboard = await buildDashboard(db, dir, { agentId: "agent-1" })
    expect(dashboard.leases).toHaveLength(1)
    expect(dashboard.leases[0].scope).toBe("file:a.ts")
  })

  it("includes all leases when no agent_id filter", async () => {
    acquireAuthority(db, { scope: "file:a.ts", agentId: "agent-1" })
    acquireAuthority(db, { scope: "file:b.ts", agentId: "agent-2" })

    const dashboard = await buildDashboard(db, dir)
    expect(dashboard.leases).toHaveLength(2)
    expect(dashboard.summary.totalLeases).toBe(2)
  })
})
