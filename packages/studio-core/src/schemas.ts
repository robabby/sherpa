import { z } from "zod";

import {
  AGENT_MODEL_TIERS,
  AGENT_PATTERNS,
  AGENT_ROLE_CATEGORIES,
  AGENT_STRUCTURES,
  ASSIGNMENT_STATUSES,
  BRANCH_PRIORITIES,
  BRANCH_SEED_STATUSES,
  CHART_TYPES,
  INITIATIVE_RISKS,
  INITIATIVE_STATUSES,
  INITIATIVE_TYPES,
  SESSION_OUTCOMES,
  WORKSTREAM_STATUSES,
} from "./types";

export const initiativeFrontmatterSchema = z.object({
  status: z.enum(INITIATIVE_STATUSES).describe("Lifecycle status of the initiative").default("pending"),
  initiative: z.string().describe("Unique slug identifier for this initiative"),
  created: z.coerce.string().describe("Date the initiative was first proposed (YYYY-MM-DD)"),
  updated: z.coerce.string().describe("Date the initiative was last modified (YYYY-MM-DD)"),
  type: z
    .enum(INITIATIVE_TYPES)
    .describe("Classification: what kind of change this initiative makes")
    .nullable()
    .optional()
    .default(null),
  risk: z
    .enum(INITIATIVE_RISKS)
    .describe("Blast radius: additive (new), evolutionary (improves), or structural (changes foundations)")
    .nullable()
    .optional()
    .default(null),
  targets: z.array(z.string()).describe("File or directory paths this initiative will modify").default([]),
  dependencies: z.array(z.string()).describe("Initiative slugs that must land before this one can proceed").optional().default([]),
  informs: z.array(z.string()).describe("Initiative slugs this feeds intelligence or decisions into").optional().default([]),
  "spawned-from": z.string().describe("Parent initiative slug if this was born from a seed").nullable().optional().default(null),
});

const workstreamRoleAssignmentSchema = z.object({
  slug: z.string(),
  status: z.enum(ASSIGNMENT_STATUSES).default("active"),
});

export const workstreamFrontmatterSchema = z.object({
  status: z.enum(WORKSTREAM_STATUSES).describe("Whether this workstream is active, paused, or completed").default("active"),
  started: z.coerce.string().describe("Date work began on this workstream (YYYY-MM-DD)"),
  worktree: z.string().describe("Git worktree path if work is isolated").nullable().optional().default(null),
  focus: z.string().describe("Current focus area or task being worked on").default(""),
  initiative: z.string().describe("Associated initiative slug").nullable().optional().default(null),
  roles: z.array(workstreamRoleAssignmentSchema).describe("Agent roles assigned to this workstream").optional().default([]),
});

export const branchSeedFrontmatterSchema = z.object({
  status: z.enum(BRANCH_SEED_STATUSES).describe("Seed lifecycle: seed, launched, or declined").default("seed"),
  "source-iteration": z.coerce.number().describe("Research iteration number that produced this seed").default(0),
  "spawned-from": z.string().describe("Parent initiative that generated this seed"),
  created: z.coerce.string().describe("Date the seed was identified (YYYY-MM-DD)"),
  priority: z.enum(BRANCH_PRIORITIES).describe("Urgency: high, medium, or low").default("medium"),
  "sub-initiative": z.string().describe("Path to sub-initiative if this seed was launched").nullable().optional().default(null),
});

export const skillFrontmatterSchema = z.object({
  name: z.string().describe("Skill identifier used in slash commands").default(""),
  description: z.string().describe("When and why to invoke this skill").default(""),
});

// Deliverable schemas (charts + presentations)

const seriesSpecSchema = z.object({
  key: z.string(),
  label: z.string(),
  color: z.string(),
  stackId: z.string().optional(),
  type: z.enum(["monotone", "step", "linear"]).optional(),
});

const axisSpecSchema = z.object({
  dataKey: z.string().optional(),
  label: z.string().optional(),
  hide: z.boolean().optional(),
});

export const chartSpecSchema = z.object({
  $schema: z.literal("wavepoint/chart@1"),
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  created: z.string(),
  sourceIteration: z.number().optional(),
  chartType: z.enum(CHART_TYPES),
  layout: z.enum(["horizontal", "vertical"]).optional(),
  data: z.array(z.record(z.unknown())),
  series: z.array(seriesSpecSchema).min(1),
  xAxis: axisSpecSchema.optional(),
  legend: z.boolean().optional(),
});

const titleSlideSchema = z.object({
  type: z.literal("title"),
  heading: z.string(),
  subtitle: z.string().optional(),
});

const contentSlideSchema = z.object({
  type: z.literal("content"),
  heading: z.string(),
  body: z.string(),
  footnote: z.string().optional(),
});

const chartSlideSchema = z.object({
  type: z.literal("chart"),
  heading: z.string(),
  caption: z.string().optional(),
  chart: chartSpecSchema,
});

const splitSlideSchema = z.object({
  type: z.literal("split"),
  heading: z.string(),
  left: z.object({ body: z.string() }),
  right: z.union([
    z.object({ body: z.string() }),
    z.object({ chart: chartSpecSchema }),
  ]),
});

const slideSpecSchema = z.discriminatedUnion("type", [
  titleSlideSchema,
  contentSlideSchema,
  chartSlideSchema,
  splitSlideSchema,
]);

