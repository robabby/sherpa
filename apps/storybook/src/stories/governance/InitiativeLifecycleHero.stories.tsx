import type { Meta, StoryObj } from "@storybook/react"
import { InitiativeLifecycleHero } from "@sherpa/studio-ui/initiative-lifecycle-hero"

const meta = {
  title: "Governance/InitiativeLifecycleHero",
  component: InitiativeLifecycleHero,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InitiativeLifecycleHero>

export default meta
type Story = StoryObj<typeof meta>

const basePromptContext = {
  title: "Design System",
  slug: "design-system",
  source: "docs/initiatives/design-system",
  status: "pending",
  iterationCount: 0,
} as never

export const NeedsResearch: Story = {
  args: {
    promptContext: basePromptContext,
    lifecycle: {
      stage: "needs-research",
      label: "Needs Research",
      nextAction: "Launch /rr to begin research",
      actor: "agent",
      stageIndex: 0,
    } as never,
  },
}

export const NeedsReview: Story = {
  args: {
    promptContext: {
      ...basePromptContext,
      iterationCount: 3,
    } as never,
    lifecycle: {
      stage: "needs-review",
      label: "Needs Review",
      nextAction: "Review and approve proposal",
      actor: "human",
      stageIndex: 2,
    } as never,
  },
}

export const NeedsPlan: Story = {
  args: {
    promptContext: {
      ...basePromptContext,
      status: "approved",
    } as never,
    lifecycle: {
      stage: "needs-plan",
      label: "Needs Plan",
      nextAction: "Create implementation plan",
      actor: "agent",
      stageIndex: 3,
    } as never,
  },
}

export const ReadyToStart: Story = {
  args: {
    promptContext: {
      ...basePromptContext,
      status: "approved",
    } as never,
    lifecycle: {
      stage: "ready-to-start",
      label: "Ready to Start",
      nextAction: "Begin implementation following the plan",
      actor: "agent",
      stageIndex: 4,
    } as never,
  },
}

export const InFlight: Story = {
  args: {
    promptContext: {
      ...basePromptContext,
      status: "in-progress",
    } as never,
    lifecycle: {
      stage: "in-flight",
      label: "In Flight",
      nextAction: "Active work in progress",
      actor: null,
      stageIndex: 5,
    } as never,
  },
}

export const ReadyToIntegrate: Story = {
  args: {
    promptContext: {
      ...basePromptContext,
      status: "in-progress",
    } as never,
    lifecycle: {
      stage: "ready-to-integrate",
      label: "Ready to Integrate",
      nextAction: "Review and integrate completed work",
      actor: "human",
      stageIndex: 6,
    } as never,
  },
}

export const Integrated: Story = {
  args: {
    promptContext: {
      ...basePromptContext,
      status: "integrated",
    } as never,
    lifecycle: {
      stage: "integrated",
      label: "Integrated",
      nextAction: "Done",
      actor: null,
      stageIndex: 7,
    } as never,
  },
}

export const WithPlaybook: Story = {
  args: {
    promptContext: {
      ...basePromptContext,
      status: "approved",
    } as never,
    lifecycle: {
      stage: "needs-plan",
      label: "Needs Plan",
      nextAction: "Create implementation plan",
      actor: "agent",
      stageIndex: 3,
    } as never,
    playbook: {
      slug: "standard-implementation",
      title: "Standard Implementation",
      steps: [],
    } as never,
  },
}

export const Archived: Story = {
  args: {
    promptContext: {
      ...basePromptContext,
      status: "archived",
    } as never,
    lifecycle: {
      stage: "archived",
      label: "Archived",
      nextAction: "Restore to reactivate",
      actor: "human",
      stageIndex: 8,
    } as never,
  },
}
