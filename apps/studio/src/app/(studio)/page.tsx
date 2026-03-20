export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { HubOperationalPulse } from "@/components/studio/hub-operational-pulse"
import type { AttentionItem, PendingReviewItem } from "@/components/studio/hub-process-panel"
import {
  detectLifecycle,
  getInitiatives,
  getResearchIterations,
  getWorkstreams,
  getPortfolio,
  getSkills,
  getSessions,
} from "@/lib/studio"
import { readProjectFile } from "@/lib/studio/content"
import type { HubStats, Initiative, Session } from "@/lib/studio"
import path from "path"
import { getTaskBoard } from "@/lib/studio/tasks"
import { getBackendHealth, getAllProjects, getPrimarySlug } from "@sherpa/studio-core"

const PROJECT_ROOT = path.resolve(process.cwd(), "../..")
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

function ActionCard({ href, title, description, badge, badgeVariant, days }: {
  href: string; title: string; description: string; badge: string;
  badgeVariant: "review" | "integrate" | "failed" | "stale"; days: number;
}) {
  const badgeColors = {
    review: "bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
    integrate: "bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
    failed: "bg-red-500/10 text-red-400",
    stale: "bg-amber-500/10 text-amber-400",
  }
  const accentColors = {
    review: "bg-[var(--color-gold)]/40",
    integrate: "bg-[var(--color-gold)]/40",
    failed: "bg-red-500/40",
    stale: "bg-amber-500/40",
  }
  return (
    <a href={href} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/30 px-3.5 py-3 transition-colors hover:border-[var(--color-gold)]/15 hover:bg-card/50">
      <div className="flex items-center gap-3">
        <div className={`w-1 self-stretch rounded-full ${accentColors[badgeVariant]}`} />
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="text-[12px] text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded px-2 py-0.5 font-mono text-[11px] ${badgeColors[badgeVariant]}`}>{badge}</span>
        <span className="text-[12px] text-muted-foreground">{days}d</span>
      </div>
    </a>
  )
}

