# Semantic Knowledge Engine — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a SQLite-backed knowledge index that syncs markdown files into queryable tables with full-text search, enabling agents to get truthful context at any scale through MCP tools.

**Architecture:** Single SQLite file (`.sherpa/knowledge.db`) in WAL mode, synced from the filesystem via `packages/studio-core/src/db/`. Uses `node:sqlite` (built-in, experimental in Node 24). Connection factory abstracts the driver so `better-sqlite3` can be swapped in if needed. The database is derived — deletable and rebuildable from markdown files at any time.

**Tech Stack:** `node:sqlite` (DatabaseSync), gray-matter (already a dependency), vitest for tests.

---

## Session 1: SQLite Schema + Sync Pipeline

### Task 1: Connection Factory

**Files:**
- Create: `packages/studio-core/src/db/connection.ts`
- Test: `packages/studio-core/src/db/__tests__/connection.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/studio-core/src/db/__tests__/connection.test.ts
import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openKnowledgeDb, closeKnowledgeDb } from "../connection"

describe("openKnowledgeDb", () => {
  let tmpDir: string

  afterEach(() => {
    closeKnowledgeDb()
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it("creates the database file and parent directory", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sek-"))
    const dbPath = path.join(tmpDir, ".sherpa", "knowledge.db")
    const db = openKnowledgeDb(dbPath)
    expect(db).toBeDefined()
    expect(fs.existsSync(dbPath)).toBe(true)
  })

  it("configures WAL mode", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sek-"))
    const dbPath = path.join(tmpDir, ".sherpa", "knowledge.db")
    const db = openKnowledgeDb(dbPath)
    const row = db.prepare("PRAGMA journal_mode").get() as { journal_mode: string }
    expect(row.journal_mode).toBe("wal")
  })

  it("returns the same instance on repeated calls", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sek-"))
    const dbPath = path.join(tmpDir, ".sherpa", "knowledge.db")
    const db1 = openKnowledgeDb(dbPath)
    const db2 = openKnowledgeDb(dbPath)
    expect(db1).toBe(db2)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/connection.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// packages/studio-core/src/db/connection.ts
import { DatabaseSync } from "node:sqlite"
import fs from "node:fs"
import path from "node:path"

let _db: DatabaseSync | null = null
let _dbPath: string | null = null

/**
 * Open (or return existing) knowledge database.
 * Creates parent directories and configures WAL mode.
 */
export function openKnowledgeDb(dbPath: string): DatabaseSync {
  if (_db && _dbPath === dbPath) return _db

  // Close existing connection if path changed
  if (_db) {
    _db.close()
    _db = null
    _dbPath = null
  }

  // Ensure parent directory exists
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new DatabaseSync(dbPath)

  // Configure for concurrent reads + serialized writes
  db.exec("PRAGMA journal_mode = WAL")
  db.exec("PRAGMA synchronous = NORMAL")
  db.exec("PRAGMA busy_timeout = 5000")
  db.exec("PRAGMA foreign_keys = ON")

  _db = db
  _dbPath = dbPath
  return db
}

/**
 * Close the knowledge database connection.
 */
export function closeKnowledgeDb(): void {
  if (_db) {
    _db.close()
    _db = null
    _dbPath = null
  }
}

/**
 * Get the current database instance. Throws if not opened.
 */
export function getKnowledgeDb(): DatabaseSync {
  if (!_db) throw new Error("Knowledge database not opened. Call openKnowledgeDb() first.")
  return _db
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/connection.test.ts`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/connection.ts packages/studio-core/src/db/__tests__/connection.test.ts
git commit -m "feat(knowledge-engine): add SQLite connection factory with WAL mode"
```

---

### Task 2: Schema Module

**Files:**
- Create: `packages/studio-core/src/db/schema.ts`
- Test: `packages/studio-core/src/db/__tests__/schema.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/studio-core/src/db/__tests__/schema.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openKnowledgeDb, closeKnowledgeDb } from "../connection"
import { applySchema, SCHEMA_VERSION } from "../schema"

