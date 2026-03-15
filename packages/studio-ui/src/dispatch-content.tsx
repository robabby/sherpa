"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, MotionConfig } from "motion/react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  AlertTriangle,
  ChevronRight,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";

import { EASE_STANDARD } from "./lib/animation-constants";
import { cn } from "./lib/utils";
import type { TaskBoardEntry } from "@/lib/studio/tasks";
import type { AgentRole } from "@/lib/studio";
import type { BackendHealth, BackendType } from "@sherpa/studio-core";
import { BACKEND_META } from "@sherpa/studio-core";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type DispatchMode = "interactive" | "supervised" | "overnight";

const OVERNIGHT_BLOCKED: string[] = ["code-implementation", "architect"];

const TASK_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  "code-review": {
    label: "code-review",
    className:
      "border-[var(--color-primitive)]/20 bg-[var(--color-primitive)]/12 text-[var(--color-primitive)]",
  },
  research: {
    label: "research",
    className:
      "border-[var(--color-eclipse)]/20 bg-[var(--color-eclipse)]/12 text-[var(--color-eclipse)]",
  },
  audit: {
    label: "audit",
    className:
      "border-[var(--color-gold)]/20 bg-[var(--color-gold)]/12 text-[var(--color-gold)]",
  },
  "content-generation": {
    label: "content",
    className:
      "border-[var(--color-copper)]/20 bg-[var(--color-copper)]/12 text-[var(--color-copper)]",
  },
  "code-implementation": {
    label: "code-impl",
    className:
      "border-[var(--color-primitive)]/20 bg-[var(--color-primitive)]/12 text-[var(--color-primitive)]",
  },
  architect: {
    label: "architect",
    className:
      "border-[var(--color-gold)]/20 bg-[var(--color-gold)]/12 text-[var(--color-gold)]",
  },
  embeddings: {
    label: "embeddings",
    className:
      "border-[var(--color-session)]/20 bg-[var(--color-session)]/12 text-[var(--color-session)]",
  },
  general: {
    label: "general",
    className:
      "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground",
  },
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
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
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const fadeVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: EASE_STANDARD },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_STANDARD },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatElapsed(isoDate: string | null): string {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "";
    const str = formatDistanceToNowStrict(d, { addSuffix: false });
    return str
      .replace(/ seconds?/, "s")
      .replace(/ minutes?/, "m")
      .replace(/ hours?/, "h")
      .replace(/ days?/, "d")
      .replace(/ months?/, "mo")
      .replace(/ years?/, "y");
  } catch {
    return "";
  }
}

