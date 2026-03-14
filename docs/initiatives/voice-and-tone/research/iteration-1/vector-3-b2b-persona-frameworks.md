# Vector 3: B2B Persona Frameworks for Dual-Audience Companies

**Question:** What are best practices for defining audience personas in technical B2B consulting with both a developer tool and consulting practice?
**Agent dispatched:** 2026-03-13

## Findings

### Persona Format Patterns

- **T2D3's Three-Persona Model** maps directly to Sherpa: P1 (End User/Practitioner), P2 (Manager/Technical Leader), P3 (Executive Sponsor/Honest Executive). Only need three — more leads to confusion.
- **GitLab's public handbook** separates **user personas** (Sasha the Software Developer) from **buyer personas** (Alex the App Dev Manager). Different fields for each type.
- **Recommended fields for B2B tech** (synthesized across PMA, ContentLift, TREW, Wynter): Profile, JTBD statement, Pain points, Goals/success criteria, Evaluation criteria, Buying role, Information sources, Objections, Content that resonates.
- **JTBD is the preferred lens** over demographics. "The most effective criteria for B2B buyer personas is jobs-to-be-done."
- **cliff-simpkins/dev-personas** (CC-BY-4.0): motivation-centric developer personas (Conductor, Craftsman, Explorer, Artist, Tactician).
- **DevRel Foundation** building structured persona library with JSON schema (DEVREL-PLS).

### Dual-Audience Strategies

- **GitLab**: Separate user and buyer persona documents with different fields.
- **ThoughtWorks Technology Radar**: Single artifact serving both audiences at different depths. Developers read blip assessments; executives read overarching narrative.
- **a16z "two funnels"**: Community strategy ≠ commercial strategy. Developers are community; executives are commercial target. Map the natural path between them.
- **Adam DuVander**: "Developer Marketing Does Not Exist" — developer content must lead with genuine utility, not marketing. Executive content can use traditional approaches. Segmentation is about tone and format, not branding.

### Common Mistakes

- Overemphasizing demographics over motivations
- Relying on job titles alone
- Ignoring the buyer journey
- Creating personas from assumptions, not data
- Using B2C persona models for B2B
- Skipping the "department persona" layer (VPs bridging users and buyers)
- Adding irrelevant demographic details
- Never updating personas (top teams update semi-annually)

### Key Recommendations for Sherpa

1. **Three personas is right.** Validated by T2D3, ClearDigital.
2. **Use JTBD format, not demographic bios.** Center on what job they're hiring Sherpa to do.
3. **Distinguish user from buyer personas.** Practitioner = user persona. Technical Leader and Honest Executive = buyer personas.
4. **Practitioner is community, not customer.** a16z makes this explicit. product-positioning.md already says this.
5. **Map the path between personas.** Practitioner → champion → Technical Leader → Sherpa Consulting. Honest Executive hears from Technical Leader.
6. **Mark v0.1 — validate against real content.**

### Recommended Format

```
## [Name] — [Archetype]
**Type:** User Persona | Buyer Persona
**Buying role:** Champion | Evaluator | Decision-maker | Independent user
**JTBD:** "When [situation], I want [capability] so I can [outcome]"
**Pain points:** [2-3 bullets]
**Evaluation criteria:** [What they look for]
**Objections:** [Why they might say no]
**Content that resonates:** [Formats, channels, depth]
**Relationship to other personas:** [How they connect]
```

## Sources

