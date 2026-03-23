import type { SherpaUserConfig, SherpaConfig, SherpaPlugin, ProjectContext } from "./types"
import { buildDefaults } from "./defaults"
import { userConfigSchema } from "./schema"
import { setProjectRoot, setClaudeMdLocations, setClaudeMdScanDirs } from "../content"
import { buildProjectContext } from "../context"
import { loadJsonConfig } from "./load-json"
import { initProjectRegistry } from "../projects"

let _defaultContext: ProjectContext | null = null

/**
 * Get the default ProjectContext set by the most recent defineConfig() call.
 * Throws if defineConfig() has not been called yet.
 */
export function getDefaultContext(): ProjectContext {
  if (!_defaultContext) throw new Error("defineConfig() has not been called")
  return _defaultContext
}

/**
 * Define a Sherpa Studio configuration.
 * Validates input, merges with defaults, applies plugins, and wires up
 * the content module's project root.
 */
export function defineConfig(userConfig: SherpaUserConfig): SherpaConfig {
  // 1. Validate with Zod (plugins pass through as-is)
  userConfigSchema.parse(userConfig)

  // 2. Merge with defaults
  let config = buildDefaults(userConfig)

  // 3. Apply plugins in order
  for (const plugin of config.plugins) {
    config = plugin(config)
  }

  // 4. Wire up the content module (legacy globals)
  setProjectRoot(config.projectRoot)
  if (config.entities.claudeMdLocations.length > 0) {
    setClaudeMdLocations(config.entities.claudeMdLocations)
  }
  if (config.entities.claudeMdScanDirs.length > 0) {
    setClaudeMdScanDirs(config.entities.claudeMdScanDirs)
  }

  // 5. Build the default ProjectContext for context-aware functions
  _defaultContext = buildProjectContext(config)

  // 6. Initialize project registry
  initProjectRegistry(config)

  return config
}

/**
 * Create a typed plugin factory.
 */
export function createPlugin<TOptions>(
  factory: (options: TOptions) => SherpaPlugin
): (options: TOptions) => SherpaPlugin {
  return factory
}

/**
 * Load config from sherpa.json (or .sherpa/config.json).
 * Falls back to defaults if no config file found.
 * sherpa.config.ts remains as escape hatch for plugins (stress-test A2).
 */
export function loadConfig(projectRoot?: string): SherpaConfig {
  const root = projectRoot ?? process.cwd()
  const jsonConfig = loadJsonConfig(root)
  return defineConfig(jsonConfig ?? { projectRoot: root })
}

export { userConfigSchema } from "./schema"
export { loadJsonConfig } from "./load-json"
export { withSherpa } from "./next-wrapper"
export type {
  SherpaUserConfig,
  SherpaConfig,
  SherpaPlugin,
  PathsConfig,
  VocabularyConfig,
  AdminConfig,
  ThemeConfig,
  EntitiesConfig,
  AgentsConfig,
  McpConfig,
  KnowledgeConfig,
  GovernanceConfig,
  LifecycleStageDefinition,
  DocSectionConfig,
  ProjectConfig,
  ProjectContext,
} from "./types"
export { DEFAULT_PATHS, DEFAULT_DOC_SECTIONS, DEFAULT_VOCABULARY, DEFAULT_GOVERNANCE } from "./defaults"
export { DOTFOLDER, DOTFOLDER_DIRS, scaffoldDotfolder, hasDotfolder } from "./dotfolder"
