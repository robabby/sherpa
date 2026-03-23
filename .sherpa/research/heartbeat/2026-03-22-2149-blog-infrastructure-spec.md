---
title: "robabby.com Blog Infrastructure Spec — MDX Setup for Next.js 16"
date: 2026-03-22
category: heartbeat
trigger: >
  Dangling thread #7: blog post outline done but robabby.com has no blog
  infrastructure. Target publish date is Tuesday/Wednesday (2 days). Site is
  Next.js 16 App Router. Researched fastest viable approach and produced a
  complete implementation spec ready for Claude Code.
summary: >
  The fastest viable blog for robabby.com is @next/mdx with gray-matter for
  frontmatter parsing, file-based routing under app/blog/[slug]/page.tsx, and
  @tailwindcss/typography for prose styling. No CMS needed. Total implementation
  is ~6 files and one pnpm add command. The meta description in layout.tsx also
  needs fixing (says "15+ years", missing Sherpa/WavePoint). Both can be done in
  a single Claude Code session with this spec.
rating: null
---

## Key Takeaway

robabby.com has no blog. The first article is outlined and ready to write. The technical implementation needed is minimal — 6 files, one dependency install, 30–60 minutes of Claude Code work. The publish deadline is Tuesday; the infrastructure needs to land Monday so the post can be written and reviewed before then. The spec below is complete enough to hand directly to Claude Code.

---

## Current Site State

- **Framework:** Next.js 16.0.10, App Router
- **Styling:** Radix UI Themes + custom CSS variables + Tailwind CSS
- **No blog directory** — `app/blog/` does not exist
- **No MDX dependencies** — `@next/mdx`, `gray-matter`, `reading-time` are all missing
- **`next.config.ts`** is minimal (no MDX configuration)
- **meta description** says "15+ years" (should be 13) and doesn't mention Sherpa/WavePoint

**Items to fix in the same session:**
1. Blog infrastructure (new)
2. Meta description in `app/layout.tsx` (quick fix)

---

## Implementation Approach: @next/mdx + File-Based Routing

**Why this approach:**
- First-party Next.js support (`@next/mdx`) — no third-party CMS, no remote fetching complexity
- Works natively with App Router Server Components
- `.mdx` files in `app/blog/` act as pages automatically after config
- Minimal dependencies: `@next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter reading-time`
- No rebuild needed for new posts — just add an `.mdx` file
- Vercel deploys automatically

**Why NOT other approaches:**
- `next-mdx-remote`: adds complexity, known App Router Suspense issues per Reddit thread
- Contentlayer: archived/deprecated
- Velite: newer, less battle-tested for App Router in production
- A CMS (Sanity, Contentful): overkill for a personal blog, adds cost

---

## Implementation Spec

### Step 1: Install Dependencies

```bash
cd /home/node/.openclaw/workspace/robabby
pnpm add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter reading-time remark-gfm rehype-slug rehype-autolink-headings
pnpm add -D @tailwindcss/typography
```

**Why each package:**
- `@next/mdx @mdx-js/loader @mdx-js/react @types/mdx` — core MDX support
- `gray-matter` — parses frontmatter (title, date, description) from `.mdx` files
- `reading-time` — calculates "X min read" from content
- `remark-gfm` — GitHub-flavored markdown (tables, task lists, strikethrough)
- `rehype-slug @rehype-autolink-headings` — adds anchor links to headings (good for long-form)
- `@tailwindcss/typography` — `prose` CSS class for beautiful article formatting

---

### Step 2: Update `next.config.ts`

Replace contents with:

```typescript
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
})

export default withMDX(nextConfig)
```

---

### Step 3: Create `mdx-components.tsx` (root of repo)

Required by Next.js App Router MDX. Create at `/home/node/.openclaw/workspace/robabby/mdx-components.tsx`:

```typescript
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  }
}
```

---

### Step 4: Create Blog Utilities (`lib/blog.ts`)

