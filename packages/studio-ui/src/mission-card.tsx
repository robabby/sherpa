"use client";

import type { TaskBoardEntry } from "@/lib/studio/tasks";
import { cn } from "./lib/utils";
import {
  formatDuration,
  formatTokens,
  formatCost,
  getBackendMeta,
  STATUS_DOT,
  VERDICT_STYLES,
} from "./lib/task-styles";

interface MissionCardProps {
  task: TaskBoardEntry;
  selected: boolean;
  focused: boolean;
  onClick: () => void;
}

export function MissionCard({ task, selected, focused, onClick }: MissionCardProps) {
  const backendMeta = getBackendMeta(task.backend);
  const isApi = backendMeta?.type === "api";
  const dotColor = STATUS_DOT[task.status] ?? STATUS_DOT.pending;
  const showVerdict = task.judgeVerdict && task.judgeVerdict !== "pending";
  const verdictStyle = showVerdict ? VERDICT_STYLES[task.judgeVerdict] : null;
  const hasMetrics = task.tokensInput != null || task.tokensOutput != null || task.costUsd != null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer border-b border-[var(--color-dark-bronze)]/30 px-3 py-3 transition-all duration-150",
        selected
          ? "border-l-2 border-l-[var(--color-copper)] bg-[var(--color-copper)]/5"
          : "hover:bg-[var(--color-copper)]/3",
        focused && !selected && "ring-1 ring-inset ring-[var(--color-copper)]/20",
      )}
    >
      {/* Row 1: status dot + title + duration */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-block h-2 w-2 shrink-0 rounded-full",
            dotColor,
            task.status === "dispatched" && "animate-[pulse_2s_ease-in-out_infinite]",
          )}
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13px] font-medium",
            selected ? "text-[var(--color-gold-bright)]" : "text-foreground/90",
          )}
        >
          {task.title}
        </span>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/40">
          {formatDuration(task.durationSeconds)}
        </span>
      </div>

      {/* Row 2: initiative slug */}
      {task.initiative && (
        <div className="pl-4 pt-0.5">
          <span className="text-[11px] text-muted-foreground/50">{task.initiative}</span>
        </div>
      )}

      {/* Row 3: badges */}
      <div className="flex items-center gap-1 pl-4 pt-1">
        {/* CLI / API badge */}
        {isApi ? (
          <span className="rounded border border-[var(--color-session)]/25 bg-[var(--color-session)]/10 px-1 py-px font-mono text-[7px] font-semibold uppercase tracking-widest text-[var(--color-session)]">
            API
          </span>
        ) : (
          <span className="rounded border border-muted-foreground/20 bg-muted-foreground/8 px-1 py-px font-mono text-[7px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            CLI
          </span>
        )}

        {/* Backend badge */}
        <span className="rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60">
          {backendMeta?.displayName ?? task.backend}
        </span>

        {/* Model badge */}
        {task.model && task.model !== "unknown" && (
          <span className="rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60">
            {task.model}
          </span>
        )}

        {/* Verdict badge */}
        {showVerdict && verdictStyle && (
          <span
            className={cn(
              "ml-auto rounded border px-1.5 py-0.5 font-mono text-[10px]",
              verdictStyle.className,
            )}
          >
            {verdictStyle.label}
          </span>
        )}
      </div>

      {/* Row 4: tokens + cost (only if data exists) */}
      {hasMetrics && (
        <div className="flex items-center gap-2 pl-4 pt-1 font-mono text-[10px] text-muted-foreground/40">
          {(task.tokensInput != null || task.tokensOutput != null) && (
            <span>
              {formatTokens(task.tokensInput)} in / {formatTokens(task.tokensOutput)} out
            </span>
          )}
          {task.costUsd != null && (
            <span className="text-[var(--color-tarnished)]">{formatCost(task.costUsd)}</span>
          )}
        </div>
      )}
    </div>
  );
}
