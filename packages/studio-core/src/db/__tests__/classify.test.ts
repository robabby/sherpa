import { describe, it, expect } from "vitest"
import { classifyFile, extractEdgesFromFrontmatter, computeContentHash } from "../classify"

describe("classifyFile", () => {
  it("classifies initiative proposals", () => {
    expect(classifyFile("docs/initiatives/foo/proposal.md")).toEqual({
      kind: "initiative",
      initiative: "foo",
    })
  })

  it("classifies research files", () => {
    expect(classifyFile("docs/initiatives/foo/research/iteration-1/vector-a.md")).toEqual({
      kind: "research",
      initiative: "foo",
    })
  })

  it("classifies task files", () => {
    expect(classifyFile("docs/tasks/fix-bug.md")).toEqual({
      kind: "task",
      initiative: null,
    })
  })

  it("classifies activity files", () => {
    expect(classifyFile("docs/initiatives/foo/activity.md")).toEqual({
      kind: "activity",
      initiative: "foo",
    })
  })

  it("classifies plan files", () => {
    expect(classifyFile("docs/initiatives/foo/plan.md")).toEqual({
      kind: "plan",
      initiative: "foo",
    })
  })

  it("classifies agent role files", () => {
    expect(classifyFile("agents/code-reviewer.md")).toEqual({
      kind: "agent",
      initiative: null,
    })
    expect(classifyFile("docs/agents/roles/planner.md")).toEqual({
      kind: "agent",
      initiative: null,
    })
  })

  it("classifies rule files", () => {
    expect(classifyFile(".claude/rules/effort-estimation.md")).toEqual({
      kind: "rule",
      initiative: null,
    })
  })

  it("classifies skill files", () => {
    expect(classifyFile(".claude/skills/rr/SKILL.md")).toEqual({
      kind: "skill",
      initiative: null,
    })
  })

  it("scopes sub-initiative files to parent", () => {
    expect(classifyFile("docs/initiatives/foo/sub-initiatives/bar/proposal.md")).toEqual({
      kind: null,
      initiative: "foo",
    })
  })

  it("returns null kind for unknown paths", () => {
    expect(classifyFile("README.md")).toEqual({
      kind: null,
      initiative: null,
    })
  })
})

describe("extractEdgesFromFrontmatter", () => {
  it("extracts depends-on edges", () => {
    const edges = extractEdgesFromFrontmatter("my-init", {
      dependencies: ["sqlite-agentic-state", "mcp-coordination-layer"],
    })
    expect(edges).toContainEqual({ source: "my-init", target: "sqlite-agentic-state", kind: "depends-on" })
    expect(edges).toContainEqual({ source: "my-init", target: "mcp-coordination-layer", kind: "depends-on" })
  })

  it("extracts informs edges", () => {
    const edges = extractEdgesFromFrontmatter("my-init", {
      informs: ["studio-desktop-app"],
    })
    expect(edges).toContainEqual({ source: "my-init", target: "studio-desktop-app", kind: "informs" })
  })

  it("extracts spawned-from edge", () => {
    const edges = extractEdgesFromFrontmatter("child", {
      "spawned-from": "parent",
    })
    expect(edges).toContainEqual({ source: "child", target: "parent", kind: "spawned-from" })
  })

  it("extracts targets edges and strips comments", () => {
    const edges = extractEdgesFromFrontmatter("my-init", {
      targets: ["packages/studio-core/src/db/  # (new directory)", "packages/studio-mcp/src/server.ts"],
    })
    expect(edges).toHaveLength(2)
    expect(edges[0]!.target).toBe("packages/studio-core/src/db/")
    expect(edges[1]!.target).toBe("packages/studio-mcp/src/server.ts")
  })

  it("handles missing fields gracefully", () => {
    expect(extractEdgesFromFrontmatter("my-init", {})).toEqual([])
  })

  it("ignores null spawned-from", () => {
    const edges = extractEdgesFromFrontmatter("my-init", { "spawned-from": null })
    expect(edges).toEqual([])
  })
})

describe("computeContentHash", () => {
  it("returns consistent SHA-256 hex", () => {
    const hash1 = computeContentHash("hello world")
    const hash2 = computeContentHash("hello world")
    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/)
  })

  it("changes when content changes", () => {
    expect(computeContentHash("hello")).not.toBe(computeContentHash("world"))
  })
})
