---
id: market-landscape-gemini
status: failed
role: research-lead
priority: high
initiative: null
backend: lm-studio
model: gemini-2.5-pro
budget-usd: 0.00
worktree: null
branch: null
created: 2026-03-17T05:06:44.736Z
dispatched-at: 2026-03-17T05:06:50.071Z
completed-at: null
session-id: null
judge-verdict: pending
---
# Market landscape research and initiative discovery (Gemini)

## Objective
Review Sherpa's existing documentation to understand current capabilities, architecture, and strategic direction. Research the broader marketplace for agentic collaboration frameworks, AI-native developer tools, and governance-as-code platforms. Identify gaps, opportunities, and competitive dynamics. Produce a ranked list of initiative ideas Sherpa should prioritize based on market positioning, user needs, and technical feasibility.

## Context
Read these files for full context on what Sherpa is and where it's heading:
- CLAUDE.md (project overview, seven pillars, current phase)
- docs/architecture/ (system architecture across all pillars)
- docs/initiatives/ (scan all proposal.md files to understand what's already in flight or completed)
- docs/decisions/ (architectural decisions already made)
- packages/ structure (what's been built)
- sherpa.config.ts (configuration surface)

Key context: Sherpa is a behavioral agentic collaboration framework — filesystem-based governance, behavioral agent definitions, AI-native process conventions. Three surfaces: code dependency, web UI (Studio), desktop app. First customer is WavePoint (astrology platform). Parent company is Sherpa Consulting (sherpa.solar) — AI & Digital Transformation consulting.

The product vision is that every organizational node gets AI collaboration with role-specific conventions on a shared substrate. The desktop app must pass the "thumb drive test" — install and demo in 60 seconds.

## Acceptance Criteria
- [ ] Documented understanding of Sherpa's current capabilities across the seven pillars
- [ ] Market landscape covering at least 5-8 comparable or adjacent tools/frameworks (e.g. Cursor, Windsurf, OpenHands, Devon, CrewAI, LangGraph, Composio, etc.)
- [ ] Gap analysis: what competitors offer that Sherpa doesn't, and vice versa
- [ ] Identification of Sherpa's unique differentiators and defensible advantages
- [ ] At least 8-12 ranked initiative ideas with rationale, estimated effort (in sessions), and strategic alignment
- [ ] Each initiative idea should note whether it's additive, evolutionary, or structural risk
- [ ] Initiatives should span near-term (1-2 sessions), medium-term (3-5 sessions), and longer-term (6+ sessions)

## Constraints
Do not propose initiatives that duplicate work already in-flight (check docs/initiatives/ for active proposals). Do not recommend Oracle Cloud or Oracle-affiliated services. Focus on what's achievable with the current monorepo architecture — don't propose rewrites. Initiatives should align with the foundation stone principles and the seven pillars. Use sessions as the unit of effort, never calendar time.

## Deliverables
A research report at docs/initiatives/market-landscape-initiative-discovery/research/market-landscape-gemini.md containing:
1. Executive summary
2. Sherpa capability inventory (current state)
3. Market landscape analysis (competitors, adjacents, emerging tools)
4. Gap and opportunity analysis
5. Ranked initiative recommendations with: title, summary, rationale, risk level, estimated sessions, strategic alignment score (1-5), dependencies on existing initiatives
6. Strategic themes that emerge across recommendations
