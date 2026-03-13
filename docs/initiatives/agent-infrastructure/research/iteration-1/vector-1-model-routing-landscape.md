# Vector 1: Model Routing Landscape

**Question:** How do Claude Code's `--model` flag, LM Studio's OpenAI-compatible API, and other local inference servers work? What's the minimum viable routing from model-tier annotations to actual dispatch?
**Agent dispatched:** 2026-03-06

## Findings

### Claude Code Model Configuration

- **Aliases:** `sonnet`, `opus`, `haiku`, `default`, `opusplan`, `sonnet[1m]`
- **Full model names:** `claude-sonnet-4-6`, `claude-opus-4-6`, `claude-haiku-4-5`, `claude-3-5-haiku-20241022`
- **`opusplan` alias:** Uses Opus for planning, switches to Sonnet for execution automatically. This is the most relevant built-in routing mechanism.
- **Syntax:** `claude --model opus`, `claude --model claude-sonnet-4-6`, or `/model sonnet` mid-session
- **Environment variable:** `ANTHROPIC_MODEL=<alias|name>` for persistent config
- **Settings file:** `{ "model": "opus" }` in settings JSON
- **Priority order:** in-session `/model` > `--model` flag > `ANTHROPIC_MODEL` env var > settings file
- **Alias remapping env vars:** `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL` let you point aliases at specific versions or provider-specific model IDs
- **Subagent model:** `CLAUDE_CODE_SUBAGENT_MODEL` controls what model subagents use, enabling Opus lead + Sonnet subagents
- **Effort levels:** `low`, `medium`, `high` via `CLAUDE_CODE_EFFORT_LEVEL` env var or `/model` slider. Supported on Opus 4.6 and Sonnet 4.6.

### LM Studio API

- **Default port:** `1234`
- **Base URL:** `http://localhost:1234/v1`
- **OpenAI-compatible endpoints:** `GET /v1/models`, `POST /v1/chat/completions`, `POST /v1/completions`, `POST /v1/embeddings`, `POST /v1/responses`
- **Anthropic-compatible endpoints:** LM Studio 0.4.0+ also provides Anthropic-compatible endpoints
- **Native API:** `/api/v1/*` endpoints (recommended for new integrations as of 0.4.0)
- **CLI start:** `lms server start`
- **Limitation:** API only runs while LM Studio is open. Not daemonizable.
- **Client compatibility:** Any OpenAI client library works by swapping `base_url` to `http://localhost:1234/v1`

### Claude Code Custom Endpoint Support

**Yes, through multiple mechanisms:**

- **`ANTHROPIC_BASE_URL`:** Redirects all API calls to any endpoint that speaks Anthropic Messages format (`/v1/messages`). This is the primary mechanism.
- **Required API format:** The gateway must expose one of: Anthropic Messages (`/v1/messages`), Bedrock InvokeModel, or Vertex rawPredict. Must forward `anthropic-beta` and `anthropic-version` headers.
- **LiteLLM integration:** Documented first-party support for LiteLLM as a gateway proxy, including unified endpoint (`ANTHROPIC_BASE_URL=https://litellm-server:4000`) and provider-specific pass-through.
- **Ollama native support (v0.14.0+):** Ollama now speaks Anthropic Messages API natively. Set `ANTHROPIC_BASE_URL=http://localhost:11434` and `ANTHROPIC_AUTH_TOKEN=ollama`. No proxy needed.
- **vLLM integration:** vLLM implements `/v1/messages` directly. Set `ANTHROPIC_BASE_URL=http://localhost:8000`. Requires models with strong tool calling support.
- **llama.cpp:** Now supports Anthropic Messages API via `POST /v1/messages`. Converts to OpenAI format internally.

**Critical insight:** The landscape shifted significantly in early 2026. Ollama, vLLM, and llama.cpp all added native Anthropic Messages API support, eliminating the need for translation proxies in most cases.

### Ollama vs LM Studio Comparison

| Feature | Ollama | LM Studio |
|---------|--------|-----------|
| **Default port** | `11434` | `1234` |
| **Anthropic endpoint** | `http://localhost:11434/v1/messages` (v0.14.0+) | Anthropic-compatible (v0.4.0+) |
| **Runs as daemon** | Yes, always-on background service | No, requires GUI app open |
| **CLI** | `ollama serve`, `ollama run`, `ollama pull` | `lms server start` |
| **Docker support** | Yes, official container | Limited |
| **Claude Code compat** | Native (no proxy) via Anthropic API | Via OpenAI compat or Anthropic compat |
| **Production readiness** | Higher (daemon, Docker, headless) | Lower (requires GUI) |

