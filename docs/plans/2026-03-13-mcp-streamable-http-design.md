# MCP Streamable HTTP Transport — Design

**Initiative:** `mcp-coordination-layer`
**Scope:** Phase 0 — Replace stdio transport with Streamable HTTP
**Effort:** 1-2 sessions

## Context

The `mcp-coordination-layer` initiative requires a shared HTTP server that multiple agents can connect to. This design covers the foundational transport upgrade — replacing stdio with Streamable HTTP on the existing `studio-mcp` server. All coordination features (authority tools, SQLite, bootstrap protocol) build on top of this.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Transport | Streamable HTTP only (drop stdio) | Multi-agent coordination requires shared server; stdio is single-client |
| Port resolution | env var > config > default | `SHERPA_MCP_PORT` > `sherpa.config.ts` > `3100` |
| Auth | None (localhost only) | Same trust model as LM Studio, Vite dev server |
| Server lifecycle | Standalone + integrated | `pnpm mcp` for standalone; `pnpm dev` starts MCP alongside Studio |

## Future enhancements (documented, not built)

- MCP-spec authentication flow for non-localhost deployments
- Session management for multi-client state isolation

## Changes

### 1. `packages/studio-mcp/src/server.ts`

**Remove:**
- `StdioServerTransport` import
- The `// CRITICAL: No console.log` constraint (stdout is no longer the transport)
- Subprocess-style entrypoint (create transport, connect, done)

**Add:**
- `StreamableHTTPServerTransport` from `@modelcontextprotocol/sdk/server/streamablehttp.js`
- HTTP server (Node `http.createServer` or framework-minimal) listening on configured port
- `POST /mcp` route → Streamable HTTP transport
- `GET /mcp` route → SSE fallback (SDK provides this for backward compat)
- `DELETE /mcp` route → session termination
- Port resolution: `SHERPA_MCP_PORT` env > config > `3100`
- Graceful shutdown on SIGINT/SIGTERM
- Startup banner to stderr: `Sherpa MCP server listening on http://localhost:<port>/mcp`

### 2. `packages/studio-mcp/package.json`

- Verify `@modelcontextprotocol/sdk` version supports `StreamableHTTPServerTransport` (^1.18.2 should — added in 1.2.0)
- Update bin entrypoint if needed

### 3. `sherpa.config.ts`

Add `mcp` section:
```ts
mcp: {
  port: 3100,
}
```

### 4. `.mcp.json`

Change from subprocess spawn to URL:
```json
{
  "mcpServers": {
    "studio": {
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

### 5. Server lifecycle scripts

- Add `"mcp"` script to root `package.json`: starts the MCP server standalone
- Update `"dev"` script to start MCP server alongside Studio app (via `concurrently` or turborepo)

### 6. `packages/studio-mcp/src/index.ts`

Update exports if the factory function signature changes (port config param).

## What stays the same

- All 7 existing tools — zero changes to tool logic
- Filesystem-backed persistence (task files, logs)
- LM Studio worker spawning
- Config resolution for `projectRoot`, `tasksDir`, `logsDir`, etc.
- `StudioMcpOptions` interface (extended, not replaced)

## Implementation sequence

1. Update `server.ts` — swap transport, add HTTP server, port resolution
2. Update config surface — `sherpa.config.ts` mcp section
3. Update `.mcp.json` — URL-based connection
4. Add lifecycle scripts — `pnpm mcp`, update `pnpm dev`
5. Smoke test — start server, connect Claude Code, verify all 7 tools work
