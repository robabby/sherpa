import Link from "next/link";
import type { LifecycleStage } from "@/lib/studio/lifecycle";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Valid statuses per editable node kind. */
export const KIND_STATUSES: Record<string, string[]> = {
  initiative: ["pending", "approved", "in-progress", "integrated", "declined", "archived"],
  workstream: ["active", "paused", "completed"],
  seed: ["seed", "launched"],
};

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Source path → studio URL
// ---------------------------------------------------------------------------

export function sourceToHref(source: string): string | null {
  if (source.startsWith("docs/initiatives/")) {
    const slug = source.split("/")[2];
    if (slug) return `/process/${slug}`;
  }
  if (source.startsWith(".claude/rules/")) {
    const slug = source.replace(".claude/rules/", "").replace(".md", "");
    return `/conventions/${slug}`;
  }
  if (source.startsWith(".claude/skills/")) {
    const slug = source.split("/")[2];
    if (slug) return `/skills/${slug}`;
  }
  if (source.startsWith("docs/")) {
    const docPath = source.replace(/\.md$/, "");
    return `/docs/${docPath}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

export function SourceLink({ source }: { source: string }) {
  const href = sourceToHref(source);
  if (href) {
    return (
      <Link
        href={href}
        className="font-mono text-[11px] text-muted-foreground/40 underline decoration-border/30 underline-offset-2 transition-colors hover:text-[var(--color-gold)]/60"
      >
        {source}
      </Link>
    );
  }
  return (
    <span className="font-mono text-[11px] text-muted-foreground/40">
      {source}
    </span>
  );
}

export function MetadataRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="w-28 shrink-0 text-xs uppercase tracking-wider text-muted-foreground/40">
        {label}
      </span>
      <span className="text-xs text-foreground/80">{value}</span>
    </div>
  );
}

export function MonoList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="rounded bg-card/50 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground/60"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared interfaces
// ---------------------------------------------------------------------------

export interface LifecycleData {
  stage: LifecycleStage;
  label: string;
  nextAction: string;
  actor: "human" | "agent" | null;
  stageIndex: number;
}

export interface ContentFileData {
  relativePath: string;
  title: string;
}

export interface IterationData {
  number: number;
  synthesis: ContentFileData | null;
  vectors: ContentFileData[];
}

export interface ResearchData {
  readme: ContentFileData | null;
  iterations: IterationData[];
  looseFiles: ContentFileData[];
  totalFiles: number;
}
