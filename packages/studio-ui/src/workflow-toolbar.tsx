"use client";

import { cn } from "./lib/utils";

interface WorkflowToolbarProps {
  flowEnabled: boolean;
  onToggleFlow: () => void;
}

export function WorkflowToolbar({
  flowEnabled,
  onToggleFlow,
}: WorkflowToolbarProps) {
  return (
    <div className="flex items-center gap-1 bg-[rgba(8,8,10,0.85)] backdrop-blur-xl border border-[var(--glass-border)] rounded-lg p-1">
      <button
        type="button"
        onClick={onToggleFlow}
        className={cn(
          "flex items-center gap-1.5 text-xs px-2 py-1 rounded cursor-pointer",
          flowEnabled ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <span
          className={cn(
            "inline-block size-1.5 rounded-full",
            flowEnabled
              ? "bg-[var(--color-gold)]"
              : "bg-muted-foreground/40",
          )}
        />
        Flow
      </button>
    </div>
  );
}
