---
status: pending
initiative: voice-and-tone
created: 2026-03-13
updated: 2026-03-13
type: guideline-evolution
risk: additive
targets:
  - docs/ux/
dependencies: []
spawned-from: sherpa-website
---

# Voice & Tone Maturation

## Summary

Formalize and deepen Sherpa's voice, tone, and content guidelines. The initial `docs/ux/` files were ported from WavePoint's well-structured UX documentation and adapted for the AI governance/consulting domain. This initiative matures them into battle-tested guidelines validated against real website pages, blog content, and consulting materials.

## State Snapshot

- `docs/ux/` contains four adapted files: voice-and-tone.md, design-principles.md, content-guidelines.md, product-positioning.md
- These are reasonable starting points but haven't been tested against the full website build
- The homepage copy was rewritten once already (fear-based → warm competence) based on gut feel — the guidelines should codify what we learned
- Sessions 2-3 of the website initiative will produce consulting pages, framework docs, and blog content that will stress-test these guidelines
- No personas file yet — WavePoint's three personas (Mindful Creative, Quiet Seeker, Curious Explorer) need Sherpa equivalents

## Proposed Changes

### Target: `docs/ux/`

1. **Validate against real content** — As website Sessions 2-3 produce consulting, framework, and blog pages, test each against the guidelines. Note where the guidelines help, where they're silent, and where they're wrong.

2. **Add personas** — Define 2-3 Sherpa personas (likely: Technical Leader, Honest Executive, Practitioner — drafted in product-positioning.md but not yet a standalone personas file).

3. **Add messaging framework** — Codify the StoryBrand-aligned messaging from the website proposal (Character, Problem, Guide, Plan, Success) into a reusable reference.

4. **Refine word lists** — The Words We Avoid list is borrowed intuition. Validate and expand based on actual copy decisions made during website build.

5. **Add content templates** — Reusable structures for blog posts, case studies, service descriptions, and framework doc pages.

6. **Close Foundation Stone alignment gaps** — Two pillars are underrepresented in the current UX docs:
   - **Pillar III (Empowerment & Sovereignty)** — "We do not build dependence" and "leave people more capable" need to show up as a design principle and content guideline. The "Guide, Not Guru" principle partially covers this but doesn't address sovereignty, vendor lock-in language, or framing consulting as acceleration rather than dependency.
   - **Pillar V (Community & Mutual Uplift)** — "Show the Work" covers openness but not the community dimension — shared learning, how we talk about contributors, the framework's relationship to its users. Needs a dedicated content rule or principle expansion.

## Rationale

Voice guidelines that aren't tested against real content become aspirational documents that no one reads. By creating the initial version now and maturing it as the website fills in, we get guidelines that reflect what actually works.

## Dependencies

- `sherpa-website` — The website build will produce the content that stress-tests these guidelines

## Review Notes

- **Effort:** 1 session, run after website Sessions 2-3 complete
- This is deliberately lightweight — validate and extend, not rewrite from scratch
- The homepage rewrite ("warm competence over fear tactics") is the first data point for what our voice actually sounds like in practice
