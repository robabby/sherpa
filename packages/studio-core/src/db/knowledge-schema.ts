import type Database from "better-sqlite3"

export const KNOWLEDGE_SCHEMA_VERSION = 3

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version    INTEGER NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Every markdown file in the governance corpus
  CREATE TABLE IF NOT EXISTS files (
    path         TEXT PRIMARY KEY,
    content_hash TEXT NOT NULL,
    content      TEXT NOT NULL,
    frontmatter  TEXT,
    title        TEXT,
    kind         TEXT,
    initiative   TEXT,
    status       TEXT,
    updated_at   INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_files_kind
    ON files (kind);
  CREATE INDEX IF NOT EXISTS idx_files_initiative
    ON files (initiative);
  CREATE INDEX IF NOT EXISTS idx_files_status
    ON files (status);

  -- Explicit relationships from frontmatter
  CREATE TABLE IF NOT EXISTS edges (
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    kind   TEXT NOT NULL,
    UNIQUE(source, target, kind)
  );

  CREATE INDEX IF NOT EXISTS idx_edges_source
    ON edges (source);
  CREATE INDEX IF NOT EXISTS idx_edges_target
    ON edges (target);

  -- Standalone FTS5 for full-text search (not external-content mode —
  -- INSERT OR REPLACE with content= corrupts the index on re-sync.
  -- See stress-test.md A6 for evidence.)
  CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
    path,
    title,
    content
  );

  -- Multi-level summaries with embeddings
  CREATE TABLE IF NOT EXISTS summaries (
    id         TEXT PRIMARY KEY,
    level      TEXT NOT NULL,
    parent_id  TEXT,
    summary    TEXT NOT NULL,
    embedding  TEXT,
    stale      INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_summaries_level
    ON summaries (level);
  CREATE INDEX IF NOT EXISTS idx_summaries_stale
    ON summaries (stale);

  -- Inferred relationships from embedding similarity
  CREATE TABLE IF NOT EXISTS inferred_edges (
    source     TEXT NOT NULL,
    target     TEXT NOT NULL,
    similarity REAL NOT NULL,
    kind       TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(source, target, kind)
  );

  CREATE INDEX IF NOT EXISTS idx_inferred_source
    ON inferred_edges (source);
  CREATE INDEX IF NOT EXISTS idx_inferred_target
    ON inferred_edges (target);

  -- Auto-formed initiative clusters from embedding similarity
  CREATE TABLE IF NOT EXISTS clusters (
    cluster_id TEXT PRIMARY KEY,
    label      TEXT,
    member_ids TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`

/** Apply knowledge schema. Idempotent — safe to call on every startup. */
export function applyKnowledgeSchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL)

  const existing = db
    .prepare("SELECT 1 FROM schema_version WHERE version = ?")
    .get(KNOWLEDGE_SCHEMA_VERSION)

  if (!existing) {
    db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(
      KNOWLEDGE_SCHEMA_VERSION
    )
  }
}
