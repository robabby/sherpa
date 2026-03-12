import { cn } from "./lib/utils";
import type { TaskBoardEntry } from "@/lib/studio/tasks";
import { HubPanel } from "./hub-panel";

const STATUS_DOT: Record<string, string> = {
  pending: "bg-muted-foreground shadow-[0_0_4px_rgba(113,113,122,0.3)]",
  dispatched: "bg-[var(--color-copper)] shadow-[0_0_6px_rgba(196,154,108,0.4)] led-active",
  completed: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]",
  reviewed: "bg-[var(--color-gold)] shadow-[0_0_6px_rgba(212,165,116,0.4)]",
  failed: "bg-rose-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]",
};

interface HubTasksPanelProps {
  tasks: TaskBoardEntry[];
}

export function HubTasksPanel({ tasks }: HubTasksPanelProps) {
  const activeCount = tasks.filter(
    (t) => t.status === "pending" || t.status === "dispatched"
  ).length;
  const awaitingReview = tasks.filter(
    (t) => t.status === "completed" && t.judgeVerdict === "pending"
  ).length;
  const recent = tasks.slice(0, 3);

  return (
    <HubPanel
      variant="tasks"
      href="/tasks"
      title="Task Board"
      label="TASKS"
      linkText="View task board"
    >
      <div className="space-y-5">
        <div>
          <p className="font-heading text-lg text-foreground">
            {activeCount} active
          </p>
          {awaitingReview > 0 && (
            <p className="font-mono text-xs text-muted-foreground/60">
              {awaitingReview} awaiting review
            </p>
          )}
        </div>

        {recent.length > 0 && (
          <div className="space-y-2">
            {recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 text-sm"
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    STATUS_DOT[t.status] ?? "bg-muted-foreground"
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {t.title}
                </span>
                <span className="shrink-0 rounded border border-[var(--glass-border)] bg-[var(--glass-bg)] px-1 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                  {t.backend}
                </span>
              </div>
            ))}
          </div>
        )}

        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground/60">
            No tasks in pipeline
          </p>
        )}
      </div>
    </HubPanel>
  );
}
