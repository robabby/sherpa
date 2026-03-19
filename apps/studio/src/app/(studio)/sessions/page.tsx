"use client";

import { Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";

import { SectionHeader } from "@/components/studio/section-header";

import type { Session } from "@/lib/studio";

// Client component — sessions data passed via search params would be unwieldy.
// Instead, fetch from a lightweight API. For now, inline the data loading pattern
// used by other studio pages but adapted for client-side filtering/expansion.

const MODEL_BADGE: Record<string, { label: string; className: string }> = {
  "claude-opus-4-6": {
    label: "Opus",
    className: "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  },
  "claude-sonnet-4-6": {
    label: "Sonnet",
    className: "border-[var(--color-copper)]/40 bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
  },
  "claude-haiku-4-5-20251001": {
    label: "Haiku",
    className: "border-[var(--color-bronze)]/40 bg-[var(--color-bronze)]/10 text-[var(--color-bronze)]",
  },
};

function getModelBadge(model: string): { label: string; className: string } {
  const direct = MODEL_BADGE[model];
  if (direct) return direct;
  if (model.includes("opus")) return MODEL_BADGE["claude-opus-4-6"]!;
  if (model.includes("sonnet")) return MODEL_BADGE["claude-sonnet-4-6"]!;
  if (model.includes("haiku")) return MODEL_BADGE["claude-haiku-4-5-20251001"]!;
  return { label: model.split("-").pop() ?? model, className: "border-muted-foreground/30 bg-muted/10 text-muted-foreground" };
}

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

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

const OUTCOME_STYLES: Record<string, string> = {
  completed: "text-emerald-500",
  interrupted: "text-rose-400",
  "in-progress": "text-[var(--color-session)]",
};

function SessionRow({ session, expanded, onToggle }: {
  session: Session;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { date, time } = formatDateTime(session.startedAt);
  const badge = getModelBadge(session.model);
  const totalTokens = session.tokens.input + session.tokens.output;

  return (
    <div className="rounded-lg border border-[var(--color-session)]/20 bg-background transition-all hover:border-[var(--color-session)]/35">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Text size="2" weight="medium" className="text-foreground">
              {session.initiative ?? session.branch}
            </Text>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${badge.className}`}>
              {badge.label}
            </span>
            <span className={`text-xs ${OUTCOME_STYLES[session.outcome] ?? "text-muted-foreground"}`}>
              {session.outcome}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{date}</span>
            <span>{time}</span>
            <span>{formatDuration(session.durationMinutes)}</span>
            {totalTokens > 0 && <span>{formatTokens(totalTokens)} tokens</span>}
          </div>
          {session.summary && (
            <Text size="2" className="mt-1.5 line-clamp-1 block text-muted-foreground">
              {session.summary}
            </Text>
          )}
        </div>
        <span className="shrink-0 text-muted-foreground/40 transition-transform" style={{ transform: expanded ? "rotate(90deg)" : undefined }}>
          ›
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-session)]/10 px-4 pb-4 pt-3">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            {/* Token breakdown */}
            <div>
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
                Tokens
              </span>
              <div className="space-y-0.5 text-muted-foreground">
                <div>Input: {formatTokens(session.tokens.input)}</div>
                <div>Output: {formatTokens(session.tokens.output)}</div>
                <div>Cache read: {formatTokens(session.tokens.cacheRead)}</div>
                <div>Cache creation: {formatTokens(session.tokens.cacheCreation)}</div>
              </div>
            </div>

            {/* Branch & commits */}
            <div>
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
                Branch
              </span>
              <div className="font-mono text-xs text-foreground">{session.branch}</div>
              {session.commits.length > 0 && (
                <div className="mt-2">
                  <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
                    Commits
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {session.commits.map((c) => (
                      <span key={c} className="rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tools used */}
            {session.toolsUsed.length > 0 && (
              <div>
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
                  Tools
                </span>
                <div className="flex flex-wrap gap-1">
                  {session.toolsUsed.map((t) => (
                    <span key={t} className="rounded border border-muted-foreground/15 px-1.5 py-0.5 text-[10px] text-muted-foreground/60">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Files modified */}
            {session.filesModified.length > 0 && (
              <div>
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
                  Files ({session.filesModified.length})
                </span>
                <div className="max-h-32 space-y-0.5 overflow-y-auto">
                  {session.filesModified.map((f) => (
                    <div key={f} className="truncate font-mono text-[10px] text-muted-foreground">
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterInitiative, setFilterInitiative] = useState<string>("all");
  const [filterModel, setFilterModel] = useState<string>("all");

  useEffect(() => {
    fetch("/api/studio/sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => {});
  }, []);

  const initiatives = [...new Set(sessions.map((s) => s.initiative).filter(Boolean))] as string[];
  const models = [...new Set(sessions.map((s) => s.model))];

  const filtered = sessions.filter((s) => {
    if (filterInitiative !== "all" && s.initiative !== filterInitiative) return false;
    if (filterModel !== "all" && s.model !== filterModel) return false;
    return true;
  });

  const totalTokens = filtered.reduce(
    (sum, s) => sum + s.tokens.input + s.tokens.output,
    0,
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        label="sessions"
        title={`${filtered.length} Sessions`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterInitiative}
          onChange={(e) => setFilterInitiative(e.target.value)}
          className="rounded-md border border-muted-foreground/20 bg-background px-3 py-1.5 text-sm text-foreground"
        >
          <option value="all">All initiatives</option>
          {initiatives.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        <select
          value={filterModel}
          onChange={(e) => setFilterModel(e.target.value)}
          className="rounded-md border border-muted-foreground/20 bg-background px-3 py-1.5 text-sm text-foreground"
        >
          <option value="all">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {totalTokens > 0 && (
          <span className="text-sm text-muted-foreground">
            {formatTokens(totalTokens)} total tokens
          </span>
        )}
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <SessionRow
            key={s.sessionId}
            session={s}
            expanded={expandedId === s.sessionId}
            onToggle={() =>
              setExpandedId(expandedId === s.sessionId ? null : s.sessionId)
            }
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            No sessions recorded yet. Sessions will appear here after your next Claude Code session.
          </p>
        )}
      </div>
    </div>
  );
}
