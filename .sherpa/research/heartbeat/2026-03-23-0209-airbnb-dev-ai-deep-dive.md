---
title: "Airbnb Deep Dive — Staff Software Engineer, Dev AI, Developer Infrastructure"
date: 2026-03-23
category: heartbeat
trigger: >
  Active queue item. Daily scan rated 8/10. No prior deep dive. Posted 4 days
  ago — could close soon. Also found a parallel Senior SWE role on same team.
summary: >
  The Airbnb Dev AI team is a rare find: an internal AI infrastructure
  consultancy inside a large stable company, operating with startup agility,
  building agentic coding tools and async AI workflow platforms. Explicitly
  uses TypeScript + GraphQL. Staff comp at Airbnb is $350K–$550K+ total (base
  ~$200–250K). The honest challenge: Rob's background is frontend/product, not
  backend infra/platform. The role is genuinely platform-engineering flavored —
  but the AI tooling angle and Sherpa Studio (an internal developer workflow
  platform he built from scratch) are a credible bridge. Apply with a focused
  cover letter that leads with the Sherpa infrastructure angle.
rating: null
---

## Key Takeaway

This is a high-comp, high-visibility role at a stable company building exactly
what Rob has been building — agentic dev tooling and AI workflow infrastructure.
The mismatch is real (platform engineering vs. frontend/product), but Rob's
Sherpa Studio is a stronger credential here than almost anywhere else: he built
a developer-facing AI workflow platform from scratch, in production, that
actually works. The cover letter needs to lead with that, not with WavePoint.

---

## The Role: Staff Software Engineer, Dev AI, Developer Infrastructure

**URL:** https://careers.airbnb.com/positions/7729271/
**Posted:** ~4 days ago (March 19, 2026)
**Location:** US Remote Eligible (most states)
**Also open:** Senior SWE same team — https://careers.airbnb.com/positions/7729350/

### What the Dev AI Team Does

> "We serve as both a platform team and an internal AI consultancy for partner teams building their own internally-facing AI-powered solutions."

Their scope:
- **Agentic coding tools** — AI agents that help engineers write, review, and migrate code
- **Async AI workflow platforms** — long-running AI jobs, not just synchronous chat
- **SDKs for internal AI app development** — building blocks so other Airbnb teams can spin up their own AI tools
- **AI-assisted code migration** — large-scale automated refactoring

> "The tools you create will directly accelerate the pace of innovation across our entire product surface."

This is exactly the problem space Sherpa Studio addresses — governance, workflow infrastructure, and tooling that makes AI-assisted development reliable at scale.

### Requirements

- 9+ years industry experience ✅ (Rob has 13)
- Prior experience building developer infrastructure, tooling, or platforms ✅ (Sherpa Studio)
- Hands-on experience applying AI technologies to real-world software development ✅ (472 PRs via Claude Code)
- Track record of quickly ramping up in new domains ✅ (Swift from scratch in 11 weeks)
- TypeScript, Go, Python, or Kotlin — TypeScript ✅

### Culture Signals

- "Collaborative, low-ego, highly-visible team"
- "Startup-like agility" — iterating quickly on new AI technologies
- "High autonomy" — not a ticket-execution environment
- "Champion and consultant to empower teams across the company"

The last point maps well to how Rob thinks about Sherpa as a consulting practice. He's been the "internal AI consultancy" for his own products.

---

## Comp (Levels.fyi data, Staff = G9/G10 at Airbnb)

| Level | Total Comp (median) | Base approx |
|---|---|---|
| G7 (Senior) | $194K | ~$170–195K |
| G8 (Staff) | ~$350K | ~$200–240K |
| G9 (Staff II) | ~$475K | ~$220–260K |
| G10 (Staff III) | $637K | ~$240–280K |

**Rob's likely target level:** G8/G9 (Staff). Total comp $350K–$475K range including RSUs.

This is the highest total comp of any role in the current pipeline. Staff at Airbnb is meaningfully more than Ashby or Level.io in total comp, though Airbnb's RSUs are subject to vesting cliff and the equity value is less predictable than a growth-stage startup.

---

## Fit Analysis

