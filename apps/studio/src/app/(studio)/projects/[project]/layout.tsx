import { notFound } from "next/navigation";

import { getProject } from "@/lib/studio";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ project: string }>;
}) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <>{children}</>;
}