Create `/home/node/.openclaw/workspace/robabby/lib/blog.ts`:

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'app/blog/posts')

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: string
  published: boolean
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))
  
  return files
    .map(file => {
      const slug = file.replace(/\.mdx$/, '')
      const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
      const { data } = matter(source)
      const stats = readingTime(source)
      
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        description: data.description ?? '',
        tags: data.tags ?? [],
        readingTime: stats.text,
        published: data.published !== false,
      }
    })
    .filter(post => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPost(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const source = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(source)
  return { frontmatter: data, content }
}
```

---

### Step 5: Create Blog Directory Structure

```
app/blog/
  page.tsx              ← Blog index page
  [slug]/
    page.tsx            ← Individual post page
  posts/
    472-prs-11-weeks.mdx  ← First article
```

---

### Step 6: Blog Index Page (`app/blog/page.tsx`)

```typescript
import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'

export const metadata = {
  title: 'Writing — Rob Abby',
  description: 'Articles on agentic engineering, AI-native development, and shipping at velocity.',
}

export default function BlogPage() {
  const posts = getAllPosts()
  
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Writing</h1>
      <p className="text-gray-500 mb-12">
        On agentic engineering, AI-native development, and shipping at velocity.
      </p>
      
      <div className="space-y-10">
        {posts.map(post => (
          <article key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors mb-1">
                {post.title}
              </h2>
            </Link>
            <p className="text-sm text-gray-500 mb-2">
              {new Date(post.date).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })} · {post.readingTime}
            </p>
            <p className="text-gray-700 leading-relaxed">{post.description}</p>
          </article>
        ))}
        
        {posts.length === 0 && (
          <p className="text-gray-500">No posts yet — check back soon.</p>
        )}
      </div>
    </main>
  )
}
```

---

### Step 7: Post Page (`app/blog/[slug]/page.tsx`)

```typescript
import { getAllPosts, getPost } from '@/lib/blog'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
// Note: use @next/mdx's built-in approach instead:

// Actually, with @next/mdx file-based approach, the post page works differently.
// The MDX file IS the page. Use this structure instead:
```

**Correction:** With `@next/mdx`, there are two approaches:

**Approach A (simpler): MDX file IS the page**
- Place `.mdx` files directly in `app/blog/[slug]/page.mdx`
- Each post is its own route
- No `[slug]/page.tsx` needed
- Con: harder to add consistent layout/metadata around posts

**Approach B (recommended for a portfolio blog): Dynamic import**
- Keep MDX files in `app/blog/posts/` as data, not routes
- Use a `[slug]/page.tsx` that dynamically imports the MDX content
- Allows consistent post layout with header, back link, reading time, etc.

For Approach B, the post page:

```typescript
import { getAllPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const BLOG_DIR = path.join(process.cwd(), 'app/blog/posts')
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return {}
  const source = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(source)
  return {
    title: `${data.title} — Rob Abby`,
    description: data.description,
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const BLOG_DIR = path.join(process.cwd(), 'app/blog/posts')
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  
  if (!fs.existsSync(filePath)) notFound()
  
  const source = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(source)
  const stats = readingTime(source)
  
  // Dynamic import the MDX file
  const { default: Content } = await import(`../posts/${slug}.mdx`)
  
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <a href="/blog" className="text-sm text-gray-500 hover:text-gray-700 mb-8 block">
        ← All writing
      </a>
      
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-3">{data.title}</h1>
        <p className="text-sm text-gray-500">
          {new Date(data.date).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          })} · {stats.text}
        </p>
      </header>
      
      <article className="prose prose-gray max-w-none">
        <Content />
      </article>
    </main>
  )
}
```

**Note on dynamic import:** The `await import('../posts/${slug}.mdx')` approach may have TypeScript/bundler issues. An alternative is to use `next-mdx-remote` just for the rendering step while keeping `@next/mdx` for configuration, or use Approach A (MDX files as routes) with a shared layout component.

**Recommendation for first article:** Use **Approach A** for speed. One file per post, route is automatic. Add a shared blog layout via `app/blog/layout.tsx`:

```typescript
// app/blog/layout.tsx
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <article className="prose prose-gray max-w-none">
        {children}
      </article>
    </div>
  )
}
```

And first post at `app/blog/472-prs-11-weeks/page.mdx`:

```mdx
export const metadata = {
  title: 'What 472 PRs in 11 Weeks Taught Me About Agentic Engineering',
  description: 'I shipped 472 PRs across a Next.js web app and 6 native Apple apps in 11 weeks — solo. Here\'s the infrastructure that made it possible.',
}

