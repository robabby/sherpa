"use client"

import { Monitor, ShieldCheck, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import type { Provenance, ProvenanceState } from "@sherpa/studio-core"
import { cn } from "./lib/utils"

interface ProvenanceHeaderProps {
  provenance: Provenance
  state: ProvenanceState
  onMarkReviewed?: () => void
}

const stateConfig: Record<
  ProvenanceState,
  {
    icon: typeof Monitor
    label: string
    sublabel: string | null
    bg: string
    border: string
    textColor: string
  }
> = {
  "awaiting-review": {
    icon: Monitor,
    label: "AI-generated",
    sublabel: "Awaiting human review",
    bg: "bg-[var(--color-gold)]/[0.04]",
    border: "border-[var(--color-gold)]/20",
    textColor: "text-[var(--color-gold)]/80",
  },
  verified: {
    icon: ShieldCheck,
    label: "AI-generated",
    sublabel: null,
    bg: "bg-emerald-500/[0.04]",
    border: "border-emerald-500/20",
    textColor: "text-emerald-400/80",
  },
  stale: {
    icon: AlertTriangle,
    label: "Possibly stale",
    sublabel: null,
    bg: "bg-rose-500/[0.04]",
    border: "border-rose-500/20",
    textColor: "text-rose-400/80",
  },
  "human-owned": {
    icon: User,
    label: "Human-authored",
    sublabel: null,
    bg: "bg-muted/30",
    border: "border-border",
    textColor: "text-muted-foreground/70",
  },
}

export function ProvenanceHeader({
  provenance,
  state,
  onMarkReviewed,
}: ProvenanceHeaderProps) {
  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 mb-6",
        config.border,
        config.bg
      )}
    >
      {/* Top row: icon + label + date (left), action (right) */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.textColor)} />
          <span className={cn("text-sm font-medium", config.textColor)}>
            {config.label}
          </span>
          {provenance.lastUpdated && (
            <span className="text-[11px] font-mono text-muted-foreground/50">
              {provenance.lastUpdated}
            </span>
          )}
        </div>

        {/* Action: Mark as Reviewed button (awaiting-review only) */}
        {state === "awaiting-review" && onMarkReviewed && (
          <button
            onClick={onMarkReviewed}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 px-3 py-1 text-xs font-medium text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Mark as Reviewed
          </button>
        )}

        {/* Action: Verified label (verified only) */}
        {state === "verified" && provenance.lastVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Human-verified {provenance.lastVerified}
          </span>
        )}
      </div>

      {/* Middle: sublabel (awaiting-review state) */}
      {config.sublabel && (
        <div className="text-[11px] text-muted-foreground/50 mb-2">
          {config.sublabel}
        </div>
      )}

      {/* Bottom: source initiative badges */}
      {provenance.sourceInitiatives.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
            Sources
          </span>
          {provenance.sourceInitiatives.map((slug) => (
            <Link
              key={slug}
              href={`/process?selected=${slug}`}
              className="inline-flex items-center rounded-full bg-muted/30 border border-muted/50 px-2 py-0.5 text-[11px] font-mono text-muted-foreground/70 hover:border-[var(--color-gold)]/30 transition-colors"
            >
              {slug}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
