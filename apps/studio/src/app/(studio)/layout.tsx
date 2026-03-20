import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { StudioSidebar } from "@/components/studio/studio-sidebar"
import { StudioShellHeader } from "@/components/studio/studio-shell-header"
import { CommandPalette } from "@/components/studio/command-palette"
import { auth } from "@/lib/auth"
import { UserMenu } from "@/components/auth/user-menu"
import { getAllProjects } from "@sherpa/studio-core"

export default async function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  const projects = getAllProjects().map((p) => ({ name: p.name, slug: p.slug }))

  return (
    <>
      <CommandPalette />
      <SidebarProvider>
        <StudioSidebar
          userMenu={<UserMenu user={session.user} />}
          projects={projects}
        />
        <SidebarInset>
          <StudioShellHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
