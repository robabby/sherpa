// Shared types, constants, and pure logic for ProcessNode.
// Safe to import from both server and client components.

// ---------------------------------------------------------------------------
// ProcessNode — unified model for the workspace
// ---------------------------------------------------------------------------

export const PROCESS_NODE_KINDS = [
  "initiative",
  "workstream",
  "seed",
  "skill",
  "convention",
  "primitive",
] as const;

export type ProcessNodeKind = (typeof PROCESS_NODE_KINDS)[number];

// View kinds extend node kinds with composite views
export const PROCESS_VIEW_KINDS = [
  "initiative-tree",
  ...PROCESS_NODE_KINDS,
] as const;

export type ProcessViewKind = (typeof PROCESS_VIEW_KINDS)[number];

export const VIEW_KIND_LABELS: Record<ProcessViewKind, string> = {
  "initiative-tree": "Initiatives",
  initiative: "Init",
  workstream: "Workstreams",
  seed: "Seeds",
  skill: "Skills",
  convention: "Conventions",
  primitive: "Primitives",
};

export const KIND_LABELS: Record<ProcessNodeKind, string> = {
  initiative: "Initiatives",
  workstream: "Workstreams",
  seed: "Seeds",
  skill: "Skills",
  convention: "Conventions",
  primitive: "Primitives",
};

export interface ProcessNode {
  id: string;
  kind: ProcessNodeKind;
  title: string;
  status: string;
  created: string;
  updated: string;
  parent: string | null;
  source: string;
  summary: string | null;
  childCount: number;
  metadata: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// FileTreeNode — initiative directory tree for the detail pane
// ---------------------------------------------------------------------------

export type FileTreeAnnotation =
  | "proposal"
  | "plan"
  | "research-index"
  | "synthesis"
  | "vector"
  | "seed"
  | "sub-initiative"
  | "deliverable";

export interface FileTreeNode {
  name: string;
  relativePath: string;
  type: "file" | "directory";
  exists: boolean;
  status?: string;
  title?: string;
  linkedNodeId?: string;
  annotation?: FileTreeAnnotation;
  children: FileTreeNode[];
  meta?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Graph — edges extracted from node relationships
// ---------------------------------------------------------------------------

export type EdgeType =
  | "parent-of"
  | "child-of"
  | "workstream-of"
  | "depends-on"
  | "targets";

export interface GraphEdge {
  source: string; // node ID
  target: string; // node ID
  type: EdgeType;
}

/**
 * Extract all edges from a set of ProcessNodes.
 * Builds bidirectional parent/child, workstream→initiative, and initiative→target edges.
 */
export function extractEdges(nodes: ProcessNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    // Parent relationship
    if (node.parent && nodeIds.has(node.parent)) {
      edges.push({ source: node.id, target: node.parent, type: "child-of" });
    }

    // Workstream → initiative
    if (node.kind === "workstream" && node.metadata.initiative) {
      const initSlug = (node.metadata.initiative as string).split("/")[0];
      const initId = `initiative/${initSlug}`;
      if (nodeIds.has(initId)) {
        edges.push({ source: node.id, target: initId, type: "workstream-of" });
      }
    }

    // Initiative → dependency initiatives
    if (node.kind === "initiative" && Array.isArray(node.metadata.dependencies)) {
      for (const depSlug of node.metadata.dependencies as string[]) {
        const depId = `initiative/${depSlug}`;
        if (nodeIds.has(depId)) {
          edges.push({ source: node.id, target: depId, type: "depends-on" });
        }
      }
    }
  }

