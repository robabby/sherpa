import Link from "next/link"
import { Separator } from "@/components/ui/separator"

const footerLinks = [
  {
    title: "Documentation",
    links: [
      { title: "Getting Started", href: "/docs/getting-started" },
      { title: "Concepts", href: "/docs/concepts" },
      { title: "Reference", href: "/docs/reference" },
    ],
  },
  {
    title: "Framework",
    links: [
      { title: "Overview", href: "/framework" },
    ],
  },
  {
    title: "Connect",
    links: [
      { title: "Rob Abby", href: "https://robabby.com", external: true },
      { title: "GitHub", href: "https://github.com/robabby", external: true },
      // TODO(rob): confirm LinkedIn URL before enabling
      // { title: "LinkedIn", href: "https://www.linkedin.com/in/TODO", external: true },
      { title: "Contact", href: "/contact" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <Separator />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div>
            <Link href="/" className="font-heading text-lg tracking-tight">
              Sherpa
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              A collaboration framework for agentic workflows with a focus on governance, research, and execution.
            </p>
          </div>
          <div className="flex flex-col gap-8">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold">{group.title}</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        {...("external" in link && link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sherpa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
