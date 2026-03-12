import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
import {
  createEmptyManifest,
  writeManifest,
  hashContent,
  type SherpaManifest,
} from "../manifest.js"

// ---------------------------------------------------------------------------
// Convention files to scaffold
// ---------------------------------------------------------------------------

const CONVENTION_FILES: Record<string, string> = {
  ".claude/rules/initiative-convention.md": `# Initiative Convention

Initiatives live in \`docs/initiatives/<slug>/\`. Each has a \`proposal.md\` with YAML frontmatter.

## Required Files
- \`proposal.md\` — status, slug, created, updated, type, risk, targets, dependencies
- \`activity.md\` — added when work begins (lightweight activity log)
- \`plan.md\` — added when planning begins

## Lifecycle
pending → approved → in-progress → integrated (or declined/archived)
`,

  ".claude/rules/worktree-conventions.md": `# Git Worktree Conventions

All worktrees live in \`.worktrees/\` within the project root.

## Lifecycle
1. Create: \`git worktree add .worktrees/<name> -b <branch>\`
2. Work: Operate on files under the worktree path
3. Merge: PR from worktree branch into main
4. Cleanup: \`git worktree remove .worktrees/<name>\`

## Rules
- One concern per worktree
- Branch from main unless you need another base
- Prefer short-lived worktrees
`,

  ".claude/rules/behavioral-engineering.md": `# Behavioral Engineering

Agent roles are defined through behavioral constraints, not identity claims.

## What to Use
- Behavioral defaults: "Default to NEEDS WORK. Require evidence for approval."
- Explicit fail triggers: "Flag any claim of 'no issues found' without evidence."
- Domain scoping: Focus areas and technologies
- Quality standards: Concrete acceptance criteria

## What to Avoid
- Identity claims: "You are an expert X"
- Personality traits as identity
- Experience claims
`,
}

const SCAFFOLD_DIRS = [
  "docs/initiatives",
  "docs/tasks",
  "docs/agents/roles",
  ".claude/rules",
]

const CONFIG_TEMPLATE = `import { defineConfig } from "@sherpa/studio-core/config"

export default defineConfig({
  // projectRoot defaults to process.cwd()
  admin: {
    projectName: "My Project",
  },
})
`

// ---------------------------------------------------------------------------
// Init command
// ---------------------------------------------------------------------------

export async function init(projectRoot: string): Promise<void> {
  console.log(chalk.bold("\nSherpa Studio — Project Init\n"))

  // 1. Create directories
  for (const dir of SCAFFOLD_DIRS) {
    const fullPath = path.join(projectRoot, dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(chalk.green("  created ") + dir + "/")
    } else {
      console.log(chalk.dim("  exists  ") + dir + "/")
    }
  }

  // 2. Write convention files
  const manifest: SherpaManifest = createEmptyManifest("0.1.0")

  for (const [relativePath, content] of Object.entries(CONVENTION_FILES)) {
    const fullPath = path.join(projectRoot, relativePath)
    const dir = path.dirname(fullPath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (fs.existsSync(fullPath)) {
      console.log(chalk.dim("  exists  ") + relativePath)
    } else {
      fs.writeFileSync(fullPath, content)
      console.log(chalk.green("  created ") + relativePath)
    }

    const hash = hashContent(content)
    manifest.files[relativePath] = {
      upstreamHash: hash,
      localHashAtSync: hash,
      status: "synced",
      syncedVersion: "0.1.0",
      syncedAt: new Date().toISOString(),
    }
  }

  // 3. Write sherpa.config.ts if not exists
  const configPath = path.join(projectRoot, "sherpa.config.ts")
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, CONFIG_TEMPLATE)
    console.log(chalk.green("  created ") + "sherpa.config.ts")
  } else {
    console.log(chalk.dim("  exists  ") + "sherpa.config.ts")
  }

  // 4. Write manifest
  writeManifest(projectRoot, manifest)
  console.log(chalk.green("  created ") + "sherpa.manifest.json")

  // 5. Add .sherpa/ to .gitignore if not present
  const gitignorePath = path.join(projectRoot, ".gitignore")
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, "utf-8")
    if (!gitignore.includes(".sherpa/")) {
      fs.appendFileSync(gitignorePath, "\n# Sherpa cache\n.sherpa/\n")
      console.log(chalk.green("  updated ") + ".gitignore (added .sherpa/)")
    }
  }

  console.log(chalk.bold.green("\nDone!") + " Run " + chalk.cyan("sherpa sync") + " to check for convention updates.\n")
}
