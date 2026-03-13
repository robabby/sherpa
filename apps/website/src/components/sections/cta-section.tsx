import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function CtaSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <ScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl tracking-tight md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Use the framework on your own, or bring us in as your guides. Either
            way, you ship with confidence instead of chaos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/framework">
              <Button variant="outline" size="lg">
                Get Started
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg">
                Talk to a Guide
                <MessageCircle data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