- [T2D3 Three Buyer Personas](https://www.t2d3.pro/learn/three-buyer-persona-examples-for-b2b-saas-template)
- [GitLab Product Personas](https://handbook.gitlab.com/handbook/product/personas/)
- [GitLab Buyer Personas](https://handbook.gitlab.com/handbook/marketing/brand-and-product-marketing/product-and-solution-marketing/roles-personas/buyer-persona/)
- [PMA B2B Buyer Persona Template](https://www.productmarketingalliance.com/b2b-buyer-persona-template-framework/)
- [ContentLift B2B Persona Template](https://www.contentlift.io/b2b-buyer-persona-template)
- [Markepear Developer Personas](https://www.markepear.dev/blog/developer-personas)
- [TREW Marketing B2B Personas](https://www.trewmarketing.com/blog/b2b-buyer-personas-for-technical-companies)
- [Wynter B2B Buyer Personas](https://wynter.com/post/b2b-buyer-personas)
- [cliff-simpkins/dev-personas GitHub](https://github.com/cliff-simpkins/dev-personas)
- [DevRel-Foundation/persona-library GitHub](https://github.com/DevRel-Foundation/persona-library)
- [a16z Open Source to Commercialization](https://a16z.com/open-source-from-community-to-commercialization/)
- [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar)
- [DemandWorks Technical Evaluators](https://www.dwmedia.com/blog/beyond-the-c-suite-how-to-influence-technical-evaluators-in-b2b-buying-committees/)
- [Product Management University Missing Link](https://productmanagementuniversity.com/user-personas-buyer-personas-and-the-missing-link-in-b2b/)
- [Britopian 4 B2B Tech Personas](https://www.britopian.com/business/b2b-tech-personas/)

## Raw Links

- https://www.t2d3.pro/learn/three-buyer-persona-examples-for-b2b-saas-template
- https://www.t2d3.pro/resources/personas-template
- https://handbook.gitlab.com/handbook/product/personas/
- https://handbook.gitlab.com/handbook/marketing/brand-and-product-marketing/product-and-solution-marketing/roles-personas/buyer-persona/
- https://handbook.gitlab.com/handbook/marketing/brand-and-product-marketing/product-and-solution-marketing/persona-snippets/
- https://handbook.gitlab.com/handbook/product/ux/persona-creation/
- https://www.productmarketingalliance.com/b2b-buyer-persona-template-framework/
- https://www.productmarketingalliance.com/persona-templates/
- https://www.contentlift.io/b2b-buyer-persona-template
- https://www.markepear.dev/blog/developer-personas
- https://www.trewmarketing.com/blog/b2b-buyer-personas-for-technical-companies
- https://wynter.com/post/b2b-buyer-personas
- https://business.linkedin.com/content/dam/me/business/en-us/amp/marketing-solutions/images/lms-b2b-resources-hub/pdfs/B2B-Buyer-Persona-Template.pdf
- https://www.hubspot.com/make-my-persona
- https://github.com/cliff-simpkins/dev-personas
- https://github.com/DevRel-Foundation/persona-library
- https://a16z.com/open-source-from-community-to-commercialization/
- https://a16z.com/podcast/a16z-podcast-selling-to-developers/
- https://a16z.com/growthsales-the-new-era-of-enterprise-go-to-market/
- https://www.thoughtworks.com/radar
- https://www.dwmedia.com/blog/beyond-the-c-suite-how-to-influence-technical-evaluators-in-b2b-buying-committees/
- https://everydeveloper.com/developer-marketing/book/
- https://nordicapis.com/book-review-developer-marketing-does-not-exist/
- https://medium.com/@emmaboulton/joining-the-dots-between-b2b-customer-segments-and-personas-59f128d1d60f
- https://productmanagementuniversity.com/user-personas-buyer-personas-and-the-missing-link-in-b2b/
- https://www.sugarcrm.com/blog/b2b-buyer-personas-mistakes-to-avoid/
- https://gotoclient.com/ca/blog/10-common-b2b-buyer-persona-mistakes-and-how-to-avoid-them/
- https://www.britopian.com/business/b2b-tech-personas/
- https://www.redhat.com/en/blog/crafting-open-source-product-strategy

## Implications

Sherpa's three-persona split is validated. JTBD format is the right approach over demographics. Critical insight: map the path between personas (Practitioner discovers → champions → Technical Leader evaluates → Honest Executive approves). Distinguish user personas (Practitioner) from buyer personas (the other two).

## Open Questions

1. Should Practitioner have sub-segments by motivation (governance-focused vs. agent-workflow-focused)?
2. Is "Honest Executive" name a risk if externalized (implies others are dishonest)?
3. Where does the Technical Leader who IS a Practitioner fit?
4. Does Sherpa need a "department persona" (VP of Engineering) bridge layer?
