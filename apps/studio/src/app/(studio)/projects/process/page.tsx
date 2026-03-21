import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getAllInitiatives } from "@/lib/studio";
import { StatusBadge } from "@sherpa/studio-ui";

export const metadata: Metadata = {
  title: "Process — All Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function AggregateProcessPage() {
  const initiatives = getAllInitiatives();

  // Sort by updated date descending
  const sorted = [...initiatives].sort(
    (a, b) =>
      (b.initiative.updated ?? "").localeCompare(a.initiative.updated ?? ""),
  );

  const statusCounts = new Map<string, number>();
  for (const item of sorted) {
    const s = item.initiative.status;
    statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Process</h1>
        <div className="flex items-center gap-2">
          {Array.from(statusCounts.entries()).map(([status, count]) => (
            <Badge key={status} variant="secondary" className="font-mono text-[10px]">
              {status} {count}
            </Badge>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No initiatives found across any project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {sorted.map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.projectSlug}/process?node=${item.initiative.slug}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={item.initiative.status} />
                <span className="text-sm text-foreground">
                  {item.initiative.title || item.initiative.slug}
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {item.projectName}
                </Badge>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {item.initiative.updated}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
