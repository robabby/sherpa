---
started: 2026-03-17
worktree: null
---

# Agentic Governance Landscape — Activity

## 2026-03-17
- Initiative proposed and approved
- Beginning /rr iteration 1: vendor landscape + regulatory scan (vectors 1-2 from proposal)
- Completed cloud provider tier research (Vector 1, cloud provider segment): AWS AgentCore, Google Cloud Agent Engine, Microsoft Agent 365
- Output: `research/cloud-provider-agent-governance.md` — comparative matrix, 7 open questions, Sherpa positioning implications
- Completed demand-side signals research (Vector 3: Market Segmentation — Who's Buying)
- Sourced from: Deloitte State of AI 2026 (3,235 leaders, 24 countries), IBM CEO Study 2025 (2,000 CEOs, 33 countries), IBM IBV governance ROI study (1,000 leaders, 17 industries), McKinsey State of AI 2025, Menlo Ventures State of GenAI 2025, Gartner AIGP Market Guide, FINRA 2026, NASCIO 2026, Axial Search (146 AI governance job postings), IBM Data Breach 2025
- Output: `research/demand-side-signals.md` — 6 key discoveries, 5 buyer personas with purchase triggers, industry-specific signals (FinServ/Healthcare/Government), market size data, SMB vs enterprise analysis, 7 open questions
- Completed coding agent governance research (Vector 1 developer tier + Vector 3 developer teams + Vector 4 product categories): Cursor, GitHub Copilot, Claude Code, Devin, Windsurf, Amazon Q Developer, Sourcegraph Cody
- Also covered: AI code provenance tracking (Agent Trace, Git AI, AI Provenance Protocol), code review as governance (CodeRabbit, Qodo), enterprise deployments (Goldman Sachs/Devin), regulatory drivers (EU AI Act Article 50)
- Output: `research/coding-agent-governance.md` — feature matrix across 7 agents, governance gap analysis, Sherpa positioning implications, 7 open questions
- Completed startup funding research (Vector 2): 10 known vendors profiled, 6 new entrants (2025-2026), 4 acquisitions totaling $2.6B+
- Output: `research/iteration-1/vector-2-startup-funding-traction.md`
- Completed open-source governance research (Vector 3): Microsoft Agent Governance Toolkit, Galileo Agent Control, framework-native governance comparison matrix
- Output: `research/iteration-1/vector-3-open-source-governance.md`
- All 5 vectors synthesized into `research/iteration-1.md` — core finding: three-layer governance stack with behavioral layer empty
- Proposal updated to in-progress with corrected state snapshot
- Research README created with open questions for iteration 2

## 2026-03-18
- **Stress test executed** — tested 5 of 8 assumptions via parallel falsification agents
- **3 load-bearing assumptions refuted:** "layer is empty" (partially), "devs adopt bottom-up" (fully), "conventions achieve reliable compliance" (as standalone)
- **1 refuted:** "first-mover advantage is durable" — advantage is architectural (cross-agent), not temporal
- **2 inconclusive:** three-layer segmentation, platform absorption risk
- **1 human-required:** willingness-to-pay needs customer discovery, not more research
- Key finding: "Rules in prompts are requests. Hooks in code are laws." — Sherpa has zero hooks configured
- Key finding: AGENTS.md now under Linux Foundation AAIF with all major AI labs. Convention file format is being commoditized.
- Key finding: Snyk playbook is the model — developer adoption bottom-up, enterprise sales top-down, governance as byproduct not pitch
- Revised thesis: value is in the *integration* layer (making conventions executable + enforceable + lifecycle-managed), not the convention format itself
- Output: `stress-test.md`, `decisions/0001-stress-test-results.md`
- **Three convergence signals to watch:** Agent 365 GA (May 2026), AGENTS.md AAIF evolution, Claude Code governance expansion
- **/radar produced** — 28 items classified: 5 Adopt, 7 Trial, 9 Assess, 7 Hold
- Top Adopt items: hooks enforcement, AGENTS.md compatibility, Snyk GTM playbook, cross-agent portability moat, defense-in-depth architecture
- Top Hold items: convention-only governance, "governance" as developer pitch, "first in empty market" positioning, enterprise platform competition
- Output: `radar.md`, `deliverables/governance-radar.json`, `decisions/0002-adopt-hooks-enforcement.md`, `decisions/0003-hold-convention-only.md`
