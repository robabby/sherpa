# Expose Initiative System via MCP — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add initiative lifecycle CRUD to the MCP server so any agent runtime can propose work, check what's in flight, and participate in governance through a standard protocol.

**Architecture:** Filesystem-backed operations module in studio-core (`initiatives.ts`) following the task tools pattern — raw `fs` with explicit `root` parameter, Zod-validated frontmatter, structured results. MCP registration in a separate file (`initiative/tools.ts`) following the authority tools pattern. Governance policy from `defineConfig()` gates agent approval. Authority checking optional (when coordination DB available).

**Tech Stack:** TypeScript, vitest, Zod, gray-matter, MCP SDK (`@modelcontextprotocol/sdk`), better-sqlite3 (authority)

**Key references:**
- Task tools pattern: `packages/studio-mcp/src/server.ts:237-555`
- Authority tools pattern: `packages/studio-mcp/src/authority/tools.ts`
- Initiative types/schemas: `packages/studio-core/src/types.ts:96-157`, `schemas.ts:19-37`
- Lifecycle detection: `packages/studio-core/src/lifecycle.ts`
- Config system: `packages/studio-core/src/config/types.ts`, `schema.ts`, `defaults.ts`
- Domain reads: `packages/studio-core/src/domain.ts:96-141`
- Markdown parsing: `packages/studio-core/src/markdown.ts`

**Sessions:** 3 sessions, 8 tasks

---

## Session 1: Initiative Operations Module

### Task 1: Read operations — listInitiatives, getInitiative, getSeeds

**Files:**
- Create: `packages/studio-core/src/__tests__/initiatives.test.ts`
- Create: `packages/studio-core/src/initiative-ops.ts`

**Step 1: Write the failing tests for read operations**

```typescript
// packages/studio-core/src/__tests__/initiatives.test.ts
import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {
  listInitiatives,
  getInitiative,
  getSeeds,
} from "../initiative-ops"

function writeProposal(root: string, slug: string, frontmatter: Record<string, unknown>, body: string) {
  const dir = path.join(root, "docs/initiatives", slug)
  fs.mkdirSync(dir, { recursive: true })
  const yaml = Object.entries(frontmatter)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map(i => `  - ${i}`).join("\n")}`
      return `${k}: ${v ?? "null"}`
    })
    .join("\n")
  fs.writeFileSync(path.join(dir, "proposal.md"), `---\n${yaml}\n---\n${body}`)
}

describe("listInitiatives", () => {
  let root: string

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
  })

  it("returns empty array when no initiatives exist", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    const result = listInitiatives(root)
    expect(result).toEqual([])
  })

  it("returns parsed initiatives from proposal.md files", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "test-init", {
      status: "pending",
      initiative: "test-init",
      created: "2026-03-17",
      updated: "2026-03-17",
      type: "new-plan",
      risk: "additive",
      targets: ["src/foo.ts"],
      dependencies: [],
    }, "# Test Initiative\n\n## Summary\n\nA test initiative.")

    const result = listInitiatives(root)
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe("test-init")
    expect(result[0].status).toBe("pending")
    expect(result[0].title).toBe("Test Initiative")
    expect(result[0].summary).toBe("A test initiative.")
  })

  it("filters by status", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "alpha", {
      status: "pending", initiative: "alpha",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# Alpha\n\n## Summary\n\nAlpha.")
    writeProposal(root, "beta", {
      status: "approved", initiative: "beta",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# Beta\n\n## Summary\n\nBeta.")

    const pending = listInitiatives(root, { status: "pending" })
    expect(pending).toHaveLength(1)
    expect(pending[0].slug).toBe("alpha")
  })

  it("skips .archive directory", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    const archiveDir = path.join(root, "docs/initiatives/.archive/old-init")
    fs.mkdirSync(archiveDir, { recursive: true })
    fs.writeFileSync(path.join(archiveDir, "proposal.md"), "---\nstatus: archived\ninitiative: old-init\ncreated: 2026-01-01\nupdated: 2026-01-01\n---\n# Old")

    const result = listInitiatives(root)
    expect(result).toEqual([])
  })
})

describe("getInitiative", () => {
  let root: string

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
  })

  it("returns null for nonexistent slug", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    expect(getInitiative(root, "nope")).toBeNull()
  })

  it("returns full detail including plan and activity", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "full-init", {
      status: "in-progress", initiative: "full-init",
      created: "2026-03-17", updated: "2026-03-17",
      type: "new-plan", risk: "evolutionary",
    }, "# Full Initiative\n\n## Summary\n\nFull detail test.")

    const dir = path.join(root, "docs/initiatives/full-init")
    fs.writeFileSync(path.join(dir, "plan.md"), "# Implementation Plan\n\nStep 1...")
    fs.writeFileSync(path.join(dir, "activity.md"), "---\nstarted: 2026-03-17\nworktree: null\n---\n\n- **2026-03-17** — Started implementation")

    const result = getInitiative(root, "full-init")
    expect(result).not.toBeNull()
    expect(result!.slug).toBe("full-init")
    expect(result!.title).toBe("Full Initiative")
    expect(result!.plan).toContain("Step 1")
    expect(result!.activity).toContain("Started implementation")
    expect(result!.lifecycle.stage).toBe("in-flight")
  })
})

