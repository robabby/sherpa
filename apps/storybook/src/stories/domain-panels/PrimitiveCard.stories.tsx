import type { Meta, StoryObj } from "@storybook/react"
import { PrimitiveCard } from "@sherpa/studio-ui/primitive-card"

const curatedEntry = (overrides = {}) => ({
  slug: "transit-engine",
  relativePath: "src/primitives/transit-engine/index.ts",
  detectedExports: [
    { name: "calculateTransits", kind: "function" },
    { name: "TransitEvent", kind: "interface" },
    { name: "TransitConfig", kind: "interface" },
  ],
  metadata: {
    name: "Transit Engine",
    description: "Core engine for computing planetary transit events against natal positions. Handles aspect detection, orb calculation, and event windowing.",
    level: "L3" as const,
    status: "stable" as const,
    keyExports: [
      { name: "calculateTransits", kind: "function" },
      { name: "TransitEvent", kind: "interface" },
      { name: "TransitConfig", kind: "interface" },
    ],
    dependencies: ["ephemeris", "aspect-calculator"],
    ...overrides,
  },
}) as never

const uncategorizedEntry = () => ({
  slug: "utils-misc",
  relativePath: "src/lib/utils-misc.ts",
  detectedExports: [
    { name: "formatDate", kind: "function" },
    { name: "slugify", kind: "function" },
    { name: "debounce", kind: "function" },
    { name: "clamp", kind: "function" },
    { name: "deepMerge", kind: "function" },
    { name: "isValidUrl", kind: "function" },
  ],
  metadata: undefined,
}) as never

const meta = {
  title: "Domain Panels/PrimitiveCard",
  component: PrimitiveCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PrimitiveCard>

export default meta
type Story = StoryObj<typeof meta>

export const CuratedStable: Story = {
  args: {
    entry: curatedEntry(),
    dependentCount: 3,
  },
}

export const CuratedExperimental: Story = {
  args: {
    entry: curatedEntry({
      name: "Eclipse Predictor",
      description: "Experimental engine for predicting solar and lunar eclipse activations on natal charts.",
      level: "L4",
      status: "experimental",
      keyExports: [
        { name: "predictEclipse", kind: "function" },
        { name: "EclipseEvent", kind: "interface" },
      ],
      dependencies: ["ephemeris"],
    }),
    dependentCount: 0,
  },
}

export const CuratedL5Gold: Story = {
  args: {
    entry: curatedEntry({
      name: "Chart Synthesis",
      description: "Top-level orchestration primitive that synthesizes natal, transit, and progression data into a unified interpretation.",
      level: "L5",
      status: "stable",
      keyExports: [
        { name: "synthesizeChart", kind: "function" },
        { name: "SynthesisResult", kind: "interface" },
        { name: "SynthesisConfig", kind: "type-alias" },
        { name: "InterpretationLayer", kind: "interface" },
      ],
      dependencies: ["transit-engine", "progression-engine", "natal-calculator"],
    }),
    dependentCount: 0,
  },
}

export const CuratedNoDeps: Story = {
  args: {
    entry: curatedEntry({
      name: "Ephemeris",
      description: "Raw planetary position data from Swiss Ephemeris. Foundational data layer.",
      level: "L1",
      status: "stable",
      keyExports: [
        { name: "getPlanetPosition", kind: "function" },
        { name: "PlanetPosition", kind: "interface" },
      ],
      dependencies: [],
    }),
    dependentCount: 5,
  },
}

export const Uncategorized: Story = {
  args: {
    entry: uncategorizedEntry(),
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
      <PrimitiveCard entry={curatedEntry() as never} dependentCount={3} />
      <PrimitiveCard
        entry={curatedEntry({
          name: "Eclipse Predictor",
          level: "L4",
          status: "experimental",
          keyExports: [{ name: "predictEclipse", kind: "function" }],
          dependencies: ["ephemeris"],
        }) as never}
        dependentCount={0}
      />
      <PrimitiveCard
        entry={curatedEntry({
          name: "Chart Synthesis",
          level: "L5",
          status: "stable",
          dependencies: ["transit-engine", "natal-calculator"],
          keyExports: [
            { name: "synthesizeChart", kind: "function" },
            { name: "SynthesisResult", kind: "interface" },
            { name: "SynthesisConfig", kind: "type-alias" },
            { name: "InterpretationLayer", kind: "interface" },
          ],
        }) as never}
        dependentCount={0}
      />
      <PrimitiveCard entry={uncategorizedEntry() as never} />
    </>
  ),
}
