import type { Metadata } from "next";
import { Suspense } from "react";

import { TasksContent } from "@/components/studio/tasks-content";
import { getTaskBoard } from "@/lib/studio/tasks";

export const metadata: Metadata = {
  title: "Tasks | Studio",
  robots: "noindex, nofollow",
};

export default function TasksPage() {
  const tasks = getTaskBoard();

  return (
    <Suspense>
      <TasksContent tasks={tasks} />
    </Suspense>
  );
}
