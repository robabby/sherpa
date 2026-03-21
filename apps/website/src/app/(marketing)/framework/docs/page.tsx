import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Sherpa Studio documentation is on the way. The framework is real — the docs are catching up.",
}

export default function FrameworkDocsPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal>
          <p className="font-mono text-sm text-primary">$ sherpa docs</p>
          <h1 className="mt-4 font-heading text-4xl tracking-tight md:text-5xl">
            The docs are being written.
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 rounded-xl border border-border/60 bg-card p-8">
            <p className="font-mono text-xs text-muted-foreground">
              // What exists right now
            </p>
            <div className="mt-4 flex flex-col gap-3 font-mono text-sm">
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-primary">&#x2713;</span>
                <span>
                  <span className="text-foreground">.claude/rules/</span>
                  <span className="text-muted-foreground">
                    {" "}— 9 convention files, auto-loaded by glob
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-primary">&#x2713;</span>
                <span>
                  <span className="text-foreground">.claude/skills/</span>
                  <span className="text-muted-foreground">
                    {" "}— 21 executable skills with full protocols
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-primary">&#x2713;</span>
                <span>
                  <span className="text-foreground">agents/</span>
                  <span className="text-muted-foreground">
                    {" "}— 30 behavioral role definitions
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-primary">&#x2713;</span>
                <span>
                  <span className="text-foreground">docs/initiatives/</span>
                  <span className="text-muted-foreground">
                    {" "}— 65 initiatives from proposal to integration
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-primary">&#x2713;</span>
                <span>
                  <span className="text-foreground">sherpa.config.ts</span>
                  <span className="text-muted-foreground">
                    {" "}— defineConfig() with vocabulary, dispatch, plugins
                  </span>
                </span>
              </div>
              <div className="mt-2 flex items-start gap-3">
                <span className="shrink-0 text-muted-foreground">&#x25CB;</span>
                <span className="text-muted-foreground">
                  docs/ — you are here
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-12">
            <Link href="/framework">
              <Button size="lg">
                Back to the framework
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
