"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type {
  ResearchFile,
  ResearchState,
  ResearchPriorities,
  HeartbeatStatus,
} from "@sherpa/studio-core"
import { ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ResearchHeartbeatIndicator } from "./research-heartbeat-indicator"
import { ResearchPrioritiesPanel } from "./research-priorities-panel"
import { ResearchStatePanel } from "./research-state-panel"
import { ResearchStreamView } from "./research-stream-view"
import { ResearchTimelineView } from "./research-timeline-view"
import { ResearchTableView } from "./research-table-view"

type ViewMode = "stream" | "timeline" | "table"
const VALID_VIEWS: ViewMode[] = ["stream", "timeline", "table"]

interface ResearchDashboardProps {
  files: ResearchFile[]
  grouped: Record<string, ResearchFile[]>
  state: ResearchState | null
  priorities: ResearchPriorities | null
  heartbeat: HeartbeatStatus
  projectSlug: string
}

export function ResearchDashboard({
  files,
  grouped,
  state,
  priorities,
  heartbeat,
  projectSlug,
}: ResearchDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawView = searchParams.get("view")
  const view: ViewMode = VALID_VIEWS.includes(rawView as ViewMode)
    ? (rawView as ViewMode)
    : "stream"

  const setView = useCallback(
    (v: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("view", v)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-col gap-6">
      <ResearchHeartbeatIndicator status={heartbeat} />

      {priorities || state ? (
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-card/30">
            <ChevronRight className="shrink-0 transition-transform group-data-[state=open]:rotate-90" />
            <span className="font-mono text-xs uppercase tracking-[0.15em]">
              Research Operations
            </span>
            {state?.danglingThreads.some((t) => t.severity === "CRITICAL") ? (
              <span className="size-1.5 rounded-full bg-destructive" />
            ) : null}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid gap-4 pt-2 lg:grid-cols-2">
              {priorities ? <ResearchPrioritiesPanel priorities={priorities} /> : null}
              {state ? <ResearchStatePanel state={state} /> : null}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="stream">Streams</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="stream">
          <ResearchStreamView grouped={grouped} projectSlug={projectSlug} />
        </TabsContent>

        <TabsContent value="timeline">
          <ResearchTimelineView files={files} projectSlug={projectSlug} />
        </TabsContent>

        <TabsContent value="table">
          <ResearchTableView files={files} projectSlug={projectSlug} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
