---
status: approved
initiative: agentic-workspace
created: 2026-03-12T00:00:00.000Z
updated: '2026-03-12'
started: 2026-03-12T00:00:00.000Z
type: research-synthesis
risk: additive
targets:
  - apps/studio/
  - packages/studio-core/
  - packages/studio-ui/
  - .claude/skills/
  - docs/initiatives/
dependencies: []
spawned-from: null
---

# Agentic Workspace

## Summary

Evergreen research initiative on reimagining workspace tools for the age of human-agent collaboration. Investigates what replaces Linear, Notion, Jira, Confluence, Obsidian, and Google Docs when AI agents are first-class team members and any team can build any interface in real-time. Feeds strategic direction into tactical initiatives (studio-collaboration-platform, studio-state-machine, sherpa-framework-extraction) and seeds new sub-initiatives as the landscape evolves.

## State Snapshot

**The macro shift (March 2026):** The PM tool category is undergoing its most significant disruption in 35 years. The February 2026 "SaaSpocalypse" erased ~$2 trillion in SaaS market cap. Height.app shut down. Per-seat pricing is dying. Every incumbent (Atlassian, Linear, Notion, Asana) is bolting AI onto existing paradigms while the underlying paradigm — sprints, story points, kanban boards — becomes obsolete for agentic workflows.

**The convergent patterns:**
- Filesystem-as-governance (AGENTS.md: 60K+ repos, MCP: 97M+ monthly SDK downloads)
- Skills as distribution primitive (351K+ Agent Skills indexed, cross-platform standard under AAIF)
- IDEs and CLIs becoming the PM layer (GitHub Agent HQ, Cursor, Google Antigravity)
- DIY workspace explosion (35% of enterprises replacing SaaS with custom tools, 50+ agent orchestration tools)

**What Sherpa already has that the industry is building toward:**
- Initiative lifecycle governance (directoturtle convention)
- Behavioral agent definitions (13 roles, research-validated format)
- Composable skills that build on one another (/rr -> /integration-review -> /plan-tasks)
- Convention-as-code distribution (.claude/rules/, .claude/skills/)
- Studio as governance UI (process workspace, research viewer, workforce catalog)

**What Sherpa lacks:**
- Agent fleet visualization (real-time status, delegation flows)
- The "fleet minimap" — persistent, always-visible overview of agent activity
- Formalized skill composition (current approach is natural language, not dependency-aware)
- Skills marketplace distribution (aligned with Agent Skills standard but not publishing)
- Security model for skill distribution (no signing, no verification)

## Research (Iteration 1)

Five parallel vectors (300+ sources):

1. **DIY Workspace Revolution** — 35% of enterprises replacing SaaS with custom tools. Vibe Kanban (23K stars), Taskmaster AI (15.5K stars in 9 weeks), Claude Squad (5.8K stars) lead the agent orchestration wave. Filesystem governance is the convergent pattern. The competitive threat is not any single tool but the combinatorial explosion of narrow tools teams assemble ad hoc.

2. **Agentic Interaction Paradigms** — Six sub-vectors covering fleet interfaces, RTS gaming metaphors, agent status protocols (AG-UI, A2UI, Linear Agent SDK), delegation/dispatch patterns, collaborative editing, and progressive disclosure. Key insight: the "fleet minimap" (always-visible agent overview) is the missing primitive. Delegation-not-assignment is the governance model. Empirical HCI research confirms agents are tools, not team members.

3. **The Platform Play** — Sherpa occupies an empty quadrant: no framework combines the Payload CMS architectural model (config-as-code, framework-inside-your-app) with agent governance. The SaaSpocalypse validates the framework model (products die, frameworks endure). Mastra ($13M, 150K weekly downloads) is closest competitor but has no governance layer. Microsoft Agent 365 launches May 2026 at $15/user/month.

4. **Skills as Distribution** — Agent Skills is now an open standard (351K+ skills, adopted by Claude Code, Codex CLI, VS Code). Claude Code has full plugin marketplace architecture (9K+ plugins). Composition is the unsolved problem — individual skills work, orchestrating them doesn't. Sherpa's pipeline pattern (/rr -> /integration-review -> /plan-tasks) is exactly the DAG-based orchestration that research shows outperforms flat invocation. Security is alarming: 13.4% of public skills have critical issues.

5. **PM Category Earthquake** — Height.app raised $18.3M and shut down. Per-seat pricing is dying (Gartner: 40% shifts to usage-based by 2030). Convention-over-configuration is winning (AGENTS.md, MCP, AAIF). "From Sprints to Swarms" documents 4x productivity gains. Products die, conventions endure — Sherpa's framework approach is validated.

## Research (Iteration 3)

Four research themes (9 vectors, 500+ sources):

