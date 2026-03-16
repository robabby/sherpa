"use client";

import { useState } from "react";
import { exportWorkflowAsMermaid } from "@sherpa/studio-core";
import { ClipboardCopy } from "lucide-react";
import { cn } from "./lib/utils";

interface WorkflowToolbarProps {
  flowEnabled: boolean;
  onToggleFlow: () => void;
}

export function WorkflowToolbar({
  flowEnabled,
  onToggleFlow,
}: WorkflowToolbarProps) {
  const [copied, setCopied] = useState(false);

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
      <button
        type="button"
        onClick={() => {
          const text = exportWorkflowAsMermaid();
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded cursor-pointer text-muted-foreground"
      >
        <ClipboardCopy className="size-3" />
        {copied ? "Copied!" : "Mermaid"}
      </button>
    </div>
  );
}
