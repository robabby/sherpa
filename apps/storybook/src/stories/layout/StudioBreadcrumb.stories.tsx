import type { Meta, StoryObj } from "@storybook/react"
import { StudioBreadcrumb } from "@sherpa/studio-ui/studio-breadcrumb"

const meta = {
  title: "Layout/StudioBreadcrumb",
  component: StudioBreadcrumb,
  tags: ["autodocs"],
} satisfies Meta<typeof StudioBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const TwoLevels: Story = {
  args: {
    segments: [
      { label: "Process", href: "/process" },
      { label: "Design System" },
    ],
  },
}

export const ThreeLevels: Story = {
  args: {
    segments: [
      { label: "Workforce", href: "/workforce" },
      { label: "Roles", href: "/workforce/roles" },
      { label: "Code Reviewer" },
    ],
  },
}

export const SingleLevel: Story = {
  args: {
    segments: [{ label: "Dashboard" }],
  },
}
