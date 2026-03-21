import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface ResearchFile {
  title: string
  date: string
  category: string
  slug: string
  relativePath: string
}

function formatDate(value: unknown): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

export function scanResearchFiles(projectRoot: string): ResearchFile[] {
  const researchDir = path.join(projectRoot, ".sherpa", "research")
  if (!fs.existsSync(researchDir)) return []

  const files: ResearchFile[] = []

  const entries = fs.readdirSync(researchDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      if (entry.name.endsWith(".md")) {
        const absPath = path.join(researchDir, entry.name)
        const raw = fs.readFileSync(absPath, "utf-8")
        const { data, content } = matter(raw)
        const title =
          data.title ??
          content.match(/^#\s+(.+)$/m)?.[1] ??
          entry.name.replace(/\.md$/, "")
        const date = formatDate(data.date) ?? entry.name.replace(/\.md$/, "")
        const slug = entry.name.replace(/\.md$/, "")
        files.push({ title, date, category: "", slug, relativePath: entry.name })
      }
      continue
    }

    const category = entry.name
    const catDir = path.join(researchDir, category)
    const catEntries = fs.readdirSync(catDir, { withFileTypes: true })

    for (const catEntry of catEntries) {
      if (!catEntry.isFile() || !catEntry.name.endsWith(".md")) continue
      const absPath = path.join(catDir, catEntry.name)
      const raw = fs.readFileSync(absPath, "utf-8")
      const { data, content } = matter(raw)
      const title =
        data.title ??
        content.match(/^#\s+(.+)$/m)?.[1] ??
        catEntry.name.replace(/\.md$/, "")
      const date = formatDate(data.date) ?? catEntry.name.replace(/\.md$/, "")
      const slug = `${category}/${catEntry.name.replace(/\.md$/, "")}`
      files.push({
        title,
        date,
        category,
        slug,
        relativePath: `${category}/${catEntry.name}`,
      })
    }
  }

  return files.sort((a, b) => b.date.localeCompare(a.date))
}
