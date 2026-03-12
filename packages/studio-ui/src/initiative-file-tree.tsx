"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderTree,
  GitBranch,
  Sprout,
} from "lucide-react";
import { cn } from "./lib/utils";
import type { FileTreeNode, FileTreeAnnotation } from "@/lib/studio/process-nodes-shared";
import { PromptCopyButton } from "./prompt-copy-button";
import { StatusBadge } from "./status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Annotation → Icon mapping
// ---------------------------------------------------------------------------

const ANNOTATION_ICONS: Record<FileTreeAnnotation, { icon: typeof FileText; className: string }> = {
  proposal: { icon: FileText, className: "text-[var(--color-gold)]/70" },
  plan: { icon: ClipboardList, className: "text-[var(--color-copper)]/70" },
  "research-index": { icon: BookOpen, className: "text-foreground/50" },
  synthesis: { icon: FileText, className: "text-[var(--color-gold)]/70" },
  vector: { icon: GitBranch, className: "text-[var(--color-copper)]/70" },
  seed: { icon: Sprout, className: "text-[var(--color-copper)]/70" },
  "sub-initiative": { icon: FolderTree, className: "text-foreground/50" },
  deliverable: { icon: BarChart3, className: "text-foreground/50" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function docHref(relativePath: string): string {
  return `/docs/${relativePath.replace(/^docs\//, "").replace(/\.md$/, "")}`;
}

/**
 * Build the chart viewer URL from a deliverable's relative path.
 * Path: docs/initiatives/<slug>/deliverables/<file>.json
 * or:   docs/initiatives/<slug>/sub-initiatives/<sub>/deliverables/<file>.json
 * URL:  /process/<slug>/chart/<id>
 */
function deliverableHref(relativePath: string, fileName: string): string {
  const id = fileName.replace(/\.json$/, "");
  // Extract the initiative slug path between "docs/initiatives/" and "/deliverables/"
  const match = relativePath.match(/^docs\/initiatives\/(.+?)\/deliverables\//);
  if (!match) return "#";
  // Convert "parent/sub-initiatives/child" segments into URL slugs
  const slugPath = match[1]!.replace(/\/sub-initiatives\//g, "/");
  return `/process/${slugPath}/chart/${id}`;
}

function isDocLinkable(node: FileTreeNode): boolean {
  return node.exists && node.type === "file" && node.name.endsWith(".md");
}

function isDeliverableLinkable(node: FileTreeNode): boolean {
  return node.exists && node.type === "file" && node.annotation === "deliverable" && node.name.endsWith(".json");
}

// ---------------------------------------------------------------------------
// Prompt builders for inline actions
// ---------------------------------------------------------------------------

function buildRrContinueForDir(relativePath: string): string {
  const initPath = relativePath.replace(/\/research$/, "");
  return [`/rr`, ``, `Continue research: ${initPath}/`].join("\n");
}

function buildPlanningForGhost(relativePath: string): string {
  const initPath = relativePath.replace(/\/plan\.md$/, "");
  return [
    `Using /superpowers:writing-plans, create an implementation plan for`,
    `this initiative.`,
    ``,
    `Context:`,
    `- Proposal: ${initPath}/proposal.md`,
    `- Research: ${initPath}/research/`,
    ``,
    `Translate the proposed changes into a session-by-session implementation plan.`,
  ].join("\n");
}

function buildSubInitiativeForDir(relativePath: string): string {
  const initPath = relativePath.replace(/\/(branches|sub-initiatives)$/, "");
  return [
    `/rr`,
    ``,
    `Create a new sub-initiative under ${initPath}/sub-initiatives/`,
    `Parent initiative: ${initPath}/proposal.md`,
    ``,
    `Define the sub-initiative scope, then run the first research iteration.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// File tree node component
// ---------------------------------------------------------------------------

function FileTreeItem({
  node,
  depth = 0,
  hasResearch,
}: {
  node: FileTreeNode;
  depth?: number;
  hasResearch?: boolean;
}) {
  const autoExpand = node.exists && node.children.length <= 3 && node.children.length > 0;
  const [open, setOpen] = useState(autoExpand);
  const isDir = node.type === "directory";
  const iconEntry = node.annotation ? ANNOTATION_ICONS[node.annotation] : null;
  const Icon = iconEntry?.icon;
  const iconClass = iconEntry?.className ?? "text-muted-foreground/50";
  const hint = (node.meta?.hint as string) ?? undefined;

  // Inline prompt actions on specific nodes
  let inlinePrompt: { prompt: string; variant: "rr" | "planning"; label: string } | null = null;
  if (isDir && node.exists && node.name === "research/") {
    inlinePrompt = { prompt: buildRrContinueForDir(node.relativePath), variant: "rr", label: "/rr" };
  } else if (!node.exists && node.name === "plan.md" && hasResearch) {
    inlinePrompt = { prompt: buildPlanningForGhost(node.relativePath), variant: "planning", label: "Plan" };
  } else if (isDir && node.exists && (node.name === "branches/" || node.name === "sub-initiatives/")) {
    inlinePrompt = { prompt: buildSubInitiativeForDir(node.relativePath), variant: "rr", label: "Sub-init" };
  }

  const nameContent = (
    <span
      className={cn(
        "text-sm",
        !node.exists && "italic text-muted-foreground/25",
        node.exists && isDir && "text-foreground/80",
        node.exists && !isDir && "text-foreground/70",
      )}
    >
      {node.name}
    </span>
  );

  return (
    <div>
      <div
        className={cn(
          "group flex min-h-[28px] items-center gap-1.5 rounded-md px-1.5 py-0.5",
          node.exists && "hover:bg-[var(--color-copper)]/5",
          !node.exists && "border-dashed",
        )}
      >
        {/* Expand/collapse or spacer */}
        {isDir ? (
          <button
            onClick={() => setOpen(!open)}
            className="shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground"
            disabled={!node.exists || node.children.length === 0}
          >
            {open ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* Icon */}
        {Icon ? (
          <Icon className={cn("h-3.5 w-3.5 shrink-0", iconClass, !node.exists && "opacity-25")} />
        ) : isDir ? (
          <FolderTree className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground/40", !node.exists && "opacity-25")} />
        ) : (
          <FileText className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground/30", !node.exists && "opacity-25")} />
        )}

        {/* Name — link if it's a real .md file, research report, or deliverable .json */}
        {isDocLinkable(node) ? (
          <Link
            href={docHref(node.relativePath)}
            className="min-w-0 truncate text-sm text-foreground/70 transition-colors hover:text-[var(--color-gold)]"
          >
            {node.name}
          </Link>
        ) : typeof node.meta?.reportHref === "string" ? (
          <Link
            href={node.meta.reportHref}
            className="min-w-0 truncate text-sm text-foreground/70 transition-colors hover:text-[var(--color-bronze)]"
          >
            {node.title ?? node.name}
          </Link>
        ) : isDeliverableLinkable(node) ? (
          <Link
            href={deliverableHref(node.relativePath, node.name)}
            className="min-w-0 truncate text-sm text-foreground/70 transition-colors hover:text-[var(--color-gold)]"
          >
            {node.name}
          </Link>
        ) : hint && !node.exists ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {nameContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {hint}
            </TooltipContent>
          </Tooltip>
        ) : (
          nameContent
        )}

        {/* Title (for files with extracted title different from name) */}
        {node.title && node.title !== node.name.replace(/\.md$/, "") && (
          <span className="hidden truncate text-xs text-muted-foreground/40 sm:inline">
            {node.title}
          </span>
        )}

        {/* Status badge */}
        {node.status && (
          <StatusBadge status={node.status} className="ml-auto text-[10px] py-0 px-1.5" />
        )}

        {/* Child count for dirs */}
        {isDir && node.exists && node.children.length > 0 && !node.status && (
          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/30">
            {node.children.length}
          </span>
        )}

        {/* Inline prompt action */}
        {inlinePrompt && (
          <span className="ml-1 opacity-0 transition-opacity group-hover:opacity-100">
            <PromptCopyButton
              prompt={inlinePrompt.prompt}
              variant={inlinePrompt.variant}
              label={inlinePrompt.label}
            />
          </span>
        )}
      </div>

      {/* Children */}
      {isDir && node.children.length > 0 && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="ml-4 border-l border-[var(--color-copper)]/15 pl-2">
                {node.children.map((child) => (
                  <FileTreeItem
                    key={child.relativePath}
                    node={child}
                    depth={depth + 1}
                    hasResearch={hasResearch}
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

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

interface InitiativeFileTreeProps {
  tree: FileTreeNode;
}

export function InitiativeFileTree({ tree }: InitiativeFileTreeProps) {
  // Determine if this initiative has research (for enabling plan prompt on ghost plan.md)
  const hasResearch = tree.children.some(
    (c) => c.name === "research/" && c.exists && c.children.length > 0,
  );

  return (
    <div className="space-y-0">
      {tree.children.map((child) => (
        <FileTreeItem
          key={child.relativePath}
          node={child}
          hasResearch={hasResearch}
        />
      ))}
    </div>
  );
}
