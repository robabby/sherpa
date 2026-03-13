import type { Meta, StoryObj } from "@storybook/react"
import { DependencyGraph } from "@sherpa/studio-ui/dependency-graph"

const mockPrimitive = (slug: string, name: string, level: string) => ({
  slug,
  relativePath: `src/primitives/${slug}/index.ts`,
  detectedExports: [],
  metadata: {
    name,
    level,
    description: `${name} primitive module`,
    status: "stable",
    keyExports: [],
    dependencies: [],
  },
}) as never

const meta = {
  title: "Data Viz/DependencyGraph",
  component: DependencyGraph,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DependencyGraph>

export default meta
type Story = StoryObj<typeof meta>

export const BothDirections: Story = {
  args: {
    dependencies: [
      mockPrimitive("ephemeris", "Ephemeris", "L1"),
      mockPrimitive("aspect-calculator", "Aspect Calculator", "L2"),
    ],
    dependents: [
      mockPrimitive("chart-synthesis", "Chart Synthesis", "L5"),
      mockPrimitive("transit-report", "Transit Report", "L4"),
    ],
    isCurated: true,
  },
}

export const DependenciesOnly: Story = {
  args: {
    dependencies: [
      mockPrimitive("ephemeris", "Ephemeris", "L1"),
      mockPrimitive("aspect-calculator", "Aspect Calculator", "L2"),
      mockPrimitive("orb-config", "Orb Configuration", "L1"),
    ],
    dependents: [],
    isCurated: true,
  },
}

export const DependentsOnly: Story = {
  args: {
    dependencies: [],
    dependents: [
      mockPrimitive("chart-synthesis", "Chart Synthesis", "L5"),
      mockPrimitive("transit-report", "Transit Report", "L4"),
      mockPrimitive("dashboard-widgets", "Dashboard Widgets", "L3"),
    ],
    isCurated: true,
  },
}

export const Foundational: Story = {
  args: {
    dependencies: [],
    dependents: [],
    isCurated: true,
  },
}

export const Uncurated: Story = {
  args: {
    dependencies: [],
    dependents: [],
    isCurated: false,
  },
}
