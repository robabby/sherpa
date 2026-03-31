# Airbnb Dev AI — Interview Prep Refresh (March 31, 2026)

**Purpose:** Update 3/27 interview prep with new intel from job descriptions + industry context

---

## New Intel: Full Job Description Detail

### Staff SWE Dev AI (7729271) — Confirmed Scope
From AnitaB.org and Airbnb's own listing (active as of March 30):

**Problem spaces you'd work across:**
1. **Agentic coding tools** — building the AI-powered coding assistants Airbnb engineers use daily
2. **Asynchronous AI workflow platforms** — infrastructure for non-blocking, multi-step AI tasks
3. **SDKs for rapid internal AI app development** — building blocks so any team can add AI capabilities quickly
4. **AI-assisted code migration** — automated large-scale codebase transformations

**Key responsibilities:**
- Shape and execute technical direction of team's infrastructure and products
- Build foundational AI tooling powering developer productivity across entire SDLC
- Provide building blocks for teams across the company to quickly integrate AI capabilities
- Stay current on rapidly evolving AI tooling landscape
- Champion, expert, coach, consultant to empower teams company-wide
- Champion engineering excellence through high-quality code, thoughtful design, reliable systems

### Senior SWE AI Products (7175614) — Agentic Focus
From the listing (active as of March 31):
- **"Develop and iterate on agentic AI capabilities, including multi-step reasoning, tool use, and context-aware decision-making"**
- Implement evaluation pipelines and quality systems
- Experience with AI agent frameworks (LangChain, LangGraph, or similar) preferred

### Other Airbnb AI Roles Surfaced
- **AI-Enabled Insights Lead** (7158963) — requires "expertise in agentic coding tools such as Claude Code, Codex, and/or Cursor"
- **Staff GenAI System Engineer, Automation Foundation** (7463421) — RAG patterns, memory routing, agent planning
- Shows Airbnb's AI hiring is broad and deep — not just one team

---

## Industry Context: MindStudio Article

**"What Is an AI Coding Agent Harness? How Stripe, Shopify, and Airbnb Build Reliable AI Workflows"** (MindStudio, ~March 17)

This article explicitly groups Airbnb with Stripe and Shopify as companies building **structured AI workflow engines** (not just using off-the-shelf AI tools). This validates:
1. Airbnb's Dev AI team is doing novel infrastructure work, not just configuring Copilot
2. The "harness" pattern (structured orchestration around AI agents) is what Rob built in Sherpa Studio
3. Rob can reference this framing: "I built the kind of AI coding agent harness that MindStudio describes — the structured workflow engine that makes agents reliable"

---

## Updated Interview Angles (New Since 3/27)

### The Skills Convergence Story
Since the original interview prep (3/27), the "Skills" pattern has exploded:
- Figma Skills (3/23), Linear Skills (3/24), Vercel 39 Skills (3/25), Codex Skills
- Rob can frame Sherpa Studio's AgentSkills as **prior art**: "I built a reusable skills system for agentic workflows before it became an industry standard — the same week Figma, Linear, and Vercel all shipped their own versions."

### Specific System Design Prep
Given the 4 problem spaces listed, Rob should be ready to design:

1. **Agentic coding tool architecture:** Multi-agent system with context injection, tool use, code generation + validation loops. Rob has direct experience — Sherpa Studio's coder/researcher agents + orchestrator pattern.

2. **Async AI workflow platform:** Queue-based task decomposition, progress tracking, human-in-the-loop checkpoints. Think: how would you build a system where an engineer kicks off "migrate this service to the new API" and comes back hours later to review the AI's work?

3. **Internal AI SDK design:** How would you design an SDK that lets any team at Airbnb add AI capabilities to their tools in a day? Think: abstraction layers, model routing, context management, evaluation hooks.

4. **Large-scale code migration:** Pattern recognition across massive codebases, safe transformation pipelines, rollback strategies, incremental migration with confidence scoring.

### Behavioral Stories to Prepare
- "Tell me about building agentic workflows in production" → Sherpa Studio architecture, OpenClaw integration
- "How do you stay current on AI tooling?" → The Skills convergence story (spotted the pattern as it emerged)
- "Describe empowering other teams to adopt new technology" → Sherpa's consulting framework, foundation stone of empowerment
- "Tell me about a time you championed engineering excellence" → 472 PRs, code quality standards, the craft-first approach

---

## Fit Score Reaffirmed: 9/10

The detailed job description strengthens the fit assessment:
- Every problem space maps to something Rob has built
- "Champion, expert, coach, consultant" matches Rob's consulting + building hybrid
- The emphasis on staying current and empowering others is Rob's natural mode
- G9 scope (cross-team influence, architectural ownership) matches staff-level experience

**Only gap:** Airbnb's backend stack (Ruby/Python/Java/Go) vs Rob's TypeScript-first experience. But the Dev AI role is about infrastructure design, not CRUD endpoints — the architectural thinking transfers.
