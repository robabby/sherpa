import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { getProject } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Research | Studio",
  robots: "noindex, nofollow",
};

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ project: string; slug: string[] }>;
}) {
  const { project: projectSlug, slug: slugParts } = await params;
  const project = getProject(projectSlug);
  if (!project) notFound();

  const relativePath = slugParts.join("/") + ".md";
  const absPath = path.join(project.root, ".sherpa", "research", relativePath);

  if (!fs.existsSync(absPath)) notFound();

  const raw = fs.readFileSync(absPath, "utf-8");
  const { data, content } = matter(raw);
  const title =
    data.title ??
    content.match(/^#\s+(.+)$/m)?.[1] ??
    slugParts[slugParts.length - 1];

  // Strip leading H1 if present (we render our own)
  const body = content.replace(/^#\s+.+\n/, "").trim();

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">{title}</h1>
        {data.date && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {String(data.date)}
          </p>
        )}
        {data.category && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {String(data.category)}
          </p>
        )}
      </div>
      <article className="prose prose-invert prose-sm max-w-none">
        {/* Render as pre-formatted text for now — markdown renderer can be added later */}
        <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
          {body}
        </div>
      </article>
    </div>
  );
}
