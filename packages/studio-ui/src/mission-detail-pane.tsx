"use client";

import Link from "next/link";

import type { TaskBoardEntry } from "@/lib/studio/tasks";
import type { TaskEvent } from "@sherpa/studio-core/task-events";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocRenderer } from "./doc-renderer";
import { MissionLogViewer } from "./mission-log-viewer";
import { MissionTimeline } from "./mission-timeline";
import { cn } from "./lib/utils";
import {
  STATUS_STYLES,
  STATUS_DOT,
  VERDICT_STYLES,
  formatAge,
  formatDuration,
  formatTokens,
  formatCost,
  getBackendMeta,
} from "./lib/task-styles";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MissionDetailTask = TaskBoardEntry & {
  body: string;
  reportContent: string | null;
  verdictContent: string | null;
  blockerContent: string | null;
};

export interface MissionDetailPaneProps {
  task: MissionDetailTask | null;
  events: TaskEvent[];
  isStreaming: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    <div className="space-y-2.5">
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
                  ? "border-emerald-500/50 bg-emerald-500/[0.12] text-emerald-500"
                  : "border-muted-foreground/25",
              )}
            >
              {checked && (
                <svg
                  viewBox="0 0 12 12"
                  className="h-2.5 w-2.5"
                  fill="currentColor"
                >
                  <path
                    d="M10 3L4.5 8.5 2 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              className={cn(
                "text-sm leading-relaxed",
                checked
                  ? "text-muted-foreground/60 line-through"
                  : "text-foreground/90",
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
// Metric Chip
// ---------------------------------------------------------------------------

function MetricChip({
  label,
  value,
  colorClass = "text-zinc-300",
  children,
}: {
  label: string;
  value?: string;
  colorClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-[var(--color-dark-bronze)]/80 bg-[var(--color-dark-bronze)]/50 px-2.5 py-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-dim)]">
        {label}
      </span>
      {children ?? (
        <span className={`font-mono text-[13px] font-medium ${colorClass}`}>
          {value}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab trigger styling
// ---------------------------------------------------------------------------

const TAB_TRIGGER_CLASS =
  "h-7 rounded-md px-3 text-xs uppercase tracking-[0.1em] data-[state=active]:bg-[var(--color-gold)]/10 data-[state=active]:text-[var(--color-gold)]";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MissionDetailPane({
  task,
  events,
  isStreaming,
  activeTab,
  onTabChange,
}: MissionDetailPaneProps) {
  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------
  if (!task) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-dark-bronze)] bg-[var(--color-warm-charcoal)]/50">
            <svg
              className="h-8 w-8 text-[var(--color-tarnished)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 12h6m-3-3v6m-7.5 3V6.75A2.25 2.25 0 016.75 4.5h10.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25z" />
            </svg>
          </div>
          <p className="font-display text-lg text-muted-foreground/60">
            Select a mission
          </p>
          <p className="mt-1 text-sm text-muted-foreground/40">
            Click a task or press{" "}
            <kbd className="rounded border border-[var(--color-dark-bronze)] bg-[var(--color-obsidian)] px-1 py-0.5 font-mono text-[10px]">
              j
            </kbd>
            /
            <kbd className="rounded border border-[var(--color-dark-bronze)] bg-[var(--color-obsidian)] px-1 py-0.5 font-mono text-[10px]">
              k
            </kbd>{" "}
            to navigate
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Parse task sections
  // -------------------------------------------------------------------------
  const sections = parseSections(task.body);
  const objectiveSection = sections.find((s) => s.heading === "Objective");
  const acceptanceSection = sections.find(
    (s) => s.heading === "Acceptance Criteria",
  );

  const statusBadge = STATUS_STYLES[task.status] ?? STATUS_STYLES.pending!;
  const statusDot = STATUS_DOT[task.status] ?? "bg-muted-foreground";
  const verdictBadge =
    VERDICT_STYLES[task.judgeVerdict] ?? VERDICT_STYLES.pending!;

  const backendMeta = getBackendMeta(task.backend);
  const backendType = backendMeta?.type ?? "cli";

  // Token display
  const tokensDisplay =
    task.tokensInput != null || task.tokensOutput != null
      ? `${task.tokensInput != null ? formatTokens(task.tokensInput) : "\u2014"} in / ${task.tokensOutput != null ? formatTokens(task.tokensOutput) : "\u2014"} out`
      : "\u2014";

  // Default tab
  const effectiveTab = activeTab;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      className="h-full w-full min-w-0 overflow-y-auto overflow-x-hidden px-6 pt-5 pb-8"
      style={{
        background: `radial-gradient(ellipse at 20% 0%, rgba(196,154,108,0.03) 0%, transparent 50%),
                     radial-gradient(ellipse at 80% 100%, rgba(99,102,241,0.02) 0%, transparent 50%)`,
      }}
    >
      {/* Metadata header */}
      <div className="mb-6">
        {/* Status line */}
        <div className="mb-3 flex items-center gap-2.5">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              statusDot,
              task.status === "dispatched" &&
                "animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_2px_rgba(196,154,108,0.15)]",
            )}
          />
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              statusBadge.className,
            )}
          >
            {statusBadge.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs",
              verdictBadge.className,
            )}
          >
            {task.judgeVerdict === "pending"
              ? "pending verdict"
              : verdictBadge.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 font-display text-xl font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">
          {task.title}
        </h1>

        {/* Metric chips row */}
        <div className="mb-3 flex flex-wrap items-stretch gap-2">
          <MetricChip label="Backend">
            <div className="flex items-center gap-1.5">
              <span className="rounded border border-zinc-700/80 bg-zinc-800/60 px-1 py-px font-mono text-[7px] font-semibold uppercase tracking-widest text-zinc-500">
                {backendType.toUpperCase()}
              </span>
              <span className="font-mono text-[13px] font-medium text-zinc-300">
                {task.backend}
              </span>
            </div>
          </MetricChip>
          <MetricChip
            label="Model"
            value={task.model}
            colorClass="text-zinc-300"
          />
          <MetricChip
            label="Duration"
            value={formatDuration(task.durationSeconds)}
            colorClass={
              task.status === "dispatched"
                ? "text-[var(--color-copper)]"
                : "text-zinc-300"
            }
          />
          <MetricChip
            label="Tokens"
            value={tokensDisplay}
            colorClass="text-zinc-300"
          />
          <MetricChip
            label="Cost"
            value={formatCost(task.costUsd)}
            colorClass="text-[var(--color-gold)]"
          />
          <MetricChip
            label="Mode"
            value={task.mode}
            colorClass="text-zinc-400"
          />
        </div>

        {/* Context line */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-dim)]">
          {task.initiative && (
            <>
              <Link
                href={`/process/${task.initiative}`}
                className="transition-colors hover:text-[var(--color-copper)]"
              >
                {task.initiative}
              </Link>
              <span className="text-zinc-700">&middot;</span>
            </>
          )}
          <span>{task.priority} priority</span>
          {task.created && (
            <>
              <span className="text-zinc-700">&middot;</span>
              <span>{formatAge(task.created)} ago</span>
            </>
          )}
          {task.role && task.role !== "unknown" && (
            <>
              <span className="text-zinc-700">&middot;</span>
              <span className="font-mono text-[10px]">{task.role}</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={effectiveTab} onValueChange={onTabChange} className="min-w-0 overflow-hidden">
        <TabsList className="mb-5 bg-transparent">
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="report" className={TAB_TRIGGER_CLASS}>
            Report
          </TabsTrigger>
          <TabsTrigger value="log" className={cn(TAB_TRIGGER_CLASS, "relative")}>
            Log
            {isStreaming && events.some((e) => e.event === "agent_output") && (
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[var(--color-copper)] animate-[pulse_2s_ease-in-out_infinite]" />
            )}
          </TabsTrigger>
          <TabsTrigger value="verdict" className={TAB_TRIGGER_CLASS}>
            Verdict
          </TabsTrigger>
          <TabsTrigger value="events" className={cn(TAB_TRIGGER_CLASS, "relative")}>
            Events
            {isStreaming && (
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[var(--color-copper)] animate-[pulse_2s_ease-in-out_infinite]" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="overflow-hidden">
          <div className="space-y-8">
            {objectiveSection && (
              <div>
                <h2 className="mb-3 font-heading text-[15px] font-semibold text-[var(--color-copper)]">
                  Objective
                </h2>
                <div className="min-w-0 text-sm leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">
                  <DocRenderer content={objectiveSection.content} />
                </div>
              </div>
            )}
            {acceptanceSection && (
              <div>
                <h2 className="mb-3 font-heading text-[15px] font-semibold text-[var(--color-copper)]">
                  Acceptance Criteria
                </h2>
                <AcceptanceCriteria content={acceptanceSection.content} />
              </div>
            )}
            {/* Fallback: render full body if no sections */}
            {sections.length === 0 && task.body.trim() && (
              <DocRenderer content={task.body} />
            )}
          </div>
        </TabsContent>

        {/* Report tab */}
        <TabsContent value="report" className="overflow-hidden">
          {task.reportContent ? (
            <div className="rounded-lg border border-[var(--color-dark-bronze)] bg-[var(--color-warm-charcoal)]/30 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-dim)]">
                  Worker Output
                </span>
                <div className="h-px flex-1 bg-[var(--color-dark-bronze)]" />
              </div>
              <div className="min-w-0 overflow-x-auto text-sm [overflow-wrap:anywhere]">
                <DocRenderer content={task.reportContent} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-muted-foreground/10 bg-card/10 px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground/40">
                No report yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/25">
                Worker output appears after task completion
              </p>
            </div>
          )}
        </TabsContent>

        {/* Log tab */}
        <TabsContent value="log" className="overflow-hidden">
          <MissionLogViewer events={events} isStreaming={isStreaming} />
        </TabsContent>

        {/* Verdict tab */}
        <TabsContent value="verdict" className="overflow-hidden">
          {task.verdictContent ? (
            <div className="rounded-lg border border-[var(--color-dark-bronze)] bg-[var(--color-warm-charcoal)]/30 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-dim)]">
                  Judge Verdict
                </span>
                <div className="h-px flex-1 bg-[var(--color-dark-bronze)]" />
              </div>
              <div className="min-w-0 overflow-x-auto text-sm [overflow-wrap:anywhere]">
                <DocRenderer content={task.verdictContent} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--color-dark-bronze)]/50 bg-[var(--color-warm-charcoal)]/20 px-6 py-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800/50">
                <svg
                  className="h-5 w-5 text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground/50">No verdict yet</p>
              <p className="mt-1 text-xs text-[var(--color-dim)]">
                Awaiting judge review
              </p>
            </div>
          )}
        </TabsContent>

        {/* Events tab */}
        <TabsContent value="events" className="overflow-hidden">
          <MissionTimeline events={events} isStreaming={isStreaming} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
