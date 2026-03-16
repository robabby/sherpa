import { describe, it, expect, afterEach, vi } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { closeAll } from "@sherpa/studio-core/db"
import { startHttpServer } from "../http-server"
import { stopReaper } from "../authority/reaper"
import type http from "node:http"

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

async function initSession(port: number): Promise<string> {
  const res = await fetch(`http://localhost:${port}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-e2e", version: "1.0" },
      },
    }),
  })
  await res.text()
  return res.headers.get("mcp-session-id")!
}

function parseSSE(text: string): any {
  // SSE format: "event: message\ndata: {json}\n\n"
  // Extract the last data line containing the JSON-RPC response
  const lines = text.split("\n")
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (line.startsWith("data: ")) {
      return JSON.parse(line.slice(6))
    }
  }
  // Fall back to direct JSON parse
  return JSON.parse(text)
}

async function callTool(
  port: number,
  sessionId: string,
  tool: string,
  args: Record<string, unknown>,
  requestId = 2,
): Promise<any> {
  const res = await fetch(`http://localhost:${port}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId,
      method: "tools/call",
      params: { name: tool, arguments: args },
    }),
  })
  const text = await res.text()
  return parseSSE(text)
}

describe("authority E2E via HTTP", () => {
  it("acquire, dashboard, release through MCP protocol", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-e2e-"))
    const result = await startHttpServer({ port: 0, projectRoot: tmpDir })
    httpServer = result.server
    const port = (result.server.address() as { port: number }).port

    const sessionId = await initSession(port)
    expect(sessionId).toBeTruthy()

    // Acquire authority
    const acqResult = await callTool(port, sessionId, "authority_acquire", {
      scope: "file:src/main.ts",
      agent_id: "test-agent",
      ttl_seconds: 300,
    })
    const acq = JSON.parse(acqResult.result.content[0].text)
    expect(acq.acquired).toBe(true)
    expect(acq.fenceToken).toBe(1)

    // Dashboard shows the lease
    const dashResult = await callTool(port, sessionId, "get_dashboard", {
      agent_id: "test-agent",
    }, 3)
    const dashboard = JSON.parse(dashResult.result.content[0].text)
    expect(dashboard.leases).toHaveLength(1)
    expect(dashboard.summary.totalLeases).toBe(1)

    // Release authority
    const relResult = await callTool(port, sessionId, "authority_release", {
      scope: "file:src/main.ts",
      agent_id: "test-agent",
      fence_token: 1,
    }, 4)
    const rel = JSON.parse(relResult.result.content[0].text)
    expect(rel.released).toBe(true)
  })
})
