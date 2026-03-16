import fs from "fs"
import path from "path"
import matter from "gray-matter"

import { resolveProjectPath } from "./content"
import { parseProvenance, computeState } from "./doc-tree-types"
import type { DocTreeNode, DocTreeSection, Provenance } from "./doc-tree-types"

// Re-export types and pure functions so existing server-side imports still work
export { parseProvenance, computeState } from "./doc-tree-types"
export type { ProvenanceState, DocType, Provenance, DocTreeNode, DocTreeSection } from "./doc-tree-types"

// ---------------------------------------------------------------------------
// Single node reading
// ---------------------------------------------------------------------------

/**
 * Extract the title from the first H1 in markdown content.
 * Falls back to slug if no H1 found.
 */
function extractTitle(content: string, slug: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1] ? match[1].trim() : slug
}

/**
 * Read a single doc file and build a DocTreeNode (without children).
 *
 * @param absolutePath — absolute filesystem path to the .md file
 * @param basePath — base directory for computing relative paths (project root)
 */
export function readDocNode(
  absolutePath: string,
  basePath: string
): DocTreeNode | null {
  try {
    const raw = fs.readFileSync(absolutePath, "utf-8")
    const { data, content } = matter(raw)

    const relativePath = path.relative(basePath, absolutePath)
    const slug = relativePath
      .replace(/\/index\.md$/, "")
      .replace(/\.md$/, "")

    const frontmatter =
      data && Object.keys(data).length > 0
        ? (data as Record<string, unknown>)
        : null
    const provenance = parseProvenance(frontmatter)
    const state = computeState(provenance)
    const title = extractTitle(content, path.basename(slug))
    const lineCount = raw.split("\n").length

    return {
      slug,
      title,
      relativePath,
      provenance,
      state,
      children: [],
      lineCount,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Directory scanning
// ---------------------------------------------------------------------------

/**
 * Recursively scan a directory for documentation files.
 *
 * For each subdirectory that contains an `index.md`, creates a node from it
 * and recurses into child subdirectories.
 *
 * For standalone `.md` files (not `index.md`), creates leaf nodes.
 */
export function scanDirectory(
  dirPath: string,
  basePath: string
): DocTreeNode[] {
  const absDir = path.resolve(dirPath)
  if (!fs.existsSync(absDir)) return []

  const entries = fs.readdirSync(absDir, { withFileTypes: true })
  const nodes: DocTreeNode[] = []

  // Process subdirectories with index.md (directoturtle pattern)
  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const subDirPath = path.join(absDir, entry.name)
    const indexPath = path.join(subDirPath, "index.md")

    if (fs.existsSync(indexPath)) {
      const node = readDocNode(indexPath, basePath)
      if (node) {
        // Recurse into subdirectories for nested docs
        node.children = scanDirectory(subDirPath, basePath)
        nodes.push(node)
      }
    }
  }

  // Process standalone .md files (not index.md)
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue
    if (entry.name === "index.md") continue

    const filePath = path.join(absDir, entry.name)
    const node = readDocNode(filePath, basePath)
    if (node) {
      nodes.push(node)
    }
  }

  return nodes
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Build the full documentation tree, grouped into labeled sections.
 *
 * Sections:
 * 1. Architecture — `docs/architecture/` (directoturtle subdirs with index.md)
 * 2. Decisions — `docs/decisions/` (flat .md files)
 * 3. Changelog — `docs/changelog.md` (single file)
 * 4. Framework — `docs/framework.md`, `docs/roadmap.md`, `docs/foundation-stone.md`
 * 5. UX — `docs/ux/` (flat .md files)
 */
export function getDocTree(): DocTreeSection[] {
  const basePath = resolveProjectPath("docs")
  const sections: DocTreeSection[] = []

  // 1. Architecture
  const archDir = resolveProjectPath("docs/architecture")
  const archNodes = scanDirectory(archDir, basePath)
  if (archNodes.length > 0) {
    sections.push({ label: "Architecture", nodes: archNodes })
  }

  // 2. Decisions
  const decisionsDir = resolveProjectPath("docs/decisions")
  const decisionNodes = scanDirectory(decisionsDir, basePath)
  if (decisionNodes.length > 0) {
    sections.push({ label: "Decisions", nodes: decisionNodes })
  }

  // 3. Changelog
  const changelogPath = resolveProjectPath("docs/changelog.md")
  const changelogNode = readDocNode(changelogPath, basePath)
  if (changelogNode) {
    sections.push({ label: "Changelog", nodes: [changelogNode] })
  }

  // 4. Framework
  const frameworkFiles = [
    "docs/framework.md",
    "docs/roadmap.md",
    "docs/foundation-stone.md",
  ]
  const frameworkNodes: DocTreeNode[] = []
  for (const relPath of frameworkFiles) {
    const absPath = resolveProjectPath(relPath)
    const node = readDocNode(absPath, basePath)
    if (node) {
      frameworkNodes.push(node)
    }
  }
  if (frameworkNodes.length > 0) {
    sections.push({ label: "Framework", nodes: frameworkNodes })
  }

  // 5. UX
  const uxDir = resolveProjectPath("docs/ux")
  const uxNodes = scanDirectory(uxDir, basePath)
  if (uxNodes.length > 0) {
    sections.push({ label: "UX", nodes: uxNodes })
  }

  return sections
}

// ---------------------------------------------------------------------------
// Single doc loader
// ---------------------------------------------------------------------------

/**
 * Load a doc by slug. Tries `docs/<slug>.md` first, then `docs/<slug>/index.md`.
 *
 * Returns the parsed content, relative path, and provenance metadata,
 * or null if the document is not found.
 */
export function getDocContent(
  slug: string
): { content: string; relativePath: string; provenance: Provenance } | null {
  const basePath = resolveProjectPath(".")

  // Try flat file first: docs/<slug>.md
  const flatPath = resolveProjectPath(`docs/${slug}.md`)
  if (fs.existsSync(flatPath)) {
    try {
      const raw = fs.readFileSync(flatPath, "utf-8")
      const { data, content } = matter(raw)
      const frontmatter =
        data && Object.keys(data).length > 0
          ? (data as Record<string, unknown>)
          : null
      const provenance = parseProvenance(frontmatter)
      const relativePath = path.relative(basePath, flatPath)
      return { content, relativePath, provenance }
    } catch {
      // fall through
    }
  }

  // Try directoturtle: docs/<slug>/index.md
  const indexPath = resolveProjectPath(`docs/${slug}/index.md`)
  if (fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, "utf-8")
      const { data, content } = matter(raw)
      const frontmatter =
        data && Object.keys(data).length > 0
          ? (data as Record<string, unknown>)
          : null
      const provenance = parseProvenance(frontmatter)
      const relativePath = path.relative(basePath, indexPath)
      return { content, relativePath, provenance }
    } catch {
      // fall through
    }
  }

  return null
}
