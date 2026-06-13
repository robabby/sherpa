import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { SeeItRunningSection } from "@/components/sections/see-it-running"
import { FRAMEWORK_STATS as STATS } from "@/generated/framework-stats"

export const metadata: Metadata = {
  title: "Framework",
  description:
    "Sherpa Studio: a collaboration framework for agentic workflows with a focus on governance, research, and execution. Multi-project federation, behavioral agents, dispatch pipelines, semantic knowledge, and initiative lifecycle management.",
}

const pillars = [
  {
    title: "Behavioral Agent System",
    description: `Agent roles define what an agent does — its defaults, quality bar, and fail triggers — not who it pretends to be. That keeps behavior predictable and reviewable. ${STATS.agentRoles} roles run in production this way, each scoped to the task types it can take, an approach validated against Anthropic and academic research.`,
  },
  {
    title: "Governance Engine",
    description: `Every piece of work moves through proposal → review → integration, so nothing ships without a decision trail. ${STATS.initiatives} real initiatives have run through this lifecycle. External agents participate through 7 policy-gated MCP tools.`,
  },
  {
    title: "Execution Pipeline",
    description:
      "Describe a task once and the pipeline routes it to the right agent and backend, logs every event, and brings the result back for review. 9 dispatch backends — 5 CLI, 3 API, 1 remote gateway. Authority leases with fencing tokens mean two agents can never write the same artifact at once.",
  },
  {
    title: "Studio Application",
    description: `One dashboard shows the whole system — task boards, initiative trees, research feeds, and workforce views over live governance data. ${STATS.studioRoutes} routes and ${STATS.components} React components, with one Studio instance able to govern multiple codebases. Deploys blue-green with zero downtime.`,
  },
  {
    title: "Executable Conventions",
    description: `Conventions here are protocols agents run, not documents people forget. ${STATS.skills} skills define step-by-step workflows for research, review, and planning. ${STATS.rules} rules load automatically by file pattern, and provenance tracking records who wrote each document and when it was last verified.`,
  },
  {
    title: "Config-as-Code",
    description:
      "One config file declares how your team works — dispatch routing, governance policy, knowledge backends, vocabulary — and versions with git like everything else. Three directories keep concerns separate: .sherpa/ for tool state, .claude/ for agent config, docs/ for human prose. Type-safe with JSON schema.",
  },
  {
    title: "Convention Sync CLI",
    description:
      "Any project can adopt the framework in one command. sherpa init scaffolds the governance structure; sherpa sync keeps conventions current as they evolve. Provenance frontmatter tracks authorship, review state, and verification date for every maintained document.",
  },
]

const infrastructure = [
  {
    title: "Multi-Project Federation",
    description:
      "Run one governance substrate across many codebases and see them all in one place. A project registry merges task boards, research feeds, and initiative trees into aggregate views, so a team adopting Sherpa on five repos still has one place to look.",
  },
  {
    title: "Semantic Knowledge Engine",
    description:
      "Search and cluster everything the framework has produced — without standing up a vector database. The default backend is zero-dependency and algorithmic (TF-IDF indexing, extractive summaries, agglomerative clustering); swap in another backend when you need one. Queryable over MCP.",
  },
  {
    title: "SQLite State Layer",
    description:
      "Markdown stays the source of truth; SQLite gives you fast, queryable state derived from it. Three embedded databases handle coordination (authority leases, sessions), events (the audit trail), and the knowledge index. WAL mode keeps concurrent reads safe.",
  },
  {
    title: "MCP Coordination",
    description:
      "Multiple agents can work the same project at once without stepping on each other. An HTTP Streamable transport and session manager enforce authority leases, and fencing tokens prevent concurrent mutation of the same artifact. Governance applies only to autonomous agents — it never constrains a human+AI session.",
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
    description: `${STATS.components} React components for governance visualization`,
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
            A collaboration framework for agentic workflows with a focus on governance, research, and execution. Multi-project
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

        <SeeItRunningSection embedded />

        <ScrollReveal delay={0.25}>
          <div className="mt-16 rounded-xl border border-border/60 bg-card p-8">
            <h2 className="font-heading text-xl tracking-tight">
              Built by Rob Abby
            </h2>
            <p className="mt-3 text-muted-foreground">
              This framework emerged from building agentic workflows and
              discovering the governance layer didn&apos;t exist. Every
              convention and agent role here is in production, governing this
              framework&apos;s own development. Source is private while
              open-source prep completes — happy to walk through it.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a
                href="https://robabby.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary transition-colors hover:underline"
              >
                robabby.com →
              </a>
              <a
                href="https://github.com/robabby"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary transition-colors hover:underline"
              >
                GitHub →
              </a>
              <Link
                href="/contact"
                className="text-primary transition-colors hover:underline"
              >
                Contact →
              </Link>
            </div>
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
