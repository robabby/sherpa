"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const chartConfig = {
  pending: { label: "Pending", color: "var(--color-copper)" },
  approved: { label: "Approved", color: "#34d399" },
  "in-progress": { label: "In Progress", color: "var(--color-gold)" },
  integrated: { label: "Integrated", color: "#60a5fa" },
} satisfies ChartConfig;

interface ProcessPipelineChartProps {
  data: {
    pending: number;
    approved: number;
    "in-progress": number;
    integrated: number;
  };
}

export function ProcessPipelineChart({ data }: ProcessPipelineChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const chartData = useMemo(() => [{ name: "pipeline", ...data }], [data]);

  return (
    <ChartContainer id="studio-process-pipeline" config={chartConfig} className="h-14 w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barCategoryGap="0%"
      >
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" hide />
        <Bar
          dataKey="pending"
          stackId="pipeline"
          fill="var(--color-copper)"
          fillOpacity={0.5}
          activeBar={{ fillOpacity: 0.7 }}
          radius={[3, 0, 0, 3]}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="approved"
          stackId="pipeline"
          fill="#34d399"
          fillOpacity={0.5}
          activeBar={{ fillOpacity: 0.7 }}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="in-progress"
          stackId="pipeline"
          fill="var(--color-gold)"
          fillOpacity={0.5}
          activeBar={{ fillOpacity: 0.7 }}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="integrated"
          stackId="pipeline"
          fill="#60a5fa"
          fillOpacity={0.5}
          activeBar={{ fillOpacity: 0.7 }}
          radius={[0, 3, 3, 0]}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
        <RechartsTooltip
          content={<PipelineTooltipContent />}
          cursor={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

function PipelineTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;

  const visible = payload.filter((item) => item.value > 0);
  if (!visible.length) return null;

  return (
    <div className="rounded-lg border border-border/30 bg-card px-3 py-2 shadow-xl">
      <div className="space-y-0.5">
        {visible.map((item) => {
          const config =
            chartConfig[item.dataKey as keyof typeof chartConfig];
          return (
            <div
              key={item.dataKey}
              className="flex items-center gap-1.5 text-[11px]"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: config?.color }}
              />
              <span className="text-muted-foreground">{config?.label}</span>
              <span className="font-mono text-foreground">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
