import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { getProject } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Research | Studio",
  robots: "noindex, nofollow",
};

interface ResearchFile {
  title: string;
  date: string;
  category: string;
  slug: string; // category/filename-without-ext
  relativePath: string;
}

function scanResearchFiles(projectRoot: string): ResearchFile[] {
  const researchDir = path.join(projectRoot, ".sherpa", "research");
  if (!fs.existsSync(researchDir)) return [];

  const files: ResearchFile[] = [];

  // Scan category subdirectories
  const entries = fs.readdirSync(researchDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      // Top-level .md files (no category)
      if (entry.name.endsWith(".md")) {
        const absPath = path.join(researchDir, entry.name);
        const raw = fs.readFileSync(absPath, "utf-8");
        const { data, content } = matter(raw);
        const title =
          data.title ??
          content.match(/^#\s+(.+)$/m)?.[1] ??
          entry.name.replace(/\.md$/, "");
        const date = data.date
          ? String(data.date)
          : entry.name.replace(/\.md$/, "");
        const slug = entry.name.replace(/\.md$/, "");
        files.push({
          title,
          date,
          category: "",
          slug,
          relativePath: entry.name,
        });
      }
      continue;
    }

    const category = entry.name;
    const catDir = path.join(researchDir, category);
    const catEntries = fs.readdirSync(catDir, { withFileTypes: true });

    for (const catEntry of catEntries) {
      if (!catEntry.isFile() || !catEntry.name.endsWith(".md")) continue;
      const absPath = path.join(catDir, catEntry.name);
      const raw = fs.readFileSync(absPath, "utf-8");
      const { data, content } = matter(raw);
      const title =
        data.title ??
        content.match(/^#\s+(.+)$/m)?.[1] ??
        catEntry.name.replace(/\.md$/, "");
      const date = data.date
        ? String(data.date)
        : catEntry.name.replace(/\.md$/, "");
      const slug = `${category}/${catEntry.name.replace(/\.md$/, "")}`;
      files.push({
        title,
        date,
        category,
        slug,
        relativePath: `${category}/${catEntry.name}`,
      });
    }
  }

  return files.sort((a, b) => b.date.localeCompare(a.date));
}

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