describe("getSeeds", () => {
  let root: string

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
  })

  it("returns empty array when no seeds section", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "no-seeds", {
      status: "integrated", initiative: "no-seeds",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# No Seeds")
    const dir = path.join(root, "docs/initiatives/no-seeds")
    fs.writeFileSync(path.join(dir, "activity.md"), "---\nstarted: 2026-03-17\nworktree: null\n---\n\n- **2026-03-17** — Done")

    expect(getSeeds(root, "no-seeds")).toEqual([])
  })

  it("extracts seeds from activity.md", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "with-seeds", {
      status: "integrated", initiative: "with-seeds",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# With Seeds")
    const dir = path.join(root, "docs/initiatives/with-seeds")
    fs.writeFileSync(path.join(dir, "activity.md"),
      "---\nstarted: 2026-03-17\nworktree: null\n---\n\n- **2026-03-17** — Done\n\n## Seeds\n\n- Add caching layer for list queries\n- Support bulk status transitions\n- Add webhook notifications on status change\n")

    const seeds = getSeeds(root, "with-seeds")
    expect(seeds).toHaveLength(3)
    expect(seeds[0]).toContain("caching layer")
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run packages/studio-core/src/__tests__/initiatives.test.ts`
Expected: FAIL — module `../initiative-ops` not found

**Step 3: Implement read operations**

```typescript
// packages/studio-core/src/initiative-ops.ts
import fs from "node:fs"
import path from "node:path"
import { initiativeFrontmatterSchema } from "./schemas"
import { detectLifecycle } from "./lifecycle"
import {
  parseFrontmatter,
  parseValidatedFrontmatter,
  extractTitle,
  extractSummarySection,
  extractSection,
  parseActivityLog,
} from "./markdown"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InitiativeListEntry {
  slug: string
  status: string
  type: string | null
  risk: string | null
  title: string
  summary: string
  created: string
  updated: string
  targets: string[]
  dependencies: string[]
  spawnedFrom: string | null
}

export interface InitiativeFilter {
  status?: string
  type?: string
  risk?: string
}

export interface InitiativeDetail {
  slug: string
  status: string
  type: string | null
  risk: string | null
  title: string
  summary: string
  created: string
  updated: string
  targets: string[]
  dependencies: string[]
  spawnedFrom: string | null
  proposal: string
  plan: string | null
  activity: string | null
  seeds: string[]
  lifecycle: ReturnType<typeof detectLifecycle>
  subdirectories: string[]
}

// ---------------------------------------------------------------------------
// Valid lifecycle transitions
// ---------------------------------------------------------------------------

export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["approved", "declined"],
  approved: ["in-progress", "declined"],
  "in-progress": ["integrated", "declined"],
  integrated: ["archived"],
  declined: ["pending"],
  archived: ["pending"],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initiativesDir(root: string): string {
  return path.join(root, "docs/initiatives")
}

function readFileOrNull(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch {
    return null
  }
}

function listInitiativeSlugs(root: string): string[] {
  const dir = initiativesDir(root)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

export function listInitiatives(
  root: string,
  filter?: InitiativeFilter,
): InitiativeListEntry[] {
  const slugs = listInitiativeSlugs(root)
  const results: InitiativeListEntry[] = []

  for (const slug of slugs) {
    const proposalPath = path.join(initiativesDir(root), slug, "proposal.md")
    const source = readFileOrNull(proposalPath)
    if (!source) continue

    const { data, content } = parseValidatedFrontmatter(
      source,
      initiativeFrontmatterSchema,
    )
    if (!data) continue

    const status = data.status ?? "pending"
    const type = data.type ?? null
    const risk = data.risk ?? null

    if (filter?.status && status !== filter.status) continue
    if (filter?.type && type !== filter.type) continue
    if (filter?.risk && risk !== filter.risk) continue

    results.push({
      slug,
      status,
      type,
      risk,
      title: extractTitle(content) ?? slug,
      summary: extractSummarySection(content) ?? "",
      created: String(data.created),
      updated: String(data.updated),
      targets: data.targets ?? [],
      dependencies: data.dependencies ?? [],
      spawnedFrom: data["spawned-from"] ?? null,
    })
  }

  return results
}

export function getInitiative(
  root: string,
  slug: string,
): InitiativeDetail | null {
  const dir = path.join(initiativesDir(root), slug)
  const proposalPath = path.join(dir, "proposal.md")
  const source = readFileOrNull(proposalPath)
  if (!source) return null

  const { data, content } = parseValidatedFrontmatter(
    source,
    initiativeFrontmatterSchema,
  )
  if (!data) return null

  const plan = readFileOrNull(path.join(dir, "plan.md"))
  const activity = readFileOrNull(path.join(dir, "activity.md"))

  const hasResearch = fs.existsSync(path.join(dir, "research"))
  const researchFiles = hasResearch
    ? (fs.readdirSync(path.join(dir, "research")).filter((f) => /iteration-\d+/.test(f)))
    : []
  const hasPlan = plan !== null

  // Check for linked workstream status via activity.md
  let linkedWorkstreamStatus: string | null = null
  if (activity) {
    const { data: activityData } = parseFrontmatter(activity)
    if (activityData?.worktree) linkedWorkstreamStatus = "active"
  }

  const status = data.status ?? "pending"

  const lifecycle = detectLifecycle({
    status,
    hasResearch,
    iterationCount: researchFiles.length,
    hasPlan,
    linkedWorkstreamStatus,
  })

  const subdirectories = fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : []

  return {
    slug,
    status,
    type: data.type ?? null,
    risk: data.risk ?? null,
    title: extractTitle(content) ?? slug,
    summary: extractSummarySection(content) ?? "",
    created: String(data.created),
    updated: String(data.updated),
    targets: data.targets ?? [],
    dependencies: data.dependencies ?? [],
    spawnedFrom: data["spawned-from"] ?? null,
    proposal: content,
    plan,
    activity,
    seeds: getSeeds(root, slug),
    lifecycle,
    subdirectories,
  }
}

export function getSeeds(root: string, slug: string): string[] {
  const activityPath = path.join(initiativesDir(root), slug, "activity.md")
  const source = readFileOrNull(activityPath)
  if (!source) return []

  const seedsSection = extractSection(source, "Seeds")
  if (!seedsSection) return []

  return seedsSection
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run packages/studio-core/src/__tests__/initiatives.test.ts`
Expected: All 7 tests PASS

**Step 5: Commit**

```bash
git add packages/studio-core/src/initiative-ops.ts packages/studio-core/src/__tests__/initiatives.test.ts
git commit -m "feat(initiative-ops): add read operations — listInitiatives, getInitiative, getSeeds"
```

---

### Task 2: Create operation — createInitiative

**Files:**
- Modify: `packages/studio-core/src/__tests__/initiatives.test.ts`
- Modify: `packages/studio-core/src/initiative-ops.ts`

**Step 1: Write the failing tests for createInitiative**

Append to `initiatives.test.ts`:

```typescript
import { createInitiative } from "../initiative-ops"

describe("createInitiative", () => {
  let root: string

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
  })

  it("creates directory and proposal.md with valid frontmatter", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    const result = createInitiative(root, {
      slug: "new-feature",
      title: "New Feature",
      summary: "Add a new feature.",
      body: "## Proposed Changes\n\nDo the thing.",
      type: "new-plan",
      risk: "additive",
      targets: ["src/foo.ts"],
    })

    expect(result.ok).toBe(true)
    const proposalPath = path.join(root, "docs/initiatives/new-feature/proposal.md")
    expect(fs.existsSync(proposalPath)).toBe(true)
    const content = fs.readFileSync(proposalPath, "utf-8")
    expect(content).toContain("status: pending")
    expect(content).toContain("initiative: new-feature")
    expect(content).toContain("# New Feature")
  })

  it("rejects invalid slug format", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    const result = createInitiative(root, {
      slug: "Invalid Slug!",
      title: "Bad",
      summary: "Bad slug.",
      body: "content",
    })
    expect(result.ok).toBe(false)
    expect(result.error).toContain("slug")
  })

  it("rejects duplicate slug", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "existing", {
      status: "pending", initiative: "existing",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# Existing")

    const result = createInitiative(root, {
      slug: "existing",
      title: "Duplicate",
      summary: "Duplicate.",
      body: "content",
    })
    expect(result.ok).toBe(false)
    expect(result.error).toContain("already exists")
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run packages/studio-core/src/__tests__/initiatives.test.ts`
Expected: FAIL — `createInitiative` not exported

**Step 3: Implement createInitiative**

Add to `initiative-ops.ts`:

```typescript
export interface CreateInitiativeInput {
  slug: string
  title: string
  summary: string
  body: string
  status?: string
  type?: string
  risk?: string
  targets?: string[]
  dependencies?: string[]
  spawnedFrom?: string | null
}

export type OpResult =
  | { ok: true; path: string }
  | { ok: false; error: string }

const SLUG_RE = /^[a-z0-9-]+$/

export function createInitiative(
  root: string,
  input: CreateInitiativeInput,
): OpResult {
  if (!SLUG_RE.test(input.slug)) {
    return { ok: false, error: `Invalid slug: must match ${SLUG_RE} (lowercase, hyphens, digits)` }
  }

  const dir = path.join(initiativesDir(root), input.slug)
  if (fs.existsSync(dir)) {
    return { ok: false, error: `Initiative already exists: ${input.slug}` }
  }

  const now = new Date().toISOString().split("T")[0]
  const frontmatter: Record<string, unknown> = {
    status: input.status ?? "pending",
    initiative: input.slug,
    created: now,
    updated: now,
    type: input.type ?? null,
    risk: input.risk ?? null,
    targets: input.targets ?? [],
    dependencies: input.dependencies ?? [],
    "spawned-from": input.spawnedFrom ?? null,
  }

  // Validate against schema
  const validation = initiativeFrontmatterSchema.safeParse(frontmatter)
  if (!validation.success) {
    return { ok: false, error: `Invalid frontmatter: ${validation.error.message}` }
  }

  const yamlLines: string[] = []
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        yamlLines.push(`${key}: []`)
      } else {
        yamlLines.push(`${key}:`)
        for (const item of value) yamlLines.push(`  - ${item}`)
      }
    } else {
      yamlLines.push(`${key}: ${value ?? "null"}`)
    }
  }

  const body = `# ${input.title}\n\n## Summary\n\n${input.summary}\n\n${input.body}\n`
  const content = `---\n${yamlLines.join("\n")}\n---\n\n${body}`

  fs.mkdirSync(dir, { recursive: true })
  const proposalPath = path.join(dir, "proposal.md")
  fs.writeFileSync(proposalPath, content)

  return { ok: true, path: `docs/initiatives/${input.slug}/proposal.md` }
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run packages/studio-core/src/__tests__/initiatives.test.ts`
Expected: All 10 tests PASS

**Step 5: Commit**

```bash
git add packages/studio-core/src/initiative-ops.ts packages/studio-core/src/__tests__/initiatives.test.ts
git commit -m "feat(initiative-ops): add createInitiative with slug validation and conflict detection"
```

---

### Task 3: Status transitions, approval, and activity log

**Files:**
- Modify: `packages/studio-core/src/__tests__/initiatives.test.ts`
- Modify: `packages/studio-core/src/initiative-ops.ts`

**Step 1: Write the failing tests**

Append to `initiatives.test.ts`:

```typescript
import {
  updateInitiativeStatus,
  approveInitiative,
  appendActivity,
  VALID_TRANSITIONS,
} from "../initiative-ops"

describe("updateInitiativeStatus", () => {
  let root: string

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
  })

  it("allows valid transition: pending → approved", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "transition-test", {
      status: "pending", initiative: "transition-test",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# Transition Test")

    const result = updateInitiativeStatus(root, "transition-test", "approved")
    expect(result.ok).toBe(true)

    const content = fs.readFileSync(
      path.join(root, "docs/initiatives/transition-test/proposal.md"), "utf-8"
    )
    expect(content).toContain("status: approved")
  })

  it("rejects invalid transition: pending → integrated", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "bad-transition", {
      status: "pending", initiative: "bad-transition",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# Bad Transition")

    const result = updateInitiativeStatus(root, "bad-transition", "integrated")
    expect(result.ok).toBe(false)
    expect(result.error).toContain("Invalid transition")
  })

  it("returns error for nonexistent initiative", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    const result = updateInitiativeStatus(root, "ghost", "approved")
    expect(result.ok).toBe(false)
    expect(result.error).toContain("not found")
  })
})

