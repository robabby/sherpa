import fs from "node:fs"
import path from "node:path"
import readline from "node:readline"
import chalk from "chalk"
import {
  readManifest,
  writeManifest,
  hashContent,
  classifyFile,
  type SherpaManifest,
  type ClassifiedFile,
} from "../manifest.js"
import { threeWayMerge, unifiedDiff } from "../merge.js"

// ---------------------------------------------------------------------------
// Upstream convention files (bundled with the CLI)
// ---------------------------------------------------------------------------

function getUpstreamFiles(): Record<string, string> {
  // In the published version, these would be bundled or fetched.
  // For now, read from the framework's convention directory.
  const conventionDir = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "../../conventions",
  )

  const files: Record<string, string> = {}

  if (!fs.existsSync(conventionDir)) {
    return files
  }

  for (const file of fs.readdirSync(conventionDir)) {
    if (!file.endsWith(".md")) continue
    const content = fs.readFileSync(path.join(conventionDir, file), "utf-8")
    files[`.claude/rules/${file}`] = content
  }

  return files
}

// ---------------------------------------------------------------------------
// Interactive prompt (minimal, no external dependency)
// ---------------------------------------------------------------------------

async function prompt(question: string, choices: string[]): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const choiceStr = choices.map((c, i) => `${i + 1}) ${c}`).join("  ")

  return new Promise((resolve) => {
    rl.question(`${question} [${choiceStr}]: `, (answer) => {
      rl.close()
      const idx = parseInt(answer, 10) - 1
      resolve(choices[idx] ?? choices[0])
    })
  })
}

// ---------------------------------------------------------------------------
// Sync command
// ---------------------------------------------------------------------------

