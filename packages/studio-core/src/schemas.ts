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
  status: z.enum(INITIATIVE_STATUSES).default("pending"),
  initiative: z.string(),
  created: z.coerce.string(),
  updated: z.coerce.string(),
  type: z
    .enum(INITIATIVE_TYPES)
    .nullable()
    .optional()
    .default(null),
  risk: z
    .enum(INITIATIVE_RISKS)
    .nullable()
    .optional()
    .default(null),
  targets: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).optional().default([]),
  "spawned-from": z.string().nullable().optional().default(null),
});

const workstreamRoleAssignmentSchema = z.object({
  slug: z.string(),
  status: z.enum(ASSIGNMENT_STATUSES).default("active"),
});

export const workstreamFrontmatterSchema = z.object({
  status: z.enum(WORKSTREAM_STATUSES).default("active"),
  started: z.coerce.string(),
  worktree: z.string().nullable().optional().default(null),
  focus: z.string().default(""),
  initiative: z.string().nullable().optional().default(null),
  roles: z.array(workstreamRoleAssignmentSchema).optional().default([]),
});

export const branchSeedFrontmatterSchema = z.object({
  status: z.enum(BRANCH_SEED_STATUSES).default("seed"),
  "source-iteration": z.coerce.number().default(0),
  "spawned-from": z.string(),
  created: z.coerce.string(),
  priority: z.enum(BRANCH_PRIORITIES).default("medium"),
  "sub-initiative": z.string().nullable().optional().default(null),
});

export const skillFrontmatterSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
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
    name: z.string().optional(),
    role: z.string().optional(), // legacy alias for name
    "display-name": z.string(),
    category: z.enum(AGENT_ROLE_CATEGORIES),
    disposition: z.string(),

    // Behavioral (all optional)
    "domain-scope": z.array(z.string()).optional().default([]),
    "behavioral-constraints": z.array(z.string()).optional().default([]),
    "quality-bar": z.array(z.string()).optional().default([]),
    "fail-triggers": z.array(z.string()).optional().default([]),
    "output-style": z.string().optional(),

    // Operational (all optional)
    "model-tier": z.enum(AGENT_MODEL_TIERS).optional().default("medium"),
    "tool-permissions": z.array(z.string()).optional().default([]),
    escalation: z.array(z.string()).optional().default([]),
    "context-packages": z.array(z.string()).optional().default([]),
    rules: z.array(z.string()).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    patterns: z.array(z.enum(AGENT_PATTERNS)).optional().default([]),
    structure: z.enum(AGENT_STRUCTURES).nullable().optional().default(null),

    // Dispatch (all optional)
    "task-type": z.string().optional(),
    "eligible-task-types": z.array(z.string()).optional().default([]),

    // Display (all optional)
    vibe: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
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
  input: z.number().default(0),
  output: z.number().default(0),
  cacheRead: z.number().default(0),
  cacheCreation: z.number().default(0),
});

export const sessionSchema = z.object({
  $schema: z.literal("wavepoint/session@1").optional(),
  sessionId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable().default(null),
  durationMinutes: z.number().nullable().default(null),
  model: z.string().default("unknown"),
  branch: z.string().default("unknown"),
  initiative: z.string().nullable().default(null),
  role: z.string().nullable().default(null),
  tokens: sessionTokensSchema.default({}),
  filesModified: z.array(z.string()).default([]),
  toolsUsed: z.array(z.string()).default([]),
  commits: z.array(z.string()).default([]),
  outcome: z.enum(SESSION_OUTCOMES).default("in-progress"),
  summary: z.string().nullable().default(null),
});

export const ruleFrontmatterSchema = z.object({
  description: z.string().optional().default(""),
  globs: z
    .union([z.array(z.string()), z.string().transform((s) => [s])])
    .optional()
    .default([]),
  alwaysApply: z.boolean().optional().default(false),
});
