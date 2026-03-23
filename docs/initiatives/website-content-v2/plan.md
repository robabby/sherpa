# Website Content v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reboot sherpa.solar homepage copy and voice positioning — replace generic messaging-framework output with distinctive founder voice grounded in real experience.

**Architecture:** The website is a Next.js 16 app at `apps/website/` in a pnpm monorepo. The homepage (`apps/website/src/app/(marketing)/page.tsx`) composes 5 section components from `apps/website/src/components/sections/`. Each section is a standalone React component using `motion/react` for animations and `ScrollReveal` for scroll-triggered entrance. The plan replaces content and potentially restructures sections, but preserves the component architecture, animation system, theme (warm gold/obsidian palette), and typography (Fraunces headings, DM Sans body).

**Tech Stack:** Next.js 16.1, React 19, Tailwind CSS v4, shadcn/ui (radix base, new-york style), Motion (framer-motion successor), Velite (MDX), TypeScript

---

## Pre-Implementation: Voice Discovery + Design

Sessions 1-2 are collaborative — they require Rob's input and produce artifacts that inform the implementation tasks. They are NOT automated.

### Session 1: Voice Discovery (Collaborative)

**Goal:** Find Rob's actual voice by mining for specific convictions, frustrations, and experience stories. Produce a voice brief with concrete sentence-level artifacts.

**Exercises to run (from research iteration 1, vector 4):**

1. **The "Say It Your Way" Rewrite (15 min)**
   Take 5 generic AI consulting sentences and rewrite them as Rob would actually say them:
   - "We help organizations implement AI responsibly."
   - "Our framework ensures governance is built in from the start."
   - "AI adoption fails when governance is an afterthought."
   - "We believe in empowering teams, not creating dependency."
   - "Our approach is grounded in real-world experience."

   The gap between generic and rewrite IS the voice.

2. **The Conviction Excavation (20 min)**
   Three questions, answered conversationally:
   - "What do you believe about AI governance that your competitors don't?"
   - "What makes you angry about the AI consulting industry?"
   - "What would you change about how organizations adopt AI if you had complete power?"

3. **The Layered Origin Interview (20 min)**
   - "Take me back to what brought you to even think about building this."
   - "Tell me about a specific moment when you realized the way AI governance was being done was wrong."
   - "What's the thing you've seen in your work that nobody talks about?"

4. **Key decisions to make:**
   - "I" vs "we" — solo practitioner voice or company voice?
   - How much of the Foundation Stone's register belongs on the homepage?
   - Are Trails the primary content vehicle, or do they come later?
   - What does Rob refuse to do? (Exclusions are strong copy material)

**Output:** Voice brief document at `docs/initiatives/website-content-v2/voice-brief.md` containing:
- 10-20 "voice artifact" sentences — things Rob said that pass the competitor-swap test
- Named enemy (what Sherpa is against)
- Named trade-offs (what Sherpa refuses)
- Pronoun decision ("I" vs "we")
- Register decision (Foundation Stone formal vs. conversational)
- 3-5 sentences that could be the hero headline

### Session 2: Design (Content Architecture)

**Goal:** Design the new homepage section structure and draft copy based on voice brief. Run `/design` skill.

**Decisions:**
- Homepage page flow — which alternative structure? (manifesto, narrative, calm authority, or hybrid)
- How many sections? (current 5 may collapse or expand)
- Section responsibilities — what does each section do in the page narrative?
- Draft copy for each section — complete sentences, not placeholders

**Key research-informed constraints:**
- No stats-as-authority section (the 91%/95%/9% pattern is the anti-pattern every successful site avoids)
- Every sentence must pass the competitor-swap test ("could Deloitte say this?")
- Specificity over claims — mechanism language, named trade-offs, experience stories
- Page structure follows voice, not convention

**Output:** `docs/initiatives/website-content-v2/design.md` containing:
- Section-by-section homepage design with final copy
- Component mapping — which existing components to reuse, rename, or replace
- Any new components needed
- Updated metadata/SEO copy

### Pre-Implementation Gate: Stress-Test

**Goal:** Run `/stress-test` on the design before implementation. Test assumptions about voice, positioning, and section structure.

**Key assumptions to test:**
- The competitor-swap test actually filters effectively
- The chosen page flow works for all three personas (Practitioner, Technical Leader, Honest Executive)
- The pronoun choice ("I" vs "we") doesn't create trust issues at different scales
- Removing the stats section doesn't leave a credibility gap

**Output:** Updated plan with any adjustments from stress-test findings.

---

## Implementation Tasks

> **Note:** Tasks 1-5 below execute the design from Session 2. The exact copy and section structure will come from the design document. The tasks describe the *shape* of the changes — which files, which patterns, which conventions — so the implementing agent knows what to touch and how.

### Task 1: Rewrite Hero Section

