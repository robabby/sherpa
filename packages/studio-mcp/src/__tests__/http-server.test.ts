import { describe, it, expect, afterEach, vi, beforeEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { closeAll } from "@sherpa/studio-core/db"
import { startHttpServer } from "../http-server"
import { stopReaper } from "../authority/reaper"
import type http from "node:http"

// The http-server module registers SIGINT/SIGTERM handlers that call
// process.exit(0), which would kill vitest. Mock process.exit to prevent that.
const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as never)

let httpServer: http.Server | null = null
let tmpDir: string | null = null

afterEach(async () => {
  stopReaper()
  if (httpServer) {
    await new Promise<void>((resolve, reject) => {
      httpServer!.close((err) => (err ? reject(err) : resolve()))
    })
    httpServer = null
  }
  closeAll()
  if (tmpDir) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    tmpDir = null
  }
  exitSpy.mockClear()
})

function getPort(server: http.Server): number {
  const addr = server.address() as { port: number }
  return addr.port
}

describe("HTTP MCP Server", () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-http-test-"))
  })

  it("serves health check", async () => {
    const result = await startHttpServer({ port: 0, projectRoot: tmpDir! })
    httpServer = result.server
    const port = getPort(result.server)

    const res = await fetch(`http://localhost:${port}/health`)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe("ok")
    expect(body.sessions).toBe(0)
  })

  it("returns 404 for unknown paths", async () => {
    const result = await startHttpServer({ port: 0, projectRoot: tmpDir! })
    httpServer = result.server
    const port = getPort(result.server)

    const res = await fetch(`http://localhost:${port}/unknown`)
    expect(res.status).toBe(404)
  })

  it("returns 405 for unsupported methods", async () => {
    const result = await startHttpServer({ port: 0, projectRoot: tmpDir! })
    httpServer = result.server
    const port = getPort(result.server)

    const res = await fetch(`http://localhost:${port}/mcp`, { method: "PUT" })
    expect(res.status).toBe(405)
  })

  it("initializes an MCP session via POST /mcp", async () => {
    const result = await startHttpServer({ port: 0, projectRoot: tmpDir! })
    httpServer = result.server
    const port = getPort(result.server)

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

    const res = await fetch(`http://localhost:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(initRequest),
    })

    expect(res.status).toBe(200)
    const sessionId = res.headers.get("mcp-session-id")
    expect(sessionId).toBeTruthy()
    expect(result.sessions.size).toBe(1)

    // Consume the response body to prevent connection leak
    await res.text()
  })

  it("supports multiple concurrent client sessions", async () => {
    const result = await startHttpServer({ port: 0, projectRoot: tmpDir! })
    httpServer = result.server
    const port = getPort(result.server)

    const makeInitRequest = () => ({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0" },
      },
    })

    // Client A
    const resA = await fetch(`http://localhost:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(makeInitRequest()),
    })
    const sessionIdA = resA.headers.get("mcp-session-id")
    await resA.text()

    // Client B
    const resB = await fetch(`http://localhost:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(makeInitRequest()),
    })
    const sessionIdB = resB.headers.get("mcp-session-id")
    await resB.text()

    expect(resA.status).toBe(200)
    expect(resB.status).toBe(200)
    expect(sessionIdA).toBeTruthy()
    expect(sessionIdB).toBeTruthy()
    expect(sessionIdA).not.toBe(sessionIdB)
    expect(result.sessions.size).toBe(2)

    // Health check should show 2 sessions
    const healthRes = await fetch(`http://localhost:${port}/health`)
    const health = await healthRes.json()
    expect(health.sessions).toBe(2)
  })
})
