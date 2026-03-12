import Link from "next/link";

import { cn } from "./lib/utils";
import type { Initiative, InitiativeVelocity, Workstream } from "@/lib/studio";
import { HubPanel } from "./hub-panel";
import { ProcessPipelineChart } from "./process-pipeline-chart";
import { StatusBadge } from "./status-badge";

export interface PendingReviewItem {
  slug: string;
  title: string;
  days: number;
}

export interface AttentionItem {
  slug: string;
  title: string;
  action: string;
  days: number;
}

interface HubProcessPanelProps {
  initiatives: Initiative[];
  workstreams: Workstream[];
  velocityMap?: Map<string, InitiativeVelocity>;
  pendingReview?: PendingReviewItem[];
  attentionNeeded?: AttentionItem[];
}

export function HubProcessPanel({
  initiatives,
  workstreams,
  velocityMap,
  pendingReview = [],
  attentionNeeded = [],
}: HubProcessPanelProps) {
  // Hero initiative: most recently updated
  const sortedInitiatives = [...initiatives].sort(
    (a, b) => b.updated.localeCompare(a.updated)
  );
  const heroInitiative = sortedInitiatives[0];

  // Top 3 active workstreams
  const activeWorkstreams = workstreams
    .filter((w) => w.status === "active")
    .slice(0, 3);

  // Pipeline counts
  const statusCounts = {
    pending: initiatives.filter((i) => i.status === "pending").length,
    approved: initiatives.filter((i) => i.status === "approved").length,
    "in-progress": initiatives.filter((i) => i.status === "in-progress")
      .length,
    integrated: initiatives.filter((i) => i.status === "integrated").length,
  };

  const staleCount = velocityMap
    ? [...velocityMap.values()].filter(
        (v) => v.staleDays != null && v.staleDays >= 7,
      ).length
    : 0;

  const pipelineSegments = [
    `${statusCounts.pending} pending`,
    `${statusCounts.approved} approved`,
    `${statusCounts["in-progress"]} in progress`,
    `${statusCounts.integrated} integrated`,
  ];
  if (staleCount > 0) {
    pipelineSegments.push(`${staleCount} stale`);
  }
  const pipelineText = pipelineSegments.join(" · ");

  return (
    <HubPanel
      variant="process"
      href="/process"
      title="Initiatives"
      label="PROCESS"
      linkText="View all initiatives"
    >
      <div className="space-y-5">
        {/* Hero initiative */}
        {heroInitiative && (
          <Link
            href={`/process/${heroInitiative.slug}`}
            className={cn(
              "block rounded-lg border-l-2 pl-3 transition-colors hover:bg-[var(--color-copper)]/5",
              heroInitiative.status === "in-progress"
                ? "border-l-[var(--color-gold)]"
                : heroInitiative.status === "approved"
                  ? "border-l-emerald-400"
                  : "border-l-[var(--color-copper)]"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {heroInitiative.title}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                {velocityMap?.get(heroInitiative.slug)?.momentum && (
                  <MomentumBadge
                    momentum={velocityMap.get(heroInitiative.slug)!.momentum!}
                  />
                )}
                <StatusBadge
                  status={heroInitiative.status}
                  className="shrink-0"
                />
              </div>
            </div>
            {heroInitiative.summary && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {heroInitiative.summary}
              </p>
            )}
            <span className="mt-1 block font-mono text-xs text-muted-foreground/60">
              {formatDate(heroInitiative.updated)}
            </span>
          </Link>
        )}

        {/* Workstream list */}
        {activeWorkstreams.length > 0 && (
          <div className="space-y-2">
            {activeWorkstreams.map((ws) => (
              <Link
                key={ws.slug}
                href={`/process/${ws.initiative?.split("/")[0] ?? ws.slug}`}
                className="flex items-center justify-between gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-[var(--color-copper)]/5"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground">
                    {ws.slug}
                  </span>
                  {ws.focus && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {ws.focus}
                    </p>
                  )}
                </div>
                <StatusBadge status={ws.status} className="shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* Attention needed — human-actor lifecycle items */}
        {attentionNeeded.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-gold)]/60">
              Attention needed
            </span>
            {attentionNeeded.map((item) => (
              <Link
                key={item.slug}
                href={`/process/${item.slug}`}
                className="flex items-center justify-between gap-2 rounded-md border-l-2 border-l-[var(--color-gold)]/30 px-2 py-0.5 transition-colors hover:bg-[var(--color-copper)]/5"
              >
                <span className="truncate text-sm text-foreground/80">
                  {item.title}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[10px] text-[var(--color-gold)]/50">
                    {item.action}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px]",
                      item.days >= 7
                        ? "text-rose-400/70"
                        : item.days >= 3
                          ? "text-amber-500/70"
                          : "text-muted-foreground/40",
                    )}
                  >
                    {item.days}d
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pending review — sorted oldest first */}
        {pendingReview.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Pending review
            </span>
            {pendingReview.map((item) => (
              <Link
                key={item.slug}
                href={`/process/${item.slug}`}
                className="flex items-center justify-between gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-[var(--color-copper)]/5"
              >
                <span className="truncate text-sm text-foreground/80">
                  {item.title}
                </span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[10px]",
                    item.days >= 7
                      ? "text-rose-400/70"
                      : item.days >= 3
                        ? "text-amber-500/70"
                        : "text-muted-foreground/40",
                  )}
                >
                  {item.days}d
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Pipeline summary */}
        <p className="font-mono text-xs text-muted-foreground/60">
          {pipelineText}
        </p>

        {/* Pipeline chart */}
        {initiatives.length > 0 && (
          <ProcessPipelineChart data={statusCounts} />
        )}
      </div>
    </HubPanel>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function MomentumBadge({ momentum }: { momentum: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none",
        momentum === "active" && "bg-emerald-500/10 text-emerald-400",
        momentum === "cooling" && "bg-amber-500/10 text-amber-400",
        momentum === "stale" && "bg-rose-500/10 text-rose-400/80",
      )}
    >
      {momentum}
    </span>
  );
}
