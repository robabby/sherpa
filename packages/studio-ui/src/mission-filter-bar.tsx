"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";

import type { TaskBoardEntry } from "@/lib/studio/tasks";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "./lib/utils";
import { BACKEND_META } from "@sherpa/studio-core/dispatch-meta";
import type { BackendMeta } from "@sherpa/studio-core/dispatch-meta";
import { STATUS_DOT, formatCost } from "./lib/task-styles";

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: "recent", label: "Recent" },
  { value: "alpha", label: "A\u2013Z" },
  { value: "status", label: "Status" },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MissionFilterBarProps {
  tasks: TaskBoardEntry[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeStatus: string | null;
  onStatusChange: (status: string | null) => void;
  activeBackend: string | null;
  onBackendChange: (backend: string | null) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MissionFilterBar({
  tasks,
  searchTerm,
  onSearchChange,
  activeStatus,
  onStatusChange,
  activeBackend,
  onBackendChange,
  activeSort,
  onSortChange,
  searchInputRef,
}: MissionFilterBarProps) {
  // Unique statuses from all tasks
  const statuses = useMemo(() => {
    return [...new Set(tasks.map((t) => t.status))].sort();
  }, [tasks]);

  // Status counts for stats bar
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    }
    return counts;
  }, [tasks]);

  // Total cost
  const totalCost = useMemo(() => {
    let sum = 0;
    for (const t of tasks) {
      if (t.costUsd != null) sum += t.costUsd;
    }
    return sum > 0 ? sum : null;
  }, [tasks]);

  // Group backends by type
  const { cliBackends, apiBackends } = useMemo(() => {
    const cli: { key: string; meta: BackendMeta }[] = [];
    const api: { key: string; meta: BackendMeta }[] = [];
    for (const [key, meta] of Object.entries(BACKEND_META)) {
      if (meta.type === "cli") cli.push({ key, meta });
      else api.push({ key, meta });
    }
    return { cliBackends: cli, apiBackends: api };
  }, []);

  return (
    <div className="shrink-0 border-b border-[var(--color-dark-bronze)] bg-[var(--color-warm-charcoal)]/50">
      {/* Row 1: search + status + sort */}
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/30" />
          <Input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search\u2026  /"
            className="h-6 border-0 bg-transparent pl-7 text-xs placeholder:text-muted-foreground/25 focus-visible:ring-0"
          />
        </div>

        {/* Status dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                activeStatus
                  ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                  : "text-muted-foreground/40 hover:text-muted-foreground/60",
              )}
            >
              {activeStatus ?? "Status"}
              <span className="ml-0.5 opacity-50">{"\u25BE"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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

        {/* Sort toggle group */}
        <div className="flex shrink-0 items-center gap-0">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                activeSort === opt.value
                  ? "text-[var(--color-gold)]"
                  : "text-muted-foreground/30 hover:text-muted-foreground/50",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: backend toggles */}
      <div className="flex flex-wrap items-center gap-1 px-2 pb-1.5">
        {/* All button */}
        <button
          onClick={() => onBackendChange(null)}
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
            activeBackend === null
              ? "bg-[var(--color-copper)]/12 text-[var(--color-copper)] ring-1 ring-[var(--color-copper)]/20"
              : "text-muted-foreground/40 hover:text-muted-foreground/60",
          )}
        >
          All
        </button>

        {/* Divider + CLI label */}
        <div className="mx-1 h-3 w-px bg-[var(--color-dark-bronze)]" />
        <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/30">
          CLI
        </span>

        {/* CLI backend buttons */}
        {cliBackends.map(({ key, meta }) => (
          <button
            key={key}
            onClick={() => onBackendChange(key)}
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              activeBackend === key
                ? "bg-[var(--color-copper)]/12 text-[var(--color-copper)] ring-1 ring-[var(--color-copper)]/20"
                : "text-muted-foreground/40 hover:text-muted-foreground/60",
            )}
          >
            {meta.displayName}
          </button>
        ))}

        {/* Divider + API label */}
        <div className="mx-1 h-3 w-px bg-[var(--color-dark-bronze)]" />
        <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/30">
          API
        </span>

        {/* API backend buttons */}
        {apiBackends.map(({ key, meta }) => (
          <button
            key={key}
            onClick={() => onBackendChange(key)}
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              activeBackend === key
                ? "bg-[var(--color-copper)]/12 text-[var(--color-copper)] ring-1 ring-[var(--color-copper)]/20"
                : "text-muted-foreground/40 hover:text-muted-foreground/60",
            )}
          >
            {meta.displayName}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 border-t border-[var(--color-dark-bronze)]/50 px-3 py-1">
        {Object.entries(statusCounts).map(([status, count]) => {
          const dotColor = STATUS_DOT[status] ?? "bg-muted-foreground";
          return (
            <span key={status} className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
              <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dotColor)} />
              <span className="font-mono font-medium">{count}</span>
              <span>{status}</span>
            </span>
          );
        })}
        {totalCost != null && (
          <span className="ml-auto font-mono text-[10px] text-[var(--color-tarnished)]">
            {formatCost(totalCost)}
          </span>
        )}
      </div>
    </div>
  );
}
