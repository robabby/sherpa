// Playbook definitions and status tracking for initiative process flows.
// Pure module — no I/O, no side effects, no imports from other studio-core modules.

// ---------------------------------------------------------------------------
// Play & Playbook identifiers
// ---------------------------------------------------------------------------

export const PLAY_IDS = [
  "rr",
  "stake",
  "premortem",
  "stress-test",
  "spike",
  "shape",
  "design",
  "plan-tasks",
  "memo",
  "radar",
  "retro",
] as const;

export type PlayId = (typeof PLAY_IDS)[number];

export const PLAYBOOK_IDS = ["fast-track", "standard", "high-stakes"] as const;

export type PlaybookId = (typeof PLAYBOOK_IDS)[number];

// ---------------------------------------------------------------------------
// Play definitions
// ---------------------------------------------------------------------------

export interface PlayDef {
  id: PlayId;
  label: string;
  skill: string;
  artifact: string;
}

export interface PlayStatus extends PlayDef {
  completed: boolean;
  suggested: boolean;
}

export interface PlaybookInfo {
  id: PlaybookId;
  label: string;
  plays: PlayStatus[];
  crossCutting: PlayStatus[];
  nextPlay: PlayId | null;
}

// ---------------------------------------------------------------------------
// Artifact presence flags
// ---------------------------------------------------------------------------

export interface ArtifactFlags {
  hasResearch: boolean;
  hasStake: boolean;
  hasPremortem: boolean;
  hasStressTest: boolean;
  hasSpike: boolean;
  hasShape: boolean;
  hasDesign: boolean;
  hasPlan: boolean;
  hasMemo: boolean;
  hasRadar: boolean;
}

// ---------------------------------------------------------------------------
// Play catalog — single source of truth for labels, skills, and artifacts
// ---------------------------------------------------------------------------

const PLAY_CATALOG: Record<PlayId, PlayDef> = {
  rr: { id: "rr", label: "Research", skill: "/rr", artifact: "research/" },
  stake: { id: "stake", label: "Stake", skill: "/stake", artifact: "stake.md" },
  premortem: { id: "premortem", label: "Pre-mortem", skill: "/premortem", artifact: "premortem.md" },
  "stress-test": { id: "stress-test", label: "Stress Test", skill: "/stress-test", artifact: "stress-test.md" },
  spike: { id: "spike", label: "Spike", skill: "/spike", artifact: "spike.md" },
  shape: { id: "shape", label: "Shape", skill: "/shape", artifact: "shape.md" },
  design: { id: "design", label: "Design", skill: "/design", artifact: "design.md" },
  "plan-tasks": { id: "plan-tasks", label: "Plan Tasks", skill: "/plan-tasks", artifact: "plan.md" },
  memo: { id: "memo", label: "Memo", skill: "/memo", artifact: "memo.md" },
  radar: { id: "radar", label: "Radar", skill: "/radar", artifact: "radar.md" },
  retro: { id: "retro", label: "Retro", skill: "/retro", artifact: "" },
};

// ---------------------------------------------------------------------------
// Play sequences per playbook
// ---------------------------------------------------------------------------

const PLAYBOOK_SEQUENCES: Record<PlaybookId, readonly PlayId[]> = {
  "fast-track": ["rr", "shape", "plan-tasks"],
  standard: ["rr", "stake", "shape", "design", "plan-tasks"],
  "high-stakes": ["rr", "stake", "premortem", "stress-test", "spike", "shape", "design", "plan-tasks"],
};

const CROSS_CUTTING_PLAYS: readonly PlayId[] = ["memo", "radar", "retro"];

const PLAYBOOK_LABELS: Record<PlaybookId, string> = {
  "fast-track": "Fast Track",
  standard: "Standard",
  "high-stakes": "High Stakes",
};

// ---------------------------------------------------------------------------
// Artifact flag mapping — which flag corresponds to which play
// ---------------------------------------------------------------------------

const PLAY_TO_FLAG: Record<PlayId, keyof ArtifactFlags | null> = {
  rr: "hasResearch",
  stake: "hasStake",
  premortem: "hasPremortem",
  "stress-test": "hasStressTest",
  spike: "hasSpike",
  shape: "hasShape",
  design: "hasDesign",
  "plan-tasks": "hasPlan",
  memo: "hasMemo",
  radar: "hasRadar",
  retro: null, // retro outputs go to docs/reports/, not inside the initiative
};

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Maps a proposal's `risk` field to the appropriate playbook.
 *
 * - "additive" → fast-track
 * - "structural" → high-stakes
 * - "evolutionary" or any other value → standard
 */
export function detectPlaybook(risk: string | null): PlaybookId {
  switch (risk) {
    case "additive":
      return "fast-track";
    case "structural":
      return "high-stakes";
    default:
      return "standard";
  }
}

/**
 * Builds a full PlaybookInfo with completion and suggestion status for each play.
 *
 * The first uncompleted play in the sequence is marked `suggested: true` and
 * returned as `nextPlay`. Cross-cutting plays are never suggested — they are
 * available anytime but not part of the linear sequence.
 */
export function getPlaybookStatus(
  playbookId: PlaybookId,
  artifacts: ArtifactFlags,
): PlaybookInfo {
  const sequence = PLAYBOOK_SEQUENCES[playbookId];
  let nextPlay: PlayId | null = null;

  const plays: PlayStatus[] = sequence.map((playId) => {
    const def = PLAY_CATALOG[playId];
    const flagKey = PLAY_TO_FLAG[playId];
    const completed = flagKey ? artifacts[flagKey] : false;
    const suggested = !completed && nextPlay === null;

    if (suggested) {
      nextPlay = playId;
    }

    return { ...def, completed, suggested };
  });

  const crossCutting: PlayStatus[] = CROSS_CUTTING_PLAYS.map((playId) => {
    const def = PLAY_CATALOG[playId];
    const flagKey = PLAY_TO_FLAG[playId];
    const completed = flagKey ? artifacts[flagKey] : false;
    return { ...def, completed, suggested: false };
  });

  return {
    id: playbookId,
    label: PLAYBOOK_LABELS[playbookId],
    plays,
    crossCutting,
    nextPlay,
  };
}
