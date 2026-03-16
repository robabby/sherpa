"use client";

import type { TaskEvent } from "@sherpa/studio-core/task-events";
import { formatDuration } from "./lib/task-styles";

// ---------------------------------------------------------------------------
// Event type visual mapping
// ---------------------------------------------------------------------------

interface EventStyle {
  dotSize: string;
  border: string;
  colorBg: string;
  glow: string;
  labelColor: string;
  labelWeight: string;
}

function getEventStyle(event: TaskEvent): EventStyle {
  const ev = event.event;
  const data = event.data;

  switch (ev) {
    case "dispatch_requested":
      return {
        dotSize: "h-3.5 w-3.5",
        border: "border-2",
        colorBg: "border-[var(--color-copper)] bg-[var(--color-copper)]/20",
        glow: "shadow-[0_0_6px_rgba(196,154,108,0.3)]",
        labelColor: "text-[var(--color-copper)]",
        labelWeight: "font-medium",
      };
    case "worker_started":
      return {
        dotSize: "h-3.5 w-3.5",
        border: "border-2",
        colorBg: "border-[var(--color-bronze)] bg-[var(--color-bronze)]/15",
        glow: "",
        labelColor: "text-[var(--color-bronze)]",
        labelWeight: "font-medium",
      };
    case "status_changed": {
      const to = data.to as string | undefined;
      if (to === "completed") {
        return {
          dotSize: "h-3.5 w-3.5",
          border: "border-2",
          colorBg: "border-emerald-500 bg-emerald-500/20",
          glow: "shadow-[0_0_6px_rgba(16,185,129,0.3)]",
          labelColor: "text-emerald-500",
          labelWeight: "font-medium",
        };
      }
      if (to === "failed") {
        return {
          dotSize: "h-3.5 w-3.5",
          border: "border-2",
          colorBg: "border-rose-500 bg-rose-500/20",
          glow: "shadow-[0_0_6px_rgba(244,63,94,0.3)]",
          labelColor: "text-rose-500",
          labelWeight: "font-medium",
        };
      }
      // Default status_changed
      return {
        dotSize: "h-3 w-3",
        border: "border-[1.5px]",
        colorBg: "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/8",
        glow: "",
        labelColor: "text-[var(--color-gold)]/60",
        labelWeight: "",
      };
    }
    case "backend_delegating":
      return {
        dotSize: "h-2.5 w-2.5",
        border: "border",
        colorBg: "border-zinc-600/60",
        glow: "",
        labelColor: "text-zinc-600",
        labelWeight: "",
      };
    case "task_updated":
      return {
        dotSize: "h-3 w-3",
        border: "border-[1.5px]",
        colorBg: "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/8",
        glow: "",
        labelColor: "text-[var(--color-gold)]/60",
        labelWeight: "",
      };
    case "dispatch_spawned":
      return {
        dotSize: "h-3.5 w-3.5",
        border: "border-2",
        colorBg: "border-[var(--color-copper)] bg-[var(--color-copper)]/15",
        glow: "",
        labelColor: "text-[var(--color-copper)]/80",
        labelWeight: "font-medium",
      };
    case "dispatch_failed":
      return {
        dotSize: "h-3.5 w-3.5",
        border: "border-2",
        colorBg: "border-rose-500 bg-rose-500/20",
        glow: "shadow-[0_0_6px_rgba(244,63,94,0.3)]",
        labelColor: "text-rose-500",
        labelWeight: "font-medium",
      };
    default:
      return {
        dotSize: "h-2.5 w-2.5",
        border: "border",
        colorBg: "border-zinc-600/60",
        glow: "",
        labelColor: "text-zinc-600",
        labelWeight: "",
      };
  }
}

// ---------------------------------------------------------------------------
// Detail text per event type
// ---------------------------------------------------------------------------

