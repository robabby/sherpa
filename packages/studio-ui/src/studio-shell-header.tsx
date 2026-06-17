"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { StudioBreadcrumb } from "./studio-breadcrumb";

const sectionLabels: Record<string, string> = {
  process: "Process",
  conventions: "Conventions",
  skills: "Skills",
  playbooks: "Playbooks",
  roles: "Roles",
  docs: "Docs",
  research: "Research",
  sessions: "Sessions",
  activity: "Activity",
  mcp: "MCP",
};

function buildSegments(pathname: string): { label: string; href?: string }[] {
  if (pathname === "/") {
    return [{ label: "Dashboard" }];
  }

  const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Dashboard" }];

  // Project-scoped routes: /projects/{slug}/section/...
  if (parts[0] === "projects" && parts.length >= 2) {
    const projectSlug = parts[1]!;
    const projectLabel = projectSlug.charAt(0).toUpperCase() + projectSlug.slice(1);

    if (parts.length === 2) {
      return [
        { label: "Projects", href: "/projects" },
        { label: projectLabel },
      ];
    }

    const sectionKey = parts[2]!;
    const sectionLabel = sectionLabels[sectionKey] ?? sectionKey;
    const projectBase = `/projects/${projectSlug}`;

    if (parts.length === 3) {
      return [
        { label: projectLabel, href: `${projectBase}/process` },
        { label: sectionLabel },
      ];
    }

    const subLabel = parts.slice(3).join("/");
    return [
      { label: projectLabel, href: `${projectBase}/process` },
      { label: sectionLabel, href: `${projectBase}/${sectionKey}` },
      { label: subLabel },
    ];
  }

  // Projects listing
  if (parts[0] === "projects" && parts.length === 1) {
    return [{ label: "Projects" }];
  }

  // Legacy unscoped routes
  const sectionKey = parts[0]!;
  const label = sectionLabels[sectionKey] ?? sectionKey;

  if (parts.length === 1) {
    return [{ label, href: `/${sectionKey}` }];
  }

  const subLabel = parts.slice(1).join("/");
  return [
    { label, href: `/${sectionKey}` },
    { label: subLabel },
  ];
}

export function StudioShellHeader() {
  const pathname = usePathname();
  const segments = buildSegments(pathname);

  return (
    <header className="flex items-center gap-2 border-b border-sidebar-border px-4 py-3">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <StudioBreadcrumb segments={segments} />
    </header>
  );
}
