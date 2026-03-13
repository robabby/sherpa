# Vector 6: Open-Source Agent OS Projects

**Question:** Are there open-source Agent OS projects? How mature? What architecture do they propose?

## Key Discoveries

### Tier 1: Production-Ready Open Source

#### OpenClaw (302K+ GitHub stars)

The fastest-growing open-source project in GitHub history. Personal AI agent that runs locally on macOS/Linux/Windows.

**Architecture:**
- Gateway daemon on local hardware: manages authentication, session state, tool execution, event routing
- Memory: append-only daily markdown logs (today's + yesterday's loaded at session start)
- SOUL.md: behavioral constitution (Core Truths, Boundaries, Vibe) injected on every LLM call
- AGENTS.md: project-specific agent instructions template
- Skills marketplace: extensible capabilities
- 20+ messaging platform integrations (WhatsApp, Telegram, Slack, Discord)

**Governance model:** Soft governance via SOUL.md. No runtime enforcement — relies on LLM compliance. The LGA paper identified this as a security gap (SOUL.md constraints bypassed by prompt injection).

**Maturity:** Production. Moved to open-source foundation (Feb 14, 2026, creator joined OpenAI). Community-driven governance.

- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [OpenClaw Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [DigitalOcean overview](https://www.digitalocean.com/resources/articles/what-is-openclaw)
- [Architecture deep-dive](https://bibek-poudel.medium.com/how-openclaw-works-understanding-ai-agents-through-a-real-architecture-5d59cc7a4764)
- [DecisionCrafters analysis](https://www.decisioncrafters.com/openclaw-fastest-growing-ai-agent-framework/)
- [Security disaster (PBXScience)](https://pbxscience.com/openclaw-githubs-fastest-ever-rising-star-becomes-2026s-first-major-ai-security-disaster/)

#### goose (27K stars, AAIF founding project)

Block's open-source local-first AI agent framework. One of three founding projects of the Agentic AI Foundation (alongside MCP and AGENTS.md).

**Architecture:**
- Local-first agent with MCP-based tool integration
- 25+ LLM providers supported
- 3K+ MCP servers accessible
- Extensible via MCP standard

**Maturity:** Production. AAIF-governed. Strong community.

- [goose on AAIF](https://block.xyz/inside/block-anthropic-and-openai-launch-the-agentic-ai-foundation)

### Tier 2: Framework-Level OSS

#### AIOS (GitHub, COLM 2025 paper)

Academic agent operating system with real implementation.

**Architecture:**
- Three layers: application, kernel, hardware
- Kernel modules: LLM scheduling, context management, memory management, storage management, access control
- Agent SDK for application-level development
- Supports multiple agent frameworks: ReAct, Reflexion, OpenAGI, AutoGen, Open Interpreter, MetaGPT
- 2.1x faster execution vs. direct framework usage

**Maturity:** Research prototype with functional implementation. Published at COLM 2025.

- [AIOS GitHub](https://github.com/agiresearch/AIOS)
- [AIOS Paper](https://arxiv.org/abs/2403.16971)

#### Agent OS (imran-siddique) — Kernel-Level Governance

The most architecturally ambitious governance-specific project.

**Architecture:**
- 4-layer stack: Kernel (policy), AgentMesh (network/trust), Agent SRE (reliability), Agent Hypervisor (runtime)
- Sub-millisecond policy enforcement (<0.1ms p99)
- YAML-based policy language with pattern matching, rate limiting, RBAC
- MCPGateway for tool filtering and allowlisting
- MemoryGuard for hash-integrity memory protection
- Human approval workflows
- Flight recorder audit logging

**Integrations:**
- Merged: Dify (65K stars), LlamaIndex (47K stars), Microsoft Agent-Lightning (15K stars), LangGraph, OpenAI Agents SDK
- Proposals under review: AutoGen, CrewAI, Haystack, Semantic Kernel, etc.

**OWASP Agentic Top 10 coverage:** 8/10 risks addressed.

**Maturity:** Published on PyPI (`pip install ai-agent-governance[full]`). Active integrations. Early but functional.

- [GitHub](https://github.com/imran-siddique/agent-os)
- [PyPI](https://pypi.org/project/agent-os-kernel/)

#### Splendor — Kernel-Grade Runtime

Rust-core + Python interfaces runtime for autonomous agents.

**Architecture:**
- System-space / AI-space separation (like kernel-space / user-space)
- Six kernel primitives: perception, policy/learning, reasoning/constraints, execution, safety/governance, coordination
- Multi-tenant isolation with quotas and policy boundaries
- Verification gates at execution edges
- Explicit state graphs with feedback channels
- Distributed by default (cross-machine coordination)

**Maturity:** Early. Website live, documentation available, but limited adoption signals.

- [Splendor website](https://splendor-os.org)

#### OpenFang — Rust Agent OS

Full-stack autonomous agent OS written in Rust.

**Architecture:**
- 14 Rust crates, 137,728 lines of code
- Modular kernel design
- Single ~32MB binary deployment
- Knowledge graph construction
- 24/7 autonomous operation
- Target monitoring, lead generation, social media management

**Maturity:** Functional for specific use cases (marketing/sales automation). Niche.

- [OpenFang GitHub](https://github.com/RightNow-AI/openfang)

### Tier 3: Early/Experimental OSS

#### Agent-OS (kase1111-hash) — Natural Language Governance

Makes natural language the substrate of governance and execution. No code, no structured protocols.

**Maturity:** v1.0 Dec 2025, Phase 1 Q1 2026. Very early.

- [GitHub](https://github.com/kase1111-hash/Agent-OS)

#### Agent OS (buildermethods) — Spec-Driven Development

System for injecting codebase standards. Works with Claude Code plan mode.

**Maturity:** Niche. Focused on spec-driven development rather than general agent OS.

- [GitHub](https://github.com/buildermethods/agent-os)

#### Mission Control (various) — Fleet Dashboards

Multiple open-source mission control projects:
- **builderz-labs/mission-control**: AI agent orchestration dashboard with CLI integration, GitHub sync, real-time monitoring
- **crshdn/mission-control**: Multi-agent collaboration via OpenClaw Gateway
- **MeisnerDan/mission-control**: Task management for solo entrepreneurs delegating to AI agents

- [builderz-labs](https://github.com/builderz-labs/mission-control)
- [crshdn](https://github.com/crshdn/mission-control)
- [MeisnerDan](https://github.com/MeisnerDan/mission-control)

### Tier 4: Standards Infrastructure (OSS)

#### AAIF Projects (Linux Foundation)

Three founding projects, all open source:
- **MCP**: Protocol standard (97M+ monthly SDK downloads)
- **goose**: Local-first agent framework (27K stars)
- **AGENTS.md**: Universal agent instructions (60K+ repos)

Platinum members: AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI.

- [AAIF website](https://aaif.io/)
- [Linux Foundation announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)

#### Kubernetes Agent Sandbox (K8s SIG)

Declarative API for stateful, singleton agent workloads. gVisor/Kata isolation. Warm Pool for sub-second startup.

- [GitHub](https://github.com/kubernetes-sigs/agent-sandbox)
- [Docs](https://agent-sandbox.sigs.k8s.io/)

#### Agentic Trust Framework (ATF)

Open governance spec for Zero Trust agent security. Creative Commons licensed. Five elements: identity, behavioral monitoring, data governance, segmentation, incident response.

- [GitHub](https://github.com/massivescale-ai/agentic-trust-framework)
- [CSA blog](https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents)

## Maturity Assessment

| Project | Stars | License | Governance Focus | Runtime Focus | Production-Ready |
|---------|-------|---------|-----------------|---------------|-----------------|
| OpenClaw | 302K+ | OSS | Soft (SOUL.md) | Personal AI agent | Yes |
| goose | 27K | OSS (AAIF) | Minimal | Agent framework | Yes |
| AIOS | Research | Apache 2.0 | Access control | Full kernel | No (research) |
| Agent OS (imran) | Growing | OSS | **Strong** (kernel-level) | Policy enforcement | Early production |
| Splendor | Early | OSS (Rust) | Strong (primitives) | Kernel-grade | No (early) |
| OpenFang | Niche | OSS (Rust) | Minimal | Autonomous agents | Niche |
| K8s Agent Sandbox | K8s SIG | Apache 2.0 | Isolation only | Container runtime | Yes |

## Implications for Sherpa

**The governance-specific OSS space is thin.** Agent OS (imran-siddique) is the closest to what Sherpa does but focuses on runtime policy enforcement, not convention-as-code governance. No open-source project combines:
- Behavioral agent definitions
- Initiative lifecycle management
- Convention distribution (rules, skills, CLAUDE.md generation)
- Governance UI (Studio)

Sherpa could potentially integrate with Agent OS's policy enforcement kernel to add hard enforcement boundaries to its soft convention governance. The architecture is complementary: Sherpa writes the policies (behavioral definitions, initiative rules), Agent OS enforces them at runtime.

**Market opportunity:** 79% of enterprises lack formal agent governance. The OSS governance tooling is fragmented (many projects, each covering a piece). A comprehensive governance framework is the gap.

## All URLs Encountered

- https://github.com/openclaw/openclaw
- https://en.wikipedia.org/wiki/OpenClaw
- https://www.digitalocean.com/resources/articles/what-is-openclaw
- https://bibek-poudel.medium.com/how-openclaw-works-understanding-ai-agents-through-a-real-architecture-5d59cc7a4764
- https://www.decisioncrafters.com/openclaw-fastest-growing-ai-agent-framework/
- https://pbxscience.com/openclaw-githubs-fastest-ever-rising-star-becomes-2026s-first-major-ai-security-disaster/
- https://medium.com/@Micheal-Lanham/210-000-github-stars-in-10-days-what-openclaws-architecture-teaches-us-about-building-personal-ai-dae040fab58f
- https://dextralabs.com/blog/what-is-openclaw-self-hosted-ai-agent-2026/
- https://eu.36kr.com/en/p/3706443833487493
- https://block.xyz/inside/block-anthropic-and-openai-launch-the-agentic-ai-foundation
- https://github.com/agiresearch/AIOS
- https://arxiv.org/abs/2403.16971
- https://github.com/imran-siddique/agent-os
- https://pypi.org/project/agent-os-kernel/
- https://splendor-os.org
- https://github.com/RightNow-AI/openfang
- https://github.com/kase1111-hash/Agent-OS
- https://github.com/buildermethods/agent-os
- https://github.com/builderz-labs/mission-control
- https://github.com/crshdn/mission-control
- https://github.com/MeisnerDan/mission-control
- https://aaif.io/
- https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
- https://github.com/kubernetes-sigs/agent-sandbox
- https://agent-sandbox.sigs.k8s.io/
- https://github.com/massivescale-ai/agentic-trust-framework
- https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents
- https://www.firecrawl.dev/blog/best-open-source-agent-frameworks
- https://github.com/topics/agentos
- https://github.com/topics/ai-operating-system
- https://libraries.io/pypi/agent-primitives
- https://you.com/resources/popular-agentic-open-source-tools-2026
- https://github.com/simular-ai/Agent-S
- https://github.com/skillmatic-ai/awesome-agent-skills
- https://skillsmp.com
- https://github.com/anthropics/skills
- https://thenewstack.io/agent-skills-anthropics-next-bid-to-define-ai-standards/
- https://siliconangle.com/2025/12/18/anthropic-makes-agent-skills-open-standard/
- https://venturebeat.com/technology/anthropic-launches-enterprise-agent-skills-and-opens-the-standard
