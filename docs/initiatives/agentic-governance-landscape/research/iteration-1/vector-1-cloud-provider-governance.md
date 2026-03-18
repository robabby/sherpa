# Cloud Provider Agent Governance — Landscape Research

> **AI-generated** 2026-03-17 · Awaiting human review
> Sources: agentic-governance-landscape

Research covering Vector 1 (Vendor Landscape) and Vector 3 (Cloud Provider Tier) from the initiative proposal. Maps agent governance capabilities across AWS, Google Cloud, and Microsoft Azure as of March 2026.

---

## Key Discoveries

### Microsoft Azure — Microsoft Agent 365

The most comprehensive agent governance offering of any cloud provider. Agent 365 is a dedicated control plane for AI agents, distinct from the agent runtime itself.

- **GA Date:** May 1, 2026. Currently in Frontier preview (requires M365 Copilot license + Frontier program enrollment). ([Source](https://learn.microsoft.com/en-us/microsoft-agent-365/overview))
- **Identity:** Each agent gets a **Microsoft Entra Agent ID** — a first-class identity in the enterprise directory, equivalent to a user identity. Supports conditional access policies, risk-based access control, identity protection, and identity governance (sponsorship, ownership, lifecycle workflows, time-bound access). ([Source](https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents))
- **Agent Registry:** Unified inventory of all agents across Microsoft platforms and non-Microsoft ecosystems. Includes agents with Entra Agent ID, manually registered agents, and **shadow agents** (unmanaged agents detected in the environment). ([Source](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-365-overview))
- **Agent Map:** Visual topology showing connections between agents, people, and data. Clusters agents by platform (Copilot Studio lite/full, Agents Toolkit, third-party). Supports up to 800 agents. ([Source](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-map))
- **Observability:** SDK-based telemetry flowing into Microsoft Defender. Tracks agent activity, tool usage, AI model interactions. Hero metrics: active users, total sessions, exception rate, agent runtime (cumulative session duration). Supports agents built in Copilot Studio, Azure AI Foundry, and third-party runtimes. ([Source](https://learn.microsoft.com/en-us/microsoft-agent-365/admin/monitor-agents))
- **Threat Detection:** Microsoft Defender integration with out-of-the-box detection rules for risky agent activities. Advanced hunting via KQL queries against `CloudAppEvents` table. Action types tracked: `InvokeAgent`, `InferenceCall`, `ExecuteToolBySDK`, `ExecuteToolByGateway`, `ExecuteToolByMCPServer`. ([Source](https://learn.microsoft.com/en-us/microsoft-agent-365/admin/threat-protection))
- **Compliance:** Deep Microsoft Purview integration. Agents treated like users for policy purposes. Supported capabilities: auditing, data classification, sensitivity labels, DLP, insider risk management, communication compliance, eDiscovery, data lifecycle management, compliance manager. Agent interactions (agent-to-human, human-to-agent, agent-to-tools, agent-to-agent) are all auditable. ([Source](https://learn.microsoft.com/en-us/purview/ai-agent-365))
- **Network Controls:** Global Secure Access enforcement for agents — web content filtering, threat intelligence filtering, network file filtering, prompt injection attack detection at the network layer. ([Source](https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents))
- **Admin Controls:** Enable/disable/assign/block/remove agents per user/group. Approval workflows for org-published agents. Admin can block shared agents deemed unsafe or noncompliant. Governance action cards: pending requests, ownerless agents. ([Source](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-copilot-agents-integrated-apps))
- **RBAC:** AI Admin role and Global Reader (view-only) for agent management. Agent ID Administrator role in Entra. ([Source](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-copilot-agents-integrated-apps))
- **Pricing Model:** Per-user licensing at GA. All agents acting on behalf of a licensed user are covered under that user's Agent 365 or Microsoft 365 E7 license. Agents do not require their own license. During Frontier preview, licenses are per-agent-instance (25 included). ([Source](https://learn.microsoft.com/en-us/microsoft-agent-365/overview))
- **Interoperability:** MCP server support, A2A protocol awareness, agentic tools for Outlook/Teams/SharePoint. Agents from Copilot Studio, Azure AI Foundry, and third-party runtimes can all onboard. ([Source](https://learn.microsoft.com/en-us/microsoft-agent-365/overview))

### AWS — Amazon Bedrock AgentCore

Infrastructure-first approach. Provides the operational primitives (runtime, identity, policy, observability) as modular services rather than a unified governance console.

- **GA Status:** Core platform is GA (exact date not confirmed in public docs, likely late 2025 / early 2026). Evaluations feature is in Preview. ([Source](https://aws.amazon.com/bedrock/agentcore/))
- **Runtime:** Serverless agent deployment with complete session isolation. Supports low-latency conversations to 8-hour async tasks. Code upload or container deployment. ([Source](https://aws.amazon.com/bedrock/agentcore/))
- **Policy Enforcement:** Real-time enforcement of agent actions using **Cedar-based policy rules**. Natural language policy authoring that compiles to Cedar. Described as "comprehensive control over agent actions with real-time enforcement." This is notable — Cedar is the formal authorization language Amazon built for Verified Permissions. ([Source](https://aws.amazon.com/bedrock/agentcore/))
- **Identity:** Integration with existing identity providers for automated authentication and permission delegation. Agents access AWS resources and third-party services on behalf of users. No charge when used through Runtime or Gateway; otherwise per-token-request. ([Source](https://aws.amazon.com/bedrock/agentcore/))
- **Guardrails:** Amazon Bedrock Guardrails (separate from AgentCore) provides six safeguard policies: content filters, denied topics, PII redaction, word filters, contextual grounding, and automated reasoning checks. Claims 88% harmful content blocking at 99% accuracy. Cross-model — works on Bedrock-hosted and third-party models (OpenAI, Gemini). ApplyGuardrail API enables guardrail evaluation independent of model invocation. ([Source](https://aws.amazon.com/bedrock/guardrails/))
- **Tool Gateway:** Transforms APIs and Lambda functions into agent-compatible tools. MCP server connectivity. Semantic search-based tool discovery. Per-API-call pricing. ([Source](https://aws.amazon.com/bedrock/agentcore/))
- **Observability:** CloudWatch-powered dashboards tracking token usage, latency, session duration, error rates. OpenTelemetry integration for compatibility with existing monitoring stacks. PII masking available on logs. ([Source](https://aws.amazon.com/bedrock/agentcore/))
- **Evaluations (Preview):** Samples and scores live agent interactions using built-in and custom evaluators. Measures correctness, helpfulness, safety, and goal success rates. ([Source](https://aws.amazon.com/bedrock/agentcore/))
- **Memory:** Short-term (per raw event) and long-term (per stored record per day + per retrieval call) memory services. ([Source](https://aws.amazon.com/bedrock/agentcore/pricing/))
- **Pricing Model:** Pure consumption-based, no upfront commitments or minimum fees. Nine modular services priced independently: Runtime (per-second CPU+memory), Gateway (per API call), Policy (per authorization request), Identity (per token request), Memory (per event/record/retrieval), Observability (CloudWatch rates), Evaluations (per token processed). $200 free tier credits for new customers. ([Source](https://aws.amazon.com/bedrock/agentcore/pricing/))
- **Security:** Complete session isolation, VPC connectivity, PrivateLink support, sandboxed code interpreter, secure browser runtime. ([Source](https://aws.amazon.com/bedrock/agentcore/))
- **Enterprise Adoption:** Bedrock Guardrails adopters include Chime Financial, KONE, Panorama, Strava, Remitly, and PwC. AgentCore-specific customer announcements not yet found. ([Source](https://aws.amazon.com/bedrock/guardrails/))

### Google Cloud — Vertex AI Agent Engine + Agent Builder

The most developer-oriented approach. Agent Engine provides managed runtime with security features; governance capabilities are delivered through existing Google Cloud services rather than a dedicated governance product.

- **GA Status:** Agent Engine Runtime, Sessions, Memory Bank, and Code Execution are GA. Agent Identity, Threat Detection, Cloud API Registry, Quality/Evaluation, and A2A Protocol are in Preview. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview))
- **Agent Engine Runtime:** Managed deployment with auto-scaling, custom container images, VPC-SC compliance. Supports ADK, LangChain, LangGraph, AG2, LlamaIndex, CrewAI, and custom frameworks. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview))
- **Agent Identity (Preview):** IAM-based identity for agents running on Agent Engine Runtime. Session-level and Memory Bank-level IAM Conditions for granular access control. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-builder/overview))
- **Cloud API Registry (Preview):** Central console for organizations to view and manage the MCP servers and tools agents can access. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-builder/overview))
- **Threat Detection (Preview):** Security Command Center integration to detect and investigate potential attacks on deployed agents. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-builder/overview))
- **Observability:** Google Cloud Trace (OpenTelemetry), Cloud Monitoring (latency, request count, error rate, token/CPU/memory), Cloud Logging. Four dashboard views: Overview, Models, Tools, Usage. Configurable prompt input/output logging. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/manage))
- **A2A Protocol:** Agent-to-agent communication protocol with SDKs in Python, Go, JavaScript, Java, C#/.NET. Protocol documented at a2a-protocol.org. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-builder/overview))
- **Enterprise Security:** VPC Service Controls, Private Service Connect, customer-managed encryption keys (CMEK), data residency zones, HIPAA compliance, Access Transparency and Access Approval logs. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview))
- **Lifecycle Management:** CRUD operations (list, get, update, delete) for deployed agents. Configurable container scaling (min/max instances, memory/CPU limits, concurrency). Updates take seconds to minutes. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/manage))
- **Pricing Model:** Free tier available for Runtime. Agent-specific pricing not yet published separately — likely bundled with underlying Gemini model costs (per-token). Agent Engine infrastructure costs are consumption-based (compute resources). ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview))
- **Framework:** Agent Development Kit (ADK) is Google's first-party framework. Full integration also with LangChain/LangGraph. This is the most framework-agnostic of the three providers. ([Source](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview))

---

## Comparative Matrix

| Capability | Microsoft Agent 365 | AWS AgentCore | Google Cloud Agent Engine |
|---|---|---|---|
| **GA Date** | May 1, 2026 | GA (core), 2025/2026 | GA (core), Preview (governance) |
| **Agent Discovery** | Registry + shadow agent detection + Agent Map visualization | Runtime inventory via console | List deployed agents via console/API |
| **Agent Identity** | Entra Agent ID (first-class directory identity) | IdP integration, delegated auth | IAM-based agent identity (Preview) |
| **Policy Enforcement** | Conditional access + DLP + sensitivity labels | Cedar-based real-time policy | VPC-SC + IAM Conditions |
| **Audit Trails** | Purview unified audit log (all interaction types) | CloudWatch logs + PII masking | Cloud Logging + Access Transparency |
| **RBAC** | AI Admin, Global Reader, Agent ID Administrator | IAM policies (standard AWS) | IAM roles (standard GCP) |
| **Fleet Management** | Agent Map (up to 800 agents), clustering by platform | Serverless scaling, no explicit fleet view | Auto-scaling, container management |
| **Cost Control** | Per-user licensing (all agents under user covered) | Per-service consumption metering | Consumption-based (bundled with model costs) |
| **Threat Detection** | Microsoft Defender integration, KQL hunting | Guardrails (content safety), evaluations | Security Command Center (Preview) |
| **Compliance** | 12 Purview capabilities (DLP, eDiscovery, retention, etc.) | Guardrails (6 safeguard types) | VPC-SC, CMEK, HIPAA, Access Transparency |
| **Interoperability** | MCP + A2A awareness, multi-runtime onboarding | MCP via Gateway, any-model guardrails | A2A protocol, MCP via Cloud API Registry |
| **Pricing** | Per-user (included in M365 E7 or Agent 365 add-on) | Per-service consumption ($200 free tier) | Consumption (free tier for runtime) |

---

## Implications for Convention-Based Governance (Sherpa)

### Where Sherpa is differentiated

1. **Filesystem-native governance.** None of the three cloud providers use filesystem-based conventions. All three assume centralized cloud infrastructure (registry, dashboard, IAM). Sherpa's approach — behavioral constraints in role files, initiative lifecycle in directory structure, quality gates as convention — is architecturally orthogonal. This is genuine whitespace, not an oversight.

2. **Developer-facing, not IT-admin-facing.** Microsoft Agent 365 is explicitly designed for IT administrators and security teams. AWS AgentCore targets infrastructure engineers. Google targets ML engineers. None of them target the developer-in-the-loop working alongside AI agents. Sherpa's Human+AI collaborative workflow is a different buyer persona entirely.

3. **Convention over configuration.** Cloud providers enforce governance through IAM policies, Cedar rules, conditional access, and DLP engines. Sherpa enforces through behavioral constraints in agent role definitions, CLAUDE.md conventions, and initiative lifecycle. The convention-based approach is portable (no vendor lock-in), auditable (git history), and composable (each convention is independent).

4. **No vendor lock-in.** All three providers' governance tightly couples to their agent runtime. Agent 365 governs Copilot Studio and Azure AI Foundry agents. AgentCore governs Bedrock agents. Agent Engine governs Vertex AI agents. Sherpa governs any agent on any runtime because governance is in the filesystem, not the platform.

### Where cloud providers are ahead

1. **Identity is solved at scale.** Entra Agent ID and AWS IAM provide battle-tested identity infrastructure that Sherpa's authority lease system cannot match for enterprise scale. This is table stakes for regulated industries.

2. **Compliance is deep.** Microsoft's 12 Purview capabilities (DLP, eDiscovery, retention, insider risk, etc.) represent years of compliance infrastructure. No convention-based system can replicate this. Sherpa should integrate with these systems, not compete.

3. **Threat detection is real-time.** Cloud providers detect anomalous agent behavior, prompt injection attacks, and data exfiltration at the network/API layer. Convention-based governance is inherently after-the-fact (judge reviews completed work).

4. **Shadow agent detection.** Microsoft's ability to discover unmanaged agents in the enterprise is a governance capability that requires platform-level visibility. Filesystem conventions only govern agents that opt in.

### Strategic positioning

The cloud providers are building **enterprise governance platforms** for **IT administrators** managing **large agent fleets** in **regulated environments**. Sherpa is building **developer governance conventions** for **Human+AI collaborative teams** building **agentic workflows** in **any environment**.

These are complementary, not competitive. The strongest positioning:
- Sherpa conventions define *what agents should do* (behavioral constraints, quality gates, initiative lifecycle)
- Cloud platforms enforce *what agents can access* (identity, network, data, compliance)
- Sherpa exports governance artifacts that cloud platforms can consume (audit trails from git, behavioral constraints as policy inputs)

### Pricing insight

Microsoft's per-user model (all agents under a user covered by one license) is the most enterprise-friendly. AWS's pure consumption model is the most developer-friendly. Google's pricing is least clear but likely the cheapest for experimentation. Sherpa's convention-based governance has **zero marginal cost** — it lives in the filesystem. This is a meaningful differentiator for the SMB/solo-operator segment that existing initiatives identified as underserved.

---

## Open Questions

1. **What is the actual per-user price for Agent 365 at GA?** The Frontier preview includes 25 licenses. GA pricing as an add-on vs. included in E7 is announced but specific dollar amounts are not public yet. This matters for understanding enterprise governance spend.

2. **When did AWS AgentCore go GA?** The product page and documentation suggest it's generally available, but no specific GA announcement date was found. Was it announced at re:Invent 2025?

3. **Is Google's Agent Engine governance roadmap public?** Four significant capabilities (Agent Identity, Threat Detection, Cloud API Registry, A2A Protocol) are all in Preview. GA timeline for these would signal Google's commitment to governance as a first-class concern.

4. **How do multi-cloud enterprises handle agent governance?** If an enterprise runs agents on Bedrock, Vertex AI, and Azure AI Foundry, each provider's governance is siloed. Is there demand for a cross-cloud governance layer? This could be a Sherpa opportunity.

5. **What's the adoption velocity for Agent 365?** Microsoft's Frontier preview requires M365 Copilot license + opt-in. How many enterprises are in the preview? Customer case studies would validate whether enterprises are actually governing agents or just buying the license.

6. **Do any of these platforms enforce behavioral constraints?** All three enforce access control and content safety. None appear to enforce behavioral conventions (disposition, quality bar, operational approach). This is the specific whitespace where Sherpa's behavioral agent system lives.

7. **What happens when Cedar policies (AWS) conflict with behavioral conventions (Sherpa)?** If an agent has a Cedar policy allowing tool access but a Sherpa behavioral constraint saying "don't use this tool unless X condition," which wins? The integration model matters.

---

## Sources

All claims sourced inline. Primary documentation accessed March 17, 2026:

- Microsoft Agent 365: https://learn.microsoft.com/en-us/microsoft-agent-365/overview
- Microsoft Entra Agent ID: https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents
- Microsoft Agent 365 Admin: https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-365-overview
- Microsoft Purview for Agent 365: https://learn.microsoft.com/en-us/purview/ai-agent-365
- AWS Bedrock AgentCore: https://aws.amazon.com/bedrock/agentcore/
- AWS Bedrock Guardrails: https://aws.amazon.com/bedrock/guardrails/
- AWS AgentCore Pricing: https://aws.amazon.com/bedrock/agentcore/pricing/
- Google Cloud Agent Engine: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview
- Google Cloud Agent Builder: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-builder/overview
- Google Cloud Agent Engine Management: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/manage
