/**
 * SQLite connection factory — the driver abstraction boundary.
 *
 * All better-sqlite3 imports in the monorepo live in src/db/.
 * If the driver needs to swap (to node:sqlite or libsql),
 * only files in this directory change.
 */
import Database from "better-sqlite3"
import fs from "node:fs"
import path from "node:path"
import type { ResolvedDbPaths } from "./types"

const DEFAULT_DIR = ".sherpa"
const DB_FILES = {
  coordination: "coordination.db",
  events: "events.db",
  knowledge: "knowledge.db",
} as const

/** Resolve absolute DB paths from project root. Convention: .sherpa/*.db */
export function resolveDbPaths(projectRoot: string, dbDir?: string): ResolvedDbPaths {
  const dir = path.join(projectRoot, dbDir ?? DEFAULT_DIR)
  return {
    dir,
    coordination: path.join(dir, DB_FILES.coordination),
    events: path.join(dir, DB_FILES.events),
    knowledge: path.join(dir, DB_FILES.knowledge),
  }
}

/** Open connections keyed by absolute path — one instance per file. */
const pool = new Map<string, Database.Database>()

/** Open (or return cached) SQLite database with Sherpa's standard pragmas. */
export function openDb(dbPath: string): Database.Database {
  const existing = pool.get(dbPath)
  if (existing) return existing

  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new Database(dbPath)
  db.pragma("journal_mode = WAL")
  db.pragma("synchronous = NORMAL")
  db.pragma("busy_timeout = 5000")
  db.pragma("foreign_keys = ON")

  pool.set(dbPath, db)
  return db
}

/** Close all open connections. Call on shutdown. */
export function closeAll(): void {
  for (const db of pool.values()) {
    try { db.close() } catch { /* already closed */ }
  }
  pool.clear()
}
