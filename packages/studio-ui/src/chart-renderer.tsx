"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { ChartSpec } from "@/lib/studio/types";

interface ChartRendererProps {
  spec: ChartSpec;
  className?: string;
  compact?: boolean;
}

export function ChartRenderer({ spec, className, compact }: ChartRendererProps) {
  const prefersReducedMotion = useReducedMotion();
  const animationDuration = prefersReducedMotion ? 0 : 1200;

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const s of spec.series) {
      config[s.key] = { label: s.label, color: s.color };
    }
    return config;
  }, [spec.series]);

  const margin = compact
    ? { top: 4, right: 4, bottom: 4, left: 4 }
    : { top: 8, right: 16, bottom: 8, left: 16 };

  const xAxisProps = {
    dataKey: spec.xAxis?.dataKey ?? "name",
    hide: spec.xAxis?.hide ?? false,
    tick: { fill: "var(--muted-foreground)", fontSize: compact ? 10 : 12 },
    axisLine: false,
    tickLine: false,
  };

  const isRadial = spec.chartType === "radar" || spec.chartType === "pie";
  const defaultHeight = compact
    ? "min-h-[140px]"
    : isRadial
      ? "min-h-[400px] !aspect-square"
      : "min-h-[220px]";

  function renderChart() {
    switch (spec.chartType) {
      case "bar":
        return (
          <BarChart
            data={spec.data}
            layout={spec.layout ?? "vertical"}
            margin={margin}
          >
            <XAxis {...(spec.layout === "horizontal" ? xAxisProps : { type: "number" as const, hide: true })} />
            <YAxis
              {...(spec.layout === "horizontal"
                ? { hide: true }
                : { ...xAxisProps, type: "category" as const })}
            />
            <RechartsTooltip content={<ChartTooltipContent />} cursor={false} />
            {spec.legend && <Legend content={<ChartLegendContent />} />}
            {spec.series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={`var(--color-${s.key})`}
                fillOpacity={0.6}
                activeBar={{ fillOpacity: 0.85 }}
                stackId={s.stackId}
                radius={[3, 3, 3, 3]}
                animationDuration={animationDuration}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={spec.data} margin={margin}>
            <XAxis {...xAxisProps} />
            <RechartsTooltip content={<ChartTooltipContent />} cursor={false} />
            {spec.legend && <Legend content={<ChartLegendContent />} />}
            {spec.series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
                dot={false}
                type={s.type ?? "monotone"}
                animationDuration={animationDuration}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={spec.data} margin={margin}>
            <defs>
              {spec.series.map((s) => (
                <linearGradient
                  key={`grad-${s.key}`}
                  id={`grad-${spec.id}-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={`var(--color-${s.key})`}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor={`var(--color-${s.key})`}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <XAxis {...xAxisProps} />
            <RechartsTooltip content={<ChartTooltipContent />} cursor={false} />
            {spec.legend && <Legend content={<ChartLegendContent />} />}
            {spec.series.map((s) => (
              <Area
                key={s.key}
                dataKey={s.key}
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
                fill={`url(#grad-${spec.id}-${s.key})`}
                type={s.type ?? "monotone"}
                animationDuration={animationDuration}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart margin={margin}>
            <Pie
              data={spec.data}
              dataKey={spec.series[0]?.key ?? "value"}
              nameKey={spec.xAxis?.dataKey ?? "name"}
              cx="50%"
              cy="50%"
              outerRadius={compact ? 50 : "70%"}
              animationDuration={animationDuration}
              animationEasing="ease-out"
            >
              {spec.data.map((_, i) => (
                <Cell
                  key={i}
                  fill={spec.series[i % spec.series.length]?.color ?? `var(--chart-${(i % 5) + 1})`}
                  fillOpacity={0.7}
                />
              ))}
            </Pie>
            <RechartsTooltip content={<ChartTooltipContent />} cursor={false} />
            {spec.legend && <Legend content={<ChartLegendContent />} />}
          </PieChart>
        );

      case "radar":
        return (
          <RadarChart
            data={spec.data}
            cx="50%"
            cy="50%"
            outerRadius={compact ? 50 : "70%"}
            margin={compact ? margin : { top: 24, right: 48, bottom: 24, left: 48 }}
          >
            <PolarGrid stroke="var(--border)" strokeOpacity={0.3} />
            <PolarAngleAxis
              dataKey={spec.xAxis?.dataKey ?? "name"}
              tick={{ fill: "var(--muted-foreground)", fontSize: compact ? 9 : 11 }}
            />
            {spec.series.map((s) => (
              <Radar
                key={s.key}
                dataKey={s.key}
                stroke={`var(--color-${s.key})`}
                fill={`var(--color-${s.key})`}
                fillOpacity={0.15}
                animationDuration={animationDuration}
                animationEasing="ease-out"
              />
            ))}
            <RechartsTooltip content={<ChartTooltipContent />} cursor={false} />
            {spec.legend && <Legend content={<ChartLegendContent />} />}
          </RadarChart>
        );
    }
  }

  return (
    <ChartContainer
      id={`deliverable-${spec.id}`}
      config={chartConfig}
      className={className ?? `${defaultHeight} w-full`}
    >
      {renderChart()}
    </ChartContainer>
  );
}
