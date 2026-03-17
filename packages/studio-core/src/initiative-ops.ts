// Initiative CRUD operations.
// Uses raw fs + path with explicit root parameter — no global project root.

import * as fs from "node:fs"
import * as path from "node:path"

import { initiativeFrontmatterSchema } from "./schemas"
import { detectLifecycle, type LifecycleInfo } from "./lifecycle"
import {
  parseValidatedFrontmatter,
  parseFrontmatter,
  extractTitle,
  extractSummarySection,
  extractSection,
} from "./markdown"
import type { InitiativeStatus } from "./types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InitiativeListEntry {
  slug: string
  status: InitiativeStatus
  title: string
  summary: string | null
  type: string | null
  risk: string | null
  created: string
  updated: string
  targets: string[]
  dependencies: string[]
  spawnedFrom: string | null
}

export interface InitiativeFilter {
  status?: InitiativeStatus
}

export interface InitiativeDetail extends InitiativeListEntry {
  hasPlan: boolean
  hasActivity: boolean
  hasResearch: boolean
  iterationCount: number
  lifecycle: LifecycleInfo
}

export interface OpResult<T = void> {
  ok: boolean
  data?: T
  error?: string
}

export interface GovernancePolicy {
  requirePlanBeforeStart: boolean
  allowedTransitions: Record<string, string[]>
}

// ---------------------------------------------------------------------------
// Valid status transitions
// ---------------------------------------------------------------------------

export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["approved", "declined"],
  approved: ["in-progress", "declined"],
  "in-progress": ["integrated", "approved"],
  integrated: ["archived"],
  declined: ["pending"],
  archived: [],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initiativesDir(root: string): string {
  return path.join(root, "docs", "initiatives")
}

function readFileOr(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch {
    return null
  }
}

function listDirs(dirPath: string): string[] {
  try {
    return fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => d.name)
  } catch {
    return []
  }
}

function countIterationFiles(researchDir: string): number {
  try {
    return fs
      .readdirSync(researchDir)
      .filter((f) => /^iteration-\d+\.md$/.test(f)).length
  } catch {
    return 0
  }
}

function dirExists(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory()
  } catch {
    return false
  }
}

function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile()
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

/**
 * List all initiatives under docs/initiatives/.
 * Skips dotfile directories (e.g. .archive).
 * Optionally filter by status.
 */
export function listInitiatives(
  root: string,
  filter?: InitiativeFilter,
): InitiativeListEntry[] {
  const baseDir = initiativesDir(root)
  const slugs = listDirs(baseDir)
  const entries: InitiativeListEntry[] = []

  for (const slug of slugs) {
    const proposalPath = path.join(baseDir, slug, "proposal.md")
    const source = readFileOr(proposalPath)
    if (!source) continue

    const { data, content } = parseValidatedFrontmatter(
      source,
      initiativeFrontmatterSchema,
    )
    if (!data) continue

    if (filter?.status && data.status !== filter.status) continue

    const title = extractTitle(content) ?? slug
    const summary = extractSummarySection(content) ?? null

    entries.push({
      slug,
      status: data.status,
      title,
      summary,
      type: data.type ?? null,
      risk: data.risk ?? null,
      created: String(data.created),
      updated: String(data.updated),
      targets: data.targets ?? [],
      dependencies: data.dependencies ?? [],
      spawnedFrom: data["spawned-from"] ?? null,
    })
  }

  return entries
}

/**
 * Get full detail for a single initiative by slug.
 * Returns null if the initiative does not exist or has invalid frontmatter.
 */
export function getInitiative(
  root: string,
  slug: string,
): InitiativeDetail | null {
  const baseDir = initiativesDir(root)
  const initDir = path.join(baseDir, slug)
  const proposalPath = path.join(initDir, "proposal.md")

  const source = readFileOr(proposalPath)
  if (!source) return null

  const { data, content } = parseValidatedFrontmatter(
    source,
    initiativeFrontmatterSchema,
  )
  if (!data) return null

  const title = extractTitle(content) ?? slug
  const summary = extractSummarySection(content) ?? null

  const hasPlan = fileExists(path.join(initDir, "plan.md"))
  const hasActivity = fileExists(path.join(initDir, "activity.md"))
  const researchDir = path.join(initDir, "research")
  const hasResearch = dirExists(researchDir)
  const iterationCount = countIterationFiles(researchDir)

  // Determine linked workstream status from activity.md worktree field
  let linkedWorkstreamStatus: string | null = null
  if (hasActivity) {
    const activitySource = readFileOr(path.join(initDir, "activity.md"))
    if (activitySource) {
      const { data: actData } = parseFrontmatter(activitySource)
      if (actData && actData.worktree) {
        linkedWorkstreamStatus = "active"
      }
    }
  }

  const lifecycle = detectLifecycle({
    status: data.status,
    hasResearch,
    iterationCount,
    hasPlan,
    linkedWorkstreamStatus,
  })

  return {
    slug,
    status: data.status,
    title,
    summary,
    type: data.type ?? null,
    risk: data.risk ?? null,
    created: String(data.created),
    updated: String(data.updated),
    targets: data.targets ?? [],
    dependencies: data.dependencies ?? [],
    spawnedFrom: data["spawned-from"] ?? null,
    hasPlan,
    hasActivity,
    hasResearch,
    iterationCount,
    lifecycle,
  }
}

/**
 * Extract seeds from the ## Seeds section of an initiative's activity.md.
 * Returns an empty array if there is no activity.md or no Seeds section.
 */
export function getSeeds(root: string, slug: string): string[] {
  const activityPath = path.join(
    initiativesDir(root),
    slug,
    "activity.md",
  )
  const source = readFileOr(activityPath)
  if (!source) return []

  const { content } = parseFrontmatter(source)
  const seedsSection = extractSection(content, "Seeds")
  if (!seedsSection) return []

  // Extract bullet list items (- item text)
  const items: string[] = []
  const regex = /^-\s+(.+)$/gm
  let match
  while ((match = regex.exec(seedsSection)) !== null) {
    if (match[1]) items.push(match[1].trim())
  }

  return items
}
