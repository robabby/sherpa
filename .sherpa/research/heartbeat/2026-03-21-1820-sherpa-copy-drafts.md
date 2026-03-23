---
title: >
  Sherpa & Sherpa Studio — Draft Copy for All Surfaces
date: 2026-03-21
category: heartbeat
trigger: "Dangling thread #1 (CRITICAL): Sherpa + Sherpa Studio missing from ALL surfaces. Queue item #2: draft the actual copy."
summary: >
  Drafted ready-to-use copy for Sherpa and Sherpa Studio entries across robabby.com Experience section, Projects section, About section references, LinkedIn positions, and resume bullets. Uses X-Y-Z achievement format, first-person voice, and the narrative arc established in PRIORITIES.md.
---

## Purpose

The narrative audit identified that Sherpa (consulting) and Sherpa Studio (product) are completely absent from robabby.com, LinkedIn, and the resume. This research drafts the actual copy Rob needs to add them. Each section is ready to paste/adapt.

---

## 1. Experience Section Entry — Sherpa (robabby.com)

For `app/components/Experience/index.tsx` — add as the TOP entry, above WavePoint.

```typescript
{
  title: "Founder & Principal Engineer",
  company: "Sherpa",
  companyLink: "https://sherpa.consulting",
  period: "2024 — Present",
  featured: true,
  description: "Founded an AI consulting practice on a foundation of honesty, craftsmanship, and empowerment — helping teams adopt AI workflows with governance built in, not bolted on. Built the Sherpa framework and Sherpa Studio, an Agentic Engineering workflow suite, as both the consulting methodology and an open-source product.",
  highlights: [
    "Designed and built Sherpa Studio — a full-stack Agentic Engineering workflow suite (Next.js, React, TypeScript) with workforce management, skill orchestration, convention enforcement, and session monitoring across 91+ UI components.",
    "Authored a behavioral governance framework for AI agent workflows: agent role definitions with constraints, initiative lifecycle management, and executable conventions that travel with the codebase.",
    "Built WavePoint (see below) as the proof-of-concept engagement — shipping a complete cross-platform product solo in 11 weeks using the Sherpa framework, validating the methodology in production.",
    "Established five foundational pillars (Honesty, Craftsmanship, Empowerment, Integrity, Community) as operative principles governing every engagement and every line of code.",
    "Operate a 24/7 autonomous research and development infrastructure: 8 nightly research streams, adaptive heartbeat-driven analysis, and cron-based automation — one engineer, many agents, shipping at team scale."
  ]
}
```

### Why this framing works

- **"Founded an AI consulting practice"** — establishes this as a real business, not a side project
- **"on a foundation of honesty, craftsmanship, and empowerment"** — immediately signals values (differentiates from "AI hype" consultancies)
- **"Built the Sherpa framework and Sherpa Studio"** — names the products, establishes he built infrastructure
- **Highlights lead with Sherpa Studio** — the strongest technical differentiator
- **WavePoint framed as "proof-of-concept engagement"** — connects the two roles narratively
- **Last bullet** — the autonomous org angle, directly from the mission statement

---

## 2. Experience Section Entry — WavePoint (updated)

Update the existing WavePoint entry. Key changes: update numbers, reference Sherpa, reframe as both product and proof-of-concept.

```typescript
{
  title: "Founder & Principal Engineer",
  company: "WavePoint",
  companyLink: "https://wavepoint.space",
  period: "2025 — Present",
  featured: true,
  description: "Solo technical founder of WavePoint, an intelligence-native astrology platform — and the production proof-of-concept for the Sherpa consulting methodology. Shipped a Next.js web app and 6 native Apple apps from a single monorepo in 11 weeks, demonstrating what's possible when agentic engineering is treated as an infrastructure problem.",
  highlights: [
    "Shipped 472+ PRs across a full-stack monorepo in 11 weeks — Next.js 16 web app, 6 native Apple apps (Swift/SwiftUI), 82 API routes, 37 computation modules, and 111 primitives as a solo engineer.",
    "Built a purpose-designed AI governance system with auto-loading behavioral constraints, worktree isolation, and a structured initiative workflow that maintains architectural consistency across all AI-generated contributions.",
    "Designed a purpose-built MCP server with 12 composed tools following a Stripe-inspired 5-level abstraction ladder — replacing ad-hoc AI tooling with principled interface design.",
    "Created a cross-platform 'Modern Mystic' design system spanning web (Radix UI, Tailwind) and native (SwiftUI) with shared TypeScript content packages bridging both surfaces.",
    "Integrated Stripe payments, Supabase auth, and Brevo CRM across all platforms with a unified architecture — handling the full product surface from infrastructure through user-facing UI."
  ]
}
```

