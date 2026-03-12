"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { LongitudeTimeSeriesPoint } from "@/lib/studio/types";

const chartConfig = {
  longitude: { label: "Saturn °", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface SaturnLongitudeChartProps {
  data: LongitudeTimeSeriesPoint[];
}

export function SaturnLongitudeChart({ data }: SaturnLongitudeChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const animationDuration = prefersReducedMotion ? 0 : 1200;

  const { chartData, crossings, recessions, ticks } = useMemo(() => {
    const chartData = data.map((d) => ({
      date: d.date,
      longitude: d.longitude,
    }));

    const crossings = data.filter((d) => d.isQuarterCross).map((d) => d.date);
    const recessions = data
      .filter((d) => d.isRecessionStart)
      .map((d) => d.date);

    // Build decade ticks — find the closest data point to each 20-year mark
    const ticks: string[] = [];
    for (let y = 1860; y <= 2020; y += 20) {
      const targetMs = new Date(`${y}-01-01`).getTime();
      const closest = data.reduce((best, d) =>
        Math.abs(new Date(d.date).getTime() - targetMs) <
        Math.abs(new Date(best.date).getTime() - targetMs)
          ? d
          : best,
      );
      if (closest && !ticks.includes(closest.date)) {
        ticks.push(closest.date);
      }
    }

    return { chartData, crossings, recessions, ticks };
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
      <ComposedChart
        data={chartData}
        margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
      >
        <defs>
          <linearGradient id="grad-longitude" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--chart-1)"
              stopOpacity={0.2}
            />
            <stop
              offset="100%"
              stopColor="var(--chart-1)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="date"
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          ticks={ticks}
          tickFormatter={(v: string) => v.slice(0, 4)}
        />
        <YAxis
          domain={[0, 360]}
          ticks={[0, 90, 180, 270, 360]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={32}
          tickFormatter={(v: number) => `${v}°`}
        />

        {/* Quarter-orbit reference lines (gold, subtle) */}
        {crossings.map((date) => (
          <ReferenceLine
            key={`cross-${date}`}
            x={date}
            stroke="var(--chart-1)"
            strokeOpacity={0.3}
            strokeDasharray="2 4"
          />
        ))}

        {/* Recession start reference lines (rose) */}
        {recessions.map((date) => (
          <ReferenceLine
            key={`rec-${date}`}
            x={date}
            stroke="rgb(251, 113, 133)"
            strokeOpacity={0.5}
            strokeWidth={1.5}
          />
        ))}

        <RechartsTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                if (name === "longitude")
                  return [`${Number(value).toFixed(1)}°`, "Saturn"];
                return [String(value), String(name)];
              }}
            />
          }
          cursor={false}
          labelFormatter={(label: string) => label}
        />

        <Area
          dataKey="longitude"
          stroke="var(--chart-1)"
          strokeWidth={1.5}
          fill="url(#grad-longitude)"
          type="monotone"
          dot={false}
          animationDuration={animationDuration}
          animationEasing="ease-out"
        />
      </ComposedChart>
    </ChartContainer>
  );
}
