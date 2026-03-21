"use client"

import type { HeartbeatStatus } from "@sherpa/studio-core"
import { cn } from "@/lib/utils"

interface ResearchHeartbeatIndicatorProps {
  status: HeartbeatStatus
}

const stateConfig = {
  active: { color: "bg-emerald-500", pingColor: "bg-emerald-400", ping: true },
  pending: { color: "bg-amber-400", pingColor: "", ping: false },
  offline: { color: "bg-zinc-400", pingColor: "", ping: false },
} as const

export function ResearchHeartbeatIndicator({ status }: ResearchHeartbeatIndicatorProps) {
  const config = stateConfig[status.status]

  return (
    <div
      className="flex items-center gap-3 rounded-md bg-muted/30 px-4 py-2 font-mono text-xs text-muted-foreground"
      role="status"
      aria-label={`Research ${status.status}: ${status.message}`}
    >
      <span className="relative flex size-2.5">
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

      <span>{status.message}</span>

      {status.heartbeatCountToday > 0 ? (
        <>
          <span className="text-muted-foreground/30">·</span>
          <span>
            <span className="text-foreground/60">{status.heartbeatCountToday}</span>{" "}
            {status.heartbeatCountToday === 1 ? "cycle" : "cycles"} today
          </span>
        </>
      ) : null}

      <span className="text-muted-foreground/30">·</span>
      <span>Every 30m · 8am–11pm PT</span>
    </div>
  )
}
