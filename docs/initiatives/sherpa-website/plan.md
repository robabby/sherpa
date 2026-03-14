# Sherpa Website — Implementation Plan

## Goal

Public-facing marketing site for Sherpa Consulting at sherpa.solar. Consulting landing, framework showcase, MDX content hub, contact form with Calendly booking.

## Sessions

### Session 1: Scaffold, Theme, Navigation, Core Pages [COMPLETE]

- Monorepo wiring (`apps/website/`, root scripts, pnpm install)
- shadcn/ui v4 init (base-nova style, @base-ui/react)
- Warm marketing theme (gold primary, cream light mode, obsidian dark mode)
- Root layout with Fraunces/DM Sans/JetBrains fonts, next-themes provider
- `(marketing)` route group with header/footer shell
- Responsive navigation (desktop + mobile Sheet) with theme toggle
- Homepage: hero with staggered entrance, warm competence copy, scroll-reveal sections
- About page, contact skeleton, placeholder pages for all nav routes
- All routes build statically, `pnpm check` passes across all packages

### Session 2: Content Pages, Contact Form, Calendly [COMPLETE]

- Full consulting pages (services overview with deliverables + approach/methodology)
- Framework page (Seven Pillars grid, packages, getting started guide)
- Case studies page (anonymous WavePoint-based, context/challenge/approach/results)
- Contact form (Zod validation, Resend Server Action, React Email template)
- Calendly booking widget (dynamic import, graceful fallback)
- Voice & tone guidelines applied (docs/ux/) — warm competence throughout

### Session 3: Blog (MDX + Velite), Content Hub, SEO/AEO [COMPLETE]

- Velite setup with type-safe MDX (prebuild step, not webpack plugin — Turbopack incompatible)
- Content hub at /learn with topic sections (AI Literacy, Agentic Workflows, Governance Patterns)
- Article pages at /learn/[slug] with MDX rendering, reading time, topic badges
- First article: "The AI Adoption Gap: Why 95% of Pilots Never Ship"
- Sitemap, robots.txt, RSS feed (/feed.xml), llms.txt, JSON-LD helper
- 15 routes total (13 static + 1 SSG + 1 dynamic)

### Session 4 (if needed): Polish, Performance, Deployment

- OG images, Vercel Speed Insights, bundle audit
- Animation polish
- Vercel deployment to sherpa.solar

## Verification

- [x] `pnpm check` passes (all packages)
- [x] `pnpm build:web` produces production build (15 routes)
- [x] `pnpm build` still builds Studio independently
- [x] Velite builds MDX content (prebuild step)
- [x] Blog article renders at /learn/ai-adoption-gap
- [x] RSS feed at /feed.xml
- [x] Sitemap at /sitemap.xml
- [x] robots.txt serves
- [x] llms.txt serves
