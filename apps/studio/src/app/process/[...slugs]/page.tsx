import { notFound } from "next/navigation";
import Link from "next/link";
import { Text } from "@radix-ui/themes";
import { CornerDownRight, ArrowUpLeft, ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/studio/section-header";
import { StudioBreadcrumb } from "@/components/studio/studio-breadcrumb";
import { StatusBadge } from "@/components/studio/status-badge";
import { DocRenderer } from "@/components/studio/doc-renderer";
import { ResearchTree } from "@/components/studio/research-tree";
import { ResearchLibrary } from "@/components/studio/research-library";
import { InitiativeContents } from "@/components/studio/initiative-contents";
import { DeliverableGrid } from "@/components/studio/deliverable-grid";
import { SlideDeck } from "@/components/studio/slide-deck";
import { ChartRenderer } from "@/components/studio/chart-renderer";
import { cn } from "@/lib/utils";
import {
  getDocument,
  listSubdirectories,
  getResearchTree,
  getResearchIterations,
  getInitiativeFilesFromPath,
  getDeliverables,
  getDeliverable,
  type ContentFile,
  type ChartSpec,
  type DeckSpec,
} from "@/lib/studio";

/**
 * Map URL slug segments to a filesystem path.
 * ["parent"] → "docs/initiatives/parent"
 * ["parent", "child"] → "docs/initiatives/parent/sub-initiatives/child"
 */
function slugsToInitiativePath(slugs: string[]): string {
  const [root, ...rest] = slugs;
  let path = `docs/initiatives/${root}`;
  for (const segment of rest) {
    path += `/sub-initiatives/${segment}`;
  }
  return path;
}

function slugToLabel(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}) {
  return params.then(({ slugs }) => ({
    title: `${slugs[slugs.length - 1]} | Process | Studio`,
    robots: "noindex, nofollow",
  }));
}

