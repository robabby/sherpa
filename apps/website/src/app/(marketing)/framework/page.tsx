import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Framework",
  description:
    "Sherpa Studio: a governance framework for agentic workflows. Multi-project federation, behavioral agents, dispatch pipelines, semantic knowledge, and initiative lifecycle management.",
}

const pillars = [
  {
    title: "Behavioral Agent System",
    description:
      "30 agent roles defined through behavioral constraints — disposition, quality bar, fail triggers, domain scope. Not identity claims. Research-validated against Anthropic and academic findings. 8 task types route work to eligible roles automatically.",
  },
  {
    title: "Governance Engine",
    description:
      "72 initiatives tracked from proposal through integration with directoturtle directory structure. Dependencies, genealogy, and cross-initiative intelligence flows. External agents can propose and approve work via 7 MCP governance tools with policy-gated lifecycle transitions.",
  },
  {
    title: "Execution Pipeline",
    description:
      "9 dispatch backends — 5 CLI, 3 API, 1 remote gateway. Task-type routing with overnight restrictions. Authority leases with monotonic fencing tokens for multi-agent coordination. Real-time agent narrative streaming for mission visibility.",
  },
  {
    title: "Studio Application",
    description:
      "18 routes, 118 React components. Multi-project federation — one Studio instance governs multiple codebases. Task boards, initiative trees, workforce management, workflow canvas, research dashboards, and mission control. Zero-downtime blue-green deploys.",
  },
  {
    title: "Executable Conventions",
    description:
      "17 skills with full step-by-step protocols — recursive research, integration review, stress-testing, design, task planning. 9 rules auto-loaded by glob pattern. Self-documenting system with provenance tracking and staleness detection across every maintained document.",
  },
  {
    title: "Config-as-Code",
    description:
      "sherpa.json as canonical config with environment variable interpolation. Three-directory model: .sherpa/ (tool state), .claude/ (agent config), docs/ (human prose). 9 config domains including dispatch routing, knowledge backends, governance policy, and vocabulary. Type-safe with JSON schema and plugin architecture.",
  },
  {
    title: "Convention Sync CLI",
    description:
      "sherpa init scaffolds governance structure into any project. sherpa sync keeps conventions current across codebases. Provenance frontmatter tracks authorship, review state, and verification date for every maintained document.",
  },
]

const infrastructure = [
  {
    title: "Multi-Project Federation",
    description:
      "Project registry with cross-project data merging. Aggregate views across task boards, research feeds, and initiative trees. One governance substrate, many codebases.",
  },
  {
    title: "Semantic Knowledge Engine",
    description:
      "Pluggable backend architecture with zero-dependency algorithmic default. TF-IDF indexing, extractive summaries, agglomerative clustering. Queryable search over governance artifacts via MCP.",
  },
  {
    title: "SQLite State Layer",
    description:
      "Three embedded databases — coordination (authority leases, sessions), events (audit trail), knowledge (semantic index). Markdown stays canonical; SQLite provides derived queryable state. WAL mode for concurrent read safety.",
  },
  {
    title: "MCP Coordination",
    description:
      "HTTP Streamable transport replacing stdio. Multi-client session manager with authority enforcement. Fencing tokens prevent concurrent mutation. TTL reaper for expired leases. Governance scoped to autonomous agents — never constrains human+AI sessions.",
  },
]

const packages = [
  {
    name: "@sherpa/studio-core",
    description:
      "Domain logic, config schema, lifecycle engine, dispatch routing, knowledge backend interface",
  },
  {
    name: "@sherpa/studio-ui",
    description: "118 React components for governance visualization",
  },
  {
    name: "@sherpa/studio-mcp",
    description:
      "MCP server with authority leases, session management, and initiative governance tools",
  },
  {
    name: "@sherpa/studio-cli",
    description: "Convention scaffolding, sync, and provenance tracking",
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
            A governance framework for agentic workflows. Multi-project
            federation, behavioral agent definitions, a 9-backend dispatch
            pipeline, semantic knowledge indexing, and an initiative lifecycle
            with MCP-exposed governance — infrastructure that lives in your
            codebase and versions with git.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-16">
            <h2 className="font-heading text-2xl tracking-tight">
              Seven pillars
            </h2>
            <p className="mt-3 text-muted-foreground">
              Each pillar is a working system with real data behind it — not a
              roadmap item.
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

        <ScrollReveal delay={0.15}>
          <div className="mt-16">
            <h2 className="font-heading text-2xl tracking-tight">
              Cross-cutting infrastructure
            </h2>
            <p className="mt-3 text-muted-foreground">
              Capabilities that span multiple pillars and make the framework
              more than conventions in a filesystem.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {infrastructure.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border/60 bg-card p-5"
                >
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-16">
            <h2 className="font-heading text-2xl tracking-tight">Packages</h2>
            <div className="mt-6 flex flex-col gap-4">
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

        <ScrollReveal delay={0.25}>
          <div className="mt-16 rounded-xl border border-border/60 bg-card p-8">
            <h2 className="font-heading text-xl tracking-tight">
              Built by a practitioner
            </h2>
            <p className="mt-3 text-muted-foreground">
              This framework emerged from building agentic workflows and
              discovering that the governance infrastructure didn&apos;t exist.
              Every convention, every skill, every agent role was built because
              it was needed. The system governs its own development — the same
              initiative lifecycle, the same dispatch pipeline, the same
              behavioral constraints you&apos;d adopt.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-12">
            <Link href="/docs">
              <Button size="lg">
                Documentation
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
