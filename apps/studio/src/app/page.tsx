export const dynamic = "force-dynamic"

import { StudioHeader } from "@/components/studio/studio-header"
import {
  HubAmbientGlow,
  HubStagger,
  HubStaggerItem,
} from "@/components/studio/hub-stagger"
import { HubOperationalPulse } from "@/components/studio/hub-operational-pulse"
import { HubProcessPanel } from "@/components/studio/hub-process-panel"
import { HubDocsPanel } from "@/components/studio/hub-docs-panel"
import { HubConventionsPanel } from "@/components/studio/hub-conventions-panel"
import { HubActivityPanel } from "@/components/studio/hub-activity-panel"
import { HubSkillsPanel } from "@/components/studio/hub-skills-panel"
import { HubWorkforcePanel } from "@/components/studio/hub-workforce-panel"
import { HubSessionsPanel } from "@/components/studio/hub-sessions-panel"
import { HubTasksPanel } from "@/components/studio/hub-tasks-panel"
import { HubMcpPanel } from "@/components/studio/hub-mcp-panel"
import { HubWorkflowPanel } from "@/components/studio/hub-workflow-panel"
import type { AttentionItem, PendingReviewItem } from "@/components/studio/hub-process-panel"
import {
  detectLifecycle,
  getAllVelocity,
  getAgentRoles,
  getInitiatives,
  getResearchIterations,
  getWorkstreams,
  getPortfolio,
  getDocsByCategory,
  getConventions,
  getSkills,
  getSessions,
} from "@/lib/studio"
import { readProjectFile } from "@/lib/studio/content"
import type { HubStats, Initiative, Session } from "@/lib/studio"
import { getTaskBoard } from "@/lib/studio/tasks"
import { getMcpDashboard } from "@/lib/studio/mcp"

function computeSessionStats(sessions: Session[]): HubStats["sessions"] {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekAgoStr = weekAgo.toISOString()

  let totalTokens = 0
  let weeklyTokens = 0
  let thisWeek = 0

  for (const s of sessions) {
    const t = s.tokens.input + s.tokens.output
    totalTokens += t
    if (s.startedAt >= weekAgoStr) {
      thisWeek++
      weeklyTokens += t
    }
  }

  return { total: sessions.length, thisWeek, totalTokens, weeklyTokens }
}

function daysSinceDate(dateStr: string, now: number): number {
  const d = dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
    ? new Date(dateStr + "T00:00:00")
    : new Date(dateStr)
  if (isNaN(d.getTime())) return 0
  return Math.max(0, Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24)))
}

function buildPendingReview(initiatives: Initiative[]): PendingReviewItem[] {
  const now = Date.now()
  return initiatives
    .filter((i) => i.status === "pending")
    .map((init) => ({
      slug: init.slug,
      title: init.title,
      days: daysSinceDate(init.created, now),
    }))
    .sort((a, b) => b.days - a.days)
}

function buildAttentionNeeded(
  initiatives: Initiative[],
  workstreams: { slug: string; status: string; initiative: string | null }[],
): AttentionItem[] {
  const now = Date.now()

  const wsByInitiative = new Map<string, string>()
  for (const ws of workstreams) {
    if (!ws.initiative) continue
    const rootSlug = ws.initiative.split("/")[0]!
    const existing = wsByInitiative.get(rootSlug)
    if (
      !existing ||
      ws.status === "active" ||
      (ws.status === "completed" && existing !== "active")
    ) {
      wsByInitiative.set(rootSlug, ws.status)
    }
  }

  const items: AttentionItem[] = []

  for (const init of initiatives) {
    const basePath = `docs/initiatives/${init.slug}`
    const research = getResearchIterations(init.slug, basePath)
    const iterationCount = research.iterations.length
    const hasPlan =
      readProjectFile(`${basePath}/plan.md`) !== null ||
      init.subDirectories.some((d) => d.name === "phases")
    const linkedStatus = wsByInitiative.get(init.slug) ?? null

    const lifecycle = detectLifecycle({
      status: init.status,
      hasResearch: iterationCount > 0,
      iterationCount,
      hasPlan,
      linkedWorkstreamStatus: linkedStatus,
    })

    if (lifecycle.actor !== "human") continue

    const days = daysSinceDate(init.updated, now)
    const actionLabel =
      lifecycle.stage === "needs-review" ? "Review" : "Integrate"

    items.push({
      slug: init.slug,
      title: init.title,
      action: actionLabel,
      days,
    })
  }

  return items.sort((a, b) => b.days - a.days)
}

