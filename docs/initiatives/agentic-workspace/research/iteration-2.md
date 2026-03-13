# Iteration 2 — 2026-03-12

## What We Already Knew

Iteration 1 mapped the macro landscape: DIY workspace revolution (35% enterprise SaaS replacement, 50+ orchestrators), fleet minimap as missing primitive, three-standard convergence (Agent Skills + AGENTS.md + MCP under AAIF), products die but conventions endure, composition is the moat. 300+ sources. Four branch seeds created for fleet-minimap-ui, skills-marketplace-distribution, skill-composition-model, governance-regulatory-alignment.

## Research Vectors

Iteration 2 goes wide — nine vectors across six domains that iteration 1 didn't touch: cross-provider interoperability, agent memory/state, identity/trust, enterprise deployment, and observability/DevOps.

### Vector 1: Cross-Provider Agent Compatibility
**Question:** How do AGENTS.md, MCP, Agent Skills, and convention files work across different LLM providers?
**Full report:** [iteration-2/vector-1-cross-provider-agent-compatibility.md](iteration-2/vector-1-cross-provider-agent-compatibility.md)

**Key discoveries:**
- AGENTS.md supported by 24+ platforms (60K+ repos) — universal but deliberately minimal (no globs, no schema)
- Convention file fragmentation: 7+ formats (CLAUDE.md, AGENTS.md, GEMINI.md, .cursorrules, .windsurfrules, copilot-instructions.md, chatSkills)
- Only Claude Code and Cursor support glob-scoped rules — all others use flat markdown
- Five rule-porter tools emerged (rule-porter, rulesync, rulebook-ai, ai-rules-sync, ruler)
- VS Code v1.109+ runs Claude, Codex, and Copilot agents simultaneously with unified Agent Sessions view

### Vector 2: Runtime Abstraction Layers
**Question:** What abstracts the model layer for multi-provider agent systems?
**Full report:** [iteration-2/vector-2-runtime-abstraction-layers.md](iteration-2/vector-2-runtime-abstraction-layers.md)

**Key discoveries:**
- LiteLLM (self-hosted, 100+ models) and OpenRouter (managed SaaS) dominate the gateway layer
- CrewAI: 45.9K stars, 100K+ certified developers — fastest-growing orchestration framework
- goose (Block/AAIF): 27K stars, 25+ providers, 3K+ MCP servers — the AAIF-aligned open-source agent
- "Agentic Mesh" pattern: teams combine frameworks (LangGraph brain + CrewAI team + OpenAI tools)
- Framework wars mirror container wars — hyperscalers give away frameworks as on-ramps to paid inference

### Vector 3: Multi-Model Orchestration & Agent-to-Agent Protocols
**Question:** Can Claude agents and GPT agents collaborate? What protocols enable this?
**Full report:** [iteration-2/vector-3-multi-model-orchestration.md](iteration-2/vector-3-multi-model-orchestration.md)

**Key discoveries:**
- A2A (Agent-to-Agent Protocol): Google-created, Linux Foundation, 100+ enterprise supporters — Agent Cards (`/.well-known/agent.json`) for discovery
- Four-protocol consensus stack: MCP (tools) + A2A (agents) + WebMCP (web) + AG-UI (UI)
- AGNTCY (Cisco/Linux Foundation): 75+ companies, decentralized agent directory (DNS for agents), post-quantum crypto
- Gas Town: 20-30 Claude Code instances in parallel at $100/hr — validates fleet pattern at extreme cost

### Vector 4: The "Kubernetes for Agents" Space
**Question:** Who's building container-per-agent patterns and agent runtime abstraction?
**Full report:** [iteration-2/vector-4-kubernetes-for-agents.md](iteration-2/vector-4-kubernetes-for-agents.md)

