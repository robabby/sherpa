export default function ShareLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">{children}</main>
      <footer className="flex items-center justify-center gap-2 pb-8 pt-6">
        <span className="text-sm text-[var(--color-gold-muted)]/50">
          <span className="font-display">Sherpa</span> Studio
        </span>
      </footer>
    </div>
  )
}
