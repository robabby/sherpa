import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Learn",
  description:
    "AI literacy, agentic workflows, and governance patterns — research and thought leadership from Sherpa.",
}

export default function LearnPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
          Learn
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Content hub with AI literacy, agentic workflows, and governance
          patterns. Full content coming in Session 3.
        </p>
      </div>
    </div>
  )
}