| Requirement | Rob's Evidence | Strength |
|---|---|---|
| Developer infrastructure/tooling experience | Sherpa Studio: 91+ component workflow suite, MCP server, behavioral governance framework | ✅ Strong |
| Agentic coding tools | Built Claude Code harness that powered 472 PRs in 11 weeks | ✅ Strong |
| TypeScript proficiency | Primary language for 3+ years across WavePoint + Sherpa | ✅ Strong |
| 9+ years experience | 13 years, Staff-level at PartySlate | ✅ Strong |
| Cross-functional collaboration | 50+ user research sessions at Savo, product partnerships at PartySlate | ✅ Strong |
| Platform/infra at scale | ⚠️ Gap — Rob's infra is product-layer, not distributed backend systems | Needs framing |
| Go/Python | ❌ Not in Rob's current stack | Minor gap |

**The honest gap:** "developer infrastructure at scale" typically implies backend systems engineering — distributed systems, observability pipelines, CI/CD at Airbnb scale. Rob's infrastructure experience is at the product/tooling layer, not the distributed backend layer.

**How to frame it:** Rob built Sherpa Studio — a developer workflow platform that real agents ran on in production. He designed the MCP server with principled interface abstractions. He built the governance framework that made AI-assisted development reliable at scale. That's a different kind of "developer infrastructure" than backend systems, but it's the exact kind relevant to this role (which is about AI tooling, not backend infra per se).

---

## Cover Letter Draft

**Role:** Staff Software Engineer, Dev AI, Developer Infrastructure

---

Your Dev AI team builds the tooling that makes Airbnb engineers more effective. I spent the last 12 weeks building exactly that — for myself — and I want to bring it somewhere it can scale.

I'm the engineer behind Sherpa Studio: an agentic engineering workflow platform that powered 472+ PRs across a Next.js web app and 6 native Apple apps in 11 weeks, solo. The core of it is behavioral governance infrastructure for AI agents — designed to maintain architectural consistency, manage context across multi-day sessions, and ensure that AI-generated contributions stay coherent as the codebase grows. I built a purpose-designed MCP server with principled API abstractions and a 91-component TypeScript workflow suite on top of it.

That's the problem your team is solving at Airbnb scale: how do you make AI-assisted development reliable, not just fast, across a large engineering organization? I've been working that problem in production for 12 weeks.

Before founding, I spent 13 years in frontend infrastructure — including 6 at PartySlate where I went from first developer to Staff Engineer through Series B. I've lived through what happens when tooling decisions at the team level compound into organizational constraints, and I've learned to build systems that get better as they scale rather than harder to maintain.

I'm most proficient in TypeScript — I can contribute meaningfully to Go or Python in a pinch, and I ramp on new languages quickly (Swift from scratch, shipped 6 native apps in 11 weeks). Happy to dig into any aspect of the work during the interview process.

---

**Word count:** ~260. Leads with Sherpa Studio (the strongest credential for this specific role), bridges to the broader infrastructure/scale angle, addresses the language gap honestly.

---

## Application Notes

- **Apply:** https://careers.airbnb.com/positions/7729271/ (Staff) or /7729350/ (Senior)
- **Consider both levels:** The Senior role was posted 3 days ago (even fresher). Airbnb's leveling is non-transparent — applying to both or mentioning flexibility in the cover letter is an option. At 13 years + Staff-level work, Staff is defensible.
- **Timeline:** Posted 4 days ago. Airbnb moves slowly by default, but AI roles are filling faster in 2026. Apply this week.
- **Stack note:** Mention TypeScript fluency prominently. Don't lead with frontend — lead with infrastructure.
- **WA state check:** Rob is in Bellingham, WA. Verify Washington state is on Airbnb's approved remote list (most major states are).

---

## Sources

- Full job posting: https://careers.airbnb.com/positions/7729271/
- Senior parallel role: https://careers.airbnb.com/positions/7729350/
- Airbnb tech blog (AI tooling): https://airbnb.tech/blog/
- Airbnb comp (Levels.fyi): https://www.levels.fyi/companies/airbnb/salaries/software-engineer
- Automation Platform v2 (internal AI agents): https://medium.com/airbnb-engineering/automation-platform-v2-improving-conversational-ai-at-airbnb-d86c9386e0cb
- Daily scan: `.sherpa/research/target-companies/daily-scan-2026-03-22.md`
