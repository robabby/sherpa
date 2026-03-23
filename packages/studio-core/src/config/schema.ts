import { z } from "zod"

const lifecycleStageSchema = z.object({
  slug: z.string().describe("Unique identifier for this lifecycle stage"),
  label: z.string().describe("Display name shown in the UI"),
  description: z.string().describe("Explanation of what this stage means"),
  color: z.string().describe("CSS color value for status badges"),
})

const docSectionConfigSchema = z.object({
  label: z.string().min(1).describe("Display name for this documentation section"),
  path: z.string().min(1).describe("Relative path from project root to the section content"),
  type: z.enum(["directory", "files", "file"]).describe("How the path is structured: directory of files, flat file list, or single file"),
})

const projectConfigSchema = z.object({
  name: z.string().min(1).describe("Display name for this project"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be kebab-case").describe("URL-safe identifier (kebab-case)"),
  root: z.string().min(1).describe("Absolute path to project root. Supports ${ENV_VAR} interpolation."),
  remote: z.string().describe("Git remote URL for future SaaS resolution").optional(),
})

export const userConfigSchema = z.object({
  $schema: z.string().describe("JSON Schema URL for editor validation").optional(),
  projectRoot: z.string().describe("Absolute path to project root. Defaults to git root or cwd.").optional(),
  admin: z.object({
    projectName: z.string().describe("Display name for the project").optional(),
    projectDescription: z.string().describe("One-line description shown in the UI").optional(),
    adminEmails: z.array(z.string()).describe("Email addresses for admin notifications").optional(),
  }).optional(),
  theme: z.object({
    accentColor: z.string().describe("Primary accent color for the Studio UI").optional(),
    logoUrl: z.string().describe("URL or path to project logo").optional(),
  }).optional(),
  paths: z.object({
    initiatives: z.string().describe("Directory containing initiative proposals and plans").optional(),
    tasks: z.string().describe("Directory containing task definitions").optional(),
    agentRoles: z.string().describe("Directory containing agent role definitions").optional(),
    rules: z.string().describe("Directory containing convention rules").optional(),
    skills: z.string().describe("Directory containing executable skills").optional(),
    sessions: z.string().describe("Directory for session tracking data").optional(),
    research: z.string().describe("Directory for research output files").optional(),
    roadmap: z.string().describe("Path to the roadmap file").optional(),
    mcpConfig: z.string().describe("Path to MCP server configuration").optional(),
    archive: z.string().describe("Directory for archived artifacts").optional(),
    docSections: z.array(docSectionConfigSchema).describe("Custom documentation sections for the Studio file tree").optional(),
  }).optional(),
  vocabulary: z.object({
    initiative: z.string().describe("Custom term for 'initiative' (singular)").optional(),
    initiativePlural: z.string().describe("Custom term for 'initiatives' (plural)").optional(),
    proposal: z.string().describe("Custom term for 'proposal'").optional(),
    proposalPlural: z.string().describe("Custom term for 'proposals'").optional(),
    task: z.string().describe("Custom term for 'task'").optional(),
    taskPlural: z.string().describe("Custom term for 'tasks'").optional(),
    agent: z.string().describe("Custom term for 'agent'").optional(),
    agentPlural: z.string().describe("Custom term for 'agents'").optional(),
    role: z.string().describe("Custom term for 'role'").optional(),
    rolePlural: z.string().describe("Custom term for 'roles'").optional(),
    statusPending: z.string().describe("Label for the pending status").optional(),
    statusApproved: z.string().describe("Label for the approved status").optional(),
    statusInProgress: z.string().describe("Label for the in-progress status").optional(),
    statusIntegrated: z.string().describe("Label for the integrated status").optional(),
    statusDeclined: z.string().describe("Label for the declined status").optional(),
    statusArchived: z.string().describe("Label for the archived status").optional(),
    dashboard: z.string().describe("Label for the dashboard section").optional(),
    process: z.string().describe("Label for the process section").optional(),
    research: z.string().describe("Label for the research section").optional(),
    conventions: z.string().describe("Label for the conventions section").optional(),
    portfolio: z.string().describe("Label for the portfolio section").optional(),
  }).optional(),
  entities: z.object({
    lifecycleStages: z.array(lifecycleStageSchema).describe("Custom lifecycle stages beyond the defaults").optional(),
    projectSkillSlugs: z.array(z.string()).describe("Skill slugs committed to this project's repo").optional(),
    claudeMdLocations: z.array(z.string()).describe("Static paths to CLAUDE.md files").optional(),
    claudeMdScanDirs: z.array(z.string()).describe("Directories to scan for CLAUDE.md files").optional(),
  }).optional(),
  agents: z.object({
    rolesDir: z.string().describe("Override directory for agent role definitions").optional(),
  }).optional(),
  mcp: z.object({
    lmStudioUrl: z.string().describe("Base URL for the LM Studio inference server").optional(),
    configPath: z.string().describe("Path to MCP server configuration file").optional(),
    taskLogsPath: z.string().describe("Directory for task execution logs").optional(),
  }).optional(),
  knowledge: z.object({
    backend: z.enum(["algorithmic", "ollama", "api", "dispatch"]).describe("Embedding backend: algorithmic (default), ollama, api, or dispatch").optional(),
    ollama: z.object({ host: z.string().describe("Ollama server hostname") }).optional(),
    api: z.object({
      provider: z.enum(["anthropic", "openai", "voyage"]).describe("Cloud embedding provider"),
      model: z.string().describe("Model identifier for the embedding provider").optional(),
    }).optional(),
    dbPath: z.string().describe("Custom path for the knowledge SQLite database").optional(),
  }).optional(),
  governance: z.object({
    approval: z.object({
      agents: z.enum(["never", "additive-only", "always"]).describe("Policy for agent-initiated initiative approval").optional(),
      requireAuthority: z.boolean().describe("Whether agents need an authority lease for mutations").optional(),
    }).optional(),
  }).optional(),
  projects: z.array(projectConfigSchema).describe("Additional projects for Studio to federate").optional(),
  extends: z.union([z.string(), z.array(z.string())]).describe("Config files to inherit from (resolved before this config)").optional(),
  // plugins validated at runtime, not by Zod (function types don't serialize)
  plugins: z.array(z.any()).describe("Plugin functions applied in order during config resolution").optional(),
}).strict()