**For WavePoint's use case:** Ollama is the stronger candidate for automated agent dispatch due to daemon mode and native Anthropic API. LM Studio is better for interactive model exploration.

### Minimum Viable Routing — Three Approaches

**Approach A: Prompt Header (advisory, 0 infrastructure)**
When Studio generates a prompt for a role, include a header like `# Model Recommendation: opus`. Human reads and picks `claude --model opus`. Already designed in proposal Phase 1.

**Approach B: CLI Flag Dispatch (semi-automated, ~1 session)**
A shell script reads the role's `model-tier` and launches Claude Code with the appropriate `--model` flag:
```bash
TIER=$(yq '.model-tier' docs/agents/roles/$ROLE.md)
case $TIER in
  high)   claude --model opus "$@" ;;
  medium) claude --model sonnet "$@" ;;
  low)    ANTHROPIC_BASE_URL=http://localhost:11434 ANTHROPIC_AUTH_TOKEN=ollama ANTHROPIC_MODEL=qwen3-coder claude "$@" ;;
esac
```

**Approach C: `opusplan`-Style Hybrid (built-in, 0 infrastructure)**
Use Claude Code's built-in `opusplan` alias (Opus for planning, Sonnet for execution) + `CLAUDE_CODE_SUBAGENT_MODEL` for subagent routing. Covers 80% of use cases with zero custom code.

**Recommended MVP:** Approach C first, then B. Use `opusplan` + `CLAUDE_CODE_SUBAGENT_MODEL` immediately (costs nothing). Build Approach B when the role catalog exists. Skip Approach A — if you're reading a header and manually setting a flag, the script can do it for you.

### Existing Model Routing Tools

**Purpose-Built for Claude Code:**
- **HydraTeams** — Translation proxy making Claude Code Agent Teams model-agnostic. Route lead to Claude, teammates to GPT/Gemini/Ollama.
- **claude-code-proxy** — Anthropic-to-OpenAI translation. Configures BIG and SMALL models via env vars.
- **nielspeter/claude-code-proxy** — Lightweight proxy for OpenRouter (200+ models), OpenAI, Ollama.
- **CCProxy** — Commercial proxy for Claude Code with Ollama integration.

**General LLM Routing:**
- **RouteLLM** — OpenAI drop-in replacement routing between strong/weak models. 85% cost reduction, 95% GPT-4 quality with 26% GPT-4 calls.
- **LiteLLM** — Unified proxy for 100+ LLM providers. First-party Claude Code support.
- **vllm-mlx** — OpenAI and Anthropic compatible server optimized for Apple Silicon. 400+ tok/s. Works with Claude Code.

**Agent Orchestration:**
- **Claude Code Agent Teams** — Anthropic's built-in multi-agent orchestration.
- **agent-teams-lite** — Spec-driven development with 9 specialized sub-agents. Zero dependencies, pure markdown.

## Sources

