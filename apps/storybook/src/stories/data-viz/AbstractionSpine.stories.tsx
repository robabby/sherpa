import type { Meta, StoryObj } from "@storybook/react"
import { AbstractionSpine } from "@sherpa/studio-ui/abstraction-spine"

const meta = {
  title: "Data Viz/AbstractionSpine",
  component: AbstractionSpine,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AbstractionSpine>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    perLevel: { L1: 4, L2: 6, L3: 8, L4: 3, L5: 2 } as never,
    uncategorized: 5,
    activeFilter: null,
  },
}

export const FilteredL3: Story = {
  args: {
    perLevel: { L1: 4, L2: 6, L3: 8, L4: 3, L5: 2 } as never,
    uncategorized: 5,
    activeFilter: "L3" as never,
  },
}

export const FilteredL5: Story = {
  args: {
    perLevel: { L1: 4, L2: 6, L3: 8, L4: 3, L5: 2 } as never,
    uncategorized: 5,
    activeFilter: "L5" as never,
  },
}

export const FilteredUncategorized: Story = {
  args: {
    perLevel: { L1: 4, L2: 6, L3: 8, L4: 3, L5: 2 } as never,
    uncategorized: 5,
    activeFilter: "uncategorized",
  },
}

export const NoUncategorized: Story = {
  args: {
    perLevel: { L1: 3, L2: 5, L3: 10, L4: 4, L5: 1 } as never,
    uncategorized: 0,
    activeFilter: null,
  },
}

export const HeavyL1: Story = {
  args: {
    perLevel: { L1: 15, L2: 3, L3: 2, L4: 1, L5: 0 } as never,
    uncategorized: 8,
    activeFilter: null,
  },
}

export const Sparse: Story = {
  args: {
    perLevel: { L1: 1, L2: 0, L3: 1, L4: 0, L5: 1 } as never,
    uncategorized: 0,
    activeFilter: null,
  },
}
