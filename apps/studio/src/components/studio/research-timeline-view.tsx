"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react"
import type { ResearchFile } from "@sherpa/studio-core"
import { renderInlineMarkdown } from "@/lib/render-inline-markdown"
import { cn } from "@/lib/utils"

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
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-muted-foreground bg-[var(--glass-bg)] border border-[var(--glass-border)] transition-colors hover:bg-[var(--glass-bg-hover)] hover:text-foreground"
        >
          {sortDir === "newest" ? (
            <ArrowDownWideNarrow className="shrink-0" />
          ) : (
            <ArrowUpNarrowWide className="shrink-0" />
          )}
          {sortDir === "newest" ? "Newest first" : "Oldest first"}
        </button>
      </div>

      <div className="relative pl-8">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-copper)]/30 to-[var(--color-copper)]/8" />
        {sorted.map((file, i) => (
          <Link
            key={file.slug}
            href={`/projects/${projectSlug}/research/${file.slug}`}
            className="relative block rounded-lg px-4 py-3 ml-2 transition-colors hover:bg-[var(--surface-hover)] animate-[panel-glow-in_0.5s_ease-out_both]"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Dot on the spine */}
            <div className="absolute -left-[1.625rem] top-[1.125rem] size-[7px] rounded-full bg-[var(--color-copper)] border-2 border-background shadow-[0_0_0_1px_rgba(196,154,108,0.3)] transition-transform" />
            {/* Entry content */}
            <div className="flex items-start gap-3">
              <span className="shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
                {file.date}
                {file.time ? (
                  <span className="text-muted-foreground/50"> {file.time}</span>
                ) : null}
              </span>
              {file.category ? (
                <span className="inline-flex shrink-0 mt-px items-center rounded-md border border-[var(--border-gold)] px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground">
                  {file.category}
                </span>
              ) : null}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{file.title}</span>
                {file.summary ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {renderInlineMarkdown(file.summary)}
                  </p>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
