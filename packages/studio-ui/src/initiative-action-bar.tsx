"use client";

import { PromptCopyButton } from "./prompt-copy-button";

// ---------------------------------------------------------------------------
// Prompt builders — self-contained, no ProcessNode dependency
// ---------------------------------------------------------------------------

function buildRrContinuePrompt(slug: string, iterationCount: number): string {
  const initPath = `docs/initiatives/${slug}`;
  const lines = [`/rr`, ``, `Continue research: ${initPath}/`];
  if (iterationCount > 0) {
    lines.push(``, `${iterationCount} iteration(s) completed so far.`);
  }
  return lines.join("\n");
}

function buildPlanningPrompt(title: string, slug: string, status: string): string {
  const initPath = `docs/initiatives/${slug}`;
  return [
    `Using /superpowers:writing-plans, create an implementation plan for`,
    `the ${title} initiative.`,
    ``,
    `Context:`,
    `- Proposal: ${initPath}/proposal.md`,
    `- Research: ${initPath}/research/`,
    ``,
    `The proposal status is ${status}. Translate the proposed changes into`,
    `a session-by-session implementation plan.`,
  ].join("\n");
}

function buildSynthesizePrompt(slug: string, iterationCount: number): string {
  const lines = [`/synthesize ${slug}`];
  if (iterationCount >= 1) {
    lines.push(``, `${iterationCount} research iteration(s) available.`);
  }
  return lines.join("\n");
}

function buildPlanTasksPrompt(title: string, slug: string): string {
  const initPath = `docs/initiatives/${slug}`;
  return [
    `/plan-tasks`,
    ``,
    `Break the ${title} initiative into dispatchable tasks.`,
    ``,
    `Context:`,
    `- Proposal: ${initPath}/proposal.md`,
    `- Plan: ${initPath}/plan.md (if exists)`,
  ].join("\n");
}

function buildSubInitiativePrompt(slug: string): string {
  const initPath = `docs/initiatives/${slug}`;
  return [
    `/rr`,
    ``,
    `Create a new sub-initiative under ${initPath}/sub-initiatives/`,
    `Parent initiative: ${initPath}/proposal.md`,
    ``,
    `Define the sub-initiative scope, then run the first research iteration.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface InitiativeActionBarProps {
  title: string;
  slug: string;
  status: string;
  iterationCount: number;
}

export function InitiativeActionBar({
  title,
  slug,
  status,
  iterationCount,
}: InitiativeActionBarProps) {
  const hasResearch = iterationCount > 0;
  const canPlanTasks = status === "approved" || status === "in-progress";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <PromptCopyButton
        prompt={buildRrContinuePrompt(slug, iterationCount)}
        variant="rr"
        label="Copy /rr"
      />
      {hasResearch && (
        <>
          <PromptCopyButton
            prompt={buildPlanningPrompt(title, slug, status)}
            variant="planning"
          />
          <PromptCopyButton
            prompt={buildSynthesizePrompt(slug, iterationCount)}
            variant="synthesize"
          />
        </>
      )}
      {canPlanTasks && (
        <PromptCopyButton
          prompt={buildPlanTasksPrompt(title, slug)}
          variant="plan-tasks"
        />
      )}
      <PromptCopyButton
        prompt={buildSubInitiativePrompt(slug)}
        variant="rr"
        label="Sub-initiative"
      />
    </div>
  );
}
