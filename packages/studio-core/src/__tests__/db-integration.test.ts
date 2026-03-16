import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll, resolveDbPaths } from "../db"
import { applyCoordinationSchema } from "../db"
import { applyEventsSchema, appendEvent } from "../db"

describe("db integration", () => {
  let projectRoot: string

  afterEach(() => {
    closeAll()
    if (projectRoot) fs.rmSync(projectRoot, { recursive: true, force: true })
  })

  it("creates both databases from resolved paths", () => {
    projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-int-test-"))
    const paths = resolveDbPaths(projectRoot)

    const coordDb = openDb(paths.coordination)
    applyCoordinationSchema(coordDb)

    const eventsDb = openDb(paths.events)
    applyEventsSchema(eventsDb)

    // Verify both files exist
    expect(fs.existsSync(paths.coordination)).toBe(true)
    expect(fs.existsSync(paths.events)).toBe(true)

    // Verify they're independent (different connections)
    expect(coordDb).not.toBe(eventsDb)

    // Write to events from coordination context
    appendEvent(eventsDb, {
      agent_id: "test",
      action: "session_started",
      target: "integration-test",
    })

    const events = eventsDb.prepare("SELECT COUNT(*) as count FROM events").get() as any
    expect(events.count).toBe(1)
  })

  it("supports BEGIN IMMEDIATE for write transactions", () => {
    projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-int-test-"))
    const paths = resolveDbPaths(projectRoot)
    const db = openDb(paths.coordination)
    applyCoordinationSchema(db)

    // Simulate a write transaction with BEGIN IMMEDIATE
    const insert = db.transaction(() => {
      db.prepare(`
        INSERT INTO agent_sessions (id, agent_id, role, started_at, heartbeat_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `).run("01XYZ", "worker-1", "engineer")

      return db.prepare("SELECT * FROM agent_sessions WHERE id = ?").get("01XYZ")
    })

    const row = insert.immediate() as any
    expect(row.agent_id).toBe("worker-1")
  })
})
