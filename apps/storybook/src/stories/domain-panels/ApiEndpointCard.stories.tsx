import type { Meta, StoryObj } from "@storybook/react"
import { ApiEndpointCard } from "@sherpa/studio-ui/api-endpoint-card"

const mockEntry = (overrides = {}) => ({
  slug: "transit-events",
  relativePath: "src/lib/api/transit-events.ts",
  detectedExports: [],
  metadata: {
    name: "Transit Events",
    description: "Returns upcoming planetary transit events for a given date range and location.",
    method: "GET" as const,
    path: "/api/transit/events",
    level: "L3" as const,
    auth: "required" as const,
    primitives: ["transit-engine"],
    ...overrides,
  },
}) as never

const meta = {
  title: "Domain Panels/ApiEndpointCard",
  component: ApiEndpointCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ApiEndpointCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    entry: mockEntry(),
  },
}

export const PostEndpoint: Story = {
  args: {
    entry: mockEntry({
      name: "Generate Chart",
      description: "Generates a natal chart PDF for the given birth data.",
      method: "POST",
      path: "/api/charts/generate",
      level: "L5",
      auth: "required",
      primitives: ["chart-engine", "pdf-renderer"],
    }),
  },
}

export const NoAuth: Story = {
  args: {
    entry: mockEntry({
      name: "Health Check",
      description: "Returns service health status.",
      method: "GET",
      path: "/api/health",
      level: "L1",
      auth: "none",
      primitives: [],
    }),
  },
}

export const ManyPrimitives: Story = {
  args: {
    entry: mockEntry({
      name: "Composite Transit Report",
      description: "Assembles a full transit report combining multiple primitive outputs into a unified view.",
      method: "GET",
      path: "/api/transit/report",
      level: "L4",
      auth: "required",
      primitives: ["transit-engine", "aspect-calculator", "house-system", "orb-config", "ephemeris"],
    }),
  },
}

export const Gallery: Story = {
  decorators: [
    (Story) => (
      <div className="grid w-[800px] grid-cols-2 gap-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <ApiEndpointCard
        entry={mockEntry({ method: "GET", path: "/api/transit/events", level: "L3", primitives: ["transit-engine"] })}
      />
      <ApiEndpointCard
        entry={mockEntry({ name: "Generate Chart", method: "POST", path: "/api/charts/generate", level: "L5", primitives: ["chart-engine", "pdf-renderer"] })}
      />
      <ApiEndpointCard
        entry={mockEntry({ name: "Health Check", method: "GET", path: "/api/health", level: "L1", auth: "none", primitives: [] })}
      />
      <ApiEndpointCard
        entry={mockEntry({ name: "Aspect Query", method: "GET", path: "/api/aspects", level: "L2", primitives: ["aspect-calculator"] })}
      />
    </>
  ),
}
