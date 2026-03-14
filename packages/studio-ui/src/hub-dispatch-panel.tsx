import type { TaskBoardEntry } from "@/lib/studio/tasks";
import type { BackendHealth } from "@sherpa/studio-core";
import { HubPanel } from "./hub-panel";

interface HubDispatchPanelProps {
  tasks: TaskBoardEntry[];
  health: BackendHealth[];
}

export function HubDispatchPanel({ tasks, health }: HubDispatchPanelProps) {
  const dispatched = tasks.filter((t) => t.status === "dispatched").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const backendsUp = health.filter((h) => h.available).length;

  return (
    <HubPanel
      variant="tasks"
      href="/dispatch"
      title="Dispatch Center"
      label="DISPATCH"
      linkText="Open dispatch center"
    >
      <div className="space-y-4">
        <div className="flex items-baseline gap-4">
          <div>
            <p className="font-heading text-lg text-foreground">
              {dispatched} active
            </p>
            <p className="font-mono text-xs text-muted-foreground/60">
              {pending} in backlog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {health.map((h) => (
            <div key={h.backend} className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  h.available
                    ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]"
                    : "bg-rose-400 shadow-[0_0_4px_rgba(248,113,113,0.4)]"
                }`}
              />
              <span className="font-mono text-[10px] text-muted-foreground/50">
                {h.backend}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/50">
          {backendsUp}/{health.length} backends online
        </p>
      </div>
    </HubPanel>
  );
}
