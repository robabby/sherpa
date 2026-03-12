import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaskDetailContent } from "@/components/studio/task-detail-content";
import { getTaskDetail } from "@/lib/studio/tasks";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const task = getTaskDetail(slug);
  return {
    title: task ? `${task.title} | Tasks` : "Task Not Found",
    robots: "noindex, nofollow",
  };
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const task = getTaskDetail(slug);
  if (!task) notFound();

  return <TaskDetailContent task={task} />;
}
