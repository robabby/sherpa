# Iteration 1 — 2026-03-13

## Findings

### Vector 1: AI SDK Capabilities & Provider Coverage
**Question:** What does the AI SDK provide and does it cover our 5 backends?
**Full report:** [iteration-1/vector-1-capabilities-and-providers.md](iteration-1/vector-1-capabilities-and-providers.md)

- All 5 backends covered: `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`, `vercel-minimax-ai-provider`, `@ai-sdk/openai-compatible` (LM Studio)
- `createProviderRegistry()` maps almost 1:1 to our `resolve-route.mjs` routing table — resolve models by string ID like `'anthropic:claude-sonnet-4-5'`
- Providers are independent HTTP implementations, not wrappers around native SDKs — lightweight, no redundant dependencies
- v6.0.116, mature (5 major versions), built-in OpenTelemetry, Zod-validated tool calling

**Implications:** Provider routing layer is a direct replacement for `resolve-route.mjs` + backend scripts, but only for API-level calls — not CLI subprocess spawning.

### Vector 2: MCP Client Integration
**Question:** Can an AI SDK agent connect to our MCP server and call its tools?
**Full report:** [iteration-1/vector-2-mcp-client-integration.md](iteration-1/vector-2-mcp-client-integration.md)

- `@ai-sdk/mcp` v1.0.28 provides `createMCPClient()` with full Streamable HTTP support — exactly our transport
- `await mcpClient.tools()` auto-discovers all 7 tools and converts them to AI SDK tools
- Mixed tooling works: spread MCP tools + local tools into one `generateText()` call
- Optional Zod schemas for type-safe MCP tool inputs/outputs on client side
- Lightweight client caveat: no session management, no auto-reconnect — our `SessionManager` handles this server-side

**Implications:** An AI SDK agent can connect to `http://localhost:3100/mcp`, discover all task tools, and use them alongside custom tools. This is the programmatic dispatch unlock.

### Vector 3: Agent Patterns — AI SDK vs CLI
**Question:** What can AI SDK agents do vs CLI agents like Claude Code?
**Full report:** [iteration-1/vector-3-agent-patterns-vs-cli.md](iteration-1/vector-3-agent-patterns-vs-cli.md)

- AI SDK agents: provider-agnostic, embeddable in web apps, fine-grained step control, middleware, structured output. **No built-in file/command tools.**
- CLI agents: full autonomous coding (file editing, bash, git, permissions, context management, session persistence). **Vendor-locked, subprocess-only.**
- **Critical discovery: `@anthropic-ai/claude-agent-sdk`** provides Claude Code's full toolset as a TypeScript library — programmatic replacement for `claude -p` subprocess spawning
- No evidence of AI SDK being used for autonomous coding — it's a model-calling abstraction, not an agent runtime

**Implications:** Two-tier model — AI SDK for provider-agnostic API tasks, Claude Agent SDK for autonomous coding tasks. They're complementary.

### Vector 4: Runtime Topology
**Question:** Can the same dispatch code work locally and in production?
**Full report:** [iteration-1/vector-4-runtime-topology.md](iteration-1/vector-4-runtime-topology.md)

- Same `generateText()`/`streamText()` code works in Node.js scripts and Next.js route handlers — zero changes
- **Local: no timeout** — agents run indefinitely. **Vercel: 300s (hobby) to 800s (pro).**
- Skip `ai/rsc` (experimental, broken). Use Route Handlers + `useChat` hook.
- Skip Edge runtime. Vercel recommends Node.js now.
- MCP: locally → `localhost:3100`. Production → deployed MCP server needed.

**Implications:** Heavy agent work runs locally (dispatch scripts). Interactive streaming runs on Vercel (Studio UI). Same core code, different timeout boundaries.

## Synthesis

**The single most important insight: a three-layer dispatch model.**

The AI SDK and Claude Agent SDK aren't competing options — they solve different problems in the dispatch stack:

| Layer | Mechanism | What it replaces |
|-------|-----------|-----------------|
| **MCP Server** (coordination) | SQLite state + Streamable HTTP | Already building (`mcp-coordination-layer`) |
| **AI SDK** (provider abstraction) | `createProviderRegistry()` + `generateText()` with MCP tools | `resolve-route.mjs` + `opencode.sh`, `codex.sh`, `gemini.sh`, `lm-studio.mjs` |
| **Claude Agent SDK** (autonomous coding) | `@anthropic-ai/claude-agent-sdk` with full tool suite | `claude.sh` subprocess spawning |

**Why this works:**

1. **Provider routing becomes TypeScript.** `createProviderRegistry()` replaces the dual-maintained `resolve-route.mjs` (shell) / `dispatch.ts` (TypeScript) routing table. Single source of truth.

2. **MCP composition is the unlock.** AI SDK agents connect to our MCP server via `{ type: 'http', url: 'http://localhost:3100/mcp' }`, auto-discover task tools, and use them alongside custom tools. Dispatched agents can read task state, update status, and create follow-on tasks — all through the coordination layer.

3. **Claude Agent SDK eliminates subprocess overhead.** Instead of `claude -p "prompt"` via child process, import the SDK and call `query()` directly. Get hooks, progress callbacks, in-process coordination. The SDK already positions itself as "SDK for CI/CD, CLI for daily development."

4. **Same code, different runtimes.** `generateText()` calls work identically in dispatch scripts (local, no timeout) and Next.js routes (production, bounded). The dispatch logic is portable.

**What doesn't change:** The Planner/Worker/Judge pipeline, the governance engine, the initiative system, the behavioral agent roles. Those are higher-level orchestration patterns that sit above the dispatch mechanism.

**Contradictions found:**

- The AI SDK docs say *"define your own AI SDK tools for production"* rather than using MCP — but our use case (agents coordinating through a shared task server) is exactly the MCP sweet spot.
- Minimax provider is community-maintained, but we could use `@ai-sdk/openai-compatible` with Minimax's OpenAI-compatible endpoint instead, avoiding the community dependency.

## Proposals Generated

Updated `docs/initiatives/ai-sdk-dispatch/proposal.md` — refined from pure research to actionable adoption path with three-layer architecture and phased migration.

## Open Questions for Next Iteration

1. **Claude Agent SDK deep dive** — How does `@anthropic-ai/claude-agent-sdk` actually work? What's the API surface? Can it connect to MCP servers? How does it handle context management and budget controls? This is the key piece for replacing `claude.sh`.

2. **AI SDK + Anthropic provider-level tools** — The `@ai-sdk/anthropic` provider exposes bash execution, text editing, and file operations as provider-specific tools. Could these approximate Claude Code capabilities without the full Agent SDK? Or is the Agent SDK strictly better?

3. **Cost model comparison** — What are the token/cost implications of API-direct dispatch vs CLI dispatch? CLI tools manage their own context windows. AI SDK agents need custom context management middleware. How does this affect cost for typical Sherpa tasks?

4. **Migration path** — What does incremental adoption look like? Replace `lm-studio.mjs` first (already API-based, easiest migration)? Then Gemini/Codex? Claude last (most complex)?
