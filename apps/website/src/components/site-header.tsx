import Link from "next/link"
import { NavDesktop } from "@/components/nav-desktop"
import { NavMobile } from "@/components/nav-mobile"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-heading text-xl tracking-tight">
          Sherpa
        </Link>
        <NavDesktop />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavMobile />
        </div>
      </div>
    </header>
  )
}