export default async function StudioPage() {
  const initiatives = getInitiatives()
  const workstreams = getWorkstreams()
  const portfolio = getPortfolio()
  const docsByCategory = getDocsByCategory()
  const conventions = getConventions()
  const skills = getSkills()
  const agentRoles = getAgentRoles()
  const sessions = getSessions()
  const tasks = getTaskBoard()
  const mcpData = await getMcpDashboard()

  const velocityInputs = initiatives.map((init) => {
    const linkedWs = workstreams.filter((ws) =>
      ws.initiative?.startsWith(init.slug),
    )
    return {
      slug: init.slug,
      activityLog: linkedWs.flatMap((ws) => ws.activityLog),
    }
  })
  const velocityMap = getAllVelocity(velocityInputs)

  const staleCount = [...velocityMap.values()].filter(
    (v) => v.staleDays != null && v.staleDays >= 7,
  ).length

  return (
    <div className="relative mx-auto max-w-6xl">
      <StudioHeader />
      <HubAmbientGlow className="pointer-events-none absolute left-1/2 top-12 h-[200px] w-[400px] -translate-x-1/2 blur-[120px]" />

      <HubStagger className="relative space-y-8">
        <HubStaggerItem variant="fade">
          <HubOperationalPulse
            initiatives={initiatives}
            workstreams={workstreams}
            portfolio={portfolio}
            skillCount={skills.length}
            primitiveCount={0}
            endpointCount={0}
            staleCount={staleCount}
          />
        </HubStaggerItem>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Row 1: process + docs */}
          <HubStaggerItem variant="panel" className="lg:col-span-5">
            <HubProcessPanel
              initiatives={initiatives}
              workstreams={workstreams}
              velocityMap={velocityMap}
              pendingReview={buildPendingReview(initiatives)}
              attentionNeeded={buildAttentionNeeded(initiatives, workstreams)}
            />
          </HubStaggerItem>
          <HubStaggerItem variant="panel" className="lg:col-span-7">
            <HubDocsPanel docsByCategory={docsByCategory} />
          </HubStaggerItem>

          {/* Row 2: activity feed */}
          <HubStaggerItem variant="panel" className="lg:col-span-12">
            <HubActivityPanel recentActivity={portfolio.recentActivity} />
          </HubStaggerItem>

          {/* Row 3: conventions + skills */}
          <HubStaggerItem variant="panel" className="lg:col-span-5">
            <HubConventionsPanel conventions={conventions} />
          </HubStaggerItem>
          <HubStaggerItem variant="panel" className="lg:col-span-7">
            <HubSkillsPanel skills={skills} />
          </HubStaggerItem>

          {/* Row 4: tasks + workforce */}
          <HubStaggerItem variant="panel" className="lg:col-span-5">
            <HubTasksPanel tasks={tasks} />
          </HubStaggerItem>
          <HubStaggerItem variant="panel" className="lg:col-span-7">
            <HubWorkforcePanel roles={agentRoles} workstreams={workstreams} />
          </HubStaggerItem>

          {/* Row 5: sessions + MCP */}
          <HubStaggerItem variant="panel" className="lg:col-span-7">
            <HubSessionsPanel
              sessions={sessions}
              stats={computeSessionStats(sessions)}
            />
          </HubStaggerItem>
          <HubStaggerItem variant="panel" className="lg:col-span-5">
            <HubMcpPanel data={mcpData} />
          </HubStaggerItem>

          {/* Row 6: workflow */}
          <HubStaggerItem variant="panel" className="lg:col-span-5">
            <HubWorkflowPanel />
          </HubStaggerItem>
        </div>
      </HubStagger>
    </div>
  )
}
