---
status: approved
initiative: wa-business-grants
created: 2026-03-17T00:00:00.000Z
updated: '2026-03-18'
type: research-synthesis
risk: additive
targets:
  - docs/initiatives/wa-business-grants/research/
  - docs/initiatives/wa-business-grants/plan.md
dependencies: []
informs:
  - trails
  - sherpa-website
spawned-from: null
---

# Non-Dilutive Funding — Grants & Programs

## Summary

Research and catalog grant programs and non-dilutive funding available to Sherpa Consulting, with strong focus on local Bellingham/Whatcom County programs, Washington state grants, and open-source/AI ecosystem grants. Produce an actionable pursuit plan with eligibility assessments, deadlines, and prioritized targets. This directly addresses the budget constraint — grants are non-dilutive funding that can accelerate Sherpa's infrastructure, tooling, and go-to-market without taking on debt or giving up equity.

## State Snapshot

Sherpa Consulting (sherpa.solar) is an early-stage consulting company operating on highly constrained budget. Rob is based in Bellingham, WA (Whatcom County). The company focuses on AI & Digital Transformation consulting, building an open framework (`@sherpa/studio`) for Human+AI collaborative workflows. No grant research has been done. No funding or revenue documentation exists in the repository. The foundation stone (`docs/foundation-stone.md`) establishes five pillars — Honesty, Thoughtfulness & Craftsmanship, Empowerment/Ethics/Digital Sovereignty, Integrity of Process, Community & Mutual Uplift — which should inform which grant programs align with Sherpa's values.

## Proposed Changes

### New: Grant Research (`docs/initiatives/wa-business-grants/research/`)

Structured research across multiple grant categories:

- **Washington State programs** — Department of Commerce grants, Innovation Partnership Zones, Small Business grants, Strategic Reserve Fund, CERB (Community Economic Revitalization Board)
- **Bellingham/Whatcom County programs** — city and county economic development grants, small business assistance, Bellingham-specific programs
- **Federal programs accessible via state** — SBA grants, SBIR/STTR (if applicable to software/AI), EDA grants
- **Tech/AI-specific programs** — grants targeting technology companies, AI innovation, digital transformation, workforce development
- **Nonprofit/foundation grants** — technology-focused foundations, community development grants that align with Sherpa's community pillar

Each program documented with: eligibility criteria, funding amounts, application deadlines, required materials, and alignment score against Sherpa's profile.

### New: Application Action Plan (`docs/initiatives/wa-business-grants/plan.md`)

Prioritized grant pursuit plan with:
- Tier 1: High-fit grants with near-term deadlines — apply immediately
- Tier 2: Strong-fit grants with future deadlines — prepare materials
- Tier 3: Stretch grants worth monitoring

Common application materials to prepare (business plan summary, financial projections, company description, AI/technology narrative).

## Rationale

**Why grants:** Non-dilutive funding is the ideal fit for an early-stage, values-driven company. Grants don't require giving up equity or taking on debt. Washington state has active economic development programs, and AI/technology companies are a priority sector for many grant programs.

**Why now:** Early-stage is often the best time to pursue grants — many programs specifically target new businesses. Grant cycles have fixed deadlines, and missing a window means waiting another year. Starting the research now ensures Sherpa doesn't miss near-term opportunities.

**Why research-first:** Grant landscapes are complex and change frequently. A structured research pass prevents wasted effort on ineligible programs and surfaces the highest-value opportunities.

## Dependencies

None. This is standalone research that can proceed immediately.

The `informs` relationship to `trails` and `sherpa-website` is because grant narratives (how Sherpa describes its mission and value) feed into how trails are articulated and how the website positions the company. The grant application process itself is a forcing function for crisp company positioning.

## Iteration 1 Findings (2026-03-17/18)

Research across 5 vectors (WA state, federal, Bellingham local, AI/tech foundations, grant readiness). Full synthesis: `research/iteration-1.md`. Raw reports: `research/iteration-1/`.

### Top Opportunities

| Program | Amount | Deadline | Fit |
|---------|--------|----------|-----|
| **NSF PESOSE** | $300K-$1.5M | Sept 1, 2026 | Near-perfect — AI agent ecosystems, open-source infrastructure |
| **NSF SBIR Phase I** | ~$275K | April-May 2026 (restarts) | Strong — AI topics directly relevant |
| **NLnet NGI Zero Commons** | EUR 5K-50K | April 1, 2026 (every 2mo) | Strong — open internet infrastructure |
| **Sovereign Tech Fund** | EUR 50K+ | Rolling | Good — open digital base technologies |
| **Anthropic Economic Futures** | $10-50K + API credits | Rolling | Good — Human+AI productivity research |
| **Cloud credits** (MS/Google/AWS/Anthropic) | $2K-$350K | Ongoing | Immediate — no VC required |

### Key Findings

- **WA state grants are structurally misaligned.** Programs serve manufacturing, infrastructure, nonprofits — not AI consulting.
- **NSF PESOSE is the highest-value opportunity.** Feb 2026 Dear Colleague Letter specifically calls for open protocols for AI agent ecosystems. Sherpa's MCP server, behavioral agents, and governance conventions are a direct match.
- **SBIR was reauthorized through 2031** (Feb 2026). NSF AI topics restart April-May 2026.
- **Bellingham's value is advisory and community, not grants.** Free SBDC advising, SCORE mentoring, NWIRC incubator, TAGNW tech community. Port of Bellingham Innovation Zone worth investigating.
- **SAM.gov registration gates all federal grants** — 7-10 day lead time, notarized letter required. Start immediately.

## Review Notes

**Open questions:**
- What is Sherpa's legal entity type and tax filing history?
- NSF PESOSE: can a for-profit LLC be sole PI, or is university co-PI required?
- WWU CS department partnership potential for PESOSE application?
- NLnet: April 1 deadline feasible, or wait for next cycle (every 2 months)?

**Scope boundaries:**
- IN: Grant research, eligibility assessment, application planning, materials checklist, Bellingham local programs
- OUT: Actual grant applications (separate effort per grant), loan programs, investor fundraising, revenue strategy

**Effort:** 2-3 sessions
**Session breakdown:**
- Session 1: Landscape survey (completed — 5 vectors, all findings captured)
- Session 2: Deep dive on top 3 opportunities (PESOSE, SBIR, NLnet) + grant readiness action plan
- Session 3 (if needed): Application preparation for highest-priority target
