"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Clipboard,
  Copy,
  ExternalLink,
  FolderTree,
} from "lucide-react";
import type { ProcessNode } from "@/lib/studio/process-nodes-shared";
import type { AgentRole, WorkstreamRoleAssignment } from "@/lib/studio/types";
import {
  promptContextFromNode,
  seedContextFromNode,
  getSuggestedPrompt,
  buildRrContinuePrompt,
  buildPlanningPrompt,
  buildSynthesizePrompt,
  buildSubInitiativePrompt,
  buildRrLaunchPrompt,
  buildShapePrompt,
  buildStakePrompt,
  buildSpikePrompt,
  buildDesignPrompt,
  buildPremortemPrompt,
  buildStressTestPrompt,
  buildMemoPrompt,
  buildRadarPrompt,
} from "./lib/initiative-prompts";
import type { PlaybookInfo } from "@/lib/studio/playbooks";
import type { LifecycleData, ResearchData } from "./lib/process-detail-helpers";
import { PromptCopyButton } from "./prompt-copy-button";

// ---------------------------------------------------------------------------
// Action button helpers
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
        href: `/process/${slug}`,
      });
      break;
    }
    case "workstream": {
      const initSlug = (node.metadata.initiative as string | undefined)?.split("/")[0];
      if (initSlug) {
        actions.push({
          label: "View Initiative",
          icon: ExternalLink,
          href: `/process/${initSlug}`,
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
          href: `/process/${parentSlug}`,
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
        href: `/primitives/${slug}`,
      });
      break;
    }
  }

  return actions;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActionBar({ node, agentRoles }: { node: ProcessNode; agentRoles?: AgentRole[] }) {
  const actions = getActionsForNode(node);
  const hasResearch =
    node.kind === "initiative" &&
    Array.isArray((node.metadata.research as ResearchData | null)?.iterations) &&
    ((node.metadata.research as ResearchData).iterations.length > 0);

  const lifecycle = node.metadata.lifecycle as LifecycleData | undefined;
  const playbook = node.kind === "initiative"
    ? (node.metadata.playbook as PlaybookInfo | undefined) ?? null
    : null;
  const suggested = node.kind === "initiative" && lifecycle
    ? getSuggestedPrompt(promptContextFromNode(node), lifecycle.stage, playbook)
    : null;

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

  const ctx = node.kind === "initiative" ? promptContextFromNode(node) : null;

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
      {node.kind === "initiative" && ctx && (
        <>
          <PromptCopyButton
            prompt={buildRrContinuePrompt(ctx)}
            variant="rr"
            label="Copy /rr"
          />
          {hasResearch && (
            <>
              <PromptCopyButton
                prompt={buildPlanningPrompt(ctx)}
                variant="planning"
              />
              <PromptCopyButton
                prompt={buildSynthesizePrompt(ctx)}
                variant="synthesize"
              />
            </>
          )}
          <PromptCopyButton
            prompt={buildSubInitiativePrompt(ctx)}
            variant="rr"
            label="Sub-initiative"
          />
          {/* Post-research skill buttons — show when approved/in-progress */}
          {(node.status === "approved" || node.status === "in-progress") && (
            <>
              <PromptCopyButton prompt={buildStakePrompt(ctx)} variant="stake" />
              <PromptCopyButton prompt={buildShapePrompt(ctx)} variant="shape" />
              <PromptCopyButton prompt={buildDesignPrompt(ctx)} variant="design" />
              <PromptCopyButton prompt={buildSpikePrompt(ctx)} variant="spike" />
              <PromptCopyButton prompt={buildPremortemPrompt(ctx)} variant="premortem" />
              <PromptCopyButton prompt={buildStressTestPrompt(ctx)} variant="stress-test" />
            </>
          )}
          {hasResearch && (
            <>
              <PromptCopyButton prompt={buildRadarPrompt(ctx)} variant="radar" />
              <PromptCopyButton prompt={buildMemoPrompt(ctx)} variant="memo" />
            </>
          )}
        </>
      )}
      {node.kind === "seed" && (
        <PromptCopyButton
          prompt={buildRrLaunchPrompt(seedContextFromNode(node))}
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
