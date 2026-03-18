# Non-Dilutive Funding — Action Plan

## Prerequisites

As of 2026-03-18, Sherpa Consulting has no legal entity. No LLC, no EIN, no tax filings, no SAM.gov registration. The `@sherpa/studio` framework is entirely private. This means **no grant applications are possible yet**. The plan starts with entity formation.

## Phase 1: Foundation (Weeks 1-4)

Goal: establish the legal and administrative infrastructure required to apply for any grant.

### Week 1: Advisory + LLC Formation

- [ ] **Contact Bellingham SBDC** (360-650-7232, sbdc@wwu.edu) — schedule free advising session. No entity required. Discuss LLC formation, grant strategy, NAICS code selection. Located at 2219 Rimland Dr, Suite 319.
- [ ] **Form Washington LLC** — file online at sos.wa.gov. Choose a registered agent (can be yourself at your home address). Cost: ~$200 filing fee. Processing: 1-2 business days for online filing.
- [ ] **Select NAICS codes** — primary: 541519 (Other Computer Related Services) or 541611 (Management Consulting). Discuss with SBDC advisor.

### Week 2: EIN + Banking

- [ ] **Get EIN from IRS** — apply online at irs.gov (requires LLC to be formed first). Free. Issued immediately upon completion.
- [ ] **Open business bank account** — requires EIN + Articles of Organization. Needed for SAM.gov registration and grant fund disbursement.
- [ ] **Get WA State UBI number** — business license through WA Department of Revenue. May be bundled with LLC filing via Business Licensing Service.

### Week 3-4: Federal Registration

- [ ] **Register on SAM.gov** — requires EIN, physical address (no P.O. Box), banking info, NAICS codes. Prepare **notarized Entity Administrator Letter** (use GSA template, remote online notarization accepted). Processing: 7-10 business days. Designate two administrators to prevent lockout.
- [ ] **Register on Grants.gov** — after SAM.gov is active. Same-day process. Use same email as SAM.gov EBiz POC.
- [ ] **Set calendar reminder** — SAM.gov renewal every 365 days.

### Ongoing During Phase 1

- [ ] **Organize financial documents** — even without tax returns, prepare: Articles of Organization, LLC Operating Agreement, EIN confirmation (CP 575), cash flow projections, basic business plan sections.
- [ ] **Explore NWIRC** (360-255-7870, info@nwirc.com) — free incubator/accelerator at 2200 Rimland Dr. Has AI Skills training programs. No entity required to engage.
- [ ] **Attend TAGNW event** — monthly tech community meetups. Client and collaborator pipeline. No entity required.

## Phase 2: Low-Friction Applications (Weeks 4-8)

Goal: apply for programs with simple requirements and immediate value.

### Cloud Credit Programs (apply as soon as LLC + EIN exist)

- [ ] **Microsoft for Startups Founders Hub** — $5,000 Azure credits + $2,500 OpenAI credits + GitHub Enterprise. Self-serve, no VC required. Apply at microsoft.com/startups.
- [ ] **Anthropic Startup Program** — $1,350-$150,000+ in Claude API credits. Apply at claude.com/programs/startups.
- [ ] **Google for Startups Cloud Program** — $2,000 self-serve tier for unfunded startups. Up to $350,000 with progression. Apply at cloud.google.com/startup/ai.
- [ ] **AWS Activate** — up to $100,000 in credits. Requires company website. Apply at aws.amazon.com/startups/credits.

### Framework Publication Decision

Before open-source grants become available, `@sherpa/studio` needs to be publicly accessible. This is a strategic decision with implications beyond grants:

- [ ] **Decide publication scope** — full framework on public GitHub? Core packages only? Which license?
- [ ] **Publish to GitHub** — minimum: public repository with README, license file, and working code. NLnet and Sovereign Tech Fund need to evaluate the project.
- [ ] **Publish to npm** (optional but strengthens applications) — demonstrates ecosystem readiness.

## Phase 3: Grant Applications (Weeks 8-24)

Goal: apply to the highest-value grant programs identified in research.

### NLnet NGI Zero Commons Fund (target: June 2026 cycle)

- **Amount:** EUR 5,000-50,000 (scalable higher)
- **Deadline:** Calls open every 2 months. April 1 is not feasible. Target June 1 cycle.
- **Requirements:** Open-source project, open licenses, peaceful/humane purpose. Framework must be publicly available.
- **Fit:** Sherpa's MCP server, studio-core, and behavioral agent framework are open internet infrastructure.
- **Framing:** Emphasize `@sherpa/studio` as reusable infrastructure for Human+AI collaboration, not the consulting practice.
- [ ] Review successful NLnet applications for format and depth
- [ ] Draft application emphasizing ecosystem impact and open standards
- [ ] Submit by June 1 cycle deadline

### Anthropic Economic Futures Research Awards (rolling — apply when ready)

