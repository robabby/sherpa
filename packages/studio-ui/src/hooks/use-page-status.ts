"use client"

import { useEffect, useRef } from "react"

export type PageStatus = "idle" | "building" | "success" | "error"

// Simple SVG data URI favicons — colored circles for each state
const FAVICON_SVGS: Record<PageStatus, string> = {
  idle: "", // empty = don't change favicon
  building: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23d4a574'/></svg>`,
  success: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2334d399'/></svg>`,
  error: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23ef4444'/></svg>`,
}

const STATUS_PREFIX: Record<PageStatus, string> = {
  idle: "",
  building: "\u25CF ", // filled circle ●
  success: "\u2713 ", // checkmark ✓
  error: "\u2717 ", // cross mark ✗
}

export function usePageStatus(title: string, status: PageStatus = "idle") {
  const originalFavicon = useRef<string | null>(null)

  useEffect(() => {
    // Update document.title
    const prefix = STATUS_PREFIX[status]
    document.title = prefix
      ? `${prefix}${title} — Sherpa Studio`
      : `${title} | Sherpa Studio`

    // Update favicon if status is not idle
    const svgUri = FAVICON_SVGS[status]
    if (svgUri) {
      const existingLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']")
      if (existingLink && !originalFavicon.current) {
        originalFavicon.current = existingLink.href
      }

      // replaceChild pattern for Safari compatibility
      const link = document.createElement("link")
      link.rel = "icon"
      link.href = svgUri
      const existing = document.querySelector("link[rel*='icon']")
      if (existing?.parentNode) {
        existing.parentNode.replaceChild(link, existing)
      } else {
        document.head.appendChild(link)
      }
    }

    // Cleanup: restore original favicon and title
    return () => {
      if (originalFavicon.current) {
        const link = document.createElement("link")
        link.rel = "icon"
        link.href = originalFavicon.current
        const existing = document.querySelector("link[rel*='icon']")
        if (existing?.parentNode) {
          existing.parentNode.replaceChild(link, existing)
        }
        originalFavicon.current = null
      }
    }
  }, [title, status])
}

/** Map a task status string to a PageStatus value. */
export function taskStatusToPageStatus(taskStatus: string | null | undefined): PageStatus {
  switch (taskStatus) {
    case "dispatched":
      return "building"
    case "completed":
    case "reviewed":
      return "success"
    case "failed":
      return "error"
    default:
      return "idle"
  }
}
