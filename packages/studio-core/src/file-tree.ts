import fs from "fs"

import {
  listMarkdownFiles,
  listSubdirectories,
  readProjectFile,
  resolveProjectPath,
} from "./content"
import { extractTitle, parseFrontmatter } from "./markdown"
import type { FileTreeNode } from "./process-nodes-shared"
import type { BranchSeed, InitiativeResearch } from "./types"

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface FileTreeOptions {
  /** URL builder for research report links. If not provided, no reportHref is set. */
  researchReportUrl?: (slug: string) => string
}

// ---------------------------------------------------------------------------
// Canonical items
// ---------------------------------------------------------------------------

/** Canonical top-level items in an initiative directory. */
const CANONICAL_ITEMS: {
  name: string
  type: "file" | "directory"
  annotation: FileTreeNode["annotation"]
  hint: string
}[] = [
  { name: "proposal.md", type: "file", annotation: "proposal", hint: "Required — defines the initiative" },
  { name: "plan.md", type: "file", annotation: "plan", hint: "Created when planning begins" },
  { name: "research", type: "directory", annotation: undefined, hint: "Created on first /rr run" },
  { name: "branches", type: "directory", annotation: undefined, hint: "Created when seeds are identified" },
  { name: "sub-initiatives", type: "directory", annotation: undefined, hint: "Created when seeds are launched" },
  { name: "deliverables", type: "directory", annotation: undefined, hint: "Created for charts and decks" },
]

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function fileExists(relativePath: string): boolean {
  try {
    return fs.existsSync(resolveProjectPath(relativePath))
  } catch {
    return false
  }
}

function buildFileNode(
  relativePath: string,
  annotation?: FileTreeNode["annotation"],
): FileTreeNode {
  const name = relativePath.split("/").pop() ?? relativePath
  const source = readProjectFile(relativePath)
  if (!source) {
    return {
      name,
      relativePath,
      type: "file",
      exists: false,
      annotation,
      children: [],
    }
  }
  const { data } = parseFrontmatter(source)
  const title = extractTitle(source) ?? undefined
  return {
    name,
    relativePath,
    type: "file",
    exists: true,
    title,
    status: typeof data?.status === "string" ? data.status : undefined,
    annotation,
    children: [],
  }
}

