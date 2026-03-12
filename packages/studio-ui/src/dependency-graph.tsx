import Link from "next/link";

import { cn } from "./lib/utils";
import type { PrimitiveCatalogEntry } from "@/lib/studio";
import { LevelBadge } from "./level-badge";

interface DependencyGraphProps {
  dependencies: PrimitiveCatalogEntry[];
  dependents: PrimitiveCatalogEntry[];
  isCurated: boolean;
}

export function DependencyGraph({
  dependencies,
  dependents,
  isCurated,
}: DependencyGraphProps) {
  if (!isCurated) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/15 p-4">
        <p className="text-xs italic text-muted-foreground/40">
          Dependencies unknown — module not yet annotated
        </p>
      </div>
    );
  }

  const hasDeps = dependencies.length > 0;
  const hasDependents = dependents.length > 0;

  if (!hasDeps && !hasDependents) {
    return (
      <div className="rounded-lg border border-[var(--border-primitive)]/10 p-4">
        <p className="text-xs text-muted-foreground/40">
          No dependencies — foundational module
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Depends On */}
      {hasDeps && (
        <div>
          <h4 className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50">
            Depends On ({dependencies.length})
          </h4>
          <div className="space-y-1.5">
            {dependencies.map((dep) => (
              <DepMiniCard
                key={dep.slug}
                entry={dep}
                direction="upstream"
              />
            ))}
          </div>
        </div>
      )}

      {/* Used By */}
      {hasDependents && (
        <div>
          <h4 className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50">
            Used By ({dependents.length})
          </h4>
          <div className="space-y-1.5">
            {dependents.map((dep) => (
              <DepMiniCard
                key={dep.slug}
                entry={dep}
                direction="downstream"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DepMiniCard({
  entry,
  direction,
}: {
  entry: PrimitiveCatalogEntry;
  direction: "upstream" | "downstream";
}) {
  const name = entry.metadata?.name ?? entry.slug;
  const level = entry.metadata?.level;
  const arrow = direction === "upstream" ? "\u2192" : "\u2190";

  return (
    <Link
      href={`/app/studio/primitives/${encodeURIComponent(entry.slug)}`}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-[var(--border-primitive)]/15 bg-card/20 px-3 py-2",
        "transition-colors hover:border-[var(--color-primitive)]/30",
      )}
    >
      <span className="font-mono text-[10px] text-muted-foreground/40">
        {arrow}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/80">
        {name}
      </span>
      {level && <LevelBadge level={level} size="sm" />}
    </Link>
  );
}
