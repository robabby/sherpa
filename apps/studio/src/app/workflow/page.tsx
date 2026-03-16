import type { Metadata } from "next";
import { SectionHeader } from "@/components/studio/section-header";
import { WorkflowCanvas } from "@/components/studio/workflow-canvas";
import {
  WORKFLOW_NODES,
  WORKFLOW_EDGES,
  WORKFLOW_PHASE_GROUPS,
} from "@sherpa/studio-core";
import type { Node, Edge } from "@xyflow/react";

export const metadata: Metadata = {
  title: "Workflow | Studio",
  robots: "noindex, nofollow",
};

function buildFlowNodes(): Node[] {
  const nodes: Node[] = [];

  // Add phase group nodes first (parents must come before children)
  for (const group of WORKFLOW_PHASE_GROUPS) {
    nodes.push({
      id: `group-${group.id}`,
      type: "group", // built-in xyflow group type for now
      data: { label: group.label },
      position: { x: 0, y: 0 },
      style: {
        width: 300,
        height: 200,
        backgroundColor: "rgba(212, 165, 116, 0.02)",
        border: "1px solid rgba(212, 165, 116, 0.08)",
        borderRadius: "12px",
      },
    });
  }

  // Add workflow nodes
  for (const node of WORKFLOW_NODES) {
    const flowNode: Node = {
      id: node.id,
      data: { ...node },
      position: { x: 0, y: 0 },
      type: "default", // will be replaced with custom types in Task 4
    };

    // If node belongs to a phase, set parentId
    if (node.phase) {
      flowNode.parentId = `group-${node.phase}`;
      flowNode.extent = "parent";
    }

    nodes.push(flowNode);
  }

  return nodes;
}

function buildFlowEdges(): Edge[] {
  return WORKFLOW_EDGES.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label ?? undefined,
    type: "smoothstep", // will be replaced with custom edge in Task 5
    data: { edgeType: edge.edgeType, label: edge.label },
  }));
}

export default function WorkflowPage() {
  const nodes = buildFlowNodes();
  const edges = buildFlowEdges();

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      <SectionHeader label="Process" title="Product Workflow" />
      <div className="flex-1 min-h-0 rounded-lg border border-[var(--color-gold)]/10 overflow-hidden">
        <WorkflowCanvas initialNodes={nodes} initialEdges={edges} />
      </div>
    </div>
  );
}
