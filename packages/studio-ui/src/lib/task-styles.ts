// ---------------------------------------------------------------------------
// Shared badge style maps & formatting helpers for task UI components.
// Single source of truth — imported by mission-* components and legacy panels.
// ---------------------------------------------------------------------------

import { formatDistanceToNowStrict } from "date-fns";
import { BACKEND_META } from "@sherpa/studio-core/dispatch-meta";
import type { BackendMeta } from "@sherpa/studio-core/dispatch-meta";

// ---------------------------------------------------------------------------
// Badge style records
// ---------------------------------------------------------------------------

export const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "pending",
    className: "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground",
  },
  dispatched: {
    label: "dispatched",
    className:
      "border-[var(--color-copper)]/40 bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
  },
  completed: {
    label: "completed",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  },
  failed: {
    label: "failed",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  },
  reviewed: {
    label: "reviewed",
    className:
      "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  },
};

export const STATUS_DOT: Record<string, string> = {
  pending: "bg-muted-foreground",
  dispatched: "bg-[var(--color-copper)]",
  completed: "bg-emerald-500",
  reviewed: "bg-[var(--color-gold)]",
  failed: "bg-rose-500",
};

export const VERDICT_STYLES: Record<string, { label: string; className: string }> = {
  approved: {
    label: "approved",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  },
  "needs-changes": {
    label: "needs changes",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  },
  rejected: {
    label: "rejected",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  },
  pending: {
    label: "pending",
    className: "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground",
  },
};

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-[var(--color-gold)]",
  medium: "bg-[var(--color-copper)]",
  low: "bg-[var(--color-bronze)]",
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Compact age string: "2h", "3d", "1mo". Returns "" for invalid input. */
export function formatAge(isoDate: string): string {
  if (!isoDate) return "";
  try {
    const d = isoDate.match(/^\d{4}-\d{2}-\d{2}$/)
      ? new Date(isoDate + "T00:00:00")
      : new Date(isoDate);
    if (isNaN(d.getTime())) return "";
    const str = formatDistanceToNowStrict(d, { addSuffix: false });
    return str
      .replace(/ seconds?/, "s")
      .replace(/ minutes?/, "m")
      .replace(/ hours?/, "h")
      .replace(/ days?/, "d")
      .replace(/ months?/, "mo")
      .replace(/ years?/, "y");
  } catch {
    return "";
  }
}

/** Compact duration from seconds: "42s", "2m 34s", "1h 12m", or "\u2014" for null. */
export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "\u2014";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Compact token count: "12.4K", "847", or "\u2014" for null. */
export function formatTokens(count: number | null): string {
  if (count == null) return "\u2014";
  return compactFormatter.format(count);
}

/** Dollar amount: "$0.03", "$0.0004", or "\u2014" for null. */
export function formatCost(usd: number | null): string {
  if (usd == null) return "\u2014";
  // Show enough precision so small costs don't round to $0.00
  if (usd >= 0.01) return `$${usd.toFixed(2)}`;
  if (usd >= 0.001) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(4)}`;
}

// ---------------------------------------------------------------------------
// Backend metadata
// ---------------------------------------------------------------------------

/** Safely look up backend metadata. Returns undefined for unknown backends. */
export function getBackendMeta(backend: string): BackendMeta | undefined {
  return (BACKEND_META as Record<string, BackendMeta>)[backend];
}
