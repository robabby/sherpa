import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { CalendlyWidget } from "@/components/calendly-widget"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Sherpa Consulting. Book a consultation or send us a message.",
}

export default function ContactPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Let&apos;s talk
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Whether you&apos;re exploring AI adoption or ready to implement
            governance, we&apos;re here to help. No pitch, just a conversation.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <ScrollReveal delay={0.1}>
            <div>
              <h2 className="text-lg font-semibold">Send a message</h2>
              <p className="mb-6 mt-2 text-sm text-muted-foreground">
                Tell us what you&apos;re working on. We&apos;ll respond within a
                business day.
              </p>
              <ContactForm />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div>
              <h2 className="text-lg font-semibold">Book a consultation</h2>
              <p className="mb-6 mt-2 text-sm text-muted-foreground">
                30 minutes. No commitment. Pick a time that works for you.
              </p>
              <CalendlyWidget />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
