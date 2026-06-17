/**
 * Git-aware document drift.
 *
 * A maintained doc declares `source-initiatives` in its frontmatter; each
 * initiative declares `targets` (the code/doc paths it touches). A doc has
 * "drifted" when those paths received commits after the doc's `last-verified`
 * date — i.e. the code moved but the doc wasn't re-verified.
 *
 * Computed on-demand (the maintained set is small). Reuses the git-by-path
 * pattern from ./velocity. Git unavailability degrades to "no drift".
 */
import { execSync } from "node:child_process"
import { listInitiatives } from "./initiative-ops"
import { getDefaultContext } from "./config"
import type { ProjectContext } from "./config/types"
import type { DocDrift, Provenance } from "./doc-tree-types"

/** Build a slug -> targets[] index from all initiatives (one filesystem pass). */
export function buildInitiativeTargetIndex(ctx?: ProjectContext): Map<string, string[]> {
  const c = ctx ?? getDefaultContext()
  const index = new Map<string, string[]>()
  for (const init of listInitiatives(c.root)) {
    index.set(init.slug, init.targets)
  }
  return index
}

/**
 * Compute drift for a single doc. Returns null when drift is not applicable:
 * the doc is human-owned, has never been verified, or has no source initiatives
 * that resolve to target paths.
 */
export function computeDocDrift(
  provenance: Provenance,
  targetIndex: Map<string, string[]>,
  ctx?: ProjectContext,
): DocDrift | null {
  if (!provenance.maintainedBy || provenance.maintainedBy === "human") return null
  if (!provenance.lastVerified) return null
  if (provenance.sourceInitiatives.length === 0) return null

  const paths = new Set<string>()
  for (const slug of provenance.sourceInitiatives) {
    const targets = targetIndex.get(slug)
    if (targets) for (const t of targets) paths.add(t)
  }
  const relatedPaths = [...paths]
  if (relatedPaths.length === 0) return null

  const c = ctx ?? getDefaultContext()
  const commitsSinceVerified = countCommitsSince(provenance.lastVerified, relatedPaths, c.root)

  return {
    relatedPaths,
    commitsSinceVerified,
    isStale: commitsSinceVerified > 0,
  }
}

/** Count commits touching `paths` since `sinceDate` (YYYY-MM-DD). */
function countCommitsSince(sinceDate: string, paths: string[], cwd: string): number {
  try {
    const pathArgs = paths.map((p) => `"${p.replace(/"/g, "")}"`).join(" ")
    const out = execSync(`git log --format=%h --since="${sinceDate}" -- ${pathArgs}`, {
      cwd,
      timeout: 5000,
      encoding: "utf-8",
    }).trim()
    if (!out) return 0
    return out.split("\n").filter(Boolean).length
  } catch {
    return 0 // git unavailable / bad date — treat as no drift
  }
}
