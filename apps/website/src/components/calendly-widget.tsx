"use client"

import dynamic from "next/dynamic"

const InlineWidget = dynamic(
  () => import("react-calendly").then((mod) => mod.InlineWidget),
  { ssr: false }
)

export function CalendlyWidget() {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL

  if (!url) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/60 bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Booking calendar will be available soon.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <InlineWidget url={url} styles={{ height: "630px" }} />
    </div>
  )
}
