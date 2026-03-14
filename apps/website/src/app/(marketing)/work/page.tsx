import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies and results from Sherpa Consulting engagements. Real outcomes from governed AI workflows.",
}

const caseStudies = [
  {
    client: "Consumer Technology Platform",
    context:
      "A consumer-facing web and mobile platform with 350+ content pages, multiple data pipelines, and a growing reliance on AI agent workflows for content generation, deployment automation, and feature development.",
    challenge:
      "AI agents were shipping code and generating content without governance. No behavioral constraints, no quality gates, no review process. Pilot workflows produced inconsistent results and the team couldn't tell which outputs to trust.",
    approach: [
      "Installed the Sherpa framework across the monorepo",
      "Defined behavioral constraints for 6 agent roles",
      "Implemented initiative lifecycle with proposal-before-edit governance",
      "Built executable conventions as skills and rules, not documentation",
      "Set up Studio for initiative tracking and velocity monitoring",
    ],
    results: [
      "Governed 40+ initiatives through the full lifecycle",
      "91 reusable UI components extracted and cataloged",
      "Agent workflows shifted from ad-hoc to reviewable and auditable",
      "Team maintained governance independently after knowledge transfer",
    ],
  },
]

export default function WorkPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Our work
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            We show what we&apos;ve done, not what we promise. Here&apos;s what
            governed AI workflows look like in practice.
          </p>
        </ScrollReveal>

        {caseStudies.map((study, i) => (
          <ScrollReveal key={study.client} delay={i * 0.1}>
            <div className="mt-12 rounded-xl border border-border/60 bg-card p-8">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Case Study
              </p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight">
                {study.client}
              </h2>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Context
                  </h3>
                  <p className="mt-2 text-muted-foreground">{study.context}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Challenge
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {study.challenge}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    What we did
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {study.approach.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Results
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {study.results.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}

        <ScrollReveal delay={0.2}>
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
