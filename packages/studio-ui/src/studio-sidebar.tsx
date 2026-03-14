"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  CheckSquare,
  Clock,
  FileText,
  GitBranch,
  Play,
  Plug,
  Send,
  Users,
  Workflow,
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
    title: "Operations",
    items: [
      { label: "Process", href: "/process", icon: GitBranch },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Dispatch", href: "/dispatch", icon: Send },
      { label: "Workflow", href: "/workflow", icon: Workflow },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { label: "Docs", href: "/docs", icon: FileText },
      { label: "Conventions", href: "/conventions", icon: BookOpen },
      { label: "Skills", href: "/skills", icon: Zap },
      { label: "Playbooks", href: "/playbooks", icon: Play },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Workforce", href: "/workforce", icon: Users },
      { label: "Sessions", href: "/sessions", icon: Clock },
      { label: "MCP", href: "/mcp", icon: Plug },
    ],
  },
  {
    title: "Activity",
    items: [{ label: "Activity", href: "/activity", icon: Activity }],
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

export function StudioSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ---- Header: wordmark ---- */}
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
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
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

      {/* ---- Footer: collapse toggle ---- */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