describe("approveInitiative", () => {
  let root: string

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
  })

  it("changes status to approved and creates activity.md", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "to-approve", {
      status: "pending", initiative: "to-approve",
      created: "2026-03-17", updated: "2026-03-17",
      risk: "additive",
    }, "# To Approve")

    const result = approveInitiative(root, "to-approve", "human", "always")
    expect(result.ok).toBe(true)

    const proposal = fs.readFileSync(
      path.join(root, "docs/initiatives/to-approve/proposal.md"), "utf-8"
    )
    expect(proposal).toContain("status: approved")

    const activity = path.join(root, "docs/initiatives/to-approve/activity.md")
    expect(fs.existsSync(activity)).toBe(true)
    const activityContent = fs.readFileSync(activity, "utf-8")
    expect(activityContent).toContain("started:")
    expect(activityContent).toContain("Approved")
  })

  it("blocks agent approval when policy is 'never'", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "blocked", {
      status: "pending", initiative: "blocked",
      created: "2026-03-17", updated: "2026-03-17",
      risk: "additive",
    }, "# Blocked")

    const result = approveInitiative(root, "blocked", "agent", "never")
    expect(result.ok).toBe(false)
    expect(result.error).toContain("policy")
  })

  it("allows agent approval of additive risk when policy is 'additive-only'", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "additive-ok", {
      status: "pending", initiative: "additive-ok",
      created: "2026-03-17", updated: "2026-03-17",
      risk: "additive",
    }, "# Additive OK")

    const result = approveInitiative(root, "additive-ok", "agent", "additive-only")
    expect(result.ok).toBe(true)
  })

  it("blocks agent approval of structural risk when policy is 'additive-only'", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "structural-blocked", {
      status: "pending", initiative: "structural-blocked",
      created: "2026-03-17", updated: "2026-03-17",
      risk: "structural",
    }, "# Structural Blocked")

    const result = approveInitiative(root, "structural-blocked", "agent", "additive-only")
    expect(result.ok).toBe(false)
    expect(result.error).toContain("risk")
  })
})

