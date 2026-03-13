import type { Meta, StoryObj } from "@storybook/react"
import { RoleEditor } from "@sherpa/studio-ui/role-editor"

const mockRole = {
  slug: "code-reviewer",
  displayName: "Code Reviewer",
  category: "quality",
  modelTier: "high",
  patterns: ["reflection", "tool-use"] as never[],
  structure: "prompt-chaining" as never,
  contextPackages: [".claude/rules/behavioral-engineering.md"],
  rules: ["review-standards", "type-safety"],
  skills: ["/integration-review"],
  toolPermissions: ["Read", "Grep", "Glob"],
  escalation: ["If structural risk detected, escalate to human reviewer"],
  description:
    "Defaults to NEEDS WORK. Requires concrete evidence before approving. Reviews TypeScript, React, and Next.js code for correctness, conventions, and type safety.",
  disposition: "Skeptical by default — assumes issues exist until proven otherwise",
  domainScope: ["TypeScript", "React", "Next.js"],
  behavioralConstraints: [
    "Default to NEEDS WORK verdict",
    "Require evidence for approval",
  ],
  qualityBar: ["All functions have TypeScript types", "No any casts without justification"],
  failTriggers: ["Claims 'no issues found' without evidence"],
  outputStyle: "Structured verdict with line references",
  vibe: "The skeptic who makes your code better",
  tags: ["quality", "review"],
  source: "base" as const,
} as never

const mockResearcher = {
  slug: "research-analyst",
  displayName: "Research Analyst",
  category: "discovery",
  modelTier: "high",
  patterns: ["exploration-and-discovery", "knowledge-retrieval", "planning"] as never[],
  structure: null,
  contextPackages: [".claude/skills/rr/SKILL.md"],
  rules: ["initiative-convention"],
  skills: ["/rr"],
  toolPermissions: ["Read", "Grep", "Glob", "WebSearch", "WebFetch"],
  escalation: ["If research scope exceeds 3 iterations, propose sub-initiative"],
  description:
    "Explores problem spaces systematically using the /rr protocol. Produces synthesis documents, seeds branch initiatives, and maintains research iteration structure.",
  disposition: "Curious and thorough — explores all vectors before converging",
  domainScope: ["Research methodology", "Literature review", "Domain analysis"],
  behavioralConstraints: [
    "Every research cycle produces at least one proposal",
    "Never skip the convergence step",
  ],
  qualityBar: ["Synthesis covers all vectors", "Open questions are specific and actionable"],
  failTriggers: ["Produces synthesis without exploring all vectors"],
  outputStyle: "Iteration-based research documents with numbered vectors",
  vibe: "The explorer who maps uncharted territory",
  tags: ["discovery", "research"],
  source: "base" as const,
} as never

const meta = {
  title: "Agents/RoleEditor",
  component: RoleEditor,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoleEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    role: mockRole,
  },
}

export const ResearchRole: Story = {
  args: {
    role: mockResearcher,
  },
}
