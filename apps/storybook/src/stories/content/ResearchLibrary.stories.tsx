import type { Meta, StoryObj } from "@storybook/react"
import { ResearchLibrary } from "@sherpa/studio-ui/research-library"

function makeContentFile(relativePath: string, title: string) {
  return {
    relativePath,
    fileName: relativePath.split("/").pop() ?? "",
    title,
    frontmatter: null,
    lineCount: 150,
    sizeBytes: 4200,
    lastModified: "2026-03-12",
  } as never
}

const fullResearch = {
  readme: makeContentFile(
    "docs/initiatives/design-system/research/README.md",
    "Design System Research Index"
  ),
  iterations: [
    {
      number: 1,
      synthesis: makeContentFile(
        "docs/initiatives/design-system/research/iteration-1/synthesis.md",
        "Token Naming Conventions"
      ),
      vectors: [
        makeContentFile(
          "docs/initiatives/design-system/research/iteration-1/vector-1-tailwind-v4.md",
          "Tailwind v4 CSS Custom Properties"
        ),
        makeContentFile(
          "docs/initiatives/design-system/research/iteration-1/vector-2-shadcn-patterns.md",
          "shadcn/ui Component Patterns"
        ),
        makeContentFile(
          "docs/initiatives/design-system/research/iteration-1/vector-3-token-architecture.md",
          "Design Token Architecture Survey"
        ),
      ],
    },
    {
      number: 2,
      synthesis: makeContentFile(
        "docs/initiatives/design-system/research/iteration-2/synthesis.md",
        "Component Granularity Analysis"
      ),
      vectors: [
        makeContentFile(
          "docs/initiatives/design-system/research/iteration-2/vector-1-atomic-design.md",
          "Atomic Design Methodology Review"
        ),
        makeContentFile(
          "docs/initiatives/design-system/research/iteration-2/vector-2-package-boundaries.md",
          "Package Boundary Strategies"
        ),
      ],
    },
    {
      number: 3,
      synthesis: null,
      vectors: [
        makeContentFile(
          "docs/initiatives/design-system/research/iteration-3/vector-1-storybook.md",
          "Storybook Integration Patterns"
        ),
      ],
    },
  ],
  looseFiles: [
    makeContentFile(
      "docs/initiatives/design-system/research/prior-art.md",
      "Prior Art Survey"
    ),
    makeContentFile(
      "docs/initiatives/design-system/research/competitor-analysis.md",
      "Competitor Design System Analysis"
    ),
  ],
  totalFiles: 12,
} as never

const singleIteration = {
  readme: null,
  iterations: [
    {
      number: 1,
      synthesis: makeContentFile(
        "docs/initiatives/agent-patterns/research/iteration-1/synthesis.md",
        "Behavioral Engineering Evidence Base"
      ),
      vectors: [
        makeContentFile(
          "docs/initiatives/agent-patterns/research/iteration-1/vector-1-role-prompting.md",
          "Role Prompting Efficacy (Zheng et al.)"
        ),
        makeContentFile(
          "docs/initiatives/agent-patterns/research/iteration-1/vector-2-anthropic-guide.md",
          "Anthropic Prompt Engineering Guide"
        ),
      ],
    },
  ],
  looseFiles: [],
  totalFiles: 3,
} as never

const looseOnly = {
  readme: makeContentFile(
    "docs/initiatives/mcp-integration/research/README.md",
    "MCP Integration Research"
  ),
  iterations: [],
  looseFiles: [
    makeContentFile(
      "docs/initiatives/mcp-integration/research/protocol-spec-notes.md",
      "MCP Protocol Specification Notes"
    ),
    makeContentFile(
      "docs/initiatives/mcp-integration/research/existing-servers.md",
      "Existing MCP Server Survey"
    ),
    makeContentFile(
      "docs/initiatives/mcp-integration/research/security-model.md",
      "Security Model Considerations"
    ),
  ],
  totalFiles: 4,
} as never

const meta = {
  title: "Content/ResearchLibrary",
  component: ResearchLibrary,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResearchLibrary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    research: fullResearch,
    basePath: "/process/design-system",
  },
}

export const SingleIteration: Story = {
  args: {
    research: singleIteration,
    basePath: "/process/agent-patterns",
  },
}

export const LooseFilesOnly: Story = {
  args: {
    research: looseOnly,
    basePath: "/process/mcp-integration",
  },
}

export const Empty: Story = {
  args: {
    research: {
      readme: null,
      iterations: [],
      looseFiles: [],
      totalFiles: 0,
    } as never,
    basePath: "/process/empty",
  },
}