describe("appendActivity", () => {
  let root: string

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
  })

  it("creates activity.md if missing", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "no-activity", {
      status: "in-progress", initiative: "no-activity",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# No Activity")

    const result = appendActivity(root, "no-activity", "Started work on feature")
    expect(result.ok).toBe(true)

    const content = fs.readFileSync(
      path.join(root, "docs/initiatives/no-activity/activity.md"), "utf-8"
    )
    expect(content).toContain("Started work on feature")
  })

  it("appends to existing activity.md", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "has-activity", {
      status: "in-progress", initiative: "has-activity",
      created: "2026-03-17", updated: "2026-03-17",
    }, "# Has Activity")
    const dir = path.join(root, "docs/initiatives/has-activity")
    fs.writeFileSync(path.join(dir, "activity.md"),
      "---\nstarted: 2026-03-17\nworktree: null\n---\n\n- **2026-03-17** — First entry\n")

    appendActivity(root, "has-activity", "Second entry")

    const content = fs.readFileSync(path.join(dir, "activity.md"), "utf-8")
    expect(content).toContain("First entry")
    expect(content).toContain("Second entry")
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run packages/studio-core/src/__tests__/initiatives.test.ts`
Expected: FAIL — functions not exported

**Step 3: Implement status transitions, approval, and activity**

Add to `initiative-ops.ts`:

```typescript
export function updateInitiativeStatus(
  root: string,
  slug: string,
  newStatus: string,
): OpResult {
  const proposalPath = path.join(initiativesDir(root), slug, "proposal.md")
  const source = readFileOrNull(proposalPath)
  if (!source) return { ok: false, error: `Initiative not found: ${slug}` }

  const { data } = parseValidatedFrontmatter(source, initiativeFrontmatterSchema)
  if (!data) return { ok: false, error: `Invalid frontmatter in ${slug}` }

  const currentStatus = data.status ?? "pending"
  const allowed = VALID_TRANSITIONS[currentStatus]
  if (!allowed || !allowed.includes(newStatus)) {
    return {
      ok: false,
      error: `Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed?.join(", ") ?? "none"}`,
    }
  }

  // Update status and updated date in the raw source
  const now = new Date().toISOString().split("T")[0]
  let updated = source.replace(
    /^status:\s*.+$/m,
    `status: ${newStatus}`,
  )
  updated = updated.replace(
    /^updated:\s*.+$/m,
    `updated: '${now}'`,
  )

  fs.writeFileSync(proposalPath, updated)
  return { ok: true, path: `docs/initiatives/${slug}/proposal.md` }
}

