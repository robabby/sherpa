import type { ActivityEntry, ActivitySegment } from "./types";

const PR_REGEX = /\(#(\d+)\)/g;
const REPO_URL = "https://github.com/robabby/wavepoint/pull";

/**
 * Parse a description string into segments of plain text and PR links.
 * PR references like `(#343)` become clickable GitHub links.
 */
export function parseActivityDescription(
  description: string,
): ActivitySegment[] {
  const segments: ActivitySegment[] = [];
  let lastIndex = 0;

  for (const match of description.matchAll(PR_REGEX)) {
    const matchIndex = match.index;
    const prNumber = Number(match[1]);

    // Text before the match
    if (matchIndex > lastIndex) {
      segments.push({
        type: "text",
        value: description.slice(lastIndex, matchIndex),
      });
    }

    segments.push({
      type: "pr-link",
      number: prNumber,
      url: `${REPO_URL}/${prNumber}`,
    });

    lastIndex = matchIndex + match[0].length;
  }

  // Remaining text
  if (lastIndex < description.length) {
    segments.push({ type: "text", value: description.slice(lastIndex) });
  }

  // No PR references — return single text segment
  if (segments.length === 0) {
    segments.push({ type: "text", value: description });
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Scope parsing + data processing for full activity timeline
// ---------------------------------------------------------------------------

const SCOPE_REGEX = /^([A-Za-z@/]+):\s*/;

/**
 * Extract scope prefix from a description string.
 * "Web: Add feature (#123)" → { scope: "web", text: "Add feature (#123)" }
 */
export function parseScope(description: string): {
  scope: string | null;
  text: string;
} {
  const match = description.match(SCOPE_REGEX);
  if (!match?.[1]) return { scope: null, text: description };
  return {
    scope: match[1].toLowerCase(),
    text: description.slice(match[0].length),
  };
}

/** Scope → Tailwind border/text/bg classes (follows StatusBadge pattern). */
export const SCOPE_COLORS: Record<string, string> = {
  web: "border-[var(--color-gold)]/50 text-[var(--color-gold)] bg-[var(--color-gold)]/10",
  docs: "border-[var(--color-bronze)]/50 text-[var(--color-bronze)] bg-[var(--color-bronze)]/10",
  monorepo:
    "border-[var(--color-copper)]/50 text-[var(--color-copper)] bg-[var(--color-copper)]/10",
  content:
    "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  atlas: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  orb: "border-violet-500/40 text-violet-400 bg-violet-500/10",
  arcana: "border-rose-500/40 text-rose-400 bg-rose-500/10",
  numina: "border-amber-500/40 text-amber-400 bg-amber-500/10",
};

export interface DateGroup {
  date: string;
  label: string;
  entries: (ActivityEntry & { scope: string | null; scopeText: string })[];
}

export interface ActivityStats {
  totalCount: number;
  filteredCount: number;
  dateRange: { first: string; last: string } | null;
  topScope: { name: string; count: number } | null;
}

export interface ProcessedActivityData {
  dateGroups: DateGroup[];
  scopeCounts: Record<string, number>;
  stats: ActivityStats;
}

/**
 * Group entries by date, compute scope counts, optionally filter by scope.
 */
export function processActivityData(
  entries: ActivityEntry[],
  scopeFilter: string | null,
): ProcessedActivityData {
  // Compute scope counts from all entries (before filtering)
  const scopeCounts: Record<string, number> = {};
  const enriched = entries.map((entry) => {
    const { scope, text } = parseScope(entry.description);
    if (scope) {
      scopeCounts[scope] = (scopeCounts[scope] ?? 0) + 1;
    }
    return { ...entry, scope, scopeText: text };
  });

  // Filter by scope if specified
  const filtered = scopeFilter
    ? enriched.filter((e) => e.scope === scopeFilter)
    : enriched;

  // Group by date
  const dateGroups: DateGroup[] = [];
  for (const entry of filtered) {
    const last = dateGroups[dateGroups.length - 1];
    if (last && last.date === entry.date) {
      last.entries.push(entry);
    } else {
      const parsed = new Date(entry.date + "T00:00:00");
      dateGroups.push({
        date: entry.date,
        label: parsed.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        entries: [entry],
      });
    }
  }

  // Stats
  const topScope = Object.entries(scopeCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const dates = entries.map((e) => e.date).filter(Boolean);
  const dateRange =
    dates.length > 0
      ? { first: dates[dates.length - 1]!, last: dates[0]! }
      : null;

  return {
    dateGroups,
    scopeCounts,
    stats: {
      totalCount: entries.length,
      filteredCount: filtered.length,
      dateRange,
      topScope: topScope ? { name: topScope[0], count: topScope[1] } : null,
    },
  };
}
