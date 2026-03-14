import type { Metadata } from "next";
import { Suspense } from "react";
import path from "path";

import { TasksContent } from "@/components/studio/tasks-content";
import { getTaskBoard } from "@/lib/studio/tasks";

export const metadata: Metadata = {
  title: "Tasks | Studio",
  robots: "noindex, nofollow",
};

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

export default function TasksPage() {
  const tasks = getTaskBoard({ projectRoot: PROJECT_ROOT });

  return (
    <Suspense>
      <TasksContent tasks={tasks} />
    </Suspense>
  );
}
