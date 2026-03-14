# MCP Coordination Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace stdio transport with Streamable HTTP in `studio-mcp`, enabling multi-client connections as the foundation for multi-agent coordination.

**Architecture:** Single HTTP server wrapping `McpServer` instances via a session manager. Each connecting Claude Code client gets its own `McpServer` + `StreamableHTTPServerTransport` pair, routed by `mcp-session-id` header. All 7 existing tools work identically — only the transport changes.

**Tech Stack:** `@modelcontextprotocol/sdk` ^1.18.2 (StreamableHTTPServerTransport), Node.js `http.createServer`, vitest for tests.

**Initiative:** `mcp-coordination-layer` — Phase 0 (transport). Phases 1-3 (authority/SQLite/hooks) are gated on demand signal per stake.md kill criteria #5.

---

## Phase 0: Streamable HTTP Transport (Session 1)

This phase ships independently. All subsequent phases are gated.

### Task 1: Add vitest to studio-mcp

**Files:**
- Modify: `packages/studio-mcp/package.json`
- Create: `packages/studio-mcp/vitest.config.ts`

**Step 1: Add vitest dev dependency**

```bash
cd /Users/rob/Workbench/sherpa && pnpm --filter @sherpa/studio-mcp add -D vitest
```

**Step 2: Create vitest config**

Create `packages/studio-mcp/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
  },
})
```

**Step 3: Add test script to package.json**

In `packages/studio-mcp/package.json`, add to `"scripts"`:
```json
"test": "vitest run"
```

**Step 4: Run to verify setup**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: passes (no test files yet, exits cleanly).

**Step 5: Commit**

```bash
git add packages/studio-mcp/package.json packages/studio-mcp/vitest.config.ts pnpm-lock.yaml
git commit -m "chore(studio-mcp): add vitest test infrastructure"
```

---

### Task 2: Add port config to McpConfig

**Files:**
- Modify: `packages/studio-core/src/config/types.ts:92-98`
- Modify: `packages/studio-core/src/config/defaults.ts:74-78`
- Modify: `packages/studio-mcp/src/server.ts` (StudioMcpOptions interface)

**Step 1: Write failing test**

Create `packages/studio-mcp/src/__tests__/port-resolution.test.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest"
import { resolvePort } from "../port"

describe("resolvePort", () => {
  afterEach(() => {
    delete process.env.SHERPA_MCP_PORT
  })

  it("returns default port when nothing is configured", () => {
    expect(resolvePort()).toBe(3100)
  })

  it("uses config port over default", () => {
    expect(resolvePort({ port: 4000 })).toBe(4000)
  })

  it("uses env var over config", () => {
    process.env.SHERPA_MCP_PORT = "5000"
    expect(resolvePort({ port: 4000 })).toBe(5000)
  })

  it("ignores invalid env var", () => {
    process.env.SHERPA_MCP_PORT = "not-a-number"
    expect(resolvePort({ port: 4000 })).toBe(4000)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: FAIL — `../port` module doesn't exist.

**Step 3: Implement port resolution**

Create `packages/studio-mcp/src/port.ts`:

```typescript
const DEFAULT_PORT = 3100

