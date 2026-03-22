"use client"

import type { ResearchPriorities } from "@sherpa/studio-core"
import { cn } from "@/lib/utils"

interface ResearchPrioritiesPanelProps {
  priorities: ResearchPriorities
}

export function ResearchPrioritiesPanel({ priorities }: ResearchPrioritiesPanelProps) {
  return (
    <div className="relative rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] p-4 pl-5">
      {/* Gold accent bar */}
      <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-sm bg-gradient-to-b from-[var(--color-gold)]/50 to-transparent" />

      <div className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-dim)] mb-3">
        Priorities
      </div>

      <div className="flex flex-col gap-3">
        {priorities.narrative ? (
          <p className="font-display italic text-sm text-[var(--color-gold-muted)] leading-relaxed">
            {priorities.narrative}
          </p>
        ) : null}

        {priorities.priorities.length > 0 ? (
          <div className="flex flex-col">
            {priorities.priorities.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "rail-node flex items-start gap-3 py-1.5",
                  i === priorities.priorities.length - 1 && "[&::before]:hidden"
                )}
              >
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 font-mono text-[0.625rem] text-[var(--color-gold)]">
                  {i + 1}
                </span>
                <span className="text-[0.8125rem] leading-snug pt-0.5">
                  {item}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