export type GovernancePolicy = "never" | "additive-only" | "always"

export function approveInitiative(
  root: string,
  slug: string,
  actor: "human" | "agent",
  policy: GovernancePolicy,
): OpResult {
  // Check governance policy for agent callers
  if (actor === "agent") {
    if (policy === "never") {
      return {
        ok: false,
        error: "Governance policy blocks agent approval. Use Studio UI for human approval.",
      }
    }

    if (policy === "additive-only") {
      const proposalPath = path.join(initiativesDir(root), slug, "proposal.md")
      const source = readFileOrNull(proposalPath)
      if (!source) return { ok: false, error: `Initiative not found: ${slug}` }

      const { data } = parseValidatedFrontmatter(source, initiativeFrontmatterSchema)
      if (!data) return { ok: false, error: `Invalid frontmatter in ${slug}` }

      const risk = data.risk ?? null
      if (risk !== "additive") {
        return {
          ok: false,
          error: `Governance policy 'additive-only' blocks approval of '${risk}' risk initiatives. Only 'additive' risk allowed.`,
        }
      }
    }
  }

  // Perform the status transition
  const transitionResult = updateInitiativeStatus(root, slug, "approved")
  if (!transitionResult.ok) return transitionResult

  // Create activity.md with started date
  const now = new Date().toISOString().split("T")[0]
  const activityPath = path.join(initiativesDir(root), slug, "activity.md")
  if (!fs.existsSync(activityPath)) {
    const activityContent = `---\nstarted: ${now}\nworktree: null\n---\n\n- **${now}** — Approved by ${actor}\n`
    fs.writeFileSync(activityPath, activityContent)
  }

  return { ok: true, path: `docs/initiatives/${slug}/proposal.md` }
}

