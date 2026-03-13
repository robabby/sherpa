import type { Meta, StoryObj } from "@storybook/react"
import { SacredSpinner } from "@/components/ui/sacred-spinner"

const meta = {
  title: "UI/SacredSpinner",
  component: SacredSpinner,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof SacredSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = {
  args: { size: "sm" },
}

export const Medium: Story = {
  args: { size: "md" },
}

export const Large: Story = {
  args: { size: "lg" },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <SacredSpinner size="sm" />
      <SacredSpinner size="md" />
      <SacredSpinner size="lg" />
    </div>
  ),
}