export function resolvePort(config?: { port?: number }): number {
  const envPort = process.env.SHERPA_MCP_PORT
  if (envPort) {
    const parsed = parseInt(envPort, 10)
    if (!isNaN(parsed) && parsed > 0 && parsed < 65536) return parsed
  }
  return config?.port ?? DEFAULT_PORT
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS.

**Step 5: Add port to McpConfig type**

In `packages/studio-core/src/config/types.ts`, add to `McpConfig`:

```typescript
export interface McpConfig {
  /** LM Studio base URL. */
  lmStudioUrl?: string
  /** Path to .mcp.json config. Defaults to paths.mcpConfig. */
  configPath?: string
  /** Path to task log directory for MCP event tracking. */
  taskLogsPath?: string
  /** Port for MCP Streamable HTTP server. Defaults to 3100. */
  port?: number
}
```

**Step 6: Add default**

In `packages/studio-core/src/config/defaults.ts`, add `port`:

```typescript
export const DEFAULT_MCP: Required<McpConfig> = {
  lmStudioUrl: "http://127.0.0.1:1234",
  configPath: "",
  taskLogsPath: "",
  port: 3100,
}
```

**Step 7: Add port to StudioMcpOptions**

In `packages/studio-mcp/src/server.ts`, add to `StudioMcpOptions`:

```typescript
/** Port for Streamable HTTP server. Resolved: env > config > 3100. */
port?: number
```

**Step 8: Typecheck**

```bash
pnpm check
```

Expected: PASS.

**Step 9: Commit**

```bash
git add packages/studio-mcp/src/__tests__/port-resolution.test.ts packages/studio-mcp/src/port.ts packages/studio-core/src/config/types.ts packages/studio-core/src/config/defaults.ts packages/studio-mcp/src/server.ts
git commit -m "feat(studio-mcp): add port resolution (env > config > 3100)"
```

---

### Task 3: Build session manager

**Files:**
- Create: `packages/studio-mcp/src/session-manager.ts`
- Create: `packages/studio-mcp/src/__tests__/session-manager.test.ts`

The MCP SDK creates one `McpServer` + `StreamableHTTPServerTransport` per client session. We need a manager that routes HTTP requests by `mcp-session-id` header.

**Step 1: Write failing test**

Create `packages/studio-mcp/src/__tests__/session-manager.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest"
import { SessionManager } from "../session-manager"

describe("SessionManager", () => {
  it("creates and retrieves a session", () => {
    const factory = vi.fn().mockReturnValue({
      server: {},
      transport: { sessionId: "test-123" },
    })
    const mgr = new SessionManager(factory)

    const session = mgr.create()
    expect(factory).toHaveBeenCalledOnce()
    expect(session.transport.sessionId).toBe("test-123")
  })

  it("retrieves session by id", () => {
    const mgr = new SessionManager(() => ({
      server: {},
      transport: { sessionId: "abc" },
    }))

    mgr.register("abc", { server: {} as any, transport: { sessionId: "abc" } as any })
    expect(mgr.get("abc")).toBeDefined()
    expect(mgr.get("nonexistent")).toBeUndefined()
  })

  it("removes session", () => {
    const mgr = new SessionManager(() => ({
      server: {},
      transport: { sessionId: "abc" },
    }))

    mgr.register("abc", { server: {} as any, transport: { sessionId: "abc" } as any })
    mgr.remove("abc")
    expect(mgr.get("abc")).toBeUndefined()
  })

  it("reports session count", () => {
    const mgr = new SessionManager(() => ({
      server: {},
      transport: { sessionId: "x" },
    }))

    mgr.register("a", { server: {} as any, transport: {} as any })
    mgr.register("b", { server: {} as any, transport: {} as any })
    expect(mgr.size).toBe(2)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: FAIL — module not found.

**Step 3: Implement session manager**

Create `packages/studio-mcp/src/session-manager.ts`:

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"

export interface Session {
  server: McpServer
  transport: StreamableHTTPServerTransport
}

type SessionFactory = () => Session

export class SessionManager {
  private sessions = new Map<string, Session>()
  private factory: SessionFactory

  constructor(factory: SessionFactory) {
    this.factory = factory
  }

  create(): Session {
    return this.factory()
  }

  register(sessionId: string, session: Session): void {
    this.sessions.set(sessionId, session)
  }

  get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId)
  }

  remove(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  get size(): number {
    return this.sessions.size
  }

  async closeAll(): Promise<void> {
    for (const [id, session] of this.sessions) {
      try {
        await session.transport.close()
        await session.server.close()
      } catch {
        // Best-effort cleanup
      }
    }
    this.sessions.clear()
  }
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/studio-mcp/src/session-manager.ts packages/studio-mcp/src/__tests__/session-manager.test.ts
git commit -m "feat(studio-mcp): add session manager for multi-client transport"
```

---

### Task 4: Replace stdio with HTTP server

This is the core transport swap. The `createStudioMcpServer` factory stays — it's now called once per client session by the session manager.

**Files:**
- Modify: `packages/studio-mcp/src/server.ts`
- Create: `packages/studio-mcp/src/http-server.ts`
- Modify: `packages/studio-mcp/src/index.ts`

**Step 1: Create the HTTP server module**

Create `packages/studio-mcp/src/http-server.ts`:

```typescript
import http from "node:http"
import { randomUUID } from "node:crypto"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { createStudioMcpServer, type StudioMcpOptions } from "./server.js"
import { SessionManager, type Session } from "./session-manager.js"
import { resolvePort } from "./port.js"

export interface HttpServerOptions extends StudioMcpOptions {
  port?: number
}

function isInitializeRequest(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false
  const msg = body as Record<string, unknown>
  return msg.method === "initialize"
}

export async function startHttpServer(opts?: HttpServerOptions): Promise<{
  server: http.Server
  sessions: SessionManager
  port: number
}> {
  const port = resolvePort(opts)

  const sessions = new SessionManager(() => {
    const server = createStudioMcpServer(opts)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    })
    return { server, transport }
  })

  const httpServer = http.createServer(async (req, res) => {
    // Health check
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ status: "ok", sessions: sessions.size }))
      return
    }

    // Only handle /mcp
    if (req.url !== "/mcp") {
      res.writeHead(404)
      res.end("Not found")
      return
    }

    const sessionId = req.headers["mcp-session-id"] as string | undefined

    if (req.method === "POST") {
      // Read body
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(chunk as Buffer)
      const body = JSON.parse(Buffer.concat(chunks).toString())

      // Route to existing session or create new one
      if (sessionId && sessions.get(sessionId)) {
        const session = sessions.get(sessionId)!
        await session.transport.handleRequest(req, res, body)
      } else if (!sessionId && isInitializeRequest(body)) {
        // New client — create session
        const { server, transport } = sessions.create()

        transport.onclose = () => {
          const sid = transport.sessionId
          if (sid) sessions.remove(sid)
        }

        transport.onsessioninitialized = (sid: string) => {
          sessions.register(sid, { server, transport })
          console.error(`[sherpa-mcp] Session initialized: ${sid} (total: ${sessions.size})`)
        }

        await server.connect(transport)
        await transport.handleRequest(req, res, body)
      } else {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Bad request: missing or invalid session" }))
      }
    } else if (req.method === "GET") {
      // SSE stream for server-initiated messages
      if (sessionId && sessions.get(sessionId)) {
        const session = sessions.get(sessionId)!
        await session.transport.handleRequest(req, res)
      } else {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Missing or invalid mcp-session-id" }))
      }
    } else if (req.method === "DELETE") {
      // Session termination
      if (sessionId && sessions.get(sessionId)) {
        const session = sessions.get(sessionId)!
        await session.transport.handleRequest(req, res)
        sessions.remove(sessionId)
        console.error(`[sherpa-mcp] Session closed: ${sessionId} (total: ${sessions.size})`)
      } else {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Missing or invalid mcp-session-id" }))
      }
    } else {
      res.writeHead(405)
      res.end("Method not allowed")
    }
  })

  // Graceful shutdown
  const shutdown = async () => {
    console.error("\n[sherpa-mcp] Shutting down...")
    await sessions.closeAll()
    httpServer.close()
    process.exit(0)
  }
  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)

  return new Promise((resolve) => {
    httpServer.listen(port, () => {
      console.error(`[sherpa-mcp] Sherpa MCP server listening on http://localhost:${port}/mcp`)
      console.error(`[sherpa-mcp] Health check: http://localhost:${port}/health`)
      resolve({ server: httpServer, sessions, port })
    })
  })
}
```

**Step 2: Update server.ts — remove standalone stdio entrypoint**

In `packages/studio-mcp/src/server.ts`:

- Remove the shebang line (`#!/usr/bin/env node`)
- Remove the `StdioServerTransport` import
- Remove the last 3 lines (standalone entrypoint):
  ```typescript
  const server = createStudioMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  ```
