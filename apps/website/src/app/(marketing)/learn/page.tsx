import type { Metadata } from "next"
import Link from "next/link"
import { posts } from "#content"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "Learn",
  description:
    "AI literacy, agentic workflows, and governance patterns — research and thought leadership from Sherpa.",
}

const topics = [
  {
    slug: "ai-literacy",
    title: "AI Literacy",
    description: "Making AI adoption legible to teams and leaders.",
  },
  {
    slug: "agentic-workflows",
    title: "Agentic Workflows",
    description: "How to build and govern agent-based systems.",
  },
  {
    slug: "governance-patterns",
    title: "Governance Patterns",
    description: "Patterns, anti-patterns, and lessons from real engagements.",
  },
]

export default function LearnPage() {
  const published = posts.filter((p) => p.published)

  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            Learn
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            What we&apos;re learning about AI governance, shared as we learn it.
            Organized by topic, not by date.
          </p>
        </ScrollReveal>

        {topics.map((topic, i) => {
          const topicPosts = published
            .filter((p) => p.topic === topic.slug)
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )

          if (topicPosts.length === 0) return null

          return (
            <ScrollReveal key={topic.slug} delay={i * 0.08}>
              <section className="mt-14">
                <h2 className="font-heading text-2xl tracking-tight">
                  {topic.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {topic.description}
                </p>
                <div className="mt-6 space-y-4">
                  {topicPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={post.permalink}
                      className="group block rounded-lg border border-border/60 bg-card p-5 transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold group-hover:text-primary">
                            {post.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {post.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {post.metadata.readingTime}m read
                        </Badge>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            </ScrollReveal>
          )
        })}

        {published.length === 0 && (
          <ScrollReveal delay={0.1}>
            <div className="mt-14 rounded-xl border border-border/60 bg-card p-12 text-center">
              <p className="text-muted-foreground">
                Content is on the way. We&apos;re writing about what we&apos;re
                learning — check back soon.
              </p>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
