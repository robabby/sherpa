import type { Meta, StoryObj } from "@storybook/react"
import { LifecyclePipeline } from "@sherpa/studio-ui/lifecycle-pipeline"

const meta = {
  title: "Layout/LifecyclePipeline",
  component: LifecyclePipeline,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LifecyclePipeline>

export default meta
type Story = StoryObj<typeof meta>

const makeInitiative = (status: string) => ({
  slug: `init-${status}`,
  title: `${status} initiative`,
  summary: "Test",
  status,
  type: "research-synthesis",
  risk: "additive",
  created: "2026-01-01",
  updated: "2026-03-01",
  targets: [],
  dependencies: [],
  source: `docs/initiatives/${status}`,
  hasActivity: false,
  hasPlan: false,
  subdirectories: [],
})

export const Balanced: Story = {
  args: {
    initiatives: [
      makeInitiative("pending"),
      makeInitiative("pending"),
      makeInitiative("approved"),
      makeInitiative("in-progress"),
      makeInitiative("in-progress"),
      makeInitiative("in-progress"),
      makeInitiative("integrated"),
      makeInitiative("integrated"),
    ] as never[],
  },
}

export const AllPending: Story = {
  args: {
    initiatives: Array.from({ length: 5 }, () => makeInitiative("pending")) as never[],
  },
}

export const Empty: Story = {
  args: {
    initiatives: [],
  },
}
