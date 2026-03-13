import type { Meta, StoryObj } from "@storybook/react"
import { LevelPeerStrip } from "@sherpa/studio-ui/level-peer-strip"

const mockPeers = [
  {
    module: "natal-chart",
    slug: "natal-chart",
    level: "L3",
    detectedExports: [],
    displayName: "Natal Chart",
    description: "Computes natal chart positions and aspects",
    exportCount: 4,
    lineCount: 220,
    dependencies: ["ephemeris", "aspect-engine"],
    dependents: ["chart-synthesis"],
    relativePath: "src/primitives/natal-chart.ts",
    metadata: {
      name: "Natal Chart",
      level: "L3" as const,
      description: "Computes natal chart positions and aspects",
      keyExports: [],
      dependencies: ["ephemeris"],
    },
  },
  {
    module: "transit-scorer",
    slug: "transit-scorer",
    level: "L3",
    detectedExports: [],
    displayName: "Transit Scorer",
    description: "Scores planetary transits against natal positions",
    exportCount: 3,
    lineCount: 185,
    dependencies: ["ephemeris", "natal-chart"],
    dependents: ["timing-arc"],
    relativePath: "src/primitives/transit-scorer.ts",
    metadata: {
      name: "Transit Scorer",
      level: "L3" as const,
      description: "Scores planetary transits against natal positions",
      keyExports: [],
      dependencies: ["ephemeris", "natal-chart"],
    },
  },
  {
    module: "aspect-engine",
    slug: "aspect-engine",
    level: "L3",
    detectedExports: [],
    displayName: "Aspect Engine",
    description: "Calculates planetary aspects and orbs",
    exportCount: 6,
    lineCount: 310,
    dependencies: ["ephemeris"],
    dependents: ["natal-chart", "synastry"],
    relativePath: "src/primitives/aspect-engine.ts",
    metadata: {
      name: "Aspect Engine",
      level: "L3" as const,
      description: "Calculates planetary aspects and orbs",
      keyExports: [],
      dependencies: ["ephemeris"],
    },
  },
  {
    module: "dignity-calculator",
    slug: "dignity-calculator",
    level: "L3",
    detectedExports: [],
    displayName: "Dignity Calculator",
    description: "Essential and accidental dignity scoring",
    exportCount: 2,
    lineCount: 140,
    dependencies: ["ephemeris"],
    dependents: [],
    relativePath: "src/primitives/dignity-calculator.ts",
    metadata: {
      name: "Dignity Calculator",
      level: "L3" as const,
      description: "Essential and accidental dignity scoring",
      keyExports: [],
      dependencies: ["ephemeris"],
    },
  },
] as never[]

const meta = {
  title: "Layout/LevelPeerStrip",
  component: LevelPeerStrip,
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: "select",
      options: ["L1", "L2", "L3", "L4", "L5"],
    },
  },
} satisfies Meta<typeof LevelPeerStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    level: "L3" as never,
    peers: mockPeers,
  },
}

export const SinglePeer: Story = {
  args: {
    level: "L2" as never,
    peers: mockPeers.slice(0, 1),
  },
}

export const Empty: Story = {
  args: {
    level: "L1" as never,
    peers: [],
  },
}

export const ManyPeers: Story = {
  args: {
    level: "L4" as never,
    peers: [
      ...mockPeers,
      {
        module: "progression-engine",
        slug: "progression-engine",
        level: "L4",
        detectedExports: [],
        displayName: "Progression Engine",
        description: "Tracks symbolic progressions through time",
        exportCount: 5,
        lineCount: 275,
        dependencies: ["ephemeris", "natal-chart"],
        dependents: [],
        relativePath: "src/primitives/progression-engine.ts",
        metadata: {
          name: "Progression Engine",
          level: "L4" as const,
          description: "Tracks symbolic progressions through time",
          keyExports: [],
          dependencies: ["ephemeris", "natal-chart"],
        },
      },
      {
        module: "synastry",
        slug: "synastry",
        level: "L4",
        detectedExports: [],
        displayName: "Synastry",
        description: "Chart comparison and compatibility analysis",
        exportCount: 3,
        lineCount: 190,
        dependencies: ["aspect-engine", "natal-chart"],
        dependents: [],
        relativePath: "src/primitives/synastry.ts",
        metadata: {
          name: "Synastry",
          level: "L4" as const,
          description: "Chart comparison and compatibility analysis",
          keyExports: [],
          dependencies: ["aspect-engine", "natal-chart"],
        },
      },
    ] as never[],
  },
}