export async function sync(projectRoot: string): Promise<void> {
  console.log(chalk.bold("\nSherpa Studio — Convention Sync\n"))

  // 1. Read manifest
  const manifest = readManifest(projectRoot)
  if (!manifest) {
    console.log(chalk.red("No sherpa.manifest.json found.") + " Run " + chalk.cyan("sherpa init") + " first.\n")
    process.exit(1)
  }

  // 2. Get upstream files
  const upstreamFiles = getUpstreamFiles()
  const allPaths = new Set([
    ...Object.keys(manifest.files),
    ...Object.keys(upstreamFiles),
  ])

  // 3. Classify each file
  const classified: ClassifiedFile[] = []
  for (const relativePath of allPaths) {
    const entry = manifest.files[relativePath] ?? null
    const upstream = upstreamFiles[relativePath] ?? null
    classified.push(classifyFile(relativePath, projectRoot, upstream, entry))
  }

  // 4. Display summary
  const synced = classified.filter((f) => f.status === "synced")
  const modified = classified.filter((f) => f.status === "modified")
  const newFiles = classified.filter((f) => f.status === "new")
  const diverged = classified.filter((f) => f.status === "diverged")
  const deleted = classified.filter((f) => f.status === "deleted")
  const orphaned = classified.filter((f) => f.status === "orphaned")

  console.log(chalk.dim(`  ${synced.length} synced`) + "  " +
    (newFiles.length ? chalk.green(`${newFiles.length} new`) + "  " : "") +
    (modified.length ? chalk.yellow(`${modified.length} locally modified`) + "  " : "") +
    (diverged.length ? chalk.red(`${diverged.length} diverged`) + "  " : "") +
    (deleted.length ? chalk.dim(`${deleted.length} deleted`) + "  " : "") +
    (orphaned.length ? chalk.dim(`${orphaned.length} orphaned`) : ""))
  console.log()

  const actionable = [...newFiles, ...diverged]

  if (actionable.length === 0) {
    console.log(chalk.green("Everything is up to date.") + "\n")
    return
  }

  // 5. Process each actionable file
  const updatedManifest: SherpaManifest = { ...manifest, files: { ...manifest.files } }

  for (const file of actionable) {
    if (!file.upstreamContent) continue

    if (file.status === "new" && !file.localContent) {
      // New file from upstream, no local version — auto-apply
      const fullPath = path.join(projectRoot, file.relativePath)
      fs.mkdirSync(path.dirname(fullPath), { recursive: true })
      fs.writeFileSync(fullPath, file.upstreamContent)
      console.log(chalk.green("  applied ") + file.relativePath)

      const hash = hashContent(file.upstreamContent)
      updatedManifest.files[file.relativePath] = {
        upstreamHash: hash,
        localHashAtSync: hash,
        status: "synced",
        syncedVersion: manifest.frameworkVersion,
        syncedAt: new Date().toISOString(),
      }
      continue
    }

    if (file.status === "new" && file.localContent) {
      // Upstream update, local hasn't changed — auto-apply
      const fullPath = path.join(projectRoot, file.relativePath)
      fs.writeFileSync(fullPath, file.upstreamContent)
      console.log(chalk.green("  updated ") + file.relativePath)

      const hash = hashContent(file.upstreamContent)
      updatedManifest.files[file.relativePath] = {
        upstreamHash: hash,
        localHashAtSync: hash,
        status: "synced",
        syncedVersion: manifest.frameworkVersion,
        syncedAt: new Date().toISOString(),
      }
      continue
    }

    if (file.status === "diverged" && file.localContent) {
      // Both changed — three-way merge
      const base = file.manifestEntry
        ? getBaseContent(projectRoot, file.relativePath, file.manifestEntry.upstreamHash)
        : ""

      const result = threeWayMerge(
        base ?? file.localContent,
        file.localContent,
        file.upstreamContent,
      )

      if (result.clean) {
        console.log(chalk.green("  merged  ") + file.relativePath + chalk.dim(" (clean)"))
        const fullPath = path.join(projectRoot, file.relativePath)
        fs.writeFileSync(fullPath, result.merged)

        const upstreamHash = hashContent(file.upstreamContent)
        const localHash = hashContent(result.merged)
        updatedManifest.files[file.relativePath] = {
          upstreamHash,
          localHashAtSync: localHash,
          status: "synced",
          syncedVersion: manifest.frameworkVersion,
          syncedAt: new Date().toISOString(),
        }
      } else {
        // Show diff and prompt
        console.log(chalk.red("  conflict ") + file.relativePath +
          chalk.dim(` (${result.conflictCount} conflict${result.conflictCount > 1 ? "s" : ""})`))

        const diff = unifiedDiff(file.localContent, file.upstreamContent, "local", "upstream")
        console.log(chalk.dim(diff.split("\n").slice(0, 30).join("\n")))

        const choice = await prompt(
          chalk.yellow("  Action?"),
          ["keep-local", "take-upstream", "write-conflicts"],
        )

        const fullPath = path.join(projectRoot, file.relativePath)

        if (choice === "take-upstream") {
          fs.writeFileSync(fullPath, file.upstreamContent)
          const hash = hashContent(file.upstreamContent)
          updatedManifest.files[file.relativePath] = {
            upstreamHash: hash,
            localHashAtSync: hash,
            status: "synced",
            syncedVersion: manifest.frameworkVersion,
            syncedAt: new Date().toISOString(),
          }
        } else if (choice === "write-conflicts") {
          fs.writeFileSync(fullPath, result.merged)
          updatedManifest.files[file.relativePath] = {
            ...updatedManifest.files[file.relativePath],
            upstreamHash: hashContent(file.upstreamContent),
            status: "diverged",
          }
        } else {
          // keep-local — update upstream hash but keep local
          updatedManifest.files[file.relativePath] = {
            ...updatedManifest.files[file.relativePath],
            upstreamHash: hashContent(file.upstreamContent),
            localHashAtSync: hashContent(file.localContent),
            status: "modified",
          }
        }
      }
    }
  }

  // 6. Write updated manifest
  updatedManifest.syncedAt = new Date().toISOString()
  writeManifest(projectRoot, updatedManifest)
  console.log(chalk.dim("\n  Updated sherpa.manifest.json\n"))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Attempt to recover the base content for three-way merge.
 * In a real implementation this would come from a cache or git history.
 * For now, returns null (merge will use empty base).
 */
function getBaseContent(
  _projectRoot: string,
  _relativePath: string,
  _upstreamHash: string,
): string | null {
  // TODO: Implement base content recovery from .sherpa/cache/ or git
  return null
}
