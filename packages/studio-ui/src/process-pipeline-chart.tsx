import { cn } from "./lib/utils";

interface ProcessPipelineChartProps {
  data: {
    pending: number;
    approved: number;
    "in-progress": number;
    integrated: number;
  };
}

const segments: {
  key: keyof ProcessPipelineChartProps["data"];
  color: string;
  label: string;
}[] = [
  { key: "pending", color: "bg-[var(--color-copper)]/50", label: "Pending" },
  { key: "approved", color: "bg-emerald-400/50", label: "Approved" },
  { key: "in-progress", color: "bg-[var(--color-gold)]/50", label: "In Progress" },
  { key: "integrated", color: "bg-blue-400/50", label: "Integrated" },
];

export function ProcessPipelineChart({ data }: ProcessPipelineChartProps) {
  const total = data.pending + data.approved + data["in-progress"] + data.integrated;
  if (total === 0) return null;

  return (
    <div
      className="flex h-3 w-full overflow-hidden rounded-full"
      role="img"
      aria-label={`Pipeline: ${segments.map((s) => `${s.label} ${data[s.key]}`).join(", ")}`}
    >
      {segments.map((seg, i) => {
        const value = data[seg.key];
        if (value === 0) return null;
        const pct = (value / total) * 100;
        return (
          <div
            key={seg.key}
            className={cn(
              seg.color,
              i === 0 && "rounded-l-full",
              i === segments.length - 1 && "rounded-r-full"
            )}
            style={{ width: `${pct}%` }}
            title={`${seg.label}: ${value}`}
          />
        );
      })}
    </div>
  );
}
