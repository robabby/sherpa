"use client";

import Link from "next/link";
import type { FileTreeNode, ProcessNode } from "@/lib/studio/process-nodes-shared";
import type { ChartSpec, WorkstreamRoleAssignment } from "@/lib/studio/types";
import { cn } from "./lib/utils";
import { MetadataRow, MonoList, type LifecycleData } from "./lib/process-detail-helpers";
import { promptContextFromNode } from "./lib/initiative-prompts";
import type { PlaybookInfo } from "@/lib/studio/playbooks";
import { ArchiveButton, RestoreButton } from "./archive-restore-buttons";
import { ChartRenderer } from "./chart-renderer";
import { InitiativeFileTree } from "./initiative-file-tree";
import { InitiativeLifecycleHero } from "./initiative-lifecycle-hero";
import { InitiativeMetadataGrid } from "./initiative-metadata-grid";
import { InitiativePlaybookSection } from "./initiative-playbook-section";
import { InitiativeSessionsSection } from "./initiative-sessions-section";
import { ProposalActions } from "./proposal-actions";

// ---------------------------------------------------------------------------
// Role assignment pills (workstream-specific)
// ---------------------------------------------------------------------------

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
          href={`/workforce/${r.slug}`}
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
// Props
// ---------------------------------------------------------------------------

export interface InitiativeOverviewProps {
  node: ProcessNode;
  onStatusChange?: (source: string, kind: string, newStatus: string) => Promise<{ success: boolean; error?: string }>;
  onPostApproval?: (slug: string, source: string) => Promise<{ success: boolean; tasks: string[]; error?: string }>;
  onArchive?: (slug: string) => Promise<{ success: boolean; error?: string }>;
  onRestore?: (slug: string) => Promise<{ success: boolean; error?: string }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OverviewTab({ node, onStatusChange, onPostApproval, onArchive, onRestore }: InitiativeOverviewProps) {
  const meta = node.metadata;

  const lifecycle = node.kind === "initiative"
    ? (node.metadata.lifecycle as LifecycleData | undefined)
    : undefined;

  return (
    <div className="space-y-5">
      {/* Initiative: Lifecycle Hero + Metadata Grid */}
      {node.kind === "initiative" && lifecycle && (
        <>
          <InitiativeLifecycleHero
            lifecycle={lifecycle}
            promptContext={promptContextFromNode(node)}
            playbook={(meta.playbook as PlaybookInfo) ?? null}
          />

          {meta.playbook && (
            <InitiativePlaybookSection
              playbook={meta.playbook as PlaybookInfo}
              promptContext={promptContextFromNode(node)}
            />
          )}

          {lifecycle.stage === "needs-review" && onStatusChange && (
            <div>
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

          {lifecycle.stage === "archived" && onRestore && (
            <RestoreButton
              slug={node.id.replace("initiative/", "")}
              title={node.title}
              onRestore={onRestore}
            />
          )}

          {lifecycle.stage !== "archived" && onArchive && (
            <ArchiveButton
              slug={node.id.replace("initiative/", "")}
              title={node.title}
              onArchive={onArchive}
            />
          )}

          {node.summary && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {node.summary}
            </p>
          )}

          <InitiativeMetadataGrid node={node} />

          {meta.fileTree && (
            <div>
              <InitiativeFileTree tree={meta.fileTree as FileTreeNode} />
            </div>
          )}

          {Array.isArray(meta.chartSpecs) && (meta.chartSpecs as ChartSpec[]).length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
                Charts
              </span>
              {(meta.chartSpecs as ChartSpec[]).map((spec) => (
                <Link
                  key={spec.id}
                  href={`/process/${node.id.replace("initiative/", "")}/chart/${spec.id}`}
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

      {/* Non-initiative node kinds retain original layout */}
      {node.kind !== "initiative" && (
        <>
          {node.summary && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {node.summary}
            </p>
          )}
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
