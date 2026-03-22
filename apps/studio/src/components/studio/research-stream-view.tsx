"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { ResearchFile } from "@sherpa/studio-core"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { renderInlineMarkdown } from "@/lib/render-inline-markdown"
import { cn } from "@/lib/utils"

const accentColors = [
  "var(--color-gold)",
  "var(--color-copper)",
  "var(--color-bronze)",
  "#34d399",
  "var(--color-gold-muted)",
]

interface ResearchStreamViewProps {
  grouped: Record<string, ResearchFile[]>
  projectSlug: string
}

function formatStreamName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "General"
}

export function ResearchStreamView({ grouped, projectSlug }: ResearchStreamViewProps) {
  const entries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([category, files], i) => {
        const latest = files[0]
        return (
          <Collapsible key={category} defaultOpen={files.length <= 5}>
            <div className="rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] overflow-hidden transition-colors hover:border-[var(--glass-border-hover)]">
              <CollapsibleTrigger className="group relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--glass-bg-hover)]">
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm"
                  style={{ background: `linear-gradient(to bottom, ${accentColors[i % accentColors.length]}, transparent)` }}
                />
                <ChevronRight className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-medium text-foreground">
                      {formatStreamName(category)}
                    </span>
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[0.6875rem] bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/15">
                      {files.length}
                    </span>
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {latest?.summary ? renderInlineMarkdown(latest.summary) : null}
                  </p>
                </div>
                {latest ? (
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {latest.date}
                  </span>
                ) : null}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-7 flex flex-col gap-0.5 border-l border-[var(--border-gold)] pl-4 pt-1">
                  {files.map((file) => (
                    <Link
                      key={file.slug}
                      href={`/projects/${projectSlug}/research/${file.slug}`}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      <span className="text-foreground">
                        {file.title}
                        {file.rating === 1 ? <span className="ml-1.5 text-emerald-500 text-xs">+1</span> : null}
                        {file.rating === -1 ? <span className="ml-1.5 text-red-400 text-xs">-1</span> : null}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {file.date}
                      </span>
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}
