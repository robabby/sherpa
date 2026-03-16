import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "../db/connection"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { sql } from "drizzle-orm"

describe("drizzle composability", () => {
  let dir: string

  afterEach(() => {
    closeAll()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  })

  it("wraps openDb() result with Drizzle", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-drizzle-test-"))
    const dbPath = path.join(dir, "test.db")
    const rawDb = openDb(dbPath)

    // Drizzle should accept the better-sqlite3 Database instance
    const db = drizzle(rawDb)
    expect(db).toBeTruthy()
  })

  it("Drizzle queries work on openDb() connection with WAL pragmas", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-drizzle-test-"))
    const dbPath = path.join(dir, "test.db")
    const rawDb = openDb(dbPath)
    const db = drizzle(rawDb)

    // Create a table via raw SQL (as this initiative does)
    rawDb.exec("CREATE TABLE IF NOT EXISTS test_table (id TEXT PRIMARY KEY, value TEXT)")
    rawDb.prepare("INSERT INTO test_table (id, value) VALUES (?, ?)").run("1", "hello")

    // Query via Drizzle
    const rows = db.all(sql`SELECT * FROM test_table WHERE id = '1'`)
    expect(rows).toHaveLength(1)
  })

  it("Drizzle can create tables alongside raw-SQL tables", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-drizzle-test-"))
    const dbPath = path.join(dir, "test.db")
    const rawDb = openDb(dbPath)
    const db = drizzle(rawDb)

    // Raw SQL table (as this initiative creates)
    rawDb.exec("CREATE TABLE IF NOT EXISTS raw_table (id TEXT PRIMARY KEY)")

    // Drizzle-managed table (as mcp-coordination-layer would create)
    db.run(sql`CREATE TABLE IF NOT EXISTS drizzle_table (id TEXT PRIMARY KEY, scope TEXT)`)

    // Both tables coexist
    const tables = rawDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[]
    const names = tables.map(t => t.name)
    expect(names).toContain("raw_table")
    expect(names).toContain("drizzle_table")
  })
})
