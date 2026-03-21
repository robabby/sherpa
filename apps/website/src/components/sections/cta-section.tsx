import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function CtaSection() {
  return (
    <section className="border-t border-border/40 px-6 py-20 md:py-28">
      <ScrollReveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="sr-only">Our commitment</h2>
          <blockquote className="mx-auto max-w-lg border-l-2 border-primary pl-6 text-left">
            <p className="font-heading text-xl leading-snug tracking-tight md:text-2xl">
              &ldquo;Create opportunity just as much as we automate it.&rdquo;
            </p>
          </blockquote>
          <div className="mt-8 flex flex-col gap-4 text-muted-foreground">
            <p>
              Almost every agentic system will change how many people a team
              needs. We know that. We build governance that accounts for
              people — not just efficiency.
            </p>
            <p>
              The framework is open source. If you&apos;d like a guide, we
              consult too.
            </p>
          </div>
          <div className="mt-8">
            <Link href="/framework">
              <Button size="lg">
                See the framework
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
