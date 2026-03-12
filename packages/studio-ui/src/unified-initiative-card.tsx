import Link from "next/link";
import { Text } from "@radix-ui/themes";

import { StatusBadge } from "./status-badge";
import { UnifiedCardClient } from "./unified-card-client";
import type {
  UnifiedInitiativeEntry,
  ActivityEntry as ActivityEntryType,
  ContentFile,
} from "@/lib/studio";
import {
  getBranchSeeds,
  getDeliverables,
  getInitiativeFiles,
  parseActivityDescription,
} from "@/lib/studio";

function formatDate(dateStr: string): string {
  const date = dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
    ? new Date(dateStr + "T00:00:00")
    : new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface UnifiedInitiativeCardProps {
  entry: UnifiedInitiativeEntry;
}

export function UnifiedInitiativeCard({ entry }: UnifiedInitiativeCardProps) {
  const { initiative, workstreams, researchTree, latestActivity } = entry;
  const primaryWs = workstreams.find((ws) => ws.status === "active") ?? workstreams[0];

  // Merge all workstream activity logs for the Activity tab
  const mergedActivity: ActivityEntryType[] = workstreams
    .flatMap((ws) =>
      ws.activityLog.map((a) => ({
        ...a,
        description: workstreams.length > 1
          ? `[${ws.slug}] ${a.description}`
          : a.description,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  // Build contents files map for the Contents tab
  const contentsFiles: Record<string, ContentFile[]> = {};
  for (const sub of initiative.subDirectories) {
    const files = getInitiativeFiles(initiative.slug, sub.name);
    if (files.length > 0) contentsFiles[sub.name] = files;
  }

  // Stats summary
  const statParts: string[] = [];
  if (entry.totalIterations > 0)
    statParts.push(`${entry.totalIterations} iteration${entry.totalIterations !== 1 ? "s" : ""}`);
  if (entry.totalBranchSeeds > 0)
    statParts.push(`${entry.totalBranchSeeds} seed${entry.totalBranchSeeds !== 1 ? "s" : ""}`);
  if (entry.totalOpenQuestions > 0)
    statParts.push(`${entry.totalOpenQuestions} question${entry.totalOpenQuestions !== 1 ? "s" : ""}`);
  if (mergedActivity.length > 0)
    statParts.push(`${mergedActivity.length} activit${mergedActivity.length !== 1 ? "ies" : "y"}`);

  // Pre-parse activity segments for client component
  const parsedActivity = mergedActivity.map((a) => ({
    entry: a,
    segments: parseActivityDescription(a.description),
  }));

  // Branch seeds for research tree
  const seeds = researchTree ? getBranchSeeds(initiative.slug) : [];

  // Deliverables
  const deliverableSummaries = getDeliverables(`docs/initiatives/${initiative.slug}`);

  return (
    <div className="rounded-lg border border-[var(--border-gold)] bg-card/50 transition-colors hover:border-[var(--color-copper)]/40">
      {/* Always-visible header */}
      <div className="p-5">
        {/* Title row */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <Link
            href={`/process/${initiative.slug}`}
            className="text-base font-medium text-foreground transition-colors hover:text-[var(--color-gold)]"
          >
            {initiative.title}
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <StatusBadge status={initiative.status} />
            {primaryWs && <StatusBadge status={primaryWs.status} />}
          </div>
        </div>

        {/* Stats line */}
        {statParts.length > 0 && (
          <Text size="1" className="mb-2 block font-mono text-muted-foreground/60">
            {statParts.join(" \u00b7 ")}
          </Text>
        )}

        {/* Focus text from workstream */}
        {primaryWs?.focus && (
          <Text size="2" className="mb-2 line-clamp-2 text-muted-foreground">
            {primaryWs.focus}
          </Text>
        )}

        {/* Latest activity */}
        {latestActivity && (
          <Text size="1" className="block text-muted-foreground/50">
            <span className="font-mono">Latest: {formatDate(latestActivity.date)}</span>
            {" \u2014 "}
            <span className="line-clamp-1 inline">
              {latestActivity.description.slice(0, 80)}
              {latestActivity.description.length > 80 ? "..." : ""}
            </span>
          </Text>
        )}
      </div>

      {/* Expandable client section */}
      <UnifiedCardClient
        storageKey={`unified-card-${initiative.slug}`}
        initiativeSlug={initiative.slug}
        parsedActivity={parsedActivity}
        researchTree={researchTree}
        branchSeeds={seeds}
        contentsFiles={contentsFiles}
        targets={initiative.targets}
        deliverableSummaries={deliverableSummaries}
        hasContent={
          mergedActivity.length > 0 ||
          researchTree !== null ||
          Object.keys(contentsFiles).length > 0 ||
          deliverableSummaries.length > 0
        }
      />
    </div>
  );
}
