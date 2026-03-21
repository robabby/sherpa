"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Periodically re-runs server components on a fixed interval. */
export function AutoRefreshInterval({ intervalMs = 300_000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
