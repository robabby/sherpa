import { getAllProjects } from "./projects"
import { getInitiatives } from "./domain"
import type { Initiative } from "./types"
import { scanResearchFiles, type ResearchFile } from "./research-files"
import { getTaskBoard, type TaskBoardEntry } from "./tasks"

export interface CrossProjectInitiative {
  /** project/slug notation */
  id: string
  projectSlug: string
  projectName: string
  initiative: Initiative
}

export interface CrossProjectEdge {
  source: string // project/slug
  target: string // project/slug
  kind: "dependency" | "informs"
}

export interface CrossProjectGraph {
  nodes: CrossProjectInitiative[]
  edges: CrossProjectEdge[]
}

/**
 * Build a cross-project initiative graph.
 * Scans all registered projects, collects initiatives, and resolves
 * dependencies/informs references that use project/slug notation.
 */
export function buildCrossProjectGraph(): CrossProjectGraph {
  const projects = getAllProjects()
  const nodes: CrossProjectInitiative[] = []
  const edges: CrossProjectEdge[] = []

  // Collect all initiatives from all projects
  for (const project of projects) {
    const initiatives = getInitiatives(project.context)
    for (const init of initiatives) {
      nodes.push({
        id: `${project.slug}/${init.slug}`,
        projectSlug: project.slug,
        projectName: project.name,
        initiative: init,
      })
    }
  }

  // Build a lookup set for valid node IDs
  const nodeIds = new Set(nodes.map((n) => n.id))

  // Resolve edges from dependencies and informs
  for (const node of nodes) {
    for (const dep of node.initiative.dependencies) {
      // Dependencies can be plain slugs (same project) or project/slug
      const target = dep.includes("/") ? dep : `${node.projectSlug}/${dep}`
      if (nodeIds.has(target)) {
        edges.push({ source: node.id, target, kind: "dependency" })
      }
    }

    for (const inf of node.initiative.informs) {
      const target = inf.includes("/") ? inf : `${node.projectSlug}/${inf}`
      if (nodeIds.has(target)) {
        edges.push({ source: node.id, target, kind: "informs" })
      }
    }
  }

  return { nodes, edges }
}

/**
 * Get all initiatives across all projects as a flat list.
 */
export function getAllInitiatives(): CrossProjectInitiative[] {
  const projects = getAllProjects()
  const result: CrossProjectInitiative[] = []

  for (const project of projects) {
    const initiatives = getInitiatives(project.context)
    for (const init of initiatives) {
      result.push({
        id: `${project.slug}/${init.slug}`,
        projectSlug: project.slug,
        projectName: project.name,
        initiative: init,
      })
    }
  }

  return result
}

export interface CrossProjectResearchFile extends ResearchFile {
  projectSlug: string
  projectName: string
}

/**
 * Get all research files across all projects, sorted by date descending.
 */
export function getAllResearchFiles(): CrossProjectResearchFile[] {
  const projects = getAllProjects()
  const result: CrossProjectResearchFile[] = []

  for (const project of projects) {
    const files = scanResearchFiles(project.root)
    for (const file of files) {
      result.push({
        ...file,
        projectSlug: project.slug,
        projectName: project.name,
      })
    }
  }

  return result.sort((a, b) => b.date.localeCompare(a.date))
}

export interface CrossProjectTask extends TaskBoardEntry {
  projectSlug: string
  projectName: string
}

/**
 * Get all tasks across all projects.
 */
export function getAllTasks(): CrossProjectTask[] {
  const projects = getAllProjects()
  const result: CrossProjectTask[] = []

  for (const project of projects) {
    const tasks = getTaskBoard({ projectRoot: project.root })
    for (const task of tasks) {
      result.push({
        ...task,
        projectSlug: project.slug,
        projectName: project.name,
      })
    }
  }

  return result
}
