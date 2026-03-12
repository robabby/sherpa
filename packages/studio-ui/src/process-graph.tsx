"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

import type {
  ProcessNode,
  ProcessNodeKind,
} from "@/lib/studio/process-nodes-shared";
import {
  extractEdges,
  getLocalEdges,
  getNeighborIds,
} from "@/lib/studio/process-nodes-shared";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KIND_COLORS: Record<ProcessNodeKind, string> = {
  initiative: "var(--color-gold)",
  workstream: "#4ade80", // emerald-400
  seed: "var(--color-copper)",
  skill: "#a78bfa", // violet-400
  convention: "var(--color-bronze)",
  primitive: "#60a5fa", // blue-400
};

const STATUS_OPACITY: Record<string, number> = {
  "in-progress": 1,
  active: 1,
  approved: 0.85,
  pending: 0.5,
  seed: 0.65,
  integrated: 0.4,
  completed: 0.4,
  declined: 0.3,
  paused: 0.35,
};

const EDGE_TYPE_STYLES: Record<string, { color: string; dashArray?: string }> = {
  "child-of": { color: "var(--color-gold)", dashArray: undefined },
  "workstream-of": { color: "#4ade80", dashArray: "4 2" },
  targets: { color: "var(--color-copper)", dashArray: "2 2" },
  "parent-of": { color: "var(--color-gold)", dashArray: undefined },
};

