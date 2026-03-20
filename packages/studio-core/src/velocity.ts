import { execSync } from "child_process"
import fs from "fs"
import path from "path"

import { getDefaultContext } from "./config"
import type { ProjectContext } from "./config/types"
import { resolveCtxPath } from "./context"
import type { ActivityEntry } from "./types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const MOMENTUM_LEVELS = ["active", "cooling", "stale"] as const
export type MomentumLevel = (typeof MOMENTUM_LEVELS)[number]

export interface InitiativeVelocity {
  /** Days since the most recent file modification in the initiative directory. */
  mtimeStaleness: number | null
  /** Days since the last git commit touching the initiative directory. */
  gitStaleness: number | null
  /** Primary staleness signal — git if available, else mtime. */
  staleDays: number | null
  /** Workstream momentum classification. */
  momentum: MomentumLevel | null
  /** Workstream activity stats (null if no workstream). */
  workstreamStats: {
    entryCount: number
    lastEntryDate: string | null
    avgGapDays: number | null
  } | null
  /** Research depth: 0–1 normalized score. */
  researchDepth: number | null
}

// ---------------------------------------------------------------------------
// Staleness thresholds
// ---------------------------------------------------------------------------

/** Days thresholds for momentum classification. */
const ACTIVE_THRESHOLD = 3
const COOLING_THRESHOLD = 7

// ---------------------------------------------------------------------------
// File mtime staleness
// ---------------------------------------------------------------------------

function getMostRecentMtime(dirPath: string, ctx: ProjectContext): Date | null {
  const absDir = resolveCtxPath(ctx, dirPath)
  if (!fs.existsSync(absDir)) return null

  let latest: Date | null = null

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else {
        const stat = fs.statSync(full)
        if (!latest || stat.mtime > latest) {
          latest = stat.mtime
        }
      }
    }
  }

  walk(absDir)
  return latest
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function getMtimeStaleness(slug: string, ctx: ProjectContext): number | null {
  const mtime = getMostRecentMtime(`docs/initiatives/${slug}`, ctx)
  return mtime ? daysSince(mtime) : null
}

// ---------------------------------------------------------------------------
// Git commit recency
// ---------------------------------------------------------------------------

function getGitStaleness(slug: string, projectRoot: string): number | null {
  try {
    const result = execSync(
      `git log --format="%ai" -1 -- "docs/initiatives/${slug}/"`,
      { cwd: projectRoot, timeout: 5000, encoding: "utf-8" },
    ).trim()

    if (!result) return null

    const commitDate = new Date(result)
    if (isNaN(commitDate.getTime())) return null

    return daysSince(commitDate)
  } catch {
    return null // git not available — graceful fallback
  }
}

// ---------------------------------------------------------------------------
// Workstream momentum
// ---------------------------------------------------------------------------

function classifyMomentum(
  activityLog: ActivityEntry[],
): { momentum: MomentumLevel; stats: InitiativeVelocity["workstreamStats"] } {
  if (activityLog.length === 0) {
    return {
      momentum: "stale",
      stats: { entryCount: 0, lastEntryDate: null, avgGapDays: null },
    }
  }

  const sorted = [...activityLog].sort((a, b) =>
    b.date.localeCompare(a.date),
  )
  const lastEntryDate = sorted[0]!.date
  const lastDate = new Date(lastEntryDate + "T00:00:00")
  const daysSinceLast = daysSince(lastDate)

  let avgGapDays: number | null = null
  if (sorted.length >= 2) {
    let totalGap = 0
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = new Date(sorted[i]!.date + "T00:00:00")
      const b = new Date(sorted[i + 1]!.date + "T00:00:00")
      totalGap += Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)
    }
    avgGapDays = Math.round((totalGap / (sorted.length - 1)) * 10) / 10
  }

  let momentum: MomentumLevel
  if (daysSinceLast <= ACTIVE_THRESHOLD) {
    momentum = "active"
  } else if (daysSinceLast <= COOLING_THRESHOLD) {
    momentum = "cooling"
  } else {
    momentum = "stale"
  }

  return {
    momentum,
    stats: {
      entryCount: sorted.length,
      lastEntryDate,
      avgGapDays,
    },
  }
}

// ---------------------------------------------------------------------------
// Research depth
// ---------------------------------------------------------------------------

function computeResearchDepth(
  iterationCount: number,
  openQuestionCount: number,
): number | null {
  if (iterationCount === 0 && openQuestionCount === 0) return null
  if (iterationCount > 0 && openQuestionCount === 0) return 1.0
  return iterationCount / (iterationCount + openQuestionCount)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getInitiativeVelocity(
  slug: string,
  opts?: {
    activityLog?: ActivityEntry[]
    iterationCount?: number
    openQuestionCount?: number
  },
  ctx?: ProjectContext,
): InitiativeVelocity {
  const c = ctx ?? getDefaultContext()
  const mtimeStaleness = getMtimeStaleness(slug, c)
  const gitStaleness = getGitStaleness(slug, c.root)
  const staleDays = gitStaleness ?? mtimeStaleness

  let momentum: MomentumLevel | null = null
  let workstreamStats: InitiativeVelocity["workstreamStats"] = null

  if (opts?.activityLog) {
    const result = classifyMomentum(opts.activityLog)
    momentum = result.momentum
    workstreamStats = result.stats
  }

  const researchDepth =
    opts?.iterationCount !== undefined && opts?.openQuestionCount !== undefined
      ? computeResearchDepth(opts.iterationCount, opts.openQuestionCount)
      : null

  return {
    mtimeStaleness,
    gitStaleness,
    staleDays,
    momentum,
    workstreamStats,
    researchDepth,
  }
}

export function getAllVelocity(
  initiatives: {
    slug: string
    activityLog?: ActivityEntry[]
    iterationCount?: number
    openQuestionCount?: number
  }[],
  ctx?: ProjectContext,
): Map<string, InitiativeVelocity> {
  const c = ctx ?? getDefaultContext()
  const map = new Map<string, InitiativeVelocity>()
  for (const init of initiatives) {
    map.set(
      init.slug,
      getInitiativeVelocity(init.slug, {
        activityLog: init.activityLog,
        iterationCount: init.iterationCount,
        openQuestionCount: init.openQuestionCount,
      }, c),
    )
  }
  return map
}
