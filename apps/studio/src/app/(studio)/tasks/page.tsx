import type { Metadata } from "next";
import { Suspense } from "react";
import path from "path";

import { MissionWorkspace } from "@/components/studio/mission-workspace";
import { getTaskBoard, getTaskDetail } from "@/lib/studio/tasks";
import { getTaskEvents } from "@/lib/studio/task-events";

export const metadata: Metadata = {
  title: "Tasks | Studio",
  robots: "noindex, nofollow",
};

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const tasks = getTaskBoard({ projectRoot: PROJECT_ROOT });
  const selectedId = params.node ?? null;
  const detail = selectedId
    ? getTaskDetail(selectedId, { projectRoot: PROJECT_ROOT })
    : null;
  const events = selectedId
    ? getTaskEvents(selectedId, { projectRoot: PROJECT_ROOT })
    : [];

  return (
    <Suspense>
      <MissionWorkspace
        tasks={tasks}
        initialDetail={detail}
        initialEvents={events}
      />
    </Suspense>
  );
}
