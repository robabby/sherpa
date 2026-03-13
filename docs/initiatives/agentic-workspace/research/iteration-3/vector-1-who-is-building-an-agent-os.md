# Vector 1: Who Is Explicitly Building an "Agent OS"?

**Question:** Which companies, projects, and papers are explicitly framing their work as an "Agent Operating System"?

## Key Discoveries

### Enterprise Products Using "Agent OS" Framing

- **PwC agent OS** — Enterprise AI orchestration platform. Uses a proprietary "language-state machine-powered orchestration" engine. Cloud-agnostic (AWS, Azure, GCP, Oracle, Salesforce, on-prem). 250+ AI agents deployed within PwC. MCP integration for tool access. Patent-pending orchestration technology. RBAC with Microsoft Graph. Not open-source.
  - [PwC agent OS page](https://www.pwc.com/us/en/services/ai/agent-os.html)
  - [PwC press release](https://www.pwc.com/us/en/about-us/newsroom/press-releases/pwc-launches-ai-agent-operating-system-enterprises.html)
  - [PwC MCP integration](https://www.pwc.com/us/en/about-us/newsroom/press-releases/pwc-adds-support-for-mcp-in-agent-os.html)
  - [PwC + Azure AI Foundry](https://www.pwc.com/us/en/tech-effect/emerging-tech/agent-os-microsoft-foundry.html)

- **Agno AgentOS** — Pre-built FastAPI runtime for multi-agent systems. JWT-based RBAC. Persistent state across container restarts. Control plane UI. MCP integration. Runs in customer's own cloud. Self-hosted, no data egress.
  - [Agno AgentOS page](https://www.agno.com/agentos)
  - [Agno AgentOS docs](https://docs.agno.com/agent-os/introduction)

- **PubMatic AgenticOS** — Domain-specific agent OS for programmatic advertising. Agent-to-agent execution across ad environments.
  - [PubMatic launch](https://pubmatic.com/news/pubmatic-launches-agenticos-the-operating-system-for-agent-to-agent-advertising/)

### Control Planes and Fleet Dashboards (Agent OS Equivalents)

- **Microsoft Agent 365** — "The Control Plane for Agents." GA May 1, 2026, $15/user/month. Unified view across Copilot and Copilot Studio agents. Logging, audit trails, compliance, cost tracking. Multi-agent orchestration routing. Works with agents from Microsoft and partner providers.
  - [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365)
  - [Inside Track blog](https://www.microsoft.com/insidetrack/blog/shaping-ai-management-at-microsoft-with-agent-365-and-copilot-controls/)
  - [AdminDroid guide](https://blog.admindroid.com/microsoft-agent-365-unified-control-plane-to-manage-ai-agents/)

- **Google Antigravity** — Agent-first IDE with "Mission Control" dashboard. Spawns, monitors, and orchestrates multiple agents asynchronously. Produces Artifacts (plans, diffs, screenshots, recordings) for human verification. Public preview, free for individuals.
  - [Google Developers Blog](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
  - [Antigravity Guide](https://antigravity.im)
  - [Agent Manager deep dive](https://www.aifire.co/p/mastering-the-antigravity-agent-manager-2026-guide-part-1)
  - [KDnuggets review](https://www.kdnuggets.com/google-antigravity-ai-first-development-with-this-new-ide)

- **GitHub Agent HQ / Mission Control** — Unified interface for managing Copilot coding agent tasks across repos. Supports first-party and third-party agents (Anthropic, OpenAI, Google, Cognition, xAI). Enterprise governance with centralized AI access management.
  - [GitHub blog](https://github.blog/news-insights/company-news/welcome-home-agents/)
  - [Mission Control guide](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)
  - [Eficode analysis](https://www.eficode.com/blog/why-github-agent-hq-matters-for-engineering-teams-in-2026)

### Academic & Research Projects

- **AIOS** — LLM Agent Operating System. Published at COLM 2025. Three-layer architecture: application, kernel, hardware. Kernel provides scheduling, context management, memory management, storage management, access control. 2.1x faster execution for agent frameworks. Python implementation.
  - [arXiv paper](https://arxiv.org/abs/2403.16971)
  - [GitHub](https://github.com/agiresearch/AIOS)
  - [OpenReview](https://openreview.net/forum?id=L4HHkCDz2x)

- **AgenticOS 2026 Workshop** — 1st Workshop on Operating Systems Design for AI Agents, co-located with ASPLOS 2026 (March 23, Pittsburgh). Seeks position papers on OS-level mechanisms for agent workloads: isolation, scheduling, observability, governance.
  - [Workshop website](https://os-for-agent.github.io/)

- **Composable OS Kernel Architectures for Autonomous Intelligence** — arXiv paper proposing neurosymbolic kernel with AI-enabled loadable kernel modules. Three-layer design: application, kernel AI subsystem, hardware abstraction.
  - [arXiv paper](https://arxiv.org/abs/2508.00604)

- **Agent-OS Blueprint paper** (TechRxiv) — Blueprint architecture for real-time, secure, and scalable AI agents. Formal five-layer architecture: Kernel, Services, Agent Runtime, Orchestration, User.
  - [TechRxiv paper](https://www.techrxiv.org/doi/full/10.36227/techrxiv.175736224.43024590)
  - [Preprints.org](https://www.preprints.org/manuscript/202509.0077/v1)

### Open-Source Agent OS Projects

- **Splendor** — Rust-core + Python kernel-grade runtime. Six primitives: perception, policy/learning, reasoning/constraints, execution, safety/governance, coordination. Multi-tenant isolation. System-space vs. AI-space separation. No MCP integration.
  - [Splendor website](https://splendor-os.org)

- **Agent-OS (kase1111-hash)** — Natural-language native OS for AI agents. Makes natural language the substrate of governance and execution. v1.0 Dec 2025, Phase 1 Q1 2026.
  - [GitHub](https://github.com/kase1111-hash/Agent-OS)

- **Agent OS (imran-siddique)** — Kernel-level governance for autonomous agents. 4-layer stack: kernel (policy enforcement), network (AgentMesh trust), reliability (Agent SRE), runtime (Agent Hypervisor). MCPGateway for tool filtering. OWASP Agentic Top 10 coverage (8/10). Integrated with Dify, LlamaIndex, LangGraph, OpenAI Agents SDK, Microsoft Agent-Lightning. Sub-millisecond policy enforcement.
  - [GitHub](https://github.com/imran-siddique/agent-os)
  - [PyPI: agent-os-kernel](https://pypi.org/project/agent-os-kernel/)

- **OpenFang** — Rust-based agent OS. Single ~32MB binary. 14 Rust crates, 137K lines. Knowledge graphs, monitoring, social media management. 24/7 autonomous operation.
  - [GitHub](https://github.com/RightNow-AI/openfang)

- **Agent OS (buildermethods)** — Spec-driven development system for injecting codebase standards. Works with Claude Code plan mode.
  - [GitHub](https://github.com/buildermethods/agent-os)

### Cloud Infrastructure (Agent Runtime Layer)

- **Amazon Bedrock AgentCore** — Runtime + Identity + Observability. Firecracker microVM isolation per session. OpenAI + AWS co-developed Stateful Runtime Environment (announced Feb 26, 2026). Persistent state across sessions (memory, tool state, workflow history, identity permissions). AgentCore Identity for secure agent authentication.
  - [AWS AgentCore](https://aws.amazon.com/bedrock/agentcore/)
  - [OpenAI Stateful Runtime](https://openai.com/index/introducing-the-stateful-runtime-environment-for-agents-in-amazon-bedrock/)
  - [InfoWorld analysis](https://www.infoworld.com/article/4138825/openai-launches-stateful-ai-on-aws-signaling-a-control-plane-power-shift.html)

- **Kubernetes Agent Sandbox** — K8s SIG Apps subproject. Sandbox CRD for stateful, singleton workloads. Stable identity and persistent storage. gVisor/Kata runtime isolation. Warm Pool for sub-second startup.
  - [GitHub](https://github.com/kubernetes-sigs/agent-sandbox)
  - [Google blog](https://opensource.googleblog.com/2025/11/unleashing-autonomous-ai-agents-why-kubernetes-needs-a-new-standard-for-agent-execution.html)
  - [GKE docs](https://docs.google.com/kubernetes-engine/docs/how-to/agent-sandbox)

## Implications for Sherpa

The "Agent OS" label is being claimed by three distinct layers:
1. **Cloud runtime** (AWS AgentCore, K8s Agent Sandbox) — isolation, state persistence, identity
2. **Enterprise control plane** (Microsoft Agent 365, GitHub Agent HQ, PwC agent OS) — visibility, governance, cost tracking
3. **Developer framework/runtime** (Agno, AIOS, Splendor, Agent OS) — scheduling, coordination, policy enforcement

Nobody is building an agent OS that combines governance-as-convention (filesystem-based rules, behavioral constraints, initiative lifecycle) with runtime orchestration. Sherpa's approach — governance layer that is neither a runtime nor a control plane but a convention system — has no direct competitor using the "Agent OS" framing.

## All URLs Encountered

- https://pubmatic.com/news/pubmatic-launches-agenticos-the-operating-system-for-agent-to-agent-advertising/
- https://www.techrxiv.org/doi/full/10.36227/techrxiv.175736224.43024590
- https://www.pwc.com/us/en/about-us/newsroom/press-releases/pwc-launches-ai-agent-operating-system-enterprises.html
- https://www.agno.com/
- https://medium.com/@marc.bara.iniesta/who-is-building-the-agent-native-operating-system-c6bae5a5a3f5
- https://www.fluid.ai/blog/ai-operating-systems-agentic-os-explained
- https://www.sitepoint.com/the-rise-of-open-source-personal-ai-agents-a-new-os-paradigm/
- https://openreview.net/forum?id=L4HHkCDz2x
- https://arxiv.org/html/2603.08938
- https://www.preprints.org/manuscript/202509.0077/v1
- https://docs.agno.com/agent-os/introduction
- https://arxiv.org/html/2603.07191
- https://medium.com/@yunwei356/architectures-for-agent-systems-a-survey-of-isolation-integration-and-governance-59224d26e666
- https://aimultiple.com/agentic-ai-stack
- https://accuknox.com/blog/runtime-ai-governance-security-platforms-llm-systems-2026
- https://www.agno.com/agentos
- https://github.com/kase1111-hash/Agent-OS
- https://github.com/RightNow-AI/openfang
- https://os-for-agent.github.io/
- https://github.com/agiresearch/AIOS
- https://www.firecrawl.dev/blog/best-open-source-agent-frameworks
- https://github.com/buildermethods/agent-os/releases
- https://github.com/topics/agentos
- https://github.com/buildermethods/agent-os
- https://github.com/simular-ai/Agent-S
- https://github.com/topics/ai-operating-system
- https://github.com/imran-siddique/agent-os
- https://pypi.org/project/agent-os-kernel/
- https://arxiv.org/abs/2508.00604
- https://splendor-os.org
- https://easychair.org/cfp/AgenticOS2026
- https://aws.amazon.com/bedrock/agentcore/
- https://openai.com/index/introducing-the-stateful-runtime-environment-for-agents-in-amazon-bedrock/
- https://www.infoworld.com/article/4138825/openai-launches-stateful-ai-on-aws-signaling-a-control-plane-power-shift.html
- https://github.com/kubernetes-sigs/agent-sandbox
- https://opensource.googleblog.com/2025/11/unleashing-autonomous-ai-agents-why-kubernetes-needs-a-new-standard-for-agent-execution.html
- https://www.microsoft.com/en-us/microsoft-agent-365
- https://github.blog/news-insights/company-news/welcome-home-agents/
- https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/
- https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/
- https://antigravity.im
