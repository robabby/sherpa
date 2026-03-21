"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Re-runs server components when the browser tab regains focus. */
export function RefreshOnFocus() {
  const router = useRouter()

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [router])

  return null
}
