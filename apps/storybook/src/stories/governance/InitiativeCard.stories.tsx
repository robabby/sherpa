import type { Meta, StoryObj } from "@storybook/react"
import { InitiativeCard } from "@sherpa/studio-ui/initiative-card"

const meta = {
  title: "Governance/InitiativeCard",
  component: InitiativeCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InitiativeCard>

export default meta
type Story = StoryObj<typeof meta>

const mockInitiative = {
  slug: "design-system",
  title: "Design System",
  summary: "Token registry, component catalog, pattern library",
  status: "in-progress",
  type: "new-plan",
  risk: "additive",
  created: "2026-03-01",
  updated: "2026-03-13",
  targets: ["packages/studio-core", "packages/studio-ui"],
  dependencies: [],
  source: "docs/initiatives/design-system",
  hasActivity: true,
  hasPlan: true,
  spawnedFrom: null,
  subDirectories: [
    { name: "research", fileCount: 5 },
    { name: "changes", fileCount: 2 },
  ],
} as never

export const Default: Story = {
  args: {
    initiative: mockInitiative,
  },
}

export const Pending: Story = {
  args: {
    initiative: {
      ...mockInitiative,
      status: "pending",
      title: "Agent Framework Patterns",
      summary: "Research-validated behavioral engineering patterns for AI agents",
      type: "research-synthesis",
      risk: "evolutionary",
    } as never,
  },
}

export const Approved: Story = {
  args: {
    initiative: {
      ...mockInitiative,
      status: "approved",
      title: "Convention Sync CLI",
      summary: "sherpa init and sherpa sync commands for convention management",
      type: "new-skill",
      risk: "structural",
    } as never,
  },
}

export const Integrated: Story = {
  args: {
    initiative: {
      ...mockInitiative,
      status: "integrated",
      title: "Studio Extraction",
      summary: "Extract studio-core, studio-ui, studio-mcp packages from WavePoint",
    } as never,
  },
}

export const NoSubdirectories: Story = {
  args: {
    initiative: {
      ...mockInitiative,
      title: "Simple Initiative",
      summary: "A minimal initiative with no subdirectories",
      subDirectories: [],
    } as never,
  },
}

export const NoSummary: Story = {
  args: {
    initiative: {
      ...mockInitiative,
      title: "Untitled Initiative",
      summary: "",
      subDirectories: [],
    } as never,
  },
}

export const Gallery: Story = {
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
  render: () => {
    const statuses = ["pending", "approved", "in-progress", "integrated", "declined", "archived"] as const
    return (
      <div className="grid grid-cols-2 gap-4">
        {statuses.map((status) => (
          <InitiativeCard
            key={status}
            initiative={{
              ...mockInitiative,
              slug: `init-${status}`,
              title: `${status.charAt(0).toUpperCase() + status.slice(1)} Initiative`,
              status,
            } as never}
          />
        ))}
      </div>
    )
  },
}
