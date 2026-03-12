import type { EndpointCatalogEntry } from "@/lib/studio";
import { getApiStats } from "@/lib/studio";
import { LevelBadge } from "./level-badge";
import { ApiMethodBadge } from "./api-method-badge";
import { HubPanel } from "./hub-panel";

/** Endpoints to feature prominently — the moat endpoints. */
const FEATURED_SLUGS = ["timing", "briefing", "current-sky"];

interface HubApiPanelProps {
  catalog: EndpointCatalogEntry[];
}

export function HubApiPanel({ catalog }: HubApiPanelProps) {
  const stats = getApiStats();
  const featured = FEATURED_SLUGS.map((slug) =>
    catalog.find((e) => e.slug === slug),
  ).filter((e): e is EndpointCatalogEntry => e !== undefined);

  return (
    <HubPanel
      variant="api"
      href="/api"
      title="REST API"
      label="API SURFACE"
      linkText="Browse endpoints"
    >
      <div className="space-y-5">
        <p className="font-heading text-lg text-foreground">
          {stats.endpointCount} endpoints
        </p>

        {/* Featured moat endpoints */}
        {featured.length > 0 && (
          <div className="space-y-2.5">
            {featured.map((entry) => (
              <div key={entry.slug} className="min-w-0">
                <div className="flex items-center gap-2">
                  <ApiMethodBadge method={entry.metadata.method} />
                  <span className="font-mono text-sm text-foreground">
                    {entry.metadata.path}
                  </span>
                  <LevelBadge level={entry.metadata.level} size="sm" />
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground/70">
                  {entry.metadata.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Stats breakdown */}
        <p className="font-mono text-xs text-muted-foreground/60">
          {stats.computationCount} computation
          <span className="mx-1.5 text-muted-foreground/30">&middot;</span>
          {stats.contentCount} content
        </p>
      </div>
    </HubPanel>
  );
}
