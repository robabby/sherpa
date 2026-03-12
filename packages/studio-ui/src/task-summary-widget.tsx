"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { SectionHeader } from "./section-header";
import { EASE_STANDARD } from "./lib/animation-constants";
import { cn } from "./lib/utils";
import type { TaskBoardEntry } from "@/lib/studio/tasks";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "pending",
    className: "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground",
  },
  dispatched: {
    label: "dispatched",
    className:
      "border-[var(--color-copper)]/40 bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
  },
  completed: {
    label: "completed",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  },
  failed: {
    label: "failed",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  },
  reviewed: {
    label: "reviewed",
    className:
      "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  },
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-muted-foreground",
  dispatched: "bg-[var(--color-copper)]",
  completed: "bg-emerald-500",
  reviewed: "bg-[var(--color-gold)]",
  failed: "bg-rose-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-[var(--color-gold)]",
  medium: "bg-[var(--color-copper)]",
  low: "bg-[var(--color-bronze)]",
};

const fadeVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: EASE_STANDARD },
  },
};

interface TaskSummaryWidgetProps {
  tasks: TaskBoardEntry[];
}

export function TaskSummaryWidget({ tasks }: TaskSummaryWidgetProps) {
  if (tasks.length === 0) return null;

  // Count by status
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
  }

  // Most recent/active tasks
  const active = tasks
    .filter((t) => t.status === "pending" || t.status === "dispatched" || t.status === "completed")
    .slice(0, 3);

  return (
    <motion.div variants={fadeVariant}>
      <SectionHeader label="pipeline" title="Task Pipeline" />

      {/* Status count pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {Object.entries(counts).map(([status, count]) => {
          const badge = STATUS_STYLES[status];
          if (!badge) return null;
          return (
            <span
              key={status}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                badge.className
              )}
            >
              {count} {badge.label}
            </span>
          );
        })}
      </div>

      {/* Compact task list */}
      {active.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {active.map((task) => (
            <div key={task.id} className="flex items-center gap-2.5 text-sm">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  PRIORITY_COLORS[task.priority] ?? "bg-muted-foreground"
                )}
              />
              <span className="min-w-0 flex-1 truncate text-foreground/80">
                {task.title}
              </span>
              <span className="shrink-0 rounded border border-muted-foreground/15 px-1 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                {task.backend}
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  STATUS_DOT[task.status] ?? "bg-muted-foreground"
                )}
              />
            </div>
          ))}
        </div>
      )}

      {/* Link to full board */}
      <Link
        href="/app/studio/tasks"
        className="text-sm text-[var(--color-copper)]/70 transition-colors hover:text-[var(--color-copper)]"
      >
        View all tasks →
      </Link>
    </motion.div>
  );
}
