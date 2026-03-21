---
status: approved
initiative: website-studio-product
created: 2026-03-21
updated: '2026-03-21'
type: roadmap-update
risk: structural
targets:
  - apps/website/src/app/(marketing)/page.tsx
  - apps/website/src/components/sections/hero-section.tsx
  - apps/website/src/components/sections/dual-value-section.tsx
  - apps/website/src/components/sections/how-it-works-section.tsx
  - apps/website/src/components/sections/trust-section.tsx
  - apps/website/src/components/sections/cta-section.tsx
  - apps/website/src/app/(marketing)/framework/page.tsx
  - apps/website/src/app/(marketing)/about/page.tsx
  - apps/website/src/app/(marketing)/consulting/page.tsx
  - apps/website/src/app/layout.tsx
  - apps/website/src/config/navigation.ts
  - apps/website/src/components/site-header.tsx
  - apps/website/src/components/site-footer.tsx
  - apps/website/package.json
  - docs/ux/voice-and-tone.md
  - docs/ux/messaging-framework.md
dependencies: []
informs:
  - trails
  - sherpa-website
personas:
  - engineer
  - product-manager
spawned-from: website-content-v2
---

# Website Studio Product Site

## Summary

Pivot sherpa.solar from a consulting marketing site to a Sherpa Studio product showcase. The website describes what Studio is, what it does, and why it matters — targeting developers and product teams. Consulting stays as a secondary pathway ("like what you see? we can help") but the product speaks for itself. Applies the founder-voice work from website-content-v2 as the human layer on top of product-oriented content.

## State Snapshot

**Website application** (`apps/website/`) is a Next.js 16 app in the pnpm monorepo. 15 routes across 10 pages, with Velite-based MDX blog at `/learn`. Built with Tailwind v4, shadcn/ui (radix base, new-york style), Motion for animations, Fraunces/DM Sans typography, warm gold/obsidian palette.

**Current orientation:** The entire site is structured as a consulting marketing funnel. The navigation (`apps/website/src/config/navigation.ts:1-7`) leads with "Framework" and "Consulting" as peer top-level items. The homepage (`apps/website/src/app/(marketing)/page.tsx:1-17`) renders 5 sections — all consulting-oriented: hero ("Ship AI workflows you can actually trust"), stats-as-authority (91%/95%/9%), trust signal ("We use what we ship"), and dual CTAs to `/framework` and `/contact`.

**Consulting pages** dominate the site architecture:
- `/consulting` — 3 service offerings (AI literacy workshops, agentic workforce consulting, governance implementation) with deliverables lists
- `/consulting/approach` — 3-step methodology page
- `/work` — case studies framed as consulting engagements
- `/about` — "We built the tool we use" origin story, consulting-first framing

**Framework page** (`apps/website/src/app/(marketing)/framework/page.tsx:1-161`) lists the seven pillars and four npm packages but as a secondary offering — "here's what we built" rather than "here's what you can use."

**Studio integration: zero.** The website has no imports from `@sherpa/studio-core`, `@sherpa/studio-ui`, or any workspace package. Content is entirely hardcoded marketing copy. When conventions, skills, or initiatives change in the codebase, the website has no mechanism to reflect those changes.

**`@sherpa/studio-core` API** is rich and build-time-ready. All domain functions are synchronous, pure, and filesystem-local — ideal for Next.js server components and static generation:
- `getConventions(ctx)` → rules, CLAUDE.md files, UX guides
- `getSkills(slugs, ctx)` → skill definitions with descriptions
- `getInitiatives(ctx)` → all active initiatives with metadata
- `getAgentRoles(ctx)` → behavioral agent role definitions
- `getHubStats(ctx)` → aggregate stats across all data sources
- `getUnifiedProcessData(sort, ctx)` → initiatives + workstreams + research joined
- `defineConfig()` / `loadConfig()` → project configuration
- Plus file tree builders, research iteration scanners, portfolio data, and session tracking

