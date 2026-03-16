import { createHash } from "node:crypto"

export interface FileClassification {
  kind: string | null
  initiative: string | null
}

/** Classify a markdown file by its path. Returns the kind and parent initiative slug. */
export function classifyFile(relativePath: string): FileClassification {
  // Initiative files: docs/initiatives/<slug>/...
  const initMatch = relativePath.match(/^docs\/initiatives\/([^/]+)\//)
  if (initMatch) {
    const slug = initMatch[1]!
    const rest = relativePath.slice(initMatch[0].length)

    if (rest === "proposal.md") return { kind: "initiative", initiative: slug }
    if (rest === "activity.md") return { kind: "activity", initiative: slug }
    if (rest === "plan.md") return { kind: "plan", initiative: slug }
    if (rest.startsWith("research/")) return { kind: "research", initiative: slug }
    // Sub-initiatives, decisions, deliverables, branches — still scoped to parent
    return { kind: null, initiative: slug }
  }

  // Tasks
  if (relativePath.startsWith("docs/tasks/") && relativePath.endsWith(".md")) {
    return { kind: "task", initiative: null }
  }

  // Agent roles (base catalog + org-specific)
  if (relativePath.startsWith("agents/") || relativePath.startsWith("docs/agents/roles/")) {
    return { kind: "agent", initiative: null }
  }

  // Rules
  if (relativePath.startsWith(".claude/rules/")) {
    return { kind: "rule", initiative: null }
  }

  // Skills
  if (relativePath.startsWith(".claude/skills/")) {
    return { kind: "skill", initiative: null }
  }

  return { kind: null, initiative: null }
}

export interface Edge {
  source: string
  target: string
  kind: string
}

/** Extract relationship edges from initiative frontmatter. */
export function extractEdgesFromFrontmatter(
  initiativeSlug: string,
  frontmatter: Record<string, unknown>,
): Edge[] {
  const edges: Edge[] = []

  const deps = frontmatter.dependencies
  if (Array.isArray(deps)) {
    for (const dep of deps) {
      if (typeof dep === "string") {
        edges.push({ source: initiativeSlug, target: dep, kind: "depends-on" })
      }
    }
  }

  const informs = frontmatter.informs
  if (Array.isArray(informs)) {
    for (const target of informs) {
      if (typeof target === "string") {
        edges.push({ source: initiativeSlug, target, kind: "informs" })
      }
    }
  }

  const spawnedFrom = frontmatter["spawned-from"]
  if (typeof spawnedFrom === "string") {
    edges.push({ source: initiativeSlug, target: spawnedFrom, kind: "spawned-from" })
  }

  const targets = frontmatter.targets
  if (Array.isArray(targets)) {
    for (const t of targets) {
      if (typeof t === "string") {
        // Strip trailing comments like "# (new file)"
        const cleaned = t.replace(/\s*#.*$/, "").trim()
        if (cleaned) {
          edges.push({ source: initiativeSlug, target: cleaned, kind: "targets" })
        }
      }
    }
  }

  return edges
}

/** Compute SHA-256 hash of content for change detection. */
export function computeContentHash(content: string): string {
  return createHash("sha256").update(content).digest("hex")
}
