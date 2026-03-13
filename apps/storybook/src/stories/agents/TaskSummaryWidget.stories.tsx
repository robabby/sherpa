import type { Meta, StoryObj } from "@storybook/react"
import { TaskSummaryWidget } from "@sherpa/studio-ui/task-summary-widget"

const mockTasks = [
  {
    id: "extract-ui-components",
    file: "extract-ui-components.md",
    status: "pending",
    role: "implementer",
    priority: "high",
    initiative: "studio-extraction",
    backend: "claude",
    model: "opus",
    budgetUsd: "2.00",
    worktree: null,
    branch: null,
    created: "2026-03-10",
    dispatchedAt: null,
    completedAt: null,
    judgeVerdict: "pending",
    taskType: "implementation",
    mode: "supervised",
    title: "Extract UI components to studio-ui package",
    hasReport: false,
    hasVerdict: false,
    hasBlockers: false,
  },
  {
    id: "write-storybook-stories",
    file: "write-storybook-stories.md",
    status: "dispatched",
    role: "implementer",
    priority: "medium",
    initiative: "design-system",
    backend: "lm-studio",
    model: "qwen-32b",
    budgetUsd: "0.50",
    worktree: ".worktrees/design-system",
    branch: "feat/storybook-stories",
    created: "2026-03-11",
    dispatchedAt: "2026-03-12",
    completedAt: null,
    judgeVerdict: "pending",
    taskType: "implementation",
    mode: "autonomous",
    title: "Write Storybook stories for badge components",
    hasReport: false,
    hasVerdict: false,
    hasBlockers: false,
  },
  {
    id: "review-initiative-proposals",
    file: "review-initiative-proposals.md",
    status: "completed",
    role: "reviewer",
    priority: "urgent",
    initiative: "governance-update",
    backend: "claude",
    model: "opus",
    budgetUsd: "1.50",
    worktree: null,
    branch: null,
    created: "2026-03-09",
    dispatchedAt: "2026-03-09",
    completedAt: "2026-03-10",
    judgeVerdict: "approved",
    taskType: "review",
    mode: "supervised",
    title: "Review pending initiative proposals",
    hasReport: true,
    hasVerdict: true,
    hasBlockers: false,
  },
  {
    id: "deploy-mcp-server",
    file: "deploy-mcp-server.md",
    status: "failed",
    role: "operator",
    priority: "high",
    initiative: "mcp-integration",
    backend: "claude",
    model: "sonnet",
    budgetUsd: "1.00",
    worktree: null,
    branch: null,
    created: "2026-03-08",
    dispatchedAt: "2026-03-08",
    completedAt: "2026-03-09",
    judgeVerdict: "failed",
    taskType: "deployment",
    mode: "supervised",
    title: "Deploy MCP server to production",
    hasReport: true,
    hasVerdict: true,
    hasBlockers: true,
  },
  {
    id: "research-agent-patterns",
    file: "research-agent-patterns.md",
    status: "reviewed",
    role: "researcher",
    priority: "low",
    initiative: "agent-framework-patterns",
    backend: "lm-studio",
    model: "qwen-32b",
    budgetUsd: "0.25",
    worktree: null,
    branch: null,
    created: "2026-03-07",
    dispatchedAt: "2026-03-07",
    completedAt: "2026-03-08",
    judgeVerdict: "approved",
    taskType: "research",
    mode: "autonomous",
    title: "Research behavioral agent pattern literature",
    hasReport: true,
    hasVerdict: true,
    hasBlockers: false,
  },
] as never[]

const meta = {
  title: "Agents/TaskSummaryWidget",
  component: TaskSummaryWidget,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskSummaryWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tasks: mockTasks,
  },
}

export const PendingOnly: Story = {
  args: {
    tasks: mockTasks.filter((t: never) => (t as { status: string }).status === "pending"),
  },
}

export const MixedStatuses: Story = {
  args: {
    tasks: mockTasks.slice(0, 3),
  },
}

export const Empty: Story = {
  args: {
    tasks: [],
  },
}
