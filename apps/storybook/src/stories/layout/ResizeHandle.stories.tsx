import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ResizeHandle } from "@sherpa/studio-ui/resize-handle"

const meta = {
  title: "Layout/ResizeHandle",
  component: ResizeHandle,
  tags: ["autodocs"],
} satisfies Meta<typeof ResizeHandle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onResize: (deltaX: number) => console.log("resize:", deltaX),
    onResizeEnd: () => console.log("resize end"),
  },
  decorators: [
    (Story) => (
      <div className="flex h-[300px] items-stretch">
        <div className="w-[200px] rounded-l-lg border border-muted-foreground/15 bg-card/30 p-4">
          <p className="text-xs text-muted-foreground">Left panel</p>
        </div>
        <Story />
        <div className="w-[200px] rounded-r-lg border border-muted-foreground/15 bg-card/30 p-4">
          <p className="text-xs text-muted-foreground">Right panel</p>
        </div>
      </div>
    ),
  ],
}

export const Interactive: Story = {
  render: () => {
    const [leftWidth, setLeftWidth] = useState(250)

    return (
      <div className="flex h-[300px] items-stretch">
        <div
          className="shrink-0 rounded-l-lg border border-muted-foreground/15 bg-card/30 p-4"
          style={{ width: leftWidth }}
        >
          <p className="text-xs text-muted-foreground">
            Left panel ({Math.round(leftWidth)}px)
          </p>
        </div>
        <ResizeHandle
          onResize={(delta) => setLeftWidth((w) => Math.max(100, Math.min(500, w + delta)))}
        />
        <div className="flex-1 rounded-r-lg border border-muted-foreground/15 bg-card/30 p-4">
          <p className="text-xs text-muted-foreground">Right panel (flex)</p>
        </div>
      </div>
    )
  },
}