- Remove the `CRITICAL: No console.log` comment (stdout is no longer the transport)
- Keep `createStudioMcpServer` and `StudioMcpOptions` exports — these are now called per-session by the session manager
- Add `port` to `StudioMcpOptions` (if not already done in Task 2)

**Step 3: Create new entrypoint**

Create `packages/studio-mcp/src/main.ts`:

```typescript
#!/usr/bin/env node
import { startHttpServer } from "./http-server.js"

await startHttpServer()
```

**Step 4: Update package.json bin entry**

In `packages/studio-mcp/package.json`, change:

```json
"bin": {
  "sherpa-mcp": "./src/main.ts"
}
```

**Step 5: Update index.ts exports**

In `packages/studio-mcp/src/index.ts`:

```typescript
export { createStudioMcpServer } from "./server"
export type { StudioMcpOptions } from "./server"
export { startHttpServer } from "./http-server"
export type { HttpServerOptions } from "./http-server"
export { SessionManager } from "./session-manager"
export { resolvePort } from "./port"
```

**Step 6: Typecheck**

```bash
pnpm check
```

Expected: PASS. Fix any type errors.

**Step 7: Manual smoke test — start server**

```bash
cd /Users/rob/Workbench/sherpa && bun run packages/studio-mcp/src/main.ts
```

