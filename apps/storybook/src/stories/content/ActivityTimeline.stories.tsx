import type { Meta, StoryObj } from "@storybook/react"
import { ActivityTimeline } from "@sherpa/studio-ui/activity-timeline"

const meta = {
  title: "Content/ActivityTimeline",
  component: ActivityTimeline,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    entries: [
      { date: "2026-03-10", description: "Launched Studio dashboard with hub panels" },
      { date: "2026-03-09", description: "Iteration 3 complete — scope badges shipped" },
      { date: "2026-03-08", description: "Iteration 2 — activity timeline and stats bar" },
      { date: "2026-03-07", description: "Created monorepo structure (#101)" },
      { date: "2026-03-05", description: "Fixed responsive grid on hub cards" },
    ],
  },
}

export const Empty: Story = {
  args: {
    entries: [],
  },
}

export const SingleEntry: Story = {
  args: {
    entries: [
      { date: "2026-03-10", description: "Bootstrapped project" },
    ],
  },
}

export const WithPrLinks: Story = {
  args: {
    entries: [
      { date: "2026-03-10", description: "Shipped activity components (#343)" },
      { date: "2026-03-09", description: "Added scope filtering (#340) and stats bar (#341)" },
      { date: "2026-03-08", description: "Refactored hub layout" },
    ],
  },
}

export const MixedCategories: Story = {
  args: {
    entries: [
      { date: "2026-03-10", description: "Launched production deploy pipeline" },
      { date: "2026-03-09", description: "Iteration 5 complete — full E2E tests" },
      { date: "2026-03-08", description: "Iteration 4 — dark mode and theming" },
      { date: "2026-03-07", description: "Bootstrapped Storybook for component library" },
      { date: "2026-03-06", description: "Updated breadcrumb navigation styles" },
      { date: "2026-03-05", description: "Fixed type errors in process pipeline" },
      { date: "2026-03-04", description: "Created initiative proposal template" },
    ],
  },
}
