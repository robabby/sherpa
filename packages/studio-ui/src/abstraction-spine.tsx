import Link from "next/link";

import { cn } from "./lib/utils";
import type { PrimitiveLevel } from "@/lib/studio";
import { LEVEL_NAMES, LEVEL_VERBS, PRIMITIVE_LEVELS } from "@/lib/studio";

/**
 * Opacity ramp: L1 lowest → L5 highest intensity.
 * Communicates "the moat is at L3-L5."
 */
const LEVEL_OPACITY: Record<PrimitiveLevel, { bg: string; text: string; border: string }> = {
  L1: { bg: "bg-[var(--color-primitive)]/8", text: "text-[var(--color-primitive)]/50", border: "border-[var(--color-primitive)]/20" },
  L2: { bg: "bg-[var(--color-primitive)]/12", text: "text-[var(--color-primitive)]/60", border: "border-[var(--color-primitive)]/25" },
  L3: { bg: "bg-[var(--color-primitive)]/18", text: "text-[var(--color-primitive)]/80", border: "border-[var(--color-primitive)]/35" },
  L4: { bg: "bg-[var(--color-primitive)]/22", text: "text-[var(--color-primitive-bright)]/90", border: "border-[var(--color-primitive)]/45" },
  L5: { bg: "bg-[var(--color-primitive)]/28", text: "text-[var(--color-primitive-bright)]", border: "border-[var(--color-primitive)]/55" },
};

const ACTIVE_RING: Record<PrimitiveLevel, string> = {
  L1: "ring-[var(--color-primitive)]/30",
  L2: "ring-[var(--color-primitive)]/35",
  L3: "ring-[var(--color-primitive)]/45",
  L4: "ring-[var(--color-primitive)]/55",
  L5: "ring-[var(--color-primitive)]/65",
};

interface AbstractionSpineProps {
  perLevel: Record<PrimitiveLevel, number>;
  uncategorized: number;
  activeFilter: PrimitiveLevel | "uncategorized" | null;
}