  return edges;
}

/**
 * Get edges connected to a specific node (1-hop neighborhood).
 */
export function getLocalEdges(
  nodeId: string,
  allEdges: GraphEdge[],
): GraphEdge[] {
  return allEdges.filter((e) => e.source === nodeId || e.target === nodeId);
}

/**
 * Get all node IDs in the 1-hop neighborhood of a node.
 */
export function getNeighborIds(
  nodeId: string,
  allEdges: GraphEdge[],
): Set<string> {
  const ids = new Set<string>([nodeId]);
  for (const edge of allEdges) {
    if (edge.source === nodeId) ids.add(edge.target);
    if (edge.target === nodeId) ids.add(edge.source);
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Tree list — initiatives with seeds nested underneath
// ---------------------------------------------------------------------------

export interface TreeListItem {
  node: ProcessNode;
  depth: number;
}

/**
 * Build a flat list where seeds appear indented under their parent initiative.
 * Initiatives without seeds still appear. Seeds without a matching parent
 * fall to the end at depth 0.
 */
export function buildInitiativeSeedTree(
  nodes: ProcessNode[],
  sort: ProcessSortField,
): TreeListItem[] {
  const initiatives = nodes.filter((n) => n.kind === "initiative");
  const seeds = nodes.filter((n) => n.kind === "seed");

  // Group seeds by parent initiative ID
  const seedsByParent = new Map<string, ProcessNode[]>();
  const orphanSeeds: ProcessNode[] = [];
  for (const seed of seeds) {
    if (seed.parent) {
      const existing = seedsByParent.get(seed.parent) ?? [];
      existing.push(seed);
      seedsByParent.set(seed.parent, existing);
    } else {
      orphanSeeds.push(seed);
    }
  }

  // Sort initiatives
  const sorted = applySortOnly(initiatives, sort);

  const items: TreeListItem[] = [];
  for (const init of sorted) {
    items.push({ node: init, depth: 0 });
    const childSeeds = seedsByParent.get(init.id);
    if (childSeeds) {
      const sortedSeeds = applySortOnly(childSeeds, sort);
      for (const seed of sortedSeeds) {
        items.push({ node: seed, depth: 1 });
      }
    }
  }

  // Append orphan seeds at root level
  for (const seed of orphanSeeds) {
    items.push({ node: seed, depth: 0 });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export type ProcessSortField = "updated" | "alpha" | "status" | "kind";

export interface ProcessFilters {
  kind: ProcessNodeKind | null;
  status: string | null;
  search: string;
  sort: ProcessSortField;
}

const STATUS_ORDER: Record<string, number> = {
  "in-progress": 0,
  active: 1,
  approved: 2,
  pending: 3,
  seed: 4,
  integrated: 5,
  completed: 6,
  declined: 7,
  paused: 8,
  archived: 9,
};

function applySortOnly(
  nodes: ProcessNode[],
  sort: ProcessSortField,
): ProcessNode[] {
  const result = [...nodes];
  switch (sort) {
    case "alpha":
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "status":
      result.sort((a, b) => {
        const aOrder = STATUS_ORDER[a.status] ?? 99;
        const bOrder = STATUS_ORDER[b.status] ?? 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return b.updated.localeCompare(a.updated);
      });
      break;
    case "updated":
    default:
      result.sort((a, b) => b.updated.localeCompare(a.updated));
      break;
  }
  return result;
}

export function applyFilters(
  nodes: ProcessNode[],
  filters: ProcessFilters,
): ProcessNode[] {
  let result = nodes;

  if (filters.kind) {
    result = result.filter((n) => n.kind === filters.kind);
  }

  if (filters.status) {
    result = result.filter((n) => n.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.summary && n.summary.toLowerCase().includes(q)),
    );
  }

  switch (filters.sort) {
    case "alpha":
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "status":
      result = [...result].sort((a, b) => {
        const aOrder = STATUS_ORDER[a.status] ?? 99;
        const bOrder = STATUS_ORDER[b.status] ?? 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return b.updated.localeCompare(a.updated);
      });
      break;
    case "kind":
      result = [...result].sort((a, b) => {
        const aIdx = PROCESS_NODE_KINDS.indexOf(a.kind);
        const bIdx = PROCESS_NODE_KINDS.indexOf(b.kind);
        if (aIdx !== bIdx) return aIdx - bIdx;
        return b.updated.localeCompare(a.updated);
      });
      break;
    case "updated":
    default:
      result = [...result].sort((a, b) =>
        b.updated.localeCompare(a.updated),
      );
      break;
  }

  return result;
}
