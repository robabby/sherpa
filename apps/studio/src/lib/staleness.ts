export type Staleness = "fresh" | "aging" | "stale"

export function getStaleness(lastRun: string, nowISO: string): Staleness {
  const lastMs = new Date(lastRun).getTime()
  if (Number.isNaN(lastMs)) return "fresh"
  const nowMs = new Date(nowISO).getTime()
  const daysSince = (nowMs - lastMs) / (1000 * 60 * 60 * 24)
  if (daysSince <= 2) return "fresh"
  if (daysSince <= 7) return "aging"
  return "stale"
}

export const stalenessColor: Record<Staleness, string> = {
  fresh: "bg-emerald-500",
  aging: "bg-amber-400",
  stale: "bg-red-500 animate-[led-pulse_2s_ease-in-out_infinite]",
}
