import http from "node:http"
import { randomUUID } from "node:crypto"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { closeAll as closeAllDbs, resolveDbPaths } from "@sherpa/studio-core/db"
import { createStudioMcpServer, type StudioMcpOptions } from "./server.js"
import { SessionManager } from "./session-manager.js"
import { resolvePort } from "./port.js"
import { createMcpAuth } from "./auth/middleware.js"

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

  // Resolve project root (same logic as server.ts resolveOptions)
  const projectRoot = opts?.projectRoot
    ?? process.env.SHERPA_PROJECT_ROOT
    ?? process.cwd()

  const dbPaths = resolveDbPaths(projectRoot)

  // Initialize auth middleware
  const mcpAuth = createMcpAuth({
    authDbPath: dbPaths.auth,
    publicPaths: ["/health"],
  })

  const sessions = new SessionManager(() => {
    // We need to wire up onsessioninitialized before connect(),
    // so we create server + transport here and defer registration
    // to the HTTP handler where we have access to the closure.
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

    // Auth check (after health, before /mcp)
    const authError = await mcpAuth.authenticate(req)
    if (authError) {
      res.writeHead(authError.status, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: authError.error }))
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
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(chunk as Buffer)
      const body = JSON.parse(Buffer.concat(chunks).toString())

      if (sessionId && sessions.get(sessionId)) {
        const session = sessions.get(sessionId)!
        await session.transport.handleRequest(req, res, body)
      } else if (!sessionId && isInitializeRequest(body)) {
        const { server, transport } = sessions.create()

        transport.onclose = () => {
          const sid = transport.sessionId
          if (sid) sessions.remove(sid)
        }

        await server.connect(transport)
        await transport.handleRequest(req, res, body)

        // After handleRequest for initialize, the transport has a sessionId
        const sid = transport.sessionId
        if (sid) {
          sessions.register(sid, { server, transport })
          console.error(`[sherpa-mcp] Session initialized: ${sid} (total: ${sessions.size})`)
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Bad request: missing or invalid session" }))
      }
    } else if (req.method === "GET") {
      if (sessionId && sessions.get(sessionId)) {
        const session = sessions.get(sessionId)!
        await session.transport.handleRequest(req, res)
      } else {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Missing or invalid mcp-session-id" }))
      }
    } else if (req.method === "DELETE") {
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

  const shutdown = async () => {
    console.error("\n[sherpa-mcp] Shutting down...")
    await sessions.closeAll()
    closeAllDbs()
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
