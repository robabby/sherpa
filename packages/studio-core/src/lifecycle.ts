// Lifecycle stage detection for initiatives.
// Pure function — no I/O, no side effects.

export const LIFECYCLE_STAGES = [
  "needs-research",
  "needs-proposal",
  "needs-review",
  "needs-plan",
  "ready-to-start",
  "in-flight",
  "ready-to-integrate",
  "integrated",
  "archived",
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

export interface LifecycleInfo {
  stage: LifecycleStage;
  label: string;
  nextAction: string;
  actor: "human" | "agent" | null;
  stageIndex: number;
}

const STAGE_META: Record<
  LifecycleStage,
  { label: string; nextAction: string; actor: "human" | "agent" | null }
> = {
  "needs-research": {
    label: "Needs Research",
    nextAction: "Launch /rr to begin research",
    actor: "agent",
  },
  "needs-proposal": {
    label: "Needs Proposal",
    nextAction: "Write proposal from research findings",
    actor: "agent",
  },
  "needs-review": {
    label: "Needs Review",
    nextAction: "Review and approve proposal",
    actor: "human",
  },
  "needs-plan": {
    label: "Needs Plan",
    nextAction: "Create implementation plan",
    actor: "agent",
  },
  "ready-to-start": {
    label: "Ready to Start",
    nextAction: "Begin implementation following the plan",
    actor: "agent",
  },
  "in-flight": {
    label: "In Flight",
    nextAction: "Active work in progress",
    actor: null,
  },
  "ready-to-integrate": {
    label: "Ready to Integrate",
    nextAction: "Review and integrate completed work",
    actor: "human",
  },
  integrated: {
    label: "Integrated",
    nextAction: "Done",
    actor: null,
  },
  archived: {
    label: "Archived",
    nextAction: "Restore to reactivate",
    actor: "human",
  },
};

export function detectLifecycle(opts: {
  status: string;
  hasResearch: boolean;
  iterationCount: number;
  hasPlan: boolean;
  linkedWorkstreamStatus: string | null;
}): LifecycleInfo {
  const { status, hasResearch, iterationCount, hasPlan, linkedWorkstreamStatus } = opts;

  let stage: LifecycleStage;

  if (status === "archived") {
    stage = "archived";
  } else if (status === "integrated") {
    stage = "integrated";
  } else if (linkedWorkstreamStatus === "completed") {
    stage = "ready-to-integrate";
  } else if (linkedWorkstreamStatus === "active") {
    stage = "in-flight";
  } else if (status === "approved" || status === "in-progress") {
    if (!hasPlan) {
      stage = "needs-plan";
    } else if (!linkedWorkstreamStatus) {
      stage = "ready-to-start";
    } else {
      // paused workstream — still in-flight conceptually
      stage = "in-flight";
    }
  } else if (status === "pending") {
    if (!hasResearch && iterationCount === 0) {
      stage = "needs-research";
    } else if (iterationCount > 0) {
      // Has research iterations but still pending — proposal needs review
      stage = "needs-review";
    } else {
      stage = "needs-proposal";
    }
  } else {
    // declined or unknown
    stage = "needs-research";
  }

  const meta = STAGE_META[stage];
  return {
    stage,
    label: meta.label,
    nextAction: meta.nextAction,
    actor: meta.actor,
    stageIndex: LIFECYCLE_STAGES.indexOf(stage),
  };
}
