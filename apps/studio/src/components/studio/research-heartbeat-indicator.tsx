"use client"

import type { HeartbeatStatus } from "@sherpa/studio-core"
import { cn } from "@/lib/utils"

interface ResearchHeartbeatIndicatorProps {
  status: HeartbeatStatus
}

const stateConfig = {
  active: { color: "bg-emerald-500", pingColor: "bg-emerald-400", ping: true, glow: true },
  pending: { color: "bg-amber-400", pingColor: "", ping: false, glow: false },
  offline: { color: "bg-zinc-400", pingColor: "", ping: false, glow: false },
} as const

export function ResearchHeartbeatIndicator({ status }: ResearchHeartbeatIndicatorProps) {
  const config = stateConfig[status.status]

  return (
    <div
      className="flex items-center gap-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] px-4 py-2.5 font-mono text-xs text-muted-foreground"
      role="status"
      aria-label={`Research ${status.status}: ${status.message}`}
    >
      <span className={cn("relative flex size-2.5", config.glow && "pulse-ring")}>
        {config.ping ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
              config.pingColor,
            )}
          />
        ) : null}
        <span className={cn("relative inline-flex size-2.5 rounded-full", config.color)} />
      </span>

      <span className={cn(status.status === "active" && "led-active")}>{status.message}</span>

      {status.heartbeatCountToday > 0 ? (
        <>
          <span className="text-[var(--color-copper)]/30">·</span>
          <span>
            <span className="text-[var(--color-gold)]">{status.heartbeatCountToday}</span>{" "}
            {status.heartbeatCountToday === 1 ? "cycle" : "cycles"} today
          </span>
        </>
      ) : null}

      <span className="text-[var(--color-copper)]/30">·</span>
      <span>Every 30m · 8am–11pm PT</span>
    </div>
  )
}
