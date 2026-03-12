"use client";

import {
  PROCESS_VIEW_KINDS,
  type ProcessNode,
  type ProcessViewKind,
} from "@/lib/studio/process-nodes-shared";
import { cn } from "./lib/utils";

import { ProcessKindIcon } from "./process-kind-icon";

/** Short labels that fit under rail icons. */
const VIEW_SHORT_LABELS: Record<ProcessViewKind, string> = {
  "initiative-tree": "Init",
  initiative: "Init",
  workstream: "Work",
  seed: "Seeds",
  skill: "Skills",
  convention: "Rules",
  primitive: "Prims",
};

/** Which node kinds contribute to each view kind's count. */
function viewKindCount(kind: ProcessViewKind, counts: Record<string, number>): number {
  if (kind === "initiative-tree") {
    return (counts["initiative"] ?? 0) + (counts["seed"] ?? 0);
  }
  return counts[kind] ?? 0;
}

/** View kinds that are hidden in the rail (subsumed by the tree view). */
const HIDDEN_VIEW_KINDS = new Set<ProcessViewKind>(["initiative", "seed"]);

interface ProcessKindRailProps {
  allNodes: ProcessNode[];
  activeKind: ProcessViewKind;
  onKindChange: (kind: ProcessViewKind) => void;
}

export function ProcessKindRail({
  allNodes,
  activeKind,
  onKindChange,
}: ProcessKindRailProps) {
  const kindCounts: Record<string, number> = {};
  for (const node of allNodes) {
    kindCounts[node.kind] = (kindCounts[node.kind] ?? 0) + 1;
  }

  return (
    <div className="flex h-full w-16 flex-col items-center gap-1 border-r border-[var(--color-dark-bronze)] bg-[var(--color-warm-charcoal)] py-3">
      {PROCESS_VIEW_KINDS.map((kind) => {
        if (HIDDEN_VIEW_KINDS.has(kind)) return null;
        const count = viewKindCount(kind, kindCounts);
        if (count === 0) return null;
        const isActive = activeKind === kind;

        return (
          <button
            key={kind}
            onClick={() => onKindChange(kind)}
            className={cn(
              "relative flex w-14 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors",
              isActive
                ? "bg-[var(--color-gold)]/15 text-[var(--color-gold)]"
                : "text-muted-foreground/50 hover:bg-[var(--color-dark-bronze)] hover:text-muted-foreground/80",
            )}
          >
            {/* Active indicator — left bar */}
            {isActive && (
              <span className="absolute left-0 top-2 h-6 w-[3px] rounded-r-full bg-[var(--color-gold)]" />
            )}

            {/* Icon */}
            <ProcessKindIcon kind={kind} className="h-5 w-5" />

            {/* Label + count */}
            <span className="text-[9px] font-medium leading-none tracking-wide">
              {VIEW_SHORT_LABELS[kind]}
              <span className={cn(
                "ml-0.5",
                isActive ? "text-[var(--color-gold)]/60" : "text-muted-foreground/30",
              )}>
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