export function appendActivity(
  root: string,
  slug: string,
  entry: string,
): OpResult {
  const dir = path.join(initiativesDir(root), slug)
  if (!fs.existsSync(dir)) {
    return { ok: false, error: `Initiative not found: ${slug}` }
  }

  const now = new Date().toISOString().split("T")[0]
  const activityPath = path.join(dir, "activity.md")
  const line = `- **${now}** — ${entry}\n`

  if (fs.existsSync(activityPath)) {
    fs.appendFileSync(activityPath, line)
  } else {
    const content = `---\nstarted: ${now}\nworktree: null\n---\n\n${line}`
    fs.writeFileSync(activityPath, content)
  }

  return { ok: true, path: `docs/initiatives/${slug}/activity.md` }
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run packages/studio-core/src/__tests__/initiatives.test.ts`
Expected: All 19 tests PASS

**Step 5: Commit**

```bash
git add packages/studio-core/src/initiative-ops.ts packages/studio-core/src/__tests__/initiatives.test.ts
git commit -m "feat(initiative-ops): add write operations — status transitions, approval with governance, activity log"
```

---

## Session 2: Config Extension + MCP Registration

### Task 4: Governance config schema

**Files:**
- Modify: `packages/studio-core/src/config/types.ts:117-159`
- Modify: `packages/studio-core/src/config/schema.ts:65-81`
- Modify: `packages/studio-core/src/config/defaults.ts:88-120`

**Step 1: Add GovernanceConfig interface to types.ts**

After `KnowledgeConfig` (line 112), add:

```typescript
export interface GovernanceConfig {
  /** Who can approve initiatives via MCP. Defaults to 'never'. */
  approval: {
    /** Agent approval policy: 'never' | 'additive-only' | 'always' */
    agents: "never" | "additive-only" | "always"
    /** Whether authority lease is required for mutations. Defaults to true. */
    requireAuthority: boolean
  }
}
```

Add `governance?: GovernanceConfig` to `SherpaUserConfig` (after `knowledge`).

Add `governance: Required<GovernanceConfig>` to `SherpaConfig` (after `knowledge`).

**Step 2: Add governance to Zod schema in schema.ts**

Before the closing `.strict()` (around line 79), add:

```typescript
governance: z.object({
  approval: z.object({
    agents: z.enum(["never", "additive-only", "always"]).optional(),
    requireAuthority: z.boolean().optional(),
  }).optional(),
}).optional(),
```

**Step 3: Add defaults and update buildDefaults in defaults.ts**

Add after `DEFAULT_KNOWLEDGE`:

```typescript
export const DEFAULT_GOVERNANCE: Required<GovernanceConfig> = {
  approval: {
    agents: "never",
    requireAuthority: true,
  },
}
```

Update `buildDefaults()` to include:

```typescript
governance: {
  approval: {
    agents: userConfig.governance?.approval?.agents ?? DEFAULT_GOVERNANCE.approval.agents,
    requireAuthority: userConfig.governance?.approval?.requireAuthority ?? DEFAULT_GOVERNANCE.approval.requireAuthority,
  },
},
```

**Step 4: Run typecheck**

Run: `pnpm check`
Expected: No type errors

**Step 5: Commit**

```bash
git add packages/studio-core/src/config/types.ts packages/studio-core/src/config/schema.ts packages/studio-core/src/config/defaults.ts
git commit -m "feat(config): add governance section with agent approval policy"
```

---

### Task 5: MCP tool registration — registerInitiativeTools

**Files:**
- Create: `packages/studio-mcp/src/initiative/tools.ts`
- Modify: `packages/studio-mcp/src/server.ts`

**Step 1: Create the initiative tools module**

```typescript
// packages/studio-mcp/src/initiative/tools.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type Database from "better-sqlite3"
import {
  listInitiatives,
  getInitiative,
  getSeeds,
  createInitiative,
  updateInitiativeStatus,
  approveInitiative,
  appendActivity,
  type GovernancePolicy,
} from "@sherpa/studio-core/initiative-ops"
import { checkAuthority } from "../authority/operations.js"

interface InitiativeToolsOptions {
  /** Absolute path to the project root. */
  projectRoot: string
  /** Governance approval policy. Defaults to 'never'. */
  approvalPolicy?: GovernancePolicy
  /** Whether authority is required for mutations. Defaults to true. */
  requireAuthority?: boolean
  /** Coordination database (optional — when absent, authority checks are skipped). */
  coordinationDb?: Database.Database
}

function checkAuth(
  db: Database.Database | undefined,
  scope: string,
  agentId: string,
  requireAuthority: boolean,
): string | null {
  if (!requireAuthority || !db) return null
  const lease = checkAuthority(db, scope)
  if (!lease || lease.agent_id !== agentId) {
    return `Authority required on scope '${scope}'. Acquire authority first via authority_acquire.`
  }
  if (new Date(lease.expires_at) < new Date()) {
    return `Authority lease on '${scope}' has expired. Re-acquire via authority_acquire.`
  }
  return null
}

export function registerInitiativeTools(
  server: McpServer,
  opts: InitiativeToolsOptions,
): void {
  const {
    projectRoot,
    approvalPolicy = "never",
    requireAuthority = true,
    coordinationDb,
  } = opts

  // --- Tool: initiative_list ---

  server.tool(
    "initiative_list",
    "List initiatives with optional filters. Returns metadata for all matching initiatives.",
    {
      status: z
        .enum(["pending", "approved", "in-progress", "integrated", "declined", "archived"])
        .optional()
        .describe("Filter by initiative status"),
      type: z.string().optional().describe("Filter by initiative type"),
      risk: z
        .enum(["additive", "evolutionary", "structural"])
        .optional()
        .describe("Filter by risk level"),
    },
    async ({ status, type, risk }) => {
      const filter: Record<string, string> = {}
      if (status) filter.status = status
      if (type) filter.type = type
      if (risk) filter.risk = risk

      const initiatives = listInitiatives(projectRoot, filter)
      return {
        content: [{
          type: "text" as const,
          text: initiatives.length === 0
            ? "No initiatives found matching filters."
            : JSON.stringify(initiatives, null, 2),
        }],
      }
    },
  )

  // --- Tool: initiative_get ---

  server.tool(
    "initiative_get",
    "Get full initiative detail: proposal, plan, activity log, lifecycle stage, and seeds.",
    {
      slug: z.string().describe("Initiative slug"),
    },
    async ({ slug }) => {
      const detail = getInitiative(projectRoot, slug)
      if (!detail) {
        return {
          content: [{ type: "text" as const, text: `Error: Initiative not found: ${slug}` }],
          isError: true,
        }
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(detail, null, 2) }],
      }
    },
  )

  // --- Tool: initiative_seeds ---

  server.tool(
    "initiative_seeds",
    "Get seeds from an integrated initiative's activity log. Seeds are follow-on work candidates.",
    {
      slug: z.string().describe("Initiative slug"),
    },
    async ({ slug }) => {
      const seeds = getSeeds(projectRoot, slug)
      return {
        content: [{
          type: "text" as const,
          text: seeds.length === 0
            ? `No seeds found for initiative '${slug}'.`
            : JSON.stringify(seeds, null, 2),
        }],
      }
    },
  )

  // --- Tool: initiative_create ---

  server.tool(
    "initiative_create",
    "Create a new initiative proposal. Requires authority on the initiatives directory.",
    {
      slug: z
        .string()
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
        .describe("Initiative slug — becomes the directory name"),
      title: z.string().describe("Initiative title"),
      summary: z.string().describe("2-3 sentence summary"),
      body: z.string().describe("Full proposal body (markdown)"),
      type: z
        .enum(["roadmap-update", "guideline-evolution", "new-skill", "research-synthesis", "process-change", "new-plan"])
        .optional()
        .describe("Initiative type"),
      risk: z
        .enum(["additive", "evolutionary", "structural"])
        .optional()
        .describe("Risk level"),
      targets: z.array(z.string()).optional().describe("Target file/directory paths"),
      dependencies: z.array(z.string()).optional().describe("Dependent initiative slugs"),
      agent_id: z.string().optional().describe("Agent ID for authority verification"),
    },
    async ({ slug, title, summary, body, type, risk, targets, dependencies, agent_id }) => {
      // Authority check
      if (agent_id) {
        const authErr = checkAuth(coordinationDb, "dir:docs/initiatives/", agent_id, requireAuthority)
        if (authErr) {
          return { content: [{ type: "text" as const, text: `Error: ${authErr}` }], isError: true }
        }
      }

      const result = createInitiative(projectRoot, {
        slug, title, summary, body, type, risk, targets, dependencies,
      })

      if (!result.ok) {
        return { content: [{ type: "text" as const, text: `Error: ${result.error}` }], isError: true }
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ created: true, slug, path: result.path }) }],
      }
    },
  )

  // --- Tool: initiative_approve ---

  server.tool(
    "initiative_approve",
    "Approve a pending initiative. Policy-gated: check governance.approval.agents in sherpa.config.ts.",
    {
      slug: z.string().describe("Initiative slug to approve"),
      agent_id: z.string().optional().describe("Agent ID (required for agent callers)"),
    },
    async ({ slug, agent_id }) => {
      const actor: "human" | "agent" = agent_id ? "agent" : "human"

      // Authority check for agents
      if (agent_id) {
        const scope = `dir:docs/initiatives/${slug}/`
        const authErr = checkAuth(coordinationDb, scope, agent_id, requireAuthority)
        if (authErr) {
          return { content: [{ type: "text" as const, text: `Error: ${authErr}` }], isError: true }
        }
      }

      const result = approveInitiative(projectRoot, slug, actor, approvalPolicy)

      if (!result.ok) {
        return { content: [{ type: "text" as const, text: `Error: ${result.error}` }], isError: true }
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ approved: true, slug }) }],
      }
    },
  )

  // --- Tool: initiative_update_status ---

  server.tool(
    "initiative_update_status",
    "Change an initiative's status with lifecycle transition validation.",
    {
      slug: z.string().describe("Initiative slug"),
      status: z
        .enum(["pending", "approved", "in-progress", "integrated", "declined", "archived"])
        .describe("New status"),
      agent_id: z.string().optional().describe("Agent ID for authority verification"),
    },
    async ({ slug, status, agent_id }) => {
      if (agent_id) {
        const scope = `dir:docs/initiatives/${slug}/`
        const authErr = checkAuth(coordinationDb, scope, agent_id, requireAuthority)
        if (authErr) {
          return { content: [{ type: "text" as const, text: `Error: ${authErr}` }], isError: true }
        }
      }

      const result = updateInitiativeStatus(projectRoot, slug, status)
      if (!result.ok) {
        return { content: [{ type: "text" as const, text: `Error: ${result.error}` }], isError: true }
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ updated: true, slug, status }) }],
      }
    },
  )

  // --- Tool: initiative_activity ---

  server.tool(
    "initiative_activity",
    "Append an entry to an initiative's activity log.",
    {
      slug: z.string().describe("Initiative slug"),
      entry: z.string().describe("Activity log entry text"),
      agent_id: z.string().optional().describe("Agent ID for authority verification"),
    },
    async ({ slug, entry, agent_id }) => {
      if (agent_id) {
        const scope = `dir:docs/initiatives/${slug}/`
        const authErr = checkAuth(coordinationDb, scope, agent_id, requireAuthority)
        if (authErr) {
          return { content: [{ type: "text" as const, text: `Error: ${authErr}` }], isError: true }
        }
      }

      const result = appendActivity(projectRoot, slug, entry)
      if (!result.ok) {
        return { content: [{ type: "text" as const, text: `Error: ${result.error}` }], isError: true }
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ appended: true, slug }) }],
      }
    },
  )
}
```

**Step 2: Wire registerInitiativeTools into createStudioMcpServer**

In `packages/studio-mcp/src/server.ts`, add the import and registration call.

At the top, add:
```typescript
import { registerInitiativeTools } from "./initiative/tools.js"
```

At the end of `createStudioMcpServer()` (before `return server`), add:
```typescript
// --- Initiative tools ---
registerInitiativeTools(server, {
  projectRoot,
  coordinationDb: opts?.coordinationDb,
})
```

**Step 3: Run typecheck**

Run: `pnpm check`
Expected: No type errors

**Step 4: Commit**

```bash
git add packages/studio-mcp/src/initiative/tools.ts packages/studio-mcp/src/server.ts
git commit -m "feat(mcp): register 7 initiative tools with authority gating and governance policy"
```

---

### Task 6: Barrel export + sub-path export

**Files:**
- Modify: `packages/studio-core/src/index.ts`
- Modify: `packages/studio-core/package.json` (add sub-path export if needed)

**Step 1: Add barrel export to index.ts**

Add after the `// Composites` section:

