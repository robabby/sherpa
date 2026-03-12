"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";

import { cn } from "./lib/utils";
import type { PrimitiveLevel } from "@/lib/studio/types";
import { LEVEL_NAMES, PRIMITIVE_LEVELS } from "@/lib/studio/types";
import { EASE_PHI } from "./lib/animation-constants";

/** Opacity ramp matching the spine/section intensity */
const NODE_STYLES: Record<PrimitiveLevel, { bg: string; text: string; ring: string }> = {
  L1: { bg: "bg-[var(--color-primitive)]/8", text: "text-[var(--color-primitive)]/50", ring: "ring-[var(--color-primitive)]/40" },
  L2: { bg: "bg-[var(--color-primitive)]/12", text: "text-[var(--color-primitive)]/60", ring: "ring-[var(--color-primitive)]/50" },
  L3: { bg: "bg-[var(--color-primitive)]/18", text: "text-[var(--color-primitive)]/80", ring: "ring-[var(--color-primitive)]/60" },
  L4: { bg: "bg-[var(--color-primitive)]/22", text: "text-[var(--color-primitive-bright)]/90", ring: "ring-[var(--color-primitive)]/70" },
  L5: { bg: "bg-[var(--color-primitive)]/28", text: "text-[var(--color-primitive-bright)]", ring: "ring-[var(--color-primitive)]/80" },
};

interface AbstractionLadderProps {
  currentLevel: PrimitiveLevel | null;
  perLevel: Record<PrimitiveLevel, number>;
  /** Levels that this module depends on (downstream arrows) */
  dependencyLevels: Set<PrimitiveLevel>;
  /** Levels that depend on this module (upstream arrows) */
  dependentLevels: Set<PrimitiveLevel>;
}

export function AbstractionLadder({
  currentLevel,
  perLevel,
  dependencyLevels,
  dependentLevels,
}: AbstractionLadderProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex items-center gap-0">
        {PRIMITIVE_LEVELS.map((level, i) => {
          const isCurrent = level === currentLevel;
          const styles = NODE_STYLES[level];
          const hasDep = dependencyLevels.has(level);
          const hasDependent = dependentLevels.has(level);

          return (
            <div key={level} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.3,
                  ease: EASE_PHI,
                }}
                className="relative flex flex-col items-center"
              >
                {/* Dependency tick mark (above) */}
                {hasDependent && !isCurrent && (
                  <div className="mb-1 h-2 w-[1px] bg-[var(--color-primitive)]/30" />
                )}
                {!hasDependent && !isCurrent && <div className="mb-1 h-2" />}

                {/* Uncategorized: "?" floating above when no current level */}
                {currentLevel === null && (
                  <div className="absolute -top-5 text-[10px] text-muted-foreground/30">
                    ?
                  </div>
                )}

                {/* Node */}
                {isCurrent ? (
                  <div
                    className={cn(
                      "flex h-9 w-14 flex-col items-center justify-center rounded-md ring-2",
                      styles.bg,
                      styles.ring,
                      "shadow-sm shadow-[var(--color-primitive)]/10",
                    )}
                  >
                    <span className={cn("font-mono text-xs font-bold", styles.text)}>
                      {level}
                    </span>
                    <span className={cn("text-[8px] leading-none", styles.text, "opacity-70")}>
                      {perLevel[level]}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={`/primitives?level=${level}`}
                    className={cn(
                      "flex h-9 w-14 flex-col items-center justify-center rounded-md border border-[var(--color-primitive)]/10 transition-colors hover:border-[var(--color-primitive)]/25",
                      currentLevel === null ? styles.bg : "bg-muted/30",
                    )}
                  >
                    <span className={cn(
                      "font-mono text-xs",
                      currentLevel === null ? styles.text : "text-muted-foreground/40",
                    )}>
                      {level}
                    </span>
                    <span className="text-[8px] leading-none text-muted-foreground/30">
                      {perLevel[level]}
                    </span>
                  </Link>
                )}

                {/* Dependent tick mark (below) */}
                {hasDep && !isCurrent && (
                  <div className="mt-1 h-2 w-[1px] bg-[var(--color-primitive)]/30" />
                )}
                {!hasDep && !isCurrent && <div className="mt-1 h-2" />}

                {/* Level name below */}
                <span className="mt-0.5 text-[8px] text-muted-foreground/30">
                  {LEVEL_NAMES[level]}
                </span>
              </motion.div>

              {/* Connector */}
              {i < PRIMITIVE_LEVELS.length - 1 && (
                <div className="mx-0.5 h-[1px] w-4 bg-[var(--color-primitive)]/15 sm:w-6" />
              )}
            </div>
          );
        })}
      </div>
    </MotionConfig>
  );
}