**Files:**
- Modify: `apps/website/src/components/sections/hero-section.tsx`

**Context:** The hero is a `"use client"` component using `motion/react` for staggered fade-up entrance animation. It has three animated elements: h1, subtitle paragraph, and CTA button group.

**Step 1: Replace copy**

Replace the hero headline, subtitle, and CTA labels with the copy from `design.md`. Preserve the existing animation system (`fadeUp` variants, staggered `custom` delays, `motion.h1` / `motion.p` / `motion.div`).

The current structure:
```tsx
<motion.h1>Ship AI workflows you can actually trust.</motion.h1>
<motion.p>An open-source governance framework — and a team that knows how to use it.</motion.p>
<motion.div>{/* CTA buttons */}</motion.div>
```

Replace the string content. Do NOT change:
- The `fadeUp` variant definition or easing
- The `motion.*` component wrappers
- The `custom={0|1|2}` stagger indices
- The responsive typography classes (`text-4xl sm:text-5xl md:text-6xl lg:text-7xl`)
- The `font-heading` class (maps to Fraunces display font)

**Step 2: Adjust CTA buttons if design changes them**

Current CTAs: "Get Started" (outline, links to /framework) and "Talk to a Guide" (primary, links to /contact). The design may change labels, order, or destinations. Use `Button` from `@/components/ui/button` with `data-icon` on Lucide icons per shadcn convention.

**Step 3: Verify build**

```bash
pnpm build:web
```

Expected: Build succeeds, 15 routes generated.

**Step 4: Commit**

```bash
git add apps/website/src/components/sections/hero-section.tsx
git commit -m "content(website): rewrite hero section with founder voice"
```

### Task 2: Replace Value/Reality Sections

**Files:**
- Modify: `apps/website/src/components/sections/dual-value-section.tsx`
- Modify: `apps/website/src/components/sections/how-it-works-section.tsx`
- Possibly delete or merge these files depending on design

**Context:** These are the two middle sections. `WhatWeDoSection` (dual-value) is a single paragraph describing the framework. `RealitySection` (how-it-works) is the stats block — the research identified this as the primary anti-pattern to remove.

**Step 1: Implement design's middle sections**

The design document will specify what replaces these two sections. Possibilities from research:
- **Collapse to one section** — a narrative block replacing both
- **Replace stats with experience** — swap borrowed-authority stats for specific experience stories
- **New section type** — e.g., "what we've seen" using mechanism language instead of stats

If the design merges two sections into one, keep the stronger component file and update imports in `page.tsx`. Delete the unused file.

Both components use `ScrollReveal` from `@/components/motion/scroll-reveal` for entrance animation. Preserve this pattern for any new or modified sections. `ScrollReveal` accepts `children`, `className`, and `delay` props.

**Step 2: Update homepage imports**

If sections were renamed, merged, or reordered, update `apps/website/src/app/(marketing)/page.tsx`:

```tsx
// Current:
import { WhatWeDoSection } from "@/components/sections/dual-value-section"
import { RealitySection } from "@/components/sections/how-it-works-section"

// Update to match design's section names and order
```

**Step 3: Verify build**

```bash
pnpm build:web
```

**Step 4: Commit**

```bash
git add apps/website/src/components/sections/ apps/website/src/app/\(marketing\)/page.tsx
git commit -m "content(website): replace value and reality sections per design"
```

### Task 3: Rewrite Trust and CTA Sections

**Files:**
- Modify: `apps/website/src/components/sections/trust-section.tsx`
- Modify: `apps/website/src/components/sections/cta-section.tsx`

**Context:** `TrustSection` has the "We use what we ship" copy — research identified this as the strongest v1 insight but noted it should be *shown* not *stated*. `CtaSection` has dual CTAs matching the hero.

**Step 1: Rewrite trust section**

Replace copy with design's version. The research suggests:
- Expand from two thin paragraphs to something with more weight
- Use named trade-offs and specific experience rather than claims
- Consider whether this section should surface live governance data (link to Studio, GitHub, etc.) rather than describe it

Preserve `ScrollReveal` wrapper. Use semantic color tokens (`text-muted-foreground`, `text-foreground`, `bg-card`, `border-border/60`) — never raw color values.

**Step 2: Rewrite CTA section**

Replace copy and potentially CTA labels. The CTA mirrors the hero's dual-button pattern. Keep `Button` component with proper `variant` and `size` props and `data-icon` on icons.

**Step 3: Verify build**

```bash
pnpm build:web
```

**Step 4: Commit**

```bash
git add apps/website/src/components/sections/trust-section.tsx apps/website/src/components/sections/cta-section.tsx
git commit -m "content(website): rewrite trust and CTA sections"
```

### Task 4: Update Metadata and SEO

