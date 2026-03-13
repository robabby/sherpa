import type { Meta, StoryObj } from "@storybook/react"
import { DeliverableGrid } from "@sherpa/studio-ui/deliverable-grid"

const mockDeliverables = [
  {
    id: "saturn-backtest-chart",
    type: "chart" as const,
    title: "Saturn Quarter-Cycle Backtest",
    description: "Historical analysis of Saturn quarter-cycle correlations with market recessions",
    created: "2026-03-08",
    sourceIteration: 2,
    fileName: "saturn-backtest-chart.json",
    slideCount: undefined,
  },
  {
    id: "eclipse-activation-deck",
    type: "presentation" as const,
    title: "Eclipse Activation Analysis",
    description: "Presentation deck covering eclipse activation event patterns and timing",
    created: "2026-03-10",
    sourceIteration: 3,
    fileName: "eclipse-activation-deck.json",
    slideCount: 12,
  },
  {
    id: "monte-carlo-results",
    type: "chart" as const,
    title: "Monte Carlo Simulation Results",
    description: "Statistical significance testing via Monte Carlo random-phase simulation",
    created: "2026-03-12",
    sourceIteration: 3,
    fileName: "monte-carlo-results.json",
  },
  {
    id: "timing-arc-overview",
    type: "presentation" as const,
    title: "Timing Arc Overview",
    description: "Executive summary of timing arc methodology and key findings",
    created: "2026-03-05",
    sourceIteration: 1,
    fileName: "timing-arc-overview.json",
    slideCount: 8,
  },
  {
    id: "dignity-distribution",
    type: "chart" as const,
    title: "Planetary Dignity Distribution",
    created: "2026-03-11",
    fileName: "dignity-distribution.json",
  },
  {
    id: "research-synthesis-deck",
    type: "presentation" as const,
    title: "Research Synthesis Q1 2026",
    description: "Quarterly synthesis of all research vectors and their outcomes",
    created: "2026-03-13",
    sourceIteration: 4,
    fileName: "research-synthesis-deck.json",
    slideCount: 18,
  },
] as never[]

const meta = {
  title: "Content/DeliverableGrid",
  component: DeliverableGrid,
  tags: ["autodocs"],
} satisfies Meta<typeof DeliverableGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    deliverables: mockDeliverables,
    basePath: "/process/vedic-research",
    slugs: ["vedic-research"],
  },
}

export const ChartsOnly: Story = {
  args: {
    deliverables: mockDeliverables.filter(
      (d: never) => (d as { type: string }).type === "chart"
    ),
    basePath: "/process/backtest",
    slugs: ["backtest"],
  },
}

export const PresentationsOnly: Story = {
  args: {
    deliverables: mockDeliverables.filter(
      (d: never) => (d as { type: string }).type === "presentation"
    ),
    basePath: "/process/overview",
    slugs: ["overview"],
  },
}

export const SingleDeliverable: Story = {
  args: {
    deliverables: mockDeliverables.slice(0, 1),
    basePath: "/process/saturn",
    slugs: ["saturn"],
  },
}

export const NestedSlugs: Story = {
  args: {
    deliverables: mockDeliverables.slice(0, 3),
    basePath: "/process/vedic-research/sub/backtest",
    slugs: ["vedic-research", "sub", "backtest"],
  },
}
