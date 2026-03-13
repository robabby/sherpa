import type { Meta, StoryObj } from "@storybook/react"
import { ProposalActions } from "@sherpa/studio-ui/proposal-actions"

const meta = {
  title: "Governance/ProposalActions",
  component: ProposalActions,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  args: {
    slug: "design-system",
    title: "Design System",
    source: "docs/initiatives/design-system",
    onStatusChange: async () => ({ success: true }),
    onPostApproval: async () => ({ success: true, tasks: ["Created activity.md", "Scaffolded plan.md"] }),
  },
} satisfies Meta<typeof ProposalActions>

export default meta
type Story = StoryObj<typeof meta>

export const AdditiveRisk: Story = {
  args: {
    riskLevel: "additive",
  },
}

export const EvolutionaryRisk: Story = {
  args: {
    riskLevel: "evolutionary",
  },
}

export const StructuralRisk: Story = {
  args: {
    riskLevel: "structural",
  },
}

export const NoRisk: Story = {
  args: {
    riskLevel: null,
  },
}

export const WithoutPostApproval: Story = {
  args: {
    riskLevel: "additive",
    onPostApproval: undefined,
  },
}
