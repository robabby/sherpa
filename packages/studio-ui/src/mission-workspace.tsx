"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { TaskBoardEntry, TaskDetail } from "@/lib/studio/tasks";
import type { TaskEvent } from "@sherpa/studio-core/task-events";

import { useMissionEvents } from "./hooks/use-mission-events";
import { MissionDetailPane } from "./mission-detail-pane";
import type { MissionDetailTask } from "./mission-detail-pane";
import { MissionFilterBar } from "./mission-filter-bar";
import { MissionList } from "./mission-list";
import { ResizeHandle } from "./resize-handle";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIST_MIN_WIDTH = 200;
const LIST_MAX_WIDTH = 500;
const LIST_DEFAULT_WIDTH = 360;
const STORAGE_KEY = "mission-list-width";

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
  if (!stored) return LIST_DEFAULT_WIDTH;
  const n = parseInt(stored, 10);
  return isNaN(n) ? LIST_DEFAULT_WIDTH : Math.min(LIST_MAX_WIDTH, Math.max(LIST_MIN_WIDTH, n));
}

const STATUS_ORDER: Record<string, number> = {
  dispatched: 0,
  pending: 1,
  completed: 2,
  reviewed: 3,
  failed: 4,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface MissionWorkspaceProps {
  tasks: TaskBoardEntry[];
  initialDetail?: TaskDetail | null;
  initialEvents?: TaskEvent[];
}

export function MissionWorkspace({
  tasks,
  initialDetail = null,
  initialEvents = [],
}: MissionWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams, searchParamsRef] = useStableSearchParams();

  // State
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("node"),
  );
  const [focusIndex, setFocusIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const [listWidth, setListWidth] = useState(LIST_DEFAULT_WIDTH);
  const [activeTab, setActiveTab] = useState("overview");

  // Read filter state from URL
  const activeStatus = searchParams.get("status") ?? null;
  const activeBackend = searchParams.get("backend") ?? null;
  const activeSort = searchParams.get("sort") ?? "recent";

  // Hydrate stored width from localStorage after mount to avoid SSR mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage on mount
  useEffect(() => {
    setListWidth(getStoredWidth());
  }, []);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

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

  // Filter + sort
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Status filter
    if (activeStatus) {
      result = result.filter((t) => t.status === activeStatus);
    }

    // Backend filter
    if (activeBackend) {
      result = result.filter((t) => t.backend === activeBackend);
    }

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          (t.initiative && t.initiative.toLowerCase().includes(q)) ||
          t.backend.toLowerCase().includes(q) ||
          t.model.toLowerCase().includes(q),
      );
    }

    // Sort
    if (activeSort === "alpha") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (activeSort === "status") {
      result = [...result].sort(
        (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
      );
    } else {
      // "recent" — sort by dispatched/created, most recent first
      result = [...result].sort((a, b) => {
        const dateA = a.dispatchedAt ?? a.created;
        const dateB = b.dispatchedAt ?? b.created;
        return dateB.localeCompare(dateA);
      });
    }

    return result;
  }, [tasks, activeStatus, activeBackend, searchTerm, activeSort]);

  // Filter callbacks
  const onStatusChange = useCallback(
    (status: string | null) => updateParams({ status }),
    [updateParams],
  );
  const onBackendChange = useCallback(
    (backend: string | null) => updateParams({ backend }),
    [updateParams],
  );
  const onSortChange = useCallback(
    (sort: string) => updateParams({ sort: sort === "recent" ? null : sort }),
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

  // Set default tab based on detail data
  useEffect(() => {
    if (initialDetail) {
      setActiveTab(initialDetail.hasReport ? "report" : "overview");
    }
  }, [initialDetail]);

  // Selection → URL
  const onSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      setActiveTab("overview");
      const idx = filteredTasks.findIndex((t) => t.id === id);
      if (idx !== -1) setFocusIndex(idx);
      updateParams({ node: id });
    },
    [filteredTasks, updateParams],
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
          const next = Math.min(focusIndex + 1, filteredTasks.length - 1);
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
          if (focusIndex >= 0 && focusIndex < filteredTasks.length) {
            const task = filteredTasks[focusIndex]!;
            onSelect(task.id);
          }
          break;
        }
        case "/": {
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        }
        case "Escape": {
          e.preventDefault();
          if (document.activeElement === searchInputRef.current) {
            searchInputRef.current?.blur();
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
  }, [focusIndex, filteredTasks, onSelect, updateParams]);

  // Build MissionDetailTask from initialDetail (server-provided)
  const detailTask: MissionDetailTask | null = initialDetail
    ? {
        ...initialDetail,
      }
    : null;

  // Derive selected task status for SSE hook
  const selectedTaskStatus = detailTask?.status ?? null;

  // SSE streaming for dispatched tasks, static events for everything else
  const { events: liveEvents, isStreaming } = useMissionEvents(
    selectedId,
    selectedTaskStatus,
    initialEvents,
  );

  // ---------------------------------------------------------------------------
  // Empty state — no tasks at all
  // ---------------------------------------------------------------------------
  if (tasks.length === 0) {
    return (
      <div className="flex h-[calc(100vh-53px)] items-center justify-center border-t border-[var(--color-dark-bronze)]">
        <div className="text-center">
          <p className="font-display text-lg text-muted-foreground/60">No missions in the pipeline</p>
          <p className="mt-1 text-sm text-muted-foreground/40">Create tasks via /plan-tasks or the Dispatch center</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      className="flex h-[calc(100vh-53px)] min-h-[400px] overflow-hidden border-t border-[var(--color-dark-bronze)] outline-none"
    >
      {/* Left pane */}
      <div
        style={{ width: listWidth, minWidth: LIST_MIN_WIDTH, maxWidth: LIST_MAX_WIDTH }}
        className="flex flex-col overflow-hidden border-r border-[var(--color-dark-bronze)] bg-[var(--color-obsidian)]"
      >
        <MissionFilterBar
          tasks={tasks}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          activeBackend={activeBackend}
          onBackendChange={onBackendChange}
          activeSort={activeSort}
          onSortChange={onSortChange}
          searchInputRef={searchInputRef}
        />
        <MissionList
          tasks={filteredTasks}
          selectedId={selectedId}
          focusIndex={focusIndex}
          onSelect={onSelect}
        />
      </div>

      {/* Resize handle */}
      <ResizeHandle onResize={handleResize} onResizeEnd={handleResizeEnd} />

      {/* Right pane — detail */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <MissionDetailPane
          task={detailTask}
          events={liveEvents}
          isStreaming={isStreaming}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
