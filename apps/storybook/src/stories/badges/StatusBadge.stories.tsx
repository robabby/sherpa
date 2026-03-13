import type { Meta, StoryObj } from "@storybook/react"
import { StatusBadge } from "@sherpa/studio-ui/status-badge"

const meta = {
  title: "Badges/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: [
        "pending",
        "approved",
        "in-progress",
        "integrated",
        "declined",
        "archived",
        "active",
        "paused",
        "completed",
        "additive",
        "evolutionary",
        "structural",
        "default",
      ],
    },
    mode: {
      control: "radio",
      options: ["badge", "led"],
    },
  },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = {
  args: { status: "pending" },
}

export const Approved: Story = {
  args: { status: "approved" },
}

export const InProgress: Story = {
  args: { status: "in-progress" },
}

export const Integrated: Story = {
  args: { status: "integrated" },
}

export const Declined: Story = {
  args: { status: "declined" },
}

export const Archived: Story = {
  args: { status: "archived" },
}

export const Active: Story = {
  args: { status: "active" },
}

export const Paused: Story = {
  args: { status: "paused" },
}

export const Completed: Story = {
  args: { status: "completed" },
}

export const RiskAdditive: Story = {
  args: { status: "additive" },
}

export const RiskEvolutionary: Story = {
  args: { status: "evolutionary" },
}

export const RiskStructural: Story = {
  args: { status: "structural" },
}

export const DefaultFallback: Story = {
  args: { status: "unknown-status" },
}

export const LEDMode: Story = {
  args: { status: "active", mode: "led" },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[
        "pending",
        "approved",
        "in-progress",
        "integrated",
        "declined",
        "archived",
        "active",
        "paused",
        "completed",
        "additive",
        "evolutionary",
        "structural",
      ].map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
}

export const AllLEDs: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {[
        "active",
        "pending",
        "in-progress",
        "declined",
        "integrated",
        "archived",
      ].map((s) => (
        <div key={s} className="flex flex-col items-center gap-1">
          <StatusBadge status={s} mode="led" />
          <span className="text-xs text-muted-foreground">{s}</span>
        </div>
      ))}
    </div>
  ),
}
