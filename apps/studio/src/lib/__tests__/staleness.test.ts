import { describe, it, expect } from "vitest"
import { getStaleness } from "../staleness"

describe("getStaleness", () => {
  const now = "2026-03-21T16:00:00.000Z"

  it("returns fresh for dates within 2 days", () => {
    expect(getStaleness("2026-03-21", now)).toBe("fresh")
    expect(getStaleness("2026-03-20", now)).toBe("fresh")
  })

  it("returns aging for dates 2-7 days old", () => {
    expect(getStaleness("2026-03-18", now)).toBe("aging")
    expect(getStaleness("2026-03-15", now)).toBe("aging")
  })

  it("returns stale for dates older than 7 days", () => {
    expect(getStaleness("2026-03-12", now)).toBe("stale")
    expect(getStaleness("2026-03-01", now)).toBe("stale")
  })

  it("returns fresh for unparseable dates", () => {
    expect(getStaleness("not-a-date", now)).toBe("fresh")
    expect(getStaleness("", now)).toBe("fresh")
  })
})
