---
title: >
  Sherpa Consulting Site Audit — Content Gaps and Recommendations
date: 2026-03-21
category: heartbeat
trigger: >
  Queue item #5 (last remaining from original queue). Priority #2. Claude Code may be updating this site now.
summary: >
  Audited all 8 pages of the Sherpa consulting website against best practices for solo AI consulting sites. The site's structure is solid (homepage, about, consulting, approach, work, framework, learn, contact) but the voice is "we" (should be "I"), the case study is anonymized (should name WavePoint), and the site lacks three critical trust signals solo consultants need — a visible founder bio with photo, client testimonials/social proof, and a clear "who this is for" statement. Specific fixes mapped to each page.
---

## Audit Scope

Reviewed all 8 marketing pages of the Sherpa consulting website (`apps/website/src/app/(marketing)/`):

1. Homepage (`page.tsx` + 5 section components)
2. About (`about/page.tsx`)
3. Consulting (`consulting/page.tsx`)
4. Approach (`consulting/approach/page.tsx`)
5. Work (`work/page.tsx`)
6. Framework (`framework/page.tsx`)
7. Learn (`learn/page.tsx`)
8. Contact (`contact/page.tsx`)

Cross-referenced against:
- Consulting website best practices research (Melisa Liberman, Colorlib, SoftService, Booknetic)
- Sherpa foundation stone values
- The narrative established in PRIORITIES.md

## Current State Summary

**What's strong:**
- Site structure is well-organized — logical page flow from hero → what we do → proof → framework → contact
- The "guide, not guru" positioning is good and authentic
- Foundation stone values come through in the consulting/approach pages
- The 3-step approach (Understand → Guide → Build) is clean and memorable
- The framework page is comprehensive — 7 pillars, packages, clear structure
- Stats section ("91% of C-suite execs admit faking AI knowledge") is effective

**What needs fixing:**

### Gap 1: Voice — "We" Should Be "I" (CRITICAL)

Every page uses "we/our/us." Rob is a solo founder. The "we" voice:
- Is dishonest (violates foundation stone pillar #1)
- Weakens the personal credibility that solo consulting depends on
- Creates an expectation of a team that doesn't exist

**Fix:** Global find-and-replace "we" → "I" throughout. This was already specified in the Claude Code prompt for the website update. Verify it was done.

### Gap 2: No Founder Bio or Photo (HIGH)

Research from consulting website experts:
> "For independent consultants, the About page needs YOUR face and YOUR story. Buyers hire people, not brands."

> "The About page is where people go after they already like your work. It's the place that turns a good candidate into someone they'd want to meet."

The current About page tells Sherpa's story but doesn't introduce Rob. No photo, no personal background, no human element.

**Fix:** Add a founder section to the About page with:
- Rob's photo
- Brief personal intro (13 years of engineering, where he's based, why he started Sherpa)
- Link to robabby.com for full background

### Gap 3: Case Study Is Anonymized (HIGH)

The Work page has one case study labeled "Consumer Technology Platform." This is WavePoint — Rob's own product. Anonymizing it:
- Removes the strongest proof point (it's his own methodology in production)
- Prevents cross-linking between surfaces
- Makes the site feel like it's hiding something

**Fix:** Name WavePoint explicitly. Frame it honestly: "This is my own product, built as both a real business and a proof-of-concept for the consulting methodology." That honesty IS the trust signal.

### Gap 4: No Testimonials or Social Proof (MEDIUM)

Best practice for consulting sites: "Client testimonials placed prominently on the homepage build trust before visitors even explore the services."

The site has zero testimonials, endorsements, or social proof. For a new consulting practice this is understandable, but the gap should be acknowledged.

**Fix (short-term):** Add a "Proof" section that references concrete metrics instead of testimonials:
- "472+ PRs shipped in 11 weeks on the Sherpa framework"
- "91+ UI components in Sherpa Studio"
- WavePoint as the showcase engagement

**Fix (medium-term):** As Rob gets consulting clients or strong LinkedIn recommendations, add them to the site.

### Gap 5: No Clear "Who This Is For" Statement (MEDIUM)

The homepage hero says "Ship AI workflows you can actually trust." Good. But nowhere on the site does it clearly say WHO the ideal client is. Consulting site best practices:

> "Clear messaging ensures visitors immediately understand who the site is for and why it matters."

**Fix:** Add a line to the homepage or consulting page: "I work with engineering teams adopting AI workflows who need governance before something goes wrong — not after." Or similar. Be specific about the buyer.

### Gap 6: "Learn" Page May Be Empty or Thin

The Learn page exists as a route but wasn't in the content we reviewed. If it's empty, it should either have content or be hidden from navigation until content exists.

### Gap 7: Framework Page Typo

"Directoturtle convention" should be "Directory convention" in the Governance Engine pillar description. (May have been fixed by Claude Code.)

## Page-by-Page Recommendations

| Page | Status | Key Action |
|---|---|---|
| Homepage | ⚠️ | Add "who this is for" statement. "I" voice. Add proof metrics. |
| About | ❌ | Add founder bio with photo. Tell Rob's personal story. "I" voice. |
| Consulting | ⚠️ | "I" voice. Add specificity to service descriptions from real experience. |
| Approach | ✅ | Good structure. "I" voice. Minor sharpening. |
| Work | ❌ | Name WavePoint. Remove anonymization. Add honest framing. |
| Framework | ✅ | Fix typo. "I" voice. Minor polish. |
| Learn | ❓ | Check if content exists. Hide if empty. |
| Contact | ✅ | "I" voice. Otherwise solid. |

## Priority Order for Fixes

1. **Voice ("we" → "I")** — Global, everything else depends on this
2. **Name WavePoint in case study** — Biggest credibility impact
3. **Add founder bio to About** — Buyers hire people
4. **Add "who this is for"** — Conversion impact
5. **Add proof metrics** — Replace missing testimonials
6. **Check Learn page** — Clean up empty routes

## What the Best Solo AI Consulting Sites Do

From the research:

1. **Lead with the person, not the brand** — The consultant IS the product. Photo, name, story front and center.
2. **Show one amazing case study, not many mediocre ones** — Depth over breadth. WavePoint is that case study.
3. **State who you DON'T serve** — "I work with teams that already have AI workflows running but need governance" excludes tire-kickers and signals expertise.
4. **Pricing signals** — Not necessarily exact prices, but "engagement types" (workshop: 2 days, embedded consulting: 1-3 months, governance implementation: scoped). The current services page does this reasonably well.
5. **One clear CTA per page** — The site mostly does this (Contact / Talk to a Guide). Good.

---

## Sources

1. Melisa Liberman — Consulting Website Examples & Design Tips for Solo Consultants: https://www.melisaliberman.com/blog/consulting-website-examples
2. Colorlib — 19 Best Consulting Websites 2026: https://colorlib.com/wp/consulting-websites/
3. SoftService — Best Consulting Websites Examples 2026: https://softservice.org/software-development/best-consulting-websites/
4. Booknetic — Best Websites for Independent Consultants 2026: https://www.booknetic.com/blog/best-websites-for-independent-consultants
5. Open Doors Careers — How Recruiters Look at Portfolios (About page insight): https://blog.opendoorscareers.com/p/how-recruiters-and-hiring-managers-actually-look-at-your-portfolio
6. Sherpa website source code audit (local filesystem)
