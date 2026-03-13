import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Consulting",
  description:
    "AI literacy workshops, agentic workforce consulting, and governance implementation from Sherpa Consulting.",
}

export default function ConsultingPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
          Consulting
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AI literacy workshops, agentic workforce consulting, and governance
          implementation. Full content coming in Session 2.
        </p>
      </div>
    </div>
  )
}
