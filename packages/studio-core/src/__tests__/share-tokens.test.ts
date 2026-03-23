import { describe, it, expect } from "vitest"
import { generateShareToken, resolveShareToken } from "../share-tokens"

const SECRET = "test-secret-for-share-tokens"

describe("generateShareToken", () => {
  it("returns a string with payload and signature separated by dot", () => {
    const token = generateShareToken(SECRET, "sherpa", "heartbeat/2026-03-21.md")
    expect(token).toContain(".")
    const parts = token.split(".")
    expect(parts).toHaveLength(2)
    expect(parts[0].length).toBeGreaterThan(0)
    expect(parts[1]).toHaveLength(16)
  })

  it("is deterministic — same inputs produce same token", () => {
    const a = generateShareToken(SECRET, "sherpa", "report.md")
    const b = generateShareToken(SECRET, "sherpa", "report.md")
    expect(a).toBe(b)
  })

  it("produces different tokens for different paths", () => {
    const a = generateShareToken(SECRET, "sherpa", "report-a.md")
    const b = generateShareToken(SECRET, "sherpa", "report-b.md")
    expect(a).not.toBe(b)
  })

  it("produces different tokens for different projects", () => {
    const a = generateShareToken(SECRET, "sherpa", "report.md")
    const b = generateShareToken(SECRET, "wavepoint", "report.md")
    expect(a).not.toBe(b)
  })

  it("produces different tokens for different secrets", () => {
    const a = generateShareToken("secret-1", "sherpa", "report.md")
    const b = generateShareToken("secret-2", "sherpa", "report.md")
    expect(a).not.toBe(b)
  })
})

describe("resolveShareToken", () => {
  it("resolves a valid token back to project and relativePath", () => {
    const token = generateShareToken(SECRET, "sherpa", "heartbeat/2026-03-21.md")
    const result = resolveShareToken(SECRET, token)
    expect(result).toEqual({
      project: "sherpa",
      relativePath: "heartbeat/2026-03-21.md",
    })
  })

  it("returns null for a tampered payload", () => {
    const token = generateShareToken(SECRET, "sherpa", "report.md")
    const [, sig] = token.split(".")
    const tamperedPayload = Buffer.from("sherpa:evil.md").toString("base64url")
    const result = resolveShareToken(SECRET, `${tamperedPayload}.${sig}`)
    expect(result).toBeNull()
  })

  it("returns null for a tampered signature", () => {
    const token = generateShareToken(SECRET, "sherpa", "report.md")
    const [payload] = token.split(".")
    const result = resolveShareToken(SECRET, `${payload}.0000000000000000`)
    expect(result).toBeNull()
  })

  it("returns null for garbage input", () => {
    expect(resolveShareToken(SECRET, "not-a-token")).toBeNull()
    expect(resolveShareToken(SECRET, "")).toBeNull()
    expect(resolveShareToken(SECRET, "...")).toBeNull()
  })

  it("returns null for wrong secret", () => {
    const token = generateShareToken(SECRET, "sherpa", "report.md")
    const result = resolveShareToken("wrong-secret", token)
    expect(result).toBeNull()
  })

  it("handles paths with special characters", () => {
    const path = "job-market/2026-03-21-0900-competitive-analysis.md"
    const token = generateShareToken(SECRET, "sherpa", path)
    const result = resolveShareToken(SECRET, token)
    expect(result).toEqual({ project: "sherpa", relativePath: path })
  })
})
