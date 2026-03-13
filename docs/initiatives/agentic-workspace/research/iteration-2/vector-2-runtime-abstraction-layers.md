# Vector 2: Runtime Abstraction Layers

**Question:** What abstracts the model layer? How do LiteLLM, OpenRouter, LangChain/LangGraph, CrewAI, AutoGen, and others enable multi-provider agent systems?

## The LLM Gateway Layer

Two dominant approaches for abstracting model providers:

### LiteLLM (Self-Hosted Gateway)
- Open-source LLM gateway and Python SDK
- Unified OpenAI-compatible interface to 100+ models
- Proxy server: central gateway for routing, load balancing, retries, fallbacks
- Policy-as-code via GitOps, deep observability integration
- Direct provider billing (pay each provider separately)
- Used by Aider as its model abstraction layer (`litellm.token_counter()`, `litellm.encode()`)
- [LiteLLM documentation](https://docs.litellm.ai/docs/)
- [LiteLLM providers list](https://docs.litellm.ai/docs/providers)
- [LiteLLM with OpenRouter](https://docs.litellm.ai/docs/providers/openrouter)
- [LiteLLM vs OpenRouter comparison (Xenoss)](https://xenoss.io/blog/openrouter-vs-litellm)
- [LiteLLM vs OpenRouter (TrueFoundry)](https://www.truefoundry.com/blog/litellm-vs-openrouter)
- [LiteLLM open source gateway overview (Elest)](https://blog.elest.io/litellm-free-open-source-gateway-to-manage-all-your-llm-providers/)

### OpenRouter (Managed SaaS Gateway)
- Single API endpoint to hundreds of models across OpenAI, Anthropic, Google, Cohere, Mistral
- Credit-based billing (single invoice across all providers)
- No hosting overhead, managed edge infrastructure
- Model discovery and pricing comparison built-in
- [OpenRouter vs LiteLLM strategy comparison (Evolink)](https://evolink.ai/blog/openrouter-vs-litellm-vs-build-vs-managed)

### Mozilla any-llm-go
- Go-based provider abstraction library
- [Mule AI blog on any-llm-go](https://muleai.io/blog/any-llm-go-mozilla-provider-abstraction/)

### 2026 Market Assessment
- LiteLLM "great for the abstraction era" — ecosystem now moving into "infrastructure era"
- Five alternatives competing: Portkey, Helicone, PromptLayer, Braintrustdata, Keywords AI
- [Top 5 LiteLLM alternatives 2026 (DEV.to)](https://dev.to/therealmrmumba/top-5-litellm-alternatives-in-2026-1nm)
- [Best LiteLLM alternatives 2026 (Maxim)](https://www.getmaxim.ai/articles/best-litellm-alternatives-in-2026/)

## Multi-Agent Orchestration Frameworks

### LangGraph (LangChain)
- 80,000+ GitHub stars, largest ecosystem
- Directed graph model: nodes = agents/actions, edges = paths, conditional logic determines routing
- State explicitly managed and persisted at every step
- LangChain team itself recommends LangGraph over LangChain for any workflow needing loops, conditional logic, or state
- LangChain's real moat is evaluation/observability (LangSmith), not the chain abstraction
- [LangGraph vs CrewAI vs AutoGen comparison (O-Mega)](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026)
- [Agent orchestration 2026 guide (Iterathon)](https://iterathon.tech/blog/ai-agent-orchestration-frameworks-2026)
- [Multi-agent AI systems explained (MayhemCode)](https://www.mayhemcode.com/2026/02/multi-agent-ai-systems-explained.html)
- [DEV.to complete orchestration guide](https://dev.to/pockit_tools/langgraph-vs-crewai-vs-autogen-the-complete-multi-agent-ai-orchestration-guide-for-2026-2d63)
- [DataCamp tutorial](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)

### CrewAI
- 45,900+ GitHub stars, 100,000+ certified developers
- Role-based agent assignment philosophy
- Fastest-growing multi-agent framework in 2026
- [CrewAI GitHub](https://github.com/crewAIInc/crewAI)
- [CrewAI multi-agent framework overview](https://www.decisioncrafters.com/crewai-multi-agent-orchestration/)
- [CrewAI vs LangGraph vs AutoGen vs OpenAgents (OpenAgents Blog)](https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared)

### Microsoft Agent Framework (AutoGen + Semantic Kernel unified)
- Reached Release Candidate for .NET and Python
- GA target: end of Q1 2026
- Combines AutoGen's agent abstractions with Semantic Kernel's enterprise features
- Four pillars: Open Standards & Interoperability (MCP, A2A, OpenAPI), session-based state, middleware/telemetry, graph-based workflows
- AutoGen and Semantic Kernel placed in maintenance mode (bug fixes only)
- AG-UI compatible
- [Microsoft Agent Framework overview (Learn)](https://learn.microsoft.com/en-us/agent-framework/overview/)
- [Microsoft Agent Framework introduction (Azure Blog)](https://azure.microsoft.com/en-us/blog/introducing-microsoft-agent-framework/)
- [Microsoft Foundry Blog announcement](https://devblogs.microsoft.com/foundry/introducing-microsoft-agent-framework-the-open-source-engine-for-agentic-ai-apps/)
- [Release Candidate announcement](https://devblogs.microsoft.com/foundry/microsoft-agent-framework-reaches-release-candidate/)
- [Migration guide from AutoGen/Semantic Kernel](https://devblogs.microsoft.com/semantic-kernel/migrate-your-semantic-kernel-and-autogen-projects-to-microsoft-agent-framework-release-candidate/)
- [European AI & Cloud Summit analysis](https://cloudsummit.eu/blog/microsoft-agent-framework-production-ready-convergence-autogen-semantic-kernel)
- [Visual Studio Magazine coverage](https://visualstudiomagazine.com/articles/2025/10/01/semantic-kernel-autogen--open-source-microsoft-agent-framework.aspx)
- [AG-UI integration (Microsoft Learn)](https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/)

### goose (Block / AAIF)
- Open-source, local-first AI agent framework
- 27,000+ GitHub stars, 350+ contributors, 100+ releases
- Supports 25+ LLM providers (commercial, cloud, local models)
- Connects to 3,000+ MCP servers
- Apache License 2.0
- Now under AAIF governance alongside MCP and AGENTS.md
- [goose GitHub](https://github.com/block/goose)
- [goose documentation](https://block.github.io/goose/)
- [Block announcement](https://block.xyz/inside/block-open-source-introduces-codename-goose)
- [goose + MCP + AGENTS.md analysis](https://www.jankowskimichal.pl/en/2026/01/goose-mcp-and-agents-md-the-emerging-foundation-of-agentic-ai/)
- [goose + Docker integration](https://www.docker.com/blog/building-ai-agents-with-goose-and-docker/)
- [goose AI review 2026](https://aitoolanalysis.com/goose-ai-review/)
- [goose releases](https://github.com/block/goose/releases)
- [goose AGENTS.md](https://github.com/block/goose/blob/main/AGENTS.md)

### OpenCode
- Go-based CLI with TUI (Bubble Tea)
- Supports 75+ LLM providers via OpenAI, Anthropic, Google, AWS Bedrock, Groq, Azure OpenAI, OpenRouter
- MCP integration via `opencode mcp` command
- AGENTS.md support
- Two built-in agents: Build (full tools) and customizable via markdown files
- [OpenCode website](https://opencode.ai/)
- [OpenCode GitHub](https://github.com/opencode-ai/opencode)
- [OpenCode agents documentation](https://opencode.ai/docs/agents/)
- [OpenCode context management guide](https://datalakehousehub.com/blog/2026-03-context-management-opencode/)
- [OpenCode + Docker Model Runner](https://www.docker.com/blog/opencode-docker-model-runner-private-ai-coding/)
- [awesome-opencode](https://awesome-opencode.com/)
- [OpenCode SDK (Promptfoo)](https://www.promptfoo.dev/docs/providers/opencode-sdk/)

### Aider
- Uses LiteLLM as unified interface to multiple providers
- Model class in `aider/models.py` is central abstraction
- `litellm_provider` field determines routing
- [Aider multi-provider integration (DeepWiki)](https://deepwiki.com/Aider-AI/aider/6.3-multi-provider-llm-integration)
- [Aider model management (DeepWiki)](https://deepwiki.com/Aider-AI/aider/2.4-model-management)
- [Aider model metadata (DeepWiki)](https://deepwiki.com/Aider-AI/aider/6.2-model-metadata-and-technical-capabilities)

## The "Agentic Mesh" Pattern

An emerging production pattern: combining frameworks rather than choosing one.

- A LangGraph "brain" orchestrates a CrewAI "marketing team" while calling specialized OpenAI tools for rapid sub-tasks
- Teams use Claude as primary model with GPT-4o as fallback for cost optimization
- Common pattern: LangChain for tool management/retrieval + CrewAI or AutoGen for multi-agent orchestration
- Evaluation and observability (LangSmith, Langfuse, Braintrust, Ragas) are where the real moat lives

Sources:
- [First-hand comparison of frameworks (Medium)](https://aaronyuqi.medium.com/first-hand-comparison-of-langgraph-crewai-and-autogen-30026e60b563)
- [AutoGen vs LangGraph vs CrewAI 2026 (DEV.to)](https://dev.to/synsun/autogen-vs-langgraph-vs-crewai-which-agent-framework-actually-holds-up-in-2026-3fl8)
- [The Great AI Agent Showdown 2026 (DEV.to)](https://dev.to/topuzas/the-great-ai-agent-showdown-of-2026-openai-autogen-crewai-or-langgraph-1ea8)
- [Multi-agent frameworks for enterprise 2026](https://www.adopt.ai/blog/multi-agent-frameworks)
- [AI agent frameworks compared 2026 (Arsum)](https://arsum.com/blog/posts/ai-agent-frameworks/)
- [Detailed comparison of top 6 frameworks 2026 (Turing)](https://www.turing.com/resources/ai-agent-frameworks)
- [Top 5 open-source agentic AI frameworks 2026 (AIMulitple)](https://aimultiple.com/agentic-frameworks)
- [Top 5 agentic AI frameworks to watch 2026 (FutureAGI)](https://futureagi.substack.com/p/top-5-agentic-ai-frameworks-to-watch)
- [AI agent framework landscape 2025 (Medium)](https://medium.com/@hieutrantrung.it/the-ai-agent-framework-landscape-in-2025-what-changed-and-what-matters-3cd9b07ef2c3)

## The Container Wars Parallel

The agent framework market mirrors the container orchestration wars of 2014-2017:

- Big tech giving away frameworks as on-ramps to paid inference and deployment runtimes
- Hyperscalers not competing on framework features — they're commoditizing from above
- The sustainable business is in the runtime/infrastructure layer, not the framework layer
- Evaluation and observability may be the equivalent of "monitoring" in the container wars

Sources:
- [The reason big tech is giving away agent frameworks (The New Stack)](https://thenewstack.io/agent-framework-container-wars/)

## Implications for Sherpa

1. **Sherpa is not an agent framework — it's a governance layer.** The framework wars (LangGraph vs CrewAI vs Microsoft Agent Framework) are about execution. Sherpa is about governance, conventions, and lifecycle. This is a different layer entirely.

2. **LiteLLM/OpenRouter are model-layer abstractions, not governance.** They solve "call any model" but not "govern agent behavior." Sherpa's behavioral agent definitions operate at a higher abstraction level.

3. **The "Agentic Mesh" pattern validates Sherpa's approach.** If teams are combining frameworks, they need a governance layer that spans all of them. Sherpa's convention-based approach is framework-agnostic by design.

4. **Microsoft Agent Framework is the enterprise competitor to watch.** GA Q1 2026, MCP + A2A + AG-UI support, graph-based workflows. But it's a runtime, not a governance framework.

5. **goose is the closest aligned project.** Under AAIF alongside MCP and AGENTS.md, local-first, multi-provider, MCP-native. A potential integration target for Sherpa conventions.
