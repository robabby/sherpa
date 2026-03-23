---
designed: 2026-03-21
type: ui
components-new: 0
components-modified: 5
files-planned: 9
---

# Website Content v2 — Design

## Overview

Rewrite the sherpa.solar homepage with founder voice. Replaces 5 generic sections with 4 weighted sections following a **narrative flow**: statement → reality → what we built → commitment + invitation.

Source artifacts:
- Voice brief: `docs/initiatives/website-content-v2/voice-brief.md`
- Research: `docs/initiatives/website-content-v2/research/iteration-1.md`
- Parent initiative: `docs/initiatives/sherpa-website/proposal.md`

---

## UI Design

### Page Flow: Narrative (4 sections, down from 5)

The v1 homepage follows the standard hero→features→proof→CTA template. The v2 homepage follows a **narrative flow** — each section builds on the previous, creating a story rather than a checklist.

```
v1 (template)                    v2 (narrative)
─────────────                    ──────────────
1. Hero                          1. Hero — The statement
2. What We Do (paragraph)    ┐
3. Reality (stats)           ┘── 2. The Shift — What's happening
4. Trust                     ┐
5. CTA                       ┘── 3. What We Built — Framework + loop
                                 4. The Commitment — Values + CTA
```

### Section 1: Hero

**Component:** `hero-section.tsx` (modify in place)

**Animation:** Preserve existing `motion/react` staggered fadeUp system. Three animated elements: h1, subtitle, CTAs.

**Copy:**

```
H1: "Work as we knew it is over."
H1 (continued, text-primary): "What we build next matters."

Subtitle: "We saw it coming — not as prophecy, but as pattern
recognition. So we built a governance framework for AI workflows
and started sharing it. Because the transition should be graceful,
not chaotic."

CTA 1 (outline): "Explore the framework" → /framework
CTA 2 (primary): "Talk to us" → /contact
```

