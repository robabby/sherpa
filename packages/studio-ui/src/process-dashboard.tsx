import { Text } from "@radix-ui/themes";

import { LifecyclePipeline } from "./lifecycle-pipeline";
import { ProcessPipelineChart } from "./process-pipeline-chart";
import type { ProcessDashboardStats, Initiative } from "@/lib/studio";

interface ProcessDashboardProps {
  stats: ProcessDashboardStats;
  initiatives: Initiative[];
}

const STAT_ITEMS: {
  key: keyof Pick<ProcessDashboardStats, "totalInitiatives" | "activeWorkstreams" | "totalIterations" | "totalOpenQuestions">;
  label: string;
}[] = [
  { key: "totalInitiatives", label: "Initiatives" },
  { key: "activeWorkstreams", label: "Active Workstreams" },
  { key: "totalIterations", label: "Research Iterations" },
  { key: "totalOpenQuestions", label: "Open Questions" },
];

export function ProcessDashboard({ stats, initiatives }: ProcessDashboardProps) {
  const pipelineData = {
    pending: stats.statusCounts["pending"] ?? 0,
    approved: stats.statusCounts["approved"] ?? 0,
    "in-progress": stats.statusCounts["in-progress"] ?? 0,
    integrated: stats.statusCounts["integrated"] ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border border-[var(--border-gold)] bg-card/50 px-4 py-3"
          >
            <Text className="block font-mono text-2xl font-semibold text-[var(--color-gold)]">
              {stats[item.key]}
            </Text>
            <Text size="1" className="uppercase tracking-widest text-muted-foreground">
              {item.label}
            </Text>
          </div>
        ))}
      </div>

      {/* Pipeline visualizations */}
      <div className="space-y-4">
        <LifecyclePipeline initiatives={initiatives} />
        <ProcessPipelineChart data={pipelineData} />
      </div>
    </div>
  );
}
