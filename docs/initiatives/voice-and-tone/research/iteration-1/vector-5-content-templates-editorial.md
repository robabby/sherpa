# Vector 5: Content Templates & Editorial Systems

**Question:** What reusable content structures and editorial systems do small consulting/dev-tool companies use to maintain consistent voice at scale?
**Agent dispatched:** 2026-03-13

## Findings

### Blog Post Templates

- **DigitalOcean** is gold standard: H1 title, H3 intro, H2 prerequisites, H2 numbered steps (gerunds: "Step 1 — Installing Nginx"), H2 conclusion. Three types: conceptual, procedural, tutorial.
- **DevRel Bridge structure**: Introduction (grab attention), Background (why/what), Main Content (subsections with working code), Conclusion (takeaways + CTA).
- **Five proven archetypes**: how-to, listicle, ultimate guide, comparison, Q&A.
- **"Answer-first" pattern** (Everworker): First 30-50 words of each major section = complete answer. Optimized for human skimming and AI extraction.
- **freeCodeCamp/Sashko Stubailo**: Start from the problem, not the solution. Show working code, discuss trade-offs.

### Case Study Formats

- **Dominant structure: Problem-Solution-Result (PSR)** — Client Profile, Challenge, Solution, Results (metrics), CTA.
- **Consulting Success template**: Introduction (client/industry), Problem (specific detail), Process (step-by-step), Results (measurable), CTA.
- **Isoline adds "Blind Spots"** — what gap did you close? What new opportunities? Plus timeline-based narrative.
- **Sherpa's existing four-section format** (Situation, What We Did, What Happened, What Was Hard) is **more distinctive than PSR** and aligns with honesty principle. Preserve it. Optionally add Isoline's "Blind Spots" as fifth section.

### Service Page Structures

- **PRESTO framework**: Pain → Resonate → Educate → Simplify → Testify → Offer. Maps cleanly to Sherpa's voice.
- **Rattleback Problem-Solution-Benefits**: Write from client's POV. "You have X problem, we have Y solution, Z benefits." Include case study, testimonial, CTA.
- **Knapsack Creative**: 1,000-1,500 words per service page. Headline specifies what/who/outcome. Frame outcomes as concrete numbers.
- **PAS (Problem-Agitate-Solution)**: Simpler alternative for shorter service descriptions.

### Editorial Systems for AI-Assisted Production

- **Search Roost Editorial QA Scorecard**: Pass/Needs Work rubric. Key criteria: factual claims sourced, clear H2/H3 structure, "what we know" vs "analysis" separated. If 3+ items fail, don't publish. Designed as "PR review checklist if content shipped through code."
- **Everworker 7-stage workflow**: Editorial intake → AI draft → human edit → compliance review → SEO QA → publish → monitor → optimize. Quality gate blocks publishing on failure.
- **Averi Content Framework**: 5-step pipeline (strategy → idea queue → AI drafts → CMS → analytics). Three-person team + AI workflows = 5-8x output.
- **Brand voice requirements for AI content**: Approved vocabulary, banned phrases, tone dimensions on scales, audience assumptions. Sherpa already has most of these.
- **The 80/20 consensus**: AI handles 80% (research, outlining, formatting). Humans handle 20% (original data, proprietary stories, ethical oversight).

### The Content Brief as Missing Abstraction

The single most impactful artifact: a **content brief template** — frontmatter-rich markdown that functions as both human planning document and structured prompt for AI content agents. Bridge between voice/tone guidelines and the future content engine workforce.

## Sources

