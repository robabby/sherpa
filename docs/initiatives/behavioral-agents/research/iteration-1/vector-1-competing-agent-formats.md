# Agent Schema Landscape: How Major Frameworks Define Agents

**Date:** 2026-03-11
**Initiative:** behavioral-agents
**Purpose:** Validate Sherpa's behavioral-constraint-first schema design against the industry landscape

---

## Executive Summary

Every major AI agent framework defines agents through some combination of **identity/persona prompts** and **configuration fields**. After surveying 9 frameworks and 5 emerging standards, one finding is clear: **no framework uses behavioral constraints as the primary organizational principle for agent definitions.** They all center on `instructions` (a freeform string) as the core behavioral field, with operational parameters (model, tools, permissions) as secondary config. Sherpa's schema is structurally novel in replacing the freeform instructions blob with decomposed behavioral primitives (`disposition`, `behavioral-constraints`, `quality-bar`, `fail-triggers`).

### The Universal Pattern

Every framework follows roughly the same shape:

```
Agent = {
  name/id,
  instructions/system_message,    # freeform string — the "soul" of the agent
  model,                          # LLM selection
  tools/functions,                # capabilities
  ...framework-specific fields
}
```

The `instructions` field does all the behavioral heavy lifting. Whether it contains identity claims, behavioral constraints, domain context, or output formatting rules is entirely up to the author. No framework structures or validates this content.

---

## Framework-by-Framework Analysis

### 1. CrewAI

**Format:** YAML config files (agents.yaml) + Python classes
**Identity approach:** Explicitly identity-first. Three required fields are `role`, `goal`, `backstory` — all persona prompts.

**Agent Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `role` | string | yes | Identity claim: "Senior Data Researcher" |
| `goal` | string | yes | Objective: "Uncover cutting-edge developments" |
| `backstory` | string | yes | Persona: "You're a seasoned researcher with a knack for..." |
| `llm` | string/LLM | no | Model selection, defaults to gpt-4 |
| `tools` | list | no | Tool instances |
| `max_iter` | int | no | Default 20 |
| `max_rpm` | int | no | Rate limiting |
| `max_execution_time` | int | no | Timeout in seconds |
| `verbose` | bool | no | Debug logging |
| `allow_delegation` | bool | no | Default false |
| `allow_code_execution` | bool | no | Default false |
| `code_execution_mode` | "safe"/"unsafe" | no | Docker vs direct |
| `reasoning` | bool | no | Enable reflection before execution |
| `max_reasoning_attempts` | int | no | Reasoning iterations |
| `memory` | bool | no | Conversation history |
| `knowledge_sources` | list | no | Knowledge base access |
| `cache` | bool | no | Default true |
| `multimodal` | bool | no | Image support |
| `system_template` | string | no | Custom system prompt |
| `prompt_template` | string | no | Custom prompt |
| `response_template` | string | no | Custom response format |

**YAML example:**
```yaml
researcher:
  role: >
    {topic} Senior Data Researcher
  goal: >
    Uncover cutting-edge developments in {topic}
  backstory: >
    You're a seasoned researcher with a knack for uncovering the latest
    developments in {topic}. Known for your ability to find the most relevant
    information and present it in a clear and concise manner.
```

**Assessment:** CrewAI is the most explicitly persona-driven framework. `role` + `goal` + `backstory` is literally an identity trifecta. No concept of behavioral constraints, quality bars, or fail triggers. No tool permission granularity beyond binary enable/disable. No escalation paths. No model-tier abstraction.

