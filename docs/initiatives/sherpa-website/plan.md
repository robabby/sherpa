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
- Homepage: hero with staggered entrance, dual-value cards, how-it-works, trust signals, bottom CTA
- About page, contact skeleton, placeholder pages for all nav routes
- All routes build statically, `pnpm check` passes across all packages

### Session 2: Content Pages, Contact Form, Calendly

- Full consulting pages (services overview + approach)
- Framework showcase (Seven Pillars, package overview)
- Case studies page
- Contact form (Resend + React Email Server Action)
- Calendly booking widget

### Session 3: Blog (MDX + Velite), Content Hub, SEO/AEO

- Velite setup with type-safe MDX
- Content hub with topic organization
- Article pages with TOC and reading time
- Sitemap, robots.txt, RSS feed, llms.txt, JSON-LD

### Session 4 (if needed): Polish, Performance, Deployment

- OG images, Vercel Speed Insights, bundle audit
- Animation polish
- Vercel deployment to sherpa.solar

## Verification

- [x] `pnpm check` passes (all packages)
- [x] `pnpm build:web` produces production build (7 static routes)
- [x] `pnpm build` still builds Studio independently
- [ ] Dev server runs at localhost:3001
- [ ] Theme toggle works (light/dark/system)
- [ ] All nav links resolve
