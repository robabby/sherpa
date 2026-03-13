import type { Meta, StoryObj } from "@storybook/react"
import { HubPanel } from "@sherpa/studio-ui/hub-panel"

const meta = {
  title: "Panels/HubPanel",
  component: HubPanel,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "process",
        "portfolio",
        "activity",
        "docs",
        "conventions",
        "skills",
        "primitives",
        "api",
        "workforce",
        "sessions",
        "transit-content",
        "tasks",
        "mcp",
        "workflow",
      ],
    },
  },
  args: {
    href: "#",
    linkText: "View details",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HubPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Process: Story = {
  args: {
    variant: "process",
    title: "Process",
    label: "Governance",
    children: <p className="text-sm text-muted-foreground">3 active initiatives, 2 pending review</p>,
  },
}

export const Portfolio: Story = {
  args: {
    variant: "portfolio",
    title: "Portfolio",
    label: "Projects",
    children: <p className="text-sm text-muted-foreground">2 apps on track</p>,
  },
}

export const MCP: Story = {
  args: {
    variant: "mcp",
    title: "MCP Servers",
    label: "Integration",
    children: <p className="text-sm text-muted-foreground">1 server active, 12 tools registered</p>,
  },
}

export const Skills: Story = {
  args: {
    variant: "skills",
    title: "Skills",
    label: "Capabilities",
    children: <p className="text-sm text-muted-foreground">5 skills available</p>,
  },
}

export const AllVariants: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-[1200px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {(
        [
          "process",
          "portfolio",
          "activity",
          "docs",
          "conventions",
          "skills",
          "primitives",
          "api",
          "workforce",
          "sessions",
          "tasks",
          "mcp",
          "workflow",
          "transit-content",
        ] as const
      ).map((v) => (
        <HubPanel
          key={v}
          variant={v}
          href="#"
          title={v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ")}
          label={v}
          linkText="View"
        >
          <p className="text-sm text-muted-foreground">Sample content</p>
        </HubPanel>
      ))}
    </div>
  ),
}
