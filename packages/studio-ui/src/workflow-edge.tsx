"use client";

import { useEffect, useRef } from "react";
import {
  type EdgeProps,
  type Position,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import {
  WORKFLOW_EDGE_STYLES,
  type WorkflowEdgeType,
} from "@sherpa/studio-core/workflow";

// ---------------------------------------------------------------------------
// WorkflowDataFlowEdge — custom edge with glow, main path, flow animation,
// and particle dots (Layer 4) for data-flow visualization
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

  const flowEnabled = (data?.flowEnabled as boolean) ?? true;

  const markerId = `marker-${id}`;

  // Refs for particle animation (direct DOM manipulation, no React state)
  const pathRef = useRef<SVGPathElement>(null);
  const particle1Ref = useRef<SVGCircleElement>(null);
  const particle2Ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!style.particles || !flowEnabled) return;
    const pathEl = pathRef.current;
    const p1 = particle1Ref.current;
    if (!pathEl || !p1) return;

    const totalLength = pathEl.getTotalLength();
    const p2 = particle2Ref.current; // may be null for short paths
    let offset = 0;
    let lastTime = 0;
    let frameId: number;

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const dt = (time - lastTime) / 1000; // seconds
      lastTime = time;

      offset = (offset + style.particleSpeed * dt) % totalLength;

      const pt1 = pathEl.getPointAtLength(offset);
      p1.setAttribute("cx", String(pt1.x));
      p1.setAttribute("cy", String(pt1.y));

      if (p2 && totalLength > 200) {
        const pt2 = pathEl.getPointAtLength(
          (offset + totalLength / 2) % totalLength,
        );
        p2.setAttribute("cx", String(pt2.x));
        p2.setAttribute("cy", String(pt2.y));
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [style.particles, style.particleSpeed, edgePath, flowEnabled]);

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
        ref={style.particles ? pathRef : undefined}
        d={edgePath}
        fill="none"
        stroke={style.color}
        strokeWidth={style.width}
        strokeLinecap="round"
        strokeDasharray={style.dashed ? "6 4" : undefined}
        markerEnd={`url(#${markerId})`}
      />

      {/* Layer 3 — Flow dashes (animated, hidden when flow disabled) */}
      {style.animated && flowEnabled && (
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

      {/* Layer 4 — Particle dots (animated via rAF, hidden when flow disabled) */}
      {style.particles && flowEnabled && (
        <>
          <circle
            ref={particle1Ref}
            r={3}
            fill={style.color}
            opacity={0.8}
          />
          <circle
            ref={particle2Ref}
            r={2}
            fill={style.color}
            opacity={0.5}
          />
        </>
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
