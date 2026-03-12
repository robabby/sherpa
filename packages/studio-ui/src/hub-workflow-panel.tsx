import { HubPanel } from "./hub-panel";

const STAGES = [
  { name: "Curate", skill: "/curate" },
  { name: "Research", skill: "/rr" },
  { name: "Propose", skill: "proposal.md" },
  { name: "Review", skill: "/integration-review" },
  { name: "Plan", skill: "/plan-tasks" },
  { name: "Dispatch", skill: "multi-backend" },
  { name: "Judge", skill: "verdict" },
  { name: "Ship", skill: "PR merge" },
  { name: "Audit", skill: "nightly" },
  { name: "Morning", skill: "/morning" },
];

export function HubWorkflowPanel() {
  return (
    <HubPanel
      variant="workflow"
      href="/app/studio/workflow"
      title="Operating Loop"
      label="WORKFLOW"
      linkText="View full diagram"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Discovery → Governance → Execution → Delivery → Audit → Review
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((stage, i) => (
            <span key={stage.name} className="flex items-center gap-1.5">
              <span className="inline-block rounded border border-[var(--color-copper)]/20 px-2 py-0.5 font-mono text-xs text-foreground">
                {stage.name}
              </span>
              {i < STAGES.length - 1 && (
                <span className="text-xs text-muted-foreground/40">→</span>
              )}
            </span>
          ))}
        </div>
        <p className="font-mono text-[11px] text-muted-foreground/50">
          6 phases · 10 stages · two loops
        </p>
      </div>
    </HubPanel>
  );
}
