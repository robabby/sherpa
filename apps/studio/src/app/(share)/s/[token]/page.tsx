import type { Metadata } from "next"
import { notFound } from "next/navigation"
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

import { resolveShareToken } from "@sherpa/studio-core"
import { DocRenderer } from "@/components/studio/doc-renderer"
import { env } from "@/env"
import { getProject } from "@/lib/studio"
import { Separator } from "@/components/ui/separator"

interface SharePageProps {
  params: Promise<{ token: string }>
}

function loadSharedDocument(token: string) {
  const resolved = resolveShareToken(env.BETTER_AUTH_SECRET, token)
  if (!resolved) return null

  const project = getProject(resolved.project)
  if (!project) return null

  const absPath = path.join(
    project.root,
    ".sherpa",
    "research",
    resolved.relativePath,
  )

  // Path traversal guard: ensure resolved path is inside the research directory
  const researchDir = path.join(project.root, ".sherpa", "research")
  if (!path.resolve(absPath).startsWith(path.resolve(researchDir))) return null

  if (!fs.existsSync(absPath)) return null

  const raw = fs.readFileSync(absPath, "utf-8")
  const { data, content } = matter(raw)

  const title =
    data.title ??
    content.match(/^#\s+(.+)$/m)?.[1] ??
    path.basename(resolved.relativePath, ".md")

  const body = content.replace(/^#\s+.+\n/, "").trim()

  return { title, data, body }
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { token } = await params
  const doc = loadSharedDocument(token)

  if (!doc) {
    return { title: "Not Found | Sherpa Studio" }
  }

  return {
    title: `${doc.title} | Sherpa Studio`,
    description: doc.data.summary ?? undefined,
    openGraph: {
      title: doc.title,
      description: doc.data.summary ?? undefined,
      type: "article",
      publishedTime: doc.data.date ? String(doc.data.date) : undefined,
      siteName: "Sherpa Studio",
    },
    robots: "noindex, nofollow",
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const doc = loadSharedDocument(token)

  if (!doc) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {doc.title}
        </h1>
        {(doc.data.date || doc.data.category) && (
          <div className="mt-2 flex items-center gap-3">
            {doc.data.date && (
              <span className="font-mono text-xs text-[var(--color-gold-muted)]">
                {String(doc.data.date)}
              </span>
            )}
            {doc.data.date && doc.data.category && (
              <span className="text-[var(--color-gold-muted)]/40">·</span>
            )}
            {doc.data.category && (
              <span className="text-sm text-[var(--color-gold-muted)]/70">
                {String(doc.data.category)}
              </span>
            )}
          </div>
        )}
      </header>
      <Separator className="mb-8 bg-[var(--color-gold)]/15" />
      <DocRenderer content={doc.body} />
      <Separator className="mb-6 mt-12 bg-[var(--color-gold)]/15" />
    </article>
  )
}
