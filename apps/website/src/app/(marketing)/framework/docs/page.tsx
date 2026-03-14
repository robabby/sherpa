import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Getting Started",
  description:
    "Get started with the Sherpa governance framework. Installation, configuration, and first steps.",
}

export default function FrameworkDocsPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Getting started
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Set up the Sherpa framework in your project. Five minutes to first
            governance.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 space-y-8">
            <div>
              <h2 className="text-lg font-semibold">1. Install</h2>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-card p-4 font-mono text-sm">
                pnpm add @sherpa/studio-core @sherpa/studio-cli
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold">2. Initialize</h2>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-card p-4 font-mono text-sm">
                npx sherpa init
              </pre>
              <p className="mt-3 text-sm text-muted-foreground">
                This scaffolds the governance structure: initiative directories,
                agent role definitions, convention rules, and a{" "}
                <code className="text-primary">sherpa.config.ts</code>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">3. Define your first agent role</h2>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-card p-4 font-mono text-sm">
{`# docs/agents/roles/reviewer.md
disposition: defaults to NEEDS WORK
quality-bar: evidence required for approval
focus: TypeScript, React, Next.js`}
              </pre>
              <p className="mt-3 text-sm text-muted-foreground">
                Agent roles use behavioral constraints, not identity claims.
                &quot;Defaults to NEEDS WORK&quot; is a behavioral instruction.
                &quot;You are an expert reviewer&quot; is not.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">4. Create your first initiative</h2>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-card p-4 font-mono text-sm">
{`mkdir docs/initiatives/my-feature
cat > docs/initiatives/my-feature/proposal.md`}
              </pre>
              <p className="mt-3 text-sm text-muted-foreground">
                Proposals are the unit of change. They go through review before
                any shared artifact is modified. This is governance — not
                bureaucracy.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-16 rounded-xl border border-border/60 bg-card p-8">
            <h2 className="font-heading text-xl tracking-tight">
              Full documentation
            </h2>
            <p className="mt-3 text-muted-foreground">
              Comprehensive framework documentation is in progress. In the
              meantime, the best reference is the framework&apos;s own
              codebase — it governs itself using every feature it provides.
            </p>
            <div className="mt-4">
              <Link href="https://github.com/sherpa-consulting">
                <Button variant="outline">
                  View on GitHub
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
