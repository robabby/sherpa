import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProject, scanResearchFiles } from "@/lib/studio";
import type { ResearchFile } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Research | Studio",
  robots: "noindex, nofollow",
};

export default async function ProjectResearchPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const files = scanResearchFiles(project.root);

  // Group by category
  const grouped = new Map<string, ResearchFile[]>();
  for (const file of files) {
    const key = file.category || "General";
    const existing = grouped.get(key) ?? [];
    existing.push(file);
    grouped.set(key, existing);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-2xl text-foreground mb-6">Research</h1>

      {files.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No research files found in .sherpa/research/
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([category, categoryFiles]) => (
            <section key={category}>
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
                {category}
              </h2>
              <div className="space-y-1">
                {categoryFiles.map((file) => (
                  <Link
                    key={file.slug}
                    href={`/projects/${slug}/research/${file.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
                  >
                    <span className="text-sm text-foreground">
                      {file.title}
                    </span>
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
