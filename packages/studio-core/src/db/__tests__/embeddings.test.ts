import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { openDb, closeAll } from "../connection"
import { applyKnowledgeSchema } from "../knowledge-schema"
import { syncFromFilesystem } from "../knowledge-sync"
import { syncEmbeddings } from "../knowledge-embeddings"
import { AlgorithmicBackend } from "../../knowledge/algorithmic"
import { DEFAULT_PATHS } from "../../config/defaults"
import type { ProjectContext } from "../../config/types"

function writeFixture(dir: string, relativePath: string, content: string) {
  const abs = path.join(dir, relativePath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
}

function makeCtx(root: string): ProjectContext {
  return { root, paths: DEFAULT_PATHS, claudeMdLocations: [], claudeMdScanDirs: [] }
}

describe("syncEmbeddings", () => {
  let tmpDir: string
  let dbPath: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sek-embed-"))
    dbPath = path.join(tmpDir, ".sherpa", "knowledge.db")

    // Create 3 initiative proposals — 2 related (sqlite), 1 unrelated (UI)
    writeFixture(tmpDir, "docs/initiatives/sqlite-state/proposal.md", [
      "---",
      "status: approved",
      "initiative: sqlite-state",
      "created: 2026-03-16",
      "updated: '2026-03-16'",
      "type: new-plan",
      "risk: structural",
      "targets: []",
      "dependencies: []",
      "spawned-from: null",
      "---",
      "",
      "# SQLite Agentic State",
      "",
      "## Summary",
      "",
      "Use SQLite in WAL mode as the backing store for agent coordination and task claims.",
      "",
      "## Rationale",
      "",
      "SQLite handles concurrent access well with WAL mode and busy timeout.",
    ].join("\n"))

    writeFixture(tmpDir, "docs/initiatives/knowledge-engine/proposal.md", [
      "---",
      "status: approved",
      "initiative: knowledge-engine",
      "created: 2026-03-16",
      "updated: '2026-03-16'",
      "type: new-plan",
      "risk: structural",
      "targets: []",
      "dependencies:",
      "  - sqlite-state",
      "spawned-from: null",
      "---",
      "",
      "# Knowledge Engine",
      "",
      "## Summary",
      "",
      "Build a SQLite-backed knowledge index with full-text search and embeddings.",
      "",
      "## Rationale",
      "",
      "Agents need queryable access to the governance markdown corpus via SQLite.",
    ].join("\n"))

    writeFixture(tmpDir, "docs/initiatives/design-system/proposal.md", [
      "---",
      "status: pending",
      "initiative: design-system",
      "created: 2026-03-16",
      "updated: '2026-03-16'",
      "type: new-plan",
      "risk: additive",
      "targets: []",
      "dependencies: []",
      "spawned-from: null",
      "---",
      "",
      "# Design System",
      "",
      "## Summary",
      "",
      "Build a React component library with accessibility and theming support.",
      "",
      "## Rationale",
      "",
      "Consistent UI components reduce duplication across studio applications.",
    ].join("\n"))
  })

  afterEach(() => {
    closeAll()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it("creates summaries for all initiative proposals", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, makeCtx(tmpDir))

    const backend = new AlgorithmicBackend()
    const stats = syncEmbeddings(db, backend)

    expect(stats.summariesCreated).toBe(3)

    const summaries = db.prepare("SELECT id, level, summary FROM summaries ORDER BY id").all() as Array<{
      id: string; level: string; summary: string
    }>
    expect(summaries).toHaveLength(3)
    expect(summaries.every(s => s.level === "initiative")).toBe(true)
    expect(summaries.find(s => s.id === "sqlite-state")!.summary).toContain("SQLite")
  })

  it("stores embeddings as JSON arrays", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, makeCtx(tmpDir))
    syncEmbeddings(db, new AlgorithmicBackend())

    const row = db.prepare("SELECT embedding FROM summaries WHERE id = ?").get("sqlite-state") as { embedding: string }
    const embedding = JSON.parse(row.embedding)
    expect(Array.isArray(embedding)).toBe(true)
    expect(embedding.length).toBeGreaterThan(0)
    expect(embedding.every((v: unknown) => typeof v === "number")).toBe(true)
  })

  it("creates inferred edges with similarity scores", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, makeCtx(tmpDir))
    syncEmbeddings(db, new AlgorithmicBackend())

    const edges = db.prepare("SELECT source, target, similarity, kind FROM inferred_edges ORDER BY similarity DESC").all() as Array<{
      source: string; target: string; similarity: number; kind: string
    }>
    expect(edges.length).toBeGreaterThan(0)
    expect(edges[0]!.kind).toBe("semantic-neighbor")
    expect(edges[0]!.similarity).toBeGreaterThan(0)
  })

  it("ranks related initiatives higher than unrelated ones", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, makeCtx(tmpDir))
    syncEmbeddings(db, new AlgorithmicBackend())

    // sqlite-state and knowledge-engine should have higher similarity than either to design-system
    const sqliteToKnowledge = db.prepare(
      "SELECT similarity FROM inferred_edges WHERE source = ? AND target = ?"
    ).get("sqlite-state", "knowledge-engine") as { similarity: number } | undefined

    const sqliteToDesign = db.prepare(
      "SELECT similarity FROM inferred_edges WHERE source = ? AND target = ?"
    ).get("sqlite-state", "design-system") as { similarity: number } | undefined

    expect(sqliteToKnowledge).toBeDefined()
    expect(sqliteToDesign).toBeDefined()
    expect(sqliteToKnowledge!.similarity).toBeGreaterThan(sqliteToDesign!.similarity)
  })

  it("is idempotent — second run updates, not duplicates", () => {
    const db = openDb(dbPath)
    applyKnowledgeSchema(db)
    syncFromFilesystem(db, makeCtx(tmpDir))
    const backend = new AlgorithmicBackend()

    syncEmbeddings(db, backend)
    syncEmbeddings(db, backend)

    const summaries = db.prepare("SELECT COUNT(*) as c FROM summaries").get() as { c: number }
    expect(summaries.c).toBe(3)
  })
})
