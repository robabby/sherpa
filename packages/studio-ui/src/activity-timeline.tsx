import { ActivityEntry } from "./activity-entry";
import type { ActivityEntry as ActivityEntryType } from "@/lib/studio";
import { parseActivityDescription } from "@/lib/studio";
import { Text } from "@radix-ui/themes";

interface ActivityTimelineProps {
  entries: ActivityEntryType[];
}

export function ActivityTimeline({ entries }: ActivityTimelineProps) {
  if (entries.length === 0) {
    return (
      <Text size="2" className="text-muted-foreground">
        No activity recorded.
      </Text>
    );
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, i) => (
        <ActivityEntry
          key={`${entry.date}-${i}`}
          entry={entry}
          segments={parseActivityDescription(entry.description)}
          isFirst={i === 0}
          isLast={i === entries.length - 1}
        />
      ))}
    </div>
  );
}
