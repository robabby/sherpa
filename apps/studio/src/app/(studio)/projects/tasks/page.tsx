import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getAllTasks } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Tasks — All Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function AggregateTasksPage() {
  const tasks = getAllTasks();

  // Group by status for a quick summary
  const statusCounts = new Map<string, number>();
  for (const task of tasks) {
    statusCounts.set(task.status, (statusCounts.get(task.status) ?? 0) + 1);
  }

  // Sort: pending/dispatched first, then by created date descending
  const STATUS_ORDER: Record<string, number> = {
    dispatched: 0,
    pending: 1,
    completed: 2,
    reviewed: 3,
    failed: 4,
  };
  const sorted = [...tasks].sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 99;
    const sb = STATUS_ORDER[b.status] ?? 99;
    if (sa !== sb) return sa - sb;
    return (b.created ?? "").localeCompare(a.created ?? "");
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Tasks</h1>
        <div className="flex items-center gap-2">
          {Array.from(statusCounts.entries()).map(([status, count]) => (
            <Badge key={status} variant="secondary" className="font-mono text-[10px]">
              {status} {count}
            </Badge>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No tasks found across any project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {sorted.map((task) => (
            <Link
              key={`${task.projectSlug}/${task.id}`}
              href={`/projects/${task.projectSlug}/tasks?node=${task.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    task.status === "dispatched"
                      ? "default"
                      : task.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                  className="font-mono text-[10px]"
                >
                  {task.status}
                </Badge>
                <span className="text-sm text-foreground">
                  {task.title || task.id}
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {task.projectName}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                {task.role && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {task.role}
                  </span>
                )}
                <span className="font-mono text-xs text-muted-foreground">
                  {task.created}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
