import fs from "fs"
import path from "path"

// ---------------------------------------------------------------------------
// Configurable project root
// ---------------------------------------------------------------------------

let _projectRoot: string = process.cwd()

/** Set the project root for all file operations. */
export function setProjectRoot(root: string): void {
  _projectRoot = path.resolve(root)
}

/** Get the current project root. */
export function getProjectRoot(): string {
  return _projectRoot
}

/** Resolve a path relative to the project root. */
export function resolveProjectPath(relativePath: string): string {
  return path.resolve(_projectRoot, relativePath)
}

// ---------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------

/**
 * Read a file by relative path. Returns null if not found.
 */
export function readProjectFile(relativePath: string): string | null {
  try {
    const absPath = resolveProjectPath(relativePath)
    return fs.readFileSync(absPath, "utf-8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

/**
 * Get file stats (size, mtime) for a file.
 * Returns null if file doesn't exist.
 */
export function getFileStats(
  relativePath: string
): { size: number; mtime: Date } | null {
  try {
    const absPath = resolveProjectPath(relativePath)
    const stat = fs.statSync(absPath)
    return { size: stat.size, mtime: stat.mtime }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

/**
 * List markdown files in a directory.
 * Returns relative paths from the project root.
 */
export function listMarkdownFiles(
  dirPath: string,
  opts?: { recursive?: boolean }
): string[] {
  try {
    const absDir = resolveProjectPath(dirPath)
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
        return path.relative(_projectRoot, absFilePath)
      })
  } catch {
    return []
  }
}

/**
 * List JSON files in a directory.
 * Returns relative paths from the project root.
 */
export function listJsonFiles(dirPath: string): string[] {
  try {
    const absDir = resolveProjectPath(dirPath)
    if (!fs.existsSync(absDir)) return []

    const entries = fs.readdirSync(absDir, { withFileTypes: true })

    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".json") && e.name !== ".gitkeep")
      .map((e) => {
        const absFilePath = path.join(absDir, e.name)
        return path.relative(_projectRoot, absFilePath)
      })
  } catch {
    return []
  }
}

/**
 * List subdirectory names in a directory.
 */
export function listSubdirectories(dirPath: string): string[] {
  try {
    const absDir = resolveProjectPath(dirPath)
    if (!fs.existsSync(absDir)) return []

    return fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  } catch {
    return []
  }
}

/**
 * Count files in a directory (non-recursive).
 */
export function countFiles(dirPath: string): number {
  try {
    const absDir = resolveProjectPath(dirPath)
    if (!fs.existsSync(absDir)) return 0

    return fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((e) => e.isFile()).length
  } catch {
    return 0
  }
}

// ---------------------------------------------------------------------------
// CLAUDE.md discovery
// ---------------------------------------------------------------------------

/** Known CLAUDE.md locations to scan. Consumers can override via setClaudeMdLocations(). */
let _claudeMdLocations = [
  "CLAUDE.md",
  "docs/CLAUDE.md",
]

/** Override the default CLAUDE.md scan locations. */
export function setClaudeMdLocations(locations: string[]): void {
  _claudeMdLocations = [...locations]
}

/** Dynamic scan directories for CLAUDE.md files. */
let _claudeMdScanDirs: string[] = []

/** Set directories to dynamically scan for CLAUDE.md files. */
export function setClaudeMdScanDirs(dirs: string[]): void {
  _claudeMdScanDirs = [...dirs]
}

/**
 * Find all CLAUDE.md files from the project.
 * Checks known static locations + dynamically scans configured directories.
 */
export function findClaudeMdFiles(): string[] {
  const found: string[] = []

  // Check known static locations
  for (const loc of _claudeMdLocations) {
    const absPath = resolveProjectPath(loc)
    if (fs.existsSync(absPath)) {
      found.push(loc)
    }
  }

  // Dynamically scan configured directories
  for (const scanDir of _claudeMdScanDirs) {
    const absDir = resolveProjectPath(scanDir)
    if (!fs.existsSync(absDir)) continue

    const dirs = fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())

    for (const dir of dirs) {
      const claudePath = `${scanDir}/${dir.name}/CLAUDE.md`
      const absClaudePath = resolveProjectPath(claudePath)
      if (fs.existsSync(absClaudePath) && !found.includes(claudePath)) {
        found.push(claudePath)
      }
    }
  }

  return found
}