**Key discoveries:**
- Agent Sandbox: Kubernetes primitive (SIG Apps, KubeCon Atlanta Nov 2025) — Sandbox CRD for stateful, singleton agent workloads with gVisor/Kata isolation
- kagent (CNCF Sandbox): Kubernetes-native agents as Custom Resources
- AgentGateway (Solo.io/Linux Foundation): enterprise MCP/A2A gateway — 300x memory, 35x throughput vs alternatives; protects against tool poisoning, rug-pulls, shadowing
- Docker MCP Gateway: containerized MCP servers with microVM isolation, provenance verification

### Vector 5: Cross-Tool Standard Convergence
**Question:** What governance bodies and convergence patterns shape agent interoperability?
**Full report:** [iteration-2/vector-5-cross-tool-standard-convergence.md](iteration-2/vector-5-cross-tool-standard-convergence.md)

**Key discoveries:**
- AAIF (Linux Foundation, Dec 2025): 8 platinum members (AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI) — governs MCP, AGENTS.md, goose
- NIST AI Agent Standards Initiative (Feb 2026): identity, authorization, security controls — RFI deadline April 2, 2026
- Governance-as-a-Service (GaaS, arxiv): academic validation — "governs through observable outputs without access to weights, prompts, or memory"
- MCP Dev Summit: April 2-3, 2026, New York

### Vector 6: Agent Memory, Long-Running State & Session Persistence
**Question:** How do agent fleets maintain context across sessions? What memory architectures exist?
**Full report:** [iteration-2/vector-6-agent-memory-state.md](iteration-2/vector-6-agent-memory-state.md)

**Key discoveries:**
- **Filesystem-as-memory is validated.** Letta benchmark: filesystem-only agent scored 74.0% on LoCoMo, beating Mem0's best graph variant (68.5%). "Agents are highly effective at using tools in their training data (such as filesystem operations)"
- Letta rebuilt toward git-backed markdown (Context Repositories / MemFS) — converging on what Sherpa already does
- Codex independently converged on `memories/MEMORY.md + skills/ + rollout_summaries/` directory layout
- Four paradigms compete: filesystem-as-memory (validated), vector+embeddings (mature), temporal knowledge graphs (highest accuracy — Zep 94.8% on DMR), LLM-as-OS tiered memory (evolving away)
- **Sleep-time compute** is the actionable pattern: background memory consolidation between sessions
- AGENTS.md is now a Linux Foundation standard — 60K+ repos, adopted by Claude Code, Codex, Cursor, Gemini CLI, Copilot
- Academic field consolidated around 47-author survey ("Memory in the Age of AI Agents", arxiv 2512.13564)

**Implications:**
- Sherpa's filesystem governance (activity.md, proposal.md, research/) is independently validated as the correct memory architecture
- Sleep-time compute (background consolidation between sessions) is the most actionable pattern Sherpa could adopt
- Git-native governance provides implicit temporal memory without explicit extraction

### Vector 7: Agent Identity, Trust & Capability-Based Security
**Question:** When agents act autonomously, what identity, authentication, and trust models are emerging?
**Full report:** [iteration-2/vector-7-agent-identity-trust.md](iteration-2/vector-7-agent-identity-trust.md)

**Key discoveries:**
- **Standards crystallizing fast.** NIST three-pillar initiative (Feb 2026). IETF has multiple OAuth extension drafts for agents (AAuth, OBO, Agentic JWT). OWASP published Top 10 for Agentic Applications.
- **OAuth adoption is terrible:** Only 8.5% of 5,000+ MCP servers use OAuth (Astrix research). 53% rely on static API keys. 79% pass keys via environment variables.
- **Capability-based security is the right model:** Shift from credentials (who you are) to capabilities (what you can do). Tenuo provides cryptographic warrants with ~27μs offline verification, monotonic attenuation, native MCP/A2A integration.
- **Cryptographic provenance exists:** Sigstore A2A does keyless signing of Agent Cards. Gitsign does keyless git commit signing. Agent Identity Protocol (AIP) provides MCP-based wallets.
- **Enterprise products launched:** Microsoft Entra Agent ID treats agents as first-class identity principals. CyberArk shipped privilege controls (GA Dec 2025). Devin has two-tier RBAC.
- **Supply chain threat acute:** 36.82% of agent skills have security flaws, 13.4% critical (Snyk ToxicSkills, 3,984 skills). MCP attack surface: tool poisoning, rug pulls, confused deputy.

