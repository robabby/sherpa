"use client";

import { motion } from "motion/react";
import { Check, ChevronRight } from "lucide-react";
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
// Prompt builder map — play ID → prompt builder function
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

// Play ID → PromptCopyButton variant mapping
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
// Sub-components
// ---------------------------------------------------------------------------

function PlayPill({
  play,
  promptContext,
  index,
}: {
  play: PlayStatus;
  promptContext: InitiativePromptContext;
  index: number;
}) {
  const builder = PLAY_PROMPT_BUILDERS[play.id];
  const variant = PLAY_VARIANT_MAP[play.id];
  const prompt = builder ? builder(promptContext) : null;

  return (
    <motion.div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        "transition-colors",
        play.completed && [
          "border-[var(--color-gold)] bg-[var(--color-gold)]/10",
          "text-[var(--color-gold)]",
        ],
        play.suggested && [
          "border-[var(--color-gold)]",
          "animate-[cta-glow_3s_ease-in-out_infinite]",
          "text-[var(--color-gold)]",
        ],
        !play.completed && !play.suggested && [
          "border-[var(--glass-border)] text-muted-foreground/40",
          "hover:border-[var(--color-copper)]/30 hover:text-muted-foreground/60",
        ],
      )}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: EASE_EMERGENCE,
      }}
    >
      {play.completed && (
        <Check className="size-3 text-[var(--color-gold)]" />
      )}
      <span className="text-xs font-medium whitespace-nowrap">{play.label}</span>

      {/* Copy button — visible for completed/suggested, hover-reveal for others */}
      {prompt && variant && (
        <span
          className={cn(
            !play.completed && !play.suggested && "opacity-0 group-hover/pill:opacity-100 transition-opacity",
          )}
        >
          <PromptCopyButton prompt={prompt} variant={variant} label={play.skill} />
        </span>
      )}
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
          {completedCount}/{totalCount} plays
        </span>
      </div>

      {/* Play sequence — horizontal pipeline with chevron connectors */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {playbook.plays.map((play, i) => (
          <div key={play.id} className="group/pill flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight
                className={cn(
                  "size-3 flex-shrink-0",
                  play.completed || playbook.plays[i - 1]?.completed
                    ? "text-[var(--color-gold)]/40"
                    : "text-muted-foreground/15",
                )}
              />
            )}
            <PlayPill play={play} promptContext={promptContext} index={i} />
          </div>
        ))}
      </div>

      {/* Cross-cutting plays */}
      <div className="mt-3 border-t border-[var(--glass-border)] pt-3">
        <span className="font-mono text-[10px] text-muted-foreground/40">
          Available anytime
        </span>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {playbook.crossCutting.map((play) => {
            const builder = PLAY_PROMPT_BUILDERS[play.id];
            const variant = PLAY_VARIANT_MAP[play.id];
            const prompt = builder ? builder(promptContext) : null;

            return (
              <div key={play.id} className="flex items-center">
                {prompt && variant ? (
                  <PromptCopyButton prompt={prompt} variant={variant} label={play.skill} />
                ) : (
                  <span className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 text-[10px] text-muted-foreground/30">
                    {play.skill}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
