# Iteration 1 — 2026-03-06

## Research Vectors

### Vector 1: Model Routing Landscape
**Question:** How do Claude Code's `--model` flag, LM Studio, Ollama, and other local inference servers work? What's the minimum viable routing from model-tier annotations to actual dispatch?
**Full report:** [iteration-1/vector-1-model-routing-landscape.md](iteration-1/vector-1-model-routing-landscape.md)

**Key discoveries:**
- Claude Code's `opusplan` alias already routes Opus for planning and Sonnet for execution — free two-tier routing with zero infrastructure ([Claude Code docs](https://code.claude.com/docs/en/model-config))
- `CLAUDE_CODE_SUBAGENT_MODEL` env var controls subagent model selection, enabling Opus lead + Sonnet subagents ([Sub-agents docs](https://code.claude.com/docs/en/sub-agents))
- Ollama v0.14.0+ speaks Anthropic Messages API natively — set `ANTHROPIC_BASE_URL=http://localhost:11434` and `ANTHROPIC_AUTH_TOKEN=ollama`. No proxy needed. ([Ollama blog](https://ollama.com/blog/claude))
- vLLM and llama.cpp also added native Anthropic Messages API support in early 2026, eliminating the translation proxy era
- Ollama is the stronger local inference candidate over LM Studio: daemon mode, Docker support, native Anthropic API, headless operation
- Three-tier routing (high/medium/low) needs only a ~20-line shell script reading role YAML and setting env vars — not a framework
- HydraTeams enables mixed-model Agent Teams (lead on Opus, teammates on local models) ([GitHub](https://github.com/Pickle-Pixel/HydraTeams))

**Implications:**
- Phase 1 (model routing) drops from ~2 sessions to ~1 session — `opusplan` + env vars cover the common case
- Phase 2 (local model integration) drops from ~3 to ~1-2 sessions — Ollama's native API eliminates the proxy layer the proposal assumed

### Vector 2: Inter-Agent Communication Protocols
**Question:** What are the practical options for inter-agent communication in a solo-founder AI agent fleet?
**Full report:** [iteration-1/vector-2-inter-agent-communication.md](iteration-1/vector-2-inter-agent-communication.md)

**Key discoveries:**
- A2A adoption stalled outside Google's ecosystem. Over-engineered for basic needs. The useful idea (Agent Cards) can be borrowed without the protocol. ([fka.dev analysis](https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/))
- Industry consensus: MCP = agent-to-tool, A2A = agent-to-agent. They're complementary, not competing. ([A2A official](https://a2a-protocol.org/latest/topics/a2a-and-mcp/))
- Five primitives every agent swarm rediscovers: isolation, hierarchical decomposition, coordination via Git, ephemeral state, eventual consistency ([Lavaee](https://alexlavaee.me/blog/five-primitives-agent-swarms/))
- Google Research (180 configs): centralized coordination improves parallelizable task performance by 80.9%, but degrades sequential-dependency tasks by 39-70%. Filesystem coordination is stable up to dozens of agents. ([arXiv](https://arxiv.org/abs/2512.08296))
- WavePoint's worktree + proposal convention independently converged on the same design as Cursor, Anthropic, incident.io, and DoltHub

**Implications:**
- Don't adopt A2A or repurpose MCP for agent coordination — the current filesystem approach is the right one for 3-5 agents
- Three incremental additions close the remaining gaps: session heartbeats, a lightweight task board, and explicit completion signals
- Re-evaluate at 10+ concurrent agents

### Vector 3: Execution Monitoring Data Model
**Question:** What structured data would Studio need to show agent session status, and how would that data be produced?
**Full report:** [iteration-1/vector-3-execution-monitoring.md](iteration-1/vector-3-execution-monitoring.md)

**Key discoveries:**
- **Claude Code already produces complete session data.** JSONL transcripts at `~/.claude/projects/<path>/sessions/<uuid>.jsonl` contain: timestamps, model, branch, token usage, tool calls, files modified, subagent metadata ([Session format analysis](https://databunny.medium.com/inside-claude-code-the-session-file-format-and-how-to-inspect-it-b9998e66d56b))
- `SessionStart` and `SessionEnd` hooks provide lifecycle events with session ID, model, transcript path, and cwd ([Claude Code Hooks](https://code.claude.com/docs/en/hooks))
- ccusage (`npx ccusage session --json`) provides structured session data immediately — zero new code needed ([ccusage](https://ccusage.com/))
- amux's three-state model (working/needs-input/idle) is the right granularity for session status. For WavePoint: active/completed/stale.
- agent-of-empires combines tmux session management with git worktrees — directly mirrors Sherpa's model ([GitHub](https://github.com/njbrake/agent-of-empires))
- OpenTelemetry GenAI Semantic Conventions are emerging but still "Development" status — premature to adopt

**Implications:**
- Session manifests written by a `SessionEnd` hook are the bridge between studio-state-machine (velocity signals) and agent-infrastructure (execution monitoring)
- A ~50-line hook script can parse the JSONL, extract session data, and write a manifest to a known location
- This is the only new infrastructure needed — everything else is reading what already exists

### Vector 4: Local OSS Model Evaluation
**Question:** Which open-source models are viable for low/medium tier agent tasks on Apple Silicon?
**Full report:** [iteration-1/vector-4-local-oss-model-evaluation.md](iteration-1/vector-4-local-oss-model-evaluation.md)

**Key discoveries:**
- **Qwen2.5-Coder-7B** is the top pick for low-tier code tasks: 88.4% HumanEval at 7B params, 128K context, Q8_0 fits in ~8GB ([Qwen blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/))
- MoE models change the equation: **Qwen3-Coder-30B** activates only 3.3B of 30B params, giving near-14B quality at ~19GB Q4_K_M ([GitHub](https://github.com/QwenLM/Qwen3-Coder))
- Quantization preserves code quality: Q4_K_M, Q5_K_M, and Q8_0 all achieve identical 51.8% Pass@1 on HumanEval ([Ionio](https://www.ionio.ai/blog/llm-quantize-analysis))
- **Constrained decoding is mandatory** for structured output. Unconstrained models achieve only ~66% on structured output benchmarks. LM Studio's grammar-based JSON schema enforcement guarantees valid output. ([arXiv](https://arxiv.org/html/2505.20139v1))
- 32GB Apple Silicon is the minimum viable spec. Context budget: WavePoint role packages (5K-30K tokens) + Qwen2.5-Coder-7B Q8_0 uses ~14-18GB of 32GB — comfortable headroom.
- Low-tier realistic tasks: markdown formatting, doc summarization, structured extraction, boilerplate code, test stubs, YAML/JSON generation
- NOT realistic locally: multi-file architecture, complex reasoning, /rr research, initiative planning, nuanced voice authoring

**Implications:**
- Phase 2 is technically feasible on M1 Pro 32GB+
- Start with Qwen2.5-Coder-7B for code tasks and Gemma 3-12B for summarization/formatting
- Always use constrained decoding for structured output — never trust raw local model JSON/YAML

## Synthesis

Four cross-cutting patterns emerged from this research:

### 1. The Infrastructure Is Already Built

The most surprising finding across all vectors: **most of what the proposal assumes needs building already exists.** Claude Code has model routing (`--model`, `opusplan`, `CLAUDE_CODE_SUBAGENT_MODEL`). Ollama speaks Anthropic API natively. Claude Code writes complete session transcripts. The hooks system provides lifecycle events. The filesystem convention handles coordination. The proposal's ~10-12 session estimate can likely be compressed to 5-7 sessions because so much infrastructure is provided by the tools themselves.

### 2. Filesystem Coordination Is the Convergent Design

Every team building parallel coding agents — Cursor, Anthropic, incident.io, DoltHub, 1Password — independently converged on the same pattern: git worktree isolation + filesystem-based state + human-as-coordinator. WavePoint's existing system (worktrees + proposals + workstream logs) is this pattern. The research validates it as optimal for 3-5 concurrent agents. A2A and MCP solve different problems (multi-org interop and tool access, respectively).

### 3. The Session Manifest Is the Key New Primitive

The gap between "agents run in terminals" and "Studio shows what agents are doing" is exactly one structured artifact: the **session manifest**. A `SessionEnd` hook writes it by parsing Claude Code's own JSONL transcripts. Studio reads it like any other filesystem artifact. This single new primitive connects three initiatives:
- **studio-state-machine**: velocity signals enriched with token costs, model used, session duration
- **agentic-workforce**: role exercised, context packages consumed
- **agent-infrastructure**: execution monitoring, session status

### 4. Local Models Are Viable but Narrow

The model evaluation confirms that local OSS models on 32GB Apple Silicon can handle specific low-tier tasks (formatting, summarization, boilerplate code, structured extraction) but should not attempt the reasoning-heavy work that makes up most WavePoint agent sessions. The practical implication: local models are a cost optimization for known-simple tasks, not a replacement for Claude on anything requiring judgment. Constrained decoding is mandatory for structured output — the quality gap between local and API models is largest on format compliance.

### The Single Most Important Insight

**The proposal overestimates infrastructure needs and underestimates what's already available.** The three-tier routing system (high/medium/low → Opus/Sonnet/local) can be implemented with environment variables and a thin shell script. The inter-agent coordination system can be improved with three filesystem conventions (heartbeats, task board, completion signals) rather than protocol adoption. Execution monitoring needs one hook script writing session manifests. The hardest remaining problem isn't infrastructure — it's **validating local model output quality** for specific task categories, which is empirical work, not engineering work.

## All Sources

### Model Routing & Configuration
- [Claude Code Model Configuration](https://code.claude.com/docs/en/model-config) — Model aliases, env vars, priority order
- [Claude Code LLM Gateway](https://code.claude.com/docs/en/llm-gateway) — ANTHROPIC_BASE_URL, LiteLLM integration
- [Claude Code Sub-agents](https://code.claude.com/docs/en/sub-agents) — CLAUDE_CODE_SUBAGENT_MODEL
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams) — Built-in multi-agent orchestration
- [Ollama Anthropic Compatibility](https://docs.ollama.com/api/anthropic-compatibility) — Native Anthropic Messages API
- [Ollama Blog: Claude](https://ollama.com/blog/claude) — Anthropic API support announcement
- [vLLM Claude Code Integration](https://docs.vllm.ai/en/latest/serving/integrations/claude_code/) — Direct /v1/messages
- [llama.cpp Anthropic API](https://huggingface.co/blog/ggml-org/anthropic-messages-api-in-llamacpp) — POST /v1/messages support
- [LM Studio OpenAI Compat](https://lmstudio.ai/docs/developer/openai-compat) — API endpoint documentation
- [RouteLLM](https://github.com/lm-sys/RouteLLM) — Strong/weak model routing with trained classifiers
- [HydraTeams](https://github.com/Pickle-Pixel/HydraTeams) — Model-agnostic Claude Code Agent Teams
- [vllm-mlx](https://github.com/waybarrios/vllm-mlx) — Anthropic-compatible server for Apple Silicon

### Inter-Agent Communication
- [Google A2A Announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) — Protocol launch
- [fka.dev - What happened to A2A](https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/) — Adoption stall analysis
- [A2A and MCP Relationship](https://a2a-protocol.org/latest/topics/a2a-and-mcp/) — Complementary, not competing
- [Alex Lavaee - Five Primitives](https://alexlavaee.me/blog/five-primitives-agent-swarms/) — Convergent swarm design
- [1Password - Filesystems for Swarms](https://1password.com/blog/filesystems-for-agent-swarms) — Filesystem coordination analysis
- [Google Research - Scaling Agents](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/) — 180-config study
- [incident.io - Worktree Multi-Agent](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees) — Production case study
- [agents.md Standard](https://agents.md/) — Per-project agent instructions

### Execution Monitoring
- [Claude Code Session Format](https://databunny.medium.com/inside-claude-code-the-session-file-format-and-how-to-inspect-it-b9998e66d56b) — JSONL schema
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks) — SessionStart/SessionEnd lifecycle events
- [ccusage](https://ccusage.com/) — Token/cost analysis CLI
- [agent-of-empires](https://github.com/njbrake/agent-of-empires) — tmux + git worktrees session manager
- [amux](https://amux.io/) — Parallel agent management with live status
- [OTel GenAI Agent Spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/) — Industry standard (premature)

### Local Model Evaluation
- [Qwen2.5-Coder Family](https://qwenlm.github.io/blog/qwen2.5-coder-family/) — 88.4% HumanEval at 7B
- [Qwen3-Coder](https://github.com/QwenLM/Qwen3-Coder) — MoE 30B with 3.3B active
- [LLM Quantize Analysis](https://www.ionio.ai/blog/llm-quantize-analysis) — Quantization quality benchmarks
- [StructEval](https://arxiv.org/html/2505.20139v1) — Structured output benchmark (~66% unconstrained)
- [LM Studio Structured Output](https://lmstudio.ai/docs/developer/openai-compat/structured-output) — Constrained decoding
- [Gemma 3 Overview](https://ai.google.dev/gemma/docs/core) — 4B-27B models with function calling
- [Apple Silicon LLM Performance](https://medium.com/@andreask_75652/thoughts-on-apple-silicon-performance-for-local-llms-3ef0a50e08bd) — Memory bandwidth bottleneck

## Proposals Generated

Updated `docs/initiatives/agent-infrastructure/proposal.md` review notes with research findings. Key revisions to the proposal's assumptions:
- Phase 1-2 effort should decrease given existing infrastructure (Ollama native API, `opusplan`, env var routing)
- Phase 3 should evaluate Claude Code Agent Teams as an alternative to custom handoff files
- Session manifest (via hooks) should be added as a Phase 0 or early Phase 1 deliverable

## Open Questions for Next Iteration

1. **Tool calling reliability on local models via Ollama's Anthropic API** — Claude Code requires robust tool calling. How stable is this on Qwen2.5-Coder-7B and Qwen3-Coder-30B as of March 2026? This is the validation gate for Phase 2.

2. **Session manifest schema design** — What fields does the manifest need? Where should it live (committed vs. local)? How does the `SessionEnd` hook parse the JSONL reliably? This is the concrete engineering question for the next iteration.

3. **Claude Code Agent Teams vs. custom coordination** — Agent Teams is experimental but rapidly maturing. Should Phase 3 build on it instead of custom handoff files? What are the current limitations in practice?

4. **Quality gates for local model output** — What's the minimum viable quality validation for local model outputs? Automated checks (JSON schema validation, lint, test pass) vs. human review? This determines whether low-tier routing can be automated or must stay advisory.

5. **Effort level as a routing lever** — Does `CLAUDE_CODE_EFFORT_LEVEL=low` on Sonnet provide a cheaper alternative to local models for medium-tier tasks? This could simplify the routing model from three tiers to two (Opus/Sonnet-low) before adding local model complexity.
