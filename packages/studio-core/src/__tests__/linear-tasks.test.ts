import { describe, it, expect, beforeEach, vi } from "vitest"

// ── Mock the Linear SDK ────────────────────────────────────────────
// The real SDK uses lazy-loading (issue.state returns a Promise,
// issue.labels() returns a Promise). We replicate that pattern here.

function makeMockIssue(overrides: {
  id?: string
  identifier?: string
  title?: string
  description?: string | null
  priority?: number
  stateType?: string
  labels?: Array<{ name: string; parentName?: string }>
  createdAt?: Date
} = {}) {
  const {
    id = "uuid-1",
    identifier = "SHR-1",
    title = "Test issue",
    description = "Test description",
    priority = 3,
    stateType = "unstarted",
    labels = [],
    createdAt = new Date("2026-03-20T10:00:00Z"),
  } = overrides

  return {
    id,
    identifier,
    title,
    description,
    priority,
    createdAt,
    // Lazy-loaded state — returns a Promise
    get state() {
      return Promise.resolve({ type: stateType })
    },
    // Lazy-loaded labels — returns a function that returns a Promise
    labels: () =>
      Promise.resolve({
        nodes: labels.map((l) => ({
          name: l.name,
          get parent() {
            return Promise.resolve(
              l.parentName ? { name: l.parentName } : undefined
            )
          },
        })),
      }),
  }
}

let mockIssuesResponse: { nodes: ReturnType<typeof makeMockIssue>[] } = {
  nodes: [],
}

vi.mock("@linear/sdk", () => {
  class MockLinearClient {
    _apiKey: string
    constructor(opts: { apiKey: string }) {
      this._apiKey = opts.apiKey
    }
    async issues(_opts?: any) {
      return mockIssuesResponse
    }
  }
  return { LinearClient: MockLinearClient }
})

// Dynamic import so the mock is in place before module evaluation
const { getLinearTaskBoard, getLinearTaskDetail } = await import(
  "../linear-tasks"
)
const { resetLinearClient } = await import("../linear-client")

// ── Tests ──────────────────────────────────────────────────────────

