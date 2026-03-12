import type { PortfolioData } from "@/lib/studio";
import { cn } from "./lib/utils";
import { HubPanel } from "./hub-panel";
import { PortfolioHealthChart } from "./portfolio-health-chart";

interface HubPortfolioPanelProps {
  portfolio: PortfolioData;
}

export function HubPortfolioPanel({ portfolio }: HubPortfolioPanelProps) {
  const { apps, dependencies } = portfolio;

  // Health analysis
  const onTrack = apps.filter(
    (a) =>
      a.health === "On track" &&
      !a.currentPhase.toLowerCase().includes("paused")
  );
  const paused = apps.filter(
    (a) =>
      a.currentPhase.toLowerCase().includes("paused") ||
      a.health.toLowerCase().includes("paused")
  );
  const blocked = apps.filter((a) =>
    a.health.toLowerCase().includes("blocked")
  );
  const exceptions = apps.filter(
    (a) =>
      a.health !== "On track" ||
      a.currentPhase.toLowerCase().includes("paused")
  );

  // Build health sentence
  const total = apps.length;
  const parts: string[] = [];
  parts.push(`${onTrack.length} of ${total} on track`);
  if (blocked.length > 0)
    parts.push(`${blocked.length} blocked`);
  if (paused.length > 0)
    parts.push(`${paused.length} paused`);

  const healthSentence = parts.join(" · ");

  // Dependency analysis
  const unresolvedDeps = dependencies.filter(
    (d) => d.status.toLowerCase() !== "resolved"
  );
  const resolvedDeps = dependencies.filter(
    (d) => d.status.toLowerCase() === "resolved"
  );

  // Unique platform types
  const appTypes = [...new Set(apps.map((a) => a.type).filter(Boolean))];

  return (
    <HubPanel
      variant="portfolio"
      href="/app/studio/portfolio"
      title="Projects"
      label="PORTFOLIO"
      linkText="View portfolio"
    >
      <div className="space-y-5">
        {/* Health sentence (hero) */}
        <p className="font-heading text-lg text-foreground">
          {healthSentence}
        </p>

        {/* Health chart */}
        {apps.length > 0 && (
          <PortfolioHealthChart
            data={{
              onTrack: onTrack.length,
              blocked: blocked.length,
              paused: paused.length,
            }}
          />
        )}

        {/* Exception list — only apps NOT on track */}
        {exceptions.length > 0 && (
          <div className="space-y-2">
            {exceptions.map((app) => (
              <div key={app.name} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    {app.name}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {app.currentPhase}
                    {app.health !== "On track" && ` — ${app.health}`}
                  </p>
                </div>
                {app.nextMilestone && (
                  <span className="shrink-0 text-xs text-muted-foreground/60">
                    {app.nextMilestone}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dependencies callout */}
        {dependencies.length > 0 && (
          <div className="text-xs text-muted-foreground/60">
            <span>
              Dependencies: {resolvedDeps.length} resolved
              {unresolvedDeps.length > 0 &&
                ` · ${unresolvedDeps.length} not started`}
            </span>
            {unresolvedDeps.length > 0 && unresolvedDeps[0] && (
              <p className="mt-1 font-mono text-[10px]">
                {unresolvedDeps[0].blockedProject} → waiting on{" "}
                {unresolvedDeps[0].waitingOn}
              </p>
            )}
          </div>
        )}

        {/* App type pills */}
        {appTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {appTypes.map((type) => {
              const hasActive = apps.some(
                (a) =>
                  a.type === type &&
                  a.health === "On track" &&
                  !a.currentPhase.toLowerCase().includes("paused")
              );
              return (
                <span
                  key={type}
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[10px]",
                    hasActive
                      ? "border-[var(--color-gold)]/30 text-[var(--color-gold)]"
                      : "border-muted-foreground/20 text-muted-foreground/50"
                  )}
                >
                  {type}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </HubPanel>
  );
}
