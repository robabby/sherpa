import fs from "node:fs"
import path from "node:path"

export const DOTFOLDER = ".sherpa" as const

export const DOTFOLDER_DIRS = [
  "initiatives",
  "tasks",
  "research",
  "rules",
  "skills",
  "agents",
  "db",
] as const

/** Scaffold a .sherpa/ directory at the given project root. */
export function scaffoldDotfolder(projectRoot: string): void {
  const base = path.join(projectRoot, DOTFOLDER)
  for (const dir of DOTFOLDER_DIRS) {
    fs.mkdirSync(path.join(base, dir), { recursive: true })
  }
  const gitignore = path.join(base, "db", ".gitignore")
  if (!fs.existsSync(gitignore)) {
    fs.writeFileSync(gitignore, "*.db\n*.db-wal\n*.db-shm\n")
  }
}

/** Check if a project root has a .sherpa/ directory. */
export function hasDotfolder(projectRoot: string): boolean {
  return fs.existsSync(path.join(projectRoot, DOTFOLDER))
}
