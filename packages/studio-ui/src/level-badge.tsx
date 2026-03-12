import { cn } from "./lib/utils";
import type { PrimitiveLevel } from "@/lib/studio";
import { LEVEL_NAMES } from "@/lib/studio";

/**
 * Progressive intensity: higher levels are more visually prominent,
 * communicating "the moat is at L3-L5."
 */
const LEVEL_STYLES: Record<PrimitiveLevel, string> = {
  L1: "border-[var(--color-primitive)]/25 text-[var(--color-primitive)]/60 bg-[var(--color-primitive)]/5",
  L2: "border-[var(--color-primitive)]/30 text-[var(--color-primitive)]/70 bg-[var(--color-primitive)]/7",
  L3: "border-[var(--color-primitive)]/40 text-[var(--color-primitive)]/85 bg-[var(--color-primitive)]/10",
  L4: "border-[var(--color-primitive)]/50 text-[var(--color-primitive-bright)]/90 bg-[var(--color-primitive)]/12",
  L5: "border-[var(--color-primitive)]/60 text-[var(--color-primitive-bright)] bg-[var(--color-primitive)]/15",
};

const GOLD_STYLES: Record<PrimitiveLevel, string> = {
  L1: "border-[var(--color-gold)]/25 text-[var(--color-gold)]/60 bg-[var(--color-gold)]/5",
  L2: "border-[var(--color-gold)]/30 text-[var(--color-gold)]/70 bg-[var(--color-gold)]/7",
  L3: "border-[var(--color-gold)]/40 text-[var(--color-gold)]/85 bg-[var(--color-gold)]/10",
  L4: "border-[var(--color-gold)]/50 text-[var(--color-gold-bright)]/90 bg-[var(--color-gold)]/12",
  L5: "border-[var(--color-gold)]/60 text-[var(--color-gold-bright)] bg-[var(--color-gold)]/15",
};

const SIZE_CLASSES = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "gap-1 px-2 py-0.5 text-xs",
  lg: "gap-1.5 px-3 py-1 text-sm",
} as const;

interface LevelBadgeProps {
  level: PrimitiveLevel;
  size?: "sm" | "md" | "lg";
  variant?: "primitive" | "gold";
  className?: string;
}

export function LevelBadge({
  level,
  size = "md",
  variant = "primitive",
  className,
}: LevelBadgeProps) {
  const styles = variant === "gold" ? GOLD_STYLES : LEVEL_STYLES;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-mono",
        SIZE_CLASSES[size],
        styles[level],
        className,
      )}
    >
      {level}
      {size !== "sm" && (
        <span className="font-sans text-[11px] opacity-80">
          {LEVEL_NAMES[level]}
        </span>
      )}
    </span>
  );
}
