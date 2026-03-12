import Link from "next/link";

import { cn } from "./lib/utils";
import type { PrimitiveCatalogEntry, PrimitiveLevel } from "@/lib/studio";
import { LEVEL_NAMES } from "@/lib/studio";

interface LevelPeerStripProps {
  level: PrimitiveLevel;
  peers: PrimitiveCatalogEntry[];
}

export function LevelPeerStrip({ level, peers }: LevelPeerStripProps) {
  if (peers.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50">
        Other {level} {LEVEL_NAMES[level]} Primitives
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {peers.map((peer) => (
          <PeerCard key={peer.slug} entry={peer} />
        ))}
      </div>
    </div>
  );
}

function PeerCard({ entry }: { entry: PrimitiveCatalogEntry }) {
  const name = entry.metadata?.name ?? entry.slug;
  const description = entry.metadata?.description;

  return (
    <Link
      href={`/primitives/${encodeURIComponent(entry.slug)}`}
      className={cn(
        "flex flex-col rounded-lg border border-[var(--border-primitive)]/12 bg-card/20 px-3 py-2.5",
        "transition-colors hover:border-[var(--color-primitive)]/25",
      )}
    >
      <span className="text-xs font-medium text-foreground/80">{name}</span>
      {description && (
        <span className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground/50">
          {description}
        </span>
      )}
    </Link>
  );
}
