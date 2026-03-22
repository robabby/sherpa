"use client"

import type { ResearchState } from "@sherpa/studio-core"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getStaleness, stalenessColor } from "@/lib/staleness"

interface ResearchStatePanelProps {
  state: ResearchState
  nowISO: string
}

export function ResearchStatePanel({ state, nowISO }: ResearchStatePanelProps) {
  const completed = state.researchQueue.filter((q) => q.completed).length

  return (
    <div className="flex flex-col gap-4">
      {state.danglingThreads.length > 0 ? (
        <div className="relative rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] p-4 pl-5">
          <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-sm bg-gradient-to-b from-[var(--color-copper)]/50 to-transparent" />
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-dim)] mb-3">
            Dangling Threads
          </div>
          <ul className="flex flex-col gap-2">
            {state.danglingThreads.map((thread, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {thread.severity ? (
                  <Badge
                    variant={thread.severity === "CRITICAL" ? "destructive" : "secondary"}
                    className={cn(
                      "mt-0.5 shrink-0",
                      thread.severity === "CRITICAL" && "shadow-[0_0_8px_rgba(239,68,68,0.4)]",
                      thread.severity === "HIGH" && "bg-amber-500/12 text-amber-400 border border-amber-400/15",
                    )}
                  >
                    {thread.severity}
                  </Badge>
                ) : null}
                <span className="text-foreground">{thread.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.researchQueue.length > 0 ? (
        <div className="relative rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] p-4 pl-5">
          <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-sm bg-gradient-to-b from-[var(--color-copper)]/50 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-dim)]">Research Queue</div>
            <span className="font-mono text-[0.625rem] text-[var(--color-gold-muted)]">{completed}/{state.researchQueue.length}</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {state.researchQueue.map((item, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  item.completed ? "text-muted-foreground" : "text-foreground",
                )}
              >
                <span className={cn("shrink-0", item.completed ? "text-emerald-500" : "text-muted-foreground/40")}>
                  {item.completed ? "\u2713" : "\u25CB"}
                </span>
                <span className={cn(item.completed && "line-through")}>{item.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 h-[3px] rounded-full bg-[var(--glass-border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold-muted)] to-[var(--color-gold)]"
              style={{ width: `${(completed / state.researchQueue.length) * 100}%` }}
            />
          </div>
        </div>
      ) : null}

      {state.coverageMap.length > 0 ? (
        <div className="relative rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] p-4 pl-5">
          <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-sm bg-gradient-to-b from-[var(--color-copper)]/50 to-transparent" />
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-dim)] mb-3">
            Coverage Map
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground/60">
                  <th className="pb-2 text-left font-normal">Stream</th>
                  <th className="pb-2 text-left font-normal">Last Run</th>
                  <th className="pb-2 text-left font-normal">Findings</th>
                </tr>
              </thead>
              <tbody>
                {state.coverageMap.map((entry) => (
                  <tr key={entry.stream} className="border-b border-border/10">
                    <td className="py-1.5 font-mono text-xs">{entry.stream}</td>
                    <td className="py-1.5 font-mono text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("size-1.5 rounded-full shrink-0", stalenessColor[getStaleness(entry.lastRun, nowISO)])} />
                        <span className="text-muted-foreground">{entry.lastRun}</span>
                      </span>
                    </td>
                    <td className="py-1.5 text-muted-foreground">{entry.findings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-3 font-mono text-[0.625rem] text-[var(--color-dim)]">
            <span className="flex items-center gap-1"><span className="size-1 rounded-full bg-emerald-500" />&lt;2d</span>
            <span className="flex items-center gap-1"><span className="size-1 rounded-full bg-amber-400" />2–7d</span>
            <span className="flex items-center gap-1"><span className="size-1 rounded-full bg-red-500" />&gt;7d</span>
          </div>
        </div>
      ) : null}

      {state.lastUpdated ? (
        <p className="font-mono text-xs text-muted-foreground/60">
          State updated: {state.lastUpdated}
        </p>
      ) : null}
    </div>
  )
}
