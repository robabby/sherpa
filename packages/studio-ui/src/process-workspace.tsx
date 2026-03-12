"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/** Keep searchParams in a ref so callbacks that read it don't need it as a dep. */
function useStableSearchParams() {
  const searchParams = useSearchParams();
  const ref = useRef(searchParams);
  // eslint-disable-next-line react-hooks/refs -- intentional: keep ref in sync for stable callbacks
  ref.current = searchParams;
  return [searchParams, ref] as const;
}

import type { ProcessNode } from "@/lib/studio/process-nodes-shared";
import type { AgentRole } from "@/lib/studio/types";
import { cn } from "./lib/utils";
import {
  applyFilters,
  buildInitiativeSeedTree,
  PROCESS_VIEW_KINDS,
  type ProcessNodeKind,
  type ProcessSortField,
  type ProcessViewKind,
  type TreeListItem,
} from "@/lib/studio/process-nodes-shared";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProcessDetailPane } from "./process-detail-pane";
import { ProcessItemList } from "./process-item-list";
import { ProcessKindRail } from "./process-kind-rail";
import { ResizeHandle } from "./resize-handle";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIST_MIN_WIDTH = 200;
const LIST_MAX_WIDTH = 500;
const LIST_DEFAULT_WIDTH = 300;
const STORAGE_KEY = "process-list-width";

