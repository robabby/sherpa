import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import {
  getProject,
  scanResearchFiles,
  parseResearchState,
  parseResearchPriorities,
  getHeartbeatStatus,
  countTodayHeartbeats,
} from "@/lib/studio"
import type { ResearchFile } from "@/lib/studio"
import { RefreshOnFocus } from "@/components/refresh-on-focus"
import { AutoRefreshInterval } from "@/components/auto-refresh-interval"
import { ResearchDashboard } from "@/components/studio/research-dashboard"

export const metadata: Metadata = {
  title: "Research | Studio",
  robots: "noindex, nofollow",
}

export default async function ProjectResearchPage({
  params,
}: {
  params: Promise<{ project: string }>
}) {
  const { project: slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  // Opt into dynamic rendering before accessing Date.now()
  await connection()
  const now = new Date()
  const todayDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(now) // YYYY-MM-DD in Pacific

  // Load all data
  const files = scanResearchFiles(project.root)
  const state = parseResearchState(project.root)
  const priorities = parseResearchPriorities(project.root)
  const heartbeatCount = countTodayHeartbeats(project.root, todayDate)
  const heartbeat = getHeartbeatStatus(
    state?.lastUpdated ?? null,
    heartbeatCount,
    now,
  )

  // Group by category for stream view (server-side)
  const grouped: Record<string, ResearchFile[]> = {}
  for (const file of files) {
    const key = file.category || "general"
    ;(grouped[key] ??= []).push(file)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <RefreshOnFocus />
      <AutoRefreshInterval intervalMs={300_000} />

      <h1 className="font-display text-2xl mb-6">
        <span className="bg-gradient-to-r from-foreground to-[var(--color-gold)] bg-clip-text text-transparent">
          Research
        </span>
      </h1>

      {files.length === 0 && !state && !priorities ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No research files found in .sherpa/research/
          </p>
        </div>
      ) : (
        <Suspense fallback={null}>
          <ResearchDashboard
            files={files}
            grouped={grouped}
            state={state}
            priorities={priorities}
            heartbeat={heartbeat}
            projectSlug={slug}
            nowISO={now.toISOString()}
          />
        </Suspense>
      )}
    </div>
  )
}
