# Vector 4: Next.js Consulting Sites — State of the Art (2026)

**Question:** What's the state of the art for Next.js-based consulting/agency websites in 2026? Templates, design systems, performance, SEO, conversion.
**Agent dispatched:** 2026-03-13

## Findings

### Next.js 16 Features for Marketing Sites

- **Next.js 16 released October 21, 2025** with Cache Components (`"use cache"` directive), stable Turbopack (2-5x faster builds, 10x faster Fast Refresh), stable React Compiler, and `proxy.ts` replacing `middleware.ts`. ([nextjs.org/blog/next-16](https://nextjs.org/blog/next-16))
- **Cache Components complete the PPR story** — static shell served instantly with dynamic holes streamed in parallel. ([nextjs.org/blog/next-16](https://nextjs.org/blog/next-16))
- **React 19.2 features**: View Transitions, `useEffectEvent()`, `<Activity/>` for background rendering. ([react.dev](https://react.dev/reference/react/ViewTransition))
- **Server Components are SEO-ideal** — zero client JS, fully-rendered HTML to crawlers, direct database access, smaller bundles.
- **Metadata API** with `generateMetadata()` merges across nested layouts, supports dynamic OG images via `opengraph-image.tsx`. ([nextjs.org/docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image))
- **ISR remains the sweet spot for blogs** — static pages revalidated on configurable intervals. On Vercel, ISR pages live on global edge network.
- **`sitemap.ts` and `robots.ts`** auto-served at `/sitemap.xml` and `/robots.txt` using built-in types. No packages needed.

### shadcn/ui for Marketing Sites

- **shadcn/ui is no longer just for dashboards** — default UI standard for modern web apps in 2026. Even AI tools (v0, Bolt) produce shadcn-compatible output.
- **Launch UI** — 74+ blocks, 7 templates on React 19.2 + Tailwind 4.2 + shadcn/ui 4.0. Hero (6 variants), bento grid (5), features (6), social proof (6), FAQ (6), navbar (6), logos (6), testimonials (3), CTA (4), footer (4), pricing, tabs. 23 custom animations. Free: 9 blocks. Pro: $99 one-time. ([launchuicomponents.com](https://www.launchuicomponents.com/))
- **Aceternity UI** — 200+ components with Framer Motion animations. Hero sections (17+), feature sections (14+), backgrounds (11+). Used by 120,000+ developers. ([ui.aceternity.com](https://ui.aceternity.com/))
- **Magic UI** — 150+ free animated components. MIT license, 20.4k GitHub stars. Best for SaaS and product marketing. ([magicui.design](https://magicui.design/))
- **Page UI (Shipixen)** — free, open-source marketing blocks on shadcn/ui + Tailwind. ([pageui.shipixen.com](https://pageui.shipixen.com/))
- **shadcnblocks.com** — 13 templates at $79 each. Relevant: Hive (agency portfolio), Aspect (corporate), Lumen (100+ components). ([shadcnblocks.com](https://www.shadcnblocks.com/templates))

### SEO Best Practices for Next.js in 2026

- **Metadata API** is the foundation: `metadata` objects or `generateMetadata()` functions merged across layouts.
- **JSON-LD structured data** via `<Script type="application/ld+json">`. Most valuable: `FAQPage` (3.1x higher answer extraction), `HowTo`, `Article`, `Organization`, `Speakable`. ([llmrefs.com](https://llmrefs.com/answer-engine-optimization))
- **Answer Engine Optimization (AEO)** is now critical alongside SEO:
  - Lead with the answer in first 30-60 words
  - Question-first content structure aligned with real AI prompts
  - The 40-word answer rule for concise answer blocks
  - FAQPage JSON-LD with prompt-matched questions
  - Data-backed claims with source attribution
  - Content freshness: citations drop sharply after 3 months
- **llms.txt** — proposed standard for AI crawlers (600+ sites including Anthropic, Stripe). Effectiveness debated. ([bluehost.com](https://www.bluehost.com/blog/what-is-llms-txt/))
- **Verify AI bots aren't blocked**: OAI-SearchBot, PerplexityBot, Google-Extended, ClaudeBot.

### Blog Architecture

- **MDX + Git is recommended starting point** for developer-led teams. Add Keystatic when non-engineers need to edit. Switch to headless CMS when large editorial teams need roles/approvals. ([char.com](https://char.com/blog/choosing-a-cms/))
- **Velite** is the successor to Contentlayer for type-safe content layers. Zod schema validation, TypeScript inference, MDX out of the box. ([velite.js.org](https://velite.js.org/guide/using-mdx))
- **ISR with `revalidateTag()`** for blog posts: fast static pages revalidated on demand.
- **RSS feeds** via `app/feed.xml/route.ts` Route Handler (manual implementation).

### Performance

- **next/font** auto-optimizes fonts, removes external network requests. Use `font-display: swap`.
- **next/image** with `placeholder="blur"` prevents CLS. Default cache TTL now 4 hours (Next.js 16).
- **React Compiler** (stable in Next.js 16) auto-memoizes components with zero code changes. Not enabled by default.
- **Only 47% of websites meet CWV standards** in 2025; 53% of mobile visitors abandon sites >3s.
- **Vercel Speed Insights** provides real-user CWV monitoring with zero config.

### Conversion Optimization

- **Embedded scheduling converts 3x better than contact forms alone.** Calendly integration drives 30-70% conversion increase. ([webgate.digital](https://webgate.digital/use-cases/boosting-website-leads-using-calendly-forms/))
- **react-calendly** for InlineWidget/PopupWidget. Dynamic import with `ssr: false`.
- **Personalized CTAs perform 202% better** than generic. Place in 3+ locations: header, mid-page, footer.
- **Resend + React Email** for contact form via Server Actions (`"use server"`). No API routes needed.
- **Keep contact forms short**: Name, Email/Phone, Service Needed, Brief Message.
- **Hero must state who you help, what outcome, why it matters** — 3-5 second decision window.

### Animation

- **Framer Motion is now "Motion"** (motion.dev) — rebranded, no longer limited to React. 18M+ monthly npm downloads. ([motion.dev](https://motion.dev/))
- **Motion is 2.5x faster than GSAP** at animating from unknown values, 6x faster between value types. Better for INP scores.
- **For consulting sites: restrained, purposeful animation.** Hero entrance, scroll-reveal for sections, subtle hover states. No spectacle — consulting clients want gravitas.
- **View Transitions API** experimental in Next.js 16 (`viewTransition: true`). Also via `next-view-transitions` library.

### Dark Mode

- **Consulting sites do dark mode in 2026.** Convention: default to light with system preference detection and manual toggle.
- **Implementation trivial with shadcn/ui**: 2 lines with next-themes. `defaultTheme="system"` with `enableSystem`.
- **Recommendation**: Light default shows professionalism for B2B. Dark option shows technical sophistication for AI/tech consulting.

### Tailwind v4

- **Released January 22, 2025.** CSS-first config (one line of CSS, no JS config). Full builds 5x faster, incremental 100x faster via Lightning CSS.
- **Native container queries** (`@sm:`, `@md:`, `@lg:`) — components query parent, not viewport.
- **3D transform utilities** (`rotate-x-*`, `rotate-y-*`, `scale-z-*`, `translate-z-*`).

## Recommended Tech Stack (Confirmed)

- **Next.js 16.1+** (stable Turbopack, Cache Components, React Compiler)
- **Tailwind CSS v4.2+** (container queries, 3D transforms, CSS-first)
- **shadcn/ui 4.0+**
- **React 19.2** (View Transitions, useEffectEvent, Activity)
- **Motion** (formerly Framer Motion) for animations
- **Velite** for type-safe MDX blog content layer
- **Resend + React Email** for contact form and newsletter
- **react-calendly** for consultation booking
- **next-themes** for dark mode
- **Vercel** deployment with Speed Insights and edge caching

## Component Library Strategy

- Start with **Launch UI** (free tier or $99 Pro). Closest match to stack.
- Supplement with **Aceternity UI** or **Magic UI** for animated hero sections (sparingly — consulting, not agency).
- Consider **shadcnblocks Hive** ($79) as reference for agency portfolio patterns.
- **Page UI (Shipixen)** for free blocks as needed.

## Sources

### Next.js Core
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1)
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx)
- [Next.js OG Image Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Next.js View Transitions](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition)

### SEO & AEO
- [AEO Comprehensive Guide (LLMrefs)](https://llmrefs.com/answer-engine-optimization)
- [AEO Guide 2026 (CXL)](https://cxl.com/blog/answer-engine-optimization-aeo-the-comprehensive-guide/)
- [llms.txt Guide (Bluehost)](https://www.bluehost.com/blog/what-is-llms-txt/)
- [llms.txt Effectiveness (Peec AI)](https://peec.ai/blog/llms-txt-md-files-important-ai-visibility-helper-or-hoax)
- [Next.js SEO 2025 (SlateBites)](https://www.slatebytes.com/articles/next-js-seo-in-2025-best-practices-meta-tags-and-performance-optimization-for-high-google-rankings)

### shadcn/ui Ecosystem
- [Launch UI](https://www.launchuicomponents.com/) — 74+ blocks for marketing
- [Aceternity UI](https://ui.aceternity.com/) — 200+ animated components
- [Magic UI](https://magicui.design/) — 150+ free components
- [Page UI (Shipixen)](https://pageui.shipixen.com/) — Free marketing blocks
- [shadcnblocks.com](https://www.shadcnblocks.com/templates) — Premium templates
- [Shadcn UI Blocks](https://www.shadcn-ui-blocks.com/templates) — 700+ sections

### Blog & CMS
- [Velite Documentation](https://velite.js.org/guide/using-mdx) — Type-safe MDX
- [Keystatic CMS](https://keystatic.com/) — Git-based CMS for Next.js
- [Choosing CMS 2026 (Char)](https://char.com/blog/choosing-a-cms/)

### Performance
- [Optimize CWV (Makers' Den)](https://makersden.io/blog/optimize-web-vitals-in-nextjs-2025)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Vercel Edge Caching](https://vercel.com/docs/edge-network/caching)

### Animation
- [Motion.dev](https://motion.dev/) — Framer Motion successor
- [Motion vs GSAP](https://motion.dev/docs/gsap-vs-motion)
- [next-view-transitions (GitHub)](https://github.com/shuding/next-view-transitions)

### Conversion
- [Calendly Forms Boost (Webgate)](https://webgate.digital/use-cases/boosting-website-leads-using-calendly-forms/)
- [react-calendly (npm)](https://www.npmjs.com/package/react-calendly)
- [Resend + Next.js](https://resend.com/docs/send-with-nextjs)
- [CTA Guide 2025](https://groverwebdesign.com/news/call-to-action-cta-the-hidden-conversion-engine-every-website-needs-in-2025/)

### Consulting Website Design
- [10 Steps (Consulting Success)](https://www.consultingsuccess.com/consulting-website)
- [Consulting Website Design (CrowdSpring)](https://www.crowdspring.com/blog/consulting-website-design/)

## Raw Links

- https://nextjs.org/blog/next-16
- https://nextjs.org/blog/next-16-1
- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/getting-started/fonts
- https://nextjs.org/docs/app/guides/mdx
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition
- https://nextjs.org/showcase
- https://react.dev/reference/react/ViewTransition
- https://tailwindcss.com/blog/tailwindcss-v4
- https://ui.shadcn.com/docs/dark-mode/next
- https://www.launchuicomponents.com/
- https://github.com/launch-ui/launch-ui
- https://ui.aceternity.com/
- https://magicui.design/
- https://github.com/magicuidesign/magicui
- https://pageui.shipixen.com/
- https://www.shadcnblocks.com/templates
- https://www.shadcn-ui-blocks.com/templates
- https://shadcnstudio.com/templates/grow-marketing-template
- https://github.com/shadcnblocks/mainline-nextjs-template
- https://github.com/nobruf/shadcn-landing-page
- https://velite.js.org/guide/using-mdx
- https://github.com/zce/velite
- https://keystatic.com/
- https://motion.dev/
- https://motion.dev/docs/gsap-vs-motion
- https://github.com/motiondivision/motion
- https://github.com/shuding/next-view-transitions
- https://llmrefs.com/answer-engine-optimization
- https://cxl.com/blog/answer-engine-optimization-aeo-the-comprehensive-guide/
- https://www.bluehost.com/blog/what-is-llms-txt/
- https://peec.ai/blog/llms-txt-md-files-important-ai-visibility-helper-or-hoax
- https://resend.com/docs/send-with-nextjs
- https://www.npmjs.com/package/react-calendly
- https://webgate.digital/use-cases/boosting-website-leads-using-calendly-forms/
- https://vercel.com/docs/speed-insights
- https://vercel.com/docs/edge-network/caching
- https://makersden.io/blog/optimize-web-vitals-in-nextjs-2025
- https://www.sitepoint.com/tailwind-css-v4-container-queries-modern-layouts/
- https://www.consultingsuccess.com/consulting-website
- https://www.crowdspring.com/blog/consulting-website-design/
- https://www.designrush.com/best-designs/websites/trends/best-dark-themed-website-designs
- https://spacejelly.dev/posts/how-to-add-a-sitemap-rss-feed-in-next-js-app-router
- https://www.joshwcomeau.com/blog/how-i-built-my-blog/

## Implications

1. **Stack confirmed.** Next.js 16 + Tailwind v4 + shadcn/ui is state-of-the-art. No alternative needed.
2. **Launch UI as component foundation** — purpose-built for this exact stack, marketing-focused.
3. **MDX + Velite for blog** — type-safe, Git-based, ISR on Vercel. CMS migration path exists.
4. **AEO is the new SEO.** Structure content for AI answer engines, not just Google.
5. **Calendly embed on service pages** — 3x conversion vs contact forms alone.
6. **Motion (not GSAP) for animations.** Restrained, purposeful — gravitas over spectacle.
7. **Dark mode with light default.** Trivial to implement, signals technical sophistication.

## Open Questions

1. Cache Components vs ISR for blog content?
2. Velite vs raw MDX processing (gray-matter + next-mdx-remote)?
3. When to add Keystatic for non-engineer editors?
4. View Transitions — implement now via library or wait for stable?
5. Newsletter platform: Resend Broadcasts vs ConvertKit vs Buttondown?
6. Case studies as MDX or structured data with custom component?
7. How does the agentic content workforce publish — Git commits, Keystatic, custom MCP tool?
