import "@radix-ui/themes/styles.css"
import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google"

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
})

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
      <body className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>{children}</body>
    </html>
  )
}