**Implications:**
- Sherpa's behavioral definitions map naturally to capability warrants (delegation only narrows authority)
- Immediate actions: agent identity per worktree via bot accounts, Gitsign for keyless commit signing, PreToolUse enforcement hooks
- Capability-based security aligns with Sherpa's behavioral constraints model

### Vector 8: Enterprise Agent Fleet Deployment
**Question:** Who is actually running agent fleets in production? What do enterprises need?
**Full report:** [iteration-2/vector-8-enterprise-fleet-deployment.md](iteration-2/vector-8-enterprise-fleet-deployment.md)

**Key discoveries:**
- **Microsoft Agent 365** (Frontier preview, March 2026): Entra Agent ID (agents as org-chart entities), Agent Blueprints (IT-approved templates), Purview integration (audit, DLP, eDiscovery, retention), Defender threat protection, framework-agnostic SDK, MCP-native tool access (Work IQ)
- **Salesforce Agentforce:** Einstein Trust Layer, hybrid reasoning (deterministic + LLM), free tier via Foundations
- **Amazon Bedrock Guardrails:** 6 safeguards, cross-model ApplyGuardrail API, enterprise adopters (PwC, Remitly, KONE)
- Case studies: Klarna (700 agent equivalents), Shopify (AI-first hiring policy), Intercom Fin (51% resolution rate, $0.99/resolution)
- **What breaks at scale:** identity sprawl, shadow agents, cascading failures (95% reliability × 20 steps = 36% success), runaway cost ($47K incident), coordination contention, audit burden
- Per-agent-instance licensing replacing per-seat pricing

**Implications:**
- Microsoft validates Sherpa's thesis but targets runtime governance. Sherpa targets development governance.
- Enterprise requirements matrix: audit trail, DLP, eDiscovery, identity governance, conditional access, insider risk management, communication compliance
- Per-agent identity is the enterprise pattern — agents treated as workforce members, not tools

### Vector 9: Agent Observability & the Emerging DevOps Stack
**Question:** What's the monitoring, tracing, debugging, and CI/CD story for AI agents?
**Full report:** [iteration-2/vector-9-agent-observability-devops.md](iteration-2/vector-9-agent-observability-devops.md)

**Key discoveries:**
- **No single "Datadog for agents" yet.** Market fragments: incumbent APM (Datadog, Dynatrace), AI-native startups (Langfuse → acquired by ClickHouse Jan 2026, Braintrust, Arize, AgentOps), framework-native (LangSmith, W&B Weave)
- **OpenTelemetry becoming the substrate.** GenAI SIG semantic conventions: `gen_ai.agent.name`, `gen_ai.operation.name`, etc. — experimental but adopted by Datadog, Langfuse, LangSmith. Two supplementary schemas: OpenInference (Arize), OpenLLMetry (Traceloop)
- **Eval stack maturing into CI/CD.** DeepEval (pytest-style, 50+ metrics), Inspect AI (UK AISI, used by Anthropic/DeepMind), Promptfoo (acquired by OpenAI, March 2026). Anthropic guidance: start with 20-50 tasks from real failures, grade outcomes not paths
- **Agent versioning is unsolved.** Behavior depends on four layers (code, prompts, models, context) each needing independent version tracking
- **"AgentOps" crystallizing as discipline.** IBM formally defined it. Galileo Agent Control (open-source, Apache 2.0, March 2026) as governance control plane
- **Academic reliability research:** "Towards a Science of AI Agent Reliability" (Feb 2026) proposes 12 metrics; key finding: capability and reliability are independent dimensions
- **Complete open-source stack exists:** Langfuse (tracing) + OpenLLMetry (instrumentation) + LiteLLM (gateway) + DeepEval (evals) + Galileo Agent Control (governance)

