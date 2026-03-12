import Link from "next/link";

import { cn } from "./lib/utils";
import type { PrimitiveCatalogEntry } from "@/lib/studio";
import { LevelBadge } from "./level-badge";

const STATUS_DOT: Record<string, string> = {
  stable: "bg-emerald-500",
  experimental: "bg-yellow-500",
  dormant: "bg-muted-foreground/40",
};

/** Card border opacity varies by level */
const LEVEL_BORDER_OPACITY: Record<string, string> = {
  L1: "border-[var(--color-primitive)]/12",
  L2: "border-[var(--color-primitive)]/16",
  L3: "border-[var(--color-primitive)]/22",
  L4: "border-[var(--color-primitive)]/28",
  L5: "border-[var(--color-gold)]/35",
};

const MAX_EXPORTS = 3;
const MAX_UNCATEGORIZED_EXPORTS = 5;

interface PrimitiveCardProps {
  entry: PrimitiveCatalogEntry;
  dependentCount?: number;
}

export function PrimitiveCard({ entry, dependentCount = 0 }: PrimitiveCardProps) {
  if (entry.metadata) {
    return <CuratedCard entry={entry} dependentCount={dependentCount} />;
  }
  return <UncategorizedCard entry={entry} />;
}

function CuratedCard({
  entry,
  dependentCount,
}: {
  entry: PrimitiveCatalogEntry;
  dependentCount: number;
}) {
  const meta = entry.metadata!;
  const isL5 = meta.level === "L5";
  const exports = meta.keyExports.slice(0, MAX_EXPORTS);
  const overflow = meta.keyExports.length - MAX_EXPORTS;
  const exportRatio = Math.min(meta.keyExports.length / 10, 1);

  return (
    <Link
      href={`/primitives/${encodeURIComponent(entry.slug)}`}
      className={cn(
        "group block rounded-lg border bg-card/30 p-5",
        "transition-all duration-200 hover:-translate-y-px hover:border-[var(--color-primitive)]/40",
        isL5
          ? "border-[var(--color-gold)]/35 hover:border-[var(--color-gold)]/50"
          : LEVEL_BORDER_OPACITY[meta.level] ?? "border-[var(--border-primitive)]",
      )}
    >
      {/* L5 gold gradient line */}
      {isL5 && (
        <div className="mb-3 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-gold)]/40 to-transparent" />
      )}

      {/* Top row: name + badge + status */}
      <div className="mb-2 flex items-start gap-2">
        <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
          {meta.name}
        </span>
        <LevelBadge level={meta.level} size="sm" variant={isL5 ? "gold" : "primitive"} />
        {/* Status indicator: dot + ring */}
        <span
          className={cn(
            "relative mt-1 h-[10px] w-[10px] shrink-0",
          )}
          title={meta.status}
        >
          <span className={cn(
            "absolute inset-[2px] rounded-full",
            STATUS_DOT[meta.status] ?? STATUS_DOT.dormant,
            meta.status === "experimental" && "motion-safe:animate-pulse",
          )} />
          <span className={cn(
            "absolute inset-0 rounded-full border",
            meta.status === "stable" ? "border-emerald-500/30" :
            meta.status === "experimental" ? "border-yellow-500/30" :
            "border-muted-foreground/20",
          )} />
        </span>
      </div>

      {/* Description */}
      <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
        {meta.description}
      </p>

      {/* Export count gauge */}
      <div className="mb-2">
        <svg width="60" height="8" className="overflow-visible">
          <rect x="0" y="2" width="60" height="4" rx="2" className="fill-muted-foreground/10" />
          <rect
            x="0"
            y="2"
            width={Math.max(4, 60 * exportRatio)}
            height="4"
            rx="2"
            className={isL5 ? "fill-[var(--color-gold)]/50" : "fill-[var(--color-primitive)]/50"}
          />
        </svg>
      </div>

      {/* Export chips */}
      {exports.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {exports.map((exp) => (
            <span
              key={exp}
              className="rounded border border-[var(--border-primitive)] bg-[var(--color-primitive)]/5 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-primitive)]/80"
            >
              {exp}
            </span>
          ))}
          {overflow > 0 && (
            <span className="px-1 py-0.5 font-mono text-[10px] text-muted-foreground/50">
              +{overflow}
            </span>
          )}
        </div>
      )}

      {/* Dependencies flow */}
      {(meta.dependencies.length > 0 || dependentCount > 0) && (
        <div className="mb-2 flex items-center gap-2 text-[10px] text-muted-foreground/50">
          {meta.dependencies.length > 0 && (
            <span className="flex items-center gap-1">
              {meta.dependencies.map((dep) => (
                <span
                  key={dep}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-primitive)]/30"
                  title={dep}
                />
              ))}
              <span className="ml-0.5">{meta.dependencies.length} deps</span>
            </span>
          )}
          {dependentCount > 0 && (
            <span className="text-[var(--color-primitive)]/60">
              &larr; {dependentCount} dependents
            </span>
          )}
        </div>
      )}

      {/* Source path */}
      <p className="font-mono text-[10px] text-muted-foreground/40">
        {entry.sourcePath}
      </p>
    </Link>
  );
}

function UncategorizedCard({
  entry,
}: {
  entry: PrimitiveCatalogEntry;
}) {
  const exports = entry.detectedExports.slice(
    0,
    MAX_UNCATEGORIZED_EXPORTS,
  );
  const overflow =
    entry.detectedExports.length - MAX_UNCATEGORIZED_EXPORTS;

  return (
    <Link
      href={`/primitives/${encodeURIComponent(entry.slug)}`}
      className="group block rounded-md border border-muted-foreground/10 bg-background p-3 transition-colors hover:border-muted-foreground/20"
    >
      <p className="mb-1 font-mono text-xs text-muted-foreground">
        {entry.slug}
      </p>
      <p className="mb-2 text-[11px] italic text-muted-foreground/50">
        No description
      </p>
      {exports.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {exports.map((exp) => (
            <span
              key={exp}
              className="rounded border border-muted-foreground/10 px-1 py-0.5 font-mono text-[10px] text-muted-foreground/50"
            >
              {exp}
            </span>
          ))}
          {overflow > 0 && (
            <span className="px-1 py-0.5 font-mono text-[10px] text-muted-foreground/40">
              +{overflow}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
