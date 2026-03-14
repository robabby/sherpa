# Vector 1: Voice & Tone Framework Patterns

**Question:** What do best-in-class voice & tone guidelines look like in 2025-2026? What structural patterns do mature guidelines use that Sherpa's current docs are missing?
**Agent dispatched:** 2026-03-13

## Findings

### Structural Anatomy of Mature Style Guides

The best-in-class guides share a consistent structure across Mailchimp, GOV.UK, Intuit, Shopify Polaris, Atlassian, Microsoft, Google, and Adobe Spectrum:

- **Foundations / Principles** — The "why" layer. Mailchimp calls this "Writing Goals and Principles," Intuit calls it "Basics of Good Content."
- **Voice (constant)** — 3-5 adjective pairs or behavioral descriptions. Microsoft uses "Warm and relaxed," "Crisp and clear," "Ready to lend a hand." Sherpa does this well already.
- **Tone (variable by context)** — Matrix showing how tone shifts. Intuit goes further with per-product voice pages (QuickBooks, TurboTax, etc.).
- **Grammar & Mechanics** — Capitalization, punctuation, abbreviations, numbers, dates. Every mature guide has this. **Sherpa missing.**
- **Word List / Vocabulary** — A-Z reference. GOV.UK's is canonical. Sherpa has use/avoid lists but not comprehensive A-Z.
- **Writing for Accessibility** — Dedicated section. Mailchimp, Intuit, Google all have this. **Sherpa missing.**
- **Inclusive Language** — Separate from accessibility. Atlassian, Intuit. **Sherpa missing.**
- **Writing for Translation** — Mailchimp dedicates a full chapter. **Sherpa missing.**
- **Channel-Specific Guidelines** — Per-channel writing rules. Mailchimp has email, social, blog, legal. **Sherpa partial.**
- **Component-Level Content Patterns** — Writing rules tied to UI components. Atlassian is gold standard (error messages, empty states, success messages). **Sherpa minimal.**
- **Readability Target** — GOV.UK targets reading age 9, Shopify Polaris Grade 7, Intuit Grade 5-8. **Sherpa missing.**
- **Legal Content Guidelines** — Plain language for terms, privacy policies. **Sherpa missing.**

### NNGroup Four Dimensions Framework

Four measurable dimensions of tone: Funny vs. Serious, Formal vs. Casual, Respectful vs. Irreverent, Enthusiastic vs. Matter-of-fact. Casual, conversational, moderately enthusiastic tones performed best. Sherpa's voice maps onto this but isn't explicitly plotted.

### Tone Matrices: Emotional Context

The most sophisticated guides map tone by user emotional state, not just channel. Matrix: scenario × user feeling → our tone. **Sherpa's tone table covers scenarios but not emotional state.**

### Intuit's Per-Product Voice Pages

Separate voice pages for each product showing how shared voice manifests differently. Maps to Sherpa's need: Studio app vs. consulting website vs. framework docs vs. blog.

### GOV.UK's Research-Backed Rigor

Every writing rule has cited research. Reading age 9 backed by data showing 80% prefer plain English. "No FAQs" rule backed by user research. **Sherpa has rationale for some rules but doesn't cite research.**

### AI Content Guidelines: Emerging Section

New category appearing in style guides (2025-2026): guidelines for AI-generated content — disclosure, review processes, voice consistency. EU AI Act Article 50 (Aug 2026) will require content marking. **Uniquely relevant to Sherpa as a behavioral governance framework.**

### Monzo's Guide as Demonstration

The guide itself demonstrates the voice. "Hold back from using multiple excellent jokes." The meta-lesson: make the guide itself enjoyable to read.

### Component-Level Content (Atlassian Model)

Per-message-type: Error messages (include reason, how to fix, what happens if not), Empty states (heading describes state, reason for emptiness, next steps), Success messages (celebrate, confirm, close the loop).

## Structural Gaps in Sherpa's Current Docs

