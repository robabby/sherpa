---
status: approved
initiative: voice-and-tone
created: 2026-03-13T00:00:00.000Z
updated: '2026-03-14'
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

3. **Add messaging framework** — Formalize a three-layer messaging stack: (a) Dunford positioning (competitive alternatives, unique attributes, best-fit customers — already intuited in product-positioning.md), (b) Raskin strategic narrative (name the shift: AI-as-tool → agentic-AI-as-workforce; name the governance gap), (c) JTBD per-persona messaging. Use StoryBrand SB7 as homepage wireframe only, not as company messaging framework. Research shows pure StoryBrand fails for multi-buyer B2B with dual products.

4. **Refine word lists** — The Words We Avoid list is borrowed intuition. Validate and expand based on actual copy decisions made during website build.

5. **Add content templates** — Reusable structures for blog posts, case studies, service descriptions, and framework doc pages.

6. **Close Foundation Stone alignment gaps** — Two pillars are underrepresented in the current UX docs:
   - **Pillar III (Empowerment & Sovereignty)** — "We do not build dependence" and "leave people more capable" need to show up as a design principle and content guideline. The "Guide, Not Guru" principle partially covers this but doesn't address sovereignty, vendor lock-in language, or framing consulting as acceleration rather than dependency.
   - **Pillar V (Community & Mutual Uplift)** — "Show the Work" covers openness but not the community dimension — shared learning, how we talk about contributors, the framework's relationship to its users. Needs a dedicated content rule or principle expansion.

7. **Add structural sections** — Research (iteration 1) identified sections every mature style guide includes that Sherpa's docs are missing:
   - **Accessibility guidelines** (high priority — every mature guide has one)
   - **Inclusive language** (high priority — standard since ~2020)
   - **AI agent voice guidelines** (high priority — Sherpa's unique differentiator; how behavioral constraints map to voice constraints for agent-generated text)
   - **Component-level content patterns** for Studio (error messages, empty states, success messages — follow Atlassian model)
   - **Grammar & mechanics** (capitalization, numbers, dates, punctuation)
   - **Readability target** (Grade 8-10 for marketing, Grade 10-12 for docs — validate)

8. **Build content brief template** — Frontmatter-rich markdown that doubles as human planning document and structured prompt for AI content agents. Bridge between voice guidelines and the future blog content engine workforce. Integrates with task dispatch system.

## Rationale

Voice guidelines that aren't tested against real content become aspirational documents that no one reads. By creating the initial version now and maturing it as the website fills in, we get guidelines that reflect what actually works.

Research confirms Sherpa's "warm competence" voice occupies a genuinely empty lane in AI consulting — no competitor writes with calm warmth backed by framework credibility. The avoid-list is validated against 13 surveyed firms. The strongest differentiator is structural ("we use what we ship"), not tonal ("we're anti-hype"). Anti-hype positioning is becoming crowded (Slalom, Bosio, Agathon); Sherpa should lead with practice evidence instead.

## Dependencies

- `sherpa-website` — The website build will produce the content that stress-tests these guidelines

## Review Notes

- **Effort:** 2-3 sessions (expanded from 1 based on research scope)
  - Session 1: Personas file, messaging framework, structural sections (accessibility, inclusive language, grammar/mechanics)
  - Session 2: AI agent voice guidelines, component-level content patterns, content brief template
  - Session 3 (if needed): Validate all against website Sessions 2-3 content, refine word lists
- The existing docs are stronger than average — extend, don't rewrite
- The homepage rewrite ("warm competence over fear tactics") is the first data point for what our voice actually sounds like in practice
- Research iteration 1 complete — see `docs/initiatives/voice-and-tone/research/`
