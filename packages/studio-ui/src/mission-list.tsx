"use client";

import { useCallback, useEffect, useRef } from "react";

import type { TaskBoardEntry } from "@/lib/studio/tasks";

import { MissionCard } from "./mission-card";

interface MissionListProps {
  tasks: TaskBoardEntry[];
  selectedId: string | null;
  focusIndex: number;
  onSelect: (id: string) => void;
}

export function MissionList({ tasks, selectedId, focusIndex, onSelect }: MissionListProps) {
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setItemRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
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
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[var(--color-dark-bronze)] [&::-webkit-scrollbar]:w-1">
      {tasks.map((task, idx) => (
        <div key={task.id} ref={setItemRef(idx)}>
          <MissionCard
            task={task}
            selected={task.id === selectedId}
            focused={idx === focusIndex}
            onClick={() => onSelect(task.id)}
          />
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-muted-foreground/40">
          No tasks match filters
        </div>
      )}
    </div>
  );
}
