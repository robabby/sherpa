---
title: >
  Site Verification Notes — robabby.com Post-Update State
date: 2026-03-22
category: heartbeat
trigger: >
  Queue v3 items #15 and #16. Verifying what Claude Code shipped today and flagging decisions for Rob.
summary: >
  Verified robabby.com production state. Title tag is correct ("Rob Abby - Staff Engineer & Agentic Engineering Practitioner"). Meta description says "15+ years" (should be 13) and doesn't mention Sherpa/WavePoint/AI-native — needs update for SEO. The FeaturedWork section (WavePoint deep dive with SVG diagrams) was intentionally removed in PR #66 — Rob should decide if this was the right call since it was the strongest visual showcase on the site.
---

## Site Title — ✅ Correct

```
<title>Rob Abby - Staff Engineer & Agentic Engineering Practitioner</title>
```

Updated from "Rob Abby - Staff Frontend Engineer". Includes name (good for SEO/social sharing) and new positioning.

## Meta Description — ⚠️ Needs Update

Current:
> "Staff Engineer & Agentic Engineering Practitioner with 15+ years building exceptional web experiences for startups and enterprises. Expert in React, TypeScript, and design systems."

Issues:
1. **"15+ years"** — Rob has 13 years (2011-2024). The extra years may count from education or earlier work, but the resume says 2011.
2. **No mention of Sherpa, WavePoint, or Studio** — these are the current positioning pillars
3. **"design systems"** is buried — "AI-native development" or "agentic engineering" should be in the meta description for search visibility
4. **"building exceptional web experiences"** is generic — doesn't differentiate

Suggested:
> "Staff Engineer & Agentic Engineering Practitioner. Founder of Sherpa (AI consulting) and WavePoint (472+ PRs, 6 native apps, 11 weeks solo). React, TypeScript, Next.js, Swift. Available for opportunities."

## OpenGraph — ⚠️ Same Issues

OG title matches `<title>` (good). OG description has the same "15+ years" and generic framing issue.

## FeaturedWork Section — ❓ Decision Needed

PR #66 commit message explicitly states: "Removes FeaturedWork (WavePoint showcase) section and nav link."

**What was lost:**
- The 3-block WavePoint deep dive (What I Built / How I Built It / Why It Matters)
- Platform topology SVG diagram
- Agentic workflow SVG diagram
- Stats (82 API Routes, 37 Computation Modules, 6 Native Apple Apps, 2 Shared Packages)
- The "For Companies" / "For the Industry" framing

**Why it may have been removed:**
- The narrative shift to "Agentic Engineering Practitioner" may have deprioritized WavePoint as a standalone showcase
- The Experience section still covers WavePoint in detail
- Simplifying the page flow (Hero → About → Skills → Experience → Case Studies → Projects)

**Why it might want to come back:**
- It was the most visually impressive section (SVG architecture diagrams)
- Portfolio benchmarks research found that work previews with clear outcomes are what hiring managers scan for
- The "Why It Matters" block directly addressed hiring managers and industry relevance
- Losing it means the page goes from "show" to mostly "tell"

**Recommendation:** Ask Rob. This was likely an intentional decision in the narrative repositioning, but the visual showcase was uniquely strong.

## Current Page Flow

```
Header → Hero → StatsBar → About → Skills → Experience → CaseStudies → Projects → Footer
```

Previously:
```
Header → Hero → StatsBar → About → FeaturedWork → Skills → Experience → CaseStudies → Projects → Footer
```

---

## Sources

- robabby.com production: https://www.robabby.com
- PR #66: robabby/robabby#66 (agentic-engineering-narrative)
- Layout metadata: app/layout.tsx
- Portfolio benchmarks research: `.sherpa/research/heartbeat/2026-03-21-2056-portfolio-benchmarks.md`
