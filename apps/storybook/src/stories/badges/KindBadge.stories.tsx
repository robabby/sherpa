import type { Meta, StoryObj } from "@storybook/react"
import { KindBadge } from "@sherpa/studio-ui/kind-badge"

const meta = {
  title: "Badges/KindBadge",
  component: KindBadge,
  tags: ["autodocs"],
  argTypes: {
    kind: {
      control: "select",
      options: ["function", "interface", "type-alias", "variable", "enum"],
    },
  },
} satisfies Meta<typeof KindBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Function: Story = {
  args: { kind: "function" },
}

export const Interface: Story = {
  args: { kind: "interface" },
}

export const TypeAlias: Story = {
  args: { kind: "type-alias" },
}

export const Variable: Story = {
  args: { kind: "variable" },
}

export const Enum: Story = {
  args: { kind: "enum" },
}

export const AllKinds: Story = {
  render: () => (
    <div className="flex gap-2">
      {(["function", "interface", "type-alias", "variable", "enum"] as const).map((k) => (
        <KindBadge key={k} kind={k} />
      ))}
    </div>
  ),
}
