# Vector 2: What Does the Agent OS Architecture Look Like?

**Question:** What are the architectural layers of an Agent OS? What do the major reference architectures propose?

## Key Discoveries

### The 7-Layer Agentic AI Stack (AIMultiple, 2026)

The most comprehensive published stack model. Bottom-to-top:

| Layer | Name | Function | Moat |
|-------|------|----------|------|
| 1 | Foundation Model Infrastructure | Models, compute, data storage, APIs | **Commoditized** |
| 2 | Agent Runtime & Infrastructure | Execution environments, memory, state, communication protocols | Medium |
| 3 | Protocol & Interoperability | Agent interaction (A2A, ANP, ACP), context standards (MCP), bridging | **Commoditized** |
| 4 | Orchestration | Multi-agent coordination, prompt orchestration, tool integration, RAG | Medium |
| 5 | Tooling & Enrichment | External tool connections, data extraction, UI automation | **High** |
| 6 | Applications | User-facing agents (Copilot, Cursor, Devin) | Low |
| 7 | Observability & Governance | Monitoring, evaluation, guardrails, compliance, agent registries, audit | **High** |

Critical insight: **Governance is Layer 7 (top of stack) with "High Moat."** The report explicitly states: "Governance, safety, and compliance create enterprise trust moats."

- [AIMultiple: 7 Layers of Agentic AI Stack](https://aimultiple.com/agentic-ai-stack)

### AIOS Kernel Architecture (COLM 2025)

Three discrete layers with clear separation of concerns:

1. **Application Layer** — Agent frameworks (ReAct, Reflexion, AutoGen, MetaGPT) access kernel services via SDK system calls
2. **Kernel Layer** — Five modules: LLM scheduling, context management, memory management, storage management, access control. Agent queries decomposed into categorized system calls, each thread-bound and dispatched by a centralized scheduler
3. **Hardware Layer** — CPU, GPU, memory abstraction

The kernel analogy is direct: agent queries map to system calls, the scheduler multiplexes limited LLM resources (context windows, token budgets, API rate limits) across concurrent agent threads.

- [AIOS paper](https://arxiv.org/abs/2403.16971)
- [AIOS HTML](https://arxiv.org/html/2403.16971v5)
- [AIOS GitHub](https://github.com/agiresearch/AIOS)

### Splendor: Six Kernel Primitives

System-space vs. AI-space separation:

**System space (kernel primitives — stable):**
- Tenancy/isolation and resource limits
- Scheduling
- Action gating + verification + constraint enforcement
- Messaging, audit/observability
- Governance

**AI space (rapidly iterable):**
- Models, policies, planners, tools, domain code

Six core primitives:
1. **Perception** — Sensor normalization, environment schemas
2. **Policy & Learning** — Policy networks, reward functions, feedback channels
3. **Reasoning & Constraints** — Constraint solvers, planners, rules, invariants
4. **Execution** — Actuators, state machines, action verifiers, rollback patterns
5. **Safety & Governance** — Enforceable runtime guardrails (not prompts), kill switches, audit logs
6. **Coordination & Distributed Systems** — Typed message passing, consensus, resource allocation, identity/trust

Key design decision: governance guardrails are "enforceable runtime guardrails (not prompts)" — hard-coded enforcement at execution boundaries, not soft prompt-level constraints.

- [Splendor website](https://splendor-os.org)

### Agent OS (imran-siddique): 4-Layer Governance Stack

1. **Agent OS Core (Kernel)** — Policy enforcement, action interception, flight recorder, stateless + stateful modes
2. **AgentMesh (Network)** — Identity, trust, delegation, HMAC authentication, trust handshake protocols
3. **Agent SRE (Reliability)** — SLOs, chaos testing, circuit breakers, cascade detection
4. **Agent Hypervisor (Runtime)** — Execution rings, resource limits, saga transactions, kill-switch

This is the only project that explicitly separates governance (kernel), networking (mesh), reliability (SRE), and runtime (hypervisor) into four independent packages.

- [GitHub](https://github.com/imran-siddique/agent-os)

### Layered Governance Architecture (LGA) — Academic Paper

Four-layer defense-in-depth for autonomous agent systems:

1. **Execution Sandbox** — OS-level isolation (Linux namespaces, seccomp filtering), path whitelist, network proxy
2. **Intent Verification** — Independent judge model evaluates tool calls against task alignment before execution
3. **Zero-Trust Inter-Agent Protocol** — Capability tokens, schema validation, scope limits, HMAC-SHA256 authentication
4. **Immutable Audit Log** — Append-only tamper-evident entries for forensic attribution

The paper identifies a critical governance gap: OpenClaw's SOUL.md constraints are "enforced via LLM semantic interpretation — a soft constraint mechanism" that prompt injection can bypass. Hard-coded Layer 2 verification is necessary.

- [arXiv paper](https://arxiv.org/html/2603.07191)

### Three-Category AI OS Taxonomy (Fluid AI)

| Category | Focus | Agent Support | Governance |
|----------|-------|---------------|------------|
| Cloud Platform | Infrastructure | Minimal | Infrastructure-level |
| Traditional AI | Model APIs | Limited | Model-centric |
| AI/Agentic OS | Intelligence coordination | Native autonomous workflows | Full-stack policy enforcement |

- [Fluid AI blog](https://www.fluid.ai/blog/ai-operating-systems-agentic-os-explained)

### Amazon Bedrock AgentCore: Runtime Architecture

Sessions run in dedicated Firecracker microVMs with isolated CPU, memory, and filesystem. Each session preserves context across multiple interactions. The Stateful Runtime (co-developed with OpenAI) carries forward:
- Memory
- Tool state
- Workflow history
- Identity permission boundaries

- [AWS AgentCore](https://aws.amazon.com/bedrock/agentcore/)
- [AgentCore Identity docs](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html)

## Architectural Convergence

Across all reference architectures, five cross-cutting concerns appear in every model:

1. **Isolation / Sandboxing** — Process-level, container-level, or microVM-level
2. **State Management** — Persistent context across sessions, restarts, crashes
3. **Identity / Access Control** — Agent authentication, capability tokens, RBAC
4. **Scheduling / Resource Management** — LLM token budgets, API rate limits, context windows
5. **Observability / Audit** — Logging, tracing, compliance, forensic attribution

Governance is either:
- **Top of stack** (AIMultiple Layer 7) — a separate concern layered above runtime
- **Woven through all layers** (LGA, Splendor) — each layer has governance primitives
- **The kernel itself** (Agent OS) — governance IS the core abstraction

No consensus has emerged on which framing is correct. This is the open architectural question.

## Implications for Sherpa

Sherpa's governance model most closely resembles the "governance IS the kernel" approach (Agent OS), but implemented through conventions rather than runtime enforcement. The convention-as-code approach (filesystem rules, behavioral definitions, initiative lifecycle) is a soft governance model. The research shows this is necessary but not sufficient — the LGA paper demonstrates that prompt-level constraints can be bypassed and hard enforcement boundaries are needed.

The question for Sherpa: should governance conventions compile down to enforceable runtime policies (like Agent OS's sub-millisecond action interception), or remain as advisory conventions that rely on LLM compliance?

## All URLs Encountered

- https://aimultiple.com/agentic-ai-stack
- https://hackernoon.com/the-7-layer-blueprint-for-serving-securing-and-observing-ai-agents-at-scale
- https://www.stackai.com/blog/the-2026-guide-to-agentic-workflow-architectures
- https://www.xenonstack.com/blog/ai-agent-infrastructure-stack
- https://adambernard.com/kb/ai/fundamentals-ai/the-ai-stack-how-modern-ai-systems-are-built-2026/
- https://kenhuangus.substack.com/p/is-agentic-ai-layer-8
- https://news.skrew.ai/7-layers-agentic-ai-technical-framework/
- https://theaiaura.com/ai-development/ai-tech-stack-2026/
- https://www.kellton.com/kellton-tech-blog/enterprise-agentic-ai-architecture
- https://www.linkedin.com/posts/brijpandeyji_building-agentic-ai-systems-goes-far-beyond-activity-7366301834635788288-zmc_
- https://arxiv.org/abs/2403.16971
- https://arxiv.org/html/2403.16971v5
- https://github.com/agiresearch/AIOS
- https://www.labellerr.com/blog/aios-explained/
- https://splendor-os.org
- https://github.com/imran-siddique/agent-os
- https://arxiv.org/html/2603.07191
- https://www.fluid.ai/blog/ai-operating-systems-agentic-os-explained
- https://aws.amazon.com/bedrock/agentcore/
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html
- https://arxiv.org/abs/2508.00604
- https://arxiv.org/html/2508.00604v1
