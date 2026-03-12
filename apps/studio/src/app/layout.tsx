import "@radix-ui/themes/styles.css"
import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: {
    default: "Sherpa Studio",
    template: "%s | Sherpa Studio",
  },
  description: "Behavioral agentic collaboration framework",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
