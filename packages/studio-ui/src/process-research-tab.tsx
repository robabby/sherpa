"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  GitBranch,
  Layers,
} from "lucide-react";
import type { ProcessNode } from "@/lib/studio/process-nodes-shared";
import { cn } from "./lib/utils";
import { EASE_EMERGENCE } from "./lib/animation-constants";
import type { ResearchData, IterationData, ContentFileData } from "./lib/process-detail-helpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function docHref(relativePath: string): string {
  return `/docs/${relativePath.replace(/^docs\//, "").replace(/\.md$/, "")}`;
}

// ---------------------------------------------------------------------------
// Iteration section
// ---------------------------------------------------------------------------

function IterationSection({ iteration }: { iteration: IterationData }) {
  const [open, setOpen] = useState(iteration.number <= 2);
  const vectorCount = iteration.vectors.length;

  return (
    <div className="rounded-lg border border-border/15 bg-card/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--color-copper)]/5"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        )}
        <Layers className="h-3.5 w-3.5 text-[var(--color-copper)]/70" />
        <span className="text-sm font-medium text-foreground/80">
          Iteration {iteration.number}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/40">
          {vectorCount} vector{vectorCount !== 1 ? "s" : ""}
          {iteration.synthesis && " · synthesized"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_EMERGENCE }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-border/10 px-3 py-2 space-y-1.5">
              {/* Synthesis */}
              {iteration.synthesis && (
                <FileLink file={iteration.synthesis} icon="synthesis" />
              )}

              {/* Vectors */}
              {iteration.vectors.map((vector) => (
                <FileLink key={vector.relativePath} file={vector} icon="vector" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File link row
// ---------------------------------------------------------------------------

function FileLink({ file, icon }: { file: ContentFileData; icon: "synthesis" | "vector" | "file" }) {
  const IconComponent = icon === "vector" ? GitBranch : FileText;
  const iconColor = icon === "vector"
    ? "text-[var(--color-copper)]/70"
    : icon === "synthesis"
      ? "text-[var(--color-gold)]/70"
      : "text-muted-foreground/50";

  return (
    <Link
      href={docHref(file.relativePath)}
      className="group flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-[var(--color-copper)]/5"
    >
      <IconComponent className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />
      <span className="min-w-0 truncate text-sm text-foreground/70 transition-colors group-hover:text-[var(--color-gold)]">
        {file.title || file.relativePath.split("/").pop()?.replace(/\.md$/, "")}
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResearchTab({ node }: { node: ProcessNode }) {
  const research = node.metadata.research as ResearchData | null;

  if (!research || research.iterations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Layers className="h-8 w-8 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground/40">
          No research iterations yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/25">
          Run /rr to begin research.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
        <span>{research.iterations.length} iteration{research.iterations.length !== 1 ? "s" : ""}</span>
        <span className="text-muted-foreground/20">·</span>
        <span>
          {research.iterations.reduce((sum, it) => sum + it.vectors.length, 0)} vectors
        </span>
        <span className="text-muted-foreground/20">·</span>
        <span>{research.totalFiles} files</span>
      </div>

      {/* README link */}
      {research.readme && (
        <FileLink file={research.readme} icon="file" />
      )}

      {/* Iterations */}
      <div className="space-y-2">
        {research.iterations.map((iteration) => (
          <IterationSection key={iteration.number} iteration={iteration} />
        ))}
      </div>

      {/* Loose files */}
      {research.looseFiles.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40">
            Other files
          </span>
          {research.looseFiles.map((file) => (
            <FileLink key={file.relativePath} file={file} icon="file" />
          ))}
        </div>
      )}
    </div>
  );
}
