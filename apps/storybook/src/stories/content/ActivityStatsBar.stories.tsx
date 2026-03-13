import type { Meta, StoryObj } from "@storybook/react"
import { ActivityStatsBar } from "@sherpa/studio-ui/activity-stats-bar"

const meta = {
  title: "Content/ActivityStatsBar",
  component: ActivityStatsBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityStatsBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stats: {
      totalCount: 42,
      filteredCount: 42,
      dateRange: { first: "2026-01-15", last: "2026-03-10" },
      topScope: { name: "web", count: 18 },
    },
    isFiltered: false,
  },
}

export const Filtered: Story = {
  args: {
    stats: {
      totalCount: 42,
      filteredCount: 12,
      dateRange: { first: "2026-02-01", last: "2026-03-10" },
      topScope: { name: "web", count: 18 },
    },
    isFiltered: true,
  },
}

export const NoDateRange: Story = {
  args: {
    stats: {
      totalCount: 0,
      filteredCount: 0,
      dateRange: null,
      topScope: null,
    },
    isFiltered: false,
  },
}

export const NoTopScope: Story = {
  args: {
    stats: {
      totalCount: 5,
      filteredCount: 5,
      dateRange: { first: "2026-03-01", last: "2026-03-05" },
      topScope: null,
    },
    isFiltered: false,
  },
}

export const AllVariants: Story = {
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Unfiltered with top scope</p>
        <ActivityStatsBar
          stats={{
            totalCount: 42,
            filteredCount: 42,
            dateRange: { first: "2026-01-15", last: "2026-03-10" },
            topScope: { name: "web", count: 18 },
          }}
          isFiltered={false}
        />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Filtered (hides top scope)</p>
        <ActivityStatsBar
          stats={{
            totalCount: 42,
            filteredCount: 8,
            dateRange: { first: "2026-02-10", last: "2026-03-10" },
            topScope: { name: "web", count: 18 },
          }}
          isFiltered={true}
        />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Empty state</p>
        <ActivityStatsBar
          stats={{
            totalCount: 0,
            filteredCount: 0,
            dateRange: null,
            topScope: null,
          }}
          isFiltered={false}
        />
      </div>
    </div>
  ),
}
