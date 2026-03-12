import { cn } from "./lib/utils";
import { SCOPE_COLORS } from "@/lib/studio";

interface ScopeBadgeProps {
  scope: string;
  className?: string;
}

const DEFAULT_STYLE =
  "border-muted-foreground/30 text-muted-foreground bg-muted/50";

export function ScopeBadge({ scope, className }: ScopeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        SCOPE_COLORS[scope] ?? DEFAULT_STYLE,
        className,
      )}
    >
      {scope}
    </span>
  );
}
