import Link from "next/link";

import { cn } from "./lib/utils";
import type { EndpointCatalogEntry } from "@/lib/studio";
import { ApiMethodBadge } from "./api-method-badge";
import { LevelBadge } from "./level-badge";

interface PrimitiveApiSurfaceProps {
  endpoints: EndpointCatalogEntry[];
}

/**
 * Compact endpoint cards shown on primitive detail pages.
 * Steel blue accents — distinct from teal primitive styling.
 */
export function PrimitiveApiSurface({ endpoints }: PrimitiveApiSurfaceProps) {
  if (endpoints.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-api)]/60">
        Exposed via API ({endpoints.length})
      </h3>

      <div className="space-y-2">
        {endpoints.map((entry) => (
          <Link
            key={entry.slug}
            href={`/app/studio/api/${encodeURIComponent(entry.slug)}`}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3",
              "border-[var(--border-api)] bg-[var(--color-api)]/[0.03]",
              "transition-colors hover:border-[var(--color-api)]/40 hover:bg-[var(--color-api)]/[0.06]",
            )}
          >
            <ApiMethodBadge method={entry.metadata.method} />
            <div className="min-w-0 flex-1">
              <span className="font-mono text-sm text-foreground">
                {entry.metadata.path}
              </span>
              <p className="line-clamp-1 text-xs text-muted-foreground/60">
                {entry.metadata.name}
              </p>
            </div>
            <LevelBadge level={entry.metadata.level} size="sm" />
          </Link>
        ))}
      </div>
    </div>
  );
}
