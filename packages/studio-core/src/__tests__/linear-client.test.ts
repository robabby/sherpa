import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock @linear/sdk before importing the module under test
vi.mock("@linear/sdk", () => {
  class MockLinearClient {
    _apiKey: string
    constructor(opts: { apiKey: string }) {
      this._apiKey = opts.apiKey
    }
  }
  return { LinearClient: MockLinearClient }
})

// Dynamic import so the mock is in place before module evaluation
const { createLinearClient, getLinearClient, resetLinearClient } = await import(
  "../linear-client"
)

describe("linear-client", () => {
  beforeEach(() => {
    resetLinearClient()
    delete process.env.SHERPA_LINEAR_API_KEY
  })

  describe("createLinearClient", () => {
    it("creates a client with an explicit apiKey", () => {
      const client = createLinearClient({ apiKey: "test-key-123" })
      expect(client).toBeDefined()
      expect((client as any)._apiKey).toBe("test-key-123")
    })

    it("reads apiKey from SHERPA_LINEAR_API_KEY env var", () => {
      process.env.SHERPA_LINEAR_API_KEY = "env-key-456"
      const client = createLinearClient()
      expect(client).toBeDefined()
      expect((client as any)._apiKey).toBe("env-key-456")
    })

    it("prefers explicit apiKey over env var", () => {
      process.env.SHERPA_LINEAR_API_KEY = "env-key-456"
      const client = createLinearClient({ apiKey: "explicit-key" })
      expect((client as any)._apiKey).toBe("explicit-key")
    })

    it("throws when no API key is available", () => {
      expect(() => createLinearClient()).toThrow(
        /Linear API key not found/
      )
    })
  })

  describe("getLinearClient", () => {
    it("returns a cached singleton", () => {
      process.env.SHERPA_LINEAR_API_KEY = "singleton-key"
      const a = getLinearClient()
      const b = getLinearClient()
      expect(a).toBe(b)
    })

    it("throws when no API key is available", () => {
      expect(() => getLinearClient()).toThrow(/Linear API key not found/)
    })
  })

  describe("resetLinearClient", () => {
    it("clears the cached instance so next call creates a new one", () => {
      process.env.SHERPA_LINEAR_API_KEY = "key-1"
      const first = getLinearClient()

      resetLinearClient()

      process.env.SHERPA_LINEAR_API_KEY = "key-2"
      const second = getLinearClient()

      expect(first).not.toBe(second)
      expect((second as any)._apiKey).toBe("key-2")
    })
  })
})
