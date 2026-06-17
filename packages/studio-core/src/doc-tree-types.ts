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

/** A maintained doc that has drifted into the "stale" state. */
export interface StaleDoc {
  slug: string
  title: string
  relativePath: string
  /** Commits touching related code since the doc's last-verified date. */
  commitsSinceVerified: number
}

/** The reverse mapping: which initiatives source which stale docs. */
export interface StaleDocsIndex {
  /** Initiative slug -> stale docs that list it in `source-initiatives`. */
  byInitiative: Map<string, StaleDoc[]>
  /** Distinct stale docs (one entry per stale node) — portfolio count is `.length`. */
  staleDocs: StaleDoc[]
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

// ---------------------------------------------------------------------------
// Stale-docs reverse mapping (pure — no Node.js dependencies)
// ---------------------------------------------------------------------------

/**
 * Walk doc-tree sections and collect every doc whose `state === "stale"`,
 * indexed by the initiatives that source it. The inverse of drift: drift maps
 * an initiative's targets to a doc's freshness; this maps a stale doc back to
 * the initiatives that own it, so the Process (governance) view can surface
 * doc health per initiative and portfolio-wide.
 *
 * Pure: operates on an already-built (drift-folded) tree. The git-aware tree
 * is produced server-side by `getDocTree(ctx, { targetIndex })`.
 */
export function collectStaleDocs(sections: DocTreeSection[]): StaleDocsIndex {
  const byInitiative = new Map<string, StaleDoc[]>()
  const staleDocs: StaleDoc[] = []

  const visit = (node: DocTreeNode): void => {
    if (node.state === "stale" && node.drift) {
      const staleDoc: StaleDoc = {
        slug: node.slug,
        title: node.title,
        relativePath: node.relativePath,
        commitsSinceVerified: node.drift.commitsSinceVerified,
      }
      staleDocs.push(staleDoc)
      for (const slug of node.provenance.sourceInitiatives) {
        const existing = byInitiative.get(slug)
        if (existing) existing.push(staleDoc)
        else byInitiative.set(slug, [staleDoc])
      }
    }
    for (const child of node.children) visit(child)
  }

  for (const section of sections) {
    for (const node of section.nodes) visit(node)
  }

  return { byInitiative, staleDocs }
}