- **Amount:** $10,000-$50,000 + $5,000 Claude API credits
- **Deadline:** Rolling applications, 6-month deliverable window.
- **Requirements:** Empirical research on AI's economic impacts.
- **Fit:** Sherpa is building Human+AI collaboration tooling and can produce empirical data on collaborative productivity.
- [ ] Design a measurable study around Human+AI collaborative workflows
- [ ] Draft application with clear research methodology and deliverables
- [ ] Submit when study design is solid

### NSF SBIR Phase I (target: first open NSF AI solicitation, April-May 2026)

- **Amount:** ~$275,000-$300,000
- **Deadline:** NSF AI topics restarting April-May 2026 after SBIR reauthorization.
- **Requirements:** < 500 employees, >50% U.S. owned, PI employed 20+ hrs/week, all work in U.S. SAM.gov registration required.
- **Fit:** Behavioral agent framework, convention-based governance for AI agents — fits NSF AI "Trustworthy AI" and "Novel Innovations" subtopics.
- **Note:** NSF has flagged AI-generated proposals — over 64% identified as AI-written failed initial triage. Application must be human-authored.
- [ ] Monitor sbir.gov and seedfund.nsf.gov for AI topic solicitation reopening
- [ ] Create SBIR.gov account
- [ ] Draft technical narrative focusing on novel research contribution (not just product description)

### NSF PESOSE (deadline: September 1, 2026)

- **Amount:** Track 1: $300,000/1yr. Track 2-3: up to $1,500,000/2yr.
- **Deadline:** September 1, 2026.
- **Requirements:** U.S.-based, >50% U.S.-owned. For-profit LLCs explicitly eligible. University partnerships strongly preferred.
- **Fit:** Near-perfect. Feb 2026 Dear Colleague Letter specifically calls for open protocols for AI agent ecosystems, interoperability standards, and security for open-source AI infrastructure. Sherpa's MCP integration, behavioral agents, and governance conventions map directly.
- **This is the highest-value single opportunity.**
- [ ] Email PESOSE@nsf.gov to confirm for-profit LLC eligibility as sole PI
- [ ] Explore WWU CS department partnership — identify faculty working on AI agent systems
- [ ] Determine track (1 vs 2) based on project maturity at application time
- [ ] Draft application with 6-month runway

### Sovereign Tech Fund (rolling — target Q3 2026)

- **Amount:** EUR 50,000+ per project
- **Deadline:** Rolling applications.
- **Requirements:** OSI/FSF-licensed. Does not fund prototypes or user-facing applications — infrastructure only.
- **Fit:** Good if application focuses on studio-core, studio-mcp, convention-sync CLI — not the Studio web app.
- [ ] Assess whether framework maturity meets their "not a prototype" bar
- [ ] Draft application scoped to core packages and MCP server only

## Programs to Monitor

These are not actionable now but worth tracking:

| Program | Trigger | Action |
|---------|---------|--------|
| WA Spark Act (HB 1833) | Passes Senate + signed into law | Apply in first cycle — AI innovation grant through Commerce |
| GitHub Secure OSS Fund | 2026 application cycle opens | Apply — $10K + $150K Azure credits |
| NSF Convergence Accelerator NW | Focus areas announced (summer 2026) | Evaluate fit, apply if aligned |
| Microsoft AI for Good Open Call | 2026 cycle announced | Apply — WA-based entities, $5M total program |
| Small Business AI Training Act | Signed into law | Apply — AI training delivery grants, rural carve-out benefits Bellingham |

## Bellingham Ecosystem Engagement

These are free, require no entity, and strengthen all future applications:

| Resource | Contact | Value |
|----------|---------|-------|
| WWU SBDC | 360-650-7232, sbdc@wwu.edu | Free business advising, grant readiness |
| SCORE Bellingham | score.org/bellingham | Free mentoring from retired professionals |
| NWIRC | 360-255-7870, info@nwirc.com | Free incubator, AI Skills training |
| TAGNW | tagnw.org | Tech community networking |
| Bellingham Entrepreneurs | bellinghamentrepreneurs.com | Startup Academy, Pitch Fest |
| Port of Bellingham Econ Dev | econdev@portofbellingham.com, 360-676-2500 | ADO liaison, Innovation Zone access |

## Tax Incentives (activate after LLC formation)

- **WA Small Business B&O Credit** — sliding scale, potentially zero tax at low revenue
- **Advanced Computing R&D Credit** — up to $2M annual B&O credit for high-tech R&D
- **International Services B&O Credit** — credits for computer, data processing, consulting services employment
- **Downtown Urban Village Credit** — 90%/75%/50% graduated B&O credit over 3 years (if operating from qualifying downtown location)

## Timeline Summary

```
March 2026     SBDC appointment, start LLC formation
April 2026     EIN, bank account, SAM.gov registration
               Cloud credits applications (MS, Anthropic, Google, AWS)
May 2026       Framework publication decision + execution
               Monitor SBIR AI topic reopening
June 2026      NLnet application (June 1 cycle)
               Anthropic Economic Futures application
July 2026      SBIR application (if solicitation open)
               PESOSE application drafting begins
               WWU partnership exploration
August 2026    PESOSE application refinement
September 2026 PESOSE deadline (Sept 1)
               Sovereign Tech Fund application
```
