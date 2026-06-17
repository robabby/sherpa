import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  getAllProjects,
  getInitiatives,
  getProjectContext,
  scanResearchFiles,
} from "@/lib/studio";

export const metadata: Metadata = {
  title: "All Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function ProjectsPage() {
  const projects = getAllProjects();

  const projectStats = projects.map((project) => {
    const ctx = getProjectContext(project.slug);
    const initiativeCount = ctx ? getInitiatives(ctx).length : 0;
    const researchCount = scanResearchFiles(project.root).length;

    return { ...project, initiativeCount, researchCount };
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-2xl text-foreground mb-6">Projects</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projectStats.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}/process`}
            className="group rounded-xl border border-border/50 bg-card/30 p-5 transition-colors hover:border-[var(--color-gold)]/20 hover:bg-card/50"
          >
            <h2 className="font-display text-lg text-foreground group-hover:text-[var(--color-gold)] transition-colors">
              {project.name}
            </h2>
            {project.remote && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground/60 truncate">
                {project.remote}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {project.initiativeCount > 0 && (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {project.initiativeCount} initiatives
                </Badge>
              )}
              {project.researchCount > 0 && (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {project.researchCount} research
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
