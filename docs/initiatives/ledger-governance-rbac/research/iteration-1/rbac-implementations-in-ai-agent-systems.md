# RBAC Implementations in AI Agent Systems

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** What RBAC implementations exist for AI agent systems, multi-agent frameworks, and MCP servers? How granular are the permissions? Do any use formal RBAC vs ad-hoc authorization? What role taxonomies have been tried for AI agent coordination?

---

## Key Discoveries

### 1. No Major Multi-Agent Framework Ships Formal RBAC

None of the leading open-source multi-agent frameworks — CrewAI, AutoGen, LangGraph, OpenAI Agents SDK — implement formal RBAC (roles → permissions → resources). Their "security" models are all ad-hoc:

- **CrewAI**: Uses task-level guardrails (input/output validation functions) and LLM-as-Judge validation. No role-based permission model. Agents are assigned "roles" in the natural-language sense (e.g., "Senior Researcher"), but these are prompt instructions, not authorization boundaries. ([CrewAI Guardrails guide](https://www.analyticsvidhya.com/blog/2025/11/introduction-to-task-guardrails-in-crewai/))

- **AutoGen**: Provides intervention handlers that intercept messages for human approval before tool execution. MCP integration gives process-level sandboxing (agents run in separate processes). No role-to-permission mapping exists. ([AutoGen intervention handler docs](https://microsoft.github.io/autogen/stable//user-guide/core-user-guide/cookbook/tool-use-with-intervention.html))

- **LangGraph**: Supports per-step tool allowlists — a policy node writes `allowed_tools` to state, and the agent binds only those tools. This is the closest to tool-scoped RBAC but is implemented ad-hoc per graph, not as a framework-level authorization layer. SpiceDB (Zanzibar-style ReBAC) integration exists via `langchain-spicedb` for RAG data filtering. ([LangGraph + SpiceDB](https://authzed.com/blog/langchain-spicedb-integration), [Arcade agent auth guide](https://www.arcade.dev/blog/agent-authorization-langgraph-guide))

- **OpenAI Agents SDK**: Ships input guardrails, output guardrails, and tool guardrails as first-class primitives. Guardrails run in parallel (optimistic execution) or blocking mode. They validate content, not authorization — no concept of "this agent has role X and therefore can access resource Y." ([OpenAI Agents SDK guardrails](https://openai.github.io/openai-agents-python/guardrails/), [OpenAI safety guide](https://platform.openai.com/docs/guides/agent-builder-safety))

**Implication for Sherpa:** The field is wide open. Building formal RBAC into an agent governance framework would be genuinely novel at the framework level.

### 2. Cloud Providers Implement Formal RBAC — But for Human Users Managing Agents, Not for Agent-to-Agent Authorization

The clearest formal RBAC implementations exist at the infrastructure layer:

- **Microsoft Foundry (Azure AI)**: Defines four built-in roles with explicit permission matrices: Azure AI User (data actions + read), Azure AI Project Manager (create projects, assign AI User role), Azure AI Account Owner (create accounts, manage models), Azure AI Owner (full access). Supports custom role creation via JSON permission definitions. Agent identities use Entra ID managed identities with two modes: "attended" (delegated, on-behalf-of user) and "unattended" (agent acts under its own authority). ([Microsoft Foundry RBAC docs](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-foundry?view=foundry-classic), [Agent identity docs](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-identity))

- **AWS Bedrock Agents**: Uses IAM service roles with resource-scoped policies. Agents get execution roles defining access to foundation models, S3 schemas, knowledge bases, and Lambda functions. Since October 2025, a Service-Linked Role (SLR) automates base permissions. Permissions boundaries and SCPs provide ceiling enforcement. ([AWS Bedrock agent permissions](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-permissions.html), [AgentCore runtime permissions](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-permissions.html))

- **Sendbird AI Agents**: Implements a clean two-layer model: Roles (broad groupings like AI Admin, AI QA Analyst, AI Support Team Lead, Compliance Reviewer) mapped to Permission Sets (granular capabilities like "edit knowledge base," "deploy workflows," "review flagged messages"). Permissions can be scoped to specific AI agents. This is the closest production example of formal RBAC specifically for AI agent management. ([Sendbird RBAC blog](https://sendbird.com/blog/ai-agent-role-based-access-control))

**Implication for Sherpa:** These RBAC systems govern *human users managing agents*, not *agents governing each other*. Sherpa's Planner/Worker/Judge model needs the latter — role-based permissions that agents enforce on other agents.

### 3. The MCP Authorization Spec Uses OAuth 2.1, Not RBAC — Authorization Is Explicitly Left to the Application Layer

The MCP specification (as of June 2025 and November 2025 updates) defines:

- MCP servers as OAuth 2.1 resource servers
- MCP clients as OAuth 2.1 clients
- Mandatory PKCE, Dynamic Client Registration, Authorization Server Metadata
- Resource Indicators (RFC 8707) to scope tokens to specific MCP servers
- Enterprise-Managed Authorization extension using Cross App Access (XAA) and ID-JAG

**Critical gap:** The MCP spec handles *authentication* (who are you?) and *token scoping* (which server can this token access?). It explicitly does NOT define what the authenticated client can do — that's left to the application. As Oso describes it: "OAuth decides who gets in, while [RBAC/ABAC/ReBAC] decides what they can do once inside." ([MCP authorization spec](https://modelcontextprotocol.io/specification/draft/basic/authorization), [Oso MCP auth guide](https://www.osohq.com/learn/authorization-for-ai-agents-mcp-oauth-21), [MCP spec critique](https://blog.christianposta.com/the-updated-mcp-oauth-spec-is-a-mess/), [Aaron Parecki on Nov 2025 MCP update](https://aaronparecki.com/2025/11/25/1/mcp-authorization-spec-update))

**Production implementations filling this gap:**

- **Cerbos + MCP**: Implements policy-based authorization (YAML policies) evaluated per tool invocation. MCP server queries Cerbos PDP with principal (user/agent + roles + attributes), resource (MCP tool/data), and action. Supports attribute-based constraints (e.g., "managers approve expenses under $1000"). Tools dynamically shown/hidden based on authorization. ([Cerbos MCP authorization](https://www.cerbos.dev/blog/mcp-authorization))

- **Red Hat MCP Gateway + Keycloak + OPA**: Tool permissions stored as Keycloak client roles. Each MCP server is a resource server client; each tool is a role. OPA extracts tool permissions from JWT `resource_access` claims. A "wristband" JWT contains the allowed-tools mapping. Supports OAuth2 Token Exchange (RFC 8693) for per-server scope narrowing. ([Red Hat MCP Gateway auth](https://developers.redhat.com/articles/2025/12/12/advanced-authentication-authorization-mcp-gateway))

- **InfoQ Agent Gateway + OPA**: Defines actor-to-environment RBAC in OPA Rego policies (e.g., `sre-bot` has `{dev, staging, prod}` access; `deploy-bot` has `{dev, staging}` only). Adds plan integrity checks (SHA-256 hash verification), change window enforcement (time-based), and destruction safeguards. Default-deny policy. ([InfoQ agent gateway](https://www.infoq.com/articles/building-ai-agent-gateway-mcp/))

**Implication for Sherpa:** MCP gives Sherpa the authentication layer but explicitly requires Sherpa to build the authorization layer. This is precisely the gap RBAC should fill.

### 4. RBAC Alone Is Argued to Be Insufficient — Hybrid RBAC+ABAC Is the Emerging Consensus

Multiple sources argue that static RBAC fails for AI agents because:

- **Role explosion**: Creating narrowly-scoped roles for each agent task leads to unmanageable proliferation ([Oso critique](https://www.osohq.com/learn/why-rbac-is-not-enough-for-ai-agents))
- **Speed and scale**: Agents operate at machine speed, causing "a year's worth of mistakes in a few seconds" through bulk operations before detection
- **Dynamic context**: An agent's effective role changes mid-task (a read-only query evolves into a write operation)
- **Over-permissioning**: Unlike humans, agents "relentlessly try to achieve" goals using all available permissions

The converging recommendation is **hybrid RBAC + ABAC + temporal scoping**:

| Layer | What It Controls | Example |
|-------|-----------------|---------|
| RBAC | Coarse role boundaries | Worker can read; Planner can write proposals |
| ABAC | Contextual constraints | Only during active session; only for owned initiatives |
| Temporal | Time-bounded access | Lease expires in 1 hour; fencing token valid for this transaction |
| ReBAC | Relationship-based | Agent can approve because it is the assigned reviewer |

The CloudMatos "Aegis Gateway" model provides the most detailed hybrid architecture: short-lived JWTs (15-60 min) with claims `{org, tenant, agent_id, role, scopes, exp, jti}`, OPA policy bundles for runtime evaluation, and configurable fail-closed/fail-open per risk level. Target enforcement latency: <10ms. ([CloudMatos RBAC+ABAC](https://www.cloudmatos.ai/blog/role-based-access-control-rbac-ai-agents/))

**Implication for Sherpa:** Pure RBAC is a solid starting point, but the design should anticipate ABAC extensions — particularly contextual constraints (session scope, initiative ownership) and temporal scoping (lease duration).

### 5. Authenticated Delegation Is the Emerging Standard for Agent-to-Agent Authority

The MIT Media Lab / ICML 2025 paper "AI Agents Need Authenticated Delegation" (Tobin South et al.) defines the most rigorous agent-to-agent authority model:

- **Three token types**: User ID-token (OIDC), Agent-ID Token (agent metadata as OAuth 2.0 Native Client), Delegation Token (references both via hash, digitally signed by delegator)
- **Dual-layer scoping**: Resource scoping (XACML/ODRL machine-readable policies for deterministic enforcement) + Task scoping (natural language guidance, non-binding)
- **Delegation chains**: When Agent A delegates to Agent B, scope can only narrow, never widen. Each hop logs structured interpretations for audit.
- **Authority attenuation**: Explicit deny lists, allow lists, conditional constraints, expiration mechanisms

([MIT paper](https://arxiv.org/html/2501.09674v1), [ICML 2025 poster](https://icml.cc/virtual/2025/poster/40172), [OpenReview](https://openreview.net/forum?id=9skHxuHyM4))

**Google DeepMind** has proposed a related framework for "Intelligent AI Delegation" securing the agentic web. ([MarkTechPost summary](https://www.marktechpost.com/2026/02/15/google-deepmind-proposes-new-framework-for-intelligent-ai-delegation-to-secure-the-emerging-agentic-web-for-future-economies/))

**Okta/Auth0** implements this operationally:
- Cross App Access (XAA) tracks and revokes delegation lineage, now part of MCP spec as "Enterprise-Managed Authorization"
- Token Vault requires cryptographic proof of current user session (solves confused deputy problem)
- Fine-Grained Authorization (FGA) enforces relationship-based access at each delegation hop
- Delegation Capability Tokens (DCTs) use append-only caveats (Macaroons/Biscuits/Wafers format) for offline scope attenuation
- Scope can only decrease at each delegation hop, never increase

([Okta delegation chain](https://www.okta.com/blog/ai/agent-security-delegation-chain/), [Scalekit on-behalf-of](https://www.scalekit.com/blog/delegated-agent-access), [CyberArk Zero Trust for agents](https://developer.cyberark.com/blog/zero-trust-for-ai-agents-delegation-identity-and-access-control/))

**Implication for Sherpa:** The Planner→Worker delegation and Worker→Judge submission are exactly the delegation patterns this research addresses. Sherpa's authority leases and fencing tokens map cleanly to delegation tokens with temporal attenuation.

### 6. OWASP Defines the Most Actionable Agent Trust Hierarchy

The OWASP AI Agent Security Cheat Sheet defines a concrete four-level trust hierarchy:

```
UNTRUSTED → INTERNAL → PRIVILEGED → SYSTEM
```

With corresponding enforcement:

| Risk Level | Trigger | Authorization |
|-----------|---------|---------------|
| LOW | Read operations, safe queries | Auto-approved |
| MEDIUM | Write operations, API calls | Conditional approval |
| HIGH | Financial transfers, deletion | Human review required |
| CRITICAL | Irreversible/security-sensitive | Mandatory human approval |

The `SecureAgentBus` pattern requires:
- Agent registration with assigned trust levels and recipient whitelists
- Cryptographic signature verification to prevent agent spoofing
- Allowlist-based path and operation scoping (e.g., `allowed_paths: ["/app/reports/*"]`, `allowed_operations: ["read"]`)

([OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html))

**Implication for Sherpa:** The OWASP trust hierarchy maps directly to Sherpa's dispatch model. Workers are INTERNAL (read+write within scoped initiative). Planners are PRIVILEGED (can create tasks, assign Workers). Judges are PRIVILEGED with SYSTEM-adjacent review authority. The risk-level classification provides a useful template for Sherpa's permission tiers.

### 7. The Academic Taxonomy of Agent Roles Is Well-Established but Permission-Agnostic

The 2025 taxonomy paper "Hierarchical Multi-Agent Systems: Design Patterns, Coordination Mechanisms, and Industrial Applications" (arXiv 2508.12683) identifies five organizational axes and several standard role archetypes:

**Standard role archetypes:**
- Manager/Coordinator (high-level decisions, task allocation)
- Worker/Executor (task execution)
- Supervisor (monitoring, oversight)
- Regional/Area Controller (intermediate coordination)
- Sensor (data collection)
- Intervention (corrective actions)
- Supply (resource management)

**Coordination protocols with implicit authority:**
- Contract Net Protocol (CNP): Manager announces tasks, contractors bid, manager retains allocation authority (used in 47% of surveyed systems)
- Auction-based: Auctioneer centralizes resource allocation
- Feudal MARL: Manager sets sub-goals for workers, explicit authority hierarchy

**Role assignment models:**
- AGR (Agent-Group-Role): Fixed roles defined at design time
- ROMA (Role-Oriented MARL): Roles as learned latent embeddings, dynamically specialized
- Holarchies: Groups of agents form higher-level "holons" that present as single units externally

([Taxonomy paper](https://arxiv.org/html/2508.12683), [AgentOrchestra](https://arxiv.org/html/2506.12508v1))

**Critical finding:** These taxonomies define *what agents do* but never *what agents are permitted to access*. The role taxonomy and the permission model are orthogonal concerns that no existing system connects formally.

**Implication for Sherpa:** Sherpa's Planner/Worker/Judge roles already map to the Manager/Executor/Supervisor taxonomy. The innovation would be connecting these roles to formal permissions — making the taxonomy load-bearing for authorization, not just organizational.

### 8. MCP Agent Mail Is the Only Production System Combining Advisory Leases with Agent Identity

The `mcp_agent_mail` project (GitHub) implements the closest existing system to Sherpa's envisioned coordination model:

- **Agent identity**: Memorable adjective+noun names (e.g., "GreenCastle"), project-scoped
- **File reservation leases**: Glob-pattern-based (`src/**`), TTL-scoped, exclusive or shared modes
- **Advisory enforcement**: Leases are signals, not hard locks. Pre-commit hooks block conflicting commits when `AGENT_NAME` is set.
- **Dual-layer storage**: Git (human-auditable artifacts) + SQLite (indexing, FTS5 search, conflict detection)
- **Identity auth**: Static bearer token or JWT+JWKS

This is cooperative/advisory — agents must choose to respect leases. There is no RBAC layer determining which agents can acquire which leases.

([mcp_agent_mail GitHub](https://github.com/Dicklesworthstone/mcp_agent_mail))

**Implication for Sherpa:** Sherpa's fencing tokens are the binding version of mcp_agent_mail's advisory leases. Adding RBAC determines *who can acquire leases on what*, not just *signaling intent*.

### 9. Policy Engines (OPA, Cedar, Cerbos) Are the Execution Layer — Not the Model Layer

Three policy engines dominate the authorization-for-agents space:

| Engine | Language | Model | Status |
|--------|----------|-------|--------|
| **OPA** (Open Policy Agent) | Rego | ABAC + custom | Apple acquired maintainers Aug 2025; future uncertain ([Oso comparison](https://www.osohq.com/learn/opa-vs-cedar-vs-zanzibar)) |
| **Cedar** (AWS) | Cedar | RBAC + ABAC + ReBAC | Used in Amazon Verified Permissions; formally verifiable; 42-60x faster than Rego ([Cedar guide](https://www.strongdm.com/cedar-policy-language)) |
| **Cerbos** | YAML | RBAC + ABAC | Stateless microservice; proven MCP integration; externalized policies ([Cerbos MCP blog](https://www.cerbos.dev/blog/mcp-authorization)) |

All three evaluate policies — none define the role model itself. They need RBAC role definitions fed to them. Sherpa would define the role model (Planner, Worker, Judge, Reviewer) and use a policy engine for runtime evaluation.

**Implication for Sherpa:** The policy engine is a deployment concern, not an architectural one. Sherpa should define its RBAC model in a policy-engine-agnostic way, then provide adapters for OPA/Cedar/Cerbos.

### 10. The A2A Protocol Provides Agent Capability Cards but No Permission Model

Google's Agent2Agent (A2A) protocol, launched April 2025 and now hosted by the Linux Foundation:

- Agents publish Agent Cards (JSON) advertising capabilities, security permissions, and metadata
- Security uses OpenAPI-aligned authentication (API keys, OAuth 2.0, OIDC)
- When authenticated, the remote agent is responsible for authorization and access control
- No built-in RBAC or permission framework — authorization is delegated to each agent

([A2A announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/), [A2A spec overview](https://a2a-protocol.org/latest/specification/), [A2A GitHub](https://github.com/a2aproject/A2A))

**Implication for Sherpa:** A2A's Agent Cards could inform Sherpa's agent registration model. Agent Cards declare capabilities; Sherpa's RBAC would declare permissions. The two are complementary.

---

## Implications for Sherpa's Governance Model

### The Gap Sherpa Can Fill

No existing system combines all three of:
1. **Formal RBAC role model** specifically for agent-to-agent governance (not just human-to-agent)
2. **Resource-level authority** (leases, fencing tokens, ownership)
3. **Delegation-aware scope attenuation** (Planner→Worker authority narrowing)

Sherpa's existing architecture provides natural anchors:

| Sherpa Concept | RBAC Mapping |
|----------------|-------------|
| Planner | Role with `create:task`, `assign:worker`, `read:initiative`, `write:proposal` permissions |
| Worker | Role with `read:task`, `write:implementation`, `submit:review` — scoped to assigned initiative |
| Judge | Role with `read:submission`, `write:verdict`, `approve:integration` — cannot create tasks or assign workers |
| Initiative Owner | Relationship-based: agent that created the initiative gets ownership permissions |
| Reviewer | Role activated by assignment, not identity — `read:proposal`, `write:review-verdict` |

### Recommended Hybrid Model

Based on this research, Sherpa should implement:

1. **RBAC core**: Named roles (Planner, Worker, Judge, Reviewer) with permission sets
2. **Resource scoping**: Permissions bound to specific initiatives, tasks, or file paths
3. **Temporal scoping**: Permissions bound to lease duration / fencing token validity
4. **Delegation attenuation**: When Planner assigns Worker, Worker's permissions are subset of Planner's authority over that initiative
5. **Policy-as-code**: Externalized policy definitions (YAML or similar), engine-agnostic
6. **Advisory→binding spectrum**: Start with advisory enforcement (hooks, convention checks) and progressively bind to hard enforcement at the MCP coordination layer

### What NOT to Build

- Do not build an identity provider — use existing OAuth 2.1 / MCP auth
- Do not build a policy engine — use OPA, Cedar, or Cerbos
- Do not implement full ABAC from day one — start with RBAC + resource scoping, add attribute conditions when needed
- Do not require agent "authentication" between agents in the same Sherpa instance — trust is established by the coordination server's authority, not by agent-to-agent handshakes

---

## Open Questions

1. **Should roles be static or earned?** Can a Worker demonstrate competence and be promoted to Planner? The ROMA model (learned role embeddings) suggests dynamic role assignment is viable but adds complexity.

2. **How do prompt-convention permissions compose with formal RBAC?** Sherpa currently enforces via CLAUDE.md instructions and hooks. When formal RBAC is added, which layer wins on conflict? The AWS two-layer model (explicit Deny overrides any Allow) is a proven pattern.

3. **What is the enforcement boundary?** Should RBAC be enforced at the MCP tool level (agent can't even see tools it lacks permissions for), at the coordination server level (agent can call tools but coordination server rejects unauthorized state changes), or both?

4. **Cross-initiative authority**: If a Worker is assigned to Initiative A, can it read (but not write) Initiative B's research? How granular should cross-initiative permissions be?

5. **Human override model**: When a human approves a proposal in Studio, does that override RBAC constraints? The OWASP model says CRITICAL actions always require human approval regardless of role.

6. **Ledger + RBAC composition**: How does the tamper-evident ledger interact with RBAC? Should every permission grant/revocation be a ledger entry? This creates a complete audit trail but adds write overhead.

7. **Delegation Capability Tokens vs. fencing tokens**: Should Sherpa adopt the Macaroons/Biscuits append-only caveat model for authority attenuation, or are fencing tokens (simpler, single-use) sufficient?

---

## Sources

### Primary References (deeply analyzed)

- [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html) — Trust hierarchy, SecureAgentBus pattern, risk-level classification, allowlist-based scoping
- [MIT Media Lab: Authenticated Delegation and Authorized AI Agents](https://arxiv.org/html/2501.09674v1) — Three-token delegation model, dual-layer scoping, authority attenuation
- [Oso: Why RBAC Is Not Enough for AI Agents](https://www.osohq.com/learn/why-rbac-is-not-enough-for-ai-agents) — RBAC failure modes, proposed dynamic context-aware alternative
- [Oso: Authorization for MCP (OAuth 2.1, PRMs)](https://www.osohq.com/learn/authorization-for-ai-agents-mcp-oauth-21) — RBAC/ReBAC/ABAC layering on top of MCP OAuth
- [Cerbos: MCP Authorization with Fine-Grained Access Control](https://www.cerbos.dev/blog/mcp-authorization) — YAML policy engine for MCP tool-level authorization
- [Red Hat: Advanced Authentication and Authorization for MCP Gateway](https://developers.redhat.com/articles/2025/12/12/advanced-authentication-authorization-mcp-gateway) — Keycloak + OPA for tool-as-role MCP authorization
- [InfoQ: Building Least-Privilege AI Agent Gateway with MCP + OPA](https://www.infoq.com/articles/building-ai-agent-gateway-mcp/) — OPA Rego policy for agent RBAC with environment scoping
- [CloudMatos: RBAC Excellence for AI Agents](https://www.cloudmatos.ai/blog/role-based-access-control-rbac-ai-agents/) — Aegis Gateway hybrid RBAC+ABAC, JWT model, OPA enforcement
- [Sendbird: RBAC for AI Agents](https://sendbird.com/blog/ai-agent-role-based-access-control) — Clean two-layer model (Roles → Permission Sets → Agent scoping)
- [Microsoft Foundry RBAC docs](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-foundry?view=foundry-classic) — Four built-in roles, custom role JSON, agent identity via Entra ID
- [Hierarchical Multi-Agent Systems Taxonomy (arXiv 2508.12683)](https://arxiv.org/html/2508.12683) — Five-axis taxonomy, role archetypes, coordination protocols
- [mcp_agent_mail (GitHub)](https://github.com/Dicklesworthstone/mcp_agent_mail) — Advisory file leases, agent identity, dual Git+SQLite storage
- [Okta: Fixing AI Agent Delegation Chains](https://www.okta.com/blog/ai/agent-security-delegation-chain/) — DCTs, scope attenuation, XAA, Token Vault
- [CyberArk: Zero Trust for AI Agents](https://developer.cyberark.com/blog/zero-trust-for-ai-agents-delegation-identity-and-access-control/) — OPA + delegation tokens, JIT/JEA access

### Secondary References (surveyed)

- [MCP Authorization Spec (draft)](https://modelcontextprotocol.io/specification/draft/basic/authorization) — OAuth 2.1 resource server model
- [MCP Auth Spec Critique (Christian Posta)](https://blog.christianposta.com/the-updated-mcp-oauth-spec-is-a-mess/) — Enterprise gaps in MCP auth
- [Aaron Parecki: November 2025 MCP Auth Update](https://aaronparecki.com/2025/11/25/1/mcp-authorization-spec-update) — CIMD, enterprise-managed authorization
- [Auth0: MCP Spec Updates June 2025](https://auth0.com/blog/mcp-specs-update-all-about-auth/) — Resource indicators, server-only resource servers
- [Auth0: Access Control in the Era of AI Agents](https://auth0.com/blog/access-control-in-the-era-of-ai-agents/)
- [Descope: MCP Authorization Spec Dive](https://www.descope.com/blog/post/mcp-auth-spec)
- [Stytch: MCP Auth Implementation Guide](https://stytch.com/blog/MCP-authentication-and-authorization-guide/)
- [OpenAI Agents SDK Guardrails](https://openai.github.io/openai-agents-python/guardrails/) — Input/output/tool guardrails
- [OpenAI Agent Safety Guide](https://platform.openai.com/docs/guides/agent-builder-safety)
- [CrewAI Guardrails Guide](https://www.analyticsvidhya.com/blog/2025/11/introduction-to-task-guardrails-in-crewai/)
- [AutoGen Intervention Handler](https://microsoft.github.io/autogen/stable//user-guide/core-user-guide/cookbook/tool-use-with-intervention.html)
- [LangGraph + Arcade Agent Auth](https://www.arcade.dev/blog/agent-authorization-langgraph-guide) — JIT OAuth, least-privilege tool scoping
- [AWS Bedrock Agent Permissions](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-permissions.html)
- [AWS AgentCore Runtime Permissions](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-permissions.html)
- [AWS Well-Architected GenAI Lens: Least Privilege for Agentic Workflows](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/gensec05-bp01.html) — 4-step IAM scoping, permission boundaries, SCPs
- [Securing AI Agents: RBAC for Industrial Applications (arXiv 2509.11431)](https://arxiv.org/abs/2509.11431) — On-premises RBAC framework for AI agents
- [RBAC in MAS using Agent Coordination Contexts (ResearchGate)](https://www.researchgate.net/publication/241308120_Role-Based_Access_Control_in_MAS_using_Agent_Coordination_Contexts)
- [Agent-Based Semantic Role Mining for Smart Cities (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8272182/) — I-RBAC multi-agent role mining
- [Microsoft Foundry Agent Identity](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-identity) — Attended vs unattended agent auth
- [Microsoft Agent Framework Overview](https://learn.microsoft.com/en-us/agent-framework/overview/)
- [Semantic Kernel Agent Framework](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/)
- [A2A Protocol Announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [A2A Protocol Spec](https://a2a-protocol.org/latest/specification/)
- [A2A GitHub](https://github.com/a2aproject/A2A)
- [ICML 2025 Poster: AI Agents Need Authenticated Delegation](https://icml.cc/virtual/2025/poster/40172)
- [OpenReview: Position Paper on Authenticated Delegation](https://openreview.net/forum?id=9skHxuHyM4)
- [Google DeepMind Delegation Framework](https://www.marktechpost.com/2026/02/15/google-deepmind-proposes-new-framework-for-intelligent-ai-delegation-to-secure-the-emerging-agentic-web-for-future-economies/)
- [Scalekit: On-Behalf-Of Authentication for AI Agents](https://www.scalekit.com/blog/delegated-agent-access)
- [Tony Kipkemboi: RBAC for AI Agents](https://www.tonykipkemboi.com/blog/agent-authentication-rbac) — Agent profile components, cell-level RBAC concept
- [Permit.io AI Access Control](https://www.permit.io/ai-access-control) — Four-perimeter framework, LangFlow integration
- [Permit.io: State of Authorization 2025](https://www.permit.io/blog/state-of-authorization-2025)
- [OPA vs Cedar vs Zanzibar Comparison](https://www.osohq.com/learn/opa-vs-cedar-vs-zanzibar)
- [Solo.io: Agent Mesh for Enterprise](https://www.solo.io/blog/agent-mesh-for-enterprise-agents) — Zero-trust, SPIFFE identity, mTLS, AgentCards
- [Oasis Security: Agentic Access Management Framework](https://www.oasis.security/blog/agentic-access-management-framework) — Seven pillars of agent governance
- [CyberArk Secure AI Agents Solution](https://www.cyberark.com/press/cyberark-introduces-first-identity-security-solution-purpose-built-to-protect-ai-agents-with-privilege-controls/)
- [Anthropic Claude Code Sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing) — Filesystem + network isolation, 84% prompt reduction
- [Anthropic Claude Code Security](https://docs.anthropic.com/en/docs/claude-code/security)

### Raw Links (every URL encountered, including tangential)

- https://concentric.ai/how-role-based-access-control-rbac-helps-data-security-governance/
- https://buildwithfern.com/post/rbac-role-based-access-control-guide
- https://air-governance-framework.finos.org/mitigations/mi-12_role-based-access-control-for-ai-data.html
- https://www.emergentmind.com/topics/role-based-access-control-rbac-role-agent
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5204283
- https://nizamudheenti.medium.com/role-based-access-control-isnt-enough-for-autonomous-ai-agents-here-s-the-simple-reason-why-dfe49c86b536
- https://github.com/anthropics/claude-code-action/issues/647
- https://support.claude.com/en/articles/12922490-remote-mcp-server-submission-guide
- https://code.claude.com/docs/en/settings
- https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp
- https://platform.claude.com/docs/en/agent-sdk/mcp
- https://www.truefoundry.com/blog/mcp-authentication-in-claude-code
- https://github.com/anthropics/claude-code/issues/28580
- https://modelcontextprotocol.io/docs/develop/connect-local-servers
- https://loginov-rocks.medium.com/build-remote-mcp-with-authorization-a2f394c669a8
- https://support.claude.com/en/articles/11596036-anthropic-connectors-directory-faq
- https://docs.langchain.com/langgraph-platform/autogen-integration
- https://langchain-ai.github.io/langgraph/how-tos/autogen-integration-functional/
- https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared
- https://mljourney.com/langgraph-vs-crewai-vs-autogen-which-agent-framework-should-you-use-in-2026/
- https://dev.to/synsun/autogen-vs-langgraph-vs-crewai-which-agent-framework-actually-holds-up-in-2026-3fl8
- https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen
- https://galileo.ai/blog/mastering-agents-langgraph-vs-autogen-vs-crew
- https://www.gettingstarted.ai/best-multi-agent-ai-framework/
- https://composio.dev/blog/openai-agents-sdk-vs-langgraph-vs-autogen-vs-crewai
- https://aaronyuqi.medium.com/first-hand-comparison-of-langgraph-crewai-and-autogen-30026e60b563
- https://cobusgreyling.medium.com/openai-ai-agents-sdk-guardrails-206bb1e777bc
- https://towardsdatascience.com/hands-on-with-agents-sdk-safeguarding-input-and-output-with-guardrails/
- https://cobusgreyling.substack.com/p/openai-ai-agents-sdk-guardrails
- https://platform.openai.com/docs/guides/agents
- https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- https://github.com/openai/openai-agents-python
- https://developers.openai.com/resources/agents/
- https://www.profsandhu.com/articles/advcom/adv_comp_rbac.pdf
- https://medium.com/@christopher_79834/ai-agent-rbac-essential-security-framework-for-enterprise-ai-deployment-d9d1d4711183
- https://docs.aws.amazon.com/bedrock/latest/userguide/security_iam_id-based-policy-examples-agent.html
- https://docs.aws.amazon.com/bedrock/latest/userguide/security_iam_id-based-policy-examples.html
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-oauth.html
- https://docs.aws.amazon.com/bedrock/latest/userguide/security_iam_service-with-iam.html
- https://www.trendmicro.com/cloudoneconformity/knowledge-base/aws/Bedrock/service-role-policy-too-permissive.html
- https://sonraisecurity.com/blog/aws-agentcore-privilege-escalation-bedrock-scp-fix/
- https://aws.permissions.cloud/iam/bedrock
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/security_iam_service-with-iam.html
- https://learn.microsoft.com/en-us/semantic-kernel/
- https://visualstudiomagazine.com/articles/2025/10/01/semantic-kernel-autogen--open-source-microsoft-agent-framework.aspx
- https://github.com/microsoft/semantic-kernel/discussions/13215
- https://devblogs.microsoft.com/semantic-kernel/
- https://learn.microsoft.com/en-us/microsoft-365/agents-sdk/using-semantic-kernel-agent-framework
- https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/
- https://github.com/microsoft/semantic-kernel/discussions/13209
- https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/
- https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry
- https://learn.microsoft.com/en-us/azure/foundry-classic/openai/how-to/role-based-access-control?view=foundry-classic
- https://learn.microsoft.com/en-us/azure/ai-studio/concepts/rbac-ai-studio
- https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/publish-agent?view=foundry
- https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/hub-rbac-foundry?view=foundry-classic
- https://learn.microsoft.com/en-us/answers/questions/5774138/how-to-set-permission-for-microsoft-foundry-to-cal
- https://learn.microsoft.com/en-us/azure/foundry-classic/concepts/hub-rbac-foundry
- https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/concepts/rbac-foundry.md
- https://thoughtminds.ai/blog/multi-agent-orchestration
- https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
- https://www.ibm.com/think/topics/ai-agent-orchestration
- https://arxiv.org/html/2505.10468v4
- https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
- https://kanerika.com/blogs/ai-agent-orchestration/
- https://www.cio.com/article/4138739/21-agent-orchestration-tools-for-managing-your-ai-fleet.html
- https://arxiv.org/html/2507.19902v1
- https://www.dailydoseofds.com/ai-agents-crash-course-part-12-with-implementation/
- https://www.media.mit.edu/publications/authenticated-delegation-and-authorized-ai-agents/
- https://dev.to/uenyioha/securing-agentic-systems-with-authenticated-delegation-part-i-3g40
- https://blog.metamirror.io/architecting-a-unified-agent-policy-for-delegated-authority-in-ai-ecosystems-befe268f4708
- https://www.firefly.ai/blog/building-with-open-policy-agent-opa-for-better-policy-as-code
- https://www.openpolicyagent.org/
- https://www.openpolicyagent.org/docs
- https://raunakbalchandani.medium.com/enforcing-policy-as-code-open-policy-agent-opa-508883d6c0e8
- https://github.com/open-policy-agent/opa
- https://www.permit.io/blog/authorization-with-open-policy-agent-opa
- https://medium.com/spacelift/top-12-policy-as-code-pac-tools-in-2025-a589537fd4e7
- https://www.strongdm.com/cedar-policy-language
- https://medium.com/@tahirbalarabe2/how-cedar-simplifies-aws-access-control-with-examples-6cc8aebdc5c6
- https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-verified-permissions-cedar-4-5/
- https://aws.amazon.com/verified-permissions/resources/
- https://aws.amazon.com/verified-permissions/faqs/
- https://aws.amazon.com/about-aws/whats-new/2023/05/cedar-open-source-language-access-control/
- https://aws.amazon.com/verified-permissions/
- https://docs.aws.amazon.com/verifiedpermissions/latest/userguide/terminology.html
- https://docs.aws.amazon.com/verifiedpermissions/latest/userguide/what-is-avp.html
- https://docs.aws.amazon.com/verifiedpermissions/latest/userguide/security_iam_id-based-policy-examples.html
- https://www.ibm.com/think/topics/agent2agent-protocol
- https://auth0.com/blog/auth0-google-a2a/
- https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade
- https://platformengineering.com/editorial-calendar/best-of-2025/google-cloud-unveils-agent2agent-protocol-a-new-standard-for-ai-agent-interoperability-2/
- https://codelabs.developers.google.com/intro-a2a-purchasing-concierge
- https://www.kenility.com/blog/ai-tech-innovations/google-a2a-protocol-guide-ultimate-ai-agent-orchestration-strategy
- https://docs.crewai.com
- https://towardsdatascience.com/how-to-implement-guardrails-for-your-ai-agents-with-crewai-80b8cb55fa43/
- https://blog.crewai.com/how-crewai-is-evolving-beyond-orchestration-to-create-the-most-powerful-agentic-ai-platform/
- https://aws.amazon.com/blogs/machine-learning/automating-regulatory-compliance-a-multi-agent-solution-using-amazon-bedrock-and-crewai/
- https://www.coderio.com/blog/expertise/advanced-technologies/agent-guardrails-101-permissions-tool-scopes-audit-trails-policy-code/
- https://community.crewai.com/t/security-guardrail-for-sensitive-data/7357
- https://cervio.medium.com/stop-your-ai-agents-from-going-rogue-a-practical-guide-to-crewai-guardrails-a325fb5e9eca
- https://github.com/akj2018/Multi-AI-Agent-Systems-with-crewAI/blob/main/README.md
- https://github.com/crewAIInc/crewAI/issues/2177
- https://www.obsidiansecurity.com/blog/security-for-ai-agents
- https://hyphenxsolutions.com/Blog/designing-least-privilege-access-for-agentic-workflows/
- https://www.helpnetsecurity.com/2026/03/03/enterprise-ai-agent-security-2026/
- https://www.franziroesner.com/pdf/wu-agentperms-sp26.pdf
- https://www.uscsinstitute.org/cybersecurity-insights/blog/what-is-ai-agent-security-plan-2026-threats-and-strategies-explained
- https://www.infoq.com/news/2025/11/anthropic-claude-code-sandbox/
- https://ably.com/docs/guides/ai-transport/anthropic/anthropic-human-in-the-loop
- https://medium.com/@Micheal-Lanham/claude-cowork-architecture-how-anthropic-built-a-desktop-agent-that-actually-respects-your-files-cf601325df86
- https://dextralabs.com/blog/claude-ai-safety-enterprise-governance/
- https://www.letsdatascience.com/blog/anthropic-launches-claude-cowork-the-agent-that-lives-on-your-desktop
- https://awesomeagents.ai/news/claude-code-auto-mode-research-preview/
- https://micheallanham.substack.com/p/claude-cowork-architecture-synthesis
- https://www.morphllm.com/claude-code-dangerously-skip-permissions
- https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-162.pdf
- https://csrc.nist.gov/pubs/sp/800/162/upd2/final
- https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-178.pdf
- https://csrc.nist.gov/files/pubs/sp/800/162/upd2/final/docs/sp800_162_draft.pdf
- https://www.archtis.com/nist-sp-800-162-attribute-based-access-control-abac-guide/
- https://csrc.nist.gov/CSRC/media/Projects/Attribute-Based-Access-Control/documents/july2013_workshop/july2013_abac_workshop_abac-sp.pdf
- https://csrc.nist.gov/news/2014/sp-800-162,-guide-to-abac-definition-and-considera
- https://www.nextlabs.com/products/application-enforcer/nist-sp-800-162-attribute-based-access-control-abac/
- https://csrc.nist.rip/projects/abac/
- https://aimultiple.com/open-source-rbac
- https://www.kubiya.ai/blog/ai-agent-orchestration-frameworks
- https://www.vellum.ai/blog/top-ai-agent-frameworks-for-developers
- https://www.langflow.org/blog/the-complete-guide-to-choosing-an-ai-agent-framework-in-2025
- https://solace.com/products/agent-mesh/
- https://github.com/SolaceLabs/solace-agent-mesh
- https://devblogs.microsoft.com/foundry/introducing-microsoft-agent-framework-the-open-source-engine-for-agentic-ai-apps/
- https://github.com/MinimalFuture/AgentMesh
- https://www.permit.io
- https://www.permit.io/blog/announcing-permit-ai-access-control-ai-identity-fga
- https://www.permit.io/blog/rbac-vs-abac-vs-rebac
- https://www.permit.io/blog/we-let-ai-handle-user-permissions
- https://www.permit.io/blog/introducing-the-new-permit-cli
- https://www.permit.io/blog
- https://www.permit.io/blog/policy-engines
- https://www.permit.io/blog/what-is-fine-grained-authorization-fga
- https://www.osohq.com/academy/relationship-based-access-control-rebac
- https://www.permit.io/blog/what-is-google-zanzibar
- https://en.wikipedia.org/wiki/Google_Zanzibar
- https://www.aserto.com/blog/google-zanzibar-drive-rebac-authorization-model
- https://authzed.com/docs/spicedb/concepts/zanzibar
- https://github.com/ory/rerag-rebac
- https://authzed.com/learn/google-zanzibar
- https://workos.com/guide/google-zanzibar
- https://arxiv.org/html/2603.09134
- https://arxiv.org/html/2505.02279v1
- https://nexaitech.com/multi-ai-agent-architecutre-patterns-for-scale/
- https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
- https://arxiv.org/html/2504.21030v1
- https://dl.acm.org/doi/10.1145/545056.545078
- https://journalwjarr.com/sites/default/files/fulltext_pdf/WJARR-2025-1985.pdf
- https://www.aalpha.net/blog/how-to-build-multi-agent-ai-system/
- https://www.techrxiv.org/users/1007269/articles/1367390/master/file/data/LLM_MAS_Memory_Survey_preprint_/LLM_MAS_Memory_Survey_preprint_.pdf?inline=true
- https://grokipedia.com/page/Multi-agent_system
- https://arxiv.org/abs/2508.12683
- https://arxiv.org/html/2601.12560v1
- https://arxiv.org/html/2601.01743v1
- https://www.emergentmind.com/topics/hierarchical-multi-agent-framework
- https://arxiv.org/abs/2506.12508
- https://overcoffee.medium.com/hierarchical-multi-agent-systems-concepts-and-operational-considerations-e06fff0bea8c
- https://medium.com/@akankshasinha247/building-multi-agent-architectures-orchestrating-intelligent-agent-systems-46700e50250b
- https://medium.com/@dave-patten/mcps-next-phase-inside-the-november-2025-specification-49f298502b03
- https://spring.io/blog/2025/04/02/mcp-server-oauth2/
- https://modelcontextprotocol.info/specification/draft/basic/authorization/
- https://dasroot.net/posts/2026/03/model-context-protocol-mcp-explained/
- https://www.strata.io/agentic-identity-sandbox/securing-mcp-servers-at-scale-how-to-govern-ai-agents-with-an-enterprise-identity-fabric/
- https://www.solo.io/blog/security-holes-in-mcp-servers-and-how-to-plug-them
- https://mcp.aibase.com/server/1552741640140234769
- https://astrix.security/learn/blog/state-of-mcp-server-security-2025/
- https://www.infisign.ai/blog/what-is-mcp-authentication-authorization
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5652350
- https://www.electricmind.com/whats-on-our-mind/7-best-practices-for-building-a-responsible-ai-agent-governance-framework
- https://writer.com/guides/agentic-ai-governance/
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5511060
- https://www.emergentmind.com/topics/planner-executor-agentic-framework
- https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/mgf-for-agentic-ai.pdf
- https://kpmg.com/us/en/articles/2025/ai-governance-for-the-agentic-ai-era.html
- https://www.okta.com/solutions/secure-ai/
- https://www.okta.com/blog/ai/ai-agent-security-when-authorization-outlives-intent/
- https://www.okta.com/blog/ai/ai-security-agent-cross-system-trust/
- https://www.okta.com/identity-101/role-of-ai-in-iam/
- https://www.okta.com/newsroom/press-releases/new-okta-innovations-secure-the-ai-driven-enterprise-and-combat-/
- https://www.okta.com/blog/product-innovation/launch-week-oktane-edition-september25/
- https://www.okta.com/blog/ai/agent-security-identity-authorization/
- https://www.okta.com/blog/ai/generative-and-agentic-ai--a-security-perspective-with-okta/
- https://www.okta.com/newsroom/press-releases/auth0-platform-innovation/
- https://github.com/microsoft/autogen
- https://fast.io/resources/autogen-mcp-integration/
- https://www.token.security/blog/hidden-machine-identity-security-risks-in-ai-agent-architectures
- https://microsoft.github.io/autogen/dev//user-guide/autogenstudio-user-guide/index.html
- https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/framework/agent-and-agent-runtime.html
- https://www.aigl.blog/content/files/2025/04/Agentic-AI---Threats-and-Mitigations.pdf
- https://medium.com/@samuel.grummons/building-enterprise-ai-agents-with-least-privilege-a-langgraph-security-framework-ea1cbfebcc1d
- https://aws.amazon.com/blogs/industries/announcing-the-well-architected-fsi-lens-updated-for-generative-ai-and-agentic-ai/
- https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html
- https://docs.aws.amazon.com/pdfs/wellarchitected/latest/generative-ai-lens/generative-ai-lens.pdf
- https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/security.html
- https://aws.amazon.com/about-aws/whats-new/2025/11/new-aws-well-architected-lenses-ai-ml-workloads/
- https://aws.amazon.com/blogs/architecture/announcing-the-updated-aws-well-architected-generative-ai-lens/
- https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/gensec01-bp01.html
- https://www.infoq.com/news/2025/12/aws-expands-well-architected/
- https://aws.amazon.com/blogs/architecture/architecting-for-ai-excellence-aws-launches-three-well-architected-lenses-at-reinvent-2025/
- https://www.langchain.com/langgraph
- https://reference.langchain.com/python/langgraph/agents
- https://www.leanware.co/insights/langchain-agents-complete-guide-in-2025
- https://www.datacamp.com/tutorial/langgraph-agents
- https://changelog.langchain.com/?date=2025-09-01
- https://www.franziroesner.com/pdf/wu-agentperms-sp26.pdf