**Voice work completed.** The `website-content-v2` initiative produced:
- Voice brief (`docs/initiatives/website-content-v2/voice-brief.md`) — 20 voice artifacts, named enemy, trade-offs, pronoun/register decisions
- Selected hero headline: "Work as we knew it is over. What we build next matters."
- Research iteration 1 — 4 vectors on founder voice, anti-template copy, practitioner authority, voice discovery methods
- Design document with 4-section narrative flow (consulting-oriented — needs reorientation)
- Luna's founder-resume-patterns research confirming the "proof-of-methodology" framing

**Employment context.** Rob's top priority is landing a job, not growing a consulting practice. The website functions as portfolio evidence — proof that a Staff Engineer built a comprehensive governance framework solo. Consulting is a pathway for people who discover the product and want help, not the primary funnel.

## Proposed Changes

### Homepage: Product-First Narrative

**Rewrite all homepage sections** to describe what Studio is and does, not what Sherpa Consulting offers. Apply the voice brief's founder voice as the human layer.

The homepage shifts from consulting-funnel structure (hero → stats → trust → CTA) to a **product narrative** structure:

1. **Hero** — "Work as we knew it is over. What we build next matters." with product-oriented subtitle describing what Studio provides
2. **What Studio Does** — replaces both the v1 "what we do" paragraph and the stats section. Names the specific capabilities: behavioral conventions, skills system, dispatch pipeline, initiative lifecycle, governance that travels with code. Written in the voice brief's register — specific, mechanism-level language, not marketing claims
3. **How It's Built** — the "we use what we ship" insight reframed as product story. Studio governs its own development. The framework, the conventions, the skills — they're not demos, they're the production system
4. **Values + CTA** — the conviction layer ("create opportunity just as much as we automate it") with primary CTA to explore the framework and secondary mention of consulting availability

**Deletes** the stats section (`how-it-works-section.tsx`) — borrowed-authority statistics are the defining anti-pattern per research.

### Framework Page: Becomes the Product Page

**Rewrite `/framework`** as the primary product showcase. This page does the heaviest lifting in the new orientation. Currently lists pillars and packages statically — should present Studio's capabilities with more depth and conviction.

Content shifts from "here's what we built" → "here's what this gives you." Seven pillars and four packages stay but with product-oriented descriptions that speak to developers and product teams.

### Navigation: Product-First Ordering

**Reorder navigation** to reflect product orientation:
- Current: Framework | Consulting | Work | Learn | About
- Proposed: Framework | Learn | Work | About (Consulting moves off primary nav or becomes a secondary item under About or a footer link)

### Consulting: Deprioritized, Not Removed

**Keep `/consulting` and `/consulting/approach`** but remove consulting from primary navigation. Add a tasteful pathway from the framework page and footer: "Want help adopting this? We consult too." Consulting is discovered by people who want it, not pushed to everyone.

### About Page: Reframed

**Rewrite `/about` opening** to reflect the product/practitioner framing rather than consulting origin story. The about page becomes Rob's story as a practitioner who built the tools — proof of engineering capability, not a consulting pitch. The Foundation Stone's conviction and the voice brief's artifacts inform the tone.

### Metadata and Navigation Chrome

- **Root metadata** (`layout.tsx`): Update title and description to product-focused copy
- **Header CTA** (`site-header.tsx`): "Talk to a Guide" → "Talk to us" (or potentially "Get Started" to match product orientation)
- **Footer tagline** (`site-footer.tsx`): Update from consulting-oriented to product-oriented
- **Navigation config** (`navigation.ts`): Reorder items, potentially add/remove entries

### Studio-Core Integration (Foundation Only)

**Add `@sherpa/studio-core` as a workspace dependency** to `apps/website/package.json`. This is the architectural foundation for auto-updating content.

For this initiative, integration is limited to:
- Import `loadConfig()` and key domain functions in server components
- Use `getHubStats()` to display real aggregate data (convention count, skill count, initiative count) on the framework page — replacing hardcoded numbers with live data from the codebase
- Potentially use `getConventions()` and `getSkills()` to list actual available conventions and skills

This is deliberately scoped as a foundation. Full auto-updating (pages generated from studio-core data, routes that reflect initiative structure) is a future enhancement — evaluated when the time is right, per Rob's direction.

### Voice Guidelines Update

