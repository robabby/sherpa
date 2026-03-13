import type { Meta, StoryObj } from "@storybook/react"
import { LevelSection } from "@sherpa/studio-ui/level-section"

const meta = {
  title: "Layout/LevelSection",
  component: LevelSection,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LevelSection>

export default meta
type Story = StoryObj<typeof meta>

const placeholderCards = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className="rounded-lg border border-muted-foreground/10 bg-card/30 p-5"
    >
      <p className="text-sm font-medium text-foreground/70">
        Primitive Card {i + 1}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/50">
        Placeholder card content
      </p>
    </div>
  ))

export const L1Section: Story = {
  args: {
    level: "L1" as never,
    count: 4,
    children: placeholderCards(4),
  },
}

export const L3Section: Story = {
  args: {
    level: "L3" as never,
    count: 6,
    children: placeholderCards(6),
  },
}

export const L5Section: Story = {
  args: {
    level: "L5" as never,
    count: 2,
    children: placeholderCards(2),
  },
}

export const Gallery: Story = {
  decorators: [
    (Story) => (
      <div className="w-[800px] space-y-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      {(["L1", "L2", "L3", "L4", "L5"] as const).map((level) => (
        <LevelSection key={level} level={level as never} count={3}>
          {placeholderCards(3)}
        </LevelSection>
      ))}
    </>
  ),
}
