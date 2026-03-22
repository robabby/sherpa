"use client"

import { useCallback, useDeferredValue, useMemo, useState } from "react"
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
import { ResearchFilterBar } from "./research-filter-bar"
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
  nowISO: string
}

export function ResearchDashboard({
  files,
  grouped,
  state,
  priorities,
  heartbeat,
  projectSlug,
  nowISO,
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

  // Filter state
  const rawQuery = searchParams.get("q") ?? ""
  const rawCategories = searchParams.get("categories") ?? ""
  const [query, setQuery] = useState(rawQuery)
  const deferredQuery = useDeferredValue(query)

  const selectedCategories = useMemo(
    () => (rawCategories ? rawCategories.split(",").filter(Boolean) : []),
    [rawCategories],
  )

  const allCategories = useMemo(
    () => [...new Set(files.map((f) => f.category).filter(Boolean))].sort(),
    [files],
  )

  const fileCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const f of files) {
      const cat = f.category || "general"
      counts[cat] = (counts[cat] ?? 0) + 1
    }
    return counts
  }, [files])

  const filteredFiles = useMemo(() => {
    let result = files
    if (deferredQuery) {
      const q = deferredQuery.toLowerCase()
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          (f.summary?.toLowerCase().includes(q) ?? false) ||
          f.category.toLowerCase().includes(q),
      )
    }
    if (selectedCategories.length > 0 && selectedCategories.length < allCategories.length) {
      result = result.filter((f) => selectedCategories.includes(f.category))
    }
    return result
  }, [files, deferredQuery, selectedCategories, allCategories.length])

  const filteredGrouped = useMemo(() => {
    const result: Record<string, ResearchFile[]> = {}
    for (const file of filteredFiles) {
      const key = file.category || "general"
      ;(result[key] ??= []).push(file)
    }
    return result
  }, [filteredFiles])

  const setQueryParam = useCallback(
    (q: string) => {
      setQuery(q)
      const params = new URLSearchParams(searchParams.toString())
      if (q) params.set("q", q)
      else params.delete("q")
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const setCategories = useCallback(
    (cats: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (cats.length > 0 && cats.length < allCategories.length) {
        params.set("categories", cats.join(","))
      } else {
        params.delete("categories")
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, allCategories.length],
  )

  return (
    <div className="flex flex-col gap-6">
      <ResearchHeartbeatIndicator status={heartbeat} />

      {priorities || state ? (
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-[var(--glass-bg-hover)]">
            <ChevronRight className="shrink-0 text-[var(--color-dim)] transition-transform group-data-[state=open]:rotate-90" />
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
              {state ? <ResearchStatePanel state={state} nowISO={nowISO} /> : null}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      <ResearchFilterBar
        query={query}
        onQueryChange={setQueryParam}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        onCategoriesChange={setCategories}
        fileCounts={fileCounts}
      />

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="stream" className="font-display data-[state=active]:text-[var(--color-gold)] data-[state=active]:shadow-[inset_0_-2px_0_var(--color-gold)]">
            Streams
          </TabsTrigger>
          <TabsTrigger value="timeline" className="font-display data-[state=active]:text-[var(--color-gold)] data-[state=active]:shadow-[inset_0_-2px_0_var(--color-gold)]">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="table" className="font-display data-[state=active]:text-[var(--color-gold)] data-[state=active]:shadow-[inset_0_-2px_0_var(--color-gold)]">
            Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stream">
          <ResearchStreamView grouped={filteredGrouped} projectSlug={projectSlug} />
        </TabsContent>

        <TabsContent value="timeline">
          <ResearchTimelineView files={filteredFiles} projectSlug={projectSlug} />
        </TabsContent>

        <TabsContent value="table">
          <ResearchTableView files={filteredFiles} projectSlug={projectSlug} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
