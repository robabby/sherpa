import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getAllResearchFiles } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Research — All Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function AggregateResearchPage() {
  const files = getAllResearchFiles();

  // Group by category
  const grouped = new Map<string, typeof files>();
  for (const file of files) {
    const key = file.category || "General";
    const existing = grouped.get(key) ?? [];
    existing.push(file);
    grouped.set(key, existing);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-2xl text-foreground mb-6">
        Research
      </h1>

      {files.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No research files found across any project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Array.from(grouped.entries()).map(([category, categoryFiles]) => (
            <section key={category}>
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
                {category}
              </h2>
              <div className="flex flex-col gap-1">
                {categoryFiles.map((file) => (
                  <Link
                    key={`${file.projectSlug}/${file.slug}`}
                    href={`/projects/${file.projectSlug}/research/${file.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">
                        {file.title}
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {file.projectName}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {file.date}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
