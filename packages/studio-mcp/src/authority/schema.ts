import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import type Database from "better-sqlite3"

// ---------------------------------------------------------------------------
// Drizzle table definitions (type reference — queries use raw SQL)
// ---------------------------------------------------------------------------

export const authorityLeases = sqliteTable("authority_leases", {
  scope: text("scope").primaryKey(),
  agentId: text("agent_id").notNull(),
  taskId: text("task_id"),
  fenceToken: integer("fence_token").notNull(),
  mode: text("mode", { enum: ["exclusive", "shared"] }).notNull().default("exclusive"),
  ttlSeconds: integer("ttl_seconds").notNull().default(1800),
  acquiredAt: text("acquired_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  renewedAt: text("renewed_at"),
})

export const stateVersions = sqliteTable("state_versions", {
  resourceUri: text("resource_uri").primaryKey(),
  version: integer("version").notNull().default(1),
  contentHash: text("content_hash"),
  updatedBy: text("updated_by"),
  updatedAt: text("updated_at").notNull(),
})

export const fenceTokenSeq = sqliteTable("fence_token_seq", {
  currentValue: integer("current_value").notNull().default(0),
})

// ---------------------------------------------------------------------------
// Schema DDL — raw SQL for CREATE TABLE
// ---------------------------------------------------------------------------

const AUTHORITY_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS authority_leases (
    scope        TEXT PRIMARY KEY,
    agent_id     TEXT NOT NULL,
    task_id      TEXT,
    fence_token  INTEGER NOT NULL,
    mode         TEXT NOT NULL DEFAULT 'exclusive',
    ttl_seconds  INTEGER NOT NULL DEFAULT 1800,
    acquired_at  TEXT NOT NULL,
    expires_at   TEXT NOT NULL,
    renewed_at   TEXT
  );

  CREATE TABLE IF NOT EXISTS state_versions (
    resource_uri TEXT PRIMARY KEY,
    version      INTEGER NOT NULL DEFAULT 1,
    content_hash TEXT,
    updated_by   TEXT,
    updated_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS fence_token_seq (
    current_value INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_leases_scope_expires
    ON authority_leases (scope, expires_at);

  CREATE INDEX IF NOT EXISTS idx_leases_agent
    ON authority_leases (agent_id);
`

/** Apply authority schema. Idempotent — safe to call on every startup. */
export function applyAuthoritySchema(db: Database.Database): void {
  db.exec(AUTHORITY_SCHEMA_SQL)

  // Seed fence_token_seq if empty
  const existing = db.prepare("SELECT COUNT(*) as count FROM fence_token_seq").get() as any
  if (existing.count === 0) {
    db.prepare("INSERT INTO fence_token_seq (current_value) VALUES (0)").run()
  }
}
