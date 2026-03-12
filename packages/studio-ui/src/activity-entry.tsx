"use client";

import { useState } from "react";
import Link from "next/link";
import { Text } from "@radix-ui/themes";
import { Rocket, GitBranch, FileText, CircleDot, ChevronDown } from "lucide-react";

import { ActivityDescription } from "./activity-description";
import type { ActivityEntry as ActivityEntryType, ActivitySegment } from "@/lib/studio";
import { cn } from "./lib/utils";

/** Classify an activity entry by keywords in its description. */
function classifyEntry(description: string): "milestone" | "launch" | "iteration" | "update" {
  const lower = description.toLowerCase();
  if (lower.includes("launched") || lower.includes("bootstrapped") || lower.includes("created"))
    return "launch";
  if (lower.includes("iteration") && lower.includes("complete"))
    return "milestone";
  if (lower.includes("iteration"))
    return "iteration";
  return "update";
}

const ENTRY_ICONS = {
  milestone: Rocket,
  launch: GitBranch,
  iteration: FileText,
  update: CircleDot,
} as const;

const DOT_COLORS = {
  milestone: "bg-[var(--color-gold)]",
  launch: "bg-emerald-400",
  iteration: "bg-[var(--color-copper)]",
  update: "bg-[var(--color-copper)]/40",
} as const;

const TRUNCATE_LENGTH = 140;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ActivityEntryProps {
  entry: ActivityEntryType;
  segments: ActivitySegment[];
  isFirst: boolean;
  isLast: boolean;
}

export function ActivityEntry({
  entry,
  segments,
  isFirst,
  isLast,
}: ActivityEntryProps) {
  const category = classifyEntry(entry.description);
  const Icon = ENTRY_ICONS[category];
  const needsTruncation = entry.description.length > TRUNCATE_LENGTH;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative flex gap-4">
      {/* Date column */}
      <div className="w-16 shrink-0 pt-0.5 text-right">
        <Link
          href={`/portfolio/${entry.date}`}
          className="font-mono text-xs text-muted-foreground transition-colors hover:text-[var(--color-gold)]"
        >
          {formatDate(entry.date)}
        </Link>
      </div>

      {/* Spine + icon dot */}
      <div className="relative flex w-4 shrink-0 flex-col items-center">
        <div
          className={cn(
            "mt-1 flex h-4 w-4 items-center justify-center rounded-full",
            DOT_COLORS[category]
          )}
        >
          <Icon className="h-2.5 w-2.5 text-background" />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-[var(--color-copper)]/20" />
        )}
      </div>

      {/* Description */}
      <div className="min-w-0 flex-1 pb-5">
        <Text size="2" className={cn("leading-relaxed", isFirst ? "text-foreground" : "text-foreground/80")}>
          {needsTruncation && !expanded ? (
            <>
              <span>{entry.description.slice(0, TRUNCATE_LENGTH)}...</span>
              <button
                onClick={() => setExpanded(true)}
                className="ml-1 inline-flex items-center gap-0.5 text-xs text-[var(--color-copper)] hover:text-[var(--color-gold)]"
              >
                more
                <ChevronDown className="h-3 w-3" />
              </button>
            </>
          ) : (
            <ActivityDescription segments={segments} />
          )}
        </Text>
        {needsTruncation && expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="mt-1 text-xs text-[var(--color-copper)] hover:text-[var(--color-gold)]"
          >
            show less
          </button>
        )}
      </div>
    </div>
  );
}
