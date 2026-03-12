"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import { formatDistanceToNowStrict } from "date-fns";

import { StudioBreadcrumb } from "./studio-breadcrumb";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { DocRenderer } from "./doc-renderer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EASE_STANDARD } from "./lib/animation-constants";
import { cn } from "./lib/utils";
import type { TaskDetail } from "@/lib/studio/tasks";

// ---------------------------------------------------------------------------
// Badge styles (shared with tasks-content)
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
// Animation
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
    return formatDistanceToNowStrict(d, { addSuffix: true });
  } catch {
    return "";
  }
}

/** Parse the body into named sections based on ## headings */
function parseSections(body: string): { heading: string; content: string }[] {
  const sections: { heading: string; content: string }[] = [];
  const lines = body.split("\n");
  let current: { heading: string; content: string } | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^## (.+)$/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { heading: headingMatch[1]!, content: "" };
    } else if (current) {
      current.content += line + "\n";
    }
  }
  if (current) sections.push(current);

  return sections;
}

/** Render acceptance criteria with checkbox styling */
function AcceptanceCriteria({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const checked = line.match(/^- \[x\]/i);
        const unchecked = line.match(/^- \[ \]/);
        if (!checked && !unchecked) return null;
        const text = line.replace(/^- \[.\]\s*/, "");
        return (
          <div key={i} className="flex items-start gap-2.5">
            <div
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                checked
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-500"
                  : "border-muted-foreground/25"
              )}
            >
              {checked && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
                  <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span
              className={cn(
                "text-sm leading-relaxed",
                checked ? "text-muted-foreground/60 line-through" : "text-foreground/90"
              )}
            >
              {text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Content
// ---------------------------------------------------------------------------

interface TaskDetailContentProps {
  task: TaskDetail;
}

export function TaskDetailContent({ task }: TaskDetailContentProps) {
  const sections = parseSections(task.body);
  const objectiveSection = sections.find((s) => s.heading === "Objective");
  const acceptanceSection = sections.find((s) => s.heading === "Acceptance Criteria");
  const otherSections = sections.filter(
    (s) => s.heading !== "Objective" && s.heading !== "Acceptance Criteria"
  );

  const statusBadge = STATUS_STYLES[task.status] ?? STATUS_STYLES.pending!;
  const verdictBadge = VERDICT_STYLES[task.judgeVerdict] ?? VERDICT_STYLES.pending!;
  const priorityColor = PRIORITY_COLORS[task.priority] ?? "bg-muted-foreground";

  const hasArtifacts = task.hasReport || task.hasVerdict || task.hasBlockers;
  const defaultTab = task.hasReport
    ? "report"
    : task.hasVerdict
      ? "verdict"
      : "blockers";

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Breadcrumb */}
        <motion.div variants={fadeVariant}>
          <StudioBreadcrumb
            segments={[
              { label: "Tasks", href: "/tasks" },
              { label: task.title },
            ]}
          />
        </motion.div>

        {/* Header block */}
        <motion.div variants={fadeVariant} className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", priorityColor)} title={task.priority} />
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                statusBadge.className
              )}
            >
              {statusBadge.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                verdictBadge.className
              )}
            >
              {verdictBadge.label}
            </span>
          </div>

          <h1 className="font-display text-2xl text-foreground">{task.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/60">
            {task.initiative && (
              <Link
                href={`/process/${task.initiative}`}
                className="transition-colors hover:text-[var(--color-copper)]"
              >
                {task.initiative}
              </Link>
            )}
            <span className="inline-flex items-center rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px]">
              {task.backend}
            </span>
            <span className="inline-flex items-center rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px]">
              {task.model}
            </span>
            {task.created && (
              <span>{formatAge(task.created)}</span>
            )}
            {task.worktree && (
              <span className="inline-flex items-center rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px]">
                worktree: {task.worktree}
              </span>
            )}
            {task.branch && (
              <span className="inline-flex items-center rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px]">
                {task.branch}
              </span>
            )}
          </div>
        </motion.div>

        {/* Objective */}
        {objectiveSection && (
          <motion.div variants={fadeVariant}>
            <h2 className="mb-3 font-heading text-lg text-[var(--color-copper)]">
              Objective
            </h2>
            <div className="text-sm leading-relaxed text-foreground/90">
              <DocRenderer content={objectiveSection.content} />
            </div>
          </motion.div>
        )}

        {/* Acceptance Criteria */}
        {acceptanceSection && (
          <motion.div variants={fadeVariant}>
            <h2 className="mb-3 font-heading text-lg text-[var(--color-copper)]">
              Acceptance Criteria
            </h2>
            <AcceptanceCriteria content={acceptanceSection.content} />
          </motion.div>
        )}

        {/* Other sections as collapsible */}
        {otherSections.map((section) => (
          <motion.div key={section.heading} variants={fadeVariant}>
            <CollapsibleSection
              storageKey={`task-${task.id}-${section.heading}`}
              title={section.heading}
              defaultExpanded={false}
            >
              <div className="text-sm">
                <DocRenderer content={section.content} />
              </div>
            </CollapsibleSection>
          </motion.div>
        ))}

        {/* Fallback: render full body if no sections found */}
        {sections.length === 0 && task.body.trim() && (
          <motion.div variants={fadeVariant}>
            <DocRenderer content={task.body} />
          </motion.div>
        )}

        {/* Log artifact tabs */}
        {hasArtifacts ? (
          <motion.div variants={fadeVariant}>
            <Tabs defaultValue={defaultTab}>
              <TabsList className="bg-muted/30">
                {task.hasReport && (
                  <TabsTrigger
                    value="report"
                    className="data-[state=active]:text-[var(--color-copper)]"
                  >
                    Report
                  </TabsTrigger>
                )}
                {task.hasVerdict && (
                  <TabsTrigger
                    value="verdict"
                    className="data-[state=active]:text-[var(--color-copper)]"
                  >
                    Verdict
                  </TabsTrigger>
                )}
                {task.hasBlockers && (
                  <TabsTrigger
                    value="blockers"
                    className="data-[state=active]:text-[var(--color-copper)]"
                  >
                    Blockers
                  </TabsTrigger>
                )}
              </TabsList>

              {task.reportContent && (
                <TabsContent value="report">
                  <div className="rounded-lg border border-[var(--color-copper)]/15 bg-card/20 p-6">
                    <DocRenderer content={task.reportContent} />
                  </div>
                </TabsContent>
              )}
              {task.verdictContent && (
                <TabsContent value="verdict">
                  <div className="rounded-lg border border-[var(--color-copper)]/15 bg-card/20 p-6">
                    <DocRenderer content={task.verdictContent} />
                  </div>
                </TabsContent>
              )}
              {task.blockerContent && (
                <TabsContent value="blockers">
                  <div className="rounded-lg border border-[var(--color-copper)]/15 bg-card/20 p-6">
                    <DocRenderer content={task.blockerContent} />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeVariant}
            className="rounded-lg border border-muted-foreground/10 bg-card/10 px-6 py-8 text-center text-sm text-muted-foreground/40"
          >
            No worker output yet
          </motion.div>
        )}
      </motion.div>
    </MotionConfig>
  );
}
