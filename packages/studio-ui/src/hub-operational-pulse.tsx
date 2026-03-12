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

  const segments: string[] = [];
  if (activeWorkstreams > 0) {
    segments.push(
      `${activeWorkstreams} active workstream${activeWorkstreams !== 1 ? "s" : ""}`
    );
  }
  if (pendingReview > 0) {
    segments.push(
      `${pendingReview} pending review`
    );
  }
  if (staleCount && staleCount > 0) {
    segments.push(`${staleCount} stale`);
  }
  if (projectCount > 0) {
    segments.push(`${projectCount} projects`);
  }
  if (skillCount && skillCount > 0) {
    segments.push(`${skillCount} skills`);
  }
  if (primitiveCount && primitiveCount > 0) {
    segments.push(`${primitiveCount} primitives`);
  }
  if (endpointCount && endpointCount > 0) {
    segments.push(`${endpointCount} endpoints`);
  }
  segments.push(`last activity ${lastActivityDisplay}`);

  return (
    <div className="text-xs text-muted-foreground/60">
      {segments.map((segment, i) => (
        <span key={segment}>
          {i > 0 && (
            <span className="mx-2 text-muted-foreground/30">·</span>
          )}
          {segment}
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
