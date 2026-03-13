import type { Meta, StoryObj } from "@storybook/react"
import { ProcessKindIcon } from "@sherpa/studio-ui/process-kind-icon"

const KINDS = [
  "initiative-tree",
  "initiative",
  "workstream",
  "seed",
  "skill",
  "convention",
  "primitive",
] as const

const meta = {
  title: "Layout/ProcessKindIcon",
  component: ProcessKindIcon,
  tags: ["autodocs"],
  argTypes: {
    kind: { control: "select", options: [...KINDS] },
  },
} satisfies Meta<typeof ProcessKindIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Initiative: Story = {
  args: { kind: "initiative" },
}

export const Workstream: Story = {
  args: { kind: "workstream" },
}

export const Seed: Story = {
  args: { kind: "seed" },
}

export const AllKinds: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {KINDS.map((kind) => (
        <div key={kind} className="flex flex-col items-center gap-1">
          <ProcessKindIcon kind={kind} className="h-5 w-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{kind}</span>
        </div>
      ))}
    </div>
  ),
}
