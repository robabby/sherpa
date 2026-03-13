import type { LifecycleStage } from "@/lib/studio/lifecycle";

// ---------------------------------------------------------------------------
// Context interfaces — no ProcessNode dependency
// ---------------------------------------------------------------------------

export interface InitiativePromptContext {
  title: string;
  slug: string;
  source: string;
  status: string;
  iterationCount: number;
  parentSource?: string;
}

export interface SeedPromptContext {
  source: string;
  parentSource: string;
  slug: string;
  question?: string;
  vectors?: string[];
}

// ---------------------------------------------------------------------------
// Initiative prompt builders
// ---------------------------------------------------------------------------

export function buildRrContinuePrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  const lines = [`/rr`, ``, `Continue research: ${initPath}/`];
  if (ctx.iterationCount > 0) {
    lines.push(``, `${ctx.iterationCount} iteration(s) completed so far.`);
  }
  return lines.join("\n");
}

export function buildReviewPrompt(ctx: InitiativePromptContext): string {
  return [
    `Using /integration-review, review the proposal for the ${ctx.title} initiative.`,
    ``,
    `Proposal: ${ctx.source}`,
    `Status: ${ctx.status}`,
    ``,
    `Evaluate the proposal, check for completeness, and approve or request changes.`,
  ].join("\n");
}

export function buildPlanningPrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  const lines = [
    `Using /superpowers:writing-plans, create an implementation plan for`,
    `the ${ctx.title} initiative.`,
    ``,
    `Context:`,
    `- Proposal: ${ctx.source}`,
    `- Research: ${initPath}/research/`,
  ];
  if (ctx.parentSource) {
    lines.push(`- Parent: ${ctx.parentSource}`);
  }
  lines.push(
    ``,
    `The proposal status is ${ctx.status}. Translate the proposed changes into`,
    `a session-by-session implementation plan.`,
  );
  return lines.join("\n");
}

export function buildSynthesizePrompt(ctx: InitiativePromptContext): string {
  const lines = [`/synthesize ${ctx.slug}`];
  if (ctx.iterationCount >= 1) {
    lines.push(``, `${ctx.iterationCount} research iteration(s) available.`);
  }
  return lines.join("\n");
}

export function buildSubInitiativePrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/rr`,
    ``,
    `Create a new sub-initiative under ${initPath}/sub-initiatives/`,
    `Parent initiative: ${ctx.source}`,
    ``,
    `Define the sub-initiative scope, then run the first research iteration.`,
  ].join("\n");
}

export function buildStartPrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `Begin implementation of the ${ctx.title} initiative.`,
    ``,
    `Plan: ${initPath}/plan.md`,
    `Proposal: ${ctx.source}`,
    ``,
    `Follow the plan to implement the proposed changes.`,
  ].join("\n");
}

export function buildIntegrationPrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `Using /integration-review, integrate the completed ${ctx.title} initiative.`,
    ``,
    `Proposal: ${ctx.source}`,
    `Activity: ${initPath}/activity.md`,
    ``,
    `Review the completed work, apply any pending proposals to shared artifacts,`,
    `and update the initiative status to integrated.`,
  ].join("\n");
}

export function buildPlanTasksPrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/plan-tasks`,
    ``,
    `Break the ${ctx.title} initiative into dispatchable tasks.`,
    ``,
    `Context:`,
    `- Proposal: ${initPath}/proposal.md`,
    `- Plan: ${initPath}/plan.md (if exists)`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Seed prompt builder
// ---------------------------------------------------------------------------

export function buildRrLaunchPrompt(ctx: SeedPromptContext): string {
  const parentPath = ctx.source.replace(/\/branches\/[^/]+\.md$/, "");
  const targetPath = `${parentPath}/sub-initiatives/${ctx.slug}`;
  const lines = [
    `/rr`,
    ``,
    `Launch sub-initiative from seed.`,
    `Seed file: ${ctx.source}`,
    `Create sub-initiative at: ${targetPath}/`,
    `Parent initiative: ${parentPath}/proposal.md`,
  ];
  if (ctx.question) {
    lines.push(``, `Core question: ${ctx.question}`);
  }
  if (ctx.vectors && ctx.vectors.length > 0) {
    lines.push(``, `Suggested starting vectors:`);
    for (const v of ctx.vectors) {
      lines.push(`- ${v}`);
    }
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Suggested lifecycle prompt
// ---------------------------------------------------------------------------

export function getSuggestedPrompt(
  ctx: InitiativePromptContext,
  stage: LifecycleStage,
): { prompt: string; label: string } | null {
  switch (stage) {
    case "needs-research":
      return { prompt: buildRrContinuePrompt(ctx), label: "Launch Research" };
    case "needs-proposal":
      return { prompt: buildRrContinuePrompt(ctx), label: "Continue Research" };
    case "needs-review":
      return { prompt: buildReviewPrompt(ctx), label: "Review Proposal" };
    case "needs-plan":
      return { prompt: buildPlanningPrompt(ctx), label: "Create Plan" };
    case "ready-to-start":
      return { prompt: buildStartPrompt(ctx), label: "Start Implementation" };
    case "ready-to-integrate":
      return { prompt: buildIntegrationPrompt(ctx), label: "Integrate" };
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Bridge: ProcessNode → prompt context (for callers that have a ProcessNode)
// ---------------------------------------------------------------------------

interface ProcessNodeLike {
  id: string;
  title: string;
  source: string;
  status: string;
  parent: string | null;
  metadata: Record<string, unknown>;
}

export function promptContextFromNode(node: ProcessNodeLike): InitiativePromptContext {
  const slug = node.id.replace("initiative/", "");
  const research = node.metadata.research as { iterations: unknown[] } | null;
  const parentSource = node.parent
    ? `docs/initiatives/${node.parent.replace("initiative/", "")}/proposal.md`
    : undefined;
  return {
    title: node.title,
    slug,
    source: node.source,
    status: node.status,
    iterationCount: research?.iterations?.length ?? 0,
    parentSource,
  };
}

export function seedContextFromNode(node: ProcessNodeLike): SeedPromptContext {
  const slug = node.id.replace("seed/", "").split("/").pop() ?? node.id;
  return {
    source: node.source,
    parentSource: node.parent
      ? `docs/initiatives/${node.parent.replace("initiative/", "")}/proposal.md`
      : "",
    slug,
    question: node.metadata.question as string | undefined,
    vectors: node.metadata.vectors as string[] | undefined,
  };
}
