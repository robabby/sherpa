"use client";

import { useCallback, useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProcessNode } from "@/lib/studio/process-nodes-shared";
import { cn } from "./lib/utils";

import { ProcessKindIcon } from "./process-kind-icon";
import { StatusBadge } from "./status-badge";

interface ProcessItemListProps {
  nodes: ProcessNode[];
  selectedId: string | null;
  focusIndex: number;
  onSelect: (id: string) => void;
  /** Map of node ID → depth for tree view indentation. Null = flat list. */
  depthMap?: Map<string, number> | null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatStaleness(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 14) return "1w stale";
  if (days < 30) return `${Math.floor(days / 7)}w stale`;
  return `${Math.floor(days / 30)}mo stale`;
}

function stalenessColor(days: number): string {
  if (days < 3) return "text-muted-foreground/40";
  if (days < 7) return "text-amber-500/70";
  return "text-rose-400/70";
}

export function ProcessItemList({
  nodes,
  selectedId,
  focusIndex,
  onSelect,
  depthMap,
}: ProcessItemListProps) {
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const setItemRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      if (el) {
        itemRefs.current.set(index, el);
      } else {
        itemRefs.current.delete(index);
      }
    },
    [],
  );

  // Scroll focused item into view
  useEffect(() => {
    if (focusIndex < 0) return;
    const el = itemRefs.current.get(focusIndex);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusIndex]);

  return (
    <ScrollArea className="h-full">
      <div>
        {nodes.map((node, idx) => {
          const isSelected = node.id === selectedId;
          const isFocused = idx === focusIndex;
          const depth = depthMap?.get(node.id) ?? 0;

          return (
            <button
              key={node.id}
              ref={setItemRef(idx)}
              onClick={() => onSelect(node.id)}
              className={cn(
                "flex w-full items-start gap-2.5 border-l-2 py-2 text-left transition-colors",
                isSelected
                  ? "border-[var(--color-gold)] bg-[var(--color-dark-bronze)]"
                  : "border-transparent hover:bg-[var(--color-warm-charcoal)]/60",
                isFocused && !isSelected && "bg-[var(--color-warm-charcoal)]/40 ring-1 ring-inset ring-[var(--color-gold)]/20",
              )}
              style={{ paddingLeft: `${12 + depth * 20}px`, paddingRight: 12 }}
            >
              <ProcessKindIcon
                kind={node.kind}
                className="mt-0.5 shrink-0 text-muted-foreground/40"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground/90">
                    {node.title}
                  </span>
                  <StatusBadge status={node.status} className="shrink-0 text-[10px]" />
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
                  {node.summary && (
                    <span className="truncate">{node.summary}</span>
                  )}
                  {(() => {
                    const velocity = node.kind === "initiative"
                      ? (node.metadata.velocity as { staleDays?: number | null } | undefined)
                      : null;
                    const staleDays = velocity?.staleDays;
                    if (staleDays != null) {
                      return (
                        <>
                          {node.summary && <span>·</span>}
                          <span className={cn("shrink-0 font-mono", stalenessColor(staleDays))}>
                            {formatStaleness(staleDays)}
                          </span>
                        </>
                      );
                    }
                    if (node.updated) {
                      return (
                        <>
                          {node.summary && <span>·</span>}
                          <span className="shrink-0 font-mono">
                            {formatDate(node.updated)}
                          </span>
                        </>
                      );
                    }
                    return null;
                  })()}
                  {node.childCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="shrink-0 font-mono">
                        {node.childCount}
                      </span>
                    </>
                  )}
                  {(() => {
                    if (node.kind !== "initiative") return null;
                    const lifecycle = node.metadata.lifecycle as {
                      stage: string;
                      label: string;
                      actor: "human" | "agent" | null;
                    } | undefined;
                    if (!lifecycle) return null;
                    if (lifecycle.stage === "in-flight" || lifecycle.stage === "integrated") return null;
                    return (
                      <>
                        <span>·</span>
                        <span
                          className={cn(
                            "shrink-0",
                            lifecycle.actor === "human"
                              ? "text-[var(--color-gold)]/70"
                              : "text-muted-foreground/30",
                          )}
                        >
                          {lifecycle.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </button>
          );
        })}
        {nodes.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground/40">
            No items match filters
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
