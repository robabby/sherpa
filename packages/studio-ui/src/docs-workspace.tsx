"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck, FileText } from "lucide-react";

import type { DocTreeSection, Provenance, DocDrift } from "@sherpa/studio-core";
import { computeState } from "@sherpa/studio-core/doc-tree-types";

import { cn } from "./lib/utils";
import { DocTree } from "./doc-tree";
import { DocSearch } from "./doc-search";
import { ProvenanceHeader } from "./provenance-header";
import { DocRenderer } from "./doc-renderer";
import { ResizeHandle } from "./resize-handle";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TREE_MIN_WIDTH = 200;
const TREE_MAX_WIDTH = 500;
const TREE_DEFAULT_WIDTH = 280;
const STORAGE_KEY = "docs-tree-width";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Keep searchParams in a ref so callbacks that read it don't need it as a dep. */
function useStableSearchParams() {
  const searchParams = useSearchParams();
  const ref = useRef(searchParams);
  // eslint-disable-next-line react-hooks/refs -- intentional: keep ref in sync for stable callbacks
  ref.current = searchParams;
  return [searchParams, ref] as const;
}

function getStoredWidth(): number {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return TREE_DEFAULT_WIDTH;
  const n = parseInt(stored, 10);
  return isNaN(n) ? TREE_DEFAULT_WIDTH : Math.min(TREE_MAX_WIDTH, Math.max(TREE_MIN_WIDTH, n));
}

/** Strip provenance markdown banner from content before rendering. */
function stripProvenanceBanner(content: string): string {
  return content
    .replace(
      /^>\s*\*\*(?:AI-generated|AI-updated|AI-extracted|Human-authored|Possibly stale|System-generated)\*\*.*(?:\n>\s*.*)*/m,
      "",
    )
    .trimStart();
}

