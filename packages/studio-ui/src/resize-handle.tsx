"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "./lib/utils";

interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
  onResizeEnd?: () => void;
}

export function ResizeHandle({ onResize, onResizeEnd }: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
      startX.current = e.clientX;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const delta = e.clientX - startX.current;
      startX.current = e.clientX;
      onResize(delta);
    },
    [dragging, onResize],
  );

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    onResizeEnd?.();
  }, [dragging, onResizeEnd]);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={cn(
        "flex w-2 shrink-0 cursor-col-resize items-center justify-center self-stretch touch-none select-none",
        dragging && "bg-[var(--color-gold)]/10",
      )}
    >
      {/* Visible track */}
      <div
        className={cn(
          "h-full w-px transition-colors",
          dragging
            ? "bg-[var(--color-gold)]/40"
            : "bg-[var(--color-dark-bronze)] group-hover:bg-[var(--color-copper)]/30",
        )}
      />
    </div>
  );
}
