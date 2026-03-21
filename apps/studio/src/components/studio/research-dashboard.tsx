"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type {
  ResearchFile,
  ResearchState,
  ResearchPriorities,
  HeartbeatStatus,
} from "@sherpa/studio-core"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
        <div className="grid gap-4 lg:grid-cols-2">
          {priorities ? <ResearchPrioritiesPanel priorities={priorities} /> : null}
          {state ? <ResearchStatePanel state={state} /> : null}
        </div>
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
