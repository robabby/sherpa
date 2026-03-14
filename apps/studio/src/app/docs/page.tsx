import { Card, Text } from "@radix-ui/themes";
import Link from "next/link";
import type { Metadata } from "next";

import { SectionHeader } from "@/components/studio/section-header";

import { DocSearch } from "@/components/studio/doc-search";
import { getDocsByCategory, getResearchByTrack, type ContentFile } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Docs | Studio",
  robots: "noindex, nofollow",
};

function pathToSlug(relativePath: string): string {
  return relativePath
    .replace(/^docs\//, "")
    .replace(/^\.claude\/rules\//, "rules/")
    .replace(/\.md$/, "");
}

function DocCard({ file }: { file: ContentFile }) {
  return (
    <Link href={`/docs/${pathToSlug(file.relativePath)}`}>
      <Card className="border border-[var(--border-gold)]/30 bg-background p-4 transition-all hover:border-[var(--color-gold)]/50 hover:shadow-[0_0_20px_rgba(212,168,75,0.1)]">
        <Text size="2" weight="medium" className="text-foreground">
          {file.title}
        </Text>
        <Text size="1" className="mt-1 block font-mono text-muted-foreground">
          {file.relativePath}
        </Text>
        <Text size="1" className="mt-1 block text-muted-foreground">
          {file.lineCount} lines
        </Text>
      </Card>
    </Link>
  );
}

export default function DocsPage() {
  const docs = getDocsByCategory();
  const research = getResearchByTrack();

  // Collect all docs for search
  const allDocs = [
    ...Object.values(docs).flat(),
    ...Object.values(research).flat(),
  ];

  return (
    <div className="space-y-10">
      <DocSearch
        items={allDocs.map((f) => ({
          relativePath: f.relativePath,
          fileName: f.fileName,
          title: f.title,
        }))}
      />

      <div>
        <SectionHeader label="Research" title="Research Library" />
        {Object.entries(research).map(([track, files]) =>
          files.length > 0 ? (
            <div key={track} className="mb-6">
              <Text
                size="2"
                weight="medium"
                className="mb-3 block capitalize text-foreground"
              >
                {track.replace(/-/g, " ")}
              </Text>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <DocCard key={file.relativePath} file={file} />
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>

      {docs.plans.length > 0 && (
        <div>
          <SectionHeader label="Plans" title={`${docs.plans.length} Plans`} />
          <div className="space-y-2">
            {docs.plans.map((file) => (
              <Link
                key={file.relativePath}
                href={`/docs/${pathToSlug(file.relativePath)}`}
                className="flex items-center justify-between rounded-md border border-[var(--border-gold)]/20 px-4 py-2 hover:border-[var(--color-gold)]/40"
              >
                <Text size="2" className="text-foreground">
                  {file.title}
                </Text>
                <Text size="1" className="font-mono text-muted-foreground">
                  {file.lineCount} lines
                </Text>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(["architecture", "specs", "ux", "curation"] as const).map(
        (cat) =>
          docs[cat].length > 0 && (
            <div key={cat}>
              <SectionHeader
                label={cat}
                title={`${cat.charAt(0).toUpperCase() + cat.slice(1)} (${docs[cat].length})`}
              />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {docs[cat].map((file) => (
                  <DocCard key={file.relativePath} file={file} />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
