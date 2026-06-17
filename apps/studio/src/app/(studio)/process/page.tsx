import type { Metadata } from "next";

import { ProcessWorkspace } from "@/components/studio/process-workspace";

import { archiveInitiative, restoreInitiative, updateNodeStatus } from "./actions";
import { runPostApproval } from "./post-approval";
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

interface ProcessPageProps {
  searchParams: Promise<{
    kind?: string;
    status?: string;
    sort?: string;
    q?: string;
    node?: string;
  }>;
}

const VALID_SORTS = ["updated", "alpha", "status", "kind"] as const;

export default async function ProcessPage({ searchParams }: ProcessPageProps) {
  const params = await searchParams;

  const kind: ProcessViewKind = (PROCESS_VIEW_KINDS as readonly string[]).includes(
    params.kind ?? "",
  )
    ? (params.kind as ProcessViewKind)
    : "initiative-tree";

  const sort = VALID_SORTS.includes(params.sort as ProcessSortField)
    ? (params.sort as ProcessSortField)
    : "updated";

  // Compose active + archived initiatives for a unified view
  const archived = getArchivedInitiatives();
  const archivedCount = archived.length;
  const getAllInitiatives = () => [...getInitiatives(), ...archived];

  const allNodes = getProcessNodes({
    getInitiatives: getAllInitiatives,
    getWorkstreams,
    getBranchSeeds,
    getSkills,
    getConventions,
    getResearchIterations,
    buildInitiativeFileTree,
    buildBranchFileTree,
    getDeliverables,
    getDeliverable: (basePath, id) => {
      const spec = getDeliverable(basePath, id);
      if (spec && spec.$schema === "wavepoint/chart@1") return spec as ChartSpec;
      return null;
    },
    getInitiativeVelocity,
    getLifecycleInfo: detectLifecycle,
  });

  // Git-aware doc-drift, reverse-mapped to initiatives (server-side: needs git).
  // Serialize the Map to a plain object for the client boundary.
  const staleIndex = buildInitiativeStaleDocsIndex();
  const staleDocsByInitiative = Object.fromEntries(staleIndex.byInitiative);
  const staleDocCount = staleIndex.staleDocs.length;

  return (
    <ProcessWorkspace
      allNodes={allNodes}
      initialKind={kind}
      initialStatus={params.status ?? null}
      initialSort={sort}
      initialSearch={params.q ?? ""}
      initialSelectedId={params.node ?? null}
      onNodeStatusChange={updateNodeStatus}
      onPostApproval={runPostApproval}
      onArchive={archiveInitiative}
      onRestore={restoreInitiative}
      archivedCount={archivedCount}
      agentRoles={getAgentRoles()}
      staleDocCount={staleDocCount}
      staleDocsByInitiative={staleDocsByInitiative}
    />
  );
}