- [Claude Code Model Configuration](https://code.claude.com/docs/en/model-config) — Official docs for --model, aliases, env vars
- [Claude Code LLM Gateway](https://code.claude.com/docs/en/llm-gateway) — ANTHROPIC_BASE_URL, LiteLLM, gateway requirements
- [Claude Code Sub-agents](https://code.claude.com/docs/en/sub-agents) — CLAUDE_CODE_SUBAGENT_MODEL docs
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams) — Built-in multi-agent orchestration
- [LM Studio OpenAI Compat](https://lmstudio.ai/docs/developer/openai-compat) — API endpoint documentation
- [LM Studio Developer Docs](https://lmstudio.ai/docs/developer) — Anthropic-compatible endpoints (v0.4.0+)
- [Ollama Anthropic Compatibility](https://docs.ollama.com/api/anthropic-compatibility) — Native Anthropic Messages API
- [Ollama Blog: Claude](https://ollama.com/blog/claude) — Anthropic API support announcement
- [vLLM Claude Code Docs](https://docs.vllm.ai/en/latest/serving/integrations/claude_code/) — Direct /v1/messages integration
- [llama.cpp Anthropic API](https://huggingface.co/blog/ggml-org/anthropic-messages-api-in-llamacpp) — POST /v1/messages support
- [RouteLLM](https://github.com/lm-sys/RouteLLM) — Strong/weak model routing with trained classifiers
- [HydraTeams](https://github.com/Pickle-Pixel/HydraTeams) — Model-agnostic Claude Code Agent Teams
- [vllm-mlx](https://github.com/waybarrios/vllm-mlx) — Anthropic-compatible server for Apple Silicon
- [Codiste: LM Studio vs Ollama](https://www.codiste.com/lm-studio-vs-ollama) — Feature comparison
- [Latitude: Dynamic LLM Routing](https://latitude.so/blog/dynamic-llm-routing-tools-and-frameworks) — Routing tools survey

## Raw Links

- https://code.claude.com/docs/en/model-config
- https://support.claude.com/en/articles/11940350-claude-code-model-configuration
- https://www.eesel.ai/blog/model-configuration-claude-code
- https://claudelog.com/faqs/what-is-model-flag-in-claude-code/
- https://shipyard.build/blog/claude-code-cheat-sheet/
- https://platform.claude.com/docs/en/about-claude/models/overview
- https://www.eesel.ai/blog/claude-code-cli-reference
- https://www.eesel.ai/blog/claude-code-model-selection
- https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/configure-claude-code
- https://lmstudio.ai/docs/developer/openai-compat
- https://lmstudio.ai/docs/developer
- https://lmstudio.ai/blog/lmstudio-v0.3.29
- https://lmstudio.ai/docs/developer/core/server
- https://lmstudio.ai/docs/developer/rest
- https://lmstudio.ai/docs/api/openai-api
- https://lmstudio.ai/docs/app/api/endpoints/openai
- https://ai-sdk.dev/providers/openai-compatible-providers/lmstudio
- https://www.clarifai.com/blog/run-lm-studio-models-locally
- https://deepwiki.com/lmstudio-ai/docs/2-api-server
- https://github.com/zed-industries/zed/discussions/37842
- https://code.claude.com/docs/en/llm-gateway
- https://www.getmaxim.ai/articles/running-non-anthropic-models-in-claude-code-via-an-enterprise-ai-gateway/
- https://github.com/anthropics/claude-code/issues/8727
- https://claudelog.com/configuration/
- https://github.com/fuergaosi233/claude-code-proxy
- https://medium.com/@michael.hannecke/connecting-claude-code-to-local-llms-two-practical-approaches-faa07f474b0f
- https://docs.vllm.ai/en/latest/serving/integrations/claude_code/
- https://www.codiste.com/lm-studio-vs-ollama
- https://www.2am.tech/blog/ollama-vs-lm-studio
- https://dev.to/simplr_sh/ollama-vs-lm-studio-your-first-guide-to-running-llms-locally-4ajn
- https://www.openxcell.com/blog/lm-studio-vs-ollama/
- https://www.sitepoint.com/lm-studio-vs-ollama/
- https://www.zealousys.com/blog/lm-studio-vs-ollama/
- https://www.glukhov.org/llm-hosting/comparisons/hosting-llms-ollama-localai-jan-lmstudio-vllm-comparison/
- https://zenvanriel.com/ai-engineer-blog/ollama-vs-lm-studio-comparison/
- https://inero-software.com/deploying-llms-locally-a-guide-to-ollama-and-lm-studio/
- https://blog.promptlayer.com/lm-studio-vs-ollama-choosing-the-right-local-llm-platform/
- https://latitude.so/blog/dynamic-llm-routing-tools-and-frameworks
- https://github.com/lm-sys/RouteLLM
- https://www.patronus.ai/ai-agent-development/ai-agent-routing
- https://github.com/lamini-ai/llm-routing-agent
- https://www.mindstudio.ai/blog/what-is-ai-model-router-optimize-cost-llm-providers
- https://aws.amazon.com/blogs/machine-learning/multi-llm-routing-strategies-for-generative-ai-applications-on-aws/
- https://fme.safe.com/guides/ai-agent-architecture/ai-agent-routing/
- https://github.com/NVIDIA-AI-Blueprints/llm-router
- https://aclanthology.org/2025.acl-long.757.pdf
- https://www.requesty.ai/blog/intelligent-llm-routing-in-enterprise-ai-uptime-cost-efficiency-and-model
- https://ollama.com/blog/claude
- https://docs.ollama.com/api/anthropic-compatibility
- https://medium.com/@markbabcock_79883/run-claude-code-with-open-source-models-via-ollamas-anthropic-api-compatibility-0eeeb3a415f4
- https://github.com/ollama/ollama/issues/13949
- https://www.adwaitx.com/ollama-anthropic-api-claude-code-local/
- https://gist.github.com/AUAggy/ccf6df83c297e76191ff2de8eb6a5168
- https://paddo.dev/blog/claude-code-local-ollama/
- https://www.opsgeek.com/blog/opsgeek-ollama-claude-code
- https://orendra.com/blog/claude-code-for-free-with-ollama-using-anthropic-api-compatibility/
- https://huggingface.co/blog/ggml-org/anthropic-messages-api-in-llamacpp
- https://dev.to/dcruver/running-claude-code-with-local-llms-via-vllm-and-litellm-599b
- https://thushan.github.io/olla/integrations/frontend/claude-code/
- https://github.com/vllm-project/vllm/issues/21313
- https://docs.litellm.ai/docs/tutorials/claude_responses_api
- https://github.com/waybarrios/vllm-mlx
- https://github.com/ggml-org/llama.cpp/pull/17570
- https://github.com/mattlqx/claude-code-ollama-proxy
- https://github.com/nielspeter/claude-code-proxy
- https://ccproxy.orchestre.dev/blog/ollama-claude-code-complete-privacy
- https://github.com/aminhjz/claude-code-ollama-proxy
- https://github.com/mkritter3/ollama-cloud-code
- https://github.com/zimplexing/claude-code-proxy-enhance
- https://github.com/Pickle-Pixel/HydraTeams
- https://ccproxy.orchestre.dev/providers/ollama
- https://github.com/1rgs/claude-code-proxy
- https://lmsys.org/blog/2024-07-01-routellm/
- https://pypi.org/project/routellm/
- https://github.com/lm-sys/RouteLLM/blob/main/examples/routing_to_local_models.md
- https://code.claude.com/docs/en/sub-agents
- https://github.com/VoltAgent/awesome-claude-code-subagents
- https://claudefa.st/blog/guide/agents/sub-agent-best-practices
- https://code.claude.com/docs/en/agent-teams
- https://github.com/Gentleman-Programming/agent-teams-lite
- https://www.anthropic.com/engineering/building-c-compiler
- https://www.datacamp.com/tutorial/using-claude-code-with-ollama-local-models
- https://sonusahani.com/blogs/claude-code-with-ollama-models-without-anthropic-api-key
- https://docs.litellm.ai/
- https://unsloth.ai/docs/basics/claude-code
- https://tammam.io/blog/llama-cpp-setup-with-claude-codex-cli/

## Implications

1. **The proxy era is ending.** Ollama, vLLM, and llama.cpp all speak Anthropic Messages API natively. WavePoint should target Ollama (daemon mode, native Anthropic API) rather than LM Studio for local model execution.
2. **`opusplan` is free routing.** The built-in alias already does high/medium routing. Combined with `CLAUDE_CODE_SUBAGENT_MODEL`, this covers two-tier routing with zero infrastructure.
3. **Three-tier routing needs a thin script, not a framework.** The `model-tier` field maps directly to `claude --model <alias>` + env vars for local backends. A 20-line shell script is the MVP.
4. **HydraTeams is the closest existing solution** for mixed-model Agent Teams.
5. **vllm-mlx is worth investigating** for Apple Silicon local inference (400+ tok/s with Anthropic API compatibility).
6. **Phase 2 effort drops from ~3 to ~1-2 sessions** because Ollama's native Anthropic API eliminates the proxy/translation layer the proposal assumed.

## Open Questions

1. **Tool calling quality on local models:** Claude Code requires strong tool calling. How reliable is tool calling on Qwen3 Coder / Kimi K2 via Ollama's Anthropic API?
2. **Context window limits:** Claude Code recommends minimum 64k tokens for coding. Which local models meet this at acceptable speed on Apple Silicon?
3. **Effort level interaction:** Does `CLAUDE_CODE_EFFORT_LEVEL=low` on Sonnet approximate Haiku-tier speed/cost? Could this be a cheaper two-tier strategy before adding local models?
4. **Agent Teams vs. manual dispatch:** Should Phase 3 (inter-agent coordination) build on Agent Teams rather than custom handoff files?
5. **vllm-mlx performance:** Actual token throughput for 8B-34B models on M-series Macs?
6. **Ollama Anthropic API maturity:** v0.14.0 shipped January 2026. How stable as of March 2026? Tool calling edge cases resolved?