**Implications:**
- Sherpa's filesystem approach (behavioral roles as YAML in git) is ahead of most frameworks on versioning
- Need a concept of "configuration snapshots" for replay/rollback
- OTel GenAI conventions could power Studio's fleet minimap and observability features

## Synthesis

Nine vectors across six domains reveal a landscape that has matured dramatically since iteration 1, with five cross-cutting patterns:

**1. Filesystem Governance Is Independently Validated Everywhere.** The most striking convergence: Letta rebuilt toward git-backed markdown files. Codex converged on MEMORY.md + skills/ directories. AGENTS.md reached 60K+ repos as a Linux Foundation standard. Sherpa's core bet — that filesystem artifacts are the right governance medium — is now validated by benchmarks (Letta: filesystem beats specialized memory tools), by market adoption (AGENTS.md 24+ platforms), and by independent convergence (Codex, Letta MemFS, Manus todo.md). This is not a bet anymore; it's a fact.

**2. The Four-Protocol Stack + Governance Gap = Sherpa's Position.** The communication layer is settling: MCP (tools) + A2A (agents) + WebMCP (web) + AG-UI (UI). All under Linux Foundation. Runtime is settling: Kubernetes Agent Sandbox, Docker MCP Gateway, AgentGateway. Model abstraction is settling: LiteLLM, OpenRouter. Enterprise compliance is settling: Entra Agent ID, Purview, Bedrock Guardrails. What remains vacant: **behavioral governance of agent conduct** — initiative lifecycle, behavioral constraints, convention distribution, HITL review. The GaaS paper validates this academically. NIST creates regulatory pull for it. Microsoft Agent 365 validates the market but serves a different layer (runtime governance vs. development governance).

**3. The Security Crisis Creates Urgency.** 36.82% of agent skills have security flaws. Only 8.5% of MCP servers use OAuth. 79% pass keys via environment variables. Capability-based security (Tenuo warrants, monotonic attenuation) maps naturally to Sherpa's behavioral constraints — delegation only narrows authority. Meanwhile, NIST, OWASP, IETF, and CSA are all publishing agent security standards. The timing window for "governance framework with built-in security" is now.

**4. Enterprise Needs Validate the Framework Model.** Microsoft Agent 365's architecture — agent identity, blueprints, observability, compliance — confirms what enterprises need. But Microsoft governs agents in production. Nobody governs the process of building, researching, planning, and shipping with agents. The enterprise requirements matrix (audit trail, DLP, eDiscovery, identity governance, conditional access) maps to Sherpa primitives: activity.md = audit trail, initiative lifecycle = approval workflow, behavioral definitions = blueprint templates.

**5. The Observability Stack Is Coalescing Around OTel.** OpenTelemetry GenAI semantic conventions define agent spans, tool call events, and cost metrics. The eval ecosystem (DeepEval, Inspect AI, Promptfoo) is becoming CI/CD for agent behavior. Sherpa's versioned filesystem artifacts (behavioral roles in git, activity logs, research iterations) provide the "configuration snapshot" that every observability platform struggles to capture. Studio can consume OTel traces to power fleet minimap without building custom telemetry.

## All Sources

See individual vector reports for comprehensive URL libraries (500+ unique URLs total). Key sources by domain:

