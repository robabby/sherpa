import { ScrollReveal } from "@/components/motion/scroll-reveal"

const steps = [
  {
    number: "01",
    title: "Understand where you are",
    description:
      "Honest assessment of your AI maturity, team readiness, and adoption gaps. No faking, no inflated benchmarks.",
  },
  {
    number: "02",
    title: "Get honest guidance",
    description:
      "A clear plan grounded in behavioral governance — not a pitch deck. We show you what works, what doesn't, and why.",
  },
  {
    number: "03",
    title: "Build capability with guardrails",
    description:
      "Ship AI workflows that are governed, auditable, and actually reliable. The framework ensures quality at every step.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <h2 className="text-center font-heading text-3xl tracking-tight md:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Whether you use the framework independently or work with our team,
            the path is the same.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.1}>
              <div className="text-center md:text-left">
                <span className="font-heading text-4xl text-primary/40">
                  {step.number}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
