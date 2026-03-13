// ---------------------------------------------------------------------------
// Config types — what consumers write (SherpaUserConfig) and what the
// framework resolves (SherpaConfig) after merging defaults + plugins.
// ---------------------------------------------------------------------------

import type { DispatchConfig } from "../dispatch"

/** Plugin: receives resolved config, returns modified config. */
export type SherpaPlugin = (config: SherpaConfig) => SherpaConfig

// ---------------------------------------------------------------------------
// Sub-configs
// ---------------------------------------------------------------------------

export interface PathsConfig {
  initiatives?: string
  tasks?: string
  agentRoles?: string
  baseCatalog?: string
  rules?: string
  skills?: string
  sessions?: string
  research?: string
  roadmap?: string
  mcpConfig?: string
  archive?: string
}

export interface VocabularyConfig {
  initiative?: string
  initiativePlural?: string
  proposal?: string
  proposalPlural?: string
  task?: string
  taskPlural?: string
  agent?: string
  agentPlural?: string
  role?: string
  rolePlural?: string
  statusPending?: string
  statusApproved?: string
  statusInProgress?: string
  statusIntegrated?: string
  statusDeclined?: string
  statusArchived?: string
  dashboard?: string
  process?: string
  research?: string
  conventions?: string
  portfolio?: string
}

export interface AdminConfig {
  /** Project name displayed in the UI. */
  projectName?: string
  /** Project description. */
  projectDescription?: string
  /** Admin email addresses. */
  adminEmails?: string[]
}

export interface ThemeConfig {
  /** Primary accent color (CSS value). */
  accentColor?: string
  /** Logo URL or path. */
  logoUrl?: string
}

export interface LifecycleStageDefinition {
  slug: string
  label: string
  description: string
  color: string
}

export interface EntitiesConfig {
  /** Custom lifecycle stages beyond the defaults. */
  lifecycleStages?: LifecycleStageDefinition[]
  /** Slugs of skills that are project-owned (committed, not symlinked). */
  projectSkillSlugs?: string[]
  /** Static CLAUDE.md scan locations. */
  claudeMdLocations?: string[]
  /** Directories to dynamically scan for CLAUDE.md files. */
  claudeMdScanDirs?: string[]
}

export interface AgentsConfig {
  /** Path to agent role definitions. Defaults to paths.agentRoles. */
  rolesDir?: string
}

export interface McpConfig {
  /** LM Studio base URL. */
  lmStudioUrl?: string
  /** Path to .mcp.json config. Defaults to paths.mcpConfig. */
  configPath?: string
  /** Path to task log directory for MCP event tracking. */
  taskLogsPath?: string
}

// ---------------------------------------------------------------------------
// User config — what consumers write in sherpa.config.ts
// ---------------------------------------------------------------------------

export interface SherpaUserConfig {
  /** Absolute path to project root. Defaults to process.cwd(). */
  projectRoot?: string
  /** Project metadata. */
  admin?: AdminConfig
  /** UI theme overrides. */
  theme?: ThemeConfig
  /** Directory paths (relative to projectRoot). */
  paths?: PathsConfig
  /** UI vocabulary overrides. */
  vocabulary?: VocabularyConfig
  /** Entity configuration. */
  entities?: EntitiesConfig
  /** Agent configuration. */
  agents?: AgentsConfig
  /** MCP server configuration. */
  mcp?: McpConfig
  /** Dispatch routing configuration. */
  dispatch?: Partial<DispatchConfig>
  /** Plugins applied in order after defaults are merged. */
  plugins?: SherpaPlugin[]
}

// ---------------------------------------------------------------------------
// Resolved config — fully populated after defaults + plugins
// ---------------------------------------------------------------------------

export interface SherpaConfig {
  projectRoot: string
  admin: Required<AdminConfig>
  theme: Required<ThemeConfig>
  paths: Required<PathsConfig>
  vocabulary: Required<VocabularyConfig>
  entities: Required<EntitiesConfig>
  agents: Required<AgentsConfig>
  mcp: Required<McpConfig>
  dispatch: DispatchConfig
  plugins: SherpaPlugin[]
}
