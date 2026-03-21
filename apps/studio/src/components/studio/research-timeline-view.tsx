"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react"
import type { ResearchFile } from "@sherpa/studio-core"
import { Badge } from "@/components/ui/badge"

type SortDir = "newest" | "oldest"

interface ResearchTimelineViewProps {
  files: ResearchFile[]
  projectSlug: string
}

export function ResearchTimelineView({ files, projectSlug }: ResearchTimelineViewProps) {
  const [sortDir, setSortDir] = useState<SortDir>("newest")

  const sorted = [...files].sort((a, b) => {
    const aKey = `${a.date} ${a.time ?? ""}`
    const bKey = `${b.date} ${b.time ?? ""}`
    return sortDir === "newest"
      ? bKey.localeCompare(aKey)
      : aKey.localeCompare(bKey)
  })

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-end px-3 pb-1">
        <button
          onClick={() => setSortDir((d) => (d === "newest" ? "oldest" : "newest"))}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground"
        >
          {sortDir === "newest" ? (
            <ArrowDownWideNarrow className="shrink-0" />
          ) : (
            <ArrowUpNarrowWide className="shrink-0" />
          )}
          {sortDir === "newest" ? "Newest first" : "Oldest first"}
        </button>
      </div>

      {sorted.map((file) => (
        <Link
          key={file.slug}
          href={`/projects/${projectSlug}/research/${file.slug}`}
          className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-card/50"
        >
          <span className="shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
            {file.date}
            {file.time ? (
              <span className="text-muted-foreground/50"> {file.time}</span>
            ) : null}
          </span>
          {file.category ? (
            <Badge variant="outline" className="shrink-0 mt-px">
              {file.category}
            </Badge>
          ) : null}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{file.title}</span>
            {file.summary ? (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {file.summary}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  )
}
