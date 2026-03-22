"use client"

import { useState } from "react"
import Link from "next/link"
import type { ResearchFile } from "@sherpa/studio-core"
import { renderInlineMarkdown } from "@/lib/render-inline-markdown"

type SortKey = "date" | "category" | "title"
type SortDir = "asc" | "desc"

interface ResearchTableViewProps {
  files: ResearchFile[]
  projectSlug: string
}

export function ResearchTableView({ files, projectSlug }: ResearchTableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const sorted = [...files].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1
    if (sortKey === "date") {
      const aVal = `${a.date} ${a.time ?? ""}`
      const bVal = `${b.date} ${b.time ?? ""}`
      return aVal.localeCompare(bVal) * dir
    }
    const aVal = a[sortKey] ?? ""
    const bVal = b[sortKey] ?? ""
    return aVal.localeCompare(bVal) * dir
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "date" ? "desc" : "asc")
    }
  }

  const arrow = (key: SortKey) =>
    sortKey === key ? (
      <span className="text-[var(--color-gold)]">{sortDir === "asc" ? " \u2191" : " \u2193"}</span>
    ) : null

  return (
    <div className="rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-warm-charcoal)]/50 border-b border-[var(--border-gold)]">
            <th
              className="cursor-pointer px-4 py-2.5 text-left font-mono text-xs font-normal uppercase tracking-[0.1em] text-[var(--color-dim)] transition-colors hover:text-[var(--color-copper)]"
              onClick={() => toggleSort("date")}
            >
              Date{arrow("date")}
            </th>
            <th
              className="cursor-pointer px-4 py-2.5 text-left font-mono text-xs font-normal uppercase tracking-[0.1em] text-[var(--color-dim)] transition-colors hover:text-[var(--color-copper)]"
              onClick={() => toggleSort("category")}
            >
              Category{arrow("category")}
            </th>
            <th
              className="cursor-pointer px-4 py-2.5 text-left font-mono text-xs font-normal uppercase tracking-[0.1em] text-[var(--color-dim)] transition-colors hover:text-[var(--color-copper)]"
              onClick={() => toggleSort("title")}
            >
              Title{arrow("title")}
            </th>
            <th className="px-4 py-2.5 text-left font-mono text-xs font-normal uppercase tracking-[0.1em] text-[var(--color-dim)]">
              Summary
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((file) => (
            <tr key={file.slug} className="group border-b border-[rgba(255,255,255,0.02)] transition-colors hover:bg-[var(--surface-hover)]">
              <td className="px-4 py-2.5 font-mono text-xs">
                {file.date}
                {file.time ? (
                  <span className="text-muted-foreground/50"> {file.time}</span>
                ) : null}
              </td>
              <td className="px-4 py-2.5">
                {file.category ? (
                  <span className="inline-flex items-center rounded-md border border-[var(--border-gold)] px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground">
                    {file.category}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-2.5">
                <Link
                  href={`/projects/${projectSlug}/research/${file.slug}`}
                  className="text-foreground transition-colors group-hover:text-[var(--color-gold)]"
                >
                  {file.title}
                </Link>
              </td>
              <td className="max-w-xs truncate px-4 py-2.5 text-muted-foreground">
                {file.summary ? renderInlineMarkdown(file.summary) : "\u2014"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
