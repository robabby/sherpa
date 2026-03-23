import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { generateShareToken } from "@sherpa/studio-core";
import { DocRenderer } from "@/components/studio/doc-renderer";
import { ResearchRating } from "@/components/studio/research-rating";
import { ShareLinkButton } from "@/components/studio/share-link-button";
import { env } from "@/env";
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
  const rating = data.rating === 1 || data.rating === -1 ? (data.rating as 1 | -1) : null;

  const shareToken = generateShareToken(
    env.BETTER_AUTH_SECRET,
    projectSlug,
    relativePath,
  );
  const shareUrl = `${env.BETTER_AUTH_URL}/s/${shareToken}`;

  // Strip leading H1 if present (we render our own)
  const body = content.replace(/^#\s+.+\n/, "").trim();

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-foreground">{title}</h1>
          <ResearchRating
            projectSlug={projectSlug}
            filePath={relativePath}
            initialRating={rating}
          />
          <ShareLinkButton shareUrl={shareUrl} />
        </div>
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
      <DocRenderer content={body} />
    </div>
  );
}
