import type { SherpaUserConfig, SherpaConfig, SherpaPlugin } from "./types"
import { buildDefaults } from "./defaults"
import { userConfigSchema } from "./schema"
import { setProjectRoot, setClaudeMdLocations, setClaudeMdScanDirs } from "../content"

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
  LifecycleStageDefinition,
} from "./types"
export { DEFAULT_PATHS, DEFAULT_VOCABULARY } from "./defaults"
