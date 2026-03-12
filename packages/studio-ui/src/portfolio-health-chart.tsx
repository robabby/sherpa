"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const chartConfig = {
  onTrack: { label: "On Track", color: "var(--chart-1)" },
  blocked: { label: "Blocked", color: "#fb7185" },
  paused: { label: "Paused", color: "var(--chart-5)" },
} satisfies ChartConfig;

interface PortfolioHealthChartProps {
  data: { onTrack: number; blocked: number; paused: number };
}

export function PortfolioHealthChart({ data }: PortfolioHealthChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const chartData = useMemo(() => [{ name: "health", ...data }], [data]);

  return (
    <ChartContainer id="studio-portfolio-health" config={chartConfig} className="h-14 w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barCategoryGap="0%"
      >
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" hide />
        <Bar
          dataKey="onTrack"
          stackId="health"
          fill="var(--color-chart-1)"
          fillOpacity={0.5}
          activeBar={{ fillOpacity: 0.7 }}
          radius={[3, 0, 0, 3]}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="blocked"
          stackId="health"
          fill="#fb7185"
          fillOpacity={0.5}
          activeBar={{ fillOpacity: 0.7 }}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="paused"
          stackId="health"
          fill="var(--color-chart-5)"
          fillOpacity={0.5}
          activeBar={{ fillOpacity: 0.7 }}
          radius={[0, 3, 3, 0]}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
        <RechartsTooltip
          content={<HealthTooltipContent />}
          cursor={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

function HealthTooltipContent({
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
