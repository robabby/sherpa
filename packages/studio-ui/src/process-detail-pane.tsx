"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  ChevronDown,
  CircleDot,
  Clipboard,
  Copy,
  ExternalLink,
  FileText,
  FolderTree,
  GitBranch,
  Loader2,
  RotateCcw,
  Rocket,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { LifecycleStage } from "@/lib/studio/lifecycle";
import type { FileTreeNode, ProcessNode } from "@/lib/studio/process-nodes-shared";
import type { AgentRole, ChartSpec, Session, WorkstreamRoleAssignment } from "@/lib/studio/types";
import { cn } from "./lib/utils";
import { ChartRenderer } from "./chart-renderer";
import { InitiativeFileTree } from "./initiative-file-tree";
import { ProcessGraph } from "./process-graph";
import { ProcessKindIcon } from "./process-kind-icon";
import { ProposalActions } from "./proposal-actions";
import { PromptCopyButton } from "./prompt-copy-button";
import { StatusBadge } from "./status-badge";

/** Valid statuses per editable node kind. */
const KIND_STATUSES: Record<string, string[]> = {
  initiative: ["pending", "approved", "in-progress", "integrated", "declined", "archived"],
  workstream: ["active", "paused", "completed"],
  seed: ["seed", "launched"],
};

