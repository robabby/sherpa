---
status: archived
initiative: website-content-v2
created: 2026-03-21
updated: '2026-03-21'
type: roadmap-update
risk: evolutionary
targets:
  - apps/website/src/components/sections/hero-section.tsx
  - apps/website/src/components/sections/dual-value-section.tsx
  - apps/website/src/components/sections/how-it-works-section.tsx
  - apps/website/src/components/sections/trust-section.tsx
  - apps/website/src/components/sections/cta-section.tsx
  - apps/website/src/app/(marketing)/page.tsx
  - docs/ux/voice-and-tone.md
  - docs/ux/messaging-framework.md
dependencies: []
informs:
  - trails
personas:
  - engineer
  - product-manager
spawned-from: sherpa-website
---

# Website Content v2

## Summary

Reboot the sherpa.solar homepage copy and voice positioning from scratch. The v1 content follows the messaging framework correctly but reads as generic AI governance marketing — corporate, impersonal, interchangeable with any competitor. This initiative finds Rob's actual voice first, then rewrites homepage content grounded in that voice and in real experience.

## State Snapshot

**Homepage** (`apps/website/src/app/(marketing)/page.tsx`) renders five sections in order: HeroSection, WhatWeDoSection, RealitySection, TrustSection, CtaSection. All are standalone components in `apps/website/src/components/sections/`.

**Current copy problems:**
- Hero ("Ship AI workflows you can actually trust") — could be anyone's tagline. Generic governance pitch.
- WhatWeDoSection — one paragraph of framework description. Reads like a README, not a homepage.
- RealitySection — stats block (91% faking, 95% fail, 9% deployed) with "Here's what we're seeing." Content marketing filler that performs expertise rather than demonstrating it.
- TrustSection — "We use what we ship" is the strongest section but still thin. Two short paragraphs.
- CtaSection — "Use the framework on your own, or bring us in. Either way works." Adequate but flat.

**Voice guidelines** (`docs/ux/voice-and-tone.md`) define four axes: calm/not cold, knowledgeable/not academic, present/not precious, honest/not cynical. The guidelines themselves are solid — the problem is they were applied mechanically. The v1 copy passes the scorecard without having a soul.

**Messaging framework** (`docs/ux/messaging-framework.md`) has Dunford positioning, Raskin narrative, and per-persona JTBD messaging. Well-structured but the output reads like framework output — which is exactly what it is.

**Trails initiative** (`docs/initiatives/trails/proposal.md`, pending) identifies four real engagement patterns from Rob's consulting practice. These are candidates for the strongest website copy because they're grounded in experience, not positioning theory. This initiative informs Trails — the voice we find here shapes how trails get communicated.

## Proposed Changes

### Phase 1: Voice Discovery

Before writing any copy, find the voice. This is a collaborative exercise, not a writing task.

- Identify what makes Rob's perspective on AI governance distinct — not from the messaging framework, but from actual beliefs, frustrations, and experiences
- Test voice candidates against the "would a competitor say this?" filter — if yes, discard
- Look for the specific, the personal, the opinionated — things only Rob would say
- May produce updated voice-and-tone guidelines if the discovered voice diverges from the current doc's formulation

### Phase 2: Homepage Rewrite

With voice established, rewrite all five homepage sections:

- **Hero** — new headline and subhead that couldn't belong to anyone else
- **Value section** — may restructure, not just reword. Current single-paragraph format may not be the right vehicle
- **Reality/proof section** — replace stats-as-authority with something grounded in actual experience
- **Trust section** — expand or rethink. "We use what we ship" is a real insight but needs more weight
- **CTA** — align with new voice

The section structure itself (number of sections, their roles in the page flow) is open for change if the new voice demands it.

### Targets: Voice Guidelines

`docs/ux/voice-and-tone.md` and `docs/ux/messaging-framework.md` may be updated to reflect what we learn. The guidelines aren't wrong — they're just not specific enough to prevent generic output. They need sharper edges.

## Rationale

The v1 copy was built correctly — it followed the messaging framework, passed the content quality scorecard, avoided the words-we-avoid list. But "correct" and "good" are different things. The copy is interchangeable with any AI governance consultancy. It doesn't sound like a person, it sounds like a framework applied to a website.

The fix isn't better copywriting technique applied to the same inputs. It's finding what's actually distinctive about Rob's perspective and letting that drive the content. Voice first, then structure, then copy.

## Dependencies

None. The website infrastructure (Next.js app, routing, components, blog, SEO) from `sherpa-website` sessions 1-3 remains intact. This initiative replaces content, not architecture.

## Review Notes

**Scope boundaries:**
- IN: Homepage copy (all 5 sections), homepage section structure, voice-and-tone refinement, messaging-framework sharpening
- OUT: Blog content, framework docs page, consulting services page (unless voice shift demands it), infrastructure/routing/components, deployment
- MAYBE: About page, consulting approach page — if the voice discovery produces something that clearly demands changes there

**Key risk:** Voice discovery is inherently collaborative and iterative. Can't be fully planned in advance. Session 1 may take longer if finding the right voice requires multiple rounds.

**Effort:** 2-3 sessions
**Session breakdown:**
- Session 1: Voice discovery — collaborative conversation to find what's actually distinctive, test candidates, update voice guidelines
- Session 2: Homepage rewrite — new copy for all sections, potentially new section structure
- Session 3 (if needed): Refinement pass after sitting with it, extend to about/consulting pages
