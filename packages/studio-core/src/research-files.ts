import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { extractSection, parseMarkdownTable, extractNumberedItems } from "./markdown"

export interface ResearchFile {
  title: string
  date: string
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
    return { title, date, category, slug, relativePath, summary, trigger }
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
