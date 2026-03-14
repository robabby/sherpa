# Iteration 1 — 2026-03-13

## Research Vectors

### Vector 1: Voice & Tone Framework Patterns
**Question:** What do best-in-class voice & tone guidelines look like in 2025-2026?
**Full report:** [iteration-1/vector-1-voice-tone-frameworks.md](iteration-1/vector-1-voice-tone-frameworks.md)

**Key discoveries:**
- Mature guides (Mailchimp, GOV.UK, Intuit, Atlassian) share a consistent 12-section structure
- Sherpa's docs cover ~7 of 12 sections well; missing accessibility, inclusive language, grammar/mechanics, readability target, component-level content patterns
- AI content guidelines are an emerging section no guide handles well yet — Sherpa's unique opportunity
- NNGroup's four tone dimensions (funny/serious, formal/casual, respectful/irreverent, enthusiastic/matter-of-fact) make voice measurable rather than interpretive
- Intuit's per-product voice pages model maps to Sherpa's need for per-context voice (Studio vs. consulting vs. docs vs. blog)

**Implications:**
- Highest-priority additions: accessibility, inclusive language, AI agent voice, component-level content patterns for Studio
- The guide should demonstrate the voice it describes (Monzo model)

### Vector 2: AI Consulting Language Landscape
**Question:** How do AI consulting firms actually sound? Where can Sherpa differentiate?
**Full report:** [iteration-1/vector-2-ai-consulting-language.md](iteration-1/vector-2-ai-consulting-language.md)

**Key discoveries:**
- Surveyed 13 firms across three tiers. Universal buzzwords: transform, at scale, unlock, end-to-end, drive impact, human-centered
- Anti-hype is becoming its own genre (Slalom at scale, Bosio in boutique, Agathon solo)
- Sherpa's "Calm, Not Cold" voice occupies a genuinely empty lane — nobody writes with calm warmth
- "We use what we ship" is the strongest differentiator; no other firm makes this claim
- Bosio Digital is closest competitor in tone; key difference is Sherpa avoids competitive positioning and has a framework

**Implications:**
- The avoid-list is validated against real competitor language
- Anti-hype alone isn't differentiation; "warm competence with framework evidence" is the lane
- Lead with "we use what we ship" as structural claim, not tonal claim

### Vector 3: B2B Persona Frameworks
**Question:** Best practices for personas in dual-audience technical consulting?
**Full report:** [iteration-1/vector-3-b2b-persona-frameworks.md](iteration-1/vector-3-b2b-persona-frameworks.md)

**Key discoveries:**
- Three personas validated by T2D3 model (End User, Manager, Executive). Don't add more.
- JTBD format over demographics is the consensus for B2B tech personas
- GitLab's public handbook separates user personas from buyer personas — different fields for each
- a16z "two funnels": community strategy ≠ commercial strategy. Practitioner is community, not customer.
- Critical: map the natural path between personas (Practitioner → champion → Technical Leader → Honest Executive)

**Implications:**
- Practitioner = user persona (community). Technical Leader + Honest Executive = buyer personas (commercial).
- JTBD statements should center each persona, not demographics
- v0.1 — validate against real website content and consulting conversations

### Vector 4: Messaging Frameworks for Technical Services
**Question:** StoryBrand vs. alternatives for dual-audience companies?
**Full report:** [iteration-1/vector-4-messaging-frameworks.md](iteration-1/vector-4-messaging-frameworks.md)

**Key discoveries:**
- StoryBrand works as homepage wireframe but fails as company messaging framework: single-hero assumption, cookie-cutter risk, doesn't handle dual product
- Dunford's "Obviously Awesome" positioning is purpose-built for B2B tech (300+ companies) and maps to what product-positioning.md already intuits
- Raskin's Strategic Narrative is the missing piece — Sherpa has a genuine "shift in the world" to name (AI-as-tool → agentic-AI-as-workforce)
- High-performing teams combine frameworks: JTBD for insight, Dunford for positioning, StoryBrand for homepage, Raskin for sales narrative
- Stripe (docs-as-marketing), Twilio ("Ask Your Developer"), HashiCorp (separate developer/executive pages) are the dual-audience models to study

