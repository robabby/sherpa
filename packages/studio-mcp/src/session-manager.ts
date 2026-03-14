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
    for (const [, session] of this.sessions) {
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
