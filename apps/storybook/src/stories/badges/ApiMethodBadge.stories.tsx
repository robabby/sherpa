import type { Meta, StoryObj } from "@storybook/react"
import { ApiMethodBadge } from "@sherpa/studio-ui/api-method-badge"

const meta = {
  title: "Badges/ApiMethodBadge",
  component: ApiMethodBadge,
  tags: ["autodocs"],
  argTypes: {
    method: { control: "radio", options: ["GET", "POST"] },
  },
} satisfies Meta<typeof ApiMethodBadge>

export default meta
type Story = StoryObj<typeof meta>

export const GET: Story = {
  args: { method: "GET" },
}

export const POST: Story = {
  args: { method: "POST" },
}

export const BothMethods: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ApiMethodBadge method="GET" />
      <ApiMethodBadge method="POST" />
    </div>
  ),
}
