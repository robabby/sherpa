import type { SherpaConfig, ProjectConfig, ProjectContext } from "./config/types"
import { loadJsonConfig } from "./config/load-json"
import { buildDefaults } from "./config/defaults"
import { buildProjectContext } from "./context"

export interface ResolvedProject {
  name: string
  slug: string
  root: string
  remote?: string
  config: SherpaConfig
  context: ProjectContext
}

let _projects: Map<string, ResolvedProject> = new Map()
let _primarySlug: string = ""

/** Initialize the project registry from the primary config. */
export function initProjectRegistry(primaryConfig: SherpaConfig): void {
  _projects.clear()

  const primarySlug = primaryConfig.admin.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  _primarySlug = primarySlug

  _projects.set(primarySlug, {
    name: primaryConfig.admin.projectName,
    slug: primarySlug,
    root: primaryConfig.projectRoot,
    config: primaryConfig,
    context: buildProjectContext(primaryConfig),
  })

  for (const project of primaryConfig.projects) {
    const projectJson = loadJsonConfig(project.root)
    const config = projectJson
      ? buildDefaults({ ...projectJson, projectRoot: project.root })
      : buildDefaults({ projectRoot: project.root })

    _projects.set(project.slug, {
      ...project,
      config,
      context: buildProjectContext(config),
    })
  }
}

/** Get a resolved project by slug. Returns the ProjectContext for domain functions. */
export function getProjectContext(slug: string): ProjectContext | undefined {
  return _projects.get(slug)?.context
}

/** Get project metadata by slug. */
export function getProject(slug: string): ResolvedProject | undefined {
  return _projects.get(slug)
}

export function getPrimarySlug(): string { return _primarySlug }
export function getAllProjects(): ResolvedProject[] { return Array.from(_projects.values()) }