function isToday(isoDate: string | null): boolean {
  if (!isoDate) return false;
  try {
    const d = new Date(isoDate);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

function getTaskTypeStyle(taskType: string) {
  return TASK_TYPE_STYLES[taskType] ?? TASK_TYPE_STYLES.general!;
}

// ---------------------------------------------------------------------------
// Mode Selector
// ---------------------------------------------------------------------------

function ModeSelector({
  mode,
  onModeChange,
}: {
  mode: DispatchMode;
  onModeChange: (mode: DispatchMode) => void;
}) {
  const modes: { value: DispatchMode; label: string }[] = [
    { value: "interactive", label: "interactive" },
    { value: "supervised", label: "supervised" },
    { value: "overnight", label: "overnight" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg border border-muted-foreground/15 p-0.5">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          className={cn(
            "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] transition-all",
            mode === m.value
              ? "bg-[var(--color-copper)]/12 text-[var(--color-copper)]"
              : "text-muted-foreground/40 hover:text-muted-foreground/60"
          )}
        >
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              mode === m.value
                ? "bg-[var(--color-copper)]"
                : "border border-muted-foreground/30"
            )}
          />
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Guard Rail Banner
// ---------------------------------------------------------------------------

function GuardRailBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-[11px] text-rose-500/80"
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      Overnight mode: code-implementation and architect tasks are blocked
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Backlog Panel
// ---------------------------------------------------------------------------

interface TaskGroup {
  taskType: string;
  tasks: TaskBoardEntry[];
}

function BacklogPanel({
  groups,
  selectedIds,
  onToggle,
  blockedTypes,
}: {
  groups: TaskGroup[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  blockedTypes: string[];
}) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (taskType: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(taskType)) next.delete(taskType);
      else next.add(taskType);
      return next;
    });
  };

  const totalPending = groups.reduce((s, g) => s + g.tasks.length, 0);

  return (
    <div className="col-span-3 flex flex-col overflow-hidden border-r border-[var(--color-dark-bronze)]">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[var(--color-dark-bronze)] px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
          Backlog
        </span>
        <span className="text-[10px] text-[var(--color-copper)]">
          {totalPending} pending
        </span>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => {
          const collapsed = collapsedGroups.has(group.taskType);
          const isBlocked = blockedTypes.includes(group.taskType);
          const style = getTaskTypeStyle(group.taskType);

          return (
            <div key={group.taskType}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.taskType)}
                className="flex w-full items-center justify-between border-b border-[var(--color-copper)]/8 px-3 py-2 transition-colors hover:bg-[var(--color-copper)]/3"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    className={cn(
                      "h-2.5 w-2.5 text-muted-foreground/50 transition-transform",
                      !collapsed && "rotate-90"
                    )}
                  />
                  <span
                    className={cn(
                      "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium",
                      style.className
                    )}
                  >
                    {style.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground/50">
                  {group.tasks.length}
                </span>
              </button>

              {/* Task rows */}
              {!collapsed &&
                group.tasks.map((task) => {
                  const blocked = isBlocked;
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-2 border-b border-[var(--color-copper)]/6 px-3 py-2 transition-colors last:border-0 hover:bg-[var(--color-copper)]/4",
                        blocked && "opacity-20"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(task.id)}
                        disabled={blocked}
                        onChange={() => onToggle(task.id)}
                        className="h-3.5 w-3.5 shrink-0 accent-[var(--color-copper)]"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="block truncate text-xs text-foreground transition-colors hover:text-[var(--color-copper)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {task.title}
                        </Link>
                        <p className="text-[10px] text-muted-foreground/40">
                          {task.initiative ?? "general"} &middot; {task.priority}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}

        {groups.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground/40">
            No pending tasks
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assignments Panel
// ---------------------------------------------------------------------------

function AssignmentsPanel({
  active,
  failed,
  completedToday,
  onResetTask,
}: {
  active: TaskBoardEntry[];
  failed: TaskBoardEntry[];
  completedToday: TaskBoardEntry[];
  onResetTask: (taskId: string) => void;
}) {
  return (
    <div className="col-span-5 flex flex-col overflow-hidden border-r border-[var(--color-dark-bronze)]">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[var(--color-dark-bronze)] px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
          Assignments
        </span>
        <span className="text-[10px] text-[var(--color-copper)]">
          {active.length} active
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Active assignments */}
        {active.map((task) => {
          const statusBadge = STATUS_STYLES.dispatched!;
          const typeStyle = getTaskTypeStyle(task.taskType);

          return (
            <div
              key={task.id}
              className="rounded-lg border border-[var(--color-copper)]/12 bg-card/40 p-3"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <Link
                  href={`/tasks/${task.id}`}
                  className="text-xs font-medium text-foreground transition-colors hover:text-[var(--color-copper)]"
                >
                  {task.title}
                </Link>
                <span
                  className={cn(
                    "inline-flex animate-pulse items-center rounded-full border px-2 py-0.5 text-[10px]",
                    statusBadge.className
                  )}
                >
                  {statusBadge.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded border border-muted-foreground/12 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                  {task.backend}
                </span>
                {task.model && (
                  <span className="inline-flex items-center rounded border border-muted-foreground/12 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                    {task.model}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-medium",
                    typeStyle.className
                  )}
                >
                  {typeStyle.label}
                </span>
                <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/35">
                  {formatElapsed(task.dispatchedAt)}
                </span>
              </div>
            </div>
          );
        })}

        {active.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground/40">
            No active assignments
          </div>
        )}

        {/* Failed tasks */}
        {failed.length > 0 && (
          <>
            <div className="flex items-center gap-2 py-2">
              <div className="h-px flex-1 bg-rose-500/15" />
              <span className="text-[10px] uppercase tracking-[0.1em] text-rose-500/50">
                failed
              </span>
              <div className="h-px flex-1 bg-rose-500/15" />
            </div>

            {failed.map((task) => {
              const statusBadge = STATUS_STYLES.failed!;
              const typeStyle = getTaskTypeStyle(task.taskType);

              return (
                <div
                  key={task.id}
                  className="rounded-lg border border-rose-500/15 bg-card/40 p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-xs font-medium text-foreground transition-colors hover:text-rose-400"
                    >
                      {task.title}
                    </Link>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px]",
                        statusBadge.className
                      )}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded border border-muted-foreground/12 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                      {task.backend}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-medium",
                        typeStyle.className
                      )}
                    >
                      {typeStyle.label}
                    </span>
                    <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/35">
                      {formatElapsed(task.dispatchedAt)}
                    </span>
                    <button
                      onClick={() => onResetTask(task.id)}
                      className="flex items-center gap-1 rounded border border-rose-500/20 bg-rose-500/8 px-2 py-0.5 text-[10px] text-rose-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/15"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      Reset
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Completed today divider */}
        {completedToday.length > 0 && (
          <>
            <div className="flex items-center gap-2 py-2">
              <div className="h-px flex-1 bg-muted-foreground/10" />
              <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/30">
                completed today
              </span>
              <div className="h-px flex-1 bg-muted-foreground/10" />
            </div>

            {completedToday.map((task) => {
              const statusBadge = STATUS_STYLES[task.status] ?? STATUS_STYLES.completed!;
              const typeStyle = getTaskTypeStyle(task.taskType);

              return (
                <div
                  key={task.id}
                  className="rounded-lg border border-emerald-500/12 bg-card/40 p-3 opacity-60"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-xs text-muted-foreground transition-colors hover:text-[var(--color-copper)]"
                    >
                      {task.title}
                    </Link>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px]",
                        statusBadge.className
                      )}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded border border-muted-foreground/12 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                      {task.backend}
                    </span>
                    {task.model && (
                      <span className="inline-flex items-center rounded border border-muted-foreground/12 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                        {task.model}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-medium",
                        typeStyle.className
                      )}
                    >
                      {typeStyle.label}
                    </span>
                    <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/35">
                      {formatElapsed(task.completedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workforce Panel
// ---------------------------------------------------------------------------

function BackendTypeBadge({ type }: { type: BackendType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1 py-px text-[7px] font-semibold uppercase tracking-widest",
        type === "cli"
          ? "border-muted-foreground/20 bg-muted-foreground/8 text-muted-foreground/60"
          : "border-[var(--color-session)]/25 bg-[var(--color-session)]/10 text-[var(--color-session)]"
      )}
    >
      {type}
    </span>
  );
}

function WorkforcePanel({
  health,
  roles,
  selectedTaskTypes,
  selectedAgent,
  selectedBackend,
  onAssignAgent,
  onSelectBackend,
}: {
  health: BackendHealth[];
  roles: AgentRole[];
  selectedTaskTypes: Set<string>;
  selectedAgent: string | null;
  selectedBackend: string | null;
  onAssignAgent?: (agentSlug: string) => void;
  onSelectBackend?: (backend: string) => void;
}) {
  const hasSelection = selectedTaskTypes.size > 0;
  const hasAgent = selectedAgent !== null;
  return (
    <div className="col-span-4 flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="border-b border-[var(--color-dark-bronze)] px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
          Workforce
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Backends section — fixed height, no scroll */}
        <div className="shrink-0 space-y-1.5 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground/40">
            Backends
          </p>

          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/30 pt-1 pb-0.5">CLI Agents</p>
          {health
            .filter((b) => b.backendType === "cli")
            .map((b) => {
              const isSelected = selectedBackend === b.backend;
              const isClickable = hasAgent && b.available;

              return (
                <button
                  key={b.backend}
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectBackend?.(b.backend)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md py-1.5 px-2 -mx-2 transition-all duration-200",
                    isSelected && "bg-[var(--color-copper)]/12 border border-[var(--color-copper)]/25",
                    !isSelected && "border border-transparent",
                    isClickable && !isSelected && "hover:bg-[var(--color-copper)]/5 cursor-pointer",
                    !isClickable && "cursor-default"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block h-1.5 w-1.5 rounded-full",
                        b.available
                          ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                          : "bg-rose-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]"
                      )}
                    />
                    <BackendTypeBadge type={b.backendType} />
                    <span
                      className={cn(
                        "text-xs",
                        isSelected ? "font-medium text-[var(--color-copper)]" : b.available ? "text-foreground" : "text-muted-foreground/50"
                      )}
                    >
                      {b.displayName}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded border border-muted-foreground/12 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50",
                      !b.available && "opacity-40",
                      isSelected && "border-[var(--color-copper)]/25 text-[var(--color-copper)]"
                    )}
                  >
                    {b.available
                      ? b.models?.join(" \u00b7 ") ?? "ready"
                      : "offline"}
                  </span>
                </button>
              );
            })}

          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/30 pt-3 pb-0.5">API Backends</p>
          {health
            .filter((b) => b.backendType === "api")
            .map((b) => {
              const isSelected = selectedBackend === b.backend;
              const isClickable = hasAgent && b.available;

              return (
                <button
                  key={b.backend}
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectBackend?.(b.backend)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md py-1.5 px-2 -mx-2 transition-all duration-200",
                    isSelected && "bg-[var(--color-copper)]/12 border border-[var(--color-copper)]/25",
                    !isSelected && "border border-transparent",
                    isClickable && !isSelected && "hover:bg-[var(--color-copper)]/5 cursor-pointer",
                    !isClickable && "cursor-default"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block h-1.5 w-1.5 rounded-full",
                        b.available
                          ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                          : "bg-rose-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]"
                      )}
                    />
                    <BackendTypeBadge type={b.backendType} />
                    <span
                      className={cn(
                        "text-xs",
                        isSelected ? "font-medium text-[var(--color-copper)]" : b.available ? "text-foreground" : "text-muted-foreground/50"
                      )}
                    >
                      {b.displayName}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded border border-muted-foreground/12 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50",
                      !b.available && "opacity-40",
                      isSelected && "border-[var(--color-copper)]/25 text-[var(--color-copper)]"
                    )}
                  >
                    {b.available
                      ? b.models?.join(" \u00b7 ") ?? "ready"
                      : "offline"}
                  </span>
                </button>
              );
            })}
        </div>

        {/* Divider */}
        <div className="shrink-0 mx-3 border-t border-muted-foreground/8" />

        {/* Agents section — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground/40">
            Agents
          </p>
          {roles.map((role) => {
            const primaryType = role.taskType;
            const eligible = role.eligibleTaskTypes ?? [];
            const allTypes = primaryType ? [primaryType, ...eligible] : eligible;
            const displayTypes = allTypes.length > 0
              ? allTypes.filter((t) => t in TASK_TYPE_STYLES)
              : role.tags?.filter((t) => t in TASK_TYPE_STYLES) ?? [];

            // Is this agent eligible for any currently selected task?
            const isEligible = hasSelection && allTypes.some((t) => selectedTaskTypes.has(t));
            const isIneligible = hasSelection && !isEligible;
            const isAssigned = selectedAgent === role.slug;

            return (
              <div
                key={role.slug}
                className={cn(
                  "flex items-center justify-between border-b border-[var(--color-copper)]/6 py-2 transition-all duration-200 last:border-0",
                  isAssigned && "rounded-md bg-[var(--color-copper)]/15 px-2 -mx-2 border-[var(--color-copper)]/30 shadow-[0_0_12px_rgba(196,127,60,0.15)]",
                  isEligible && !isAssigned && "rounded-md bg-[var(--color-copper)]/5 px-2 -mx-2 border-[var(--color-copper)]/15",
                  isIneligible && "opacity-30"
                )}
              >
                <div>
                  <p className={cn(
                    "text-xs",
                    isAssigned ? "font-semibold text-[var(--color-copper)]" : isEligible ? "font-medium text-[var(--color-copper)]" : "text-foreground"
                  )}>
                    {role.displayName || role.slug}
                  </p>
                  {displayTypes.length > 0 && (
                    <div className="mt-0.5 flex items-center gap-1">
                      {displayTypes.map((tt) => {
                        const s = getTaskTypeStyle(tt);
                        return (
                          <span
                            key={tt}
                            className={cn(
                              "inline-flex items-center rounded border px-1 py-px text-[8px] font-medium",
                              s.className
                            )}
                          >
                            {s.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onAssignAgent?.(role.slug)}
                  disabled={hasSelection && !isEligible}
                  className={cn(
                    "rounded border px-2 py-0.5 text-[10px] transition-colors",
                    isAssigned
                      ? "border-[var(--color-copper)]/50 bg-[var(--color-copper)]/20 text-[var(--color-copper)] font-medium"
                      : isEligible
                        ? "border-[var(--color-copper)]/30 bg-[var(--color-copper)]/10 text-[var(--color-copper)] hover:bg-[var(--color-copper)]/20"
                        : "border-muted-foreground/12 text-muted-foreground/60 hover:border-muted-foreground/25 hover:text-muted-foreground/80",
                    hasSelection && !isEligible && "pointer-events-none"
                  )}
                >
                  {isAssigned ? "Assigned" : "Assign"}
                </button>
              </div>
            );
          })}

          {roles.length === 0 && (
            <div className="py-4 text-center text-xs text-muted-foreground/40">
              No agent roles configured
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Queue Controls (bottom bar)
// ---------------------------------------------------------------------------

function QueueControls({
  selectedCount,
  selectedAgent,
  selectedBackend,
  activeCount,
  completedTodayCount,
  dispatching,
  onDispatch,
}: {
  selectedCount: number;
  selectedAgent: string | null;
  selectedBackend: string | null;
  activeCount: number;
  completedTodayCount: number;
  dispatching: boolean;
  onDispatch: () => void;
}) {
  const isReady = selectedCount > 0 && selectedAgent && selectedBackend;

  // Resolve backend type for pipeline display
  const selectedBackendMeta = selectedBackend
    ? BACKEND_META[selectedBackend as keyof typeof BACKEND_META]
    : null;

  // Pipeline step indicators
  const steps = [
    { label: `${selectedCount} task${selectedCount !== 1 ? "s" : ""}`, done: selectedCount > 0 },
    { label: selectedAgent ?? "agent", done: !!selectedAgent },
    { label: selectedBackendMeta?.displayName ?? selectedBackend ?? "backend", done: !!selectedBackend, backendType: selectedBackendMeta?.type },
  ];

  return (
    <div className="flex items-center gap-3">
        {/* Pipeline steps */}
        <div className="flex items-center gap-1.5">
          {steps.map((step, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted-foreground/20">→</span>}
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  step.done
                    ? "border-[var(--color-copper)]/30 bg-[var(--color-copper)]/10 text-[var(--color-copper)]"
                    : "border-muted-foreground/12 text-muted-foreground/30"
                )}
              >
                {"backendType" in step && step.backendType && step.done && (
                  <BackendTypeBadge type={step.backendType} />
                )}{" "}
                {step.label}
              </span>
            </span>
          ))}
        </div>

        {/* Dispatch button */}
        <button
          onClick={onDispatch}
          disabled={!isReady || dispatching}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
            isReady && !dispatching
              ? "border-[var(--color-copper)]/30 bg-[var(--color-copper)]/15 text-[var(--color-copper)] hover:border-[var(--color-copper)]/50 hover:bg-[var(--color-copper)]/25"
              : "border-muted-foreground/15 bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
          )}
        >
          <Play className="h-3 w-3" />
          {dispatching ? "Dispatching..." : "Dispatch"}
        </button>

        <button className="rounded-md border border-muted-foreground/12 px-3 py-1.5 text-xs text-muted-foreground/60 transition-colors hover:border-muted-foreground/25 hover:text-muted-foreground/80">
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Auto-Dispatch
          </span>
        </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Content
