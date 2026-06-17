"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Clock,
  FileText,
  FlaskConical,
  GitBranch,
  Play,
  Plug,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { ProjectSwitcher } from "./project-switcher";

/* -------------------------------------------------------------------------- */
/*  Navigation configuration                                                  */
/* -------------------------------------------------------------------------- */

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Govern",
    items: [{ label: "Process", href: "/process", icon: GitBranch }],
  },
  {
    title: "Author",
    items: [
      { label: "Conventions", href: "/conventions", icon: BookOpen },
      { label: "Skills", href: "/skills", icon: Zap },
      { label: "Playbooks", href: "/playbooks", icon: Play },
      { label: "Roles", href: "/roles", icon: Users },
      { label: "Docs", href: "/docs", icon: FileText },
      { label: "Research", href: "/research", icon: FlaskConical },
    ],
  },
  {
    title: "Observe",
    items: [
      { label: "Sessions", href: "/sessions", icon: Clock },
      { label: "Activity", href: "/activity", icon: Activity },
      { label: "MCP", href: "/mcp", icon: Plug },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Active-route matching                                                     */
/* -------------------------------------------------------------------------- */

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/* -------------------------------------------------------------------------- */
/*  StudioSidebar                                                             */
/* -------------------------------------------------------------------------- */

interface StudioSidebarProps {
  userMenu?: React.ReactNode;
  projects?: { name: string; slug: string }[];
}

export function StudioSidebar({ userMenu, projects }: StudioSidebarProps) {
  const pathname = usePathname();

  // Derive active project from the URL: /projects/[slug]/...
  // Validate against the projects list to avoid misidentifying aggregate
  // routes (e.g. /projects/research) as project slugs.
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/)
  const matchedSlug = projectMatch?.[1] ?? null
  const activeProject =
    matchedSlug && projects?.some((p) => p.slug === matchedSlug)
      ? matchedSlug
      : null

  // Only these sections have pages under /projects/{slug}/ (project mode)
  // and /projects/ (aggregate mode). All other sections link to their
  // top-level pages — prefixing them produces 404s.
  const projectScopedRoutes = ["/process", "/research"]

  // In aggregate mode, scoped nav links point to /projects/{section}.
  // In project mode, scoped nav links point to /projects/{slug}/{section}.
  const hrefPrefix = activeProject
    ? `/projects/${activeProject}`
    : "/projects"

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ---- Header: wordmark + project switcher ---- */}
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 px-1 py-1.5 transition-opacity hover:opacity-80">
          {/* Gradient icon */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)]">
            <Zap className="size-4 text-white" />
          </div>

          {/* Text — hidden when collapsed to icon-only */}
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm leading-tight tracking-[-0.01em] text-foreground">
              Sherpa
            </span>
            <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.25em] text-muted-foreground/60">
              Studio
            </span>
          </div>
        </Link>

        {projects && projects.length > 1 && (
          <div className="group-data-[collapsible=icon]:hidden">
            <ProjectSwitcher projects={projects} activeProject={activeProject} />
          </div>
        )}
      </SidebarHeader>

      {/* ---- Content: navigation groups ---- */}
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.25em]">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const fullHref = projectScopedRoutes.includes(item.href)
                    ? `${hrefPrefix}${item.href}`
                    : item.href;
                  const active = isActive(pathname, fullHref);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
                        <Link href={fullHref}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ---- Footer: user menu + collapse toggle ---- */}
      <SidebarFooter className="border-t border-sidebar-border">
        {userMenu}
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
