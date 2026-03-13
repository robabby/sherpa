---
status: pending
initiative: sherpa-website
created: 2026-03-13
updated: 2026-03-13
type: new-plan
risk: additive
targets:
  - apps/website/
  - docs/roadmap.md
dependencies:
  - sherpa-framework-extraction
spawned-from: null
---

# Sherpa Website (sherpa.solar)

## Summary

Public-facing website for Sherpa Consulting at sherpa.solar. Serves as consulting landing page, framework showcase, content hub (publishing target for blog-content-engine workforce), and AI literacy consulting funnel. Dogfoods the Sherpa framework stack (Next.js 16, Tailwind v4, shadcn/ui).

## Domain Architecture

```
sherpa.solar            → apps/website/    Public marketing site, blog, framework docs
studio.sherpa.solar     → apps/studio/     Governance dashboard, initiative trees, task boards
```

Two Vercel projects, one monorepo. The marketing site is the public face — consulting, content, framework showcase. Studio is the practitioner tool — deployed separately, eventually auth-gated, not linked from the marketing nav. Both share `@sherpa/studio-core` and `@sherpa/studio-ui` packages but serve different audiences.

## State Snapshot

- sherpa.solar domain owned but no site exists
- `@sherpa/studio-*` packages extracted into monorepo with working Studio app at `apps/studio/`
- `agentic-consulting-landscape` research completed iteration 1 — market intelligence, pricing, positioning data available
- `blog-content-engine` initiative in roadmap as dependent on this initiative
- No visual identity system exists for Sherpa Consulting (only Studio's shadcn theme)

## Proposed Changes

### Target: `apps/website/`

New Next.js 16 application in the monorepo with:

**Tech stack:**
- Next.js 16.1+ with App Router, Cache Components, Turbopack
- Tailwind CSS v4.2+ (CSS-first config, container queries)
- shadcn/ui 4.0+ with Launch UI marketing blocks
- Motion (formerly Framer Motion) for restrained, purposeful animation
- Velite for type-safe MDX blog content layer (Phase 1)
- Payload CMS embedded in Next.js (Phase 2 — when blog-content-engine needs programmatic publishing)
- Resend + React Email for contact form and newsletter
- react-calendly for consultation booking
- next-themes for dark/light mode
- Vercel deployment with Speed Insights

**Site architecture (sherpa.solar):**

```
/                     Homepage — shared hero, parallel CTAs, trust signals
/framework            Framework overview — what @sherpa/studio is, GitHub link, getting started
/framework/docs       Framework documentation
/consulting           Services — AI literacy workshops, agentic workforce consulting
/consulting/approach  The behavioral governance methodology
/work                 Case studies — anonymous initially, named as available
/learn                Content hub — topic-organized (AI Literacy, Agentic Workflows, Governance)
/learn/[slug]         Individual articles/research — MDX-rendered
/about                The story, the team, "we built the tool we use"
/contact              Contact form + Calendly embed
```

**Studio (studio.sherpa.solar):** Existing `apps/studio/` deployed to subdomain. Governance dashboard for framework practitioners — initiative trees, task boards, velocity tracking, morning review. Not part of the marketing site navigation. Linked from `/framework` docs as "Launch Studio" for users who have the framework installed.

**Navigation (sherpa.solar):** Framework | Consulting | Work | Learn | About — task-based, not audience-based.

**Hero:** Problem-first. Lead with the AI adoption gap (91% C-suite faking AI knowledge, 95% pilot failure). Two parallel CTAs: "Get Started" (framework docs) + "Talk to a Guide" (consultation booking). Dual-purpose metrics below fold.

**Messaging framework (StoryBrand-aligned):**
- Character: Teams and organizations navigating AI adoption
- Problem: AI adoption is chaotic, risky, and everyone's faking confidence
- Guide: Sherpa — empathy ("we know the chaos") + authority ("we built a governance framework")
- Plan: 1. Understand where you are. 2. Get honest guidance. 3. Build capability with guardrails.
- Success: Confident AI adoption with quality guarantees
- One-liner: "Behavioral governance for agentic workflows — and the guides who know how to use it."

**Design direction:**
- Dark mode with warm accent color (amber/gold — "mountain guide warmth")
- Light mode default with system preference detection
- Sans-serif typography, large display headings
- Restrained animation: hero entrance, scroll-reveal, subtle hover states
- No particle effects, 3D globes, or parallax — gravitas over spectacle

**Content strategy:**
- Content hubs organized by topic, not chronology (AI Literacy, Agentic Workflows, Governance Patterns)
- Research iterations from /rr system transformed into public thought leadership
- FAQ sections with `FAQPage` JSON-LD for AEO (Answer Engine Optimization)
- `llms.txt` in root for AI search visibility
- RSS feed via Route Handler

**Phase 1 (launch):** MDX + Velite blog, static marketing pages, Calendly booking, contact form.
**Phase 2 (blog-content-engine):** Migrate to Payload CMS for programmatic draft/publish/schedule. Agents use REST API for content creation.

### Target: `docs/roadmap.md`

Update `sherpa-website` entry in the "Upcoming: New Initiatives" table to "in-progress" status.

## Rationale

1. **Stack validated by research.** Next.js 16 + Tailwind v4 + shadcn/ui is confirmed state-of-the-art for marketing sites. Payload CMS is the only headless CMS that embeds directly into Next.js — perfect for the Phase 2 agentic content pipeline.

2. **Positioning grounded in data.** Anti-hype positioning works (ThoughtWorks, Slalom). The 91% faking stat, 95% pilot failure rate, and transparency paradox research all support "guide not guru" as the messaging strategy.

3. **Architecture follows evidence.** NNG research shows audience-based navigation fails. Vercel/Stripe/MongoDB all use parallel CTAs on shared hero. Content hubs outperform chronological blogs for SEO and authority.

4. **Two-phase content strategy is optimal.** MDX dogfoods filesystem governance (Phase 1). Payload CMS dogfoods API-driven agentic workflows (Phase 2). Each phase validates a different framework pillar.

5. **Critical path dependency.** `blog-content-engine` and `ai-literacy-program` both depend on the website existing. Every day without sherpa.solar is a day those initiatives can't start.

## Dependencies

- `sherpa-framework-extraction` — Framework must be extractable before it can be showcased on the website
- `agentic-consulting-landscape` — Market intelligence informs service offerings and pricing (iteration 1 complete)

## Review Notes

- **Effort:** 3-4 sessions for Phase 1 (marketing site + MDX blog). 1-2 sessions for Phase 2 (Payload CMS migration).
- **Session breakdown:**
  - Session 1: Scaffold `apps/website/`, core pages (home, about, contact), shadcn/ui setup, dark mode, navigation
  - Session 2: Consulting pages, framework showcase, Calendly integration, contact form
  - Session 3: Blog architecture (MDX + Velite), content hub pages, SEO/AEO setup, first content
  - Session 4 (if needed): Polish, performance optimization, Vercel deployment, domain setup
  - Session 5-6 (Phase 2): Payload CMS integration, agent API authentication, draft/publish workflow
- The visual identity (color palette, typography, specific design tokens) needs a design session before Session 1 — or can be iterated during Session 1 with refinement later.
- Pricing transparency is an open question. Recommend: workshop pricing visible, custom engagement pricing behind "Talk to a Guide."
- The mountain metaphor (base camp, summit, expedition) should be tested — compelling or corny? Start subtle, expand based on response.
