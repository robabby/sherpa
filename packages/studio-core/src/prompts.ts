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