function getEventDetail(event: TaskEvent): string {
  const d = event.data;

  switch (event.event) {
    case "dispatch_requested": {
      const backend = (d.backend as string) ?? "unknown";
      const mode = (d.mode as string) ?? "";
      const source = (d.source as string) ?? "";
      return `Dispatched to ${backend}${mode ? ` (${mode})` : ""}${source ? ` via ${source}` : ""}`;
    }
    case "task_updated": {
      const updates = (d.updates ?? d) as Record<string, unknown>;
      const pairs = Object.entries(updates)
        .filter(([k]) => k !== "timestamp" && k !== "event" && k !== "taskId" && k !== "taskSlug")
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(", ");
      return pairs || "Task updated";
    }
    case "worker_started": {
      const model = (d.model as string) ?? "";
      const mode = (d.mode as string) ?? "";
      const taskType = (d.taskType as string) ?? "";
      const budget = (d.budgetUsd as string) ?? "";
      const parts = [model, mode, taskType, budget ? `$${budget} budget` : ""].filter(Boolean);
      return parts.join(" \u00b7 ");
    }
    case "backend_delegating": {
      const script = (d.script as string) ?? "";
      // Show just the filename portion for cleaner display
      const shortScript = script.split("/").slice(-2).join("/");
      return shortScript || "Delegating to backend";
    }
    case "dispatch_spawned": {
      const pid = d.pid != null ? String(d.pid) : "";
      const backend = (d.backend as string) ?? "";
      const agent = (d.agent as string) ?? "";
      const mode = (d.mode as string) ?? "";
      const parts = [pid ? `PID ${pid}` : "", backend, agent, mode].filter(Boolean);
      return parts.join(" \u00b7 ");
    }
    case "status_changed": {
      const from = (d.from as string) ?? "";
      const to = (d.to as string) ?? "";
      const exitCode = d.exitCode != null ? `Exit code ${d.exitCode}` : "";
      const dur = typeof d.durationSeconds === "number" && d.durationSeconds > 0
        ? formatDuration(d.durationSeconds)
        : "";
      const parts = [`${from} \u2192 ${to}`, exitCode, dur ? `${dur} duration` : ""].filter(Boolean);
      return parts.join(" \u00b7 ");
    }
    case "dispatch_failed": {
      return (d.error as string) ?? (d.message as string) ?? "Dispatch failed";
    }
    default:
      return JSON.stringify(d).slice(0, 120);
  }
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatTime(timestamp: string): string {
  if (!timestamp) return "";
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

function formatGap(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s elapsed`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  if (min < 60) return rem > 0 ? `${min}m ${rem}s elapsed` : `${min}m elapsed`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin > 0 ? `${hr}h ${remMin}m elapsed` : `${hr}h elapsed`;
}

function getTimestampMs(ts: string): number {
  return new Date(ts).getTime();
}

// ---------------------------------------------------------------------------
// Status badge for status_changed events
// ---------------------------------------------------------------------------

const STATUS_BADGE_STYLES: Record<string, string> = {
  completed: "border-emerald-500/25 bg-emerald-500/8 text-emerald-400",
  failed: "border-rose-500/25 bg-rose-500/8 text-rose-400",
  dispatched: "border-[var(--color-copper)]/25 bg-[var(--color-copper)]/8 text-[var(--color-copper)]",
  pending: "border-muted-foreground/25 bg-muted-foreground/8 text-muted-foreground",
  reviewed: "border-[var(--color-gold)]/25 bg-[var(--color-gold)]/8 text-[var(--color-gold)]",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MissionTimelineProps {
  events: TaskEvent[];
  isStreaming: boolean;
}

export function MissionTimeline({ events, isStreaming }: MissionTimelineProps) {
  if (events.length === 0 && !isStreaming) {
    return (
      <div className="rounded-lg border border-muted-foreground/10 bg-card/10 px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground/40">No events recorded</p>
        <p className="mt-1 text-xs text-muted-foreground/25">
          Events appear when a task is dispatched
        </p>
      </div>
    );
  }

  // Build items: events + gap indicators + collapsed agent-activity blocks
  type TimelineItem =
    | { type: "event"; event: TaskEvent }
    | { type: "gap"; durationMs: number }
    | { type: "agent-activity"; lineCount: number; startTime: string; endTime: string };

  const items: TimelineItem[] = [];

  // Accumulator for consecutive agent_output events
  let agentBlock: { lineCount: number; startTime: string; endTime: string } | null = null;

  function flushAgentBlock() {
    if (agentBlock) {
      items.push({ type: "agent-activity", ...agentBlock });
      agentBlock = null;
    }
  }

  let lastNonAgentEvent: TaskEvent | null = null;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!;

    if (ev.event === "agent_output") {
      const lc = typeof ev.data.lineCount === "number" ? ev.data.lineCount : 0;
      if (agentBlock) {
        agentBlock.lineCount += lc;
        agentBlock.endTime = ev.timestamp;
      } else {
        agentBlock = { lineCount: lc, startTime: ev.timestamp, endTime: ev.timestamp };
      }
      continue;
    }

    // Non-agent event: flush any accumulated agent block first
    flushAgentBlock();

    // Insert gap indicator if >30s since last non-agent event
    if (lastNonAgentEvent) {
      const gap = getTimestampMs(ev.timestamp) - getTimestampMs(lastNonAgentEvent.timestamp);
      if (gap > 30_000) {
        items.push({ type: "gap", durationMs: gap });
      }
    }

    items.push({ type: "event", event: ev });
    lastNonAgentEvent = ev;
  }

  // Flush any trailing agent block
  flushAgentBlock();

  return (
    <div className="space-y-5">
      {/* Streaming banner */}
      {isStreaming && (
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-copper)]/15 bg-[var(--color-copper)]/[0.04] px-3.5 py-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-copper)]/40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-copper)]" />
          </span>
          <span className="text-xs font-medium text-[var(--color-copper)]/80">
            Streaming live events
          </span>
          <div className="ml-auto flex items-center gap-1">
            <span
              className="h-1 w-1 rounded-full bg-[var(--color-copper)]/40 animate-[pulse_2s_ease-in-out_infinite]"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="h-1 w-1 rounded-full bg-[var(--color-copper)]/40 animate-[pulse_2s_ease-in-out_infinite]"
              style={{ animationDelay: "0.3s" }}
            />
            <span
              className="h-1 w-1 rounded-full bg-[var(--color-copper)]/40 animate-[pulse_2s_ease-in-out_infinite]"
              style={{ animationDelay: "0.6s" }}
            />
          </div>
        </div>
      )}

      {/* Vertical timeline */}
      <div className="relative ml-4">
        {/* Vertical line */}
        <div
          className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--color-dark-bronze)]"
          style={
            isStreaming
              ? {
                  background:
                    "repeating-linear-gradient(180deg, rgba(196,154,108,0.4) 0px, rgba(196,154,108,0.1) 10px, rgba(39,39,42,0.5) 20px, rgba(39,39,42,0.5) 30px, rgba(196,154,108,0.4) 40px)",
                  backgroundSize: "1px 40px",
                  animation: "timeline-trace 2s linear infinite",
                }
              : undefined
          }
        />

        {items.map((item, i) => {
          if (item.type === "gap") {
            return (
              <div key={`gap-${i}`} className="relative flex gap-4 pb-6">
                <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                  <svg
                    className="h-3 w-3 text-zinc-700"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M6 2v4l2.5 1.5"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="6"
                      cy="6"
                      r="5"
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-mono text-[10px] italic text-muted-foreground/50">
                    {formatGap(item.durationMs)}
                  </span>
                </div>
              </div>
            );
          }

          if (item.type === "agent-activity") {
            const startFmt = formatTime(item.startTime);
            const endFmt = formatTime(item.endTime);
            const timeRange = startFmt === endFmt ? startFmt : `${startFmt}\u2013${endFmt}`;
            return (
              <div key={`agent-${i}`} className="relative flex gap-4 pb-6">
                <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full border border-zinc-600/40 bg-zinc-700/30" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-zinc-600">agent output</span>
                    <div
                      className="flex-1 mx-1 h-1.5 rounded-full overflow-hidden bg-zinc-800/50"
                    >
                      <div
                        className="h-full w-full"
                        style={{
                          background:
                            "repeating-linear-gradient(90deg, rgba(196,154,108,0.12) 0px, rgba(196,154,108,0.06) 4px, transparent 8px, transparent 12px)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-zinc-600">
                      {timeRange}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-700">
                    {item.lineCount} lines &middot; View in Log tab
                  </p>
                </div>
              </div>
            );
          }

          const ev = item.event;
          const style = getEventStyle(ev);
          const detail = getEventDetail(ev);
          const to = ev.data.to as string | undefined;

          return (
            <div key={`ev-${i}`} className="relative flex gap-4 pb-6">
              <div className="relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                <span
                  className={`${style.dotSize} rounded-full ${style.border} ${style.colorBg} ${style.glow}`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${style.labelWeight} ${style.labelColor}`}
                  >
                    {ev.event}
                  </span>
                  {ev.event === "status_changed" && to && (
                    <span
                      className={`rounded border px-1.5 py-px text-[10px] font-medium ${STATUS_BADGE_STYLES[to] ?? "border-muted-foreground/25 bg-muted-foreground/8 text-muted-foreground"}`}
                    >
                      {to}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground/50">
                    {formatTime(ev.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground/60">
                  {detail}
                </p>
              </div>
            </div>
          );
        })}

        {/* Streaming tail */}
        {isStreaming && (
          <div className="relative flex gap-4">
            <div className="relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-copper)]/30" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-copper)]/60" />
              </span>
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-[var(--color-copper)]/50">
                Waiting for events...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CSS for timeline-trace animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes timeline-trace {
              0% { background-position: 0 0; }
              100% { background-position: 0 40px; }
            }
          `,
        }}
      />
    </div>
  );
}
