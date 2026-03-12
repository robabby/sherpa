// Agent role constants
export const AGENT_ROLE_CATEGORIES = [
  "engineering",
  "product",
  "design",
  "research",
  "quality",
  "operations",
  "marketing",
  "security",
  "data",
  "governance",
  // Legacy (accepted with warning by linter, mapped by Studio)
  "strategy",
  "domain",
] as const;
export type AgentRoleCategory = (typeof AGENT_ROLE_CATEGORIES)[number];

export const AGENT_MODEL_TIERS = ["high", "medium", "low"] as const;
export type AgentModelTier = (typeof AGENT_MODEL_TIERS)[number];

export const AGENT_PATTERNS = [
  "prompt-chaining",
  "routing",
  "parallelization",
  "reflection",
  "tool-use",
  "planning",
  "multi-agent-collaboration",
  "memory-management",
  "learning-and-adaptation",
  "model-context-protocol",
  "goal-setting-and-monitoring",
  "exception-handling",
  "human-in-the-loop",
  "knowledge-retrieval",
  "inter-agent-communication",
  "resource-aware-optimization",
  "reasoning-techniques",
  "guardrails",
  "evaluation-and-monitoring",
  "prioritization",
  "exploration-and-discovery",
] as const;
export type AgentPattern = (typeof AGENT_PATTERNS)[number];

export const AGENT_STRUCTURES = [
  "pipeline",
  "router-dispatcher",
  "parallel-fan-out-in",
  "producer-critic",
  "hierarchical-manager-worker",
  "expert-team",
  "debate-consensus",
  "scientific-method",
] as const;
export type AgentStructure = (typeof AGENT_STRUCTURES)[number];

export interface AgentRole {
  slug: string;
  displayName: string;
  category: AgentRoleCategory;
  modelTier: AgentModelTier;
  patterns: AgentPattern[];
  structure: AgentStructure | null;
  contextPackages: string[];
  rules: string[];
  skills: string[];
  toolPermissions: string[];
  escalation: string[];
  description: string;
}

// Assignment constants
export const ASSIGNMENT_STATUSES = ["active", "standby", "completed"] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export interface WorkstreamRoleAssignment {
  slug: string;
  status: AssignmentStatus;
}

// Status constants (used as Zod enum sources)
export const INITIATIVE_STATUSES = [
  "pending",
  "approved",
  "in-progress",
  "integrated",
  "declined",
  "archived",
] as const;

export const INITIATIVE_TYPES = [
  "roadmap-update",
  "guideline-evolution",
  "new-skill",
  "research-synthesis",
  "process-change",
  "new-plan",
] as const;

export const INITIATIVE_RISKS = [
  "additive",
  "evolutionary",
  "structural",
] as const;

export const WORKSTREAM_STATUSES = [
  "active",
  "paused",
  "completed",
] as const;

export const DOC_CATEGORIES = [
  "research",
  "plans",
  "specs",
  "ux",
  "architecture",
  "curation",
] as const;

// Derived types
export type InitiativeStatus = (typeof INITIATIVE_STATUSES)[number];
export type InitiativeType = (typeof INITIATIVE_TYPES)[number];
export type InitiativeRisk = (typeof INITIATIVE_RISKS)[number];
export type WorkstreamStatus = (typeof WORKSTREAM_STATUSES)[number];
export type DocCategory = (typeof DOC_CATEGORIES)[number];

// Core interfaces
export interface Initiative {
  slug: string;
  status: InitiativeStatus;
  type: string | null;
  risk: string | null;
  created: string;
  updated: string;
  targets: string[];
  dependencies: string[];
  spawnedFrom: string | null;
  title: string;
  summary: string;
  subDirectories: { name: string; fileCount: number }[];
}

export interface Workstream {
  slug: string;
  status: WorkstreamStatus;
  started: string;
  worktree: string | null;
  focus: string;
  initiative: string | null;
  roles: WorkstreamRoleAssignment[];
  activityLog: ActivityEntry[];
}

export interface ContentFile {
  relativePath: string;
  fileName: string;
  title: string;
  frontmatter: Record<string, unknown> | null;
  lineCount: number;
  sizeBytes: number;
  lastModified: string;
}

export interface Rule {
  fileName: string;
  name: string;
  description: string;
  globs: string[];
  alwaysApply: boolean;
  relativePath: string;
}

export interface DocumentContent {
  relativePath: string;
  fileName: string;
  title: string;
  frontmatter: Record<string, unknown> | null;
  content: string;
  lineCount: number;
  sections: SectionHeading[];
}

export interface SectionHeading {
  level: number;
  text: string;
  id: string;
}

export interface ActivityEntry {
  date: string;
  description: string;
}

export type ActivitySegment =
  | { type: "text"; value: string }
  | { type: "pr-link"; number: number; url: string };

export interface DateActivityData {
  date: string;
  formattedDate: string;
  portfolioActivity: ActivityEntry[];
  workstreamActivity: {
    slug: string;
    focus: string;
    entries: ActivityEntry[];
  }[];
}

export interface PortfolioData {
  lastUpdated: string;
  apps: PortfolioApp[];
  dependencies: CrossDependency[];
  monorepoInitiatives: MonorepoInitiative[];
  recentActivity: ActivityEntry[];
}

export interface PortfolioApp {
  name: string;
  type: string;
  currentPhase: string;
  health: string;
  nextMilestone: string;
  roadmapLink: string;
}

export interface CrossDependency {
  blockedProject: string;
  waitingOn: string;
  dependency: string;
  status: string;
}

