import Link from "next/link";

import { cn } from "./lib/utils";
import { SCOPE_COLORS } from "@/lib/studio";

interface ScopeFilterBarProps {
  scopeCounts: Record<string, number>;
  activeScope: string | null;
  totalCount: number;
}

export function ScopeFilterBar({
  scopeCounts,
  activeScope,
  totalCount,
}: ScopeFilterBarProps) {
  const sortedScopes = Object.entries(scopeCounts).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {/* "All" pill */}
      <Link
        href="/app/studio/activity"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
          activeScope === null
            ? "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
            : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40",
        )}
      >
        All
        <span className="text-muted-foreground/60">{totalCount}</span>
      </Link>

      {sortedScopes.map(([scope, count]) => {
        const isActive = activeScope === scope;
        const colorClasses = SCOPE_COLORS[scope];

        return (
          <Link
            key={scope}
            href={`/app/studio/activity?scope=${scope}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive && colorClasses
                ? colorClasses
                : isActive
                  ? "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                  : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40",
            )}
          >
            {scope}
            <span className="text-muted-foreground/60">{count}</span>
          </Link>
        );
      })}
    </div>
  );
}
