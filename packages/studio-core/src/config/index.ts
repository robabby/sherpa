import type { SherpaUserConfig, SherpaConfig, SherpaPlugin } from "./types"
import { buildDefaults } from "./defaults"
import { userConfigSchema } from "./schema"
import { setProjectRoot, setClaudeMdLocations, setClaudeMdScanDirs } from "../content"
import { loadJsonConfig } from "./load-json"

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

  // 4. Wire up the content module
  setProjectRoot(config.projectRoot)
  if (config.entities.claudeMdLocations.length > 0) {
    setClaudeMdLocations(config.entities.claudeMdLocations)
  }
  if (config.entities.claudeMdScanDirs.length > 0) {
    setClaudeMdScanDirs(config.entities.claudeMdScanDirs)
  }

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
} from "./types"
export { DEFAULT_PATHS, DEFAULT_VOCABULARY, DEFAULT_GOVERNANCE } from "./defaults"