const SORT_OPTIONS: { value: ProcessSortField; label: string }[] = [
  { value: "updated", label: "Recent" },
  { value: "alpha", label: "A–Z" },
  { value: "status", label: "Status" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidViewKind(v: string | null): v is ProcessViewKind {
  return v !== null && (PROCESS_VIEW_KINDS as readonly string[]).includes(v);
}

function isValidSort(v: string | null): v is ProcessSortField {
  return v !== null && ["updated", "alpha", "status", "kind"].includes(v);
}

function getStoredWidth(): number {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return LIST_DEFAULT_WIDTH;
  const n = parseInt(stored, 10);
  return isNaN(n) ? LIST_DEFAULT_WIDTH : Math.min(LIST_MAX_WIDTH, Math.max(LIST_MIN_WIDTH, n));
}


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DEFAULT_VIEW_KIND: ProcessViewKind = "initiative-tree";

interface ProcessWorkspaceProps {
  allNodes: ProcessNode[];
  initialKind: ProcessViewKind;
  initialStatus: string | null;
  initialSort: ProcessSortField;
  initialSearch: string;
  initialSelectedId: string | null;
  onNodeStatusChange?: (source: string, kind: string, newStatus: string) => Promise<{ success: boolean; error?: string }>;
  onPostApproval?: (slug: string, source: string) => Promise<{ success: boolean; tasks: string[]; error?: string }>;
  onArchive?: (slug: string) => Promise<{ success: boolean; error?: string }>;
  onRestore?: (slug: string) => Promise<{ success: boolean; error?: string }>;
  archivedCount?: number;
  agentRoles?: AgentRole[];
}

export function ProcessWorkspace({
  allNodes,
  initialKind,
  initialStatus,
  initialSort,
  initialSearch,
  initialSelectedId,
  onNodeStatusChange,
  onPostApproval,
  onArchive,
  onRestore,
  archivedCount: _archivedCount,
  agentRoles,
}: ProcessWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams, searchParamsRef] = useStableSearchParams();

  // State
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileShowDetail, setMobileShowDetail] = useState(!!initialSelectedId);
  const [listWidth, setListWidth] = useState(LIST_DEFAULT_WIDTH);

  // Hydrate stored width from localStorage after mount to avoid SSR mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage on mount
  useEffect(() => { setListWidth(getStoredWidth()); }, []);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Read filter state from URL
  const activeKind: ProcessViewKind = isValidViewKind(searchParams.get("kind"))
    ? (searchParams.get("kind") as ProcessViewKind)
    : initialKind;
  const activeStatus = searchParams.get("status") ?? initialStatus;
  const activeSort = isValidSort(searchParams.get("sort"))
    ? (searchParams.get("sort") as ProcessSortField)
    : initialSort;

  // Filter + sort
  const isTreeView = activeKind === "initiative-tree";

  const treeItems: TreeListItem[] = useMemo(() => {
    if (!isTreeView) return [];
    let baseNodes = allNodes;
    // Hide archived unless explicitly filtering for them
    if (activeStatus !== "archived") {
      baseNodes = baseNodes.filter((n) => n.status !== "archived");
    }
    if (activeStatus) {
      baseNodes = baseNodes.filter((n) => n.status === activeStatus);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      baseNodes = baseNodes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.summary && n.summary.toLowerCase().includes(q)),
      );
    }
    return buildInitiativeSeedTree(baseNodes, activeSort);
  }, [allNodes, activeStatus, activeSort, isTreeView, searchTerm]);

  // Map view kind → node kind for flat filtering
  const nodeKindFilter: ProcessNodeKind | null =
    isTreeView ? null : (activeKind as ProcessNodeKind);

  const filteredNodes = useMemo(() => {
    if (isTreeView) return treeItems.map((item) => item.node);
    // Hide archived unless explicitly filtering for them
    const base = activeStatus === "archived"
      ? allNodes
      : allNodes.filter((n) => n.status !== "archived");
    return applyFilters(base, {
      kind: nodeKindFilter,
      status: activeStatus,
      search: searchTerm,
      sort: activeSort,
    });
  }, [allNodes, nodeKindFilter, activeStatus, searchTerm, activeSort, isTreeView, treeItems]);

  // Depth map for tree view indentation
  const depthMap = useMemo(() => {
    if (!isTreeView) return null;
    const map = new Map<string, number>();
    for (const item of treeItems) {
      map.set(item.node.id, item.depth);
    }
    return map;
  }, [isTreeView, treeItems]);

  // Selected node
  const selectedNode = useMemo(
    () => filteredNodes.find((n) => n.id === selectedId) ?? null,
    [filteredNodes, selectedId],
  );

  // Unique statuses for current kind filter
  const statuses = useMemo(() => {
    let kindNodes = allNodes;
    if (isTreeView) {
      kindNodes = allNodes.filter((n) => n.kind === "initiative" || n.kind === "seed");
    } else if (nodeKindFilter) {
      kindNodes = allNodes.filter((n) => n.kind === nodeKindFilter);
    }
    return [...new Set(kindNodes.map((n) => n.status))].sort();
  }, [allNodes, isTreeView, nodeKindFilter]);

  // URL sync helper — uses ref so identity is stable across URL changes
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

  // Filter callbacks
  const onKindChange = useCallback(
    (kind: ProcessViewKind) =>
      updateParams({ kind: kind === DEFAULT_VIEW_KIND ? null : kind, status: null }),
    [updateParams],
  );
  const onStatusChange = useCallback(
    (status: string | null) => updateParams({ status }),
    [updateParams],
  );
  const onSortChange = useCallback(
    (sort: ProcessSortField) =>
      updateParams({ sort: sort === "updated" ? null : sort }),
    [updateParams],
  );
  const onSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Debounced search → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ q: searchTerm || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, updateParams]);

  // Selection → URL
  const onSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      setActiveTab("overview");
      setMobileShowDetail(true);
      const idx = filteredNodes.findIndex((n) => n.id === id);
      if (idx !== -1) setFocusIndex(idx);
      updateParams({ node: id });
    },
    [filteredNodes, updateParams],
  );

  // Resize handler
  const handleResize = useCallback((deltaX: number) => {
    setListWidth((w) => Math.min(LIST_MAX_WIDTH, Math.max(LIST_MIN_WIDTH, w + deltaX)));
  }, []);

  const handleResizeEnd = useCallback(() => {
    setListWidth((w) => {
      localStorage.setItem(STORAGE_KEY, String(w));
      return w;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement === searchInputRef.current &&
        e.key !== "Escape"
      ) {
        return;
      }

      switch (e.key) {
        case "j":
        case "ArrowDown": {
          e.preventDefault();
          const next = Math.min(focusIndex + 1, filteredNodes.length - 1);
          setFocusIndex(next);
          break;
        }
        case "k":
        case "ArrowUp": {
          e.preventDefault();
          const prev = Math.max(focusIndex - 1, 0);
          setFocusIndex(prev);
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < filteredNodes.length) {
            const node = filteredNodes[focusIndex]!;
            onSelect(node.id);
          }
          break;
        }
        case "/": {
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        }
        case "g": {
          if (selectedId) {
            e.preventDefault();
            setActiveTab((t) => (t === "graph" ? "overview" : "graph"));
          }
          break;
        }
        case "e": {
          if (selectedId) {
            e.preventDefault();
            setActiveTab("content");
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          if (document.activeElement === searchInputRef.current) {
            searchInputRef.current?.blur();
          } else if (mobileShowDetail) {
            setMobileShowDetail(false);
          } else {
            setSelectedId(null);
            updateParams({ node: null });
          }
          break;
        }
      }
    }

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [focusIndex, filteredNodes, onSelect, updateParams, selectedId, mobileShowDetail]);

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      className="flex h-[calc(100vh-100px)] min-h-[400px] overflow-hidden rounded-lg border border-[var(--color-dark-bronze)] outline-none"
    >
      {/* Kind rail — hidden on mobile */}
      <div className="hidden md:block">
        <ProcessKindRail
          allNodes={allNodes}
          activeKind={activeKind}
          onKindChange={onKindChange}
        />
      </div>

      {/* Item list column */}
      <div
        className={cn(
          "flex flex-col overflow-hidden border-r border-[var(--color-dark-bronze)]",
          mobileShowDetail ? "hidden md:flex" : "flex",
        )}
        style={{ width: listWidth, minWidth: LIST_MIN_WIDTH, maxWidth: LIST_MAX_WIDTH }}
      >
        {/* Compact list header: search + sort + status */}
        <div className="flex shrink-0 items-center gap-1.5 border-b border-[var(--color-dark-bronze)] bg-[var(--color-warm-charcoal)]/50 px-2 py-1.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/30" />
            <Input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search…  /"
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
                <span className="ml-0.5 opacity-50">▾</span>
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

          {/* Sort buttons */}
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

        {/* Mobile kind pills — shown on small screens where rail is hidden */}
        <div className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-[var(--color-dark-bronze)] px-2 py-1 md:hidden">
          {PROCESS_VIEW_KINDS.map((kind) => {
            // Hide raw initiative/seed in mobile pills (subsumed by tree)
            if (kind === "initiative" || kind === "seed") return null;
            const isActive = activeKind === kind;
            return (
              <button
                key={kind}
                onClick={() => onKindChange(kind)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                    : "text-muted-foreground/40",
                )}
              >
                {kind === "initiative-tree" ? "Init" : kind}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="min-h-0 flex-1">
          <ProcessItemList
            nodes={filteredNodes}
            selectedId={selectedId}
            focusIndex={focusIndex}
            onSelect={onSelect}
            depthMap={depthMap}
          />
        </div>
      </div>

      {/* Resize handle — hidden on mobile */}
      <div className="hidden md:flex">
        <ResizeHandle onResize={handleResize} onResizeEnd={handleResizeEnd} />
      </div>

      {/* Detail pane */}
      <div
        className={cn(
          "min-w-0 flex-1 overflow-hidden bg-[var(--color-warm-charcoal)]/40 px-4 pt-1 md:px-6",
          mobileShowDetail ? "block" : "hidden md:block",
        )}
      >
        {mobileShowDetail && (
          <button
            onClick={() => setMobileShowDetail(false)}
            className="mb-2 text-xs text-muted-foreground/50 hover:text-muted-foreground md:hidden"
          >
            ← Back to list
          </button>
        )}
        <ProcessDetailPane
          node={selectedNode}
          allNodes={allNodes}
          totalCount={allNodes.length}
          onStatusChange={onNodeStatusChange}
          onPostApproval={onPostApproval}
          onArchive={onArchive}
          onRestore={onRestore}
          onSelectNode={onSelect}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          agentRoles={agentRoles}
        />
      </div>
    </div>
  );
}
