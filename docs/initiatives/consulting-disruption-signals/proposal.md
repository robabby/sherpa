---
status: approved
initiative: consulting-disruption-signals
created: 2026-03-15
updated: '2026-03-15'
type: research-synthesis
risk: additive
targets:
  - docs/initiatives/consulting-disruption-signals/
dependencies: []
informs:
  - agentic-consulting-landscape
  - sherpa-website
  - behavioral-agents
  - agentic-organization-model
  - sherpa-framework-extraction
spawned-from: null
---

# Consulting Disruption Signals

## Summary

Evergreen research initiative tracking how incumbent consulting firms (McKinsey, Deloitte, BCG, Bain, Accenture, KPMG) are being structurally transformed by AI — and what gaps that transformation creates for Sherpa. The incumbents are simultaneously proving the market (20,000 AI agents at McKinsey, $2.9T projected value) and demonstrating the failure mode (revenue cannibalization, no governance framework, quality crises). Each signal maps to a decision about what Sherpa builds, how Sherpa Consulting prices, or what content Sherpa publishes.

## State Snapshot

**What we know (March 2026):**

McKinsey is the most transparent incumbent. Bob Sternfels announced 20,000 AI agents operating alongside 40,000 humans, targeting 1:1 parity by end of 2026. Lilli (internal AI platform) handles 500K+ prompts/month, used by 75% of employees, saving 30% of research/synthesis time. But the firm has shed ~5,000 staff (45K → 40K) and is planning another ~10% cut to non-client-facing roles. 200 tech jobs cut in November 2025 specifically because AI automated those roles. Revenue growth has stalled.

**The five structural signals:**

1. **Revenue paradox** — 75% of McKinsey's fees are still time-based. Lilli's 30% efficiency gain cannibalizes billable hours rather than increasing revenue. Only 25% of engagements are outcome-based. The business model punishes their own productivity gains.

2. **Pyramid inversion** — Junior consultants shifting from doing analytical work to supervising AI outputs. McKinsey now tests candidates on Lilli prompting during case interviews. The classic pyramid (armies of analysts feeding up) is collapsing from the bottom.

3. **Governance vacuum** — 20,000 AI agents with no public governance framework. Lilli is a productivity tool, not a governance system. No behavioral constraints, no quality gates, no audit trail per agent. The gap between agent count and agent governance widens every quarter.

4. **Client defection** — 65% of enterprises say traditional consulting no longer provides enough value (HFS Research). Clients opting for AI tools + internal expertise over hiring consultants. Utilization rates sagging industry-wide.

5. **Quality crisis** — Deloitte shipped hallucinated government reports twice. AI code has 1.7x more defects (industry-wide). The overnight workforce works but "can't tell if what it built is good enough." Trust erosion is cumulative.

**Industry-wide:** KPMG, Deloitte, Bain, and Accenture all laid off workers in 2025. The consulting pyramid model is under pressure everywhere, not just at McKinsey.

**What Sherpa has tracking the new entrants but not the incumbents:**
- `agentic-consulting-landscape` — maps solo operators and micro-teams (bottom-up view). Validated unit economics, governance gap, outcome-based pricing shift, quality risk.
- No initiative systematically tracks the top-down view: what incumbents are doing, what they're getting wrong, and what structural openings that creates.

## Proposed Changes

This is an evergreen research initiative. It produces intelligence and seeds, not code. Structured as recurring research iterations (quarterly or on significant landscape events).

### Signal Tracking Framework

Each research iteration monitors five signal categories across the Big Six (McKinsey, Deloitte, BCG, Bain, Accenture, KPMG):

| Signal | What to Track | Sherpa Decision It Informs |
|--------|--------------|---------------------------|
| **Revenue model shifts** | Outcome-based vs. time-based ratio, pricing changes, new engagement models | Sherpa Consulting pricing strategy |
| **Workforce restructuring** | Layoffs, hiring changes, role redefinitions, AI agent counts, human-agent ratios | `agentic-organization-model` design, content positioning |
| **Governance & tooling** | Internal AI platforms, governance frameworks (or lack thereof), quality systems | `behavioral-agents` differentiation, framework feature priority |
| **Client sentiment** | Enterprise satisfaction surveys, switching behavior, DIY trends | `sherpa-website` messaging, consulting pitch |
| **Quality incidents** | Public failures, hallucination events, audit findings, regulatory actions | Quality governance features, trust-based content strategy |

