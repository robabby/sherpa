"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, MotionConfig } from "motion/react";
import { formatDistanceToNowStrict } from "date-fns";

import { SectionHeader } from "./section-header";
import { StudioBreadcrumb } from "./studio-breadcrumb";
import { PromptCopyButton } from "./prompt-copy-button";
import { EASE_STANDARD } from "./lib/animation-constants";
import { cn } from "./lib/utils";
import type { TaskBoardEntry } from "@/lib/studio/tasks";
import { BACKEND_META } from "@sherpa/studio-core";

// ---------------------------------------------------------------------------
// Badge style maps
// ---------------------------------------------------------------------------

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

const VERDICT_STYLES: Record<string, { label: string; className: string }> = {
  approved: {
    label: "approved",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  },
  "needs-changes": {
    label: "needs changes",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  },
  rejected: {
    label: "rejected",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  },
  pending: {
    label: "pending",
    className: "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground",
  },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-[var(--color-gold)]",
  medium: "bg-[var(--color-copper)]",
  low: "bg-[var(--color-bronze)]",
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

function formatAge(isoDate: string): string {
  if (!isoDate) return "";
  try {
    const d = isoDate.match(/^\d{4}-\d{2}-\d{2}$/)
      ? new Date(isoDate + "T00:00:00")
      : new Date(isoDate);
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

// ---------------------------------------------------------------------------
// Pipeline Status Cards
// ---------------------------------------------------------------------------

const PIPELINE_STAGES = [
  { key: "pending", label: "Pending", color: "muted-foreground" },
  { key: "dispatched", label: "Dispatched", color: "copper" },
  { key: "completed", label: "Completed", color: "emerald" },
  { key: "reviewed", label: "Reviewed", color: "gold" },
] as const;

function PipelineCards({
  tasks,
  activeStatus,
  onToggle,
}: {
  tasks: TaskBoardEntry[];
  activeStatus: string | null;
  onToggle: (status: string) => void;
}) {
  const counts: Record<string, number> = {};
  let failedCount = 0;
  for (const t of tasks) {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
    if (t.status === "failed") failedCount++;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap items-center gap-3"
    >
      {PIPELINE_STAGES.map((stage) => {
        const count = counts[stage.key] ?? 0;
        const isActive = activeStatus === stage.key;
        const isCopper = stage.color === "copper";
        const isEmerald = stage.color === "emerald";
        const isGold = stage.color === "gold";

        return (
          <motion.button
            key={stage.key}
            variants={cardVariant}
            onClick={() => onToggle(stage.key)}
            className={cn(
              "flex min-w-[100px] flex-col items-center rounded-lg border px-4 py-3 transition-all duration-200",
              isActive
                ? isCopper
                  ? "border-[var(--color-copper)]/50 bg-[var(--color-copper)]/10"
                  : isEmerald
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : isGold
                      ? "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10"
                      : "border-muted-foreground/40 bg-muted-foreground/10"
                : "border-muted-foreground/15 bg-card/30 hover:border-[var(--color-copper)]/30"
            )}
          >
            <span
              className={cn(
                "text-2xl font-semibold leading-none",
                isActive
                  ? isCopper
                    ? "text-[var(--color-copper)]"
                    : isEmerald
                      ? "text-emerald-500"
                      : isGold
                        ? "text-[var(--color-gold)]"
                        : "text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {count}
            </span>
            <span className="mt-1 text-xs text-muted-foreground/70">
              {stage.label}
            </span>
          </motion.button>
        );
      })}

      {/* Arrow separators (CSS-only) */}
      {failedCount > 0 && (
        <motion.div
          variants={cardVariant}
          className="flex min-w-[100px] flex-col items-center rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3"
        >
          <span className="text-2xl font-semibold leading-none text-rose-500">
            {failedCount}
          </span>
          <span className="mt-1 text-xs text-rose-500/70">Failed</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Filter Bar
// ---------------------------------------------------------------------------

function FilterBar({
  tasks,
  params,
  setParam,
  clearAll,
}: {
  tasks: TaskBoardEntry[];
  params: URLSearchParams;
  setParam: (key: string, value: string | null) => void;
  clearAll: () => void;
}) {
  const backend = params.get("backend");
  const initiative = params.get("initiative");
  const role = params.get("role");
  const hasFilters = backend || initiative || role || params.get("status");

  const initiatives = [...new Set(tasks.map((t) => t.initiative).filter(Boolean))] as string[];
  const roles = [...new Set(tasks.map((t) => t.role).filter(Boolean))];

  return (
    <motion.div
      variants={fadeVariant}
      className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/30 px-4 py-2.5"
    >
      {/* Backend toggles */}
      <div className="flex items-center gap-1">
        {["All", "claude", "lm-studio"].map((b) => {
          const val = b === "All" ? null : b;
          const isActive = backend === val;
          return (
            <button
              key={b}
              onClick={() => setParam("backend", isActive ? null : val)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-copper)]/15 text-[var(--color-copper)]"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              )}
            >
              {b === "lm-studio" ? "LM Studio" : b === "claude" ? "Claude" : "All"}
            </button>
          );
        })}
      </div>

      {/* Initiative filter */}
      {initiatives.length > 0 && (
        <select
          value={initiative ?? ""}
          onChange={(e) => setParam("initiative", e.target.value || null)}
          className="rounded-md border border-muted-foreground/15 bg-transparent px-2 py-1 text-xs text-muted-foreground/70 outline-none"
        >
          <option value="">All initiatives</option>
          {initiatives.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      )}

      {/* Role filter */}
      {roles.length > 0 && (
        <select
          value={role ?? ""}
          onChange={(e) => setParam("role", e.target.value || null)}
          className="rounded-md border border-muted-foreground/15 bg-transparent px-2 py-1 text-xs text-muted-foreground/70 outline-none"
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="ml-auto text-xs text-[var(--color-copper)]/70 transition-colors hover:text-[var(--color-copper)]"
        >
          Clear filters
        </button>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Task Table
// ---------------------------------------------------------------------------

function TaskTable({ tasks }: { tasks: TaskBoardEntry[] }) {
  if (tasks.length === 0) {
    return (
      <motion.div
        variants={fadeVariant}
        className="py-12 text-center text-sm text-muted-foreground/50"
      >
        No tasks match these filters
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeVariant}
      className="overflow-x-auto rounded-lg border border-[var(--color-copper)]/20 bg-card/20"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-copper)]/15">
            <th className="w-8 px-3 py-2.5" />
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground/70">
              Task
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground/70">
              Role
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground/70">
              Backend
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground/70">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground/70">
              Verdict
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground/70">
              Age
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const statusBadge = STATUS_STYLES[task.status] ?? STATUS_STYLES.pending!;
            const verdictBadge = VERDICT_STYLES[task.judgeVerdict] ?? VERDICT_STYLES.pending!;
            const priorityColor = PRIORITY_COLORS[task.priority] ?? "bg-muted-foreground";

            return (
              <tr
                key={task.id}
                className="border-b border-[var(--color-copper)]/8 transition-colors last:border-0 hover:bg-[var(--color-copper)]/5"
              >
                <td className="px-3 py-3">
                  <span
                    className={cn("block h-2 w-2 rounded-full", priorityColor)}
                    title={task.priority}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-medium text-foreground transition-colors hover:text-[var(--color-copper)]"
                  >
                    {task.title}
                  </Link>
                  {task.initiative && (
                    <p className="mt-0.5 text-xs text-muted-foreground/50">
                      {task.initiative}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">{task.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    {(() => {
                      const meta = BACKEND_META[task.backend as keyof typeof BACKEND_META];
                      if (!meta) return null;
                      return (
                        <span
                          className={cn(
                            "inline-flex items-center rounded border px-1 py-px text-[7px] font-semibold uppercase tracking-widest",
                            meta.type === "cli"
                              ? "border-muted-foreground/20 bg-muted-foreground/8 text-muted-foreground/60"
                              : "border-[var(--color-session)]/25 bg-[var(--color-session)]/10 text-[var(--color-session)]"
                          )}
                        >
                          {meta.type}
                        </span>
                      );
                    })()}
                    <span className="inline-flex items-center rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60">
                      {task.backend}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                      statusBadge.className
                    )}
                  >
                    {statusBadge.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                      verdictBadge.className
                    )}
                  >
                    {verdictBadge.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-muted-foreground/60">
                    {formatAge(task.created)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Content
// ---------------------------------------------------------------------------

interface TasksContentProps {
  tasks: TaskBoardEntry[];
}

export function TasksContent({ tasks }: TasksContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.replace("?", { scroll: false });
  };

  const toggleStatus = (status: string) => {
    const current = searchParams.get("status");
    setParam("status", current === status ? null : status);
  };

  // Apply filters
  const statusFilter = searchParams.get("status");
  const backendFilter = searchParams.get("backend");
  const initiativeFilter = searchParams.get("initiative");
  const roleFilter = searchParams.get("role");

  const filtered = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (backendFilter && t.backend !== backendFilter) return false;
    if (initiativeFilter && t.initiative !== initiativeFilter) return false;
    if (roleFilter && t.role !== roleFilter) return false;
    return true;
  });

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={fadeVariant}>
          <StudioBreadcrumb segments={[{ label: "Tasks" }]} />
        </motion.div>

        <motion.div variants={fadeVariant} className="flex items-end justify-between">
          <SectionHeader label="pipeline" title="Task Board" />
          <div className="flex items-center gap-1.5">
            <PromptCopyButton
              prompt="/morning"
              variant="morning"
            />
            <PromptCopyButton
              prompt="/plan-tasks"
              variant="plan-tasks"
            />
          </div>
        </motion.div>

        {/* Pipeline status cards */}
        <PipelineCards
          tasks={tasks}
          activeStatus={statusFilter}
          onToggle={toggleStatus}
        />

        {/* Filter bar */}
        <FilterBar
          tasks={tasks}
          params={searchParams}
          setParam={setParam}
          clearAll={clearAll}
        />

        {/* Task table */}
        <TaskTable tasks={filtered} />

        {/* Empty state when no tasks at all */}
        {tasks.length === 0 && (
          <motion.div
            variants={fadeVariant}
            className="py-16 text-center text-sm text-muted-foreground/50"
          >
            No tasks in the pipeline
          </motion.div>
        )}
      </motion.div>
    </MotionConfig>
  );
}
