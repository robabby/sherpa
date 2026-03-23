/**
 * Content Registry
 *
 * Maps internal architecture doc paths to their external docs site equivalents.
 * Used for:
 * 1. Verifying that all source material has been adapted
 * 2. Future automation: detecting when internal docs change and flagging
 *    external pages for refresh
 * 3. Preventing duplicate adaptation of the same source
 */

export type RegistryEntry = {
  /** Internal architecture doc path (relative to monorepo root) */
  source: string
  /** External docs page path (relative to /docs/) */
  target: string
  /** Which sections of the source were used */
  sections: string[]
  /** Date the external page was last synced from the source */
  lastSynced: string
}

export const contentRegistry: RegistryEntry[] = [
  {
    source: "docs/architecture/behavioral-agent-system/index.md",
    target: "concepts/behavioral-agents",
    sections: [
      "Overview",
      "Role Definition Schema",
      "The 11 Roles",
      "Agent Voice",
      "The Test",
      "Evidence Base",
    ],
    lastSynced: "2026-03-23",
  },
  {
    source: "docs/architecture/governance-engine/index.md",
    target: "concepts/governance",
    sections: [
      "Overview",
      "Three-Layer Coordination",
      "Initiative Lifecycle",
      "Conflict Resolution",
      "Governance Policy",
    ],
    lastSynced: "2026-03-23",
  },
  {
    source: "docs/architecture/execution-pipeline/index.md",
    target: "concepts/execution-pipeline",
    sections: [
      "Overview",
      "Task Types and Routing",
      "Dispatch Modes",
      "Backend Architecture",
      "Dispatch Flow",
      "Agent Event System",
      "Knowledge Engine",
    ],
    lastSynced: "2026-03-23",
  },
  {
    source: "docs/architecture/executable-conventions/index.md",
    target: "concepts/conventions-and-config",
    sections: [
      "Overview",
      "Convention Rules",
      "Skills",
      "Content Standards",
      "Self-Documenting System",
    ],
    lastSynced: "2026-03-23",
  },
  {
    source: "docs/architecture/config-as-code/index.md",
    target: "concepts/conventions-and-config",
    sections: [
      "Overview",
      "Config Schema",
      "Plugin System",
      "Multi-Project Federation",
      ".sherpa/ Dotfolder",
    ],
    lastSynced: "2026-03-23",
  },
  {
    source: "docs/architecture/studio-application/index.md",
    target: "concepts/studio",
    sections: [
      "Overview",
      "Package Architecture",
      "Authentication",
      "Multi-Project Federation",
      "Route Structure",
      "Research Dashboard",
      "Share Links",
    ],
    lastSynced: "2026-03-23",
  },
  // --- Guides (synthesized from multiple sources, not 1:1 adapted) ---
  {
    source: ".claude/rules/behavioral-engineering.md",
    target: "guides/defining-agent-roles",
    sections: ["The Principle", "What to Use", "The Test"],
    lastSynced: "2026-03-23",
  },
  {
    source: ".claude/rules/initiative-convention.md",
    target: "guides/creating-conventions",
    sections: ["Directoturtle Structure", "Proposal Frontmatter"],
    lastSynced: "2026-03-23",
  },
  {
    source: ".claude/skills/rr/SKILL.md",
    target: "guides/writing-skills",
    sections: ["Overview", "The Protocol", "Modes"],
    lastSynced: "2026-03-23",
  },
  {
    source: "docs/architecture/execution-pipeline/index.md",
    target: "guides/dispatch-and-backends",
    sections: ["Task Types and Routing", "Dispatch Modes", "Backend Architecture"],
    lastSynced: "2026-03-23",
  },
]
