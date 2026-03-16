// Workflow canvas data model — canonical workflow topology.
// Safe to import from both server and client components (no React imports).

// ---------------------------------------------------------------------------
// Type constants
// ---------------------------------------------------------------------------

export const WORKFLOW_NODE_TYPES = ["stage", "decision", "trigger"] as const;
export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPES)[number];

export const WORKFLOW_PHASES = [
  "discovery",
  "governance",
  "execution",
  "delivery",
  "audit",
  "morning-review",
] as const;
export type WorkflowPhase = (typeof WORKFLOW_PHASES)[number];

export const WORKFLOW_EDGE_TYPES = [
  "ideas",
  "governance",
  "tasks",
  "code",
  "content",
  "review",
  "delivery",
  "audit",
  "feedback",
] as const;
export type WorkflowEdgeType = (typeof WORKFLOW_EDGE_TYPES)[number];

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface WorkflowNode {
  id: string;
  label: string;
  subtitle: string;
  nodeType: WorkflowNodeType;
  phase: WorkflowPhase | null;
  skill: string | null;
  href: string | null;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label: string | null;
  edgeType: WorkflowEdgeType;
  sourceSide?: "top" | "bottom" | "left" | "right";
  targetSide?: "top" | "bottom" | "left" | "right";
}

export interface WorkflowEdgeStyle {
  color: string;
  width: number;
  animated: boolean;
  particles: boolean;
  particleSpeed: number;
  dashed: boolean;
}

export interface WorkflowPhaseGroup {
  id: WorkflowPhase;
  label: string;
  nodes: string[];
}

// ---------------------------------------------------------------------------
// Edge styles
// ---------------------------------------------------------------------------

export const WORKFLOW_EDGE_STYLES: Record<WorkflowEdgeType, WorkflowEdgeStyle> =
  {
    ideas: {
      color: "#c49a6c",
      width: 1.5,
      animated: true,
      particles: true,
      particleSpeed: 40,
      dashed: false,
    },
    governance: {
      color: "#d4a574",
      width: 2,
      animated: false,
      particles: false,
      particleSpeed: 0,
      dashed: false,
    },
    tasks: {
      color: "#e8c49a",
      width: 2.5,
      animated: true,
      particles: true,
      particleSpeed: 120,
      dashed: false,
    },
    code: {
      color: "#a78bfa",
      width: 2.5,
      animated: true,
      particles: true,
      particleSpeed: 100,
      dashed: false,
    },
    content: {
      color: "#4ade80",
      width: 2,
      animated: false,
      particles: false,
      particleSpeed: 0,
      dashed: false,
    },
    review: {
      color: "#60a5fa",
      width: 2,
      animated: false,
      particles: false,
      particleSpeed: 0,
      dashed: false,
    },
    delivery: {
      color: "#34d399",
      width: 2,
      animated: false,
      particles: false,
      particleSpeed: 0,
      dashed: false,
    },
    audit: {
      color: "#8b7355",
      width: 1.5,
      animated: true,
      particles: true,
      particleSpeed: 35,
      dashed: false,
    },
    feedback: {
      color: "#f87171",
      width: 1.5,
      animated: true,
      particles: true,
      particleSpeed: 50,
      dashed: true,
    },
  };

// ---------------------------------------------------------------------------
// Phase labels
// ---------------------------------------------------------------------------

export const WORKFLOW_PHASE_LABELS: Record<WorkflowPhase, string> = {
  discovery: "Discovery",
  governance: "Governance",
  execution: "Execution",
  delivery: "Delivery",
  audit: "Nightly Audit",
  "morning-review": "Morning Review",
};

// ---------------------------------------------------------------------------
// Canonical workflow nodes
// ---------------------------------------------------------------------------

