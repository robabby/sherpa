import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "../connection"
import { applyKnowledgeSchema, KNOWLEDGE_SCHEMA_VERSION } from "../knowledge-schema"
import { syncFromFilesystem } from "../knowledge-sync"

function writeFixture(dir: string, relativePath: string, content: string) {
  const abs = path.join(dir, relativePath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
}

describe("applyKnowledgeSchema", () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sek-"))
  })

  afterEach(() => {
    closeAll()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it("creates all required tables", () => {
    const db = openDb(path.join(tmpDir, "knowledge.db"))
    applyKnowledgeSchema(db)

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as Array<{ name: string }>
    const names = tables.map((t) => t.name)

    expect(names).toContain("files")
    expect(names).toContain("edges")
    expect(names).toContain("schema_version")
  })

  it("creates FTS5 virtual table", () => {
    const db = openDb(path.join(tmpDir, "knowledge.db"))
    applyKnowledgeSchema(db)

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='files_fts'")
      .all()
    expect(tables).toHaveLength(1)
  })

  it("stores schema version", () => {
    const db = openDb(path.join(tmpDir, "knowledge.db"))
    applyKnowledgeSchema(db)

    const row = db
      .prepare("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1")
      .get() as { version: number }
    expect(row.version).toBe(KNOWLEDGE_SCHEMA_VERSION)
  })

  it("is idempotent", () => {
    const db = openDb(path.join(tmpDir, "knowledge.db"))
    applyKnowledgeSchema(db)
    applyKnowledgeSchema(db) // should not throw

    const versions = db
      .prepare("SELECT COUNT(*) as c FROM schema_version WHERE version = ?")
      .get(KNOWLEDGE_SCHEMA_VERSION) as { c: number }
    expect(versions.c).toBe(1)
  })
})

describe("syncFromFilesystem", () => {
  let tmpDir: string
  let dbPath: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sek-sync-"))
    dbPath = path.join(tmpDir, ".sherpa", "knowledge.db")

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
    closeAll()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it("indexes markdown files into the files table", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    const stats = syncFromFilesystem(db, tmpDir)

    expect(stats.filesProcessed).toBe(2)
    expect(stats.filesSkipped).toBe(0)

    const rows = db
      .prepare("SELECT path, kind, initiative, status FROM files ORDER BY path")
      .all() as Array<{ path: string; kind: string; initiative: string | null; status: string }>
    expect(rows).toHaveLength(2)
    expect(rows[0]!.kind).toBe("initiative")
    expect(rows[0]!.initiative).toBe("test-init")
    expect(rows[0]!.status).toBe("approved")
    expect(rows[1]!.kind).toBe("task")
  })

  it("extracts edges from frontmatter", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, tmpDir)

    const edges = db
      .prepare("SELECT source, target, kind FROM edges ORDER BY kind, target")
      .all() as Array<{ source: string; target: string; kind: string }>

    expect(edges).toContainEqual({ source: "test-init", target: "sqlite-agentic-state", kind: "depends-on" })
    expect(edges).toContainEqual({ source: "test-init", target: "studio-desktop-app", kind: "informs" })
    expect(edges).toContainEqual({ source: "test-init", target: "packages/studio-core/src/foo.ts", kind: "targets" })
  })

  it("skips unchanged files on second sync", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, tmpDir)
    const stats2 = syncFromFilesystem(db, tmpDir)

    expect(stats2.filesSkipped).toBe(2)
    expect(stats2.filesProcessed).toBe(0)
  })

  it("re-indexes changed files", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, tmpDir)

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
      "# Test Initiative Updated",
      "",
      "Updated content.",
    ].join("\n"))

    const stats2 = syncFromFilesystem(db, tmpDir)
    expect(stats2.filesProcessed).toBe(1)

    const row = db
      .prepare("SELECT status, title FROM files WHERE initiative = ?")
      .get("test-init") as { status: string; title: string }
    expect(row.status).toBe("in-progress")
    expect(row.title).toBe("Test Initiative Updated")
  })

  it("populates FTS5 index for search", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, tmpDir)

    const results = db
      .prepare("SELECT path FROM files_fts WHERE files_fts MATCH ?")
      .all("test initiative sync") as Array<{ path: string }>
    expect(results.length).toBeGreaterThan(0)
  })

  it("updates FTS5 on re-sync without corruption", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
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
      "spawned-from: null",
      "---",
      "",
      "# Completely New Title",
      "",
      "Entirely different content about fencing tokens.",
    ].join("\n"))

    syncFromFilesystem(db, tmpDir)

    // New content should be found
    const found = db
      .prepare("SELECT path FROM files_fts WHERE files_fts MATCH ?")
      .all("fencing tokens") as Array<{ path: string }>
    expect(found.length).toBe(1)

    // Old content should be gone — this is the A6 regression test
    const gone = db
      .prepare("SELECT path FROM files_fts WHERE files_fts MATCH ?")
      .all("\"sync testing\"") as Array<{ path: string }>
    expect(gone.length).toBe(0)
  })

  it("removes files from DB that no longer exist on disk", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, tmpDir)

    fs.unlinkSync(path.join(tmpDir, "docs/tasks/fix-bug.md"))

    const stats2 = syncFromFilesystem(db, tmpDir)
    expect(stats2.filesRemoved).toBe(1)

    const rows = db.prepare("SELECT path FROM files").all()
    expect(rows).toHaveLength(1)
  })

  it("removes orphaned edges when an initiative proposal is deleted", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, tmpDir)

    // Verify edges exist after initial sync
    const edgesBefore = db.prepare("SELECT COUNT(*) as c FROM edges WHERE source = ?").get("test-init") as { c: number }
    expect(edgesBefore.c).toBeGreaterThan(0)

    // Delete the proposal
    fs.unlinkSync(path.join(tmpDir, "docs/initiatives/test-init/proposal.md"))
    fs.rmdirSync(path.join(tmpDir, "docs/initiatives/test-init"))

    const stats2 = syncFromFilesystem(db, tmpDir)
    expect(stats2.filesRemoved).toBe(1)

    // Edges for that initiative should be gone
    const edgesAfter = db.prepare("SELECT COUNT(*) as c FROM edges WHERE source = ?").get("test-init") as { c: number }
    expect(edgesAfter.c).toBe(0)
  })
})