Expected: `[sherpa-mcp] Sherpa MCP server listening on http://localhost:3100/mcp`

**Step 8: Manual smoke test — health check**

```bash
curl http://localhost:3100/health
```

Expected: `{"status":"ok","sessions":0}`

**Step 9: Commit**

```bash
git add packages/studio-mcp/src/http-server.ts packages/studio-mcp/src/main.ts packages/studio-mcp/src/server.ts packages/studio-mcp/src/index.ts packages/studio-mcp/package.json
git commit -m "feat(studio-mcp): replace stdio with Streamable HTTP transport

Multi-client session management via session manager. Each connecting
Claude Code client gets its own McpServer + Transport pair. Health
check at /health. Graceful shutdown on SIGINT/SIGTERM."
```

---

### Task 5: Update .mcp.json

**Files:**
- Modify: `.mcp.json`

**Step 1: Change to URL-based config**

Replace `.mcp.json` content:

```json
{
  "mcpServers": {
    "studio": {
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

**Step 2: Verify Claude Code can parse it**

Start the MCP server in one terminal, then open a new Claude Code session. The MCP tools should be available.

```bash
# Terminal 1:
bun run packages/studio-mcp/src/main.ts

# Terminal 2:
# Open Claude Code, try: task_list or lm_status
```

**Step 3: If URL field is NOT supported**

Fall back to a thin wrapper approach — `.mcp.json` spawns the server:

```json
{
  "mcpServers": {
    "studio": {
      "command": "bun",
      "args": ["run", "packages/studio-mcp/src/main.ts"],
      "env": {
        "LM_STUDIO_URL": "http://localhost:1234"
      }
    }
  }
}
```

Note: this fallback means each Claude Code session spawns its own server (same as stdio). Multi-client requires the pre-started HTTP approach. Document the finding.

**Step 4: Commit**

```bash
git add .mcp.json
git commit -m "feat: update .mcp.json to Streamable HTTP URL"
```

---

### Task 6: Add lifecycle scripts

**Files:**
- Modify: `package.json` (root)

**Step 1: Add pnpm mcp script**

In root `package.json`, add to `"scripts"`:

```json
"mcp": "bun run packages/studio-mcp/src/main.ts"
```

**Step 2: Update pnpm dev to include MCP**

Install `concurrently`:

```bash
pnpm add -D -w concurrently
```

Update `"dev"` script:

```json
"dev": "concurrently --names mcp,studio --prefix-colors blue,green \"pnpm mcp\" \"pnpm --filter @sherpa/studio-app dev\""
```

Keep `"dev:studio"` as the original for Studio-only:

```json
"dev:studio": "pnpm --filter @sherpa/studio-app dev"
```

**Step 3: Verify pnpm mcp**

```bash
pnpm mcp
```

Expected: MCP server starts on port 3100.

**Step 4: Verify pnpm dev**

```bash
pnpm dev
```

Expected: Both MCP server and Studio app start. MCP on 3100, Studio on 3000.

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add pnpm mcp script, integrate MCP into pnpm dev"
```

---

### Task 7: Write integration test for multi-client

**Files:**
- Create: `packages/studio-mcp/src/__tests__/http-server.test.ts`

**Step 1: Write test**

