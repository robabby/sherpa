import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  listInitiatives,
  getInitiative,
  getSeeds,
  createInitiative,
  approveInitiative,
  updateInitiativeStatus,
  appendActivity,
} from "@sherpa/studio-core/initiative-ops"
import type { GovernancePolicy } from "@sherpa/studio-core/initiative-ops"

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface InitiativeToolsOptions {
  projectRoot: string
  approvalPolicy?: GovernancePolicy
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/** Register initiative lifecycle tools on an MCP server instance. */
export function registerInitiativeTools(
  server: McpServer,
  opts: InitiativeToolsOptions,
): void {
  const { projectRoot, approvalPolicy = "additive-only" } = opts

  // -----------------------------------------------------------------------
  // Read-only tools
  // -----------------------------------------------------------------------

  server.tool(
    "initiative_list",
    "List initiatives with optional filters by status, type, or risk level.",
    {
      status: z
        .enum(["pending", "approved", "in-progress", "integrated", "declined", "archived"])
        .optional()
        .describe("Filter by initiative status"),
      type: z.string().optional().describe("Filter by initiative type"),
      risk: z
        .enum(["additive", "evolutionary", "structural"])
        .optional()
        .describe("Filter by risk level"),
    },
    async ({ status, type, risk }) => {
      const filter: Record<string, string> = {}
      if (status) filter.status = status
      if (type) filter.type = type
      if (risk) filter.risk = risk

      const initiatives = listInitiatives(projectRoot, filter)
      if (initiatives.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No initiatives found" }],
        }
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(initiatives, null, 2) }],
      }
    },
  )

  server.tool(
    "initiative_get",
    "Get full detail for a single initiative including proposal, plan, activity, seeds, and lifecycle state.",
    {
      slug: z.string().describe("Initiative slug (e.g. 'my-initiative')"),
    },
    async ({ slug }) => {
      const detail = getInitiative(projectRoot, slug)
      if (!detail) {
        return {
          content: [{ type: "text" as const, text: `Error: Initiative "${slug}" not found` }],
          isError: true,
        }
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(detail, null, 2) }],
      }
    },
  )

  server.tool(
    "initiative_seeds",
    "Get seeds (follow-on ideas) from an integrated initiative's activity log.",
    {
      slug: z.string().describe("Initiative slug"),
    },
    async ({ slug }) => {
      const seeds = getSeeds(projectRoot, slug)
      if (seeds.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No seeds found" }],
        }
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(seeds, null, 2) }],
      }
    },
  )

  // -----------------------------------------------------------------------
  // Write tools
  // -----------------------------------------------------------------------

  server.tool(
    "initiative_create",
    "Create a new initiative proposal directory with proposal.md. Returns the file path on success.",
    {
      slug: z.string().describe("Initiative slug (lowercase, hyphens only)"),
      title: z.string().describe("Initiative title"),
      summary: z.string().describe("2-3 sentence summary"),
      body: z.string().describe("Full proposal body (markdown)"),
      type: z
        .enum([
          "roadmap-update",
          "guideline-evolution",
          "new-skill",
          "research-synthesis",
          "process-change",
          "new-plan",
        ])
        .optional()
        .describe("Initiative type"),
      risk: z
        .enum(["additive", "evolutionary", "structural"])
        .optional()
        .describe("Risk level"),
      targets: z.array(z.string()).optional().describe("Target file or directory paths"),
      dependencies: z.array(z.string()).optional().describe("Slugs of blocking initiatives"),
    },
    async ({ slug, title, summary, body, type, risk, targets, dependencies }) => {
      const result = createInitiative(projectRoot, {
        slug,
        title,
        summary,
        body,
        type,
        risk,
        targets,
        dependencies,
      })

      if (!result.ok) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.error}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ created: result.data }, null, 2) }],
      }
    },
  )

  server.tool(
    "initiative_approve",
    "Approve a pending initiative. Enforces governance policy for agent actors. Creates activity.md.",
    {
      slug: z.string().describe("Initiative slug to approve"),
      agent_id: z.string().optional().describe("Agent ID — if provided, actor is 'agent' and governance policy applies"),
    },
    async ({ slug, agent_id }) => {
      const actor = agent_id ? "agent" : "human"
      const result = approveInitiative(projectRoot, slug, actor, approvalPolicy)

      if (!result.ok) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.error}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ approved: slug, path: result.data }, null, 2) }],
      }
    },
  )

  server.tool(
    "initiative_update_status",
    "Change initiative status with lifecycle transition validation. Only valid transitions are allowed.",
    {
      slug: z.string().describe("Initiative slug"),
      status: z
        .enum(["pending", "approved", "in-progress", "integrated", "declined", "archived"])
        .describe("New status"),
    },
    async ({ slug, status }) => {
      const result = updateInitiativeStatus(projectRoot, slug, status)

      if (!result.ok) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.error}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ updated: slug, status, path: result.data }, null, 2) }],
      }
    },
  )

  server.tool(
    "initiative_activity",
    "Append a timestamped entry to an initiative's activity log. Creates activity.md if needed.",
    {
      slug: z.string().describe("Initiative slug"),
      entry: z.string().describe("Activity entry text (will be timestamped automatically)"),
    },
    async ({ slug, entry }) => {
      const result = appendActivity(projectRoot, slug, entry)

      if (!result.ok) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.error}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ logged: slug, path: result.data }, null, 2) }],
      }
    },
  )
}
