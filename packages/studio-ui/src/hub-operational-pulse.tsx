import type { Initiative, PortfolioData, Workstream } from "@/lib/studio";

interface HubOperationalPulseProps {
  initiatives: Initiative[];
  workstreams: Workstream[];
  portfolio: PortfolioData;
  skillCount?: number;
  primitiveCount?: number;
  endpointCount?: number;
  staleCount?: number;
}

export function HubOperationalPulse({
  initiatives,
  workstreams,
  portfolio,
  skillCount,
  primitiveCount,
  endpointCount,
  staleCount,
}: HubOperationalPulseProps) {
  const activeWorkstreams = workstreams.filter(
    (w) => w.status === "active"
  ).length;
  const pendingReview = initiatives.filter(
    (i) => i.status === "pending"
  ).length;
  const projectCount = portfolio.apps.length;

  // Find the most recent activity date across all sources
  const lastActivity =
    portfolio.lastUpdated ||
    initiatives
      .map((i) => i.updated)
      .sort()
      .pop() ||
    "";
  const lastActivityDisplay = lastActivity
    ? formatShortDate(lastActivity)
    : "—";

  const segments: { value: number | null; label: string }[] = [];
  if (activeWorkstreams > 0) {
    segments.push({
      value: activeWorkstreams,
      label: `active workstream${activeWorkstreams !== 1 ? "s" : ""}`,
    });
  }
  if (pendingReview > 0) {
    segments.push({ value: pendingReview, label: "pending review" });
  }
  if (staleCount && staleCount > 0) {
    segments.push({ value: staleCount, label: "stale" });
  }
  if (projectCount > 0) {
    segments.push({ value: projectCount, label: "projects" });
  }
  if (skillCount && skillCount > 0) {
    segments.push({ value: skillCount, label: "skills" });
  }
  if (primitiveCount && primitiveCount > 0) {
    segments.push({ value: primitiveCount, label: "primitives" });
  }
  if (endpointCount && endpointCount > 0) {
    segments.push({ value: endpointCount, label: "endpoints" });
  }
  segments.push({ value: null, label: `last activity ${lastActivityDisplay}` });

  return (
    <div className="rounded-md bg-muted/30 px-4 py-2 font-mono text-xs text-muted-foreground/60">
      {segments.map((segment, i) => (
        <span key={segment.label}>
          {i > 0 && (
            <span className="mx-2 text-muted-foreground/30">·</span>
          )}
          {segment.value !== null && (
            <span className="text-foreground/60">{segment.value} </span>
          )}
          {segment.value !== null ? segment.label : segment.label}
        </span>
      ))}
    </div>
  );
}

function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
