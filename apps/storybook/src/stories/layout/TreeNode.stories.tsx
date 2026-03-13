import type { Meta, StoryObj } from "@storybook/react"
import { TreeNode } from "@sherpa/studio-ui/tree-node"

const mockNode = (overrides = {}) => ({
  slug: "vedic-research",
  title: "Vedic Astrology Research",
  relativePath: "docs/initiatives/vedic-research",
  kind: "initiative",
  status: "in-progress",
  iterationCount: 3,
  priority: "high",
  question: null,
  openQuestions: ["How to handle different ayanamsa systems?", "What house system to use?"],
  children: [],
  ...overrides,
}) as never

const meta = {
  title: "Layout/TreeNode",
  component: TreeNode,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TreeNode>

export default meta
type Story = StoryObj<typeof meta>

export const ActiveInitiative: Story = {
  args: {
    node: mockNode(),
    seeds: [],
  },
}

export const RootNode: Story = {
  args: {
    node: mockNode({
      slug: "sherpa",
      title: "Sherpa Framework",
      kind: "root",
      status: "active",
      iterationCount: 12,
      openQuestions: [],
    }),
    seeds: [],
  },
}

export const SeedNode: Story = {
  args: {
    node: mockNode({
      slug: "great-year-cycles",
      title: "Great Year Cycles",
      kind: "seed",
      status: "seed",
      iterationCount: 0,
      priority: "medium",
      question: "How do great year cycles of approximately 25,920 years relate to the precession of equinoxes and can they be computed from ephemeris data?",
      openQuestions: [],
    }),
    seeds: [
      {
        slug: "great-year-cycles",
        question: "How do great year cycles relate to precession?",
        parentSlug: "vedic-research",
      } as never,
    ],
  },
}

export const LeafNoIterations: Story = {
  args: {
    node: mockNode({
      slug: "aspect-orbs",
      title: "Aspect Orb Configuration",
      kind: "initiative",
      status: "pending",
      iterationCount: 0,
      priority: null,
      openQuestions: [],
    }),
    seeds: [],
  },
}

export const WithChildren: Story = {
  args: {
    node: mockNode({
      slug: "transit-system",
      title: "Transit System",
      iterationCount: 5,
      children: [
        mockNode({
          slug: "transit-events",
          title: "Transit Events",
          kind: "initiative",
          status: "integrated",
          iterationCount: 2,
          priority: "high",
          openQuestions: [],
          children: [],
        }),
        mockNode({
          slug: "transit-timing",
          title: "Transit Timing Windows",
          kind: "seed",
          status: "seed",
          iterationCount: 0,
          priority: "low",
          question: "What is the optimal window size for transit activation?",
          openQuestions: [],
          children: [],
        }),
      ],
    }),
    seeds: [],
    defaultExpanded: true,
  },
}