# What 472 PRs in 11 Weeks Taught Me About Agentic Engineering

*7 min read · March 25, 2026*

[article content here]
```

---

### Step 8: Fix Meta Description in `app/layout.tsx`

While in the codebase, update lines 22-35 of `app/layout.tsx`:

**Replace:**
```typescript
  description: "Staff Engineer & Agentic Engineering Practitioner with 15+ years building exceptional web experiences for startups and enterprises. Expert in React, TypeScript, and design systems.",
```

**With:**
```typescript
  description: "Staff Engineer & Agentic Engineering Practitioner. Founded Sherpa (AI consulting) and WavePoint (472+ PRs, 6 native apps, 11 weeks solo). React, TypeScript, Next.js, Swift.",
```

Also update the OG and Twitter descriptions to match.

---

### Step 9: Add "Writing" to Navigation

If Header component has nav items, add:
```typescript
{ label: 'Writing', href: '/blog' }
```

---

## Tailwind Typography Setup

In `tailwind.config` (wherever it is), add the typography plugin:

```typescript
plugins: [
  require('@tailwindcss/typography'),
]
```

This enables the `prose prose-gray max-w-none` classes in the blog layout.

---

## Prompt for Claude Code Session

> Implement a minimal blog system for robabby.com (Next.js 16, App Router). Use Approach A: MDX files as routes with a shared `app/blog/layout.tsx`. Steps:
>
> 1. `pnpm add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter reading-time remark-gfm`; `pnpm add -D @tailwindcss/typography`
> 2. Update `next.config.ts` to wrap with `createMDX` and enable `pageExtensions`
> 3. Create `mdx-components.tsx` at repo root
> 4. Add `@tailwindcss/typography` to tailwind config plugins
> 5. Create `app/blog/layout.tsx` with max-w-2xl container and `prose prose-gray` styling
> 6. Create `app/blog/page.tsx` — a simple listing page (can be minimal for now, list posts manually or leave as placeholder)
> 7. Create `app/blog/472-prs-11-weeks/` directory with `page.mdx` containing just the metadata export and a placeholder heading (content will be filled in separately)
> 8. Fix meta description in `app/layout.tsx` — replace "15+ years" with "13 years" and add Sherpa/WavePoint keywords
>
> Follow the repo's Git workflow: feature branch → PR. Branch name: `feat/blog-infrastructure`

---

## Publish Timeline

| Step | When | Owner |
|---|---|---|
| Blog infrastructure PR | Monday March 23 | Claude Code |
| Write article content | Monday evening | Rob |
| Review + merge | Tuesday AM | Rob |
| Publish dev.to cross-post | Tuesday AM | Rob |
| LinkedIn carousel adaptation | Tuesday AM | Rob |

---

## Sources

- Next.js MDX Docs (official): https://nextjs.org/docs/app/guides/mdx
- Portfolio Starter Kit (Vercel template): https://vercel.com/templates/next.js/portfolio-starter-kit
- Building MDX Blog Next.js 16 (TechPilot): https://www.yourtechpilot.com/blog/building-mdx-blog-nextjs
- Reddit r/nextjs MDX App Router discussion: https://www.reddit.com/r/nextjs/comments/18ulrhc/
- Blog post outline: `.sherpa/research/heartbeat/2026-03-22-0019-blog-post-outline.md`
- Current layout.tsx: `/home/node/.openclaw/workspace/robabby/app/layout.tsx`