- [DigitalOcean Technical Writing Guidelines](https://www.digitalocean.com/community/tutorials/digitalocean-s-technical-writing-guidelines)
- [DevRel Bridge Blog Structure](https://devrelbridge.com/blog/developer-friendly-blog-post-structure)
- [Everworker Editorial Playbook](https://everworker.ai/blog/editorial_playbook_ai_generated_content)
- [Search Roost QA Scorecard](https://searchroost.com/blog/editorial-qa-scorecard-ai-writing)
- [Averi AI Content Framework](https://www.averi.ai/breakdowns/mastering-ai-content-creation-a-step-by-step-framework-for-high-quality-output-at-scale)
- [Consulting Success Case Study Template](https://www.consultingsuccess.com/how-to-write-a-consulting-case-study)
- [Isoline B2B Case Study Template](https://www.isolinecomms.com/content/b2b-case-study-template/)
- [Rattleback Service Page Layout](https://www.rattleback.com/insights/articles/service-page-layout-best-practices/)
- [Knapsack Consulting Service Pages](https://knapsackcreative.com/blog-industry/consulting-service-page-design)
- [PRESTO Framework](https://tortoiseandharesoftware.com/blog/the-presto-landing-page-copywriting-framework/)
- [Good Docs Project Templates](https://www.thegooddocsproject.dev/template)
- [Mailchimp Style Guide](https://styleguide.mailchimp.com/)
- [Google Developer Docs Style Guide](https://developers.google.com/style)

## Raw Links

- https://www.digitalocean.com/community/tutorials/digitalocean-s-technical-writing-guidelines
- https://www.digitalocean.com/community/tutorials/how-to-write-an-article-for-the-digitalocean-community
- https://devrelbridge.com/blog/developer-friendly-blog-post-structure
- https://www.freecodecamp.org/news/how-to-write-a-great-technical-blog-post-414c414b67f6/
- https://seoboost.com/blog/blog-post-templates/
- https://inblog.ai/blog/blog-post-templates
- https://www.semrush.com/blog/blog-post-templates/
- https://everworker.ai/blog/editorial_playbook_ai_generated_content
- https://searchroost.com/blog/editorial-qa-scorecard-ai-writing
- https://www.averi.ai/breakdowns/mastering-ai-content-creation-a-step-by-step-framework-for-high-quality-output-at-scale
- https://www.averi.ai/guides/2026-state-content-workflows
- https://resources.averi.ai/for/for-content-teams
- https://www.consultingsuccess.com/how-to-write-a-consulting-case-study
- https://www.isolinecomms.com/content/b2b-case-study-template/
- https://ligermarketing.com/writing-a-b2b-case-study-a-template-and-best-practices/
- https://www.thelogonaut.com/post/b2b-case-study-template-10-examples-2025-best-practices
- https://edifycontent.com/blog/b2b-case-studies-that-drive-revenue
- https://www.smartsheet.com/content/case-study-templates
- https://www.rattleback.com/insights/articles/service-page-layout-best-practices/
- https://www.rattleback.com/insights/articles/service-overview-page-for-professional-services/
- https://knapsackcreative.com/blog-industry/consulting-service-page-design
- https://tortoiseandharesoftware.com/blog/the-presto-landing-page-copywriting-framework/
- https://storybrand.com
- https://www.gravityglobal.com/blog/complete-guide-storybrand-framework
- https://www.atomwriter.com/blog/brand-voice-checklist-ai-content/
- https://www.airops.com/blog/maintain-brand-voice-ai-content
- https://www.thegooddocsproject.dev/template
- https://github.com/thegooddocsproject/templates
- https://frontmatter.codes/
- https://www.jasper.ai/blog/content-brief
- https://serpstat.com/blog/content-briefs-with-ai-template-and-examples/
- https://www.clickrank.ai/ai-driven-content-workflow/
- https://firstmovers.ai/ai-content-marketing-survival-guide/
- https://styleguide.mailchimp.com/
- https://developers.google.com/style
- https://stripe.com/guides/atlas/landing-page-copy

## Implications

Sherpa's existing case study format is a differentiator — keep it. The content brief template is the highest-leverage artifact to build: bridges voice guidelines to the AI content engine. The Search Roost scorecard maps naturally to Sherpa's Planner/Worker/Judge pattern. DigitalOcean's markdown templates with frontmatter match Sherpa's existing filesystem conventions perfectly.

## Open Questions

1. Should templates live as markdown in docs/templates/ or as code in @sherpa/studio-core?
2. How will "What Was Hard" section work with anonymous clients?
3. Should content briefs encode persona as a required field?
4. What's the quality gate threshold for AI-generated vs. human-written content?
5. Should the editorial QA scorecard be a .claude/rules/ convention file?
