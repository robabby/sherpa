import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProcessWorkspace } from "@/components/studio/process-workspace";

import {
  buildBranchFileTree,
  buildInitiativeFileTree,
  buildInitiativeStaleDocsIndex,
  detectLifecycle,
  getAgentRoles,
  getArchivedInitiatives,
  getBranchSeeds,
  getConventions,
  getDeliverable,
  getDeliverables,
  getInitiatives,
  getInitiativeVelocity,
  getProjectContext,
  getResearchIterations,
  getSkills,
  getWorkstreams,
} from "@/lib/studio";
import type { ChartSpec } from "@/lib/studio/types";
import {
  getProcessNodes,
  PROCESS_VIEW_KINDS,
  type ProcessSortField,
  type ProcessViewKind,
} from "@/lib/studio/process-nodes";

export const metadata: Metadata = {
  title: "Process | Studio",
  robots: "noindex, nofollow",
};

interface ProjectProcessPageProps {
  params: Promise<{ project: string }>;
  searchParams: Promise<{
    kind?: string;
    status?: string;
    sort?: string;
    q?: string;
    node?: string;
  }>;
}

const VALID_SORTS = ["updated", "alpha", "status", "kind"] as const;

export default async function ProjectProcessPage({
  params,
  searchParams,
}: ProjectProcessPageProps) {
  const { project: slug } = await params;
  const ctx = getProjectContext(slug);
  if (!ctx) notFound();

  const sp = await searchParams;

  const kind: ProcessViewKind = (
    PROCESS_VIEW_KINDS as readonly string[]
  ).includes(sp.kind ?? "")
    ? (sp.kind as ProcessViewKind)
    : "initiative-tree";

  const sort = VALID_SORTS.includes(sp.sort as ProcessSortField)
    ? (sp.sort as ProcessSortField)
    : "updated";

  // Compose active + archived initiatives for a unified view
  const archived = getArchivedInitiatives(ctx);
  const archivedCount = archived.length;
  const getAllInitiatives = () => [...getInitiatives(ctx), ...archived];

  const allNodes = getProcessNodes(
    {
      getInitiatives: getAllInitiatives,
      getWorkstreams,
      getBranchSeeds: (s) => getBranchSeeds(s, undefined, ctx),
      getSkills: () => getSkills(undefined, ctx),
      getConventions: () => getConventions(ctx),
      getResearchIterations: (s, basePath) =>
        getResearchIterations(s, basePath, ctx),
      buildInitiativeFileTree: (s, basePath, seeds, research) =>
        buildInitiativeFileTree(s, basePath, seeds, research, undefined, ctx),
      buildBranchFileTree: (seed, initSlug, parentResearch) =>
        buildBranchFileTree(seed, initSlug, parentResearch, undefined, ctx),
      getDeliverables: (basePath) => getDeliverables(basePath, ctx),
      getDeliverable: (basePath, id) => {
        const spec = getDeliverable(basePath, id, ctx);
        if (spec && spec.$schema === "wavepoint/chart@1")
          return spec as ChartSpec;
        return null;
      },
      getInitiativeVelocity: (s, opts) =>
        getInitiativeVelocity(s, opts, ctx),
      getLifecycleInfo: detectLifecycle,
    },
    ctx,
  );

  // Git-aware doc-drift, reverse-mapped to initiatives (server-side: needs git).
  // Scoped to this project's context. Serialize the Map for the client boundary.
  const staleIndex = buildInitiativeStaleDocsIndex(ctx);
  const staleDocsByInitiative = Object.fromEntries(staleIndex.byInitiative);
  const staleDocCount = staleIndex.staleDocs.length;

  return (
    <ProcessWorkspace
      allNodes={allNodes}
      initialKind={kind}
      initialStatus={sp.status ?? null}
      initialSort={sort}
      initialSearch={sp.q ?? ""}
      initialSelectedId={sp.node ?? null}
      archivedCount={archivedCount}
      agentRoles={getAgentRoles(ctx)}
      staleDocCount={staleDocCount}
      staleDocsByInitiative={staleDocsByInitiative}
    />
  );
}
