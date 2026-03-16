import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type Database from "better-sqlite3"
import {
  acquireAuthority,
  releaseAuthority,
  renewAuthority,
  checkAuthority,
} from "./operations"
import { buildDashboard } from "../dashboard"

/** Register authority tools and dashboard on an MCP server instance. */
export function registerAuthorityTools(
  server: McpServer,
  db: Database.Database,
  projectRoot: string,
): void {
  server.tool(
    "authority_acquire",
    "Request exclusive authority over a scope (file or directory). Returns a fencing token. Use transfer_from for atomic handoff.",
    {
      scope: z.string().describe("Resource scope (file:src/foo.ts or dir:src/components/)"),
      agent_id: z.string().describe("Requesting agent's ID"),
      task_id: z.string().optional().describe("Associated task ID"),
      ttl_seconds: z.number().optional().describe("Lease duration in seconds (default: 1800)"),
      transfer_from: z.string().optional().describe("Current holder's agent ID for atomic transfer"),
    },
    async ({ scope, agent_id, task_id, ttl_seconds, transfer_from }) => {
      const result = acquireAuthority(db, {
        scope,
        agentId: agent_id,
        taskId: task_id,
        ttlSeconds: ttl_seconds,
        transferFrom: transfer_from,
      })
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] }
    },
  )

  server.tool(
    "authority_release",
    "Release authority over a scope. Requires valid fencing token.",
    {
      scope: z.string().describe("Resource scope to release"),
      agent_id: z.string().describe("Agent releasing authority"),
      fence_token: z.number().describe("Fencing token from authority_acquire"),
    },
    async ({ scope, agent_id, fence_token }) => {
      const result = releaseAuthority(db, { scope, agentId: agent_id, fenceToken: fence_token })
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] }
    },
  )

  server.tool(
    "authority_renew",
    "Extend the TTL of an existing authority lease. Requires valid fencing token.",
    {
      scope: z.string().describe("Resource scope to renew"),
      agent_id: z.string().describe("Agent renewing authority"),
      fence_token: z.number().describe("Fencing token from authority_acquire"),
      ttl_seconds: z.number().optional().describe("New lease duration in seconds"),
    },
    async ({ scope, agent_id, fence_token, ttl_seconds }) => {
      const result = renewAuthority(db, { scope, agentId: agent_id, fenceToken: fence_token, ttlSeconds: ttl_seconds })
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] }
    },
  )

  server.tool(
    "get_dashboard",
    "Bootstrap snapshot of system state: active leases, tasks, system health. Call as first action in a new session.",
    {
      agent_id: z.string().optional().describe("Filter to this agent's state"),
      role: z.string().optional().describe("Agent role for role-scoped view"),
    },
    async ({ agent_id, role }) => {
      const dashboard = buildDashboard(db, projectRoot, { agentId: agent_id, role })
      return { content: [{ type: "text" as const, text: JSON.stringify(dashboard, null, 2) }] }
    },
  )

  server.resource(
    "authority",
    "authority://{scope}",
    { description: "Read-only authority state for a scope" },
    async (uri) => {
      const scope = uri.pathname.replace(/^\/\//, "")
      const lease = checkAuthority(db, scope)
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(lease ?? { held: false, scope }),
        }],
      }
    },
  )
}
