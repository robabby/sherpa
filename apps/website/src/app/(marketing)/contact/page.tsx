import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Rob Abby about the Sherpa framework, Studio, or anything you'd like to discuss.",
}

export default function ContactPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Contact
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Questions about the framework, Studio, or anything else — messages
            go straight to Rob Abby, and replies come from a person, not a
            funnel.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="mt-12">
            <ContactForm />
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
