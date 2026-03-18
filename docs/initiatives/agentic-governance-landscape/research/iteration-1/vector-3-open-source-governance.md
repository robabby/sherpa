# Open-Source Agent Governance & Framework-Native Governance

> **AI-generated** 2026-03-17 · Awaiting human review
> Sources: agentic-governance-landscape

Research covering Vector 1 (Developer Frameworks tier), Vector 5 (Architectural Patterns), and validating claims from `ledger-governance-rbac` about framework governance capabilities. Maps open-source governance tooling and governance primitives native to the six major agent orchestration frameworks as of March 2026.

---

## Key Discoveries

### 1. Microsoft Agent Governance Toolkit — The Most Comprehensive Open-Source Project

The single most significant open-source agent governance project discovered. Released by Microsoft, it covers all 10 OWASP Agentic Top 10 controls with 6,100+ tests. ([Source](https://github.com/microsoft/agent-governance-toolkit))

- **Policy Engine (Agent OS):** Evaluates every agent action against policy *before* execution at sub-millisecond latency (<0.1 ms). Supports OPA/Rego and Cedar policy languages. Enforces capability models defining allowed/denied tools and token limits.
- **Zero-Trust Identity (AgentMesh):** Ed25519 cryptographic credentials with SPIFFE/SVID support. Trust scoring on 0-1000 scale for inter-agent communication. Encrypted channels between agents.
- **Execution Sandboxing (Agent Runtime):** 4-tier privilege rings with saga orchestration. Kill-switch capabilities. Append-only audit logs with joint liability tracking.
- **Reliability Engineering (Agent SRE):** SLO/error budget enforcement with circuit breakers, replay debugging, chaos engineering, progressive delivery.
- **Framework Integrations:** 12+ frameworks including LangChain/LangGraph, AutoGen, CrewAI, LlamaIndex, OpenAI Agents SDK, Google ADK, Semantic Kernel, Dify, Haystack, Azure AI Foundry.
- **Multi-language SDKs:** Python (`agent-governance-toolkit[full]`), TypeScript (`@agentmesh/sdk`), .NET (`Microsoft.AgentGovernance`).
- **Performance:** Policy evaluation adds 0.012-0.091 ms per decision. Supports 9,300-72,000 operations per second.

**Assessment:** This is the closest thing to a universal governance layer for agent frameworks. It validates the concept of governance as cross-cutting middleware rather than framework-specific feature. The OPA/Cedar policy support means it speaks the same language as enterprise IAM systems.

### 2. Galileo Agent Control — Open-Source Governance Control Plane (March 2026)

Released March 11, 2026, under Apache 2.0. Positioned as "runtime governance for AI agents should be infrastructure, not a product moat." ([Source](https://www.globenewswire.com/news-release/2026/03/11/3253962/0/en/Galileo-Releases-Open-Source-AI-Agent-Control-Plane-to-Help-Enterprises-Govern-Agents-at-Scale.html))

- **Core concept:** Write policies once, deploy across any agent environment. Centralized policy management with runtime enforcement.
- **Runtime mitigation:** Real-time policy updates without taking agents offline.
- **Framework integrations at launch:** Strands Agents, CrewAI, Glean, Cisco AI Defense.
- **Vendor neutral:** Supports internally built or purchased agents, guardrails from multiple vendors, custom enterprise evaluators.

**Assessment:** Very new (6 days old at time of research). The "write once, deploy anywhere" framing is directly relevant to Sherpa's convention-based approach — Galileo solves the same problem with centralized infrastructure rather than filesystem conventions.

### 3. LlamaFirewall (Meta) — Security-Focused Guardrails

Open-source from Meta, used in production at Meta. Focused on security rather than governance broadly. ([Source](https://ai.meta.com/research/publications/llamafirewall-an-open-source-guardrail-system-for-building-secure-ai-agents/))

- **Three guardrails:** PromptGuard 2 (jailbreak/injection detection, 86M and 22M parameter models), AlignmentCheck (chain-of-thought auditor for goal misalignment), CodeShield (static analysis engine across 8 languages).
- **Performance:** 90%+ efficacy in reducing attack success rates on AgentDojo benchmark. CodeShield: 96% precision, 79% recall on insecure code detection.
- **Architecture:** Modular scanner pipeline. Each guardrail operates independently. Can be composed as a layered defense.

**Assessment:** Security-only, not governance. No RBAC, no audit trails, no lifecycle management. But the modular scanner pattern is interesting — it's a guardrail primitive that any governance system could compose.

### 4. Superagent — Safety-First Agent Framework

Open-source framework with safety as a core design principle, not a bolt-on. ([Source](https://www.helpnetsecurity.com/2025/12/29/superagent-framework-guardrails-agentic-ai/))

- **Safety Agent component:** A policy enforcement layer that evaluates agent actions before execution. Applies rules on data sensitivity and tool usage. Blocks, modifies, or logs actions violating policies.
- **Configuration-driven constraints:** Restrictions defined in configuration and enforced at runtime without modifying agent code.
- **Open-weight guardrail models:** Published on HuggingFace for prompt injection and unsafe input detection at 50-100ms latency.

**Assessment:** More of an agent framework with governance built in than a standalone governance tool. The "Safety Agent" as a policy enforcement layer is an interesting pattern — a dedicated agent whose job is governing other agents.

### 5. NeMo Guardrails (NVIDIA) — GPU-Accelerated Guardrails

Open-source toolkit for adding programmable guardrails to LLM-based systems. ([Source](https://developer.nvidia.com/nemo-guardrails))

- **Coverage:** Topic control, PII detection, RAG grounding, jailbreak prevention, multilingual/multimodal content safety.
- **Framework integration:** LangChain, LangGraph, LlamaIndex.
- **GPU acceleration:** Leverages NVIDIA hardware for low-latency guardrail evaluation.
- **Evolution:** NemoClaw (announced GTC 2026) builds on NeMo Guardrails + OpenClaw for enterprise agent governance. OpenShell runtime enforces policy-based security at the process level. ([Source](https://nvidianews.nvidia.com/news/ai-agents))

**Assessment:** Content safety focused, not behavioral governance. But NVIDIA's move from guardrails (content filtering) to OpenShell (process-level policy enforcement) shows the trajectory from content safety toward full agent governance.

### 6. OpenGuardrails — Runtime Security for AI Agents

Open-source runtime security protecting against prompt injection, data leakage, and unsafe behavior. ([Source](https://github.com/openguardrails/openguardrails))

### 7. Greywall — Kernel-Level Sandbox for AI Coding Agents

Linux-only kernel-level sandbox. Deny-by-default restrictions on filesystem, network, and system calls using Linux namespaces, Landlock, and seccomp BPF. Blocks 27+ dangerous system calls at kernel boundary. ([Source](https://greywall.io/))

**Assessment:** Early stage (17 GitHub stars as of March 2026). But the approach — kernel-level enforcement that wraps any agent — is the most secure possible enforcement point. Relevant as a "belt and suspenders" layer beneath convention-based governance.

### 8. Authorization Frameworks Applicable to Agents

Several general-purpose authorization frameworks are being applied to agent governance:

- **OPA/Rego** — General-purpose policy engine. Already used by Microsoft Agent Governance Toolkit. ([Source](https://github.com/open-policy-agent/opa))
- **Cedar** — Amazon's formal authorization language. Used by AWS AgentCore for agent policy enforcement. ([Source](https://www.cedarpolicy.com))
- **Casbin** — Multi-language authorization library (Go, Java, Node.js, Python, .NET, Rust). Supports ACL, RBAC, ABAC, ReBAC. Can check permissions before agent tool calls. ([Source](https://casbin.org))
- **OpenFGA** — Google Zanzibar-inspired ReBAC engine. Models access through relationships rather than roles. ([Source](https://openfga.dev))
- **Cerbos** — Policy-as-code authorization with explicit agent and RAG support. Has a LangGraph integration tutorial. ([Source](https://www.cerbos.dev))
- **Permit.io** — Authorization platform with a Four-Perimeter AI Access Control Framework (prompt filtering, RAG data protection, external access control, response enforcement). Supports assigning machine identities to agents. ([Source](https://www.permit.io/ai-access-control))

**Assessment:** The authorization layer for agents is not being built from scratch — it's being adapted from existing IAM/authorization infrastructure. OPA, Cedar, and Casbin are the most likely candidates for agent policy languages. This means Sherpa doesn't need to invent authorization; it needs to integrate with one of these.

### 9. Grantex Protocol — Emerging Agent Authorization Standard

An open protocol (Apache 2.0) implementing six authorization primitives: signed JWT grant tokens with scoped claims, per-agent DIDs, user consent flows with optional FIDO2/WebAuthn, granular revocation with cascade, immutable audit trails, and delegation chains with depth limits. ([Source](https://grantex.dev/report/state-of-agent-security-2026))

**Assessment:** Very early but architecturally interesting. The "delegation chain with depth limits" concept maps to Sherpa's authority lease system. Worth tracking.

---

## Framework-Native Governance: Comparison Matrix

### CrewAI

- **Task Guardrails:** Function-based (Python validation functions returning `(bool, result)` tuples) and LLM-based (natural language validation criteria). Guardrails validate task output before passing to next task. Retry mechanism with configurable max retries (default 3). Multiple guardrails can be chained sequentially. ([Source](https://docs.crewai.com/en/concepts/tasks))
- **RBAC:** Available in CrewAI AMP (cloud platform) only. Not in open-source framework. ([Source](https://crewai.com/amp))
- **Audit Logging:** AMP provides deployment history and streaming logs. Not in open-source. ([Source](https://crewai.com/amp))
- **Behavioral Constraints:** Agent definitions include `role`, `goal`, `backstory`, and `allow_delegation`. No explicit behavioral constraint primitives beyond role description strings.
- **Human-in-the-Loop:** `human_input=True` on tasks enables human review before completion.
- **Enterprise:** AMP adds HITL training, security guardrails, LLM testing, hallucination scoring, SOC2/SSO/FedRAMP High.

**Verdict:** Open-source CrewAI has task-level output validation only. All governance primitives (RBAC, audit, fleet management) are in the commercial AMP platform.

### LangGraph

- **Checkpointing:** Persistent state via configurable checkpointers (in-memory, PostgreSQL). Required for interrupts and human-in-the-loop. State is the governance primitive — every graph execution step is recoverable. ([Source](https://docs.langchain.com/oss/python/langchain/human-in-the-loop))
- **Human-in-the-Loop:** `interrupt()` function pauses graph execution at any node. Tool-level approval via `InterruptOnConfig` — map tool names to approval policies (True=interrupt, False=auto-approve, or custom config). ([Source](https://towardsdatascience.com/langgraph-201-adding-human-oversight-to-your-deep-research-agent/))
- **Authentication & Authorization:** `Auth` object with `@auth.authenticate` and `@auth.on` decorators. Resource-level access control via metadata-based filtering on threads, assistants, and crons. Not traditional RBAC — custom authorization logic in handlers. Python deployments only (JavaScript coming). ([Source](https://blog.langchain.com/custom-authentication-and-access-control-in-langgraph/))
- **Tool Permissions:** Tool scoping restricts executor agents to pre-scoped toolsets. Integration with Cerbos for RBAC/ABAC policy enforcement. ([Source](https://www.cerbos.dev/blog/rag-authorization-system-langgraph-cerbos-pinecone))
- **Audit/Observability:** LangSmith provides tracing and evaluation. Traces capture all LLM calls, tool executions, and state transitions. LangGraph 1.0 shipped October 2025. ([Source](https://www.langchain.com/langgraph))
- **Behavioral Constraints:** None native. Behavioral constraints are implemented through prompt engineering in node functions.

**Verdict:** LangGraph has the strongest orchestration-level governance (checkpointing, human-in-the-loop, tool approval). Authorization exists but is custom code, not declarative policy. Integrates with external policy engines (Cerbos, OPA) rather than building its own.

### AutoGen v0.4 (Microsoft)

- **Actor Model:** Agents communicate through asynchronous messages. Each agent manages its own state. Supports distributed deployment across organizational boundaries via `DistributedAgentRuntime`. ([Source](https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/))
- **Guardrails:** `RegexGuardrail` (pattern matching) and `LLMGuardrail` (LLM-based evaluation). Input and output guardrails via `register_input_guardrail()` and `register_output_guardrail()`. Guardrails route flagged content to specialist agents. ([Source](https://docs.ag2.ai/latest/docs/user-guide/advanced-concepts/orchestration/group-chat/guardrails/))
- **Governance Gaps (per GitHub Issue #6017):** Active tracking issue acknowledges missing: prompt injection detection, tool call auditing, session audit trails, pre-action approval checkpoints, cryptographic agent identity. A commenter noted: "Guardrails filter content. Governance operates on the decision itself — whether the agent should act at all." ([Source](https://github.com/microsoft/autogen/issues/6017))
- **Actor Boundaries as Governance:** The actor model creates natural isolation — agents can only affect each other through messages. This is an implicit governance boundary but not an explicit one (no policy enforcement on messages).
- **RBAC:** None native.
- **Behavioral Constraints:** None native beyond guardrail routing.

**Verdict:** AutoGen's actor model provides structural governance (isolation through message passing) but lacks explicit governance primitives. The GitHub issue #6017 confirms Microsoft recognizes this gap. The Microsoft Agent Governance Toolkit (separate project) is the governance answer for AutoGen and other frameworks.

### OpenAI Agents SDK

- **Guardrails:** Three types — input guardrails (validate user input), output guardrails (validate final output), tool guardrails (validate before/after each tool call). Tripwire mechanism raises exceptions to halt execution. Parallel (default) or blocking execution modes. ([Source](https://openai.github.io/openai-agents-python/guardrails/))
- **Tracing:** Built-in comprehensive tracing of LLM generations, tool calls, handoffs, guardrails, and custom events. Supports Zero Data Retention environments with custom trace processors. ([Source](https://openai.github.io/openai-agents-python/tracing/))
- **Governance Cookbook:** Official "Building Governed AI Agents" guide recommending: layered guardrails (pre-flight, input, output), centralized policy distribution via installable Python packages, `GuardrailsOpenAI` client wrapper for transparent policy application. References Moderation, PII detection, Prompt Injection Detection, Keyword Filtering, Hallucination Detection, Jailbreak detection. ([Source](https://developers.openai.com/cookbook/examples/partners/agentic_governance_guide/agentic_governance_cookbook))
- **RBAC:** Not native. Guide acknowledges gap — agents should be "role-aware" but multi-tenant permission models not addressed.
- **Behavioral Constraints:** Agents have `instructions` (system prompt) and `handoff_description` (when to delegate). No formalized behavioral constraint system.
- **Human-in-the-Loop:** Not a first-class primitive. Implemented through tool guardrails that pause execution.

**Verdict:** The most complete guardrail system of any framework (input + output + tool guardrails with tripwires). Strong tracing/observability. But governance is positioned as "scaffolding" — the SDK provides the hooks, you bring the policies. No RBAC, no behavioral constraints, no lifecycle management.

### LlamaIndex

- **Agent Governance:** Minimal native governance. LlamaIndex is primarily a data framework (indexing, RAG, retrieval) with agent capabilities added via Workflows. ([Source](https://www.llamaindex.ai/workflows))
- **Security:** Secure filesystem access for coding agents — scoped file access to prevent agents from reading/writing outside allowed directories. ([Source](https://www.llamaindex.ai/blog/making-coding-agents-safe-using-llamaindex))
- **Guardrails:** No native guardrail system. Relies on external guardrail frameworks (NeMo Guardrails, LlamaFirewall) for content safety.
- **RBAC/Audit/Behavioral:** None native.

**Verdict:** LlamaIndex is not an agent governance framework. It's a data framework that agents use. Governance for LlamaIndex agents comes from external tools (NeMo Guardrails, Microsoft Agent Governance Toolkit, etc.).

### Google Agent Development Kit (ADK)

- **Guardrails:** In-tool guardrails via developer-set tool context. Plugin-based security guardrails that check user authorization before tool execution. ([Source](https://google.github.io/adk-docs/safety/))
- **Permissions:** Agent-level permission definitions. Identity controls (dedicated service accounts vs. user delegation). ([Source](https://google.github.io/adk-docs/safety/))
- **Cloud API Registry:** Administrators manage the full suite of tools available to agents (MCP servers + custom tools). Tool governance at the organizational level. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-builder/overview))
- **RBAC:** Via Google Cloud IAM integration. Not native to the framework.
- **Behavioral Constraints:** None formalized. Agent behavior defined through instructions.

**Verdict:** ADK has the strongest tool governance story (Cloud API Registry + plugin-based permission checks). But governance primitives are thin in the open-source framework — the real governance comes from Google Cloud platform services.

---

## Governance Primitives Comparison Matrix

| Primitive | CrewAI | LangGraph | AutoGen v0.4 | OpenAI SDK | LlamaIndex | Google ADK | MS Gov Toolkit |
|-----------|--------|-----------|--------------|------------|------------|------------|----------------|
| **Input Guardrails** | No | No | Yes | Yes | No | Yes (plugin) | Yes |
| **Output Guardrails** | Yes (task) | No | Yes | Yes | No | No | Yes |
| **Tool Guardrails** | No | Yes (approval) | No | Yes | No | Yes (plugin) | Yes |
| **RBAC** | AMP only | Custom code | No | No | No | Cloud IAM | No (uses OPA/Cedar) |
| **Audit Logging** | AMP only | LangSmith | No (Issue #6017) | Built-in tracing | No | Cloud Logging | Append-only logs |
| **Human-in-the-Loop** | Yes (task) | Yes (interrupt) | No | Via guardrails | No | No | No |
| **Behavioral Constraints** | Role strings | No | No | Instructions | No | No | Capability models |
| **Agent Identity** | No | Custom auth | Actor isolation | No | No | Service accounts | Ed25519 + SPIFFE |
| **Policy-as-Code** | No | External (Cerbos) | No | External (packages) | No | No | OPA/Rego + Cedar |
| **Checkpointing** | No | Yes (core) | No | No | No | No | Saga orchestration |
| **Kill Switch** | No | No | No | Tripwire (halt) | No | No | Yes |
| **Lifecycle Mgmt** | No | No | No | No | No | No | Progressive delivery |

---

## MCP Protocol: Current Governance Semantics

MCP (Model Context Protocol) as of the 2025-11-25 specification has **minimal governance semantics**. ([Source](https://modelcontextprotocol.io/specification/2025-11-25))

**What exists:**
- OAuth 2.1-based authentication for client-server connections
- Tool definitions with input schemas (JSON Schema) — the tool declares what it accepts
- Resource definitions with URI templates — resources declare their access patterns
- Streamable HTTP transport with session management

**What's missing (per 2026 roadmap):**
- **No tool-level permissions.** Any authenticated client can call any tool a server exposes. No scoping mechanism.
- **No agent identity.** MCP authenticates clients (applications), not agents. An agent operating within an MCP client has no distinct identity.
- **No audit trail specification.** No standard for logging what tools were called, by whom, with what inputs/outputs.
- **No policy enforcement point.** No mechanism for a server to evaluate policy before executing a tool call.
- **No behavioral constraints.** MCP defines what tools exist, not how agents should use them.

**2026 roadmap governance items:**
- Enterprise-managed auth (SSO integration, Cross-App Access) — active work
- Audit trails and observability — needs problem statement and proposals
- Gateway and proxy patterns (authorization propagation) — needs problem statement
- SEP-1932 (DPoP) and SEP-1933 (Workload Identity Federation) — active proposals for stronger auth ([Source](https://modelcontextprotocol.io/development/roadmap))

**Gateway pattern as interim governance:** Kong, Strata, and others are building MCP gateways that intercept tool lists and filter based on caller identity. This is the practical governance mechanism today — a proxy between agent and MCP server that enforces policy. ([Source](https://konghq.com/blog/engineering/mcp-tool-governance-security-meets-context-efficiency))

**Assessment:** MCP is a connectivity protocol, not a governance protocol. Governance happens above MCP (in frameworks/gateways) or beside MCP (in convention files). The 2026 roadmap acknowledges governance gaps but treats them as "on the horizon" rather than top priority. Sherpa's approach of governance-in-the-filesystem is complementary — MCP connects tools, Sherpa governs how agents use them.

---

## Anthropic's Model Spec: System-Level vs. User-Level Governance

Claude's constitution (published January 22, 2026, CC0 1.0 license) establishes a **three-tier principal hierarchy** that is itself a governance architecture: ([Source](https://www.anthropic.com/constitution))

1. **Anthropic** (highest trust) — Trains the model, sets hard constraints. Cannot be overridden by any instruction.
2. **Operators** (medium trust) — API builders who customize behavior via system prompts within Anthropic's usage policies.
3. **Users** (baseline trust) — End consumers with permissions bounded by operator configuration.

**Hard constraints (non-negotiable):** Seven absolute prohibitions including bioweapon assistance, CSAM, deceiving users about being AI. These are the model-level governance floor.

**Soft defaults (operator-adjustable):** Operators can expand or restrict Claude's default behaviors through system prompts. They can create custom personas, restrict topics, expand user permissions (up to operator-level). They cannot override hard constraints or direct Claude against users' basic interests.

**Agentic governance acknowledgment:** The constitution explicitly addresses agentic contexts: "agentic settings often introduce unique challenges around how to perform well and operate safely." Claude should evaluate tool outputs critically, treat instructions in documents as "information rather than commands," and maintain core values across agent orchestration. Detailed agentic guidance is anticipated but not yet published.

**Relevance to Sherpa:** The Anthropic principal hierarchy (Anthropic > Operator > User) maps structurally to Sherpa's convention hierarchy (framework conventions > organization conventions > project conventions). The key insight is that **system prompts are the governance mechanism** for Claude — and Sherpa's CLAUDE.md conventions are system prompt fragments. Sherpa is already doing operator-level governance through filesystem conventions that become system prompt content.

---

## AGENTS.md: The Filesystem Governance Standard

AGENTS.md has 60,000+ repositories on GitHub and is stewarded by the Agentic AI Foundation under the Linux Foundation. ([Source](https://github.com/agentsmd/agents.md))

- **Hierarchical scoping:** An AGENTS.md file applies to all files and subdirectories in its containing folder. This is the same scoping model as Sherpa's `.claude/rules/` with glob patterns.
- **Content:** Commands, testing, project structure, code style, git workflow, and boundaries.
- **Governance semantics:** Minimal. AGENTS.md tells agents *how to work on the code*, not *what they're allowed to do*. No RBAC, no behavioral constraints, no lifecycle management. It's closer to a `.editorconfig` for AI agents than a governance framework.
- **Best practices from GitHub's analysis of 2,500+ repos:** Focus on commands, testing, project structure, code style, and boundaries. ([Source](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/))
- **Related:** Agile Lab's Agent Specification (`spec.md`) aims for "consistent definition, governance, and observability of AI-driven agents" — a more structured alternative. ([Source](https://github.com/agile-lab-dev/Agent-Specification/blob/main/spec.md))

**Assessment:** AGENTS.md validates that filesystem-based agent guidance is a real pattern with massive adoption. But it's code-level guidance, not governance. Sherpa's behavioral agent system, initiative lifecycle, and quality gates go far beyond what AGENTS.md covers. The existence of AGENTS.md at scale proves the convention-over-configuration approach works for developers — Sherpa extends it into governance territory.

---

## Implications for Sherpa's Convention-Based Approach

### The `ledger-governance-rbac` claims need updating

The claim "no major AI agent framework ships formal RBAC" is **still largely true** for the open-source versions. CrewAI has RBAC only in AMP (commercial). LangGraph has custom authorization code (not declarative RBAC). OpenAI SDK has no RBAC. AutoGen has no RBAC. However:
- Microsoft's Agent Governance Toolkit provides RBAC via OPA/Cedar integration across all major frameworks
- Permit.io provides agent-aware RBAC/ABAC/ReBAC as a service
- The claim "no MCP server implements role-based authorization" is being challenged by MCP gateways (Kong, Strata) that add authorization at the proxy layer

### Where Sherpa has genuine whitespace

1. **Behavioral constraints as governance.** No framework has formalized behavioral constraints. CrewAI has role strings. OpenAI SDK has instructions. But none have Sherpa's approach: disposition, quality bar, explicit fail triggers, behavioral defaults as typed fields in agent role definitions. The Anthropic constitution validates this approach at the model level; Sherpa operationalizes it at the application level.

2. **Initiative lifecycle as governance.** No framework or tool manages the lifecycle of agent work products (proposal > plan > activity > implementation > integration review). This is unique to Sherpa. The closest analog is LangGraph's checkpointing, but that's execution-level state, not governance-level lifecycle.

3. **Convention-based governance with zero infrastructure.** Every other governance approach requires running something — a policy engine (OPA), a control plane (Galileo), a cloud service (Agent 365), a proxy (MCP gateway). Sherpa's governance lives in the filesystem. Zero marginal cost. Zero vendor lock-in. Works offline. This is a fundamentally different deployment model.

4. **Developer-in-the-loop, not IT-admin-in-the-loop.** The entire governance industry is building for IT administrators, security teams, and compliance officers. Sherpa builds for the developer working alongside AI agents. This is a different persona with different needs.

### Where Sherpa should integrate, not compete

1. **Identity and authorization.** OPA, Cedar, and Casbin are battle-tested policy engines. Sherpa should be able to export behavioral constraints as policy inputs to these engines, not replace them.

2. **Content safety.** LlamaFirewall, NeMo Guardrails, and Bedrock Guardrails handle prompt injection, PII detection, and content moderation. These are runtime security concerns, not convention-level governance.

3. **Tracing and observability.** OpenAI's built-in tracing, LangSmith, and OpenTelemetry provide execution-level visibility. Sherpa's audit trail is git history — complementary, not competitive.

4. **Cloud compliance.** Microsoft Purview, AWS compliance, Google Cloud CMEK/VPC-SC provide regulatory compliance infrastructure. Sherpa conventions can inform what to comply with; cloud platforms enforce how.

### The emerging architecture

The governance stack is forming into layers:

| Layer | What | Who |
|-------|------|-----|
| **Model governance** | Hard constraints, constitutional AI | Anthropic, OpenAI |
| **Runtime security** | Prompt injection, PII, content safety | LlamaFirewall, NeMo, Bedrock Guardrails |
| **Authorization** | Who can call what tool, with what scope | OPA/Cedar/Casbin, MCP gateways, Permit.io |
| **Orchestration governance** | Checkpointing, human-in-the-loop, tool approval | LangGraph, OpenAI SDK guardrails |
| **Behavioral governance** | What agents should do, quality standards, lifecycle | **Sherpa (unique position)** |
| **Enterprise governance** | Fleet management, compliance, audit | Agent 365, AgentCore, Galileo |

Sherpa occupies the behavioral governance layer — above orchestration (how agents execute) and below enterprise governance (how fleets are managed). This layer is currently empty in every other framework and tool.

---

## Open Questions

1. **Will Microsoft Agent Governance Toolkit absorb the behavioral governance layer?** Its capability model already defines allowed/denied tools. Could it extend to behavioral constraints? The OPA/Rego policy language is expressive enough.

2. **Does Galileo Agent Control's "write once, deploy anywhere" overlap with Sherpa's convention approach?** Both solve the problem of portable governance across frameworks. Galileo uses a control plane; Sherpa uses filesystem conventions. Are these complementary or competing?

3. **How does the Grantex protocol's delegation chain compare to Sherpa's authority lease system?** Both model bounded authority over time. Grantex uses JWT tokens; Sherpa uses filesystem-based leases. Worth a deeper comparison.

4. **Will MCP's governance maturation make convention-based governance redundant?** If MCP adds tool-level permissions, agent identity, and audit trails, does Sherpa's governance layer still add value? Yes — because MCP governs connectivity, Sherpa governs behavior. But the boundary needs to be clearly articulated.

5. **Is the framework guardrail pattern converging?** CrewAI (task guardrails), LangGraph (interrupt), AutoGen (input/output guardrails), and OpenAI SDK (input/output/tool guardrails with tripwires) all implement variations of the same pattern: validate before/after agent action, halt or retry on failure. Will this converge into a standard interface?

6. **What happens when an agent operates under multiple governance layers simultaneously?** An agent might have: Anthropic's hard constraints, an MCP gateway filtering tools, an OPA policy checking authorization, LangGraph's human-in-the-loop approval, and Sherpa's behavioral constraints. How do these compose? What's the conflict resolution order?

---

## Sources

All claims sourced inline. Primary sources accessed March 17, 2026:

- Microsoft Agent Governance Toolkit: https://github.com/microsoft/agent-governance-toolkit
- Galileo Agent Control: https://www.globenewswire.com/news-release/2026/03/11/3253962/0/en/Galileo-Releases-Open-Source-AI-Agent-Control-Plane-to-Help-Enterprises-Govern-Agents-at-Scale.html
- LlamaFirewall: https://ai.meta.com/research/publications/llamafirewall-an-open-source-guardrail-system-for-building-secure-ai-agents/
- Superagent: https://www.helpnetsecurity.com/2025/12/29/superagent-framework-guardrails-agentic-ai/
- NeMo Guardrails: https://developer.nvidia.com/nemo-guardrails
- OpenGuardrails: https://github.com/openguardrails/openguardrails
- Greywall: https://greywall.io/
- CrewAI Tasks/Guardrails: https://docs.crewai.com/en/concepts/tasks
- CrewAI AMP: https://crewai.com/amp
- LangGraph Human-in-the-Loop: https://docs.langchain.com/oss/python/langchain/human-in-the-loop
- LangGraph Auth: https://blog.langchain.com/custom-authentication-and-access-control-in-langgraph/
- AutoGen v0.4: https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/
- AutoGen Guardrails Issue #6017: https://github.com/microsoft/autogen/issues/6017
- AG2 Guardrails: https://docs.ag2.ai/latest/docs/user-guide/advanced-concepts/orchestration/group-chat/guardrails/
- OpenAI Agents SDK Guardrails: https://openai.github.io/openai-agents-python/guardrails/
- OpenAI Agents SDK Tracing: https://openai.github.io/openai-agents-python/tracing/
- OpenAI Governance Cookbook: https://developers.openai.com/cookbook/examples/partners/agentic_governance_guide/agentic_governance_cookbook
- Google ADK Safety: https://google.github.io/adk-docs/safety/
- MCP Specification: https://modelcontextprotocol.io/specification/2025-11-25
- MCP Roadmap: https://modelcontextprotocol.io/development/roadmap
- Anthropic Constitution: https://www.anthropic.com/constitution
- AGENTS.md: https://github.com/agentsmd/agents.md
- GitHub AGENTS.md Best Practices: https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
- OPA: https://github.com/open-policy-agent/opa
- Cerbos: https://www.cerbos.dev
- Permit.io: https://www.permit.io/ai-access-control
- Grantex: https://grantex.dev/report/state-of-agent-security-2026
- Kong MCP Governance: https://konghq.com/blog/engineering/mcp-tool-governance-security-meets-context-efficiency