**Implications:**
- Don't formalize pure StoryBrand. Use three-layer stack: Dunford positioning → Raskin strategic narrative → JTBD per-persona messaging
- The strategic narrative names the shift: "AI agents are becoming autonomous workers. Organizations that don't govern them will ship unreliable AI."
- product-positioning.md is closer to Dunford than StoryBrand already; formalize it

### Vector 5: Content Templates & Editorial Systems
**Question:** What reusable content structures maintain voice at scale?
**Full report:** [iteration-1/vector-5-content-templates-editorial.md](iteration-1/vector-5-content-templates-editorial.md)

**Key discoveries:**
- DigitalOcean's markdown templates with frontmatter are gold standard for technical content; match Sherpa's filesystem conventions
- Sherpa's existing case study format (Situation/Did/Happened/What Was Hard) is MORE distinctive than standard PSR — keep it
- PRESTO framework (Pain → Resonate → Educate → Simplify → Testify → Offer) maps cleanly to Sherpa's voice for service pages
- Search Roost's QA scorecard (Pass/Needs Work, 3+ fails blocks publish) maps to Planner/Worker/Judge pattern
- The content brief template is the highest-leverage missing abstraction: bridges voice guidelines to AI content engine

**Implications:**
- Preserve the distinctive case study format
- Build a content brief template as frontmatter-rich markdown (dual-use: human planning + AI agent prompt)
- Editorial QA scorecard could become a `.claude/rules/` convention file

## Synthesis

Three cross-cutting patterns emerge from all five vectors:

### 1. Sherpa's voice is genuinely differentiated — but anti-hype isn't enough

The competitive landscape survey (V2) confirms that "warm competence" occupies an empty lane. Every large firm is either bombastic or cold; boutique anti-hype firms are either aggressive (Agathon) or explicitly competitive (Bosio). Sherpa's "colleague who explains things clearly" voice has no direct competitor. But anti-hype positioning is becoming crowded — Slalom owns it at enterprise scale. The differentiation is structural ("we use what we ship"), not tonal ("we're not like those other firms"). The voice guidelines should encode this: lead with practice evidence, not with what we're against.

### 2. The messaging framework should be layered, not monolithic

The StoryBrand reference in the website proposal should be understood as a homepage wireframe, not a company messaging framework. Five sources independently point to the same conclusion: combine Dunford (positioning) + Raskin (strategic narrative) + JTBD (per-persona messaging). Sherpa has a genuine "shift in the world" to name — the governance gap in agentic AI — and product-positioning.md already intuits Dunford's five components without formalizing them. The strategic narrative is the highest-value missing piece.

### 3. The voice guidelines need structural sections, not a rewrite

Every mature style guide (V1) shares a 12-section structure. Sherpa covers 7 well. The gaps — accessibility, inclusive language, grammar/mechanics, readability target — are additive. The existing voice, tone, and content guidelines don't need rewriting; they need extending with the missing structural sections. The unique opportunity is the AI agent voice section: defining how behavioral constraints map to voice constraints for agent-generated text. No surveyed guide handles this well.

**The single most important insight:** Sherpa's "we use what we ship" claim is structurally unique in the consulting landscape and should be the loudest message — not the voice, not the anti-hype positioning, but the framework-backed credibility that no competitor can replicate.

## All Sources