Create `packages/studio-mcp/src/__tests__/http-server.test.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest"
import { startHttpServer } from "../http-server"
import type http from "node:http"

let httpServer: http.Server | null = null

afterEach(async () => {
  if (httpServer) {
    httpServer.close()
    httpServer = null
  }
})

describe("HTTP MCP Server", () => {
  it("starts and serves health check", async () => {
    const result = await startHttpServer({ port: 0 }) // random port
    httpServer = result.server
    const addr = result.server.address() as { port: number }

    const res = await fetch(`http://localhost:${addr.port}/health`)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe("ok")
    expect(body.sessions).toBe(0)
  })

  it("returns 404 for unknown paths", async () => {
    const result = await startHttpServer({ port: 0 })
    httpServer = result.server
    const addr = result.server.address() as { port: number }

    const res = await fetch(`http://localhost:${addr.port}/unknown`)
    expect(res.status).toBe(404)
  })

  it("initializes an MCP session via POST /mcp", async () => {
    const result = await startHttpServer({ port: 0 })
    httpServer = result.server
    const addr = result.server.address() as { port: number }

    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0" },
      },
    }

    const res = await fetch(`http://localhost:${addr.port}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initRequest),
    })

    expect(res.status).toBe(200)
    // Session ID should be in response headers
    const sessionId = res.headers.get("mcp-session-id")
    expect(sessionId).toBeTruthy()
    expect(result.sessions.size).toBe(1)
  })
})
```

**Step 2: Run test**

```bash
pnpm --filter @sherpa/studio-mcp test
```

Expected: PASS. If any test fails, debug and fix.

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/__tests__/http-server.test.ts
git commit -m "test(studio-mcp): add integration tests for HTTP transport"
```

---

### Task 8: Validate kill criteria — Phase 0 checkpoint

This task validates the three Phase 0 requirements from the amended stake.

**Validation (a): Multi-client transport**

Start the server. Connect two MCP clients simultaneously.

```bash
# Terminal 1: Start server
pnpm mcp

# Terminal 2: Initialize client A
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"client-a","version":"1.0"}}}'

# Terminal 3: Initialize client B
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"client-b","version":"1.0"}}}'

# Check health — should show 2 sessions
curl http://localhost:3100/health
```

Expected: Both clients get unique `mcp-session-id` headers. Health shows `"sessions": 2`.

**Kill criterion 1:** If second client gets HTTP 400 or "already initialized", the session manager is broken. Fix before proceeding.

**Validation (b): .mcp.json URL field**

With server running, open Claude Code. Run `task_list` tool. Should return tasks.

**Kill criterion:** If Claude Code doesn't recognize `"url"` in `.mcp.json`, fall back to spawn approach (Task 5 Step 3) and document finding.

**Validation (c): Hook latency baseline**

Measure baseline HTTP round-trip to the server:

```bash
# Measure 10 requests
for i in $(seq 1 10); do
  curl -o /dev/null -s -w "%{time_total}\n" http://localhost:3100/health
done
```

Record the p95. This is the floor for hook latency (no authority check yet, just HTTP overhead). If >50ms on localhost, investigate.

**Step: Update activity log**

```bash
# Add to docs/initiatives/mcp-coordination-layer/activity.md
```

Add entry: Phase 0 validation results — multi-client (pass/fail), URL config (pass/fail), latency baseline.

**Step: Commit**

```bash
git add docs/initiatives/mcp-coordination-layer/activity.md
git commit -m "docs: Phase 0 validation checkpoint"
```

---

## Phase Gate: Phase 0 → Phase 1

**Do NOT proceed to Phase 1 until ALL of these are true:**

1. Multi-client transport works (kill criterion #1 passed)
2. `.mcp.json` URL field works OR spawn fallback is documented
3. Latency baseline is <50ms for health check on localhost
4. All tests pass: `pnpm --filter @sherpa/studio-mcp test`
5. `pnpm check` passes across monorepo

**Additionally, Phase 1 is gated on demand signal (kill criterion #5):**
- Authority tools are only worth building if multi-agent collisions are occurring or 4+ concurrent sessions are routine
- If neither condition is met after 4 weeks of Phase 0 in production, defer Phases 1-3

---

## Phase 1: SQLite + Authority Tools (Sessions 2-3)

> **Gate:** Phase 0 validated + demand signal present.

### Task 9: Add SQLite dependency

**Files:**
- Modify: `packages/studio-mcp/package.json`
- Create: `packages/studio-mcp/src/db.ts`

Add `better-sqlite3` and `@types/better-sqlite3`. Create a database factory that initializes the schema on first run. Database file: `.sherpa/coordination.db` (relative to project root).

Schema (2 tables):

```sql
CREATE TABLE IF NOT EXISTS authority_leases (
  scope TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  task_id TEXT,
  fence_token INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'exclusive',
  ttl_seconds INTEGER NOT NULL DEFAULT 1800,
  acquired_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  renewed_at TEXT
);

