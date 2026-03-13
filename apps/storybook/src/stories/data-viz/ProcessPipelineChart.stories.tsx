import type { Meta, StoryObj } from "@storybook/react"
import { ProcessPipelineChart } from "@sherpa/studio-ui/process-pipeline-chart"

const meta = {
  title: "Data Viz/ProcessPipelineChart",
  component: ProcessPipelineChart,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProcessPipelineChart>

export default meta
type Story = StoryObj<typeof meta>

export const Balanced: Story = {
  args: {
    data: { pending: 3, approved: 2, "in-progress": 4, integrated: 8 },
  },
}

export const MostlyIntegrated: Story = {
  args: {
    data: { pending: 1, approved: 0, "in-progress": 1, integrated: 15 },
  },
}

export const AllPending: Story = {
  args: {
    data: { pending: 10, approved: 0, "in-progress": 0, integrated: 0 },
  },
}

export const EvenSplit: Story = {
  args: {
    data: { pending: 5, approved: 5, "in-progress": 5, integrated: 5 },
  },
}

export const Empty: Story = {
  args: {
    data: { pending: 0, approved: 0, "in-progress": 0, integrated: 0 },
  },
}
