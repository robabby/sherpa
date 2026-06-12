import type { Metadata } from "next"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Rob Abby about the Sherpa framework, Studio, or anything you'd like to discuss.",
}

const channels = [
  {
    title: "LinkedIn",
    href: "https://linkedin.com/in/robabby",
    description: "The fastest way to reach me — messages are open.",
  },
  {
    title: "GitHub",
    href: "https://github.com/robabby",
    description: "Profile and public work.",
  },
  {
    title: "robabby.com",
    href: "https://robabby.com",
    description: "Personal site, background, and writing.",
  },
]

export default function ContactPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Contact
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Questions about the framework, Studio, or anything else — messages
            go straight to Rob Abby, and replies come from a person, not a
            funnel.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="mt-12 flex flex-col gap-4">
            {channels.map((channel) => (
              <a
                key={channel.href}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border/60 bg-card p-5 transition-colors hover:border-border"
              >
                <span className="text-sm font-semibold text-primary">
                  {channel.title} →
                </span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {channel.description}
                </p>
              </a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
