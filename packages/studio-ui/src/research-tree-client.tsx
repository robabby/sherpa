"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { TreeNode } from "./tree-node";
import type { BranchSeed, ResearchTreeNode } from "@/lib/studio/types";

interface ResearchTreeClientProps {
  tree: ResearchTreeNode;
  seeds: BranchSeed[];
}

export function ResearchTreeClient({ tree, seeds }: ResearchTreeClientProps) {
  return (
    <div className="space-y-4">
      <TreeNode node={tree} seeds={seeds} defaultExpanded />

      {/* Open questions section (inline threads not promoted to branches) */}
      {tree.openQuestions.length > 0 && (
        <CollapsibleSection
          storageKey={`research-tree-questions-${tree.slug}`}
          title={`Open Questions (${tree.openQuestions.length})`}
        >
          <ol className="space-y-1.5 text-sm text-foreground/70">
            {tree.openQuestions.map((question, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 font-mono text-xs text-muted-foreground/40">
                  {i + 1}.
                </span>
                <span>{question.replace(/\*\*(.+?)\*\*/g, "$1")}</span>
              </li>
            ))}
          </ol>
        </CollapsibleSection>
      )}
    </div>
  );
}