export function AbstractionSpine({
  perLevel,
  uncategorized,
  activeFilter,
}: AbstractionSpineProps) {
  return (
    <div className="space-y-3">
      {/* Spine label — explains what the visualization shows */}
      <div className="flex items-center gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
          Abstraction Ladder
        </p>
        <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground/30 sm:flex">
          <span>Raw data</span>
          <span>&rarr;</span>
          <span>Processed output</span>
        </div>
      </div>

      {/* Desktop: horizontal spine */}
      <div className="hidden items-stretch gap-0 sm:flex">
        {PRIMITIVE_LEVELS.map((level, i) => {
          const count = perLevel[level];
          const isActive = activeFilter === level;
          const opacity = LEVEL_OPACITY[level];

          return (
            <div key={level} className="flex flex-1 items-center">
              <SpineNode
                href={isActive ? "/app/studio/primitives" : `/app/studio/primitives?level=${level}`}
                level={level}
                name={LEVEL_NAMES[level]}
                verb={LEVEL_VERBS[level]}
                count={count}
                isActive={isActive}
                bgClass={opacity.bg}
                textClass={opacity.text}
                borderClass={opacity.border}
                ringClass={ACTIVE_RING[level]}
              />
              {i < PRIMITIVE_LEVELS.length - 1 && (
                <div className="relative mx-1 h-[2px] w-6 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primitive)]/20 to-[var(--color-primitive)]/30" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-[3px] border-l-[5px] border-y-transparent border-l-[var(--color-primitive)]/25" />
                </div>
              )}
            </div>
          );
        })}

        {/* Uncategorized: disconnected muted segment */}
        {uncategorized > 0 && (
          <div className="ml-3 flex items-center border-l border-dashed border-muted-foreground/15 pl-3">
            <Link
              href={activeFilter === "uncategorized" ? "/app/studio/primitives" : "/app/studio/primitives?level=uncategorized"}
              className={cn(
                "flex flex-col items-center rounded-lg border px-3 py-2 transition-all",
                "bg-muted-foreground/5 border-muted-foreground/15",
                activeFilter === "uncategorized" && "ring-2 ring-muted-foreground/25 shadow-sm",
                activeFilter !== "uncategorized" && "hover:scale-[1.02] hover:brightness-110",
              )}
            >
              <span className="font-mono text-sm font-semibold text-muted-foreground/50">?</span>
              <span className="text-[10px] text-muted-foreground/40">{uncategorized} untagged</span>
            </Link>
          </div>
        )}

        {/* Show All button when filtered */}
        {activeFilter !== null && (
          <div className="ml-3 flex items-center">
            <Link
              href="/app/studio/primitives"
              className="inline-flex items-center rounded-full border border-muted-foreground/20 px-3 py-1.5 text-xs text-muted-foreground/60 transition-colors hover:border-muted-foreground/30 hover:text-muted-foreground/80"
            >
              Show all
            </Link>
          </div>
        )}
      </div>

      {/* Mobile: pill strip */}
      <div className="flex flex-wrap gap-2 sm:hidden">
        <MobilePill
          href="/app/studio/primitives"
          label="All"
          isActive={activeFilter === null}
        />
        {PRIMITIVE_LEVELS.map((level) => {
          const isActive = activeFilter === level;
          const opacity = LEVEL_OPACITY[level];
          return (
            <MobilePill
              key={level}
              href={isActive ? "/app/studio/primitives" : `/app/studio/primitives?level=${level}`}
              label={`${level} ${LEVEL_NAMES[level]} (${perLevel[level]})`}
              isActive={isActive}
              bgClass={opacity.bg}
              textClass={opacity.text}
              borderClass={opacity.border}
            />
          );
        })}
        {uncategorized > 0 && (
          <MobilePill
            href={activeFilter === "uncategorized" ? "/app/studio/primitives" : "/app/studio/primitives?level=uncategorized"}
            label={`Uncategorized (${uncategorized})`}
            isActive={activeFilter === "uncategorized"}
          />
        )}
      </div>
    </div>
  );
}

function SpineNode({
  href,
  level,
  name,
  verb,
  count,
  isActive,
  bgClass,
  textClass,
  borderClass,
  ringClass,
}: {
  href: string;
  level: string;
  name: string;
  verb: string;
  count: number;
  isActive: boolean;
  bgClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full flex-col rounded-lg border px-3 py-2.5 transition-all",
        bgClass,
        borderClass,
        isActive && cn("ring-2", ringClass, "shadow-sm"),
        !isActive && "hover:scale-[1.01] hover:brightness-110",
      )}
    >
      {/* Level code + name */}
      <div className="flex items-baseline gap-1.5">
        <span className={cn("font-mono text-sm font-semibold", textClass)}>
          {level}
        </span>
        <span className={cn("text-xs font-medium", textClass, "opacity-80")}>
          {name}
        </span>
      </div>
      {/* Verb — explains what this level does */}
      <span className={cn("mt-0.5 text-[10px] leading-tight", textClass, "opacity-50")}>
        {verb}
      </span>
      {/* Module count */}
      <span className="mt-1 font-mono text-[10px] text-muted-foreground/35">
        {count} {count === 1 ? "module" : "modules"}
      </span>
    </Link>
  );
}

function MobilePill({
  href,
  label,
  isActive,
  bgClass,
  textClass,
  borderClass,
}: {
  href: string;
  label: string;
  isActive: boolean;
  bgClass?: string;
  textClass?: string;
  borderClass?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors",
        isActive && bgClass && borderClass && textClass
          ? cn(bgClass, borderClass, textClass, "ring-1 ring-current/30")
          : "border-muted-foreground/15 text-muted-foreground/60 hover:border-muted-foreground/25",
      )}
    >
      {label}
    </Link>
  );
}
