import type { Meta, StoryObj } from "@storybook/react"
import { AppTile } from "@sherpa/studio-ui/app-tile"

const meta = {
  title: "Cards/AppTile",
  component: AppTile,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppTile>

export default meta
type Story = StoryObj<typeof meta>

export const OnTrack: Story = {
  args: {
    name: "WavePoint",
    type: "Astrology Platform",
    currentPhase: "Active Development",
    health: "On track",
    nextMilestone: "v2.0 launch",
  },
}

export const Paused: Story = {
  args: {
    name: "Numina",
    type: "Research Tool",
    currentPhase: "Paused — waiting on API",
    health: "Blocked",
    nextMilestone: "API integration",
  },
}

export const Grid: Story = {
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <AppTile name="WavePoint" type="Astrology Platform" currentPhase="Active" health="On track" nextMilestone="v2.0" />
      <AppTile name="Sherpa" type="Framework" currentPhase="Studio build" health="On track" nextMilestone="Storybook" />
    </div>
  ),
}
