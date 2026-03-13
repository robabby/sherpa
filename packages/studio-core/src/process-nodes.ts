import { readProjectFile } from "./content"
import { parseActivityLog } from "./markdown"
import type {
  ActivityEntry,
  BranchSeed,
  ChartSpec,
  DeliverableSummary,
  Initiative,
  InitiativeResearch,
  Rule,
  Skill,
  Workstream,
} from "./types"
import type { FileTreeNode, ProcessNode } from "./process-nodes-shared"
import type { InitiativeVelocity } from "./velocity"
import type { LifecycleInfo } from "./lifecycle"

// Re-export shared types/constants so consumers can import from one place
export {
  applyFilters,
  KIND_LABELS,
  PROCESS_NODE_KINDS,
  PROCESS_VIEW_KINDS,
} from "./process-nodes-shared"
export type {
  FileTreeNode,
  ProcessFilters,
  ProcessNode,
  ProcessNodeKind,
  ProcessSortField,
  ProcessViewKind,
} from "./process-nodes-shared"

// ---------------------------------------------------------------------------
// Mappers — domain type → ProcessNode
// ---------------------------------------------------------------------------

function initiativeToNode(
  init: Initiative,
  research: InitiativeResearch | null,
): ProcessNode {
  const childCount = init.subDirectories.reduce(
    (sum, d) => sum + d.fileCount,
    0,
  )
  const basePath = init.status === "archived"
    ? `docs/initiatives/.archive/${init.slug}`
    : `docs/initiatives/${init.slug}`
  return {
    id: `initiative/${init.slug}`,
    kind: "initiative",
    title: init.title,
    status: init.status,
    created: init.created,
    updated: init.updated,
    parent: init.spawnedFrom
      ? `initiative/${init.spawnedFrom}`
      : null,
    source: `${basePath}/proposal.md`,
    summary: init.summary || null,
    childCount,
    metadata: {
      type: init.type,
      risk: init.risk,
      targets: init.targets,
      dependencies: init.dependencies,
      subDirectories: init.subDirectories.map((d) => d.name),
      research,
    },
  }
}

function workstreamToNode(ws: Workstream): ProcessNode {
  const lastActivity = ws.activityLog[0]
  return {
    id: `workstream/${ws.slug}`,
    kind: "workstream",
    title: ws.slug,
    status: ws.status,
    created: ws.started,
    updated: lastActivity?.date ?? ws.started,
    parent: ws.initiative
      ? `initiative/${ws.initiative.split("/")[0]}`
      : null,
    source: `docs/workstreams/${ws.slug}.md`,
    summary: ws.focus || null,
    childCount: ws.activityLog.length,
    metadata: {
      worktree: ws.worktree,
      initiative: ws.initiative,
      roles: ws.roles,
      activityCount: ws.activityLog.length,
      activityLog: ws.activityLog,
    },
  }
}

function seedToNode(
  seed: BranchSeed,
  initiativeSlug: string,
  parentInit?: Initiative,
): ProcessNode {
  return {
    id: `seed/${initiativeSlug}/${seed.slug}`,
    kind: "seed",
    title: seed.title,
    status: seed.status,
    created: seed.created,
    updated: seed.created,
    parent: `initiative/${initiativeSlug}`,
    source: seed.relativePath,
    summary: seed.question || seed.context || null,
    childCount: seed.vectors.length,
    metadata: {
      priority: seed.priority,
      sourceIteration: seed.sourceIteration,
      vectors: seed.vectors,
      parentInitiativeSlug: initiativeSlug,
      parentType: parentInit?.type,
      parentRisk: parentInit?.risk,
      parentTargets: parentInit?.targets,
      subInitiativePath: seed.subInitiativePath,
    },
  }
}

function skillToNode(skill: Skill): ProcessNode {
  return {
    id: `skill/${skill.slug}`,
    kind: "skill",
    title: skill.name,
    status: "active",
    created: "",
    updated: "",
    parent: null,
    source: skill.relativePath,
    summary: skill.description || null,
    childCount: 0,
    metadata: {
      isProjectSkill: skill.isProjectSkill,
      lineCount: skill.lineCount,
    },
  }
}

function ruleToNode(rule: Rule): ProcessNode {
  return {
    id: `convention/${rule.fileName}`,
    kind: "convention",
    title: rule.name,
    status: "active",
    created: "",
    updated: "",
    parent: null,
    source: rule.relativePath,
    summary: rule.description || null,
    childCount: 0,
    metadata: {
      globs: rule.globs,
      alwaysApply: rule.alwaysApply,
    },
  }
}

// ---------------------------------------------------------------------------
// Composer — calls all getters, returns flat ProcessNode[]
// ---------------------------------------------------------------------------

