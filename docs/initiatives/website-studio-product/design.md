---
designed: 2026-03-21
type: both
components-new: 3
components-modified: 9
files-planned: 19
---

# Website Studio Product — Design

## Overview

Rewrite sherpa.solar as a portfolio/proof-of-methodology site. Two audiences: developers who might use the framework, and hiring managers evaluating Rob's engineering capability. The homepage tells the story of what was built and why. The framework page proves it's real. The about page names the builder.

Source artifacts:
- Proposal: `docs/initiatives/website-studio-product/proposal.md`
- Stress test: `docs/initiatives/website-studio-product/stress-test.md`
- Voice brief: `docs/initiatives/website-content-v2/voice-brief.md`
- Foundation Stone: `docs/foundation-stone.md`
- Parent design (consulting-oriented reference): `docs/initiatives/website-content-v2/design.md`

Key decisions from stress-test:
- Framing: portfolio/proof-of-methodology (not "product you can try")
- Audience: both devs and hiring managers
- CTAs: "See the framework" not "Get Started" (private repo)
- Headline: "Work as we know it is changing" (Rob's refinement)
- "We" pronoun: inclusive "we" always safe, company "we" with transparency

---

## Architecture

### Studio-Core Integration

The website currently has zero imports from any workspace package. Adding `@sherpa/studio-core` enables live data from the codebase — convention counts, skill counts, initiative stats — as portfolio evidence.

**Pattern:** Mirror `apps/studio/`'s proven integration:

```
apps/website/
  sherpa.config.ts          ← NEW: loadConfig() with path resolution
  next.config.ts            ← MODIFY: wrap with withSherpa()
  src/lib/sherpa/
    init.ts                 ← NEW: side-effect config import
    index.ts                ← NEW: selective re-exports
```

**Config initialization chain:**

```
sherpa.config.ts
  → loadConfig(root) where root = SHERPA_PROJECT_ROOT ?? smart fallback
  → defineConfig() sets module-level _defaultContext
  → server components call getHubStats() etc. with no arguments

src/lib/sherpa/init.ts
  → import "../../sherpa.config"  (side-effect, triggers defineConfig)

src/lib/sherpa/index.ts
  → import "./init"
  → export { getHubStats, getConventions, getSkills, getInitiatives } from "@sherpa/studio-core"
```

**Path resolution (critical):** During `next build`, `process.cwd()` is the monorepo root when run via `pnpm build:web` from root. But during `next dev` from the app directory, it could be `apps/website/`. The Studio app handles this with:

```typescript
const cwd = process.cwd()
const root = process.env.SHERPA_PROJECT_ROOT
  ?? (fs.existsSync(path.join(cwd, "sherpa.json")) ? cwd : path.resolve(cwd, "../.."))
```

The website should use the same pattern.

**Server-only constraint:** All studio-core functions use `node:fs`. They can ONLY be called from server components. The framework page is already a server component — this is the integration point.

**Scope for this initiative:** Use `getHubStats()` on the framework page to display real aggregate data. `getConventions()` and `getSkills()` for actual lists are Session 4 stretch goals. Homepage stays hardcoded copy (the voice matters more than live data there).

### Data Flow

```
[Build time / Request time]
  → Server component imports from src/lib/sherpa/
  → Side-effect init triggers defineConfig()
  → getHubStats() reads filesystem (docs/, .claude/, agents/)
  → Returns HubStats object
  → Server component renders stats into HTML
  → Client receives static HTML (no hydration needed for stats)
```

No client-side state. No API calls. No loading states. Pure server rendering.

---

## UI Design

### Homepage: 4-Section Narrative Flow

```
v1 (consulting funnel)              v2 (portfolio/proof-of-methodology)
──────────────────────              ────────────────────────────────────
1. Hero (generic)                   1. Hero — The thesis
2. What We Do (paragraph)       ┐
3. Reality Check (stats)        ┘── 2. What We Built — The system
4. Trust (we use what we ship)  ──→ 3. The Proof — Self-governing
5. CTA (dual buttons)          ──→ 4. The Commitment — Values + CTA
```

### Section 1: Hero

**Component:** `hero-section.tsx` (modify in place)
**Animation:** Preserve existing `motion/react` staggered fadeUp. Three elements: h1, subtitle, CTAs.

```
H1 line 1: "Work as we know it is changing."
H1 line 2 (text-primary): "What we build next matters."

Subtitle: "We saw it coming — not as prophecy, but as pattern
recognition. So we built a governance framework for agentic
workflows and open-sourced it."

CTA 1 (outline): "See the framework" → /framework
CTA 2 (default): "Talk to us" → /contact
```

**Design notes:**
- H1 splits across two visual lines. First names the reality. Second (gold) names the response.
- Subtitle draws from Foundation Stone ("not as prophecy, but as pattern recognition") — voice artifact #16.
- "See the framework" replaces "Get Started" — respects private-repo reality (stress-test A8).
- "Talk to us" replaces "Talk to a Guide" — less performative (v2 design decision #4).
- Drop MessageCircle icon from "Talk to us" — just ArrowRight on both buttons.

**Competitor-swap test:**
- "Work as we know it is changing" — grounded in Rob's specific experience. PASS.
- "Not as prophecy, but as pattern recognition" — Foundation Stone language, only Sherpa. PASS.
- "Built a governance framework for agentic workflows" — specific to what Sherpa is. PASS.

### Section 2: What We Built

**Component:** `dual-value-section.tsx` (rename export to `WhatWeBuiltSection`)
**Animation:** ScrollReveal wrapper, same as v1.

```
Eyebrow (small, uppercase, muted): "The framework"

P1: "Sherpa Studio is a governance framework for agentic workflows.
Behavioral agent definitions. A skills engine. A dispatch pipeline
with nine backends. An initiative lifecycle that takes ideas from
proposal to integration with review at every step."

P2: "It lives in your codebase, versions with git, and works with
any AI development environment. The kind of infrastructure that
doesn't exist until someone builds it."

Link: "See the framework" → /framework
```

**Design notes:**
- Replaces BOTH the v1 "What We Do" paragraph AND the v1 stats section. `how-it-works-section.tsx` is deleted.
- The system capabilities are listed as sentence fragments (behavioral agent definitions, skills engine, dispatch pipeline, initiative lifecycle) — mechanism-level language, not marketing claims.
- "Nine backends" is a real number. "The kind of infrastructure that doesn't exist until someone builds it" is portfolio voice — it signals scope without bragging.
- For devs: technical substance. For hiring managers: "this person built all of this."
- Inline link follows v1 pattern (underline, text-foreground, hover:text-primary).

**Competitor-swap test:**
- "Behavioral agent definitions. A skills engine. A dispatch pipeline with nine backends." — Only Sherpa. PASS.
- "The kind of infrastructure that doesn't exist until someone builds it." — Portfolio voice. PASS.

### Section 3: The Proof

**Component:** `trust-section.tsx` (rename export to `ProofSection`)
**Animation:** ScrollReveal wrapper.

```
H2: "Built for our own work. Shared because it should be."

P1: "Sherpa governs its own development. The conventions, skills,
and initiative lifecycle aren't documentation — they're the
production system. When something ships, it goes through the same
governance pipeline we open-source."

P2: "That's the proof. Not a deck. Not a demo. The system running
on itself, in the open."
```

**Design notes:**
- This is the "we use what we ship" insight from v1, reframed as proof-of-methodology rather than trust signal.
- "Not a deck. Not a demo." names the enemy (AI transformation theater) without calling it out explicitly.
- No CTA link — this section makes a statement, not a pitch. The CTA section follows.
- The card treatment from v1 trust section is dropped. This section should be prose, same weight as section 2. No visual enclosure that separates it from the narrative flow.

**Competitor-swap test:**
- "Sherpa governs its own development." — Only Sherpa. PASS.
- "Not a deck. Not a demo. The system running on itself, in the open." — Only Sherpa. PASS.

### Section 4: The Commitment + CTA

**Component:** `cta-section.tsx` (modify in place)
**Animation:** ScrollReveal wrapper.

```
Blockquote (font-heading, border-l-2 border-primary, larger text):
"Create opportunity just as much as we automate it."

P1: "Almost every agentic system will change how many people a
team needs. We know that. We build governance that accounts for
people — not just efficiency."

P2: "The framework is open source. If you'd like a guide, we
consult too."

CTA 1 (outline): "See the framework" → /framework
CTA 2 (default): "Talk to us" → /contact
```

**Design notes:**
- Blockquote thesis uses `font-heading` (Fraunces) at a larger size with `border-l-2 border-primary pl-6`. Visually distinct from body copy — this is the page's closing conviction.
- "Create opportunity just as much as we automate it" is voice artifact #3.
- "If you'd like a guide, we consult too" — consulting is mentioned, not pushed. Discovered, not funneled.
- CTAs mirror the hero — same labels, same destinations. Intentional bookend.

**Competitor-swap test:**
- "Create opportunity just as much as we automate it." — Only Sherpa. PASS.
- "Governance that accounts for people — not just efficiency." — Could be generic, but the context makes it specific. PASS.
- "If you'd like a guide, we consult too." — Understated. PASS.

### Navigation

**Current:** Framework | Consulting | Work | Learn | About
**Updated:** Framework | Work | Learn | About

Consulting removed from primary nav. Stays as a discoverable page via footer.

### Header

- Brand wordmark stays "Sherpa" (not "Sherpa Studio")
- CTA button: "Talk to a Guide" → "Talk to us"

### Footer

Reorganized columns to reflect portfolio orientation:

```
Current:                          Updated:
Framework    Consulting  Company  Framework     Resources    Company
Overview     Services    About    Overview      Blog         About
Docs         Approach    Learn    Documentation Case Studies Consulting
GitHub       Case Stud.  Contact                             Contact
```

Tagline update: "Behavioral governance for agentic workflows." → "An open-source governance framework for agentic workflows."

Copyright: "Sherpa Consulting" → "Sherpa" (the product, not the consultancy).

### Metadata

```
Title:       "Sherpa — Governance Framework for Agentic Workflows"
Description: "An open-source governance framework for agentic workflows.
              Behavioral conventions, dispatch pipelines, and quality
              gates that live in your codebase."
```

### Framework Page (Session 2)

Rewrite as portfolio showcase with live data. Current page lists pillars and packages statically. Updated page:

1. **Opening** — "What Sherpa Studio provides" with portfolio voice
2. **Seven Pillars** — keep grid layout, update descriptions to be less feature-listy and more "here's what this gives you"
3. **Live Stats** — `getHubStats()` data: "N conventions, N skills, N agent roles, N initiatives tracked." Real numbers from the codebase proving the system is active
4. **Packages** — keep the package list with descriptions
5. **CTA** — "Talk to us" (not "Get Started")

### About Page (Session 3)

Reframe as practitioner/portfolio story:

1. **Opening** — "We built the tools that didn't exist" or similar. Name Rob as the builder.
2. **Origin story** — 13 years of engineering → Staff Engineer → watched AI do the job → built the framework. Personal, not corporate.
3. **The conviction** — Foundation Stone excerpt or paraphrase. Why governance matters.
4. **Remove "Guide, not guru" card** — contains the 91% stat (anti-pattern per research). Replace with something authentic.
5. **CTA** — "See the framework" + "Talk to us"

---

## Component Mapping

| v1 Component | v1 File | v2 Action |
|---|---|---|
| `HeroSection` | `hero-section.tsx` | **Modify** — new headline, subtitle, CTA labels |
| `WhatWeDoSection` | `dual-value-section.tsx` | **Modify + rename** → `WhatWeBuiltSection` — new copy, eyebrow, absorbs stats role |
| `RealitySection` | `how-it-works-section.tsx` | **Delete** — absorbed into WhatWeBuiltSection |
| `TrustSection` | `trust-section.tsx` | **Modify + rename** → `ProofSection` — new copy, no card treatment |
| `CtaSection` | `cta-section.tsx` | **Modify** — blockquote thesis, values merge, new copy |

---

## File Plan

### Session 1: Homepage + Chrome (8 modify, 1 delete)

| # | File | Change |
|---|------|--------|
| 1 | `apps/website/src/components/sections/hero-section.tsx` | New headline, subtitle, CTA labels |
| 2 | `apps/website/src/components/sections/dual-value-section.tsx` | Rename export → WhatWeBuiltSection, eyebrow + new copy |
| 3 | `apps/website/src/components/sections/trust-section.tsx` | Rename export → ProofSection, new copy, drop card treatment |
| 4 | `apps/website/src/components/sections/cta-section.tsx` | Blockquote thesis, values merge, new copy + CTA labels |
| 5 | `apps/website/src/app/(marketing)/page.tsx` | Update imports (renamed exports), remove RealitySection |
| 6 | `apps/website/src/config/navigation.ts` | Remove Consulting entry |
| 7 | `apps/website/src/components/site-header.tsx` | CTA: "Talk to a Guide" → "Talk to us" |
| 8 | `apps/website/src/components/site-footer.tsx` | Reorganize columns, update tagline and copyright |
| 9 | `apps/website/src/app/layout.tsx` | Update metadata title + description |
| D1 | `apps/website/src/components/sections/how-it-works-section.tsx` | **Delete** — stats section |

### Session 2: Framework Page + Studio-Core Integration (3 create, 3 modify)

| # | File | Change |
|---|------|--------|
| 10 | `apps/website/package.json` | Add `"@sherpa/studio-core": "workspace:*"` |
| 11 | `apps/website/sherpa.config.ts` | **Create** — loadConfig() with SHERPA_PROJECT_ROOT fallback |
| 12 | `apps/website/src/lib/sherpa/init.ts` | **Create** — side-effect config import |
| 13 | `apps/website/src/lib/sherpa/index.ts` | **Create** — selective re-exports (getHubStats, getConventions, getSkills) |
| 14 | `apps/website/next.config.ts` | Wrap with withSherpa() |
| 15 | `apps/website/src/app/(marketing)/framework/page.tsx` | Rewrite with portfolio voice + live stats from getHubStats() |

### Session 3: About + Voice Docs (3 modify)

| # | File | Change |
|---|------|--------|
| 16 | `apps/website/src/app/(marketing)/about/page.tsx` | Practitioner/portfolio framing, remove 91% stat |
| 17 | `docs/ux/voice-and-tone.md` | Add voice artifacts, competitor-swap test, Foundation Stone test |
| 18 | `docs/ux/messaging-framework.md` | Product/portfolio orientation |

### No changes

- `scroll-reveal.tsx` — animation wrapper, unchanged
- `globals.css` — warm palette, unchanged
- All consulting pages — stay as-is, just deprioritized
- `/work`, `/learn`, `/contact` pages — out of scope
- Blog content — out of scope

**Total: 12 modify, 3 create, 1 delete = 16 files across 3 sessions**

---

## Decisions

### 1. Portfolio framing, not product framing

**Decision:** The website is proof-of-methodology, not a product adoption funnel.

**Rationale:** The framework is private (no public repo, no npm). Product framing ("Get Started," "Install") creates expectations that can't be met. Portfolio framing ("See how it works," "The system running on itself") is honest and serves both audiences — devs see technical depth, hiring managers see engineering scope.

**Alternative rejected:** Full product-site framing with installation guides — rejected because the repo isn't public and the primary purpose is employment positioning.

### 2. "See the framework" replaces "Get Started"

**Decision:** All primary CTAs say "See the framework" linking to `/framework`.

**Rationale:** "Get Started" implies visitors can install/use the framework now. "See the framework" invites them to look at what exists. This matches the portfolio framing and the private-repo reality.

### 3. Consulting discovered, not pushed

**Decision:** Remove Consulting from primary nav. Mention in CTA section footer ("If you'd like a guide, we consult too") and keep in footer links.

**Rationale:** Employment search is the priority. The consulting pathway exists for people who want it, but the site's job is to demonstrate engineering capability, not generate consulting leads.

### 4. Live data as portfolio evidence (studio-core on framework page)

**Decision:** Use `getHubStats()` on the framework page to show real system stats. Homepage stays hardcoded voice-driven copy.

**Rationale:** The framework page is where proof lives. Live data (65 initiatives tracked, 21 skills, 9 rules) demonstrates the system is real and active. The homepage is about conviction and narrative — live data would undermine the voice there.

### 5. Drop the card treatment on Section 3

**Decision:** The proof section renders as prose, not in a bordered card.

**Rationale:** v1's trust section used a card (`rounded-xl border bg-card`) to visually separate it. But the narrative flow works better without enclosure — each section should flow into the next. The card returns on the framework page's "Built by practitioners" block where visual distinction is warranted.

### 6. Headline: "Work as we know it is changing"

**Decision:** Use Rob's updated phrasing — present tense, "changing" not "over."

**Rationale:** Direct founder input. Softer than "is over," more inclusive, less alarmist. Holds the tension ("awed AND concerned") better than a declarative endpoint. Present tense keeps it alive rather than past tense.

---

## Open Questions

1. **About page: include explicit engineering background?** The stress-test recommends it for portfolio positioning (13 years, Staff Engineer, PartySlate). But the voice brief doesn't mention credentials. Resolve during Session 3.
2. **Framework page: how much studio-core data?** Just hub stats (counts) or actual lists of conventions/skills? Hub stats is scoped; lists are stretch. Resolve during Session 2 based on what looks right.
3. **Footer: GitHub link target?** Currently links to `https://github.com/sherpa-consulting` (org page). Should it link elsewhere or be removed until the repo is public? Resolve during Session 1.
4. **"We" in "We built":** The stress-test flagged company "we" for a solo practitioner. The about page clarifies this, but homepage copy like "we built a governance framework" appears before the visitor reaches the about page. Monitor during implementation — if it reads false, adjust to "I built" or passive voice.
