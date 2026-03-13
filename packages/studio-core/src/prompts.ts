import type { AgentRole, BranchSeed, ResearchTreeNode } from "./types";
import type { ProcessNode } from "./process-nodes-shared";

/**
 * Generate a /curate prompt for portfolio-level triage.
 */
export function generateCuratePrompt(): string {
  return `/curate`;
}

/**
 * Generate a /synthesize prompt from a research tree node.
 */
export function generateSynthesizePrompt(node: ResearchTreeNode): string {
  const lines = [
    `/synthesize ${node.relativePath.replace("docs/initiatives/", "").replace(/\/$/, "")}`,
  ];

  if (node.iterationCount >= 2) {
    lines.push(
      ``,
      `${node.iterationCount} research iterations available.`,
    );
  }

  return lines.join("\n");
}

/**
 * Derive the parent initiative's base path from a seed's relativePath.
 * "docs/initiatives/a/sub-initiatives/b/branches/seed.md" → "docs/initiatives/a/sub-initiatives/b"
 */
function seedParentPath(seed: BranchSeed): string {
  return seed.relativePath.replace(/\/branches\/[^/]+\.md$/, "");
}

/**
 * Generate an /rr launch prompt from a branch seed.
 * Used to bootstrap a new research initiative from a seed.
 */
export function generateRrLaunchPrompt(seed: BranchSeed): string {
  const parentPath = seedParentPath(seed);
  const targetPath = `${parentPath}/sub-initiatives/${seed.slug}`;

  const lines = [
    `/rr`,
    ``,
    `Launch sub-initiative from seed.`,
    `Seed file: ${seed.relativePath}`,
    `Create sub-initiative at: ${targetPath}/`,
    `Parent initiative: ${parentPath}/proposal.md`,
  ];

  if (seed.context) {
    lines.push(``, `Context: ${seed.context}`);
  }

  if (seed.question) {
    lines.push(``, `Core question: ${seed.question}`);
  }

  if (seed.vectors.length > 0) {
    lines.push(``, `Suggested starting vectors:`);
    for (const v of seed.vectors) {
      lines.push(`- ${v}`);
    }
  }

  return lines.join("\n");
}

/**
 * Generate an /rr continue prompt for an active research node.
 */
export function generateRrContinuePrompt(node: ResearchTreeNode): string {
  const lines = [
    `/rr`,
    ``,
    `Continue research: ${node.relativePath}/`,
  ];

  if (node.openQuestions.length > 0) {
    lines.push(``, `Open questions from previous iterations:`);
    for (const q of node.openQuestions) {
      lines.push(`- ${q}`);
    }
  }

  return lines.join("\n");
}

/**
 * Generate a planning prompt for translating research into an implementation plan.
 */
export function generatePlanningPrompt(
  node: ResearchTreeNode,
  parentPath?: string
): string {
  const lines = [
    `Using /superpowers:writing-plans, create an implementation plan for`,
    `the ${node.title} initiative.`,
    ``,
    `Context:`,
    `- Proposal: ${node.relativePath}/proposal.md`,
    `- Research: ${node.relativePath}/research/`,
  ];

  if (parentPath) {
    lines.push(`- Parent: ${parentPath}/proposal.md`);
  }

  lines.push(
    ``,
    `The proposal status is ${node.status}. Translate the proposed changes into`,
    `a session-by-session implementation plan.`
  );

  return lines.join("\n");
}

/**
 * Generate a review prompt for a pending initiative proposal.
 */
export function generateReviewPrompt(node: ProcessNode): string {
  return [
    `Using /integration-review, review the proposal for the ${node.title} initiative.`,
    ``,
    `Proposal: ${node.source}`,
    `Status: ${node.status}`,
    ``,
    `Evaluate the proposal, check for completeness, and approve or request changes.`,
  ].join("\n");
}

/**
 * Generate an integration review prompt for completed work.
 */
export function generateIntegrationPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `Using /integration-review, integrate the completed ${node.title} initiative.`,
    ``,
    `Proposal: ${node.source}`,
    `Activity: ${initPath}/activity.md`,
    ``,
    `Review the completed work, apply any pending proposals to shared artifacts,`,
    `and update the initiative status to integrated.`,
  ].join("\n");
}

