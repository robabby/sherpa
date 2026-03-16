"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";
import { useEffect, useCallback, useState, useRef } from "react";
import {
  WORKFLOW_NODES,
  WORKFLOW_EDGES,
  WORKFLOW_EDGE_TYPES,
  type WorkflowEdgeType,
} from "@sherpa/studio-core/workflow";
import { workflowNodeTypes } from "./workflow-nodes";
import { workflowEdgeTypes } from "./workflow-edge";
import { ResizeHandle } from "./resize-handle";
import { WorkflowDetailPane } from "./workflow-detail-pane";
import { WorkflowLegend } from "./workflow-legend";
import { WorkflowToolbar } from "./workflow-toolbar";

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

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 56;
const GROUP_PADDING = 50;

async function computeElkLayout(
  nodes: Node[],
  edges: Edge[]
): Promise<Node[]> {
  const ELK = (await import("elkjs/lib/elk.bundled.js")).default;
  const elk = new ELK();

  // Separate group (parent) nodes from child nodes
  const groupNodes = nodes.filter((n) => n.type === "group" || n.type === "workflow-phase-group");
  const childNodes = nodes.filter((n) => n.type !== "group" && n.type !== "workflow-phase-group");

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
        "elk.padding": `[top=${GROUP_PADDING + 10},left=${GROUP_PADDING},bottom=${GROUP_PADDING},right=${GROUP_PADDING}]`,
        "elk.spacing.nodeNode": "40",
        "elk.layered.spacing.nodeNodeBetweenLayers": "50",
        "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
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
      "elk.spacing.nodeNode": "80",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.separateConnectedComponents": "false",
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
    if ((node.type === "group" || node.type === "workflow-phase-group") && pos.width && pos.height) {
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

const LAYOUT_STORAGE_KEY = "workflow-layout";

interface WorkflowCanvasInnerProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  hiddenEdgeTypes: Set<WorkflowEdgeType>;
  flowEnabled: boolean;
  onNodeClick?: (_: React.MouseEvent, node: Node) => void;
  onPaneClick?: () => void;
  onResetLayoutRef?: React.MutableRefObject<(() => void) | null>;
}

function WorkflowCanvasInner({
  initialNodes,
  initialEdges,
  hiddenEdgeTypes,
  flowEnabled,
  onNodeClick,
  onPaneClick,
  onResetLayoutRef,
}: WorkflowCanvasInnerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  // Filter edges by hidden types, inject flowEnabled into edge data
  const visibleEdges = edges
    .filter(
      (e) => !hiddenEdgeTypes.has(e.data?.edgeType as WorkflowEdgeType),
    )
    .map((e) => ({
      ...e,
      data: { ...e.data, flowEnabled },
    }));

  // Save node positions to localStorage on drag end
  const onNodeDragStop = useCallback(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    for (const node of nodes) {
      positions[node.id] = { x: node.position.x, y: node.position.y };
    }
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(positions));
  }, [nodes]);

  // Run ELK layout (used on mount and reset)
  const runElkLayout = useCallback(async () => {
    try {
      const positioned = await computeElkLayout(initialNodes, initialEdges);
      setNodes(positioned);
      requestAnimationFrame(() => {
        fitView({ padding: 0.1 });
      });
    } catch (err) {
      console.error("[WorkflowCanvas] ELK layout failed:", err);
    }
  }, [initialNodes, initialEdges, setNodes, fitView]);

  // Reset layout: clear saved positions and re-run ELK
  const resetLayout = useCallback(() => {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    runElkLayout();
  }, [runElkLayout]);

  // Expose resetLayout to parent via ref
  useEffect(() => {
    if (onResetLayoutRef) {
      onResetLayoutRef.current = resetLayout;
    }
  }, [onResetLayoutRef, resetLayout]);

  // On mount: restore saved positions or run ELK
  useEffect(() => {
    const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (savedLayout) {
      try {
        const positions = JSON.parse(savedLayout) as Record<string, { x: number; y: number }>;
        const currentIds = new Set(initialNodes.map((n) => n.id));
        const savedIds = new Set(Object.keys(positions));
        const match = [...currentIds].every((id) => savedIds.has(id));

        if (match) {
          const positioned = initialNodes.map((n) => ({
            ...n,
            position: positions[n.id] ?? n.position,
          }));
          setNodes(positioned);
          setTimeout(() => fitView({ padding: 0.1 }), 50);
          return;
        }
      } catch {
        // Invalid saved data, fall through to ELK
      }
    }
    runElkLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={visibleEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onNodeDragStop={onNodeDragStop}
      onPaneClick={onPaneClick}
      nodeTypes={workflowNodeTypes}
      edgeTypes={workflowEdgeTypes}
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
      <MiniMap
        position="bottom-right"
        nodeColor={(node) => {
          if (node.type === "workflow-phase-group")
            return "rgba(212, 165, 116, 0.1)";
          const phase = (node.data as Record<string, unknown>)?.phase;
          if (phase === "audit") return "#8b7355";
          if (phase === "morning-review") return "#c49a6c";
          return "#d4a574";
        }}
        maskColor="rgba(0, 0, 0, 0.7)"
        style={{ backgroundColor: "rgba(8, 8, 10, 0.85)" }}
        pannable
        zoomable
      />
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailWidth, setDetailWidth] = useState(360);
  const resetLayoutRef = useRef<(() => void) | null>(null);

  // Flow animation toggle — persisted to localStorage
  const [flowEnabled, setFlowEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("workflow-flow-enabled") !== "false";
  });

  const toggleFlow = useCallback(() => {
    setFlowEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("workflow-flow-enabled", String(next));
      return next;
    });
  }, []);

  // Hidden edge types — persisted to localStorage
  const [hiddenEdgeTypes, setHiddenEdgeTypes] = useState<Set<WorkflowEdgeType>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem('workflow-hidden-edges');
    return saved ? new Set(JSON.parse(saved) as WorkflowEdgeType[]) : new Set();
  });

  const toggleEdgeType = useCallback((type: WorkflowEdgeType) => {
    setHiddenEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      localStorage.setItem('workflow-hidden-edges', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const showAllEdgeTypes = useCallback(() => {
    setHiddenEdgeTypes(new Set());
    localStorage.removeItem('workflow-hidden-edges');
  }, []);

  const hideAllEdgeTypes = useCallback(() => {
    const all = new Set(WORKFLOW_EDGE_TYPES as readonly WorkflowEdgeType[]);
    setHiddenEdgeTypes(all);
    localStorage.setItem('workflow-hidden-edges', JSON.stringify([...all]));
  }, []);

  // Hydrate width from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("workflow-detail-width");
    if (saved) setDetailWidth(Number(saved));
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Escape key to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedNodeId(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Look up the selected WorkflowNode from canonical data
  const selectedNode = selectedNodeId
    ? WORKFLOW_NODES.find((n) => n.id === selectedNodeId) ?? null
    : null;

  return (
    <ReactFlowProvider>
      <div className="flex flex-1 min-h-0" style={{ height: "100%" }}>
        <div className="relative flex-1 min-w-0">
          <WorkflowCanvasInner
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            hiddenEdgeTypes={hiddenEdgeTypes}
            flowEnabled={flowEnabled}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onResetLayoutRef={resetLayoutRef}
          />
          <div className="absolute top-3 right-3 z-10">
            <WorkflowLegend
              hiddenTypes={hiddenEdgeTypes}
              onToggleType={toggleEdgeType}
              onShowAll={showAllEdgeTypes}
              onHideAll={hideAllEdgeTypes}
            />
          </div>
          <div className="absolute bottom-3 left-3 z-10">
            <WorkflowToolbar
              flowEnabled={flowEnabled}
              onToggleFlow={toggleFlow}
              onResetLayout={() => resetLayoutRef.current?.()}
            />
          </div>
        </div>
        {selectedNode && (
          <>
            <ResizeHandle
              onResize={(delta) =>
                setDetailWidth((w) => Math.max(200, Math.min(500, w - delta)))
              }
              onResizeEnd={() =>
                localStorage.setItem(
                  "workflow-detail-width",
                  String(detailWidth),
                )
              }
            />
            <div
              className="shrink-0 overflow-y-auto border-l border-[var(--color-dark-bronze)]"
              style={{ width: detailWidth }}
            >
              <WorkflowDetailPane
                node={selectedNode}
                edges={WORKFLOW_EDGES}
                allNodes={WORKFLOW_NODES}
              />
            </div>
          </>
        )}
      </div>
    </ReactFlowProvider>
  );
}
