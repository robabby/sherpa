import { notFound } from "next/navigation";
import { Text } from "@radix-ui/themes";

import { DocRenderer } from "@/components/studio/doc-renderer";
import { SectionHeader } from "@/components/studio/section-header";

import { getDocument, getConventions } from "@/lib/studio";

function resolveConventionSlug(slug: string): string | null {
  // Convention rules: slug matches filename without .md
  const rulePath = `.claude/rules/${slug}.md`;

  // CLAUDE.md files: claudemd-CLAUDE -> CLAUDE.md, claudemd-apps-web-CLAUDE -> apps/web/CLAUDE.md
  if (slug.startsWith("claudemd-")) {
    const pathPart = slug
      .replace(/^claudemd-/, "")
      .replace(/-/g, "/")
      .replace(/CLAUDE$/, "CLAUDE.md");
    return pathPart;
  }

  return rulePath;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `${slug} | Conventions | Studio`,
    robots: "noindex, nofollow",
  };
}

export default async function ConventionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const relativePath = resolveConventionSlug(slug);
  if (!relativePath) notFound();

  const doc = getDocument(relativePath);
  if (!doc) notFound();

  // Check if this is a rule to show additional metadata
  const { rules } = getConventions();
  const rule = rules.find((r) => r.fileName === `${slug}.md`);

  return (
    <div className="space-y-6">
      <SectionHeader
        label={rule ? "Rule" : "CLAUDE.md"}
        title={doc.title}
      />

      {rule && (
        <div className="flex items-center gap-4">
          <Text size="1" className="font-mono text-muted-foreground">
            {doc.relativePath}
          </Text>
          <div className="flex flex-wrap gap-1">
            {rule.alwaysApply && (
              <span className="inline-flex items-center rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-2 py-0.5 text-xs text-[var(--color-gold)]">
                always
              </span>
            )}
            {rule.globs.map((glob) => (
              <span
                key={glob}
                className="inline-flex items-center rounded-full border border-muted-foreground/30 px-2 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {glob}
              </span>
            ))}
          </div>
        </div>
      )}

      <DocRenderer content={doc.content} relativePath={doc.relativePath} />
    </div>
  );
}