**Sources:**
- [CrewAI Agents Documentation](https://docs.crewai.com/en/concepts/agents)
- [Configuring CrewAI Agents and Tasks with YAML Files](https://codesignal.com/learn/courses/getting-started-with-crewai-agents-and-tasks/lessons/configuring-crewai-agents-and-tasks-with-yaml-files)
- [CrewAI YAML Configuration — DeepWiki](https://deepwiki.com/crewAIInc/crewAI/8.2-yaml-configuration)

---

### 2. AutoGen / Microsoft Agent Framework

**Format:** Python classes + JSON serialization format
**Identity approach:** Freeform `system_message` string. No structural guidance on content.

**AssistantAgent Fields (AutoGen v0.4+):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Agent identifier |
| `model_client` | ChatCompletionClient | yes | LLM client instance |
| `description` | string | no | Used by orchestrators for routing |
| `system_message` | string | no | Default: "You are a helpful AI assistant..." |
| `tools` | list | no | Functions or BaseTool instances |
| `handoffs` | list | no | Target agents for task transfers |
| `reflect_on_tool_use` | bool | no | Reason about tool results |
| `max_tool_iterations` | int | no | Default 1 |
| `output_content_type` | BaseModel | no | Structured output schema |
| `tool_call_summary_format` | string | no | Template for result summaries |
| `model_context` | ChatCompletionContext | no | Message history management |
| `memory` | list | no | Persistent knowledge stores |
| `metadata` | dict | no | Custom key-value tracking |
| `model_client_stream` | bool | no | Streaming mode |

**Serialization format (JSON):**
```json
{
  "provider": "autogen_agentchat.agents.AssistantAgent",
  "component_type": "agent",
  "version": 1,
  "component_version": 1,
  "config": {
    "name": "assistant",
    "model_client": {
      "provider": "autogen_ext.models.openai.OpenAIChatCompletionClient",
      "component_type": "model",
      "config": {"model": "gpt-4o"}
    },
    "system_message": "Use tools to solve tasks.",
    "handoffs": []
  }
}
```

**Assessment:** AutoGen's `handoffs` field is the closest any framework gets to Sherpa's `escalation`. The `description` field for orchestrator routing is similar to Sherpa's `vibe` (human/orchestrator-facing, not injected as prompt). However, all behavioral content lives in the unstructured `system_message` string. No quality bars, no fail triggers, no disposition, no domain scoping. The JSON serialization format is notable — it's the only framework with a formal, versioned serialization schema for agents.

Microsoft Agent Framework (Oct 2025) adds declarative YAML/JSON definitions for version-controlled agent configs, but the schema details remain similar to AutoGen's programmatic API.

**Sources:**
- [AutoGen Agent Reference](https://microsoft.github.io/autogen/stable//reference/python/autogen_agentchat.agents.html)
- [AutoGen Agents Tutorial](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/agents.html)
- [AutoGen Serializing Components](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/serialize-components.html)
- [Microsoft Agent Framework Overview](https://learn.microsoft.com/en-us/agent-framework/overview/)
- [Microsoft Agent Framework Declarative Agents](https://learn.microsoft.com/en-us/agent-framework/agents/declarative)
- [Visual Studio Magazine: Semantic Kernel + AutoGen](https://visualstudiomagazine.com/articles/2025/10/01/semantic-kernel-autogen--open-source-microsoft-agent-framework.aspx)

---

### 3. LangGraph / LangChain

**Format:** Python function calls (no declarative config)
**Identity approach:** Freeform `prompt`/`system_prompt` string parameter.

**`create_agent()` Parameters (LangGraph 1.0):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `model` | string/ChatModel | yes | LLM identifier or instance |
| `tools` | list | yes | Tool functions or ToolNode |
| `prompt` / `system_prompt` | string/SystemMessage/callable | no | System-level instructions |
| `state_schema` | TypedDict/BaseModel | no | Custom agent state shape |
| `response_format` | type | no | Structured output |
| `checkpointer` | CheckpointSaver | no | State persistence |
| `store` | BaseStore | no | Cross-thread data |
| `interrupt_before` | list | no | Node names to pause at |

**Assessment:** LangGraph is the most minimal in agent definition — it's fundamentally a graph execution engine, not an agent definition framework. Agents are defined by graph topology (nodes and edges), not by schema fields. There is no concept of identity, behavioral constraints, escalation, quality bars, or tool permissions at the agent definition level. Everything behavioral goes into the freeform `prompt` string. The `interrupt_before` parameter is the closest thing to a permission/approval system.

LangGraph deliberately separates agent definition (what it knows) from agent orchestration (how it flows). Sherpa's schema combines both.

**Sources:**
- [LangChain Agents Documentation](https://docs.langchain.com/oss/python/langchain/agents)
- [LangGraph Reference — agents](https://reference.langchain.com/python/langgraph/agents)
- [LangChain and LangGraph v1.0 Announcement](https://blog.langchain.com/langchain-langgraph-1dot0/)
- [LangChain Python Tutorial 2026 — JetBrains](https://blog.jetbrains.com/pycharm/2026/02/langchain-tutorial-2026/)

---

### 4. OpenAI Assistants API (Deprecated)

**Format:** JSON REST API
**Identity approach:** Freeform `instructions` string.

**Create Assistant Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `model` | string | yes | Model identifier |
| `name` | string | no | Max 256 chars |
| `description` | string | no | Purpose description |
| `instructions` | string | no | "Guide personality and define goals" |
| `tools` | array | no | Max 128 tools |
| `tool_resources` | object | no | File access for code_interpreter/file_search |
| `temperature` | float | no | 0-2 |
| `top_p` | float | no | Nucleus sampling |
| `response_format` | object | no | JSON schema for structured output |
| `reasoning_effort` | string | no | none/minimal/low/medium/high/xhigh |
| `metadata` | object | no | Custom key-value pairs |

**Assessment:** The Assistants API is the simplest agent definition in the landscape. All behavior lives in `instructions`. No escalation, no quality bars, no fail triggers, no permission model beyond tool enable/disable. The `reasoning_effort` parameter is unique and interesting — it maps loosely to Sherpa's `model-tier` concept. Now deprecated in favor of OpenAI Agents SDK.

**Sources:**
- [OpenAI Create Assistant API Reference](https://platform.openai.com/docs/api-reference/assistants/createAssistant)
- [OpenAI Assistants Deep Dive](https://developers.openai.com/api/docs/assistants/deep-dive/)
- [OpenAI Assistants Migration Guide](https://developers.openai.com/api/docs/assistants/migration/)

---

### 5. OpenAI Agents SDK (successor to Swarm)

**Format:** Python dataclass
**Identity approach:** Freeform `instructions` string (static or callable).

**Agent Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Agent identifier |
| `instructions` | string/callable | no | Static or dynamic (receives context + agent) |
| `model` | string/Model | no | LLM implementation |
| `model_settings` | ModelSettings | no | Temperature, top_p, etc. |
| `tools` | list[Tool] | no | Available functions |
| `handoffs` | list[Agent/Handoff] | no | Sub-agents for delegation |
| `input_guardrails` | list[InputGuardrail] | no | Pre-execution validation |
| `output_guardrails` | list[OutputGuardrail] | no | Post-execution validation |
| `output_type` | type | no | Structured output schema |
| `tool_use_behavior` | enum | no | How tool results are processed |
| `reset_tool_choice` | bool | no | Prevent infinite tool loops |
| `hooks` | AgentHooks | no | Lifecycle event callbacks |
| `mcp_servers` | list[MCPServer] | no | MCP tool servers |
| `mcp_config` | MCPConfig | no | MCP schema conversion config |
| `handoff_description` | string | no | Description for when agent is used as handoff target |
| `prompt` | Prompt | no | Dynamic prompt (Responses API) |

**Assessment:** The Agents SDK is the most operationally sophisticated among the pure-code frameworks. `input_guardrails` and `output_guardrails` are the closest any framework gets to Sherpa's `fail-triggers` and `quality-bar` — but they're runtime validation functions, not declarative criteria. `handoffs` parallel Sherpa's `escalation`. `hooks` enable lifecycle monitoring. Still, all behavioral content lives in freeform `instructions`. No disposition, no domain scoping, no behavioral constraint decomposition.

**Sources:**
- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-python/)
- [OpenAI Agents SDK Agent Reference](https://openai.github.io/openai-agents-python/ref/agent/)
- [OpenAI Agents SDK GitHub](https://github.com/openai/openai-agents-python)
- [OpenAI Agents SDK Guide](https://developers.openai.com/api/docs/guides/agents-sdk/)
- [OpenAI Agents SDK Review (Dec 2025)](https://mem0.ai/blog/openai-agents-sdk-review)

---

### 6. OpenAI Swarm (deprecated, educational)

**Format:** Python class
**Identity approach:** Freeform `instructions` string.

**Agent Fields:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `name` | string | "Agent" | Agent identifier |
| `model` | string | "gpt-4o" | Model selection |
| `instructions` | string/callable | "You are a helpful agent." | Static or dynamic (receives context_variables) |
| `functions` | list | [] | Callable tools |
| `tool_choice` | string | None | Tool selection constraint |

**Assessment:** Deliberately minimal — 5 fields total. Educational framework, not production. Superseded by OpenAI Agents SDK. Notable for establishing the pattern of callable `instructions` that receives context variables, which the Agents SDK preserved.

**Sources:**
- [OpenAI Swarm GitHub](https://github.com/openai/swarm)
- [Swarm: OpenAI's Approach to Multi-Agent Systems — Arize](https://arize.com/blog/swarm-openai-experimental-approach-to-multi-agent-systems/)

---

### 7. Claude Agent SDK (Anthropic)

**Format:** Python/TypeScript options object
**Identity approach:** Freeform `system_prompt` string + `CLAUDE.md` project instructions.

**ClaudeAgentOptions Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `system_prompt` | string | Agent behavioral instructions |
| `allowed_tools` | string[] | Pre-approved tools (Read, Write, Bash, etc.) |
| `disallowed_tools` | string[] | Blocked tools |
| `permission_mode` | string | "default" / "acceptEdits" / "bypassPermissions" |
| `can_use_tool` | callable | Custom per-tool permission function |
| `cwd` | string | Working directory |
| `max_turns` | int | Conversation turn limit |
| `mcp_servers` | object | External MCP tool servers |
| `hooks` | object | Lifecycle callbacks (PreToolUse, PostToolUse, Stop, etc.) |
| `agents` | object | Subagent definitions (AgentDefinition) |
| `resume` | string | Session ID for continuation |
| `setting_sources` | string[] | Enable CLAUDE.md, skills, slash commands |

**Subagent (AgentDefinition) Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `description` | string | What the subagent does |
| `prompt` | string | System-level instructions |
| `tools` | string[] | Allowed tool names |

**Assessment:** The Claude Agent SDK takes a fundamentally different approach: the agent definition is thin (options object), and the behavioral richness comes from the environment (CLAUDE.md files, .claude/rules/, skills). This is the closest philosophical match to Sherpa's compositional approach where `context-packages` and `rules` point to external files rather than stuffing everything into the agent definition. The `hooks` system with `PreToolUse`/`PostToolUse` matchers is the most sophisticated permission system in the landscape. However, there's still no structured behavioral decomposition — `system_prompt` is a freeform string, and behavioral constraints live in CLAUDE.md files without schema validation.

**Sources:**
- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Claude Agent SDK Python GitHub](https://github.com/anthropics/claude-agent-sdk-python)
- [Building Agents with Claude Agent SDK — Anthropic Engineering](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Claude Agent SDK — Promptfoo](https://www.promptfoo.dev/docs/providers/claude-agent-sdk/)
- [Claude Agent SDK Tutorial — DataCamp](https://www.datacamp.com/tutorial/how-to-use-claude-agent-sdk)

---

### 8. Agency Swarm (VRSEN)

**Format:** Python classes + file-based instructions
**Identity approach:** Freeform `instructions` string or markdown file path.

**Agent Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Agent identifier |
| `description` | string | Role explanation for orchestration |
| `instructions` | string | Behavioral directives — text or path to `./instructions.md` |
| `tools` | list | FunctionTool or BaseTool instances |
| `model` | string | LLM identifier |
| `model_settings` | ModelSettings | Token limits, etc. |
| `files_folder` | string | Files uploaded to OpenAI |
| `schemas_folder` | string | OpenAPI schemas converted to tools |

**Assessment:** Agency Swarm's file-based instructions approach (pointing `instructions` to a markdown file) is conceptually similar to Sherpa's markdown-with-frontmatter format. But the instructions file is freeform markdown — no schema, no validation, no decomposition into behavioral fields. The `description` field for orchestrator routing parallels AutoGen's `description` and Sherpa's `vibe`. State is managed via `settings.json` files. V1 migration introduced changes to this format, suggesting schema evolution challenges.

**Sources:**
- [Agency Swarm GitHub](https://github.com/VRSEN/agency-swarm)
- [Agency Swarm Lab](https://github.com/VRSEN/agency-swarm-lab)
- [Agency Swarm PyPI](https://pypi.org/project/agency-swarm/)

---

### 9. Mastra

**Format:** TypeScript object
**Identity approach:** Freeform `instructions` string (multiple formats supported).

**Agent Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `instructions` | string / string[] / object[] | Behavioral definition — multiple formats |
| `model` | string / function | Static or dynamic model selection |
| `tools` | object | Available tools |
| `agents` | object | Subagents for supervisor pattern |
| `maxSteps` | int | Max sequential LLM calls (default 1) |

**Instructions formats:**
```typescript
// String
instructions: "You are a helpful assistant."

// Array of strings
instructions: ["Rule 1", "Rule 2"]

// System messages with provider options
instructions: {
  role: "system",
  content: "Expert code reviewer...",
  providerOptions: {
    openai: { reasoningEffort: "high" },
    anthropic: { cacheControl: { type: "ephemeral" } }
  }
}

// Dynamic (async function)
instructions: async ({ requestContext }) => {
  return `You are helping ${requestContext.get('user-name')}...`
}
```

**Assessment:** Mastra's dynamic model selection (routing by user tier) is unique and sophisticated. Its instructions support multiple formats including async functions, which enables context-dependent behavioral configuration. But like everyone else, all behavioral content goes into the unstructured `instructions` field. No quality bars, fail triggers, disposition, or escalation. The provider-specific options within instructions (reasoning effort, cache control) show awareness that different models need different configurations — loosely related to Sherpa's `model-tier`.

**Sources:**
- [Mastra Agents Overview](https://mastra.ai/docs/agents/overview)
- [Mastra Documentation](https://mastra.ai/docs)
- [Mastra GitHub](https://github.com/mastra-ai/mastra)
- [Creating AI Agents with Mastra — DEV](https://dev.to/ucodes/creating-ai-agents-with-mastra-and-typescript-4d6o)
- [Mastra AI Framework Guide — Fast.io](https://fast.io/resources/mastra-ai-framework/)
- [Choosing a JS Agent Framework — Mastra Blog](https://mastra.ai/blog/choosing-a-js-agent-framework)

---

## Emerging Standards and Protocols

### Agent2Agent Protocol (A2A) — Google

**AgentCard schema** (the closest thing to an agent definition standard):

```typescript
interface AgentCard {
  name: string;
  description: string;
  url: string;
  provider?: { organization: string; url: string };
  version: string;
  documentationUrl?: string;
  capabilities: {
    streaming?: boolean;
    pushNotifications?: boolean;
    stateTransitionHistory?: boolean;
  };
  authentication: { schemes: string[]; credentials?: string };
  defaultInputModes: string[];   // MIME types
  defaultOutputModes: string[];
  skills: {
    id: string;
    name: string;
    description: string;
    tags: string[];
    examples?: string[];
    inputModes?: string[];
    outputModes?: string[];
  }[];
}
```

**Assessment:** A2A's AgentCard is a capability advertisement, not a behavioral definition. It tells other agents what an agent *can do* (skills, I/O modes) but says nothing about *how it behaves* (no constraints, no quality bars, no disposition). The `skills` array with `tags` and `examples` is interesting — it's a discovery mechanism. Could complement Sherpa's schema as an external-facing representation.

**Sources:**
- [A2A Protocol Specification](https://a2a-protocol.org/latest/specification/)
- [AgentCard Documentation — agent2agent.info](https://agent2agent.info/docs/concepts/agentcard/)
- [A2A Announcement — Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [A2A GitHub](https://github.com/a2aproject/A2A)
- [Understanding A2A — Google Cloud Community](https://medium.com/google-cloud/understanding-a2a-the-protocol-for-agent-collaboration-2e88246ca)

### Agent Communication Protocol (ACP) — IBM BeeAI

RESTful, SDK-optional protocol. Agents advertise manifests (compatible with A2A AgentCards). Focuses on agent-to-agent messaging, not agent definition. Task-based interaction model with structured message envelopes. Under Linux Foundation governance.

**Sources:**
- [ACP Documentation](https://agentcommunicationprotocol.dev/introduction/welcome)
- [IBM: What is ACP?](https://www.ibm.com/think/topics/agent-communication-protocol)
- [ACP GitHub](https://github.com/i-am-bee/acp)
- [IBM Research: ACP](https://research.ibm.com/projects/agent-communication-protocol)
- [IBM Research: Multiagent BeeAI](https://research.ibm.com/blog/multiagent-bee-ai)

### AGNTCY — Cisco, LangChain, Galileo, LlamaIndex

Open Agent Schema Framework (OASF) for discovery + Agent Connect Protocol + Agent Gateway Protocol. Under Linux Foundation. 65+ supporting companies. Focuses on the "Internet of Agents" — discovery, identity, messaging, observability across vendors.

**Sources:**
- [AGNTCY Documentation](https://docs.agntcy.org/)
- [Building the Internet of Agents — Cisco Outshift](https://outshift.cisco.com/blog/building-the-internet-of-agents-introducing-the-agntcy)
- [AGNTCY on GitHub — Cisco Outshift](https://outshift.cisco.com/blog/agntcy-internet-of-agents-is-on-github)
- [AGNTCY Overview — Galileo](https://galileo.ai/blog/agntcy-open-collective-multi-agent-standardization)
- [Linux Foundation: AGNTCY Project](https://www.linuxfoundation.org/press/linux-foundation-welcomes-the-agntcy-project-to-standardize-open-multi-agent-system-infrastructure-and-break-down-ai-agent-silos)

### NIST AI Agent Standards Initiative

Announced Feb 2026. Focused on interoperability and security for AI agents. Early stage — no published schemas yet.

**Sources:**
- [NIST AI Agent Standards Initiative Announcement](https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure)
- [NIST CAISI](https://www.nist.gov/caisi/ai-agent-standards-initiative)

### Agentic AI Foundation (AAIF)

Linux Foundation initiative. Founded Dec 2025 by Anthropic, OpenAI, and Block. Coordinating open infrastructure for agentic AI. Governance layer — not a schema standard.

**Sources:**
- [AAIF Overview — IntuitionLabs](https://intuitionlabs.ai/articles/agentic-ai-foundation-open-standards)

---

## Comparative Analysis

### Field Coverage Matrix

| Feature | CrewAI | AutoGen | LangGraph | OpenAI Assistants | OpenAI Agents SDK | Swarm | Claude Agent SDK | Agency Swarm | Mastra | **Sherpa** |
|---------|--------|---------|-----------|-------------------|-------------------|-------|-----------------|--------------|--------|------------|
| Identity/persona fields | **role+goal+backstory** | system_message | prompt | instructions | instructions | instructions | system_prompt | instructions | instructions | **NEVER** |
| Structured behavioral fields | -- | -- | -- | -- | -- | -- | -- | -- | -- | **disposition, behavioral-constraints, fail-triggers** |
| Quality criteria | -- | -- | -- | -- | guardrails (code) | -- | -- | -- | -- | **quality-bar** |
| Model selection | llm field | model_client | model | model | model | model | (env-based) | model | model/function | **model-tier** (abstract) |
| Tool permissions | bool flags | tools list | tools list | tools array | tools list | functions list | **allowed/disallowed + hooks** | tools list | tools object | **permission tokens** |
| Escalation/handoff | allow_delegation | **handoffs** | -- | -- | **handoffs** | function returns | subagents | -- | agents | **escalation graph** |
| Domain scoping | backstory (implicit) | -- | -- | -- | -- | -- | CLAUDE.md | -- | -- | **domain-scope** |
| Fail conditions | -- | -- | -- | -- | **output_guardrails** (code) | -- | **hooks** (code) | -- | -- | **fail-triggers** (declarative) |
| Serialization format | YAML | **JSON (versioned)** | -- | JSON REST | -- | -- | -- | settings.json | -- | **YAML frontmatter in Markdown** |
| Validation rules | -- | -- | -- | -- | -- | -- | -- | -- | -- | **13 lint rules** |
| Human-facing vs model-facing separation | -- | description vs system_message | -- | -- | handoff_description | -- | -- | description vs instructions | -- | **vibe vs disposition** |

### Key Differentiators of Sherpa's Schema

**1. Behavioral decomposition over freeform instructions.**
Every other framework puts behavioral content in a single `instructions`/`system_message` string. Sherpa decomposes this into 5 distinct fields (`disposition`, `behavioral-constraints`, `quality-bar`, `fail-triggers`, `domain-scope`), each with specific writing rules and validation.

**2. Declarative fail triggers.**
Only OpenAI Agents SDK (guardrails) and Claude Agent SDK (hooks) have anything comparable, but those are runtime code, not declarative criteria. Sherpa's fail triggers are plain-text rules a Judge agent can read and evaluate — no code required.

**3. Identity language ban with lint enforcement.**
No other framework prohibits identity language. CrewAI requires it. Sherpa validates against it with regex rules (error #6: no "you are", "expert", "senior", "years of experience" in disposition).

**4. Separation of human-facing and model-facing content.**
Sherpa's `vibe` (human-facing, never injected as prompt) vs `disposition` (model-facing, always injected) is a deliberate separation no other framework makes. AutoGen's `description` field comes closest but isn't as explicitly documented.

**5. Compositional context via pointers.**
Sherpa's `context-packages`, `rules`, and `skills` fields point to external files rather than embedding context. Only the Claude Agent SDK (via CLAUDE.md + .claude/rules/) takes this approach, and only implicitly.

**6. Explicit escalation graph.**
Only AutoGen and OpenAI Agents SDK have `handoffs`. Sherpa's `escalation` uses a directed-graph notation (`"condition -> agent-name"`) that encodes both the trigger and the target, making the expertise graph explicit and inspectable.

**7. Abstract model tier over concrete model selection.**
Every framework specifies a concrete model (gpt-4o, claude-sonnet-4, etc.). Sherpa uses `model-tier` (high/medium/low) — the dispatching system maps tiers to models. This enables model-agnostic definitions that survive model deprecation.

---

## Gaps in Sherpa's Schema (Identified from Landscape)

**1. No runtime hooks/lifecycle events.**
OpenAI Agents SDK (`hooks`, `guardrails`) and Claude Agent SDK (`PreToolUse`, `PostToolUse`, `Stop`) provide programmatic lifecycle control. Sherpa's schema is purely declarative — it assumes a separate runtime handles lifecycle concerns. This is a design choice, not necessarily a gap, but worth documenting.

**2. No structured output schema.**
OpenAI Agents SDK (`output_type`), AutoGen (`output_content_type`), Mastra (`structuredOutput`), and OpenAI Assistants (`response_format`) all support structured output schemas. Sherpa could add an `output-schema` field for agents that produce machine-readable artifacts (e.g., Judge verdicts, research reports).

**3. No dynamic instructions/context.**
OpenAI Agents SDK, Swarm, LangGraph, and Mastra support callable `instructions` that receive runtime context. Sherpa's instructions are static YAML/markdown. Dynamic behavior is handled by the pipeline, not the agent definition — again, a design choice.

**4. No MCP server declarations.**
OpenAI Agents SDK and Claude Agent SDK both support declaring MCP servers per agent. Sherpa's `tools` and `skills` are abstract tokens — no mechanism to declare concrete MCP connections.

**5. No explicit memory/state management.**
AutoGen (`memory`, `model_context`), CrewAI (`memory`), and LangGraph (`checkpointer`, `store`) have memory fields. Sherpa assumes memory is a pipeline concern, not an agent definition concern.

**6. No interoperability with A2A/ACP.**
The emerging protocols (A2A, ACP, AGNTCY) define agent capability cards for cross-framework discovery. Sherpa's schema has no mechanism to export an A2A AgentCard from a behavioral agent definition. This is future work — the `tags` + `domain-scope` + `tool-permissions` fields contain enough information to generate an AgentCard automatically.

---

## Research Evidence: Behavioral vs Identity Prompting

### Zheng et al. (EMNLP 2024)
"When 'A Helpful Assistant' Is Not Really Helpful: Personas in System Prompts Do Not Improve Performances of Large Language Models." Tested 162 roles across 2,410 questions. Finding: identity role effects are "largely random" — the best role per question is idiosyncratic, and selecting the "right" role offers limited improvement over random selection.

**Source:** [ACL Anthology — EMNLP 2024 Findings](https://aclanthology.org/2024.findings-emnlp.888.pdf)

### Anthropic Prompt Engineering Guide (2025)
Anthropic's official guidance ranks role assignment as the **least impactful** of five prompt engineering techniques: (1) clarity & directness, (2) examples, (3) chain of thought, (4) structured thinking tags, (5) role assignment. The guide recommends starting with behavioral clarity and only adding roles after the fundamentals are solid.

**Sources:**
- [Anthropic: Claude 4 Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)
- [Anthropic: Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### PromptHub Analysis
"The TL;DR is: using role prompting is either a non-factor, or slightly helps for most benchmarks with select models" — confirms the pattern that identity claims produce inconsistent results while behavioral specificity produces reliable results.

**Source:** [PromptHub: Role-Prompting — Does Adding Personas Really Make a Difference?](https://www.prompthub.us/blog/role-prompting-does-adding-personas-to-your-prompts-really-make-a-difference)

### Li (2025) — System Dynamics Review
Identified a fundamental tension: "Descriptive prompts suffer from low internal validity and behavioral inconsistency that necessitate introducing explicit constraints, yet such interventions may lead to over-control problems." This validates Sherpa's approach of decomposed constraints over monolithic descriptions, while flagging the over-specification risk.

**Source:** [Wiley: Peer Review Dynamics with Prompt Engineering](https://onlinelibrary.wiley.com/doi/10.1002/sdr.70008)

---

## Open Questions

1. **Should Sherpa define an `output-schema` field?** Multiple frameworks support structured output. For agents that produce machine-readable artifacts (verdicts, reports, research summaries), a schema field could enable automated validation.

2. **Should Sherpa export A2A AgentCards?** As inter-agent protocols mature, the ability to advertise agent capabilities to external systems becomes valuable. Sherpa's existing fields (`tags`, `domain-scope`, `tool-permissions`) map naturally to AgentCard `skills`.

3. **How does Sherpa handle multi-model agents?** Mastra supports dynamic model routing per request. Sherpa's `model-tier` is static per agent definition. Should there be a mechanism for context-dependent model selection?

4. **What's the migration path for CrewAI users?** CrewAI is the most popular multi-agent framework and the most identity-driven. A migration guide from CrewAI's role+goal+backstory to Sherpa's behavioral format would lower adoption barriers.

5. **Should `escalation` support conditional logic?** Current format is `"condition -> agent-name"`. Some frameworks (AutoGen, OpenAI Agents SDK) support richer handoff logic with filter functions. Is the string-based format sufficient?

6. **How do behavioral constraints compose across agent hierarchies?** When a parent agent delegates to a child, do the parent's constraints propagate? No framework addresses this clearly.

7. **Is there value in a `behavioral-constraints` template library?** Common constraints (type safety, test coverage, evidence requirements) recur across agent definitions. A shared library would reduce boilerplate and ensure consistency.

---

## Raw Links (All URLs Encountered)

### Framework Documentation
- https://docs.crewai.com/en/concepts/agents
- https://codesignal.com/learn/courses/getting-started-with-crewai-agents-and-tasks/lessons/configuring-crewai-agents-and-tasks-with-yaml-files
- https://deepwiki.com/crewAIInc/crewAI/8.2-yaml-configuration
- https://deepwiki.com/lalitnayyar/The-Complete-Agentic-AI-Engineering-Course-2025-/5.1-agent-configuration-with-yaml
- https://docs.crewai.com/llms-full.txt
- https://www.core42.ai/compass/documentation/crewai
- https://microsoft.github.io/autogen/stable//reference/python/autogen_agentchat.agents.html
- https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/agents.html
- https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/serialize-components.html
- https://microsoft.github.io/autogen/0.2/docs/reference/agentchat/assistant_agent/
- https://microsoft.github.io/autogen/stable//index.html
- https://microsoft.github.io/autogen/0.2/docs/Getting-Started/
- https://learn.microsoft.com/en-us/agent-framework/overview/
- https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/
- https://learn.microsoft.com/en-us/agent-framework/agents/declarative
- https://learn.microsoft.com/en-us/agent-framework/user-guide/agents/agent-types/claude-agent-sdk
- https://docs.langchain.com/oss/python/langchain/agents
- https://reference.langchain.com/python/langgraph/agents
- https://python.langchain.com/api_reference/langchain/agents/langchain.agents.react.agent.create_react_agent.html
- https://www.langchain.com/langgraph
- https://github.com/langchain-ai/langgraph
- https://github.com/langchain-ai/react-agent
- https://platform.openai.com/docs/api-reference/assistants/createAssistant
- https://developers.openai.com/api/reference/resources/beta/subresources/assistants/methods/create/
- https://developers.openai.com/api/docs/assistants/deep-dive/
- https://developers.openai.com/api/docs/assistants/migration/
- https://developers.openai.com/api/docs/assistants/tools/function-calling
- https://openai.github.io/openai-agents-python/
- https://openai.github.io/openai-agents-python/ref/agent/
- https://github.com/openai/openai-agents-python
- https://developers.openai.com/api/docs/guides/agents-sdk/
- https://github.com/openai/swarm
- https://platform.claude.com/docs/en/agent-sdk/overview
- https://github.com/anthropics/claude-agent-sdk-python
- https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
- https://www.promptfoo.dev/docs/providers/claude-agent-sdk/
- https://www.datacamp.com/tutorial/how-to-use-claude-agent-sdk
- https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk
- https://docs.claude.com/en/api/agent-sdk/overview
- https://github.com/VRSEN/agency-swarm
- https://github.com/VRSEN/agency-swarm-lab
- https://github.com/VRSEN/agency-swarm/blob/main/.cursorrules
- https://github.com/VRSEN/agency-swarm/blob/main/README.md
- https://pypi.org/project/agency-swarm/
- https://mastra.ai/docs/agents/overview
- https://mastra.ai/docs
- https://mastra.ai/
- https://github.com/mastra-ai/mastra
- https://mastra.ai/blog/choosing-a-js-agent-framework
- https://dev.to/ucodes/creating-ai-agents-with-mastra-and-typescript-4d6o
- https://fast.io/resources/mastra-ai-framework/

### Protocol & Standards
- https://a2a-protocol.org/latest/specification/
- https://a2a-protocol.org/dev/specification/
- https://a2aprotocol.ai/
- https://agent2agent.info/docs/concepts/agentcard/
- https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
- https://github.com/a2aproject/A2A
- https://medium.com/google-cloud/understanding-a2a-the-protocol-for-agent-collaboration-2eaa246ca
- https://agentcommunicationprotocol.dev/introduction/welcome
- https://github.com/i-am-bee/acp
- https://www.ibm.com/think/topics/agent-communication-protocol
- https://research.ibm.com/projects/agent-communication-protocol
- https://research.ibm.com/blog/agent-communication-protocol-ai
- https://research.ibm.com/blog/multiagent-bee-ai
- https://www.ibm.com/think/topics/beeai
- https://docs.agntcy.org/
- https://outshift.cisco.com/blog/building-the-internet-of-agents-introducing-the-agntcy
- https://outshift.cisco.com/blog/agntcy-internet-of-agents-is-on-github
- https://galileo.ai/blog/agntcy-open-collective-multi-agent-standardization
- https://learnprompting.org/blog/agntcy-open-standard-for-agent-interoperability
- https://www.linuxfoundation.org/press/linux-foundation-welcomes-the-agntcy-project-to-standardize-open-multi-agent-system-infrastructure-and-break-down-ai-agent-silos
- https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure
- https://www.nist.gov/caisi/ai-agent-standards-initiative
- https://intuitionlabs.ai/articles/agentic-ai-foundation-open-standards
- https://agentprotocol.ai/
- https://arxiv.org/html/2505.02279v1
- https://arxiv.org/pdf/2504.16736

### Research & Analysis
- https://aclanthology.org/2024.findings-emnlp.888.pdf
- https://aclanthology.org/2024.findings-emnlp.969.pdf
- https://aclanthology.org/2025.findings-emnlp.963.pdf
- https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://www.prompthub.us/blog/role-prompting-does-adding-personas-to-your-prompts-really-make-a-difference
- https://onlinelibrary.wiley.com/doi/10.1002/sdr.70008
- https://www.vktr.com/ai-upskilling/a-guide-to-persona-prompting-why-your-ai-needs-an-identity-to-perform/
- https://www.agentx.so/mcp/blog/advanced-prompt-engineering-techniques-master-the-art-of-ai-agent-instructions
- https://learnprompting.org/docs/advanced/zero_shot/role_prompting
- https://converter.brightcoding.dev/blog/system-prompts-for-ai-agents-the-complete-2026-guide-to-building-powerful-safe-autonomous-systems
- https://scalablehuman.com/2025/07/02/review-anthropics-prompt-engineering-guide/
- https://www.lakera.ai/blog/prompt-engineering-guide
- https://www-cdn.anthropic.com/62df988c101af71291b06843b63d39bbd600bed8.pdf
- https://www.aiwithgrant.com/guides/anthropic-prompt-engineering-overview
- https://aimaker.substack.com/p/the-10-step-system-prompt-structure-guide-anthropic-claude
- https://techwithibrahim.medium.com/the-art-of-agent-prompting-lessons-from-anthropics-ai-team-e8c9ac4db3f3

### Industry Overviews & Guides
- https://www.spaceo.ai/blog/agentic-ai-frameworks/
- https://www.ruh.ai/blogs/ai-agent-protocols-2026-complete-guide
- https://www.ssonetwork.com/intelligent-automation/columns/ai-agent-protocols-10-modern-standards-shaping-the-agentic-era
- https://nordicapis.com/comparing-7-ai-agent-to-api-standards/
- https://medium.com/@gathright/agent-to-agent-is-the-new-api-a-guide-to-the-protocols-that-matter-eda321a08d15
- https://aws.amazon.com/blogs/opensource/open-protocols-for-agent-interoperability-part-4-inter-agent-communication-on-a2a/
- https://www.solo.io/topics/ai-infrastructure/what-is-a2a
- https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/
- https://www.ibm.com/think/topics/agent2agent-protocol
- https://www.descope.com/learn/post/a2a
- https://onereach.ai/blog/what-is-a2a-agent-to-agent-protocol/
- https://mem0.ai/blog/openai-agents-sdk-review
- https://medium.com/@sausi/in-2026-building-ai-agents-isnt-about-prompts-it-s-about-architecture-15f5cfc93950
- https://arize.com/blog/swarm-openai-experimental-approach-to-multi-agent-systems/
- https://composio.dev/content/swarm-the-agentic-framework-from-openai
- https://docs.swarms.world/en/latest/swarms/structs/agent/
- https://medium.com/@michael_79773/exploring-openais-swarm-an-experimental-framework-for-multi-agent-systems-5ba09964ca18
- https://galileo.ai/blog/openai-swarm-framework-multi-agents
- https://medium.com/@pankaj_pandey/building-agents-from-scratch-using-openai-swarm-framework-a-simple-guide-for-developers-6fe46a620900
- https://www.launchfa.st/blog/using-openai-swarm
- https://lexogrine.com/blog/openai-swarm-multi-agent-framework-2026
- https://cookbook.openai.com/topic/agents
- https://dev.to/jaipalsingh/15-best-ai-agent-frameworks-for-enterprise-open-source-to-managed-2026-27c8
- https://developers.openai.com/blog/openai-for-developers-2025/
- https://www.leanware.co/insights/langchain-agents-complete-guide-in-2025
- https://www.digitalapplied.com/blog/langchain-ai-agents-guide-2025
- https://www.langchain.com/state-of-agent-engineering
- https://blog.langchain.com/langchain-langgraph-1dot0/
- https://www.emergentmind.com/topics/langchain-langgraph
- https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-frameworks/langchain-langgraph.html
- https://blog.jetbrains.com/pycharm/2026/02/langchain-tutorial-2026/
- https://docs.cloud.google.com/agent-builder/agent-engine/develop/langgraph
- https://www.freecodecamp.org/news/how-to-develop-ai-agents-using-langgraph-a-practical-guide/
- https://www.datacamp.com/tutorial/langgraph-agents
- https://towardsdatascience.com/building-a-langgraph-agent-from-scratch/
- https://anderfernandez.com/en/blog/agent-systems-with-langgraph/
- https://neo4j.com/blog/developer/react-agent-langgraph-mcp/
- https://ai.google.dev/gemini-api/docs/langgraph-example
- https://medium.com/@umang91999/building-a-react-agent-with-langgraph-a-step-by-step-guide-812d02bafefa
- https://github.com/langchain-ai/langgraph/discussions/2111
- https://medium.com/data-science-collective/building-ai-agents-with-openai-sdk-5e48a90dccb2
- https://nader.substack.com/p/the-complete-guide-to-building-agents
- https://medium.com/@laurentkubaski/openai-tool-schema-explained-05a5ce0e80f8
- https://learn.microsoft.com/en-us/azure/ai-services/openai/assistants-reference
- https://community.appsmith.com/content/guide/openai-assistants-structured-outputs
- https://www.charterglobal.com/how-to-use-the-microsoft-autogen-framework-to-build-ai-agents/
- https://visualstudiomagazine.com/articles/2025/10/01/semantic-kernel-autogen--open-source-microsoft-agent-framework.aspx
- https://www.infoq.com/news/2025/10/microsoft-agent-framework/
- https://cloudsummit.eu/blog/microsoft-agent-framework-production-ready-convergence-autogen-semantic-kernel
- https://devblogs.microsoft.com/foundry/introducing-microsoft-agent-framework-the-open-source-engine-for-agentic-ai-apps/
- https://www.developerscantina.com/p/autogen-declarative-agents/
- https://microsoft.github.io/autogen/dev//user-guide/autogenstudio-user-guide/index.html
- https://github.com/microsoft/autogen/issues/2559
- https://docs.ag2.ai/latest/docs/api-reference/autogen/ConversableAgent/
- https://docs.ag2.ai/0.8.7/docs/api-reference/autogen/AssistantAgent/
- https://microsoft.github.io/autogen/stable//user-guide/core-user-guide/design-patterns/handoffs.html
- https://microsoft.github.io/autogen/0.2/docs/topics/llm_configuration/
- https://medium.com/@danushidk507/ai-agents-xiii-autogen-multiagentic-framework-modules-ii-f58d0aa91a1a
- https://dev.to/admantium/llm-agents-custom-tools-in-autogen-270d
- https://microsoft.github.io/FLAML/docs/reference/autogen/agentchat/assistant_agent/
- https://forum.langchain.com/t/force-tool-calling-in-langraph-swarm/1726
- https://blog.crewai.com/getting-started-with-crewai-build-your-first-crew/
- https://www.crewai.com/blog/build-your-first-crewai-agents
- https://latenode.com/blog/ai-frameworks-technical-infrastructure/crewai-framework/crewai-framework-2025-complete-review-of-the-open-source-multi-agent-ai-platform
- https://workos.com/blog/mastra-ai-quick-start
- https://thenewstack.io/mastra-empowers-web-devs-to-build-ai-agents-in-typescript/
- https://www.ycombinator.com/companies/mastra
- https://workos.com/blog/ibm-agent-communication-protocol-acp
- https://medium.com/mitb-for-all/introducing-the-agent-communication-protocol-acp-abd882114139
- https://medium.com/@jatingargiitk/acp-the-protocol-standard-for-ai-agent-interoperability-395e5351d72a
- https://github.com/i-am-bee/acp/discussions/122
- https://venturebeat.com/ai/a-standard-open-framework-for-building-ai-agents-is-coming-from-cisco-langchain-and-galileo
- https://medium.com/@visrow/what-is-agntcy-internet-of-agents-c88ee8633705
- https://thesequence.substack.com/p/the-sequence-engineering-508-agntcy
- https://www.theregister.com/2025/07/30/agntcy_lf_donation/
- https://subramanya.ai/2025/12/23/2025-the-year-agentic-ai-got-real-and-what-comes-next/
- https://mlpills.substack.com/p/issue-122-the-12-step-blueprint-for
- https://www.paradisosolutions.com/blog/role-prompting-and-persona-specification/
- https://www.jenova.ai/en/resources/ai-character-prompts
- https://arxiv.org/html/2507.08594v1
- https://voice.lapaas.com/anthropic-context-engineering-2025/
- https://howaiworks.ai/blog/anthropic-context-engineering-for-agents
- https://01.me/en/2025/12/context-engineering-from-claude/
- https://pub.towardsai.net/context-engineering-explained-the-anthropic-guide-thats-changing-how-developers-work-with-ai-40fae176a18d
- https://natesnewsletter.substack.com/p/i-read-everything-google-anthropic
- https://github.com/anthropics/prompt-eng-interactive-tutorial
- https://aws.amazon.com/blogs/machine-learning/prompt-engineering-techniques-and-best-practices-learn-by-doing-with-anthropics-claude-3-on-amazon-bedrock/
- https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering
- https://github.com/bonigarcia/context-engineering
- https://www.linkedin.com/posts/richmondalake_effective-context-engineering-for-ai-agents-activity-7386881837643603968-R-6K
- https://www.anthropic.com/engineering
- https://ai-sdk.dev/docs/agents/building-agents
- https://github.com/VRSEN/agency-swarm/pull/314
- https://github.com/VRSEN/agency-swarm-custom-gpt
- https://github.com/fylingpete/agency-swarm_VRSEN
- https://github.com/VRSEN/agency-swarm/tree/main/docs
- https://github.com/VRSEN/agency-swarm/releases
- https://github.com/anthropics/claude-agent-sdk-demos
