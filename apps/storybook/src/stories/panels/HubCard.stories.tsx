import type { Meta, StoryObj } from "@storybook/react"
import { HubCard } from "@sherpa/studio-ui/hub-card"

const meta = {
  title: "Panels/HubCard",
  component: HubCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HubCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    href: "#",
    title: "Initiatives",
    stats: [
      { label: "Active", value: 5 },
      { label: "Pending", value: 2 },
      { label: "Integrated", value: 12 },
    ],
    linkText: "View all",
  },
}

export const SingleStat: Story = {
  args: {
    href: "#",
    title: "Skills",
    stats: [{ label: "Available", value: 8 }],
    linkText: "Browse",
  },
}