export default async function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}) {
  const { slugs } = await params;

  // Detect presentation sub-route: /process/.../present/<deliverable-id>
  const presentIndex = slugs.indexOf("present");
  if (presentIndex !== -1 && presentIndex === slugs.length - 2) {
    const initiativeSlugs = slugs.slice(0, presentIndex);
    const deliverableId = slugs[slugs.length - 1]!;
    const presentBasePath = slugsToInitiativePath(initiativeSlugs);
    const deliverable = getDeliverable(presentBasePath, deliverableId);

    if (!deliverable || deliverable.$schema !== "wavepoint/deck@1") notFound();

    const backHref = `/process/${initiativeSlugs.join("/")}`;
    return (
      <div className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[var(--color-gold)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to initiative
        </Link>
        <h1 className="font-serif text-2xl font-bold text-[var(--color-gold)]">
          {(deliverable as DeckSpec).title}
        </h1>
        {deliverable.description && (
          <p className="text-sm text-muted-foreground">
            {deliverable.description}
          </p>
        )}
        <SlideDeck spec={deliverable as DeckSpec} />
      </div>
    );
  }

  // Detect chart sub-route: /process/.../chart/<deliverable-id>
  const chartIndex = slugs.indexOf("chart");
  if (chartIndex !== -1 && chartIndex === slugs.length - 2) {
    const initiativeSlugs = slugs.slice(0, chartIndex);
    const deliverableId = slugs[slugs.length - 1]!;
    const chartBasePath = slugsToInitiativePath(initiativeSlugs);
    const deliverable = getDeliverable(chartBasePath, deliverableId);

    if (!deliverable || deliverable.$schema !== "wavepoint/chart@1") notFound();

    const chartSpec = deliverable as ChartSpec;
    const backHref = `/process/${initiativeSlugs.join("/")}`;
    return (
      <div className="space-y-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[var(--color-gold)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to initiative
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-gold)]">
            {chartSpec.title}
          </h1>
          {chartSpec.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {chartSpec.description}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--border-gold)]/20 bg-card/50 p-6">
          <ChartRenderer spec={chartSpec} />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
          <span className="rounded bg-[var(--color-gold)]/10 px-2 py-0.5 font-mono uppercase">
            {chartSpec.chartType}
          </span>
          {chartSpec.sourceIteration != null && (
            <span>Source: iteration {chartSpec.sourceIteration}</span>
          )}
          <span>Created {chartSpec.created}</span>
          <span>{chartSpec.data.length} data points</span>
          <span>{chartSpec.series.length} series</span>
        </div>
      </div>
    );
  }

  const basePath = slugsToInitiativePath(slugs);
  const leafSlug = slugs[slugs.length - 1]!;
  const isSubInitiative = slugs.length > 1;
  const depth = slugs.length;

  // Load proposal
  const doc = getDocument(`${basePath}/proposal.md`);
  if (!doc) notFound();

  const frontmatter = doc.frontmatter as Record<string, unknown>;
  const status = (frontmatter.status as string) ?? "pending";
  const type = frontmatter.type as string | undefined;
  const risk = frontmatter.risk as string | undefined;
  const targets = (frontmatter.targets as string[]) ?? [];
  const title = doc.title;

  // Load subdirectory names
  const subDirNames = listSubdirectories(basePath);

  // Load research tree scoped to this node
  const tree = getResearchTree(leafSlug, 0, 3, basePath);

  // Load research library data
  const research = getResearchIterations(leafSlug, basePath);

  // Load deliverables + full chart specs for inline previews
  const deliverables = getDeliverables(basePath);
  const chartSpecs: Record<string, ChartSpec> = {};
  for (const d of deliverables) {
    if (d.type === "chart") {
      const spec = getDeliverable(basePath, d.id);
      if (spec && spec.$schema === "wavepoint/chart@1") {
        chartSpecs[d.id] = spec as ChartSpec;
      }
    }
  }

  // Load non-research, non-sub-initiative subdirectory files for browsing
  const contentSubDirs = subDirNames.filter(
    (name: string) => name !== "research" && name !== "sub-initiatives",
  );
  const initiativeFiles: Record<string, ContentFile[]> = {};
  for (const name of contentSubDirs) {
    const files = getInitiativeFilesFromPath(basePath, name);
    if (files.length > 0) initiativeFiles[name] = files;
  }

  // Find sub-initiatives with active research
  const subInitSlugs = listSubdirectories(`${basePath}/sub-initiatives`);
  const activeSubInitiatives = subInitSlugs
    .map((subSlug: string) => {
      const subTree = getResearchTree(
        subSlug,
        0,
        0,
        `${basePath}/sub-initiatives/${subSlug}`,
      );
      if (!subTree || subTree.iterationCount === 0) return null;
      return {
        slug: subSlug,
        title: subTree.title,
        status: subTree.status,
        iterationCount: subTree.iterationCount,
        href: `/process/${slugs.join("/")}/${subSlug}`,
      };
    })
    .filter(
      (x): x is NonNullable<typeof x> => x !== null,
    );

  // Build breadcrumb chain
  const breadcrumbSegments = [
    { label: "Process", href: "/process" },
    ...slugs.map((seg: string, i: number) => {
      const isLast = i === slugs.length - 1;
      return {
        label: slugToLabel(seg),
        ...(isLast ? {} : { href: `/process/${slugs.slice(0, i + 1).join("/")}` }),
      };
    }),
  ];

  // Parent lineage for sub-initiatives (all ancestors)
  const parentSlugs = isSubInitiative ? slugs.slice(0, -1) : [];
  const immediateParentSlug = parentSlugs[parentSlugs.length - 1];
  const parentHref = isSubInitiative
    ? `/process/${parentSlugs.join("/")}`
    : null;

  return (
    <div className="space-y-8">
      <StudioBreadcrumb segments={breadcrumbSegments} />

      {/* Parent context banner for sub-initiatives */}
      {isSubInitiative && parentHref && (
        <Link
          href={parentHref}
          className="group flex items-center gap-3 rounded-lg border border-[var(--color-copper)]/20 bg-[var(--color-copper)]/[0.04] px-4 py-3 transition-colors hover:border-[var(--color-copper)]/40 hover:bg-[var(--color-copper)]/[0.07]"
        >
          <ArrowUpLeft className="h-4 w-4 shrink-0 text-[var(--color-copper)]/60 transition-colors group-hover:text-[var(--color-copper)]" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="text-muted-foreground/60">
              Sub-initiative of
            </span>
            <span className="font-medium text-foreground/80 group-hover:text-[var(--color-gold)]">
              {slugToLabel(immediateParentSlug!)}
            </span>
            {depth > 2 && (
              <span className="rounded bg-[var(--color-copper)]/10 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-copper)]/60">
                depth {depth}
              </span>
            )}
          </div>
        </Link>
      )}

      {/* Main content — left border accent for sub-initiatives */}
      <div
        className={cn(
          isSubInitiative &&
            "border-l-2 border-l-[var(--color-gold)]/30 pl-6",
        )}
      >
        <div className="space-y-8">
          <div>
            <SectionHeader
              label={isSubInitiative ? "Sub-Initiative" : "Initiative"}
              title={title}
            />
            <div className="flex flex-wrap items-center gap-2">
              {isSubInitiative && (
                <span className="mr-1 inline-flex items-center gap-1 rounded-full border border-[var(--color-copper)]/25 bg-[var(--color-copper)]/[0.06] px-2.5 py-0.5 text-xs text-[var(--color-copper)]/80">
                  <CornerDownRight className="h-3 w-3" />
                  child
                </span>
              )}
              <StatusBadge status={status} />
              {type && <StatusBadge status={type} />}
              {risk && <StatusBadge status={risk} />}
            </div>
          </div>

          {targets.length > 0 && (
            <div>
              <Text
                size="1"
                className="mb-2 block uppercase tracking-widest text-[var(--color-gold)]"
              >
                Targets
              </Text>
              <div className="space-y-1">
                {targets.map((target) => (
                  <Text
                    key={target}
                    size="2"
                    className="block font-mono text-muted-foreground"
                  >
                    {target}
                  </Text>
                ))}
              </div>
            </div>
          )}

          {Object.keys(initiativeFiles).length > 0 && (
            <div>
              <Text
                size="1"
                className="mb-2 block uppercase tracking-widest text-[var(--color-gold)]"
              >
                Contents
              </Text>
              <InitiativeContents
                slug={leafSlug}
                basePath={basePath}
                files={initiativeFiles}
              />
            </div>
          )}

          {doc && (
            <div>
              <Text
                size="1"
                className="mb-4 block uppercase tracking-widest text-[var(--color-gold)]"
              >
                Proposal
              </Text>
              <DocRenderer content={doc.content} relativePath={doc.relativePath} />
            </div>
          )}

          {/* Research tree scoped to this initiative node */}
          {tree && tree.children.length > 0 && (
            <div>
              <Text
                size="1"
                className="mb-4 block uppercase tracking-widest text-[var(--color-gold)]"
              >
                Research Tree
              </Text>
              <ResearchTree initiativeSlug={leafSlug} basePath={basePath} />
            </div>
          )}

          {/* Research library — browsable research documents */}
          {research.totalFiles > 0 && (
            <div>
              <Text
                size="1"
                className="mb-4 block uppercase tracking-widest text-[var(--color-gold)]"
              >
                Research Library
              </Text>
              <ResearchLibrary research={research} basePath={basePath} />
            </div>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div>
              <Text
                size="1"
                className="mb-4 block uppercase tracking-widest text-[var(--color-gold)]"
              >
                Deliverables
              </Text>
              <DeliverableGrid
                deliverables={deliverables}
                basePath={basePath}
                slugs={slugs}
                chartSpecs={chartSpecs}
              />
            </div>
          )}

          {/* Sub-initiative cards */}
          {activeSubInitiatives.length > 0 && (
            <div>
              <Text
                size="1"
                className="mb-4 block uppercase tracking-widest text-[var(--color-gold)]"
              >
                Sub-Initiatives
              </Text>
              <div className="grid gap-4 sm:grid-cols-2">
                {activeSubInitiatives.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={sub.href}
                    className="group rounded-lg border border-[var(--border-gold)]/20 bg-card/50 p-4 transition-colors hover:border-[var(--color-copper)]/40"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-copper)]/50" />
                      <span className="font-mono text-sm font-medium text-foreground group-hover:text-[var(--color-gold)]">
                        {sub.title}
                      </span>
                      <StatusBadge status={sub.status} className="ml-auto" />
                    </div>
                    <p className="pl-[22px] text-xs text-muted-foreground/60">
                      {sub.iterationCount} iteration
                      {sub.iterationCount !== 1 && "s"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
