# Vector 5: Governance-Over-Runtime Patterns

**Question:** Are other agentic frameworks solving the governance-over-runtime separation? Do CrewAI, AutoGen, LangGraph, A2A, or others provide adapter/plugin patterns for runtime-agnostic agent orchestration?
**Agent dispatched:** 2026-03-17

## Findings

### Closest Architectural Analogs (Academic)

- **Auton Framework** (Feb 2026) — Most direct parallel. Implements explicit "Cognitive Blueprint" (declarative YAML/JSON agent specification) vs "Runtime Engine" (platform-specific execution substrate) split. Compares itself to Kubernetes/Terraform infrastructure-as-code. Delegates tool connectivity to MCP. ([arxiv.org/html/2602.23720v1](https://arxiv.org/html/2602.23720v1))

- **MI9 Framework** (2026) — First integrated runtime governance framework for agentic AI. Six components including FSM-based conformance engines and continuous authorization monitoring. Uses **framework-specific adapters** to translate native SDK events into standardized telemetry. Governance is "rule-based and telemetry-driven, without dependence on any particular LLM." ([arxiv.org/html/2508.03858](https://arxiv.org/html/2508.03858))

- **Governance-as-a-Service (GaaS)** (2025) — External proxy between agents and environments. Declarative JSON policy engine with dynamic per-agent trust scoring. Can govern "untrusted" black-box agents without model access. **This is essentially what Sherpa is building.** ([arxiv.org/html/2508.18765v2](https://arxiv.org/html/2508.18765v2))

### Production Frameworks: None Cleanly Separate

- **CrewAI** — Bundles orchestration and execution. Governance embedded in Python code, not externalized.
- **LangGraph** — Governance expressed implicitly through graph structure. Middleware hooks exist but are framework-internal.
- **Microsoft Agent Framework** — Closest production framework. Declarative YAML/JSON definitions, middleware, pluggable memory. But governance remains internal middleware. GA target Q1 2026.
- **OpenAI Agents SDK** — Provider-agnostic model abstraction (`Model`/`ModelProvider` interfaces). Guardrails parallel to execution. But SDK-internal.
- **Amazon Bedrock AgentCore** — **Gateway pattern** where policies execute outside the LLM reasoning loop via deterministic infrastructure interception. Closest to governance-as-infrastructure in a cloud product.

### Protocol Stack Crystallizing

MCP (tools) + A2A (agents) + AG-UI (runtime) under the Linux Foundation's Agentic AI Foundation. A2A's Agent Card pattern is governance-runtime separation at the inter-agent level — declares capabilities while keeping implementation opaque.

## Sources

- [Auton Framework](https://arxiv.org/html/2602.23720v1)
- [MI9 Framework](https://arxiv.org/html/2508.03858)
- [GaaS Paper](https://arxiv.org/html/2508.18765v2)
- [A2A Protocol](https://github.com/google/A2A)
- [Linux Foundation AAIF](https://www.linuxfoundation.org/press/linux-foundation-launches-agentic-ai-initiative)

## Implications

1. **Sherpa occupies a unique position** — No surveyed framework provides filesystem-based behavioral governance fully decoupled from runtime execution. The combination of behavioral roles, initiative lifecycle, authority leases, and config-as-code has no direct competitor.
2. **Adopt the Blueprint/Engine pattern** from Auton — Sherpa's role definitions are already a form of Cognitive Blueprint. RuntimeAdapter formalizes the Engine half.
3. **Use framework-specific adapters with standard telemetry** from MI9 — each adapter translates platform events into a common schema.
4. **Implement the gateway pattern** from AgentCore — RuntimeAdapter as governance gateway: intercept dispatch, validate authority, apply constraints, then delegate.
5. **Publish A2A Agent Cards** — High strategic value. Sherpa-governed agents become discoverable by any A2A-compatible system.

## Open Questions

1. Should Sherpa's role YAML extend Auton's AgenticFormat standard, or remain a separate layer that wraps it?
2. Is MI9's FSM-based conformance engine valuable for Sherpa, or over-engineered for consulting-context governance?
3. When should Sherpa implement A2A Agent Cards?
4. Are GaaS trust scoring and Sherpa's authority leases complementary or conflicting models?
5. Can the RuntimeAdapter abstract over both process-level sandboxing (NemoClaw) and API-level gateway interception (AgentCore)?
6. Should Sherpa target current protocol versions or wait for MCP/A2A/Agent Skills convergence under AAIF?