export interface MonorepoInitiative {
  name: string;
  description: string;
}

export interface Skill {
  slug: string;
  name: string;
  description: string;
  relativePath: string;
  isProjectSkill: boolean;
  lineCount: number;
}

export interface HubStats {
  process: {
    initiativeCount: number;
    activeWorkstreams: number;
    pendingProposals: number;
  };
  portfolio: {
    projectCount: number;
    activeDevCount: number;
    lastActivityDate: string;
  };
  docs: {
    totalDocs: number;
    researchTracks: number;
    planCount: number;
  };
  conventions: {
    ruleCount: number;
    claudeMdCount: number;
    uxGuideCount: number;
  };
  sessions: {
    total: number;
    thisWeek: number;
    totalTokens: number;
    weeklyTokens: number;
  };
  extensions: Record<string, Record<string, number>>;
}

// Branch seeds (research branching)
export const BRANCH_SEED_STATUSES = ["seed", "launched"] as const;
export type BranchSeedStatus = (typeof BRANCH_SEED_STATUSES)[number];
export const BRANCH_PRIORITIES = ["high", "medium", "low"] as const;
export type BranchPriority = (typeof BRANCH_PRIORITIES)[number];

export interface BranchSeed {
  slug: string;
  status: BranchSeedStatus;
  sourceIteration: number;
  spawnedFrom: string;
  created: string;
  priority: BranchPriority;
  subInitiativePath: string | null;
  title: string;
  context: string | null;
  question: string | null;
  vectors: string[];
  relativePath: string;
}

export type ResearchTreeNodeKind = "root" | "seed" | "sub-initiative";

export interface ResearchTreeNode {
  kind: ResearchTreeNodeKind;
  slug: string;
  title: string;
  status: string;
  priority: BranchPriority | null;
  question: string | null;
  iterationCount: number;
  openQuestions: string[];
  depth: number;
  relativePath: string;
  children: ResearchTreeNode[];
}

// Research library (structured iteration browsing)
export interface ResearchIteration {
  number: number;
  synthesis: ContentFile | null;
  vectors: ContentFile[];
}

export interface InitiativeResearch {
  readme: ContentFile | null;
  iterations: ResearchIteration[];
  looseFiles: ContentFile[];
  totalFiles: number;
}

// Unified process view
export interface UnifiedInitiativeEntry {
  initiative: Initiative;
  workstreams: Workstream[];
  researchTree: ResearchTreeNode | null;
  totalIterations: number;
  totalOpenQuestions: number;
  totalBranchSeeds: number;
  latestActivity: ActivityEntry | null;
}

export interface UnifiedProcessData {
  entries: UnifiedInitiativeEntry[];
  orphanWorkstreams: Workstream[];
  stats: ProcessDashboardStats;
}

export interface ProcessDashboardStats {
  totalInitiatives: number;
  activeWorkstreams: number;
  totalIterations: number;
  totalOpenQuestions: number;
  pendingSeeds: number;
  statusCounts: Record<string, number>;
}

// Deliverables (charts + presentations)
export const CHART_TYPES = [
  "bar",
  "line",
  "area",
  "pie",
  "radar",
] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export const SLIDE_TYPES = ["title", "content", "chart", "split"] as const;
export type SlideType = (typeof SLIDE_TYPES)[number];

export const DELIVERABLE_TYPES = ["chart", "deck"] as const;
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];

export interface SeriesSpec {
  key: string;
  label: string;
  color: string;
  stackId?: string;
  type?: "monotone" | "step" | "linear";
}

export interface AxisSpec {
  dataKey?: string;
  label?: string;
  hide?: boolean;
}

export interface ChartSpec {
  $schema: "wavepoint/chart@1";
  id: string;
  title: string;
  description?: string;
  created: string;
  sourceIteration?: number;
  chartType: ChartType;
  layout?: "horizontal" | "vertical";
  data: Record<string, unknown>[];
  series: SeriesSpec[];
  xAxis?: AxisSpec;
  legend?: boolean;
}

export interface TitleSlide {
  type: "title";
  heading: string;
  subtitle?: string;
}

export interface ContentSlide {
  type: "content";
  heading: string;
  body: string;
  footnote?: string;
}

export interface ChartSlide {
  type: "chart";
  heading: string;
  caption?: string;
  chart: ChartSpec;
}

export interface SplitSlide {
  type: "split";
  heading: string;
  left: { body: string };
  right: { body: string } | { chart: ChartSpec };
}

export type SlideSpec = TitleSlide | ContentSlide | ChartSlide | SplitSlide;

export interface DeckSpec {
  $schema: "wavepoint/deck@1";
  id: string;
  title: string;
  description?: string;
  created: string;
  sourceIteration?: number;
  slides: SlideSpec[];
}

// Session manifest
export const SESSION_OUTCOMES = [
  "completed",
  "interrupted",
  "in-progress",
] as const;
export type SessionOutcome = (typeof SESSION_OUTCOMES)[number];

export interface SessionTokens {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreation: number;
}

export interface Session {
  sessionId: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  model: string;
  branch: string;
  initiative: string | null;
  role: string | null;
  tokens: SessionTokens;
  filesModified: string[];
  toolsUsed: string[];
  commits: string[];
  outcome: SessionOutcome;
  summary: string | null;
}

export interface DeliverableSummary {
  id: string;
  type: DeliverableType;
  title: string;
  description?: string;
  created: string;
  sourceIteration?: number;
  fileName: string;
  slideCount?: number;
}
