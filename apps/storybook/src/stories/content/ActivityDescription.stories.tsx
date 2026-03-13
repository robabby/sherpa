import type { Meta, StoryObj } from "@storybook/react"
import { ActivityDescription } from "@sherpa/studio-ui/activity-description"

const meta = {
  title: "Content/ActivityDescription",
  component: ActivityDescription,
  tags: ["autodocs"],
} satisfies Meta<typeof ActivityDescription>

export default meta
type Story = StoryObj<typeof meta>

export const TextOnly: Story = {
  args: {
    segments: [{ type: "text", value: "Bootstrapped monorepo with pnpm workspaces" }],
  },
}

export const WithPrLink: Story = {
  args: {
    segments: [
      { type: "text", value: "Added activity timeline component " },
      { type: "pr-link", number: 343, url: "https://github.com/robabby/wavepoint/pull/343" },
    ],
  },
}

export const MultiplePrLinks: Story = {
  args: {
    segments: [
      { type: "text", value: "Refactored scope badges " },
      { type: "pr-link", number: 101, url: "https://github.com/robabby/wavepoint/pull/101" },
      { type: "text", value: " and timeline layout " },
      { type: "pr-link", number: 102, url: "https://github.com/robabby/wavepoint/pull/102" },
    ],
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-3 text-sm">
      <div>
        <span className="mr-2 text-xs text-muted-foreground">Text only:</span>
        <ActivityDescription
          segments={[{ type: "text", value: "Plain text description with no links" }]}
        />
      </div>
      <div>
        <span className="mr-2 text-xs text-muted-foreground">Single PR:</span>
        <ActivityDescription
          segments={[
            { type: "text", value: "Fixed build pipeline " },
            { type: "pr-link", number: 55, url: "#" },
          ]}
        />
      </div>
      <div>
        <span className="mr-2 text-xs text-muted-foreground">Multiple PRs:</span>
        <ActivityDescription
          segments={[
            { type: "text", value: "Shipped auth " },
            { type: "pr-link", number: 200, url: "#" },
            { type: "text", value: " + session mgmt " },
            { type: "pr-link", number: 201, url: "#" },
            { type: "text", value: " + docs " },
            { type: "pr-link", number: 202, url: "#" },
          ]}
        />
      </div>
    </div>
  ),
}
