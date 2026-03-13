import type { Meta, StoryObj } from "@storybook/react"
import { HubOperationalPulse } from "@sherpa/studio-ui/hub-operational-pulse"

const makeInitiative = (status: string) => ({
  slug: `init-${status}`,
  title: `${status} initiative`,
  summary: "",
  status,
  type: "research-synthesis",
  risk: "additive",
  created: "2026-01-01",
  updated: "2026-03-10",
  targets: [],
  dependencies: [],
  source: "docs/initiatives/test",
  hasActivity: false,
  hasPlan: false,
  subdirectories: [],
})

const meta = {
  title: "Data Viz/HubOperationalPulse",
  component: HubOperationalPulse,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HubOperationalPulse>

export default meta
type Story = StoryObj<typeof meta>

export const FullDashboard: Story = {
  args: {
    initiatives: [
      makeInitiative("pending"),
      makeInitiative("in-progress"),
      makeInitiative("in-progress"),
      makeInitiative("integrated"),
    ] as never[],
    workstreams: [
      { id: "ws-1", title: "Core", status: "active" },
      { id: "ws-2", title: "UI", status: "active" },
      { id: "ws-3", title: "Docs", status: "paused" },
    ] as never[],
    portfolio: {
      apps: [{ name: "WavePoint" }, { name: "Sherpa" }],
      lastUpdated: "2026-03-12",
    } as never,
    skillCount: 5,
    primitiveCount: 12,
    endpointCount: 8,
    staleCount: 2,
  },
}

export const Minimal: Story = {
  args: {
    initiatives: [] as never[],
    workstreams: [] as never[],
    portfolio: { apps: [], lastUpdated: "" } as never,
  },
}
