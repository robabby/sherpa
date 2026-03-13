# Vector 1: The Agent Observability & DevOps Stack

**Question:** What is the emerging observability and DevOps stack for AI agents? How do you monitor, trace, debug, and version agent behavior? What's the "Datadog for agents"?
**Agent dispatched:** 2026-03-12

## Key Discoveries

### 1. The Market Has Exploded — No Single Winner Yet

The "Datadog for agents" question has no single answer because the market is fragmenting across three tiers:

- **Incumbent APM vendors extending into AI** — Datadog (LLM Observability, launched June 2025), Dynatrace (Amazon Bedrock AgentCore integration), New Relic. These bring production-grade infrastructure but bolt-on AI understanding. [Datadog LLM Observability](https://www.datadoghq.com/product/llm-observability/) | [Datadog agentic AI announcement](https://www.datadoghq.com/about/latest-news/press-releases/datadog-expands-llm-observability-with-new-capabilities-to-monitor-agentic-ai-accelerate-development-and-improve-model-performance/)
- **AI-native observability startups** — Langfuse, Braintrust, Arize Phoenix, Helicone, AgentOps, Galileo, Maxim, Portkey. Purpose-built for LLM/agent workflows. Langfuse acquired by ClickHouse (Jan 2026) for undisclosed amount as part of a $400M Series D. [ClickHouse acquires Langfuse](https://clickhouse.com/blog/clickhouse-acquires-langfuse-open-source-llm-observability) | [Braintrust](https://www.braintrust.dev/) | [Arize](https://arize.com/blog/best-ai-observability-tools-for-autonomous-agents-in-2026/)
- **Framework-native tools** — LangSmith (LangChain), W&B Weave (Weights & Biases). Deep integration with their ecosystem, weaker outside it. [LangSmith](https://docs.smith.langchain.com/) | [W&B Weave](https://docs.wandb.ai/weave)

89% of organizations have implemented some form of observability for their agents, and 62% have detailed tracing that allows them to inspect individual agent steps and tool calls. [LangChain State of Agent Engineering](https://www.langchain.com/state-of-agent-engineering)

### 2. OpenTelemetry Is Becoming the Standard Substrate

The OpenTelemetry GenAI SIG (started April 2024) is defining semantic conventions for LLM calls, agent steps, tool invocations, and vector DB queries. These are still in "Development" (experimental) status but gaining rapid adoption:

**Key OTel GenAI attribute names** (all prefixed `gen_ai.`):
- `gen_ai.operation.name` — `chat`, `create_agent`, `invoke_agent`, `execute_tool`, `retrieval`
- `gen_ai.agent.id`, `gen_ai.agent.name`, `gen_ai.agent.version`, `gen_ai.agent.description`
- `gen_ai.conversation.id` — session/thread identifier
- `gen_ai.request.model`, `gen_ai.response.model`
- `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.usage.cache_read.input_tokens`
- `gen_ai.provider.name` — `openai`, `anthropic`, `aws.bedrock`, etc.

Source: [OTel GenAI Agent Spans spec](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/) | [OTel GenAI Spans spec](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/) | [OTel GenAI Metrics](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/)

**Two competing supplementary schemas**:
- **OpenInference** (Arize) — adds span kinds like `AGENT`, `LLM`, `TOOL`, `RETRIEVER`, `EMBEDDING`. More mature, used by Phoenix. [OpenInference spec](https://arize-ai.github.io/openinference/spec/semantic_conventions.html) | [GitHub](https://github.com/Arize-ai/openinference/)
- **OpenLLMetry** (Traceloop) — community-driven OTel extensions with instrumentations for LangChain, OpenAI, Anthropic, etc. Now ships Hub (Rust LLM gateway) and an MCP server that bridges production traces into dev tools. [GitHub](https://github.com/traceloop/openllmetry) | [MCP server](https://github.com/traceloop/opentelemetry-mcp-server)

Datadog, Langfuse, LangSmith all now accept OTel traces natively. [Datadog OTel GenAI support](https://www.datadoghq.com/blog/llm-otel-semantic-convention/) | [Langfuse OTel](https://langfuse.com/integrations/native/opentelemetry) | [LangSmith OTel](https://blog.langchain.com/opentelemetry-langsmith/)

The OTel blog post on AI Agent Observability lists frameworks expected to adopt: IBM Bee AI, IBM wxFlow, CrewAI, AutoGen, Semantic Kernel, LangGraph, PydanticAI. [OTel AI Agent Observability blog](https://opentelemetry.io/blog/2025/ai-agent-observability/)

### 3. Agent Tracing Is Hierarchical: Trace > Session > Step > Tool Call

All platforms converge on a nested span model:

```
Session (conversation_id)
  └─ Agent Invocation (invoke_agent span)
       ├─ LLM Call (chat span) — prompt, response, tokens, latency
       ├─ Tool Call (execute_tool span) — name, args, result
       ├─ LLM Call — reasoning about tool result
       └─ Tool Call — second tool invocation
```

Braintrust auto-captures per trace: duration, LLM duration, time to first token, LLM calls, tool calls, errors (LLM vs tool), prompt tokens, cached tokens, completion tokens, reasoning tokens, estimated cost. No manual instrumentation. [Braintrust observability](https://www.braintrust.dev/articles/best-ai-observability-tools-2026)

AgentOps provides session replay with "time-travel" — visually trace every step with point-in-time precision, rewind and replay to pinpoint root causes. [AgentOps](https://www.agentops.ai/) | [GitHub](https://github.com/AgentOps-AI/agentops)

Datadog's AI Agent Monitoring maps each agent's decision path in an interactive graph — drill into latency spikes, incorrect tool calls, infinite loops. [Datadog agent monitoring](https://www.datadoghq.com/about/latest-news/press-releases/datadog-expands-llm-observability-with-new-capabilities-to-monitor-agentic-ai-accelerate-development-and-improve-model-performance/)

### 4. The Evaluation Stack Is Maturing Into CI/CD

Three tiers of evaluation tooling:

**Tier 1: Framework-level eval libraries**
- **DeepEval** — Pytest-style assertions for LLMs, 50+ metrics (G-Eval, hallucination, answer relevancy), ConversationalTestCase for multi-turn. v3.0 added component-level evaluation via `@observe` decorator. [GitHub](https://github.com/confident-ai/deepeval) | [Docs](https://deepeval.com/docs/evaluation-introduction)
- **Inspect AI** — UK AISI's open-source framework. Used by Anthropic, DeepMind, major safety labs. Sandboxed execution (Docker, K8s). [Inspect AI](https://inspect.aisi.org.uk/) | [GitHub](https://github.com/UKGovernmentBEIS/inspect_ai)
- **Promptfoo** — YAML-based prompt testing with 50+ vulnerability types, OWASP LLM Top 10. **Acquired by OpenAI (March 2026)** to strengthen agentic security testing. [GitHub](https://github.com/promptfoo/promptfoo) | [CI/CD docs](https://www.promptfoo.dev/docs/integrations/ci-cd/)

**Tier 2: Platform-integrated evals**
- **Braintrust** — Production traces convert to test cases with one click. GitHub Actions integration for gating releases on quality regressions. [Braintrust evals](https://www.braintrust.dev/articles/best-ai-evals-tools-cicd-2025)
- **Langfuse** — LLM-as-a-judge evaluations, annotation queues, prompt experiments — all open-sourced under MIT (June 2025). [Langfuse](https://langfuse.com/)
- **Galileo AI** — Luna-2 distilled evaluators at sub-200ms / ~$0.02 per million tokens. 97% lower cost than LLM-as-judge for 100% traffic monitoring. [Galileo](https://galileo.ai/)

**Tier 3: Enterprise/Cloud evals**
- **Amazon Bedrock AgentCore Evaluations** — 13 built-in evaluators (correctness, helpfulness, safety, goal success rate) + custom evaluators. [AgentCore Evaluations](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/evaluations.html)
- **Datadog LLM Experiments** (preview) — test prompt changes, model swaps, app changes against production data. [Datadog experiments](https://www.datadoghq.com/product/llm-observability/)

**Anthropic's guidance**: Start with 20-50 tasks from real failures. Grade outcomes, not paths — agents find valid approaches designers didn't anticipate. Use pass@k (probability of at least one success in k trials) and pass^k (probability of k consecutive successes). Practice eval-driven development: build evals before features. [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

### 5. Cost Attribution Per Agent/Task Is Solved Technically But Messy Operationally

The technical pattern is straightforward: attach metadata tags (user_id, project_id, initiative_slug) to every LLM request. All major platforms support this:

- **Langfuse** attributes costs to individual spans within multi-step workflows. [Langfuse cost tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
- **LiteLLM** tracks spend per key, user, team across 100+ LLMs via its proxy. [LiteLLM](https://docs.litellm.ai/docs/proxy/cost_tracking)
- **Portkey** enforces budgets at org/workspace/app/metadata level with soft (alert) and hard (throttle/block) limits. [Portkey](https://portkey.ai/blog/tracking-llm-token-usage-across-providers-teams-and-workloads/)
- **Traceloop** provides per-user/per-feature cost attribution via tags. [Traceloop cost tracking](https://www.traceloop.com/blog/from-bills-to-budgets-how-to-track-llm-token-usage-and-cost-per-user)

The messy part: correlating API-level costs with business-level concepts (initiatives, tasks, sessions) requires consistent tagging discipline. No platform does this automatically for arbitrary governance structures.

### 6. Agent Versioning Is the Unsolved Problem

Traditional software versioning breaks for agents because behavior depends on four interdependent layers, each needing independent version tracking:

1. **Code** — orchestration logic, tool definitions, control flow
2. **Prompts** — system instructions, behavioral constraints, few-shot examples
3. **Models** — provider, model name, temperature, max_tokens
4. **Context** — RAG embeddings, memory state, tool schemas

An agent version must capture the exact reproducible state of all four layers. If any changes, behavior changes. [Medium: Versioning agents](https://medium.com/@nraman.n6/versioning-rollback-lifecycle-management-of-ai-agents-treating-intelligence-as-deployable-deac757e4dea) | [Auxiliobits](https://www.auxiliobits.com/blog/versioning-and-rollbacks-in-agent-deployments/)

**Emerging rollback patterns**:
- **Immutable agents** — freeze at deployment for auditability. Each deployed agent is a snapshot.
- **Shadow agents** — new version runs in shadow mode alongside production. A/B comparison.
- **Feature flags** — enable/disable prompt versions without redeployment.

[DEV.to: AI Agent Behavior Versioning](https://dev.to/bobur/ai-agents-behavior-versioning-and-evaluation-in-practice-5b6g)

**Sherpa's advantage**: Behavioral agent definitions in `docs/agents/roles/` + initiative proposals in `docs/initiatives/` are already version-controlled in git. Prompts-as-files is the right primitive. What's missing: tagging deployed "configurations" (role + model + tools) as immutable versions.

### 7. "AgentOps" Is Crystallizing as a Discipline

IBM defined AgentOps as the emerging operational discipline for AI agents, building on DevOps (software delivery) and MLOps (ML model lifecycle). It encompasses lifecycle management, observability, governance, and continuous optimization. [IBM: What is AgentOps?](https://www.ibm.com/think/topics/agentops)

IBM describes a shift from SDLC to ADLC (Agent Development Lifecycle) — the build-deploy-monitor loop remains, but what's being built has fundamentally changed. [IBM AgentOps strategy](https://www.efficientlyconnected.com/ibm-advances-agentops-control-strategy-as-genai-moves-toward-production-reality/)

**Galileo Agent Control** (released March 11, 2026) — open-source (Apache 2.0) control plane for governing agents at scale. Write behavioral policies once, enforce across all deployments. Partners: AWS Strands Agents, CrewAI, Glean, Cisco AI Defense. [Galileo announcement](https://galileo.ai/blog/announcing-agent-control) | [The New Stack](https://thenewstack.io/galileo-agent-control-open-source/)

### 8. Academic Research Is Quantifying the Problem

**"Measuring Agents in Production" (MAP, Dec 2024)** — First systematic study: 20 case studies + 306-practitioner survey. Key findings:
- 68% of production agents execute ≤10 steps before human intervention
- 70% rely on off-the-shelf models (no fine-tuning)
- 74% depend primarily on human evaluation
- 75% evaluate without formal benchmarks, using A/B testing instead
- [arxiv.org/abs/2512.04123](https://arxiv.org/abs/2512.04123)

**"Towards a Science of AI Agent Reliability" (Feb 2026)** — Proposes 12 metrics across 4 dimensions:
- **Consistency**: outcome consistency, trajectory consistency (distributional + sequential), resource consistency
- **Robustness**: fault robustness, environment robustness, prompt robustness
- **Predictability**: calibration, discrimination (AUROC), Brier score
- **Safety**: compliance, harm severity
- Key finding: "recent capability gains have only yielded small improvements in reliability" — capability and reliability are independent dimensions
- [arxiv.org/abs/2602.16666](https://arxiv.org/abs/2602.16666) | [Princeton dashboard](https://hal.cs.princeton.edu/reliability)

**"Beyond Black-Box Benchmarking" (KDD 2025)** — Proposes taxonomies for collecting analytics from agent runtime logs. 79% user study agreement that non-deterministic flow is a major challenge. [arxiv.org/abs/2503.06745](https://arxiv.org/abs/2503.06745)

**"Monitoring Monitorability" (Dec 2024)** — Chain-of-thought monitoring is effective for detecting misbehavior. Reasoning model CoT can be monitored as a safety signal. [arxiv.org/abs/2512.18311](https://arxiv.org/abs/2512.18311)

### 9. The Open-Source Stack Is Viable

A complete open-source agent observability stack exists today:

| Layer | Open-Source Tool | License | Notes |
|-------|-----------------|---------|-------|
| **Tracing** | Langfuse | MIT | 20K GitHub stars, 26M+ SDK installs/month. Self-hosted on ClickHouse |
| **OTel Instrumentation** | OpenLLMetry | Apache 2.0 | Python, JS, Go, Ruby. Covers LangChain, OpenAI, Anthropic, etc. |
| **LLM Gateway** | LiteLLM | MIT | Routing, cost tracking, auth across 100+ models |
| **Evaluation** | DeepEval | Apache 2.0 | Pytest-style, 50+ metrics, CI/CD integration |
| **Security Testing** | Promptfoo | MIT | 50+ vulnerability types, OWASP presets (now OpenAI-owned) |
| **Agent Safety Evals** | Inspect AI | MIT | UK AISI's framework, used by major safety labs |
| **Drift Detection** | Evidently AI | Apache 2.0 | 100+ built-in evals, OTel-based tracing via Tracely |
| **Governance** | Galileo Agent Control | Apache 2.0 | Policy-based agent governance, released March 2026 |
| **Trace Analysis** | Arize Phoenix | ELv2 | Built-in hallucination detection, clustering, drift |

Sources: [Langfuse GitHub](https://github.com/langfuse/langfuse) | [OpenLLMetry GitHub](https://github.com/traceloop/openllmetry) | [LiteLLM GitHub](https://github.com/BerriAI/litellm) | [DeepEval GitHub](https://github.com/confident-ai/deepeval) | [Promptfoo GitHub](https://github.com/promptfoo/promptfoo) | [Inspect AI GitHub](https://github.com/UKGovernmentBEIS/inspect_ai) | [Evidently GitHub](https://github.com/evidentlyai/evidently) | [Galileo announcement](https://galileo.ai/blog/announcing-agent-control) | [Phoenix](https://phoenix.arize.com/)

### 10. What You Should Measure: The Emerging Metrics Consensus

From Amazon, Microsoft, Anthropic, and the academic papers, a consensus metric set emerges:

**Operational metrics** (infrastructure-level):
- Latency (time to first token, total response time, per-step latency)
- Token usage (input, output, cached, reasoning)
- Cost per trace/session/agent
- Error rate (LLM errors vs tool errors vs timeout)
- Availability / uptime

**Behavioral metrics** (agent-level):
- Task completion rate (did the agent achieve the goal?)
- Steps to completion (efficiency of reasoning)
- Tool selection accuracy (did it pick the right tools?)
- Revert-to-human rate (how often does it escalate?)
- Loop/retry frequency (is it getting stuck?)
- Post-review edit distance (how much did humans change the output?)

**Quality metrics** (output-level):
- Hallucination rate
- Faithfulness (does reasoning chain match actual decision process?)
- Correctness (grounded in domain-specific truth)
- Helpfulness (subjective, requires LLM-as-judge or human eval)
- Safety compliance (PII exposure, destructive operations, policy violations)

**Business metrics** (impact-level):
- Containment rate (resolved without human intervention)
- Cost per resolution
- Initiative velocity (proposals generated, approved, integrated per period)
- Developer time saved

Sources: [Amazon agent evaluation](https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon/) | [Microsoft agent performance](https://www.microsoft.com/en-us/dynamics-365/blog/it-professional/2026/02/04/ai-agent-performance-measurement/) | [Anthropic eval guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | [arxiv.org/abs/2602.16666](https://arxiv.org/abs/2602.16666)

## Implications for Sherpa

### What Sherpa Already Has That Others Are Building Toward

1. **Behavioral agent definitions as files** — `docs/agents/roles/` with behavioral constraints, not identity claims. This is versioned in git. Industry is discovering they need this (see: agent versioning as the unsolved problem).
2. **Initiative-as-directory governance** — Proposals, activity logs, research artifacts. This IS the audit trail. Most agent frameworks have nothing comparable.
3. **Structured worker output** — The convention of workers producing proposals/summaries (not just running and logging) aligns with Dagster's asset-first philosophy (iteration 1, vector 5).
4. **Session manifests with token counts** — Already have per-session cost data. Just need attribution to initiatives/tasks.

### What Sherpa Needs to Add

1. **OTel-compatible tracing** — The `studio-mcp` server should emit spans following the OTel GenAI semantic conventions. Attribute every LLM call and tool invocation with `gen_ai.agent.name`, `gen_ai.conversation.id`, etc. This makes Sherpa traces consumable by any OTel-compatible backend (Langfuse, Datadog, Jaeger).

2. **Eval pipeline as a first-class concept** — Build eval suites alongside behavioral agent definitions. When a role definition changes, regression evals run automatically. DeepEval's pytest model is the right integration pattern for CI.

3. **Agent configuration snapshots** — When dispatching a worker, capture the exact configuration (role definition hash, model, tools available, prompt template) as an immutable snapshot. This is the "agent version" that enables replay and rollback.

4. **Progressive disclosure for traces** — Iteration 1 established the three-level model (status list > structured summary > raw log). Agent traces add a fourth level: status > summary > trace timeline > raw spans. The trace timeline is the "Temporal-style" view from iteration 1 vector 2, but populated with OTel agent spans.

5. **Cost attribution per initiative** — Tag every API call with `initiative_slug` metadata. Roll up in Studio's existing cost visibility (iteration 1, vector 4: "weather report not bill").

6. **Behavioral regression testing** — When `docs/agents/roles/*.yaml` changes, run the agent against a known test suite to verify behavioral consistency. This is the agent-specific analog of unit testing.

### Studio UI Implications

The observability data feeds directly into Studio's existing design:
- **Morning review** (iteration 1 synthesis): exception-first surface that highlights agent failures, stuck loops, cost anomalies
- **Fleet minimap** (iteration 2): agent status dots backed by real OTel health data, not just presence
- **Process detail pane**: trace timeline as a new tab alongside activity and research
- **Cost section**: per-initiative rollup, anomaly detection, "weather report" framing

## Sources

### Market Landscape & Comparisons
- [LakeFS LLM Observability Comparison 2026](https://lakefs.io/blog/llm-observability-tools/)
- [OnPage Top 12 AI Observability Tools 2026](https://www.onpage.com/top-12-ai-and-llm-observability-tools-in-2026-compared-open-source-and-paid/)
- [TrueFoundry 10 Best AI Observability Platforms 2026](https://www.truefoundry.com/blog/best-ai-observability-platforms-for-llms-in-2026)
- [Confident AI Top 7 LLM Observability Tools 2026](https://www.confident-ai.com/knowledge-base/top-7-llm-observability-tools)
- [Arize Best AI Observability Tools for Agents 2026](https://arize.com/blog/best-ai-observability-tools-for-autonomous-agents-in-2026/)
- [Braintrust AI Observability Buyer's Guide 2026](https://www.braintrust.dev/articles/best-ai-observability-tools-2026)
- [Maxim Top 5 Agent Observability Platforms 2026](https://www.getmaxim.ai/articles/top-5-ai-agent-observability-platforms-in-2026/)
- [AIMultiple 15 Agent Observability Tools 2026](https://research.aimultiple.com/agentic-monitoring/)
- [Softcery 8 AI Observability Platforms Compared](https://softcery.com/lab/top-8-observability-platforms-for-ai-agents-in-2025)
- [Firecrawl Best LLM Observability Tools 2026](https://www.firecrawl.dev/blog/best-llm-observability-tools)
- [Agenta Top LLM Observability Platforms 2025](https://agenta.ai/blog/top-llm-observability-platforms)
- [Getmaxim Top 5 LLM Observability 2025](https://www.getmaxim.ai/articles/top-5-llm-observability-platforms-for-2025-comprehensive-comparison-and-guide/)
- [Comet Best LLM Observability Tools 2025](https://www.comet.com/site/blog/llm-observability-tools/)

### OpenTelemetry & Semantic Conventions
- [OTel GenAI Semantic Conventions Overview](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [OTel GenAI Client Spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/)
- [OTel GenAI Agent Spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/)
- [OTel GenAI Metrics](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/)
- [OTel GenAI Events](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-events/)
- [OTel GenAI Attribute Registry](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/)
- [OTel AI Agent Observability Blog Post](https://opentelemetry.io/blog/2025/ai-agent-observability/)
- [OTel GenAI SIG (Issue #327)](https://github.com/open-telemetry/semantic-conventions/issues/327)
- [OTel Agent Framework Convention (Issue #1530)](https://github.com/open-telemetry/semantic-conventions/issues/1530)
- [OTel Agent Application Convention (Issue #1732)](https://github.com/open-telemetry/semantic-conventions/issues/1732)
- [OpenInference Semantic Conventions](https://arize-ai.github.io/openinference/spec/semantic_conventions.html)
- [OpenInference Tracing Spec](https://arize-ai.github.io/openinference/spec/)
- [OpenInference GitHub](https://github.com/Arize-ai/openinference/)
- [OpenLLMetry GitHub](https://github.com/traceloop/openllmetry)
- [OpenLLMetry JS GitHub](https://github.com/traceloop/openllmetry-js)
- [Traceloop OpenTelemetry MCP Server](https://github.com/traceloop/opentelemetry-mcp-server)
- [Traceloop Hub (Rust LLM Gateway)](https://github.com/traceloop/hub)
- [OTel for GenAI Medium (Horovits)](https://horovits.medium.com/opentelemetry-for-genai-and-the-openllmetry-project-81b9cea6a771)

### Platform-Specific
- [Datadog LLM Observability Product Page](https://www.datadoghq.com/product/llm-observability/)
- [Datadog LLM Observability Docs](https://docs.datadoghq.com/llm_observability/)
- [Datadog OTel GenAI Support](https://www.datadoghq.com/blog/llm-otel-semantic-convention/)
- [Datadog OpenAI Agent Monitoring](https://www.datadoghq.com/blog/openai-agents-llm-observability/)
- [Datadog Google ADK Integration (Feb 2026)](https://www.infoq.com/news/2026/02/datadog-google-llm-observability/)
- [Datadog Dashboard Agent Blog](https://www.datadoghq.com/blog/llm-observability-at-datadog-dashboards/)
- [Langfuse Platform](https://langfuse.com/)
- [Langfuse GitHub](https://github.com/langfuse/langfuse)
- [Langfuse Joining ClickHouse Blog](https://langfuse.com/blog/joining-clickhouse)
- [Langfuse Observability Overview](https://langfuse.com/docs/observability/overview)
- [Langfuse Cost Tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
- [Langfuse OTel Integration](https://langfuse.com/integrations/native/opentelemetry)
- [Langfuse LiteLLM Integration](https://langfuse.com/integrations/gateways/litellm)
- [LangSmith Docs](https://docs.smith.langchain.com/)
- [LangSmith OTel Support](https://blog.langchain.com/opentelemetry-langsmith/)
- [LangChain Agent Observability Blog](https://blog.langchain.com/agent-observability-powers-agent-evaluation/)
- [LangChain Agent Framework and Observability Blog](https://blog.langchain.com/on-agent-frameworks-and-agent-observability/)
- [LangChain State of Agent Engineering](https://www.langchain.com/state-of-agent-engineering)
- [Braintrust Platform](https://www.braintrust.dev/)
- [Braintrust Best AI Eval Tools for CI/CD](https://www.braintrust.dev/articles/best-ai-evals-tools-cicd-2025)
- [Braintrust Best AI Evaluation Tools 2026](https://www.braintrust.dev/articles/best-ai-evaluation-tools-2026)
- [Braintrust Best LLM Monitoring Tools 2026](https://www.braintrust.dev/articles/best-llm-monitoring-tools-2026)
- [Arize AX](https://arize.com/ax/)
- [Arize Phoenix](https://phoenix.arize.com/)
- [Arize OpenInference Conventions](https://arize.com/docs/ax/observe/tracing-concepts/openinference-semantic-conventions)
- [Arize Tracing Span Types](https://arize.com/docs/ax/observe/tracing/how-to-tracing-manual/instrumenting-span-types)
- [Arize OTel for LLM Observability](https://arize.com/blog/the-role-of-opentelemetry-in-llm-observability/)
- [W&B Weave Docs](https://docs.wandb.ai/weave)
- [W&B Weave GitHub](https://github.com/wandb/weave)
- [W&B Weave + Bedrock AgentCore](https://aws.amazon.com/blogs/machine-learning/accelerate-enterprise-ai-development-using-weights-biases-weave-and-amazon-bedrock-agentcore/)
- [W&B Traces](https://wandb.ai/site/traces/)
- [AgentOps Platform](https://www.agentops.ai/)
- [AgentOps GitHub](https://github.com/AgentOps-AI/agentops)
- [AgentOps IBM Definition](https://www.ibm.com/think/topics/agentops)
- [Galileo AI Platform](https://galileo.ai/)
- [Galileo Agent Control Announcement](https://galileo.ai/blog/announcing-agent-control)
- [Galileo Agent Control (The New Stack)](https://thenewstack.io/galileo-agent-control-open-source/)
- [Galileo Agent Control (GlobeNewsWire)](https://www.globenewswire.com/news-release/2026/03/11/3253962/0/en/Galileo-Releases-Open-Source-AI-Agent-Control-Plane-to-Help-Enterprises-Govern-Agents-at-Scale.html)
- [Galileo Agent Evaluation Framework](https://galileo.ai/blog/agent-evaluation-framework-metrics-rubrics-benchmarks)
- [Helicone](https://www.helicone.ai/)
- [Portkey Platform](https://portkey.ai/)
- [Portkey AI Gateway](https://portkey.ai/features/ai-gateway)
- [Portkey Guardrails](https://portkey.ai/features/guardrails)
- [Portkey GitHub Gateway](https://github.com/Portkey-AI/gateway)
- [Portkey LLM Observability Guide](https://portkey.ai/blog/the-complete-guide-to-llm-observability/)
- [Portkey Token Usage Tracking](https://portkey.ai/blog/tracking-llm-token-usage-across-providers-teams-and-workloads/)
- [Maxim AI Platform](https://www.getmaxim.ai/)
- [Fiddler AI Platform](https://www.fiddler.ai/)
- [Fiddler AI Observability](https://www.fiddler.ai/ai-observability)
- [Fiddler ML Monitoring](https://www.fiddler.ai/ml-model-monitoring)
- [LiteLLM Docs](https://docs.litellm.ai/)
- [LiteLLM GitHub](https://github.com/BerriAI/litellm)
- [LiteLLM Cost Tracking](https://docs.litellm.ai/docs/proxy/cost_tracking)
- [LiteLLM OTel Integration](https://docs.litellm.ai/docs/observability/opentelemetry_integration)
- [Evidently AI Platform](https://www.evidentlyai.com/)
- [Evidently GitHub](https://github.com/evidentlyai/evidently)
- [Evidently LLM Testing CI/CD](https://www.evidentlyai.com/blog/llm-unit-testing-ci-cd-github-actions)
- [Evidently LLM Tracing (v0.7.17)](https://www.evidentlyai.com/blog/open-source-llm-tracing)
- [Traceloop Platform](https://www.traceloop.com/)
- [Traceloop Cost Tracking Blog](https://www.traceloop.com/blog/from-bills-to-budgets-how-to-track-llm-token-usage-and-cost-per-user)
- [Traceloop Prompt Regression Testing](https://www.traceloop.com/blog/automated-prompt-regression-testing-with-llm-as-a-judge-and-ci-cd)

### Evaluation & Testing
- [DeepEval Platform](https://deepeval.com/)
- [DeepEval GitHub](https://github.com/confident-ai/deepeval)
- [DeepEval CI/CD Docs](https://deepeval.com/docs/evaluation-unit-testing-in-ci-cd)
- [DeepEval Intro](https://deepeval.com/docs/evaluation-introduction)
- [DeepEval DataCamp Tutorial](https://www.datacamp.com/tutorial/deepeval)
- [Inspect AI](https://inspect.aisi.org.uk/)
- [Inspect AI GitHub](https://github.com/UKGovernmentBEIS/inspect_ai)
- [Inspect Evals Repository](https://github.com/UKGovernmentBEIS/inspect_evals)
- [Inspect Evals (AISI announcement)](https://www.aisi.gov.uk/blog/inspect-evals)
- [Promptfoo Platform](https://www.promptfoo.dev/)
- [Promptfoo GitHub](https://github.com/promptfoo/promptfoo)
- [Promptfoo CI/CD Integration](https://www.promptfoo.dev/docs/integrations/ci-cd/)
- [Promptfoo Red Team Guide](https://www.promptfoo.dev/docs/red-team/)
- [Promptfoo GitHub Action](https://github.com/promptfoo/promptfoo-action)
- [Anthropic: Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Harbor (containerized eval infrastructure)](https://harborframework.com/)

### Benchmarks & Leaderboards
- [SWE-bench](https://www.swebench.com/)
- [SWE-bench GitHub](https://github.com/SWE-bench/SWE-bench)
- [SWE-bench Verified (Epoch AI)](https://epoch.ai/benchmarks/swe-bench-verified)
- [SWE-bench Pro (Scale Labs)](https://labs.scale.com/leaderboard/swe_bench_pro_public)
- [Terminal-Bench](https://www.tbench.ai/)
- [tau2-Bench GitHub](https://github.com/sierra-research/tau2-bench)
- [WebArena Paper](https://arxiv.org/abs/2307.13854)
- [OSWorld](https://os-world.github.io/)
- [BrowseComp Paper](https://arxiv.org/abs/2504.12516)
- [LMSYS Chatbot Arena Review](https://skywork.ai/blog/chatbot-arena-lmsys-review-2025/)
- [LLM Leaderboard 2026](https://llm-stats.com/leaderboards/llm-leaderboard)
- [O-Mega Top 50 AI Benchmarks](https://o-mega.ai/articles/top-50-ai-model-evals-full-list-of-benchmarks-october-2025)

### Academic Papers
- [Measuring Agents in Production (MAP) — arxiv 2512.04123](https://arxiv.org/abs/2512.04123)
- [Towards a Science of AI Agent Reliability — arxiv 2602.16666](https://arxiv.org/abs/2602.16666)
- [Beyond Black-Box Benchmarking — arxiv 2503.06745](https://arxiv.org/abs/2503.06745)
- [Monitoring Monitorability — arxiv 2512.18311](https://arxiv.org/abs/2512.18311)
- [Beyond Accuracy: Multi-Dimensional Framework — arxiv 2511.14136](https://arxiv.org/abs/2511.14136)
- [AI-NativeBench: White-Box Agentic Benchmark — arxiv 2601.09393](https://arxiv.org/abs/2601.09393)
- [Evaluation and Benchmarking of LLM Agents Survey — arxiv 2507.21504](https://arxiv.org/html/2507.21504v1)
- [LLM-based Agents for Automated Bug Fixing — arxiv 2411.10213](https://arxiv.org/html/2411.10213v2)
- [AI Agent Systems: Architectures, Applications, and Evaluation — arxiv 2601.01743](https://arxiv.org/html/2601.01743v1)
- [Assessment Framework for Agentic AI Systems — arxiv 2512.12791](https://arxiv.org/html/2512.12791v2)
- [Survey on Evaluation of LLM-based Agents — arxiv 2503.16416](https://arxiv.org/html/2503.16416v1)
- [LLM-Agent-Survey (CoLing 2025)](https://github.com/xinzhel/LLM-Agent-Survey)
- [Awesome Agent Papers](https://github.com/luo-junyu/Awesome-Agent-Papers)
- [LMR-BENCH (ACL/EMNLP 2025)](https://aclanthology.org/2025.emnlp-main.314.pdf)

### Enterprise & Cloud Providers
- [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/)
- [Amazon Bedrock AgentCore Evaluations](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/evaluations.html)
- [Amazon Bedrock AgentCore Observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html)
- [Amazon Bedrock AgentCore CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AgentCore-Agents.html)
- [AWS Agent Evaluation Blog](https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon/)
- [AWS DevOps Agent Blog](https://aws.amazon.com/blogs/devops/from-ai-agent-prototype-to-product-lessons-from-building-aws-devops-agent/)
- [Dynatrace + Bedrock AgentCore](https://www.dynatrace.com/news/blog/announcing-amazon-bedrock-agentcore-agent-observability/)
- [Microsoft AI Agent Performance Measurement](https://www.microsoft.com/en-us/dynamics-365/blog/it-professional/2026/02/04/ai-agent-performance-measurement/)
- [Microsoft Sales Bench](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/sales-agent-in-microsoft-365-copilot-evaluation-results-%E2%80%93-technical-report/4476867)
- [GitHub Enterprise AI Control Plane (Feb 2026)](https://github.blog/changelog/2026-02-26-enterprise-ai-controls-agent-control-plane-now-generally-available/)
- [IBM AgentOps Definition](https://www.ibm.com/think/topics/agentops)
- [IBM AgentOps Strategy](https://www.efficientlyconnected.com/ibm-advances-agentops-control-strategy-as-genai-moves-toward-production-reality/)
- [Xenonstack AgentOps](https://www.xenonstack.com/blog/agentops-ai)
- [Infosys AgentOps Report](https://www.infosys.com/iki/research/agentops-agentic-lifecycle-management.html)

### Agent Versioning & Lifecycle
- [Versioning, Rollback & Lifecycle Management of AI Agents (Medium)](https://medium.com/@nraman.n6/versioning-rollback-lifecycle-management-of-ai-agents-treating-intelligence-as-deployable-deac757e4dea)
- [Versioning & Rollbacks in Agent Deployments (Auxiliobits)](https://www.auxiliobits.com/blog/versioning-and-rollbacks-in-agent-deployments/)
- [Why Prompt Version Control Matters (Kore.ai)](https://www.kore.ai/blog/why-prompt-version-control-matters-in-agent-development)
- [Why Versioning AI Agents Is the CIO's Next Big Challenge (CIO)](https://www.cio.com/article/4056453/why-versioning-ai-agents-is-the-cios-next-big-challenge.html)
- [AI Agent Behavior Versioning in Practice (DEV.to)](https://dev.to/bobur/ai-agents-behavior-versioning-and-evaluation-in-practice-5b6g)
- [Building an Agentic AI App with Versioning (Medium)](https://medium.com/@dharamai2024/building-an-agentic-ai-app-with-proper-versioning-code-prompts-rag-agents-environments-4a74d8a960f3)
- [Prompt Versioning Best Practices (Maxim)](https://www.getmaxim.ai/articles/prompt-versioning-best-practices-for-ai-engineering-teams/)

### AG-UI Protocol
- [AG-UI Events Spec](https://docs.ag-ui.com/concepts/events)
- [AG-UI GitHub](https://github.com/ag-ui-protocol/ag-ui)
- [AG-UI Overview (DataCamp)](https://www.datacamp.com/tutorial/ag-ui)
- [AG-UI Explainer (Codecademy)](https://www.codecademy.com/article/ag-ui-agent-user-interaction-protocol)
- [AG-UI Mindflow Explainer](https://mindflow.io/blog/what-is-ag-ui)
- [AG-UI Microsoft Integration](https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/)
- [AG-UI Oracle Integration](https://blogs.oracle.com/ai-and-datascience/announcing-ag-ui-integration-for-agent-spec)
- [AG-UI PydanticAI Integration](https://ai.pydantic.dev/ui/ag-ui/)

### Monitoring & Production Guides
- [TrueFoundry Agent Observability](https://www.truefoundry.com/blog/ai-agent-observability-tools)
- [Maxim Agent Tracing for Multi-Agent Debugging](https://www.getmaxim.ai/articles/agent-tracing-for-debugging-multi-agent-ai-systems/)
- [Maxim Complete Guide to AI Agent Monitoring](https://www.getmaxim.ai/articles/the-complete-guide-to-ai-agent-monitoring-2025/)
- [UptimeRobot AI Agent Monitoring Best Practices](https://uptimerobot.com/knowledge-hub/monitoring/ai-agent-monitoring-best-practices-tools-and-metrics/)
- [Masterofcode AI Evaluation Metrics 2026](https://masterofcode.com/blog/ai-agent-evaluation)
- [Tray.ai How to Measure Agent Performance](https://tray.ai/resources/blog/measure-ai-agent-performance)
- [VictoriaMetrics AI Agent Observability with OTel](https://victoriametrics.com/blog/ai-agents-observability/)
- [HuggingFace Observability and Interpretability in Agentic AI](https://huggingface.co/blog/royswastik/evaluating-agentic-ai-systems-part-3-observability)
- [HuggingFace Agents Course: Observability Bonus Unit](https://huggingface.co/learn/agents-course/en/bonus-unit2/what-is-agent-observability-and-evaluation)
- [SitePoint Testing AI Agents](https://www.sitepoint.com/testing-ai-agents-deterministic-evaluation-in-a-non-deterministic-world/)
- [ZenML Best LLM Evaluation Tools](https://www.zenml.io/blog/best-llm-evaluation-tools)

### Cost & Budget Management
- [Traceloop Cost Tracking Blog](https://www.traceloop.com/blog/from-bills-to-budgets-how-to-track-llm-token-usage-and-cost-per-user)
- [Langfuse Cost Tracking Docs](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
- [DEV.to Best Tools for Monitoring LLM Costs](https://dev.to/kuldeep_paul/the-best-tools-for-monitoring-llm-costs-and-usage-in-2025-5f3a)
- [Maxim Top 5 LLM Cost Monitoring Tools](https://www.getmaxim.ai/articles/top-5-tools-for-llm-cost-and-usage-monitoring/)
- [TrueFoundry LLM Cost Tracking](https://www.truefoundry.com/blog/llm-cost-tracking-solution)
- [Portkey Token Usage Tracking](https://portkey.ai/blog/tracking-llm-token-usage-across-providers-teams-and-workloads/)
- [Datadog OpenAI Cost Monitoring](https://www.datadoghq.com/blog/monitor-openai-cost-datadog-cloud-cost-management-llm-observability/)
- [Pluralsight Cut LLM Costs](https://www.pluralsight.com/resources/blog/ai-and-data/how-cut-llm-costs-with-metering)

## Open Questions

1. **Should Sherpa adopt OTel natively or wrap it?** The OTel GenAI agent conventions are still in "Development" status. Sherpa could emit raw OTel spans from studio-mcp (requires the OTel SDK dependency) or emit a simpler custom format that a collector translates to OTel. The former is more standard; the latter avoids coupling to an unstable spec.

2. **Where does eval data live?** DeepEval stores results in `.deepeval/`. Inspect AI uses its own log format. Should Sherpa eval results live in the initiative directory (`docs/initiatives/<slug>/evals/`) or in a separate `evals/` top-level directory? The initiative convention suggests the former.

3. **How do you version a behavioral agent configuration?** A role YAML + model choice + tool set + prompt templates = one "agent version." Git commits handle file versioning. But how do you name and reference a specific combination? Content-addressed hashing (like Nix)? Tagged releases?

4. **What's the trace retention policy?** Production traces can be massive (especially for long-running agent sessions with 200+ steps). What's the right balance between full trace retention and summarized data? How long do raw traces need to be available for replay?

5. **How does cost attribution work for multi-agent workflows?** When a planner dispatches multiple workers, each making API calls, how do you attribute costs back to the originating initiative? The tagging approach works for single-agent but gets complex with delegation chains.

6. **Should Studio render traces or delegate to external tools?** Studio could build a trace viewer (like Temporal's or Langfuse's) or could link out to an external OTel backend. Building it provides tighter integration with the governance model; linking out avoids rebuilding complex visualization.
