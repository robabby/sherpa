# Vector 4: Runtime Topology (Local + Production)

**Question:** How does the AI SDK work across different runtime environments? Can the same dispatch code work locally and in production?
**Agent dispatched:** 2026-03-13

## Findings

### Server-Side Usage in Next.js

- **Route Handlers** are the primary pattern. `streamText()` in `app/api/chat/route.ts` returns `result.toUIMessageStreamResponse()`.
- **Server Actions** supported by core `ai` module. The `ai/rsc` module was built for server actions but is **experimental and not recommended for production**.
- **Server Components** can call `generateText()` directly (plain async function).

### Standalone Node.js — Fully Supported

- Same API, no framework dependency. Install `ai`, provider package, `dotenv`.
- Streaming via async iteration: `for await (const chunk of result.textStream)`
- Agent loops (`stopWhen`, `onStepFinish`) work identically.
- **Local dispatch scripts can use exact same code as deployed Studio app.**

### Edge Runtime

- AI SDK works on Edge but with caveats: no filesystem, no `require`, limited Node.js stdlib.
- **Vercel now recommends migrating FROM Edge to Node.js** for improved performance. Both run on Fluid Compute.
- MCP stdio transport will not work on Edge. HTTP/SSE will.
- **Skip Edge runtime.** No benefit, adds constraints.

### Streaming Across Environments

- **Next.js Route Handlers**: `toUIMessageStreamResponse()`, `toTextStreamResponse()`, `toDataStreamResponse()`
- **Standalone Node.js**: Iterate `result.textStream` directly
- **Server Actions**: Can use `streamText` but `ai/rsc` approach has quadratic data issues
- **Recommended**: Route Handlers + `useChat` hook. Skip `ai/rsc`.

### Environment Variables

- Each provider reads from default env var: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.
- Override via `createOpenAI({ apiKey: '...' })` or `createAnthropic({ apiKey: '...' })`
- Same `process.env` works in Node.js, Next.js server, Edge
- Custom base URLs for local models: `createOpenAI({ baseURL: 'http://localhost:1234/v1' })`

### Long-Running Agents — The Critical Constraint

**Vercel timeouts:**
- Hobby: 300s (5 min)
- Pro: 800s (13 min)
- Enterprise: 800s (13 min)

**AI SDK timeout parameter:**
```ts
timeout: { totalMs: 300000, stepMs: 60000, chunkMs: 30000 }
```

**Local Node.js: No timeout.** Agents can run indefinitely.

**Implication:** Multi-step agents with 5+ tool calls that take minutes should run locally, not on Vercel. Vercel routes handle interactive chat streaming, not long-running orchestration.

### The `ai/rsc` Module — Skip It

- Experimental, not recommended for production
- Component flickering, stream abortion failures, Suspense crashes
- Quadratic data transfer with `createStreamableUI`
- **Use Route Handlers + `useChat` hook instead**

## Sources

- https://ai-sdk.dev/docs/getting-started/nextjs-app-router
- https://ai-sdk.dev/docs/ai-sdk-rsc/overview
- https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui
- https://ai-sdk.dev/docs/getting-started/nodejs
- https://vercel.com/docs/functions/runtimes/edge
- https://vercel.com/docs/functions/configuring-functions/duration
- https://vercel.com/docs/functions/streaming-functions
- https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text
- https://ai-sdk.dev/providers/ai-sdk-providers/openai
- https://ai-sdk.dev/providers/ai-sdk-providers/anthropic

## Implications

**Same dispatch code works locally and in production, with one architectural split:**

1. **Shared core**: `generateText()` / `streamText()` calls with provider config via env vars. Runtime-agnostic.
2. **Local dispatch (Node.js scripts)**: No timeout. Multi-step agents, long-running research, MCP stdio or HTTP.
3. **Production dispatch (Vercel routes)**: Bounded by `maxDuration`. Interactive chat, short multi-step. HTTP MCP transport only.
4. **MCP connectivity**: Locally → `localhost:3100`. Production → deployed MCP server or tunneled.
5. **Skip `ai/rsc`** — use stable `ai` core + `@ai-sdk/react` (`useChat`).
6. **Skip Edge runtime** — Node.js recommended by Vercel themselves.

## Open Questions

1. MCP server deployment topology for production — where does it run?
2. Agent step limits on Vercel Pro — how many steps fit in 800s?
3. AI Gateway (`gateway` import from `ai`) — unified provider router?
4. Vercel Fluid Compute pricing for long-running agents
5. Persistent MCP connections across agent steps on Vercel — request-scoped functions?
