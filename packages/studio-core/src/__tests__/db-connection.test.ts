import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll, resolveDbPaths } from "../db/connection"

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-db-test-"))
}

describe("resolveDbPaths", () => {
  it("resolves default paths from projectRoot", () => {
    const paths = resolveDbPaths("/fake/project")
    expect(paths.dir).toBe("/fake/project/.sherpa")
    expect(paths.coordination).toBe("/fake/project/.sherpa/coordination.db")
    expect(paths.events).toBe("/fake/project/.sherpa/events.db")
  })

  it("accepts custom directory", () => {
    const paths = resolveDbPaths("/fake/project", "data")
    expect(paths.dir).toBe("/fake/project/data")
    expect(paths.coordination).toBe("/fake/project/data/coordination.db")
  })
})

describe("openDb", () => {
  let dir: string

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("creates a WAL-mode database", () => {
    dir = tmpDir()
    const dbPath = path.join(dir, "test.db")
    const db = openDb(dbPath)

    const journalMode = db.pragma("journal_mode", { simple: true })
    expect(journalMode).toBe("wal")
  })

  it("sets required pragmas", () => {
    dir = tmpDir()
    const dbPath = path.join(dir, "test.db")
    const db = openDb(dbPath)

    expect(db.pragma("synchronous", { simple: true })).toBe(1) // NORMAL
    expect(db.pragma("busy_timeout", { simple: true })).toBe(5000)
    expect(db.pragma("foreign_keys", { simple: true })).toBe(1)
  })

  it("returns same instance for same path", () => {
    dir = tmpDir()
    const dbPath = path.join(dir, "test.db")
    const db1 = openDb(dbPath)
    const db2 = openDb(dbPath)
    expect(db1).toBe(db2)
  })

  it("creates parent directory if missing", () => {
    dir = tmpDir()
    const nested = path.join(dir, "sub", "deep")
    const dbPath = path.join(nested, "test.db")
    const db = openDb(dbPath)
    expect(db.open).toBe(true)
    expect(fs.existsSync(nested)).toBe(true)
  })
})
