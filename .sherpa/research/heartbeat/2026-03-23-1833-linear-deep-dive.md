# Linear Deep Dive
**Research Date:** 2026-03-23 18:33 UTC  
**Type:** Heartbeat Research — Company + Role Deep Dive  
**Target:** Linear (linear.app) — Senior/Staff Product Engineer + Senior/Staff Fullstack Engineer

---

## Company Snapshot

- **Founded:** 2019 by Karri Saarinen (CEO), Tuomas Artman, Jori Lallo
- **Product:** Issue tracking + project management. "The issue tracker you'll enjoy using."
- **Status:** Series C, $1.3B valuation (2025), $100M ARR, ~178 employees (as of 2025 reports)
- **Customers:** 25,000+ companies including OpenAI, Coinbase, Ramp
- **Remote-first:** Distributed across North America and Europe
- **Culture keyword:** Craftsmanship. This word appears in every job listing, their README, their culture docs. It is load-bearing.

### Why Linear is strategically important for Rob

Linear is building what Rob has already built — a **product development system for teams and agents**. Their own words from the JD: *"We're building the product development system for teams and agents. AI is fundamentally changing how software gets built, and we're shaping the tools this new era requires."*

Rob built Sherpa Studio because he needed exactly this tool and it didn't exist. That's not a coincidence — it's a credibility signal. He isn't applying to Linear because it sounds good. He's a power user who built a competing primitive out of necessity.

---

## Open Roles (Confirmed Live, March 23 2026)

### 1. Senior / Staff Product Engineer
**URL:** https://linear.app/careers/069c4628-88d7-4e4d-b393-c996fc7f3076  
**Type:** Full-time, Europe or North America (remote-eligible)

**What they're looking for:**
- React + TypeScript specialist
- Can implement complex UI components — drag & drop, virtualized lists, real-time collaborative editing
- Works close to product and founders; fast iteration on feature concepts
- Performance profiling experience
- Comfortable owning problems end-to-end

**Tech stack:**
- React, MobX, styled-components (frontend)
- Node, Postgres, Temporal, Redis (backend)
- WebSocket-based real-time sync (proprietary)
- **Pluggable agentic workload system utilizing Temporal** — this is significant

