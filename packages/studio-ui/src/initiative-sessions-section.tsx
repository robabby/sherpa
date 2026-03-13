"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Session } from "@/lib/studio/types";
import { cn } from "./lib/utils";
import { EASE_EMERGENCE } from "./lib/animation-constants";

// ---------------------------------------------------------------------------
// Model badge mapping
// ---------------------------------------------------------------------------

export const MODEL_BADGE: Record<string, { label: string; className: string; barColor: string }> = {
  "claude-opus-4-6": {
    label: "Opus",
    className: "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
    barColor: "bg-[var(--color-gold)]",
  },
  "claude-sonnet-4-6": {
    label: "Sonnet",
    className: "border-[var(--color-copper)]/40 bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
    barColor: "bg-[var(--color-copper)]",
  },
  "claude-haiku-4-5-20251001": {
    label: "Haiku",
    className: "border-[var(--color-bronze)]/40 bg-[var(--color-bronze)]/10 text-[var(--color-bronze)]",
    barColor: "bg-[var(--color-bronze)]",
  },
};

export function getModelBadge(model: string): { label: string; className: string; barColor: string } {
  const direct = MODEL_BADGE[model];
  if (direct) return direct;
  if (model.includes("opus")) return MODEL_BADGE["claude-opus-4-6"]!;
  if (model.includes("sonnet")) return MODEL_BADGE["claude-sonnet-4-6"]!;
  if (model.includes("haiku")) return MODEL_BADGE["claude-haiku-4-5-20251001"]!;
  return { label: model.split("-").pop() ?? model, className: "border-muted-foreground/30 bg-muted/10 text-muted-foreground", barColor: "bg-muted-foreground/30" };
}

export function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

export function formatDuration(minutes: number | null): string {
  if (minutes == null) return "--";
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export const OUTCOME_STYLES: Record<string, string> = {
  completed: "text-emerald-500",
  interrupted: "text-rose-400",
  "in-progress": "text-[var(--color-session)]",
};

// ---------------------------------------------------------------------------
// Stagger animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_EMERGENCE },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InitiativeSessionsSection({ slug }: { slug: string }) {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/studio/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const all = (data.sessions ?? []) as Session[];
        setSessions(all.filter((s) => s.initiative === slug));
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });
    return () => { cancelled = true; };
  }, [slug]);

  const loading = sessions === null;

  if (loading) {
    return (
      <div className="mt-5">
        <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
          Sessions
        </span>
        <p className="mt-2 text-xs text-muted-foreground/30">Loading...</p>
      </div>
    );
  }

  const totalTokens = sessions.reduce(
    (sum, s) => sum + s.tokens.input + s.tokens.output,
    0,
  );
  const totalMinutes = sessions.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0,
  );
  const maxTokens = Math.max(...sessions.map((s) => s.tokens.input + s.tokens.output), 1);

  return (
    <div className="mt-5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
        Sessions
      </span>
      {sessions.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground/30">
          No sessions recorded for this initiative.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {/* Summary line */}
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground/60">
            <span>{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
            {totalTokens > 0 && (
              <>
                <span className="text-muted-foreground/20">·</span>
                <span>{formatTokens(totalTokens)} tokens</span>
              </>
            )}
            {totalMinutes > 0 && (
              <>
                <span className="text-muted-foreground/20">·</span>
                <span>{formatDuration(totalMinutes)} total</span>
              </>
            )}
          </div>

          {/* Session rows */}
          <motion.div
            className="space-y-1.5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sessions.map((s) => {
              const badge = getModelBadge(s.model);
              const d = new Date(s.startedAt);
              const dateStr = d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const sessionTokens = s.tokens.input + s.tokens.output;
              const barWidth = maxTokens > 0 ? (sessionTokens / maxTokens) * 100 : 0;
              const isInProgress = s.outcome === "in-progress";

              return (
                <motion.div
                  key={s.sessionId}
                  variants={itemVariants}
                  className={cn(
                    "overflow-hidden rounded-lg border bg-card/30",
                    isInProgress
                      ? "border-l-2 border-l-[var(--color-session)] border-t-border/15 border-r-border/15 border-b-border/15"
                      : "border-border/15",
                  )}
                >
                  <div className="flex items-center gap-2 px-2.5 py-1.5">
                    <span className="font-mono text-[11px] text-muted-foreground/50">
                      {dateStr}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] leading-none",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground/40">
                      {formatDuration(s.durationMinutes)}
                    </span>
                    <span
                      className={cn(
                        "text-[11px]",
                        OUTCOME_STYLES[s.outcome] ?? "text-muted-foreground/40",
                      )}
                    >
                      {s.outcome}
                    </span>
                    {sessionTokens > 0 && (
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground/30">
                        {formatTokens(sessionTokens)}
                      </span>
                    )}
                  </div>
                  {/* Token bar */}
                  {sessionTokens > 0 && (
                    <div className="h-1 w-full bg-muted/20">
                      <motion.div
                        className={cn(
                          "h-full rounded-r-full",
                          badge.barColor,
                          isInProgress && "led-active",
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.6, ease: EASE_EMERGENCE, delay: 0.2 }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
