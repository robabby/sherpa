"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";
import { useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// ELK layout helper
// ---------------------------------------------------------------------------

interface ElkNode {
  id: string;
  width: number;
  height: number;
  children?: ElkNode[];
  layoutOptions?: Record<string, string>;
}

interface ElkEdge {
  id: string;
  sources: string[];
  targets: string[];
}

interface ElkGraph {
  id: string;
  layoutOptions: Record<string, string>;
  children: ElkNode[];
  edges: ElkEdge[];
}

interface ElkResult {
  children?: Array<{
    id: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    children?: Array<{
      id: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    }>;
  }>;
}

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 50;
const GROUP_PADDING = 40;

async function computeElkLayout(
  nodes: Node[],
  edges: Edge[]
): Promise<Node[]> {
  const ELK = (await import("elkjs/lib/elk.bundled.js")).default;
  const elk = new ELK();

  // Separate group (parent) nodes from child nodes
  const groupNodes = nodes.filter((n) => n.type === "group");
  const childNodes = nodes.filter((n) => n.type !== "group");

  // Build a map of group id -> child elk nodes
  const groupChildMap = new Map<string, ElkNode[]>();
  for (const g of groupNodes) {
    groupChildMap.set(g.id, []);
  }

  const topLevelChildren: ElkNode[] = [];

  for (const node of childNodes) {
    const elkNode: ElkNode = {
      id: node.id,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    };

    if (node.parentId && groupChildMap.has(node.parentId)) {
      groupChildMap.get(node.parentId)!.push(elkNode);
    } else {
      topLevelChildren.push(elkNode);
    }
  }

  // Build group elk nodes with their children
  for (const g of groupNodes) {
    const children = groupChildMap.get(g.id) || [];
    topLevelChildren.push({
      id: g.id,
      width: 0, // ELK computes from children
      height: 0,
      children,
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "DOWN",
        "elk.padding": `[top=${GROUP_PADDING},left=${GROUP_PADDING},bottom=${GROUP_PADDING},right=${GROUP_PADDING}]`,
        "elk.spacing.nodeNode": "30",
        "elk.layered.spacing.nodeNodeBetweenLayers": "40",
      },
    });
  }

  // Build elk edges — only include edges between top-level nodes or within the same group
  const elkEdges: ElkEdge[] = edges.map((e) => ({
    id: e.id,
    sources: [e.source],
    targets: [e.target],
  }));

  const graph: ElkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "50",
      "elk.layered.spacing.nodeNodeBetweenLayers": "60",
    },
    children: topLevelChildren,
    edges: elkEdges,
  };

  const result = (await elk.layout(graph)) as ElkResult;

  // Build a position map from ELK results
  const positionMap = new Map<
    string,
    { x: number; y: number; width?: number; height?: number }
  >();

  for (const child of result.children || []) {
    positionMap.set(child.id, {
      x: child.x ?? 0,
      y: child.y ?? 0,
      width: child.width,
      height: child.height,
    });

    // Process nested children (nodes inside groups)
    if (child.children) {
      for (const nested of child.children) {
        // These positions are already relative to the parent group
        positionMap.set(nested.id, {
          x: nested.x ?? 0,
          y: nested.y ?? 0,
          width: nested.width,
          height: nested.height,
        });
      }
    }
  }

  // Map positions back to xyflow nodes
  return nodes.map((node) => {
    const pos = positionMap.get(node.id);
    if (!pos) return node;

    const updated = {
      ...node,
      position: { x: pos.x, y: pos.y },
    };

    // For group nodes, update their dimensions from ELK
    if (node.type === "group" && pos.width && pos.height) {
      updated.style = {
        ...node.style,
        width: pos.width,
        height: pos.height,
      };
    }

    return updated;
  });
}

// ---------------------------------------------------------------------------
// Inner component (needs useReactFlow, must be inside ReactFlowProvider)
// ---------------------------------------------------------------------------

interface WorkflowCanvasInnerProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

function WorkflowCanvasInner({
  initialNodes,
  initialEdges,
}: WorkflowCanvasInnerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  const runLayout = useCallback(async () => {
    try {
      const positioned = await computeElkLayout(initialNodes, initialEdges);
      setNodes(positioned);
      // Small delay to let React render the positioned nodes before fitting
      requestAnimationFrame(() => {
        fitView({ padding: 0.1 });
      });
    } catch (err) {
      console.error("[WorkflowCanvas] ELK layout failed:", err);
    }
  }, [initialNodes, initialEdges, setNodes, fitView]);

  useEffect(() => {
    runLayout();
  }, [runLayout]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      minZoom={0.1}
      maxZoom={2}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="rgba(212,165,116,0.15)"
      />
      <Controls />
    </ReactFlow>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface WorkflowCanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export function WorkflowCanvas({
  initialNodes,
  initialEdges,
}: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <div className="flex-1 min-h-0" style={{ height: "100%" }}>
        <WorkflowCanvasInner
          initialNodes={initialNodes}
          initialEdges={initialEdges}
        />
      </div>
    </ReactFlowProvider>
  );
}
