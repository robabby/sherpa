"use server";

import {
  getInitiatives,
  getTaskBoard,
  getSkills,
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

const STATIC_ROUTES: CommandPaletteItem[] = [
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
  const [initiatives, taskBoard, skills] = await Promise.all([
    Promise.resolve(getInitiatives()),
    Promise.resolve(getTaskBoard()),
    Promise.resolve(getSkills()),
  ]);

  return {
    routes: STATIC_ROUTES,

    initiatives: initiatives.map((i) => ({
      label: i.title,
      href: `/process/${i.slug}`,
      group: "Initiatives",
      status: i.status,
      keywords: [i.slug, i.type ?? "", i.status].filter(Boolean),
    })),

    tasks: taskBoard.slice(0, MAX_TASKS).map((t) => ({
      label: t.title,
      href: `/tasks/${t.id}`,
      group: "Tasks",
      status: t.status,
      keywords: [t.id, t.status, t.initiative ?? "", t.backend].filter(Boolean),
    })),

    skills: skills.map((s) => ({
      label: s.name,
      href: `/skills/${s.slug}`,
      group: "Skills",
      keywords: [s.slug, s.description].filter(Boolean),
    })),
  };
}