// ---------------------------------------------------------------------------

interface DispatchContentProps {
  tasks: TaskBoardEntry[];
  roles: AgentRole[];
  health: BackendHealth[];
}

export function DispatchContent({ tasks, roles, health }: DispatchContentProps) {
  const router = useRouter();
  const [mode, setMode] = useState<DispatchMode>("supervised");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedBackend, setSelectedBackend] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  // Derived task lists
  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status === "pending"),
    [tasks]
  );

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status === "dispatched"),
    [tasks]
  );

  const failedTasks = useMemo(
    () => tasks.filter((t) => t.status === "failed"),
    [tasks]
  );

  const completedToday = useMemo(
    () => tasks.filter((t) => t.status === "completed" && isToday(t.completedAt)),
    [tasks]
  );

  // Group pending tasks by taskType
  const backlogGroups = useMemo(() => {
    const map = new Map<string, TaskBoardEntry[]>();
    for (const t of pendingTasks) {
      const existing = map.get(t.taskType);
      if (existing) existing.push(t);
      else map.set(t.taskType, [t]);
    }
    const groups: TaskGroup[] = [];
    for (const [taskType, groupTasks] of map) {
      groups.push({ taskType, tasks: groupTasks });
    }
    return groups;
  }, [pendingTasks]);

  // Blocked types based on mode
  const blockedTypes = mode === "overnight" ? OVERNIGHT_BLOCKED : [];

  // Task-types of currently selected tasks (for workforce highlighting)
  const selectedTaskTypes = useMemo(() => {
    const types = new Set<string>();
    for (const id of selectedIds) {
      const task = pendingTasks.find((t) => t.id === id);
      if (task) types.add(task.taskType);
    }
    return types;
  }, [selectedIds, pendingTasks]);

  // When mode switches to overnight, deselect blocked tasks
  const handleModeChange = useCallback(
    (newMode: DispatchMode) => {
      setMode(newMode);
      if (newMode === "overnight") {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          for (const id of prev) {
            const task = pendingTasks.find((t) => t.id === id);
            if (task && OVERNIGHT_BLOCKED.includes(task.taskType)) {
              next.delete(id);
            }
          }
          return next;
        });
      }
    },
    [pendingTasks]
  );

  // Toggle task selection — clears agent/backend when selection changes
  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedAgent(null);
    setSelectedBackend(null);
  }, []);

  // Select agent
  const handleAssignAgent = useCallback((slug: string) => {
    setSelectedAgent((prev) => prev === slug ? null : slug);
    setSelectedBackend(null); // reset backend when agent changes
  }, []);

  // Select backend
  const handleSelectBackend = useCallback((backend: string) => {
    setSelectedBackend((prev) => prev === backend ? null : backend);
  }, []);

  // Dispatch selected tasks
  const handleDispatch = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setDispatching(true);

    const ids = [...selectedIds];
    const results = await Promise.allSettled(
      ids.map((taskId) =>
        fetch("/api/dispatch/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, mode, agent: selectedAgent, backend: selectedBackend }),
        })
      )
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && (r.value as Response).ok
    ).length;

    if (successCount > 0) {
      setSelectedIds(new Set());
      setSelectedAgent(null);
      setSelectedBackend(null);
      router.refresh();
    }

    setDispatching(false);
  }, [selectedIds, mode, selectedAgent, selectedBackend, router]);

  // Reset a failed task back to pending
  const handleResetTask = useCallback(async (taskId: string) => {
    await fetch("/api/dispatch/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    router.refresh();
  }, [router]);

  // Polling: refresh when there are dispatched tasks
  useEffect(() => {
    if (activeTasks.length === 0 && !dispatching) return;
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTasks.length, dispatching, router]);

  // Stats
  const selectedCount = selectedIds.size;
  const activeCount = activeTasks.length;
  const failedCount = failedTasks.length;
  const completedTodayCount = completedToday.length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-[calc(100vh-53px)] min-h-[400px] flex-col overflow-hidden border-t border-[var(--color-dark-bronze)]">
        {/* Top bar: Mode + Queue controls + Stats */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-dark-bronze)] px-4 py-2">
          <div className="flex items-center gap-3">
            <ModeSelector mode={mode} onModeChange={handleModeChange} />
            <QueueControls
              selectedCount={selectedCount}
              selectedAgent={selectedAgent}
              selectedBackend={selectedBackend}
              activeCount={activeCount}
              completedTodayCount={completedTodayCount}
              dispatching={dispatching}
              onDispatch={handleDispatch}
            />
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground/50">
              <span className="font-medium text-[var(--color-copper)]">
                {activeCount}
              </span>{" "}
              active
            </span>
            {failedCount > 0 && (
              <span className="text-muted-foreground/50">
                <span className="font-medium text-rose-400">
                  {failedCount}
                </span>{" "}
                failed
              </span>
            )}
            <span className="text-muted-foreground/50">
              <span className="font-medium text-foreground">
                {completedTodayCount}
              </span>{" "}
              today
            </span>
          </div>
        </div>

        {/* Guard rail banner */}
        <GuardRailBanner visible={mode === "overnight"} />

        {/* Three-panel grid — fills remaining space */}
        <div className="grid flex-1 grid-cols-12 gap-0 overflow-hidden">
          <BacklogPanel
            groups={backlogGroups}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            blockedTypes={blockedTypes}
          />
          <AssignmentsPanel
            active={activeTasks}
            failed={failedTasks}
            completedToday={completedToday}
            onResetTask={handleResetTask}
          />
          <WorkforcePanel
            health={health}
            roles={roles}
            selectedTaskTypes={selectedTaskTypes}
            selectedAgent={selectedAgent}
            selectedBackend={selectedBackend}
            onAssignAgent={handleAssignAgent}
            onSelectBackend={handleSelectBackend}
          />
        </div>
      </div>
    </MotionConfig>
  );
}
