import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Sherpa. Send us a message and we'll respond within a business day.",
}

export default function ContactPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tell us what you&apos;re working on. We&apos;ll respond within a
            business day.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-10">
            <ContactForm />
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
