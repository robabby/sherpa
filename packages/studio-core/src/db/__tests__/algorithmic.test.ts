import { describe, it, expect } from "vitest"
import { AlgorithmicBackend } from "../../knowledge/algorithmic"

describe("AlgorithmicBackend", () => {
  const backend = new AlgorithmicBackend()

  describe("embed", () => {
    it("returns a numeric vector", () => {
      const vec = backend.embed("hello world testing")
      expect(Array.isArray(vec)).toBe(true)
      expect(vec.length).toBeGreaterThan(0)
      expect(vec.every(v => typeof v === "number")).toBe(true)
    })

    it("returns consistent vectors for same input", () => {
      const v1 = backend.embed("hello world")
      const v2 = backend.embed("hello world")
      expect(v1).toEqual(v2)
    })

    it("returns different-length vectors for inputs with different token counts", () => {
      const v1 = backend.embed("sqlite database")
      const v2 = backend.embed("sqlite database storage query index")
      expect(v1.length).not.toBe(v2.length)
    })
  })

  describe("summarize", () => {
    it("extracts title and status from markdown with frontmatter", () => {
      const md = [
        "---", "status: approved", "---", "",
        "# My Initiative", "", "## Summary", "",
        "This does important things.", "", "## Rationale", "",
        "Because of strong reasons.",
      ].join("\n")
      const summary = backend.summarize(md, 200)
      expect(summary).toContain("My Initiative")
      expect(summary).toContain("approved")
    })

    it("respects maxTokens by truncating", () => {
      const md = "# Title\n\n## Summary\n\n" + "word ".repeat(500)
      const short = backend.summarize(md, 30)
      expect(short.length).toBeLessThan(150)
    })

    it("handles markdown without frontmatter", () => {
      const md = "# Just a Title\n\nSome content here."
      const summary = backend.summarize(md, 200)
      expect(summary).toContain("Just a Title")
    })

    it("extracts first sentence from each H2 section", () => {
      const md = [
        "# Title", "",
        "## Summary", "", "This is the summary sentence.", "",
        "## Rationale", "", "This is the rationale sentence.",
      ].join("\n")
      const summary = backend.summarize(md, 500)
      expect(summary).toContain("Summary:")
      expect(summary).toContain("Rationale:")
    })
  })

  describe("cosineSimilarity", () => {
    it("returns 1.0 for identical vectors", () => {
      const v = backend.embed("hello world test")
      expect(backend.cosineSimilarity(v, v)).toBeCloseTo(1.0, 5)
    })

    it("returns higher similarity for related content", () => {
      const v1 = backend.embed("sqlite database WAL mode concurrent access")
      const v2 = backend.embed("sqlite agentic state store database coordination")
      const v3 = backend.embed("react component button accessibility design")
      const simRelated = backend.cosineSimilarity(v1, v2)
      const simUnrelated = backend.cosineSimilarity(v1, v3)
      expect(simRelated).toBeGreaterThan(simUnrelated)
    })

    it("returns 0 for orthogonal vectors", () => {
      expect(backend.cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0)
    })

    it("handles empty vectors", () => {
      expect(backend.cosineSimilarity([], [])).toBe(0)
    })

    it("handles mismatched lengths", () => {
      expect(backend.cosineSimilarity([1, 2], [1, 2, 3])).toBe(0)
    })
  })

  describe("buildCorpusIndex + embedWithCorpus", () => {
    it("builds index and embeds documents against corpus IDF", () => {
      const b = new AlgorithmicBackend()
      b.buildCorpusIndex([
        { id: "a", text: "sqlite database WAL mode concurrent" },
        { id: "b", text: "react component button style accessibility" },
        { id: "c", text: "sqlite agentic state coordination database" },
      ])

      const va = b.embedWithCorpus("a")
      const vb = b.embedWithCorpus("b")
      const vc = b.embedWithCorpus("c")

      expect(va).not.toBeNull()
      expect(vb).not.toBeNull()
      expect(vc).not.toBeNull()

      // sqlite docs should be more similar to each other than to react
      const simAC = b.cosineSimilarity(va!, vc!)
      const simAB = b.cosineSimilarity(va!, vb!)
      expect(simAC).toBeGreaterThan(simAB)
    })

    it("returns null for unknown document id", () => {
      const b = new AlgorithmicBackend()
      b.buildCorpusIndex([{ id: "x", text: "hello" }])
      expect(b.embedWithCorpus("unknown")).toBeNull()
    })
  })

  describe("embedQuery", () => {
    it("embeds a query against the corpus vocabulary", () => {
      const b = new AlgorithmicBackend()
      b.buildCorpusIndex([
        { id: "a", text: "sqlite database WAL mode" },
        { id: "b", text: "react component button" },
      ])

      const queryVec = b.embedQuery("sqlite WAL concurrent")
      const va = b.embedWithCorpus("a")!
      const vb = b.embedWithCorpus("b")!

      // Query about sqlite should be more similar to doc a
      expect(b.cosineSimilarity(queryVec, va)).toBeGreaterThan(
        b.cosineSimilarity(queryVec, vb)
      )
    })
  })
})
