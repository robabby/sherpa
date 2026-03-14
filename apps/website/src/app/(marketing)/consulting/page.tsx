import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Consulting",
  description:
    "AI literacy workshops, agentic workforce consulting, and governance implementation. Honest guidance from the team that built the framework.",
}

const services = [
  {
    title: "AI Literacy Workshops",
    description:
      "Two-day workshops where your team maps current AI workflows, identifies governance gaps, and builds a behavioral constraint system they can maintain. No slides about \"the future of AI\" — just practical work with your actual codebase.",
    deliverables: [
      "Current-state AI workflow audit",
      "Governance gap analysis",
      "Behavioral constraint templates for your agent roles",
      "Runbook your team owns after we leave",
    ],
  },
  {
    title: "Agentic Workforce Consulting",
    description:
      "For teams building agent-based systems and struggling with reliability, quality, or governance. We embed alongside your engineers, set up the framework, and transfer the knowledge until you don't need us anymore.",
    deliverables: [
      "Framework installation and configuration",
      "Agent role definitions with behavioral constraints",
      "Initiative lifecycle and review process",
      "Team training and knowledge transfer",
    ],
  },
  {
    title: "Governance Implementation",
    description:
      "You already have AI workflows running. They need governance before something goes wrong. We assess what you have, design the constraint system, and implement it — with your team, not for them.",
    deliverables: [
      "Workflow risk assessment",
      "Behavioral governance architecture",
      "Quality gate implementation",
      "Monitoring and review cadence",
    ],
  },
]

export default function ConsultingPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Honest guidance for teams shipping AI
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            We help teams adopt AI workflows with governance built in. Every
            engagement runs on the same open-source framework we use ourselves —
            so what we build with you is yours to keep.
          </p>
        </ScrollReveal>

        <div className="mt-16 space-y-12">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 0.08}>
              <div className="rounded-xl border border-border/60 bg-card p-8">
                <h2 className="font-heading text-2xl tracking-tight">
                  {service.title}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {service.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {service.deliverables.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-16 rounded-xl border border-border/60 bg-card p-8">
            <h2 className="font-heading text-xl tracking-tight">
              How we work
            </h2>
            <p className="mt-3 text-muted-foreground">
              We don&apos;t hand you a slide deck and leave. We work alongside
              your team with the same tools and the same framework. The goal of
              every engagement is to make ourselves unnecessary — you keep the
              framework, the knowledge, and the capability.
            </p>
            <Link
              href="/consulting/approach"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              Read about our approach
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row">
            <Link href="/contact">
              <Button size="lg">
                Talk to a Guide
                <MessageCircle data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/framework">
              <Button variant="outline" size="lg">
                Explore the framework first
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
