"use client";

import { motion } from "motion/react";
import type { PlaybookInfo, PlayStatus, PlayId } from "@/lib/studio/playbooks";
import {
  type InitiativePromptContext,
  buildRrContinuePrompt,
  buildStakePrompt,
  buildShapePrompt,
  buildDesignPrompt,
  buildSpikePrompt,
  buildPremortemPrompt,
  buildStressTestPrompt,
  buildPlanTasksPrompt,
  buildMemoPrompt,
  buildRadarPrompt,
} from "./lib/initiative-prompts";
import { PromptCopyButton } from "./prompt-copy-button";
import { cn } from "./lib/utils";
import { EASE_EMERGENCE } from "./lib/animation-constants";

// ---------------------------------------------------------------------------
// Prompt builder map — play ID -> prompt builder function
// ---------------------------------------------------------------------------

const PLAY_PROMPT_BUILDERS: Partial<
  Record<PlayId, (ctx: InitiativePromptContext) => string>
> = {
  rr: buildRrContinuePrompt,
  stake: buildStakePrompt,
  shape: buildShapePrompt,
  design: buildDesignPrompt,
  spike: buildSpikePrompt,
  premortem: buildPremortemPrompt,
  "stress-test": buildStressTestPrompt,
  "plan-tasks": buildPlanTasksPrompt,
  memo: buildMemoPrompt,
  radar: buildRadarPrompt,
  // retro — no client-side prompt builder yet
};

// Play ID -> PromptCopyButton variant mapping
const PLAY_VARIANT_MAP: Partial<
  Record<PlayId, "rr" | "stake" | "shape" | "design" | "spike" | "premortem" | "stress-test" | "plan-tasks" | "memo" | "radar">
> = {
  rr: "rr",
  stake: "stake",
  shape: "shape",
  design: "design",
  spike: "spike",
  premortem: "premortem",
  "stress-test": "stress-test",
  "plan-tasks": "plan-tasks",
  memo: "memo",
  radar: "radar",
};

// ---------------------------------------------------------------------------
// Stepper node — positioned on the track
// ---------------------------------------------------------------------------

function StepperNode({
  play,
  index,
}: {
  play: PlayStatus;
  index: number;
}) {
  const shortLabel = play.skill.replace("/", "");

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: EASE_EMERGENCE,
      }}
    >
      {/* Node dot */}
      {play.completed ? (
        <div className="h-3 w-3 rounded-full border-2 border-[var(--color-gold)] bg-[var(--color-gold)]" />
      ) : play.suggested ? (
        <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--color-gold)] bg-[var(--glass-bg)] pulse-ring">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
        </div>
      ) : (
        <div className="h-3 w-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)]" />
      )}

      {/* Label */}
      <span
        className={cn(
          "font-mono text-[9px] leading-none",
          play.completed && "text-[var(--color-gold)]/60",
          play.suggested && "text-[var(--color-gold)]",
          !play.completed && !play.suggested && "text-muted-foreground/25",
        )}
      >
        {shortLabel}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface InitiativePlaybookSectionProps {
  playbook: PlaybookInfo;
  promptContext: InitiativePromptContext;
}

export function InitiativePlaybookSection({
  playbook,
  promptContext,
}: InitiativePlaybookSectionProps) {
  const completedCount = playbook.plays.filter((p) => p.completed).length;
  const totalCount = playbook.plays.length;
  const fillPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Resolve the suggested play for CTA
  const suggestedPlay = playbook.nextPlay
    ? playbook.plays.find((p) => p.id === playbook.nextPlay) ?? null
    : null;
  const ctaBuilder = suggestedPlay
    ? PLAY_PROMPT_BUILDERS[suggestedPlay.id]
    : undefined;
  const ctaVariant = suggestedPlay
    ? PLAY_VARIANT_MAP[suggestedPlay.id]
    : undefined;
  const ctaPrompt = ctaBuilder ? ctaBuilder(promptContext) : null;

  return (
    <motion.div
      className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_EMERGENCE }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          Playbook
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
            "bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
          )}
        >
          {playbook.label}
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/40">
          {completedCount}/{totalCount} complete
        </span>
      </div>

      {/* Stepper track */}
      <div className="relative mt-4 px-1">
        {/* Track background */}
        <div className="absolute left-1 right-1 top-[5px] h-[2px] rounded-full bg-[var(--glass-border)]">
          {/* Fill overlay */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-bright)]"
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Nodes */}
        <div className="relative flex justify-between">
          {playbook.plays.map((play, i) => (
            <StepperNode key={play.id} play={play} index={i} />
          ))}
        </div>
      </div>

      {/* Suggested action CTA */}
      {suggestedPlay && ctaPrompt && ctaVariant && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-gold)]">
              Run {suggestedPlay.skill}
            </span>
            <span className="rounded-full bg-[var(--color-copper)]/10 px-1.5 py-0.5 text-[9px] text-[var(--color-copper)]">
              Agent
            </span>
          </div>
          <PromptCopyButton
            prompt={ctaPrompt}
            variant={ctaVariant}
            label={suggestedPlay.skill}
          />
        </div>
      )}

      {/* Cross-cutting row */}
      <div className="mt-3 flex items-center gap-2 border-t border-[var(--glass-border)] pt-2.5">
        <span className="font-mono text-[9px] text-muted-foreground/30">
          anytime
        </span>
        {playbook.crossCutting.map((play) => {
          const builder = PLAY_PROMPT_BUILDERS[play.id];
          const variant = PLAY_VARIANT_MAP[play.id];
          const prompt = builder ? builder(promptContext) : null;

          return (
            <span key={play.id}>
              {prompt && variant ? (
                <PromptCopyButton
                  prompt={prompt}
                  variant={variant}
                  label={play.skill}
                />
              ) : (
                <span className="font-mono text-[9px] text-muted-foreground/30">
                  {play.skill}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