### Changes from current

- "450+ commits in 9 weeks" → "472+ PRs in 11 weeks" (accurate, stronger metric)
- Added "production proof-of-concept for the Sherpa consulting methodology"
- Changed "44-rule AI governance system" → "AI governance system with auto-loading behavioral constraints" (more descriptive, less arbitrary number)

---

## 3. Projects Section Entry — Sherpa Studio (robabby.com)

For `app/components/Projects/index.tsx` — add as the TOP featured project.

```typescript
{
  title: "Sherpa Studio",
  category: "Developer Tool",
  callout: "The tooling layer that powered 472+ PRs in 11 weeks",
  githubLink: "https://github.com/robabby/sherpa",
  liveLink: null,
  description: "An Agentic Engineering workflow suite — workforce management, skill orchestration, convention enforcement, and session monitoring for Human+AI collaborative development. 91+ React components, MCP server integration, and a config-as-code governance engine.",
  tech: ["Next.js", "React", "TypeScript", "MCP", "shadcn/ui", "Radix UI"],
  gradientType: "purple",
  featured: true,
  diagramId: null // could add a diagram later
}
```

---

## 4. LinkedIn Position — Sherpa

**Title:** Founder & Principal Engineer
**Company:** Sherpa
**Location:** Bellingham, WA (Remote)
**Period:** 2024 – Present

**Description:**
Founded an AI consulting practice built on principles of honesty, craftsmanship, and empowerment. I help teams adopt AI workflows with governance built in — not bolted on after something breaks.

Built two products as both the methodology and the proof:
• Sherpa Studio — an Agentic Engineering workflow suite (91+ React components, MCP integration, config-as-code governance)
• WavePoint — a full cross-platform product shipped solo in 11 weeks as the production proof-of-concept

The throughline: I didn't just use AI tools — I built the infrastructure that makes AI-assisted development reliable, then proved it works by shipping a real product at team-scale velocity.

---

## 5. LinkedIn Position — WavePoint

**Title:** Founder & Principal Engineer
**Company:** WavePoint
**Location:** Bellingham, WA (Remote)
**Period:** 2025 – Present

**Description:**
Solo technical founder of an intelligence-native astrology platform spanning a Next.js web app and 6 native Apple apps, all from a single monorepo.

• 472+ PRs merged in 11 weeks as the sole engineer
• 82 API routes, 37 computation modules, 111 primitives, Swift astronomy engine
• Purpose-built AI governance: behavioral constraints, worktree isolation, MCP server with 12 composed tools
• Cross-platform "Modern Mystic" design system (Radix UI + SwiftUI)
• Full product stack: Stripe payments, Supabase auth, Brevo CRM

Built using the Sherpa framework — demonstrating what's possible when agentic engineering is treated as an infrastructure problem, not a productivity hack.

---

## 6. LinkedIn Headline Options

Current: "WavePoint" (just company name — no title visible)

**Recommended options (pick one):**

1. `Founder & Principal Engineer | Sherpa · WavePoint | AI-Native Development`
2. `Staff Engineer · Founder | Building AI dev infrastructure that ships`
3. `Founder & Principal Engineer at Sherpa | 472+ PRs in 11 weeks, solo`

**Recommendation:** Option 1. It's professional, includes both companies, and has the "AI-Native Development" keyword that Meta is using as a literal job title. ATS-friendly and human-readable.

---

## 7. LinkedIn About Section

**Draft:**

I build products at the intersection of systems engineering and AI-augmented development. Over the past year, I founded two companies and shipped three products — solo, at a pace that used to require a team.

**Sherpa** is an AI consulting practice founded on honesty, craftsmanship, and empowerment. I built the Sherpa framework (behavioral governance for AI agent workflows) and Sherpa Studio (an Agentic Engineering workflow suite with 91+ components) as both the consulting methodology and an open-source product.

