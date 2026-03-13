import Link from "next/link";

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

export function HubPlaybooksPanel({ playbooks }: HubPlaybooksPanelProps) {
  return (
    <HubPanel
      variant="playbooks"
      href="/playbooks"
      title="Playbooks"
      label="PLAYBOOKS"
      linkText="View all playbooks"
    >
      <div className="space-y-5">
        <p className="font-heading text-lg text-foreground">
          {playbooks.length} playbooks
        </p>

        <div className="space-y-3">
          {playbooks.map((pb) => (
            <div
              key={pb.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Link
                  href={`/playbooks#${pb.id}`}
                  className="inline-flex shrink-0 items-center rounded-md border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/[0.06] px-2.5 py-0.5 font-heading text-sm font-medium text-foreground transition-colors hover:border-[var(--color-gold)]/40 hover:bg-[var(--color-gold)]/[0.10]"
                >
                  {pb.label}
                </Link>
                <span className="text-xs text-muted-foreground/60">
                  {pb.risk}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-muted-foreground/70">
                <span>
                  {pb.playCount} <span className="text-muted-foreground/40">plays</span>
                </span>
                <span className="text-muted-foreground/20">|</span>
                <span>
                  {pb.initiativeCount} <span className="text-muted-foreground/40">active</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HubPanel>
  );
}
