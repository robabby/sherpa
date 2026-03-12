import Link from "next/link";

import { ActivityDescription } from "./activity-description";
import { HubPanel } from "./hub-panel";
import type { ActivityEntry } from "@/lib/studio";
import { parseActivityDescription } from "@/lib/studio";

interface HubActivityPanelProps {
  recentActivity: ActivityEntry[];
}

interface DateGroup {
  date: string;
  label: string;
  entries: ActivityEntry[];
}

function groupByDate(entries: ActivityEntry[]): DateGroup[] {
  const groups: DateGroup[] = [];

  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.date) {
      last.entries.push(entry);
    } else {
      const parsed = new Date(entry.date + "T00:00:00");
      groups.push({
        date: entry.date,
        label: parsed.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        entries: [entry],
      });
    }
  }

  return groups;
}

export function HubActivityPanel({ recentActivity }: HubActivityPanelProps) {
  const groups = groupByDate(recentActivity.slice(0, 20));

  return (
    <HubPanel
      variant="activity"
      href="/activity"
      title="Recent Activity"
      linkText="View full activity"
      label="Activity"
    >
      <div className="relative">
        {/* Continuous spine */}
        <div className="absolute left-[3.75rem] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--color-gold)]/30 via-[var(--color-gold)]/15 to-transparent" />

        <div className="space-y-5">
          {groups.map((group, gi) => (
            <div key={group.date} className="relative flex gap-0">
              {/* Date + node */}
              <div className="relative flex w-[4.25rem] shrink-0 items-start">
                <Link
                  href={`/portfolio/${group.date}`}
                  className="relative z-10 pr-2.5 font-mono text-[11px] leading-5 text-muted-foreground transition-colors hover:text-[var(--color-gold)]"
                >
                  {group.label}
                </Link>
                {/* Node dot */}
                <div
                  className={`absolute right-0 top-1 z-10 h-2.5 w-2.5 rounded-full border-2 ${
                    gi === 0
                      ? "border-[var(--color-gold)] bg-[var(--color-gold)]/40 shadow-[0_0_6px_var(--color-gold)/30]"
                      : "border-[var(--color-gold)]/40 bg-background"
                  }`}
                />
              </div>

              {/* Entries */}
              <div className="min-w-0 flex-1 pl-4">
                {group.entries.map((entry, ei) => (
                  <div
                    key={ei}
                    className="py-0.5 text-[13px] leading-relaxed text-foreground/80"
                  >
                    <ActivityDescription
                      segments={parseActivityDescription(entry.description)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </HubPanel>
  );
}
