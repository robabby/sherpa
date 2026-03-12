"use client";

import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { ProcessNode } from "@/lib/studio/process-nodes-shared";
import {
  KIND_LABELS,
  PROCESS_NODE_KINDS,
  type ProcessNodeKind,
  type ProcessSortField,
} from "@/lib/studio/process-nodes-shared";
import { cn } from "./lib/utils";

interface ProcessFilterBarProps {
  allNodes: ProcessNode[];
  activeKind: ProcessNodeKind | null;
  activeStatus: string | null;
  activeSort: ProcessSortField;
  searchTerm: string;
  onKindChange: (kind: ProcessNodeKind | null) => void;
  onStatusChange: (status: string | null) => void;
  onSortChange: (sort: ProcessSortField) => void;
  onSearchChange: (term: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const SORT_OPTIONS: { value: ProcessSortField; label: string }[] = [
  { value: "updated", label: "Recent" },
  { value: "alpha", label: "A–Z" },
  { value: "status", label: "Status" },
  { value: "kind", label: "Kind" },
];

export function ProcessFilterBar({
  allNodes,
  activeKind,
  activeStatus,
  activeSort,
  searchTerm,
  onKindChange,
  onStatusChange,
  onSortChange,
  onSearchChange,
  searchInputRef,
}: ProcessFilterBarProps) {
  const kindCounts: Record<string, number> = {};
  for (const node of allNodes) {
    kindCounts[node.kind] = (kindCounts[node.kind] ?? 0) + 1;
  }

  const statuses = [...new Set(allNodes.map((n) => n.status))].sort();

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border/10 pb-2.5 mb-0 scrollbar-none">
      {/* Type pills */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onKindChange(null)}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            !activeKind
              ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
              : "text-muted-foreground/50 hover:text-muted-foreground",
          )}
        >
          All
          <Badge
            variant="secondary"
            className="h-4 min-w-[1rem] justify-center px-1 text-[10px]"
          >
            {allNodes.length}
          </Badge>
        </button>
        {PROCESS_NODE_KINDS.map((kind) => {
          const count = kindCounts[kind] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={kind}
              onClick={() => onKindChange(activeKind === kind ? null : kind)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                activeKind === kind
                  ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                  : "text-muted-foreground/50 hover:text-muted-foreground",
              )}
            >
              {KIND_LABELS[kind]}
              <Badge
                variant="secondary"
                className="h-4 min-w-[1rem] justify-center px-1 text-[10px]"
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-border/20" />

      {/* Status dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              activeStatus
                ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                : "text-muted-foreground/50 hover:text-muted-foreground",
            )}
          >
            {activeStatus ?? "Status"}
            <span className="text-[10px] opacity-50">▾</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onStatusChange(null)}>
            All statuses
          </DropdownMenuItem>
          {statuses.map((s) => (
            <DropdownMenuItem key={s} onClick={() => onStatusChange(s)}>
              {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Separator */}
      <div className="h-4 w-px bg-border/20" />

      {/* Sort buttons */}
      <div className="flex items-center gap-0.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors",
              activeSort === opt.value
                ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                : "text-muted-foreground/40 hover:text-muted-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search — pushed right */}
      <div className="relative ml-auto w-48">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
        <Input
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…  /"
          className="h-7 border-border/20 bg-transparent pl-8 text-xs placeholder:text-muted-foreground/30"
        />
      </div>
    </div>
  );
}
