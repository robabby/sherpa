import type { Meta, StoryObj } from "@storybook/react"
import { ScopeBadge } from "@sherpa/studio-ui/scope-badge"

const meta = {
  title: "Badges/ScopeBadge",
  component: ScopeBadge,
  tags: ["autodocs"],
  argTypes: {
    scope: {
      control: "text",
    },
  },
} satisfies Meta<typeof ScopeBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Web: Story = {
  args: { scope: "web" },
}

export const Docs: Story = {
  args: { scope: "docs" },
}

export const Monorepo: Story = {
  args: { scope: "monorepo" },
}

export const Unknown: Story = {
  args: { scope: "custom-scope" },
}

export const AllScopes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {["web", "docs", "monorepo", "api", "framework", "custom"].map((s) => (
        <ScopeBadge key={s} scope={s} />
      ))}
    </div>
  ),
}
