"use client"

import { useState } from "react"
import Link from "next/link"
import type { ResearchFile } from "@sherpa/studio-core"
import { Badge } from "@/components/ui/badge"

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
    sortKey === key ? (sortDir === "asc" ? " \u2191" : " \u2193") : ""

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 text-muted-foreground/60">
            <th
              className="cursor-pointer pb-2 text-left font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("date")}
            >
              Date{arrow("date")}
            </th>
            <th
              className="cursor-pointer pb-2 text-left font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("category")}
            >
              Category{arrow("category")}
            </th>
            <th
              className="cursor-pointer pb-2 text-left font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("title")}
            >
              Title{arrow("title")}
            </th>
            <th className="pb-2 text-left font-normal">Summary</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((file) => (
            <tr key={file.slug} className="border-b border-border/10">
              <td className="py-2 font-mono text-xs">{file.date}</td>
              <td className="py-2">
                {file.category ? (
                  <Badge variant="outline">{file.category}</Badge>
                ) : null}
              </td>
              <td className="py-2">
                <Link
                  href={`/projects/${projectSlug}/research/${file.slug}`}
                  className="text-foreground hover:underline"
                >
                  {file.title}
                </Link>
              </td>
              <td className="max-w-xs truncate py-2 text-muted-foreground">
                {file.summary ?? "\u2014"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
