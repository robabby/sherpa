import { describe, it, expect, afterEach } from "vitest"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import {
  listInitiatives,
  getInitiative,
  getSeeds,
  createInitiative,
} from "../initiative-ops"

function writeProposal(
  root: string,
  slug: string,
  frontmatter: Record<string, unknown>,
  body: string,
) {
  const dir = path.join(root, "docs/initiatives", slug)
  fs.mkdirSync(dir, { recursive: true })
  const yaml = Object.entries(frontmatter)
    .map(([k, v]) => {
      if (Array.isArray(v))
        return `${k}:\n${v.map((i) => `  - ${i}`).join("\n")}`
      return `${k}: ${v ?? "null"}`
    })
    .join("\n")
  fs.writeFileSync(
    path.join(dir, "proposal.md"),
    `---\n${yaml}\n---\n${body}`,
  )
}

let tmpDir: string

afterEach(() => {
  if (tmpDir) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

function makeTmp(): string {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-test-"))
  return tmpDir
}

describe("listInitiatives", () => {
  it("returns empty array for empty directory", () => {
    const root = makeTmp()
    fs.mkdirSync(path.join(root, "docs/initiatives"), { recursive: true })
    const result = listInitiatives(root)
    expect(result).toEqual([])
  })

  it("parses data from proposal.md", () => {
    const root = makeTmp()
    writeProposal(
      root,
      "my-initiative",
      {
        status: "pending",
        initiative: "my-initiative",
        created: "2026-01-01",
        updated: "2026-01-02",
        type: "new-skill",
        risk: "additive",
        targets: ["docs/foo.md"],
        dependencies: ["other-init"],
      },
      "# My Initiative\n\n## Summary\n\nThis is a test initiative.",
    )

    const result = listInitiatives(root)
    expect(result).toHaveLength(1)
    const entry = result[0]!
    expect(entry.slug).toBe("my-initiative")
    expect(entry.status).toBe("pending")
    expect(entry.title).toBe("My Initiative")
    expect(entry.summary).toBe("This is a test initiative.")
    expect(entry.type).toBe("new-skill")
    expect(entry.risk).toBe("additive")
  })

  it("filters by status", () => {
    const root = makeTmp()
    writeProposal(root, "alpha", {
      status: "pending",
      initiative: "alpha",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# Alpha")
    writeProposal(root, "beta", {
      status: "approved",
      initiative: "beta",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# Beta")
    writeProposal(root, "gamma", {
      status: "in-progress",
      initiative: "gamma",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# Gamma")

    const pending = listInitiatives(root, { status: "pending" })
    expect(pending).toHaveLength(1)
    expect(pending[0]!.slug).toBe("alpha")

    const approved = listInitiatives(root, { status: "approved" })
    expect(approved).toHaveLength(1)
    expect(approved[0]!.slug).toBe("beta")
  })

  it("skips .archive directory", () => {
    const root = makeTmp()
    writeProposal(root, "active-one", {
      status: "pending",
      initiative: "active-one",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# Active One")

    // Create an archived initiative
    const archiveDir = path.join(root, "docs/initiatives/.archive/old-one")
    fs.mkdirSync(archiveDir, { recursive: true })
    fs.writeFileSync(
      path.join(archiveDir, "proposal.md"),
      "---\nstatus: archived\ninitiative: old-one\ncreated: 2025-01-01\nupdated: 2025-01-01\n---\n# Old One",
    )

    const result = listInitiatives(root)
    expect(result).toHaveLength(1)
    expect(result[0]!.slug).toBe("active-one")
  })
})

describe("getInitiative", () => {
  it("returns null for nonexistent slug", () => {
    const root = makeTmp()
    fs.mkdirSync(path.join(root, "docs/initiatives"), { recursive: true })
    const result = getInitiative(root, "nonexistent")
    expect(result).toBeNull()
  })

  it("returns full detail with plan, activity, and lifecycle", () => {
    const root = makeTmp()
    writeProposal(root, "full-init", {
      status: "approved",
      initiative: "full-init",
      created: "2026-01-01",
      updated: "2026-01-15",
      type: "new-skill",
      risk: "evolutionary",
      targets: ["packages/core"],
      dependencies: ["dep-a"],
    }, "# Full Initiative\n\n## Summary\n\nA complete initiative with all files.")

    const initDir = path.join(root, "docs/initiatives/full-init")

    // Add plan.md
    fs.writeFileSync(
      path.join(initDir, "plan.md"),
      "---\n---\n# Implementation Plan\n\nStep 1: Do the thing.",
    )

    // Add activity.md with worktree field
    fs.writeFileSync(
      path.join(initDir, "activity.md"),
      "---\nstarted: 2026-01-10\nworktree: .worktrees/full-init\n---\n# Activity\n\n- **2026-01-10** — Started implementation",
    )

    // Add research directory with iteration files
    const researchDir = path.join(initDir, "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "iteration-1.md"),
      "# Iteration 1\n\nResearch findings.",
    )
    fs.writeFileSync(
      path.join(researchDir, "iteration-2.md"),
      "# Iteration 2\n\nMore findings.",
    )

    const result = getInitiative(root, "full-init")
    expect(result).not.toBeNull()
    expect(result!.slug).toBe("full-init")
    expect(result!.status).toBe("approved")
    expect(result!.title).toBe("Full Initiative")
    expect(result!.summary).toBe("A complete initiative with all files.")
    expect(result!.hasPlan).toBe(true)
    expect(result!.hasActivity).toBe(true)
    expect(result!.lifecycle.stage).toBe("in-flight") // worktree is set → active
    expect(result!.type).toBe("new-skill")
    expect(result!.risk).toBe("evolutionary")
    expect(result!.plan).toContain("Step 1")
    expect(result!.activity).toContain("Started implementation")
    expect(result!.proposal).toContain("Full Initiative")
    expect(result!.seeds).toBeInstanceOf(Array)
    expect(result!.subdirectories.length).toBeGreaterThan(0)
  })

  it("computes lifecycle as needs-plan when approved without plan", () => {
    const root = makeTmp()
    writeProposal(root, "no-plan", {
      status: "approved",
      initiative: "no-plan",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# No Plan Yet")

    const result = getInitiative(root, "no-plan")
    expect(result).not.toBeNull()
    expect(result!.hasPlan).toBe(false)
    expect(result!.lifecycle.stage).toBe("needs-plan")
    expect(typeof result!.proposal).toBe("string")
  })
})

describe("getSeeds", () => {
  it("returns empty array when no seeds section exists", () => {
    const root = makeTmp()
    writeProposal(root, "seedless", {
      status: "integrated",
      initiative: "seedless",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# Seedless")

    const initDir = path.join(root, "docs/initiatives/seedless")
    fs.writeFileSync(
      path.join(initDir, "activity.md"),
      "---\nstarted: 2026-01-01\n---\n# Activity\n\n- **2026-01-01** — Completed work",
    )

    const seeds = getSeeds(root, "seedless")
    expect(seeds).toEqual([])
  })

  it("extracts seeds from activity.md", () => {
    const root = makeTmp()
    writeProposal(root, "with-seeds", {
      status: "integrated",
      initiative: "with-seeds",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# With Seeds")

    const initDir = path.join(root, "docs/initiatives/with-seeds")
    fs.writeFileSync(
      path.join(initDir, "activity.md"),
      [
        "---",
        "started: 2026-01-01",
        "---",
        "# Activity",
        "",
        "- **2026-01-01** — Completed work",
        "",
        "## Seeds",
        "",
        "- Add support for bulk operations",
        "- Investigate caching strategies for large datasets",
        "- Consider adding webhook notifications",
      ].join("\n"),
    )

    const seeds = getSeeds(root, "with-seeds")
    expect(seeds).toHaveLength(3)
    expect(seeds[0]).toBe("Add support for bulk operations")
    expect(seeds[1]).toBe("Investigate caching strategies for large datasets")
    expect(seeds[2]).toBe("Consider adding webhook notifications")
  })

  it("returns empty array when activity.md does not exist", () => {
    const root = makeTmp()
    writeProposal(root, "no-activity", {
      status: "pending",
      initiative: "no-activity",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# No Activity")

    const seeds = getSeeds(root, "no-activity")
    expect(seeds).toEqual([])
  })
})

describe("createInitiative", () => {
  it("creates directory and proposal.md with valid frontmatter", () => {
    const root = makeTmp()
    fs.mkdirSync(path.join(root, "docs/initiatives"), { recursive: true })

    const result = createInitiative(root, {
      slug: "new-feature",
      title: "New Feature",
      summary: "A brand new feature for the system.",
      body: "This proposal introduces a new feature.",
      type: "new-plan",
      risk: "additive",
      targets: ["packages/core"],
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe("docs/initiatives/new-feature/proposal.md")
    }

    const filePath = path.join(
      root,
      "docs/initiatives/new-feature/proposal.md",
    )
    expect(fs.existsSync(filePath)).toBe(true)

    const content = fs.readFileSync(filePath, "utf-8")
    expect(content).toContain("status: pending")
    expect(content).toContain("initiative: new-feature")
    expect(content).toContain("type: new-plan")
    expect(content).toContain("risk: additive")
    expect(content).toContain("# New Feature")
  })

  it("rejects invalid slug format", () => {
    const root = makeTmp()
    fs.mkdirSync(path.join(root, "docs/initiatives"), { recursive: true })

    const result = createInitiative(root, {
      slug: "Invalid Slug!",
      title: "Bad Slug",
      summary: "This should fail.",
      body: "Body text.",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain("slug")
    }
  })

  it("rejects duplicate slug", () => {
    const root = makeTmp()
    writeProposal(root, "existing-init", {
      status: "pending",
      initiative: "existing-init",
      created: "2026-01-01",
      updated: "2026-01-01",
    }, "# Existing Initiative")

    const result = createInitiative(root, {
      slug: "existing-init",
      title: "Duplicate",
      summary: "This should fail.",
      body: "Body text.",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain("already exists")
    }
  })
})
