import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { DocRenderer } from "@/components/studio/doc-renderer";
import { getProject } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Docs | Studio",
  robots: "noindex, nofollow",
};

export default async function ProjectDocPage({
  params,
}: {
  params: Promise<{ project: string; slug: string[] }>;
}) {
  const { project: projectSlug, slug: slugParts } = await params;
  const project = getProject(projectSlug);
  if (!project) notFound();

  // Try slug.md first, then slug/index.md (directoturtle convention)
  const relativePath = slugParts.join("/") + ".md";
  const indexPath = slugParts.join("/") + "/index.md";
  const absPath = path.join(project.root, "docs", relativePath);
  const absIndexPath = path.join(project.root, "docs", indexPath);

  const resolvedPath = fs.existsSync(absPath)
    ? absPath
    : fs.existsSync(absIndexPath)
      ? absIndexPath
      : null;

  if (!resolvedPath) notFound();

  const raw = fs.readFileSync(resolvedPath, "utf-8");
  const { content } = matter(raw);
  const title =
    content.match(/^#\s+(.+)$/m)?.[1] ?? slugParts[slugParts.length - 1];

  // Strip leading H1 if present (we render our own)
  const body = content.replace(/^#\s+.+\n/, "").trim();

  const displayPath = `docs/${resolvedPath === absIndexPath ? indexPath : relativePath}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">{title}</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {displayPath}
        </p>
      </div>
      <DocRenderer content={body} />
    </div>
  );
}
