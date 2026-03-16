"use client";

import { memo } from "react";
import { Handle, Position, NodeToolbar, type NodeProps } from "@xyflow/react";
import { cn } from "./lib/utils";
import { WORKFLOW_PHASE_LABELS, type WorkflowPhase } from "@sherpa/studio-core/workflow";

// ---------------------------------------------------------------------------
// Phase dot color mapping
// ---------------------------------------------------------------------------

function phaseDotColor(phase: WorkflowPhase | null): string {
  switch (phase) {
    case "audit":
      return "var(--color-bronze)";
    case "morning-review":
      return "var(--color-copper)";
    case null:
      return "var(--color-copper)";
    default:
      // discovery, governance, execution, delivery
      return "var(--color-gold)";
  }
}

// ---------------------------------------------------------------------------
// WorkflowStageNode
// ---------------------------------------------------------------------------

interface StageNodeData {
  label: string;
  subtitle?: string;
  phase?: WorkflowPhase | null;
  skill?: string | null;
  [key: string]: unknown;
}

const WorkflowStageNode = memo(function WorkflowStageNode({
  data,
  selected,
}: NodeProps) {
  const { label, subtitle, phase, skill } = data as StageNodeData;
  const displaySubtitle = subtitle || skill;

  return (
    <>
      {!selected && (
        <NodeToolbar position={Position.Top} isVisible={undefined}>
          <div className="rounded-lg bg-[rgba(24,24,27,0.95)] border border-[var(--color-gold)]/20 px-3 py-2 text-xs shadow-lg">
            <div className="font-medium text-foreground">{label}</div>
            {phase && (
              <div className="text-muted-foreground">
                {WORKFLOW_PHASE_LABELS[phase]}
              </div>
            )}
            {skill && (
              <div className="font-mono text-muted-foreground">{skill}</div>
            )}
          </div>
        </NodeToolbar>
      )}
      <div
        className={cn(
          "min-w-[140px] rounded-lg border px-3 py-2",
          "border-[var(--color-gold)]/20 bg-[var(--color-warm-charcoal)]",
          selected &&
            "border-[var(--color-gold)]/50 shadow-[0_0_20px_rgba(212,165,116,0.08)]"
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-[var(--color-gold)]/40 !border-none !w-2 !h-2"
        />
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: phaseDotColor(phase ?? null) }}
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {displaySubtitle ? (
              <span className="font-mono text-xs text-muted-foreground">
                {displaySubtitle}
              </span>
            ) : null}
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-[var(--color-gold)]/40 !border-none !w-2 !h-2"
        />
      </div>
    </>
  );
});

// ---------------------------------------------------------------------------
// WorkflowDecisionNode
// ---------------------------------------------------------------------------

interface DecisionNodeData {
  label: string;
  phase?: WorkflowPhase | null;
  [key: string]: unknown;
}

const WorkflowDecisionNode = memo(function WorkflowDecisionNode({
  data,
  selected,
}: NodeProps) {
  const { label, phase } = data as DecisionNodeData;

  return (
    <>
      {!selected && (
        <NodeToolbar position={Position.Top} isVisible={undefined}>
          <div className="rounded-lg bg-[rgba(24,24,27,0.95)] border border-[var(--color-gold)]/20 px-3 py-2 text-xs shadow-lg">
            <div className="font-medium text-foreground">{label}</div>
            {phase && (
              <div className="text-muted-foreground">
                {WORKFLOW_PHASE_LABELS[phase]}
              </div>
            )}
          </div>
        </NodeToolbar>
      )}
      <div
        className={cn(
          "min-w-[140px] rounded-lg border border-dashed px-3 py-2",
          "border-[var(--color-gold)]/25 bg-[var(--color-warm-charcoal)]",
          selected &&
            "border-[var(--color-gold)]/50 shadow-[0_0_20px_rgba(212,165,116,0.08)]"
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-[var(--color-gold)]/40 !border-none !w-2 !h-2"
        />
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: phaseDotColor(phase ?? null) }}
          />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-[var(--color-gold)]/40 !border-none !w-2 !h-2"
        />
      </div>
    </>
  );
});

// ---------------------------------------------------------------------------
// WorkflowTriggerNode
// ---------------------------------------------------------------------------

interface TriggerNodeData {
  label: string;
  [key: string]: unknown;
}

const WorkflowTriggerNode = memo(function WorkflowTriggerNode({
  data,
  selected,
}: NodeProps) {
  const { label } = data as TriggerNodeData;

  return (
    <>
      {!selected && (
        <NodeToolbar position={Position.Top} isVisible={undefined}>
          <div className="rounded-lg bg-[rgba(24,24,27,0.95)] border border-[var(--color-gold)]/20 px-3 py-2 text-xs shadow-lg">
            <div className="font-medium text-foreground">{label}</div>
            <div className="text-muted-foreground">Trigger</div>
          </div>
        </NodeToolbar>
      )}
      <div
        className={cn(
          "min-w-[140px] rounded-2xl border px-3 py-2",
          "border-[var(--color-copper)]/25 bg-[var(--color-warm-charcoal)]",
          selected &&
            "border-[var(--color-copper)]/50 shadow-[0_0_20px_rgba(196,154,108,0.08)]"
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--color-copper)" }}
          />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-[var(--color-copper)]/40 !border-none !w-2 !h-2"
        />
      </div>
    </>
  );
});

// ---------------------------------------------------------------------------
// WorkflowPhaseGroup
// ---------------------------------------------------------------------------

interface PhaseGroupData {
  label: string;
  phase?: string;
  [key: string]: unknown;
}

const WorkflowPhaseGroup = memo(function WorkflowPhaseGroup({
  data,
}: NodeProps) {
  const { label } = data as PhaseGroupData;

  return (
    <div
      className={cn(
        "rounded-xl border",
        "bg-[var(--color-gold)]/[0.02] border-[var(--color-gold)]/8",
        "pt-8 px-3 pb-3"
      )}
      style={{ width: "100%", height: "100%" }}
    >
      <span className="font-mono text-[11px] tracking-wide text-[var(--color-gold)]/40">
        {label}
      </span>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Exported node types map (defined outside render — React Flow requirement)
// ---------------------------------------------------------------------------

export const workflowNodeTypes = {
  "workflow-stage": WorkflowStageNode,
  "workflow-decision": WorkflowDecisionNode,
  "workflow-trigger": WorkflowTriggerNode,
  "workflow-phase-group": WorkflowPhaseGroup,
};