```typescript
// Initiative operations (MCP-facing CRUD)
export * from "./initiative-ops"
```

**Step 2: Check if sub-path export is needed**

Check `packages/studio-core/package.json` exports map. If `initiative-ops` is imported via `@sherpa/studio-core/initiative-ops` in `initiative/tools.ts`, add a sub-path export:

```json
"./initiative-ops": {
  "import": "./src/initiative-ops.ts",
  "types": "./src/initiative-ops.ts"
}
```

Alternatively, import from the barrel: `@sherpa/studio-core` — check which pattern the MCP tools.ts uses. If it uses the barrel, no sub-path needed.

**Step 3: Run typecheck and build**

Run: `pnpm check && pnpm build`
Expected: Clean typecheck, successful build

**Step 4: Commit**

```bash
git add packages/studio-core/src/index.ts packages/studio-core/package.json
git commit -m "feat(studio-core): export initiative-ops from barrel"
```

---

## Session 3: Integration Testing + Polish

### Task 7: Wire governance config into MCP server

**Files:**
- Modify: `packages/studio-mcp/src/server.ts`

**Step 1: Read governance config in createStudioMcpServer**

The MCP server needs to read the resolved Sherpa config to get the governance policy. Update the `registerInitiativeTools` call to pass the policy from config.

