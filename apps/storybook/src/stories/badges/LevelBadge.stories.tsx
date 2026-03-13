import type { Meta, StoryObj } from "@storybook/react"
import { LevelBadge } from "@sherpa/studio-ui/level-badge"

const meta = {
  title: "Badges/LevelBadge",
  component: LevelBadge,
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: "select",
      options: ["L1", "L2", "L3", "L4", "L5"],
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "radio",
      options: ["primitive", "gold"],
    },
  },
} satisfies Meta<typeof LevelBadge>

export default meta
type Story = StoryObj<typeof meta>

export const L1: Story = {
  args: { level: "L1" },
}

export const L3: Story = {
  args: { level: "L3" },
}

export const L5: Story = {
  args: { level: "L5" },
}

export const GoldVariant: Story = {
  args: { level: "L4", variant: "gold" },
}

export const SmallSize: Story = {
  args: { level: "L3", size: "sm" },
}

export const LargeSize: Story = {
  args: { level: "L3", size: "lg" },
}

export const ProgressiveIntensity: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {(["L1", "L2", "L3", "L4", "L5"] as const).map((level) => (
        <LevelBadge key={level} level={level} />
      ))}
    </div>
  ),
}

export const GoldProgression: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {(["L1", "L2", "L3", "L4", "L5"] as const).map((level) => (
        <LevelBadge key={level} level={level} variant="gold" />
      ))}
    </div>
  ),
}
