import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ProcessItemList } from "@sherpa/studio-ui/process-item-list"

const meta = {
  title: "Governance/ProcessItemList",
  component: ProcessItemList,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[400px] w-[360px] border border-border/20 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProcessItemList>

export default meta
type Story = StoryObj<typeof meta>

const makeNode = (
  id: string,
  title: string,
  status: string,
  kind: string,
  opts?: { summary?: string; childCount?: number; parent?: string; staleDays?: number },
) => ({
  id,
  kind,
  title,
  status,
  created: "2026-01-15",
  updated: "2026-03-13",
  parent: opts?.parent ?? null,
  source: `docs/initiatives/${id}`,
  summary: opts?.summary ?? null,
  childCount: opts?.childCount ?? 0,
  metadata: opts?.staleDays != null
    ? { velocity: { staleDays: opts.staleDays } }
    : {},
}) as never

const mockNodes = [
  makeNode("design-system", "Design System", "in-progress", "initiative", {
    summary: "Token registry and Storybook",
    childCount: 3,
    staleDays: 1,
  }),
  makeNode("agent-patterns", "Agent Framework Patterns", "in-progress", "initiative", {
    summary: "Behavioral engineering research",
    childCount: 5,
    staleDays: 0,
  }),
  makeNode("convention-sync", "Convention Sync CLI", "approved", "initiative", {
    summary: "sherpa init and sync commands",
    childCount: 0,
    staleDays: 4,
  }),
  makeNode("mcp-server", "MCP Server", "pending", "initiative", {
    summary: "Model Context Protocol server",
    childCount: 1,
    staleDays: 12,
  }),
  makeNode("studio-extract", "Studio Extraction", "integrated", "initiative", {
    summary: "Package extraction from WavePoint",
    childCount: 0,
  }),
  makeNode("ws-design", "Design System Work", "active", "workstream", {
    summary: "Active workstream",
  }),
  makeNode("seed-tokens", "Token Architecture", "seed", "seed", {
    summary: "Research branch from design system",
    parent: "design-system",
  }),
]

function InteractiveList(props: { nodes: typeof mockNodes; depthMap?: Map<string, number> | null }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  return (
    <ProcessItemList
      nodes={props.nodes as never[]}
      selectedId={selectedId}
      focusIndex={-1}
      onSelect={setSelectedId}
      depthMap={props.depthMap}
    />
  )
}

export const Default: Story = {
  render: () => <InteractiveList nodes={mockNodes} />,
}

export const WithSelection: Story = {
  args: {
    nodes: mockNodes as never[],
    selectedId: "design-system",
    focusIndex: 0,
    onSelect: () => {},
  },
}

export const WithTreeIndentation: Story = {
  render: () => {
    const depthMap = new Map([
      ["design-system", 0],
      ["seed-tokens", 1],
      ["agent-patterns", 0],
      ["convention-sync", 0],
      ["mcp-server", 0],
      ["studio-extract", 0],
      ["ws-design", 0],
    ])
    return <InteractiveList nodes={mockNodes} depthMap={depthMap} />
  },
}

export const Empty: Story = {
  args: {
    nodes: [],
    selectedId: null,
    focusIndex: -1,
    onSelect: () => {},
  },
}

export const SingleItem: Story = {
  args: {
    nodes: [
      makeNode("solo", "Single Initiative", "pending", "initiative", {
        summary: "The only item",
        childCount: 0,
      }),
    ] as never[],
    selectedId: null,
    focusIndex: -1,
    onSelect: () => {},
  },
}

export const StaleItems: Story = {
  args: {
    nodes: [
      makeNode("fresh", "Just Updated", "in-progress", "initiative", {
        summary: "Updated today",
        staleDays: 0,
      }),
      makeNode("recent", "Recent Activity", "in-progress", "initiative", {
        summary: "A few days ago",
        staleDays: 2,
      }),
      makeNode("stale-week", "Getting Stale", "pending", "initiative", {
        summary: "Over a week",
        staleDays: 8,
      }),
      makeNode("stale-month", "Very Stale", "pending", "initiative", {
        summary: "Over a month",
        staleDays: 35,
      }),
    ] as never[],
    selectedId: null,
    focusIndex: -1,
    onSelect: () => {},
  },
}