describe("getLinearTaskBoard", () => {
  beforeEach(() => {
    resetLinearClient()
    process.env.SHERPA_LINEAR_API_KEY = "test-key"
    mockIssuesResponse = { nodes: [] }
  })

  it("returns TaskBoardEntry[] with correct field mapping", async () => {
    mockIssuesResponse = {
      nodes: [
        makeMockIssue({
          id: "uuid-abc",
          identifier: "SHR-42",
          title: "Implement feature X",
          description: "Details here",
          priority: 2,
          stateType: "started",
          createdAt: new Date("2026-03-20T12:00:00Z"),
        }),
      ],
    }

    const entries = await getLinearTaskBoard()

    expect(entries).toHaveLength(1)
    const entry = entries[0]!

    // Linear-derived fields
    expect(entry.id).toBe("SHR-42") // identifier, not UUID
    expect(entry.title).toBe("Implement feature X")
    expect(entry.priority).toBe("high") // Linear 2 = high
    expect(entry.status).toBe("dispatched") // started = dispatched
    expect(entry.created).toBe("2026-03-20T12:00:00.000Z")

    // Framework defaults
    expect(entry.file).toBe("")
    expect(entry.initiative).toBeNull()
    expect(entry.backend).toBe("")
    expect(entry.model).toBe("")
    expect(entry.budgetUsd).toBe("0.00")
    expect(entry.worktree).toBeNull()
    expect(entry.branch).toBeNull()
    expect(entry.dispatchedAt).toBeNull()
    expect(entry.completedAt).toBeNull()
    expect(entry.hasReport).toBe(false)
    expect(entry.hasVerdict).toBe(false)
    expect(entry.hasBlockers).toBe(false)
    expect(entry.durationSeconds).toBeNull()
    expect(entry.tokensInput).toBeNull()
    expect(entry.tokensOutput).toBeNull()
    expect(entry.costUsd).toBeNull()
  })

  it("maps priority and status correctly", async () => {
    mockIssuesResponse = {
      nodes: [
        makeMockIssue({ priority: 1, stateType: "triage" }),
        makeMockIssue({
          id: "uuid-2",
          identifier: "SHR-2",
          priority: 4,
          stateType: "completed",
        }),
        makeMockIssue({
          id: "uuid-3",
          identifier: "SHR-3",
          priority: 2,
          stateType: "canceled",
        }),
      ],
    }

    const entries = await getLinearTaskBoard()

    // Sorted by priority: urgent (1), high (2), low (4)
    expect(entries[0]!.priority).toBe("urgent")
    expect(entries[0]!.status).toBe("pending")

    expect(entries[1]!.priority).toBe("high")
    expect(entries[1]!.status).toBe("failed")

    expect(entries[2]!.priority).toBe("low")
    expect(entries[2]!.status).toBe("completed")
  })

  it("extracts label group values (taskType, role, mode, verdict)", async () => {
    mockIssuesResponse = {
      nodes: [
        makeMockIssue({
          labels: [
            { name: "research", parentName: "Task Type" },
            { name: "research-lead", parentName: "Role" },
            { name: "autonomous", parentName: "Mode" },
            { name: "approved", parentName: "Verdict" },
          ],
        }),
      ],
    }

    const entries = await getLinearTaskBoard()
    const entry = entries[0]!

    expect(entry.taskType).toBe("research")
    expect(entry.role).toBe("research-lead")
    expect(entry.mode).toBe("autonomous")
    expect(entry.judgeVerdict).toBe("approved")
  })

  it("returns empty array when no issues exist", async () => {
    mockIssuesResponse = { nodes: [] }
    const entries = await getLinearTaskBoard()
    expect(entries).toEqual([])
  })

  it("uses defaults for labels not present", async () => {
    mockIssuesResponse = {
      nodes: [makeMockIssue({ labels: [] })],
    }

    const entries = await getLinearTaskBoard()
    const entry = entries[0]!

    expect(entry.taskType).toBe("general")
    expect(entry.role).toBe("engineer")
    expect(entry.mode).toBe("supervised")
    expect(entry.judgeVerdict).toBe("pending")
  })
})

describe("getLinearTaskDetail", () => {
  beforeEach(() => {
    resetLinearClient()
    process.env.SHERPA_LINEAR_API_KEY = "test-key"
    mockIssuesResponse = { nodes: [] }
  })

  it("returns null for non-existent identifier", async () => {
    mockIssuesResponse = { nodes: [] }
    const result = await getLinearTaskDetail("SHR-999")
    expect(result).toBeNull()
  })

  it("returns TaskDetail with body from description", async () => {
    mockIssuesResponse = {
      nodes: [
        makeMockIssue({
          identifier: "SHR-42",
          title: "Fix the bug",
          description: "## Steps to reproduce\n\n1. Open the app\n2. Click the button",
          priority: 1,
          stateType: "started",
        }),
      ],
    }

    const result = await getLinearTaskDetail("SHR-42")

    expect(result).not.toBeNull()
    expect(result!.id).toBe("SHR-42")
    expect(result!.title).toBe("Fix the bug")
    expect(result!.body).toBe(
      "## Steps to reproduce\n\n1. Open the app\n2. Click the button"
    )
    expect(result!.priority).toBe("urgent")
    expect(result!.status).toBe("dispatched")

    // TaskDetail-specific fields default to null
    expect(result!.reportContent).toBeNull()
    expect(result!.verdictContent).toBeNull()
    expect(result!.blockerContent).toBeNull()
  })

  it("returns empty body when description is null", async () => {
    mockIssuesResponse = {
      nodes: [
        makeMockIssue({
          identifier: "SHR-10",
          description: null,
        }),
      ],
    }

    const result = await getLinearTaskDetail("SHR-10")
    expect(result).not.toBeNull()
    expect(result!.body).toBe("")
  })
})
