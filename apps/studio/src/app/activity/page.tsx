import type { Metadata } from "next";

import { ActivityFullTimeline } from "@/components/studio/activity-full-timeline";
import { ActivityStatsBar } from "@/components/studio/activity-stats-bar";
import { ScopeFilterBar } from "@/components/studio/scope-filter-bar";
import { SectionHeader } from "@/components/studio/section-header";
import { StudioBreadcrumb } from "@/components/studio/studio-breadcrumb";
import { getPortfolio, processActivityData } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Activity | Studio",
  robots: "noindex, nofollow",
};

interface Props {
  searchParams: Promise<{ scope?: string }>;
}

export default async function ActivityPage({ searchParams }: Props) {
  const params = await searchParams;
  const portfolio = getPortfolio();
  const scopeFilter = params.scope ?? null;
  const { dateGroups, scopeCounts, stats } = processActivityData(
    portfolio.recentActivity,
    scopeFilter,
  );

  return (
    <div className="space-y-8">
      <StudioBreadcrumb segments={[{ label: "Activity" }]} />

      <SectionHeader
        label="Timeline"
        title={
          scopeFilter
            ? `${stats.filteredCount} ${scopeFilter} entries`
            : `${stats.totalCount} Activity Entries`
        }
      />

      <ActivityStatsBar stats={stats} isFiltered={scopeFilter !== null} />

      <ScopeFilterBar
        scopeCounts={scopeCounts}
        activeScope={scopeFilter}
        totalCount={stats.totalCount}
      />

      <ActivityFullTimeline dateGroups={dateGroups} />
    </div>
  );
}
