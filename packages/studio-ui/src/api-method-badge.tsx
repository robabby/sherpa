import { cn } from "./lib/utils";

const METHOD_STYLES = {
  GET: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  POST: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
} as const;

interface ApiMethodBadgeProps {
  method: "GET" | "POST";
  className?: string;
}

export function ApiMethodBadge({ method, className }: ApiMethodBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold",
        METHOD_STYLES[method],
        className,
      )}
    >
      {method}
    </span>
  );
}