const NODE_WIDTH = 140;
const NODE_HEIGHT = 36;
const NODE_RADIUS = 6;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SimNode extends SimulationNodeDatum {
  id: string;
  kind: ProcessNodeKind;
  title: string;
  status: string;
  isCenter: boolean;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  type: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProcessGraphProps {
  allNodes: ProcessNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

export function ProcessGraph({
  allNodes,
  selectedNodeId,
  onSelectNode,
}: ProcessGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensionsRef = useRef({ width: 600, height: 400 });
  const [, forceRender] = useState(0);
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simLinks, setSimLinks] = useState<SimLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    node: SimNode;
  } | null>(null);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);

  // Measure container (store in ref, don't trigger simulation restart)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        dimensionsRef.current = {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        };
        // Re-render to pick up new dimensions for SVG viewBox
        forceRender((n) => n + 1);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Build graph data (stable — only changes when allNodes identity changes)
  const allEdges = useMemo(() => extractEdges(allNodes), [allNodes]);

  // Run force simulation — keyed on selectedNodeId only
  useEffect(() => {
    // Stop any previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
    }

    if (!selectedNodeId) {
      setSimNodes([]);
      setSimLinks([]);
      return;
    }

    const neighborIds = getNeighborIds(selectedNodeId, allEdges);
    const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
    const dims = dimensionsRef.current;

    const nodes: SimNode[] = [];
    for (const id of neighborIds) {
      const n = nodeMap.get(id);
      if (n) {
        const isCenter = n.id === selectedNodeId;
        nodes.push({
          id: n.id,
          kind: n.kind,
          title: n.title.length > 18 ? n.title.slice(0, 16) + "..." : n.title,
          status: n.status,
          isCenter,
          x: isCenter ? dims.width / 2 : undefined,
          y: isCenter ? dims.height / 2 : undefined,
          fx: isCenter ? dims.width / 2 : undefined,
          fy: isCenter ? dims.height / 2 : undefined,
        });
      }
    }

    if (nodes.length === 0) {
      setSimNodes([]);
      setSimLinks([]);
      return;
    }

    const edges = getLocalEdges(selectedNodeId, allEdges);
    const links: SimLink[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type,
    }));

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(120)
          .strength(0.8),
      )
      .force("charge", forceManyBody().strength(-300))
      .force(
        "center",
        forceCenter(dims.width / 2, dims.height / 2),
      )
      .force("collide", forceCollide(NODE_WIDTH / 2 + 10))
      .alpha(0.8)
      .alphaDecay(0.05);

    simulationRef.current = simulation;

    simulation.on("tick", () => {
      setSimNodes([...nodes]);
      setSimLinks([...links]);
    });

    // Let the simulation settle, then stop to prevent infinite ticks
    simulation.on("end", () => {
      setSimNodes([...nodes]);
      setSimLinks([...links]);
    });

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
    // Only restart when the selected node changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      onSelectNode(nodeId);
    },
    [onSelectNode],
  );

  if (!selectedNodeId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground/40">
          Select a node to see its relationships
        </p>
      </div>
    );
  }

  if (simNodes.length <= 1) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground/40">
          No connections found
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <svg
        ref={svgRef}
        width={dimensionsRef.current.width}
        height={dimensionsRef.current.height}
        className="select-none"
      >
        <defs>
          {/* Arrow markers for edges */}
          {Object.entries(EDGE_TYPE_STYLES).map(([type, style]) => (
            <marker
              key={type}
              id={`arrow-${type}`}
              viewBox="0 0 10 6"
              refX="10"
              refY="3"
              markerWidth="8"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 3 L 0 6 z" fill={style.color} opacity={0.4} />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {simLinks.map((link, i) => {
          const source = link.source as SimNode;
          const target = link.target as SimNode;
          if (!source.x || !source.y || !target.x || !target.y) return null;

          const style = EDGE_TYPE_STYLES[link.type] ?? EDGE_TYPE_STYLES["child-of"]!;

          // Calculate edge endpoints at node boundaries
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = dx / dist;
          const ny = dy / dist;

          const x1 = source.x + nx * (NODE_WIDTH / 2);
          const y1 = source.y + ny * (NODE_HEIGHT / 2);
          const x2 = target.x - nx * (NODE_WIDTH / 2 + 8);
          const y2 = target.y - ny * (NODE_HEIGHT / 2 + 8);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={style.color}
              strokeWidth={1.5}
              strokeOpacity={0.35}
              strokeDasharray={style.dashArray}
              markerEnd={`url(#arrow-${link.type})`}
            />
          );
        })}

        {/* Nodes */}
        {simNodes.map((node) => {
          if (node.x == null || node.y == null) return null;

          const color = KIND_COLORS[node.kind];
          const opacity = STATUS_OPACITY[node.status] ?? 0.6;
          const isHovered = hoveredNode === node.id;
          const isCenter = node.isCenter;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x - NODE_WIDTH / 2}, ${node.y - NODE_HEIGHT / 2})`}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                const fullNode = allNodes.find((n) => n.id === node.id);
                if (fullNode) {
                  setTooltip({
                    x: node.x!,
                    y: node.y! - NODE_HEIGHT / 2 - 8,
                    node,
                  });
                }
              }}
              onMouseLeave={() => {
                setHoveredNode(null);
                setTooltip(null);
              }}
            >
              {/* Node background */}
              <rect
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={NODE_RADIUS}
                fill={isCenter ? `color-mix(in srgb, ${color} 15%, transparent)` : "var(--card)"}
                stroke={color}
                strokeWidth={isCenter ? 2 : isHovered ? 1.5 : 1}
                strokeOpacity={isCenter ? 0.8 : isHovered ? 0.6 : opacity * 0.4}
                opacity={opacity}
              />

              {/* Kind indicator dot */}
              <circle
                cx={14}
                cy={NODE_HEIGHT / 2}
                r={4}
                fill={color}
                opacity={opacity * 0.8}
              />

              {/* Title text */}
              <text
                x={26}
                y={NODE_HEIGHT / 2 + 1}
                dominantBaseline="central"
                fontSize={11}
                fill="currentColor"
                opacity={opacity * 0.9}
                className="pointer-events-none"
              >
                {node.title}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute rounded-md border border-border/30 bg-card px-2.5 py-1.5 shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="text-xs font-medium text-foreground">
            {allNodes.find((n) => n.id === tooltip.node.id)?.title ?? tooltip.node.title}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {tooltip.node.kind} · {tooltip.node.status}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-x-3 gap-y-1 rounded-md border border-border/20 bg-card/80 px-2.5 py-1.5 backdrop-blur-sm">
        {(Object.entries(KIND_COLORS) as [ProcessNodeKind, string][])
          .filter(([kind]) =>
            simNodes.some((n) => n.kind === kind),
          )
          .map(([kind, color]) => (
            <div key={kind} className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-muted-foreground/60">
                {kind}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
