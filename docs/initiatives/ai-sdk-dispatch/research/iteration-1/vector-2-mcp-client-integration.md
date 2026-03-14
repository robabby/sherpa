# Vector 2: MCP Client Integration

**Question:** How does the AI SDK integrate with MCP as a client? Can an agent dispatched via AI SDK connect to an MCP server and use its tools?
**Agent dispatched:** 2026-03-13

## Findings

### MCP Client History

- First introduced in `ai@4.1.62` (2025-03-18) as `experimental_createMCPClient`
- In `ai@5.x`, remained as `experimental_createMCPClient` in core package
- In `ai@6.x` (current), moved to dedicated **`@ai-sdk/mcp`** package as `createMCPClient` (no experimental prefix)
- `@ai-sdk/mcp` current version: **1.0.28** (2026-03-13)

### Connection Pattern

```typescript
import { createMCPClient } from '@ai-sdk/mcp';
import { generateText } from 'ai';

let client;
try {
  client = await createMCPClient({
    transport: { type: 'http', url: 'http://localhost:3100/mcp' },
  });
  const tools = await client.tools();
  const result = await generateText({
    model: yourModel,
    tools,
    prompt: 'List all pending tasks',
  });
} finally {
  await client?.close();
}
```

### Streamable HTTP Transport — Fully Supported

Docs recommend HTTP transport for production: *"We recommend using HTTP transport (like StreamableHTTPClientTransport) for production deployments."*

Two modes:
- **Built-in shorthand** (recommended): `{ type: 'http', url: '...' }`
- **Explicit transport**: Use `StreamableHTTPClientTransport` from `@modelcontextprotocol/sdk` for custom session IDs

All four transports supported: HTTP (recommended), SSE, Stdio (local only), Custom.

### Tool Auto-Discovery

`await mcpClient.tools()` returns object compatible with AI SDK `tools` parameter. Each MCP tool auto-converted to AI SDK tool.

**With Zod schemas** for type safety:

```typescript
const tools = await mcpClient.tools({
  schemas: {
    task_list: {
      inputSchema: z.object({ status: z.string().optional() }),
      outputSchema: z.object({ tasks: z.array(z.object({ id: z.string() })) }),
    },
  },
});
```

### Mixed Tooling — Works

MCP tools and local tools combine via object spread:

```typescript
const mcpTools = await mcpClient.tools();
const result = await generateText({
  model: yourModel,
  tools: {
    ...mcpTools,           // MCP tools from server
    localTool: tool({...}), // Local AI SDK tool
  },
  prompt: 'Do something',
});
```

Duplicate tool names silently overwrite (last write wins).

### Full Client API

`createMCPClient(config)` returns `Promise<MCPClient>` with:
- `tools()` — get tool definitions
- `listResources()` / `readResource()` — MCP resources
- `experimental_listPrompts()` / `experimental_getPrompt()` — MCP prompts
- `onElicitationRequest()` — elicitation callback
- `close()` — cleanup

### Limitations

- **Lightweight client** — lacks session management, resumable streams, and notification receiving
- **Stdio is local-only** — cannot deploy to production
- **No output type safety without schemas** — raw `CallToolResult` objects
- **Tool name collisions** when merging multiple clients
- **Must close client** to release resources
- **MCP Prompts are experimental**
- **Docs recommend custom tools for production**: *"In most cases, you should define your own AI SDK tools for production applications."*

## Sources

- https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools
- https://ai-sdk.dev/docs/reference/ai-sdk-core/create-mcp-client
- https://ai-sdk.dev/cookbook/node/mcp-tools

## Implications

1. **Direct compatibility confirmed.** Our MCP server on `localhost:3100` with `StreamableHTTPServerTransport` is exactly the recommended transport. AI SDK agent connects with `{ type: 'http', url: 'http://localhost:3100/mcp' }`.
2. **Tool auto-discovery works.** All 7 tools (task_list, task_get, etc.) auto-exposed as AI SDK tools.
3. **Type-safe option exists.** We can define Zod schemas for inputs/outputs on the client side.
4. **Mixed tooling viable.** Agents can use MCP tools + local tools in same call.
5. **Lightweight client caveat.** Sessions managed server-side by our `SessionManager`, but client won't auto-reconnect.

## Open Questions

1. Does our HTTP server serve on `/mcp` path? AI SDK client needs the full URL.
2. Does the built-in `{ type: 'http' }` transport handle `Mcp-Session-Id` header automatically?
3. Timeout considerations for multi-step agents calling slow MCP tools like `task_dispatch`?
4. Which AI SDK version to target? v6 needs separate `@ai-sdk/mcp` package.
5. How do MCP tool errors surface through AI SDK to the LLM?
