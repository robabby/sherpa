import type { ActivityStats } from "@/lib/studio";

interface ActivityStatsBarProps {
  stats: ActivityStats;
  isFiltered: boolean;
}

function formatShortDate(dateStr: string): string {
  const parsed = new Date(dateStr + "T00:00:00");
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ActivityStatsBar({
  stats,
  isFiltered,
}: ActivityStatsBarProps) {
  return (
    <div className="flex items-center divide-x divide-[var(--border-gold)]/20 rounded-lg border border-[var(--border-gold)]/20 bg-card/30">
      {/* Entry count */}
      <div className="px-5 py-3">
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Entries
        </div>
        <div className="text-sm font-medium text-foreground">
          {isFiltered
            ? `${stats.filteredCount} / ${stats.totalCount}`
            : stats.totalCount}
        </div>
      </div>

      {/* Date range */}
      {stats.dateRange && (
        <div className="px-5 py-3">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Date Range
          </div>
          <div className="text-sm font-medium text-foreground">
            {formatShortDate(stats.dateRange.first)}
            {" \u2013 "}
            {formatShortDate(stats.dateRange.last)}
          </div>
        </div>
      )}

      {/* Most active scope (hidden when filtered) */}
      {!isFiltered && stats.topScope && (
        <div className="px-5 py-3">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Most Active
          </div>
          <div className="text-sm font-medium text-foreground">
            {stats.topScope.name}{" "}
            <span className="text-muted-foreground">
              ({stats.topScope.count})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