**WavePoint** is the proof it works. A full astrology platform — Next.js web app, 6 native Apple apps, Swift astronomy engine — shipped solo in 11 weeks with 472+ PRs merged. Built on the Sherpa framework as a production proof-of-concept.

Before founding, I spent 13 years in frontend infrastructure: first developer at a car marketplace, design system lead at Savo (50+ research sessions, first living design system), and Staff Frontend Engineer at PartySlate (6 years, 258% YoY revenue growth, 200k+ monthly users).

I'm looking for a role where this velocity, system-design thinking, and AI infrastructure expertise can compound inside a team.

TypeScript · React · Next.js · Swift/SwiftUI · AI-Augmented Development · Agentic Engineering · Design Systems · MCP

---

## 8. Resume Bullets (X-Y-Z format) — Sherpa

**Sherpa — Founder & Principal Engineer (2024 – Present)**

• Built Sherpa Studio, an Agentic Engineering workflow suite with 91+ React components and MCP integration, by designing a behavioral governance framework for AI agent workflows — enabling one engineer to ship production software at the velocity of a small team.

• Established an AI consulting practice serving teams adopting agentic workflows, founded on five operative principles (Honesty, Craftsmanship, Empowerment, Integrity, Community) — differentiating from hype-driven competitors through honest assessment and governance-first methodology.

• Architected a 24/7 autonomous research and development pipeline with 8 automated research streams, adaptive AI agents, and cron-based automation — operating as a one-person organization with AI agents handling research, monitoring, and routine development tasks continuously.

---

## 9. About Section References (robabby.com)

For the lead statement and second narrative paragraph in `About.tsx`:

**Lead statement:**
"I founded Sherpa, an AI consulting practice, and built WavePoint and Sherpa Studio to prove that agentic engineering — when treated as an infrastructure problem — lets one engineer ship at the scope of a team."

**Second paragraph (replace current):**
"In 2024, I founded Sherpa on a foundation of honesty, craftsmanship, and empowerment — a consulting practice helping teams adopt AI workflows with governance built in. To prove the methodology, I built WavePoint: a full astrology platform spanning a Next.js web app and 6 native Apple apps, shipped solo with 472+ PRs in 11 weeks. Then I built Sherpa Studio — an Agentic Engineering workflow suite with 91+ components — because the tooling layer is what makes AI-assisted development reliable, not just fast."

---

## Narrative Coherence Check

Does the arc hold across all surfaces?

| Surface | Story Beat |
|---|---|
| LinkedIn Headline | Who he is + both companies + the space |
| LinkedIn About | The full narrative in 5 paragraphs |
| LinkedIn Experience (Sherpa) | The consulting practice + products |
| LinkedIn Experience (WavePoint) | The proof-of-concept + technical depth |
| robabby.com Hero | Title + tagline |
| robabby.com About | The 13-year arc + Sherpa + WavePoint + Studio |
| robabby.com Experience | Detailed bullets for each role |
| robabby.com Projects | Sherpa Studio as featured project |
| Resume | Tight X-Y-Z bullets |
| Sherpa site | The consulting practice, values, case study |

✅ Sherpa appears on every surface
✅ Sherpa Studio appears on every surface
✅ WavePoint is framed as proof-of-concept, not just "an astrology app"
✅ Numbers are consistent (472+ PRs, 11 weeks, 6 apps, 91+ components)
✅ The "I built the infrastructure, not just used the tools" throughline runs through everything

---

## Sources

1. Business Insider — Meta AI engineer resume narrative strategy: https://www.businessinsider.com/meta-ai-engineer-shares-resume-strategy-that-helped-land-job-2026-3
2. Teal HQ — Google X-Y-Z resume formula: https://www.tealhq.com/post/xyz-resume
3. Resume trends 2026 — ResumeAdapter: https://www.resumeadapter.com/blog/resume-trends-2026
4. Sherpa foundation stone — local: docs/foundation-stone.md
5. Current robabby.com Experience data — local: app/components/Experience/index.tsx
6. Previous heartbeat research — narrative audit: research/heartbeat/2026-03-21-1702-professional-narrative-audit.md
