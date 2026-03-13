# Vector 4: The "Kubernetes for Agents" Space

**Question:** What abstracts the agent runtime? Who's building container-per-agent patterns, agent sandboxing, and orchestration primitives?

## Agent Sandbox (Kubernetes SIG Apps)

A new Kubernetes primitive for agent workloads:

- Formal subproject of Kubernetes SIG Apps, hosted under `kubernetes-sigs/agent-sandbox`
- Launched at KubeCon Atlanta, November 2025
- v0.1.0 first official release
- Core APIs:
  - **Sandbox** — the core resource defining the agent sandbox workload
  - **SandboxTemplate** — defines the secure blueprint of a sandbox archetype
  - **SandboxClaim** — transactional resource for requesting execution environments
- Characteristics: long-running, stateful, singleton container with stable identity (lightweight single-container VM on Kubernetes)
- Isolation: supports gVisor and Kata Containers for enhanced security between sandbox and host

Sources:
- [Agent Sandbox GitHub](https://github.com/kubernetes-sigs/agent-sandbox)
- [Agent Sandbox documentation](https://agent-sandbox.sigs.k8s.io/)
- [Agent Sandbox getting started](https://agent-sandbox.sigs.k8s.io/docs/getting_started/)
- [Google Open Source blog: why K8s needs agent execution standard](https://opensource.googleblog.com/2025/11/unleashing-autonomous-ai-agents-why-kubernetes-needs-a-new-standard-for-agent-execution.html)
- [GKE Sandbox for Agents documentation](https://docs.google.com/kubernetes-engine/docs/how-to/agent-sandbox)
- [GKE deep dive: Sandbox for Agents (The New Stack)](https://thenewstack.io/google-cloud-a-deep-dive-into-gke-sandbox-for-agents/)
- [InfoQ: Agent Sandbox on Kubernetes](https://www.infoq.com/news/2025/12/agent-sandbox-kubernetes/)
- [Agent Sandbox releases](https://github.com/kubernetes-sigs/agent-sandbox/releases)
- [Agent Sandbox Go package](https://pkg.go.dev/sigs.k8s.io/agent-sandbox)
- [Agentic AI on GKE (Google Cloud Blog)](https://cloud.google.com/blog/products/containers-kubernetes/agentic-ai-on-kubernetes-and-gke)

## Kagent (CNCF Sandbox)

Kubernetes-native AI agent framework:

- Accepted to CNCF Sandbox, May 22, 2025
- Built on three layers: tools, agents, declarative framework
- Tools are MCP-style functions (pod logs, Prometheus queries, resource generation)
- Agents defined as Kubernetes Custom Resources: system prompt + tools + LLM config
- Supports multiple LLM providers: OpenAI, Azure OpenAI, Anthropic, Google Vertex AI, Ollama, custom providers
- Focused on DevOps/platform engineering use cases

Sources:
- [kagent.dev](https://kagent.dev/)
- [kagent GitHub](https://github.com/kagent-dev/kagent)
- [CNCF project page](https://www.cncf.io/projects/kagent/)
- [Solo.io blog: contributing kagent to CNCF](https://www.solo.io/blog/bringing-agentic-ai-to-kubernetes-contributing-kagent-to-cncf)
- [Meet kagent (The New Stack)](https://thenewstack.io/meet-kagent-open-source-framework-for-ai-agents-in-kubernetes/)
- [CNCF blog: kagent for cloud native](https://www.cncf.io/blog/2025/04/15/kagent-bringing-agentic-ai-to-cloud-native/)
- [Getting started with kagent (InfraCloud)](https://www.infracloud.io/blogs/ai-agents-for-kubernetes/)
- [Running AI agents on Kubernetes (Cloud Native Deep Dive)](https://www.cloudnativedeepdive.com/running-any-ai-agent-on-kubernetes-step-by-step/)
- [Deploy AI agents on Kubernetes (Shakudo)](https://www.shakudo.io/blog/deploy-ai-agents-on-kubernetes)
- [kagent GitHub org](https://github.com/kagent-dev)

## Docker MCP Gateway & Sandboxes

Docker's container-based agent infrastructure:

### MCP Gateway
- Runs MCP servers in isolated Docker containers with restricted privileges, network access, resource usage
- Handles routing, authentication, translation between clients and tools
- Unified control plane consolidating multiple MCP servers into single endpoint
- Provenance verification on pull/run: Docker-built verification, SBOM checking, supply-chain checks via Docker Scout

### Docker Sandboxes
- Disposable, isolated environments purpose-built for coding agents
- Each agent runs in isolated version of development environment
- Sandboxes run on dedicated microVMs for hard security boundary
- Secrets mounted only into target container at runtime
- Support for Claude Code, goose, OpenCode

### Security Features (2026)
- Hardened images, secure sandboxes
- SOC 2 and ISO 27001 compliance
- Supply-chain security checks

Sources:
- [Docker MCP servers toolkit and gateway](https://www.docker.com/blog/mcp-servers-docker-toolkit-cagent-gateway/)
- [Docker MCP Gateway documentation](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)
- [Docker sandboxing AI agents forum](https://forums.docker.com/t/sandboxing-ai-agents-with-mcp-servers/150586)
- [Docker MCP toolkit and gateway explained](https://www.docker.com/blog/mcp-toolkit-gateway-explained/)
- [Docker sandboxes for Claude Code](https://www.docker.com/blog/docker-sandboxes-run-claude-code-and-other-coding-agents-unsupervised-but-safely/)
- [Docker sandboxes: new approach for agent safety](https://www.docker.com/blog/docker-sandboxes-a-new-approach-for-coding-agent-safety/)
- [Dynamic MCPs (Docker blog)](https://www.docker.com/blog/dynamic-mcps-stop-hardcoding-your-agents-world/)
- [Securing AI agents with Docker MCP (Cloud Native Now)](https://cloudnativenow.com/contributed-content/securing-ai-agents-with-docker-mcp-and-cagent-building-trust-in-cloud-native-workflows/)
- [Agentic AI and Docker architecture 2026](https://dasroot.net/posts/2026/03/agentic-ai-docker-architecture-performance-security/)

## AgentGateway (Solo.io / Linux Foundation)

Enterprise MCP and A2A gateway:

- Industry's first AI-native data plane for agentic use cases
- Became Linux Foundation project July 2025
- Members: Microsoft, T-Mobile, Dell, CoreWeave, Akamai
- Performance: 300x better memory, 35x higher throughput, 100x less latency vs alternatives
- Features: onboarding, registration, tool-server fingerprinting, versioning, runtime policy
- Protects against: tool poisoning, rug-pulls, tool shadowing, naming collisions
- Drop-in integration: virtualized MCP tool server, no code changes required
- Ambient waypoint mode: transparent traffic redirection, tool-server sandboxing, automatic gateway injection

Sources:
- [agentgateway.dev](https://agentgateway.dev/)
- [Solo Enterprise for agentgateway](https://www.solo.io/products/agentgateway-enterprise)
- [Solo blog: introducing enterprise agentgateway](https://www.solo.io/blog/introducing-solo-enterprise-for-agentgateway)
- [Solo press release: enterprise agentgateway + MCP Labs](https://www.solo.io/press-releases/enterprise-agentgateway-mcp-labs)
- [Solo.io on agentic agents in enterprise IT](https://virtualizationreview.com/articles/2026/02/26/a-conversation-with-solo-io-about-agentic-agents-and-skills-in-enterprise-it.aspx)
- [Building agent gateway at scale (video)](https://www.solo.io/resources/video/building-an-agent-gateway-to-support-mcp-at-scale)
- [Enterprise MCP flow examples (GitHub)](https://github.com/solo-io/enterprise-mcp-flow)
- [AAIF announcement and agentgateway (Solo.io)](https://www.solo.io/blog/aaif-announcement-agentgateway)
- [About Solo Enterprise for agentgateway (docs)](https://docs.solo.io/gateway/2.0.x/ai/about/)

## MCP Gateway Registry (Community)

- Enterprise-ready MCP Gateway & Registry
- OAuth authentication (Keycloak/Entra), dynamic tool discovery, unified access
- [GitHub: agentic-community/mcp-gateway-registry](https://github.com/agentic-community/mcp-gateway-registry)

## Best MCP Gateways for Production (2026 Overview)

- [Best MCP gateways for production systems 2026 (Maxim)](https://www.getmaxim.ai/articles/best-mcp-gateways-for-production-systems-in-2026/)

## Agent Sandboxing Approaches (2026)

Broader landscape of sandboxing strategies:
- MicroVMs (Firecracker, Cloud Hypervisor)
- gVisor (Google's application kernel)
- Kata Containers (lightweight VMs)
- Kubernetes Pod Security Standards
- [How to sandbox AI agents 2026 (Northflank)](https://northflank.com/blog/how-to-sandbox-ai-agents)

## Kubernetes Market Context

- CNCF 2026 survey: 82% of container users run Kubernetes in production (up from 66% two years prior)
- Gartner: 40% of enterprise apps will feature embedded task-specific agents by 2026 (up from <5% in early 2025)
- Platform engineering approach: Internal Developer Platform (IDP) abstracting infrastructure for agentic workloads
- [Kubernetes for agentic apps: platform engineering perspective](https://platformengineering.org/blog/kubernetes-for-agentic-apps-a-platform-engineering-perspective)

## Implications for Sherpa

1. **Sherpa operates above the container layer.** Agent Sandbox, Docker MCP Gateway, and kagent solve "where does the agent run?" Sherpa solves "how does the agent behave?" These are complementary, not competing.

2. **Docker Sandboxes are the natural execution environment for Sherpa-governed agents.** A Sherpa behavioral definition + Docker Sandbox = a governed, isolated agent runtime. The integration path is clear.

3. **AgentGateway solves the enterprise MCP scaling problem Sherpa doesn't need to solve.** Sherpa's studio-mcp is a single server. For enterprise deployment, AgentGateway provides the gateway/proxy layer.

4. **Agent Sandbox CRDs could map to Sherpa agent definitions.** kagent already defines agents as Kubernetes CRDs (system prompt + tools + LLM config). Sherpa's behavioral agent schema could generate both Agent Sandbox workloads and kagent CRDs.

5. **The "Kubernetes for agents" space is infrastructure, not governance.** Every project in this space handles scheduling, isolation, and networking. None handle initiative lifecycle, behavioral constraints, or convention distribution. The governance layer is still vacant at the Kubernetes level.
