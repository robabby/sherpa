import type { Meta, StoryObj } from "@storybook/react"
import { SortControl } from "@sherpa/studio-ui/sort-control"

const meta = {
  title: "Layout/SortControl",
  component: SortControl,
  tags: ["autodocs"],
} satisfies Meta<typeof SortControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
