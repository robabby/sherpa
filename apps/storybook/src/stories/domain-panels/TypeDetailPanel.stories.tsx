import type { Meta, StoryObj } from "@storybook/react"
import { TypeDetailPanel } from "@sherpa/studio-ui/type-detail-panel"

const meta = {
  title: "Domain Panels/TypeDetailPanel",
  component: TypeDetailPanel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TypeDetailPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    signature: null,
    isGold: false,
  },
}

export const FunctionSignature: Story = {
  args: {
    signature: {
      name: "calculateTransits",
      kind: "function",
      parameters: [
        { name: "natalChart", type: "NatalChart", optional: false },
        { name: "dateRange", type: "DateRange", optional: false },
        { name: "options", type: "TransitOptions", optional: true },
      ],
      returnType: "Promise<TransitEvent[]>",
    } as never,
    isGold: false,
  },
}

export const InterfaceSignature: Story = {
  args: {
    signature: {
      name: "TransitEvent",
      kind: "interface",
      properties: [
        { name: "id", type: "string", optional: false },
        { name: "planet", type: "Planet", optional: false },
        { name: "aspect", type: "AspectType", optional: false },
        { name: "natalPlanet", type: "Planet", optional: false },
        { name: "exactDate", type: "Date", optional: false },
        { name: "orb", type: "number", optional: false },
        { name: "isApplying", type: "boolean", optional: false },
        { name: "description", type: "string", optional: true },
      ],
    } as never,
    isGold: false,
  },
}

export const TypeAlias: Story = {
  args: {
    signature: {
      name: "AspectType",
      kind: "type-alias",
      text: 'type AspectType = "conjunction" | "opposition" | "trine" | "square" | "sextile"',
    } as never,
    isGold: false,
  },
}

export const VariableSignature: Story = {
  args: {
    signature: {
      name: "DEFAULT_ORBS",
      kind: "variable",
      returnType: "Record<AspectType, number>",
      text: 'export const DEFAULT_ORBS: Record<AspectType, number> = { conjunction: 8, opposition: 8, trine: 8, square: 7, sextile: 6 }',
    } as never,
    isGold: false,
  },
}

export const EnumSignature: Story = {
  args: {
    signature: {
      name: "Planet",
      kind: "enum",
      members: [
        { name: "Sun", value: 0 },
        { name: "Moon", value: 1 },
        { name: "Mercury", value: 2 },
        { name: "Venus", value: 3 },
        { name: "Mars", value: 4 },
        { name: "Jupiter", value: 5 },
        { name: "Saturn", value: 6 },
      ],
    } as never,
    isGold: false,
  },
}

export const GoldVariant: Story = {
  args: {
    signature: {
      name: "synthesizeChart",
      kind: "function",
      parameters: [
        { name: "natal", type: "NatalChart", optional: false },
        { name: "transits", type: "TransitEvent[]", optional: false },
      ],
      returnType: "SynthesisResult",
    } as never,
    isGold: true,
  },
}

export const WithReferencedTypes: Story = {
  args: {
    signature: {
      name: "calculateTransits",
      kind: "function",
      parameters: [
        { name: "chart", type: "NatalChart", optional: false },
        { name: "range", type: "DateRange", optional: false },
      ],
      returnType: "TransitEvent[]",
      referencedTypes: {
        NatalChart: {
          name: "NatalChart",
          kind: "interface",
          properties: [
            { name: "planets", type: "PlanetPosition[]", optional: false },
            { name: "houses", type: "House[]", optional: false },
            { name: "birthDate", type: "Date", optional: false },
          ],
        },
        DateRange: {
          name: "DateRange",
          kind: "interface",
          properties: [
            { name: "start", type: "Date", optional: false },
            { name: "end", type: "Date", optional: false },
          ],
        },
      },
    } as never,
    isGold: false,
  },
}
