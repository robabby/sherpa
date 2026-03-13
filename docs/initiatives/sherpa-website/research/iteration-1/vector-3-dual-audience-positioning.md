# Vector 3: Dual-Audience Positioning

**Question:** How should sherpa.solar position itself for two audiences simultaneously — developers/AI practitioners who might adopt the framework, and organizations that need AI adoption consulting?
**Agent dispatched:** 2026-03-13

## Findings

### Dual-Audience Website Patterns

- **Vercel uses "layered complexity" rather than audience separation.** Homepage serves a unified narrative with parallel CTA tracks: "Start Deploying" for devs, "Get a Demo" for enterprise. Metrics are dual-purpose: "Runway build times went from 7m to 40s" speaks to both engineers and CFOs. No separate "developer" vs "enterprise" sections — instead, an `/enterprise` subpage for deep enterprise justification. ([vercel.com](https://vercel.com), [vercel.com/enterprise](https://vercel.com/enterprise))
- **Stripe explicitly splits navigation by audience.** Products/Solutions/Pricing for business buyers; a dedicated "Developers" nav entry for the technical path. Hero messaging is business-outcome language, with developer docs as secondary paths. ([stripe.com](https://stripe.com))
- **Supabase leads developer-first, with enterprise as secondary.** "Build in a weekend, Scale to millions" is developer-centric. Enterprise signals (SOC2, HIPAA) appear further down. "You're never locked in" as open-source trust. ([supabase.com](https://supabase.com))
- **Datadog creates parallel navigation pathways.** Product section by technical domain (50+ features for devs); Solutions section by industry/use case (for executives). ([datadoghq.com](https://www.datadoghq.com/))
- **GitLab emphasizes community scale to de-risk enterprise.** "50+ million people already using GitLab" plus customer logos. ([about.gitlab.com](https://about.gitlab.com/))
- **NNG warns against audience-based navigation.** Five problems: ambiguous self-identification, unclear intent, added cognitive burden, information anxiety, content duplication. Recommendation: **task-based navigation, not audience-based.** ([nngroup.com](https://www.nngroup.com/articles/audience-based-navigation/))
- **Vercel enterprise page shifts from "what" to "why."** Developer site = features + speed. Enterprise page = ROI ("264% ROI"), cost savings ("90% time saved"), revenue impact. Same case studies, different framing. ([vercel.com/enterprise](https://vercel.com/enterprise))

### Tool-Maker + Service-Provider Positioning

- **Red Hat: "We make open source technologies for the enterprise."** One sentence bridging both identities. Developer audience gets free downloads, learning paths. Enterprise gets subscriptions, certifications, support tiers. ([redhat.com](https://www.redhat.com))
- **Elastic leads with tool-maker credibility, then layers services.** "The most widely deployed vector database" (authority), then Elastic Cloud trials + enterprise solutions. ([elastic.co](https://www.elastic.co))
- **MongoDB: "strategically ambiguous boundaries"** between free and paid. Community Edition and Atlas promoted equally. No "community is limited" messaging. Revenue path: Free Community → Atlas Free → Atlas Paid → Enterprise → Consulting. ([mongodb.com](https://www.mongodb.com))
- **dbt Labs leverages open-source momentum to de-risk enterprise.** "100,000+ data professionals" becomes a sales argument for dbt Cloud. ([getdbt.com](https://www.getdbt.com/))
- **Automattic: "We don't make software for free, we make it for freedom."** Commercial products positioned as built ON the open-source foundation, not alternatives. ([automattic.com](https://www.automattic.com))
- **WordPress.org keeps commercial messaging completely off the open-source property.** WordPress.com appears only as a footer link. About page is pure mission. ([wordpress.org/about](https://wordpress.org/about/))
- **ThoughtWorks positions consulting-first, tools second.** Open-source tools (GoCD, Gauge) get zero homepage prominence — thought leadership dominates. **Anti-pattern for Sherpa: when tools get buried, open-source contribution provides no positioning advantage.**
- **Ghost: "Open source, independent, funded 100% by its users."** No investors. Commercial offering feels like community support, not extraction. ([ghost.org](https://ghost.org))

### Messaging Frameworks

- **StoryBrand SB7 Framework:** (1) Character (customer, not you) (2) has a Problem (external + internal + philosophical) (3) and meets a Guide (empathy + authority) (4) who gives a Plan (3 steps) (5) and Calls to Action (6) to Avoid Failure (7) and End in Success. One-liner formula: "We help [character] who [problem] by [plan] so they can [success]." ([storybrand.com](https://storybrand.com))
- **April Dunford's positioning (Obviously Awesome):** 5 components — competitive alternatives, unique attributes, value enabled, target customers, market category. ([aprildunford.com](https://www.aprildunford.com/obviously-awesome))
- **Jobs-to-be-Done:** Customers "hire" products for a job. Developers hire the framework to "bring order to agent workflows." Organizations hire consulting to "get honest AI guidance without looking stupid." Complementary, not competing.
- **Patrick McKenzie:** Frame value in business terms. "The ability to give people the perception that you will create value." Communication > credentials. ([kalzumeus.com](https://kalzumeus.com/2011/10/28/dont-call-yourself-a-programmer/))

### Navigation Architecture Consensus

**DO NOT** split the homepage by audience. NNG research warns against it. **DO** use a shared hero with parallel CTAs. **DO** organize navigation by task/topic, not audience. **DO** create separate deep-dive pages for enterprise buyers. **DO** use dual-purpose metrics. **DO** keep developer docs prominent in main navigation.

### The "Guide Not Guru" Positioning

- **Palantir addresses approachability with "Day 1 Value" language.** "Get AI Into Operations" with results "in days, not years." Bootcamp-based onboarding acknowledges the gap while offering rapid hands-on training.
- **StoryBrand "Guide" requires empathy + authority.** Empathy: "We understand your struggle." Authority: "We've solved this before." "We've been where you are (empathy) and here's how we navigated it (authority)."
- **The 91% C-suite stat creates a powerful empathy signal.** Transforms the pitch from "we'll teach you AI" (guru) to "we know everyone's winging it, and we can help" (guide).
- **Accenture data**: 97% of executives say AI will transform their companies, but only 9% have fully deployed a use case. The gap between recognition and action is the guide's territory. ([accenture.com](https://www.accenture.com/us-en/insights/artificial-intelligence-summary-index))

### Open-Source + Consulting Coexistence

- **Proven playbook:** Open-source builds credibility, consulting monetizes complexity. Red Hat, Elastic, MongoDB, dbt, Automattic, Ghost.
- **Automattic's framing is the gold standard:** "We don't make software for free, we make it for freedom."
- **Anti-pattern: ThoughtWorks-style tool burial.** For Sherpa, the framework MUST be visible on the homepage.
- **MongoDB's "strategically ambiguous" approach:** Both Community and Atlas promoted equally. No "community is limited" messaging.
- **Key insight from consulting landscape research:** "Running agentic consulting validates the framework, and the framework makes the consulting more credible and more repeatable." This is the Red Hat playbook.

## Recommended Site Architecture

**Shared homepage with parallel conversion paths:**
- Hero: One compelling statement bridging both audiences
- Two CTA buttons: "Get Started" (framework docs/GitHub) and "Talk to a Guide" (consulting intake)
- Below fold: dual-purpose proof points

**Navigation organized by task, not audience:**
- **Framework** — What @sherpa/studio is, docs, GitHub, getting started
- **Consulting** — Services, approach, case studies, "Talk to a Guide"
- **Learn** — Blog, research, AI literacy resources
- **About** — The story, the team, "we built the tool we use"

## Recommended Messaging Architecture

### StoryBrand-aligned BrandScript

| Element | Developer Audience | Consulting Audience |
|---------|-------------------|---------------------|
| **Character** | Developer running AI agents | Organization adopting AI |
| **Problem** | Agent workflows are chaotic, ungoverned | AI adoption is overwhelming, everyone's faking it |
| **Guide (empathy)** | "We run agents too — we know the chaos" | "91% of executives admit faking AI knowledge" |
| **Guide (authority)** | "We built a governance framework to solve it" | "We built the tool we use with every client" |
| **Plan** | 1. Install. 2. Define agents. 3. Ship with governance. | 1. Talk to a guide. 2. Honest assessment. 3. Build capability. |
| **CTA** | "Get Started" (docs) | "Talk to a Guide" (intake) |
| **Avoid Failure** | Deloitte hallucinations, $47K runaway agents | 95% pilot failure, competitors outpace you |
| **Success** | Reliable, governed agent workflows | Confident AI adoption with quality guarantees |

**One-liner candidates:**
- "We help teams govern AI agent workflows so they can ship with confidence instead of chaos."
- "The behavioral governance framework for agentic workflows — and the guides who know how to use it."

### The "We Built the Tool We Use" Narrative

The single most powerful positioning asset. Resolves open-source/consulting tension:
- For developers: "This isn't theoretical — it's battle-tested in real consulting engagements."
- For organizations: "We don't just advise — we use our own framework on every engagement."
- For both: "The framework gets better because we use it. The consulting gets better because we improve the framework."

## Sources

- [vercel.com](https://vercel.com) — Layered complexity pattern
- [vercel.com/enterprise](https://vercel.com/enterprise) — ROI-first enterprise messaging
- [nextjs.org/showcase](https://nextjs.org/showcase) — Dual-purpose metrics
- [stripe.com](https://stripe.com) — Explicit dev/business nav split
- [supabase.com](https://supabase.com) — Developer-first with enterprise badges
- [datadoghq.com](https://www.datadoghq.com/) — Parallel pathways
- [about.gitlab.com](https://about.gitlab.com/) — Community scale as risk reduction
- [nngroup.com/articles/audience-based-navigation](https://www.nngroup.com/articles/audience-based-navigation/) — Research against audience-based nav
- [redhat.com](https://www.redhat.com) — Open-source + enterprise positioning
- [elastic.co](https://www.elastic.co) — Tool-maker credibility + services
- [mongodb.com](https://www.mongodb.com) — Strategically ambiguous boundaries
- [getdbt.com](https://www.getdbt.com/) — Open-source momentum
- [automattic.com](https://www.automattic.com) — "Software for freedom"
- [wordpress.org/about](https://wordpress.org/about/) — Mission-only open-source property
- [ghost.org](https://ghost.org) — Independent, user-funded
- [thoughtworks.com](https://www.thoughtworks.com/en-us) — Consulting-first anti-pattern
- [shopify.com/partners](https://www.shopify.com/partners) — Partner ecosystem framing
- [storybrand.com](https://storybrand.com) — SB7 Framework
- [aprildunford.com/obviously-awesome](https://www.aprildunford.com/obviously-awesome) — Positioning framework
- [kalzumeus.com](https://kalzumeus.com/2011/10/28/dont-call-yourself-a-programmer/) — Business value framing
- [accenture.com](https://www.accenture.com/us-en/insights/artificial-intelligence-summary-index) — AI adoption gap data

## Raw Links

- https://vercel.com
- https://vercel.com/enterprise
- https://nextjs.org/showcase
- https://stripe.com
- https://supabase.com
- https://www.datadoghq.com/
- https://about.gitlab.com/
- https://www.nngroup.com/articles/audience-based-navigation/
- https://www.redhat.com
- https://www.elastic.co
- https://www.mongodb.com
- https://www.getdbt.com/
- https://www.automattic.com
- https://wordpress.org/about/
- https://ghost.org
- https://www.thoughtworks.com/en-us
- https://www.shopify.com/partners
- https://storybrand.com
- https://storybrand.com/5-minute-marketing-makeover/
- https://www.aprildunford.com/obviously-awesome
- https://kalzumeus.com/2011/10/28/dont-call-yourself-a-programmer/
- https://www.accenture.com/us-en/insights/artificial-intelligence-summary-index
- https://evince.com.au/resources/articles/2025s-hard-lessons-and-2026s-reality-check/
- https://opensource.guide/finding-users/

## Implications

1. **Task-based nav, not audience-based.** Framework | Consulting | Learn | About — not "For Developers" / "For Enterprises."
2. **Shared hero with parallel CTAs.** One statement, two buttons, dual-purpose metrics below.
3. **"We built the tool we use" is the positioning nucleus.** Every page can reference this.
4. **Framework must be visible on homepage** (not ThoughtWorks-style burial).
5. **MongoDB's "strategically ambiguous" approach** to free vs paid — never apologize for open-source.
6. **"Guide not guru" language consistently.** Sherpa = guide. Never "AI experts."
7. **Outcome-based pricing on the website.** Frame around quality guarantees.

## Open Questions

1. How much mountain metaphor is too much? (Base Camp Assessment, Summit Plan, etc.)
2. Should the blog serve both audiences unified, or segment with tags?
3. When does the framework get its own domain/subdomain?
4. How to handle the transparency paradox on the website? "AI tools + human expert review" framing.
5. Should the 91% stat be the hero stat? Compelling but could feel like shaming.
