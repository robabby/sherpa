import type { Metadata } from "next";

import { SectionHeader } from "@/components/studio/section-header";

import { MermaidDiagram } from "@/components/studio/mermaid-diagram";

export const metadata: Metadata = {
  title: "Workflow | Studio",
  robots: "noindex, nofollow",
};

const WORKFLOW_DIAGRAM = `flowchart TB
  idea(["Incoming Idea"])
  nightly(["Nightly Trigger"])

  subgraph Discovery["Discovery"]
    direction TB
    curate["Curate | /curate"]
    research["Research | /rr"]
    synthesize["Synthesize | /synthesize"]
    curate --> research
    research --> synthesize
  end

  idea --> research

  subgraph Governance["Governance"]
    direction TB
    propose["Propose | proposal.md"]
    intreview["Review | /integration-review"]
    decide{{"Approve / Decline"}}
    propose --> intreview
    intreview --> decide
  end

  synthesize --> propose
  decide -->|Declined| research

  subgraph Execution["Execution"]
    direction TB
    plan["Plan | /plan-tasks"]
    dispatch{{"Dispatch"}}
    claude["Claude Worker | worktree isolation"]
    lmstudio["LM Studio | Qwen 3.5 9B"]
    cli["CLI Agent | opencode · codex · gemini"]
    judge{{"Judge | verdict"}}
    plan --> dispatch
    dispatch -->|"Code tasks"| claude
    dispatch -->|"Content / research"| lmstudio
    dispatch -->|"Code review"| cli
    claude --> judge
    lmstudio --> judge
    cli --> judge
  end

  decide -->|Approved| plan
  judge -->|"Needs changes"| dispatch

  subgraph Delivery["Delivery"]
    direction TB
    codereview["Code Review | PR"]
    ship["Ship | merge to main"]
    codereview --> ship
  end

  judge -->|Approved| codereview

  subgraph Audit["Nightly Audit"]
    direction TB
    profiles["Profiles | audit-profiles.json"]
    chunk["Chunk | rules + source files"]
    auditrun["Dispatch | nightly-audit.mjs"]
    report["Report | audit-report.mjs"]
    archive["Archive | logs/archive/YYYY-MM-DD"]
    profiles --> chunk
    chunk --> auditrun
    auditrun --> report
    report --> archive
  end

  nightly --> profiles

  subgraph MorningReview["Morning Review"]
    direction TB
    morning["Review Results | /morning"]
    triage{{"Triage"}}
    morning --> triage
  end

  archive --> morning
  ship --> morning
  triage -->|"Fix tasks"| plan
  triage -->|"New ideas"| curate
`;

export default function WorkflowPage() {
  return (
    <div className="space-y-10">
      <SectionHeader label="Process" title="Product Workflow" />
      <div className="rounded-lg border border-[var(--border-gold)]/30 bg-background p-6">
        <MermaidDiagram definition={WORKFLOW_DIAGRAM} />
      </div>
    </div>
  );
}
