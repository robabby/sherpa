import Link from "next/link"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function WhatWeDoSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal>
          <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
            Sherpa is a governance framework for agentic workflows — behavioral
            agent definitions, filesystem-based process conventions, and quality
            guardrails that travel with your code. We built it for our own
            consulting work, open-sourced it, and now help teams adopt it.{" "}
            <Link
              href="/framework"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              Explore the framework
            </Link>{" "}
            or{" "}
            <Link
              href="/contact"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              talk to us
            </Link>
            .
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
