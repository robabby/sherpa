import type {
  AdminConfig,
  AgentsConfig,
  EntitiesConfig,
  GovernanceConfig,
  KnowledgeConfig,
  McpConfig,
  PathsConfig,
  SherpaConfig,
  SherpaUserConfig,
  ThemeConfig,
  VocabularyConfig,
} from "./types"
import { DEFAULT_DISPATCH } from "../dispatch"

export const DEFAULT_PATHS: Required<PathsConfig> = {
  initiatives: "docs/initiatives",
  tasks: "docs/tasks",
  agentRoles: "docs/agents/roles",
  baseCatalog: "agents",
  rules: ".claude/rules",
  skills: ".claude/skills",
  sessions: "docs/sessions",
  research: "docs/research",
  roadmap: "docs/roadmap.md",
  mcpConfig: ".mcp.json",
  archive: ".archive",
}

export const DEFAULT_VOCABULARY: Required<VocabularyConfig> = {
  initiative: "Initiative",
  initiativePlural: "Initiatives",
  proposal: "Proposal",
  proposalPlural: "Proposals",
  task: "Task",
  taskPlural: "Tasks",
  agent: "Agent",
  agentPlural: "Agents",
  role: "Role",
  rolePlural: "Roles",
  statusPending: "Pending",
  statusApproved: "Approved",
  statusInProgress: "In Progress",
  statusIntegrated: "Integrated",
  statusDeclined: "Declined",
  statusArchived: "Archived",
  dashboard: "Dashboard",
  process: "Process",
  research: "Research",
  conventions: "Conventions",
  portfolio: "Portfolio",
}

export const DEFAULT_ADMIN: Required<AdminConfig> = {
  projectName: "Studio",
  projectDescription: "",
  adminEmails: [],
}

export const DEFAULT_THEME: Required<ThemeConfig> = {
  accentColor: "",
  logoUrl: "",
}

export const DEFAULT_ENTITIES: Required<EntitiesConfig> = {
  lifecycleStages: [],
  projectSkillSlugs: [],
  claudeMdLocations: ["CLAUDE.md", "docs/CLAUDE.md"],
  claudeMdScanDirs: [],
}

export const DEFAULT_AGENTS: Required<AgentsConfig> = {
  rolesDir: "",
}

export const DEFAULT_MCP: Required<McpConfig> = {
  lmStudioUrl: "http://127.0.0.1:1234",
  configPath: "",
  taskLogsPath: "",
  port: 3100,
}

export const DEFAULT_KNOWLEDGE: Required<KnowledgeConfig> = {
  backend: "algorithmic",
  ollama: { host: "http://localhost:11434" },
  api: { provider: "anthropic", model: "" },
  dbPath: "",
}

export const DEFAULT_GOVERNANCE: GovernanceConfig = {
  approval: {
    agents: "never",
    requireAuthority: true,
  },
}

/**
 * Merge user config with defaults to produce a fully resolved SherpaConfig.
 */
export function buildDefaults(userConfig: SherpaUserConfig): SherpaConfig {
  const paths = { ...DEFAULT_PATHS, ...userConfig.paths }

  return {
    projectRoot: userConfig.projectRoot ?? process.cwd(),
    admin: { ...DEFAULT_ADMIN, ...userConfig.admin },
    theme: { ...DEFAULT_THEME, ...userConfig.theme },
    paths,
    vocabulary: { ...DEFAULT_VOCABULARY, ...userConfig.vocabulary },
    entities: { ...DEFAULT_ENTITIES, ...userConfig.entities },
    agents: {
      rolesDir: userConfig.agents?.rolesDir ?? paths.agentRoles,
    },
    mcp: {
      lmStudioUrl: userConfig.mcp?.lmStudioUrl ?? DEFAULT_MCP.lmStudioUrl,
      configPath: userConfig.mcp?.configPath ?? paths.mcpConfig,
      taskLogsPath: userConfig.mcp?.taskLogsPath ?? DEFAULT_MCP.taskLogsPath,
      port: userConfig.mcp?.port ?? DEFAULT_MCP.port,
    },
    knowledge: {
      backend: userConfig.knowledge?.backend ?? DEFAULT_KNOWLEDGE.backend,
      ollama: userConfig.knowledge?.ollama ?? DEFAULT_KNOWLEDGE.ollama,
      api: userConfig.knowledge?.api ?? DEFAULT_KNOWLEDGE.api,
      dbPath: userConfig.knowledge?.dbPath ?? DEFAULT_KNOWLEDGE.dbPath,
    },
    governance: {
      approval: {
        agents: userConfig.governance?.approval?.agents ?? DEFAULT_GOVERNANCE.approval.agents,
        requireAuthority: userConfig.governance?.approval?.requireAuthority ?? DEFAULT_GOVERNANCE.approval.requireAuthority,
      },
    },
    dispatch: { ...DEFAULT_DISPATCH, ...userConfig.dispatch },
    plugins: userConfig.plugins ?? [],
  }
}