Add to `StudioMcpOptions`:
```typescript
/** Governance approval policy for agent callers. */
approvalPolicy?: "never" | "additive-only" | "always"
/** Whether authority is required for initiative mutations. */
requireAuthority?: boolean
```

Update the `registerInitiativeTools` call:
```typescript
registerInitiativeTools(server, {
  projectRoot,
  approvalPolicy: opts?.approvalPolicy ?? "never",
  requireAuthority: opts?.requireAuthority ?? true,
  coordinationDb: opts?.coordinationDb,
})
```

**Step 2: Run typecheck**

Run: `pnpm check`
Expected: No type errors

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/server.ts
git commit -m "feat(mcp): wire governance config into initiative tools registration"
```

---

### Task 8: Integration smoke test + final verification

**Files:**
- Modify: `packages/studio-core/src/__tests__/initiatives.test.ts` (add edge case tests)

**Step 1: Add edge case tests**

```typescript
describe("edge cases", () => {
  let root: string

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
  })

  it("handles concurrent slug conflict (first write wins)", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    const first = createInitiative(root, {
      slug: "race-condition",
      title: "First",
      summary: "First writer.",
      body: "content",
    })
    expect(first.ok).toBe(true)

    const second = createInitiative(root, {
      slug: "race-condition",
      title: "Second",
      summary: "Second writer.",
      body: "content",
    })
    expect(second.ok).toBe(false)
    expect(second.error).toContain("already exists")
  })

  it("approve of non-pending initiative fails with transition error", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))
    writeProposal(root, "already-approved", {
      status: "approved", initiative: "already-approved",
      created: "2026-03-17", updated: "2026-03-17",
      risk: "additive",
    }, "# Already Approved")

    const result = approveInitiative(root, "already-approved", "human", "always")
    expect(result.ok).toBe(false)
    expect(result.error).toContain("Invalid transition")
  })

  it("full lifecycle: create → approve → activity → status update", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"))

    // Create
    const created = createInitiative(root, {
      slug: "lifecycle-test",
      title: "Lifecycle Test",
      summary: "Full lifecycle.",
      body: "## Proposed Changes\n\nEverything.",
      type: "new-plan",
      risk: "additive",
    })
    expect(created.ok).toBe(true)

    // Approve
    const approved = approveInitiative(root, "lifecycle-test", "human", "always")
    expect(approved.ok).toBe(true)

    // Log activity
    const logged = appendActivity(root, "lifecycle-test", "Implementation started")
    expect(logged.ok).toBe(true)

    // Transition to in-progress
    const inProgress = updateInitiativeStatus(root, "lifecycle-test", "in-progress")
    expect(inProgress.ok).toBe(true)

    // Verify final state
    const detail = getInitiative(root, "lifecycle-test")
    expect(detail).not.toBeNull()
    expect(detail!.status).toBe("in-progress")
    expect(detail!.activity).toContain("Implementation started")
    expect(detail!.activity).toContain("Approved by human")
  })
})
```

**Step 2: Run all tests**

Run: `pnpm exec vitest run packages/studio-core/src/__tests__/initiatives.test.ts`
Expected: All tests PASS

**Step 3: Run full typecheck and build**

Run: `pnpm check && pnpm build`
Expected: Clean

**Step 4: Commit**

```bash
git add packages/studio-core/src/__tests__/initiatives.test.ts
git commit -m "test(initiative-ops): add edge cases and full lifecycle integration test"
```

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Module name | `initiative-ops.ts` | Distinguishes from `domain.ts` read-only functions. `-ops` signals CRUD. |
| Parameter style | Explicit `root: string` | Testable without global state. Matches task tools pattern. |
| MCP registration | Separate file `initiative/tools.ts` | Follows `authority/tools.ts` pattern. Keeps `server.ts` from growing. |
| Authority checking | Optional via `coordinationDb` | Works without DB in dev. Authority enforced when DB available. |
| Governance default | `'never'` | Safe default — agents can read but cannot approve without explicit config. |
| Lifecycle transitions | Strict with defined map | Prevents invalid state changes. No `--force` escape hatch in v1. |
| Frontmatter serialization | Manual YAML (not gray-matter stringify) | Simpler dependency. Arrays use `  - item` format. |

## Open Questions Resolved

| Question | Resolution |
|----------|-----------|
| Auto-run knowledge sync on create? | **No** in v1 — leave for next scheduled sync. Avoids coupling. |
| Strict or permissive lifecycle? | **Strict** — only valid transitions allowed. Add escape hatch later if needed. |
