import type { Meta, StoryObj } from "@storybook/react"
import { SectionHeader } from "@sherpa/studio-ui/section-header"

const meta = {
  title: "Layout/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: "Governance",
    title: "Process Dashboard",
  },
}

export const Research: Story = {
  args: {
    label: "Discovery",
    title: "Research Library",
  },
}
