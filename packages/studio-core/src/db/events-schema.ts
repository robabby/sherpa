import type Database from "better-sqlite3"
import { ulid } from "ulid"

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS events (
    id         TEXT PRIMARY KEY,
    agent_id   TEXT NOT NULL,
    action     TEXT NOT NULL,
    target     TEXT,
    payload    TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_events_action
    ON events (action);
  CREATE INDEX IF NOT EXISTS idx_events_agent
    ON events (agent_id);
  CREATE INDEX IF NOT EXISTS idx_events_created
    ON events (created_at);
`

/** Apply events schema. Idempotent. */
export function applyEventsSchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL)
}

export interface EventInput {
  agent_id: string
  action: string
  target?: string
  payload?: Record<string, unknown>
}

/** Append an event. Generates ULID and timestamp automatically. */
export function appendEvent(db: Database.Database, event: EventInput): string {
  const id = ulid()
  db.prepare(`
    INSERT INTO events (id, agent_id, action, target, payload)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    id,
    event.agent_id,
    event.action,
    event.target ?? null,
    event.payload ? JSON.stringify(event.payload) : null,
  )
  return id
}
