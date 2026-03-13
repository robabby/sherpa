"use client";

import { motion } from "motion/react";
import type { LifecycleStage } from "@/lib/studio/lifecycle";
import { cn } from "./lib/utils";
import { EASE_EMERGENCE, TIMING } from "./lib/animation-constants";
import {
  getSuggestedPrompt,
  type InitiativePromptContext,
} from "./lib/initiative-prompts";
import type { LifecycleData } from "./lib/process-detail-helpers";
import { PromptCopyButton } from "./prompt-copy-button";

// ---------------------------------------------------------------------------
// Visual step mapping
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

interface InitiativeLifecycleHeroProps {
  lifecycle: LifecycleData;
  promptContext: InitiativePromptContext;
}

export function InitiativeLifecycleHero({
  lifecycle,
  promptContext,
}: InitiativeLifecycleHeroProps) {
  const currentVisualStep = getVisualStepIndex(lifecycle.stage);
  const suggested = getSuggestedPrompt(promptContext, lifecycle.stage);

  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
      {/* Segmented track */}
      <div className="flex h-4 gap-0.5 overflow-hidden rounded-full">
        {VISUAL_STEPS.map((step, i) => {
          const isCompleted = i < currentVisualStep;
          const isCurrent = i === currentVisualStep;

          return (
            <motion.div
              key={step.label}
              className={cn(
                "flex-1 rounded-sm",
                isCompleted && "bg-[var(--color-gold)]",
                isCurrent && "bg-[var(--color-gold)] animate-[segment-pulse_2s_ease-in-out_infinite]",
                !isCompleted && !isCurrent && "bg-[var(--color-copper)]/10",
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: EASE_EMERGENCE,
              }}
              style={{ originX: 0 }}
            />
          );
        })}
      </div>

      {/* Labels */}
      <div className="mt-2 flex">
        {VISUAL_STEPS.map((step, i) => {
          const isCurrent = i === currentVisualStep;
          const isCompleted = i < currentVisualStep;
          return (
            <span
              key={step.label}
              className={cn(
                "flex-1 font-mono text-[10px] uppercase tracking-[0.2em]",
                isCurrent && "text-[var(--color-gold)]",
                isCompleted && "text-[var(--color-gold)]/50",
                !isCurrent && !isCompleted && "text-muted-foreground/20",
              )}
            >
              {step.label}
            </span>
          );
        })}
      </div>

      {/* Primary CTA */}
      {suggested && lifecycle.stage !== "integrated" && lifecycle.stage !== "in-flight" && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: EASE_EMERGENCE }}
        >
          <div
            className={cn(
              "group flex items-center gap-3 rounded-lg border px-4 py-3",
              "bg-[var(--color-gold)]/5 border-[var(--color-gold)]/20",
              "animate-[cta-glow_3s_ease-in-out_infinite]",
              "transition-colors hover:bg-[var(--color-gold)]/10",
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-gold)]">
                  {suggested.label}
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
              <p className="mt-0.5 text-xs text-muted-foreground/60 truncate">
                {lifecycle.nextAction}
              </p>
            </div>
            <PromptCopyButton
              prompt={suggested.prompt}
              variant="rr"
              label={suggested.label}
            />
          </div>
        </motion.div>
      )}

      {/* Archived state */}
      {lifecycle.stage === "archived" && (
        <div className="mt-4 rounded-md border border-zinc-500/20 bg-zinc-500/5 px-3 py-2 text-sm text-zinc-500">
          This initiative has been archived. Restore it to reactivate.
        </div>
      )}
    </div>
  );
}
