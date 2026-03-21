import Link from "next/link"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function WhatWeBuiltSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal>
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            The framework
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Sherpa Studio is a governance framework for agentic workflows.
            Behavioral agent definitions. A skills engine. A dispatch pipeline
            with nine backends. An initiative lifecycle that takes ideas from
            proposal to integration with review at every step.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            It lives in your codebase, versions with git, and works with any AI
            development environment. The kind of infrastructure that doesn&apos;t
            exist until someone builds it.{" "}
            <Link
              href="/framework"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              See the framework
            </Link>
            .
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
