import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function ProofSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal>
          <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
            Built for our own work. Shared because it should be.
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
            <p>
              Sherpa governs its own development. The conventions, skills, and
              initiative lifecycle aren&apos;t documentation — they&apos;re the
              production system. When something ships, it goes through the same
              governance pipeline we open-source.
            </p>
            <p>
              That&apos;s the proof. Not a deck. Not a demo. The system running
              on itself, in the open.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
