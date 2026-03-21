"use client"

import type { ResearchState } from "@sherpa/studio-core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ResearchStatePanelProps {
  state: ResearchState
}

export function ResearchStatePanel({ state }: ResearchStatePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {state.danglingThreads.length > 0 ? (
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Dangling Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {state.danglingThreads.map((thread, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {thread.severity ? (
                    <Badge
                      variant={thread.severity === "CRITICAL" ? "destructive" : "secondary"}
                      className="mt-0.5 shrink-0"
                    >
                      {thread.severity}
                    </Badge>
                  ) : null}
                  <span className="text-foreground">{thread.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {state.researchQueue.length > 0 ? (
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Research Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      ) : null}

      {state.coverageMap.length > 0 ? (
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Coverage Map
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      <td className="py-2 font-mono text-xs">{entry.stream}</td>
                      <td className="py-2 font-mono text-xs text-muted-foreground">{entry.lastRun}</td>
                      <td className="py-2 text-muted-foreground">{entry.findings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {state.lastUpdated ? (
        <p className="font-mono text-xs text-muted-foreground/60">
          State updated: {state.lastUpdated}
        </p>
      ) : null}
    </div>
  )
}
