import type { Metadata } from "next";
import { SectionHeader } from "@/components/studio/section-header";
import { WorkflowCanvas } from "@/components/studio/workflow-canvas";
import {
  WORKFLOW_NODES,
  WORKFLOW_EDGES,
  WORKFLOW_PHASE_GROUPS,
} from "@sherpa/studio-core";
import { Position, type Node, type Edge } from "@xyflow/react";

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
      type: "workflow-phase-group",
      data: { label: group.label, phase: group.id },
      position: { x: 0, y: 0 },
      style: {
        width: 300,
        height: 200,
      },
    });
  }

  // Add workflow nodes
  for (const node of WORKFLOW_NODES) {
    // Map data-model nodeType to React Flow custom node type
    let rfType: string;
    switch (node.nodeType) {
      case "trigger":
        rfType = "workflow-trigger";
        break;
      case "decision":
        rfType = "workflow-decision";
        break;
      default:
        rfType = "workflow-stage";
        break;
    }

    const flowNode: Node = {
      id: node.id,
      data: { ...node },
      position: { x: 0, y: 0 },
      type: rfType,
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

const SIDE_TO_POSITION: Record<string, Position> = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
};

function buildFlowEdges(): Edge[] {
  return WORKFLOW_EDGES.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "data-flow",
    data: {
      edgeType: edge.edgeType,
      label: edge.label,
      ...(edge.sourceSide && {
        sourcePosition: SIDE_TO_POSITION[edge.sourceSide],
      }),
      ...(edge.targetSide && {
        targetPosition: SIDE_TO_POSITION[edge.targetSide],
      }),
    },
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
