import { getDefaultContext } from "./config"
import type { ProjectContext } from "./config/types"
import {
  readCtxFile,
  listCtxMarkdownFiles,
  listCtxSubdirectories,
  countCtxFiles,
  listCtxJsonFiles,
  getCtxFileStats,
  findCtxClaudeMdFiles,
} from "./context"
import {
  countLines,
  extractNumberedItems,
  extractOpenQuestions,
  extractSection,
  extractSections,
  extractSummarySection,
  extractTitle,
  parseActivityLog,
  parseMarkdownTable,
  parseFrontmatter,
  parseValidatedFrontmatter,
} from "./markdown"
import {
  behavioralAgentFrontmatterSchema,
  branchSeedFrontmatterSchema,
  initiativeFrontmatterSchema,
  ruleFrontmatterSchema,
  sessionSchema,
  skillFrontmatterSchema,
} from "./schemas"
import type {
  ActivityEntry,
  AgentRole,
  BranchSeed,
  ContentFile,
  CrossDependency,
  DateActivityData,
  DocCategory,
  DocumentContent,
  HubStats,
  Initiative,
  InitiativeResearch,
  MonorepoInitiative,
  PortfolioApp,
  PortfolioData,
  ProcessDashboardStats,
  ResearchIteration,
  ResearchTreeNode,
  Rule,
  Session,
  Skill,
  UnifiedInitiativeEntry,
  UnifiedProcessData,
  Workstream,
} from "./types"
import { DOC_CATEGORIES } from "./types"

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildContentFile(relativePath: string, ctx: ProjectContext): ContentFile | null {
  const source = readCtxFile(ctx, relativePath)
  if (source === null) return null

  const stats = getCtxFileStats(ctx, relativePath)
  const { data } = parseFrontmatter(source)
  const title = extractTitle(source) ?? fileNameToTitle(relativePath)

  return {
    relativePath,
    fileName: relativePath.split("/").pop() ?? relativePath,
    title,
    frontmatter: data,
    lineCount: countLines(source),
    sizeBytes: stats?.size ?? 0,
    lastModified: stats?.mtime.toISOString() ?? "",
  }
}