describe("applySchema", () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sek-"))
  })

  afterEach(() => {
    closeKnowledgeDb()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it("creates all required tables", () => {
    const db = openKnowledgeDb(path.join(tmpDir, "knowledge.db"))
    applySchema(db)

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as Array<{ name: string }>
    const names = tables.map((t) => t.name)

    expect(names).toContain("files")
    expect(names).toContain("edges")
    expect(names).toContain("summaries")
    expect(names).toContain("schema_version")
  })

  it("creates files table with expected columns", () => {
    const db = openKnowledgeDb(path.join(tmpDir, "knowledge.db"))
    applySchema(db)

    const cols = db
      .prepare("PRAGMA table_info(files)")
      .all() as Array<{ name: string }>
    const colNames = cols.map((c) => c.name)

    expect(colNames).toContain("path")
    expect(colNames).toContain("content_hash")
    expect(colNames).toContain("content")
    expect(colNames).toContain("frontmatter")
    expect(colNames).toContain("title")
    expect(colNames).toContain("kind")
    expect(colNames).toContain("initiative")
    expect(colNames).toContain("status")
    expect(colNames).toContain("updated_at")
  })

  it("creates edges table with unique constraint", () => {
    const db = openKnowledgeDb(path.join(tmpDir, "knowledge.db"))
    applySchema(db)

    // Insert an edge
    db.prepare("INSERT INTO edges (source, target, kind) VALUES (?, ?, ?)").run("a", "b", "depends-on")

    // Duplicate should fail
    expect(() => {
      db.prepare("INSERT INTO edges (source, target, kind) VALUES (?, ?, ?)").run("a", "b", "depends-on")
    }).toThrow()
  })

  it("creates FTS5 virtual table for full-text search", () => {
    const db = openKnowledgeDb(path.join(tmpDir, "knowledge.db"))
    applySchema(db)

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='files_fts'")
      .all() as Array<{ name: string }>
    expect(tables).toHaveLength(1)
  })

  it("stores schema version", () => {
    const db = openKnowledgeDb(path.join(tmpDir, "knowledge.db"))
    applySchema(db)

    const row = db.prepare("SELECT version FROM schema_version").get() as { version: number }
    expect(row.version).toBe(SCHEMA_VERSION)
  })

  it("is idempotent — safe to call twice", () => {
    const db = openKnowledgeDb(path.join(tmpDir, "knowledge.db"))
    applySchema(db)
    applySchema(db) // should not throw

    const row = db.prepare("SELECT version FROM schema_version").get() as { version: number }
    expect(row.version).toBe(SCHEMA_VERSION)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/schema.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// packages/studio-core/src/db/schema.ts
import type { DatabaseSync } from "node:sqlite"

export const SCHEMA_VERSION = 1

/**
 * Apply the knowledge engine schema to a database.
 * Idempotent — safe to call on an already-initialized database.
 */
export function applySchema(db: DatabaseSync): void {
  const existing = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'")
    .get() as { name: string } | undefined

  if (existing) {
    const row = db.prepare("SELECT version FROM schema_version").get() as { version: number }
    if (row.version >= SCHEMA_VERSION) return
  }

  db.exec(`
    -- Every markdown file in docs/
    CREATE TABLE IF NOT EXISTS files (
      path         TEXT PRIMARY KEY,
      content_hash TEXT NOT NULL,
      content      TEXT NOT NULL,
      frontmatter  TEXT,          -- JSON blob
      title        TEXT,
      kind         TEXT,          -- initiative | task | research | activity | plan | agent | rule | skill
      initiative   TEXT,          -- parent initiative slug
      status       TEXT,
      updated_at   INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_files_kind ON files(kind);
    CREATE INDEX IF NOT EXISTS idx_files_initiative ON files(initiative);
    CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);

    -- Explicit relationships from frontmatter
    CREATE TABLE IF NOT EXISTS edges (
      source TEXT NOT NULL,
      target TEXT NOT NULL,
      kind   TEXT NOT NULL,       -- depends-on | informs | spawned-from | targets | parent-of
      UNIQUE(source, target, kind)
    );

    CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
    CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);

    -- Multi-level summaries
    CREATE TABLE IF NOT EXISTS summaries (
      id         TEXT PRIMARY KEY,
      level      TEXT NOT NULL,   -- file | initiative | cluster | portfolio
      parent_id  TEXT,
      summary    TEXT NOT NULL,
      stale      INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    -- FTS5 virtual table for full-text search over file content
    CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
      path,
      title,
      content,
      content='files',
      content_rowid='rowid'
    );

    -- Schema version tracking
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
  `)

  // Upsert schema version
  db.exec("DELETE FROM schema_version")
  db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(SCHEMA_VERSION)
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/schema.test.ts`
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/schema.ts packages/studio-core/src/db/__tests__/schema.test.ts
git commit -m "feat(knowledge-engine): add SQLite schema with files, edges, summaries, FTS5"
```

---

### Task 3: File Classifier + Edge Extractor (pure functions)

**Files:**
- Create: `packages/studio-core/src/db/classify.ts`
- Test: `packages/studio-core/src/db/__tests__/classify.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/studio-core/src/db/__tests__/classify.test.ts
import { describe, it, expect } from "vitest"
import { classifyFile, extractEdgesFromFrontmatter, computeContentHash } from "../classify"

describe("classifyFile", () => {
  it("classifies initiative proposals", () => {
    expect(classifyFile("docs/initiatives/foo/proposal.md")).toEqual({
      kind: "initiative",
      initiative: "foo",
    })
  })

  it("classifies research files", () => {
    expect(classifyFile("docs/initiatives/foo/research/iteration-1/vector-a.md")).toEqual({
      kind: "research",
      initiative: "foo",
    })
  })

  it("classifies task files", () => {
    expect(classifyFile("docs/tasks/fix-bug.md")).toEqual({
      kind: "task",
      initiative: null,
    })
  })

  it("classifies activity files", () => {
    expect(classifyFile("docs/initiatives/foo/activity.md")).toEqual({
      kind: "activity",
      initiative: "foo",
    })
  })

  it("classifies plan files", () => {
    expect(classifyFile("docs/initiatives/foo/plan.md")).toEqual({
      kind: "plan",
      initiative: "foo",
    })
  })

  it("classifies agent role files", () => {
    expect(classifyFile("agents/code-reviewer.md")).toEqual({
      kind: "agent",
      initiative: null,
    })
    expect(classifyFile("docs/agents/roles/planner.md")).toEqual({
      kind: "agent",
      initiative: null,
    })
  })

  it("classifies rule files", () => {
    expect(classifyFile(".claude/rules/effort-estimation.md")).toEqual({
      kind: "rule",
      initiative: null,
    })
  })

  it("classifies skill files", () => {
    expect(classifyFile(".claude/skills/rr/SKILL.md")).toEqual({
      kind: "skill",
      initiative: null,
    })
  })

  it("returns null kind for unknown paths", () => {
    expect(classifyFile("README.md")).toEqual({
      kind: null,
      initiative: null,
    })
  })
})

describe("extractEdgesFromFrontmatter", () => {
  it("extracts depends-on edges", () => {
    const edges = extractEdgesFromFrontmatter("my-initiative", {
      dependencies: ["sqlite-agentic-state", "mcp-coordination-layer"],
    })
    expect(edges).toContainEqual({ source: "my-initiative", target: "sqlite-agentic-state", kind: "depends-on" })
    expect(edges).toContainEqual({ source: "my-initiative", target: "mcp-coordination-layer", kind: "depends-on" })
  })

  it("extracts informs edges", () => {
    const edges = extractEdgesFromFrontmatter("my-initiative", {
      informs: ["studio-desktop-app"],
    })
    expect(edges).toContainEqual({ source: "my-initiative", target: "studio-desktop-app", kind: "informs" })
  })

  it("extracts spawned-from edge", () => {
    const edges = extractEdgesFromFrontmatter("child-initiative", {
      "spawned-from": "parent-initiative",
    })
    expect(edges).toContainEqual({ source: "child-initiative", target: "parent-initiative", kind: "spawned-from" })
  })

  it("extracts targets edges", () => {
    const edges = extractEdgesFromFrontmatter("my-initiative", {
      targets: ["packages/studio-core/src/db/", "packages/studio-mcp/src/server.ts"],
    })
    expect(edges).toHaveLength(2)
    expect(edges[0]!.kind).toBe("targets")
  })

  it("handles missing fields gracefully", () => {
    const edges = extractEdgesFromFrontmatter("my-initiative", {})
    expect(edges).toEqual([])
  })
})

describe("computeContentHash", () => {
  it("returns consistent SHA-256 hex", () => {
    const hash1 = computeContentHash("hello world")
    const hash2 = computeContentHash("hello world")
    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/)
  })

  it("changes when content changes", () => {
    const hash1 = computeContentHash("hello")
    const hash2 = computeContentHash("world")
    expect(hash1).not.toBe(hash2)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/classify.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// packages/studio-core/src/db/classify.ts
import { createHash } from "node:crypto"

export interface FileClassification {
  kind: string | null
  initiative: string | null
}

/**
 * Classify a markdown file by its path.
 * Returns the file kind and parent initiative slug.
 */
export function classifyFile(relativePath: string): FileClassification {
  // Initiative files
  const initMatch = relativePath.match(/^docs\/initiatives\/([^/]+)\//)
  if (initMatch) {
    const slug = initMatch[1]!
    const rest = relativePath.slice(initMatch[0].length)

    if (rest === "proposal.md") return { kind: "initiative", initiative: slug }
    if (rest === "activity.md") return { kind: "activity", initiative: slug }
    if (rest === "plan.md") return { kind: "plan", initiative: slug }
    if (rest.startsWith("research/")) return { kind: "research", initiative: slug }
    return { kind: null, initiative: slug }
  }

  // Task files
  if (relativePath.startsWith("docs/tasks/") && relativePath.endsWith(".md")) {
    return { kind: "task", initiative: null }
  }

  // Agent roles
  if (relativePath.startsWith("agents/") || relativePath.startsWith("docs/agents/roles/")) {
    return { kind: "agent", initiative: null }
  }

  // Rules
  if (relativePath.startsWith(".claude/rules/")) {
    return { kind: "rule", initiative: null }
  }

  // Skills
  if (relativePath.startsWith(".claude/skills/")) {
    return { kind: "skill", initiative: null }
  }

  return { kind: null, initiative: null }
}

export interface Edge {
  source: string
  target: string
  kind: string
}

/**
 * Extract relationship edges from initiative frontmatter.
 */
export function extractEdgesFromFrontmatter(
  initiativeSlug: string,
  frontmatter: Record<string, unknown>,
): Edge[] {
  const edges: Edge[] = []

  const deps = frontmatter.dependencies
  if (Array.isArray(deps)) {
    for (const dep of deps) {
      if (typeof dep === "string") {
        edges.push({ source: initiativeSlug, target: dep, kind: "depends-on" })
      }
    }
  }

  const informs = frontmatter.informs
  if (Array.isArray(informs)) {
    for (const target of informs) {
      if (typeof target === "string") {
        edges.push({ source: initiativeSlug, target, kind: "informs" })
      }
    }
  }

  const spawnedFrom = frontmatter["spawned-from"]
  if (typeof spawnedFrom === "string") {
    edges.push({ source: initiativeSlug, target: spawnedFrom, kind: "spawned-from" })
  }

  const targets = frontmatter.targets
  if (Array.isArray(targets)) {
    for (const target of targets) {
      if (typeof target === "string") {
        edges.push({ source: initiativeSlug, target, kind: "targets" })
      }
    }
  }

  return edges
}

/**
 * Compute SHA-256 hash of content for change detection.
 */
export function computeContentHash(content: string): string {
  return createHash("sha256").update(content).digest("hex")
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/classify.test.ts`
Expected: PASS (11 tests)

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/classify.ts packages/studio-core/src/db/__tests__/classify.test.ts
git commit -m "feat(knowledge-engine): add file classifier and edge extractor"
```

---

### Task 4: Sync Pipeline

**Files:**
- Create: `packages/studio-core/src/db/sync.ts`
- Test: `packages/studio-core/src/db/__tests__/sync.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/studio-core/src/db/__tests__/sync.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openKnowledgeDb, closeKnowledgeDb } from "../connection"
import { applySchema } from "../schema"
import { syncFromFilesystem } from "../sync"

function writeFixture(dir: string, relativePath: string, content: string) {
  const abs = path.join(dir, relativePath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
}

describe("syncFromFilesystem", () => {
  let tmpDir: string
  let dbPath: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sek-sync-"))
    dbPath = path.join(tmpDir, ".sherpa", "knowledge.db")

    // Create a minimal initiative fixture
    writeFixture(tmpDir, "docs/initiatives/test-init/proposal.md", [
      "---",
      "status: approved",
      "initiative: test-init",
      "created: 2026-03-16",
      "updated: '2026-03-16'",
      "type: new-plan",
      "risk: additive",
      "targets:",
      "  - packages/studio-core/src/foo.ts",
      "dependencies:",
      "  - sqlite-agentic-state",
      "informs:",
      "  - studio-desktop-app",
      "spawned-from: null",
      "---",
      "",
      "# Test Initiative",
      "",
      "## Summary",
      "",
      "A test initiative for sync testing.",
    ].join("\n"))

    // Create a task fixture
    writeFixture(tmpDir, "docs/tasks/fix-bug.md", [
      "---",
      "id: fix-bug",
      "status: pending",
      "role: engineer",
      "priority: medium",
      "---",
      "",
      "# Fix Bug",
      "",
      "Fix the thing.",
    ].join("\n"))
  })

  afterEach(() => {
    closeKnowledgeDb()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it("indexes markdown files into the files table", () => {
    const db = openKnowledgeDb(dbPath)
    applySchema(db)
    const stats = syncFromFilesystem(db, tmpDir)

    expect(stats.filesProcessed).toBe(2)
    expect(stats.filesSkipped).toBe(0)

    const rows = db.prepare("SELECT path, kind, initiative, status FROM files ORDER BY path").all() as Array<{
      path: string; kind: string; initiative: string | null; status: string
    }>
    expect(rows).toHaveLength(2)
    expect(rows[0]!.kind).toBe("initiative")
    expect(rows[0]!.initiative).toBe("test-init")
    expect(rows[0]!.status).toBe("approved")
    expect(rows[1]!.kind).toBe("task")
  })

  it("extracts edges from frontmatter", () => {
    const db = openKnowledgeDb(dbPath)
    applySchema(db)
    syncFromFilesystem(db, tmpDir)

    const edges = db.prepare("SELECT source, target, kind FROM edges ORDER BY kind").all() as Array<{
      source: string; target: string; kind: string
    }>

    expect(edges).toContainEqual({ source: "test-init", target: "sqlite-agentic-state", kind: "depends-on" })
    expect(edges).toContainEqual({ source: "test-init", target: "studio-desktop-app", kind: "informs" })
    expect(edges).toContainEqual({ source: "test-init", target: "packages/studio-core/src/foo.ts", kind: "targets" })
  })

  it("skips unchanged files on second sync", () => {
    const db = openKnowledgeDb(dbPath)
    applySchema(db)
    syncFromFilesystem(db, tmpDir)
    const stats2 = syncFromFilesystem(db, tmpDir)

    expect(stats2.filesSkipped).toBe(2)
    expect(stats2.filesProcessed).toBe(0)
  })

  it("re-indexes changed files", () => {
    const db = openKnowledgeDb(dbPath)
    applySchema(db)
    syncFromFilesystem(db, tmpDir)

    // Modify the proposal
    writeFixture(tmpDir, "docs/initiatives/test-init/proposal.md", [
      "---",
      "status: in-progress",
      "initiative: test-init",
      "created: 2026-03-16",
      "updated: '2026-03-16'",
      "type: new-plan",
      "risk: additive",
      "targets: []",
      "dependencies: []",
      "spawned-from: null",
      "---",
      "",
      "# Test Initiative",
      "",
      "## Summary",
      "",
      "Updated content.",
    ].join("\n"))

    const stats2 = syncFromFilesystem(db, tmpDir)
    expect(stats2.filesProcessed).toBe(1)

    const row = db.prepare("SELECT status FROM files WHERE initiative = ?").get("test-init") as { status: string }
    expect(row.status).toBe("in-progress")
  })

  it("populates FTS5 index for search", () => {
    const db = openKnowledgeDb(dbPath)
    applySchema(db)
    syncFromFilesystem(db, tmpDir)

    const results = db
      .prepare("SELECT path FROM files_fts WHERE files_fts MATCH ?")
      .all("test initiative sync") as Array<{ path: string }>
    expect(results.length).toBeGreaterThan(0)
  })

  it("removes files from DB that no longer exist on disk", () => {
    const db = openKnowledgeDb(dbPath)
    applySchema(db)
    syncFromFilesystem(db, tmpDir)

    // Delete the task file
    fs.unlinkSync(path.join(tmpDir, "docs/tasks/fix-bug.md"))

    const stats2 = syncFromFilesystem(db, tmpDir)
    expect(stats2.filesRemoved).toBe(1)

    const rows = db.prepare("SELECT path FROM files").all()
    expect(rows).toHaveLength(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/sync.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// packages/studio-core/src/db/sync.ts
import type { DatabaseSync } from "node:sqlite"
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { classifyFile, extractEdgesFromFrontmatter, computeContentHash } from "./classify"
import { extractTitle } from "../markdown"

export interface SyncStats {
  filesProcessed: number
  filesSkipped: number
  filesRemoved: number
  edgesCreated: number
}

/** Directories to scan for markdown files, relative to project root. */
const SCAN_DIRS = [
  "docs/initiatives",
  "docs/tasks",
  "docs/agents/roles",
  "agents",
  ".claude/rules",
  ".claude/skills",
]

/**
 * Walk a directory recursively and collect markdown file paths.
 * Returns paths relative to projectRoot.
 */
function walkMarkdownFiles(projectRoot: string, relativeDir: string): string[] {
  const absDir = path.join(projectRoot, relativeDir)
  if (!fs.existsSync(absDir)) return []

  const results: string[] = []
  const entries = fs.readdirSync(absDir, { withFileTypes: true, recursive: true })

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue
    if (entry.name === "README.md") continue

    const parentDir = "parentPath" in entry && typeof entry.parentPath === "string"
      ? entry.parentPath
      : (entry as unknown as { path?: string }).path ?? absDir
    const absPath = path.join(parentDir, entry.name)
    results.push(path.relative(projectRoot, absPath))
  }

  return results
}

/**
 * Sync all markdown files from the filesystem into the knowledge database.
 * Skips files whose content hash hasn't changed. Removes DB entries for deleted files.
 */
export function syncFromFilesystem(db: DatabaseSync, projectRoot: string): SyncStats {
  const stats: SyncStats = { filesProcessed: 0, filesSkipped: 0, filesRemoved: 0, edgesCreated: 0 }

  // Collect all markdown files to index
  const allFiles = new Set<string>()
  for (const dir of SCAN_DIRS) {
    for (const file of walkMarkdownFiles(projectRoot, dir)) {
      allFiles.add(file)
    }
  }

  // Prepared statements
  const getHash = db.prepare("SELECT content_hash FROM files WHERE path = ?")
  const upsertFile = db.prepare(`
    INSERT INTO files (path, content_hash, content, frontmatter, title, kind, initiative, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      content_hash = excluded.content_hash,
      content = excluded.content,
      frontmatter = excluded.frontmatter,
      title = excluded.title,
      kind = excluded.kind,
      initiative = excluded.initiative,
      status = excluded.status,
      updated_at = excluded.updated_at
  `)
  const deleteEdgesForSource = db.prepare("DELETE FROM edges WHERE source = ?")
  const insertEdge = db.prepare("INSERT OR IGNORE INTO edges (source, target, kind) VALUES (?, ?, ?)")
  const deleteFts = db.prepare("DELETE FROM files_fts WHERE path = ?")
  const insertFts = db.prepare("INSERT INTO files_fts (path, title, content) VALUES (?, ?, ?)")

  // Process each file
  for (const relativePath of allFiles) {
    const absPath = path.join(projectRoot, relativePath)
    const content = fs.readFileSync(absPath, "utf-8")
    const hash = computeContentHash(content)

    // Skip if unchanged
    const existing = getHash.get(relativePath) as { content_hash: string } | undefined
    if (existing?.content_hash === hash) {
      stats.filesSkipped++
      continue
    }

    // Parse frontmatter
    let frontmatterData: Record<string, unknown> | null = null
    let bodyContent = content
    try {
      const parsed = matter(content)
      if (parsed.data && Object.keys(parsed.data).length > 0) {
        frontmatterData = parsed.data
      }
      bodyContent = parsed.content
    } catch {
      // If parsing fails, treat as plain content
    }

    const title = extractTitle(content)
    const { kind, initiative } = classifyFile(relativePath)
    const status = frontmatterData?.status as string | null ?? null
    const now = Date.now()

    // Upsert file row
    upsertFile.run(
      relativePath,
      hash,
      content,
      frontmatterData ? JSON.stringify(frontmatterData) : null,
      title,
      kind,
      initiative,
      status,
      now,
    )

    // Update FTS index
    deleteFts.run(relativePath)
    insertFts.run(relativePath, title ?? "", bodyContent)

    // Extract and upsert edges (only for initiatives)
    if (kind === "initiative" && initiative && frontmatterData) {
      deleteEdgesForSource.run(initiative)
      const edges = extractEdgesFromFrontmatter(initiative, frontmatterData)
      for (const edge of edges) {
        insertEdge.run(edge.source, edge.target, edge.kind)
        stats.edgesCreated++
      }
    }

    stats.filesProcessed++
  }

  // Remove DB entries for files that no longer exist on disk
  const dbPaths = db.prepare("SELECT path FROM files").all() as Array<{ path: string }>
  const deleteFile = db.prepare("DELETE FROM files WHERE path = ?")
  for (const { path: dbPath } of dbPaths) {
    if (!allFiles.has(dbPath)) {
      deleteFile.run(dbPath)
      deleteFts.run(dbPath)
      stats.filesRemoved++
    }
  }

  return stats
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/sync.test.ts`
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/sync.ts packages/studio-core/src/db/__tests__/sync.test.ts
git commit -m "feat(knowledge-engine): add filesystem-to-SQLite sync pipeline"
```

---

### Task 5: Barrel Export + Package Wiring

**Files:**
- Create: `packages/studio-core/src/db/index.ts`
- Modify: `packages/studio-core/package.json` (add export)

**Step 1: Create barrel export**

```typescript
// packages/studio-core/src/db/index.ts
export { openKnowledgeDb, closeKnowledgeDb, getKnowledgeDb } from "./connection"
export { applySchema, SCHEMA_VERSION } from "./schema"
export { syncFromFilesystem, type SyncStats } from "./sync"
export { classifyFile, extractEdgesFromFrontmatter, computeContentHash, type FileClassification, type Edge } from "./classify"
```

**Step 2: Add export to package.json**

In `packages/studio-core/package.json`, add to `exports`:
```json
"./db": "./src/db/index.ts"
```

**Step 3: Run typecheck**

Run: `cd packages/studio-core && pnpm check`
Expected: PASS — no type errors

**Step 4: Run all tests**

Run: `cd packages/studio-core && pnpm test`
Expected: PASS — all tests pass (existing + new)

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/index.ts packages/studio-core/package.json
git commit -m "feat(knowledge-engine): add db barrel export and package wiring"
```

---

### Task 6: CLI Sync Command

**Files:**
- Create: `scripts/sync-knowledge-db.ts`

**Step 1: Write the script**

```typescript
// scripts/sync-knowledge-db.ts
/**
 * Sync the knowledge database from the filesystem.
 * Usage: pnpm sync:db
 */
import path from "node:path"
import { openKnowledgeDb, closeKnowledgeDb, applySchema, syncFromFilesystem } from "@sherpa/studio-core/db"

const projectRoot = process.cwd()
const dbPath = path.join(projectRoot, ".sherpa", "knowledge.db")

console.log(`Syncing knowledge database...`)
console.log(`  Project root: ${projectRoot}`)
console.log(`  Database: ${dbPath}`)

const db = openKnowledgeDb(dbPath)
applySchema(db)

const start = Date.now()
const stats = syncFromFilesystem(db, projectRoot)
const elapsed = Date.now() - start

console.log(`\nSync complete in ${elapsed}ms:`)
console.log(`  Files processed: ${stats.filesProcessed}`)
console.log(`  Files skipped (unchanged): ${stats.filesSkipped}`)
console.log(`  Files removed: ${stats.filesRemoved}`)
console.log(`  Edges created: ${stats.edgesCreated}`)

const fileCount = (db.prepare("SELECT COUNT(*) as count FROM files").get() as { count: number }).count
const edgeCount = (db.prepare("SELECT COUNT(*) as count FROM edges").get() as { count: number }).count
console.log(`\nDatabase totals:`)
console.log(`  Files indexed: ${fileCount}`)
console.log(`  Edges tracked: ${edgeCount}`)

closeKnowledgeDb()
```

**Step 2: Add script to root package.json**

In root `package.json`, add to `scripts`:
```json
"sync:db": "tsx scripts/sync-knowledge-db.ts"
```

**Step 3: Add `.sherpa/` to .gitignore**

Append to `.gitignore`:
```
# Knowledge engine database (derived, rebuildable)
.sherpa/
```

**Step 4: Run it against the real codebase**

Run: `pnpm sync:db`
Expected: Indexes all markdown files, reports counts, creates `.sherpa/knowledge.db`

**Step 5: Verify with a quick query**

Run: `node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('.sherpa/knowledge.db'); console.log('Files:', db.prepare('SELECT COUNT(*) as c FROM files').get()); console.log('Edges:', db.prepare('SELECT COUNT(*) as c FROM edges').get()); console.log('Sample:', db.prepare('SELECT path, kind, initiative FROM files LIMIT 5').all()); db.close()"`
Expected: Shows real file counts and sample rows from the Sherpa codebase

**Step 6: Commit**

```bash
git add scripts/sync-knowledge-db.ts package.json .gitignore
git commit -m "feat(knowledge-engine): add pnpm sync:db command"
```

---

## Session 2: FTS5 Search + search_knowledge MCP Tool

> Detailed steps to be planned after Session 1 validates the foundation.

## Session 3: Pluggable Backend Interface + Algorithmic Backend

> Detailed steps to be planned after Session 2.

## Session 4: get_context + get_summary MCP Tools

> Detailed steps to be planned after Session 3.

## Session 5: query_related MCP Tool + Clustering

> Detailed steps to be planned after Session 4.

## Session 6: Git Hooks + File Watcher + Studio Settings

> Detailed steps to be planned after Session 5.
