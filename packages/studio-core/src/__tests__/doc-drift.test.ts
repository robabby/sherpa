import { describe, it, expect } from "vitest"
import { computeState } from "../doc-tree-types"
import type { Provenance, DocDrift } from "../doc-tree-types"
import { computeDocDrift } from "../doc-drift"

const base: Provenance = {
  docType: "architecture",
  maintainedBy: "self-documenting-system",
  authoredBy: "ai",
  reviewedBy: null,
  lastUpdated: null,
  lastVerified: null,
  sourceInitiatives: [],
}

const staleDrift: DocDrift = { relatedPaths: ["src/x.ts"], commitsSinceVerified: 3, isStale: true }
const freshDrift: DocDrift = { relatedPaths: ["src/x.ts"], commitsSinceVerified: 0, isStale: false }

describe("computeState", () => {
  it("is human-owned when not maintained by the system", () => {
    expect(computeState({ ...base, maintainedBy: "human" })).toBe("human-owned")
    expect(computeState({ ...base, maintainedBy: null })).toBe("human-owned")
  })

  it("is verified when reviewed and not drifted", () => {
    expect(computeState({ ...base, reviewedBy: "human" })).toBe("verified")
    expect(computeState({ ...base, reviewedBy: "ai" })).toBe("verified")
  })

  it("is awaiting-review when maintained but unreviewed", () => {
    expect(computeState({ ...base, reviewedBy: null })).toBe("awaiting-review")
  })

  it("is stale when a maintained doc has drifted", () => {
    expect(computeState({ ...base, reviewedBy: "human" }, staleDrift)).toBe("stale")
  })

  it("ignores drift for human-owned docs", () => {
    expect(computeState({ ...base, maintainedBy: "human" }, staleDrift)).toBe("human-owned")
  })

  it("is not stale when drift is present but isStale is false", () => {
    expect(computeState({ ...base, reviewedBy: "human" }, freshDrift)).toBe("verified")
  })
})

describe("computeDocDrift — not-applicable guards (no git invoked)", () => {
  const index = new Map<string, string[]>([["init-a", ["packages/studio-core/src/x.ts"]]])

  it("returns null for human-owned docs", () => {
    expect(
      computeDocDrift(
        { ...base, maintainedBy: "human", lastVerified: "2026-01-01", sourceInitiatives: ["init-a"] },
        index,
      ),
    ).toBeNull()
  })

  it("returns null without a last-verified date", () => {
    expect(
      computeDocDrift({ ...base, lastVerified: null, sourceInitiatives: ["init-a"] }, index),
    ).toBeNull()
  })

  it("returns null without source initiatives", () => {
    expect(
      computeDocDrift({ ...base, lastVerified: "2026-01-01", sourceInitiatives: [] }, index),
    ).toBeNull()
  })

  it("returns null when source initiatives resolve to no target paths", () => {
    expect(
      computeDocDrift(
        { ...base, lastVerified: "2026-01-01", sourceInitiatives: ["unknown-initiative"] },
        index,
      ),
    ).toBeNull()
  })
})
