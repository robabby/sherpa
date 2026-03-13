# Iteration 3 — 2026-03-12

## What We Already Knew

Iteration 1 established the macro landscape: the SaaSpocalypse, fleet minimap as missing primitive, governance gap as opportunity, skill composition as moat, three-standard convergence. Iteration 2 mapped the multi-provider world: four-protocol stack (MCP + A2A + WebMCP + AG-UI), convention portability across 24+ tools, governance layer still vacant. This iteration goes deep on four strategic open questions.

## Research Vectors

### Theme A: The Agent OS Race (Vectors 1-6)

**Question:** What is the emerging "Agent Operating System" layer, and where does governance fit?

**Full reports:** [vector-1-who-is-building-an-agent-os.md](iteration-3/vector-1-who-is-building-an-agent-os.md) through [vector-6-open-source-agent-os.md](iteration-3/vector-6-open-source-agent-os.md)

**Key discoveries:**
- The "Agent OS" label is claimed by five distinct layers: runtime infrastructure (AWS AgentCore, K8s Agent Sandbox), enterprise control plane (Microsoft Agent 365, GitHub Agent HQ), agent framework (CrewAI, LangGraph, Agno), convention system (CLAUDE.md, AGENTS.md, SOUL.md), and protocol stack (MCP + A2A)
- The 7-Layer Agentic AI Stack (AIMultiple) rates Governance as **"High Moat"** — everything below is commoditized
- Governance decomposes into four types: runtime (#1), convention (#2), lifecycle (#3), fleet (#4). Sherpa uniquely owns #2 and #3.
- The LGA paper (arXiv 2603.07191) proves soft conventions are bypassed by prompt injection — hard enforcement boundaries are necessary
- Agent governance market: $227-340M growing at 35-45% CAGR to $4.83B by 2034. 98% of enterprises deploy agents, 79% lack governance (Deloitte)
- Agent OS (imran-siddique): sub-millisecond policy enforcement, 4-layer stack, integrated with 5+ frameworks — architecturally complementary to Sherpa

**Implications:**
- **Sherpa is not an Agent OS — it's the constitution that every Agent OS needs.** The "OPA of agent governance" positioning.
- Convention governance + lifecycle governance is a unique niche. No competitor owns both.
- Sherpa needs an enforcement mechanism (hooks or Agent OS kernel integration) to close the soft/hard governance gap.

### Theme B: Skill Composition Specification (Vectors 7-8)

**Question:** What concrete skill/workflow composition model should Sherpa adopt?

**Full reports:** [vector-7-governance-regulatory-requirements.md](iteration-3/vector-7-governance-regulatory-requirements.md), [vector-8-skill-composition-specification.md](iteration-3/vector-8-skill-composition-specification.md)

**Key discoveries:**
- **Agent Skills standard has NO composition primitive.** Skills are flat, independent units by design. 30+ tools adopt the same format. Composition happens in the agent runtime, not the skill format.
- **AgentSkillOS (arxiv 2603.02176):** DAG orchestration outperforms flat invocation by 30-45% across all tested scales. Quality-First DAGs scored 100.0 vs 17.2-48.1 for flat pool. But no concrete schema published.
- **MCP has no Skills primitive.** Discussion #1779 proposes one but remains open with no RFC.
- **Workflow engines diverge:** Temporal (code-as-workflow), Windmill OpenFlow (formal JSON DAG), Prefect (removed DAG constraint). No consensus on the right model.
- **Portability is at the individual skill level, NOT composition level.** A Sherpa pipeline is NOT portable across agents.
- **Security is alarming:** 36.82% of skills flawed, 13.4% critical (Snyk). No permission scoping in the standard.

**Implications:**
- Don't build a new DAG spec. Define a **pipeline manifest** alongside skills — YAML declaring stages, artifact patterns, conditions. Lightweight, filesystem-native.
- Sherpa's filesystem-as-bus (skills communicate via file artifacts) is inherently portable.
- Composition security needs a trust boundary model.

### Theme C: AI Governance Regulation → Framework Requirements (Vector 7)

**Question:** What specific technical capabilities must regulation demand from a governance framework?

**Full report:** [vector-7-governance-regulatory-requirements.md](iteration-3/vector-7-governance-regulatory-requirements.md)

**Key discoveries:**
- **EU AI Act (Aug 2026):** Articles 9-15 mandate continuous risk management, data governance, 9-section technical documentation maintained 10 years, automatic tamper-resistant event logging with cryptographic verification, human oversight with intervention capability, accuracy/robustness/cybersecurity. Penalties up to EUR 30M or 6% global revenue.
- **Colorado SB 24-205 (Jun 2026):** Separate developer/deployer obligations. Risk management aligned with NIST RMF or ISO 42001, annual impact assessments, consumer disclosure, human review of adverse decisions.
- **US state fragmentation:** 38 states adopted ~100 AI measures in 2025. 1,000+ bills introduced. Federal preemption exec order being challenged.
- **OWASP Top 10 for Agentic Applications (Dec 2025):** ASI01-ASI10 covering goal hijack, tool misuse, identity abuse, supply chain, cascading failures, rogue agents. Core principle: "Least Agency."
- **Compliance-as-code:** OPA/Rego is industry standard. MCP gateway pattern emerging. OpenClaw provides append-only JSONL audit logging.
- **AI governance platform market:** $309M growing to $4.8B. Credo AI leads. Organizations with governance platforms are 3.4x more effective.

**Implications:**
- Sherpa must build: structured audit logging, policy-as-code engine, risk management templates (Annex IV), agent identity/permission system, impact assessment templates, kill switch infrastructure, and compliance mapping dashboard in Studio.
- Sherpa's existing initiative lifecycle (proposal → review → approval → execution → activity.md) maps to regulatory risk management processes — but needs to become structured, automatic, and auditable.

### Theme D: Convention Distribution Architecture (Vector 9)

**Question:** How should conventions be packaged, distributed, and maintained across projects?

**Full report:** [vector-9-convention-distribution-architecture.md](iteration-3/vector-9-convention-distribution-architecture.md)

**Key discoveries:**
- **shadcn registry + Copier lifecycle is the right distribution model.** shadcn copies source files (ownership). Copier manages three-way merge updates with provenance tracking. `node-diff3` provides the JS implementation.
- **Microsoft APM compiles `apm.yml` → AGENTS.md + CLAUDE.md.** Validates "compile from authoritative source to cross-tool outputs."
- **No convention marketplace exists.** Skills marketplaces are commodity (351K+). Convention marketplaces are vacant. Six rule tools found, none with three-way merge.
- **Claude Code plugins cannot distribute `.claude/rules/` files.** Issue #14200 (28+ thumbs-up, no response since Dec 2025).
- **The Codified Context paper (arXiv 2602.20478):** Context infrastructure = 24.2% of a 108K-line codebase. **Staleness is the primary failure mode** — drift detection is the mitigation.
- **ETH Zurich (arXiv 2602.11988):** Verbose context hurts performance by 3%, costs +20%. Only non-inferable constraints help.
- **Convention versioning needs behavioral SemVer.** Breaking change = behavior change. Agent versioning is a recognized enterprise challenge.

**Implications:**
- `sherpa sync` should implement shadcn-style copy + Copier-style three-way merge + `sherpa.manifest.json` provenance tracking.
- Generate AGENTS.md as a compilation target from `.claude/rules/` + behavioral definitions.
- L4 Governance (evolution + provenance + merge) remains unoccupied across the entire ecosystem.
- `*.local.md` override pattern solves convention sync conflicts.

## Synthesis

Four research themes converge on a remarkably coherent strategic picture:

### 1. Sherpa Is the Constitution, Not the Operating System

The Agent OS race has five competing paradigms: runtime, control plane, framework, convention, protocol. None is "the" Agent OS — they're layers. Sherpa's positioning is not to compete on any of these layers but to be the **constitutional layer** that plugs into all of them. Every reference architecture has a governance slot. None fills it comprehensively. Sherpa fills it.

The metaphor: Sherpa is OPA, not Kubernetes. OPA doesn't run containers — it defines policy that runtimes enforce. Sherpa doesn't run agents — it defines conventions that runtimes follow.

### 2. The Soft/Hard Governance Gap Is the Critical Technical Challenge

Convention-based governance (SOUL.md, AGENTS.md, CLAUDE.md) is proven effective for cooperative agents but bypassed by prompt injection (LGA paper: needs independent judge model for 93-98% interception). Meanwhile, EU AI Act (Aug 2026) demands "automatic tamper-resistant event logging" and "human oversight with intervention capability."

The gap: Sherpa writes policy, but policy without enforcement is advisory. The path forward is a `sherpa enforce` hook (Claude Code `PreToolUse` interception) that validates agent actions against behavioral definitions. This is a 1-session buildable that closes the soft/hard gap without building a full runtime.

### 3. Composition Is a Manifest, Not a DAG

The skill composition research is clear: don't build a new DAG specification. AgentSkillOS proposed one and didn't publish a reusable schema. Prefect removed the DAG constraint entirely. What works is a **pipeline manifest** — a lightweight YAML file that sits alongside skills, declaring stages, artifact patterns, and conditions. Sherpa's filesystem-as-bus pattern (skills communicate via file artifacts) is inherently portable. The composition spec formalizes what already works:

```yaml
# .claude/pipelines/initiative-lifecycle.yaml
name: initiative-lifecycle
stages:
  - skill: recursive-research
    produces: ["docs/initiatives/*/research/**", "docs/initiatives/*/proposal.md"]
  - skill: integration-review
    consumes: ["docs/initiatives/*/proposal.md"]
    produces: ["docs/initiatives/*/activity.md"]
  - skill: plan-tasks
    consumes: ["docs/initiatives/*/proposal.md"]
    produces: ["docs/tasks/*.md"]
```

### 4. Convention Distribution Is Sherpa's Defensible Layer

The L4 Governance layer (convention evolution + provenance + three-way merge) remains **completely unoccupied**. Six convention distribution tools exist — all use concatenation or symlinks. No three-way merge. No provenance tracking. No versioning. No marketplace.

`sherpa sync` with `node-diff3` three-way merge, `sherpa.manifest.json` provenance, and AGENTS.md compilation would be the first tool to own this layer. The `*.local.md` pattern solves the ownership problem (framework files synced upstream, consumer files never overwritten).

### 5. Regulation Creates Urgency for Everything Above

EU AI Act (Aug 2026) and Colorado AI Act (Jun 2026) transform "governance is nice to have" into "governance is mandatory." The specific requirements — audit logging, risk management, human oversight, impact assessments — map directly to Sherpa's existing primitives (activity.md, initiative lifecycle, HITL review). But they need to become structured, automatic, and auditable.

The $4.8B governance platform market growing at 35-45% CAGR validates the commercial opportunity. Organizations with governance platforms are 3.4x more effective (Credo AI). The window: build the governance framework before incumbents (Microsoft Agent 365, Credo AI) expand to cover convention governance.

### The Single Most Important Insight

**All four themes point to the same gap: the policy-enforcement binding layer.** The Agent OS race needs a constitutional layer (governance). Skill composition needs a manifest layer (pipeline spec). Convention distribution needs a lifecycle layer (sync + provenance). Regulation needs an audit layer (logging + oversight). These are all facets of the same thing: **the framework that connects what agents should do (conventions) with what agents actually do (runtime behavior).**

Sherpa already has the "should" side (behavioral definitions, initiative lifecycle, conventions). The "actually" side needs: (1) enforcement hooks, (2) pipeline manifests, (3) convention sync with drift detection, and (4) structured audit logging. Four buildable capabilities that together close the gap.

## All Sources

See individual vector reports for comprehensive URL libraries (500+ unique URLs total across 9 vectors).

### Agent OS and Architecture
- [7-Layer Agentic AI Stack](https://aimultiple.com/agentic-ai-stack) — Governance = Layer 7, High Moat
- [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365) — Enterprise control plane
- [AWS Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) — Runtime + Identity
- [Agent OS (imran-siddique)](https://github.com/imran-siddique/agent-os) — Kernel-level governance
- [AIOS](https://github.com/agiresearch/AIOS) — Academic agent kernel
- [LGA paper](https://arxiv.org/html/2603.07191) — Defense-in-depth governance (93-98% interception)
- [AgenticOS 2026 Workshop](https://os-for-agent.github.io/) — ASPLOS 2026

### Skill Composition
- [AgentSkillOS](https://arxiv.org/abs/2603.02176) — DAG orchestration outperforms flat by 30-45%
- [Agent Skills standard](https://agentskills.io) — 30+ tools, no composition primitive
- [MCP spec discussions #1779](https://github.com/modelcontextprotocol/specification/discussions/1779) — Skills-for-Prompts proposal
- [Windmill OpenFlow](https://www.windmill.dev/docs/openflow) — Only formal open DAG spec
- [MetaGPT](https://arxiv.org/abs/2308.00352) — SOP pipelines outperform ad-hoc composition

### Governance Regulation
- [EU AI Act Articles 9-15](https://artificialintelligenceact.eu/) — Technical requirements
- [Colorado SB 24-205](https://leg.colorado.gov/bills/sb24-205) — US AI regulation
- [OWASP Agentic Top 10](https://owasp.org/www-project-top-10-for-agentic-applications/) — Security taxonomy
- [NIST AI Agent Standards](https://www.pillsburylaw.com/en/news-and-insights/nist-ai-agent-standards.html) — Federal initiative
- [Agentic Trust Framework](https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents) — Zero Trust for agents

### Convention Distribution
- [shadcn registry](https://ui.shadcn.com/docs/registry) — Copy-not-install model
- [Copier updating](https://copier.readthedocs.io/en/stable/updating/) — Three-way merge lifecycle
- [node-diff3](https://www.npmjs.com/package/node-diff3) — JS three-way merge library
- [Microsoft APM](https://github.com/microsoft/apm) — apm.yml → AGENTS.md + CLAUDE.md
- [GitHub: AGENTS.md lessons](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) — Best practices from 2,500 repos
- [Codified Context paper](https://arxiv.org/html/2602.20478v1) — 24.2% of codebase is context infrastructure
- [ETH Zurich context study](https://arxiv.org/abs/2602.11988) — Verbose context hurts -3%, costs +20%
- [Claude Code issue #14200](https://github.com/anthropics/claude-code/issues/14200) — Rules in plugins request

### Security
- [Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) — 36.82% of skills flawed
- [npm Sigstore provenance](https://blog.sigstore.dev/npm-provenance-ga/) — Keyless signing
- [MCP tool poisoning](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) — Tool shadowing attacks

## Proposals Generated

Updated `docs/initiatives/agentic-workspace/proposal.md` — strengthened rationale with Agent OS positioning, regulatory urgency, and composition model findings.

### New seeds:

1. **sherpa-enforce** (high priority) — Claude Code hooks validating agent actions against behavioral definitions. Closes soft/hard governance gap. Feeds agent-infrastructure.
2. **pipeline-manifest-spec** (medium priority) — Formal YAML spec for skill composition via filesystem artifacts. Feeds sherpa-framework-extraction.
3. **compliance-mapping** (medium priority) — EU AI Act / Colorado AI Act requirement → Sherpa capability mapping. Feeds governance-regulatory-alignment branch.

## Open Questions for Next Iteration

1. **Can `PreToolUse` hooks read behavioral definitions and block non-compliant tool calls with acceptable latency?** This is the make-or-break question for `sherpa enforce`.

2. **Should Sherpa adopt Microsoft APM's `apm.yml` as its manifest format or define its own?** APM handles cross-tool compilation but lacks lifecycle management. Adopting it means external governance of the format.

3. **What's the Rego/OPA equivalent for agent governance?** Is there a policy language more expressive than YAML but more structured than CLAUDE.md? This determines whether `sherpa enforce` evaluates markdown or a formal policy language.

4. **How should convention drift detection work?** The Codified Context paper's approach (parse git commits against subsystem-file mappings) could be `sherpa sync`'s killer feature. What's the concrete implementation?

5. **Can Sherpa behavioral definitions compile to Agent OS (imran-siddique) YAML policies?** If tractable, Sherpa becomes a governance authoring layer with runtime enforcement.
