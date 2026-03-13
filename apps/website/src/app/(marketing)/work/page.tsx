import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies and results from Sherpa Consulting engagements.",
}

export default function WorkPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
          Our Work
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Case studies and engagement results. Full content coming in Session 2.
        </p>
      </div>
    </div>
  )
}