export const WORKFLOW_NODES: WorkflowNode[] = [
  // Triggers (outside subgraphs)
  {
    id: "idea",
    label: "Incoming Idea",
    subtitle: "",
    nodeType: "trigger",
    phase: null,
    skill: null,
    href: null,
  },
  {
    id: "nightly",
    label: "Nightly Trigger",
    subtitle: "",
    nodeType: "trigger",
    phase: null,
    skill: null,
    href: null,
  },

  // Discovery
  {
    id: "curate",
    label: "Curate",
    subtitle: "/curate",
    nodeType: "stage",
    phase: "discovery",
    skill: "/curate",
    href: "/process",
  },
  {
    id: "research",
    label: "Research",
    subtitle: "/rr",
    nodeType: "stage",
    phase: "discovery",
    skill: "/rr",
    href: "/process",
  },
  {
    id: "synthesize",
    label: "Synthesize",
    subtitle: "/synthesize",
    nodeType: "stage",
    phase: "discovery",
    skill: "/synthesize",
    href: "/process",
  },

  // Governance
  {
    id: "propose",
    label: "Propose",
    subtitle: "proposal.md",
    nodeType: "stage",
    phase: "governance",
    skill: "proposal.md",
    href: "/process",
  },
  {
    id: "review",
    label: "Review",
    subtitle: "/integration-review",
    nodeType: "stage",
    phase: "governance",
    skill: "/integration-review",
    href: "/process",
  },
  {
    id: "decide",
    label: "Approve / Decline",
    subtitle: "",
    nodeType: "decision",
    phase: "governance",
    skill: null,
    href: "/process",
  },

  // Execution
  {
    id: "plan",
    label: "Plan",
    subtitle: "/plan-tasks",
    nodeType: "stage",
    phase: "execution",
    skill: "/plan-tasks",
    href: "/dispatch",
  },
  {
    id: "dispatch",
    label: "Dispatch",
    subtitle: "",
    nodeType: "decision",
    phase: "execution",
    skill: null,
    href: "/dispatch",
  },
  {
    id: "claude",
    label: "Claude Worker",
    subtitle: "worktree isolation",
    nodeType: "stage",
    phase: "execution",
    skill: null,
    href: "/tasks",
  },
  {
    id: "lmstudio",
    label: "LM Studio",
    subtitle: "Qwen 3.5 9B",
    nodeType: "stage",
    phase: "execution",
    skill: null,
    href: "/tasks",
  },
  {
    id: "cli",
    label: "CLI Agent",
    subtitle: "opencode \u00b7 codex \u00b7 gemini",
    nodeType: "stage",
    phase: "execution",
    skill: null,
    href: "/tasks",
  },
  {
    id: "judge",
    label: "Judge",
    subtitle: "verdict",
    nodeType: "decision",
    phase: "execution",
    skill: null,
    href: "/tasks",
  },

  // Delivery
  {
    id: "codereview",
    label: "Code Review",
    subtitle: "PR",
    nodeType: "stage",
    phase: "delivery",
    skill: null,
    href: "/activity",
  },
  {
    id: "ship",
    label: "Ship",
    subtitle: "merge to main",
    nodeType: "stage",
    phase: "delivery",
    skill: null,
    href: "/activity",
  },

  // Nightly Audit
  {
    id: "profiles",
    label: "Profiles",
    subtitle: "audit-profiles.json",
    nodeType: "stage",
    phase: "audit",
    skill: null,
    href: "/activity",
  },
  {
    id: "chunk",
    label: "Chunk",
    subtitle: "rules + source files",
    nodeType: "stage",
    phase: "audit",
    skill: null,
    href: "/activity",
  },
  {
    id: "auditrun",
    label: "Dispatch",
    subtitle: "nightly-audit.mjs",
    nodeType: "stage",
    phase: "audit",
    skill: null,
    href: "/activity",
  },
  {
    id: "report",
    label: "Report",
    subtitle: "audit-report.mjs",
    nodeType: "stage",
    phase: "audit",
    skill: null,
    href: "/activity",
  },
  {
    id: "archive",
    label: "Archive",
    subtitle: "logs/archive/YYYY-MM-DD",
    nodeType: "stage",
    phase: "audit",
    skill: null,
    href: "/activity",
  },

  // Morning Review
  {
    id: "morning",
    label: "Review Results",
    subtitle: "/morning",
    nodeType: "stage",
    phase: "morning-review",
    skill: "/morning",
    href: "/activity",
  },
  {
    id: "triage",
    label: "Triage",
    subtitle: "",
    nodeType: "decision",
    phase: "morning-review",
    skill: null,
    href: "/activity",
  },
];

