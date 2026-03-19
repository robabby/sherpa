import { notFound } from "next/navigation";
import { Text } from "@radix-ui/themes";

import { ProvenanceHeader } from "@sherpa/studio-ui";
import { DocRenderer } from "@/components/studio/doc-renderer";
import { getDocument, getDocContent, computeState } from "@/lib/studio";
import type { Provenance, ProvenanceState } from "@/lib/studio";

// ---------------------------------------------------------------------------
// Slug resolution
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Banner stripping
// ---------------------------------------------------------------------------

/** Strip provenance markdown banner from content before rendering. */
function stripProvenanceBanner(content: string): string {
  return content
    .replace(
      /^>\s*\*\*(?:AI-generated|AI-updated|AI-extracted|Human-authored|Possibly stale|System-generated)\*\*.*(?:\n>\s*.*)*/m,
      "",
    )
    .trimStart();
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DocViewerPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const isDocsPath = slug[0] !== "rules" && slug[0] !== "claudemd";

  // Provenance-aware loading for docs/ paths
  let content: string | null = null;
  let relativePath: string | null = null;
  let provenance: Provenance | null = null;
  let provenanceState: ProvenanceState | null = null;

  if (isDocsPath) {
    const docSlug = slug.join("/");
    const result = getDocContent(docSlug);
    if (result) {
      content = result.content;
      relativePath = result.relativePath;
      provenance = result.provenance;
      provenanceState = computeState(result.provenance);
    }
  }

  // Legacy loading for non-docs paths (rules/, claudemd/) or fallback
  if (!content) {
    const resolvedPath = resolveSlugToPath(slug);
    const doc = getDocument(resolvedPath);
    if (!doc) notFound();
    content = doc.content;
    relativePath = doc.relativePath;
  }

  const showProvenance =
    provenance?.maintainedBy === "self-documenting-system" && provenanceState;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Text size="1" className="font-mono">
          {relativePath}
        </Text>
      </div>

      {showProvenance && provenance && provenanceState && (
        <ProvenanceHeader
          provenance={provenance}
          state={provenanceState}
        />
      )}

      <DocRenderer
        content={showProvenance ? stripProvenanceBanner(content) : content}
        relativePath={relativePath!}
      />
    </div>
  );
}
