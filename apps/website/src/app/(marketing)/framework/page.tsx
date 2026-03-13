import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Framework",
  description:
    "An open-source behavioral governance framework for agentic workflows. Agent definitions, filesystem governance, AI-native conventions.",
}

export default function FrameworkPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
          The Framework
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Behavioral governance for agentic workflows — open source, built by
          practitioners. Full content coming in Session 2.
        </p>
      </div>
    </div>
  )
}
