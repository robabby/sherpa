import type { Meta, StoryObj } from "@storybook/react"
import { ProcessDashboard } from "@sherpa/studio-ui/process-dashboard"

const meta = {
  title: "Governance/ProcessDashboard",
  component: ProcessDashboard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProcessDashboard>

export default meta
type Story = StoryObj<typeof meta>

const makeInitiative = (slug: string, status: string, title: string) => ({
  slug,
  title,
  summary: `Summary for ${title}`,
  status,
  type: "new-plan",
  risk: "additive",
  created: "2026-01-15",
  updated: "2026-03-13",
  targets: [],
  dependencies: [],
  source: `docs/initiatives/${slug}`,
  hasActivity: status === "in-progress",
  hasPlan: status !== "pending",
  spawnedFrom: null,
  subDirectories: [],
}) as never

export const Default: Story = {
  args: {
    stats: {
      totalInitiatives: 8,
      activeWorkstreams: 3,
      totalIterations: 14,
      totalOpenQuestions: 5,
      pendingSeeds: 2,
      statusCounts: {
        pending: 2,
        approved: 1,
        "in-progress": 3,
        integrated: 2,
      },
    },
    initiatives: [
      makeInitiative("design-system", "in-progress", "Design System"),
      makeInitiative("agent-patterns", "in-progress", "Agent Patterns"),
      makeInitiative("convention-sync", "in-progress", "Convention Sync"),
      makeInitiative("research-tools", "approved", "Research Tools"),
      makeInitiative("mcp-server", "pending", "MCP Server"),
      makeInitiative("studio-extract", "pending", "Studio Extraction"),
      makeInitiative("behavioral-eng", "integrated", "Behavioral Engineering"),
      makeInitiative("init-system", "integrated", "Initiative System"),
    ],
  },
}

export const AllPending: Story = {
  args: {
    stats: {
      totalInitiatives: 4,
      activeWorkstreams: 0,
      totalIterations: 0,
      totalOpenQuestions: 12,
      pendingSeeds: 0,
      statusCounts: {
        pending: 4,
        approved: 0,
        "in-progress": 0,
        integrated: 0,
      },
    },
    initiatives: [
      makeInitiative("init-1", "pending", "Initiative One"),
      makeInitiative("init-2", "pending", "Initiative Two"),
      makeInitiative("init-3", "pending", "Initiative Three"),
      makeInitiative("init-4", "pending", "Initiative Four"),
    ],
  },
}

export const Empty: Story = {
  args: {
    stats: {
      totalInitiatives: 0,
      activeWorkstreams: 0,
      totalIterations: 0,
      totalOpenQuestions: 0,
      pendingSeeds: 0,
      statusCounts: {
        pending: 0,
        approved: 0,
        "in-progress": 0,
        integrated: 0,
      },
    },
    initiatives: [],
  },
}

export const HighVolume: Story = {
  args: {
    stats: {
      totalInitiatives: 25,
      activeWorkstreams: 8,
      totalIterations: 47,
      totalOpenQuestions: 19,
      pendingSeeds: 6,
      statusCounts: {
        pending: 5,
        approved: 3,
        "in-progress": 8,
        integrated: 9,
      },
    },
    initiatives: Array.from({ length: 25 }, (_, i) => {
      const statuses = ["pending", "approved", "in-progress", "integrated"]
      return makeInitiative(
        `init-${i}`,
        statuses[i % statuses.length]!,
        `Initiative ${i + 1}`,
      )
    }),
  },
}
