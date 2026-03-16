"use client";

import type { DocTreeNode, DocTreeSection, ProvenanceState } from "@sherpa/studio-core";
import { cn } from "./lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DocTreeProps {
  sections: DocTreeSection[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  /** When true, only show nodes with state === "awaiting-review" and hide empty sections. */
  reviewFilter: boolean;
}

// ---------------------------------------------------------------------------
// LED color map by ProvenanceState
// ---------------------------------------------------------------------------

const ledColors: Record<ProvenanceState, string> = {
  "awaiting-review":
    "bg-[var(--color-gold)] shadow-[0_0_4px_rgba(201,162,39,0.4)]",
  verified:
    "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]",
  stale:
    "bg-rose-400 shadow-[0_0_4px_rgba(251,113,133,0.4)]",
  "human-owned":
    "bg-muted-foreground/40",
};

// ---------------------------------------------------------------------------
// TreeNode (internal)
// ---------------------------------------------------------------------------

function TreeNode({
  node,
  selectedSlug,
  onSelect,
  depth = 0,
}: {
  node: DocTreeNode;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  depth?: number;
}) {
  const isSelected = node.slug === selectedSlug;
  const isDecision = node.provenance?.docType === "decision";
  const isHumanOwned = node.state === "human-owned";

  // Extract decision number prefix from slug (e.g. "decisions/0001-foo" -> "0001")
  const decisionPrefix = isDecision
    ? node.slug.split("/").pop()?.split("-")[0] ?? null
    : null;

  return (
    <>
      <button
        onClick={() => onSelect(node.slug)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md py-1 pr-2 text-left transition-colors",
          isSelected
            ? "border-l-2 border-[var(--color-gold)] bg-[var(--color-dark-bronze)]"
            : "border-l-2 border-transparent hover:bg-muted/50",
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {/* LED indicator */}
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            ledColors[node.state],
          )}
        />

        {/* Decision number prefix (mono font) */}
        {decisionPrefix && (
          <span className="text-[11px] font-mono text-foreground/60">
            {decisionPrefix}
          </span>
        )}

        {/* Title */}
        <span
          className={cn(
            "truncate text-sm",
            isHumanOwned ? "text-foreground/50" : "text-foreground/85",
          )}
        >
          {node.title}
        </span>
      </button>

      {/* Recurse into children at depth + 1 */}
      {node.children.map((child) => (
        <TreeNode
          key={child.slug}
          node={child}
          selectedSlug={selectedSlug}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Filtering helpers
// ---------------------------------------------------------------------------

/** Recursively filter a node tree to only include awaiting-review nodes. */
function filterAwaitingReview(nodes: DocTreeNode[]): DocTreeNode[] {
  const result: DocTreeNode[] = [];
  for (const node of nodes) {
    const filteredChildren = filterAwaitingReview(node.children);
    if (node.state === "awaiting-review" || filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// DocTree (main export)
// ---------------------------------------------------------------------------

export function DocTree({
  sections,
  selectedSlug,
  onSelect,
  reviewFilter,
}: DocTreeProps) {
  const filteredSections = reviewFilter
    ? sections
        .map((s) => ({
          ...s,
          nodes: filterAwaitingReview(s.nodes),
        }))
        .filter((s) => s.nodes.length > 0)
    : sections;

  return (
    <div className="flex flex-col gap-0.5">
      {filteredSections.map((section) => (
        <div key={section.label}>
          {/* Section header */}
          <div className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {section.label}
          </div>

          {/* Section nodes */}
          {section.nodes.map((node) => (
            <TreeNode
              key={node.slug}
              node={node}
              selectedSlug={selectedSlug}
              onSelect={onSelect}
              depth={0}
            />
          ))}
        </div>
      ))}

      {filteredSections.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-muted-foreground/40">
          No docs match filter
        </div>
      )}
    </div>
  );
}
