import type { Meta, StoryObj } from "@storybook/react"
import { ActivityFullTimeline } from "@sherpa/studio-ui/activity-full-timeline"

const meta = {
  title: "Content/ActivityFullTimeline",
  component: ActivityFullTimeline,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityFullTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dateGroups: [
      {
        date: "2026-03-10",
        label: "Mar 10",
        entries: [
          {
            date: "2026-03-10",
            description: "Web: Launched Studio dashboard",
            scope: "web",
            scopeText: "Launched Studio dashboard",
          },
          {
            date: "2026-03-10",
            description: "Docs: Updated initiative convention",
            scope: "docs",
            scopeText: "Updated initiative convention",
          },
        ],
      },
      {
        date: "2026-03-09",
        label: "Mar 9",
        entries: [
          {
            date: "2026-03-09",
            description: "Monorepo: Extracted studio-ui package (#340)",
            scope: "monorepo",
            scopeText: "Extracted studio-ui package (#340)",
          },
        ],
      },
      {
        date: "2026-03-08",
        label: "Mar 8",
        entries: [
          {
            date: "2026-03-08",
            description: "Fixed build pipeline for storybook",
            scope: null,
            scopeText: "Fixed build pipeline for storybook",
          },
        ],
      },
    ] as never,
  },
}

export const Empty: Story = {
  args: {
    dateGroups: [],
  },
}

export const SingleDay: Story = {
  args: {
    dateGroups: [
      {
        date: "2026-03-10",
        label: "Mar 10",
        entries: [
          {
            date: "2026-03-10",
            description: "Web: Shipped new header component",
            scope: "web",
            scopeText: "Shipped new header component",
          },
          {
            date: "2026-03-10",
            description: "Web: Added breadcrumb navigation (#345)",
            scope: "web",
            scopeText: "Added breadcrumb navigation (#345)",
          },
          {
            date: "2026-03-10",
            description: "Docs: Wrote CLAUDE.md for studio-ui",
            scope: "docs",
            scopeText: "Wrote CLAUDE.md for studio-ui",
          },
        ],
      },
    ] as never,
  },
}

export const ManyDays: Story = {
  args: {
    dateGroups: [
      {
        date: "2026-03-10",
        label: "Mar 10",
        entries: [
          { date: "2026-03-10", description: "Web: Launched v2 dashboard", scope: "web", scopeText: "Launched v2 dashboard" },
        ],
      },
      {
        date: "2026-03-09",
        label: "Mar 9",
        entries: [
          { date: "2026-03-09", description: "Monorepo: Added workspace scripts", scope: "monorepo", scopeText: "Added workspace scripts" },
          { date: "2026-03-09", description: "Web: Iteration 3 — timeline view", scope: "web", scopeText: "Iteration 3 \u2014 timeline view" },
        ],
      },
      {
        date: "2026-03-08",
        label: "Mar 8",
        entries: [
          { date: "2026-03-08", description: "Docs: Research report on role prompting", scope: "docs", scopeText: "Research report on role prompting" },
        ],
      },
      {
        date: "2026-03-07",
        label: "Mar 7",
        entries: [
          { date: "2026-03-07", description: "Web: Bootstrapped Storybook (#330)", scope: "web", scopeText: "Bootstrapped Storybook (#330)" },
          { date: "2026-03-07", description: "Updated CI pipeline config", scope: null, scopeText: "Updated CI pipeline config" },
        ],
      },
      {
        date: "2026-03-06",
        label: "Mar 6",
        entries: [
          { date: "2026-03-06", description: "Web: Created hub panel components", scope: "web", scopeText: "Created hub panel components" },
          { date: "2026-03-06", description: "Monorepo: Fixed path aliases", scope: "monorepo", scopeText: "Fixed path aliases" },
          { date: "2026-03-06", description: "Docs: Initiative convention v2", scope: "docs", scopeText: "Initiative convention v2" },
        ],
      },
    ] as never,
  },
}

export const NoScopes: Story = {
  args: {
    dateGroups: [
      {
        date: "2026-03-10",
        label: "Mar 10",
        entries: [
          { date: "2026-03-10", description: "Fixed type errors in build", scope: null, scopeText: "Fixed type errors in build" },
          { date: "2026-03-10", description: "Updated dependencies", scope: null, scopeText: "Updated dependencies" },
        ],
      },
      {
        date: "2026-03-09",
        label: "Mar 9",
        entries: [
          { date: "2026-03-09", description: "Cleaned up unused imports", scope: null, scopeText: "Cleaned up unused imports" },
        ],
      },
    ] as never,
  },
}