// ---------------------------------------------------------------------------
// Canonical workflow edges
// ---------------------------------------------------------------------------

export const WORKFLOW_EDGES: WorkflowEdge[] = [
  // Ideas flow
  {
    id: "e-idea-research",
    source: "idea",
    target: "research",
    label: null,
    edgeType: "ideas",
  },
  {
    id: "e-curate-research",
    source: "curate",
    target: "research",
    label: null,
    edgeType: "ideas",
  },
  {
    id: "e-research-synthesize",
    source: "research",
    target: "synthesize",
    label: null,
    edgeType: "ideas",
  },

  // Governance flow
  {
    id: "e-synthesize-propose",
    source: "synthesize",
    target: "propose",
    label: null,
    edgeType: "governance",
  },
  {
    id: "e-propose-review",
    source: "propose",
    target: "review",
    label: null,
    edgeType: "governance",
  },
  {
    id: "e-review-decide",
    source: "review",
    target: "decide",
    label: null,
    edgeType: "governance",
  },
  {
    id: "e-morning-triage",
    source: "morning",
    target: "triage",
    label: null,
    edgeType: "governance",
  },

  // Tasks flow
  {
    id: "e-decide-plan",
    source: "decide",
    target: "plan",
    label: "Approved",
    edgeType: "tasks",
  },
  {
    id: "e-plan-dispatch",
    source: "plan",
    target: "dispatch",
    label: null,
    edgeType: "tasks",
  },

  // Code flow
  {
    id: "e-dispatch-claude",
    source: "dispatch",
    target: "claude",
    label: "Code tasks",
    edgeType: "code",
  },
  {
    id: "e-claude-judge",
    source: "claude",
    target: "judge",
    label: null,
    edgeType: "code",
  },

  // Content flow
  {
    id: "e-dispatch-lmstudio",
    source: "dispatch",
    target: "lmstudio",
    label: "Content / research",
    edgeType: "content",
  },
  {
    id: "e-lmstudio-judge",
    source: "lmstudio",
    target: "judge",
    label: null,
    edgeType: "content",
  },

  // Review flow
  {
    id: "e-dispatch-cli",
    source: "dispatch",
    target: "cli",
    label: "Code review",
    edgeType: "review",
  },
  {
    id: "e-cli-judge",
    source: "cli",
    target: "judge",
    label: null,
    edgeType: "review",
  },

  // Feedback loops
  {
    id: "e-decide-research",
    source: "decide",
    target: "research",
    label: "Declined",
    edgeType: "feedback",
    sourceSide: "right",
    targetSide: "right",
  },
  {
    id: "e-judge-dispatch",
    source: "judge",
    target: "dispatch",
    label: "Needs changes",
    edgeType: "feedback",
    sourceSide: "left",
    targetSide: "left",
  },
  {
    id: "e-triage-plan",
    source: "triage",
    target: "plan",
    label: "Fix tasks",
    edgeType: "feedback",
    sourceSide: "left",
    targetSide: "left",
  },
  {
    id: "e-triage-curate",
    source: "triage",
    target: "curate",
    label: "New ideas",
    edgeType: "feedback",
    sourceSide: "right",
    targetSide: "right",
  },

  // Delivery flow
  {
    id: "e-judge-codereview",
    source: "judge",
    target: "codereview",
    label: "Approved",
    edgeType: "delivery",
  },
  {
    id: "e-codereview-ship",
    source: "codereview",
    target: "ship",
    label: null,
    edgeType: "delivery",
  },
  {
    id: "e-ship-morning",
    source: "ship",
    target: "morning",
    label: null,
    edgeType: "delivery",
  },

  // Audit flow
  {
    id: "e-nightly-profiles",
    source: "nightly",
    target: "profiles",
    label: null,
    edgeType: "audit",
  },
  {
    id: "e-profiles-chunk",
    source: "profiles",
    target: "chunk",
    label: null,
    edgeType: "audit",
  },
  {
    id: "e-chunk-auditrun",
    source: "chunk",
    target: "auditrun",
    label: null,
    edgeType: "audit",
  },
  {
    id: "e-auditrun-report",
    source: "auditrun",
    target: "report",
    label: null,
    edgeType: "audit",
  },
  {
    id: "e-report-archive",
    source: "report",
    target: "archive",
    label: null,
    edgeType: "audit",
  },
  {
    id: "e-archive-morning",
    source: "archive",
    target: "morning",
    label: null,
    edgeType: "audit",
  },
];

