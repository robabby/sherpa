import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MissionWorkspace } from "@/components/studio/mission-workspace";
import { getProject } from "@/lib/studio";
import { getTaskBoard, getTaskDetail } from "@/lib/studio/tasks";
import { getTaskEvents } from "@/lib/studio/task-events";

export const metadata: Metadata = {
  title: "Tasks | Studio",
  robots: "noindex, nofollow",
};

export default async function ProjectTasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ project: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const sp = await searchParams;
  const tasks = getTaskBoard({ projectRoot: project.root });
  const selectedId = sp.node ?? null;
  const detail = selectedId
    ? getTaskDetail(selectedId, { projectRoot: project.root })
    : null;
  const events = selectedId
    ? getTaskEvents(selectedId, { projectRoot: project.root })
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
