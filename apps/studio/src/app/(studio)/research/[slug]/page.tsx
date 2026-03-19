import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Research Report | Studio",
  description: "Research backtesting report",
}

/**
 * Research report viewer.
 * This route requires research report data registered via the config.
 * Currently returns 404 — no research reports are registered in Sherpa.
 */
export default async function ResearchReportPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: _slug } = await params
  // No research reports registered in Sherpa yet
  notFound()
}