/**
 * Generate a /shape prompt for setting appetite and constraints.
 */
export function generateShapePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/shape ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Shape the ${node.title} initiative.`,
    `Set appetite, identify rabbit holes, mark no-gos, define kill criteria.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /stake prompt for thesis-based option evaluation.
 */
export function generateStakePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/stake ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Stake the ${node.title} initiative.`,
    `Frame options as theses, evaluate, recommend a direction, define kill criteria.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /spike prompt for testing the riskiest assumption.
 */
export function generateSpikePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/spike ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Spike the riskiest assumption for ${node.title}.`,
    `One question, one session, build the minimum thing that answers it.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /design prompt for architecture and UI design.
 */
export function generateDesignPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/design ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Design the ${node.title} initiative.`,
    `Read the shape, design the architecture and UI, produce design.md and prototype.html.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
    `- Shape: ${initPath}/shape.md`,
  ].join("\n");
}

/**
 * Generate a /premortem prompt for failure mode analysis.
 */
export function generatePremortemPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/premortem ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Run a pre-mortem on the ${node.title} initiative.`,
    `Imagine failure, work backward, identify failure modes and mitigations.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /stress-test prompt for assumption falsification.
 */
export function generateStressTestPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/stress-test ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Stress-test the assumptions behind ${node.title}.`,
    `Extract assumptions, design falsification tests, execute what's executable.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /memo prompt for strategic decision memos.
 */
export function generateMemoPrompt(node: ProcessNode): string {
  return [
    `/memo ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Write a strategic memo for the ${node.title} initiative.`,
    `Frame the strategic question, gather evidence across initiatives, recommend.`,
    ``,
    `Proposal: ${node.source}`,
  ].join("\n");
}

/**
 * Generate a /radar prompt for technology landscape classification.
 */
export function generateRadarPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/radar ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Build a technology radar for ${node.title}.`,
    `Classify the surveyed landscape into Adopt/Trial/Assess/Hold.`,
    ``,
    `Context:`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a standalone role prompt for an agent role.
 * Includes identity, context packages, rules, skills, tool permissions, and escalation.
 */
export function generateRolePrompt(role: AgentRole, task?: string): string {
  const lines = [
    `You are acting as the **${role.displayName}** (${role.category}).`,
    ``,
  ];

  if (role.description) {
    lines.push(role.description, ``);
  }

  if (role.contextPackages.length > 0) {
    lines.push(`## Context Packages`);
    lines.push(`Read these at session start:`);
    for (const pkg of role.contextPackages) {
      lines.push(`- ${pkg}`);
    }
    lines.push(``);
  }

  if (role.rules.length > 0) {
    lines.push(`## Rules`);
    lines.push(`Observe these conventions:`);
    for (const rule of role.rules) {
      lines.push(`- ${rule}`);
    }
    lines.push(``);
  }

  if (role.skills.length > 0) {
    lines.push(`## Skills`);
    lines.push(`Available skills:`);
    for (const skill of role.skills) {
      lines.push(`- ${skill}`);
    }
    lines.push(``);
  }

  if (role.toolPermissions.length > 0) {
    lines.push(`## Tool Permissions`);
    for (const perm of role.toolPermissions) {
      lines.push(`- ${perm}`);
    }
    lines.push(``);
  }

  if (role.escalation.length > 0) {
    lines.push(`## Escalation`);
    for (const esc of role.escalation) {
      lines.push(`- ${esc}`);
    }
    lines.push(``);
  }

  if (task) {
    lines.push(`## Task`, task, ``);
  }

  return lines.join("\n").trimEnd();
}

/**
 * Prefix any existing prompt with role context.
 * Composable with generateRrLaunchPrompt, generatePlanningPrompt, etc.
 */
export function prefixWithRole(role: AgentRole, prompt: string): string {
  const header = [
    `**Role: ${role.displayName}** (${role.category})`,
  ];

  if (role.contextPackages.length > 0) {
    header.push(`Context: ${role.contextPackages.join(", ")}`);
  }

  if (role.rules.length > 0) {
    header.push(`Rules: ${role.rules.join(", ")}`);
  }

  header.push(`---`, ``);

  return header.join("\n") + prompt;
}