### Research Iteration Cadence

- **Quarterly baseline:** Structured scan of earnings calls, press coverage, analyst reports, industry surveys for all six firms
- **Event-triggered deep dives:** When a major event occurs (layoff announcement, tool launch, regulatory action, public quality failure), run a focused iteration on that signal
- **Annual synthesis:** Roll up quarterly findings into a strategic memo feeding the roadmap

### Output Artifacts

Each iteration produces:
- Signal update in `research/` with sourced claims and dates
- Seeds for tactical initiatives (pricing changes, feature priorities, content topics)
- Updated competitive positioning notes for `sherpa-website` and `agentic-consulting-landscape`

### Seed Categories (from current signals)

**Immediate seeds (from today's research):**
- **"Governance gap" content series** (high) — McKinsey's 20K ungoverned agents is the perfect hook for Sherpa's positioning. Blog posts, case analysis, comparison frameworks. Feeds `sherpa-website` content strategy.
- **Outcome-based pricing model** (high) — McKinsey's 75% time-based billing is their vulnerability. Design Sherpa Consulting's pricing to be 100% outcome-based from day one. Feeds `agentic-consulting-landscape` iteration 2.
- **"Quality as moat" positioning** (medium) — Deloitte's hallucination incidents + industry 1.7x defect rate = content opportunity. Behavioral agents with quality gates as the counter-narrative.
- **Junior talent pipeline disruption** (medium) — McKinsey's pyramid inversion means a generation of would-be consultants need new career paths. Some become solo+agents operators. Potential AI literacy workshop audience.

## Rationale

**The complementary lens argument.** `agentic-consulting-landscape` watches the floor being built (new entrants, solo operators, emerging models). This initiative watches the ceiling collapse (incumbent transformation, structural gaps, market openings). Together they give Sherpa a complete view of the consulting market transition. Decisions made without both lenses are half-informed.

**The timing argument.** McKinsey's transformation will play out over 2-3 years. Each quarter produces new data points — layoff waves, tool launches, client sentiment shifts, regulatory actions — that should change what Sherpa builds or says. Starting tracking now means we have longitudinal data when competitors are starting from scratch.

**The content argument.** "What McKinsey gets wrong about AI governance" is dramatically more compelling content than "here's our framework." The incumbent transformation story is the narrative engine for Sherpa's content strategy. Every quality failure, every ungoverned agent, every cannibalizing efficiency gain is a proof point for the governance-first approach.

**The positioning argument.** Sherpa Consulting's differentiator isn't "we use AI" (everyone does). It's "we have the governance layer the big firms are missing." That claim requires evidence. This initiative produces the evidence.

## Dependencies

None. This initiative reads from the market and feeds intelligence into other initiatives.

**Soft coordination (not blocking dependencies):**
- `agentic-consulting-landscape` — complementary research lens. Shares findings bidirectionally. New entrant patterns inform incumbent analysis and vice versa.
- `sherpa-website` — consumes positioning intelligence and content hooks from this research.
- `behavioral-agents` — each governance gap discovered here validates the behavioral approach and may influence feature priority.
- `agentic-organization-model` — McKinsey's 20K agent deployment (and its governance failures) is a primary case study for the org model design.
- `sherpa-framework-extraction` — incumbent tool gaps inform which framework features to prioritize for extraction.

## Review Notes

**What this is NOT:**
- Not competitive intelligence in the corporate espionage sense. All signals come from public sources: earnings calls, press coverage, analyst reports, industry surveys, job postings, published research.
- Not a McKinsey-specific initiative. McKinsey is the most transparent incumbent, but the signal framework covers all Big Six firms.
- Not a consulting strategy initiative. It produces intelligence that *informs* strategy. Pricing decisions, service design, and content planning happen in their respective initiatives.

**Open questions:**
- Should this initiative have a formal relationship type beyond the current `dependencies` / body-text distinction? The "feeds intelligence into" relationship is different from both hard deps and soft coordination.
- How to handle signal freshness — should research artifacts include a staleness date after which they need re-verification?
- Is quarterly cadence right, or should it be event-driven with a quarterly floor?

**Effort:** 1 session per quarterly iteration, 0.5 sessions per event-triggered deep dive
**Session breakdown:**
- Session 1 (Iteration 1): Establish baseline across all Big Six firms. Structure signal tracking. Produce first seed batch.
- Subsequent sessions: Quarterly updates + event-triggered deep dives as needed.
