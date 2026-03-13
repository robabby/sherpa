import { ScrollReveal } from "@/components/motion/scroll-reveal"

const stats = [
  { value: "91%", label: "of C-suite execs admit faking AI knowledge" },
  { value: "95%", label: "of AI pilots never reach production" },
  { value: "9%", label: "of organizations have fully deployed AI" },
]

export function RealitySection() {
  return (
    <section className="border-t border-border/40 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Here&apos;s what we&apos;re seeing
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.value} delay={i * 0.08}>
              <div className="text-center">
                <p className="font-heading text-4xl tracking-tight text-foreground md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <p className="mx-auto mt-12 max-w-xl text-center text-muted-foreground">
            The gap isn&apos;t talent or ambition. It&apos;s that most teams are
            shipping AI workflows without governance — and hoping for the best.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
