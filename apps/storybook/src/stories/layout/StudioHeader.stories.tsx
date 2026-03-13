import type { Meta, StoryObj } from "@storybook/react"
import { StudioHeader } from "@sherpa/studio-ui/studio-header"

const meta = {
  title: "Layout/StudioHeader",
  component: StudioHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StudioHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
