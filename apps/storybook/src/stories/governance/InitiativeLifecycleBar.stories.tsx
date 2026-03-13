import type { Meta, StoryObj } from "@storybook/react"
import { InitiativeLifecycleBar } from "@sherpa/studio-ui/initiative-lifecycle-bar"

const meta = {
  title: "Governance/InitiativeLifecycleBar",
  component: InitiativeLifecycleBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InitiativeLifecycleBar>

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  initiativeTitle: "Design System",
  initiativeSlug: "design-system",
  initiativeSource: "docs/initiatives/design-system",
  initiativeStatus: "pending",
  researchIterationCount: 0,
}

export const NeedsResearch: Story = {
  args: {
    ...baseArgs,
    lifecycle: {
      stage: "needs-research",
      label: "Needs Research",
      nextAction: "Launch /rr to begin research",
      actor: "agent",
      stageIndex: 0,
    } as never,
  },
}

export const NeedsProposal: Story = {
  args: {
    ...baseArgs,
    researchIterationCount: 2,
    lifecycle: {
      stage: "needs-proposal",
      label: "Needs Proposal",
      nextAction: "Write proposal from research findings",
      actor: "agent",
      stageIndex: 1,
    } as never,
  },
}

export const NeedsReview: Story = {
  args: {
    ...baseArgs,
    researchIterationCount: 3,
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
    ...baseArgs,
    initiativeStatus: "approved",
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
    ...baseArgs,
    initiativeStatus: "approved",
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
    ...baseArgs,
    initiativeStatus: "in-progress",
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
    ...baseArgs,
    initiativeStatus: "in-progress",
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
    ...baseArgs,
    initiativeStatus: "integrated",
    lifecycle: {
      stage: "integrated",
      label: "Integrated",
      nextAction: "Done",
      actor: null,
      stageIndex: 7,
    } as never,
  },
}
