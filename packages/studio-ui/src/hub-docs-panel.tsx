import Link from "next/link";

import type { ContentFile, DocCategory } from "@/lib/studio";
import { DocsCategoryChart } from "./docs-category-chart";
import { HubPanel } from "./hub-panel";

interface HubDocsPanelProps {
  docsByCategory: Record<DocCategory, ContentFile[]>;
}

const CATEGORY_LABELS: Record<DocCategory, string> = {
  research: "Research",
  plans: "Plans",
  architecture: "Architecture",
  specs: "Specs",
  ux: "UX",
  curation: "Curation",
};

export function HubDocsPanel({ docsByCategory }: HubDocsPanelProps) {
  // Total doc count
  const totalDocs = Object.values(docsByCategory).reduce(
    (sum, files) => sum + files.length,
    0
  );
  const categoryCount = Object.values(docsByCategory).filter(
    (files) => files.length > 0
  ).length;

  // Recently updated: 3 most recently modified docs across all categories
  const allDocs = Object.entries(docsByCategory).flatMap(
    ([category, files]) =>
      files.map((f) => ({ ...f, category: category as DocCategory }))
  );
  const recentDocs = allDocs
    .filter((d) => d.lastModified)
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
    .slice(0, 3);

  // Research tracks count
  const researchFiles = docsByCategory.research ?? [];
  const researchDirs = new Set(
    researchFiles
      .map((f) => {
        const parts = f.relativePath.split("/");
        // docs/research/<track>/file.md → track
        return parts.length > 3 ? parts[2] : null;
      })
      .filter(Boolean)
  );
  const activeTrackCount = researchDirs.size;

  return (
    <HubPanel
      variant="docs"
      href="/app/studio/docs"
      title="Knowledge Base"
      label="DOCUMENTATION"
      linkText="Browse docs"
    >
      <div className="space-y-5">
        {/* Depth line (hero) */}
        <p className="font-heading text-lg text-foreground">
          {totalDocs} docs across {categoryCount} categories
        </p>

        {/* Recently updated */}
        {recentDocs.length > 0 && (
          <div className="space-y-2">
            {recentDocs.map((doc) => (
              <div
                key={doc.relativePath}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={docPath(doc.relativePath)}
                    className="block truncate text-sm font-medium text-foreground transition-colors hover:text-[var(--color-bronze)]"

                  >
                    {doc.title}
                  </Link>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {CATEGORY_LABELS[doc.category] ?? doc.category}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground/60">
                  {formatShortDate(doc.lastModified)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Category chart */}
        {totalDocs > 0 && (
          <DocsCategoryChart
            data={(Object.keys(CATEGORY_LABELS) as DocCategory[])
              .filter((cat) => (docsByCategory[cat]?.length ?? 0) > 0)
              .map((cat) => ({
                category: CATEGORY_LABELS[cat],
                count: docsByCategory[cat]?.length ?? 0,
              }))}
          />
        )}

        {/* Research tracks */}
        {activeTrackCount > 0 && (
          <p className="pl-2 text-xs text-muted-foreground/60">
            {activeTrackCount} active research track
            {activeTrackCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </HubPanel>
  );
}

/**
 * Convert a relative docs path to a Studio doc viewer URL.
 * e.g. "docs/architecture/platform-strategy.md" → "/app/studio/docs/architecture/platform-strategy"
 */
function docPath(relativePath: string): string {
  return (
    "/app/studio/docs/" +
    relativePath
      .replace(/^docs\//, "")
      .replace(/\.md$/, "")
  );
}

function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
