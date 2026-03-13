# Vector 4: Where Does Governance Sit?

**Question:** Is governance a layer within the agent OS, an application on top of the OS, or an orthogonal concern? Who else is building governance specifically?

## Key Discoveries

### Three Competing Framings of Governance Position

**1. Top-of-Stack Layer (AIMultiple)**
The 7-layer agentic AI stack places Observability & Governance as Layer 7, the topmost layer. This framing treats governance as an application-level concern that observes and constrains the layers below. Products in this layer: Langfuse, Lakera, Arize AI, OPA, BigID, OneTrust, Splunk, Datadog. Assessment: "High Moat" — governance creates enterprise trust moats.

**2. Cross-Cutting Concern (Splendor, LGA)**
Splendor treats Safety & Governance as one of six kernel primitives — woven through the runtime, not layered on top. The LGA paper distributes governance across four layers (sandbox, intent verification, zero-trust protocol, audit log). In this framing, governance is not a layer but a property that every layer must exhibit.

**3. The Kernel Itself (Agent OS)**
The imran-siddique Agent OS project makes governance the core abstraction. The kernel exists to enforce policies. Everything else (networking, reliability, runtime) is built on top of the governance kernel. Sub-millisecond action interception at the execution boundary.

### Who Is Building Governance Specifically

#### Enterprise Governance Platforms

- **Microsoft Agent 365** — Most comprehensive enterprise offering. GA May 2026. Unified visibility, logging, audit, cost tracking, multi-agent orchestration. Part of Microsoft 365 licensing.
  - [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365)

