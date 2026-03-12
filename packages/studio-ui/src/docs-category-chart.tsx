"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const chartConfig = {
  count: { label: "Docs", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface DocsCategoryChartProps {
  data: Array<{ category: string; count: number }>;
}

export function DocsCategoryChart({ data }: DocsCategoryChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const chartData = useMemo(() => data, [data]);

  return (
    <ChartContainer id="studio-docs-category" config={chartConfig} className="h-20 w-full">
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        barCategoryGap="25%"
      >
        <XAxis
          dataKey="category"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 10,
            fill: "var(--color-dim, hsl(var(--muted-foreground) / 0.4))",
          }}
        />
        <Bar
          dataKey="count"
          fill="var(--color-chart-4)"
          fillOpacity={0.35}
          activeBar={{ fillOpacity: 0.7 }}
          radius={[2, 2, 0, 0]}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
        <RechartsTooltip
          content={<CategoryTooltipContent />}
          cursor={{ fill: "hsl(var(--muted) / 0.1)" }}
        />
      </BarChart>
    </ChartContainer>
  );
}

function CategoryTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { category: string; count: number } }>;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-border/30 bg-card px-3 py-2 shadow-xl">
      <p className="text-[11px] text-foreground">
        {item.category}: {item.count}
      </p>
    </div>
  );
}
