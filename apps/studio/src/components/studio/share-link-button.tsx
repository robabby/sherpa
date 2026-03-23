"use client"

import { useState } from "react"
import { Link, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareLinkButtonProps {
  shareUrl: string
}

export function ShareLinkButton({ shareUrl }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "h-7 gap-1.5 px-2 text-sm",
        copied
          ? "text-emerald-500 hover:text-emerald-500"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {copied ? (
        <Check data-icon="inline-start" />
      ) : (
        <Link data-icon="inline-start" />
      )}
      {copied ? "Copied!" : "Share"}
    </Button>
  )
}
