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
