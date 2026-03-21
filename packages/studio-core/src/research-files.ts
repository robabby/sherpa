import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { extractSection, parseMarkdownTable, extractNumberedItems } from "./markdown"

export interface ResearchFile {
  title: string
  date: string
  time?: string
  category: string
  slug: string
  relativePath: string
  summary?: string
  trigger?: string
}

function formatDate(value: unknown): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

function parseResearchFile(absPath: string, fileName: string, category: string): ResearchFile | null {
  try {
    const raw = fs.readFileSync(absPath, "utf-8")
    const { data, content } = matter(raw)
    const title =
      data.title ??
      content.match(/^#\s+(.+)$/m)?.[1] ??
      fileName.replace(/\.md$/, "")
    const date = formatDate(data.date) ?? fileName.replace(/\.md$/, "")
    const slug = category ? `${category}/${fileName.replace(/\.md$/, "")}` : fileName.replace(/\.md$/, "")
    const relativePath = category ? `${category}/${fileName}` : fileName
    const summary = typeof data.summary === "string" ? data.summary.trim() : undefined
    const trigger = typeof data.trigger === "string" ? data.trigger.trim() : undefined
    // Extract time from heartbeat-style filenames: YYYY-MM-DD-HHmm-slug.md
    const timeMatch = fileName.match(/^\d{4}-\d{2}-\d{2}-(\d{2})(\d{2})-/)
    const time = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : undefined
    return { title, date, time, category, slug, relativePath, summary, trigger }
  } catch {
    console.warn(`[sherpa] Skipping research file with invalid frontmatter: ${absPath}`)
    return null
  }
}

export function scanResearchFiles(projectRoot: string): ResearchFile[] {
  const researchDir = path.join(projectRoot, ".sherpa", "research")
  if (!fs.existsSync(researchDir)) return []

  const files: ResearchFile[] = []

  const entries = fs.readdirSync(researchDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      if (entry.name.endsWith(".md") && !/^[A-Z_]+\.md$/.test(entry.name)) {
        const file = parseResearchFile(path.join(researchDir, entry.name), entry.name, "")
        if (file) files.push(file)
      }
      continue
    }

    const category = entry.name
    const catDir = path.join(researchDir, category)
    const catEntries = fs.readdirSync(catDir, { withFileTypes: true })

    for (const catEntry of catEntries) {
      if (!catEntry.isFile() || !catEntry.name.endsWith(".md")) continue
      const file = parseResearchFile(path.join(catDir, catEntry.name), catEntry.name, category)
      if (file) files.push(file)
    }
  }

  return files.sort((a, b) => b.date.localeCompare(a.date))
}

export interface CoverageEntry {
  stream: string
  lastRun: string
  findings: string
}

export interface DanglingThread {
  text: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null
}

export interface QueueItem {
  text: string
  completed: boolean
}

export interface ResearchState {
  lastUpdated: string | null
  coverageMap: CoverageEntry[]
  danglingThreads: DanglingThread[]
  researchQueue: QueueItem[]
}

export function parseResearchState(projectRoot: string): ResearchState | null {
  const filePath = path.join(projectRoot, ".sherpa", "research", "RESEARCH_STATE.md")
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, "utf-8")

    const lastUpdatedSection = extractSection(raw, "Last Updated")
    const lastUpdated = lastUpdatedSection?.trim() ?? null

    const coverageSection = extractSection(raw, "Coverage Map")
    const coverageRows = coverageSection ? parseMarkdownTable(coverageSection) : []
    const coverageMap: CoverageEntry[] = coverageRows.map(
      ([stream = "", lastRun = "", findings = ""]) => ({ stream, lastRun, findings })
    )

    const threadsSection = extractSection(raw, "Dangling Threads")
    const threadItems = threadsSection ? extractNumberedItems(threadsSection) : []
    const danglingThreads: DanglingThread[] = threadItems.map((text) => ({
      text,
      severity: /CRITICAL/i.test(text) ? "CRITICAL"
        : /HIGH/i.test(text) ? "HIGH"
        : /MEDIUM/i.test(text) ? "MEDIUM"
        : /LOW/i.test(text) ? "LOW"
        : null,
    }))

    const queueSection = extractSection(raw, "Research Queue")
    const queueItems = queueSection ? extractNumberedItems(queueSection) : []
    const researchQueue: QueueItem[] = queueItems.map((text) => ({
      text: text.replace(/~~(.+?)~~/g, "$1").replace(/✅/g, "").trim(),
      completed: /✅/.test(text) || /~~.+~~/.test(text),
    }))

    return { lastUpdated, coverageMap, danglingThreads, researchQueue }
  } catch {
    console.warn(`[sherpa] Failed to parse RESEARCH_STATE.md: ${filePath}`)
    return null
  }
}

export interface ResearchPriorities {
  narrative: string | null
  priorities: string[]
  focusAreas: string[]
}

export function parseResearchPriorities(projectRoot: string): ResearchPriorities | null {
  const filePath = path.join(projectRoot, ".sherpa", "research", "PRIORITIES.md")
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, "utf-8")

    const narrative = extractSection(raw, "The Narrative")?.trim() ?? null

    const prioritiesSection = extractSection(raw, "Current Priorities")
    const priorities = prioritiesSection ? extractNumberedItems(prioritiesSection) : []

    const focusSection = extractSection(raw, "What Research Should Focus On")
    const focusAreas = focusSection ? extractNumberedItems(focusSection) : []

    return { narrative, priorities, focusAreas }
  } catch {
    console.warn(`[sherpa] Failed to parse PRIORITIES.md: ${filePath}`)
    return null
  }
}

export type HeartbeatState = "active" | "pending" | "offline"

export interface HeartbeatStatus {
  status: HeartbeatState
  minutesUntilNext: number | null
  heartbeatCountToday: number
  lastUpdated: string | null
  message: string
}

function getPacificTime(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10)
  return { hour: get("hour") % 24, minute: get("minute") }
}

export function getHeartbeatStatus(
  lastUpdated: string | null,
  heartbeatCountToday: number,
  now: Date = new Date(),
): HeartbeatStatus {
  const { hour, minute } = getPacificTime(now)
  const isActiveHours = hour >= 8 && hour < 23

  if (!isActiveHours) {
    return {
      status: "offline",
      minutesUntilNext: null,
      heartbeatCountToday,
      lastUpdated,
      message: "Heartbeats resume at 8:00 AM PT",
    }
  }

  if (lastUpdated) {
    const elapsed = now.getTime() - new Date(lastUpdated).getTime()
    if (elapsed < 35 * 60 * 1000) {
      return {
        status: "active",
        minutesUntilNext: null,
        heartbeatCountToday,
        lastUpdated,
        message: "Research active",
      }
    }
  }

  const minutesUntilNext = 30 - (minute % 30)
  return {
    status: "pending",
    minutesUntilNext,
    heartbeatCountToday,
    lastUpdated,
    message: `Next heartbeat in ~${minutesUntilNext}m`,
  }
}

export function countTodayHeartbeats(projectRoot: string, todayDate: string): number {
  const hbDir = path.join(projectRoot, ".sherpa", "research", "heartbeat")
  if (!fs.existsSync(hbDir)) return 0

  try {
    const entries = fs.readdirSync(hbDir)
    return entries.filter((name) => name.startsWith(todayDate) && name.endsWith(".md")).length
  } catch {
    return 0
  }
}
