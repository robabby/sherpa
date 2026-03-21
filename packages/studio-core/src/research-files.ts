import fs from "fs"
import path from "path"
import matter from "gray-matter"

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
