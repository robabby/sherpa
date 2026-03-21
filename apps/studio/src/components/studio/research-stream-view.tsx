"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { ResearchFile } from "@sherpa/studio-core"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

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
      {entries.map(([category, files]) => {
        const latest = files[0]
        return (
          <Collapsible key={category} defaultOpen={files.length <= 5}>
            <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-lg border border-border/50 bg-card/30 px-4 py-3 text-left transition-colors hover:bg-card/50">
              <ChevronRight className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-medium text-foreground">
                    {formatStreamName(category)}
                  </span>
                  <Badge variant="secondary">{files.length}</Badge>
                </div>
                {latest?.summary ? (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {latest.summary}
                  </p>
                ) : null}
              </div>
              {latest ? (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {latest.date}
                </span>
              ) : null}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-7 flex flex-col gap-0.5 border-l border-border/30 pl-4 pt-1">
                {files.map((file) => (
                  <Link
                    key={file.slug}
                    href={`/projects/${projectSlug}/research/${file.slug}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-card/50"
                  >
                    <span className="text-foreground">{file.title}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {file.date}
                    </span>
                  </Link>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}
