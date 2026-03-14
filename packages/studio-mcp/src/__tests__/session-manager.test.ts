import { describe, it, expect, vi } from "vitest"
import { SessionManager } from "../session-manager"

describe("SessionManager", () => {
  it("creates session via factory", () => {
    const factory = vi.fn().mockReturnValue({
      server: {},
      transport: { sessionId: "test-123" },
    })
    const mgr = new SessionManager(factory)
    const session = mgr.create()
    expect(factory).toHaveBeenCalledOnce()
    expect(session.transport.sessionId).toBe("test-123")
  })

  it("registers and retrieves session by id", () => {
    const mgr = new SessionManager(() => ({ server: {} as any, transport: {} as any }))
    mgr.register("abc", { server: {} as any, transport: { sessionId: "abc" } as any })
    expect(mgr.get("abc")).toBeDefined()
    expect(mgr.get("nonexistent")).toBeUndefined()
  })

  it("removes session", () => {
    const mgr = new SessionManager(() => ({ server: {} as any, transport: {} as any }))
    mgr.register("abc", { server: {} as any, transport: {} as any })
    mgr.remove("abc")
    expect(mgr.get("abc")).toBeUndefined()
  })

  it("reports session count", () => {
    const mgr = new SessionManager(() => ({ server: {} as any, transport: {} as any }))
    mgr.register("a", { server: {} as any, transport: {} as any })
    mgr.register("b", { server: {} as any, transport: {} as any })
    expect(mgr.size).toBe(2)
  })

  it("closeAll clears all sessions", async () => {
    const mgr = new SessionManager(() => ({ server: {} as any, transport: {} as any }))
    const mockTransport = { close: vi.fn().mockResolvedValue(undefined) }
    const mockServer = { close: vi.fn().mockResolvedValue(undefined) }
    mgr.register("a", { server: mockServer as any, transport: mockTransport as any })
    mgr.register("b", { server: mockServer as any, transport: mockTransport as any })

    await mgr.closeAll()
    expect(mgr.size).toBe(0)
    expect(mockTransport.close).toHaveBeenCalled()
    expect(mockServer.close).toHaveBeenCalled()
  })
})
