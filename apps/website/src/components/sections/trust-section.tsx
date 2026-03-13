import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function TrustSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal>
          <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
            We use what we ship
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              Every consulting engagement runs on the same framework we
              open-source. It&apos;s not a demo — it&apos;s how we work.
            </p>
            <p>
              The framework gets better because we use it daily. The consulting
              gets better because we keep improving the framework. That loop is
              the whole point.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
