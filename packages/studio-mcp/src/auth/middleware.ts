import type http from "node:http"
import { betterAuth } from "better-auth"
import { apiKey } from "@better-auth/api-key"
import { fromNodeHeaders } from "better-auth/node"
import Database from "better-sqlite3"
import fs from "node:fs"
import path from "node:path"

export interface McpAuthOptions {
  /** Absolute path to auth.db */
  authDbPath: string
  /** Paths that skip auth (e.g. "/health") */
  publicPaths?: string[]
}

export function createMcpAuth(opts: McpAuthOptions) {
  // Ensure directory exists
  fs.mkdirSync(path.dirname(opts.authDbPath), { recursive: true })

  const auth = betterAuth({
    database: new Database(opts.authDbPath),
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: { enabled: true },
    plugins: [
      apiKey({ defaultPrefix: "sk_sherpa_" }),
    ],
  })

  const publicPaths = new Set(opts.publicPaths ?? ["/health"])

  /**
   * Auth middleware for the MCP HTTP server.
   * Returns null if authenticated, or an error response to send.
   */
  async function authenticate(
    req: http.IncomingMessage,
  ): Promise<{ error: string; status: number } | null> {
    const url = req.url ?? ""
    if (publicPaths.has(url)) return null

    // Path 1: API key (agents)
    const apiKeyHeader = req.headers["x-api-key"] as string | undefined
    if (apiKeyHeader) {
      try {
        const result = await auth.api.verifyApiKey({
          body: { key: apiKeyHeader },
        })
        if (result && "valid" in result && result.valid) {
          return null // authenticated
        }
      } catch {
        // verification failed
      }
      return { error: "Invalid API key", status: 401 }
    }

    // Path 2: Session cookie (humans via Studio server-side calls)
    const cookieHeader = req.headers.cookie
    if (cookieHeader) {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        })
        if (session) {
          return null // authenticated
        }
      } catch {
        // session validation failed
      }
    }

    return { error: "Authentication required", status: 401 }
  }

  return { authenticate }
}