**Sharpen `docs/ux/voice-and-tone.md` and `docs/ux/messaging-framework.md`** with voice artifacts from the discovery session. Update the marketing tone examples to reflect product orientation rather than consulting pitch. Add the Foundation Stone Test and competitor-swap test as explicit quality checks.

## Rationale

**Why pivot now:** Rob's employment search is the top priority. A consulting marketing site positions him as "running a consulting business" — which triggers flight-risk perception per Luna's founder-resume-patterns research. A product site positions him as "a Staff Engineer who built a comprehensive framework" — which is the proof-of-methodology framing that strengthens his employment narrative.

**Why structural risk:** This changes the website's fundamental orientation. Navigation reorders, consulting deprioritizes, a new dependency (`@sherpa/studio-core`) is introduced, and every page's copy needs to shift from consulting-first to product-first. The infrastructure (Next.js app, components, animations, design system) stays — it's the content and orientation that changes structurally.

**Why not just update copy:** The v1 website is architecturally organized as a consulting funnel. Changing the copy without changing the structure produces the same misalignment the voice discovery identified — correct words in the wrong frame. The navigation, page hierarchy, CTA structure, and content emphasis all need to shift together.

**Why include studio-core integration:** The website currently has zero connection to the product it describes. Adding even a minimal integration (live convention/skill counts on the framework page) demonstrates that the framework is real and active. This is the "show, don't tell" principle from the research — surfacing actual data rather than describing it.

**What the voice work from website-content-v2 provides:** The voice discovery artifacts (voice-brief.md), selected hero headline, named enemy, named trade-offs, pronoun decision ("we"), and the Foundation Stone as voice baseline all carry forward. The voice is not consulting-specific — it's about the conviction behind building governance for AI workflows. That conviction applies to a product site with equal or greater force.

## Dependencies

**`website-content-v2` (parent):** This initiative is spawned from website-content-v2, which produced the voice discovery artifacts, research, and design work that inform this initiative. website-content-v2 should be archived — its deliverables (voice-brief.md, research/) are consumed here.

**No blocking dependencies.** The website infrastructure from `sherpa-website` sessions 1-3 (Next.js app, routing, blog, SEO) is complete and ready.

## Review Notes

**Scope boundaries:**
- IN: Homepage rewrite, framework page rewrite, about page reframing, consulting deprioritization, navigation reorder, metadata updates, voice guidelines update, studio-core dependency + minimal integration (hub stats on framework page)
- OUT: Blog content changes, full auto-updating architecture (pages generated from studio-core), new routes, consulting page rewrite (it stays as-is, just deprioritized), deployment to Vercel, `/work` case study changes
- MAYBE: `/framework/docs` getting-started page updates (if the product reorientation demands it), additional studio-core integration beyond hub stats

**Key trade-offs:**
- Consulting deprioritization means fewer inbound consulting leads. This is intentional — employment search is the priority, and the site still has a consulting pathway for those who want it.
- studio-core integration adds a build-time dependency. If studio-core API changes, the website build could break. Mitigated by the monorepo (both packages build together) and by scoping integration to stable functions only (getHubStats, getConventions, getSkills).
- The voice work was done with a consulting orientation. Some artifacts may need adjustment for the product framing, though most (the convictions, the headline, the named enemy) are orientation-independent.

**Open questions:**
1. Should the header CTA become "Get Started" (product) instead of "Talk to us" (relationship)?
2. Does `/work` stay as "Case Studies" or become "Examples" / "In Practice" to fit the product framing?
3. How much studio-core data should appear on the framework page? Just counts, or actual lists of conventions/skills?
4. Should the about page include Rob's engineering background explicitly (13 years, Staff Engineer, PartySlate) — the resume-patterns research says yes for employment positioning.

**Effort:** 3-4 sessions
**Session breakdown:**
- Session 1: Homepage rewrite (4 sections with new voice + product orientation), delete stats section, update page.tsx imports
- Session 2: Framework page rewrite as product showcase, navigation reorder, consulting deprioritization, studio-core dependency + minimal integration
- Session 3: About page reframe, metadata/header/footer updates, voice guidelines sharpening
- Session 4 (if needed): Polish pass, visual review, studio-core integration expansion, `/framework/docs` updates