CREATE TABLE IF NOT EXISTS state_versions (
  resource_uri TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  content_hash TEXT,
  updated_by TEXT,
  updated_at TEXT NOT NULL
);
```

TDD: test schema creation, test that db file is created, test idempotent init.

### Task 10: Implement authority_acquire tool

**Files:**
- Create: `packages/studio-mcp/src/authority.ts`
- Create: `packages/studio-mcp/src/__tests__/authority.test.ts`
- Modify: `packages/studio-mcp/src/server.ts` (register tool)

Tool: `authority_acquire(scope, agent_id, task_id?, ttl_seconds?, transfer_from?)`

Logic:
1. Check if scope has unexpired lease
2. If `transfer_from` matches current holder, release + acquire atomically in `BEGIN IMMEDIATE`
3. If no lease or lease expired, acquire with monotonically increasing fence_token
4. Return `{ acquired: true, fence_token, expires_at }` or `{ acquired: false, held_by, expires_at }`

TDD: test acquire empty scope, test acquire held scope (denied), test acquire expired scope (granted), test transfer_from, test fence_token monotonicity.

### Task 11: Implement authority_release tool

Tool: `authority_release(scope, agent_id, fence_token)`

Logic: validate fence_token matches, delete lease. Return `{ released: true }`.

TDD: test release owned scope, test release with wrong fence_token (denied), test release nonexistent scope.

### Task 12: Implement authority_renew tool

Tool: `authority_renew(scope, agent_id, fence_token, ttl_seconds?)`

Logic: validate fence_token, update `expires_at` and `renewed_at`. Return `{ renewed: true, expires_at }`.

TDD: test renew valid lease, test renew with wrong token, test renew expired lease.

### Task 13: Implement authority resource

Resource: `authority://{scope}` — read-only observation of authority state.

Returns current lease holder, fence_token, expires_at, or `{ held: false }`.

### Task 14: Implement TTL reaper

Background interval (every 60 seconds) that deletes expired leases from `authority_leases` table.

TDD: test reaper deletes expired rows, test reaper preserves valid rows.

### Task 15: Implement get_dashboard tool

Tool: `get_dashboard(role?, agent_id?)`

Returns role-scoped JSON: agent's tasks, authority leases, recent activity. Worker payload ~200 tokens, Planner ~500 tokens.

---

## Phase 2: Hook Enforcement (Sessions 3-4)

> **Gate:** Phase 1 validated + authority tools working.

### Task 16: Add authority check endpoint

Add `POST /authority-check` endpoint to the HTTP server. Receives `{ file_path, agent_id, action }`, returns `{ allowed: boolean, reason? }`. This is what hooks call.

### Task 17: Configure PreToolUse hooks

Add hook configuration to `.claude/settings.json` (or document `sherpa init` automation). PreToolUse hooks for `Edit` and `Write` POST to `http://localhost:3100/authority-check`.

### Task 18: Add session lifecycle hooks

- `SessionStart` hook: register agent session
- `SessionEnd` / `Stop` hook: release all authority for agent
- Path normalization: `git rev-parse --show-toplevel` to compute repo-relative paths

---

## Phase 3: Bootstrap Protocol (Sessions 4-5)

> **Gate:** Phase 2 validated + hooks working.

### Task 19: Dashboard file projection

On every authority mutation, write `.sherpa/state/dashboard.json` to disk. SessionStart hook reads this file for warm cache.

### Task 20: Resource subscriptions

Implement MCP resource subscriptions for `authority://`, `tasks://`, `activity://` — push-based delta updates via SSE.

### Task 21: Implicit authority via task dispatch

When `task_dispatch` is called, auto-acquire authority over task's target files. Workers never call `authority_acquire` directly.

---

## Summary

| Phase | Sessions | Tasks | Gate |
|-------|----------|-------|------|
| Phase 0: Transport | 1 | 8 | None — start immediately |
| Phase 1: SQLite + Authority | 2 | 7 | Phase 0 validated + demand signal |
| Phase 2: Hooks | 1-2 | 3 | Phase 1 validated |
| Phase 3: Bootstrap | 1 | 3 | Phase 2 validated |

**Total: 4-6 sessions.** Phase 0 is the only committed work. Phases 1-3 are gated on kill criteria from the stake.
