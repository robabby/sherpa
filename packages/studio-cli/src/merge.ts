import { diff3Merge } from "node-diff3"
import { createPatch } from "diff"

// ---------------------------------------------------------------------------
// Three-way merge
// ---------------------------------------------------------------------------

export interface MergeResult {
  /** Whether the merge completed without conflicts. */
  clean: boolean
  /** The merged content (may contain conflict markers if not clean). */
  merged: string
  /** Number of conflict regions. */
  conflictCount: number
}

/**
 * Three-way merge: base (upstream at last sync) + local + upstream (current).
 * Returns merged content with standard conflict markers if conflicts exist.
 */
export function threeWayMerge(
  base: string,
  local: string,
  upstream: string,
): MergeResult {
  const baseLines = base.split("\n")
  const localLines = local.split("\n")
  const upstreamLines = upstream.split("\n")

  const result = diff3Merge(localLines, baseLines, upstreamLines)

  let merged = ""
  let conflictCount = 0

  for (const region of result) {
    if ("ok" in region && region.ok) {
      merged += region.ok.join("\n")
    } else if ("conflict" in region && region.conflict) {
      conflictCount++
      merged += "<<<<<<< local\n"
      merged += region.conflict.a.join("\n")
      merged += "\n=======\n"
      merged += region.conflict.b.join("\n")
      merged += "\n>>>>>>> upstream\n"
    }
  }

  return {
    clean: conflictCount === 0,
    merged,
    conflictCount,
  }
}

// ---------------------------------------------------------------------------
// Unified diff for display
// ---------------------------------------------------------------------------

/**
 * Generate a unified diff string for terminal display.
 */
export function unifiedDiff(
  oldContent: string,
  newContent: string,
  oldLabel: string = "current",
  newLabel: string = "updated",
): string {
  return createPatch(oldLabel, oldContent, newContent, oldLabel, newLabel, { context: 3 })
}
