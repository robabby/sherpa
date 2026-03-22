"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ResearchFilterBarProps {
  query: string
  onQueryChange: (query: string) => void
  allCategories: string[]
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  fileCounts: Record<string, number>
}

export function ResearchFilterBar({
  query,
  onQueryChange,
  allCategories,
  selectedCategories,
  onCategoriesChange,
  fileCounts,
}: ResearchFilterBarProps) {
  const allSelected =
    selectedCategories.length === 0 || selectedCategories.length === allCategories.length

  function toggleCategory(cat: string) {
    if (allSelected) {
      onCategoriesChange([cat])
    } else if (selectedCategories.includes(cat)) {
      const next = selectedCategories.filter((c) => c !== cat)
      onCategoriesChange(next.length === 0 ? [] : next)
    } else {
      onCategoriesChange([...selectedCategories, cat])
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] px-4 py-2.5 flex-wrap">
      {/* Search input */}
      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-dim)]" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search research..."
          className="pl-9 w-full max-w-[20rem] bg-transparent border-[var(--glass-border)] focus-visible:border-[var(--color-gold)]/30 focus-visible:ring-[var(--color-gold)]/8"
        />
        {query ? (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-dim)] hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="font-mono text-[0.625rem] text-[var(--color-dim)] uppercase tracking-[0.1em] mr-1">
          Streams:
        </span>
        {allCategories.map((cat) => {
          const isActive = allSelected || selectedCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition-colors",
                isActive
                  ? "text-[var(--color-gold)] bg-[var(--color-gold)]/6"
                  : "text-muted-foreground hover:bg-[var(--surface-hover)]",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  isActive
                    ? "bg-[var(--color-gold)] shadow-[0_0_4px_var(--glow-gold)]"
                    : "border border-[var(--color-dim)]",
                )}
              />
              {cat}
              <span className="text-[0.625rem] text-[var(--color-dim)]">
                {fileCounts[cat] ?? 0}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
