import type { Meta, StoryObj } from "@storybook/react"
import {
  HubStagger,
  HubStaggerItem,
  HubAmbientGlow,
} from "@sherpa/studio-ui/hub-stagger"

const meta = {
  title: "UI/HubStagger",
  component: HubStagger,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="relative max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HubStagger>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "space-y-4",
    children: (
      <>
        <HubStaggerItem>
          <div className="rounded-lg border border-border/40 bg-card/50 p-4">
            <p className="text-sm text-foreground">First panel item</p>
          </div>
        </HubStaggerItem>
        <HubStaggerItem>
          <div className="rounded-lg border border-border/40 bg-card/50 p-4">
            <p className="text-sm text-foreground">Second panel item</p>
          </div>
        </HubStaggerItem>
        <HubStaggerItem>
          <div className="rounded-lg border border-border/40 bg-card/50 p-4">
            <p className="text-sm text-foreground">Third panel item</p>
          </div>
        </HubStaggerItem>
      </>
    ),
  },
}

export const FadeVariant: Story = {
  args: {
    className: "space-y-4",
    children: (
      <>
        <HubStaggerItem variant="fade">
          <div className="rounded-lg border border-border/40 bg-card/50 p-4">
            <p className="text-sm text-foreground">Fade item A</p>
          </div>
        </HubStaggerItem>
        <HubStaggerItem variant="fade">
          <div className="rounded-lg border border-border/40 bg-card/50 p-4">
            <p className="text-sm text-foreground">Fade item B</p>
          </div>
        </HubStaggerItem>
        <HubStaggerItem variant="fade">
          <div className="rounded-lg border border-border/40 bg-card/50 p-4">
            <p className="text-sm text-foreground">Fade item C</p>
          </div>
        </HubStaggerItem>
      </>
    ),
  },
}

export const GridLayout: Story = {
  args: {
    className: "grid grid-cols-2 gap-4",
    children: (
      <>
        {["Process", "Portfolio", "Skills", "Workforce"].map((title) => (
          <HubStaggerItem key={title}>
            <div className="rounded-lg border border-border/40 bg-card/50 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/50">
                Panel
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
            </div>
          </HubStaggerItem>
        ))}
      </>
    ),
  },
}

export const WithAmbientGlow: Story = {
  args: { children: null },
  render: () => (
    <div className="relative min-h-[300px]">
      <HubAmbientGlow className="pointer-events-none absolute -top-20 left-1/2 h-64 w-96 -translate-x-1/2" />
      <HubStagger className="relative z-10 space-y-4">
        <HubStaggerItem>
          <div className="rounded-lg border border-border/40 bg-card/50 p-4">
            <p className="text-sm text-foreground">Content with ambient glow behind it</p>
          </div>
        </HubStaggerItem>
        <HubStaggerItem>
          <div className="rounded-lg border border-border/40 bg-card/50 p-4">
            <p className="text-sm text-foreground">The glow breathes softly in the background</p>
          </div>
        </HubStaggerItem>
      </HubStagger>
    </div>
  ),
}

export const AmbientGlowOnly: Story = {
  args: { children: null },
  render: () => (
    <div className="relative flex h-[200px] items-center justify-center rounded-lg border border-border/20 bg-background">
      <HubAmbientGlow className="pointer-events-none absolute inset-0" />
      <p className="relative z-10 text-sm text-muted-foreground">
        Breathing ambient glow effect
      </p>
    </div>
  ),
}

export const ManyItems: Story = {
  args: {
    className: "space-y-3",
    children: (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <HubStaggerItem key={i} variant={i % 2 === 0 ? "panel" : "fade"}>
            <div className="rounded-lg border border-border/40 bg-card/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Item {i + 1} — {i % 2 === 0 ? "panel" : "fade"} variant
              </p>
            </div>
          </HubStaggerItem>
        ))}
      </>
    ),
  },
}
