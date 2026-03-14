import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { posts } from "#content"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { ArrowLeft } from "lucide-react"
import { MDXContent } from "@/components/mdx/mdx-content"

interface Props {
  params: Promise<{ slug: string }>
}

function getPost(slug: string) {
  return posts.find((p) => p.slug === slug && p.published)
}

export async function generateStaticParams() {
  return posts
    .filter((p) => p.published)
    .map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
  }
}

const topicLabels: Record<string, string> = {
  "ai-literacy": "AI Literacy",
  "agentic-workflows": "Agentic Workflows",
  "governance-patterns": "Governance Patterns",
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <article className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Learn
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <Badge variant="secondary">
              {topicLabels[post.topic] ?? post.topic}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {post.metadata.readingTime}m read
            </span>
          </div>

          <h1 className="mt-4 font-heading text-3xl tracking-tight md:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post.author}</span>
            <span>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-10">
            <MDXContent code={post.body} />
          </div>
        </ScrollReveal>
      </div>
    </article>
  )
}
