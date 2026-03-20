"use server";

import {
  getInitiatives,
  getTaskBoard,
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
  tasks: CommandPaletteItem[];
  skills: CommandPaletteItem[];
}

/* -------------------------------------------------------------------------- */
/*  Static routes (mirrors sidebar NAV_GROUPS)                                 */
/* -------------------------------------------------------------------------- */

const STATIC_ROUTES: Omit<CommandPaletteItem, "project">[] = [
  { label: "Process", href: "/process", group: "Operations", keywords: ["initiatives", "proposals", "governance"] },
  { label: "Tasks", href: "/tasks", group: "Operations", keywords: ["task board", "dispatch", "workers"] },
  { label: "Dispatch", href: "/dispatch", group: "Operations", keywords: ["queue", "agents", "backends"] },
  { label: "Workflow", href: "/workflow", group: "Operations", keywords: ["pipeline", "planner", "worker", "judge"] },
  { label: "Docs", href: "/docs", group: "Knowledge", keywords: ["documentation", "architecture", "guides"] },
  { label: "Conventions", href: "/conventions", group: "Knowledge", keywords: ["rules", "standards", "patterns"] },
  { label: "Skills", href: "/skills", group: "Knowledge", keywords: ["commands", "slash commands", "rr", "review"] },
  { label: "Playbooks", href: "/playbooks", group: "Knowledge", keywords: ["recipes", "workflows", "automation"] },
  { label: "Workforce", href: "/workforce", group: "System", keywords: ["agents", "roles", "behavioral"] },
  { label: "Sessions", href: "/sessions", group: "System", keywords: ["context", "history", "logs"] },
  { label: "MCP", href: "/mcp", group: "System", keywords: ["model context protocol", "server", "tools"] },
  { label: "Activity", href: "/activity", group: "Activity", keywords: ["log", "timeline", "events"] },
];

/* -------------------------------------------------------------------------- */
/*  Server action                                                              */
/* -------------------------------------------------------------------------- */

const MAX_TASKS = 50;

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

  // Tasks from primary project only (tasks are project-root specific)
  const taskBoard = getTaskBoard({ projectRoot: projects[0]?.root });
  const tasks: CommandPaletteItem[] = taskBoard.slice(0, MAX_TASKS).map((t) => ({
    label: t.title,
    href: `/projects/${primarySlug}/tasks/${t.id}`,
    group: "Tasks",
    status: t.status,
    keywords: [t.id, t.status, t.initiative ?? "", t.backend].filter(Boolean),
  }));

  return { routes, initiatives, tasks, skills };
}
