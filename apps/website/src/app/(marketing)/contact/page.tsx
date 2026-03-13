import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Sherpa Consulting. Book a consultation or send us a message.",
}

export default function ContactPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
          Let&apos;s talk
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Whether you&apos;re exploring AI adoption or ready to implement
          governance, we&apos;re here to help.
        </p>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card p-8">
            <h2 className="text-lg font-semibold">Send a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Contact form coming soon. In the meantime, reach out directly.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-8">
            <h2 className="text-lg font-semibold">Book a consultation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Calendly booking widget will be added in Session 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
