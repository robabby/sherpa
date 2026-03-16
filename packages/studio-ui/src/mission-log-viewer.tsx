"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TaskEvent } from "@sherpa/studio-core/task-events";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_LINES = 1000;

/** Strip ANSI escape sequences from a string */
function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MissionLogViewerProps {
  events: TaskEvent[];
  isStreaming: boolean;
}

export function MissionLogViewer({ events, isStreaming }: MissionLogViewerProps) {
  const bodyRef = useRef<HTMLPreElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // -------------------------------------------------------------------------
  // Extract agent_output lines
  // -------------------------------------------------------------------------
  const allLines: string[] = [];
  for (const e of events) {
    if (e.event === "agent_output") {
      const lines = e.data.lines as string[] | undefined;
      if (Array.isArray(lines)) {
        for (const line of lines) {
          allLines.push(stripAnsi(line));
        }
      }
    }
  }

  const truncated = allLines.length > MAX_LINES;
  const displayLines = truncated ? allLines.slice(-MAX_LINES) : allLines;
  const lineCount = allLines.length;

  // -------------------------------------------------------------------------
  // Auto-scroll management
  // -------------------------------------------------------------------------
  const handleScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(nearBottom);
  }, []);

  useEffect(() => {
    if (autoScroll && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [displayLines.length, autoScroll]);

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------
  if (lineCount === 0 && !isStreaming) {
    return (
      <div className="rounded-lg border border-muted-foreground/10 bg-card/10 px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground/40">No agent output</p>
        <p className="mt-1 text-xs text-muted-foreground/25">
          Output appears when the agent starts working
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="rounded-lg border border-[var(--color-dark-bronze)] bg-[var(--color-obsidian)] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2.5 border-b border-[var(--color-dark-bronze)] px-3.5 py-2">
        <span className="relative flex h-2.5 w-2.5">
          {isStreaming ? (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-copper)]/40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-copper)]" />
            </>
          ) : (
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          )}
        </span>
        <span className="text-xs font-medium text-zinc-400">Agent Log</span>
        <span className="ml-auto font-mono text-[10px] tabular-nums text-[var(--color-dim)]">
          {lineCount.toLocaleString()} {lineCount === 1 ? "line" : "lines"}
        </span>
      </div>

      {/* Truncation bar */}
      {truncated && (
        <div className="border-b border-[var(--color-dark-bronze)] bg-[var(--color-warm-charcoal)]/50 px-3.5 py-1.5">
          <span className="text-[10px] text-[var(--color-dim)]">
            Showing last {MAX_LINES.toLocaleString()} of {lineCount.toLocaleString()} lines
          </span>
        </div>
      )}

      {/* Log body */}
      <pre
        ref={bodyRef}
        onScroll={handleScroll}
        className="font-mono text-xs leading-[1.7] text-zinc-400 whitespace-pre-wrap [tab-size:2] overflow-y-auto p-3.5"
        style={{ maxHeight: 520 }}
      >
        {displayLines.join("\n")}
      </pre>

      {/* Streaming tail */}
      {isStreaming && (
        <div className="flex items-center gap-2 border-t border-[var(--color-dark-bronze)] px-3.5 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-copper)]/40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-copper)]" />
          </span>
          <span className="text-[10px] text-[var(--color-copper)]/60">
            Streaming...
          </span>
        </div>
      )}
    </div>
  );
}
