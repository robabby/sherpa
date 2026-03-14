import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Our Approach",
  description:
    "Behavioral governance methodology — how Sherpa Consulting works with teams to ship governed AI workflows.",
}

const steps = [
  {
    number: "01",
    title: "Understand where you are",
    description:
      "We start by listening. What are you building? What's working? Where does it break? We map your current AI workflows, identify governance gaps, and give you an honest assessment — not a pitch for more work.",
  },
  {
    number: "02",
    title: "Get honest guidance",
    description:
      "Based on what we find, we design a governance approach that fits your team and your constraints. Behavioral agent definitions, quality gates, review processes — specific to your situation, not a template.",
  },
  {
    number: "03",
    title: "Build capability with guardrails",
    description:
      "We implement alongside your team. The framework goes into your codebase. The knowledge transfers to your people. When we leave, you have governed workflows and the ability to maintain them.",
  },
]

export default function ApproachPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Our approach
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We use the same framework with you that we built for ourselves.
            That&apos;s not a tagline — it&apos;s the methodology.
          </p>
        </ScrollReveal>

        <div className="mt-16 space-y-12">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.08}>
              <div className="flex gap-6">
                <span className="font-heading text-4xl text-primary/30">
                  {step.number}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{step.title}</h2>
                  <p className="mt-2 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-16">
            <h2 className="font-heading text-2xl tracking-tight">
              What makes this different
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Most AI consultancies deliver a report and leave. We deliver a
                working governance system in your codebase — built on the same
                open-source framework we use on every engagement.
              </p>
              <p>
                The framework is yours. The knowledge transfers to your team.
                Our goal is to make ourselves unnecessary, not to create a
                retainer.
              </p>
              <p>
                That&apos;s what we mean by &quot;guide, not guru.&quot; We know
                the path because we walk it every day. We carry the load so you
                can focus on the work that matters.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12">
            <Link href="/contact">
              <Button size="lg">
                Talk to a Guide
                <MessageCircle data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
