"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, Loader2 } from "lucide-react";

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
import type { ProcessNode } from "@/lib/studio/process-nodes-shared";
import type { AgentRole } from "@/lib/studio/types";
import type { StaleDoc } from "@sherpa/studio-core";

import { KIND_STATUSES, formatDate, sourceToHref, SourceLink } from "./lib/process-detail-helpers";
import { ActionBar } from "./process-action-bar";
import { ActivityTab } from "./process-activity-tab";
import { OverviewTab } from "./initiative-overview-section";
import { ProcessGraph } from "./process-graph";
import { ProcessKindIcon } from "./process-kind-icon";
import { PromptCopyButton } from "./prompt-copy-button";
import { ResearchTab } from "./process-research-tab";
import { StatusBadge } from "./status-badge";

// ---------------------------------------------------------------------------
// Content Tab (thin — stays inline)
// ---------------------------------------------------------------------------

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
// Props
// ---------------------------------------------------------------------------

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
  /** Initiative slug → its stale docs (git-aware drift). Drives the detail-pane indicator. */
  staleDocsByInitiative?: Record<string, StaleDoc[]>;
}

// ---------------------------------------------------------------------------
// Tab trigger style
// ---------------------------------------------------------------------------

const TAB_TRIGGER_CLASS =
  "h-7 rounded-md px-3 text-xs uppercase tracking-[0.1em] data-[state=active]:bg-[var(--color-gold)]/10 data-[state=active]:text-[var(--color-gold)]";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
  staleDocsByInitiative,
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

  const staleDocs =
    node.kind === "initiative" && staleDocsByInitiative
      ? (staleDocsByInitiative[node.id.replace(/^initiative\//, "")] ?? [])
      : [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 space-y-2 pb-4">
        <div className="flex items-center gap-3">
          <ProcessKindIcon
            kind={node.kind}
            className="h-5 w-5 text-[var(--color-gold)]/70"
          />
          <h2 className="flex-1 truncate text-lg font-heading text-foreground">
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

        {/* Git-aware doc drift — read-only; mark-verified lives on the Docs surface */}
        {staleDocs.length > 0 && (
          <div className="rounded-md border border-rose-500/20 bg-rose-500/[0.04] px-3 py-2">
            <div className="flex items-center gap-1.5 text-rose-400/80">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs font-medium">
                {staleDocs.length} {staleDocs.length === 1 ? "doc" : "docs"} possibly stale
              </span>
            </div>
            <ul className="mt-1.5 space-y-1">
              {staleDocs.map((d) => (
                <li
                  key={d.relativePath}
                  className="flex items-baseline justify-between gap-2 text-[11px]"
                >
                  <Link
                    href={`/docs?doc=${encodeURIComponent(d.slug)}`}
                    className="truncate text-rose-400/70 underline decoration-rose-500/20 underline-offset-2 transition-colors hover:text-rose-300"
                  >
                    {d.title}
                  </Link>
                  <span className="shrink-0 font-mono text-rose-400/50">
                    {d.commitsSinceVerified} {d.commitsSinceVerified === 1 ? "commit" : "commits"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ActionBar node={node} agentRoles={agentRoles} />
      </div>

      <Separator className="mb-4 opacity-10" />

      {/* Tabs */}
      <Tabs value={activeTab ?? "overview"} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mb-4 shrink-0 bg-transparent">
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            Overview
          </TabsTrigger>
          {node.kind === "initiative" && (
            <TabsTrigger value="research" className={TAB_TRIGGER_CLASS}>
              Research
            </TabsTrigger>
          )}
          {(node.kind === "workstream" || node.kind === "initiative") && (
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
        {node.kind === "initiative" && (
          <TabsContent value="research" className="min-h-0 flex-1 overflow-y-auto">
            <ResearchTab node={node} />
          </TabsContent>
        )}
        {(node.kind === "workstream" || node.kind === "initiative") && (
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
