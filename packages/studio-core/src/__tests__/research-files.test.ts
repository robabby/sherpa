import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { scanResearchFiles, parseResearchState } from "../research-files"

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

  it("excludes operational files (ALL_CAPS names) at root level", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n",
    )
    fs.writeFileSync(
      path.join(researchDir, "PRIORITIES.md"),
      "## Current Priorities\n\n1. Ship Studio\n",
    )
    fs.writeFileSync(
      path.join(researchDir, "2026-03-21.md"),
      "---\ntitle: Real Research\ndate: 2026-03-21\n---\nContent.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files).toHaveLength(1)
    expect(files[0]!.title).toBe("Real Research")
  })

  it("extracts summary and trigger from frontmatter", () => {
    const catDir = path.join(tmpDir, ".sherpa", "research", "heartbeat")
    fs.mkdirSync(catDir, { recursive: true })
    fs.writeFileSync(
      path.join(catDir, "2026-03-21-1030-test-topic.md"),
      "---\ntitle: Test Topic\ndate: 2026-03-21\ncategory: heartbeat\ntrigger: >\n  priority queue item\nsummary: >\n  Found three key insights about the topic.\n---\n# Test Topic\nContent.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatchObject({
      summary: "Found three key insights about the topic.",
      trigger: "priority queue item",
    })
  })

  it("returns undefined summary and trigger when not in frontmatter", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "plain.md"),
      "---\ntitle: Plain\ndate: 2026-03-21\n---\nContent.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files[0]!.summary).toBeUndefined()
    expect(files[0]!.trigger).toBeUndefined()
  })
})

describe("parseResearchState", () => {
  it("returns null when RESEARCH_STATE.md does not exist", () => {
    expect(parseResearchState(tmpDir)).toBeNull()
  })

  it("parses last updated timestamp", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n\n## Coverage Map\n\n| Stream | Last Run | Findings |\n|---|---|---|\n| job-market | 2026-03-21 | Strong demand |\n\n## Dangling Threads\n\n1. CRITICAL: API rate limits hitting ceiling\n2. Monitor competitor pricing changes\n\n## Research Queue\n\n1. ~~Deep dive on Stripe~~ ✅\n2. Analyze consulting market trends\n3. ~~Review network contacts~~ ✅\n",
    )
    const state = parseResearchState(tmpDir)
    expect(state).not.toBeNull()
    expect(state!.lastUpdated).toBe("2026-03-21T14:30:00-07:00")
  })

  it("parses coverage map table", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n\n## Coverage Map\n\n| Stream | Last Run | Findings |\n|---|---|---|\n| job-market | 2026-03-21 | Strong demand |\n| competitive | 2026-03-20 | New entrants |\n",
    )
    const state = parseResearchState(tmpDir)
    expect(state!.coverageMap).toHaveLength(2)
    expect(state!.coverageMap[0]).toEqual({
      stream: "job-market",
      lastRun: "2026-03-21",
      findings: "Strong demand",
    })
  })

  it("parses dangling threads with severity", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n\n## Dangling Threads\n\n1. CRITICAL: API rate limits hitting ceiling\n2. Monitor competitor pricing changes\n",
    )
    const state = parseResearchState(tmpDir)
    expect(state!.danglingThreads).toHaveLength(2)
    expect(state!.danglingThreads[0]).toEqual({
      text: "CRITICAL: API rate limits hitting ceiling",
      severity: "CRITICAL",
    })
    expect(state!.danglingThreads[1]).toEqual({
      text: "Monitor competitor pricing changes",
      severity: null,
    })
  })

  it("parses research queue with completion status", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n\n## Research Queue\n\n1. ~~Deep dive on Stripe~~ ✅\n2. Analyze consulting market trends\n",
    )
    const state = parseResearchState(tmpDir)
    expect(state!.researchQueue).toHaveLength(2)
    expect(state!.researchQueue[0]).toEqual({
      text: "Deep dive on Stripe",
      completed: true,
    })
    expect(state!.researchQueue[1]).toEqual({
      text: "Analyze consulting market trends",
      completed: false,
    })
  })
})
