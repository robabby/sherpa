---
started: 2026-03-13
worktree: null
---

# Voice & Tone — Activity Log

## 2026-03-13 — Iteration 1: Landscape survey

- Dispatched 5 parallel research vectors: voice/tone frameworks, AI consulting language, B2B personas, messaging frameworks, content templates
- Surveyed 13 AI consulting firms, 10+ style guides (Mailchimp, GOV.UK, Intuit, Atlassian, etc.), messaging frameworks (StoryBrand, Obviously Awesome, Strategic Narrative, JTBD, Category Design)
- Key finding: Sherpa's "warm competence" voice occupies an empty lane — anti-hype is getting crowded but calm warmth with framework-backed credibility is unclaimed
- Key recommendation: Don't formalize pure StoryBrand; use layered hybrid (Dunford positioning + Raskin strategic narrative + JTBD-informed per-persona messaging)
- Identified 12 structural gaps in current docs (accessibility, inclusive language, AI agent voice, component-level content patterns, grammar/mechanics, readability target, etc.)
- Updated proposal with refined scope

## 2026-03-14 — Design + Implementation (Sessions 1-2)

**Design:**
- Produced design.md — architecture-only, no UI changes needed
- 14 files planned across 2 sessions, three governance layers (guidelines, templates, convention rules)

**Session 1 — Guidelines + Personas + Messaging:**
- Created personas.md (3 JTBD-centered personas: Practitioner, Technical Leader, Honest Executive)
- Created messaging-framework.md (Dunford positioning + Raskin strategic narrative + JTBD per-persona)
- Created accessibility-and-inclusion.md (accessible content + inclusive language)
- Created grammar-and-mechanics.md (capitalization, numbers, dates, punctuation, lists)
- Extended voice-and-tone.md (emotional-context tone matrix, NNGroup dimensions, readability targets)
- Extended content-guidelines.md (readability section, updated checklist)
- Annotated product-positioning.md (Dunford five-component labels)

**Session 2 — Agent Voice + Templates + Convention:**
- Created agent-voice.md (behavioral constraints → voice constraints, AI content disclosure)
- Created component-content.md (Studio UI content patterns for 8 component types)
- Created docs/templates/ with content-brief.md, blog-post.md, case-study.md
- Created .claude/rules/content-quality.md (editorial QA scorecard, 8 criteria)
- Updated marketer, technical-writer, designer role context-packages
- Added "templates" to DOC_CATEGORIES in studio-core

## 2026-03-14 — Session 3: Validation against website content

Validated all guidelines against 8 website pages + 4 homepage sections (hero, dual-value, trust, CTA).

**Where guidelines helped (strong alignment):**
- Avoid-list: 100% clean across all website copy
- Headline Test: All headlines pass
- Voice attributes: Consistent across every page
- Tone shifts by context: Correct per tone matrix
- Persona alignment: Clear framework→Practitioner, consulting→buyer mapping
- "We use what we ship" correctly positioned as loudest structural claim (appears 3x)

**Where guidelines went silent (gaps filled):**
- CTA button copy patterns ("Talk to a Guide") — noted, not critical
- Meta description conventions — added to grammar-and-mechanics.md
- "Guide" capitalization as brand metaphor — added to grammar-and-mechanics.md

**Where guidelines and website disagreed (resolved):**
- Case study format: website uses Context/Challenge/What We Did/Results but template specifies the distinctive "What Was Hard" section. Resolved: web summary cards can abbreviate; long-form case studies must include "What Was Hard."

**Status:** Initiative complete. Guidelines validated against real content, minor refinements applied.
