"use client";

import Link from "next/link";
import {
  CircleDot,
  FileText,
  GitBranch,
  Rocket,
} from "lucide-react";
import type { ProcessNode } from "@/lib/studio/process-nodes-shared";

// ---------------------------------------------------------------------------
// Activity entry types and helpers
// ---------------------------------------------------------------------------

interface ActivityEntryData {
  date: string;
  description: string;
}

const PR_REGEX = /\(#(\d+)\)/g;
const REPO_URL = "https://github.com/robabby/wavepoint/pull";

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

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DescriptionWithPRLinks({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(PR_REGEX)) {
    const matchIndex = match.index;
    const prNumber = Number(match[1]);

    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    parts.push(
      <a
        key={matchIndex}
        href={`${REPO_URL}/${prNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[var(--color-gold)] hover:underline"
      >
        (#{prNumber})
      </a>,
    );

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) {
    parts.push(text);
  }

  return <>{parts}</>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityTab({ node }: { node: ProcessNode }) {
  const entries = (node.metadata.activityLog ?? []) as ActivityEntryData[];

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/40">
        No activity recorded.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, i) => {
        const category = classifyEntry(entry.description);
        const Icon = ENTRY_ICONS[category];
        const isFirst = i === 0;
        const isLast = i === entries.length - 1;

        return (
          <div key={`${entry.date}-${i}`} className="relative flex gap-3">
            {/* Date column */}
            <div className="w-14 shrink-0 pt-0.5 text-right">
              <span className="font-mono text-[11px] text-muted-foreground/50">
                {formatShortDate(entry.date)}
              </span>
            </div>

            {/* Spine + icon dot */}
            <div className="relative flex w-4 shrink-0 flex-col items-center">
              <div
                className={`mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ${DOT_COLORS[category]}`}
              >
                <Icon className="h-2 w-2 text-background" />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-[var(--color-copper)]/20" />
              )}
            </div>

            {/* Description */}
            <div className="min-w-0 flex-1 pb-4">
              <p
                className={`text-xs leading-relaxed ${isFirst ? "text-foreground" : "text-foreground/70"}`}
              >
                <DescriptionWithPRLinks text={entry.description} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