function fileNameToTitle(filePath: string): string {
  const name = filePath.split("/").pop() ?? filePath
  return name
    .replace(/\.md$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------------------------------------------------------------------------
// Domain functions
// ---------------------------------------------------------------------------

/**
 * Scan docs/initiatives/ proposal.md files, parse frontmatter, count subdirs.
 */
export function getInitiatives(ctx?: ProjectContext): Initiative[] {
  const c = ctx ?? getDefaultContext()
  const slugs = listCtxSubdirectories(c, "docs/initiatives").filter(
    (s) => !s.startsWith("."),
  )
  const initiatives: Initiative[] = []

  for (const slug of slugs) {
    const proposalPath = `docs/initiatives/${slug}/proposal.md`
    const source = readCtxFile(c, proposalPath)
    if (!source) continue

    const { data, content } = parseValidatedFrontmatter(
      source,
      initiativeFrontmatterSchema
    )
    if (!data) continue

    const title = extractTitle(content) ?? fileNameToTitle(slug)
    const summary = extractSummarySection(content) ?? ""

    const subDirNames = listCtxSubdirectories(
      c,
      `docs/initiatives/${slug}`
    )
    const subDirectories = subDirNames.map((name) => ({
      name,
      fileCount: countCtxFiles(c, `docs/initiatives/${slug}/${name}`),
    }))

    initiatives.push({
      slug,
      status: data.status ?? "pending",
      type: data.type ?? null,
      risk: data.risk ?? null,
      created: String(data.created),
      updated: String(data.updated),
      targets: data.targets ?? [],
      dependencies: data.dependencies ?? [],
      informs: data.informs ?? [],
      spawnedFrom: data["spawned-from"] ?? null,
      title,
      summary,
      subDirectories,
    })
  }

  return initiatives
}

/**
 * Scan docs/initiatives/.archive/ proposal.md files for archived initiatives.
 */
export function getArchivedInitiatives(ctx?: ProjectContext): Initiative[] {
  const c = ctx ?? getDefaultContext()
  const slugs = listCtxSubdirectories(c, "docs/initiatives/.archive")
  const initiatives: Initiative[] = []

  for (const slug of slugs) {
    const proposalPath = `docs/initiatives/.archive/${slug}/proposal.md`
    const source = readCtxFile(c, proposalPath)
    if (!source) continue

    const { data, content } = parseValidatedFrontmatter(
      source,
      initiativeFrontmatterSchema
    )
    if (!data) continue

    const title = extractTitle(content) ?? fileNameToTitle(slug)
    const summary = extractSummarySection(content) ?? ""

    const subDirNames = listCtxSubdirectories(
      c,
      `docs/initiatives/.archive/${slug}`
    )
    const subDirectories = subDirNames.map((name) => ({
      name,
      fileCount: countCtxFiles(c, `docs/initiatives/.archive/${slug}/${name}`),
    }))

    initiatives.push({
      slug,
      status: data.status ?? "archived",
      type: data.type ?? null,
      risk: data.risk ?? null,
      created: String(data.created),
      updated: String(data.updated),
      targets: data.targets ?? [],
      dependencies: data.dependencies ?? [],
      informs: data.informs ?? [],
      spawnedFrom: data["spawned-from"] ?? null,
      title,
      summary,
      subDirectories,
    })
  }

  return initiatives
}

/**
 * Return an empty workstream list.
 * Workstreams were consolidated into initiative activity.md files.
 * The function signature is preserved for callers that pass it as a getter.
 */
export function getWorkstreams(): Workstream[] {
  return []
}

/**
 * Group docs/ subdirectory files by category.
 */
export function getDocsByCategory(ctx?: ProjectContext): Record<DocCategory, ContentFile[]> {
  const c = ctx ?? getDefaultContext()
  const result = Object.fromEntries(
    DOC_CATEGORIES.map((cat) => [cat, [] as ContentFile[]])
  ) as Record<DocCategory, ContentFile[]>

  for (const category of DOC_CATEGORIES) {
    const dirPath = `docs/${category}`
    const files = listCtxMarkdownFiles(c, dirPath, { recursive: true })

    for (const filePath of files) {
      const cf = buildContentFile(filePath, c)
      if (cf) result[category].push(cf)
    }
  }

  return result
}

/**
 * Get conventions: rules, CLAUDE.md files, and UX guides.
 */
export function getConventions(ctx?: ProjectContext): {
  rules: Rule[]
  claudeMdFiles: ContentFile[]
  uxGuides: ContentFile[]
} {
  const c = ctx ?? getDefaultContext()

  // Rules from .claude/rules/
  const ruleFiles = listCtxMarkdownFiles(c, ".claude/rules")
  const rules: Rule[] = []

  for (const filePath of ruleFiles) {
    const source = readCtxFile(c, filePath)
    if (!source) continue

    const { data, content } = parseValidatedFrontmatter(
      source,
      ruleFrontmatterSchema
    )
    const fileName = filePath.split("/").pop() ?? filePath
    const name = extractTitle(content) ?? fileNameToTitle(fileName)

    rules.push({
      fileName,
      name,
      description: data?.description ?? "",
      globs: Array.isArray(data?.globs) ? data.globs : [],
      alwaysApply: data?.alwaysApply ?? false,
      relativePath: filePath,
    })
  }

  // CLAUDE.md files
  const claudePaths = findCtxClaudeMdFiles(c)
  const claudeMdFiles: ContentFile[] = []
  for (const p of claudePaths) {
    const cf = buildContentFile(p, c)
    if (cf) claudeMdFiles.push(cf)
  }

  // UX guides
  const uxFiles = listCtxMarkdownFiles(c, "docs/ux")
  const uxGuides: ContentFile[] = []
  for (const p of uxFiles) {
    const cf = buildContentFile(p, c)
    if (cf) uxGuides.push(cf)
  }

  return { rules, claudeMdFiles, uxGuides }
}

/**
 * Parse docs/roadmap.md tables and sections into portfolio data.
 */
export function getPortfolio(ctx?: ProjectContext): PortfolioData {
  const c = ctx ?? getDefaultContext()
  const source = readCtxFile(c, "docs/roadmap.md")
  if (!source) {
    return {
      lastUpdated: "",
      apps: [],
      dependencies: [],
      monorepoInitiatives: [],
      recentActivity: [],
    }
  }

  const lastUpdatedMatch = source.match(
    /\*\*Last updated:\*\*\s*(\d{4}-\d{2}-\d{2})/
  )
  const lastUpdated = lastUpdatedMatch?.[1] ?? ""

  const portfolioSection = extractSection(source, "Portfolio Status")
  const apps: PortfolioApp[] = []
  if (portfolioSection) {
    const rows = parseMarkdownTable(portfolioSection)
    for (const row of rows) {
      if (row.length < 5) continue
      const linkMatch = row[0]?.match(/\[(.+?)]\((.+?)\)/)
      apps.push({
        name: linkMatch?.[1] ?? row[0] ?? "",
        type: row[1] ?? "",
        currentPhase: row[2] ?? "",
        health: row[3] ?? "",
        nextMilestone: row[4] ?? "",
        roadmapLink: linkMatch?.[2] ?? "",
      })
    }
  }

  const depsSection = extractSection(
    source,
    "Cross-Project Dependencies"
  )
  const dependencies: CrossDependency[] = []
  if (depsSection) {
    const rows = parseMarkdownTable(depsSection)
    for (const row of rows) {
      if (row.length < 4) continue
      dependencies.push({
        blockedProject: row[0] ?? "",
        waitingOn: row[1] ?? "",
        dependency: row[2] ?? "",
        status: row[3] ?? "",
      })
    }
  }

  const activitySection = extractSection(source, "Recent Activity")
  const recentActivity = activitySection
    ? parseActivityLog(activitySection)
    : []

  const initiativesSection = extractSection(
    source,
    "Monorepo-Wide Initiatives"
  )
  const monorepoInitiatives: MonorepoInitiative[] = []
  if (initiativesSection) {
    const h3Regex = /^###\s+(.+)$/gm
    let match
    while ((match = h3Regex.exec(initiativesSection)) !== null) {
      const name = match[1]
      if (!name) continue
      const afterHeading = initiativesSection.slice(
        match.index + match[0].length
      )
      const descMatch = afterHeading.match(/^\s*\n(.+?)(?:\n\n|\n###|\n\|)/s)
      monorepoInitiatives.push({
        name: name.trim(),
        description: descMatch?.[1]?.trim() ?? "",
      })
    }
  }

  return {
    lastUpdated,
    apps,
    dependencies,
    monorepoInitiatives,
    recentActivity,
  }
}

/**
 * Scan .claude/skills/ directories, parse SKILL.md frontmatter.
 * @param projectSkillSlugs — Set of slugs for project-owned skills (not symlinked)
 */
export function getSkills(projectSkillSlugs?: Set<string>, ctx?: ProjectContext): Skill[] {
  const c = ctx ?? getDefaultContext()
  const slugs = listCtxSubdirectories(c, ".claude/skills")
  const skills: Skill[] = []

  for (const slug of slugs) {
    const skillPath = `.claude/skills/${slug}/SKILL.md`
    const source = readCtxFile(c, skillPath)
    if (!source) continue

    const { data } = parseValidatedFrontmatter(
      source,
      skillFrontmatterSchema
    )

    const name = data?.name || fileNameToTitle(slug)
    const description = data?.description || ""

    skills.push({
      slug,
      name,
      description,
      relativePath: skillPath,
      isProjectSkill: projectSkillSlugs?.has(slug) ?? false,
      lineCount: countLines(source),
    })
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Scan agents/ (base catalog) and docs/agents/roles/ (org-specific),
 * parse frontmatter, return AgentRole[].
 */
export function getAgentRoles(ctx?: ProjectContext): AgentRole[] {
  const c = ctx ?? getDefaultContext()
  const roles: AgentRole[] = []

  // Base catalog (agents/) — uses behavioral agent schema
  const baseCatalogFiles = listCtxMarkdownFiles(c, "agents")
    .filter((f) => !f.endsWith("README.md"))
  for (const filePath of baseCatalogFiles) {
    const source = readCtxFile(c, filePath)
    if (!source) continue

    const { data: rawData, content } = parseFrontmatter(source)
    if (!rawData) continue
    const parsed = behavioralAgentFrontmatterSchema.safeParse(rawData)
    if (!parsed.success) continue
    const data = parsed.data

    const body = content.replace(/^#[^\n]*\n/, "").trim()

    roles.push({
      slug: data.name,
      displayName: data["display-name"],
      category: data.category,
      modelTier: data["model-tier"] ?? "medium",
      patterns: data.patterns ?? [],
      structure: data.structure ?? null,
      contextPackages: data["context-packages"] ?? [],
      rules: data.rules ?? [],
      skills: data.skills ?? [],
      toolPermissions: data["tool-permissions"] ?? [],
      escalation: data.escalation ?? [],
      description: body,
      disposition: data.disposition,
      domainScope: data["domain-scope"] ?? [],
      behavioralConstraints: data["behavioral-constraints"] ?? [],
      qualityBar: data["quality-bar"] ?? [],
      failTriggers: data["fail-triggers"] ?? [],
      outputStyle: data["output-style"],
      vibe: data.vibe,
      tags: data.tags ?? [],
      taskType: data["task-type"] ?? undefined,
      eligibleTaskTypes: data["eligible-task-types"] ?? [],
      source: "base",
    })
  }

  // Org-specific roles (docs/agents/roles/) — uses behavioral agent schema
  const orgFiles = listCtxMarkdownFiles(c, "docs/agents/roles")
  for (const filePath of orgFiles) {
    const source = readCtxFile(c, filePath)
    if (!source) continue

    const { data: rawData, content } = parseFrontmatter(source)
    if (!rawData) continue
    const parsed = behavioralAgentFrontmatterSchema.safeParse(rawData)
    if (!parsed.success) continue
    const data = parsed.data

    const body = content.replace(/^#[^\n]*\n/, "").trim()

    // If base catalog already has this agent, merge dispatch fields from org role
    const existing = roles.find((r) => r.slug === data.name)
    if (existing) {
      if (data["task-type"]) existing.taskType = data["task-type"]
      if (data["eligible-task-types"]?.length) existing.eligibleTaskTypes = data["eligible-task-types"]
      continue
    }

    roles.push({
      slug: data.name,
      displayName: data["display-name"],
      category: data.category,
      modelTier: data["model-tier"] ?? "medium",
      patterns: data.patterns ?? [],
      structure: data.structure ?? null,
      contextPackages: data["context-packages"] ?? [],
      rules: data.rules ?? [],
      skills: data.skills ?? [],
      toolPermissions: data["tool-permissions"] ?? [],
      escalation: data.escalation ?? [],
      description: body,
      disposition: data.disposition,
      domainScope: data["domain-scope"] ?? [],
      behavioralConstraints: data["behavioral-constraints"] ?? [],
      qualityBar: data["quality-bar"] ?? [],
      failTriggers: data["fail-triggers"] ?? [],
      outputStyle: data["output-style"],
      vibe: data.vibe,
      tags: data.tags ?? [],
      taskType: data["task-type"] ?? undefined,
      eligibleTaskTypes: data["eligible-task-types"] ?? [],
      source: "org",
    })
  }

  return roles.sort((a, b) => a.displayName.localeCompare(b.displayName))
}

/**
 * List files in an initiative subdirectory from an arbitrary base path.
 */
export function getInitiativeFilesFromPath(
  basePath: string,
  subDir: string,
  ctx?: ProjectContext,
): ContentFile[] {
  const c = ctx ?? getDefaultContext()
  const dirPath = `${basePath}/${subDir}`
  const files = listCtxMarkdownFiles(c, dirPath)
  const result: ContentFile[] = []

  for (const filePath of files) {
    const cf = buildContentFile(filePath, c)
    if (cf) result.push(cf)
  }

  return result
}

/**
 * List files in an initiative subdirectory (e.g. research/, changes/).
 */
export function getInitiativeFiles(
  slug: string,
  subDir: string,
  ctx?: ProjectContext,
): ContentFile[] {
  return getInitiativeFilesFromPath(`docs/initiatives/${slug}`, subDir, ctx)
}

/**
 * Scan research/ directory for an initiative and return structured data.
 */
export function getResearchIterations(
  _slug: string,
  basePath: string,
  ctx?: ProjectContext,
): InitiativeResearch {
  const c = ctx ?? getDefaultContext()
  const researchPath = `${basePath}/research`
  const topFiles = listCtxMarkdownFiles(c, researchPath)
  const subDirs = listCtxSubdirectories(c, researchPath)

  let readme: ContentFile | null = null
  const iterationMap = new Map<number, ResearchIteration>()
  const looseFiles: ContentFile[] = []
  let totalFiles = 0

  for (const filePath of topFiles) {
    totalFiles++
    const fileName = filePath.split("/").pop() ?? ""

    if (fileName.toLowerCase() === "readme.md") {
      readme = buildContentFile(filePath, c)
      continue
    }

    const iterMatch = fileName.match(/^iteration-(\d+)\.md$/)
    if (iterMatch) {
      const num = parseInt(iterMatch[1]!, 10)
      const existing = iterationMap.get(num)
      if (existing) {
        existing.synthesis = buildContentFile(filePath, c)
      } else {
        iterationMap.set(num, {
          number: num,
          synthesis: buildContentFile(filePath, c),
          vectors: [],
        })
      }
      continue
    }

    const cf = buildContentFile(filePath, c)
    if (cf) looseFiles.push(cf)
  }

  for (const dirName of subDirs) {
    const dirMatch = dirName.match(/^iteration-(\d+)$/)
    if (!dirMatch) continue

    const num = parseInt(dirMatch[1]!, 10)
    const vectorFiles = listCtxMarkdownFiles(c, `${researchPath}/${dirName}`)
    const vectors: ContentFile[] = []

    for (const vf of vectorFiles) {
      totalFiles++
      const cf = buildContentFile(vf, c)
      if (cf) vectors.push(cf)
    }

    const existing = iterationMap.get(num)
    if (existing) {
      existing.vectors = vectors
    } else {
      iterationMap.set(num, { number: num, synthesis: null, vectors })
    }
  }

  const iterations = Array.from(iterationMap.values()).sort(
    (a, b) => a.number - b.number,
  )

  return { readme, iterations, looseFiles, totalFiles }
}

/**
 * Read the research README for an initiative and extract open questions.
 */
export function getResearchOpenQuestions(initiativeSlug: string, ctx?: ProjectContext): string[] {
  const c = ctx ?? getDefaultContext()
  const source = readCtxFile(
    c,
    `docs/initiatives/${initiativeSlug}/research/README.md`
  )
  if (!source) return []
  return extractOpenQuestions(source)
}

/**
 * Get a single document with full content for rendering.
 */
export function getDocument(
  relativePath: string,
  ctx?: ProjectContext,
): DocumentContent | null {
  const c = ctx ?? getDefaultContext()
  const source = readCtxFile(c, relativePath)
  if (source === null) return null

  const { data, content } = parseFrontmatter(source)
  const title = extractTitle(source) ?? fileNameToTitle(relativePath)
  const sections = extractSections(content)

  return {
    relativePath,
    fileName: relativePath.split("/").pop() ?? relativePath,
    title,
    frontmatter: data,
    content,
    lineCount: countLines(source),
    sections,
  }
}

/**
 * Get recent activity entries from the roadmap.
 */
export function getRecentActivity(ctx?: ProjectContext): ActivityEntry[] {
  const portfolio = getPortfolio(ctx)
  return portfolio.recentActivity
}

/**
 * Aggregate all activity for a specific date across portfolio and workstreams.
 */
export function getActivityByDate(date: string, ctx?: ProjectContext): DateActivityData | null {
  const c = ctx ?? getDefaultContext()
  const portfolio = getPortfolio(c)
  const workstreams = getWorkstreams()

  const portfolioActivity = portfolio.recentActivity.filter(
    (e) => e.date === date,
  )

  const workstreamActivity: DateActivityData["workstreamActivity"] = []
  for (const ws of workstreams) {
    const entries = ws.activityLog.filter((e) => e.date === date)
    if (entries.length > 0) {
      workstreamActivity.push({
        slug: ws.slug,
        focus: ws.focus,
        entries,
      })
    }
  }

  if (portfolioActivity.length === 0 && workstreamActivity.length === 0) {
    return null
  }

  const parsed = new Date(date + "T00:00:00")
  const formattedDate = parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return {
    date,
    formattedDate,
    portfolioActivity,
    workstreamActivity,
  }
}

// ---------------------------------------------------------------------------
// Research branching
// ---------------------------------------------------------------------------

function getBranchSeedsFromPath(basePath: string, ctx: ProjectContext): BranchSeed[] {
  const branchDir = `${basePath}/branches`
  const files = listCtxMarkdownFiles(ctx, branchDir)
  const seeds: BranchSeed[] = []

  for (const filePath of files) {
    const source = readCtxFile(ctx, filePath)
    if (!source) continue

    const { data, content } = parseValidatedFrontmatter(
      source,
      branchSeedFrontmatterSchema
    )
    if (!data) continue

    const slug = filePath.split("/").pop()?.replace(/\.md$/, "") ?? filePath
    const title = extractTitle(content) ?? fileNameToTitle(slug)
    const context = extractSection(content, "Context")
    const question = extractSection(content, "Question")
    const vectorsSection = extractSection(content, "Suggested Vectors")
    const vectors = vectorsSection ? extractNumberedItems(vectorsSection) : []

    seeds.push({
      slug,
      status: data.status ?? "seed",
      sourceIteration: data["source-iteration"] ?? 0,
      spawnedFrom: data["spawned-from"],
      created: String(data.created),
      priority: data.priority ?? "medium",
      subInitiativePath: data["sub-initiative"] ?? null,
      title,
      context,
      question,
      vectors,
      relativePath: filePath,
    })
  }

  return seeds
}

/**
 * Get branch seeds for an initiative by slug.
 */
export function getBranchSeeds(slug: string, basePath?: string, ctx?: ProjectContext): BranchSeed[] {
  const c = ctx ?? getDefaultContext()
  return getBranchSeedsFromPath(basePath ?? `docs/initiatives/${slug}`, c)
}

/**
 * Build a recursive research tree for an initiative.
 */
export function getResearchTree(
  slug: string,
  depth = 0,
  maxDepth = 3,
  basePath?: string,
  ctx?: ProjectContext,
): ResearchTreeNode | null {
  const c = ctx ?? getDefaultContext()
  if (depth > maxDepth) return null

  const resolvedPath = basePath ?? `docs/initiatives/${slug}`
  return getResearchTreeFromPath(resolvedPath, slug, depth, maxDepth, c)
}

function getResearchTreeFromPath(
  basePath: string,
  slug: string,
  depth: number,
  maxDepth: number,
  ctx: ProjectContext,
): ResearchTreeNode | null {
  const proposalPath = `${basePath}/proposal.md`
  const source = readCtxFile(ctx, proposalPath)
  if (!source) return null

  const { data, content } = parseValidatedFrontmatter(
    source,
    initiativeFrontmatterSchema
  )
  if (!data) return null

  const title = extractTitle(content) ?? fileNameToTitle(slug)

  const researchFiles = listCtxMarkdownFiles(ctx, `${basePath}/research`)
  const iterationCount = researchFiles.filter((f) =>
    /iteration-\d+\.md$/.test(f)
  ).length

  const readmeSource = readCtxFile(ctx, `${basePath}/research/README.md`)
  const openQuestions = readmeSource ? extractOpenQuestions(readmeSource) : []

  const seeds = getBranchSeedsFromPath(basePath, ctx)
  const subInitSlugs = listCtxSubdirectories(ctx, `${basePath}/sub-initiatives`)

  const children: ResearchTreeNode[] = []

  const launchedSeedSlugs = new Set(
    seeds.filter((s) => s.status === "launched").map((s) => s.slug)
  )

  for (const subSlug of subInitSlugs) {
    if (depth + 1 > maxDepth) break
    const subPath = `${basePath}/sub-initiatives/${subSlug}`
    const subNode = getResearchTreeFromPath(
      subPath,
      subSlug,
      depth + 1,
      maxDepth,
      ctx,
    )
    if (subNode) {
      subNode.kind = "sub-initiative"
      const matchingSeed = seeds.find((s) => s.slug === subSlug)
      if (matchingSeed) {
        subNode.priority = matchingSeed.priority
      }
      children.push(subNode)
    }
  }

  for (const seed of seeds) {
    if (launchedSeedSlugs.has(seed.slug) && subInitSlugs.includes(seed.slug)) {
      continue
    }
    children.push({
      kind: "seed",
      slug: seed.slug,
      title: seed.title,
      status: seed.status,
      priority: seed.priority,
      question: seed.question,
      iterationCount: 0,
      openQuestions: [],
      depth: depth + 1,
      relativePath: seed.relativePath,
      children: [],
    })
  }

  return {
    kind: depth === 0 ? "root" : "sub-initiative",
    slug,
    title,
    status: data.status ?? "pending",
    priority: null,
    question: null,
    iterationCount,
    openQuestions,
    depth,
    relativePath: basePath,
    children,
  }
}

// ---------------------------------------------------------------------------
// Unified process view
// ---------------------------------------------------------------------------

function countTreeStats(node: ResearchTreeNode): {
  iterations: number
  questions: number
  seeds: number
} {
  let iterations = node.iterationCount
  let questions = node.openQuestions.length
  let seeds = node.children.filter((c) => c.kind === "seed").length

  for (const child of node.children) {
    const childStats = countTreeStats(child)
    iterations += childStats.iterations
    questions += childStats.questions
    seeds += childStats.seeds
  }

  return { iterations, questions, seeds }
}

export type ProcessSortOption = "activity" | "updated" | "alpha" | "status"

const STATUS_ORDER: Record<string, number> = {
  "in-progress": 0,
  approved: 1,
  pending: 2,
  integrated: 3,
  declined: 4,
  archived: 5,
}

function sortUnifiedEntries(
  entries: UnifiedInitiativeEntry[],
  sort: ProcessSortOption,
): void {
  switch (sort) {
    case "alpha":
      entries.sort((a, b) =>
        a.initiative.title.localeCompare(b.initiative.title),
      )
      break
    case "updated":
      entries.sort((a, b) =>
        b.initiative.updated.localeCompare(a.initiative.updated),
      )
      break
    case "status":
      entries.sort((a, b) => {
        const aOrder = STATUS_ORDER[a.initiative.status] ?? 99
        const bOrder = STATUS_ORDER[b.initiative.status] ?? 99
        if (aOrder !== bOrder) return aOrder - bOrder
        return b.initiative.updated.localeCompare(a.initiative.updated)
      })
      break
    case "activity":
    default: {
      entries.sort((a, b) => {
        const aInProgress = a.initiative.status === "in-progress" ? 0 : 1
        const bInProgress = b.initiative.status === "in-progress" ? 0 : 1
        if (aInProgress !== bInProgress) return aInProgress - bInProgress
        const aDate = a.latestActivity?.date ?? a.initiative.updated
        const bDate = b.latestActivity?.date ?? b.initiative.updated
        return bDate.localeCompare(aDate)
      })
      break
    }
  }
}

/**
 * Build unified process data joining initiatives with their workstreams.
 */
export function getUnifiedProcessData(
  sort: ProcessSortOption = "activity",
  ctx?: ProjectContext,
): UnifiedProcessData {
  const c = ctx ?? getDefaultContext()
  const initiatives = getInitiatives(c)
  const workstreams = getWorkstreams()

  const wsMap = new Map<string, Workstream[]>()
  const matched = new Set<string>()

  for (const ws of workstreams) {
    if (!ws.initiative) continue
    const rootSlug = ws.initiative.split("/")[0]!
    const existing = wsMap.get(rootSlug)
    if (existing) {
      existing.push(ws)
    } else {
      wsMap.set(rootSlug, [ws])
    }
    matched.add(ws.slug)
  }

  const entries: UnifiedInitiativeEntry[] = []

  for (const init of initiatives) {
    const linkedWs = wsMap.get(init.slug) ?? []
    for (const ws of linkedWs) matched.add(ws.slug)

    const tree = getResearchTree(init.slug, 0, 3, undefined, c)
    const treeStats = tree
      ? countTreeStats(tree)
      : { iterations: 0, questions: 0, seeds: 0 }

    let latestActivity: ActivityEntry | null = null
    for (const ws of linkedWs) {
      if (ws.activityLog.length > 0) {
        const first = ws.activityLog[0]!
        if (!latestActivity || first.date > latestActivity.date) {
          latestActivity = first
        }
      }
    }

    entries.push({
      initiative: init,
      workstreams: linkedWs,
      researchTree: tree,
      totalIterations: treeStats.iterations,
      totalOpenQuestions: treeStats.questions,
      totalBranchSeeds: treeStats.seeds,
      latestActivity,
    })
  }

  sortUnifiedEntries(entries, sort)

  const orphanWorkstreams = workstreams.filter(
    (ws) =>
      !ws.initiative ||
      !initiatives.some((i) => ws.initiative!.startsWith(i.slug)),
  )

  const statusCounts: Record<string, number> = {}
  for (const init of initiatives) {
    statusCounts[init.status] = (statusCounts[init.status] ?? 0) + 1
  }

  const stats: ProcessDashboardStats = {
    totalInitiatives: initiatives.length,
    activeWorkstreams: workstreams.filter((w) => w.status === "active").length,
    totalIterations: entries.reduce((s, e) => s + e.totalIterations, 0),
    totalOpenQuestions: entries.reduce((s, e) => s + e.totalOpenQuestions, 0),
    pendingSeeds: entries.reduce((s, e) => s + e.totalBranchSeeds, 0),
    statusCounts,
  }

  return { entries, orphanWorkstreams, stats }
}

/**
 * Scan docs/sessions/*.json, parse and validate each, return Session[].
 */
export function getSessions(ctx?: ProjectContext): Session[] {
  const c = ctx ?? getDefaultContext()
  const files = listCtxJsonFiles(c, "docs/sessions")
  const sessions: Session[] = []

  for (const filePath of files) {
    const source = readCtxFile(c, filePath)
    if (!source) continue

    try {
      const raw = JSON.parse(source)
      const parsed = sessionSchema.safeParse(raw)
      if (parsed.success) {
        sessions.push(parsed.data)
      }
    } catch {
      // Skip malformed JSON
    }
  }

  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

/**
 * Get sessions filtered by initiative slug.
 */
export function getSessionsForInitiative(slug: string, ctx?: ProjectContext): Session[] {
  return getSessions(ctx).filter((s) => s.initiative === slug)
}

function getSessionStats(ctx: ProjectContext): HubStats["sessions"] {
  const sessions = getSessions(ctx)
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekAgoStr = weekAgo.toISOString()

  let totalTokens = 0
  let weeklyTokens = 0
  let thisWeek = 0

  for (const s of sessions) {
    const sessionTokens = s.tokens.input + s.tokens.output
    totalTokens += sessionTokens
    if (s.startedAt >= weekAgoStr) {
      thisWeek++
      weeklyTokens += sessionTokens
    }
  }

  return { total: sessions.length, thisWeek, totalTokens, weeklyTokens }
}

/**
 * Get base hub stats from all data sources.
 * Consumers can extend with domain-specific stats.
 */
export function getHubStats(ctx?: ProjectContext): HubStats {
  const c = ctx ?? getDefaultContext()
  const initiatives = getInitiatives(c)
  const workstreams = getWorkstreams()
  const docs = getDocsByCategory(c)
  const conventions = getConventions(c)
  const portfolio = getPortfolio(c)

  const totalDocs = Object.values(docs).reduce(
    (sum, files) => sum + files.length,
    0
  )

  return {
    process: {
      initiativeCount: initiatives.length,
      activeWorkstreams: workstreams.filter(
        (w) => w.status === "active"
      ).length,
      pendingProposals: initiatives.filter(
        (i) => i.status === "pending"
      ).length,
    },
    portfolio: {
      projectCount: portfolio.apps.length,
      activeDevCount: portfolio.apps.filter(
        (a) =>
          a.health === "On track" &&
          !a.currentPhase.toLowerCase().includes("paused")
      ).length,
      lastActivityDate: portfolio.lastUpdated,
    },
    docs: {
      totalDocs,
      researchTracks: 0,
      planCount: docs.plans?.length ?? 0,
    },
    conventions: {
      ruleCount: conventions.rules.length,
      claudeMdCount: conventions.claudeMdFiles.length,
      uxGuideCount: conventions.uxGuides.length,
    },
    sessions: getSessionStats(c),
    extensions: {},
  }
}
