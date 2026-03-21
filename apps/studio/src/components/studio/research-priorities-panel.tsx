"use client"

import type { ResearchPriorities } from "@sherpa/studio-core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResearchPrioritiesPanelProps {
  priorities: ResearchPriorities
}

export function ResearchPrioritiesPanel({ priorities }: ResearchPrioritiesPanelProps) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0">
        <CardTitle className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Priorities
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {priorities.narrative ? (
          <p className="text-sm text-muted-foreground italic">
            {priorities.narrative}
          </p>
        ) : null}

        {priorities.priorities.length > 0 ? (
          <ol className="flex flex-col gap-1.5 list-decimal list-inside">
            {priorities.priorities.map((item, i) => (
              <li key={i} className="text-sm text-foreground">
                {item}
              </li>
            ))}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  )
}
