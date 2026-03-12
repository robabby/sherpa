import Link from "next/link";

import { ActivityDescription } from "./activity-description";
import { ScopeBadge } from "./scope-badge";
import type { DateGroup } from "@/lib/studio";
import { parseActivityDescription } from "@/lib/studio";

interface ActivityFullTimelineProps {
  dateGroups: DateGroup[];
}

export function ActivityFullTimeline({
  dateGroups,
}: ActivityFullTimelineProps) {
  if (dateGroups.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No activity entries match the current filter.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Continuous gold spine */}
      <div className="absolute left-[5.25rem] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--color-gold)]/30 via-[var(--color-gold)]/15 to-transparent" />

      <div className="space-y-6">
        {dateGroups.map((group, gi) => (
          <div key={group.date} className="relative flex gap-0">
            {/* Date column */}
            <div className="relative flex w-20 shrink-0 items-start">
              <Link
                href={`/app/studio/portfolio/${group.date}`}
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

            {/* Spine spacer */}
            <div className="w-5 shrink-0" />

            {/* Content column */}
            <div className="min-w-0 flex-1">
              {group.entries.map((entry, ei) => (
                <div
                  key={ei}
                  className="flex items-start gap-2 py-1 text-[13px] leading-relaxed text-foreground/80"
                >
                  {entry.scope && <ScopeBadge scope={entry.scope} />}
                  <span className="min-w-0">
                    <ActivityDescription
                      segments={parseActivityDescription(
                        entry.scope ? entry.scopeText : entry.description,
                      )}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
