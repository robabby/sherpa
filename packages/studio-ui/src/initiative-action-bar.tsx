"use client";

import { PromptCopyButton } from "./prompt-copy-button";
import {
  buildRrContinuePrompt,
  buildPlanningPrompt,
  buildSynthesizePrompt,
  buildPlanTasksPrompt,
  buildSubInitiativePrompt,
  buildShapePrompt,
  buildStakePrompt,
  buildSpikePrompt,
  buildDesignPrompt,
  buildPremortemPrompt,
  buildStressTestPrompt,
  buildMemoPrompt,
  buildRadarPrompt,
  type InitiativePromptContext,
} from "./lib/initiative-prompts";

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

  const ctx: InitiativePromptContext = {
    title,
    slug,
    source: `docs/initiatives/${slug}/proposal.md`,
    status,
    iterationCount,
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <PromptCopyButton
        prompt={buildRrContinuePrompt(ctx)}
        variant="rr"
        label="Copy /rr"
      />
      {hasResearch && (
        <>
          <PromptCopyButton
            prompt={buildPlanningPrompt(ctx)}
            variant="planning"
          />
          <PromptCopyButton
            prompt={buildSynthesizePrompt(ctx)}
            variant="synthesize"
          />
        </>
      )}
      {canPlanTasks && (
        <PromptCopyButton
          prompt={buildPlanTasksPrompt(ctx)}
          variant="plan-tasks"
        />
      )}
      <PromptCopyButton
        prompt={buildSubInitiativePrompt(ctx)}
        variant="rr"
        label="Sub-initiative"
      />
      {/* Post-research skill buttons — show when approved/in-progress */}
      {canPlanTasks && (
        <>
          <PromptCopyButton prompt={buildStakePrompt(ctx)} variant="stake" />
          <PromptCopyButton prompt={buildShapePrompt(ctx)} variant="shape" />
          <PromptCopyButton prompt={buildDesignPrompt(ctx)} variant="design" />
          <PromptCopyButton prompt={buildSpikePrompt(ctx)} variant="spike" />
          <PromptCopyButton prompt={buildPremortemPrompt(ctx)} variant="premortem" />
          <PromptCopyButton prompt={buildStressTestPrompt(ctx)} variant="stress-test" />
        </>
      )}
      {hasResearch && (
        <>
          <PromptCopyButton prompt={buildRadarPrompt(ctx)} variant="radar" />
          <PromptCopyButton prompt={buildMemoPrompt(ctx)} variant="memo" />
        </>
      )}
    </div>
  );
}