/** Recursively count nodes with state === "awaiting-review" across all sections. */
function countAwaitingReview(sections: DocTreeSection[]): number {
  let count = 0;

  function walk(nodes: { state: string; children: { state: string; children: unknown[] }[] }[]) {
    for (const node of nodes) {
      if (node.state === "awaiting-review") count++;
      walk(node.children as typeof nodes);
    }
  }

  for (const section of sections) {
    walk(section.nodes);
  }
  return count;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DocsWorkspaceProps {
  sections: DocTreeSection[];
  initialDoc: {
    content: string;
    relativePath: string;
    provenance: Provenance | null;
    drift?: DocDrift | null;
  } | null;
  initialSlug: string | null;
  searchItems: { relativePath: string; fileName: string; title: string }[];
  onMarkReviewed?: (relativePath: string) => Promise<{ success: boolean; error?: string }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocsWorkspace({
  sections,
  initialDoc,
  initialSlug,
  searchItems,
  onMarkReviewed,
}: DocsWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams, searchParamsRef] = useStableSearchParams();

  // State
  const selected = searchParams.get("doc") ?? initialSlug;
  const [reviewFilter, setReviewFilter] = useState(false);
  const [treeWidth, setTreeWidth] = useState(TREE_DEFAULT_WIDTH);

  // Hydrate stored width from localStorage after mount to avoid SSR mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage on mount
  useEffect(() => {
    setTreeWidth(getStoredWidth());
  }, []);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Awaiting-review count
  const awaitingCount = useMemo(() => countAwaitingReview(sections), [sections]);

  // URL sync helper
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParamsRef],
  );

  // Selection handler
  const onSelect = useCallback(
    (slug: string) => {
      updateParams({ doc: slug });
    },
    [updateParams],
  );

  // Resize handlers
  const handleResize = useCallback((deltaX: number) => {
    setTreeWidth((w) => Math.min(TREE_MAX_WIDTH, Math.max(TREE_MIN_WIDTH, w + deltaX)));
  }, []);

  const handleResizeEnd = useCallback(() => {
    setTreeWidth((w) => {
      localStorage.setItem(STORAGE_KEY, String(w));
      return w;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is typing in an input (except Escape)
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable;
      if (isInput && e.key !== "Escape") return;

      switch (e.key) {
        case "/": {
          e.preventDefault();
          // DocSearch manages its own input — find it in the container
          const input = searchContainerRef.current?.querySelector("input");
          input?.focus();
          break;
        }
        case "r": {
          if (!isInput) {
            e.preventDefault();
            setReviewFilter((f) => !f);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
        }
      }
    }

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine what to show in detail pane
  const doc = selected === initialSlug ? initialDoc : null;
  const showProvenance =
    doc?.provenance && doc.provenance.maintainedBy === "self-documenting-system";
  const provenanceState = doc?.provenance
    ? computeState(doc.provenance, doc.drift)
    : null;

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      className="flex h-[calc(100vh-3.5rem)] min-h-[400px] overflow-hidden border-t border-[var(--color-dark-bronze)] outline-none"
    >
      {/* Left pane — tree */}
      <div
        style={{ width: treeWidth, minWidth: TREE_MIN_WIDTH, maxWidth: TREE_MAX_WIDTH }}
        className="flex shrink-0 flex-col overflow-hidden border-r border-[var(--color-dark-bronze)] bg-[var(--color-obsidian)]"
      >
        {/* Search input */}
        <div ref={searchContainerRef} className="shrink-0 border-b border-[var(--color-dark-bronze)] bg-[var(--color-warm-charcoal)]/50 p-2">
          <DocSearch items={searchItems} />
        </div>

        {/* Review queue toggle */}
        <div className="shrink-0 border-b border-[var(--color-dark-bronze)] px-2 py-1.5">
          <button
            onClick={() => setReviewFilter((f) => !f)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              reviewFilter
                ? "border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                : "text-muted-foreground/50 hover:text-muted-foreground/70",
            )}
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            Review queue
            {awaitingCount > 0 && (
              <span
                className={cn(
                  "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  reviewFilter
                    ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)]"
                    : "bg-muted/30 text-muted-foreground/50",
                )}
              >
                {awaitingCount}
              </span>
            )}
          </button>
        </div>

        {/* Tree */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DocTree
            sections={sections}
            selectedSlug={selected}
            onSelect={onSelect}
            reviewFilter={reviewFilter}
          />
        </div>
      </div>

      {/* Resize handle */}
      <ResizeHandle onResize={handleResize} onResizeEnd={handleResizeEnd} />

      {/* Right pane — detail */}
      <div className="min-w-0 flex-1 overflow-y-auto bg-[var(--color-warm-charcoal)]/40 px-6 py-6">
        {doc ? (
          <>
            {showProvenance && doc.provenance && provenanceState && (
              <ProvenanceHeader
                provenance={doc.provenance}
                state={provenanceState}
                drift={doc.drift}
                onMarkReviewed={
                  (provenanceState === "awaiting-review" ||
                    provenanceState === "stale") &&
                  onMarkReviewed
                    ? async () => {
                        const result = await onMarkReviewed(doc.relativePath);
                        if (result.success) {
                          router.refresh();
                        }
                      }
                    : undefined
                }
              />
            )}
            <DocRenderer
              content={stripProvenanceBanner(doc.content)}
              relativePath={doc.relativePath}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg border border-[var(--border-gold)]/20 bg-muted/30 text-muted-foreground">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="font-heading text-lg font-medium text-foreground/90">
                Select a document from the tree
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground/40">
                <kbd className="rounded border border-muted/30 bg-muted/20 px-1.5 py-0.5 font-mono">/</kbd>
                <span>Search</span>
                <kbd className="rounded border border-muted/30 bg-muted/20 px-1.5 py-0.5 font-mono">r</kbd>
                <span>Review filter</span>
                <kbd className="rounded border border-muted/30 bg-muted/20 px-1.5 py-0.5 font-mono">Esc</kbd>
                <span>Blur</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