export const deckSpecSchema = z.object({
  $schema: z.literal("wavepoint/deck@1"),
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  created: z.string(),
  sourceIteration: z.number().optional(),
  slides: z.array(slideSpecSchema).min(1),
});

export const agentRoleFrontmatterSchema = z.object({
  role: z.string(),
  "display-name": z.string(),
  category: z.enum(AGENT_ROLE_CATEGORIES),
  "model-tier": z.enum(AGENT_MODEL_TIERS),
  patterns: z.array(z.enum(AGENT_PATTERNS)).default([]),
  structure: z.enum(AGENT_STRUCTURES).nullable().optional().default(null),
  "context-packages": z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  "tool-permissions": z.array(z.string()).default([]),
  escalation: z.array(z.string()).default([]),
  "task-type": z.string().optional(),
  "eligible-task-types": z.array(z.string()).optional().default([]),
});

export const behavioralAgentFrontmatterSchema = z
  .object({
    // Required
    name: z.string().describe("Role identifier (kebab-case)").optional(),
    role: z.string().optional(), // legacy alias for name
    "display-name": z.string().describe("Human-readable role name for the UI"),
    category: z.enum(AGENT_ROLE_CATEGORIES).describe("Role classification: engineering, design, strategy, or operations"),
    disposition: z.string().describe("Behavioral posture — how this role approaches work"),

    // Behavioral (all optional)
    "domain-scope": z.array(z.string()).describe("Technology or domain focus area").optional().default([]),
    "behavioral-constraints": z.array(z.string()).describe("Specific behavioral rules the agent must follow").optional().default([]),
    "quality-bar": z.array(z.string()).describe("Concrete acceptance criteria the Judge evaluates").optional().default([]),
    "fail-triggers": z.array(z.string()).describe("Conditions that should cause the role to flag an issue").optional().default([]),
    "output-style": z.string().describe("Expected output format (code, reports, reviews, etc.)").optional(),

    // Operational (all optional)
    "model-tier": z.enum(AGENT_MODEL_TIERS).describe("Required model capability: high (Opus/Sonnet) or medium (local models)").optional().default("medium"),
    "tool-permissions": z.array(z.string()).describe("Tools this role is allowed to use").optional().default([]),
    escalation: z.array(z.string()).describe("When to hand off to another role").optional().default([]),
    "context-packages": z.array(z.string()).describe("CLAUDE.md files to load for domain context").optional().default([]),
    rules: z.array(z.string()).describe("Convention rules this role should follow").optional().default([]),
    skills: z.array(z.string()).describe("Skills this role can invoke").optional().default([]),
    patterns: z.array(z.enum(AGENT_PATTERNS)).describe("Prompt engineering patterns this role uses").optional().default([]),
    structure: z.enum(AGENT_STRUCTURES).describe("Collaboration pattern for multi-agent workflows").nullable().optional().default(null),

    // Dispatch (all optional)
    "task-type": z.string().describe("Primary task type this role handles").optional(),
    "eligible-task-types": z.array(z.string()).describe("Additional task types this role can handle").optional().default([]),

    // Display (all optional)
    vibe: z.string().describe("One-line UI display text (never injected as prompt)").optional(),
    tags: z.array(z.string()).describe("Categorization tags for filtering").optional().default([]),
    emoji: z.string().optional(),
  })
  .transform(({ role: _role, name, ...rest }) => ({
    ...rest,
    name: name ?? _role ?? "",
  }))
  .refine((data) => data.name.length > 0, {
    message: "Either 'name' or 'role' must be provided",
    path: ["name"],
  });

// Session manifest schemas

export const sessionTokensSchema = z.object({
  input: z.number().describe("Input tokens consumed").default(0),
  output: z.number().describe("Output tokens generated").default(0),
  cacheRead: z.number().describe("Tokens read from cache").default(0),
  cacheCreation: z.number().describe("Tokens written to cache").default(0),
});

export const sessionSchema = z.object({
  $schema: z.literal("wavepoint/session@1").optional(),
  sessionId: z.string().describe("Unique session identifier"),
  startedAt: z.string().describe("ISO timestamp when the session began"),
  endedAt: z.string().describe("ISO timestamp when the session ended").nullable().default(null),
  durationMinutes: z.number().describe("Total session duration in minutes").nullable().default(null),
  model: z.string().describe("Model used during this session").default("unknown"),
  branch: z.string().describe("Git branch the session operated on").default("unknown"),
  initiative: z.string().describe("Associated initiative slug").nullable().default(null),
  role: z.string().describe("Agent role active during this session").nullable().default(null),
  tokens: sessionTokensSchema.describe("Token usage breakdown for this session").default({}),
  filesModified: z.array(z.string()).describe("File paths modified during this session").default([]),
  toolsUsed: z.array(z.string()).describe("Tools invoked during this session").default([]),
  commits: z.array(z.string()).describe("Git commit SHAs created during this session").default([]),
  outcome: z.enum(SESSION_OUTCOMES).describe("How the session ended").default("in-progress"),
  summary: z.string().describe("Human-readable summary of what was accomplished").nullable().default(null),
});

export const ruleFrontmatterSchema = z.object({
  description: z.string().describe("What this rule enforces or documents").optional().default(""),
  globs: z
    .union([z.array(z.string()), z.string().transform((s) => [s])])
    .describe("File glob patterns that trigger this rule")
    .optional()
    .default([]),
  alwaysApply: z.boolean().describe("Whether this rule loads for every task regardless of globs").optional().default(false),
});
