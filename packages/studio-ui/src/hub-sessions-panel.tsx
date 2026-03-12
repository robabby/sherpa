import type { HubStats, Session } from "@/lib/studio";
import { HubPanel } from "./hub-panel";

function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

function formatDuration(minutes: number | null): string {
  if (minutes == null) return "--";
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface HubSessionsPanelProps {
  sessions: Session[];
  stats: HubStats["sessions"];
}

export function HubSessionsPanel({ sessions, stats }: HubSessionsPanelProps) {
  const recent = sessions.slice(0, 3);

  return (
    <HubPanel
      variant="sessions"
      href="/sessions"
      title="Sessions"
      label="SESSIONS"
      linkText="View all sessions"
    >
      <div className="space-y-5">
        <div className="flex items-baseline gap-4">
          <p className="font-heading text-lg text-foreground">
            {stats.thisWeek} this week
          </p>
          {stats.weeklyTokens > 0 && (
            <span className="font-mono text-sm text-muted-foreground">
              {formatTokens(stats.weeklyTokens)} tokens
            </span>
          )}
        </div>

        {recent.length > 0 && (
          <div className="space-y-2">
            {recent.map((s) => (
              <div
                key={s.sessionId}
                className="flex items-center gap-3 text-sm"
              >
                <span className="shrink-0 font-mono text-muted-foreground/60">
                  {formatDate(s.startedAt)}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-foreground">
                  {s.initiative ?? s.branch}
                </span>
                <span className="shrink-0 font-mono text-muted-foreground/60">
                  {formatDuration(s.durationMinutes)}
                </span>
              </div>
            ))}
          </div>
        )}

        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground/60">
            No sessions recorded yet
          </p>
        )}
      </div>
    </HubPanel>
  );
}
