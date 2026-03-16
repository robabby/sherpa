import type Database from "better-sqlite3"

export const COORDINATION_SCHEMA_VERSION = 1

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version   INTEGER NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS agent_sessions (
    id           TEXT PRIMARY KEY,
    agent_id     TEXT NOT NULL,
    role         TEXT NOT NULL,
    worktree     TEXT,
    started_at   TEXT NOT NULL,
    heartbeat_at TEXT NOT NULL,
    ended_at     TEXT
  );

  CREATE TABLE IF NOT EXISTS task_claims (
    id         TEXT PRIMARY KEY,
    task_id    TEXT NOT NULL,
    agent_id   TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'claimed',
    version    INTEGER NOT NULL DEFAULT 1,
    claimed_at TEXT NOT NULL,
    updated_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_task_claims_task
    ON task_claims (task_id);
  CREATE INDEX IF NOT EXISTS idx_task_claims_agent
    ON task_claims (agent_id, status);
  CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent
    ON agent_sessions (agent_id);
`

/** Apply coordination schema. Idempotent — safe to call on every startup. */
export function applyCoordinationSchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL)

  // Record version if not already present for this version
  const existing = db
    .prepare("SELECT 1 FROM schema_version WHERE version = ?")
    .get(COORDINATION_SCHEMA_VERSION)

  if (!existing) {
    db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(
      COORDINATION_SCHEMA_VERSION
    )
  }
}
