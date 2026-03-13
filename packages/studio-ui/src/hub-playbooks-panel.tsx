import { HubPanel } from "./hub-panel";

export interface PlaybookSummary {
  id: string;
  label: string;
  risk: string;
  playCount: number;
  initiativeCount: number;
}

interface HubPlaybooksPanelProps {
  playbooks: PlaybookSummary[];
}

function MicroRail({ playCount }: { playCount: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: playCount }, (_, i) => (
        <div key={i} className="flex items-center gap-[3px]">
          <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--color-gold)]/20" />
          {i < playCount - 1 && (
            <div className="h-px w-2 shrink-0 bg-[var(--glass-border)]" />
          )}
        </div>
      ))}
    </div>
  );
}

export function HubPlaybooksPanel({ playbooks }: HubPlaybooksPanelProps) {
  return (
    <HubPanel
      variant="playbooks"
      href="/playbooks"
      title="Process Playbooks"
      label="PLAYBOOKS"
      linkText="View all playbooks"
    >
      <div className="space-y-3.5">
        {playbooks.map((pb) => (
          <div
            key={pb.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-foreground/80">
                {pb.label}
              </span>
              <MicroRail playCount={pb.playCount} />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/40">
              {pb.initiativeCount}
            </span>
          </div>
        ))}
      </div>
    </HubPanel>
  );
}
