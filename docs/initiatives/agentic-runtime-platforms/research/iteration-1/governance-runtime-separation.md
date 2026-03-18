---
doc-type: research
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-17
last-verified: 2026-03-17
source-initiatives:
  - agentic-runtime-platforms
---

> **AI-generated** 2026-03-17 · Awaiting human review
> Sources: agentic-runtime-platforms

# Governance-over-Runtime Separation in Agentic AI Frameworks

Research question: Are other agentic AI frameworks solving the governance-over-runtime separation? Do they provide adapter/plugin patterns for runtime-agnostic agent orchestration? How do they separate "what an agent should do" from "how the agent executes"?

---

## Key Discoveries

### 1. The Auton Framework provides the closest architectural analog to Sherpa's RuntimeAdapter

The Auton Agentic AI Framework (Feb 2026 paper) implements an explicit **Cognitive Blueprint / Runtime Engine** split that directly mirrors Sherpa's governance-over-runtime intent:

- **Cognitive Blueprint (AgenticFormat):** A declarative, language-agnostic YAML/JSON schema specifying agent identity, capabilities, constraints, tool bindings, memory configuration, and output contracts. "The blueprint is a data artifact; it contains no executable code." ([arxiv.org/html/2602.23720v1](https://arxiv.org/html/2602.23720v1))
- **Runtime Engine (SDK):** Platform-specific execution substrate that reads the blueprint and instantiates the agent. SDK implementations (agentic-py, agentic-java) consume identical blueprints without modification.
- **Separation analogy:** The paper explicitly compares this to "the infrastructure-as-code paradigm established by Kubernetes and Terraform" — agents as versionable, auditable data artifacts independent of execution environment.
- **MCP as orthogonal concern:** AgenticFormat specifies *who* (permissions, allowed tools); MCP specifies *how* (wire protocols, authentication). Tool connector updates don't touch agent specifications.
- **Safety via Constraint Manifold:** Rather than post-hoc filtering, unsafe action logits are masked to negative infinity at token generation, enforcing safety predicates by construction.

**Implication for Sherpa:** Sherpa's behavioral role definitions (`docs/agents/roles/`) are already a form of Cognitive Blueprint. The RuntimeAdapter initiative formalizes the other half — the execution substrate that consumes those blueprints.

### 2. MI9 is the first integrated runtime governance framework specifically for agentic AI

MI9 (published 2026) introduces six coordinated mechanisms for real-time governance operating as a framework layer atop existing agent stacks:

- **Agency-Risk Index (ARI):** Quantifies governance intensity across autonomy, adaptability, and continuity dimensions, mapping agents to four governance tiers. ([arxiv.org/html/2508.03858](https://arxiv.org/html/2508.03858))
- **Agentic Telemetry Schema (ATS):** Standardized event schema capturing cognitive events (goal.set, memory.read), action events (tool.invoke), and coordination events (agent.msg.send).
- **Continuous Authorization Monitoring (CAM):** Dynamically evaluates permissions based on agent state and execution history — not static roles. Tracks delegation provenance chains.
- **FSM-based Conformance Engine:** Compiles policy rules into finite-state machines. Each agent maintains an independent FSM instance processing events with O(k) complexity per agent. Rules support event predicates, ordering constraints, and temporal bounds.
- **Behavioral Drift Detection:** Goal-conditioned anomaly detection using Jensen-Shannon divergence and Mann-Whitney U tests against behavioral baselines.
- **Graduated Containment:** Four-level intervention — monitoring, planning restriction, tool restriction, execution isolation.

The critical design: MI9 is "rule-based and telemetry-driven, without dependence on any particular LLM." It instruments existing stacks through **framework-specific adapters** that translate native SDK events into standardized ATS, preserving vendor independence.

**Implication for Sherpa:** MI9's adapter pattern (translate framework events into a standard telemetry schema) is directly applicable. Sherpa's authority system could emit ATS-compatible events; RuntimeAdapters for OpenClaw/NemoClaw would translate platform events into the same schema. The FSM-based conformance engine is a potential model for enforcing behavioral constraints at runtime.

### 3. Governance-as-a-Service (GaaS) treats governance as provisioned infrastructure

A multi-agent framework paper (2025) proposes GaaS — governance deployed as an external service rather than embedded in agents:

- **External enforcement proxy:** GaaS interposes between agents and their environments, evaluating outputs post-generation. No model retraining or architectural changes needed. ([arxiv.org/html/2508.18765v2](https://arxiv.org/html/2508.18765v2))
- **Declarative policy engine:** Policies defined in JSON schemas with rule ID, regex/boolean patterns, governance mode (coercive/normative/mimetic), and severity scores.
- **Dynamic Trust Factor:** Per-agent trust score incorporating weighted violations across categories, decaying based on recency and severity. High-trust agents get lenient treatment; low-trust agents face immediate blocking.
- **Black-box governance:** Can govern "untrusted" agents without requiring access to weights, prompts, or internal memory states.

Comparison to embedded governance:

| Aspect | Embedded (Constitutional AI) | GaaS (External) |
|--------|------------------------------|-----------------|
| Model modification | Requires retraining | None needed |
| Auditability | Internal, opaque | Transparent logs, declarative rules |
| Agent cooperation | Mandatory | Not required |
| Scalability across models | Model-specific | Model-agnostic |

**Implication for Sherpa:** This is essentially what Sherpa *is* — governance as a service layer over any runtime. The GaaS paper provides academic validation and a formal trust-scoring model that could inform Sherpa's authority lease system.

### 4. No major framework cleanly separates governance from runtime — they all bundle them

**CrewAI** bundles orchestration and execution. Agents, tasks, and crews are defined in Python code or YAML, but execution is tightly coupled to CrewAI's own runtime. LLM routing uses a factory pattern with LiteLLM fallback covering 200+ models, but this is model-provider abstraction, not governance-runtime separation. CrewAI Flows add an orchestration layer above Crews, but both layers execute within CrewAI. ([docs.crewai.com/en/learn/llm-connections](https://docs.crewai.com/en/learn/llm-connections))

**LangGraph** is a graph-based state machine for agent workflows. It provides middleware hooks (before/after LLM calls, around tool execution) and pluggable storage backends. LangGraph 1.0 (October 2025) stabilized four core runtime features. However, governance is implicit — expressed through graph structure, conditional edges, and tool scoping — not as a separable layer. "Locking in planner output as a graph traversal plan and restricting executor agents to pre-scoped toolsets" achieves least-privilege, but it's embedded in the graph definition, not externalized. ([langchain.com/langgraph](https://www.langchain.com/langgraph))

**Microsoft Agent Framework** (public preview October 2025, GA target Q1 2026) merges AutoGen and Semantic Kernel. Supports declarative YAML/JSON agent definitions, middleware for intercepting agent actions, and pluggable memory modules. Supports MCP and A2A protocols. Process Framework GA planned Q2 2026 for deterministic workflow orchestration with compliance audit trails. This comes closest to runtime abstraction among production frameworks, but governance is still framework-internal middleware, not an externalized layer. ([learn.microsoft.com/en-us/agent-framework/overview/](https://learn.microsoft.com/en-us/agent-framework/overview/))

**OpenAI Agents SDK** abstracts models behind `Model` and `ModelProvider` interfaces, supporting non-OpenAI models through adapters (Vercel AI SDK). Guardrails run in parallel with agent execution. Handoffs coordinate multi-agent workflows. Provider-agnostic by design, but governance (guardrails) is SDK-internal, not a separable service. ([openai.github.io/openai-agents-python/](https://openai.github.io/openai-agents-python/))

### 5. Amazon Bedrock AgentCore implements the gateway pattern for deterministic policy enforcement

AgentCore's most relevant contribution is **policy enforcement outside the LLM reasoning loop:**

- Policies defined in natural language but executed via the AgentCore Gateway as deterministic infrastructure. ([refactored.pro](https://www.refactored.pro/blog/2025/12/4/aws-reinvent-2025-bedrock-agentcorethe-deterministic-guardrails-that-make-autonomous-ai-safe-for-the-enterprise))
- "It doesn't matter how cleverly an agent (or malicious prompt) tries to reason around a constraint — the gateway enforces it at runtime before the action executes."
- 13 pre-built evaluators for correctness, helpfulness, and safety running continuously.
- A2A protocol support for cross-platform agent communication.
- Framework-agnostic: agents from any framework can deploy to AgentCore's runtime.

**Implication for Sherpa:** AgentCore's gateway pattern — governance as an infrastructure proxy that intercepts all agent actions before execution — is the cloud-hosted version of what Sherpa's RuntimeAdapter + authority system could be for self-hosted deployments.

### 6. The protocol stack is crystallizing: MCP (tools) + A2A (agents) + AG-UI (runtime)

The Linux Foundation's Agentic AI Foundation (AAIF), launched December 2025, houses both MCP and A2A. The emerging consensus architecture:

- **MCP:** Agent-to-tool communication. Standardizes how agents discover and invoke external capabilities. Protocol-based, vendor-agnostic. ([modelcontextprotocol.io](https://modelcontextprotocol.io/))
- **A2A:** Agent-to-agent communication. Agent Cards declare capabilities; runtime execution stays opaque. Framework-agnostic. v0.3 added gRPC, agent card signing. ([a2a-protocol.org](https://a2a-protocol.org/latest/specification/))
- **AG-UI / A2UI:** Agent-to-user interface protocols (emerging).
- **Agent Skills (Anthropic):** Open standard (December 2025) for portable agent capabilities. Adopted by Microsoft, OpenAI, Atlassian, Figma, Cursor, GitHub. Admin controls for skill provisioning and access. ([agentskills.io](https://agentskills.io))

A2A's Agent Card is particularly relevant: it separates what an agent *can do* (declared capabilities, skills, authentication) from how it *does it* (internal implementation stays opaque). This is governance-runtime separation at the inter-agent communication level.

**Implication for Sherpa:** Sherpa's RuntimeAdapter should speak A2A for agent-to-agent coordination and MCP for tool access. A Sherpa-governed agent could publish an A2A Agent Card that declares its behavioral constraints and authority scope while hiding its runtime implementation.

### 7. The industry trend: "backends retreat to governance"

InfoQ (October 2025) identified a fundamental architectural shift: "AI agents transition from assistive tools to operational execution engines, with traditional application backends retreating to governance and permission management roles." ([infoq.com](https://www.infoq.com/news/2025/10/ai-agent-orchestration/))

Three-tier pattern emerging:
1. **Foundation Tier:** Tool orchestration, reasoning transparency, data lifecycle
2. **Workflow Tier:** Composable patterns (chaining, routing, parallelization)
3. **Autonomous Tier:** Agents determine approaches dynamically; backends enforce boundaries

This inverts traditional architecture: governance becomes permissive infrastructure rather than orchestration control. Sherpa is positioned exactly at this governance layer.

---

## Implications for Sherpa's RuntimeAdapter Design

### What Sherpa has that nobody else does

None of the surveyed frameworks provide **filesystem-based behavioral governance that is fully decoupled from runtime execution.** The unique combination:
- Behavioral role definitions (declarative YAML, no identity claims)
- Initiative lifecycle tracking (proposal, plan, activity, integration)
- Authority leases with temporal boundaries
- Convention sync across organizational nodes
- Config-as-code (`defineConfig()`) for client-specific governance

This is the Auton "Cognitive Blueprint" concept, but with organizational governance (initiatives, decisions, conventions) rather than just agent specification.

### Validated architectural patterns to adopt

1. **Blueprint/Engine split (Auton):** Formalize Sherpa's role definitions as the "Cognitive Blueprint" that RuntimeAdapters consume. The adapter translates behavioral constraints into platform-native enforcement.

2. **Framework-specific adapters with standard telemetry (MI9):** Each RuntimeAdapter should translate platform events into a standardized telemetry schema. This enables governance logic (authority enforcement, drift detection) to operate identically regardless of runtime.

3. **Gateway pattern (AgentCore):** The RuntimeAdapter should function as a governance gateway — intercepting task dispatch, validating authority, applying behavioral constraints — before delegating to the runtime. Deterministic enforcement, not probabilistic.

4. **A2A Agent Cards:** Sherpa-governed agents should publish Agent Cards that declare behavioral constraints and authority scope. This lets external agents discover what a Sherpa agent can do without knowing it runs on OpenClaw or NemoClaw.

5. **Trust Factor scoring (GaaS):** Sherpa's authority lease system could incorporate dynamic trust scoring based on execution history, not just pre-assigned permissions.

### Proposed RuntimeAdapter interface (informed by research)

The adapter needs to bridge three concerns:

| Concern | Sherpa provides | Runtime provides |
|---------|----------------|-----------------|
| **What to do** | Task description, behavioral constraints, authority scope | Task execution, tool invocation, model inference |
| **How to constrain** | Role disposition, quality bar, tool permissions | Sandbox enforcement, network isolation, model routing |
| **How to observe** | Telemetry schema, drift thresholds, governance tiers | Platform events, execution logs, resource metrics |

The adapter translates between these columns. It does not try to make runtimes understand Sherpa governance natively — it maps governance intent to platform-native mechanisms.

---

## Open Questions

1. **Auton's AgenticFormat — should Sherpa adopt or diverge?** The AgenticFormat standard covers agent specification (tools, memory, safety, output contracts). Sherpa's role definitions cover behavioral governance (disposition, quality bar, conventions). These are complementary, not competing. Should Sherpa's role YAML extend AgenticFormat, or remain a separate governance layer that wraps it?

2. **MI9's FSM conformance engine — applicable to authority enforcement?** Sherpa's authority leases are currently temporal (acquire, renew, release). MI9's FSM approach could enforce behavioral *sequences* — "an agent must log before modifying, must review before approving." Is this valuable for Sherpa's use case, or over-engineered for a consulting-context framework?

3. **A2A Agent Cards for Sherpa agents — when?** Publishing Agent Cards would make Sherpa-governed agents discoverable by any A2A-compatible system. This is high strategic value (Sherpa becomes a governance layer for the A2A ecosystem) but adds protocol implementation complexity. Depends on whether clients are adopting A2A in the near term.

4. **GaaS trust scoring vs. Sherpa's authority leases:** Sherpa uses explicit authority acquisition (acquire/release). GaaS uses implicit trust scoring based on behavior history. Are these complementary (trust score informs lease renewal decisions) or conflicting (two different mental models of agent permissions)?

5. **NemoClaw's OpenShell sandbox vs. AgentCore's gateway:** Both enforce constraints outside the LLM loop, but differently. OpenShell is process-level sandboxing (network, filesystem isolation). AgentCore's gateway is API-level interception (policy evaluation before action execution). Sherpa's RuntimeAdapter needs to work with both patterns. Is the adapter interface general enough to abstract over both?

6. **Protocol convergence timeline:** MCP + A2A + Agent Skills are all under the Linux Foundation's AAIF now. How quickly will these protocols stabilize? Should Sherpa's RuntimeAdapter target current versions or wait for the inevitable convergence into a unified agentic protocol stack?
