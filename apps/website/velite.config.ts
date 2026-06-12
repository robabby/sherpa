import { defineConfig, s } from "velite"

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
  },
  collections: {
    posts: {
      name: "Post",
      pattern: "posts/**/*.mdx",
      schema: s
        .object({
          title: s.string().max(120),
          description: s.string().max(260),
          date: s.isodate(),
          updated: s.isodate().optional(),
          published: s.boolean().default(false),
          topic: s.enum([
            "ai-literacy",
            "agentic-workflows",
            "governance-patterns",
          ]),
          tags: s.array(s.string()).default([]),
          author: s.string().default("Rob Abby"),
          slug: s.slug("posts"),
          body: s.mdx(),
          toc: s.toc(),
          metadata: s.metadata(),
        })
        .transform((data) => ({
          ...data,
          permalink: `/learn/${data.slug}`,
        })),
    },
  },
})