1. **The Agent OS Race** — The "Agent OS" is five distinct layers (runtime, control plane, framework, convention, protocol). Governance is the highest-moat layer ($4.8B market, 35-45% CAGR). Sherpa uniquely owns convention governance and lifecycle governance — the two types nobody else addresses. **Sherpa is not an Agent OS — it's the constitution that every Agent OS needs.**

2. **Skill Composition Specification** — Agent Skills standard has no composition primitive (by design). AgentSkillOS shows DAG orchestration outperforms flat by 30-45%. But rigid DAG specs are over-engineering. The right model: **pipeline manifest** — lightweight YAML declaring stages, artifact patterns, conditions alongside skills. Filesystem-as-bus is inherently portable.

3. **AI Governance Regulation** — EU AI Act (Aug 2026) demands audit logging, risk management, human oversight, documentation maintained 10 years. Colorado AI Act (Jun 2026) requires NIST-aligned risk management. OWASP Agentic Top 10 defines security taxonomy. Sherpa's primitives map to these requirements but need to become structured, automatic, and auditable.

4. **Convention Distribution Architecture** — No convention marketplace exists (skills marketplaces are commodity). L4 Governance (evolution + provenance + three-way merge) is completely unoccupied. shadcn registry + Copier lifecycle is the distribution model. `node-diff3` for three-way merge. `*.local.md` pattern solves sync conflicts. Drift detection is the killer feature.

## Proposed Changes

This is an evergreen research initiative. It does not propose specific code changes. Instead, it:

1. **Feeds strategic direction** into tactical initiatives via branch seeds
2. **Tracks the macro landscape** through periodic research iterations
3. **Identifies gaps** between what Sherpa has and what the market needs
4. **Seeds new sub-initiatives** when research surfaces concrete buildable opportunities

### Seeds from Iteration 1:

- **Fleet Minimap UI** (high) — Persistent agent status overview in Studio (feeds studio-collaboration-platform)
- **Skills Marketplace Distribution** (high) — Package Sherpa governance skills as Claude Code marketplace (feeds sherpa-framework-extraction)
- **Skill Composition Model** (medium) — Formalize the pipeline pattern with dependency-aware composition
- **Governance-Regulatory Alignment** (medium) — Map regulatory requirements to Sherpa capabilities

### Seeds from Iteration 2 (wide):

- **Agent Memory Consolidation** (medium) — Sleep-time compute for Sherpa. Background memory consolidation between sessions. Filesystem-as-memory validated (Letta 74.0% beats specialized tools).
- **Agent Identity & Security** (high) — Capability-based governance from behavioral definitions. Agent identity per worktree. Supply chain security. Addresses the 36.82% skill security flaw crisis.

### Seeds from Iteration 3 (deep):

- **sherpa-enforce** (high) — Claude Code hooks validating agent actions against behavioral definitions. Closes the soft/hard governance gap.
- **Pipeline Manifest Spec** (medium) — Formal YAML spec for skill composition via filesystem artifacts. Lightweight, not a full DAG.
- **Compliance Mapping** (medium) — EU AI Act / Colorado AI Act requirement → Sherpa capability mapping. Enterprise adoption driver.

## Rationale

Every existing Sherpa initiative solves a piece of this puzzle — Studio as morning review (studio-collaboration-platform), lifecycle intelligence (studio-state-machine), framework extraction (sherpa-framework-extraction), coordination layer (mcp-coordination-layer). But none tracks the macro question: what does the future of workspace tools look like, and how should Sherpa position?

Three iterations of research (1,500+ sources across 28+ vectors) converge on a single strategic insight: **Sherpa is the "OPA of agent governance"** — the policy framework that plugs into any runtime, any control plane, any protocol stack. The governance gap is simultaneously the market opportunity ($4.8B by 2034), the regulatory requirement (EU AI Act Aug 2026), and the ecosystem vacancy (no project owns convention + lifecycle governance). Iteration 2's wide sweep independently validates the core thesis from three new angles: filesystem-as-memory (Letta benchmarks prove Sherpa's approach), capability-based security (behavioral definitions naturally map to capability warrants), and enterprise deployment patterns (Microsoft Agent 365 validates the market but serves runtime governance, not development governance). The research compounds: each iteration sharpens the positioning and seeds downstream work.

## Dependencies

None. This initiative reads from all others but writes only proposals and branch seeds.

## Review Notes

- This is a **research-only** initiative. It produces insights and seeds, not code.
- Each iteration should identify at least one concrete, buildable sub-initiative to seed.
- Iteration frequency: monthly or when significant landscape shifts occur.
- The "300+ sources across 5 vectors" in iteration 1 provides a substantial URL library for future iterations to mine.
- Risk of scope creep is real — every workspace tool topic could fit. The focus constraint: "would this insight change what Sherpa builds or how we build it?"
