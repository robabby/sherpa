import type Database from "better-sqlite3"
import { reapExpiredLeases } from "./operations"

const DEFAULT_INTERVAL_MS = 60_000

let reaperInterval: ReturnType<typeof setInterval> | null = null

/** Start the TTL reaper. Cleans expired leases on a fixed interval. */
export function startReaper(db: Database.Database, intervalMs = DEFAULT_INTERVAL_MS): void {
  stopReaper()
  reaperInterval = setInterval(() => {
    try {
      const count = reapExpiredLeases(db)
      if (count > 0) {
        console.error(`[sherpa-mcp] Reaped ${count} expired lease(s)`)
      }
    } catch (err) {
      console.error("[sherpa-mcp] Reaper error:", err)
    }
  }, intervalMs)

  if (reaperInterval.unref) {
    reaperInterval.unref()
  }
}

/** Stop the TTL reaper. */
export function stopReaper(): void {
  if (reaperInterval) {
    clearInterval(reaperInterval)
    reaperInterval = null
  }
}
