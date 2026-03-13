import type { Meta, StoryObj } from "@storybook/react"
import { PromptCopyButton } from "@sherpa/studio-ui/prompt-copy-button"

const meta = {
  title: "UI/PromptCopyButton",
  component: PromptCopyButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "rr",
        "planning",
        "synthesize",
        "curate",
        "workforce",
        "pipeline",
        "morning",
        "plan-tasks",
        "integration-review",
        "shape",
        "stake",
        "spike",
        "design",
        "premortem",
        "stress-test",
        "memo",
        "radar",
      ],
    },
  },
} satisfies Meta<typeof PromptCopyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Research: Story = {
  args: { variant: "rr", prompt: "/rr design-system" },
}

export const Planning: Story = {
  args: { variant: "planning", prompt: "Plan the implementation for..." },
}

export const Shape: Story = {
  args: { variant: "shape", prompt: "/shape design-system" },
}

export const Spike: Story = {
  args: { variant: "spike", prompt: "/spike storybook-integration" },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(
        [
          "rr",
          "planning",
          "synthesize",
          "curate",
          "workforce",
          "pipeline",
          "morning",
          "plan-tasks",
          "integration-review",
          "shape",
          "stake",
          "spike",
          "design",
          "premortem",
          "stress-test",
          "memo",
          "radar",
        ] as const
      ).map((v) => (
        <PromptCopyButton key={v} variant={v} prompt={`Sample prompt for ${v}`} />
      ))}
    </div>
  ),
}
