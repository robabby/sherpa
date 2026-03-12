"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "./lib/utils";
import { PromptCopyButton } from "./prompt-copy-button";
import type { ResearchTreeNode } from "@/lib/studio/types";

function nodeToHref(node: ResearchTreeNode): string | null {
  const match = node.relativePath.match(/^docs\/initiatives\/(.+)$/);
  if (!match?.[1]) return null;
  const segments = match[1].split("/sub-initiatives/");
  return `/process/${segments.join("/")}`;
}
import {
  generateRrLaunchPrompt,
  generateRrContinuePrompt,
  generatePlanningPrompt,
} from "@/lib/studio/prompts";
import type { BranchSeed } from "@/lib/studio/types";

interface TreeNodeProps {
  node: ResearchTreeNode;
  seeds: BranchSeed[];
  parentPath?: string;
  defaultExpanded?: boolean;
}

export function TreeNode({
  node,
  seeds,
  parentPath,
  defaultExpanded = true,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children.length > 0;
  const isSeed = node.kind === "seed";
  const isRoot = node.kind === "root";

  // Find matching seed for seed nodes (to generate launch prompt)
  const matchingSeed = isSeed
    ? seeds.find((s) => s.slug === node.slug)
    : undefined;

  return (
    <div>
      {/* Node header */}
      <div
        className={cn(
          "rounded-lg border px-3 py-2.5",
          isRoot &&
            "border-l-2 border-l-[var(--color-gold)]/60 border-t-[var(--color-copper)]/20 border-r-[var(--color-copper)]/20 border-b-[var(--color-copper)]/20 bg-card/40",
          isSeed &&
            "border-dashed border-[var(--color-copper)]/25 bg-[var(--color-copper)]/[0.03]",
          !isRoot &&
            !isSeed &&
            "border-[var(--color-copper)]/20"
        )}
      >
        <div className="flex items-start gap-2">
          {/* Expand/collapse toggle */}
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              <motion.span
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="block"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.span>
            </button>
          ) : (
            <span className="mt-0.5 shrink-0 p-0.5">
              <span
                className={cn(
                  "block h-2 w-2 rounded-full",
                  isSeed
                    ? "border border-[var(--color-copper)]/30"
                    : "bg-[var(--color-gold)]/60"
                )}
              />
            </span>
          )}

          {/* Node content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {(() => {
                const href =
                  !isRoot && !isSeed && node.iterationCount > 0
                    ? nodeToHref(node)
                    : null;
                const slugClass = cn(
                  "font-mono text-sm",
                  isSeed ? "text-foreground/70" : "text-foreground"
                );
                return href ? (
                  <Link
                    href={href}
                    className={cn(
                      slugClass,
                      "hover:text-[var(--color-gold)] transition-colors"
                    )}
                  >
                    {node.slug}
                  </Link>
                ) : (
                  <span className={slugClass}>{node.slug}</span>
                );
              })()}
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px]",
                  isSeed
                    ? "bg-[var(--color-copper)]/10 text-[var(--color-copper)]/70"
                    : "bg-[var(--color-gold)]/10 text-[var(--color-gold)]/70"
                )}
              >
                {isSeed ? "seed" : node.status}
              </span>
              {node.priority && (
                <span
                  className={cn(
                    "text-[10px]",
                    node.priority === "high"
                      ? "text-[var(--color-gold)]"
                      : node.priority === "medium"
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground/40"
                  )}
                >
                  {node.priority}
                </span>
              )}
            </div>

            {/* Title (if different from slug) */}
            {node.title !== node.slug && (
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  isSeed ? "text-foreground/40" : "text-foreground/60"
                )}
              >
                {node.title}
              </p>
            )}

            {/* Question excerpt for seeds */}
            {node.question && (
              <p className="mt-1 text-xs italic text-muted-foreground/50">
                &ldquo;{node.question.length > 120
                  ? node.question.slice(0, 120) + "..."
                  : node.question}&rdquo;
              </p>
            )}

            {/* Iteration count for active nodes */}
            {!isSeed && node.iterationCount > 0 && (
              <p className="mt-1 text-[10px] text-muted-foreground/50">
                {node.iterationCount} iteration{node.iterationCount !== 1 && "s"}
                {node.openQuestions.length > 0 &&
                  ` · ${node.openQuestions.length} open question${node.openQuestions.length !== 1 ? "s" : ""}`}
              </p>
            )}

            {/* Action buttons */}
            <div className="mt-1.5 flex gap-1">
              {isSeed && matchingSeed ? (
                <PromptCopyButton
                  prompt={generateRrLaunchPrompt(matchingSeed)}
                  variant="rr"
                  label="Launch /rr"
                />
              ) : !isSeed ? (
                <>
                  <PromptCopyButton
                    prompt={generateRrContinuePrompt(node)}
                    variant="rr"
                  />
                  {node.iterationCount > 0 && (
                    <PromptCopyButton
                      prompt={generatePlanningPrompt(node, parentPath)}
                      variant="planning"
                    />
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="ml-6 space-y-2 border-l border-[var(--color-copper)]/15 pl-4 pt-2">
                {node.children.map((child) => (
                  <TreeNode
                    key={child.slug}
                    node={child}
                    seeds={seeds}
                    parentPath={node.relativePath}
                    defaultExpanded={child.kind !== "seed"}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
