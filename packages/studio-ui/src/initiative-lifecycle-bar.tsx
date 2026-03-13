"use client";

import type { LifecycleInfo, LifecycleStage } from "@/lib/studio/lifecycle";
import { cn } from "./lib/utils";
import {
  buildRrContinuePrompt,
  buildReviewPrompt,
  buildPlanningPrompt,
  buildStartPrompt,
  buildIntegrationPrompt,
  type InitiativePromptContext,
} from "./lib/initiative-prompts";

import { PromptCopyButton } from "./prompt-copy-button";

// ---------------------------------------------------------------------------
// Visual step mapping (8 internal stages -> 5 visual steps)
// ---------------------------------------------------------------------------

const VISUAL_STEPS = [
  { label: "Research", stages: ["needs-research", "needs-proposal"] as LifecycleStage[] },
  { label: "Proposal", stages: ["needs-review"] as LifecycleStage[] },
  { label: "Plan", stages: ["needs-plan", "ready-to-start"] as LifecycleStage[] },
  { label: "Active", stages: ["in-flight", "ready-to-integrate"] as LifecycleStage[] },
  { label: "Integrated", stages: ["integrated"] as LifecycleStage[] },
];

function getVisualStepIndex(stage: LifecycleStage): number {
  return VISUAL_STEPS.findIndex((step) => step.stages.includes(stage));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface InitiativeLifecycleBarProps {
  lifecycle: LifecycleInfo;
  initiativeTitle: string;
  initiativeSlug: string;
  initiativeSource: string;
  initiativeStatus: string;
  researchIterationCount: number;
}

export function InitiativeLifecycleBar({
  lifecycle,
  initiativeTitle,
  initiativeSlug,
  initiativeSource,
  initiativeStatus,
  researchIterationCount,
}: InitiativeLifecycleBarProps) {
  const currentVisualStep = getVisualStepIndex(lifecycle.stage);

  const ctx: InitiativePromptContext = {
    title: initiativeTitle,
    slug: initiativeSlug,
    source: initiativeSource,
    status: initiativeStatus,
    iterationCount: researchIterationCount,
  };

  // Build suggested prompt based on lifecycle stage
  let suggestedPrompt: { prompt: string; label: string } | null = null;
  switch (lifecycle.stage) {
    case "needs-research":
    case "needs-proposal":
      suggestedPrompt = {
        prompt: buildRrContinuePrompt(ctx),
        label: lifecycle.stage === "needs-research" ? "Launch Research" : "Continue Research",
      };
      break;
    case "needs-review":
      suggestedPrompt = {
        prompt: buildReviewPrompt(ctx),
        label: "Review Proposal",
      };
      break;
    case "needs-plan":
      suggestedPrompt = {
        prompt: buildPlanningPrompt(ctx),
        label: "Create Plan",
      };
      break;
    case "ready-to-start":
      suggestedPrompt = {
        prompt: buildStartPrompt(ctx),
        label: "Start Implementation",
      };
      break;
    case "ready-to-integrate":
      suggestedPrompt = {
        prompt: buildIntegrationPrompt(ctx),
        label: "Integrate",
      };
      break;
  }

  return (
    <div className="rounded-lg border border-[var(--border-gold)]/15 bg-card/30 px-5 py-4">
      {/* Progress bar */}
      <div className="flex items-center">
        {VISUAL_STEPS.map((step, i) => {
          const isCompleted = i < currentVisualStep;
          const isCurrent = i === currentVisualStep;
          const isFuture = i > currentVisualStep;

          return (
            <div key={step.label} className="flex flex-1 items-center">
              <div
                className={cn(
                  "relative z-10 h-2.5 w-2.5 shrink-0 rounded-full",
                  isCompleted && "bg-[var(--color-gold)]",
                  isCurrent && "bg-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/30 animate-[pulse-glow_2s_ease-in-out_infinite]",
                  isFuture && "bg-[var(--color-copper)]/30",
                )}
              />
              {i < VISUAL_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1",
                    i < currentVisualStep
                      ? "bg-[var(--color-gold)]"
                      : "bg-[var(--color-copper)]/20",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="mt-1.5 flex">
        {VISUAL_STEPS.map((step, i) => {
          const isCurrent = i === currentVisualStep;
          return (
            <span
              key={step.label}
              className={cn(
                "flex-1 text-[10px] uppercase tracking-wider",
                isCurrent ? "text-[var(--color-gold)]" : "text-muted-foreground/30",
              )}
            >
              {step.label}
            </span>
          );
        })}
      </div>

      {/* Next action + prompt button */}
      {lifecycle.stage !== "integrated" && lifecycle.stage !== "in-flight" && (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Next: {lifecycle.nextAction}
            </span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                lifecycle.actor === "human"
                  ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                  : "bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
              )}
            >
              {lifecycle.actor === "human" ? "You" : "Agent"}
            </span>
          </div>
          {suggestedPrompt && (
            <PromptCopyButton
              prompt={suggestedPrompt.prompt}
              variant="rr"
              label={suggestedPrompt.label}
            />
          )}
        </div>
      )}
    </div>
  );
}
