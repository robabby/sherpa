"use server";

import {
  getInitiatives,
  getSkills,
  getAllProjects,
  getPrimarySlug,
} from "@sherpa/studio-core";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface CommandPaletteItem {
  label: string;
  href: string;
  group: string;
  status?: string;
  keywords: string[];
  project?: string; // project name for badge display in multi-project mode
}

export interface CommandPaletteData {
  routes: CommandPaletteItem[];
  initiatives: CommandPaletteItem[];
  skills: CommandPaletteItem[];
}

/* -------------------------------------------------------------------------- */
/*  Static routes (mirrors sidebar NAV_GROUPS)                                 */
/* -------------------------------------------------------------------------- */

const STATIC_ROUTES: Omit<CommandPaletteItem, "project">[] = [
  { label: "Process", href: "/process", group: "Govern", keywords: ["initiatives", "proposals", "governance", "lifecycle"] },
  { label: "Conventions", href: "/conventions", group: "Author", keywords: ["rules", "standards", "patterns"] },
  { label: "Skills", href: "/skills", group: "Author", keywords: ["commands", "slash commands", "rr", "review"] },
  { label: "Playbooks", href: "/playbooks", group: "Author", keywords: ["recipes", "sequences", "plays"] },
  { label: "Roles", href: "/roles", group: "Author", keywords: ["agents", "behavioral", "roles", "conventions"] },
  { label: "Docs", href: "/docs", group: "Author", keywords: ["documentation", "architecture", "guides"] },
  { label: "Research", href: "/research", group: "Author", keywords: ["research", "iterations", "findings"] },
  { label: "Sessions", href: "/sessions", group: "Observe", keywords: ["context", "history", "logs", "claude code"] },
  { label: "Activity", href: "/activity", group: "Observe", keywords: ["log", "timeline", "events"] },
  { label: "MCP", href: "/mcp", group: "Observe", keywords: ["model context protocol", "server", "tools"] },
];

/* -------------------------------------------------------------------------- */
/*  Server action                                                              */
/* -------------------------------------------------------------------------- */

export async function getCommandPaletteItems(): Promise<CommandPaletteData> {
  const projects = getAllProjects();
  const primarySlug = getPrimarySlug();
  const isMultiProject = projects.length > 1;

  // Static routes prefixed with primary project
  const routes: CommandPaletteItem[] = STATIC_ROUTES.map((r) => ({
    ...r,
    href: `/projects/${primarySlug}${r.href}`,
  }));

  // Add "All Projects" route when multiple projects exist
  if (isMultiProject) {
    routes.unshift({
      label: "All Projects",
      href: "/projects",
      group: "Navigation",
      keywords: ["projects", "switch", "select"],
    });
  }

  // Initiatives from all projects
  const initiatives: CommandPaletteItem[] = [];
  for (const project of projects) {
    const projectInitiatives = getInitiatives(project.context);
    for (const i of projectInitiatives) {
      initiatives.push({
        label: i.title,
        href: `/projects/${project.slug}/process/${i.slug}`,
        group: "Initiatives",
        status: i.status,
        keywords: [i.slug, i.type ?? "", i.status, project.name].filter(Boolean),
        project: isMultiProject ? project.name : undefined,
      });
    }
  }

  // Skills from all projects
  const skills: CommandPaletteItem[] = [];
  for (const project of projects) {
    const projectSkills = getSkills(undefined, project.context);
    for (const s of projectSkills) {
      skills.push({
        label: s.name,
        href: `/projects/${project.slug}/skills/${s.slug}`,
        group: "Skills",
        keywords: [s.slug, s.description, project.name].filter(Boolean),
        project: isMultiProject ? project.name : undefined,
      });
    }
  }

  return { routes, initiatives, skills };
}