export interface ProcessNodeGetters {
  getInitiatives: () => Initiative[]
  getWorkstreams: () => Workstream[]
  getBranchSeeds: (slug: string) => BranchSeed[]
  getSkills: () => Skill[]
  getConventions: () => { rules: Rule[] }
  getResearchIterations?: (slug: string, basePath: string) => InitiativeResearch
  buildInitiativeFileTree?: (
    slug: string,
    basePath: string,
    seeds: BranchSeed[],
    research: InitiativeResearch | null,
  ) => FileTreeNode
  buildBranchFileTree?: (
    seed: BranchSeed,
    initiativeSlug: string,
    parentResearch: InitiativeResearch | null,
  ) => FileTreeNode
  getDeliverables?: (basePath: string) => DeliverableSummary[]
  getDeliverable?: (basePath: string, id: string) => ChartSpec | null
  getInitiativeVelocity?: (
    slug: string,
    opts?: {
      activityLog?: ActivityEntry[]
      iterationCount?: number
      openQuestionCount?: number
    },
  ) => InitiativeVelocity
  getLifecycleInfo?: (opts: {
    status: string
    hasResearch: boolean
    iterationCount: number
    hasPlan: boolean
    linkedWorkstreamStatus: string | null
  }) => LifecycleInfo
  /** Optional: additional node mappers for domain-specific node types. */
  getExtraNodes?: () => ProcessNode[]
}

export function getProcessNodes(
  getters: ProcessNodeGetters,
): ProcessNode[] {
  const nodes: ProcessNode[] = []

  // Pre-build workstream lookup for velocity enrichment
  const workstreams = getters.getWorkstreams()
  const wsByInitiative = new Map<string, Workstream[]>()
  for (const ws of workstreams) {
    if (!ws.initiative) continue
    const rootSlug = ws.initiative.split("/")[0]!
    const existing = wsByInitiative.get(rootSlug) ?? []
    existing.push(ws)
    wsByInitiative.set(rootSlug, existing)
  }

  const initiatives = getters.getInitiatives()
  for (const init of initiatives) {
    const basePath = init.status === "archived"
      ? `docs/initiatives/.archive/${init.slug}`
      : `docs/initiatives/${init.slug}`
    const research = getters.getResearchIterations
      ? getters.getResearchIterations(init.slug, basePath)
      : null
    const seeds = getters.getBranchSeeds(init.slug)

    const node = initiativeToNode(init, research)

    // Enrich with velocity data
    if (getters.getInitiativeVelocity) {
      const linkedWs = wsByInitiative.get(init.slug) ?? []
      const allActivity = linkedWs.flatMap((ws) => ws.activityLog)
      const iterationCount = research?.iterations.length ?? 0

      const velocity = getters.getInitiativeVelocity(init.slug, {
        activityLog: allActivity.length > 0 ? allActivity : undefined,
        iterationCount,
        openQuestionCount: undefined,
      })

      node.metadata.velocity = velocity
    }
    // Enrich with lifecycle data
    if (getters.getLifecycleInfo) {
      const iterationCount = research?.iterations.length ?? 0
      const hasPlan = readProjectFile(`docs/initiatives/${init.slug}/plan.md`) !== null ||
        init.subDirectories.some((d) => d.name === "phases")
      const linkedWs = wsByInitiative.get(init.slug) ?? []
      let linkedWorkstreamStatus: string | null = null
      for (const ws of linkedWs) {
        if (ws.status === "active") { linkedWorkstreamStatus = "active"; break }
        if (ws.status === "completed" && linkedWorkstreamStatus !== "active") linkedWorkstreamStatus = "completed"
        if (ws.status === "paused" && !linkedWorkstreamStatus) linkedWorkstreamStatus = "paused"
      }
      node.metadata.lifecycle = getters.getLifecycleInfo({
        status: init.status,
        hasResearch: !!research && research.iterations.length > 0,
        iterationCount: iterationCount,
        hasPlan,
        linkedWorkstreamStatus,
      })
    }
    if (getters.buildInitiativeFileTree) {
      node.metadata.fileTree = getters.buildInitiativeFileTree(
        init.slug,
        basePath,
        seeds,
        research,
      )
    }
    // Enrich with activity log (parsed from activity.md)
    const activitySource = readProjectFile(`${basePath}/activity.md`)
    if (activitySource) {
      const activityEntries = parseActivityLog(activitySource)
      if (activityEntries.length > 0) {
        node.metadata.activityLog = activityEntries
        node.metadata.activityCount = activityEntries.length
      }
    }

    // Load chart deliverables for inline preview
    if (getters.getDeliverables && getters.getDeliverable) {
      const deliverables = getters.getDeliverables(basePath)
      const charts: ChartSpec[] = []
      for (const d of deliverables) {
        if (d.type === "chart") {
          const spec = getters.getDeliverable(basePath, d.id)
          if (spec) charts.push(spec)
        }
      }
      if (charts.length > 0) {
        node.metadata.chartSpecs = charts
      }
    }
    nodes.push(node)

    for (const seed of seeds) {
      const seedNode = seedToNode(seed, init.slug, init)
      if (getters.buildBranchFileTree) {
        seedNode.metadata.fileTree = getters.buildBranchFileTree(
          seed,
          init.slug,
          research,
        )
      }
      nodes.push(seedNode)
    }
  }

  for (const ws of workstreams) {
    nodes.push(workstreamToNode(ws))
  }

  const skills = getters.getSkills()
  for (const skill of skills) {
    nodes.push(skillToNode(skill))
  }

  const { rules } = getters.getConventions()
  for (const rule of rules) {
    nodes.push(ruleToNode(rule))
  }

  // Add any domain-specific extra nodes
  if (getters.getExtraNodes) {
    nodes.push(...getters.getExtraNodes())
  }

  return nodes
}
