// ---------------------------------------------------------------------------
// Context-aware equivalents of content.ts functions.
// Each function takes an explicit ProjectContext instead of relying on
// module-level globals — safe for multi-project Studio.
// ---------------------------------------------------------------------------

import fs from "node:fs"
import path from "node:path"
import type { ProjectContext } from "./config/types"
import type { SherpaConfig } from "./config/types"

/**
 * Build a ProjectContext from a resolved SherpaConfig.
 * This replaces the 3 module-level globals in content.ts.
 */
export function buildProjectContext(config: SherpaConfig): ProjectContext {
  return {
    root: config.projectRoot,
    paths: config.paths,
    claudeMdLocations: config.entities.claudeMdLocations,
    claudeMdScanDirs: config.entities.claudeMdScanDirs,
  }
}

/** Resolve a path relative to a project context's root. */
export function resolveCtxPath(ctx: ProjectContext, relativePath: string): string {
  return path.resolve(ctx.root, relativePath)
}

/** Read a file from a project context. Returns null if not found. */
export function readCtxFile(ctx: ProjectContext, relativePath: string): string | null {
  try {
    return fs.readFileSync(resolveCtxPath(ctx, relativePath), "utf-8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

/** Get file stats (size, mtime). Returns null if not found. */
export function getCtxFileStats(
  ctx: ProjectContext,
  relativePath: string,
): { size: number; mtime: Date } | null {
  try {
    const stat = fs.statSync(resolveCtxPath(ctx, relativePath))
    return { size: stat.size, mtime: stat.mtime }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

/** List markdown files in a directory. Returns relative paths from project root. */
export function listCtxMarkdownFiles(
  ctx: ProjectContext,
  dirPath: string,
  opts?: { recursive?: boolean },
): string[] {
  try {
    const absDir = resolveCtxPath(ctx, dirPath)
    if (!fs.existsSync(absDir)) return []

    const entries = fs.readdirSync(absDir, {
      withFileTypes: true,
      recursive: opts?.recursive,
    })

    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => {
        const entryDir =
          "parentPath" in e && typeof e.parentPath === "string"
            ? e.parentPath
            : (e as unknown as { path?: string }).path ?? absDir
        const absFilePath = path.join(entryDir, e.name)
        return path.relative(ctx.root, absFilePath)
      })
  } catch {
    return []
  }
}

/** List JSON files in a directory. Returns relative paths from project root. */
export function listCtxJsonFiles(ctx: ProjectContext, dirPath: string): string[] {
  try {
    const absDir = resolveCtxPath(ctx, dirPath)
    if (!fs.existsSync(absDir)) return []

    const entries = fs.readdirSync(absDir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".json") && e.name !== ".gitkeep")
      .map((e) => {
        const absFilePath = path.join(absDir, e.name)
        return path.relative(ctx.root, absFilePath)
      })
  } catch {
    return []
  }
}

/** List subdirectory names in a directory. */
export function listCtxSubdirectories(ctx: ProjectContext, dirPath: string): string[] {
  try {
    const absDir = resolveCtxPath(ctx, dirPath)
    if (!fs.existsSync(absDir)) return []

    return fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  } catch {
    return []
  }
}

/** Count files in a directory (non-recursive). */
export function countCtxFiles(ctx: ProjectContext, dirPath: string): number {
  try {
    const absDir = resolveCtxPath(ctx, dirPath)
    if (!fs.existsSync(absDir)) return 0

    return fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((e) => e.isFile()).length
  } catch {
    return 0
  }
}

/**
 * Find all CLAUDE.md files for this project context.
 * Checks static locations + dynamically scans configured directories.
 */
export function findCtxClaudeMdFiles(ctx: ProjectContext): string[] {
  const found: string[] = []

  for (const loc of ctx.claudeMdLocations) {
    if (fs.existsSync(resolveCtxPath(ctx, loc))) {
      found.push(loc)
    }
  }

  for (const scanDir of ctx.claudeMdScanDirs) {
    const absDir = resolveCtxPath(ctx, scanDir)
    if (!fs.existsSync(absDir)) continue

    const dirs = fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())

    for (const dir of dirs) {
      const claudePath = `${scanDir}/${dir.name}/CLAUDE.md`
      if (fs.existsSync(resolveCtxPath(ctx, claudePath)) && !found.includes(claudePath)) {
        found.push(claudePath)
      }
    }
  }

  return found
}
