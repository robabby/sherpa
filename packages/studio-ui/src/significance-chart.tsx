"use client";

import { Bar, BarChart, XAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  count: { label: "Events", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface SignificanceChartProps {
  data: { bucket: string; count: number }[];
}

export function SignificanceChart({ data }: SignificanceChartProps) {
  return (
    <ChartContainer id="significance-dist" config={chartConfig} className="min-h-[120px] w-full">
      <BarChart data={data} barCategoryGap="20%">
        <XAxis
          dataKey="bucket"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]!;
            return (
              <div className="rounded-md border border-border/50 bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
                <p className="text-muted-foreground">Score {d.payload.bucket}</p>
                <p className="font-medium text-foreground">{d.value} events</p>
              </div>
            );
          }}
        />
        <defs>
          <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <Bar
          dataKey="count"
          fill="url(#sigGrad)"
          radius={[3, 3, 0, 0]}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </BarChart>
    </ChartContainer>
  );
}
