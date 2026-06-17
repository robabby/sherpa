// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProvenanceState =
  | "awaiting-review"
  | "verified"
  | "stale"
  | "human-owned"

export type DocType =
  | "architecture"
  | "decision"
  | "changelog"
  | "ux"
  | "framework"

export interface Provenance {
  docType: DocType | null
  maintainedBy: "self-documenting-system" | "human" | null
  authoredBy: "ai" | "human" | null
  reviewedBy: "ai" | "human" | null
  lastUpdated: string | null
  lastVerified: string | null
  sourceInitiatives: string[]
}

/** Git-aware drift signal for a maintained doc (see ./doc-drift). */
export interface DocDrift {
  /** Code/doc paths this doc derives from — union of its source initiatives' targets. */
  relatedPaths: string[]
  /** Commits touching relatedPaths since the doc's last-verified date. */
  commitsSinceVerified: number
  /** True when commitsSinceVerified > 0. */
  isStale: boolean
}

export interface DocTreeNode {
  slug: string
  title: string
  relativePath: string
  provenance: Provenance
  state: ProvenanceState
  children: DocTreeNode[]
  lineCount: number
  /** Present only when drift was computed (maintained doc with source initiatives). */
  drift?: DocDrift | null
}

export interface DocTreeSection {
  label: string
  nodes: DocTreeNode[]
}

// ---------------------------------------------------------------------------
// Provenance parsing (pure — no Node.js dependencies)
// ---------------------------------------------------------------------------

/**
 * Extract provenance fields from gray-matter parsed frontmatter data.
 */
export function parseProvenance(
  frontmatter: Record<string, unknown> | null
): Provenance {
  if (!frontmatter) {
    return {
      docType: null,
      maintainedBy: null,
      authoredBy: null,
      reviewedBy: null,
      lastUpdated: null,
      lastVerified: null,
      sourceInitiatives: [],
    }
  }

  const docTypeRaw = frontmatter["doc-type"]
  const validDocTypes: DocType[] = [
    "architecture",
    "decision",
    "changelog",
    "ux",
    "framework",
  ]
  const docType =
    typeof docTypeRaw === "string" && validDocTypes.includes(docTypeRaw as DocType)
      ? (docTypeRaw as DocType)
      : null

  const maintainedByRaw = frontmatter["maintained-by"]
  const maintainedBy =
    maintainedByRaw === "self-documenting-system" || maintainedByRaw === "human"
      ? maintainedByRaw
      : null

  const authoredByRaw = frontmatter["authored-by"]
  const authoredBy =
    authoredByRaw === "ai" || authoredByRaw === "human"
      ? authoredByRaw
      : null

  const reviewedByRaw = frontmatter["reviewed-by"]
  const reviewedBy =
    reviewedByRaw === "ai" || reviewedByRaw === "human"
      ? reviewedByRaw
      : null

  const lastUpdatedRaw = frontmatter["last-updated"]
  const lastUpdated =
    typeof lastUpdatedRaw === "string"
      ? lastUpdatedRaw
      : lastUpdatedRaw instanceof Date
        ? lastUpdatedRaw.toISOString().slice(0, 10)
        : null

  const lastVerifiedRaw = frontmatter["last-verified"]
  const lastVerified =
    typeof lastVerifiedRaw === "string"
      ? lastVerifiedRaw
      : lastVerifiedRaw instanceof Date
        ? lastVerifiedRaw.toISOString().slice(0, 10)
        : null

  const sourceInitiativesRaw = frontmatter["source-initiatives"]
  const sourceInitiatives = Array.isArray(sourceInitiativesRaw)
    ? sourceInitiativesRaw.filter(
        (s): s is string => typeof s === "string"
      )
    : []

  return {
    docType,
    maintainedBy,
    authoredBy,
    reviewedBy,
    lastUpdated,
    lastVerified,
    sourceInitiatives,
  }
}

// ---------------------------------------------------------------------------
// State computation (pure — no Node.js dependencies)
// ---------------------------------------------------------------------------

/**
 * Derive a ProvenanceState from provenance metadata, optionally factoring in
 * git-aware drift.
 *
 * - No provenance or maintained-by human -> "human-owned"
 * - maintained doc whose related code moved since verification -> "stale"
 * - reviewed-by human or ai -> "verified"
 * - reviewed-by null -> "awaiting-review"
 *
 * Drift only fires for docs that were previously verified (they carry a
 * last-verified date), so "stale" never masks "awaiting-review".
 */
export function computeState(
  provenance: Provenance,
  drift?: DocDrift | null,
): ProvenanceState {
  if (!provenance.maintainedBy || provenance.maintainedBy === "human") {
    return "human-owned"
  }
  if (drift?.isStale) {
    return "stale"
  }
  if (provenance.reviewedBy === "human") {
    return "verified"
  }
  if (provenance.reviewedBy === "ai") {
    return "verified"
  }
  return "awaiting-review"
}