- **OneTrust** — Expanded platform with real-time AI governance and agent oversight. Captures ownership, purpose, integrations, data access, lineage, lifecycle changes. Single system of record for agent governance.
  - [SiliconANGLE coverage](https://siliconangle.com/2026/03/09/onetrust-expands-platform-real-time-ai-governance-agent-oversight-capabilities/)

- **AvePoint AgentPulse** — Multi-cloud AI agent discovery, policy enforcement, lifecycle control. Cross-platform agent inventory.
  - [AvePoint AgentPulse](https://www.avepoint.com/solutions/agentic-ai-governance)

- **Zenity** — AI agents compliance. Automate governance, stay audit-ready. Specifically targets agentic AI compliance.
  - [Zenity](https://zenity.io/use-cases/business-needs/ai-agents-compliance)

- **Human Agency** — Enterprise AI governance, operations, and deployment platform.
  - [Human Agency](https://www.humanagency.com/ai/enterprise-ai-governance)

#### Governance-as-Code / Policy-as-Code

- **Open Policy Agent (OPA)** — The de facto standard for policy-as-code. Decouples policy logic from application code. Used across the industry for agent governance.
  - [OPA context](https://www.nexastack.ai/blog/agent-governance-at-scale)

- **Agent OS (imran-siddique)** — YAML-based policies with pattern matching, rate limiting, RBAC, human approval workflows. MCPGateway for tool filtering. Integrated with 5+ frameworks (170K+ combined stars).
  - [GitHub](https://github.com/imran-siddique/agent-os)

- **Altimetrik Policy-as-Code** — "Policy as Code transforms from a compliance mechanism into a shared enterprise capability." Context-first infrastructure enforcing policies consistently across AI agents.
  - [Altimetrik blog](https://www.altimetrik.com/blog/policy-as-code-agentic-governance-ai-first-enterprise/)

#### Standards and Frameworks

- **Singapore IMDA MGF for Agentic AI** — World's first national governance framework for agentic AI. Launched at WEF Davos, January 2026. Four dimensions: risk assessment, human accountability, technical controls, end-user responsibility. Living document.
  - [IMDA press release](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai)
  - [Framework PDF](https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/mgf-for-agentic-ai.pdf)
  - [Baker McKenzie analysis](https://www.bakermckenzie.com/en/insight/publications/2026/01/singapore-governance-framework-for-agentic-ai-launched)

- **NIST AI Agent Standards Initiative** — Launched Jan-Feb 2026. Focus areas: security controls, risk management, safeguards for misuse/compromise/privilege escalation/unintended actions.
  - [Pillsbury analysis](https://www.pillsburylaw.com/en/news-and-insights/nist-ai-agent-standards.html)

- **Agentic Trust Framework (ATF)** — Open governance spec from Cloud Security Alliance. Zero Trust principles for AI agents. Five elements: identity management, behavioral monitoring, data governance, segmentation, incident response. Creative Commons licensed.
  - [CSA blog](https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents)
  - [ATF GitHub](https://github.com/massivescale-ai/agentic-trust-framework)

- **OWASP Agentic Top 10** — Standard risk taxonomy for agent security. 10 risk categories including goal hijack, tool misuse, identity/privilege, code execution, memory poisoning, inter-agent comms, cascading failures, human-agent trust.
  - Referenced in [Agent OS README](https://github.com/imran-siddique/agent-os)

#### Convention-Based Governance (Soft Governance)

- **OpenClaw SOUL.md** — Agent constitution file defining personality, values, behavioral guardrails. Injected into system prompt on every interaction. Three sections: Core Truths, Boundaries, Vibe. Soft enforcement (LLM compliance, no runtime interception).
  - [SOUL.md guide](https://openclaws.io/blog/openclaw-soul-md-guide)
  - [OpenClaw lab](https://openclawconsult.com/lab/openclaw-soul-md)

- **AGENTS.md** — Universal agent instructions (60K+ repos). Minimal, no schema, plain markdown. Deliberately simple. No governance semantics — instructions only.
  - [AGENTS.md standard](https://agents.md/)
  - [AGENTS.md pnote](https://pnote.eu/notes/agents-md/)

- **CLAUDE.md + .claude/rules/** — Claude Code's convention system. Glob-scoped rules, behavioral definitions, skill commands. The most sophisticated convention-as-code governance model in production.
  - [HumanLayer guide](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

- **Devin Playbooks** — Organizational SOPs for agents. Steps, success criteria, guardrails. Shareable within orgs. "Programs without rigid syntax."
  - [Cognition blog](https://cognition.ai/blog/devin-2)

### The Governance Gap

The LGA paper identifies a critical finding: **SOUL.md / AGENTS.md / CLAUDE.md are soft constraints enforced via LLM semantic interpretation.** They can be bypassed by prompt injection. Hard enforcement requires action-level interception (Agent OS approach) or independent verification (LGA Layer 2 judge model).

Current market reality (March 2026):
- **98% of enterprises** with 500+ employees deploy agentic AI
- **79% lack formal security policies** for these autonomous systems
- **Only 1 in 5** companies has a mature governance model (Deloitte)
- **Agent governance market**: $227-340M (2024-2025), projected $4.83B by 2034 (35-45% CAGR)

### The "Agentic Constitution" Concept

CIO Magazine proposes that organizations need an "Agentic Constitution" — the enterprise application of Constitutional AI. This is the governance document that defines what agents can and cannot do, applied at the organizational level.

- [CIO: Agentic Constitution](https://www.cio.com/article/4118138/why-your-2026-it-strategy-needs-an-agentic-constitution.html)

### Agent Lifecycle Management

OneReach AI defines six stages: ideation, evaluation, deployment, monitoring, optimization, retirement. This is operational lifecycle governance — managing agents through their full existence, not just their runtime behavior.

- [OneReach lifecycle](https://onereach.ai/blog/agent-lifecycle-management-stages-governance-roi/)

## Synthesis: Where Governance Actually Sits

Governance is not one thing. It's at least four:

1. **Runtime governance** — What can this agent do right now? (Action interception, capability tokens, sandbox boundaries)
2. **Convention governance** — What should this agent know and prioritize? (CLAUDE.md, AGENTS.md, SOUL.md, behavioral definitions)
3. **Lifecycle governance** — How does this agent move from creation to retirement? (Initiative lifecycle, approval workflows, versioning)
4. **Fleet governance** — How do multiple agents coordinate without conflict? (Task routing, resource allocation, conflict resolution)

Most Agent OS projects and enterprise platforms address #1 (runtime) and partially #4 (fleet). Convention-based systems (Claude Code, OpenClaw, Sherpa) address #2. Almost nobody addresses #3 (lifecycle).

**Sherpa's unique position: It addresses #2 (convention governance) and #3 (lifecycle governance) — the two layers that nobody else owns.**

## Implications for Sherpa

Sherpa's initiative lifecycle system (proposal -> plan -> activity -> implementation, with approval gates and integration review) is an agent lifecycle governance system. No other project in this research combines:
- Behavioral agent definitions with research-validated constraints
- Initiative lifecycle with approval workflows
- Convention-as-code distribution (rules, skills, CLAUDE.md generation)
- Studio UI for governance visualization

The gap: Sherpa has no runtime enforcement. Its conventions are advisory. The Agent OS kernel approach (sub-millisecond action interception) and the LGA approach (judge model verification) both suggest that soft governance needs hard enforcement boundaries to be production-grade.

## All URLs Encountered

- https://aimultiple.com/agentic-ai-stack
- https://splendor-os.org
- https://github.com/imran-siddique/agent-os
- https://arxiv.org/html/2603.07191
- https://www.microsoft.com/en-us/microsoft-agent-365
- https://siliconangle.com/2026/03/09/onetrust-expands-platform-real-time-ai-governance-agent-oversight-capabilities/
- https://www.gartner.com/reviews/market/ai-governance-platforms
- https://www.vectra.ai/topics/ai-governance-tools
- https://www.avepoint.com/solutions/agentic-ai-governance
- https://www.kore.ai/blog/7-best-agentic-ai-platforms
- https://www.cloudeagle.ai/blogs/10-best-ai-governance-platforms-in-2026
- https://a21.ai/agent-governance-patterns-policy-as-code-for-live-systems/
- https://www.nexastack.ai/blog/agent-governance-at-scale
- https://boomi.com/blog/agentic-ai-compliance/
- https://zenity.io/use-cases/business-needs/ai-agents-compliance
- https://www.humanagency.com/ai/enterprise-ai-governance
- https://hackernoon.com/agentic-ai-governance-frameworks-2026-risks-oversight-and-emerging-standards
- https://www.ewsolutions.com/agentic-ai-governance/
- https://www.altimetrik.com/blog/policy-as-code-agentic-governance-ai-first-enterprise/
- https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents
- https://www.pillsburylaw.com/en/news-and-insights/nist-ai-agent-standards.html
- https://www.paloaltonetworks.com/cyberpedia/what-is-agentic-ai-governance
- https://www.cio.com/article/4118138/why-your-2026-it-strategy-needs-an-agentic-constitution.html
- https://www.guild.ai/glossary/ai-agent-governance
- https://onereach.ai/blog/ai-governance-frameworks-best-practices/
- https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai
- https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/mgf-for-agentic-ai.pdf
- https://www.bakermckenzie.com/en/insight/publications/2026/01/singapore-governance-framework-for-agentic-ai-launched
- https://github.com/massivescale-ai/agentic-trust-framework
- https://openclaws.io/blog/openclaw-soul-md-guide
- https://openclawconsult.com/lab/openclaw-soul-md
- https://agents.md/
- https://pnote.eu/notes/agents-md/
- https://www.humanlayer.dev/blog/writing-a-good-claude-md
- https://cognition.ai/blog/devin-2
- https://onereach.ai/blog/agent-lifecycle-management-stages-governance-roi/
- https://accuknox.com/blog/runtime-ai-governance-security-platforms-llm-systems-2026
- https://www.microsoft.com/insidetrack/blog/shaping-ai-management-at-microsoft-with-agent-365-and-copilot-controls/
