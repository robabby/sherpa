import fs from "fs"
import path from "path"
import matter from "gray-matter"

import { getDefaultContext } from "./config"
import type { ProjectContext } from "./config/types"
import { resolveCtxPath } from "./context"
import { parseProvenance, computeState } from "./doc-tree-types"
import { computeDocDrift } from "./doc-drift"
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
 * Recursively apply git-aware drift to a node and its children: when a doc has
 * drifted, set node.drift and recompute node.state (-> "stale").
 */
function applyDrift(
  node: DocTreeNode,
  targetIndex: Map<string, string[]>,
  ctx: ProjectContext,
): void {
  const drift = computeDocDrift(node.provenance, targetIndex, ctx)
  if (drift) {
    node.drift = drift
    node.state = computeState(node.provenance, drift)
  }
  for (const child of node.children) applyDrift(child, targetIndex, ctx)
}

/**
 * Build the full documentation tree, grouped into labeled sections.
 *
 * Sections are driven by `ctx.paths.docSections` — each entry specifies
 * a label, path, and scan type ("directory", "files", or "file").
 *
 * When `opts.targetIndex` (slug -> initiative targets) is provided, git-aware
 * drift is computed for every maintained node and folded into its state.
 */
export function getDocTree(
  ctx?: ProjectContext,
  opts?: { targetIndex?: Map<string, string[]> },
): DocTreeSection[] {
  const c = ctx ?? getDefaultContext()
  const basePath = resolveCtxPath(c, "docs")
  const sections: DocTreeSection[] = []

  for (const section of c.paths.docSections) {
    if (section.type === "file") {
      const absPath = resolveCtxPath(c, section.path)
      const node = readDocNode(absPath, basePath)
      if (node) {
        sections.push({ label: section.label, nodes: [node] })
      }
    } else {
      // "directory" or "files" — both use scanDirectory
      const absDir = resolveCtxPath(c, section.path)
      const nodes = scanDirectory(absDir, basePath)
      if (nodes.length > 0) {
        sections.push({ label: section.label, nodes })
      }
    }
  }

  if (opts?.targetIndex) {
    for (const section of sections) {
      for (const node of section.nodes) applyDrift(node, opts.targetIndex, c)
    }
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
  slug: string,
  ctx?: ProjectContext,
): { content: string; relativePath: string; provenance: Provenance } | null {
  const c = ctx ?? getDefaultContext()
  const basePath = resolveCtxPath(c, ".")

  // Try flat file first: docs/<slug>.md
  const flatPath = resolveCtxPath(c, `docs/${slug}.md`)
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
  const indexPath = resolveCtxPath(c, `docs/${slug}/index.md`)
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
