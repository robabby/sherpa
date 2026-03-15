import type { Metadata } from "next";
import { notFound } from "next/navigation";
import path from "path";

import { getTaskDetail } from "@/lib/studio/tasks";
import { getTaskEvents } from "@/lib/studio/task-events";

import { MissionDetailStandalone } from "./mission-detail-standalone";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const task = getTaskDetail(slug, { projectRoot: PROJECT_ROOT });
  return {
    title: task ? `${task.title} | Tasks` : "Task Not Found",
    robots: "noindex, nofollow",
  };
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const task = getTaskDetail(slug, { projectRoot: PROJECT_ROOT });
  if (!task) notFound();

  const events = getTaskEvents(slug, { projectRoot: PROJECT_ROOT });
  const defaultTab = task.hasReport ? "report" : "overview";

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <MissionDetailStandalone
        task={task}
        events={events}
        defaultTab={defaultTab}
      />
    </div>
  );
}
