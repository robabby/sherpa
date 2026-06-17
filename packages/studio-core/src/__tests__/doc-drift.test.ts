import { describe, it, expect } from "vitest"
import { computeState, collectStaleDocs } from "../doc-tree-types"
import type {
  Provenance,
  DocDrift,
  DocTreeNode,
  DocTreeSection,
  ProvenanceState,
} from "../doc-tree-types"
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

describe("collectStaleDocs — reverse mapping (doc → initiative)", () => {
  const drift = (commits: number): DocDrift => ({
    relatedPaths: ["packages/studio-core/src/x.ts"],
    commitsSinceVerified: commits,
    isStale: commits > 0,
  })

  /** Build a DocTreeNode fixture; stale nodes carry drift, others don't. */
  const mk = (
    slug: string,
    state: ProvenanceState,
    sourceInitiatives: string[],
    commits = 3,
    children: DocTreeNode[] = [],
  ): DocTreeNode => ({
    slug,
    title: `Title ${slug}`,
    relativePath: `docs/${slug}/index.md`,
    provenance: { ...base, sourceInitiatives },
    state,
    children,
    lineCount: 42,
    drift: state === "stale" ? drift(commits) : null,
  })

  it("collects a stale doc and indexes it under its source initiative", () => {
    const sections: DocTreeSection[] = [
      { label: "Architecture", nodes: [mk("a", "stale", ["init-a"], 5)] },
    ]
    const { byInitiative, staleDocs } = collectStaleDocs(sections)
    expect(staleDocs).toHaveLength(1)
    expect(staleDocs[0]).toMatchObject({
      slug: "a",
      title: "Title a",
      relativePath: "docs/a/index.md",
      commitsSinceVerified: 5,
    })
    expect(byInitiative.get("init-a")).toHaveLength(1)
    expect(byInitiative.get("init-a")?.[0].slug).toBe("a")
  })

  it("indexes a two-source doc under both initiatives but counts it once", () => {
    const sections: DocTreeSection[] = [
      { label: "Architecture", nodes: [mk("a", "stale", ["init-a", "init-b"])] },
    ]
    const { byInitiative, staleDocs } = collectStaleDocs(sections)
    expect(staleDocs).toHaveLength(1)
    expect(byInitiative.get("init-a")?.[0].slug).toBe("a")
    expect(byInitiative.get("init-b")?.[0].slug).toBe("a")
  })

  it("ignores docs that are not stale", () => {
    const sections: DocTreeSection[] = [
      {
        label: "Architecture",
        nodes: [
          mk("v", "verified", ["init-a"]),
          mk("aw", "awaiting-review", ["init-a"]),
          mk("h", "human-owned", []),
        ],
      },
    ]
    const { byInitiative, staleDocs } = collectStaleDocs(sections)
    expect(staleDocs).toHaveLength(0)
    expect(byInitiative.size).toBe(0)
  })

  it("recurses into nested children", () => {
    const child = mk("parent/child", "stale", ["init-c"], 7)
    const parent = mk("parent", "verified", ["init-a"], 0, [child])
    const sections: DocTreeSection[] = [{ label: "Architecture", nodes: [parent] }]
    const { byInitiative, staleDocs } = collectStaleDocs(sections)
    expect(staleDocs.map((d) => d.slug)).toEqual(["parent/child"])
    expect(byInitiative.get("init-c")?.[0].commitsSinceVerified).toBe(7)
    expect(byInitiative.has("init-a")).toBe(false)
  })

  it("groups multiple stale docs under a shared initiative", () => {
    const sections: DocTreeSection[] = [
      {
        label: "Architecture",
        nodes: [mk("a", "stale", ["shared"]), mk("b", "stale", ["shared"])],
      },
    ]
    const { byInitiative, staleDocs } = collectStaleDocs(sections)
    expect(staleDocs).toHaveLength(2)
    expect(byInitiative.get("shared")?.map((d) => d.slug)).toEqual(["a", "b"])
  })
})
