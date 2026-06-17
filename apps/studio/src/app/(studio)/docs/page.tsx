import type { Metadata } from "next";

import { DocsWorkspace } from "@/components/studio/docs-workspace";
import {
  getDocTree,
  getDocContent,
  getDocsByCategory,
  buildInitiativeTargetIndex,
  computeDocDrift,
} from "@/lib/studio";
import { getResearchByTrack } from "@/lib/studio";
import { markDocReviewed } from "./actions";

export const metadata: Metadata = {
  title: "Docs | Studio",
  robots: "noindex, nofollow",
};

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const { doc: selectedSlug } = await searchParams;
  const targetIndex = buildInitiativeTargetIndex();
  const sections = getDocTree(undefined, { targetIndex });

  const slug = selectedSlug ?? sections[0]?.nodes[0]?.slug ?? null;
  const rawDoc = slug ? getDocContent(slug) : null;
  const initialDoc = rawDoc
    ? { ...rawDoc, drift: computeDocDrift(rawDoc.provenance, targetIndex) }
    : null;

  const docs = getDocsByCategory();
  const research = getResearchByTrack();
  const allDocs = [
    ...Object.values(docs).flat(),
    ...Object.values(research).flat(),
  ];
  const searchItems = allDocs.map((f) => ({
    relativePath: f.relativePath,
    fileName: f.fileName,
    title: f.title,
  }));

  return (
    <DocsWorkspace
      sections={sections}
      initialDoc={initialDoc}
      initialSlug={slug}
      searchItems={searchItems}
      onMarkReviewed={markDocReviewed}
    />
  );
}
