import { describe, it, expect } from "vitest"
import { resolveRoute, DEFAULT_DISPATCH } from "@sherpa/studio-core"
import type { Backend } from "@sherpa/studio-core"

describe("task_create routing via resolveRoute", () => {
  it("routes research tasks to groq", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "research", "interactive")
    expect(route.backend).toBe("groq")
  })

  it("routes code-implementation to claude", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "code-implementation", "interactive")
    expect(route.backend).toBe("claude")
  })

  it("uses explicit backend override", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "research", "interactive", {
      backend: "gemini" as Backend,
    })
    expect(route.backend).toBe("gemini")
  })

  it("falls back to config fallback for unknown task type", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "general", "interactive")
    expect(route.backend).toBe(DEFAULT_DISPATCH.fallback.backend)
  })

  it("falls back for completely unknown task type", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "unknown-type", "interactive")
    // unknown types have no route, so fall back to config fallback
    expect(route.backend).toBe(DEFAULT_DISPATCH.fallback.backend)
  })
})
