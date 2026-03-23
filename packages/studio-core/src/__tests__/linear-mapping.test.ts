import { describe, it, expect } from "vitest"
import {
  SHERPA_LABEL_GROUPS,
  mapTaskToLinearInput,
  mapLinearIssueToTask,
  type LinearIssueShape,
} from "../linear-mapping"

describe("SHERPA_LABEL_GROUPS", () => {
  it("defines four label groups", () => {
    const groupNames = SHERPA_LABEL_GROUPS.map((g) => g.name)
    expect(groupNames).toEqual(["Task Type", "Mode", "Role", "Verdict"])
  })

  it("Task Type group has 8 labels", () => {
    const group = SHERPA_LABEL_GROUPS.find((g) => g.name === "Task Type")!
    expect(group.labels).toEqual([
      "code-implementation",
      "code-review",
      "architect",
      "research",
      "content-generation",
      "audit",
      "embeddings",
      "general",
    ])
  })

  it("Mode group has 3 labels", () => {
    const group = SHERPA_LABEL_GROUPS.find((g) => g.name === "Mode")!
    expect(group.labels).toEqual(["interactive", "supervised", "autonomous"])
  })

  it("Role group has 5 labels", () => {
    const group = SHERPA_LABEL_GROUPS.find((g) => g.name === "Role")!
    expect(group.labels).toEqual([
      "engineer",
      "research-lead",
      "technical-writer",
      "code-reviewer",
      "designer",
    ])
  })

  it("Verdict group has 4 labels", () => {
    const group = SHERPA_LABEL_GROUPS.find((g) => g.name === "Verdict")!
    expect(group.labels).toEqual([
      "pending",
      "approved",
      "needs-changes",
      "rejected",
    ])
  })
})

describe("mapTaskToLinearInput", () => {
  it("maps priority string to Linear priority number", () => {
    expect(mapTaskToLinearInput({ priority: "urgent" }).priority).toBe(1)
    expect(mapTaskToLinearInput({ priority: "high" }).priority).toBe(2)
    expect(mapTaskToLinearInput({ priority: "medium" }).priority).toBe(3)
    expect(mapTaskToLinearInput({ priority: "low" }).priority).toBe(4)
  })

  it("defaults unknown priority to 0 (no priority)", () => {
    expect(mapTaskToLinearInput({ priority: "whatever" }).priority).toBe(0)
    expect(mapTaskToLinearInput({}).priority).toBe(0)
  })

  it("passes through title and description", () => {
    const result = mapTaskToLinearInput({
      title: "Fix the thing",
      description: "It is broken",
    })
    expect(result.title).toBe("Fix the thing")
    expect(result.description).toBe("It is broken")
  })

  it("omits title and description when not provided", () => {
    const result = mapTaskToLinearInput({})
    expect(result.title).toBeUndefined()
    expect(result.description).toBeUndefined()
  })
})

