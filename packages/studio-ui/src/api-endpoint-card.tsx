import Link from "next/link";

import { cn } from "./lib/utils";
import type { EndpointCatalogEntry } from "@/lib/studio";
import { LevelBadge } from "./level-badge";
import { ApiMethodBadge } from "./api-method-badge";

interface ApiEndpointCardProps {
  entry: EndpointCatalogEntry;
}

export function ApiEndpointCard({ entry }: ApiEndpointCardProps) {
  const { metadata } = entry;
  const isHighLevel = metadata.level === "L3" || metadata.level === "L5";

  return (
    <Link
      href={`/api/${encodeURIComponent(entry.slug)}`}
      className={cn(
        "group block rounded-lg border bg-card/30 p-5",
        "transition-all duration-200 hover:-translate-y-px",
        isHighLevel
          ? "border-[var(--color-api)]/30 hover:border-[var(--color-api)]/50 hover:shadow-[0_0_16px_var(--glow-api)]"
          : "border-[var(--color-api)]/15 hover:border-[var(--color-api)]/35",
      )}
    >
      {/* Top row: method + path + level */}
      <div className="mb-2 flex items-start gap-2">
        <ApiMethodBadge method={metadata.method} />
        <span className="min-w-0 flex-1 font-mono text-sm text-foreground">
          {metadata.path}
        </span>
        <LevelBadge level={metadata.level} size="sm" />
      </div>

      {/* Name + description */}
      <p className="mb-1 text-sm font-medium text-foreground">
        {metadata.name}
      </p>
      <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
        {metadata.description}
      </p>

      {/* Auth + primitive chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {metadata.auth === "required" && (
          <span className="rounded border border-muted-foreground/20 bg-muted-foreground/5 px-1.5 py-0.5 text-[10px] text-muted-foreground/60">
            auth
          </span>
        )}
        {metadata.primitives.slice(0, 3).map((slug) => (
          <span
            key={slug}
            className="rounded border border-[var(--border-primitive)] bg-[var(--color-primitive)]/5 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-primitive)]/80"
          >
            {slug}
          </span>
        ))}
        {metadata.primitives.length > 3 && (
          <span className="px-1 py-0.5 font-mono text-[10px] text-muted-foreground/50">
            +{metadata.primitives.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}
