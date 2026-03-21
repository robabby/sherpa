"use client"

import Link from "next/link"
import type { ResearchFile } from "@sherpa/studio-core"
import { Badge } from "@/components/ui/badge"

interface ResearchTimelineViewProps {
  files: ResearchFile[]
  projectSlug: string
}

export function ResearchTimelineView({ files, projectSlug }: ResearchTimelineViewProps) {
  return (
    <div className="flex flex-col gap-1">
      {files.map((file) => (
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
