"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";
import {
  type WorkflowNode,
  type WorkflowEdge,
  WORKFLOW_EDGE_STYLES,
  WORKFLOW_PHASE_LABELS,
} from "@sherpa/studio-core/workflow";
import { cn } from "./lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WorkflowDetailPaneProps {
  node: WorkflowNode;
  edges: WorkflowEdge[];
  allNodes: WorkflowNode[];
}

// ---------------------------------------------------------------------------
// Section label style
// ---------------------------------------------------------------------------

const SECTION_LABEL =
  "text-xs font-medium text-muted-foreground uppercase tracking-wider";

// ---------------------------------------------------------------------------
// Node type display label
// ---------------------------------------------------------------------------

function nodeTypeLabel(nodeType: WorkflowNode["nodeType"]): string {
  switch (nodeType) {
    case "stage":
      return "Stage";
    case "decision":
      return "Decision";
    case "trigger":
      return "Trigger";
    default:
      return nodeType;
  }
}

// ---------------------------------------------------------------------------
// Copy button (inline)
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "shrink-0 rounded-md p-1 transition-colors",
        copied
          ? "text-emerald-400"
          : "text-muted-foreground/50 hover:text-muted-foreground",
      )}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowDetailPane({
  node,
  edges,
  allNodes,
}: WorkflowDetailPaneProps) {
  // Build a lookup map for node labels
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  // Filter connections
  const inbound = edges.filter((e) => e.target === node.id);
  const outbound = edges.filter((e) => e.source === node.id);

  const phaseLabel = node.phase
    ? WORKFLOW_PHASE_LABELS[node.phase]
    : "Entry Point";

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-base font-semibold text-foreground">
          {node.label}
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {phaseLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {nodeTypeLabel(node.nodeType)}
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Skill command */}
      {/* ----------------------------------------------------------------- */}
      {node.skill && (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-1.5">
            <span className={SECTION_LABEL}>Skill Command</span>
            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
              <span className="font-mono text-sm">{node.skill}</span>
              <CopyButton text={node.skill} />
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Open in Studio */}
      {/* ----------------------------------------------------------------- */}
      {node.href && (
        <>
          <div className="h-px bg-border" />
          <Link
            href={node.href}
            className="flex items-center justify-between rounded-md px-1 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <span>Open in Studio</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Connections */}
      {/* ----------------------------------------------------------------- */}
      {(inbound.length > 0 || outbound.length > 0) && (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-2">
            <span className={SECTION_LABEL}>Connections</span>
            <div className="flex flex-col gap-2">
              {inbound.map((edge) => {
                const sourceNode = nodeMap.get(edge.source);
                const style = WORKFLOW_EDGE_STYLES[edge.edgeType];
                return (
                  <div
                    key={edge.id}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: style.color }}
                    />
                    <span className="shrink-0">{"\u2190"}</span>
                    <span className="truncate">
                      {sourceNode?.label ?? edge.source}
                    </span>
                    {edge.label && (
                      <span className="shrink-0 text-xs text-muted-foreground/60">
                        ({edge.label})
                      </span>
                    )}
                  </div>
                );
              })}
              {outbound.map((edge) => {
                const targetNode = nodeMap.get(edge.target);
                const style = WORKFLOW_EDGE_STYLES[edge.edgeType];
                return (
                  <div
                    key={edge.id}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: style.color }}
                    />
                    <span className="shrink-0">{"\u2192"}</span>
                    <span className="truncate">
                      {targetNode?.label ?? edge.target}
                    </span>
                    {edge.label && (
                      <span className="shrink-0 text-xs text-muted-foreground/60">
                        ({edge.label})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Placeholder */}
      {/* ----------------------------------------------------------------- */}
      <div className="h-px bg-border" />
      <div className="rounded-lg border border-dashed border-border p-4 text-center">
        <span className="text-xs text-muted-foreground">
          Live data coming in a future release
        </span>
      </div>
    </div>
  );
}
