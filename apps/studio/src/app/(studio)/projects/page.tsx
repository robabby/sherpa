import type { Metadata } from "next";
import Link from "next/link";

import { getAllProjects } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-2xl text-foreground mb-6">Projects</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}/process`}
            className="group rounded-xl border border-border/50 bg-card/30 p-5 transition-colors hover:border-[var(--color-gold)]/20 hover:bg-card/50"
          >
            <h2 className="font-display text-lg text-foreground group-hover:text-[var(--color-gold)] transition-colors">
              {project.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {project.root}
            </p>
            {project.remote && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground/60 truncate">
                {project.remote}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