**Fit assessment for Rob: 9/10**
- React + TypeScript: ✅ Deep (13 years, 25+ component libraries)
- Complex UI components (drag & drop, virtualized): ✅ Demonstrated at PartySlate (map-view, large dataset search)
- Real-time collab: ✅ WavePoint websocket work
- Agentic workload systems: ✅ This is literally what Rob built with Sherpa Studio
- Craftsmanship orientation: ✅ Rob's most consistent value across all his work
- **Gap:** MobX (not in Rob's history — worth noting but addressable; strong React fundamentals transfer)

### 2. Senior / Staff Fullstack Engineer
**URL:** https://linear.app/careers/cd5ae036-0223-427a-b038-ba16ef9dcb32  
**Type:** Full-time, Europe or North America (remote-eligible)

More full-stack than the Product Engineer role — includes GraphQL resolvers, DB modeling, data sync optimization. Less pure frontend.

**Fit assessment: 7/10** — Rob can do this but his strongest angle is on the product/frontend side. The Product Engineer role is the better primary target. Apply to both but lead with Product Engineer.

---

## The Work Trial (Critical to Understand)

Linear uses a paid 2-5 day work trial instead of traditional whiteboard interviews. From their documentation:
- Candidate gets access to Slack, GitHub, Figma, and relevant internal tools
- Works on a **real project** the team actually plans to ship
- It's paid
- Strong candidates have worked on features that shipped to production

**What this means for Rob's preparation:**
1. Linear won't ask you to reverse a linked list. They'll hand you a Linear repo and ask you to build something.
2. The code quality signal matters more than the answer to "tell me about yourself"
3. Rob's Sherpa Studio codebase is the work trial warmup — it's the same territory (project management, agentic systems, React + TypeScript at scale)
4. **Prepare by:** Being able to quickly orient in an unfamiliar TypeScript/React codebase and ship a small, clean PR within hours. Rob already does this with Claude Code routinely.

---

## Culture Signal — The README

Linear's README (linear.app/readme) is a three-act story about why "magical software" matters. It's not a mission statement — it's a narrative. The core tension: software has become ubiquitous but lost its magic. Linear exists to bring it back.

This maps directly to Sherpa's Foundation Stone language — craftsmanship, meaning, building things that endure. Rob genuinely shares this worldview. That alignment is worth surfacing explicitly in an application.

**Quote to use in cover letter context:**
> *"What got them excited about computers was not so much what they were, but everything they had the potential to be."*

Rob built WavePoint and Sherpa because he still feels that way about software. That's the connection.

---

## Cover Letter Strategy

**Lead with:** Rob built Sherpa Studio — a project management/workflow system for AI-assisted development teams — because he needed this tool and Linear wasn't enough for the specific problem he was solving. He's not just a fan. He's been solving adjacent problems in the same space.

**Second paragraph:** The agentic workload system in Linear's stack (Temporal) maps exactly to what Rob built with the Sherpa dispatch system. Hands-on experience with pluggable agent routing, task execution governance, and behavioral constraints.

**Third paragraph:** Craftsmanship proof — PartySlate component library (25+ modules, 40% reduction in feature cycle time), Sherpa Studio governance rules system (44 behavioral constraints, enforced via tooling), WavePoint design system spanning web and native.

**Close with:** "I've built the solo version of what Linear is building at scale. I want to work on the version that ships to 25,000 teams."

---

## Draft Cover Letter

---

Karri / Linear team,

I've been building in the same space as Linear for the past year — not as a competitor, but as a practitioner who needed a deeper toolset than what existed.

I founded Sherpa, an AI consulting practice, and used it to build WavePoint: a full astrology platform spanning a Next.js web app, six native Apple apps, and shared TypeScript packages — shipping 472+ PRs in 11 weeks as a solo engineer. To make that possible, I built Sherpa Studio: a project management and agentic workflow system with behavioral governance, workforce management, and convention enforcement. I built it because Linear, Linear-alikes, and Claude Code alone weren't sufficient for governing AI-assisted development at the fidelity I needed.

What I built maps directly to what your stack is doing. The "pluggable agentic workload system" in your tech list is something I implemented from scratch — task routing by type, agent role definitions, execution governance, and a Planner/Worker/Judge pipeline with autonomous retry loops. I understand this problem space from first principles, not from reading docs.

Before the AI-native chapter: 13 years in frontend infrastructure. I was the first developer at a car marketplace, built and led the UX team at Savo, joined PartySlate at 12 people and shipped through Series B — building a 25+ component library, rewriting the highest-traffic page on the platform, and driving a 258% YoY revenue growth year over a 6-year tenure. Design systems, component libraries, performance optimization, TypeScript + React at scale — this is my native territory.

I share what I understand to be Linear's core belief: that software should be magical, and that craftsmanship is what makes it so. I haven't stopped believing that since I first wrote jQuery in 2011.

I've built the solo version of what Linear is building at scale. I want to work on the version that ships to 25,000 teams.

— Rob Abby  
robabby.com | linkedin.com/in/robabby

---

## Application Notes

- **Apply to:** Product Engineer (primary), Fullstack Engineer (secondary, same session)
- **Application URL:** Both roles have North America region selection — select that
- **Comp expectation:** Series C, $1.3B valuation, 178 employees — likely $220-300K base for Staff in North America; equity meaningful given they did a tender offer (liquidity-friendly)
- **Timeline:** Apply this week. These roles are not dated and may have been open a while, but LinkedIn shows they're actively growing.
- **Work trial prep:** Be ready to orient in a TypeScript monorepo and ship something clean and small within hours. Rob can warm up by reviewing the WavePoint or Sherpa codebase structure with that mindset.

---

## Priority Rating: 8.5/10

Behind Stripe AI Design Tooling (10/10) but ahead of Airbnb (cultural/comp fit questions) and Ashby (smaller company, lower upside). Linear is a credibility match — the work Rob has done is the most direct proof available for what they're hiring for.
