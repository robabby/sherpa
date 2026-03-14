# Vector 1: AI SDK Capabilities & Provider Coverage

**Question:** What does the Vercel AI SDK actually provide, and which LLM providers does it support? Does it cover all 5 current backends?
**Agent dispatched:** 2026-03-13

## Findings

### Core Primitives

The `ai` package (v6.0.116) provides four core functions:

- **`generateText()`** — Non-streaming text generation. Returns `{ text, toolCalls, toolResults, steps, usage, finishReason }`. Use case: batch processing, agent loops, server-side tasks.
- **`streamText()`** — Streaming text generation. Returns stream object with `textStream`, `fullStream`, and helpers like `toUIMessageStreamResponse()`. Use case: chatbots, real-time UX.
- **`generateObject()`** / **`streamObject()`** — Structured data generation validated against Zod schema. Output modes: `Output.object()`, `Output.array()`, `Output.choice()`, `Output.json()`.

All four take a `model` parameter (any provider's model instance) and can be swapped between providers with zero code changes.

### Tool Calling

Tools defined via `tool()` helper with Zod schemas:

```ts
const weatherTool = tool({
  description: 'Get the weather',
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => ({ temperature: 72 }),
});

const { text, steps } = await generateText({
  model: anthropic('claude-sonnet-4-5'),
  tools: { weather: weatherTool },
  stopWhen: stepCountIs(5),
  prompt: 'What is the weather in SF?',
});
```

SDK validates inputs, auto-feeds tool results back to model in multi-step loops. `steps` array captures full trace.

### Provider Coverage — All 5 Backends Covered

| Our backend | AI SDK provider | Package |
|------------|-----------------|---------|
| Anthropic (Claude) | Official | `@ai-sdk/anthropic` |
| OpenAI (Codex) | Official | `@ai-sdk/openai` |
| Google (Gemini) | Official | `@ai-sdk/google` |
| Minimax (via OpenCode) | Community | `vercel-minimax-ai-provider` |
| LM Studio (local) | Official (compatible) | `@ai-sdk/openai-compatible` |

37+ official providers, 60+ community providers.

### Provider Architecture

**Key finding: AI SDK providers do NOT wrap native SDKs.** They are independent implementations against HTTP APIs, conforming to shared `LanguageModelV3` spec. Dependencies are only `@ai-sdk/provider` and `@ai-sdk/provider-utils`.

**Provider Registry** centralizes all providers:

```ts
const registry = createProviderRegistry({
  anthropic,
  openai: createOpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  google,
  lmstudio: createOpenAICompatible({ name: 'lmstudio', baseURL: 'http://localhost:1234/v1' }),
});

const model = registry.languageModel('anthropic:claude-sonnet-4-5');
```

Directly analogous to our `resolve-route.mjs` routing table.

**Middleware** via `wrapLanguageModel()` supports logging, caching, RAG, guardrails on any model.

### Multi-Step Agents

Built-in agent loop support:
- `stopWhen: stepCountIs(N)` — terminates after N LLM calls
- `onStepFinish` callback — fires after each step
- Automatic loop: model calls tool → SDK executes → result fed back → repeat

### Version and Maturity

- v6.0.116 (5 major versions of iteration)
- Minimal dependencies: `@ai-sdk/gateway`, `@ai-sdk/provider`, `@ai-sdk/provider-utils`, `@opentelemetry/api`
- Peer dep on Zod (^3.25.76 or ^4.1.8)
- Built-in OpenTelemetry integration
- 30+ troubleshooting articles suggest substantial production usage

### AI SDK vs Native SDKs

The AI SDK **replaces** native SDKs, not wraps them. You don't need `@anthropic-ai/sdk` or `openai` alongside the AI SDK providers.

## Sources

- https://ai-sdk.dev/docs/introduction
- https://ai-sdk.dev/docs/ai-sdk-core/generating-text
- https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- https://ai-sdk.dev/docs/foundations/providers-and-models
- https://ai-sdk.dev/providers/community-providers
- https://ai-sdk.dev/providers/community-providers/minimax
- https://ai-sdk.dev/providers/ai-sdk-providers/openai-compatible
- https://ai-sdk.dev/docs/reference/ai-sdk-core/provider-registry
- https://ai-sdk.dev/docs/ai-sdk-core/agents

## Implications

The AI SDK's provider registry + `generateText`/`streamText` maps almost directly onto our shell-based dispatch model. Our `resolve-route.mjs` → backend scripts pipeline could become `registry.languageModel('provider:model')` → `generateText()`. All 5 backends covered. Middleware could replace pre/post processing logic.

What it would NOT replace: the dispatch decision layer (which backend gets which task-type), the Worker/Judge pipeline pattern, or the MCP server itself.

## Open Questions

1. Minimax community provider stability — how actively maintained?
2. LM Studio tool calling reliability — depends on local model, not SDK
3. v6 breaking change velocity — adopting means tracking upstream
4. SDK does not spawn CLI tools — it makes HTTP API calls. Our Codex/Claude backends shell out to CLIs, not APIs
