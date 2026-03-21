import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { scanResearchFiles } from "../research-files"

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-research-test-"))
})

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe("scanResearchFiles", () => {
  it("returns empty array when .sherpa/research/ does not exist", () => {
    expect(scanResearchFiles(tmpDir)).toEqual([])
  })

  it("scans top-level markdown files", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "2026-03-20.md"),
      "---\ntitle: Test Report\ndate: 2026-03-20\n---\n# Test Report\nContent here.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatchObject({
      title: "Test Report",
      date: "2026-03-20",
      category: "",
      slug: "2026-03-20",
    })
  })

  it("scans category subdirectories", () => {
    const catDir = path.join(tmpDir, ".sherpa", "research", "job-market")
    fs.mkdirSync(catDir, { recursive: true })
    fs.writeFileSync(
      path.join(catDir, "2026-03-20.md"),
      "---\ntitle: Job Market Report\ndate: 2026-03-20\n---\nContent.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatchObject({
      title: "Job Market Report",
      category: "job-market",
      slug: "job-market/2026-03-20",
    })
  })

  it("sorts by date descending", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "old.md"),
      "---\ntitle: Old\ndate: 2026-03-01\n---\n",
    )
    fs.writeFileSync(
      path.join(researchDir, "new.md"),
      "---\ntitle: New\ndate: 2026-03-20\n---\n",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files[0]!.title).toBe("New")
    expect(files[1]!.title).toBe("Old")
  })

  it("falls back to H1 heading when no frontmatter title", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "report.md"),
      "# My Heading\nSome content.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files[0]!.title).toBe("My Heading")
  })
})
