"use client"

import { useRouter, usePathname } from "next/navigation"
import { FolderOpen } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProjectSwitcherProps {
  projects: { name: string; slug: string }[]
  activeProject: string | null
}

export function ProjectSwitcher({ projects, activeProject }: ProjectSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  if (projects.length <= 1) return null

  function handleChange(slug: string) {
    // Determine the current top-level section from the URL.
    // Project-scoped: /projects/{slug}/{section}[/...]  → section from 3rd segment
    // Aggregate:      /projects/{section}[/...]         → section from 2nd segment
    let section = "process"

    if (activeProject) {
      // On a project-scoped route
      const match = pathname.match(/^\/projects\/[^/]+\/([^/]+)/)
      if (match?.[1]) section = match[1]
    } else {
      // On an aggregate route or the projects landing
      const match = pathname.match(/^\/projects\/([^/]+)/)
      if (match?.[1]) section = match[1]
    }

    if (slug === "__all__") {
      router.push(`/projects/${section}`)
      return
    }

    router.push(`/projects/${slug}/${section}`)
  }

  return (
    <Select value={activeProject ?? "__all__"} onValueChange={handleChange}>
      <SelectTrigger className="w-full border-border/50 bg-sidebar-accent/30 text-sm">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-muted-foreground" />
          <SelectValue placeholder="All Projects" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All Projects</SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.slug} value={p.slug}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
