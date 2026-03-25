# Cover Letters v2 — Airbnb Staff Software Engineer, Dev AI (Req #7729271)

Date: 2026-03-24
Status: Draft — revised with "markdown problem" framing

---

## Version 1: Formal (Application Portal)

**Rob Abby**
Bellingham, WA · robabby23@gmail.com · robabby.com

March 24, 2026

Hiring Team — Dev AI, Airbnb

---

When you build software with AI, you generate a lot of markdown — agent definitions, conventions, research artifacts, task specs, review gates. It accumulates fast, and without structure it becomes noise. Sherpa Studio started as a way to manage that. It grew into a full collaboration framework because the problem kept expanding: how do you make all of that work together reliably?

The work your Dev AI team shipped last year — migrating 3,500 React test files from Enzyme to RTL in six weeks using an LLM-driven pipeline — tells me you've hit the same class of problem at a different scale. Not "how do we use AI to go faster," but "how do we architect systems that let AI operate correctly, autonomously, and observably." That's the craft I want to bring to this role.

What Sherpa Studio became: a multi-agent dispatch layer across 9 specialized backends, each governed by behavioral definitions that constrain how and when agents act. An initiative lifecycle engine for long-running async work across sessions. A knowledge management platform that gives agents grounded context. An MCP server that exposes the whole system as a composable tool surface. Every piece was pulled out of necessity — each one a direct response to something that broke or didn't exist.

The technical parallels to what Dev AI is building are direct:

- **Multi-agent dispatch** maps to your agentic coding tools — routing, fallback, context passing across agents.
- **Async workflow orchestration** is the same problem your migration pipeline solved: work that takes hours or days, needs to be resumable, and can't block on human input at every step.
- **MCP/SDK design** — I built the Sherpa MCP server to let external tools consume agentic capabilities as structured APIs. That's the same surface area as your SDK work for rapid internal AI app development.

Alongside Sherpa Studio, I built WavePoint — a full-stack platform (Next.js + 6 native Apple apps) that I shipped in 11 weeks across 472+ PRs. That sprint was both a product and the proof-of-concept for the tooling. Both projects came out of a deliberate bet: that the engineers who understand how to *build* AI systems — not just prompt them — are the ones who'll define what comes next.

Before these projects, I spent several years as a Staff Frontend Engineer at PartySlate, where I led frontend infrastructure through the company's growth from 12 to 50+ employees and a Series B. I know what it means to build systems that have to survive scale, organizational change, and engineers who weren't there when the decisions were made.

I'm applying to Dev AI because the specific problems you're solving — agentic coding tools, async AI workflows, migration at scale — are the problems I've been living in. I'd be genuinely excited to bring that work inside Airbnb and build it with a team that has the scale to make it matter.

Rob Abby
robabby.com

---

## Version 2: Cold LinkedIn Message (Punchy)

Hey [Name] —

I saw the Dev AI Staff Engineer role drop a couple days ago and wanted to reach out before applying.

Building software with AI generates a lot of markdown — conventions, agent definitions, task specs, research, review artifacts. It piles up fast. I built **Sherpa Studio** to manage that problem, and it grew into a full collaboration framework: multi-agent dispatch across 9 backends, an async initiative lifecycle engine, behavioral agent governance, and an MCP server that exposes everything as composable tools.

The overlap with what Dev AI is building — agentic coding tools, async AI workflows, internal SDK design — is almost a direct map. I also noticed the Enzyme → RTL migration pipeline your team shipped (3,500 files, 6 weeks) — that's the exact class of problem Sherpa Studio was built to support.

15 years in frontend infrastructure. Staff-level. I built these projects to prove I can architect AI systems, not just use them.

Happy to share more if it seems like a fit. The work your team is doing is some of the most interesting in the industry right now.

— Rob
robabby.com