**Design notes:**
- H1 splits across two lines — the break after "over." is intentional. First line names the reality ("work" not "job" — broader, more human, matches all-disciplines scope). Second line (in gold) names the response.
- Subtitle draws directly from Foundation Stone language ("not as prophecy, but as pattern recognition") and voice artifact #15 ("graceful").
- CTA labels: "Explore the framework" stays (it's specific). "Talk to a Guide" → "Talk to us" (less performative, matches "we" pronoun decision). Drop the MessageCircle icon — just ArrowRight on both.

### Section 2: The Shift

**Component:** `dual-value-section.tsx` (rename export to `ShiftSection`, keep file for git history)

**Animation:** ScrollReveal wrapper, same as v1.

**Structural change:** This single section replaces BOTH the v1 "What We Do" paragraph AND the v1 stats section. The stats file (`how-it-works-section.tsx`) will be deleted.

**Copy:**

```
Eyebrow (small, uppercase, muted): "What we're seeing"

Body (2 paragraphs, prose-style):

"Nobody has this figured out. We're all learning how to work
with AI — and most of us are doing it without structure,
without governance, without a plan for what happens to the
people whose work changes."

"We bring engineering discipline to that problem. Behavioral
governance, human-in-the-loop workflows, conventions that
travel with your code. The kind of structure that makes the
difference between a pilot that ships and one that doesn't."

Inline links:
- "Explore the framework" → /framework
- "See our approach" → /consulting/approach
```

**Design notes:**
- Two paragraphs do the work of two v1 sections. First paragraph names the reality (replaces stats). Second paragraph names the response (replaces "what we do").
- No stats. No borrowed authority. The credibility comes from the specificity of "behavioral governance, human-in-the-loop workflows, conventions that travel with your code" — these are things only someone who built them would name.
- "Nobody has this figured out" is the inclusive framing from voice artifact #4 and #13.
- Inline links match v1 pattern (underline, text-foreground, hover:text-primary).

### Section 3: What We Built

**Component:** `trust-section.tsx` (rename export to `BuiltSection`, keep file)

**Animation:** ScrollReveal wrapper.

**Copy:**

```
H2: "Built for our own work. Shared because it should be."

Body (2 paragraphs):

"Sherpa is an open-source governance framework for agentic
workflows. Behavioral agent definitions. Filesystem-based
conventions. Quality gates that run before anything ships. We
built it because we needed it — then open-sourced it because
you might too."

"Every consulting engagement runs on this framework. It gets
better because we use it daily. The consulting gets better
because we keep improving it. When we leave, the framework
stays — and so does the knowledge."

Link: "See the framework on GitHub" → (external, when public)
      or "Explore the framework" → /framework
```

**Design notes:**
- The "we use what we ship" insight from v1 is preserved but integrated into a narrative rather than stated as a claim.
- "When we leave, the framework stays — and so does the knowledge" is the named trade-off (won't build dependency).
- Keeps the warm card treatment from v1 trust section (rounded-xl border, bg-card) but expands content.

### Section 4: The Commitment + CTA

**Component:** `cta-section.tsx` (modify in place)

**Animation:** ScrollReveal wrapper.

**Structural change:** Merges v1 trust-section values with v1 CTA into one closing section.

**Copy:**

```
Blockquote or emphasized text:
"Create opportunity just as much as we automate it."

Body:

"Almost every agentic system will change how many people a
team needs. We know that. Our commitment is to build
governance that accounts for people — not just efficiency. We
would rather lose an engagement than win it with inflated
promises."

CTA row (same dual-button pattern):
CTA 1 (outline): "Explore the framework" → /framework
CTA 2 (primary): "Talk to us" → /contact
```

**Design notes:**
- The thesis statement ("Create opportunity just as much as we automate it") is styled as a pull quote or blockquote — visually distinct from body text. Use `font-heading` (Fraunces) at a larger size, or `border-l-2 border-primary pl-6` blockquote treatment.
- "We would rather lose an engagement than win it with inflated promises" is from Foundation Stone, verbatim. It's the strongest named trade-off.
- The CTA buttons mirror the hero — same labels, same destinations. This is intentional: the page opens and closes with the same invitation.

---

## Component Mapping

| v1 Component | v1 File | v2 Action |
|---|---|---|
| `HeroSection` | `hero-section.tsx` | **Modify** — new copy, same animation system |
| `WhatWeDoSection` | `dual-value-section.tsx` | **Modify + rename** → `ShiftSection` — new copy, absorbs stats section role |
| `RealitySection` | `how-it-works-section.tsx` | **Delete** — absorbed into ShiftSection |
| `TrustSection` | `trust-section.tsx` | **Modify + rename** → `BuiltSection` — new copy, new framing |
| `CtaSection` | `cta-section.tsx` | **Modify** — merge with values, new copy |

---

## File Plan

### Modify

| # | File | Change |
|---|------|--------|
| 1 | `apps/website/src/components/sections/hero-section.tsx` | New headline, subtitle, CTA labels |
| 2 | `apps/website/src/components/sections/dual-value-section.tsx` | Rename export, new copy, new structure |
| 3 | `apps/website/src/components/sections/trust-section.tsx` | Rename export, new copy |
| 4 | `apps/website/src/components/sections/cta-section.tsx` | Merge with values content, new copy |
| 5 | `apps/website/src/app/(marketing)/page.tsx` | Update imports, remove RealitySection, reorder |
| 6 | `apps/website/src/app/layout.tsx` | Update root metadata title + description |
| 7 | `apps/website/src/components/site-header.tsx` | CTA label: "Talk to a Guide" → "Talk to us" |
| 8 | `apps/website/src/components/site-footer.tsx` | Update tagline |

### Delete

| # | File | Reason |
|---|------|--------|
| 9 | `apps/website/src/components/sections/how-it-works-section.tsx` | Stats section absorbed into ShiftSection |

### No changes

- `scroll-reveal.tsx` — animation wrapper, unchanged
- `globals.css` — warm palette, unchanged
- `site-header.tsx` — navigation structure unchanged (only CTA label changes)
- All `/consulting`, `/framework`, `/work`, `/learn`, `/about`, `/contact` pages — out of scope

---

## Decisions

### 1. Four sections, not five

**Decision:** Collapse 5 sections to 4 by merging "what we do" + "stats" into one Shift section, and merging "trust" + "CTA" into one Commitment section.

**Rationale:** The research found that the most compelling anti-template sites have fewer sections with more weight per section. The stats section is an anti-pattern (V2 research). The trust section was thin (two paragraphs). Merging produces sections with enough substance to carry the narrative.

**Alternative rejected:** Keep 5 sections with new copy — rejected because the stats section has no equivalent in the new voice (nothing replaces borrowed-authority stats).

### 2. Delete the stats section entirely

**Decision:** Remove the 91%/95%/9% statistics block with no replacement.

**Rationale:** All four research vectors independently identified stats-as-authority as the defining feature of generic consulting copy. The voice brief explicitly fails the competitor-swap test on borrowed statistics. Practitioner credibility replaces statistical credibility.

**Alternative rejected:** Replace stats with "engagement stats" (number of trails walked, etc.) — rejected because Sherpa doesn't have these yet, and making them up would violate the honesty principle.

### 3. Preserve animation system exactly

**Decision:** Keep Motion fadeUp for hero, ScrollReveal for below-fold sections. No animation changes.

**Rationale:** The animation system is solid, performant, and handles reduced-motion correctly. Content changes don't require animation changes. The restrained animation (fade + slight translate) matches the "calm authority" register.

### 4. "Talk to us" replaces "Talk to a Guide"

**Decision:** Change the primary CTA label across hero, CTA section, and header.

**Rationale:** "Talk to a Guide" performs the sherpa metaphor rather than just being it. "Talk to us" is more direct, less self-conscious, and matches the "we" pronoun decision from the voice brief. The sherpa metaphor is better served by the website's tone and content than by explicit labeling.

### 5. Blockquote treatment for thesis statement

**Decision:** Style "Create opportunity just as much as we automate it" as a visually distinct pull quote in the final section.

**Rationale:** This sentence is the thesis — the single most important conviction. It needs visual weight to anchor the page's close. Blockquote treatment (border-l + font-heading or larger text) distinguishes it from body copy without introducing a new component.

---

## Open Questions

1. **About page alignment** — should the about page opening be updated in this initiative, or deferred? The voice brief suggests it should align, but the design scope is homepage-focused.
2. **Metadata description** — needs new copy. Current: "Behavioral governance for agentic workflows — and the guides who know how to use it." Needs to match new voice without the "guides" framing.
3. **Footer tagline** — current: "Behavioral governance for agentic workflows." Brief enough but may want to match new voice.