| Section | Sherpa Status | Priority |
|---------|--------------|----------|
| Voice (constant) | Present, well-done | — |
| Tone (shifts by context) | Present | Extend with emotional-state dimension |
| Word lists | Present | Expand to A-Z over time |
| Design principles | Present, strong | — |
| **Accessibility guidelines** | **Missing** | **High** |
| **Inclusive language** | **Missing** | **High** |
| **AI agent voice guidelines** | **Missing** | **High — Sherpa's unique differentiator** |
| **Component-level content patterns** | **Minimal** | **High for Studio** |
| **Grammar & mechanics** | **Missing** | **Medium** |
| **Readability target** | **Missing** | **Medium** |
| **Tone matrix (emotional context)** | **Missing** | **Medium** |
| **Writing for translation** | **Missing** | **Low** |

## Sources

- [Mailchimp Content Style Guide](https://styleguide.mailchimp.com/) — Canonical content style guide, open-source CC
- [Mailchimp Writing Principles](https://styleguide.mailchimp.com/writing-principles/)
- [Mailchimp Voice and Tone](https://styleguide.mailchimp.com/voice-and-tone/)
- [Mailchimp Grammar and Mechanics](https://styleguide.mailchimp.com/grammar-and-mechanics/)
- [Mailchimp Writing for Accessibility](https://styleguide.mailchimp.com/writing-for-accessibility/)
- [Mailchimp Writing for Translation](https://styleguide.mailchimp.com/writing-for-translation/)
- [Mailchimp Writing Legal Content](https://styleguide.mailchimp.com/writing-legal-content/)
- [Mailchimp GitHub](https://github.com/mailchimp/content-style-guide)
- [GOV.UK Writing for GOV.UK](https://www.gov.uk/guidance/content-design/writing-for-gov-uk)
- [GOV.UK Style Guide A-Z](https://www.gov.uk/guidance/style-guide/a-to-z)
- [GOV.UK Content Types](https://www.gov.uk/guidance/content-design/content-types)
- [GOV.UK Pair Writing](https://gds.blog.gov.uk/2016/09/21/it-takes-2-how-we-use-pair-writing/)
- [Intuit Content Design System](https://contentdesign.intuit.com/)
- [Intuit Voice and Tone](https://contentdesign.intuit.com/voice-tone/)
- [Intuit Accessible Content](https://contentdesign.intuit.com/accessibility-and-inclusion/accessible-content/)
- [Intuit Inclusive Content](https://contentdesign.intuit.com/accessibility-and-inclusion/inclusive-content/)
- [Intuit A-Z Index](https://contentdesign.intuit.com/a-to-z-index/)
- [Intuit Writing about UI](https://contentdesign.intuit.com/product-and-ui/writing-about-ui/)
- [Shopify Polaris Voice and Tone](https://polaris.shopify.com/content/voice-and-tone)
- [Shopify Polaris Grammar](https://polaris.shopify.com/content/grammar-and-mechanics)
- [Atlassian Voice and Tone](https://atlassian.design/content/voice-and-tone-principles/)
- [Atlassian Writing Error Messages](https://atlassian.design/content/writing-guidelines/writing-error-messages/)
- [Atlassian Empty States](https://atlassian.design/content/writing-guidelines/empty-state/)
- [Microsoft Brand Voice](https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human)
- [Google Developer Docs Style Guide](https://developers.google.com/style)
- [Google Accessibility in Docs](https://developers.google.com/style/accessibility)
- [Adobe Spectrum Voice and Tone](https://spectrum.adobe.com/page/voice-and-tone/)
- [Monzo Tone of Voice](https://monzo.com/tone-of-voice)
- [NNGroup Tone Dimensions](https://www.nngroup.com/articles/tone-of-voice-dimensions/)
- [NNGroup Readability](https://www.nngroup.com/articles/legibility-readability-comprehension/)
- [Stripe Writing Culture](https://slab.com/blog/stripe-writing-culture/)
- [AI Brand Voice Guidelines](https://blog.oxfordcollegeofmarketing.com/2025/08/04/ai-brand-voice-guidelines-keep-your-content-on-brand-at-scale/)
- [AI Content Disclosure](https://kontent.ai/blog/emerging-best-practices-for-disclosing-ai-generated-content/)

## Raw Links

- https://styleguide.mailchimp.com/
- https://styleguide.mailchimp.com/writing-principles/
- https://styleguide.mailchimp.com/voice-and-tone/
- https://styleguide.mailchimp.com/grammar-and-mechanics/
- https://styleguide.mailchimp.com/writing-for-accessibility/
- https://styleguide.mailchimp.com/writing-for-translation/
- https://styleguide.mailchimp.com/writing-legal-content/
- https://styleguide.mailchimp.com/creating-structured-content/
- https://styleguide.mailchimp.com/web-elements/
- https://styleguide.mailchimp.com/tldr/
- https://github.com/mailchimp/content-style-guide
- https://www.gov.uk/guidance/content-design/writing-for-gov-uk
- https://www.gov.uk/guidance/style-guide/a-to-z
- https://www.gov.uk/guidance/style-guide
- https://www.gov.uk/guidance/content-design
- https://www.gov.uk/guidance/content-design/content-types
- https://design-system.service.gov.uk
- https://gds.blog.gov.uk/2016/09/21/it-takes-2-how-we-use-pair-writing/
- https://contentdesign.intuit.com/
- https://contentdesign.intuit.com/voice-tone/
- https://contentdesign.intuit.com/voice-tone/quickbooks/
- https://contentdesign.intuit.com/accessibility-and-inclusion/
- https://contentdesign.intuit.com/accessibility-and-inclusion/accessible-content/
- https://contentdesign.intuit.com/accessibility-and-inclusion/inclusive-content/
- https://contentdesign.intuit.com/a-to-z-index/
- https://contentdesign.intuit.com/product-and-ui/writing-about-ui/
- https://contentdesign.intuit.com/foundations/
- https://polaris.shopify.com/content/voice-and-tone
- https://polaris.shopify.com/content/grammar-and-mechanics
- https://atlassian.design/content/voice-and-tone-principles/
- https://atlassian.design/content/writing-guidelines/
- https://atlassian.design/content/writing-guidelines/writing-error-messages/
- https://atlassian.design/content/writing-guidelines/empty-state/
- https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human
- https://developers.google.com/style
- https://developers.google.com/style/tone
- https://developers.google.com/style/accessibility
- https://spectrum.adobe.com/page/voice-and-tone/
- https://vercel.com/design/guidelines
- https://monzo.com/tone-of-voice
- https://www.nngroup.com/articles/tone-of-voice-dimensions/
- https://www.nngroup.com/articles/legibility-readability-comprehension/
- https://slab.com/blog/stripe-writing-culture/
- https://www.mintlify.com/blog/stripe-docs
- https://blog.oxfordcollegeofmarketing.com/2025/08/04/ai-brand-voice-guidelines-keep-your-content-on-brand-at-scale/
- https://kontent.ai/blog/emerging-best-practices-for-disclosing-ai-generated-content/
- https://www.speechmatics.com/company/articles-and-news/your-essential-guide-to-voice-ai-compliance-in-todays-digital-landscape
- https://styleguides.io/
- https://www.writethedocs.org/guide/writing/style-guides/
- https://voiceandtoneguides.webflow.io/

## Implications

Sherpa's existing docs are stronger than average but missing structural sections that every mature guide includes. The highest-value additions are: accessibility, inclusive language, AI agent voice (unique differentiator), and component-level content patterns for Studio.

## Open Questions

1. Should Sherpa's voice guidelines govern agent output? Natural extension of behavioral engineering, but where should it live?
2. What readability level for Sherpa's audience? Grade 8-10 for marketing, 10-12 for docs?
3. Should the guide itself demonstrate the voice (Monzo model) or be purely utilitarian (GOV.UK model)?
4. Should Sherpa have per-context voice pages (Framework Voice, Consulting Voice)?
5. Is the A-Z word list needed now, or can the avoid-list approach grow organically?