describe("mapLinearIssueToTask", () => {
  function makeIssue(overrides: Partial<LinearIssueShape> = {}): LinearIssueShape {
    return {
      id: "issue-123",
      identifier: "SHR-42",
      title: "Test Issue",
      description: "A test issue",
      priority: 2,
      state: { type: "started" },
      labels: [],
      createdAt: "2026-03-20T10:00:00Z",
      ...overrides,
    }
  }

  it("maps basic fields", () => {
    const result = mapLinearIssueToTask(makeIssue())
    expect(result.id).toBe("issue-123")
    expect(result.title).toBe("Test Issue")
  })

  it("maps Linear priority numbers to Sherpa priority strings", () => {
    expect(mapLinearIssueToTask(makeIssue({ priority: 1 })).priority).toBe("urgent")
    expect(mapLinearIssueToTask(makeIssue({ priority: 2 })).priority).toBe("high")
    expect(mapLinearIssueToTask(makeIssue({ priority: 3 })).priority).toBe("medium")
    expect(mapLinearIssueToTask(makeIssue({ priority: 4 })).priority).toBe("low")
  })

  it("defaults priority 0 to medium", () => {
    expect(mapLinearIssueToTask(makeIssue({ priority: 0 })).priority).toBe("medium")
  })

  it("maps workflow state type → triage to pending", () => {
    expect(
      mapLinearIssueToTask(makeIssue({ state: { type: "triage" } })).status
    ).toBe("pending")
  })

  it("maps workflow state type → backlog to pending", () => {
    expect(
      mapLinearIssueToTask(makeIssue({ state: { type: "backlog" } })).status
    ).toBe("pending")
  })

  it("maps workflow state type → unstarted to pending", () => {
    expect(
      mapLinearIssueToTask(makeIssue({ state: { type: "unstarted" } })).status
    ).toBe("pending")
  })

  it("maps workflow state type → started to dispatched", () => {
    expect(
      mapLinearIssueToTask(makeIssue({ state: { type: "started" } })).status
    ).toBe("dispatched")
  })

  it("maps workflow state type → completed to completed", () => {
    expect(
      mapLinearIssueToTask(makeIssue({ state: { type: "completed" } })).status
    ).toBe("completed")
  })

  it("maps workflow state type → canceled to failed", () => {
    expect(
      mapLinearIssueToTask(makeIssue({ state: { type: "canceled" } })).status
    ).toBe("failed")
  })

  it("maps workflow state type → duplicate to failed", () => {
    expect(
      mapLinearIssueToTask(makeIssue({ state: { type: "duplicate" } })).status
    ).toBe("failed")
  })

  it("defaults unknown state type to pending", () => {
    expect(
      mapLinearIssueToTask(makeIssue({ state: { type: "custom-thing" } })).status
    ).toBe("pending")
  })

  it("extracts taskType from Task Type label group", () => {
    const result = mapLinearIssueToTask(
      makeIssue({
        labels: [{ name: "research", groupName: "Task Type" }],
      })
    )
    expect(result.taskType).toBe("research")
  })

  it("extracts mode from Mode label group", () => {
    const result = mapLinearIssueToTask(
      makeIssue({
        labels: [{ name: "autonomous", groupName: "Mode" }],
      })
    )
    expect(result.mode).toBe("autonomous")
  })

  it("extracts role from Role label group", () => {
    const result = mapLinearIssueToTask(
      makeIssue({
        labels: [{ name: "engineer", groupName: "Role" }],
      })
    )
    expect(result.role).toBe("engineer")
  })

  it("extracts judgeVerdict from Verdict label group", () => {
    const result = mapLinearIssueToTask(
      makeIssue({
        labels: [{ name: "approved", groupName: "Verdict" }],
      })
    )
    expect(result.judgeVerdict).toBe("approved")
  })

  it("handles multiple label groups at once", () => {
    const result = mapLinearIssueToTask(
      makeIssue({
        labels: [
          { name: "code-implementation", groupName: "Task Type" },
          { name: "interactive", groupName: "Mode" },
          { name: "engineer", groupName: "Role" },
          { name: "pending", groupName: "Verdict" },
        ],
      })
    )
    expect(result.taskType).toBe("code-implementation")
    expect(result.mode).toBe("interactive")
    expect(result.role).toBe("engineer")
    expect(result.judgeVerdict).toBe("pending")
  })

  it("leaves label-derived fields undefined when labels are absent", () => {
    const result = mapLinearIssueToTask(makeIssue({ labels: [] }))
    expect(result.taskType).toBeUndefined()
    expect(result.mode).toBeUndefined()
    expect(result.role).toBeUndefined()
    expect(result.judgeVerdict).toBeUndefined()
  })

  it("ignores labels with no groupName", () => {
    const result = mapLinearIssueToTask(
      makeIssue({
        labels: [{ name: "bug", groupName: undefined }],
      })
    )
    expect(result.taskType).toBeUndefined()
    expect(result.mode).toBeUndefined()
    expect(result.role).toBeUndefined()
    expect(result.judgeVerdict).toBeUndefined()
  })

  it("maps created date", () => {
    const result = mapLinearIssueToTask(
      makeIssue({ createdAt: "2026-03-20T10:00:00Z" })
    )
    expect(result.created).toBe("2026-03-20T10:00:00Z")
  })

  it("does not include framework-side fields", () => {
    const result = mapLinearIssueToTask(makeIssue())
    expect(result.file).toBeUndefined()
    expect(result.budgetUsd).toBeUndefined()
    expect(result.worktree).toBeUndefined()
    expect(result.branch).toBeUndefined()
    expect(result.hasReport).toBeUndefined()
    expect(result.hasVerdict).toBeUndefined()
    expect(result.hasBlockers).toBeUndefined()
    expect(result.durationSeconds).toBeUndefined()
    expect(result.tokensInput).toBeUndefined()
    expect(result.tokensOutput).toBeUndefined()
    expect(result.costUsd).toBeUndefined()
  })
})