**Files:**
- Modify: `apps/website/src/app/layout.tsx` (root metadata)
- Modify: `apps/website/src/app/(marketing)/about/page.tsx` (about page metadata + copy alignment)
- Modify: `apps/website/src/components/site-footer.tsx` (footer tagline)
- Modify: `apps/website/src/components/site-header.tsx` (header CTA label if changed)

**Step 1: Update root metadata**

The root layout exports `metadata` with:
```tsx
title: { default: "Sherpa — Behavioral Governance for Agentic Workflows" }
description: "Behavioral governance for agentic workflows — and the guides who know how to use it."
```

Update both to align with new voice. The title and description appear in search results and social shares.

**Step 2: Update footer tagline**

The footer has: `"Behavioral governance for agentic workflows."` — update to match new voice.

**Step 3: Update header CTA if needed**

The header has a "Talk to a Guide" button linking to /contact. If design changes CTA language, update here too.

**Step 4: Align about page opening**

The about page opens with "We built the tool we use" and "Sherpa started as a question..." — if the voice discovery changes the pronoun or the origin story framing, align these. The about page is the heaviest-lifting page per research (V1 finding: "the about page does the heaviest lifting in every case").

Only update the opening section (h1 + first paragraph) for consistency with homepage voice. A full about page rewrite is out of scope unless design explicitly includes it.

**Step 5: Verify build**

```bash
pnpm build:web
```

**Step 6: Commit**

```bash
git add apps/website/src/app/layout.tsx apps/website/src/app/\(marketing\)/about/page.tsx apps/website/src/components/site-footer.tsx apps/website/src/components/site-header.tsx
git commit -m "content(website): align metadata, footer, header, and about page with new voice"
```

### Task 5: Update Voice Guidelines

**Files:**
- Modify: `docs/ux/voice-and-tone.md`
- Modify: `docs/ux/messaging-framework.md`

**Step 1: Sharpen voice-and-tone.md**

The current doc has the right axes (calm/not cold, knowledgeable/not academic, present/not precious, honest/not cynical) but needs sharper edges. Add:

- Voice artifacts — specific DO/DON'T sentence pairs drawn from the voice discovery session, not generic examples
- Update the marketing tone example in the tone matrix from "Ship AI workflows you can actually trust" to the new hero copy
- Add a "The Foundation Stone Test" — when in doubt about voice, check whether the sentence matches the register and conviction of `docs/foundation-stone.md`

Do NOT change the four voice axes or the NNGroup dimensions — those are correct. Sharpen the examples, not the framework.

**Step 2: Update messaging-framework.md**

Update the tone examples and per-persona messaging to reflect the new voice. The Dunford positioning and Raskin narrative structure stay — update the specific copy examples within them.

**Step 3: Commit**

```bash
git add docs/ux/voice-and-tone.md docs/ux/messaging-framework.md
git commit -m "docs(ux): sharpen voice guidelines with founder-voice artifacts"
```

### Task 6: Final Verification

**Step 1: Full build**

```bash
pnpm build:web
```

Expected: Production build succeeds, all routes generated.

**Step 2: Type check**

```bash
pnpm check
```

Expected: No TypeScript errors across all packages.

**Step 3: Visual review**

```bash
pnpm dev:web
```

Open http://localhost:3001 and verify:
- Homepage renders all sections in correct order
- Animations work (hero stagger, scroll reveal on sections)
- Dark mode and light mode both look correct
- Mobile responsive layout intact
- All internal links work (/framework, /contact, /about)

**Step 4: Run the competitor-swap test**

Read every sentence on the homepage. For each one, ask: "Could Deloitte put this on their website?" If yes, flag it for revision.

**Step 5: Final commit if any fixes**

```bash
git add -A
git commit -m "content(website): final polish after visual review"
```

---

## Verification Checklist

- [ ] `pnpm build:web` succeeds
- [ ] `pnpm check` passes (all packages)
- [ ] All homepage sections render in correct order
- [ ] Hero animation (staggered fade-up) works
- [ ] ScrollReveal entrance animations work on all sections
- [ ] Dark mode renders correctly (warm obsidian palette)
- [ ] Light mode renders correctly (warm cream palette)
- [ ] Mobile layout responsive and functional
- [ ] No raw color values — all semantic tokens
- [ ] Every homepage sentence passes the competitor-swap test
- [ ] Metadata (title, description) updated
- [ ] Footer tagline aligned with new voice
- [ ] Voice-and-tone doc updated with new examples

## Session Summary

| Session | Type | What happens |
|---------|------|-------------|
| 1 | Collaborative | Voice discovery — exercises, convictions, artifacts |
| 2 | Collaborative + Design | Content architecture, section structure, draft copy |
| 2b | Stress-test | Test assumptions, update plan |
| 3 | Implementation | Tasks 1-6 — rewrite components, update metadata, update voice docs |