export default async function StudioPage() {
  // Redirect to project-scoped routes
  const projects = getAllProjects()
  if (projects.length > 1) {
    redirect("/projects")
  }
  if (projects.length === 1) {
    redirect(`/projects/${getPrimarySlug()}/process`)
  }

  const initiatives = getInitiatives()
  const workstreams = getWorkstreams()
  const portfolio = getPortfolio()
  const skills = getSkills()
  const sessions = getSessions()
  const tasks = getTaskBoard({ projectRoot: PROJECT_ROOT })
  const health = getBackendHealth(PROJECT_ROOT)
  const mcpData = await getMcpDashboard()

  const attentionNeeded = buildAttentionNeeded(initiatives, workstreams)
  const pendingReview = buildPendingReview(initiatives)
  const failedTasks = tasks.filter((t) => t.status === "failed")
  const activeTasks = tasks.filter((t) => t.status === "dispatched" || t.status === "running")
  const inProgressInitiatives = initiatives.filter((i) => i.status === "in-progress")
  const staleCount = initiatives.filter((i) => {
    if (i.status !== "in-progress" && i.status !== "approved") return false
    const days = daysSinceDate(i.updated, Date.now())
    return days >= 7
  }).length
  const sessionStats = computeSessionStats(sessions)

  // Deduplicate: remove pendingReview items already covered by attentionNeeded
  const attentionSlugs = new Set(attentionNeeded.map((a) => a.slug))
  const uniquePendingReview = pendingReview.filter((p) => !attentionSlugs.has(p.slug))
  const actionCount = attentionNeeded.length + uniquePendingReview.length + failedTasks.length

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* Operational Pulse — unchanged */}
      <HubOperationalPulse
        initiatives={initiatives}
        workstreams={workstreams}
        portfolio={portfolio}
        skillCount={skills.length}
        primitiveCount={0}
        endpointCount={0}
        staleCount={staleCount}
      />

      <div className="mt-8 space-y-8">
        {/* ===== TIER 1: ACTION REQUIRED ===== */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-[var(--color-gold)]" />
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-gold)]/80">
              Action Required
            </h2>
            {actionCount > 0 && (
              <span className="rounded bg-[var(--color-gold)]/10 px-2 py-0.5 font-mono text-[11px] text-[var(--color-gold)]">
                {actionCount} {actionCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {actionCount === 0 ? (
            /* All-clear empty state */
            <div className="rounded-xl py-8 text-center" style={{ background: "radial-gradient(ellipse 400px 80px at 50% 50%, rgba(212,165,116,0.04), transparent)" }}>
              <p className="font-display text-lg text-foreground/60">Nothing needs attention</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                All proposals reviewed · No failed tasks · No stale work
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Attention items (Review/Integrate actions) */}
              {attentionNeeded.map((item) => (
                <ActionCard key={item.slug} href={`/process/${item.slug}`}
                  title={item.title}
                  description={item.action === "Review" ? "Proposal awaiting review" : "Ready for integration"}
                  badge={item.action}
                  badgeVariant={item.action === "Review" ? "review" : "integrate"}
                  days={item.days}
                />
              ))}
              {/* Pending review items (deduplicated) */}
              {uniquePendingReview.map((item) => (
                <ActionCard key={item.slug} href={`/process/${item.slug}`}
                  title={item.title}
                  description="Proposal awaiting review"
                  badge="Review"
                  badgeVariant="review"
                  days={item.days}
                />
              ))}
              {/* Failed tasks */}
              {failedTasks.map((task) => (
                <ActionCard key={task.id} href={`/tasks/${task.id}`}
                  title={task.title || task.id}
                  description={`Task dispatch failed — ${task.backend} backend`}
                  badge="Failed"
                  badgeVariant="failed"
                  days={daysSinceDate(task.created, Date.now())}
                />
              ))}
            </div>
          )}
        </section>

        {/* ===== TIER 2: ACTIVE WORK ===== */}
        <section>
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Active Work
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left column: In-progress initiatives */}
            <div className="rounded-xl border border-border/50 bg-card/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[13px] font-medium text-foreground">In-Progress Initiatives</h3>
                <span className="text-[12px] text-muted-foreground">{inProgressInitiatives.length} active</span>
              </div>
              <div className="space-y-2.5">
                {inProgressInitiatives.slice(0, 8).map((init) => (
                  <a key={init.slug} href={`/process/${init.slug}`} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-400">Active</span>
                      <span className="text-[13px] text-foreground/90 group-hover:text-foreground transition-colors">{init.title}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{daysSinceDate(init.updated, Date.now())}d</span>
                  </a>
                ))}
                {inProgressInitiatives.length === 0 && (
                  <p className="text-[13px] text-muted-foreground">No initiatives in progress</p>
                )}
              </div>
            </div>

            {/* Right column: Active tasks + dispatches */}
            <div className="rounded-xl border border-border/50 bg-card/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[13px] font-medium text-foreground">Tasks &amp; Dispatch</h3>
                <span className="text-[12px] text-muted-foreground">{activeTasks.length} running</span>
              </div>
              <div className="space-y-2.5">
                {activeTasks.slice(0, 6).map((task) => (
                  <a key={task.id} href={`/tasks/${task.id}`} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] text-indigo-400">Running</span>
                      <span className="text-[13px] text-foreground/90 group-hover:text-foreground transition-colors">{task.title || task.id}</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{task.backend}</span>
                  </a>
                ))}
                {activeTasks.length === 0 && (
                  <p className="text-[13px] text-muted-foreground">No tasks running</p>
                )}
                {/* Backend health row */}
                <div className="mt-2 border-t border-border/30 pt-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">Backend Health</span>
                    <div className="flex items-center gap-2">
                      {health.map((b) => (
                        <span key={b.backend} className="flex items-center gap-1">
                          <span className={`inline-block size-1.5 rounded-full ${b.available ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]" : "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.3)]"}`} />
                          <span className="text-muted-foreground">{b.backend}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TIER 3: CONTEXT (collapsed by default) ===== */}
        <section>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-muted-foreground">
              <svg className="size-3.5 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em]">System Status</span>
              <div className="flex items-center gap-1.5 ml-1">
                {health.map((b) => (
                  <span key={b.backend} className={`inline-block size-1.5 rounded-full ${b.available ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]" : "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.3)]"}`} />
                ))}
              </div>
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* MCP */}
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">MCP Server</div>
                <div className="text-sm text-foreground">{mcpData.tools?.length ?? 0} tools registered</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{mcpData.server?.command ? "stdio" : mcpData.server?.url ? "sse" : "unknown"} transport</div>
              </div>
              {/* Sessions */}
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Sessions</div>
                <div className="text-sm text-foreground">{sessionStats.total} total · {sessionStats.thisWeek} this week</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{(sessionStats.weeklyTokens / 1_000_000).toFixed(1)}M tokens weekly</div>
              </div>
              {/* Backends */}
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Backends</div>
                <div className="space-y-1 mt-1">
                  {health.map((b) => (
                    <div key={b.backend} className="flex items-center justify-between text-[12px]">
                      <span className="text-foreground/80">{b.backend}</span>
                      <span className={b.available ? "text-emerald-400" : "text-amber-400"}>{b.available ? "available" : "unavailable"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </section>
      </div>
    </div>
  )
}
