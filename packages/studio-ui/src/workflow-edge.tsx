"use client";

import {
  type EdgeProps,
  type Position,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import {
  WORKFLOW_EDGE_STYLES,
  type WorkflowEdgeType,
} from "@sherpa/studio-core";

// ---------------------------------------------------------------------------
// WorkflowDataFlowEdge — custom edge with glow, main path, and flow animation
// ---------------------------------------------------------------------------

function WorkflowDataFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  // Allow data to override default handle positions (for feedback loops)
  const srcPos = (data?.sourcePosition as Position) ?? sourcePosition;
  const tgtPos = (data?.targetPosition as Position) ?? targetPosition;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: srcPos,
    targetPosition: tgtPos,
  });

  const style =
    WORKFLOW_EDGE_STYLES[(data?.edgeType as WorkflowEdgeType) ?? "ideas"];

  const markerId = `marker-${id}`;

  return (
    <>
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={style.color} />
        </marker>
      </defs>

      {/* Layer 1 — Glow path */}
      <path
        d={edgePath}
        fill="none"
        stroke={style.color}
        strokeWidth={style.width * 3}
        opacity={0.1}
        strokeLinecap="round"
      />

      {/* Layer 2 — Main path */}
      <path
        d={edgePath}
        fill="none"
        stroke={style.color}
        strokeWidth={style.width}
        strokeLinecap="round"
        strokeDasharray={style.dashed ? "6 4" : undefined}
        markerEnd={`url(#${markerId})`}
      />

      {/* Layer 3 — Flow dashes (animated) */}
      {style.animated && (
        <path
          d={edgePath}
          fill="none"
          stroke={style.color}
          strokeWidth={style.width * 0.7}
          strokeDasharray="4 12"
          opacity={0.4}
          strokeLinecap="round"
          style={{ animation: "edge-flow 1.5s linear infinite" }}
        />
      )}

      {/* Label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <span
              className="rounded px-1.5 py-0.5 text-[10px] bg-[var(--color-obsidian)]"
              style={{ color: style.color, opacity: 0.7 }}
            >
              {data.label as string}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Edge type registry for ReactFlow
// ---------------------------------------------------------------------------

export const workflowEdgeTypes = {
  "data-flow": WorkflowDataFlowEdge,
};