interface ProcessDetailPaneProps {
  node: ProcessNode | null;
  allNodes: ProcessNode[];
  totalCount: number;
  onStatusChange?: (source: string, kind: string, newStatus: string) => Promise<{ success: boolean; error?: string }>;
  onPostApproval?: (slug: string, source: string) => Promise<{ success: boolean; tasks: string[]; error?: string }>;
  onArchive?: (slug: string) => Promise<{ success: boolean; error?: string }>;
  onRestore?: (slug: string) => Promise<{ success: boolean; error?: string }>;
  onSelectNode?: (id: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  agentRoles?: AgentRole[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Convert a source file path to a studio viewer URL.
 * Returns null if no viewer route exists for this path.
 */
function sourceToHref(source: string): string | null {
  if (source.startsWith("docs/initiatives/")) {
    const slug = source.split("/")[2];
    if (slug) return `/app/studio/process/${slug}`;
  }
  if (source.startsWith(".claude/rules/")) {
    const slug = source.replace(".claude/rules/", "").replace(".md", "");
    return `/app/studio/conventions/${slug}`;
  }
  if (source.startsWith(".claude/skills/")) {
    const slug = source.split("/")[2];
    if (slug) return `/app/studio/skills/${slug}`;
  }
  if (source.startsWith("docs/")) {
    const docPath = source.replace(/\.md$/, "");
    return `/app/studio/docs/${docPath}`;
  }
  return null;
}

function SourceLink({ source }: { source: string }) {
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

function MetadataRow({ label, value }: { label: string; value: React.ReactNode }) {
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

function MonoList({ items }: { items: string[] }) {
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
// Lifecycle Progress Bar
// ---------------------------------------------------------------------------

interface LifecycleData {
  stage: LifecycleStage;
  label: string;
  nextAction: string;
  actor: "human" | "agent" | null;
  stageIndex: number;
}

const VISUAL_STEPS = [
  { label: "Research", stages: ["needs-research", "needs-proposal"] as LifecycleStage[] },
  { label: "Proposal", stages: ["needs-review"] as LifecycleStage[] },
  { label: "Plan", stages: ["needs-plan", "ready-to-start"] as LifecycleStage[] },
  { label: "Active", stages: ["in-flight", "ready-to-integrate"] as LifecycleStage[] },
  { label: "Integrated", stages: ["integrated"] as LifecycleStage[] },
];

function getVisualStepIndex(stage: LifecycleStage): number {
  return VISUAL_STEPS.findIndex((step) => step.stages.includes(stage));
}

function LifecycleProgressBar({ lifecycle }: { lifecycle: LifecycleData }) {
  const currentVisualStep = getVisualStepIndex(lifecycle.stage);

  return (
    <div className="mb-5">
      <div className="flex items-center">
        {VISUAL_STEPS.map((step, i) => {
          const isCompleted = i < currentVisualStep;
          const isCurrent = i === currentVisualStep;
          const isFuture = i > currentVisualStep;

          return (
            <div key={step.label} className="flex flex-1 items-center">
              {/* Dot */}
              <div
                className={cn(
                  "relative z-10 h-2.5 w-2.5 shrink-0 rounded-full",
                  isCompleted && "bg-[var(--color-gold)]",
                  isCurrent && "bg-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/30 animate-[pulse-glow_2s_ease-in-out_infinite]",
                  isFuture && "bg-[var(--color-copper)]/30",
                )}
              />
              {/* Connector line (not after last) */}
              {i < VISUAL_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1",
                    i < currentVisualStep
                      ? "bg-[var(--color-gold)]"
                      : "bg-[var(--color-copper)]/20",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="mt-1.5 flex">
        {VISUAL_STEPS.map((step, i) => {
          const isCurrent = i === currentVisualStep;
          return (
            <span
              key={step.label}
              className={cn(
                "flex-1 text-[10px] uppercase tracking-wider",
                isCurrent ? "text-[var(--color-gold)]" : "text-muted-foreground/30",
              )}
            >
              {step.label}
            </span>
          );
        })}
      </div>
      {/* Next action */}
      {lifecycle.stage !== "integrated" && lifecycle.stage !== "in-flight" && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Next: {lifecycle.nextAction}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] leading-none",
              lifecycle.actor === "human"
                ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                : "bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
            )}
          >
            {lifecycle.actor === "human" ? "You" : "Agent"}
          </span>
        </div>
      )}
    </div>
  );
}

const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  active: "bg-[var(--color-gold)] text-background",
  standby: "bg-[var(--color-copper)]/60 text-background",
  completed: "bg-[var(--color-bronze)]/40 text-muted-foreground",
};

function RoleAssignmentPills({ roles }: { roles: WorkstreamRoleAssignment[] }) {
  if (!roles.length) {
    return <span className="text-xs text-muted-foreground/40">No roles assigned</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((r) => (
        <Link
          key={r.slug}
          href={`/app/studio/workforce/${r.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/15 bg-muted-foreground/5 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-[var(--color-eclipse)]/30 hover:text-[var(--color-eclipse)]"
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", ASSIGNMENT_STATUS_COLORS[r.status] ?? "bg-muted-foreground/40")} />
          {r.slug}
        </Link>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Initiative Sessions Section
// ---------------------------------------------------------------------------

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

const OUTCOME_STYLES: Record<string, string> = {
  completed: "text-emerald-500",
  interrupted: "text-rose-400",
  "in-progress": "text-[var(--color-session)]",
};

function InitiativeSessionsSection({ slug }: { slug: string }) {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/studio/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const all = (data.sessions ?? []) as Session[];
        setSessions(all.filter((s) => s.initiative === slug));
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });
    return () => { cancelled = true; };
  }, [slug]);

  const loading = sessions === null;

  if (loading) {
    return (
      <div className="mt-5">
        <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
          Sessions
        </span>
        <p className="mt-2 text-xs text-muted-foreground/30">Loading...</p>
      </div>
    );
  }

  const totalTokens = sessions.reduce(
    (sum, s) => sum + s.tokens.input + s.tokens.output,
    0,
  );
  const recent = sessions.slice(0, 3);

  return (
    <div className="mt-5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
        Sessions
      </span>
      {sessions.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground/30">
          No sessions recorded for this initiative.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {/* Summary line */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
            <span>{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
            {totalTokens > 0 && (
              <>
                <span>·</span>
                <span>{formatTokens(totalTokens)} tokens</span>
              </>
            )}
          </div>

          {/* Recent sessions */}
          <div className="space-y-1.5">
            {recent.map((s) => {
              const badge = getModelBadge(s.model);
              const d = new Date(s.startedAt);
              const dateStr = d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={s.sessionId}
                  className="flex items-center gap-2 rounded-md border border-border/15 bg-card/30 px-2.5 py-1.5"
                >
                  <span className="font-mono text-[11px] text-muted-foreground/50">
                    {dateStr}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] leading-none",
                      badge.className,
                    )}
                  >
                    {badge.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/40">
                    {formatDuration(s.durationMinutes)}
                  </span>
                  <span
                    className={cn(
                      "text-[11px]",
                      OUTCOME_STYLES[s.outcome] ?? "text-muted-foreground/40",
                    )}
                  >
                    {s.outcome}
                  </span>
                  {s.tokens.input + s.tokens.output > 0 && (
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground/30">
                      {formatTokens(s.tokens.input + s.tokens.output)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ArchiveButton({
  slug,
  title,
  onArchive,
}: {
  slug: string;
  title: string;
  onArchive: (slug: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mb-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="gap-1.5 border-muted-foreground/20 text-muted-foreground hover:bg-muted/50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            Archive
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive &ldquo;{title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the initiative to the archive. It will be hidden from
              the active process view but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                startTransition(async () => {
                  await onArchive(slug);
                  router.refresh();
                });
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RestoreButton({
  slug,
  title,
  onRestore,
}: {
  slug: string;
  title: string;
  onRestore: (slug: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mb-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            disabled={isPending}
            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Restore
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore &ldquo;{title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the initiative back to active status. It will reappear
              in the process view as a pending initiative.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                startTransition(async () => {
                  await onRestore(slug);
                  router.refresh();
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface OverviewTabProps {
  node: ProcessNode;
  onStatusChange?: ProcessDetailPaneProps["onStatusChange"];
  onPostApproval?: ProcessDetailPaneProps["onPostApproval"];
  onArchive?: ProcessDetailPaneProps["onArchive"];
  onRestore?: ProcessDetailPaneProps["onRestore"];
}

function OverviewTab({ node, onStatusChange, onPostApproval, onArchive, onRestore }: OverviewTabProps) {
  const meta = node.metadata;

  const lifecycle = node.kind === "initiative"
    ? (node.metadata.lifecycle as LifecycleData | undefined)
    : undefined;

  return (
    <div className="space-y-1">
      {lifecycle && lifecycle.stage !== "archived" && <LifecycleProgressBar lifecycle={lifecycle} />}
      {lifecycle?.stage === "archived" && (
        <div className="mb-5 rounded-md border border-zinc-500/20 bg-zinc-500/5 px-3 py-2 text-sm text-zinc-500">
          This initiative has been archived. Restore it to reactivate.
        </div>
      )}
      {lifecycle?.stage === "needs-review" && node.kind === "initiative" && onStatusChange && (
        <div className="mb-4">
          <ProposalActions
            slug={node.id.replace("initiative/", "")}
            title={node.title}
            source={node.source}
            riskLevel={(meta.risk as string) ?? null}
            onStatusChange={onStatusChange}
            onPostApproval={onPostApproval}
          />
        </div>
      )}

      {node.kind === "initiative" && lifecycle?.stage === "archived" && onRestore && (
        <RestoreButton
          slug={node.id.replace("initiative/", "")}
          title={node.title}
          onRestore={onRestore}
        />
      )}

      {node.kind === "initiative" && lifecycle?.stage !== "archived" && onArchive && (
        <ArchiveButton
          slug={node.id.replace("initiative/", "")}
          title={node.title}
          onArchive={onArchive}
        />
      )}

      {node.summary && (
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {node.summary}
        </p>
      )}

      {node.kind === "initiative" && (
        <>
          <MetadataRow label="Type" value={meta.type as string} />
          <MetadataRow label="Risk" value={meta.risk as string} />
          <MetadataRow
            label="Targets"
            value={
              Array.isArray(meta.targets) && (meta.targets as string[]).length > 0
                ? <MonoList items={meta.targets as string[]} />
                : null
            }
          />
          {meta.fileTree && (
            <div className="mt-4">
              <InitiativeFileTree tree={meta.fileTree as FileTreeNode} />
            </div>
          )}
          {Array.isArray(meta.chartSpecs) && (meta.chartSpecs as ChartSpec[]).length > 0 && (
            <div className="mt-5 space-y-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
                Charts
              </span>
              {(meta.chartSpecs as ChartSpec[]).map((spec) => (
                <Link
                  key={spec.id}
                  href={`/app/studio/process/${node.id.replace("initiative/", "")}/chart/${spec.id}`}
                  className="block"
                >
                  <div className="group rounded-lg border border-[var(--border-gold)]/15 bg-card/50 p-3 transition-colors hover:border-[var(--color-gold)]/40">
                    <span className="mb-2 block text-xs font-medium text-foreground/80 group-hover:text-[var(--color-gold)]">
                      {spec.title}
                    </span>
                    <ChartRenderer spec={spec} compact />
                  </div>
                </Link>
              ))}
            </div>
          )}
          <InitiativeSessionsSection slug={node.id.replace("initiative/", "")} />
        </>
      )}

      {node.kind === "workstream" && (
        <>
          <MetadataRow label="Initiative" value={meta.initiative as string} />
          <MetadataRow label="Worktree" value={meta.worktree as string} />
          <MetadataRow
            label="Entries"
            value={meta.activityCount as number}
          />
          <div className="mt-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
              Roles
            </span>
            <div className="mt-1.5">
              <RoleAssignmentPills
                roles={(meta.roles ?? []) as WorkstreamRoleAssignment[]}
              />
            </div>
          </div>
        </>
      )}

      {node.kind === "seed" && (
        <>
          <MetadataRow label="Priority" value={meta.priority as string} />
          <MetadataRow
            label="Source Iteration"
            value={meta.sourceIteration as number}
          />
          {meta.parentType && (
            <MetadataRow label="Type" value={meta.parentType as string} />
          )}
          {meta.parentRisk && (
            <MetadataRow label="Risk" value={meta.parentRisk as string} />
          )}
          {Array.isArray(meta.parentTargets) && (meta.parentTargets as string[]).length > 0 && (
            <MetadataRow
              label="Targets"
              value={<MonoList items={meta.parentTargets as string[]} />}
            />
          )}
          {meta.subInitiativePath && (
            <MetadataRow
              label="Sub-initiative"
              value={
                <span className="font-mono text-xs">
                  {meta.subInitiativePath as string}
                </span>
              }
            />
          )}
          {Array.isArray(meta.vectors) && (meta.vectors as string[]).length > 0 && (
            <div className="mt-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
                Vectors
              </span>
              <ul className="mt-1.5 space-y-1">
                {(meta.vectors as string[]).map((v, i) => (
                  <li
                    key={i}
                    className="pl-3 text-xs text-muted-foreground/60 before:mr-2 before:text-muted-foreground/20 before:content-['–']"
                  >
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {meta.fileTree && (
            <div className="mt-4">
              <InitiativeFileTree tree={meta.fileTree as FileTreeNode} />
            </div>
          )}
        </>
      )}

      {node.kind === "skill" && (
        <>
          <MetadataRow
            label="Project skill"
            value={meta.isProjectSkill ? "Yes" : "No"}
          />
          <MetadataRow label="Lines" value={meta.lineCount as number} />
        </>
      )}

      {node.kind === "convention" && (
        <>
          <MetadataRow
            label="Always apply"
            value={meta.alwaysApply ? "Yes" : "No"}
          />
          <MetadataRow
            label="Globs"
            value={
              Array.isArray(meta.globs) && (meta.globs as string[]).length > 0
                ? <MonoList items={meta.globs as string[]} />
                : null
            }
          />
        </>
      )}

      {node.kind === "primitive" && (
        <>
          <MetadataRow label="Level" value={meta.level as string} />
          <MetadataRow
            label="Exports"
            value={`${(meta.exports as string[])?.length ?? 0} functions`}
          />
          <MetadataRow
            label="Types"
            value={`${(meta.types as string[])?.length ?? 0} types`}
          />
          <MetadataRow
            label="Deps"
            value={
              Array.isArray(meta.dependencies) &&
              (meta.dependencies as string[]).length > 0
                ? <MonoList items={meta.dependencies as string[]} />
                : null
            }
          />
        </>
      )}
    </div>
  );
}

function ContentTab({ node }: { node: ProcessNode }) {
  const href = sourceToHref(node.source);
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border/20 bg-card/20 px-3 py-2">
        {href ? (
          <Link
            href={href}
            className="font-mono text-xs text-muted-foreground underline decoration-border/30 underline-offset-2 transition-colors hover:text-[var(--color-gold)]"
          >
            {node.source}
          </Link>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {node.source}
          </span>
        )}
      </div>
      {node.summary && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {node.summary}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Research Tab — initiative nodes
// ---------------------------------------------------------------------------

interface ContentFileData {
  relativePath: string;
  title: string;
}

interface IterationData {
  number: number;
  synthesis: ContentFileData | null;
  vectors: ContentFileData[];
}

interface ResearchData {
  readme: ContentFileData | null;
  iterations: IterationData[];
  looseFiles: ContentFileData[];
  totalFiles: number;
}


// ---------------------------------------------------------------------------
// Activity Tab — workstream nodes
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

function ActivityTab({ node }: { node: ProcessNode }) {
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

// ---------------------------------------------------------------------------
// Action Bar — contextual buttons per node kind
// ---------------------------------------------------------------------------

interface ActionButton {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

function getActionsForNode(node: ProcessNode): ActionButton[] {
  const actions: ActionButton[] = [];

  switch (node.kind) {
    case "initiative": {
      const slug = node.id.replace("initiative/", "");
      actions.push({
        label: "View Details",
        icon: ExternalLink,
        href: `/app/studio/process/${slug}`,
      });
      break;
    }
    case "workstream": {
      const initSlug = (node.metadata.initiative as string | undefined)?.split("/")[0];
      if (initSlug) {
        actions.push({
          label: "View Initiative",
          icon: ExternalLink,
          href: `/app/studio/process/${initSlug}`,
        });
      }
      if (node.metadata.worktree) {
        actions.push({
          label: "Worktree",
          icon: FolderTree,
          onClick: () => {
            void navigator.clipboard.writeText(node.metadata.worktree as string);
          },
        });
      }
      break;
    }
    case "seed": {
      if (node.parent) {
        const parentSlug = node.parent.replace("initiative/", "");
        actions.push({
          label: "Parent Initiative",
          icon: ExternalLink,
          href: `/app/studio/process/${parentSlug}`,
        });
      }
      break;
    }
    case "skill": {
      actions.push({
        label: "Copy Invocation",
        icon: Copy,
        onClick: () => {
          const slug = node.id.replace("skill/", "");
          void navigator.clipboard.writeText(`/${slug}`);
        },
      });
      break;
    }
    case "convention": {
      if (
        Array.isArray(node.metadata.globs) &&
        (node.metadata.globs as string[]).length > 0
      ) {
        actions.push({
          label: "Copy Globs",
          icon: Clipboard,
          onClick: () => {
            void navigator.clipboard.writeText(
              (node.metadata.globs as string[]).join(", "),
            );
          },
        });
      }
      break;
    }
    case "primitive": {
      const slug = node.id.replace("primitive/", "");
      actions.push({
        label: "View Exports",
        icon: ExternalLink,
        href: `/app/studio/primitives/${slug}`,
      });
      break;
    }
  }

  return actions;
}

/** Generate an /rr continue prompt from an initiative ProcessNode. */
function buildRrContinuePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  const lines = [`/rr`, ``, `Continue research: ${initPath}/`];
  const research = node.metadata.research as ResearchData | null;
  if (research && research.iterations.length > 0) {
    lines.push(``, `${research.iterations.length} iteration(s) completed so far.`);
  }
  return lines.join("\n");
}

/** Generate an /rr launch prompt from a seed ProcessNode. */
function buildRrLaunchPrompt(node: ProcessNode): string {
  const parentPath = node.source.replace(/\/branches\/[^/]+\.md$/, "");
  const slug = node.id.replace("seed/", "").split("/").pop() ?? node.id;
  const targetPath = `${parentPath}/sub-initiatives/${slug}`;
  const lines = [
    `/rr`,
    ``,
    `Launch sub-initiative from seed.`,
    `Seed file: ${node.source}`,
    `Create sub-initiative at: ${targetPath}/`,
    `Parent initiative: ${parentPath}/proposal.md`,
  ];
  const question = node.metadata.question as string | null;
  if (question) {
    lines.push(``, `Core question: ${question}`);
  }
  const vectors = node.metadata.vectors as string[] | undefined;
  if (vectors && vectors.length > 0) {
    lines.push(``, `Suggested starting vectors:`);
    for (const v of vectors) {
      lines.push(`- ${v}`);
    }
  }
  return lines.join("\n");
}

/** Generate a planning prompt from an initiative ProcessNode. */
function buildPlanningPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  const lines = [
    `Using /superpowers:writing-plans, create an implementation plan for`,
    `the ${node.title} initiative.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ];
  if (node.parent) {
    const parentPath = node.parent.replace(/^initiative\//, "docs/initiatives/");
    lines.push(`- Parent: ${parentPath}/proposal.md`);
  }
  lines.push(
    ``,
    `The proposal status is ${node.status}. Translate the proposed changes into`,
    `a session-by-session implementation plan.`,
  );
  return lines.join("\n");
}

/** Generate a /synthesize prompt from an initiative ProcessNode. */
function buildSynthesizePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  const slug = initPath.replace("docs/initiatives/", "");
  const research = node.metadata.research as ResearchData | null;
  const iterCount = research?.iterations?.length ?? 0;
  const lines = [`/synthesize ${slug}`];
  if (iterCount >= 1) {
    lines.push(``, `${iterCount} research iteration(s) available.`);
  }
  return lines.join("\n");
}

/** Generate a sub-initiative prompt from an initiative ProcessNode. */
function buildSubInitiativePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/rr`,
    ``,
    `Create a new sub-initiative under ${initPath}/sub-initiatives/`,
    `Parent initiative: ${node.source}`,
    ``,
    `Define the sub-initiative scope, then run the first research iteration.`,
  ].join("\n");
}

/** Build a review prompt for a pending initiative. */
function buildReviewPrompt(node: ProcessNode): string {
  return [
    `Using /integration-review, review the proposal for the ${node.title} initiative.`,
    ``,
    `Proposal: ${node.source}`,
    `Status: ${node.status}`,
    ``,
    `Evaluate the proposal, check for completeness, and approve or request changes.`,
  ].join("\n");
}

/** Build a workstream creation prompt. */
function buildStartPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `Begin implementation of the ${node.title} initiative.`,
    ``,
    `Plan: ${initPath}/plan.md`,
    `Proposal: ${node.source}`,
    ``,
    `Follow the plan to implement the proposed changes.`,
  ].join("\n");
}

/** Build an integration review prompt. */
function buildIntegrationPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `Using /integration-review, integrate the completed ${node.title} initiative.`,
    ``,
    `Proposal: ${node.source}`,
    `Activity: ${initPath}/activity.md`,
    ``,
    `Review the completed work, apply any pending proposals to shared artifacts,`,
    `and update the initiative status to integrated.`,
  ].join("\n");
}

/** Get suggested lifecycle prompt for an initiative. */
function getSuggestedPrompt(node: ProcessNode): { prompt: string; label: string } | null {
  const lifecycle = node.metadata.lifecycle as LifecycleData | undefined;
  if (!lifecycle) return null;

  switch (lifecycle.stage) {
    case "needs-research":
      return { prompt: buildRrContinuePrompt(node), label: "Launch Research" };
    case "needs-proposal":
      return { prompt: buildRrContinuePrompt(node), label: "Continue Research" };
    case "needs-review":
      return { prompt: buildReviewPrompt(node), label: "Review Proposal" };
    case "needs-plan":
      return { prompt: buildPlanningPrompt(node), label: "Create Plan" };
    case "ready-to-start":
      return { prompt: buildStartPrompt(node), label: "Start Implementation" };
    case "ready-to-integrate":
      return { prompt: buildIntegrationPrompt(node), label: "Integrate" };
    default:
      return null;
  }
}

function ActionBar({ node, agentRoles }: { node: ProcessNode; agentRoles?: AgentRole[] }) {
  const actions = getActionsForNode(node);
  const hasResearch =
    node.kind === "initiative" &&
    Array.isArray((node.metadata.research as ResearchData | null)?.iterations) &&
    ((node.metadata.research as ResearchData).iterations.length > 0);
  const suggested = node.kind === "initiative" ? getSuggestedPrompt(node) : null;

  // Build role-prefixed prompts for workstreams with active role assignments
  const rolePrompts: { role: AgentRole; prompt: string }[] = [];
  if (node.kind === "workstream" && agentRoles) {
    const assignments = (node.metadata.roles ?? []) as WorkstreamRoleAssignment[];
    const activeAssignments = assignments.filter((a) => a.status === "active");
    for (const assignment of activeAssignments) {
      const role = agentRoles.find((r) => r.slug === assignment.slug);
      if (!role) continue;
      const parentId = node.parent;
      const parentInitiativeSlug = parentId?.replace("initiative/", "");
      const basePrompt = parentInitiativeSlug
        ? `Continue work on ${parentInitiativeSlug} initiative.\nWorkstream: ${node.source}\nFocus: ${node.summary ?? ""}`
        : `Workstream: ${node.source}\nFocus: ${node.summary ?? ""}`;
      const header = [
        `**Role: ${role.displayName}** (${role.category})`,
        ...(role.contextPackages.length > 0 ? [`Context: ${role.contextPackages.join(", ")}`] : []),
        ...(role.rules.length > 0 ? [`Rules: ${role.rules.join(", ")}`] : []),
        `---`,
        ``,
      ];
      rolePrompts.push({ role, prompt: header.join("\n") + basePrompt });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2">
      {/* Suggested lifecycle action — stands out from other buttons */}
      {suggested && (
        <PromptCopyButton
          prompt={suggested.prompt}
          variant="rr"
          label={`Suggested: ${suggested.label}`}
        />
      )}
      {actions.map((action) => {
        const Icon = action.icon;
        if (action.href) {
          return (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex items-center gap-1.5 rounded-md border border-border/20 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-[var(--color-gold)]/30 hover:text-[var(--color-gold)]"
            >
              <Icon className="h-3 w-3" />
              {action.label}
            </Link>
          );
        }
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/20 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-[var(--color-gold)]/30 hover:text-[var(--color-gold)]"
          >
            <Icon className="h-3 w-3" />
            {action.label}
          </button>
        );
      })}

      {/* Prompt copy buttons */}
      {node.kind === "initiative" && (
        <>
          <PromptCopyButton
            prompt={buildRrContinuePrompt(node)}
            variant="rr"
            label="Copy /rr"
          />
          {hasResearch && (
            <>
              <PromptCopyButton
                prompt={buildPlanningPrompt(node)}
                variant="planning"
              />
              <PromptCopyButton
                prompt={buildSynthesizePrompt(node)}
                variant="synthesize"
              />
            </>
          )}
          <PromptCopyButton
            prompt={buildSubInitiativePrompt(node)}
            variant="rr"
            label="Sub-initiative"
          />
        </>
      )}
      {node.kind === "seed" && (
        <PromptCopyButton
          prompt={buildRrLaunchPrompt(node)}
          variant="rr"
          label="Launch /rr"
        />
      )}
      {rolePrompts.map(({ role, prompt }) => (
        <PromptCopyButton
          key={role.slug}
          prompt={prompt}
          variant="workforce"
          label={role.displayName}
        />
      ))}
    </div>
  );
}

const TAB_TRIGGER_CLASS =
  "h-7 rounded-md px-3 text-xs uppercase tracking-[0.1em] data-[state=active]:bg-[var(--color-gold)]/10 data-[state=active]:text-[var(--color-gold)]";

export function ProcessDetailPane({
  node,
  allNodes,
  totalCount,
  onStatusChange,
  onPostApproval,
  onArchive,
  onRestore,
  onSelectNode,
  activeTab,
  onTabChange,
  agentRoles,
}: ProcessDetailPaneProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  if (!node) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground/40">
            {totalCount} nodes in workspace
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/25">
            Select an item or press <kbd className="rounded border border-border/30 px-1 py-0.5 font-mono text-[10px]">j</kbd> / <kbd className="rounded border border-border/30 px-1 py-0.5 font-mono text-[10px]">k</kbd> to navigate
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <PromptCopyButton
              prompt="/curate"
              variant="curate"
              label="Curate portfolio"
            />
            <PromptCopyButton
              prompt="/integration-review"
              variant="integration-review"
              label="Integration review"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 space-y-2 pb-4">
        <div className="flex items-center gap-3">
          <ProcessKindIcon
            kind={node.kind}
            className="h-5 w-5 text-[var(--color-gold)]/70"
          />
          <h2 className="flex-1 truncate text-lg font-semibold text-foreground">
            {node.title}
          </h2>
          {onStatusChange && KIND_STATUSES[node.kind] ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="cursor-pointer outline-none"
                disabled={isPending}
              >
                <div className="flex items-center gap-1">
                  <StatusBadge status={node.status} />
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground/40" />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {KIND_STATUSES[node.kind]!.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    disabled={status === node.status}
                    onSelect={() => {
                      startTransition(async () => {
                        const result = await onStatusChange(node.source, node.kind, status);
                        if (result.success) {
                          router.refresh();
                        }
                      });
                    }}
                  >
                    <StatusBadge status={status} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <StatusBadge status={node.status} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/40">
          <span>Created {formatDate(node.created)}</span>
          <span>·</span>
          <span>Updated {formatDate(node.updated)}</span>
          <span>·</span>
          <SourceLink source={node.source} />
        </div>
        <ActionBar node={node} agentRoles={agentRoles} />
      </div>

      <Separator className="mb-4 opacity-10" />

      {/* Tabs */}
      <Tabs value={activeTab ?? "overview"} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mb-4 shrink-0 bg-transparent">
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            Overview
          </TabsTrigger>
          {node.kind === "workstream" && (
            <TabsTrigger value="activity" className={TAB_TRIGGER_CLASS}>
              Activity
            </TabsTrigger>
          )}
          <TabsTrigger value="graph" className={TAB_TRIGGER_CLASS}>
            Graph
          </TabsTrigger>
          <TabsTrigger value="content" className={TAB_TRIGGER_CLASS}>
            Content
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="min-h-0 flex-1 overflow-y-auto">
          <OverviewTab node={node} onStatusChange={onStatusChange} onPostApproval={onPostApproval} onArchive={onArchive} onRestore={onRestore} />
        </TabsContent>
        {node.kind === "workstream" && (
          <TabsContent value="activity" className="min-h-0 flex-1 overflow-y-auto">
            <ActivityTab node={node} />
          </TabsContent>
        )}
        <TabsContent value="graph" className="min-h-0 flex-1 overflow-hidden">
          <ProcessGraph
            allNodes={allNodes}
            selectedNodeId={node.id}
            onSelectNode={onSelectNode ?? (() => {})}
          />
        </TabsContent>
        <TabsContent value="content" className="min-h-0 flex-1 overflow-y-auto">
          <ContentTab node={node} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