function buildResearchChildren(
  basePath: string,
  research: InitiativeResearch | null,
  options?: FileTreeOptions,
): FileTreeNode[] {
  const children: FileTreeNode[] = []

  if (research?.readme) {
    children.push({
      name: "README.md",
      relativePath: research.readme.relativePath,
      type: "file",
      exists: true,
      title: research.readme.title,
      annotation: "research-index",
      children: [],
    })
  }

  for (const iter of research?.iterations ?? []) {
    const iterChildren: FileTreeNode[] = []
    if (iter.synthesis) {
      iterChildren.push({
        name: iter.synthesis.fileName,
        relativePath: iter.synthesis.relativePath,
        type: "file",
        exists: true,
        title: iter.synthesis.title,
        annotation: "synthesis",
        children: [],
      })
    }
    const iterDirPath = `${basePath}/research/iteration-${iter.number}`
    for (const vec of iter.vectors) {
      iterChildren.push({
        name: vec.fileName,
        relativePath: vec.relativePath,
        type: "file",
        exists: true,
        title: vec.title,
        annotation: "vector",
        children: [],
      })
    }
    children.push({
      name: `iteration-${iter.number}`,
      relativePath: iterDirPath,
      type: "directory",
      exists: true,
      children: iterChildren,
    })
  }

  for (const loose of research?.looseFiles ?? []) {
    children.push({
      name: loose.fileName,
      relativePath: loose.relativePath,
      type: "file",
      exists: true,
      title: loose.title,
      children: [],
    })
  }

  // Scan for research report JSON files
  const researchDir = `${basePath}/research`
  const absResearchDir = resolveProjectPath(researchDir)
  if (fs.existsSync(absResearchDir)) {
    const jsonFiles = fs
      .readdirSync(absResearchDir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
    for (const jf of jsonFiles) {
      const jsonPath = `${researchDir}/${jf.name}`
      const source = readProjectFile(jsonPath)
      if (!source) continue
      try {
        const parsed = JSON.parse(source)
        if (parsed.$schema === "wavepoint/report@1" && parsed.id && /^[a-z0-9-]+$/.test(parsed.id)) {
          children.push({
            name: jf.name,
            relativePath: jsonPath,
            type: "file",
            exists: true,
            title: parsed.title ?? parsed.id,
            annotation: "deliverable",
            children: [],
            meta: { reportHref: options?.researchReportUrl?.(parsed.id) },
          })
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }

  return children
}

function buildBranchesChildren(
  basePath: string,
  seeds: BranchSeed[],
  initiativeSlug: string,
): FileTreeNode[] {
  return seeds.map((seed) => ({
    name: `${seed.slug}.md`,
    relativePath: seed.relativePath,
    type: "file" as const,
    exists: true,
    title: seed.title,
    status: seed.status,
    annotation: "seed" as const,
    linkedNodeId: `seed/${initiativeSlug}/${seed.slug}`,
    children: [],
    meta: { priority: seed.priority },
  }))
}

function buildSubInitiativesChildren(
  basePath: string,
  initiativeSlug: string,
): FileTreeNode[] {
  const subDirPath = `${basePath}/sub-initiatives`
  const slugs = listSubdirectories(subDirPath)
  return slugs.map((subSlug) => {
    const subPath = `${subDirPath}/${subSlug}`
    const proposalPath = `${subPath}/proposal.md`
    const proposal = buildFileNode(proposalPath, "proposal")
    return {
      name: subSlug,
      relativePath: subPath,
      type: "directory" as const,
      exists: true,
      title: proposal.title,
      status: proposal.status,
      annotation: "sub-initiative" as const,
      linkedNodeId: `initiative/${initiativeSlug}/${subSlug}`,
      children: [proposal],
    }
  })
}

function buildDeliverablesChildren(basePath: string): FileTreeNode[] {
  const dirPath = `${basePath}/deliverables`
  const abs = resolveProjectPath(dirPath)
  if (!fs.existsSync(abs)) return []

  const files = fs.readdirSync(abs).filter((f) => f.endsWith(".json"))
  return files.map((f) => ({
    name: f,
    relativePath: `${dirPath}/${f}`,
    type: "file" as const,
    exists: true,
    annotation: "deliverable" as const,
    children: [],
  }))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a file tree for a branch/seed showing its related content.
 */
export function buildBranchFileTree(
  seed: BranchSeed,
  initiativeSlug: string,
  parentResearch: InitiativeResearch | null,
  options?: FileTreeOptions,
): FileTreeNode {
  const children: FileTreeNode[] = []
  const parentBasePath = `docs/initiatives/${initiativeSlug}`

  // 1. The branch .md file itself
  children.push(buildFileNode(seed.relativePath, "seed"))

  // 2. Source research iteration from parent
  if (parentResearch && seed.sourceIteration > 0) {
    const sourceIter = parentResearch.iterations.find(
      (iter) => iter.number === seed.sourceIteration,
    )
    if (sourceIter) {
      const iterChildren: FileTreeNode[] = []
      if (sourceIter.synthesis) {
        iterChildren.push({
          name: sourceIter.synthesis.fileName,
          relativePath: sourceIter.synthesis.relativePath,
          type: "file",
          exists: true,
          title: sourceIter.synthesis.title,
          annotation: "synthesis",
          children: [],
        })
      }
      for (const vec of sourceIter.vectors) {
        iterChildren.push({
          name: vec.fileName,
          relativePath: vec.relativePath,
          type: "file",
          exists: true,
          title: vec.title,
          annotation: "vector",
          children: [],
        })
      }
      children.push({
        name: "research/",
        relativePath: `${parentBasePath}/research`,
        type: "directory",
        exists: true,
        children: [{
          name: `iteration-${sourceIter.number}`,
          relativePath: `${parentBasePath}/research/iteration-${sourceIter.number}`,
          type: "directory",
          exists: true,
          children: iterChildren,
        }],
      })
    }
  }

  // 3. Sub-initiative launched from this branch
  if (seed.subInitiativePath) {
    const subPath = `${parentBasePath}/${seed.subInitiativePath}`
    const subSlug = seed.subInitiativePath.split("/").pop() ?? seed.slug
    if (fileExists(subPath)) {
      const proposalPath = `${subPath}/proposal.md`
      const proposalNode = fileExists(proposalPath)
        ? buildFileNode(proposalPath, "proposal")
        : null
      const subChildren: FileTreeNode[] = []
      if (proposalNode) {
        subChildren.push(proposalNode)
      }
      const subResearchPath = `${subPath}/research`
      if (fileExists(subResearchPath)) {
        const subResearchFiles = listMarkdownFiles(subResearchPath)
        const researchChildren = subResearchFiles.map((fp) => buildFileNode(fp))
        subChildren.push({
          name: "research/",
          relativePath: subResearchPath,
          type: "directory",
          exists: true,
          children: researchChildren,
        })
      }
      const subDeliverablesPath = `${subPath}/deliverables`
      if (fileExists(subDeliverablesPath)) {
        subChildren.push({
          name: "deliverables/",
          relativePath: subDeliverablesPath,
          type: "directory",
          exists: true,
          children: buildDeliverablesChildren(subPath),
        })
      }
      children.push({
        name: "sub-initiatives/",
        relativePath: `${parentBasePath}/sub-initiatives`,
        type: "directory",
        exists: true,
        children: [{
          name: subSlug,
          relativePath: subPath,
          type: "directory",
          exists: true,
          title: proposalNode?.title,
          status: proposalNode?.status,
          annotation: "sub-initiative",
          linkedNodeId: `initiative/${initiativeSlug}/${subSlug}`,
          children: subChildren,
        }],
      })
    }
  }

  // 4. Research report JSON files related to this branch
  const researchDir = `${parentBasePath}/research`
  const absResearchDir = resolveProjectPath(researchDir)
  if (fs.existsSync(absResearchDir)) {
    const jsonFiles = fs
      .readdirSync(absResearchDir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
    const relatedReports: FileTreeNode[] = []
    for (const jf of jsonFiles) {
      const jsonPath = `${researchDir}/${jf.name}`
      const source = readProjectFile(jsonPath)
      if (!source) continue
      try {
        const parsed = JSON.parse(source)
        if (
          parsed.$schema === "wavepoint/report@1" &&
          parsed.id &&
          /^[a-z0-9-]+$/.test(parsed.id) &&
          (jf.name.replace(/\.json$/, "") === seed.slug || parsed.id === seed.slug)
        ) {
          relatedReports.push({
            name: jf.name,
            relativePath: jsonPath,
            type: "file",
            exists: true,
            title: parsed.title ?? parsed.id,
            annotation: "deliverable",
            children: [],
            meta: { reportHref: options?.researchReportUrl?.(parsed.id) },
          })
        }
      } catch {
        // Skip malformed JSON
      }
    }
    if (relatedReports.length > 0) {
      const existingResearch = children.find(
        (c) => c.type === "directory" && c.name === "research/",
      )
      if (existingResearch) {
        existingResearch.children.push(...relatedReports)
      } else {
        children.push({
          name: "research/",
          relativePath: researchDir,
          type: "directory",
          exists: true,
          children: relatedReports,
        })
      }
    }
  }

  return {
    name: seed.slug,
    relativePath: `${parentBasePath}/branches/${seed.slug}`,
    type: "directory",
    exists: true,
    children,
  }
}

/**
 * Build the complete file tree for an initiative directory.
 * Takes pre-loaded seeds and research data to avoid redundant fs reads.
 */
export function buildInitiativeFileTree(
  slug: string,
  basePath: string,
  seeds: BranchSeed[],
  research: InitiativeResearch | null,
  options?: FileTreeOptions,
): FileTreeNode {
  const children: FileTreeNode[] = []

  for (const item of CANONICAL_ITEMS) {
    const itemPath = `${basePath}/${item.name}`
    const exists = fileExists(itemPath)

    if (item.type === "file") {
      if (exists) {
        children.push(buildFileNode(itemPath, item.annotation))
      } else {
        children.push({
          name: item.name,
          relativePath: itemPath,
          type: "file",
          exists: false,
          annotation: item.annotation,
          children: [],
          meta: { hint: item.hint },
        })
      }
    } else {
      let dirChildren: FileTreeNode[] = []
      if (exists) {
        switch (item.name) {
          case "research":
            dirChildren = buildResearchChildren(basePath, research, options)
            break
          case "branches":
            dirChildren = buildBranchesChildren(basePath, seeds, slug)
            break
          case "sub-initiatives":
            dirChildren = buildSubInitiativesChildren(basePath, slug)
            break
          case "deliverables":
            dirChildren = buildDeliverablesChildren(basePath)
            break
        }
      }
      children.push({
        name: item.name + "/",
        relativePath: itemPath,
        type: "directory",
        exists,
        children: dirChildren,
        meta: exists ? undefined : { hint: item.hint },
      })
    }
  }

  // Add any non-canonical files/dirs that exist on disk
  const allSubDirs = listSubdirectories(basePath)
  const allFiles = listMarkdownFiles(basePath)
  const canonicalNames = new Set(CANONICAL_ITEMS.map((i) => i.name))

  for (const dirName of allSubDirs) {
    if (!canonicalNames.has(dirName)) {
      children.push({
        name: dirName + "/",
        relativePath: `${basePath}/${dirName}`,
        type: "directory",
        exists: true,
        children: [],
      })
    }
  }

  for (const filePath of allFiles) {
    const fileName = filePath.split("/").pop() ?? ""
    if (!canonicalNames.has(fileName)) {
      children.push(buildFileNode(filePath))
    }
  }

  return {
    name: slug,
    relativePath: basePath,
    type: "directory",
    exists: true,
    children,
  }
}
