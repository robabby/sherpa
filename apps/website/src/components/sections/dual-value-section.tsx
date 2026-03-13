import Link from "next/link"
import { ArrowRight, Code, Compass } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

const cards = [
  {
    icon: Code,
    title: "The Framework",
    description:
      "An open-source toolkit for running Human+AI collaborative workflows. Behavioral agent definitions, filesystem-based governance, and AI-native process conventions.",
    href: "/framework",
    cta: "Explore the framework",
  },
  {
    icon: Compass,
    title: "The Guides",
    description:
      "AI literacy workshops, agentic workforce consulting, and governance implementation. We use the same framework with you that we built for ourselves.",
    href: "/consulting",
    cta: "See our services",
  },
]

export function DualValueSection() {
  return (
    <section className="border-t border-border/40 px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {cards.map((card, i) => (
          <ScrollReveal key={card.title} delay={i * 0.1}>
            <Link
              href={card.href}
              className="group flex h-full flex-col rounded-xl border border-border/60 bg-card p-8 transition-colors hover:border-primary/30 hover:bg-accent/50"
            >
              <card.icon className="size-8 text-primary" />
              <h2 className="mt-4 font-heading text-2xl tracking-tight">
                {card.title}
              </h2>
              <p className="mt-3 flex-1 text-muted-foreground">
                {card.description}
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                {card.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
