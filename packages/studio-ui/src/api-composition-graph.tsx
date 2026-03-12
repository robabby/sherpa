import Link from "next/link";

import { cn } from "./lib/utils";
import type { PrimitiveCatalogEntry, PrimitiveLevel } from "@/lib/studio";
import { PRIMITIVE_LEVELS, LEVEL_NAMES } from "@/lib/studio";
import { LevelBadge } from "./level-badge";

interface ApiCompositionGraphProps {
  primitives: PrimitiveCatalogEntry[];
  endpointLevel: PrimitiveLevel;
}

/**
 * Visual showing composed primitives layered by abstraction level.
 * L1 at bottom → L5 at top. The endpoint's own level is highlighted.
 */
export function ApiCompositionGraph({
  primitives,
  endpointLevel,
}: ApiCompositionGraphProps) {
  if (primitives.length === 0) return null;

  // Group primitives by level
  const byLevel = new Map<PrimitiveLevel | "unknown", PrimitiveCatalogEntry[]>();
  for (const p of primitives) {
    const level = p.level ?? "unknown";
    const existing = byLevel.get(level);
    if (existing) {
      existing.push(p);
    } else {
      byLevel.set(level, [p]);
    }
  }

  // Only show levels that have primitives, ordered L5 → L1 (top to bottom)
  const activeLevels = [...PRIMITIVE_LEVELS]
    .reverse()
    .filter((l) => byLevel.has(l));

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50">
        Composition ({primitives.length} primitives)
      </h3>

      <div className="space-y-2">
        {activeLevels.map((level) => {
          const entries = byLevel.get(level) ?? [];
          const isEndpointLevel = level === endpointLevel;

          return (
            <div
              key={level}
              className={cn(
                "rounded-lg border px-4 py-3",
                isEndpointLevel
                  ? "border-[var(--color-api)]/30 bg-[var(--color-api)]/[0.04]"
                  : "border-[var(--border-primitive)]/15 bg-card/20",
              )}
            >
              {/* Level label */}
              <div className="mb-2 flex items-center gap-2">
                <LevelBadge level={level} size="sm" />
                <span className="text-[10px] text-muted-foreground/40">
                  {LEVEL_NAMES[level]}
                </span>
                {isEndpointLevel && (
                  <span className="rounded bg-[var(--color-api)]/10 px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-api)]">
                    endpoint output
                  </span>
                )}
              </div>

              {/* Primitive chips */}
              <div className="flex flex-wrap gap-1.5">
                {entries.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/primitives/${encodeURIComponent(entry.slug)}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors",
                      "border-[var(--border-primitive)] bg-[var(--color-primitive)]/5",
                      "text-[var(--color-primitive)] hover:bg-[var(--color-primitive)]/10",
                    )}
                  >
                    <span className="font-medium">
                      {String(entry.metadata?.name ?? entry.slug)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* Unknown level primitives (shouldn't happen but handle gracefully) */}
        {byLevel.has("unknown") && (
          <div className="rounded-lg border border-dashed border-muted-foreground/15 px-4 py-3">
            <div className="mb-2 text-[10px] text-muted-foreground/40">
              Uncategorized
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(byLevel.get("unknown") ?? []).map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/primitives/${encodeURIComponent(entry.slug)}`}
                  className="inline-flex items-center rounded border border-muted-foreground/15 px-2 py-1 font-mono text-xs text-muted-foreground/60 hover:border-muted-foreground/25"
                >
                  {entry.slug}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Flow indicator */}
      <p className="text-center font-mono text-[10px] text-muted-foreground/30">
        L1 raw positions → L{endpointLevel.slice(1)} {LEVEL_NAMES[endpointLevel].toLowerCase()} output
      </p>
    </div>
  );
}
