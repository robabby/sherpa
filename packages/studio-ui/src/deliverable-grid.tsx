"use client";

import Link from "next/link";
import { BarChart2, Presentation } from "lucide-react";
import { cn } from "./lib/utils";
import { ChartRenderer } from "./chart-renderer";
import type { ChartSpec, DeliverableSummary } from "@/lib/studio/types";

interface DeliverableGridProps {
  deliverables: DeliverableSummary[];
  basePath: string;
  slugs: string[];
  chartSpecs?: Record<string, ChartSpec>;
}

export function DeliverableGrid({
  deliverables,
  slugs,
  chartSpecs,
}: DeliverableGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {deliverables.map((d) => (
        <DeliverableCard
          key={d.id}
          deliverable={d}
          slugs={slugs}
          chartSpec={chartSpecs?.[d.id]}
        />
      ))}
    </div>
  );
}

function DeliverableCard({
  deliverable,
  slugs,
  chartSpec,
}: {
  deliverable: DeliverableSummary;
  slugs: string[];
  chartSpec?: ChartSpec;
}) {
  const isChart = deliverable.type === "chart";
  const Icon = isChart ? BarChart2 : Presentation;

  const href = isChart
    ? `/app/studio/process/${slugs.join("/")}/chart/${deliverable.id}`
    : `/app/studio/process/${slugs.join("/")}/present/${deliverable.id}`;

  return (
    <Link href={href}>
      <div
        className={cn(
          "group rounded-lg border border-[var(--border-gold)]/15 bg-card/50 p-4 transition-colors",
          "hover:border-[var(--color-gold)]/40 cursor-pointer",
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-[var(--color-gold)]/60" />
          <span className="truncate text-sm font-medium text-foreground group-hover:text-[var(--color-gold)]">
            {deliverable.title}
          </span>
        </div>

        {isChart && chartSpec && (
          <div className="mb-3 rounded-md border border-[var(--border-gold)]/10 bg-background/40 p-2">
            <ChartRenderer spec={chartSpec} compact />
          </div>
        )}

        {deliverable.description && !chartSpec && (
          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground/70">
            {deliverable.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
          <span className="rounded bg-[var(--color-gold)]/10 px-1.5 py-0.5 font-mono uppercase">
            {deliverable.type}
          </span>
          {deliverable.slideCount != null && (
            <span>{deliverable.slideCount} slides</span>
          )}
          {deliverable.sourceIteration != null && (
            <span>iter {deliverable.sourceIteration}</span>
          )}
          <span>{deliverable.created}</span>
        </div>
      </div>
    </Link>
  );
}