### Standards & Governance Bodies
- [AAIF](https://aaif.io/) — Linux Foundation, 8 platinum members
- [NIST AI Agent Standards Initiative](https://www.nist.gov/caisi/ai-agent-standards-initiative) — US government, RFI deadline April 2
- [A2A Protocol](https://a2a-protocol.org/latest/) — agent-to-agent standard, 100+ enterprise supporters
- [AGENTS.md](https://agents.md/) — 60K+ repos, 24+ tools
- [AG-UI](https://docs.ag-ui.com/) — agent-to-user protocol
- [WebMCP](https://webmcp.link/) — W3C agent-to-web standard
- [AGNTCY](https://docs.agntcy.org/) — Cisco interoperability, 75+ companies
- [GaaS paper](https://arxiv.org/html/2508.18765v2) — Governance-as-a-Service academic validation
- [OWASP Agentic Top 10](https://owasp.org/) — agent security risks

### Enterprise Platforms
- [Microsoft Agent 365](https://learn.microsoft.com/en-us/microsoft-agent-365/overview) — Entra Agent ID, Blueprints, Purview
- [Salesforce Agentforce](https://www.salesforce.com/agentforce/) — Trust Layer, Agent Builder
- [Amazon Bedrock Guardrails](https://aws.amazon.com/bedrock/guardrails/) — 6 safeguards, cross-model
- [LangSmith Platform](https://www.langchain.com/langgraph-platform) — agent registry, enterprise deployment

### Agent Frameworks & Runtime
- [goose (Block/AAIF)](https://github.com/block/goose) — 27K stars, 25+ providers
- [CrewAI](https://github.com/crewAIInc/crewAI) — 45.9K stars, 100K+ developers
- [Agent Sandbox (K8s)](https://github.com/kubernetes-sigs/agent-sandbox) — Kubernetes primitive
- [AgentGateway](https://agentgateway.dev/) — enterprise MCP/A2A gateway

### Memory & State
- [Letta Context Repositories](https://www.letta.com/blog/context-repositories) — git-backed markdown memory
- [Letta benchmarks](https://www.letta.com/blog/benchmarking-ai-agent-memory) — filesystem beats specialized tools
- [Zep/Graphiti](https://arxiv.org/abs/2501.13956) — temporal knowledge graphs, 94.8% on DMR
- [Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564) — 47-author survey

### Identity & Security
- [Entra Agent ID](https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents)
- [Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) — 36.82% flawed, 13.4% critical
- [Astrix MCP OAuth study](https://astrix.security/) — 8.5% OAuth adoption
- [Sigstore A2A](https://sigstore.dev/) — keyless agent card signing

### Observability & DevOps
- [OTel GenAI Agent Spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/) — semantic conventions
- [Langfuse](https://langfuse.com/) — acquired by ClickHouse, Jan 2026
- [DeepEval](https://github.com/confident-ai/deepeval) — pytest-style agent evals
- [Galileo Agent Control](https://galileo.ai/) — open-source governance control plane
- [AI Agent Reliability paper](https://arxiv.org/) — 12 metrics, capability ≠ reliability

### Convention Portability
- [rule-porter](https://github.com/nedcodes-ok/rule-porter), [rulesync](https://github.com/dyoshikawa/rulesync), [rulebook-ai](https://github.com/botingw/rulebook-ai), [ai-rules-sync](https://github.com/lbb00/ai-rules-sync) — conversion tools

## Proposals Generated

- Updated `docs/initiatives/agentic-workspace/proposal.md` — strengthened with iteration 2 evidence

## Open Questions for Next Iteration

1. **A2A integration concretely for Sherpa** — How would a Sherpa-governed agent expose itself as an A2A Agent Card? What task lifecycle states map to initiative lifecycle states?

2. **Sleep-time compute for Sherpa** — How should background memory consolidation work between sessions? Automatic extraction from activity.md into summarized state? What triggers consolidation?

3. **Convention sync fidelity** — When converting glob-scoped .claude/rules to flat AGENTS.md, what's actually lost? Is warning-based approach sufficient, or does Sherpa need multi-format native authoring?

4. **OTel integration for Studio** — Should Studio consume OTel GenAI traces natively? What's the architecture for fleet minimap powered by OTel agent spans vs. custom WebSocket?

5. **Capability warrants from behavioral definitions** — Can Sherpa's behavioral agent YAML translate to Tenuo-style capability warrants? What's the monotonic attenuation model for initiative-scoped delegation?

6. **Agent versioning snapshots** — How should Sherpa capture "configuration snapshots" (behavioral role + skill versions + convention state) for replay and rollback? Git tags? Dedicated manifests?

7. **Enterprise compliance mapping** — Which specific EU AI Act articles and NIST SP 800-series provisions map to which Sherpa governance primitives? Is activity.md sufficient as an audit log?
