import { z } from "zod"

const lifecycleStageSchema = z.object({
  slug: z.string(),
  label: z.string(),
  description: z.string(),
  color: z.string(),
})

const projectConfigSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  root: z.string().min(1),
  remote: z.string().optional(),
})

export const userConfigSchema = z.object({
  projectRoot: z.string().optional(),
  admin: z.object({
    projectName: z.string().optional(),
    projectDescription: z.string().optional(),
    adminEmails: z.array(z.string()).optional(),
  }).optional(),
  theme: z.object({
    accentColor: z.string().optional(),
    logoUrl: z.string().optional(),
  }).optional(),
  paths: z.object({
    initiatives: z.string().optional(),
    tasks: z.string().optional(),
    agentRoles: z.string().optional(),
    rules: z.string().optional(),
    skills: z.string().optional(),
    sessions: z.string().optional(),
    research: z.string().optional(),
    roadmap: z.string().optional(),
    mcpConfig: z.string().optional(),
    archive: z.string().optional(),
  }).optional(),
  vocabulary: z.object({
    initiative: z.string().optional(),
    initiativePlural: z.string().optional(),
    proposal: z.string().optional(),
    proposalPlural: z.string().optional(),
    task: z.string().optional(),
    taskPlural: z.string().optional(),
    agent: z.string().optional(),
    agentPlural: z.string().optional(),
    role: z.string().optional(),
    rolePlural: z.string().optional(),
    statusPending: z.string().optional(),
    statusApproved: z.string().optional(),
    statusInProgress: z.string().optional(),
    statusIntegrated: z.string().optional(),
    statusDeclined: z.string().optional(),
    statusArchived: z.string().optional(),
    dashboard: z.string().optional(),
    process: z.string().optional(),
    research: z.string().optional(),
    conventions: z.string().optional(),
    portfolio: z.string().optional(),
  }).optional(),
  entities: z.object({
    lifecycleStages: z.array(lifecycleStageSchema).optional(),
    projectSkillSlugs: z.array(z.string()).optional(),
    claudeMdLocations: z.array(z.string()).optional(),
    claudeMdScanDirs: z.array(z.string()).optional(),
  }).optional(),
  agents: z.object({
    rolesDir: z.string().optional(),
  }).optional(),
  mcp: z.object({
    lmStudioUrl: z.string().optional(),
    configPath: z.string().optional(),
    taskLogsPath: z.string().optional(),
  }).optional(),
  knowledge: z.object({
    backend: z.enum(["algorithmic", "ollama", "api", "dispatch"]).optional(),
    ollama: z.object({ host: z.string() }).optional(),
    api: z.object({
      provider: z.enum(["anthropic", "openai", "voyage"]),
      model: z.string().optional(),
    }).optional(),
    dbPath: z.string().optional(),
  }).optional(),
  governance: z.object({
    approval: z.object({
      agents: z.enum(["never", "additive-only", "always"]).optional(),
      requireAuthority: z.boolean().optional(),
    }).optional(),
  }).optional(),
  projects: z.array(projectConfigSchema).optional(),
  // plugins validated at runtime, not by Zod (function types don't serialize)
  plugins: z.array(z.any()).optional(),
}).strict()
