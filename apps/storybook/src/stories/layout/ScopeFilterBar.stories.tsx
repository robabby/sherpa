import type { Meta, StoryObj } from "@storybook/react"
import { ScopeFilterBar } from "@sherpa/studio-ui/scope-filter-bar"

const meta = {
  title: "Layout/ScopeFilterBar",
  component: ScopeFilterBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScopeFilterBar>

export default meta
type Story = StoryObj<typeof meta>

export const AllSelected: Story = {
  args: {
    scopeCounts: {
      governance: 12,
      research: 8,
      development: 15,
      operations: 5,
    },
    activeScope: null,
    totalCount: 40,
  },
}

export const GovernanceActive: Story = {
  args: {
    scopeCounts: {
      governance: 12,
      research: 8,
      development: 15,
      operations: 5,
    },
    activeScope: "governance",
    totalCount: 40,
  },
}

export const ResearchActive: Story = {
  args: {
    scopeCounts: {
      governance: 12,
      research: 8,
      development: 15,
      operations: 5,
    },
    activeScope: "research",
    totalCount: 40,
  },
}

export const SingleScope: Story = {
  args: {
    scopeCounts: {
      development: 10,
    },
    activeScope: null,
    totalCount: 10,
  },
}

export const ManyScopes: Story = {
  args: {
    scopeCounts: {
      governance: 12,
      research: 8,
      development: 15,
      operations: 5,
      infrastructure: 3,
      design: 7,
      testing: 4,
    },
    activeScope: null,
    totalCount: 54,
  },
}
