import { useRef, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ProcessFilterBar } from "@sherpa/studio-ui/process-filter-bar"

const meta = {
  title: "Governance/ProcessFilterBar",
  component: ProcessFilterBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProcessFilterBar>

export default meta
type Story = StoryObj<typeof meta>

const makeNode = (kind: string, status: string, title: string) => ({
  id: `${kind}-${title.toLowerCase().replace(/\s/g, "-")}`,
  kind,
  title,
  status,
  created: "2026-01-15",
  updated: "2026-03-13",
  parent: null,
  source: `docs/${kind}s/${title.toLowerCase()}`,
  summary: null,
  childCount: 0,
  metadata: {},
}) as never

const mockNodes = [
  makeNode("initiative", "in-progress", "Design System"),
  makeNode("initiative", "in-progress", "Agent Patterns"),
  makeNode("initiative", "pending", "Convention Sync"),
  makeNode("initiative", "approved", "MCP Server"),
  makeNode("initiative", "integrated", "Studio Extraction"),
  makeNode("workstream", "active", "Design Work"),
  makeNode("workstream", "paused", "Research Work"),
  makeNode("seed", "seed", "Token Architecture"),
  makeNode("seed", "seed", "Pattern Library"),
  makeNode("skill", "active", "Recursive Research"),
  makeNode("convention", "active", "Effort Estimation"),
]

function InteractiveFilterBar() {
  const [activeKind, setActiveKind] = useState<string | null>(null)
  const [activeStatus, setActiveStatus] = useState<string | null>(null)
  const [activeSort, setActiveSort] = useState<"updated" | "alpha" | "status" | "kind">("updated")
  const [searchTerm, setSearchTerm] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <ProcessFilterBar
      allNodes={mockNodes as never[]}
      activeKind={activeKind as never}
      activeStatus={activeStatus}
      activeSort={activeSort}
      searchTerm={searchTerm}
      onKindChange={setActiveKind as never}
      onStatusChange={setActiveStatus}
      onSortChange={setActiveSort as never}
      onSearchChange={setSearchTerm}
      searchInputRef={searchRef}
    />
  )
}

export const Default: Story = {
  render: () => <InteractiveFilterBar />,
}

export const InitiativeFilterActive: Story = {
  args: {
    allNodes: mockNodes as never[],
    activeKind: "initiative" as never,
    activeStatus: null,
    activeSort: "updated",
    searchTerm: "",
    onKindChange: () => {},
    onStatusChange: () => {},
    onSortChange: () => {},
    onSearchChange: () => {},
    searchInputRef: { current: null },
  },
}

export const StatusFilterActive: Story = {
  args: {
    allNodes: mockNodes as never[],
    activeKind: null,
    activeStatus: "in-progress",
    activeSort: "updated",
    searchTerm: "",
    onKindChange: () => {},
    onStatusChange: () => {},
    onSortChange: () => {},
    onSearchChange: () => {},
    searchInputRef: { current: null },
  },
}

export const AlphaSort: Story = {
  args: {
    allNodes: mockNodes as never[],
    activeKind: null,
    activeStatus: null,
    activeSort: "alpha",
    searchTerm: "",
    onKindChange: () => {},
    onStatusChange: () => {},
    onSortChange: () => {},
    onSearchChange: () => {},
    searchInputRef: { current: null },
  },
}

export const WithSearchTerm: Story = {
  args: {
    allNodes: mockNodes as never[],
    activeKind: null,
    activeStatus: null,
    activeSort: "updated",
    searchTerm: "design",
    onKindChange: () => {},
    onStatusChange: () => {},
    onSortChange: () => {},
    onSearchChange: () => {},
    searchInputRef: { current: null },
  },
}

export const OnlyInitiatives: Story = {
  args: {
    allNodes: mockNodes.slice(0, 5) as never[],
    activeKind: null,
    activeStatus: null,
    activeSort: "status",
    searchTerm: "",
    onKindChange: () => {},
    onStatusChange: () => {},
    onSortChange: () => {},
    onSearchChange: () => {},
    searchInputRef: { current: null },
  },
}
