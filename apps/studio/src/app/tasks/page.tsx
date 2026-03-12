import type { Metadata } from "next";

import { TasksContent } from "@/components/studio/tasks-content";
import { getTaskBoard } from "@/lib/studio/tasks";

export const metadata: Metadata = {
  title: "Tasks | Studio",
  robots: "noindex, nofollow",
};

export default function TasksPage() {
  const tasks = getTaskBoard();

  return <TasksContent tasks={tasks} />;
}
