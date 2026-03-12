import type { PrimitiveCatalogEntry } from "@/lib/studio";
import { LEVEL_NAMES, PRIMITIVE_LEVELS } from "@/lib/studio";
import { getPrimitivesStats } from "@/lib/studio";
import { LevelBadge } from "./level-badge";
import { HubPanel } from "./hub-panel";

/** Moat modules to feature prominently. */
const FEATURED_SLUGS = [
  "timing-arcs",
  "cosmic-context",
  "briefing",
  "convergence",
];

interface HubPrimitivesPanelProps {
  catalog: PrimitiveCatalogEntry[];
}

export function HubPrimitivesPanel({ catalog }: HubPrimitivesPanelProps) {
  const stats = getPrimitivesStats(catalog);
  const featured = FEATURED_SLUGS.map((slug) =>
    catalog.find((e) => e.slug === slug),
  ).filter(
    (e): e is PrimitiveCatalogEntry => e !== undefined && e.metadata !== null,
  );

  return (
    <HubPanel
      variant="primitives"
      href="/primitives"
      title="Computation Primitives"
      label="MODULE CATALOG"
      linkText="Browse catalog"
    >
      <div className="space-y-5">
        <p className="font-heading text-lg text-foreground">
          {stats.total} primitives
        </p>

        {/* Featured moat modules */}
        {featured.length > 0 && (
          <div className="space-y-2.5">
            {featured.map((entry) => (
              <div key={entry.slug} className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {entry.metadata!.name}
                  </span>
                  <LevelBadge level={entry.metadata!.level} size="sm" />
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground/70">
                  {entry.metadata!.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Per-level breakdown */}
        <p className="font-mono text-xs text-muted-foreground/60">
          {PRIMITIVE_LEVELS.map((level) => (
            <span key={level}>
              {level !== "L1" && (
                <span className="mx-1.5 text-muted-foreground/30">·</span>
              )}
              {level} {LEVEL_NAMES[level]}: {stats.perLevel[level]}
            </span>
          ))}
        </p>
      </div>
    </HubPanel>
  );
}
