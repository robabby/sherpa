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
