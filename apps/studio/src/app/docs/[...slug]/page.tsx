import { notFound } from "next/navigation";
import { Text } from "@radix-ui/themes";

import { StudioBreadcrumb } from "@/components/studio/studio-breadcrumb";
import { DocRenderer } from "@/components/studio/doc-renderer";
import { getDocument } from "@/lib/studio";

function resolveSlugToPath(slug: string[]): string {
  const joined = slug.join("/");
  // Rules shorthand: rules/foo -> .claude/rules/foo.md
  if (slug[0] === "rules") {
    return `.claude/rules/${slug.slice(1).join("/")}.md`;
  }
  // CLAUDE.md files: claudemd/apps/web -> apps/web/CLAUDE.md
  if (slug[0] === "claudemd") {
    return `${slug.slice(1).join("/")}/CLAUDE.md`;
  }
  // Default: docs/ prefix
  return `docs/${joined}.md`;
}

function slugToSegments(
  slug: string[]
): { label: string; href?: string }[] {
  return [
    { label: "Docs", href: "/docs" },
    ...slug.map((s, i) => ({
      label: s.replace(/-/g, " "),
      href:
        i < slug.length - 1
          ? `/docs/${slug.slice(0, i + 1).join("/")}`
          : undefined,
    })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return {
    title: `${slug[slug.length - 1]} | Docs | Studio`,
    robots: "noindex, nofollow",
  };
}

export default async function DocViewerPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const relativePath = resolveSlugToPath(slug);
  const doc = getDocument(relativePath);
  if (!doc) notFound();

  return (
    <div className="space-y-6">
      <StudioBreadcrumb segments={slugToSegments(slug)} />

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Text size="1" className="font-mono">
          {doc.relativePath}
        </Text>
        <Text size="1">{doc.lineCount} lines</Text>
      </div>

      <DocRenderer content={doc.content} relativePath={doc.relativePath} />
    </div>
  );
}
