# Vector 3: Multi-Model Orchestration and Agent-to-Agent Protocols

**Question:** Can you have a Claude agent and a GPT agent collaborate? What protocols enable cross-provider agent communication?

## Claude Code Agent Teams

Claude Code shipped agent teams in early February 2026:

- One session acts as team lead, coordinates work, assigns tasks, synthesizes results
- Teammates work independently, each in its own context window
- Key difference from subagents: teammates can message each other directly, not just report back to lead
- Can configure sub-agents to use different models (GPT-4o, Gemini Pro) for cost optimization
- **Limitation:** Cannot mix models from different providers in the same team natively

Sources:
- [Claude Code agent teams documentation](https://code.claude.com/docs/en/agent-teams)
- [Claude Code agent teams complete guide 2026](https://claudefa.st/blog/guide/agents/agent-teams)
- [Claude agent teams tutorial (OpenAI Tools Hub)](https://www.openaitoolshub.org/en/blog/claude-code-multi-agent-tutorial)
- [Claude agent teams explained (Turing College)](https://www.turingcollege.com/blog/claude-agent-teams-explained)
- [Claude Code multiple agent systems guide (eesel)](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)
- [Claude Code teams multi-agent patterns](https://www.heyuan110.com/posts/ai/2026-02-28-claude-code-teams-guide/)
- [Shipyard multi-agent orchestration for Claude](https://shipyard.build/blog/claude-code-multi-agent/)
- [Porting Claude agent teams to OpenCode (DEV.to)](https://dev.to/uenyioha/porting-claude-codes-agent-teams-to-opencode-4hol)

## A2A (Agent-to-Agent Protocol)

The primary cross-provider agent communication standard:

**Origin and Governance:**
- Created by Google, April 2025
- Donated to Linux Foundation, June 2025
- IBM's Agent Communication Protocol (ACP) merged into A2A, August 2025
- 100+ enterprise supporters by February 2026
- Apache License 2.0
- Now part of AAIF alongside MCP

**Technical Architecture:**
- JSON-RPC 2.0 over HTTP(S)
- gRPC support added in v0.3
- Agent Cards: JSON manifests at `/.well-known/agent.json` for capability discovery
- Task lifecycle states: submitted, working, input-required, completed, failed, canceled
- Maintains agent opacity — no shared memory, tools, or proprietary logic exposure
- SDKs: Python, JavaScript, Java, C#/.NET, Golang

**Core Design Principle:**
- Agents built on different platforms (LangGraph, CrewAI, Semantic Kernel) can interconnect
- Client agents communicate with remote agents through A2A intermediaries
- Agents delegate sub-tasks and exchange information without exposing internals

**Industry Support:**
50+ technology partners at launch including Atlassian, Box, Cohere, Intuit, LangChain, MongoDB, PayPal, Salesforce, SAP, ServiceNow, UKG, Workday. Service providers: Accenture, BCG, Capgemini, Cognizant, Deloitte, HCLTech, Infosys, KPMG, McKinsey, PwC, TCS, Wipro.

Sources:
- [A2A protocol specification](https://a2a-protocol.org/latest/)
- [A2A protocol overview](https://a2a-protocol.org/latest/specification/)
- [Google A2A announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [Google donates A2A to Linux Foundation](https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/)
- [A2A protocol upgrade announcement](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)
- [A2A GitHub repository](https://github.com/a2aproject/A2A)
- [IBM A2A explainer](https://www.ibm.com/think/topics/agent2agent-protocol)
- [A2A protocol explained (OneReach)](https://onereach.ai/blog/what-is-a2a-agent-to-agent-protocol/)
- [A2A and AAIF as rival blueprints (Blocks and Files)](https://blocksandfiles.com/2025/12/11/a2a-aaif-ai-agents/)
- [Linux Foundation A2A press release](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [Google A2A getting started codelab](https://codelabs.developers.google.com/intro-a2a-purchasing-concierge)
- [A2A protocol community site](https://a2aprotocol.ai/)

## The Three-Layer Protocol Stack

The emerging consensus architecture for agentic AI:

| Layer | Protocol | Function | Transport |
|-------|----------|----------|-----------|
| Tool access | **MCP** | Agent-to-Tool (vertical) | JSON-RPC over stdio/SSE/HTTP streaming |
| Agent coordination | **A2A** | Agent-to-Agent (horizontal) | JSON-RPC 2.0 over HTTP(S) + gRPC |
| Web access | **WebMCP** | Agent-to-Web (structured browsing) | JavaScript API (navigator.modelContext) |
| User interface | **AG-UI** | Agent-to-User (frontend) | HTTP event stream |

**MCP** = Agent <-> System (vertical integration for safe access to enterprise systems)
**A2A** = Agent <-> Agent (horizontal collaboration for coordinated work)
**WebMCP** = Agent <-> Web (structured access replacing DOM scraping)
**AG-UI** = Agent <-> User (real-time frontend communication)

Sources:
- [MCP vs A2A complete guide 2026 (DEV.to)](https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li)
- [Agent protocol stack: MCP + A2A + A2UI (Subhadip Mitra)](https://subhadipmitra.com/blog/2026/agent-protocol-stack/)
- [Architecting agentic MLOps with A2A and MCP (InfoQ)](https://www.infoq.com/articles/architecting-agentic-mlops-a2a-mcp/)
- [Essential 2026 AI agent protocol stack (Medium)](https://medium.com/@visrow/a2a-mcp-ag-ui-a2ui-the-essential-2026-ai-agent-protocol-stack-ee0e65a672ef)
- [2026 AI agent protocol wars explained](https://www.hungyichen.com/en/insights/ai-agent-protocol-wars)
- [AI agent protocols 2026 complete guide (Ruh)](https://www.ruh.ai/blogs/ai-agent-protocols-2026-complete-guide)
- [MCP vs A2A for multi-agent collaboration (OneReach)](https://onereach.ai/blog/guide-choosing-mcp-vs-a2a-protocols/)
- [Enterprise AI stack 2026: MCP, A2A, domain models (DextraLabs)](https://dextralabs.com/blog/enterprise-ai-stack-2026-mcp-a2a-domain-models/)
- [MCP vs A2A choosing the right protocol (StackOne)](https://www.stackone.com/blog/mcp-vs-a2a-protocol/)
- [Build multi-agent system with A2A and MCP (Intuz)](https://www.intuz.com/blog/build-multi-agent-system-with-a2a-mcp-server)

## AG-UI (Agent-User Interaction Protocol)

Born from CopilotKit's partnership with LangGraph and CrewAI:

- Open, lightweight protocol: streams JSON event sequence over HTTP
- Events: messages, tool calls, state patches, lifecycle signals
- Defines agent <-> UI communication layer
- Already adopted by LangGraph, CrewAI, Mastra, ADK, Microsoft Agent Framework
- Oracle, Google, and CopilotKit joint release for standardized agent definition + frontend + UI description

Sources:
- [AG-UI protocol (CopilotKit)](https://www.copilotkit.ai/ag-ui)
- [AG-UI GitHub](https://github.com/ag-ui-protocol/ag-ui)
- [AG-UI documentation](https://docs.ag-ui.com/)
- [AG-UI overview (CopilotKit docs)](https://docs.copilotkit.ai/learn/ag-ui-protocol)
- [Introducing AG-UI blog post](https://www.copilotkit.ai/blog/introducing-ag-ui-the-protocol-where-agents-meet-users)
- [Microsoft Agent Framework AG-UI compatibility](https://www.copilotkit.ai/blog/microsoft-agent-framework-is-now-ag-ui-compatible)
- [Oracle adopts AG-UI](https://www.copilotkit.ai/blog/oracle-adopts-ag-ui-protocol-for-agent-spec)
- [AG-UI and A2UI differences](https://www.copilotkit.ai/ag-ui-and-a2ui)
- [A2UI protocol 2026 complete guide (DEV.to)](https://dev.to/czmilo/the-a2ui-protocol-a-2026-complete-guide-to-agent-driven-interfaces-2l3c)

## WebMCP (W3C Community Group Standard)

The web layer of the protocol stack:

- Proposed W3C standard developed jointly by Google and Microsoft
- JavaScript API: `navigator.modelContext` exposes structured tools to AI agents
- Early preview in Chrome 146 (February 2026)
- Replaces unreliable DOM manipulation/screenshot-based methods
- 89% token efficiency improvement over screenshot-based methods
- Websites declare capabilities as structured tools with schemas, parameters, security boundaries

Sources:
- [WebMCP official site](https://webmcp.link/)
- [WebMCP 2026 explainer (Noqta)](https://noqta.tn/en/blog/webmcp-how-ai-agents-will-browse-the-web-in-2026)
- [WebMCP browser platform for AI agents (Kassebaum Engineering)](https://www.kassebaumengineering.com/insights/webmcp-ai-agents-browser-interaction/)
- [WebMCP W3C standard analysis (innFactory)](https://innfactory.ai/en/blog/webmcp-w3c-web-standard-ai-agents/)
- [WebMCP reshaping the web (Ivan Turkovic)](https://www.ivanturkovic.com/2026/02/15/webmcp-is-coming-how-ai-agents-will-reshape-the-web/)
- [Chrome gives agents front door to web (Techstrong)](https://techstrong.ai/features/chrome-just-gave-ai-agents-their-own-front-door-to-the-web/)
- [W3C AI at TPAC 2025](https://www.w3.org/blog/2025/ai-at-tpac-2025/)
- [WebMCP InfoWorld](https://www.infoworld.com/article/4133366/webmcp-api-extends-web-apps-to-ai-agents.html)
- [WebMCP updates and next steps (Patrick Brosset)](https://patrickbrosset.com/articles/2026-02-23-webmcp-updates-clarifications-and-next-steps/)

## AGNTCY (Cisco + Linux Foundation)

A competing/complementary interoperability project:

- Open-source collective for inter-agent collaboration
- Initially open sourced by Cisco March 2025, with LangChain and Galileo
- 75+ companies joined, donated to Linux Foundation July 2025
- Formative members: Cisco, Dell Technologies, Google Cloud, Oracle, Red Hat
- Core components: OSF (Open Agent Schema Framework), Decentralized Agent Directory (DNS for agents), Decentralized Identity Service, SLIM (gRPC messaging with post-quantum cryptography)

Sources:
- [AGNTCY.org](https://agntcy.org/)
- [AGNTCY documentation](https://docs.agntcy.org/)
- [VentureBeat: Cisco, LangChain, Galileo framework](https://venturebeat.com/ai/a-standard-open-framework-for-building-ai-agents-is-coming-from-cisco-langchain-and-galileo)
- [AGNTCY under Linux Foundation (TFiR)](https://tfir.io/ciscos-agntcy-takes-on-ai-agent-fragmentation-under-linux-foundation-umbrella/)
- [AGNTCY open standard for agent interoperability](https://learnprompting.org/blog/agntcy-open-standard-for-agent-interoperability)
- [Linux Foundation AGNTCY press release](https://www.linuxfoundation.org/press/linux-foundation-welcomes-the-agntcy-project-to-standardize-open-multi-agent-system-infrastructure-and-break-down-ai-agent-silos)
- [Cisco blog: building trust in AI agent ecosystems](https://blogs.cisco.com/news/building-trust-in-ai-agent-ecosystems)
- [Cisco Outshift: building the internet of agents](https://outshift.cisco.com/blog/building-the-internet-of-agents-introducing-the-agntcy)
- [Galileo AGNTCY analysis](https://galileo.ai/blog/agntcy-open-collective-multi-agent-standardization)
- [AGNTCY GitHub org](https://github.com/agntcy)

## Cross-Provider Agent Teams (Third-Party)

**Ruflo** — multi-provider agent orchestration:
- Works with any LLM: Claude, GPT, Gemini, Cohere, local models (Llama)
- Automatic failover if one provider unavailable
- Smart routing picks cheapest option meeting quality requirements
- [Ruflo GitHub](https://github.com/ruvnet/ruflo)

**Gas Town** — "Kubernetes for AI coding agents":
- By Steve Yegge (ex-Amazon, Google, Sourcegraph)
- Coordinates 20-30 Claude Code instances working in parallel
- Seven specialized roles: Mayor, Polecats (workers), Refinery (merge queue), Witness (health), Deacon (patrol), Dogs (maintenance), Crew (collaborative design)
- State persists in "Beads" (Git-backed issue tracking)
- $100/hour for 12-30 parallel agents
- 20 days old, "100% vibe coded"
- Key distinction from Kubernetes: "K8s asks 'Is it running?' Gas Town asks 'Is it done?'"
- [Gas Town analysis (Cloud Native Now)](https://cloudnativenow.com/features/gas-town-what-kubernetes-for-ai-coding-agents-actually-looks-like/)

## Implications for Sherpa

1. **A2A is the missing protocol for Sherpa's multi-agent vision.** MCP handles tools. A2A handles agent-to-agent coordination. Sherpa's initiative lifecycle (proposal -> review -> plan -> dispatch) maps naturally to A2A task states (submitted -> working -> input-required -> completed).

2. **The four-protocol stack (MCP + A2A + WebMCP + AG-UI) is the target architecture.** Sherpa already has MCP (studio-mcp). A2A support would enable cross-framework agent collaboration. AG-UI could power Studio's fleet minimap.

3. **Agent Cards are the discovery mechanism.** A2A's `/.well-known/agent.json` maps conceptually to Sherpa's behavioral agent definitions in `docs/agents/roles/`. Sherpa could generate Agent Cards from behavioral definitions.

4. **Cross-provider team composition is possible but not native.** Claude Code teams can't mix providers. A2A enables it at the protocol level. Sherpa's governance layer could bridge this gap — defining behavioral constraints that apply regardless of which LLM provider executes the agent.

5. **Gas Town validates the "orchestrator for agent swarms" pattern** but at extreme cost ($100/hr). Sherpa's lighter governance approach (conventions + lifecycle, not runtime orchestration) may be more appropriate for typical teams.
