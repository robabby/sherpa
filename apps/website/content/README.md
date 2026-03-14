# Writing for sherpa.solar

## How to publish a blog post

1. Create a new `.mdx` file in `apps/website/content/posts/`:

```
apps/website/content/posts/your-post-slug.mdx
```

2. Add frontmatter at the top:

```yaml
---
title: "Your Post Title"
description: "One sentence that appears in cards and meta tags."
date: 2026-03-14
published: true
topic: ai-literacy
tags: ["tag-one", "tag-two"]
author: Rob Hamilton
slug: your-post-slug
---
```

3. Write the body in MDX (Markdown with optional React components).

4. Run `pnpm dev:web` — Velite watches for changes and rebuilds automatically.

5. Your post appears at `/learn/your-post-slug` and in the content hub at `/learn`.

## Frontmatter reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `title` | Yes | string (max 120) | Used in page title and cards |
| `description` | Yes | string (max 260) | Used in meta tags and article cards |
| `date` | Yes | YYYY-MM-DD | Publication date |
| `published` | Yes | boolean | Set `false` for drafts |
| `topic` | Yes | enum | `ai-literacy`, `agentic-workflows`, or `governance-patterns` |
| `tags` | No | string[] | For future filtering, not displayed yet |
| `author` | No | string | Defaults to "Rob Hamilton" |
| `slug` | Yes | string | URL slug — must match filename |
| `updated` | No | YYYY-MM-DD | Shows in sitemap if set |

## Topics

Posts are organized by topic in the content hub, not by date.

- **AI Literacy** (`ai-literacy`) — Making AI adoption legible to teams and leaders
- **Agentic Workflows** (`agentic-workflows`) — How to build and govern agent-based systems
- **Governance Patterns** (`governance-patterns`) — Patterns, anti-patterns, and lessons from real engagements

## Drafts

Set `published: false` in frontmatter. The post won't appear on the site but Velite still validates it.

## How it works

[Velite](https://velite.js.org) compiles MDX at build time into typed JSON. The build command runs `velite build && next build`. In dev mode, `velite dev` watches for content changes in the background.

Content files live in git — no CMS, no database. Push to main and the site rebuilds.

## Voice & tone

Before publishing, check your copy against `docs/ux/voice-and-tone.md` and run through the review checklist in `docs/ux/content-guidelines.md`.
