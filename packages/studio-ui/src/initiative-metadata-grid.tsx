"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BookOpen,
  FlaskConical,
  GitBranch,
  Map,
  Settings,
  Sparkles,
  Terminal,
  Layers,
  Clock,
  Zap,
} from "lucide-react";
import type { ProcessNode } from "@/lib/studio/process-nodes-shared";
import type { InitiativeVelocity } from "@/lib/studio/velocity";
import { cn } from "./lib/utils";
import { EASE_EMERGENCE } from "./lib/animation-constants";
import type { ResearchData } from "./lib/process-detail-helpers";
import { formatTokens } from "./initiative-sessions-section";

// ---------------------------------------------------------------------------
// Type pill config
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<string, { icon: typeof Sparkles; color: string; bg: string }> = {
  "new-plan": { icon: Sparkles, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  "research-synthesis": { icon: FlaskConical, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/30" },
  "process-change": { icon: Settings, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
  "roadmap-update": { icon: Map, color: "text-[var(--color-copper)]", bg: "bg-[var(--color-copper)]/10 border-[var(--color-copper)]/30" },
  "guideline-evolution": { icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  "new-skill": { icon: Terminal, color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/30" },
};

// ---------------------------------------------------------------------------
// Risk indicator config
// ---------------------------------------------------------------------------

const RISK_CONFIG: Record<string, { color: string; glow: string; label: string }> = {
  additive: { color: "bg-emerald-400", glow: "shadow-[0_0_6px_rgba(52,211,153,0.4)]", label: "Additive" },
  evolutionary: { color: "bg-amber-400", glow: "shadow-[0_0_6px_rgba(251,191,36,0.4)]", label: "Evolutionary" },
  structural: { color: "bg-rose-400", glow: "shadow-[0_0_6px_rgba(248,113,113,0.4)]", label: "Structural" },
};

const RISK_ORDER = ["additive", "evolutionary", "structural"];

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------

function AnimatedStat({ value, label, icon: Icon }: { value: number | string; label: string; icon: typeof Layers }) {
  const numericValue = typeof value === "number" ? value : 0;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (typeof value !== "number" || value === 0) {
      setDisplayed(0);
      return;
    }
    const duration = 600;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * numericValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numericValue, value]);

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/30" />
      <div>
        <span className="font-mono text-sm text-foreground/80">
          {typeof value === "string" ? value : displayed}
        </span>
        <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/40">
          {label}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Momentum badge
// ---------------------------------------------------------------------------

const MOMENTUM_STYLES: Record<string, string> = {
  active: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
  cooling: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  stale: "bg-zinc-400/10 text-zinc-500 border-zinc-400/30",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface InitiativeMetadataGridProps {
  node: ProcessNode;
}

export function InitiativeMetadataGrid({ node }: InitiativeMetadataGridProps) {
  const meta = node.metadata;
  const initType = meta.type as string | undefined;
  const risk = meta.risk as string | undefined;
  const targets = (meta.targets ?? []) as string[];
  const dependencies = (meta.dependencies ?? []) as string[];
  const research = meta.research as ResearchData | null;
  const velocity = meta.velocity as InitiativeVelocity | undefined;
  const sessionCount = (meta.sessionCount as number) ?? 0;
  const sessionTokens = (meta.sessionTokens as number) ?? 0;

  const iterationCount = research?.iterations?.length ?? 0;
  const vectorCount = research?.iterations?.reduce((sum, it) => sum + it.vectors.length, 0) ?? 0;

  const typeConfig = initType ? TYPE_CONFIG[initType] : null;
  const TypeIcon = typeConfig?.icon;

  const momentum = velocity?.momentum;

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-[1fr_auto]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: EASE_EMERGENCE }}
    >
      {/* Left column — indicators */}
      <div className="space-y-3">
        {/* Type pill */}
        {initType && typeConfig && TypeIcon && (
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs", typeConfig.bg)}>
              <TypeIcon className={cn("h-3.5 w-3.5", typeConfig.color)} />
              <span className={typeConfig.color}>{initType.replace(/-/g, " ")}</span>
            </span>
            {momentum && MOMENTUM_STYLES[momentum] && (
              <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px]", MOMENTUM_STYLES[momentum])}>
                {momentum}
              </span>
            )}
          </div>
        )}

        {/* Risk indicator */}
        {risk && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40">Risk</span>
            <div className="flex items-center gap-1.5">
              {RISK_ORDER.map((level) => {
                const cfg = RISK_CONFIG[level];
                if (!cfg) return null;
                const isActive = level === risk;
                return (
                  <span
                    key={level}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-all",
                      isActive ? cn(cfg.color, cfg.glow) : "bg-muted-foreground/15",
                    )}
                    title={cfg.label}
                  />
                );
              })}
              <span className="ml-1 text-xs text-muted-foreground/50">
                {RISK_CONFIG[risk]?.label ?? risk}
              </span>
            </div>
          </div>
        )}

        {/* Targets */}
        {targets.length > 0 && (
          <div className="flex flex-wrap items-start gap-1.5">
            <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/40">Targets</span>
            {targets.slice(0, 5).map((target, i) => (
              <span
                key={i}
                className="rounded border border-[var(--glass-border)] bg-[var(--glass-bg)] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground/60"
              >
                {target}
              </span>
            ))}
            {targets.length > 5 && (
              <span className="text-[10px] text-muted-foreground/40">
                +{targets.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Dependencies */}
        {dependencies.length > 0 && (
          <div className="flex flex-wrap items-start gap-1.5">
            <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/40">Deps</span>
            {dependencies.map((dep, i) => (
              <Link
                key={i}
                href={`/process/${dep}`}
                className="rounded border border-[var(--glass-border)] bg-[var(--glass-bg)] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground/60 transition-colors hover:text-[var(--color-gold)]"
              >
                {dep}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right column — quick stats */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 self-start">
        <AnimatedStat value={iterationCount} label="iterations" icon={Layers} />
        <AnimatedStat value={vectorCount} label="vectors" icon={GitBranch} />
        <AnimatedStat value={sessionCount} label="sessions" icon={Clock} />
        <AnimatedStat
          value={sessionTokens > 0 ? formatTokens(sessionTokens) : "—"}
          label="tokens"
          icon={Zap}
        />
      </div>
    </motion.div>
  );
}
