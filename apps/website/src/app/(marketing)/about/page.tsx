import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "About",
  description:
    "We built the tool we needed, then realized others needed it too. The story behind Sherpa Consulting.",
}

export default function AboutPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            We built the tool we use
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Sherpa started as a question: what would it look like if AI agents
            had governance — not as an afterthought, but as the foundation?
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 space-y-6 text-muted-foreground">
            <p>
              The framework emerged from real consulting work — building agentic
              workflows for clients and discovering that the tooling didn&apos;t
              exist. Every engagement surfaced the same problem: teams shipping
              AI workflows without behavioral constraints, without quality
              guarantees, without governance.
            </p>
            <p>
              So we built it. Behavioral agent definitions that use constraints
              instead of identity claims. Filesystem-based governance that tracks
              initiatives from research through implementation. Executable
              conventions that encode best practices as skills, not
              documentation.
            </p>
            <p>
              Then we realized the framework itself is the consulting
              differentiator. We don&apos;t just advise — we use our own tools on
              every engagement. The framework improves because we use it. The
              consulting improves because we improve the framework.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-16 rounded-xl border border-border/60 bg-card p-8">
            <h2 className="font-heading text-2xl tracking-tight">
              Guide, not guru
            </h2>
            <p className="mt-4 text-muted-foreground">
              91% of C-suite executives admit to faking AI knowledge. We
              don&apos;t think the answer is more hype. We think it&apos;s
              honesty, governance, and tools that actually work. That&apos;s what
              a guide does — meets you where you are and helps you get where
              you&apos;re going.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-12">
            <Link href="/framework">
              <Button variant="outline">
                Explore the framework
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
