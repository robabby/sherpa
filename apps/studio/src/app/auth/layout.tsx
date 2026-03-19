import { Zap } from "lucide-react"

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)]">
          <Zap className="size-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg leading-tight tracking-[-0.01em] text-foreground">
            Sherpa
          </span>
          <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.25em] text-muted-foreground/60">
            Studio
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}
