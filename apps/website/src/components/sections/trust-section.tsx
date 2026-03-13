import { ScrollReveal } from "@/components/motion/scroll-reveal"

const signals = [
  { metric: "7", label: "Framework pillars" },
  { metric: "91+", label: "UI components" },
  { metric: "Open", label: "Source" },
]

export function TrustSection() {
  return (
    <section className="border-t border-border/40 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="rounded-xl border border-border/60 bg-card p-8 md:p-12">
            <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
              Built by practitioners, not theorists
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Every consulting engagement runs on the same framework we ship as
              open source. The framework improves because we use it. The
              consulting improves because we improve the framework.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-8">
              {signals.map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-2xl text-primary md:text-3xl">
                    {s.metric}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
