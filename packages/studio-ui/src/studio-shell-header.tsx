"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { StudioBreadcrumb } from "./studio-breadcrumb";

const sectionLabels: Record<string, string> = {
  process: "Process",
  tasks: "Tasks",
  dispatch: "Dispatch",
  workflow: "Workflow",
  docs: "Docs",
  conventions: "Conventions",
  skills: "Skills",
  playbooks: "Playbooks",
  workforce: "Workforce",
  sessions: "Sessions",
  mcp: "MCP",
  activity: "Activity",
};

function buildSegments(pathname: string): { label: string; href?: string }[] {
  if (pathname === "/") {
    return [{ label: "Dashboard" }];
  }

  const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Dashboard" }];
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
