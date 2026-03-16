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
