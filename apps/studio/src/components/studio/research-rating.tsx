"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ResearchRatingProps {
  projectSlug: string
  filePath: string
  initialRating: 1 | -1 | null
}

export function ResearchRating({ projectSlug, filePath, initialRating }: ResearchRatingProps) {
  const [rating, setRating] = useState<1 | -1 | null>(initialRating)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleRate(value: 1 | -1) {
    const next = rating === value ? null : value
    setSaving(true)
    try {
      const res = await fetch("/api/research/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectSlug, path: filePath, rating: next }),
      })
      if (res.ok) {
        setRating(next)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={saving}
        onClick={() => handleRate(1)}
        className={cn(
          "h-7 px-2 text-sm",
          rating === 1
            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-500"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        +1
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={saving}
        onClick={() => handleRate(-1)}
        className={cn(
          "h-7 px-2 text-sm",
          rating === -1
            ? "bg-red-500/10 text-red-400 hover:bg-red-500/15 hover:text-red-400"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        -1
      </Button>
    </div>
  )
}
