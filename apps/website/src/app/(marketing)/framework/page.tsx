import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Framework",
  description:
    "An open-source behavioral governance framework for agentic workflows. Agent definitions, filesystem governance, executable conventions.",
}

const pillars = [
  {
    title: "Behavioral Agent System",
    description:
      "Role definitions with behavioral constraints, not identity claims. Research-validated approach to agent governance.",
  },
  {
    title: "Governance Engine",
    description:
      "Initiative lifecycle from proposal through implementation. Directoturtle convention, integration review, quality gates.",
  },
  {
    title: "Execution Pipeline",
    description:
      "Planner/Worker/Judge dispatch pattern. Task boards, MCP server integration, structured handoffs.",
  },
  {
    title: "Studio Application",
    description:
      "Visualization of agentic workflows. Initiative trees, task boards, velocity tracking, morning review dashboard.",
  },
  {
    title: "Executable Conventions",
    description:
      "Skills, rules, and CLAUDE.md templates that encode best practices as code — not documentation that drifts.",
  },
  {
    title: "Config-as-Code",
    description:
      "sherpa.config.ts with defineConfig(). Vocabulary, theming, plugins. Your governance configuration lives with your code.",
  },
  {
    title: "Convention Sync CLI",
    description:
      "sherpa init, sherpa sync. Provenance tracking ensures conventions stay current across projects.",
  },
]

const packages = [
  {
    name: "@sherpa/studio-core",
    description: "Domain logic, types, schemas, lifecycle engine",
  },
  {
    name: "@sherpa/studio-ui",
    description: "91+ React components for governance visualization",
  },
  {
    name: "@sherpa/studio-mcp",
    description: "MCP server for AI agent integration",
  },
  {
    name: "@sherpa/studio-cli",
    description: "Convention sync and project scaffolding",
  },
]

export default function FrameworkPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            The framework
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            An open-source toolkit for running Human+AI collaborative workflows.
            Behavioral agent definitions, filesystem-based governance, and
            AI-native process conventions that travel with your code.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-16">
            <h2 className="font-heading text-2xl tracking-tight">
              Seven pillars
            </h2>
            <p className="mt-3 text-muted-foreground">
              The framework is organized around seven core systems. Each can be
              adopted independently, but they work best together.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-lg border border-border/60 bg-card p-5"
                >
                  <h3 className="text-sm font-semibold">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-16">
            <h2 className="font-heading text-2xl tracking-tight">Packages</h2>
            <div className="mt-6 space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.name} className="flex items-baseline gap-4">
                  <code className="shrink-0 text-sm font-medium text-primary">
                    {pkg.name}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    {pkg.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-16 rounded-xl border border-border/60 bg-card p-8">
            <h2 className="font-heading text-xl tracking-tight">
              Built by practitioners
            </h2>
            <p className="mt-3 text-muted-foreground">
              This framework emerged from real consulting work — building
              agentic workflows and discovering that the governance tooling
              didn&apos;t exist. We use it on every engagement. It improves
              because we use it. The consulting improves because we improve it.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row">
            <Link href="/framework/docs">
              <Button variant="outline" size="lg">
                Getting started
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg">
                Talk to a Guide
                <MessageCircle data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