### Voice & Tone Style Guides
- [Mailchimp Content Style Guide](https://styleguide.mailchimp.com/) — Canonical open-source style guide
- [GOV.UK Writing Guide](https://www.gov.uk/guidance/content-design/writing-for-gov-uk) — Research-backed writing rules
- [Intuit Content Design System](https://contentdesign.intuit.com/) — Per-product voice, most mature system
- [Atlassian Content Design](https://atlassian.design/content/voice-and-tone-principles/) — Gold standard component-level content
- [Shopify Polaris](https://polaris.shopify.com/content/voice-and-tone) — Commerce-focused voice guide
- [Microsoft Style Guide](https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human) — Three voice principles
- [Google Developer Docs](https://developers.google.com/style) — Technical writing reference
- [Adobe Spectrum](https://spectrum.adobe.com/page/voice-and-tone/) — Design system voice
- [Monzo Tone of Voice](https://monzo.com/tone-of-voice) — Guide-as-demonstration model

### AI Consulting Firms
- [Accenture](https://www.accenture.com/us-en) — "Reinvention" positioning
- [McKinsey/QuantumBlack](https://www.mckinsey.com/capabilities/quantumblack/how-we-help-clients) — "Hybrid Intelligence"
- [BCG X](https://www.bcg.com/x) — Aggressive-competitive
- [Deloitte AI](https://www.deloitte.com/global/en/what-we-do/capabilities/agentic-ai.html) — Buzzword-dense
- [Thoughtworks](https://www.thoughtworks.com) — Conversational outlier
- [Slalom "AI, hold the hype"](https://www.slalom.com/us/en/services/artificial-intelligence/ai-hold-the-hype) — Anti-hype at scale
- [Bosio Digital](https://bosio.digital/) — Closest tone competitor
- [Agathon AI](https://agathon.ai/) — Radical directness
- [LatticeFlow AI](https://latticeflow.ai/) — AI governance competitor

### Messaging Frameworks
- [April Dunford — Obviously Awesome](https://www.aprildunford.com/) — B2B tech positioning
- [Andy Raskin — Strategic Narrative](https://medium.com/the-mission/the-greatest-sales-deck-ive-ever-seen-4f4ef3391ba0) — Zuora case study
- [Wynter B2B Message Layers](https://wynter.com/post/b2b-message-layers-framework-wynter) — Clarity → Relevance → Value → Differentiation
- [JTBD + StoryBrand Integration](https://www.creativeo.co/post/jobs-to-be-done-storybrand-framework) — Hybrid approach

### Personas & Dual-Audience
- [GitLab Public Handbook](https://handbook.gitlab.com/handbook/product/personas/) — User vs. buyer persona separation
- [a16z Open Source Commercialization](https://a16z.com/open-source-from-community-to-commercialization/) — Community ≠ commercial strategy
- [T2D3 Three Personas](https://www.t2d3.pro/learn/three-buyer-persona-examples-for-b2b-saas-template) — End User / Manager / Exec model
- [ThoughtWorks Radar](https://www.thoughtworks.com/radar) — Single artifact, dual audience

### Content Templates & Editorial
- [DigitalOcean Writing Guidelines](https://www.digitalocean.com/community/tutorials/digitalocean-s-technical-writing-guidelines) — Gold standard markdown templates
- [Search Roost QA Scorecard](https://searchroost.com/blog/editorial-qa-scorecard-ai-writing) — Pass/Needs Work rubric
- [Everworker Editorial Playbook](https://everworker.ai/blog/editorial_playbook_ai_generated_content) — 7-stage AI+human workflow
- [Good Docs Project](https://www.thegooddocsproject.dev/template) — Tutorial/how-to/explanation/reference templates
- [PRESTO Framework](https://tortoiseandharesoftware.com/blog/the-presto-landing-page-copywriting-framework/) — Service page structure

### Research & Analysis
- [NNGroup Tone Dimensions](https://www.nngroup.com/articles/tone-of-voice-dimensions/) — Four measurable voice dimensions
- [NNGroup Readability](https://www.nngroup.com/articles/legibility-readability-comprehension/) — Grade-level targets
- [Stripe Writing Culture](https://slab.com/blog/stripe-writing-culture/) — Docs-as-culture model

## Proposals Generated

Updated `docs/initiatives/voice-and-tone/proposal.md` — refined scope based on research findings. Six original proposed changes validated; messaging framework recommendation changed from StoryBrand to layered hybrid.

## Open Questions for Next Iteration

1. **What should the AI agent voice guidelines contain?** How do behavioral constraints map to voice constraints? This is Sherpa's unique contribution — no existing guide handles it well. Needs its own research vector.

2. **Which readability level for which context?** GOV.UK targets Grade 4 (age 9), Intuit Grade 5-8, Shopify Grade 7. What's right for Sherpa's marketing vs. docs vs. blog? Needs testing against real content.

3. **How should the strategic narrative be structured?** Raskin's five elements applied to Sherpa's "agentic governance gap" shift. Should this live in docs/ux/ or become its own artifact in product-positioning.md?

4. **What does the content brief template look like?** Frontmatter schema, required fields, relationship to task dispatch system. The bridge between voice guidelines and AI content engine.

5. **How do the personas perform against real content?** The three archetypes need stress-testing against website Sessions 2-3 copy. Which persona is hardest to write for? Where do the guidelines help, go silent, or get it wrong?
