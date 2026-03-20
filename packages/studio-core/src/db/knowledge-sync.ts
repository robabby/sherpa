import type Database from "better-sqlite3"
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { classifyFile, extractEdgesFromFrontmatter, computeContentHash } from "./classify"
import type { ProjectContext } from "../config/types"
import { getAllProjects } from "../projects"
import { resolveDbPaths, openDb } from "./connection"
import { applyKnowledgeSchema } from "./knowledge-schema"

export interface SyncStats {
  filesProcessed: number
  filesSkipped: number
  filesRemoved: number
  edgesCreated: number
}

/** Derive scan directories from a ProjectContext. */
function getScanDirs(ctx: ProjectContext): string[] {
  return [
    ctx.paths.initiatives,
    ctx.paths.tasks,
    ctx.paths.agentRoles,
    ctx.paths.baseCatalog,
    ctx.paths.rules,
    ctx.paths.skills,
  ]
}

/** Extract the first H1 heading from markdown. */
function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() ?? null
}

/** Walk a directory recursively and collect .md file paths relative to projectRoot. */
function walkMarkdownFiles(projectRoot: string, relativeDir: string): string[] {
  const absDir = path.join(projectRoot, relativeDir)
  if (!fs.existsSync(absDir)) return []

  const results: string[] = []

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        // Skip hidden subdirectories (e.g. .archive, .drafts)
        if (!entry.name.startsWith(".")) walk(full)
      } else if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md") {
        results.push(path.relative(projectRoot, full))
      }
    }
  }

  walk(absDir)
  return results
}

/**
 * Sync all markdown files from the filesystem into the knowledge database.
 * Skips files whose content hash hasn't changed. Removes stale DB entries.
 */
export function syncFromFilesystem(db: Database.Database, ctx: ProjectContext): SyncStats {
  const stats: SyncStats = { filesProcessed: 0, filesSkipped: 0, filesRemoved: 0, edgesCreated: 0 }

  // Collect all markdown files
  const allFiles = new Set<string>()
  for (const dir of getScanDirs(ctx)) {
    for (const file of walkMarkdownFiles(ctx.root, dir)) {
      allFiles.add(file)
    }
  }

  // Prepared statements
  const getHash = db.prepare("SELECT content_hash FROM files WHERE path = ?")
  const deleteFile = db.prepare("DELETE FROM files WHERE path = ?")
  const insertFile = db.prepare(`
    INSERT INTO files (path, content_hash, content, frontmatter, title, kind, initiative, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const deleteFts = db.prepare("DELETE FROM files_fts WHERE path = ?")
  const insertFts = db.prepare("INSERT INTO files_fts (path, title, content) VALUES (?, ?, ?)")
  const deleteEdgesForSource = db.prepare("DELETE FROM edges WHERE source = ?")
  const insertEdge = db.prepare("INSERT OR IGNORE INTO edges (source, target, kind) VALUES (?, ?, ?)")
  const markSummaryStale = db.prepare("UPDATE summaries SET stale = 1 WHERE id = ? AND stale = 0")

  // Transactional upsert for a single file — file + FTS + edges in one transaction
  const syncFile = db.transaction((
    relativePath: string,
    hash: string,
    content: string,
    frontmatterJson: string | null,
    title: string | null,
    kind: string | null,
    initiative: string | null,
    status: string | null,
    bodyContent: string,
    frontmatterData: Record<string, unknown> | null,
  ) => {
    deleteFile.run(relativePath)
    deleteFts.run(relativePath)
    insertFile.run(relativePath, hash, content, frontmatterJson, title, kind, initiative, status, Date.now())
    insertFts.run(relativePath, title ?? "", bodyContent)

    // Extract and upsert edges (only for initiative proposals)
    if (kind === "initiative" && initiative && frontmatterData) {
      deleteEdgesForSource.run(initiative)
      const edges = extractEdgesFromFrontmatter(initiative, frontmatterData)
      for (const edge of edges) {
        insertEdge.run(edge.source, edge.target, edge.kind)
        stats.edgesCreated++
      }
    }

    // Mark parent initiative summary as stale when any file in it changes
    if (initiative) {
      markSummaryStale.run(initiative)
    }
  })

  // Process each file
  for (const relativePath of allFiles) {
    const absPath = path.join(ctx.root, relativePath)
    const content = fs.readFileSync(absPath, "utf-8")
    const hash = computeContentHash(content)

    // Skip unchanged files
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
      // Treat as plain content if parsing fails
    }

    const title = extractTitle(content)
    const { kind, initiative } = classifyFile(relativePath, frontmatterData)
    const status = (frontmatterData?.status as string) ?? null

    syncFile(
      relativePath,
      hash,
      content,
      frontmatterData ? JSON.stringify(frontmatterData) : null,
      title,
      kind,
      initiative,
      status,
      bodyContent,
      frontmatterData,
    )

    stats.filesProcessed++
  }

  // Remove DB entries for files that no longer exist on disk (including orphaned edges)
  const dbRows = db.prepare("SELECT path, kind, initiative FROM files").all() as Array<{
    path: string; kind: string | null; initiative: string | null
  }>
  for (const { path: dbPath, kind, initiative } of dbRows) {
    if (!allFiles.has(dbPath)) {
      deleteFile.run(dbPath)
      deleteFts.run(dbPath)
      if (kind === "initiative" && initiative) {
        deleteEdgesForSource.run(initiative)
      }
      stats.filesRemoved++
    }
  }

  return stats
}

/**
 * Sync knowledge databases for all registered projects.
 * Opens a per-project DB, ensures the schema, and runs syncFromFilesystem.
 */
export function syncAllProjects(): Map<string, SyncStats> {
  const results = new Map<string, SyncStats>()
  for (const project of getAllProjects()) {
    const dbPaths = resolveDbPaths(project.root)
    const db = openDb(dbPaths.knowledge)
    applyKnowledgeSchema(db)
    const stats = syncFromFilesystem(db, project.context)
    results.set(project.slug, stats)
  }
  return results
}
