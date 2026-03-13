import type { Meta, StoryObj } from "@storybook/react"
import { ActivityEntry } from "@sherpa/studio-ui/activity-entry"

const meta = {
  title: "Content/ActivityEntry",
  component: ActivityEntry,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityEntry>

export default meta
type Story = StoryObj<typeof meta>

export const Launch: Story = {
  args: {
    entry: { date: "2026-03-10", description: "Bootstrapped monorepo with pnpm workspaces" },
    segments: [{ type: "text", value: "Bootstrapped monorepo with pnpm workspaces" }],
    isFirst: true,
    isLast: false,
  },
}

export const Milestone: Story = {
  args: {
    entry: { date: "2026-03-08", description: "Iteration 3 complete — all panels wired" },
    segments: [{ type: "text", value: "Iteration 3 complete \u2014 all panels wired" }],
    isFirst: false,
    isLast: false,
  },
}

export const Iteration: Story = {
  args: {
    entry: { date: "2026-03-06", description: "Iteration 2 — scope badges and timeline" },
    segments: [{ type: "text", value: "Iteration 2 \u2014 scope badges and timeline" }],
    isFirst: false,
    isLast: false,
  },
}

export const Update: Story = {
  args: {
    entry: { date: "2026-03-05", description: "Fixed responsive layout on hub panels" },
    segments: [{ type: "text", value: "Fixed responsive layout on hub panels" }],
    isFirst: false,
    isLast: true,
  },
}

export const WithPrLink: Story = {
  args: {
    entry: { date: "2026-03-09", description: "Launched activity timeline (#343)" },
    segments: [
      { type: "text", value: "Launched activity timeline " },
      { type: "pr-link", number: 343, url: "https://github.com/robabby/wavepoint/pull/343" },
    ],
    isFirst: true,
    isLast: false,
  },
}

export const LongDescription: Story = {
  args: {
    entry: {
      date: "2026-03-07",
      description:
        "Refactored the entire activity processing pipeline to support scope filtering, date grouping, and stats computation. Also added truncation with expand/collapse for long descriptions like this one that exceed the character limit.",
    },
    segments: [
      {
        type: "text",
        value:
          "Refactored the entire activity processing pipeline to support scope filtering, date grouping, and stats computation. Also added truncation with expand/collapse for long descriptions like this one that exceed the character limit.",
      },
    ],
    isFirst: false,
    isLast: false,
  },
}

export const AllCategories: Story = {
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div>
      <ActivityEntry
        entry={{ date: "2026-03-10", description: "Launched new Studio dashboard" }}
        segments={[{ type: "text", value: "Launched new Studio dashboard" }]}
        isFirst={true}
        isLast={false}
      />
      <ActivityEntry
        entry={{ date: "2026-03-09", description: "Iteration 4 complete — full test coverage" }}
        segments={[{ type: "text", value: "Iteration 4 complete \u2014 full test coverage" }]}
        isFirst={false}
        isLast={false}
      />
      <ActivityEntry
        entry={{ date: "2026-03-08", description: "Iteration 3 — timeline and scope filters" }}
        segments={[{ type: "text", value: "Iteration 3 \u2014 timeline and scope filters" }]}
        isFirst={false}
        isLast={false}
      />
      <ActivityEntry
        entry={{ date: "2026-03-07", description: "Updated badge colors for consistency" }}
        segments={[{ type: "text", value: "Updated badge colors for consistency" }]}
        isFirst={false}
        isLast={true}
      />
    </div>
  ),
}
