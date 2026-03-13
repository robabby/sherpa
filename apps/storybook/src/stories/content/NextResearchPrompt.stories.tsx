import type { Meta, StoryObj } from "@storybook/react"
import { NextResearchPrompt } from "@sherpa/studio-ui/next-research-prompt"

const meta = {
  title: "Content/NextResearchPrompt",
  component: NextResearchPrompt,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NextResearchPrompt>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    initiativeSlug: "design-system",
    openQuestions: [
      "How should token naming conventions map to Tailwind v4 CSS custom properties?",
      "What is the optimal component granularity for the shared studio-ui package?",
      "Should Storybook stories live alongside components or in a dedicated app?",
    ],
  },
}

export const SingleQuestion: Story = {
  args: {
    initiativeSlug: "agent-framework-patterns",
    openQuestions: [
      "What evidence exists for behavioral vs identity-based role prompting efficacy?",
    ],
  },
}

export const ManyQuestions: Story = {
  args: {
    initiativeSlug: "mcp-integration",
    openQuestions: [
      "How should MCP tool permissions map to agent role definitions?",
      "What is the latency budget for MCP server round-trips in the dispatch pipeline?",
      "Should MCP resources be cached at the studio-core level or the server component level?",
      "How do MCP sampling capabilities interact with the Planner/Worker/Judge pattern?",
      "What security model should govern cross-agent MCP tool access?",
      "Is there a standard for MCP server health checks and monitoring?",
    ],
  },
}

export const Empty: Story = {
  args: {
    initiativeSlug: "completed-initiative",
    openQuestions: [],
  },
}