// ---------------------------------------------------------------------------
// Phase groups
// ---------------------------------------------------------------------------

export const WORKFLOW_PHASE_GROUPS: WorkflowPhaseGroup[] = [
  {
    id: "discovery",
    label: "Discovery",
    nodes: ["curate", "research", "synthesize"],
  },
  {
    id: "governance",
    label: "Governance",
    nodes: ["propose", "review", "decide"],
  },
  {
    id: "execution",
    label: "Execution",
    nodes: ["plan", "dispatch", "claude", "lmstudio", "cli", "judge"],
  },
  { id: "delivery", label: "Delivery", nodes: ["codereview", "ship"] },
  {
    id: "audit",
    label: "Nightly Audit",
    nodes: ["profiles", "chunk", "auditrun", "report", "archive"],
  },
  {
    id: "morning-review",
    label: "Morning Review",
    nodes: ["morning", "triage"],
  },
];

// ---------------------------------------------------------------------------
// Mermaid export
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Generate a Mermaid `flowchart TB` string from the canonical workflow data.
 * Pure function — no side effects.
 */
export function exportWorkflowAsMermaid(): string {
  const nodeMap = new Map<string, WorkflowNode>();
  for (const node of WORKFLOW_NODES) {
    nodeMap.set(node.id, node);
  }

  // Build nodeId → groupId lookup
  const nodeGroup = new Map<string, string>();
  for (const group of WORKFLOW_PHASE_GROUPS) {
    for (const nid of group.nodes) {
      nodeGroup.set(nid, group.id);
    }
  }

  const lines: string[] = ["flowchart TB"];

  // Trigger nodes (outside subgraphs)
  for (const node of WORKFLOW_NODES) {
    if (node.nodeType === "trigger") {
      lines.push(`  ${node.id}(["${node.label}"])`);
    }
  }

  // Phase-group subgraphs
  for (const group of WORKFLOW_PHASE_GROUPS) {
    lines.push("");
    lines.push(`  subgraph ${capitalize(group.id)}["${group.label}"]`);
    lines.push("    direction TB");

    // Nodes in this group
    for (const nid of group.nodes) {
      const node = nodeMap.get(nid);
      if (!node) continue;

      if (node.nodeType === "decision") {
        lines.push(`    ${node.id}{{"${node.label}"}}`);
      } else {
        const text =
          node.subtitle ? `${node.label} | ${node.subtitle}` : node.label;
        lines.push(`    ${node.id}["${text}"]`);
      }
    }

    // Intra-group edges
    const groupNodeSet = new Set(group.nodes);
    for (const edge of WORKFLOW_EDGES) {
      if (groupNodeSet.has(edge.source) && groupNodeSet.has(edge.target)) {
        if (edge.label) {
          lines.push(`    ${edge.source} -->|"${edge.label}"| ${edge.target}`);
        } else {
          lines.push(`    ${edge.source} --> ${edge.target}`);
        }
      }
    }

    lines.push("  end");
  }

  // Cross-group edges (and edges involving triggers)
  lines.push("");
  for (const edge of WORKFLOW_EDGES) {
    const sg = nodeGroup.get(edge.source);
    const tg = nodeGroup.get(edge.target);
    // Skip if both are in the same group (already emitted above)
    if (sg && tg && sg === tg) continue;

    if (edge.label) {
      lines.push(`  ${edge.source} -->|"${edge.label}"| ${edge.target}`);
    } else {
      lines.push(`  ${edge.source} --> ${edge.target}`);
    }
  }

  return lines.join("\n") + "\n";
}
