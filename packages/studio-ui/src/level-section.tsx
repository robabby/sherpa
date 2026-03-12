import type { ReactNode } from "react";

import { cn } from "./lib/utils";
import type { PrimitiveLevel } from "@/lib/studio";
import { LEVEL_DESCRIPTIONS, LEVEL_NAMES, LEVEL_VERBS } from "@/lib/studio";

/** Per-level visual personality — intensity increases L1→L5 */
const LEVEL_THEME: Record<
  PrimitiveLevel,
  {
    border: string;
    bg: string;
    accent: string;
    heading: string;
    monoLabel: string;
    glow: boolean;
    glowSize: string;
    moatLabel: boolean;
  }
> = {
  L1: {
    border: "border-[var(--color-primitive)]/10",
    bg: "bg-[var(--color-primitive)]/[0.01]",
    accent: "from-[var(--color-primitive)]/15 to-transparent",
    heading: "text-[var(--color-primitive)]/60",
    monoLabel: "text-[var(--color-primitive)]/40",
    glow: false,
    glowSize: "",
    moatLabel: false,
  },
  L2: {
    border: "border-[var(--color-primitive)]/14",
    bg: "bg-[var(--color-primitive)]/[0.015]",
    accent: "from-[var(--color-primitive)]/25 to-transparent",
    heading: "text-[var(--color-primitive)]/70",
    monoLabel: "text-[var(--color-primitive)]/50",
    glow: false,
    glowSize: "",
    moatLabel: false,
  },
  L3: {
    border: "border-[var(--color-primitive)]/20",
    bg: "bg-[var(--color-primitive)]/[0.02]",
    accent: "from-[var(--color-primitive)]/40 to-[var(--color-primitive)]/5",
    heading: "text-[var(--color-primitive)]/85",
    monoLabel: "text-[var(--color-primitive)]/60",
    glow: true,
    glowSize: "h-24 w-24 opacity-[0.04]",
    moatLabel: true,
  },
  L4: {
    border: "border-[var(--color-primitive)]/25",
    bg: "bg-[var(--color-primitive)]/[0.025]",
    accent: "from-[var(--color-primitive-bright)]/45 to-[var(--color-primitive)]/10",
    heading: "text-[var(--color-primitive-bright)]/90",
    monoLabel: "text-[var(--color-primitive-bright)]/60",
    glow: true,
    glowSize: "h-32 w-32 opacity-[0.05]",
    moatLabel: true,
  },
  L5: {
    border: "border-[var(--color-primitive)]/30",
    bg: "bg-[var(--color-primitive)]/[0.03]",
    accent: "from-[var(--color-primitive-bright)]/55 to-[var(--color-primitive)]/15",
    heading: "text-[var(--color-primitive-bright)]",
    monoLabel: "text-[var(--color-primitive-bright)]/70",
    glow: true,
    glowSize: "h-40 w-40 opacity-[0.06]",
    moatLabel: true,
  },
};

/** Grid sizing: L3 gets 2-col for bigger cards, L4/L5 single column */
const GRID_CLASSES: Record<PrimitiveLevel, string> = {
  L1: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  L2: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  L3: "grid gap-4 sm:grid-cols-2",
  L4: "grid gap-4",
  L5: "grid gap-4",
};

interface LevelSectionProps {
  level: PrimitiveLevel;
  count: number;
  children: ReactNode;
}

export function LevelSection({ level, count, children }: LevelSectionProps) {
  const theme = LEVEL_THEME[level];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border p-6",
        theme.border,
        theme.bg,
      )}
    >
      {/* Left accent bar */}
      <div
        className={cn(
          "absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b",
          theme.accent,
        )}
      />

      {/* Atmospheric glow orb (L3-L5 only) */}
      {theme.glow && (
        <div
          className={cn(
            "pointer-events-none absolute -right-6 -top-6 rounded-full bg-[var(--color-primitive)] blur-[40px]",
            theme.glowSize,
          )}
        />
      )}

      {/* Section heading */}
      <div className="relative mb-5">
        <div className="flex items-baseline gap-3">
          <span className={cn("font-mono text-xs", theme.monoLabel)}>
            {level}
          </span>
          <span className={cn("text-[10px]", theme.monoLabel, "opacity-70")}>
            {LEVEL_VERBS[level]}
          </span>
          {theme.moatLabel && (
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-primitive-bright)]/40">
              Platform Moat
            </span>
          )}
        </div>
        <h3 className={cn("font-heading text-lg", theme.heading)}>
          {LEVEL_NAMES[level]} Primitives
          <span className="ml-2 font-mono text-sm font-normal opacity-50">
            {count}
          </span>
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground/50">
          {LEVEL_DESCRIPTIONS[level]}
        </p>
      </div>

      {/* Card grid with per-level sizing */}
      <div className={cn("relative", GRID_CLASSES[level])}>
        {children}
      </div>
    </section>
  );
}

/** Muted section for uncategorized modules */
export function UncategorizedSection({ count, children }: { count: number; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-muted-foreground/8 bg-background p-6">
      <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-muted-foreground/10 to-transparent" />
      <div className="relative mb-5">
        <span className="font-mono text-xs text-muted-foreground/30">—</span>
        <h3 className="font-heading text-lg text-muted-foreground/60">
          Uncategorized ({count})
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground/35">
          Modules with barrel exports that haven&apos;t been annotated yet
        </p>
      </div>
      <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
