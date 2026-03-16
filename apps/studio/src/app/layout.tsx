import "@radix-ui/themes/styles.css"
import "@/styles/globals.css"

import dynamic from "next/dynamic"
import type { Metadata, Viewport } from "next"
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { StudioSidebar } from "@/components/studio/studio-sidebar"
import { StudioShellHeader } from "@/components/studio/studio-shell-header"

const CommandPalette = dynamic(
  () => import("@/components/studio/command-palette").then((m) => ({ default: m.CommandPalette })),
  { ssr: false }
)

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
})

export const viewport: Viewport = {
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: {
    default: "Sherpa Studio",
    template: "%s | Sherpa Studio",
  },
  description: "Behavioral agentic collaboration framework",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
        <TooltipProvider>
          <CommandPalette />
          <SidebarProvider>
            <StudioSidebar />
            <SidebarInset>
              <StudioShellHeader />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
